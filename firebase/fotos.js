/* =====================================================================
   S.D — FOTOS COMPACTADAS NO BANCO (firebase/fotos.js) · v0.8.0
   GRÁTIS: sem Cloud Storage (pago). Cada foto vira 1 documento na coleção
   "fotos", com a imagem reduzida e compactada em texto (data:image/...).

   Padrão (decisão de 18/11/2026):
     - Fotos de serviço / trabalhos / local: lado maior até 1080 px, WebP qualidade 0,80.
     - iPhone/Safari não gera WebP → JPEG qualidade 0,80 (mesmo tamanho).
     - Se passar do limite, baixa a qualidade aos poucos (0,72 → 0,64) e depois o tamanho.
     - Foto de perfil/logo continua no próprio perfil (256 × 256, componentes/perfil-base).
     - AVIF: o navegador não gera AVIF (testado: Chromium devolve PNG). Fica para
       quando houver servidor (a conversão será feita lá).

   Organização do documento fotos/{id} (fácil de conferir no console):
     dono      uid de quem enviou
     tipo      "trabalho" (prestador) · "local" (cliente CNPJ) · "pedido" (Pedir contato)
     ref       pedido: id do contato/orçamento · demais: ""
     legenda   legenda (trabalho) ou área do local (CNPJ), até 80 caracteres
     formato   "webp" | "jpeg" · largura, altura (px)
     dados     a imagem em texto (data:image/webp;base64,...)
     url       RESERVADO = "". Quando houver Storage, a imagem vai para lá e
               "dados" é trocado por "url" (o resto continua igual).
     criadoEm  data do envio

   Uso nas telas (window.SDFotos):
     const { id, src } = await SDFotos.salvar(arquivo, { tipo: "trabalho", legenda: "" });
     const src = await SDFotos.ler(id);       // imagem pronta para <img src>
     await SDFotos.legenda(id, "Fachada pintada");
     await SDFotos.apagar(id);
   ===================================================================== */
import { db, auth, pronto, COLECAO } from "./firebase.js";
import { doc, getDoc, setDoc, updateDoc, deleteDoc, collection, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* ---------- 1. CONFIGURAÇÃO ← MUDE AQUI (mesmos limites das regras do banco) ---------- */
export const FOTOS = {
  ladoMaximo: 1080,          // px (lado maior)
  qualidade: 0.8,            // WebP/JPEG
  qualidadeMinima: 0.64,     // abaixo disso, reduz o tamanho em vez da qualidade
  maxCaracteres: 900000,     // ≈ 650 KB de imagem (o documento do Firestore aceita até 1 MiB)
  tipos: ["trabalho", "local", "pedido"]
};

/* ---------- 2. COMPACTAR (no aparelho, antes de enviar) ---------- */
function carregarImagem(arq) {
  return new Promise((ok, falha) => {
    const url = URL.createObjectURL(arq), img = new Image();
    img.onload = () => { URL.revokeObjectURL(url); ok(img); };
    img.onerror = () => { URL.revokeObjectURL(url); falha(new Error("FOTO_INVALIDA")); };
    img.src = url;
  });
}
// Desenha a imagem com o lado maior = lado (nunca aumenta a foto)
function desenhar(img, lado) {
  const escala = Math.min(1, lado / Math.max(img.naturalWidth, img.naturalHeight));
  const tela = document.createElement("canvas");
  tela.width = Math.max(1, Math.round(img.naturalWidth * escala));
  tela.height = Math.max(1, Math.round(img.naturalHeight * escala));
  const ctx = tela.getContext("2d");
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, tela.width, tela.height);   // PNG transparente → fundo branco
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, tela.width, tela.height);
  return tela;
}
// WebP quando o navegador gera; senão JPEG (iPhone/Safari)
function exportar(tela, q) {
  let dados = tela.toDataURL("image/webp", q);
  let formato = "webp";
  if (!dados.startsWith("data:image/webp")) { dados = tela.toDataURL("image/jpeg", q); formato = "jpeg"; }
  return { dados, formato };
}
export async function comprimir(arq) {
  const img = await carregarImagem(arq);
  let lado = FOTOS.ladoMaximo;
  for (let tentativa = 0; tentativa < 6; tentativa++) {
    const tela = desenhar(img, lado);
    for (let q = FOTOS.qualidade; q >= FOTOS.qualidadeMinima - 0.001; q -= 0.08) {
      const r = exportar(tela, Math.round(q * 100) / 100);
      if (r.dados.length <= FOTOS.maxCaracteres) return { ...r, largura: tela.width, altura: tela.height };
    }
    lado = Math.round(lado * 0.85);                    // ainda grande: diminui o tamanho
  }
  throw new Error("FOTO_GRANDE");
}

/* ---------- 3. SALVAR, LER, LEGENDA, APAGAR ---------- */
const cacheLidas = new Map();                          // id → src (não lê a mesma foto 2 vezes)

export async function salvar(arq, { tipo, ref = "", legenda = "" } = {}) {
  await pronto;
  const u = auth && auth.currentUser;
  if (!u) throw Object.assign(new Error("SEM_LOGIN"), { code: "SEM_LOGIN" });
  if (!FOTOS.tipos.includes(tipo)) throw new Error("TIPO_INVALIDO");
  const foto = await comprimir(arq);
  const novo = doc(collection(db, COLECAO.fotos));      // id automático
  await setDoc(novo, {
    dono: u.uid, tipo, ref: String(ref || ""), legenda: String(legenda || "").slice(0, 80),
    formato: foto.formato, largura: foto.largura, altura: foto.altura,
    dados: foto.dados, url: "", criadoEm: serverTimestamp()
  });
  cacheLidas.set(novo.id, foto.dados);
  return { id: novo.id, src: foto.dados, formato: foto.formato, caracteres: foto.dados.length };
}

export async function ler(id) {
  if (!id) return "";
  if (cacheLidas.has(id)) return cacheLidas.get(id);
  await pronto;
  const s = await getDoc(doc(db, COLECAO.fotos, String(id)));
  const src = s.exists() ? (s.data().url || s.data().dados || "") : "";
  cacheLidas.set(id, src);
  return src;
}

export async function legenda(id, texto) {
  await pronto;
  await updateDoc(doc(db, COLECAO.fotos, String(id)), { legenda: String(texto || "").slice(0, 80) });
}

export async function apagar(id) {
  await pronto;
  await deleteDoc(doc(db, COLECAO.fotos, String(id)));
  cacheLidas.delete(id);
}

/* ---------- 4. PARA AS TELAS ---------- */
window.SDFotos = Object.freeze({ FOTOS, comprimir, salvar, ler, legenda, apagar });
document.dispatchEvent(new CustomEvent("sd:fotos-pronto"));
