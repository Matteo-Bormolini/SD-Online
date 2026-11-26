/* =====================================================================
   S.D — PÁGINA SUPORTE (suporte/suporte.js)
   Telas da página: botões Dúvidas/Sugestões, balões, popup e e-mails.
   Perguntas frequentes e dicas: texto direto no index.html (<details> = sanfona).
   v0.8.7: assistente retirado (IA fica para depois do MVP, US40).
   Seções: 1. e-mails e prazo (editar aqui) · 2. apoio · 3. popup · 4. balões
           5. e-mails na tela · 6. início
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. E-MAILS E PRAZO (editar aqui; e-mail vazio = "E-mail em definição") ---------- */
  const EMAILS = {
    // 09/11/2026: por enquanto um e-mail só para tudo (definido pelo Matteo). Trocar aqui quando houver e-mails próprios.
    suporte:         "matteo.bormolini228@al.unieduk.com.br",   // dúvidas da plataforma (botão Dúvidas)
    sugestoes:       "matteo.bormolini228@al.unieduk.com.br",   // botão Sugestões
    desenvolvimento: "matteo.bormolini228@al.unieduk.com.br",   // equipe técnica
    reserva:         "matteo.bormolini228@al.unieduk.com.br"    // usado se os outros não responderem
  };
  // Cartões do fim da página (ordem de exibição)
  const CONTATOS = [
    { chave: "suporte",         titulo: "Suporte",         descricao: "Acesso e uso do site." },
    { chave: "sugestoes",       titulo: "Sugestões",       descricao: "Ideias de melhoria." },
    { chave: "desenvolvimento", titulo: "Desenvolvimento", descricao: "Erros e falhas técnicas." },
    { chave: "reserva",         titulo: "E-mail reserva",  descricao: "Se não houver retorno." }
  ];
  const ASSUNTOS = { duvidas: "[S.D] Dúvida sobre a plataforma", sugestoes: "[S.D] Sugestão de melhoria" };
  const PRAZO_RESPOSTA = "Respondemos em até 3 dias úteis.";                 // ← MUDE AQUI
  const DESTINO = { duvidas: "suporte", sugestoes: "sugestoes" };
  const MINIMO_CARACTERES = 10;
  const NOMES_TIPO = { "cliente-cpf": "Cliente CPF", "cliente-cnpj": "Cliente CNPJ", "prestador": "Prestador", "adm": "Administrador" };

  /* ---------- 2. APOIO ---------- */
  const $ = (s, el = document) => el.querySelector(s);
  // Rascunho guardado só nesta aba (sessionStorage); a página funciona sem ele
  const rascunho = {
    ler(chave) { try { return sessionStorage.getItem("sd-suporte-" + chave) || ""; } catch (e) { return ""; } },
    salvar(chave, valor) { try { sessionStorage.setItem("sd-suporte-" + chave, valor); } catch (e) { /* sem armazenamento */ } }
  };
  function mostrarMensagem(el, tipo, texto) { el.className = "mensagem " + tipo; el.textContent = texto; }
  // Abre o aplicativo de e-mail com assunto e texto preenchidos
  function abrirEmail(email, assunto, corpo) {
    location.href = `mailto:${email}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo.slice(0, 1800))}`;
  }
  // Quem está usando (o SERVIDOR preenche data-logado, data-tipo e data-nome no <body>)
  function quemEhUsuario() {
    const d = document.body.dataset;
    if (d.logado !== "sim") return "Visitante (sem login)";
    const tipo = NOMES_TIPO[d.tipo] || "Usuário";
    return d.nome ? `${d.nome} — ${tipo}` : tipo;
  }

  /* ---------- 3. POPUP DE CONFIRMAÇÃO ---------- */
  const temDialog = typeof HTMLDialogElement === "function";
  function abrirPopup(dlg) { dlg.returnValue = ""; if (temDialog && !dlg.open) dlg.showModal(); }

  // Confirmação genérica → Promise<true|false>
  function confirmar(titulo, texto, rotuloSim) {
    const dlg = $("#sup-dlg-confirmar");
    if (!temDialog) return Promise.resolve(window.confirm(texto));
    $("#sup-dlg-confirmar-titulo").textContent = titulo;
    $("#sup-dlg-confirmar-texto").textContent = texto;
    $("#sup-dlg-confirmar-sim").textContent = rotuloSim;
    return new Promise((resolver) => {
      dlg.addEventListener("close", () => resolver(dlg.returnValue === "sim"), { once: true });
      abrirPopup(dlg);
    });
  }

  /* ---------- 4. BALÕES DÚVIDAS / SUGESTÕES ---------- */
  function iniciarBaloes() {
    const botoes = document.querySelectorAll(".sup-aba");

    function definir(btn, aberto) {
      btn.setAttribute("aria-expanded", String(aberto));
      document.getElementById(btn.getAttribute("aria-controls")).classList.toggle("aberto", aberto);
    }
    // Abre um balão e fecha o outro (o texto dos dois continua guardado)
    function alternar(btn) {
      const abrir = btn.getAttribute("aria-expanded") !== "true";
      botoes.forEach((b) => definir(b, b === btn ? abrir : false));
      if (abrir) document.getElementById(btn.getAttribute("aria-controls")).querySelector("textarea").focus({ preventScroll: true });
    }
    botoes.forEach((btn) => btn.addEventListener("click", () => alternar(btn)));

    document.querySelectorAll(".sup-painel").forEach((painel) => {
      const tipo = painel.dataset.tipo;
      const form = $("form", painel);
      const campo = $("textarea", painel);
      const contador = $(".sup-contador", painel);
      const msg = $(".mensagem", painel);
      const atualizar = () => { contador.textContent = `${campo.value.length}/${campo.maxLength}`; rascunho.salvar(tipo, campo.value); };

      campo.value = rascunho.ler(tipo);
      contador.textContent = `${campo.value.length}/${campo.maxLength}`;
      campo.addEventListener("input", () => { atualizar(); if (msg.textContent) mostrarMensagem(msg, "", ""); });

      // Lixeira → popup de confirmação
      $('[data-acao="excluir"]', painel).addEventListener("click", async () => {
        if (!campo.value.trim()) { mostrarMensagem(msg, "info", "O campo já está vazio."); return; }
        const nome = tipo === "duvidas" ? "da dúvida" : "da sugestão";
        const ok = await confirmar("Excluir texto", `Deseja excluir todo o texto ${nome}? Esta ação não pode ser desfeita.`, "Excluir");
        if (ok) { campo.value = ""; atualizar(); mostrarMensagem(msg, "sucesso", "Texto excluído."); }
        campo.focus();
      });

      // Enviar
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const texto = campo.value.trim();
        if (texto.length < MINIMO_CARACTERES) {
          mostrarMensagem(msg, "erro", `Escreva pelo menos ${MINIMO_CARACTERES} caracteres.`);
          campo.focus();
          return;
        }
        const email = EMAILS[DESTINO[tipo]];
        if (!email) { mostrarMensagem(msg, "atencao", "O envio ainda está sendo configurado. Seu texto continua salvo aqui."); return; }
        abrirEmail(email, ASSUNTOS[tipo], `Enviado por: ${quemEhUsuario()}\n\n${texto}`);
        mostrarMensagem(msg, "info", "Seu aplicativo de e-mail foi aberto com o texto. Conclua o envio por lá.");
      });
    });
  }

  /* ---------- 5. E-MAILS E PRAZO NA TELA ---------- */
  function montarContatos() {
    $("#sup-prazo").textContent = PRAZO_RESPOSTA;
    $("#sup-contatos").replaceChildren(...CONTATOS.map((c) => {
      const li = document.createElement("li");
      li.className = "sup-contato";
      const h = document.createElement("h3"); h.textContent = c.titulo;
      const p = document.createElement("p"); p.textContent = c.descricao;
      const email = EMAILS[c.chave];
      let fim;
      if (email) { fim = document.createElement("a"); fim.className = "link"; fim.href = "mailto:" + email; fim.textContent = email; }
      else { fim = document.createElement("span"); fim.className = "sup-em-breve"; fim.textContent = "E-mail em definição"; }
      li.append(h, p, fim);
      return li;
    }));
  }

  /* ---------- 6. INÍCIO ---------- */
  function iniciar() {
    iniciarBaloes();
    montarContatos();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
