/* =====================================================================
   S.D — PÁGINA SUPORTE (suporte/suporte.js)
   Telas da página: botões Dúvidas/Sugestões, balões, popups, chat e e-mails.
   As respostas do chat vêm de assistente.js (window.SDAssistente).
   Seções: 1. e-mails (editar aqui) · 2. apoio · 3. popups · 4. balões
           5. assistente · 6. e-mails na tela · 7. início
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. E-MAILS (editar aqui; vazio = "E-mail em definição") ---------- */
  const EMAILS = {
    suporte:         "",   // dúvidas da plataforma (botão Dúvidas)
    sugestoes:       "",   // botão Sugestões + resumo do assistente
    desenvolvimento: "",   // equipe técnica
    reserva:         ""    // usado se os outros não responderem
  };
  // Cartões do fim da página (ordem de exibição)
  const CONTATOS = [
    { chave: "suporte",         titulo: "Suporte",         descricao: "Acesso e uso do site." },
    { chave: "sugestoes",       titulo: "Sugestões",       descricao: "Ideias de melhoria." },
    { chave: "desenvolvimento", titulo: "Desenvolvimento", descricao: "Erros e falhas técnicas." },
    { chave: "reserva",         titulo: "E-mail reserva",  descricao: "Se não houver retorno." }
  ];
  const ASSUNTOS = { duvidas: "[S.D] Dúvida sobre a plataforma", sugestoes: "[S.D] Sugestão de melhoria", resumo: "[S.D] Assistente — pedido de melhoria" };
  const DESTINO = { duvidas: "suporte", sugestoes: "sugestoes" };
  const MINIMO_CARACTERES = 10;
  const NOMES_TIPO = { "cliente-cpf": "Cliente CPF", "cliente-cnpj": "Cliente CNPJ", "prestador": "Prestador", "adm": "Administrador" };
  const BOAS_VINDAS = "Olá! Tire dúvidas sobre a plataforma, registre ideias ou faça cálculos rápidos (área, volume, %).";

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

  /* ---------- 3. POPUPS ---------- */
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

    return { abrirSugestoes: () => { const b = $("#sup-btn-sugestoes"); if (b.getAttribute("aria-expanded") !== "true") alternar(b); } };
  }

  /* ---------- 5. ASSISTENTE (chat) ---------- */
  function iniciarChat(baloes) {
    const A = window.SDAssistente;
    const log = $("#sup-chat-log");
    const form = $("#sup-chat-form");
    const campo = $("#sup-chat-texto");
    const btnEnviar = $(".sup-chat-enviar", form);
    if (!A) { log.textContent = "Assistente indisponível."; return; }

    campo.maxLength = A.config.limiteCaracteres;
    if (A.config.modo === "servidor" && A.config.endpoint) $("#sup-chat-selo").hidden = true;

    // 5.1 Mensagens na tela
    function adicionar(autor, texto, opcoes, ideia) {
      const div = document.createElement("div");
      div.className = "sup-msg " + (autor === "usuario" ? "sup-msg-usuario" : "sup-msg-bot");
      const quem = document.createElement("span");
      quem.className = "sup-msg-autor";
      quem.textContent = autor === "usuario" ? "Você" : "Assistente";
      div.append(quem, document.createTextNode(texto));
      if (opcoes && opcoes.length) {
        const caixa = document.createElement("div");
        caixa.className = "sup-msg-opcoes";
        opcoes.forEach((o) => {
          const b = document.createElement("button");
          b.type = "button";
          b.className = "btn btn-pequeno sup-redondo";
          b.textContent = o.texto;
          b.addEventListener("click", () => { caixa.remove(); acaoOpcao(o.acao, ideia); });
          caixa.append(b);
        });
        div.append(caixa);
      }
      log.append(div);
      colocarNaoResolveu();
      log.scrollTop = log.scrollHeight;
    }

    // 5.2 "Não resolveu?" sempre no fim da conversa (depois que o usuário escreveu)
    const btnNaoResolveu = document.createElement("button");
    btnNaoResolveu.type = "button";
    btnNaoResolveu.className = "btn btn-pequeno sup-redondo sup-nao-resolveu";
    btnNaoResolveu.textContent = "Não resolveu?";
    btnNaoResolveu.addEventListener("click", () => abrirAjuda());
    function colocarNaoResolveu() {
      if (A.totalUsuario() > 0 && log.lastElementChild && log.lastElementChild.classList.contains("sup-msg-bot")) log.append(btnNaoResolveu);
      else btnNaoResolveu.remove();
    }

    function acaoOpcao(acao, ideia) {
      if (acao === "guardar-ideia") {
        const alvo = $("#sup-texto-sugestoes");
        alvo.value = (alvo.value.trim() ? alvo.value.trim() + "\n\n" : "") + ideia;
        alvo.dispatchEvent(new Event("input"));
        baloes.abrirSugestoes();
        adicionar("bot", "Ideia guardada no campo “Sugestões”, acima. Revise e clique em “Enviar” quando quiser.");
        $("#sup-painel-sugestoes").scrollIntoView({ behavior: "smooth", block: "center" });
      } else {
        adicionar("bot", "Tudo bem. Posso ajudar em algo mais?");
      }
    }

    // 5.3 Limite interno (não aparece para o usuário)
    function limiteAtingido() {
      const esgotou = A.totalUsuario() >= A.config.limiteMensagens;
      campo.disabled = esgotou;
      btnEnviar.disabled = esgotou;
      return esgotou;
    }

    function limpar() {
      A.reiniciar();
      log.replaceChildren();
      adicionar("bot", BOAS_VINDAS);
      campo.value = "";
      ajustarAltura();
      limiteAtingido();
    }

    // 5.4 Campo de escrever cresce junto com o texto (sem barra de rolagem)
    function ajustarAltura() { campo.style.height = "auto"; campo.style.height = campo.scrollHeight + 2 + "px"; }
    campo.addEventListener("input", ajustarAltura);
    // Enter envia; Shift+Enter quebra linha
    campo.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); form.requestSubmit(); }
    });

    // 5.5 Enviar pergunta
    let ocupado = false;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const texto = campo.value.trim();
      if (!texto || ocupado || limiteAtingido()) return;
      ocupado = true;
      btnNaoResolveu.remove();
      adicionar("usuario", texto);
      campo.value = "";
      ajustarAltura();

      const digitando = document.createElement("div");
      digitando.className = "sup-digitando";
      digitando.textContent = "Assistente digitando…";
      log.append(digitando);
      log.scrollTop = log.scrollHeight;

      const r = await A.responder(texto);
      await new Promise((ok) => setTimeout(ok, 350));   // pequena pausa (leitura mais natural)
      digitando.remove();
      adicionar("bot", r.texto, r.opcoes, r.ideia);
      ocupado = false;

      if (limiteAtingido()) adicionar("bot", "Esta conversa chegou ao limite. Apague a conversa para começar outra ou use “Dúvidas” e “Sugestões”.");
      else campo.focus();
      if (r.tipo === "desconhecido") setTimeout(abrirAjuda, 400);   // não conseguiu ajudar → 2 saídas
    });

    // 5.6 Popup "Não consegui ajudar" (2 saídas)
    function abrirAjuda() {
      const dlg = $("#sup-dlg-ajuda");
      if (document.querySelector("dialog[open]")) return;
      dlg.addEventListener("close", () => {
        if (dlg.returnValue === "plataforma") abrirPlataforma();
        else if (dlg.returnValue === "externa") abrirPopup($("#sup-dlg-externa"));
        else campo.focus();
      }, { once: true });
      abrirPopup(dlg);
    }
    $("#sup-dlg-externa").addEventListener("close", () => campo.focus());

    // 5.7 Saída 1: Sobre a plataforma → [Enviar] / [Deletar]
    const dlgPlat = $("#sup-dlg-plataforma");
    const msgPlat = $("#sup-resumo-msg");
    const btnResumoEnviar = $("#sup-resumo-enviar");
    const btnResumoDeletar = $("#sup-resumo-deletar");
    let resumoAtual = null;
    function abrirPlataforma() {
      resumoAtual = A.resumir();
      $("#sup-resumo-quem").textContent = quemEhUsuario();
      $("#sup-resumo-texto").textContent = resumoAtual ? resumoAtual.resumo : "—";
      const vazio = !resumoAtual;
      btnResumoEnviar.disabled = vazio;   // não envia mensagem em branco
      btnResumoDeletar.disabled = vazio;
      if (vazio) mostrarMensagem(msgPlat, "atencao", "Ainda não há conversa. Escreva sua dúvida ao assistente antes de enviar.");
      else mostrarMensagem(msgPlat, "", "");
      abrirPopup(dlgPlat);
    }
    btnResumoEnviar.addEventListener("click", () => {
      if (!resumoAtual) return;
      if (!EMAILS.sugestoes) { mostrarMensagem(msgPlat, "atencao", "O e-mail da equipe ainda não foi definido. O envio será ativado em breve."); return; }
      // Mensagem completa para a equipe (o usuário vê só o resumo e quem envia)
      const corpo = [
        `QUEM ENVIOU: ${quemEhUsuario()}`,
        `DATA: ${new Date().toLocaleString("pt-BR")}`,
        "",
        `RESUMO DA CONVERSA: ${resumoAtual.resumo}`,
        "",
        `O QUE O CLIENTE PRECISA: ${resumoAtual.necessidade}`,
        "",
        `POSSÍVEL MELHORIA: ${resumoAtual.melhoria}`
      ].join("\n");
      abrirEmail(EMAILS.sugestoes, ASSUNTOS.resumo, corpo);
      mostrarMensagem(msgPlat, "info", "Seu aplicativo de e-mail foi aberto. Conclua o envio por lá.");
    });
    btnResumoDeletar.addEventListener("click", async () => {
      dlgPlat.close();
      const ok = await confirmar("Apagar conversa", "Toda a conversa com o assistente será apagada para começar outra. Deseja continuar?", "Apagar");
      if (ok) { limpar(); campo.focus(); } else abrirPopup(dlgPlat);
    });

    // 5.8 Lixeira do chat (lado esquerdo, só ícone)
    $("#sup-chat-limpar").addEventListener("click", async () => {
      if (!A.totalUsuario()) { campo.focus(); return; }
      const ok = await confirmar("Apagar conversa", "Toda a conversa com o assistente será apagada. Deseja continuar?", "Apagar");
      if (ok) limpar();
      campo.focus();
    });

    // 5.9 Alça: arrastar (dedo ou mouse) para aumentar/diminuir a conversa; setas no teclado
    const alca = $("#sup-chat-alca");
    const minimo = 160;
    const maximo = () => Math.round(window.innerHeight * 0.85);
    function definirAltura(px) {
      const h = Math.round(Math.min(Math.max(px, minimo), maximo()));
      log.style.height = h + "px";
      alca.setAttribute("aria-valuenow", String(h));
      alca.setAttribute("aria-valuemax", String(maximo()));
      alca.setAttribute("aria-valuetext", `Altura da conversa: ${h} pixels`);
    }
    alca.setAttribute("aria-valuemin", String(minimo));
    definirAltura(log.offsetHeight || 320);
    log.style.height = "";   // mantém a altura padrão do CSS até o usuário arrastar
    let inicioY = 0, inicioH = 0;
    alca.addEventListener("pointerdown", (e) => {
      inicioY = e.clientY; inicioH = log.offsetHeight;
      alca.setPointerCapture(e.pointerId);
      alca.classList.add("ativa");
      e.preventDefault();
    });
    alca.addEventListener("pointermove", (e) => {
      if (alca.hasPointerCapture(e.pointerId)) definirAltura(inicioH + (e.clientY - inicioY));
    });
    const soltar = (e) => { if (alca.hasPointerCapture(e.pointerId)) alca.releasePointerCapture(e.pointerId); alca.classList.remove("ativa"); };
    alca.addEventListener("pointerup", soltar);
    alca.addEventListener("pointercancel", soltar);
    alca.addEventListener("keydown", (e) => {
      const passos = { ArrowDown: 40, ArrowUp: -40, PageDown: 160, PageUp: -160 };
      if (e.key in passos) { e.preventDefault(); definirAltura(log.offsetHeight + passos[e.key]); }
      else if (e.key === "Home") { e.preventDefault(); definirAltura(minimo); }
      else if (e.key === "End") { e.preventDefault(); definirAltura(maximo()); }
    });

    limpar();
  }

  /* ---------- 6. E-MAILS NA TELA ---------- */
  function montarContatos() {
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

  /* ---------- 7. INÍCIO ---------- */
  function iniciar() {
    const baloes = iniciarBaloes();
    iniciarChat(baloes);
    montarContatos();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
