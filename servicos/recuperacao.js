/* =====================================================================
   S.D — SERVIÇO DE RECUPERAÇÃO DE SENHA (servicos/recuperacao.js)
   A tela (login-cadastro/recuperacao.js) só conversa com ESTE arquivo.
   Este arquivo conversa com o FIREBASE (firebase/firebase.js).
   Ordem de escolha: Firebase configurado → API própria (futuro).
   (O "servidor de demonstração" foi retirado na v0.7.9.)

   Funções (todas devolvem uma Promessa com { ok, codigo, ... }):
     solicitarLink(email)        → sempre a MESMA resposta, exista ou não a conta
     validarLink(token)          → o link ainda vale? (30 min, uso único)
     redefinirSenha(token, nova) → troca a senha e encerra as sessões antigas

   Quem faz a segurança de verdade é o SERVIDOR (ver seguranca/recuperacao-acesso.md):
     token aleatório (32 bytes), guardado só como hash, uso único, 30 minutos,
     novo pedido invalida os anteriores, limite de pedidos, senha com hash (Firebase),
     não aceitar a senha atual, encerrar sessões, e-mail de aviso depois da troca.
   Depende de: configuracoes/config.js (SD.config.api).
   ===================================================================== */
(function () {
  "use strict";
  const SD = window.SD;
  if (!SD) { console.error("[S.D] recuperacao.js: carregue configuracoes/config.js antes."); return; }

  /* ---------- 1. CÓDIGOS DE RESPOSTA → TEXTO PARA A PESSOA ---------- */
  // Validade do link: Firebase = 1 hora (padrão do Google)
  const usarFirebase = () => !!(window.SDFirebase && window.SDFirebase.ativo);
  const VALIDADE = "1 hora";
  const MENSAGENS = {
    ENVIADO:       `Se existir uma conta com este e-mail, enviamos um link para criar uma nova senha. Ele vale por ${VALIDADE} e só pode ser usado uma vez.`,
    LIMITE:        "Muitas solicitações seguidas. Aguarde alguns minutos e tente de novo.",
    LINK_INVALIDO: `Este link não é válido, já foi usado ou passou de ${VALIDADE}. Peça um novo link.`,
    SENHA_IGUAL:   "A nova senha não pode ser igual à sua senha anterior.",
    SENHA_FRACA:   "A nova senha não segue as regras de segurança.",
    REDE:          "Não foi possível falar com o servidor agora. Verifique a internet e tente de novo.",
    INDISPONIVEL:  "A recuperação de senha ainda não está disponível: o servidor não foi conectado."
  };
  const resposta = (codigo, extra = {}) => ({ ok: codigo === "ENVIADO" || codigo === "OK", codigo, mensagem: MENSAGENS[codigo] || "", ...extra });

  /* ---------- 2. MODO SERVIDOR (API real) ---------- */
  async function chamarApi(rota, corpo) {
    const api = SD.config.api || {};
    if (!api.base) return resposta("INDISPONIVEL");
    try {
      const r = await fetch(api.base + api.rotas[rota], {
        method: "POST",
        credentials: "include",                       // cookie de sessão HttpOnly (definido pelo servidor)
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(corpo)
      });
      if (r.status === 429) return resposta("LIMITE");
      const dados = await r.json().catch(() => ({}));
      return resposta(dados.codigo || (r.ok ? "OK" : "REDE"), dados);
    } catch (_) {
      return resposta("REDE");
    }
  }

  /* ---------- 2b. MODO FIREBASE ----------
     O "token" é o oobCode do link do e-mail (firebase/firebase.js troca o
     ?mode=resetPassword&oobCode=... por #redefinir=<código>). */
  const codigoDoErro = (e) => {
    const c = (e && e.code) || "";
    if (c === "auth/too-many-requests") return "LIMITE";
    if (c === "auth/network-request-failed") return "REDE";
    if (c === "auth/expired-action-code" || c === "auth/invalid-action-code") return "LINK_INVALIDO";
    if (c === "auth/weak-password" || c === "auth/password-does-not-meet-requirements") return "SENHA_FRACA";
    if (c === "NAO_CONFIGURADO") return "INDISPONIVEL";
    return "REDE";
  };
  const firebase = {
    async solicitarLink(email) {
      // Resposta IGUAL exista ou não a conta (proteção contra enumeração ligada no console)
      try { await window.SDFirebase.solicitarLinkSenha(email); return resposta("ENVIADO"); }
      catch (e) { const c = codigoDoErro(e); return resposta(c === "LINK_INVALIDO" || c === "SENHA_FRACA" ? "ENVIADO" : c); }
    },
    async validarLink(codigo) {
      try { await window.SDFirebase.validarLinkSenha(codigo); return resposta("OK"); }
      catch (e) { return resposta(codigoDoErro(e) === "REDE" ? "REDE" : "LINK_INVALIDO"); }
    },
    async redefinirSenha(codigo, novaSenha) {
      if (window.SDSenha && !window.SDSenha.avaliar(novaSenha).ok) return resposta("SENHA_FRACA");
      try { await window.SDFirebase.redefinirSenha(codigo, novaSenha); SD.sessao.sair(); return resposta("OK"); }
      catch (e) { return resposta(codigoDoErro(e)); }
    }
  };

  /* ---------- 3. FUNÇÕES PÚBLICAS (escolhem o modo) ---------- */
  // Firebase ainda não terminou de carregar? Espera até 8 s pelo aviso "sd:firebase-pronto".
  const esperarFirebase = () => (window.SDFirebase ? Promise.resolve() : new Promise((ok) => {
    const t = setTimeout(ok, 8000);
    document.addEventListener("sd:firebase-pronto", () => { clearTimeout(t); ok(); }, { once: true });
  }));
  const escolher = (nome) => async (...args) => {
    await esperarFirebase();
    if (usarFirebase()) return firebase[nome](...args);
    const corpo = nome === "solicitarLink" ? { email: args[0] } : nome === "validarLink" ? { token: args[0] } : { token: args[0], novaSenha: args[1] };
    return chamarApi(nome === "solicitarLink" ? "solicitarLinkSenha" : nome === "validarLink" ? "validarLinkSenha" : "redefinirSenha", corpo);
  };

  window.SDRecuperacao = Object.freeze({
    MENSAGENS,
    ehDemonstracao: () => false,
    solicitarLink: escolher("solicitarLink"),
    validarLink: escolher("validarLink"),
    redefinirSenha: escolher("redefinirSenha")
  });
})();
