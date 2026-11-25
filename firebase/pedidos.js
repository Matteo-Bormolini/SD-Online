/* =====================================================================
   S.D — CONTATOS, ORÇAMENTOS E AVISOS (firebase/pedidos.js) · v0.8.0
   Fluxo "Contato registrado" (aprovado em 18/11/2026):
     1. Cliente vê o aviso de cobrança e chama o prestador no WhatsApp
        (ou usa "Pedir contato" quando o prestador esconde os contatos).
     2. O site grava 1 registro MÍNIMO (coleção "orcamentos") e avisa o prestador.
     3. O prestador responde "Fez orçamento?": Não → Encerrados · Sim → formulário.
     4. O cliente compara no bloco "Em orçamento" e marca "Fechei com este".
        Os outros vão para Encerrados do prestador ("Cliente escolheu outro").
     5. Prestador marca "Concluído" → cliente confirma → Prestados / Serviços realizados.

   Banco (organizado por coleção, fácil de conferir no console):
     orcamentos/{pedidoId_prestadorUid}  1 por prestador em cada pedido (anti-repetição)
     avisos/{id}                         central de avisos (sino), apagados em 30 dias
     fotos/{id}                          fotos do "Pedir contato" (firebase/fotos.js)

   LGPD: guarda só IDs, nome de exibição (primeiro nome ou nome da empresa),
   região, serviço, datas, situação e o orçamento. Nunca telefone do cliente,
   CPF/CNPJ ou conversa. Tudo é apagado 1 ano depois (apagarEm).
   SEM SERVIDOR (grátis): prazos (10 dias, 1 ano) são conferidos quando
   cliente ou prestador abre o site; as regras do banco conferem as datas.
   ===================================================================== */
import { db, auth, pronto, meusDados, mensagemErro, nomeCurto, COLECAO } from "./firebase.js";
import {
  doc, getDocs, setDoc, updateDoc, deleteDoc, writeBatch, collection, query, where, limit,
  serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* ---------- 1. CONFIGURAÇÃO ← MUDE AQUI (prazos iguais aos das regras do banco) ---------- */
export const REGRAS = {
  diasParaResponder: 10,        // prestador responde "Fez orçamento?" (depois: Expirou)
  diasAntiSpam: 7,              // mesmo cliente + mesmo prestador: 1 aviso a cada 7 dias
  diasGuardar: 365,             // tudo é apagado 1 ano depois
  diasAvisos: 30,               // avisos do sino são apagados em 30 dias
  lembretesCliente: [3, 7, 15], // dias depois do último orçamento sem "Fechei com este"
  // US13 — fotos do "Pedir contato": OPCIONAIS enquanto não houver Storage pago.
  // Quando pagar, mude para true (volta a exigir 3 fotos). As regras também têm um interruptor.
  fotosPedidoObrigatorias: false,
  minFotosPedido: 3,
  maxFotosPedido: 6,
  maxMensagem: 500
};
const DIA = 24 * 60 * 60 * 1000;

// Situações de cada contato/orçamento (campo "situacao")
export const SITUACAO = {
  contato: "contato",             // cliente chamou; prestador ainda não respondeu
  orcado: "orcado",               // prestador preencheu o orçamento
  naoOrcou: "nao-orcou",          // prestador respondeu "Não fiz"
  expirado: "expirado",           // 10 dias sem resposta
  escolhido: "escolhido",         // cliente: "Fechei com este"
  naoEscolhido: "nao-escolhido",  // cliente escolheu outro prestador
  cancelado: "cancelado",         // cliente: "Não fechei com nenhum"
  encerrado: "encerrado",         // prestador encerrou sem serviço
  concluido: "concluido",         // prestador: serviço terminado (aguarda o cliente)
  prestado: "prestado"            // cliente confirmou: serviço realizado
};
export const ABERTAS = [SITUACAO.contato, SITUACAO.orcado];
export const ANDAMENTO = [SITUACAO.escolhido, SITUACAO.concluido];
export const FINAIS = [SITUACAO.naoOrcou, SITUACAO.expirado, SITUACAO.naoEscolhido, SITUACAO.cancelado, SITUACAO.encerrado];

// Tipos de aviso (o texto é montado na tela: componentes/avisos)
export const AVISO = {
  novoContato: "novo-contato", orcamento: "orcamento", orcamentoAlterado: "orcamento-alterado",
  naoOrcou: "nao-orcou", escolhido: "escolhido", naoEscolhido: "nao-escolhido", cancelado: "cancelado",
  encerrado: "encerrado", concluido: "concluido", prestado: "prestado"
};

/* ---------- 2. APOIO ---------- */
const agora = () => Date.now();
const ms = (t) => (t && typeof t.toMillis === "function" ? t.toMillis() : (typeof t === "number" ? t : 0));
const daquiA = (dias) => Timestamp.fromMillis(agora() + dias * DIA);
export const diasDesde = (t) => (ms(t) ? (agora() - ms(t)) / DIA : 0);
function idAleatorio(n = 20) {
  const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const v = new Uint32Array(n);
  crypto.getRandomValues(v);
  return Array.from(v, (x) => letras[x % letras.length]).join("");
}
function exigirLogin() {
  const u = auth && auth.currentUser;
  if (!u) throw Object.assign(new Error("SEM_LOGIN"), { code: "SEM_LOGIN" });
  return u;
}
const ehCliente = (tipo) => tipo === "cliente-cpf" || tipo === "cliente-cnpj";

// Como o cliente aparece para o prestador (mínimo: primeiro nome ou nome da empresa + região)
function exibicaoCliente(eu) {
  const cnpj = eu.tipo === "cliente-cnpj";
  const nome = cnpj ? (eu.nomeFantasia || eu.razaoSocial || "Cliente") : (nomeCurto(eu) || "Cliente");
  // CPF: bairro só se ele autorizou "Mostrar meus dados aos prestadores"; senão só a cidade
  const bairro = cnpj || eu.compartilharDados ? eu.bairro : "";
  const regiao = [bairro, eu.cidade && eu.uf ? `${eu.cidade}/${eu.uf}` : eu.cidade].filter(Boolean).join(", ");
  return { clienteNome: String(nome).slice(0, 120), clienteTipo: cnpj ? "cnpj" : "cpf", clienteRegiao: String(regiao).slice(0, 120) };
}

/* ---------- 3. ESTADO (lista em memória da pessoa logada) ---------- */
const estado = { lista: null, papel: null, carregando: null };
const avisarMudanca = () => document.dispatchEvent(new CustomEvent("sd:pedidos-mudou", { detail: { lista: lista() } }));
export const lista = () => (estado.lista ? estado.lista.map((o) => ({ ...o })) : []);
function guardar(id, campos) {
  const i = estado.lista.findIndex((o) => o.id === id);
  if (i >= 0) estado.lista[i] = { ...estado.lista[i], ...campos };
  else estado.lista.unshift({ id, ...campos });
}
// Datas gravadas com serverTimestamp() voltam como "agora" na memória
const agoraTs = () => Timestamp.fromMillis(agora());

/* Lê os contatos/orçamentos da pessoa (cliente: os que ela criou · prestador: os recebidos).
   Também faz a "limpeza" que um servidor faria: expira os sem resposta há 10 dias
   e apaga os que passaram de 1 ano. */
export async function carregar(forcar = false) {
  await pronto;
  const u = auth && auth.currentUser;
  if (!u) return [];
  if (estado.lista && !forcar) return lista();
  if (estado.carregando && !forcar) return estado.carregando;
  estado.carregando = (async () => {
    const eu = await meusDados();
    if (!eu) return [];
    estado.papel = eu.tipo === "prestador" ? "prestador" : ehCliente(eu.tipo) ? "cliente" : null;
    if (!estado.papel) { estado.lista = []; return []; }
    const campo = estado.papel === "prestador" ? "prestadorUid" : "clienteUid";
    const r = await getDocs(query(collection(db, COLECAO.orcamentos), where(campo, "==", u.uid)));
    estado.lista = r.docs.map((d) => ({ id: d.id, ...d.data() }));
    await limpezaAutomatica();
    avisarMudanca();
    return lista();
  })();
  try { return await estado.carregando; } finally { estado.carregando = null; }
}

async function limpezaAutomatica() {
  const tarefas = [];
  for (const o of estado.lista) {
    if (ms(o.apagarEm) && ms(o.apagarEm) < agora()) {                     // passou de 1 ano
      tarefas.push(deleteDoc(doc(db, COLECAO.orcamentos, o.id)).then(() => { o._apagado = true; apagarFotos(o); }).catch(() => null));
    } else if (o.situacao === SITUACAO.contato && diasDesde(o.contatoEm) > REGRAS.diasParaResponder) {
      tarefas.push(updateDoc(doc(db, COLECAO.orcamentos, o.id), { situacao: SITUACAO.expirado, atualizadoEm: serverTimestamp() })
        .then(() => { o.situacao = SITUACAO.expirado; }).catch(() => null));
    }
  }
  await Promise.all(tarefas);
  estado.lista = estado.lista.filter((o) => !o._apagado);
}

/* ---------- 4. AVISOS (coleção "avisos") ----------
   id = orçamento + tipo → 1 aviso de cada tipo por orçamento (o banco confere o tipo com a situação) */
async function criarAviso(o, para, tipo, nome) {
  try {
    await setDoc(doc(db, COLECAO.avisos, `${o.id}_${tipo}`), {
      para, de: auth.currentUser.uid, tipo, orcamentoId: o.id,
      nome: String(nome || "").slice(0, 120), servico: String(o.servico || "").slice(0, 80),
      lido: false, criadoEm: serverTimestamp(), apagarEm: daquiA(REGRAS.diasAvisos)
    });
  } catch (e) { console.warn("[S.D] Aviso não enviado:", e.code || e); }   // o registro principal já foi salvo
}
const avisarPrestador = (o, tipo) => criarAviso(o, o.prestadorUid, tipo, o.clienteNome);
const avisarCliente = (o, tipo) => criarAviso(o, o.clienteUid, tipo, o.prestadorNome);

export async function listarAvisos() {
  await pronto;
  const u = auth && auth.currentUser;
  if (!u) return [];
  const r = await getDocs(query(collection(db, COLECAO.avisos), where("para", "==", u.uid), limit(60)));
  const todos = r.docs.map((d) => ({ id: d.id, ...d.data() }));
  // Apaga os vencidos (30 dias)
  const vencidos = todos.filter((a) => ms(a.apagarEm) && ms(a.apagarEm) < agora());
  vencidos.forEach((a) => deleteDoc(doc(db, COLECAO.avisos, a.id)).catch(() => null));
  return todos.filter((a) => !vencidos.includes(a)).sort((a, b) => ms(b.criadoEm) - ms(a.criadoEm));
}
export async function marcarLido(id) {
  await pronto;
  await updateDoc(doc(db, COLECAO.avisos, id), { lido: true });
}
export async function apagarAviso(id) {
  await pronto;
  await deleteDoc(doc(db, COLECAO.avisos, id));
}

/* ---------- 5. CLIENTE: REGISTRAR CONTATO ----------
   prestador = { id, nome } (da vitrine) · categoria = id do tipo de serviço
   origem "whatsapp" (clicou no WhatsApp) ou "pedido" (Pedir contato, com mensagem e fotos)
   Devolve { id, novo, avisou }. */
export function grupoAberto(categoria) {
  // Pedido aberto = mesmo tipo de serviço, ninguém escolhido e não cancelado
  const porPedido = new Map();
  for (const o of estado.lista || []) {
    if (o.categoria !== categoria) continue;
    if (!porPedido.has(o.pedidoId)) porPedido.set(o.pedidoId, []);
    porPedido.get(o.pedidoId).push(o);
  }
  for (const [pedidoId, itens] of porPedido) {
    const fechado = itens.some((o) => [...ANDAMENTO, SITUACAO.prestado, SITUACAO.cancelado, SITUACAO.naoEscolhido].includes(o.situacao));
    if (!fechado) return pedidoId;
  }
  return null;
}
// Contato recente com o mesmo prestador (para não repetir o aviso de cobrança)
export function contatoRecente(prestadorId, categoria) {
  const pedidoId = grupoAberto(categoria);
  const o = (estado.lista || []).find((x) => x.pedidoId === pedidoId && x.prestadorUid === prestadorId);
  return !!(o && ABERTAS.includes(o.situacao) && diasDesde(o.ultimoContatoEm) < REGRAS.diasAntiSpam);
}

export async function registrarContato({ prestador, categoria, servicoNome, origem = "whatsapp", mensagem = "", arquivos = [] }) {
  await pronto;
  const u = exigirLogin();
  const eu = await meusDados();
  if (!eu || !ehCliente(eu.tipo)) throw Object.assign(new Error("SO_CLIENTE"), { code: "permission-denied" });
  if (!u.emailVerified) throw Object.assign(new Error("EMAIL_NAO_CONFIRMADO"), { code: "EMAIL_NAO_CONFIRMADO" });
  await carregar();
  const pedidoId = grupoAberto(categoria) || idAleatorio();
  const id = `${pedidoId}_${prestador.id}`;
  const existente = estado.lista.find((o) => o.id === id);
  const ref = doc(db, COLECAO.orcamentos, id);

  // Já existe neste pedido: só atualiza a data (anti-spam) ou reabre se tinha expirado/recusado
  if (existente) {
    if (ABERTAS.includes(existente.situacao)) {
      const avisar = diasDesde(existente.ultimoContatoEm) >= REGRAS.diasAntiSpam;
      await updateDoc(ref, { ultimoContatoEm: serverTimestamp(), atualizadoEm: serverTimestamp() });
      guardar(id, { ultimoContatoEm: agoraTs() });
      if (avisar) await avisarPrestador(existente, AVISO.novoContato);
      avisarMudanca();
      return { id, novo: false, avisou: avisar };
    }
    if ([SITUACAO.expirado, SITUACAO.naoOrcou].includes(existente.situacao)) {
      await updateDoc(ref, { situacao: SITUACAO.contato, contatoEm: serverTimestamp(), ultimoContatoEm: serverTimestamp(), atualizadoEm: serverTimestamp() });
      guardar(id, { situacao: SITUACAO.contato, contatoEm: agoraTs(), ultimoContatoEm: agoraTs() });
      await avisarPrestador(existente, AVISO.novoContato);
      avisarMudanca();
      return { id, novo: false, avisou: true };
    }
    return { id, novo: false, avisou: false };
  }

  // Novo contato. "Pedir contato": envia as fotos antes (cada uma vira 1 documento em "fotos")
  const fotos = [];
  if (origem === "pedido" && arquivos.length) {
    if (!window.SDFotos) throw new Error("FOTOS_INDISPONIVEIS");
    for (const arq of arquivos.slice(0, REGRAS.maxFotosPedido)) {
      const f = await window.SDFotos.salvar(arq, { tipo: "pedido", ref: id });
      fotos.push(f.id);
    }
  }
  const registro = {
    pedidoId, clienteUid: u.uid, prestadorUid: prestador.id,
    situacao: SITUACAO.contato, origem: origem === "pedido" ? "pedido" : "whatsapp",
    categoria: String(categoria || "").slice(0, 20), servico: String(servicoNome || "").slice(0, 80),
    ...exibicaoCliente(eu),
    prestadorNome: String(prestador.nome || "").slice(0, 120),
    contatoEm: serverTimestamp(), ultimoContatoEm: serverTimestamp(), atualizadoEm: serverTimestamp(),
    apagarEm: daquiA(REGRAS.diasGuardar)
  };
  if (registro.origem === "pedido") { registro.mensagem = String(mensagem || "").slice(0, REGRAS.maxMensagem); registro.fotos = fotos; }
  try {
    await setDoc(ref, registro);
  } catch (e) {
    fotos.forEach((f) => window.SDFotos.apagar(f).catch(() => null));   // não deixa foto solta
    throw e;
  }
  guardar(id, { ...registro, contatoEm: agoraTs(), ultimoContatoEm: agoraTs(), atualizadoEm: agoraTs() });
  await avisarPrestador({ id, ...registro }, AVISO.novoContato);
  avisarMudanca();
  return { id, novo: true, avisou: true };
}

/* ---------- 6. PRESTADOR: RESPONDER E ORÇAR ---------- */
const pegar = (id) => {
  const o = (estado.lista || []).find((x) => x.id === id);
  if (!o) throw new Error("NAO_ENCONTRADO");
  return o;
};
async function mudar(id, campos, aviso) {
  const o = pegar(id);
  await updateDoc(doc(db, COLECAO.orcamentos, id), { ...campos, atualizadoEm: serverTimestamp() });
  const memoria = { ...campos };
  // Campos de data (terminam em "Em") gravados com serverTimestamp() → "agora" na memória
  Object.keys(memoria).forEach((k) => { if (/Em$/.test(k) && !(memoria[k] instanceof Timestamp)) memoria[k] = agoraTs(); });
  guardar(id, { ...memoria, atualizadoEm: agoraTs() });
  if (aviso) await aviso({ ...o, ...memoria });
  avisarMudanca();
}

export const responderNao = (id) =>
  mudar(id, { situacao: SITUACAO.naoOrcou, respondidoEm: serverTimestamp() }, (o) => avisarCliente(o, AVISO.naoOrcou));

// Campos do orçamento (todos opcionais, menos descrição, valor total e validade) ← MUDE AQUI
export const CAMPOS_ORCAMENTO = ["descricao", "valorTotal", "cobraVisita", "valorVisita", "visitas", "materiaisPor",
  "valorMateriais", "valorMaoDeObra", "funcionarios", "inicioPrevisto", "duracaoDias", "validadeDias", "observacao"];
function limparOrcamento(d) {
  const num = (v, max) => Math.min(Math.max(Math.round(Number(v || 0) * 100) / 100, 0), max);
  const int = (v, max) => Math.min(Math.max(parseInt(v, 10) || 0, 0), max);
  return {
    descricao: String(d.descricao || "").trim().slice(0, 300),
    valorTotal: num(d.valorTotal, 10000000),
    cobraVisita: !!d.cobraVisita,
    valorVisita: d.cobraVisita ? num(d.valorVisita, 100000) : 0,
    visitas: int(d.visitas, 100),
    materiaisPor: ["prestador", "cliente", "ambos"].includes(d.materiaisPor) ? d.materiaisPor : "",
    valorMateriais: num(d.valorMateriais, 10000000),
    valorMaoDeObra: num(d.valorMaoDeObra, 10000000),
    funcionarios: int(d.funcionarios, 500),
    inicioPrevisto: /^\d{4}-\d{2}-\d{2}$/.test(d.inicioPrevisto || "") ? d.inicioPrevisto : "",
    duracaoDias: int(d.duracaoDias, 3650),
    validadeDias: Math.max(1, int(d.validadeDias, 365)),
    observacao: String(d.observacao || "").trim().slice(0, 500)
  };
}
export async function salvarOrcamento(id, dados) {
  const o = pegar(id);
  const orcamento = limparOrcamento(dados);
  const primeira = o.situacao === SITUACAO.contato;
  const campos = { orcamento };
  if (primeira) { campos.situacao = SITUACAO.orcado; campos.respondidoEm = serverTimestamp(); }
  // "Pedir contato" (contatos escondidos): o WhatsApp do prestador vai junto com o orçamento
  if (o.origem === "pedido") {
    const eu = await meusDados();
    const principal = (eu && eu.telefones || []).find((t) => t.principal);
    campos.whatsapp = String((principal && principal.numero) || "").replace(/\D/g, "").slice(0, 11);
  }
  await mudar(id, campos, (n) => avisarCliente(n, primeira ? AVISO.orcamento : AVISO.orcamentoAlterado));
}
export const concluir = (id) =>
  mudar(id, { situacao: SITUACAO.concluido, concluidoEm: serverTimestamp() }, (o) => avisarCliente(o, AVISO.concluido));
export const encerrarPeloPrestador = (id) =>
  mudar(id, { situacao: SITUACAO.encerrado, decididoEm: serverTimestamp() }, (o) => avisarCliente(o, AVISO.encerrado));
// "Lixeira" do prestador: some do quadro dele (o cliente continua vendo o histórico)
export const arquivar = (id) => mudar(id, { arquivadoPrestador: true });

/* ---------- 7. CLIENTE: ESCOLHER, CANCELAR, CONFIRMAR ---------- */
export function doPedido(pedidoId) { return (estado.lista || []).filter((o) => o.pedidoId === pedidoId); }

export async function escolher(id) {
  const escolhido = pegar(id);
  const outros = doPedido(escolhido.pedidoId).filter((o) => o.id !== id && ABERTAS.includes(o.situacao));
  const lote = writeBatch(db);
  lote.update(doc(db, COLECAO.orcamentos, id), { situacao: SITUACAO.escolhido, decididoEm: serverTimestamp(), atualizadoEm: serverTimestamp() });
  outros.forEach((o) => lote.update(doc(db, COLECAO.orcamentos, o.id), { situacao: SITUACAO.naoEscolhido, decididoEm: serverTimestamp(), atualizadoEm: serverTimestamp() }));
  await lote.commit();
  guardar(id, { situacao: SITUACAO.escolhido, decididoEm: agoraTs() });
  outros.forEach((o) => guardar(o.id, { situacao: SITUACAO.naoEscolhido, decididoEm: agoraTs() }));
  await avisarPrestador(escolhido, AVISO.escolhido);
  for (const o of outros) await avisarPrestador(o, AVISO.naoEscolhido);
  avisarMudanca();
}
export async function cancelarPedido(pedidoId) {
  const abertos = doPedido(pedidoId).filter((o) => ABERTAS.includes(o.situacao));
  if (!abertos.length) return;
  const lote = writeBatch(db);
  abertos.forEach((o) => lote.update(doc(db, COLECAO.orcamentos, o.id), { situacao: SITUACAO.cancelado, decididoEm: serverTimestamp(), atualizadoEm: serverTimestamp() }));
  await lote.commit();
  abertos.forEach((o) => guardar(o.id, { situacao: SITUACAO.cancelado, decididoEm: agoraTs() }));
  for (const o of abertos) await avisarPrestador(o, AVISO.cancelado);
  avisarMudanca();
}
// Fotos do "Pedir contato" saem junto com o contato (só o cliente, dono das fotos, consegue apagar)
function apagarFotos(o) {
  if (estado.papel === "cliente" && window.SDFotos) (o.fotos || []).forEach((f) => window.SDFotos.apagar(f).catch(() => null));
}
// Cliente apaga um contato da lista dele (LGPD: pode apagar quando quiser)
export async function excluir(id) {
  const o = (estado.lista || []).find((x) => x.id === id);
  await deleteDoc(doc(db, COLECAO.orcamentos, id));
  if (o) apagarFotos(o);
  estado.lista = (estado.lista || []).filter((o) => o.id !== id);
  avisarMudanca();
}
export const confirmarConclusao = (id) =>
  mudar(id, { situacao: SITUACAO.prestado, prestadoEm: serverTimestamp() }, (o) => avisarPrestador(o, AVISO.prestado));

/* ---------- 8. LEMBRETES DO CLIENTE (calculados na tela, não gravados) ----------
   Pedido com orçamento recebido e sem "Fechei com este": lembra no 3º, 7º e 15º dia. */
export function lembretesCliente() {
  if (estado.papel !== "cliente") return [];
  const pedidos = new Map();
  (estado.lista || []).forEach((o) => { if (!pedidos.has(o.pedidoId)) pedidos.set(o.pedidoId, []); pedidos.get(o.pedidoId).push(o); });
  const saida = [];
  for (const [pedidoId, itens] of pedidos) {
    if (itens.some((o) => !ABERTAS.includes(o.situacao) && !FINAIS.includes(o.situacao))) continue;   // já escolheu/concluiu
    if (itens.some((o) => o.situacao === SITUACAO.cancelado)) continue;
    const orcados = itens.filter((o) => o.situacao === SITUACAO.orcado);
    if (!orcados.length) continue;
    const ultimo = Math.max(...orcados.map((o) => ms(o.respondidoEm) || ms(o.atualizadoEm)));
    const dias = (agora() - ultimo) / DIA;
    const marco = [...REGRAS.lembretesCliente].reverse().find((d) => dias >= d);
    if (marco) saida.push({ pedidoId, servico: itens[0].servico, qtd: orcados.length, dias: Math.floor(dias), marco });
  }
  return saida;
}

/* ---------- 9. PARA AS TELAS ---------- */
window.SDPedidosDados = Object.freeze({
  REGRAS, SITUACAO, ABERTAS, ANDAMENTO, FINAIS, AVISO, CAMPOS_ORCAMENTO,
  carregar, lista, papel: () => estado.papel, diasDesde, ms,
  grupoAberto, contatoRecente, registrarContato, doPedido,
  responderNao, salvarOrcamento, concluir, encerrarPeloPrestador, arquivar,
  escolher, cancelarPedido, confirmarConclusao, excluir, lembretesCliente,
  listarAvisos, marcarLido, apagarAviso, mensagemErro
});

// Carrega as telas (janelas e sino) só para quem tem conta completa
(async () => {
  const u = await pronto;
  if (!u) return;
  const eu = await meusDados().catch(() => null);
  if (!eu) return;
  const base = new URL("../componentes/", import.meta.url);
  const css = (arq) => {
    if (document.querySelector(`link[href$="${arq}"]`)) return;
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = new URL(arq, base).href; document.head.append(l);
  };
  const js = (arq) => new Promise((ok) => {
    if (document.querySelector(`script[src$="${arq}"]`)) { ok(); return; }
    const s = document.createElement("script"); s.src = new URL(arq, base).href; s.onload = ok; s.onerror = ok; document.head.append(s);
  });
  css("pedidos/pedidos.css"); css("avisos/avisos.css");
  await js("pedidos/pedidos.js");
  await js("avisos/avisos.js");
})();
