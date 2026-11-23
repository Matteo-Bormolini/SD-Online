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
   ===================================================================== */
import { db, auth, pronto, meusDados, COLECAO } from "./firebase.js";
import { getDocs, collection, query, where } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

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

/* ---------- 5. EXPORTA PARA A TELA (home/home-prestador.js) ---------- */
window.SDDivulgacoes = Object.freeze({ listarParaMim, PASTA_IMAGENS });
document.dispatchEvent(new CustomEvent("sd:divulgacoes-pronto"));
