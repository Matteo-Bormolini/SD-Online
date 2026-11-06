/* =====================================================================
   S.D — SERVIÇO DE RECUPERAÇÃO DE SENHA (servicos/recuperacao.js)
   A tela (login-cadastro/recuperacao.js) só conversa com ESTE arquivo.
   Este arquivo conversa com o SERVIDOR (API) — ou, enquanto ele não
   existe, com um "servidor de demonstração" que imita as respostas.

   Funções (todas devolvem uma Promessa com { ok, codigo, ... }):
     solicitarLink(email)        → sempre a MESMA resposta, exista ou não a conta
     validarLink(token)          → o link ainda vale? (30 min, uso único)
     redefinirSenha(token, nova) → troca a senha e encerra as sessões antigas

   Quem faz a segurança de verdade é o SERVIDOR (ver seguranca/recuperacao-acesso.md):
     token aleatório (32 bytes), guardado só como hash, uso único, 30 minutos,
     novo pedido invalida os anteriores, limite de pedidos, senha com Argon2id,
     não aceitar a senha atual, encerrar sessões, e-mail de aviso depois da troca.
   Depende de: configuracoes/config.js (SD.config.api e modoDemonstracao).
   ===================================================================== */
(function () {
  "use strict";
  const SD = window.SD;
  if (!SD) { console.error("[S.D] recuperacao.js: carregue configuracoes/config.js antes."); return; }

  /* ---------- 1. CÓDIGOS DE RESPOSTA → TEXTO PARA A PESSOA ---------- */
  const MENSAGENS = {
    ENVIADO:       "Se existir uma conta com este e-mail, enviamos um link para criar uma nova senha. Ele vale por 30 minutos e só pode ser usado uma vez.",
    LIMITE:        "Muitas solicitações seguidas. Aguarde alguns minutos e tente de novo.",
    LINK_INVALIDO: "Este link não é válido, já foi usado ou passou dos 30 minutos. Peça um novo link.",
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

  /* ---------- 3. MODO DEMONSTRAÇÃO (sem servidor) ----------
     Imita o servidor para testar as telas. Guarda só nesta aba (sessionStorage):
     o HASH do link, a validade e se já foi usado. Nada de senha, nada de e-mail.
     Para testar "igual à anterior", a senha atual de TODAS as contas de
     demonstração é: "Porta verde da cozinha". */
  const DEMO = {
    chave: "sd-demo-recuperacao",
    validadeMin: 30,
    limitePedidos: 3, janelaLimiteMin: 15,
    senhaAtual: "Porta verde da cozinha"
  };

  const ler = () => { try { return JSON.parse(sessionStorage.getItem(DEMO.chave) || "{}"); } catch (_) { return {}; } };
  const gravar = (d) => { try { sessionStorage.setItem(DEMO.chave, JSON.stringify(d)); } catch (_) { /* sem armazenamento */ } };

  // Token aleatório e seguro (32 bytes → texto base64url)
  function gerarToken() {
    const b = new Uint8Array(32);
    crypto.getRandomValues(b);
    return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  // SHA-256 em texto (o servidor real também guarda só o hash do token)
  async function hash(texto) {
    if (!window.crypto || !crypto.subtle) return "sem-hash:" + texto;   // navegador antigo/inseguro: só demonstração
    const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
    return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
  }
  // Pequena espera para imitar a rede
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  const demonstracao = {
    async solicitarLink(email) {
      await esperar(500);
      const d = ler(), agora = Date.now();
      const chaveEmail = await hash(email);
      // Limite de pedidos por e-mail (o servidor real limita também por IP)
      const pedidos = (d.pedidos && d.pedidos[chaveEmail] || []).filter((t) => agora - t < DEMO.janelaLimiteMin * 60000);
      if (pedidos.length >= DEMO.limitePedidos) return resposta("LIMITE");
      pedidos.push(agora);
      // Novo pedido INVALIDA o link anterior (só existe 1 link válido por vez)
      const token = gerarToken();
      gravar({
        pedidos: { ...(d.pedidos || {}), [chaveEmail]: pedidos },
        link: { hash: await hash(token), expira: agora + DEMO.validadeMin * 60000, usado: false }
      });
      // Na versão real o link vai SÓ por e-mail. Aqui ele volta para a tela poder testar.
      const url = new URL(location.href);
      url.search = ""; url.hash = "redefinir=" + token;
      return resposta("ENVIADO", { linkDemonstracao: url.href });
    },

    async validarLink(token) {
      await esperar(300);
      const l = ler().link;
      if (!token || !l || l.usado || Date.now() > l.expira || l.hash !== await hash(token)) return resposta("LINK_INVALIDO");
      return resposta("OK");
    },

    async redefinirSenha(token, novaSenha) {
      await esperar(500);
      const d = ler(), l = d.link;
      if (!token || !l || l.usado || Date.now() > l.expira || l.hash !== await hash(token)) return resposta("LINK_INVALIDO");
      if (window.SDSenha && !window.SDSenha.avaliar(novaSenha).ok) return resposta("SENHA_FRACA");
      // O servidor real confere com o hash Argon2id da senha atual
      if (novaSenha === DEMO.senhaAtual) return resposta("SENHA_IGUAL");
      l.usado = true;                                   // uso único
      gravar(d);
      SD.sessaoDemo.sair();                             // encerra a sessão (o servidor encerra TODAS)
      return resposta("OK");
    }
  };

  /* ---------- 4. FUNÇÕES PÚBLICAS (escolhem o modo) ---------- */
  const usarDemo = () => SD.config.modoDemonstracao && !(SD.config.api && SD.config.api.base);

  window.SDRecuperacao = Object.freeze({
    MENSAGENS,
    ehDemonstracao: usarDemo,
    senhaAtualDemonstracao: DEMO.senhaAtual,
    solicitarLink: (email) => (usarDemo() ? demonstracao.solicitarLink(email) : chamarApi("solicitarLinkSenha", { email })),
    validarLink: (token) => (usarDemo() ? demonstracao.validarLink(token) : chamarApi("validarLinkSenha", { token })),
    redefinirSenha: (token, novaSenha) => (usarDemo()
      ? demonstracao.redefinirSenha(token, novaSenha)
      : chamarApi("redefinirSenha", { token, novaSenha }))
  });
})();
