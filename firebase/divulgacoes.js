/* =====================================================================
   S.D — DIVULGAÇÕES DA HOME DO PRESTADOR (firebase/divulgacoes.js) · v0.8.2
   Lê do banco (coleção "divulgacoes") o que aparece na Home do prestador:
     • comunicado → Comunicados da S.D
     • evento     → Agenda de eventos
     • grupo      → Grupos e comunidades

   Quem cadastra: SÓ o adm (por enquanto pelo Firebase Console; modelo dos
   campos em firebase/README.md). Nada de dados fictícios aqui.

   Público de cada divulgação:
     publico: "geral"      → todos os prestadores
     publico: "atividades" → só quem tem uma das "atividades" como área de
                             atuação ou atividade secundária (mesmos nomes da
                             lista única de serviços: configuracoes/config.js)

   Segurança: as REGRAS do banco (área 80) só deixam o prestador ler o que
   está "publicado" e é do público dele. Este arquivo ainda confere e limpa
   cada campo (o console do Firebase não passa pelas regras).
   LGPD: lê só a área de atuação e as atividades secundárias do PRÓPRIO
   prestador (para escolher os eventos). Não grava nada, não registra quem viu.

   ADM (v0.8.3): a aba "Divulgações" do Perfil do adm (perfil-adm/divulgacoes-adm.js)
   cadastra, edita, publica/suspende/encerra e apaga por aqui. Também cria e apaga
   os EXEMPLOS ILUSTRATIVOS (campo exemplo: true) — apagar antes do lançamento.
   ===================================================================== */
import { db, auth, pronto, meusDados, COLECAO } from "./firebase.js";
import {
  getDocs, collection, query, where, doc, addDoc, setDoc, updateDoc, deleteDoc, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* ---------- 1. LIMITES ← MUDE AQUI (iguais às regras do banco, área 80) ---------- */
const LIMITES = {
  titulo: 120, subtitulo: 160, descricao: 1500, linkTexto: 40, localNome: 120, cidade: 80, endereco: 200,
  buffetEmpresa: 120, estacionamentoObs: 120, organizador: 120, regiao: 80, link: 500, imagem: 300000,
  atividades: 10, porTipo: 30        // máximo de cartões por seção
};
const TIPOS = ["evento", "grupo", "comunicado"];
const REDES = ["whatsapp", "telegram", "instagram", "facebook", "youtube", "linkedin", "site"];
// Pasta das imagens enviadas ao GitHub (img-src 'self' na CSP). Outra opção: imagem em texto (data:image/...)
const PASTA_IMAGENS = "fotos/divulgacoes/";

/* ---------- 2. CONFERÊNCIA DOS CAMPOS ---------- */
const texto = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const dataOk = (v) => (typeof v === "string" && /^20\d{2}-[01]\d-[0-3]\d$/.test(v) ? v : "");
const horaOk = (v) => (typeof v === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(v) ? v : "");
// Só https (nada de javascript:, http: ou data:)
function linkOk(v) {
  if (typeof v !== "string" || v.length > LIMITES.link) return "";
  try { const u = new URL(v.trim()); return u.protocol === "https:" && !u.username && !u.password ? u.href : ""; }
  catch (_) { return ""; }
}
// Imagem: arquivo da pasta fotos/divulgacoes/ ou imagem em texto (data:image)
function imagemOk(v) {
  if (typeof v !== "string" || !v || v.length > LIMITES.imagem) return "";
  if (/^[a-z0-9-]{1,60}\.(webp|jpg|jpeg|png)$/.test(v)) return PASTA_IMAGENS + v;          // caminho relativo à raiz do site
  if (/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/=]+$/.test(v)) return v;
  return "";
}
const umDe = (v, lista) => (lista.includes(v) ? v : "");

// Monta um objeto LIMPO (só campos conhecidos). Inválido → null (não aparece).
function limpar(id, d) {
  if (!d || !TIPOS.includes(d.tipo) || d.situacao !== "publicado") return null;
  const titulo = texto(d.titulo, LIMITES.titulo);
  if (!titulo) return null;
  const atividades = Array.isArray(d.atividades) ? d.atividades.filter((a) => typeof a === "string").slice(0, LIMITES.atividades) : [];
  const item = {
    id: String(id), tipo: d.tipo, titulo,
    exemplo: d.exemplo === true,                                      // exemplo ilustrativo (etiqueta na tela)
    publico: d.publico === "atividades" && atividades.length ? "atividades" : "geral",
    atividades,
    ordem: Number.isInteger(d.ordem) ? d.ordem : 999,   // sem "ordem" = vai para o fim
    descricao: texto(d.descricao, LIMITES.descricao),
    imagem: imagemOk(d.imagem),
    link: linkOk(d.link),
    linkTexto: texto(d.linkTexto, LIMITES.linkTexto),
    data: dataOk(d.data)
  };
  if (d.tipo === "evento") {
    Object.assign(item, {
      subtitulo: texto(d.subtitulo, LIMITES.subtitulo),
      dataFim: dataOk(d.dataFim),
      horaInicio: horaOk(d.horaInicio), horaFim: horaOk(d.horaFim),
      modalidade: umDe(d.modalidade, ["presencial", "online", "hibrido"]),
      localNome: texto(d.localNome, LIMITES.localNome),
      cidade: texto(d.cidade, LIMITES.cidade),
      uf: typeof d.uf === "string" && /^[A-Z]{2}$/.test(d.uf) ? d.uf : "",
      endereco: texto(d.endereco, LIMITES.endereco),
      buffet: typeof d.buffet === "boolean" ? d.buffet : null,       // null = não informado
      buffetEmpresa: texto(d.buffetEmpresa, LIMITES.buffetEmpresa),
      estacionamento: umDe(d.estacionamento, ["gratuito", "pago", "nao"]),
      estacionamentoObs: texto(d.estacionamentoObs, LIMITES.estacionamentoObs),
      organizador: texto(d.organizador, LIMITES.organizador)
    });
    if (!item.data) return null;                                       // evento sem data não entra na agenda
  }
  if (d.tipo === "grupo") {
    const redes = {};
    if (d.redes && typeof d.redes === "object") REDES.forEach((r) => { const l = linkOk(d.redes[r]); if (l) redes[r] = l; });
    Object.assign(item, {
      redes,
      regiao: texto(d.regiao, LIMITES.regiao),
      cidade: texto(d.cidade, LIMITES.cidade),
      uf: typeof d.uf === "string" && /^[A-Z]{2}$/.test(d.uf) ? d.uf : ""
    });
    if (!Object.keys(redes).length && !item.link) return null;        // grupo sem nenhum canal não serve
  }
  if (d.tipo === "comunicado") item.nivel = d.nivel === "atencao" ? "atencao" : "info";
  return item;
}

/* ---------- 3. DATAS (hoje no fuso do aparelho, formato AAAA-MM-DD) ---------- */
function hojeISO() {
  const h = new Date();
  return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`;
}

/* ---------- 4. LEITURA PARA O PRESTADOR LOGADO ----------
   2 consultas (as regras exigem os mesmos filtros):
     A) situacao == "publicado" e publico == "geral"
     B) situacao == "publicado" e atividades contém uma das MINHAS atividades
   Resultado: { comunicados, eventos, grupos, minhasAtividades, parcial } */
async function listarParaMim() {
  await pronto;
  if (!auth || !auth.currentUser) return null;
  const eu = await meusDados();
  if (!eu || eu.tipo !== "prestador") return null;                     // cliente, adm e visitante não usam esta Home

  const minhas = [eu.areaAtuacao, ...(eu.especialidades || [])]
    .filter((a) => typeof a === "string" && a.trim()).slice(0, 9);
  const col = collection(db, COLECAO.divulgacoes);
  const consultas = [getDocs(query(col, where("situacao", "==", "publicado"), where("publico", "==", "geral")))];
  if (minhas.length) consultas.push(getDocs(query(col, where("situacao", "==", "publicado"), where("atividades", "array-contains-any", minhas))));

  const respostas = await Promise.allSettled(consultas);
  if (respostas.every((r) => r.status === "rejected")) throw respostas[0].reason;
  let parcial = false;
  const porId = new Map();
  respostas.forEach((r) => {
    if (r.status === "rejected") { parcial = true; console.warn("[S.D] Divulgações: uma consulta falhou:", r.reason && (r.reason.code || r.reason)); return; }
    r.value.docs.forEach((s) => { const item = limpar(s.id, s.data()); if (item) porId.set(item.id, item); });
  });

  const hoje = hojeISO();
  const todos = [...porId.values()];
  // Atividades do prestador que combinam com cada item (para a etiqueta "Para a sua área")
  todos.forEach((i) => { i.paraMim = i.publico === "atividades" ? i.atividades.filter((a) => minhas.includes(a)) : []; });

  const eventos = todos.filter((i) => i.tipo === "evento" && (i.dataFim || i.data) >= hoje)   // já passou = não aparece
    .sort((a, b) => a.data.localeCompare(b.data) || (a.horaInicio || "").localeCompare(b.horaInicio || "") || a.ordem - b.ordem)
    .slice(0, LIMITES.porTipo);
  const grupos = todos.filter((i) => i.tipo === "grupo")
    .sort((a, b) => a.ordem - b.ordem || a.titulo.localeCompare(b.titulo, "pt-BR")).slice(0, LIMITES.porTipo);
  const comunicados = todos.filter((i) => i.tipo === "comunicado")
    .sort((a, b) => a.ordem - b.ordem || (b.data || "").localeCompare(a.data || "")).slice(0, LIMITES.porTipo);

  return { comunicados, eventos, grupos, minhasAtividades: minhas, parcial };
}

/* ---------- 5. ADM: CONFERIR, SALVAR, MUDAR SITUAÇÃO E APAGAR (v0.8.3) ----------
   Mesmas regras do banco (área 80). A tela do adm chama validar() antes de salvar. */
const CAMPOS_TEXTO = ["titulo", "descricao", "linkTexto", "subtitulo", "localNome", "cidade", "endereco",
  "buffetEmpresa", "estacionamentoObs", "organizador", "regiao"];
function validar(d) {
  const erros = {};
  const e = (campo, msg) => { if (!erros[campo]) erros[campo] = msg; };
  if (!TIPOS.includes(d.tipo)) e("tipo", "Escolha o tipo.");
  if (!["publicado", "suspenso", "encerrado"].includes(d.situacao)) e("situacao", "Escolha a situação.");
  if (!d.titulo || !String(d.titulo).trim()) e("titulo", "Informe o título.");
  CAMPOS_TEXTO.forEach((c) => { if (d[c] && String(d[c]).length > LIMITES[c]) e(c, `Máximo de ${LIMITES[c]} caracteres.`); });
  if (d.publico === "atividades" && !(d.atividades || []).length) e("atividades", "Marque pelo menos 1 atividade (ou escolha \"Todos os prestadores\").");
  if ((d.atividades || []).length > LIMITES.atividades) e("atividades", `Máximo de ${LIMITES.atividades} atividades.`);
  ["data", "dataFim"].forEach((c) => { if (d[c] && !dataOk(d[c])) e(c, "Data inválida."); });
  ["horaInicio", "horaFim"].forEach((c) => { if (d[c] && !horaOk(d[c])) e(c, "Hora inválida (HH:MM)."); });
  if (d.tipo === "evento" && !d.data) e("data", "Evento precisa de data.");
  if (d.data && d.dataFim && d.dataFim < d.data) e("dataFim", "A data final é antes da data de início.");
  if (d.link && !linkOk(d.link)) e("link", "Use um link completo começando com https://");
  if (d.uf && !/^[A-Z]{2}$/.test(d.uf)) e("uf", "UF com 2 letras (ex.: SP).");
  if (d.imagem && !imagemOk(d.imagem)) e("imagem", "Imagem inválida (arquivo .webp/.jpg/.png da pasta ou imagem enviada até ~220 KB).");
  if (d.redes) Object.entries(d.redes).forEach(([r, url]) => { if (url && !linkOk(url)) e("rede-" + r, "Link inválido (https://...)."); });
  if (d.tipo === "grupo" && !Object.values(d.redes || {}).some(Boolean) && !d.link) e("rede-whatsapp", "Informe pelo menos 1 link do grupo.");
  return erros;
}
// Monta o documento só com os campos preenchidos (vazio = não grava o campo)
function montarDocumento(d) {
  const r = { tipo: d.tipo, titulo: String(d.titulo).trim(), situacao: d.situacao, publico: d.publico === "atividades" ? "atividades" : "geral" };
  if (r.publico === "atividades") r.atividades = d.atividades.slice(0, LIMITES.atividades);
  const copiar = ["descricao", "imagem", "link", "linkTexto", "data"];
  if (d.tipo === "evento") copiar.push("subtitulo", "dataFim", "horaInicio", "horaFim", "modalidade", "localNome", "cidade", "uf", "endereco",
    "buffetEmpresa", "estacionamento", "estacionamentoObs", "organizador");
  if (d.tipo === "grupo") copiar.push("regiao", "cidade", "uf");
  if (d.tipo === "comunicado") copiar.push("nivel");
  copiar.forEach((c) => { if (d[c] !== undefined && d[c] !== null && String(d[c]).trim() !== "") r[c] = String(d[c]).trim(); });
  if (d.tipo === "evento" && typeof d.buffet === "boolean") r.buffet = d.buffet;
  if (d.tipo === "evento" && r.buffet !== true) delete r.buffetEmpresa;
  if (d.tipo === "grupo") { const redes = {}; Object.entries(d.redes || {}).forEach(([k, v]) => { if (v) redes[k] = String(v).trim(); }); if (Object.keys(redes).length) r.redes = redes; }
  if (Number.isInteger(d.ordem)) r.ordem = d.ordem;
  if (d.exemplo === true) r.exemplo = true;
  return r;
}
async function souAdm() {
  await pronto;
  const eu = auth && auth.currentUser ? await meusDados() : null;
  if (!eu || eu.tipo !== "adm") throw Object.assign(new Error("Só o administrador."), { code: "permission-denied" });
}
async function listarTodas() {
  await souAdm();
  const r = await getDocs(collection(db, COLECAO.divulgacoes));
  return r.docs.map((s) => ({ id: s.id, ...s.data() }));
}
// id vazio = novo. Devolve o id salvo.
async function salvar(id, dados, criadoEm) {
  await souAdm();
  const erros = validar(dados);
  if (Object.keys(erros).length) throw Object.assign(new Error("Campos com erro."), { code: "campos", erros });
  const d = { ...montarDocumento(dados), atualizadoEm: serverTimestamp() };
  if (id) { await setDoc(doc(db, COLECAO.divulgacoes, id), { ...d, criadoEm: criadoEm || serverTimestamp() }); return id; }
  const novo = await addDoc(collection(db, COLECAO.divulgacoes), { ...d, criadoEm: serverTimestamp() });
  return novo.id;
}
async function mudarSituacao(id, situacao) {
  await souAdm();
  if (!["publicado", "suspenso", "encerrado"].includes(situacao)) throw new Error("Situação inválida.");
  await updateDoc(doc(db, COLECAO.divulgacoes, id), { situacao, atualizadoEm: serverTimestamp() });
}
async function apagar(id) { await souAdm(); await deleteDoc(doc(db, COLECAO.divulgacoes, id)); }

/* ---------- 6. EXEMPLOS ILUSTRATIVOS (só para visualizar; apagar antes do lançamento) ----------
   Datas contadas a partir de hoje, para não "vencerem". Imagens: fotos/divulgacoes/exemplo-*.webp */
function diaMais(n) { const h = new Date(); h.setDate(h.getDate() + n); return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`; }
function exemplos() {
  const ex = (o) => ({ situacao: "publicado", publico: "geral", exemplo: true, ...o });
  return [
    ex({ tipo: "comunicado", nivel: "atencao", data: diaMais(0), ordem: 0, titulo: "Exemplo: manutenção programada",
      descricao: "Exemplo ilustrativo. Na madrugada de sábado, das 2h às 4h, o site pode ficar fora do ar por alguns minutos." }),
    ex({ tipo: "comunicado", nivel: "info", data: diaMais(-1), ordem: 1, titulo: "Exemplo: nova página inicial para prestadores",
      descricao: "Exemplo ilustrativo. Aqui aparecem eventos, grupos e comunidades da sua área. Contatos e orçamentos continuam no seu perfil." }),
    ex({ tipo: "evento", titulo: "Exemplo: Encontro de Empreendedores da Zona Sul", subtitulo: "Networking entre prestadores de serviço e pequenas empresas",
      data: diaMais(10), horaInicio: "19:00", horaFim: "22:00", modalidade: "presencial", localNome: "Centro de Convenções Exemplo",
      cidade: "São Paulo", uf: "SP", endereco: "Av. Exemplo, 1000 — Santo Amaro", buffet: true, buffetEmpresa: "Buffet Exemplo",
      estacionamento: "pago", estacionamentoObs: "R$ 15 o período", organizador: "Associação Comercial Exemplo", imagem: "exemplo-networking.webp",
      link: "https://example.com/", linkTexto: "Fazer inscrição",
      descricao: "Evento fictício, só para visualizar a página.\n\nProgramação: 19h recepção · 19h30 roda de conversa · 21h networking livre." }),
    ex({ tipo: "evento", publico: "atividades", atividades: ["Elétrica", "Iluminação e quadros elétricos"], titulo: "Exemplo: Palestra NR-10 na prática",
      subtitulo: "Segurança em instalações elétricas para pequenas equipes", data: diaMais(5), horaInicio: "19:30", horaFim: "21:00",
      modalidade: "online", organizador: "Escola Técnica Exemplo", imagem: "exemplo-nr10.webp", link: "https://example.com/", linkTexto: "Assistir ao vivo",
      descricao: "Evento fictício (só para prestadores de Elétrica)." }),
    ex({ tipo: "evento", publico: "atividades", atividades: ["Marcenaria"], titulo: "Exemplo: Feira de Marcenaria e Acabamentos",
      subtitulo: "Máquinas, ferragens e novidades em MDF", data: diaMais(17), dataFim: diaMais(19), horaInicio: "10:00", horaFim: "18:00",
      modalidade: "presencial", localNome: "Pavilhão Exemplo", cidade: "Campinas", uf: "SP", buffet: false, estacionamento: "gratuito",
      organizador: "Sindicato Exemplo", imagem: "exemplo-marcenaria.webp", link: "https://example.com/",
      descricao: "Evento fictício (só para prestadores de Marcenaria)." }),
    ex({ tipo: "evento", titulo: "Exemplo: Rodada de negócios com condomínios", data: diaMais(30), horaInicio: "14:00", modalidade: "hibrido",
      localNome: "Auditório Exemplo", cidade: "Santo André", uf: "SP", organizador: "Rede de Síndicos Exemplo",
      descricao: "Evento fictício. Síndicos apresentam as necessidades de manutenção do próximo ano." }),
    ex({ tipo: "grupo", ordem: 1, titulo: "Exemplo: Empreendedores da Manutenção", regiao: "Grande São Paulo",
      descricao: "Grupo fictício para trocar indicações de fornecedores e dicas de gestão.",
      redes: { whatsapp: "https://example.com/whatsapp", instagram: "https://example.com/instagram", youtube: "https://example.com/youtube" } }),
    ex({ tipo: "grupo", ordem: 2, publico: "atividades", atividades: ["Elétrica"], titulo: "Exemplo: Comunidade de Eletricistas", cidade: "São Paulo", uf: "SP",
      descricao: "Grupo fictício: dúvidas técnicas, normas e materiais.", redes: { telegram: "https://example.com/telegram", site: "https://example.com/" } }),
    ex({ tipo: "grupo", ordem: 3, publico: "atividades", atividades: ["Marcenaria"], titulo: "Exemplo: Marceneiros e Moveleiros", imagem: "exemplo-grupo-marcenaria.webp",
      descricao: "Grupo fictício: projetos, ferramentas e fornecedores.", redes: { instagram: "https://example.com/instagram", whatsapp: "https://example.com/whatsapp" } })
  ];
}
async function criarExemplos() {
  await souAdm();
  const lote = writeBatch(db);
  exemplos().forEach((e) => lote.set(doc(collection(db, COLECAO.divulgacoes)), { ...montarDocumento(e), criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() }));
  await lote.commit();
}
async function apagarExemplos() {
  await souAdm();
  const r = await getDocs(query(collection(db, COLECAO.divulgacoes), where("exemplo", "==", true)));
  if (!r.size) return 0;
  const lote = writeBatch(db);
  r.docs.forEach((s) => lote.delete(s.ref));
  await lote.commit();
  return r.size;
}

/* ---------- 7. EXPORTA PARA AS TELAS (home/home-prestador.js e perfil-adm/divulgacoes-adm.js) ---------- */
window.SDDivulgacoes = Object.freeze({
  listarParaMim, PASTA_IMAGENS, LIMITES,
  adm: Object.freeze({ validar, listarTodas, salvar, mudarSituacao, apagar, criarExemplos, apagarExemplos })
});
document.dispatchEvent(new CustomEvent("sd:divulgacoes-pronto"));
