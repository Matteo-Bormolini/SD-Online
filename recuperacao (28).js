/* =====================================================================
   S.D — RECUPERAÇÃO DE ACESSO NA TELA DE LOGIN (login-cadastro/recuperacao.js)
   Só POP-UPS (nenhuma página nova):
     1. "Esqueceu a senha?"  → e-mail → link enviado
     2. "Criar nova senha"   → aberto pelo link do e-mail (#redefinir=<token>)
     3. "Esqueceu o login?"  → não lembro o e-mail | não lembro o CPF/CNPJ | os dois
     4. "Cancelar solicitação?" → confirmação por cima do pop-up atual

   Comportamento combinado (06/11/2026):
     - Clicar fora, no X ou em Esc FECHA, mas guarda tudo (campos e etapa).
     - Abrir de novo continua exatamente de onde parou.
     - "Voltar ao login" fecha e leva ao campo de login.
     - "Cancelar solicitação" pede confirmação; "Sim" apaga e recomeça.
   Nada é guardado no navegador: o progresso fica só na memória desta página.

   Quem conversa com o servidor: servicos/recuperacao.js (SDRecuperacao).
   Regras de senha: componentes/senha (SDSenha).
   Identificadores (e-mail/CPF/CNPJ): servicos/identificadores.js (SDIdentificadores).
   ===================================================================== */
(function () {
  "use strict";
  const SD = window.SD, U = window.SDUtil, REC = window.SDRecuperacao, SENHA = window.SDSenha, ID = window.SDIdentificadores;
  if (!SD || !U || !REC || !SENHA || !ID) { console.error("[S.D] recuperacao.js: carregue config, utilidades, senha e os serviços antes."); return; }
  const $ = (s, raiz = document) => raiz.querySelector(s);
  const $$ = (s, raiz = document) => [...raiz.querySelectorAll(s)];

  /* ---------- 1. CONFIGURAÇÃO ---------- */
  const CONFIG = {
    esperaReenvioSeg: 60,                 // tempo mínimo entre dois pedidos de link
    urlSuporte: SD.caminho("suporte/index.html")
  };

  /* ---------- 2. ESTADO (memória da página; não usa armazenamento) ---------- */
  const estado = {
    senha: { etapa: "email", email: "", liberaReenvioEm: 0, linkDemo: "" },
    nova:  { etapa: "verificando", token: "" },
    login: { etapa: "escolha", resultado: "" }       // resultado: "", "documento" ou "email"
  };

  const popups = {
    senha: U.ligarPopup($("#popup-senha")),
    nova: U.ligarPopup($("#popup-nova-senha")),
    login: U.ligarPopup($("#popup-login")),
    confirmar: U.ligarPopup($("#popup-confirmar"))
  };

  /* ---------- 3. APOIO ---------- */
  // Mostra só a etapa atual dentro do pop-up
  function mostrarEtapa(popup, etapa) {
    $$(".popup-etapa", popup).forEach((e) => { e.hidden = e.dataset.etapa !== etapa; });
  }
  function erroCampo(input, texto) {
    const span = document.getElementById("e-" + input.id);
    if (span) span.textContent = texto || "";
    if (texto) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
  }
  // Foca o primeiro campo/botão útil da etapa visível
  function focarEtapa(popup) {
    const etapa = $$(".popup-etapa", popup).find((e) => !e.hidden);
    const alvo = etapa && etapa.querySelector("input:not([type=hidden]), .opcao-acesso, .btn, a.link");
    if (alvo) alvo.focus();
  }
  function abrir(nome) {
    Object.entries(popups).forEach(([n, p]) => { if (n !== nome && n !== "confirmar" && p.open) p.close(); });
    atualizar(nome);
    popups[nome].abrir();
    focarEtapa(popups[nome]);
  }
  // "Voltar ao login": fecha e leva ao formulário de login (abre o cartão se estiver recolhido)
  function voltarAoLogin(popup, valorLogin) {
    popup.close();
    if (estado.nova.etapa === "concluido" && SD.logado()) { location.href = SD.urlPagina("sair"); return; }
    const form = $("#form-login");
    if (!form) return;
    if (form.hidden) $("#btn-abrir-login").click();
    const campo = $("#login-id");
    if (valorLogin) { campo.value = valorLogin; campo.dispatchEvent(new Event("input", { bubbles: true })); }
    (valorLogin ? $("#login-senha") : campo).focus();
  }
  // Botão de ver/ocultar senha (mesmo desenho do formulário de login)
  function ligarOlhos(raiz) {
    $$(".btn-olho[data-alvo]", raiz).forEach((b) => {
      const input = document.getElementById(b.dataset.alvo);
      const pintar = () => {
        const visivel = input.type === "text";
        b.innerHTML = visivel ? olhoRiscado : olhoAberto;
        b.setAttribute("aria-label", visivel ? "Ocultar senha" : "Mostrar senha");
        b.setAttribute("aria-pressed", String(visivel));
      };
      b.addEventListener("click", () => { input.type = input.type === "password" ? "text" : "password"; pintar(); });
      pintar();
    });
  }
  const olhoAberto = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const olhoRiscado = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

  /* ---------- 4. DESENHAR CADA POP-UP CONFORME O ESTADO ---------- */
  let relogio = null;
  function atualizar(nome) {
    if (nome === "senha") {
      const e = estado.senha, p = popups.senha;
      mostrarEtapa(p, e.etapa);
      $("[data-cancelar]", p).hidden = e.etapa === "email" && !$("#ps-email").value.trim();
      if (e.etapa === "enviado") {
        U.mostrarMensagem($("#msg-ps-enviado"), "sucesso", REC.MENSAGENS.ENVIADO);
        $("#ps-demo").hidden = !e.linkDemo;
        if (e.linkDemo) $("#ps-link-demo").href = e.linkDemo;
        contarEspera();
      }
    }
    if (nome === "nova") {
      const e = estado.nova, p = popups.nova;
      mostrarEtapa(p, e.etapa);
      $("[data-cancelar]", p).hidden = e.etapa === "concluido";
    }
    if (nome === "login") {
      const e = estado.login, p = popups.login;
      mostrarEtapa(p, e.etapa);
      $("#pl-resultado-documento").hidden = e.resultado !== "documento";
      $("#pl-resultado-email").hidden = e.resultado !== "email";
      $("[data-cancelar]", p).hidden = e.etapa === "escolha";
    }
  }

  // Contagem para poder pedir o link de novo
  function contarEspera() {
    clearInterval(relogio);
    const btn = $("#btn-ps-reenviar"), aviso = $("#ps-espera");
    const passo = () => {
      const falta = Math.ceil((estado.senha.liberaReenvioEm - Date.now()) / 1000);
      btn.disabled = falta > 0;
      aviso.textContent = falta > 0 ? `Você pode pedir de novo em ${falta} s.` : "";
      if (falta <= 0) clearInterval(relogio);
    };
    passo();
    relogio = setInterval(passo, 1000);
  }

  /* ---------- 5. FLUXO 1: ESQUECEU A SENHA? ---------- */
  async function pedirLink(origem) {
    const e = estado.senha;
    const input = $("#ps-email");
    const msg = origem === "reenviar" ? $("#msg-ps-reenviar") : $("#msg-ps-email");
    U.limparMensagem(msg);
    erroCampo(input, "");
    const email = (origem === "reenviar" ? e.email : input.value).trim().toLowerCase();
    if (!email) { erroCampo(input, "Informe o e-mail cadastrado."); input.focus(); return; }
    if (!U.emailValido(email)) { erroCampo(input, "E-mail inválido."); input.focus(); return; }
    if (Date.now() < e.liberaReenvioEm) return;

    const botao = origem === "reenviar" ? $("#btn-ps-reenviar") : $('#form-senha-email [type="submit"]');
    botao.disabled = true; botao.setAttribute("aria-busy", "true");
    const r = await REC.solicitarLink(email);
    botao.disabled = false; botao.removeAttribute("aria-busy");

    if (!r.ok) {
      U.mostrarMensagem(msg, "erro", r.mensagem);
      if (r.codigo === "LIMITE") { e.liberaReenvioEm = Date.now() + CONFIG.esperaReenvioSeg * 1000; if (e.etapa === "enviado") contarEspera(); }
      return;
    }
    // Resposta IGUAL para e-mail cadastrado ou não (não revela se a conta existe)
    e.email = email;
    e.etapa = "enviado";
    e.liberaReenvioEm = Date.now() + CONFIG.esperaReenvioSeg * 1000;
    e.linkDemo = r.linkDemonstracao || "";
    atualizar("senha");
    if (origem === "reenviar") U.mostrarMensagem(msg, "sucesso", "Pedido enviado de novo. Só o link mais recente funciona.");
    else $("#btn-ps-reenviar").focus();
  }

  function recomecarSenha() {
    estado.senha = { etapa: "email", email: "", liberaReenvioEm: estado.senha.liberaReenvioEm, linkDemo: "" };  // a espera continua valendo
    $("#form-senha-email").reset();
    erroCampo($("#ps-email"), "");
    [$("#msg-ps-email"), $("#msg-ps-reenviar")].forEach(U.limparMensagem);
    clearInterval(relogio);
    atualizar("senha");
  }

  /* ---------- 6. FLUXO 2: CRIAR NOVA SENHA (link do e-mail) ---------- */
  // O token vem no "#" do endereço (não vai para o servidor do site nem para outros sites)
  function lerTokenDoEndereco() {
    const m = location.hash.match(/(?:^#|&)redefinir=([A-Za-z0-9_-]{20,200})/);
    if (!m) return "";
    history.replaceState(null, "", location.pathname + location.search);   // tira o token da barra de endereço
    return m[1];
  }

  async function abrirLinkDeSenha(token) {
    estado.nova = { etapa: "verificando", token };
    abrir("nova");
    const r = await REC.validarLink(token);
    if (estado.nova.token !== token) return;                         // pedido antigo
    if (!r.ok) {
      estado.nova.etapa = "invalido";
      U.mostrarMensagem($("#msg-pn-invalido"), "erro", REC.MENSAGENS.LINK_INVALIDO);
    } else {
      estado.nova.etapa = "formulario";
    }
    atualizar("nova");
    if (popups.nova.open) focarEtapa(popups.nova);
  }

  async function salvarNovaSenha(ev) {
    ev.preventDefault();
    const s1 = $("#pn-senha"), s2 = $("#pn-senha2"), msg = $("#msg-pn");
    [s1, s2].forEach((i) => erroCampo(i, ""));
    U.limparMensagem(msg);
    const r = SENHA.avaliar(s1.value, { email: estado.senha.email });
    if (!s1.value) erroCampo(s1, "Informe a nova senha.");
    else if (!r.ok) erroCampo(s1, r.erros[0]);
    if (s1.value && s2.value !== s1.value) erroCampo(s2, "As senhas não conferem.");
    const comErro = [s1, s2].find((i) => i.getAttribute("aria-invalid"));
    if (comErro) { U.mostrarMensagem(msg, "erro", "Confira os campos destacados."); comErro.focus(); return; }

    const botao = $('#form-nova-senha [type="submit"]');
    botao.disabled = true; botao.setAttribute("aria-busy", "true");
    const resp = await REC.redefinirSenha(estado.nova.token, s1.value);
    botao.disabled = false; botao.removeAttribute("aria-busy");

    if (resp.ok) {
      $("#form-nova-senha").reset();                                 // a senha não fica na tela
      esconderSenhas();
      medidor.atualizar();
      estado.nova = { etapa: "concluido", token: "" };
      recomecarSenha();                                              // o pedido anterior acabou
      atualizar("nova");
      $('[data-voltar-login]', popups.nova).focus();
      return;
    }
    if (resp.codigo === "SENHA_IGUAL") { erroCampo(s1, SENHA.REGRA.textoIgualAnterior); s1.focus(); }
    if (resp.codigo === "LINK_INVALIDO") {
      estado.nova.etapa = "invalido";
      U.mostrarMensagem($("#msg-pn-invalido"), "erro", resp.mensagem);
      atualizar("nova");
      return;
    }
    U.mostrarMensagem(msg, "erro", resp.mensagem || "Não foi possível alterar a senha.");
  }

  // Esconde de novo as senhas que estavam visíveis (olho aberto)
  const esconderSenhas = () => $$('.btn-olho[aria-pressed="true"]', popups.nova).forEach((b) => b.click());

  function recomecarNova() {
    $("#form-nova-senha").reset();
    esconderSenhas();
    medidor.atualizar();
    [$("#pn-senha"), $("#pn-senha2")].forEach((i) => erroCampo(i, ""));
    U.limparMensagem($("#msg-pn"));
    estado.nova = { etapa: "verificando", token: "" };
  }

  /* ---------- 7. FLUXO 3: ESQUECEU O LOGIN? ---------- */
  function escolherOpcao(opcao) {
    estado.login.etapa = opcao;
    atualizar("login");
    focarEtapa(popups.login);
  }

  // A e B: confere só o FORMATO. A resposta é igual exista ou não a conta.
  function conferir(ev, tipo) {
    ev.preventDefault();
    const input = tipo === "documento" ? $("#pl-documento") : $("#pl-email");
    erroCampo(input, "");
    const permitido = tipo === "documento" ? ["cpf", "cnpj"] : ["email"];
    const r = ID.identificar(input.value, permitido);
    if (!input.value.trim()) { erroCampo(input, tipo === "documento" ? "Informe o CPF ou o CNPJ." : "Informe o e-mail."); input.focus(); return; }
    if (!r.valido) { erroCampo(input, tipo === "documento" ? "CPF ou CNPJ inválido. Confira os números." : "E-mail inválido."); input.focus(); return; }
    if (r.tipo !== "email") input.value = ID.formatar(r.tipo, r.valor);
    estado.login.resultado = tipo;
    atualizar("login");
    $(`[data-usar="${tipo}"]`, popups.login).focus();
  }

  function recomecarLogin() {
    ["#form-pl-documento", "#form-pl-email"].forEach((f) => $(f).reset());
    [$("#pl-documento"), $("#pl-email")].forEach((i) => erroCampo(i, ""));
    estado.login = { etapa: "escolha", resultado: "" };
    atualizar("login");
  }

  /* ---------- 8. CANCELAR SOLICITAÇÃO (com confirmação) ---------- */
  let cancelarDe = null;
  function pedirCancelamento(nome) {
    cancelarDe = nome;
    popups.confirmar.abrir();
  }
  function confirmarCancelamento() {
    const nome = cancelarDe;
    cancelarDe = null;
    popups.confirmar.close();
    if (nome === "senha") { recomecarSenha(); focarEtapa(popups.senha); }
    if (nome === "login") { recomecarLogin(); focarEtapa(popups.login); }
    if (nome === "nova") {                                         // volta ao início: pedir o link
      recomecarNova();
      recomecarSenha();
      popups.nova.close();
      abrir("senha");
    }
  }

  /* ---------- 9. LIGAR OS BOTÕES ---------- */
  let medidor = { atualizar() {} };
  function iniciar() {
    // Abrir: "Esqueceu a senha?" continua o link aberto, se houver; senão o pedido por e-mail
    $$("[data-recuperar]").forEach((b) => b.addEventListener("click", () => {
      if (b.dataset.recuperar === "login") return abrir("login");
      const novaEmAndamento = estado.nova.token && ["formulario", "invalido"].includes(estado.nova.etapa);
      abrir(novaEmAndamento ? "nova" : "senha");
    }));

    // Botões comuns dos 3 pop-ups
    Object.entries(popups).forEach(([nome, p]) => {
      if (nome === "confirmar") return;
      $$("[data-fechar]", p).forEach((b) => b.addEventListener("click", () => p.close()));
      $$("[data-voltar-login]", p).forEach((b) => b.addEventListener("click", () => voltarAoLogin(p)));
      $$("[data-cancelar]", p).forEach((b) => b.addEventListener("click", () => pedirCancelamento(nome)));
      // Ao fechar o pop-up de nova senha concluído, ele volta ao estado inicial
      p.addEventListener("close", () => { if (nome === "nova" && estado.nova.etapa === "concluido") recomecarNova(); });
    });

    // Confirmação
    $("#pc-sim").addEventListener("click", confirmarCancelamento);
    $("#pc-nao").addEventListener("click", () => popups.confirmar.close());
    popups.confirmar.addEventListener("close", () => { cancelarDe = null; });

    // Fluxo 1
    $("#form-senha-email").addEventListener("submit", (ev) => { ev.preventDefault(); pedirLink("pedir"); });
    $("#ps-email").addEventListener("input", () => { erroCampo($("#ps-email"), ""); atualizar("senha"); });
    $("#btn-ps-reenviar").addEventListener("click", () => pedirLink("reenviar"));
    // Demonstração: o link abre aqui mesmo (como se viesse do e-mail)
    $("#ps-link-demo").addEventListener("click", (ev) => {
      ev.preventDefault();
      const token = (estado.senha.linkDemo.split("#redefinir=")[1] || "");
      popups.senha.close();
      abrirLinkDeSenha(token);
    });

    // Fluxo 2
    $("#pn-dica").textContent = SENHA.DICA;
    medidor = SENHA.ligarMedidor($("#pn-senha"), $("#pn-medidor"), () => ({ email: estado.senha.email }));
    ligarOlhos(popups.nova);
    $("#form-nova-senha").addEventListener("submit", salvarNovaSenha);
    ["#pn-senha", "#pn-senha2"].forEach((s) => $(s).addEventListener("input", (e) => erroCampo(e.target, "")));
    $("#btn-pn-novo-link").addEventListener("click", () => { recomecarNova(); popups.nova.close(); abrir("senha"); });
    if (REC.ehDemonstracao()) {
      $("#pn-demo").hidden = false;
      $("#pn-senha-atual-demo").textContent = REC.senhaAtualDemonstracao;
    }

    // Fluxo 3
    $$(".opcao-acesso", popups.login).forEach((b) => b.addEventListener("click", () => escolherOpcao(b.dataset.opcao)));
    $$("[data-voltar-opcoes]", popups.login).forEach((b) => b.addEventListener("click", () => {
      estado.login.etapa = "escolha"; atualizar("login"); focarEtapa(popups.login);
    }));
    $("#form-pl-documento").addEventListener("submit", (ev) => conferir(ev, "documento"));
    $("#form-pl-email").addEventListener("submit", (ev) => conferir(ev, "email"));
    $("#pl-documento").addEventListener("input", (e) => {
      // Máscara: CPF (só números) ou CNPJ (aceita letras nas 12 primeiras posições)
      const v = e.target.value, bruto = U.normalizarCnpj(v);
      e.target.value = /[A-Z]/.test(bruto) || bruto.length > 11 ? U.formatarCnpj(v) : U.formatarCpf(v);
      erroCampo(e.target, "");
      if (estado.login.resultado === "documento") { estado.login.resultado = ""; atualizar("login"); }
    });
    $("#pl-email").addEventListener("input", (e) => {
      erroCampo(e.target, "");
      if (estado.login.resultado === "email") { estado.login.resultado = ""; atualizar("login"); }
    });
    $$("[data-usar]", popups.login).forEach((b) => b.addEventListener("click", () => {
      const valor = b.dataset.usar === "documento" ? $("#pl-documento").value : $("#pl-email").value.trim().toLowerCase();
      voltarAoLogin(popups.login, valor);
    }));
    $("[data-ir-senha]", popups.login).addEventListener("click", () => {
      if (!$("#ps-email").value) $("#ps-email").value = $("#pl-email").value.trim().toLowerCase();
      popups.login.close();
      abrir(estado.nova.token && estado.nova.etapa === "formulario" ? "nova" : "senha");
    });
    $$("[data-link-suporte]").forEach((a) => { a.href = CONFIG.urlSuporte; });

    // Chegou pelo link do e-mail? (também vale se o link for aberto com a página já aberta)
    const verificarLink = () => { const token = lerTokenDoEndereco(); if (token) abrirLinkDeSenha(token); };
    window.addEventListener("hashchange", verificarLink);
    verificarLink();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
