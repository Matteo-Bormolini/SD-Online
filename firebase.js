/* =====================================================================
   S.D — CONEXÃO COM O FIREBASE (firebase/firebase.js)
   Único arquivo que fala com o Firebase (login + banco de dados).
   As telas usam só window.SDFirebase (lista no fim do arquivo).

   Como entra nas páginas: ÚLTIMO script do <head>, com type="module":
     <script type="module" src="../firebase/firebase.js"></script>
   (type="module" não funciona abrindo o arquivo direto do PC: use o
    GitHub Pages ou um servidor local, ex.: Live Server do VS Code.)

   O que ele faz:
     1. Entrar, sair, criar conta (CPF/CNPJ único), apagar conta.
     2. "Esqueci a senha" com o pop-up do site (link do e-mail).
     3. Confirma o e-mail quando a pessoa clica no link de verificação.
     4. Lê e salva os dados do perfil (coleção "usuarios").
     5. Mantém a "sessão da tela" (configuracoes/config.js) igual ao Firebase.

   SEGURANÇA: a apiKey abaixo PODE ficar pública (é assim no Firebase).
   Quem protege os dados são as REGRAS do banco: firebase/firestore.rules.
   ===================================================================== */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.14.0/firebase-app.js";
import {
  getAuth, setPersistence, browserLocalPersistence, browserSessionPersistence,
  signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, deleteUser,
  sendPasswordResetEmail, verifyPasswordResetCode, confirmPasswordReset,
  sendEmailVerification, applyActionCode, checkActionCode,
  onAuthStateChanged, updatePassword, verifyBeforeUpdateEmail
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";
import {
  getFirestore, doc, getDoc, setDoc, updateDoc, writeBatch, serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

/* ---------- 1. CONFIGURAÇÃO (cole aqui o bloco do console do Firebase) ----------
   Console → engrenagem → Configurações do projeto → Seus apps → SDOnline Web */
const firebaseConfig = {
  apiKey: "AIzaSyCI9Addm21iAvKF19ojAXA9Sz0iYO5KFd4",
  authDomain: "plataforma-sdonline.firebaseapp.com",
  projectId: "plataforma-sdonline",
  storageBucket: "plataforma-sdonline.firebasestorage.app",
  messagingSenderId: "20030343017",
  appId: "1:20030343017:web:64cd512e1cdf068e4bdff8"
};

// Nomes das coleções do banco (Firestore)
const COLECAO = { usuarios: "usuarios", documentos: "documentos", configuracoes: "configuracoes" };
// Configurações gerais do site (configuracoes/site no banco; só o adm muda)
// conferirDocumentos: true = confere CPF/CNPJ (dígitos + consulta do CNPJ do prestador)
//                     false = MODO TESTE: aceita qualquer CPF/CNPJ com o tamanho certo
const CONFIG_SITE_PADRAO = { conferirDocumentos: true };
// Tipos que a própria pessoa pode criar (adm só é marcado pelo console)
const TIPOS_CADASTRO = ["cliente-cpf", "cliente-cnpj", "prestador"];
// Campos que a pessoa NÃO pode mudar sozinha (as regras do banco também bloqueiam)
const PROTEGIDOS = ["tipo", "documento", "documentoChave", "email", "criadoEm", "tags", "avaliacao", "servicosAnteriores", "cargoBase", "verificado", "cnpjConsulta"];
// Botões liga/desliga que NÃO são salvos pela própria pessoa
const INTERRUPTORES_SO_ADM = ["destaque"];
// Botões do adm que valem para o SITE TODO (salvos em configuracoes/site)
const INTERRUPTORES_DO_SITE = { "conferir-documentos": "conferirDocumentos" };
// Chave da "sessão da tela" (mesma de configuracoes/config.js)
const CHAVE_SESSAO = "sd-sessao";

const configurado = !Object.values(firebaseConfig).some((v) => !v || v === "COLE_AQUI");

/* ---------- 2. MENSAGENS DE ERRO (código do Firebase → texto simples) ---------- */
const ERROS = {
  "auth/invalid-credential": "E-mail ou senha incorretos.",
  "auth/wrong-password": "E-mail ou senha incorretos.",
  "auth/user-not-found": "E-mail ou senha incorretos.",
  "auth/invalid-email": "E-mail inválido.",
  "auth/user-disabled": "Esta conta está bloqueada. Fale com o suporte.",
  "auth/email-already-in-use": "Já existe uma conta com este e-mail. Use \"Esqueceu a senha?\" se precisar.",
  "auth/weak-password": "A senha não segue as regras de segurança.",
  "auth/password-does-not-meet-requirements": "A senha não segue as regras de segurança.",
  "auth/too-many-requests": "Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.",
  "auth/network-request-failed": "Sem conexão com o servidor. Verifique a internet e tente de novo.",
  "auth/requires-recent-login": "Por segurança, saia da conta e entre de novo antes de fazer isso.",
  "auth/expired-action-code": "Este link passou do prazo. Peça um novo.",
  "auth/invalid-action-code": "Este link não é válido ou já foi usado. Peça um novo.",
  "auth/operation-not-allowed": "Login por e-mail desligado no Firebase (Authentication → Método de login).",
  "auth/unauthorized-domain": "Este endereço do site não está autorizado no Firebase (Authentication → Configurações → Domínios autorizados).",
  "permission-denied": "Ação não permitida.",
  "unavailable": "Sem conexão com o servidor. Verifique a internet e tente de novo.",
  DOCUMENTO_EM_USO: "Este CPF/CNPJ já tem uma conta. Use \"Esqueceu o login?\" ou fale com o suporte.",
  NAO_CONFIGURADO: "O login ainda não está disponível: o Firebase não foi configurado (firebase/firebase.js).",
  SEM_LOGIN: "Sua sessão terminou. Entre de novo.",
  CADASTRO_INCOMPLETO: "O cadastro anterior com este e-mail ficou incompleto e foi apagado. Crie a conta de novo."
};
const mensagemErro = (e) => ERROS[(e && e.code) || e] || "Não foi possível concluir agora. Tente de novo em instantes.";
// Erro com código próprio (para as telas tratarem)
const erro = (codigo) => Object.assign(new Error(ERROS[codigo] || codigo), { code: codigo });

/* ---------- 3. SESSÃO DA TELA (lida por configuracoes/config.js) ----------
   Guarda só { uid, tipo, nome }. NUNCA senha. Serve para a NavBar e o menu
   aparecerem certos sem esperar o Firebase. Quem protege é o banco. */
const sessaoTela = {
  ler() {
    for (const area of [sessionStorage, localStorage]) {
      try { const s = JSON.parse(area.getItem(CHAVE_SESSAO) || "null"); if (s) return s; } catch (_) { /* sem armazenamento */ }
    }
    return null;
  },
  gravar(s, manter) {
    this.limpar();
    try { (manter ? localStorage : sessionStorage).setItem(CHAVE_SESSAO, JSON.stringify(s)); } catch (_) { /* sem armazenamento */ }
  },
  limpar() {
    [sessionStorage, localStorage].forEach((a) => { try { a.removeItem(CHAVE_SESSAO); } catch (_) { /* sem armazenamento */ } });
  }
};

// Nome curto para a NavBar (primeiro nome ou nome da empresa)
function nomeCurto(dados) {
  if (!dados) return "";
  if (dados.nome) return String(dados.nome).trim().split(/\s+/)[0];
  return dados.nomeFantasia || dados.razaoSocial || dados.responsavelNome || "";
}

/* ---------- 4. CONEXÃO ---------- */
let auth = null, db = null;
if (configurado) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  auth.languageCode = "pt-BR";               // e-mails e mensagens do Firebase em português
  db = getFirestore(app);
} else {
  console.warn("[S.D] firebase.js: preencha o firebaseConfig (bloco 1) para ligar o login.");
}

// Espera o Firebase dizer se há alguém logado (1ª resposta)
const pronto = configurado
  ? new Promise((ok) => { const parar = onAuthStateChanged(auth, (u) => { parar(); ok(u); }); })
  : Promise.resolve(null);

/* ---------- 5. DADOS DO PERFIL (coleção "usuarios") ---------- */
let cacheDados = { uid: null, promessa: null };

async function meusDados(forcar = false) {
  await pronto;
  const u = auth && auth.currentUser;
  if (!u) return null;
  if (forcar || cacheDados.uid !== u.uid || !cacheDados.promessa) {
    cacheDados = {
      uid: u.uid,
      promessa: getDoc(doc(db, COLECAO.usuarios, u.uid)).then((s) => (s.exists() ? { uid: u.uid, ...s.data() } : null))
    };
  }
  try { return await cacheDados.promessa; }
  catch (e) { cacheDados.promessa = null; throw e; }
}

// Salva só campos permitidos (os protegidos são retirados aqui e bloqueados no banco)
async function atualizarCampos(campos) {
  await pronto;
  const u = auth && auth.currentUser;
  if (!u) throw erro("SEM_LOGIN");
  const limpo = {};
  for (const [chave, valor] of Object.entries(campos || {})) {
    if (PROTEGIDOS.includes(chave) || chave.startsWith("_") || valor === undefined) continue;
    limpo[chave] = valor;
  }
  if (!Object.keys(limpo).length) return;
  limpo.atualizadoEm = serverTimestamp();
  await updateDoc(doc(db, COLECAO.usuarios, u.uid), limpo);
  cacheDados.promessa = null;                          // próxima leitura busca de novo
}

/* ---------- 6. ENTRAR, CRIAR CONTA, SAIR ---------- */
const persistencia = (manter) => setPersistence(auth, manter ? browserLocalPersistence : browserSessionPersistence);

// Entra e devolve { tipo, nome }. manter = "Continuar conectado"
async function entrar(email, senha, manter) {
  if (!configurado) throw erro("NAO_CONFIGURADO");
  await persistencia(manter);
  await signInWithEmailAndPassword(auth, String(email).trim().toLowerCase(), senha);
  const dados = await meusDados(true);
  if (!dados) {                                       // login sem perfil (cadastro interrompido)
    // Acabou de entrar, então o Firebase deixa apagar: libera o e-mail para um novo cadastro
    try { await deleteUser(auth.currentUser); } catch (_) { await signOut(auth); }
    throw erro("CADASTRO_INCOMPLETO");
  }
  sessaoTela.gravar({ uid: dados.uid, tipo: dados.tipo, nome: nomeCurto(dados) }, manter);
  return { tipo: dados.tipo, nome: nomeCurto(dados), emailConfirmado: auth.currentUser.emailVerified };
}

/* Cria o login. Se o e-mail já tiver um login SEM perfil (cadastro que parou no meio)
   e a senha for a mesma, reaproveita esse login em vez de dar "e-mail em uso". */
async function criarOuReaproveitarLogin(email, senha) {
  try {
    return await createUserWithEmailAndPassword(auth, email, senha);
  } catch (e) {
    if (e.code !== "auth/email-already-in-use") throw e;
    let cred;
    try { cred = await signInWithEmailAndPassword(auth, email, senha); } catch (_) { throw e; }
    const perfil = await getDoc(doc(db, COLECAO.usuarios, cred.user.uid)).catch(() => null);
    if (perfil && !perfil.exists()) return cred;      // login órfão → continua o cadastro
    await signOut(auth);
    throw e;                                          // conta completa: e-mail realmente em uso
  }
}

/* Cria a conta. dados = {
     tipo: "cliente-cpf" | "cliente-cnpj" | "prestador",
     email, senha, documento (só números/letras), ...outros campos do perfil } */
async function cadastrar(dados) {
  if (!configurado) throw erro("NAO_CONFIGURADO");
  const { senha, ...resto } = dados;
  if (!TIPOS_CADASTRO.includes(resto.tipo)) throw erro("permission-denied");
  const prefixo = resto.tipo === "cliente-cpf" ? "cpf" : "cnpj";
  const chave = `${prefixo}-${resto.documento}`;
  const email = String(resto.email).trim().toLowerCase();

  await persistencia(false);
  const cred = await criarOuReaproveitarLogin(email, senha);
  const uid = cred.user.uid;

  // Perfil + "reserva" do CPF/CNPJ no MESMO envio (tudo ou nada).
  // Se o documento já tiver dono, o banco recusa → a conta recém-criada é apagada.
  const lote = writeBatch(db);
  const perfil = { ...resto, email, documentoChave: chave, criadoEm: serverTimestamp(), atualizadoEm: serverTimestamp() };
  lote.set(doc(db, COLECAO.usuarios, uid), perfil);
  lote.set(doc(db, COLECAO.documentos, chave), { uid, criadoEm: serverTimestamp() });
  try {
    await lote.commit();
  } catch (e) {
    try { await deleteUser(cred.user); } catch (_) { await signOut(auth); }
    throw e && e.code === "permission-denied" ? erro("DOCUMENTO_EM_USO") : e;
  }

  // E-mail "confirme seu endereço" (não impede o uso; só avisa)
  try { await sendEmailVerification(cred.user); } catch (_) { /* tenta de novo pela tela */ }
  cacheDados = { uid: null, promessa: null };
  const salvo = await meusDados(true);
  sessaoTela.gravar({ uid, tipo: salvo.tipo, nome: nomeCurto(salvo) }, false);
  return { tipo: salvo.tipo, nome: nomeCurto(salvo) };
}

async function sair() {
  sessaoTela.limpar();
  cacheDados = { uid: null, promessa: null };
  if (configurado) await signOut(auth);
}

async function reenviarVerificacao() {
  await pronto;
  if (!auth || !auth.currentUser) throw erro("SEM_LOGIN");
  await sendEmailVerification(auth.currentUser);
}

async function emailConfirmado() {
  await pronto;
  return !!(auth && auth.currentUser && auth.currentUser.emailVerified);
}

/* ---------- 7. CONTA: TROCAR SENHA, TROCAR E-MAIL, EXCLUIR ---------- */
async function trocarSenha(nova) {
  await pronto;
  if (!auth || !auth.currentUser) throw erro("SEM_LOGIN");
  await updatePassword(auth.currentUser, nova);
}

// O e-mail só muda DEPOIS que a pessoa clicar no link enviado ao e-mail novo
async function trocarEmail(novo) {
  await pronto;
  if (!auth || !auth.currentUser) throw erro("SEM_LOGIN");
  await verifyBeforeUpdateEmail(auth.currentUser, String(novo).trim().toLowerCase());
}

// Apaga perfil, reserva do CPF/CNPJ e o login (nessa ordem)
async function excluirConta() {
  await pronto;
  const u = auth && auth.currentUser;
  if (!u) throw erro("SEM_LOGIN");
  const dados = await meusDados(true);
  const lote = writeBatch(db);
  if (dados && dados.documentoChave) lote.delete(doc(db, COLECAO.documentos, dados.documentoChave));
  lote.delete(doc(db, COLECAO.usuarios, u.uid));
  // Confere antes se o login aceita ser apagado agora (pede login recente)
  if (Date.now() - new Date(u.metadata.lastSignInTime).getTime() > 5 * 60 * 1000) throw erro("auth/requires-recent-login");
  await lote.commit();
  await deleteUser(u);
  sessaoTela.limpar();
  cacheDados = { uid: null, promessa: null };
}

/* ---------- 8. ESQUECI A SENHA (pop-up do site) ---------- */
async function solicitarLinkSenha(email) {
  if (!configurado) throw erro("NAO_CONFIGURADO");
  await sendPasswordResetEmail(auth, String(email).trim().toLowerCase());
}
async function validarLinkSenha(codigo) {
  if (!configurado) throw erro("NAO_CONFIGURADO");
  return verifyPasswordResetCode(auth, codigo);        // devolve o e-mail da conta
}
async function redefinirSenha(codigo, nova) {
  if (!configurado) throw erro("NAO_CONFIGURADO");
  await confirmPasswordReset(auth, codigo, nova);
  await sair();                                        // entra de novo com a senha nova
}

/* ---------- 9. LINKS DOS E-MAILS (?mode=...&oobCode=...) ----------
   No console (Authentication → Modelos → editar → "Personalizar URL de ação")
   o endereço é a página de login. Aqui cada tipo de link é tratado. */
function avisar(tipo, texto) {
  const caixa = document.getElementById("aviso");
  if (!caixa) return;
  if (window.SDUtil) window.SDUtil.mostrarMensagem(caixa, tipo, texto);
  else { caixa.className = `mensagem ${tipo}`; caixa.textContent = texto; }
}

async function tratarLinkDoEmail() {
  const p = new URLSearchParams(location.search);
  const modo = p.get("mode"), codigo = p.get("oobCode");
  if (!modo || !codigo) return;
  // Tira o código da barra de endereço (não fica no histórico)
  history.replaceState(null, "", location.pathname);
  if (!configurado) return;

  if (modo === "resetPassword") {
    // O pop-up "Criar nova senha" (login-cadastro/recuperacao.js) lê o #redefinir=
    location.hash = "redefinir=" + codigo;
    return;
  }
  try {
    if (modo === "verifyEmail") {
      await applyActionCode(auth, codigo);
      if (auth.currentUser) {
        await auth.currentUser.reload();
        await auth.currentUser.getIdToken(true);       // regras do banco passam a ver "e-mail confirmado"
      }
      document.getElementById("sd-aviso-email")?.remove();
      avisar("sucesso", "E-mail confirmado. Obrigado!");
    } else if (modo === "verifyAndChangeEmail") {
      await applyActionCode(auth, codigo);
      await sair();
      avisar("sucesso", "E-mail alterado. Entre de novo usando o e-mail novo.");
    } else if (modo === "recoverEmail") {
      await checkActionCode(auth, codigo);
      await applyActionCode(auth, codigo);
      await sair();
      avisar("atencao", "O e-mail antigo da conta foi restaurado. Se não foi você que pediu a troca, use \"Esqueceu a senha?\" agora para criar uma senha nova.");
    }
  } catch (e) {
    avisar("erro", mensagemErro(e));
  }
}

/* ---------- 10. SESSÃO DA TELA = FIREBASE ----------
   Se a tela mostra "logado" mas o Firebase não (ou o contrário), corrige e
   recarrega a página uma vez. Também mantém o e-mail do banco igual ao do login. */
async function sincronizarSessao() {
  const params = new URLSearchParams(location.search);
  if (params.get("sair") === "1") { await sair(); return; }   // config.js já limpou a tela

  const u = await pronto;
  const tela = sessaoTela.ler();
  const logadoNaTela = document.body && document.body.dataset.logado === "sim";
  let correta = null;

  if (u) {
    let dados = null;
    try { dados = await meusDados(); } catch (_) { return; }   // sem internet: não mexe
    if (!dados) { await sair(); }
    else {
      correta = { uid: u.uid, tipo: dados.tipo, nome: nomeCurto(dados) };
      // E-mail trocado pelo link → atualiza o banco
      if (u.email && dados.email !== u.email) {
        try { await updateDoc(doc(db, COLECAO.usuarios, u.uid), { email: u.email, atualizadoEm: serverTimestamp() }); } catch (_) { /* tenta na próxima */ }
      }
    }
  }

  const igual = (a, b) => (!a && !b) || (a && b && a.uid === b.uid && a.tipo === b.tipo && a.nome === b.nome);
  if (igual(tela, correta) && logadoNaTela === !!correta) return;

  if (correta) {
    const manter = (() => { try { return !!localStorage.getItem(CHAVE_SESSAO); } catch (_) { return false; } })();
    sessaoTela.gravar(correta, manter || !tela);
  } else sessaoTela.limpar();

  // Recarrega no máximo 1 vez a cada 10 s (evita ficar em ciclo)
  try {
    const ultima = Number(sessionStorage.getItem("sd-sessao-recarga") || 0);
    if (Date.now() - ultima < 10000) return;
    sessionStorage.setItem("sd-sessao-recarga", String(Date.now()));
  } catch (_) { return; }
  location.reload();
}

/* ---------- 10b. CONFIGURAÇÕES DO SITE (configuracoes/site) ----------
   Qualquer pessoa lê (o cadastro precisa saber se confere CPF/CNPJ).
   Só o adm salva (regras do banco). Sem resposta do banco → usa o padrão SEGURO. */
let cacheConfigSite = null;
async function configSite(forcar = false) {
  if (!configurado) return { ...CONFIG_SITE_PADRAO };
  if (!forcar && cacheConfigSite) return cacheConfigSite;
  try {
    const s = await getDoc(doc(db, COLECAO.configuracoes, "site"));
    cacheConfigSite = { ...CONFIG_SITE_PADRAO, ...(s.exists() ? s.data() : {}) };
  } catch (_) {
    return { ...CONFIG_SITE_PADRAO };
  }
  return cacheConfigSite;
}
async function salvarConfigSite(campos) {
  await pronto;
  if (!auth || !auth.currentUser) throw erro("SEM_LOGIN");
  await setDoc(doc(db, COLECAO.configuracoes, "site"), { ...campos, atualizadoEm: serverTimestamp() }, { merge: true });
  cacheConfigSite = null;
}

/* ---------- 10c. AVISO "CONFIRME SEU E-MAIL" (todas as páginas) ----------
   PADRÃO (11/11/2026): sem confirmar, a pessoa entra, vê e edita o próprio perfil
   e pode excluir a conta. Tudo que envolve OUTRA pessoa (aparecer na busca,
   pedir orçamento, orçar, avaliar — Ciclos 3 e 4) exige e-mail confirmado
   (regras do banco: função emailConfirmado()). */
async function avisoEmailGlobal() {
  const u = await pronto;
  if (!u || u.emailVerified) return;
  if (document.getElementById("aviso-verificacao")) return;   // página de login já tem o aviso dela
  const main = document.querySelector("main");
  if (!main || document.getElementById("sd-aviso-email")) return;
  const caixa = document.createElement("div");
  caixa.id = "sd-aviso-email";
  caixa.className = "mensagem atencao";
  caixa.setAttribute("role", "status");
  caixa.textContent = `Confirme seu e-mail (${u.email}) para pedir e receber orçamentos. Confira também o spam. `;
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "btn";
  botao.textContent = "Reenviar e-mail";
  botao.addEventListener("click", async () => {
    botao.disabled = true;
    try { await sendEmailVerification(u); botao.textContent = "Enviado"; }
    catch (e) { botao.textContent = mensagemErro(e); }
    setTimeout(() => { botao.disabled = false; botao.textContent = "Reenviar e-mail"; }, 60000);
  });
  caixa.append(botao);
  main.prepend(caixa);
}

/* ---------- 11. BOTÕES LIGA/DESLIGA → BANCO ----------
   configuracoes/interruptores.js avisa cada troca com o evento "sd:interruptor". */
document.addEventListener("sd:interruptor", async (ev) => {
  const { id, ligado } = ev.detail || {};
  if (!configurado || !id || INTERRUPTORES_SO_ADM.includes(id) || id === "tema-escuro") return;
  await pronto;
  if (!auth.currentUser) return;
  if (INTERRUPTORES_DO_SITE[id]) {                   // botão do site todo (só o adm consegue salvar)
    try { await salvarConfigSite({ [INTERRUPTORES_DO_SITE[id]]: !!ligado }); }
    catch (e) { console.warn("[S.D] Não foi possível salvar", id, e.code || e); document.dispatchEvent(new CustomEvent("sd:interruptor-erro", { detail: { id, erro: mensagemErro(e) } })); }
    return;
  }
  try { await updateDoc(doc(db, COLECAO.usuarios, auth.currentUser.uid), { [`interruptores.${id}`]: !!ligado, atualizadoEm: serverTimestamp() }); cacheDados.promessa = null; }
  catch (e) { console.warn("[S.D] Não foi possível salvar o botão", id, e.code || e); }
});

/* ---------- 12. EXPORTA PARA AS TELAS ---------- */
window.SDFirebase = Object.freeze({
  ativo: configurado,
  pronto,                          // Promessa: resolve quando o login foi conferido
  mensagemErro,                    // erro → texto para a pessoa
  entrar, cadastrar, sair, reenviarVerificacao, emailConfirmado,
  configSite, salvarConfigSite,    // configurações do site (ex.: conferir CPF/CNPJ)
  meusDados, atualizarCampos, trocarSenha, trocarEmail, excluirConta,
  solicitarLinkSenha, validarLinkSenha, redefinirSenha,
  emailAtual: () => (auth && auth.currentUser ? auth.currentUser.email : "")
});
document.dispatchEvent(new CustomEvent("sd:firebase-pronto"));

if (configurado) {
  tratarLinkDoEmail();
  sincronizarSessao();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", avisoEmailGlobal);
  else avisoEmailGlobal();
}
