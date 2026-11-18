/* =====================================================================
   S.D — TELAS DO PEDIDO (componentes/pedidos/pedidos.js) · v0.8.0
   Carregado sozinho por firebase/pedidos.js para quem tem conta completa.
   Fluxo "Contato registrado" (aprovado em 18/11/2026):

   CLIENTE
     chamarWhatsApp()   aviso de cobrança (visita/taxa extra) antes de abrir o WhatsApp
                        + registra o contato (1 registro mínimo) e avisa o prestador.
     pedirContato()     prestador com contatos escondidos: descrição + fotos (opcionais*).
     renderizarEmOrcamento()  bloco "Em orçamento" em Serviços (perfil do cliente):
                        um bloco por pedido, um cartão por prestador, "Fechei com este".
     realizados()       lista para "Serviços realizados" (serviços confirmados).
   PRESTADOR
     perguntarPendentes()  janela "Você fez orçamento para …?" ao entrar no site.
     abrirOrcamento()   formulário do orçamento (informativo).
     paraKanban()       cartões do quadro (componentes/kanban-servicos).

   * US13: fotos OPCIONAIS enquanto não houver Storage pago (REGRAS.fotosPedidoObrigatorias).
   Dados: firebase/pedidos.js (window.SDPedidosDados). Sem dinheiro no site:
   tudo aqui é INFORMATIVO; valores e pagamento são combinados entre as partes.
   ===================================================================== */
(function () {
  "use strict";
  const D = window.SDPedidosDados, SD = window.SD;
  if (!D || !SD) { console.error("[S.D] pedidos.js: firebase/pedidos.js e configuracoes/config.js são necessários."); return; }
  const S = D.SITUACAO;
  const esc = SD.esc;

  /* ---------- 1. TEXTOS ← MUDE AQUI ---------- */
  const TEXTO = {
    semNegociacao: "Valores, materiais e forma de pagamento são combinados direto com o prestador. A S.D não participa da negociação nem do pagamento.",
    lgpdContato: (nome) => `Para registrar o contato, ${nome} verá no painel dele: seu primeiro nome (ou o nome da empresa), sua região e o serviço. Nada de telefone, CPF ou CNPJ.`,
    visitaSim: (v) => `Visita técnica: ${moeda(v)} (cobrada pelo prestador).`,
    visitaNao: "Este prestador não cobra visita técnica.",
    visitaNaoInformada: "O prestador não informou se cobra visita técnica. Pergunte antes de agendar.",
    registrado: "Contato registrado. Quando o prestador enviar o orçamento, ele aparece no seu perfil, em Serviços.",
    pedidoEnviado: "Pedido enviado. Quando o prestador responder, o orçamento e o WhatsApp dele aparecem no seu perfil, em Serviços.",
    orcamentoInformativo: "Este orçamento é um resumo informativo para você e o cliente. Valores e condições finais são combinados direto entre vocês.",
    semResposta: "Sem resposta há mais de 10 dias. Se ainda não conversaram, chame de novo ou procure outro prestador.",
    emailNaoConfirmado: "Confirme seu e-mail para chamar prestadores pelo site (veja o aviso no topo da página)."
  };
  const SITUACAO_TEXTO = {
    [S.contato]: "Aguardando orçamento", [S.orcado]: "Orçou", [S.naoOrcou]: "Não vai orçar", [S.expirado]: "Sem resposta",
    [S.escolhido]: "Em andamento", [S.naoEscolhido]: "Não escolhido", [S.cancelado]: "Cancelado",
    [S.encerrado]: "Encerrado pelo prestador", [S.concluido]: "Concluído pelo prestador", [S.prestado]: "Realizado"
  };
  const MATERIAIS = { "": "Não informado", prestador: "Prestador fornece", cliente: "Cliente fornece", ambos: "Os dois" };

  /* ---------- 2. APOIO ---------- */
  const moeda = (v) => Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const dataBR = (t) => { const m = D.ms(t); return m ? new Date(m).toLocaleDateString("pt-BR") : "—"; };
  const isoBR = (iso) => (iso ? iso.split("-").reverse().join("/") : "—");
  const somarDias = (t, dias) => (D.ms(t) ? D.ms(t) + dias * 864e5 : 0);
  const soDigitos = (v) => String(v || "").replace(/\D/g, "");
  const linkWhats = (num, nome) => `https://wa.me/55${soDigitos(num)}?text=${encodeURIComponent(`Olá! Encontrei ${nome ? nome + " " : "vocês "}na S.D Serviços Digitais e gostaria de falar sobre um serviço.`)}`;
  const urlPerfilPrestador = (id, categoria) => `${SD.urlPagina("perfilPrestador")}?visao=cliente&id=${encodeURIComponent(id)}${categoria ? "&categoria=" + encodeURIComponent(categoria) : ""}`;
  const ICONE_ZAP = SD.icones && SD.icones.whatsapp ? SD.icones.whatsapp : "";

  // Aviso curto no canto da tela (some sozinho)
  function avisoRapido(texto, tipo = "sucesso") {
    let caixa = document.getElementById("pd-aviso-rapido");
    if (!caixa) {
      caixa = document.createElement("div");
      caixa.id = "pd-aviso-rapido";
      caixa.setAttribute("role", "status");
      caixa.setAttribute("aria-live", "polite");
      document.body.append(caixa);
    }
    caixa.className = `pd-aviso-rapido mensagem ${tipo}`;
    caixa.textContent = texto;
    caixa.hidden = false;
    clearTimeout(caixa._t);
    caixa._t = setTimeout(() => { caixa.hidden = true; }, 7000);
  }
  const erroTexto = (e) => (e && e.code === "EMAIL_NAO_CONFIRMADO" ? TEXTO.emailNaoConfirmado : D.mensagemErro(e));

  /* ---------- 3. JANELA (pop-up padrão do site: <dialog class="modal">) ----------
     acoes: [{ texto, valor, principal, perigo }] · aoClicar(valor, dialogo) roda DENTRO do
     clique (necessário para abrir o WhatsApp sem o navegador bloquear). Devolve o valor (ou null). */
  function janela({ titulo, corpo, acoes, classe = "", aoAbrir, aoClicar, rotulo }) {
    return new Promise((resolver) => {
      const d = document.createElement("dialog");
      d.className = `modal modal-largo pd-janela ${classe}`;
      d.setAttribute("aria-labelledby", "pd-janela-titulo");
      d.innerHTML = `
        <h2 id="pd-janela-titulo">${esc(titulo)}</h2>
        <div class="pd-janela-corpo">${corpo || ""}</div>
        <div class="modal-acoes">${acoes.map((a, i) => `<button type="button" class="btn${a.principal ? " pd-btn-principal" : ""}${a.perigo ? " pd-btn-perigo" : ""}" data-i="${i}">${esc(a.texto)}</button>`).join("")}</div>`;
      if (rotulo) d.setAttribute("aria-label", rotulo);
      document.body.append(d);
      let valor = null;
      const fechar = (v) => { valor = v; d.close(); };
      d.addEventListener("close", () => { d.remove(); resolver(valor); });
      d.querySelectorAll(".modal-acoes .btn").forEach((b) => b.addEventListener("click", async () => {
        const a = acoes[Number(b.dataset.i)];
        if (aoClicar) {
          const continuar = await aoClicar(a.valor, d, b);
          if (continuar === false) return;                   // ex.: formulário com erro
        }
        fechar(a.valor);
      }));
      // Clique fora (no fundo escuro) fecha = cancelar
      d.addEventListener("click", (e) => {
        if (e.target !== d) return;
        const r = d.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) fechar(null);
      });
      d.showModal();
      if (aoAbrir) aoAbrir(d);
    });
  }
  const confirmar = (o) => (window.SDConfirmar ? window.SDConfirmar(o)
    : janela({ titulo: o.titulo, corpo: `<p>${esc(o.texto || "")}</p>`, acoes: [{ texto: "Cancelar", valor: false }, { texto: o.sim || "Confirmar", valor: true, principal: true }] }).then((v) => v === true));

  /* ---------- 4. CLIENTE: AVISO DE COBRANÇA + WHATSAPP ----------
     prestador = { id, nome, cobraVisita, valorVisita, secundarias, whatsapp } */
  function textoCobranca(p) {
    const visita = p.cobraVisita === true ? TEXTO.visitaSim(p.valorVisita) : p.cobraVisita === false ? TEXTO.visitaNao : TEXTO.visitaNaoInformada;
    return `
      <ul class="pd-cobranca">
        <li><strong>${esc(visita)}</strong></li>
        ${p.secundarias ? `<li>${esc(SD.config.avisoSecundarias)}</li>` : ""}
        <li>${esc(TEXTO.semNegociacao)}</li>
      </ul>`;
  }
  // Texto curto da visita (cartões e perfil)
  const resumoVisita = (p) => (p.cobraVisita === true ? `Visita técnica: ${moeda(p.valorVisita)}` : p.cobraVisita === false ? "Não cobra visita técnica" : "Visita técnica: não informado");

  async function registrar(dados, extra = {}) {
    try {
      const r = await D.registrarContato({ prestador: dados.prestador, categoria: dados.categoria, servicoNome: dados.servicoNome, ...extra });
      if (r.novo || r.avisou) avisoRapido(extra.origem === "pedido" ? TEXTO.pedidoEnviado : TEXTO.registrado);
      return r;
    } catch (e) {
      console.warn("[S.D] Contato não registrado:", e.code || e);
      avisoRapido("O contato não foi registrado no site: " + erroTexto(e), "atencao");
      return null;
    }
  }

  /* Use no clique do botão/link do WhatsApp:
       link.addEventListener("click", (e) => SDPedidos.chamarWhatsApp(e, { prestador, categoria, servicoNome, link: link.href }));
     Contato recente (menos de 7 dias): abre direto (sem repetir o aviso) e só atualiza a data. */
  function chamarWhatsApp(evento, dados) {
    if (evento) evento.preventDefault();
    const abrir = () => window.open(dados.link, "_blank", "noopener,noreferrer");
    if (D.contatoRecente(dados.prestador.id, dados.categoria)) { abrir(); registrar(dados); return Promise.resolve(true); }
    return janela({
      titulo: `Antes de chamar ${dados.prestador.nome}`,
      corpo: `${textoCobranca(dados.prestador)}<p class="pd-nota">${esc(TEXTO.lgpdContato(dados.prestador.nome))}</p>`,
      acoes: [{ texto: "Voltar", valor: false }, { texto: "Entendi, abrir WhatsApp", valor: true, principal: true }],
      aoClicar: (v) => { if (v) abrir(); }                       // abre DENTRO do clique
    }).then((ok) => { if (ok) registrar(dados); return !!ok; });
  }

  /* "Pedir contato": prestador com os contatos escondidos */
  function pedirContato(dados) {
    const R = D.REGRAS;
    const obrig = R.fotosPedidoObrigatorias;
    let arquivos = [];
    const corpo = `
      ${textoCobranca(dados.prestador)}
      <div class="pd-campo">
        <label for="pd-mensagem">O que você precisa? <span class="pd-obrig" aria-hidden="true">*</span></label>
        <textarea id="pd-mensagem" rows="4" maxlength="${R.maxMensagem}" required aria-describedby="pd-mensagem-dica pd-mensagem-erro"
          placeholder="Ex.: Infiltração na parede do banheiro do 2º andar, mancha de 1 m. Preciso de orçamento nesta semana."></textarea>
        <span class="pd-dica" id="pd-mensagem-dica">Descreva o serviço, o local e a urgência (mínimo 10 caracteres).</span>
        <span class="pd-erro" id="pd-mensagem-erro"></span>
      </div>
      <div class="pd-campo">
        <label for="pd-fotos">Fotos do local ${obrig ? `(mínimo ${R.minFotosPedido})` : "(opcional)"}</label>
        <input type="file" id="pd-fotos" accept="image/jpeg,image/png,image/webp" multiple aria-describedby="pd-fotos-dica pd-fotos-erro">
        <span class="pd-dica" id="pd-fotos-dica">Até ${R.maxFotosPedido} fotos, de ângulos diferentes. Elas são reduzidas antes de enviar.</span>
        <span class="pd-erro" id="pd-fotos-erro"></span>
        <ul class="pd-miniaturas" id="pd-miniaturas" aria-label="Fotos escolhidas"></ul>
      </div>
      <p class="pd-nota">${esc(TEXTO.lgpdContato(dados.prestador.nome))}</p>`;
    return janela({
      titulo: `Pedir contato a ${dados.prestador.nome}`,
      corpo,
      acoes: [{ texto: "Cancelar", valor: false }, { texto: "Enviar pedido", valor: true, principal: true }],
      aoAbrir: (d) => {
        const input = d.querySelector("#pd-fotos"), lista = d.querySelector("#pd-miniaturas");
        input.addEventListener("change", () => {
          arquivos = [...arquivos, ...input.files].filter((f) => /^image\/(jpeg|png|webp)$/.test(f.type)).slice(0, R.maxFotosPedido);
          input.value = "";
          lista.innerHTML = "";
          arquivos.forEach((f, i) => {
            const li = document.createElement("li");
            const img = document.createElement("img"); img.alt = `Foto ${i + 1}`; img.src = URL.createObjectURL(f); img.onload = () => URL.revokeObjectURL(img.src);
            const tirar = document.createElement("button"); tirar.type = "button"; tirar.className = "pd-tirar"; tirar.textContent = "×";
            tirar.setAttribute("aria-label", `Tirar a foto ${i + 1}`);
            tirar.addEventListener("click", () => { arquivos.splice(i, 1); input.dispatchEvent(new Event("change")); });
            li.append(img, tirar); lista.append(li);
          });
        });
      },
      aoClicar: async (v, d, botao) => {
        if (!v) return true;
        const msg = d.querySelector("#pd-mensagem"), em = d.querySelector("#pd-mensagem-erro"), ef = d.querySelector("#pd-fotos-erro");
        em.textContent = ""; ef.textContent = "";
        const texto = msg.value.trim();
        if (texto.length < 10) { em.textContent = "Escreva pelo menos 10 caracteres."; msg.focus(); return false; }
        if (obrig && arquivos.length < R.minFotosPedido) { ef.textContent = `Envie pelo menos ${R.minFotosPedido} fotos.`; return false; }
        botao.disabled = true; botao.textContent = "Enviando…";
        const r = await registrar(dados, { origem: "pedido", mensagem: texto, arquivos });
        botao.disabled = false; botao.textContent = "Enviar pedido";
        return !!r;
      }
    }).then((v) => !!v);
  }

  /* ---------- 5. PRESTADOR: FORMULÁRIO DO ORÇAMENTO ---------- */
  async function abrirOrcamento(o) {
    const eu = window.SDFirebase ? await window.SDFirebase.meusDados().catch(() => null) : null;
    const a = o.orcamento || {
      cobraVisita: eu && typeof eu.cobraVisita === "boolean" ? eu.cobraVisita : false,
      valorVisita: eu && eu.valorVisita ? eu.valorVisita : "", validadeDias: 15
    };
    const v = (c) => (a[c] === undefined || a[c] === null || a[c] === 0 && !["valorTotal"].includes(c) ? "" : esc(String(a[c])));
    const campo = (id, rotulo, html, { obrig = false, dica = "", largo = false } = {}) => `
      <div class="pd-campo${largo ? " pd-largo" : ""}">
        <label for="${id}">${rotulo}${obrig ? ' <span class="pd-obrig" aria-hidden="true">*</span>' : ""}</label>
        ${html}
        ${dica ? `<span class="pd-dica">${dica}</span>` : ""}
        <span class="pd-erro" id="${id}-erro"></span>
      </div>`;
    const dinheiro = (id, c) => `<input type="number" id="${id}" min="0" step="0.01" inputmode="decimal" value="${v(c)}" placeholder="0,00">`;
    const inteiro = (id, c, max) => `<input type="number" id="${id}" min="0" max="${max}" step="1" inputmode="numeric" value="${v(c)}">`;
    const corpo = `
      <p class="pd-sub">${esc(o.servico)} · ${esc(o.clienteNome)} (${o.clienteTipo === "cnpj" ? "CNPJ" : "CPF"})${o.clienteRegiao ? " · " + esc(o.clienteRegiao) : ""}</p>
      ${o.mensagem ? `<blockquote class="pd-mensagem-cliente"><strong>Pedido do cliente:</strong> ${esc(o.mensagem)}</blockquote>` : ""}
      <form class="pd-form" id="pd-form-orcamento" novalidate>
        ${campo("po-descricao", "Descrição do serviço", `<textarea id="po-descricao" rows="3" maxlength="300" required>${esc(a.descricao || "")}</textarea>`, { obrig: true, largo: true, dica: "O que será feito (até 300 caracteres)." })}
        ${campo("po-total", "Valor total (R$)", dinheiro("po-total", "valorTotal"), { obrig: true })}
        ${campo("po-validade", "Validade do orçamento (dias)", inteiro("po-validade", "validadeDias", 365), { obrig: true })}
        <div class="pd-campo pd-largo pd-check">
          <input type="checkbox" id="po-cobra-visita" ${a.cobraVisita ? "checked" : ""}>
          <label for="po-cobra-visita">Cobro visita técnica</label>
        </div>
        ${campo("po-valor-visita", "Valor da visita (R$)", dinheiro("po-valor-visita", "valorVisita"))}
        ${campo("po-visitas", "Visitas necessárias", inteiro("po-visitas", "visitas", 100))}
        ${campo("po-materiais-por", "Materiais", `<select id="po-materiais-por">${Object.entries(MATERIAIS).map(([k, t]) => `<option value="${k}"${(a.materiaisPor || "") === k ? " selected" : ""}>${t}</option>`).join("")}</select>`)}
        ${campo("po-valor-materiais", "Valor dos materiais (R$)", dinheiro("po-valor-materiais", "valorMateriais"))}
        ${campo("po-mao-de-obra", "Mão de obra (R$)", dinheiro("po-mao-de-obra", "valorMaoDeObra"))}
        ${campo("po-funcionarios", "Funcionários necessários", inteiro("po-funcionarios", "funcionarios", 500))}
        ${campo("po-inicio", "Início previsto", `<input type="date" id="po-inicio" value="${esc(a.inicioPrevisto || "")}">`)}
        ${campo("po-duracao", "Duração (dias)", inteiro("po-duracao", "duracaoDias", 3650))}
        ${campo("po-observacao", "Observações", `<textarea id="po-observacao" rows="3" maxlength="500">${esc(a.observacao || "")}</textarea>`, { largo: true, dica: "Ex.: garantia, condições, o que não está incluso." })}
      </form>
      <p class="pd-nota">${esc(TEXTO.orcamentoInformativo)}${o.origem === "pedido" ? " Seu WhatsApp principal vai junto, para o cliente falar com você." : ""}</p>`;
    return janela({
      titulo: o.orcamento ? "Editar orçamento" : "Orçamento",
      corpo,
      classe: "pd-janela-form",
      acoes: [{ texto: "Cancelar", valor: false }, { texto: "Salvar orçamento", valor: true, principal: true }],
      aoAbrir: (d) => {
        const caixa = d.querySelector("#po-cobra-visita"), valor = d.querySelector("#po-valor-visita");
        const sinc = () => { valor.disabled = !caixa.checked; if (!caixa.checked) valor.value = ""; };
        caixa.addEventListener("change", sinc); sinc();
        d.querySelector("#po-descricao").focus();
      },
      aoClicar: async (ok, d, botao) => {
        if (!ok) return true;
        const val = (id) => d.querySelector("#" + id).value.trim();
        const erro = (id, t) => { d.querySelector(`#${id}-erro`).textContent = t; };
        d.querySelectorAll(".pd-erro").forEach((e) => { e.textContent = ""; });
        const dados = {
          descricao: val("po-descricao"), valorTotal: val("po-total"), validadeDias: val("po-validade"),
          cobraVisita: d.querySelector("#po-cobra-visita").checked, valorVisita: val("po-valor-visita"),
          visitas: val("po-visitas"), materiaisPor: val("po-materiais-por"), valorMateriais: val("po-valor-materiais"),
          valorMaoDeObra: val("po-mao-de-obra"), funcionarios: val("po-funcionarios"), inicioPrevisto: val("po-inicio"),
          duracaoDias: val("po-duracao"), observacao: val("po-observacao")
        };
        let primeiro = null;
        const marcar = (id, t) => { erro(id, t); if (!primeiro) primeiro = id; };
        if (dados.descricao.length < 3) marcar("po-descricao", "Descreva o serviço.");
        if (!(Number(dados.valorTotal) > 0)) marcar("po-total", "Informe o valor total.");
        if (!(parseInt(dados.validadeDias, 10) >= 1)) marcar("po-validade", "Informe a validade (1 a 365 dias).");
        if (dados.cobraVisita && !(Number(dados.valorVisita) > 0)) marcar("po-valor-visita", "Informe o valor da visita.");
        ["po-valor-visita", "po-valor-materiais", "po-mao-de-obra", "po-visitas", "po-funcionarios", "po-duracao"].forEach((id) => {
          if (val(id) && Number(val(id)) < 0) marcar(id, "Use um número positivo.");
        });
        if (primeiro) { d.querySelector("#" + primeiro).focus(); return false; }
        botao.disabled = true; botao.textContent = "Salvando…";
        try {
          await D.salvarOrcamento(o.id, dados);
          avisoRapido("Orçamento salvo. O cliente foi avisado.");
          return true;
        } catch (e) {
          botao.disabled = false; botao.textContent = "Salvar orçamento";
          marcar("po-observacao", "Não foi salvo: " + D.mensagemErro(e));
          return false;
        }
      }
    }).then((v) => !!v);
  }

  // Tabela do orçamento (cliente e prestador)
  function tabelaOrcamento(o) {
    const a = o.orcamento;
    if (!a) return `<p class="pd-nota">O prestador ainda não registrou o orçamento no site.</p>`;
    const validoAte = somarDias(o.respondidoEm || o.atualizadoEm, a.validadeDias);
    const linhas = [
      ["Serviço", esc(a.descricao)],
      ["Valor total", `<strong>${moeda(a.valorTotal)}</strong>`],
      ["Visita técnica", a.cobraVisita ? moeda(a.valorVisita) : "Não cobra"],
      a.visitas ? ["Visitas necessárias", a.visitas] : null,
      ["Materiais", esc(MATERIAIS[a.materiaisPor || ""]) + (a.valorMateriais ? ` · ${moeda(a.valorMateriais)}` : "")],
      a.valorMaoDeObra ? ["Mão de obra", moeda(a.valorMaoDeObra)] : null,
      a.funcionarios ? ["Funcionários", a.funcionarios] : null,
      a.inicioPrevisto ? ["Início previsto", isoBR(a.inicioPrevisto)] : null,
      a.duracaoDias ? ["Duração", `${a.duracaoDias} ${a.duracaoDias === 1 ? "dia" : "dias"}`] : null,
      ["Válido até", validoAte ? new Date(validoAte).toLocaleDateString("pt-BR") : "—"],
      a.observacao ? ["Observações", esc(a.observacao)] : null
    ].filter(Boolean);
    return `<table class="pd-tabela"><tbody>${linhas.map(([r, t]) => `<tr><th scope="row">${r}</th><td>${t}</td></tr>`).join("")}</tbody></table>`;
  }
  function verOrcamento(o) {
    return janela({
      titulo: `Orçamento de ${o.prestadorNome}`,
      corpo: `<p class="pd-sub">${esc(o.servico)}</p>${tabelaOrcamento(o)}<p class="pd-nota">${esc(TEXTO.semNegociacao)}</p>`,
      acoes: [{ texto: "Fechar", valor: true, principal: true }]
    });
  }

  /* ---------- 6. PRESTADOR: "VOCÊ FEZ ORÇAMENTO?" AO ENTRAR NO SITE ----------
     "Responder depois" não pergunta de novo nesta visita (fecha a aba = pergunta de novo). */
  const CHAVE_ADIADOS = "sd-pendentes-adiados";
  const adiados = () => { try { return JSON.parse(sessionStorage.getItem(CHAVE_ADIADOS) || "[]"); } catch (_) { return []; } };
  const adiar = (id) => { try { sessionStorage.setItem(CHAVE_ADIADOS, JSON.stringify([...new Set([...adiados(), id])])); } catch (_) { /* sem armazenamento */ } };
  let perguntando = false;

  async function fotosDoPedido(o, alvo) {
    if (!o.fotos || !o.fotos.length || !window.SDFotos) return;
    alvo.innerHTML = o.fotos.map((_, i) => `<li><span class="pd-carregando-foto">Foto ${i + 1}…</span></li>`).join("");
    const itens = alvo.querySelectorAll("li");
    await Promise.all(o.fotos.map(async (id, i) => {
      try {
        const src = await window.SDFotos.ler(id);
        if (!src) return;
        const a = document.createElement("a"); a.href = src; a.target = "_blank"; a.rel = "noopener";
        const img = document.createElement("img"); img.src = src; img.alt = `Foto ${i + 1} enviada pelo cliente`;
        a.append(img); itens[i].replaceChildren(a);
      } catch (_) { itens[i].textContent = "Foto indisponível"; }
    }));
  }

  async function perguntarPendentes() {
    if (perguntando || D.papel() !== "prestador") return;
    perguntando = true;
    try {
      const pendentes = D.lista()
        .filter((o) => o.situacao === S.contato && !adiados().includes(o.id))
        .sort((a, b) => D.ms(a.contatoEm) - D.ms(b.contatoEm));
      for (const o of pendentes.slice(0, 5)) {
        const pedido = o.origem === "pedido";
        const prazo = somarDias(o.contatoEm, D.REGRAS.diasParaResponder);
        const resposta = await janela({
          titulo: pedido ? `Novo pedido de ${o.clienteNome}: vai orçar?` : `Você fez orçamento para ${o.clienteNome}?`,
          corpo: `
            <p class="pd-sub">${esc(o.servico || "Serviço")} · ${o.clienteTipo === "cnpj" ? "Pessoa jurídica" : "Pessoa física"}${o.clienteRegiao ? " · " + esc(o.clienteRegiao) : ""}</p>
            <p>${pedido ? "Pedido feito pelo site" : "Chamou você pelo WhatsApp"} em ${dataBR(o.contatoEm)}. Responda até <strong>${prazo ? new Date(prazo).toLocaleDateString("pt-BR") : "—"}</strong>.</p>
            ${o.mensagem ? `<blockquote class="pd-mensagem-cliente">${esc(o.mensagem)}</blockquote>` : ""}
            <ul class="pd-miniaturas pd-miniaturas-ver" id="pd-fotos-pedido"></ul>
            <p class="pd-nota">${pedido ? "Se for orçar, preencha o orçamento: seu WhatsApp é enviado ao cliente junto com ele." : "Sim: você preenche um resumo do orçamento, que vai para o seu quadro e para o cliente."}</p>`,
          acoes: [
            { texto: "Responder depois", valor: "depois" },
            { texto: pedido ? "Não vou orçar" : "Não fiz", valor: "nao", perigo: true },
            { texto: pedido ? "Sim, fazer orçamento" : "Sim, preencher orçamento", valor: "sim", principal: true }
          ],
          aoAbrir: (d) => fotosDoPedido(o, d.querySelector("#pd-fotos-pedido"))
        });
        if (resposta === "nao") {
          try { await D.responderNao(o.id); avisoRapido("Respondido. O pedido foi para Encerrados."); }
          catch (e) { avisoRapido("Não foi salvo: " + D.mensagemErro(e), "erro"); }
        } else if (resposta === "sim") {
          const salvo = await abrirOrcamento(o);
          if (!salvo) adiar(o.id);
        } else { adiar(o.id); break; }                    // "depois" ou fechou: para de perguntar nesta visita
      }
    } finally { perguntando = false; }
  }

  /* ---------- 7. PRESTADOR: CARTÕES DO QUADRO ----------
     Etapas: contatos · orcado · realizar · prestado · encerrado (componentes/kanban-servicos) */
  const MOTIVO = {
    [S.naoOrcou]: "Você não orçou", [S.expirado]: "Expirou: sem resposta em 10 dias", [S.naoEscolhido]: "Cliente escolheu outro prestador",
    [S.cancelado]: "Cliente não fechou com ninguém", [S.encerrado]: "Encerrado por você"
  };
  function etapaDo(o) {
    if (o.situacao === S.contato) return "contatos";
    if (o.situacao === S.orcado) return "orcado";
    if (D.ANDAMENTO.includes(o.situacao)) return "realizar";
    if (o.situacao === S.prestado) return "prestado";
    return "encerrado";
  }
  function paraKanban() {
    return D.lista().filter((o) => !o.arquivadoPrestador).map((o) => ({
      id: o.id, etapa: etapaDo(o), situacao: o.situacao, origem: o.origem,
      servico: o.servico || "Serviço", cliente: o.clienteNome, tipoCliente: o.clienteTipo, regiao: o.clienteRegiao || "",
      valor: o.orcamento ? o.orcamento.valorTotal : null, orcamento: o.orcamento || null, mensagem: o.mensagem || "",
      fotos: o.fotos || [],
      dataContato: D.ms(o.contatoEm), dataResposta: D.ms(o.respondidoEm), dataDecisao: D.ms(o.decididoEm),
      dataConclusao: D.ms(o.prestadoEm) || D.ms(o.concluidoEm),
      prazoResposta: somarDias(o.contatoEm, D.REGRAS.diasParaResponder),
      motivo: MOTIVO[o.situacao] || "", dataEncerramento: D.ms(o.decididoEm) || D.ms(o.respondidoEm) || D.ms(o.atualizadoEm),
      apagarEm: D.ms(o.apagarEm),
      aguardandoCliente: o.situacao === S.concluido,
      _orig: o
    }));
  }

  /* ---------- 8. CLIENTE: BLOCO "EM ORÇAMENTO" + SERVIÇOS REALIZADOS ---------- */
  function estadoPedido(itens) {
    if (itens.some((o) => o.situacao === S.prestado)) return "realizado";
    if (itens.some((o) => D.ANDAMENTO.includes(o.situacao))) return "andamento";
    if (itens.some((o) => o.situacao === S.cancelado)) return "fechado";
    return "orcamento";
  }
  function pedidosDoCliente() {
    const mapa = new Map();
    D.lista().forEach((o) => { if (!mapa.has(o.pedidoId)) mapa.set(o.pedidoId, []); mapa.get(o.pedidoId).push(o); });
    return [...mapa.entries()].map(([pedidoId, itens]) => ({
      pedidoId, itens: itens.sort((a, b) => D.ms(a.contatoEm) - D.ms(b.contatoEm)), estado: estadoPedido(itens),
      servico: itens[0].servico, categoria: itens[0].categoria,
      ultimo: Math.max(...itens.map((o) => D.ms(o.atualizadoEm) || D.ms(o.contatoEm)))
    })).sort((a, b) => b.ultimo - a.ultimo);
  }
  // Vitrines dos prestadores (foto, WhatsApp, visita) — lidas uma vez
  const vitrines = new Map();
  async function vitrineDe(uid) {
    if (vitrines.has(uid)) return vitrines.get(uid);
    const p = (async () => {
      try { return window.SDFirebase && window.SDFirebase.lerVitrine ? await window.SDFirebase.lerVitrine(uid) : null; } catch (_) { return null; }
    })();
    vitrines.set(uid, p);
    return p;
  }

  function cartaoPrestador(o, pedido, aoMudar) {
    const li = document.createElement("li");
    li.className = `pd-cartao pd-sit-${o.situacao}`;
    const semResposta = o.situacao === S.expirado || (o.situacao === S.contato && D.diasDesde(o.contatoEm) > D.REGRAS.diasParaResponder);
    const a = o.orcamento;
    const validoAte = a ? somarDias(o.respondidoEm || o.atualizadoEm, a.validadeDias) : 0;
    const resumo = a
      ? `<span class="pd-valor">${moeda(a.valorTotal)}</span>
         <span class="pd-linha">${a.inicioPrevisto ? "Início " + isoBR(a.inicioPrevisto) + " · " : ""}${a.duracaoDias ? a.duracaoDias + (a.duracaoDias === 1 ? " dia · " : " dias · ") : ""}válido até ${validoAte ? new Date(validoAte).toLocaleDateString("pt-BR") : "—"}</span>`
      : `<span class="pd-linha">${o.situacao === S.contato ? "Contato em " + dataBR(o.contatoEm) : ""}</span>`;
    li.innerHTML = `
      <div class="pd-cartao-topo">
        <img class="pd-cartao-foto" alt="" width="40" height="40" hidden>
        <div class="pd-cartao-nome">
          <a class="link" href="${esc(urlPerfilPrestador(o.prestadorUid, o.categoria))}">${esc(o.prestadorNome)}</a>
          <span class="pd-selo pd-selo-${semResposta ? "expirado" : o.situacao}">${esc(semResposta ? "Sem resposta" : SITUACAO_TEXTO[o.situacao] || o.situacao)}</span>
        </div>
      </div>
      <div class="pd-cartao-resumo">${resumo}</div>
      ${semResposta ? `<p class="pd-sutil">${esc(TEXTO.semResposta)} <a class="link" href="${esc(SD.urlPagina("localizarPrestador"))}?categoria=${encodeURIComponent(o.categoria || "")}">Procurar outro</a></p>` : ""}
      <div class="pd-cartao-acoes"></div>`;
    const acoes = li.querySelector(".pd-cartao-acoes");
    const botao = (texto, classe, fn) => {
      const b = document.createElement("button"); b.type = "button"; b.className = `btn btn-pequeno ${classe || ""}`; b.textContent = texto;
      b.addEventListener("click", fn); acoes.append(b); return b;
    };
    if (a) botao("Ver detalhes", "", () => verOrcamento(o));
    // WhatsApp do prestador: da vitrine (contatos visíveis) ou o que veio com o orçamento ("Pedir contato")
    vitrineDe(o.prestadorUid).then((v) => {
      const img = li.querySelector(".pd-cartao-foto");
      if (v && v.foto) { img.src = v.foto; img.hidden = false; }
      const numero = (v && v.whatsapp) || o.whatsapp;
      if (!numero || pedido.estado === "fechado") return;
      const link = document.createElement("a");
      link.className = "btn btn-pequeno pd-btn-zap"; link.target = "_blank"; link.rel = "noopener noreferrer";
      link.href = linkWhats(numero, o.prestadorNome);
      link.innerHTML = `${ICONE_ZAP}<span>${semResposta ? "Chamar de novo" : "WhatsApp"}</span>`;
      link.addEventListener("click", (e) => chamarWhatsApp(e, {
        prestador: { id: o.prestadorUid, nome: o.prestadorNome, cobraVisita: v ? v.cobraVisita : undefined, valorVisita: v ? v.valorVisita : 0, secundarias: !!(v && (v.especialidades || []).length) },
        categoria: o.categoria, servicoNome: o.servico, link: link.href
      }).then(aoMudar));
      acoes.prepend(link);
    });
    if (pedido.estado === "orcamento" && D.ABERTAS.includes(o.situacao)) {
      botao("Fechei com este", "pd-btn-principal", async () => {
        const ok = await confirmar({ tipo: "editar", titulo: `Fechou com ${o.prestadorNome}?`,
          texto: "Os outros prestadores deste pedido serão avisados de que você escolheu outro. O serviço fica \"em andamento\" até ser concluído.", sim: "Sim, fechei" });
        if (!ok) return;
        try { await D.escolher(o.id); avisoRapido("Pronto! O prestador foi avisado."); aoMudar(); }
        catch (e) { avisoRapido("Não foi salvo: " + D.mensagemErro(e), "erro"); }
      });
    }
    if (o.situacao === S.concluido) {
      botao("Confirmar que o serviço foi feito", "pd-btn-principal", async () => {
        const ok = await confirmar({ tipo: "editar", titulo: "O serviço foi realizado?",
          texto: `${o.prestadorNome} marcou "${o.servico}" como concluído. Ao confirmar, ele vai para Serviços realizados.`, sim: "Sim, foi realizado" });
        if (!ok) return;
        try { await D.confirmarConclusao(o.id); avisoRapido("Confirmado. O serviço está em Serviços realizados."); aoMudar(); }
        catch (e) { avisoRapido("Não foi salvo: " + D.mensagemErro(e), "erro"); }
      });
    }
    return li;
  }

  /* alvo = elemento onde o bloco é montado · aoMudar = chamado depois de cada ação */
  function renderizarEmOrcamento(alvo, { aoMudar } = {}) {
    const redesenhar = () => { renderizarEmOrcamento(alvo, { aoMudar }); if (aoMudar) aoMudar(); };
    const pedidos = pedidosDoCliente().filter((p) => p.estado === "orcamento" || p.estado === "andamento");
    const lembretes = new Map(D.lembretesCliente().map((l) => [l.pedidoId, l]));
    alvo.innerHTML = "";
    alvo.hidden = !pedidos.length;
    if (!pedidos.length) return 0;
    const titulo = document.createElement("h3");
    titulo.className = "pd-bloco-titulo";
    titulo.textContent = "Em orçamento e em andamento";
    alvo.append(titulo);
    pedidos.forEach((p) => {
      const sec = document.createElement("section");
      sec.className = `pd-bloco pd-bloco-${p.estado}`;
      sec.setAttribute("aria-label", `${p.servico}: ${p.estado === "andamento" ? "em andamento" : "em orçamento"}`);
      const visiveis = p.estado === "andamento" ? p.itens.filter((o) => D.ANDAMENTO.includes(o.situacao)) : p.itens;
      const orcados = p.itens.filter((o) => o.situacao === S.orcado).length;
      const lembrete = lembretes.get(p.pedidoId);
      sec.innerHTML = `
        <header class="pd-bloco-topo">
          <div>
            <h4>${esc(p.servico || "Serviço")}</h4>
            <span class="pd-selo pd-selo-processo">${p.estado === "andamento" ? "Em andamento — ainda não realizado" : "Em orçamento — ainda não realizado"}</span>
          </div>
          <span class="pd-bloco-conta">${p.estado === "andamento" ? "" : `${p.itens.length} ${p.itens.length === 1 ? "prestador" : "prestadores"} · ${orcados} ${orcados === 1 ? "orçamento" : "orçamentos"}`}</span>
        </header>
        ${lembrete ? `<p class="pd-sutil pd-lembrete">Você tem ${lembrete.qtd} ${lembrete.qtd === 1 ? "orçamento" : "orçamentos"} há ${lembrete.dias} dias. Já fechou com alguém? Marque em "Fechei com este".</p>` : ""}
        <ul class="pd-cartoes"></ul>
        <footer class="pd-bloco-rodape"></footer>`;
      const ul = sec.querySelector(".pd-cartoes");
      visiveis.forEach((o) => ul.append(cartaoPrestador(o, p, redesenhar)));
      const rodape = sec.querySelector(".pd-bloco-rodape");
      if (p.estado === "orcamento") {
        const abertos = p.itens.some((o) => D.ABERTAS.includes(o.situacao));
        const b = document.createElement("button");
        b.type = "button"; b.className = "btn btn-pequeno";
        b.textContent = abertos ? "Não fechei com nenhum" : "Tirar da lista";
        b.addEventListener("click", async () => {
          const ok = await confirmar({ titulo: abertos ? "Não fechou com nenhum prestador?" : "Tirar este pedido da lista?",
            texto: abertos ? "Os prestadores deste pedido serão avisados e o pedido sai da lista." : "Nenhum prestador respondeu. O pedido sai da sua lista.", sim: "Sim" });
          if (!ok) return;
          try { await D.cancelarPedido(p.pedidoId); if (!abertos) await Promise.all(p.itens.map((o) => D.excluir(o.id))); redesenhar(); }
          catch (e) { avisoRapido("Não foi salvo: " + D.mensagemErro(e), "erro"); }
        });
        rodape.append(b);
      }
      alvo.append(sec);
    });
    return pedidos.length;
  }

  // Serviços confirmados → formato de componentes/servicos-realizados
  function realizados() {
    return D.lista().filter((o) => o.situacao === S.prestado).map((o) => ({
      data: new Date(D.ms(o.prestadoEm) || D.ms(o.atualizadoEm)).toISOString().slice(0, 10),
      servico: o.servico, prestador: o.prestadorNome, prestadorId: o.prestadorUid,
      valor: o.orcamento ? o.orcamento.valorTotal : 0, estrelas: null, foto: null, fotos: []
    }));
  }

  /* ---------- 9. PARA AS TELAS ---------- */
  window.SDPedidos = Object.freeze({
    TEXTO, textoCobranca, resumoVisita, linkWhats,
    chamarWhatsApp, pedirContato,
    abrirOrcamento, verOrcamento, tabelaOrcamento, perguntarPendentes, paraKanban, fotosDoPedido,
    renderizarEmOrcamento, realizados, avisoRapido, janela
  });

  // Início: carrega os dados da pessoa e, se for prestador, pergunta os pendentes
  D.carregar().then(() => {
    document.dispatchEvent(new CustomEvent("sd:pedidos-pronto"));
    if (D.papel() === "prestador") perguntarPendentes();
  }).catch((e) => {
    console.warn("[S.D] Pedidos não carregados:", e.code || e);
    document.dispatchEvent(new CustomEvent("sd:pedidos-pronto"));
  });
})();
