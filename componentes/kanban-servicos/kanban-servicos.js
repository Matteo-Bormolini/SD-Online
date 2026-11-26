/* =====================================================================
   S.D — QUADRO DE SERVIÇOS DO PRESTADOR (componentes/kanban-servicos/kanban-servicos.js)
   Usado na página "Seus Serviços" (localizar-condominios/) desde a v0.8.7.
   v0.8.0 — fluxo "Contato registrado" (18/11/2026). Etapas (colunas):
     Contatos → Orçado → A realizar → Prestados   + área ENCERRADOS embaixo.
   Os cartões MUDAM DE ETAPA PELAS AÇÕES (não há mais arrastar):
     Contatos:   "Fiz orçamento" (abre o formulário) · "Não fiz"
     Orçado:     "Editar orçamento" · "Encerrar"            (cliente decide no perfil dele)
     A realizar: "Marcar como concluído" · "Editar orçamento" · "Encerrar sem serviço"
                 (concluído = aguarda o cliente confirmar → Prestados)
     Encerrados: lixeira = tira do seu quadro (arquivado; apagado em 1 ano)
   Celular: cada coluna abre e fecha (sanfona). Ações que mudam algo pedem confirmação.
   Depende de: componentes/utilidades e (opcional) componentes/confirmacao.

   Uso:
     const quadro = SDKanban.criar({
       alvo, resumo (<dl>), encerrados, total, anuncio (aria-live),
       servicos: SDPedidos.paraKanban(),
       aoAcao: async (acao, servico) => {...},   // "orcar" | "nao-fiz" | "editar" | "concluir" | "encerrar" | "arquivar"
       aoMudar: () => {},                         // altura do painel etc.
       umaPorVez: true                            // (opcional) celular: só uma etapa aberta
     });
     quadro.atualizar(novaLista);
   Formato de cada serviço: ver SDPedidos.paraKanban() (componentes/pedidos/pedidos.js).
   ===================================================================== */
(function () {
  "use strict";
  const U = window.SDUtil;
  if (!U) { console.error("[S.D] kanban-servicos.js: carregue componentes/utilidades/utilidades.js antes."); return; }

  /* ---------- 1. ETAPAS (ordem do fluxo) — editar nomes aqui ---------- */
  const ETAPAS = [
    { id: "contatos", nome: "Contatos",   dica: "Clientes que chamaram você — responda se fez orçamento", rotuloData: "Contato em",   data: "dataContato" },
    { id: "orcado",   nome: "Orçado",     dica: "Orçamento enviado — o cliente decide",                     rotuloData: "Orçado em",    data: "dataResposta" },
    { id: "realizar", nome: "A realizar", dica: "Cliente fechou com você",                                  rotuloData: "Fechado em",   data: "dataDecisao" },
    { id: "prestado", nome: "Prestados",  dica: "Serviços confirmados pelo cliente",                        rotuloData: "Realizado em", data: "dataConclusao" }
  ];
  const ENCERRADOS = {
    nome: "Encerrados",
    dica: "Contatos que terminaram sem serviço (não orçados, sem resposta, outro prestador escolhido ou encerrados).",
    diasParaExcluir: 365
  };
  const CELULAR = window.matchMedia("(max-width: 47.99rem)");
  const confirmar = (o) => (window.SDConfirmar ? window.SDConfirmar(o) : Promise.resolve(true));
  const dataTxt = (ms) => (ms ? new Date(ms).toLocaleDateString("pt-BR") : "—");
  const ICONE_LIXO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>';
  const SETA_BAIXO = '<svg class="kanban-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const ICONE_FOTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 16-5-5-8 8"/></svg>';

  /* ===================================================================== */
  function criar(opcoes) {
    const { alvo, resumo, total, anuncio, encerrados: alvoEncerrados, aoAcao, aoMudar } = opcoes;
    let servicos = (opcoes.servicos || []).map((s) => ({ ...s }));
    const abertos = new Set();
    const colunasAbertas = new Set(["contatos"]);              // no celular, Contatos começa aberta
    const avisar = () => { if (typeof aoMudar === "function") aoMudar(); };
    const anunciar = (t) => { if (anuncio) { anuncio.textContent = ""; setTimeout(() => { anuncio.textContent = t; }, 30); } };

    /* ---------- 2. COLUNAS ---------- */
    alvo.innerHTML = "";
    const colunas = {};
    ETAPAS.forEach((et) => {
      const col = document.createElement("section");
      col.className = "kanban-coluna";
      col.dataset.etapa = et.id;
      col.setAttribute("aria-labelledby", "kb-titulo-" + et.id);
      col.innerHTML = `
        <header class="kanban-coluna-topo">
          <h3 id="kb-titulo-${et.id}">
            <button type="button" class="kanban-coluna-botao" aria-controls="kb-corpo-${et.id}">
              <span class="kanban-marcador" aria-hidden="true"></span>${et.nome} <span class="kanban-qtd"></span>
              ${SETA_BAIXO}
            </button>
          </h3>
          <p class="kanban-coluna-dica">${et.dica}</p>
          <p class="kanban-coluna-soma"></p>
        </header>
        <div class="kanban-corpo" id="kb-corpo-${et.id}">
          <ol class="kanban-lista" aria-labelledby="kb-titulo-${et.id}"></ol>
          <p class="kanban-vazio">Nenhum serviço nesta etapa.</p>
        </div>`;
      alvo.append(col);
      colunas[et.id] = col;
      col.querySelector(".kanban-coluna-botao").addEventListener("click", () => {
        if (colunasAbertas.has(et.id)) colunasAbertas.delete(et.id);
        else { if (opcoes.umaPorVez) colunasAbertas.clear(); colunasAbertas.add(et.id); }   // umaPorVez: abre uma, fecha as outras
        aplicarSanfonas(); avisar();
      });
    });
    function aplicarSanfonas() {
      ETAPAS.forEach((et) => {
        const col = colunas[et.id], botao = col.querySelector(".kanban-coluna-botao");
        const aberta = !CELULAR.matches || colunasAbertas.has(et.id);
        col.classList.toggle("recolhida", !aberta);
        botao.disabled = !CELULAR.matches;
        if (CELULAR.matches) botao.setAttribute("aria-expanded", String(aberta)); else botao.removeAttribute("aria-expanded");
      });
    }
    const aoTrocarTela = () => { aplicarSanfonas(); avisar(); };
    if (CELULAR.addEventListener) CELULAR.addEventListener("change", aoTrocarTela); else if (CELULAR.addListener) CELULAR.addListener(aoTrocarTela);

    /* ---------- 3. AÇÕES ---------- */
    async function acao(nome, s, botao) {
      const perguntas = {
        "nao-fiz": { titulo: "Você não fez orçamento?", texto: `"${s.servico}" de ${s.cliente} vai para ${ENCERRADOS.nome}. O cliente é avisado.`, sim: "Sim, não fiz" },
        "concluir": { tipo: "editar", titulo: "O serviço terminou?", texto: `${s.cliente} será avisado para confirmar. Depois da confirmação, "${s.servico}" vai para Prestados.`, sim: "Sim, concluído" },
        "encerrar": { titulo: "Encerrar sem serviço?", texto: `"${s.servico}" vai para ${ENCERRADOS.nome} e o cliente é avisado. Fica guardado por 1 ano.`, sim: "Sim, encerrar" },
        "arquivar": { titulo: "Tirar do seu quadro?", texto: `"${s.servico}" (${s.cliente}) sai da sua lista de ${ENCERRADOS.nome}. O registro é apagado de vez em até 1 ano.`, sim: "Sim, tirar" }
      };
      if (perguntas[nome] && !(await confirmar(perguntas[nome]))) return;
      if (typeof aoAcao !== "function") return;
      const parar = botao ? U.carregando(botao, "Salvando…") : () => {};
      try { await aoAcao(nome, s); }
      finally { parar(); }
    }

    /* ---------- 4. UM CARTÃO ---------- */
    function criarCartao(s) {
      const et = ETAPAS.find((e) => e.id === s.etapa);
      const idDet = "kb-det-" + s.id.replace(/[^A-Za-z0-9_-]/g, "");
      const aberto = abertos.has(s.id);
      const ehCnpj = s.tipoCliente === "cnpj";
      const li = document.createElement("li");
      const card = document.createElement("article");
      card.className = "kanban-card" + (aberto ? " expandido" : "") + (s.aguardandoCliente ? " aguardando" : "");
      card.dataset.id = s.id;
      card.setAttribute("aria-label", `${s.servico} — ${s.cliente}`);

      const topo = document.createElement("button");
      topo.type = "button";
      topo.className = "kanban-card-topo";
      topo.setAttribute("aria-expanded", String(aberto));
      topo.setAttribute("aria-controls", idDet);
      const moldura = document.createElement("span");
      moldura.className = "kanban-foto";
      moldura.innerHTML = `<img alt="" width="40" height="40" src="${U.iconeProvisorio(ehCnpj ? "predio" : "casa")}">`;
      const textos = document.createElement("span");
      textos.className = "kanban-card-textos";
      const titulo = document.createElement("span"); titulo.className = "kanban-card-titulo"; titulo.textContent = s.servico;
      const cliente = document.createElement("span"); cliente.className = "kanban-card-cliente";
      cliente.textContent = `${s.cliente} · ${ehCnpj ? "CNPJ" : "CPF"}`;
      textos.append(titulo, cliente);
      const info = document.createElement("span");
      info.className = "kanban-card-info";
      const valor = document.createElement("span"); valor.className = "kanban-card-valor";
      valor.textContent = s.valor == null ? (s.origem === "pedido" ? "Pedido pelo site" : "Pelo WhatsApp") : U.formatarMoeda(s.valor);
      const data = document.createElement("span"); data.className = "kanban-card-data";
      data.textContent = s.etapa === "contatos" ? `Responder até ${dataTxt(s.prazoResposta)}` : `${et.rotuloData} ${dataTxt(s[et.data])}`;
      info.append(valor, data);
      if (s.fotos && s.fotos.length) {
        const qf = document.createElement("span"); qf.className = "kanban-card-fotos"; qf.innerHTML = ICONE_FOTO;
        qf.append(document.createTextNode(String(s.fotos.length))); qf.title = `${s.fotos.length} fotos do cliente`; info.append(qf);
      }
      if (s.aguardandoCliente) {
        const selo = document.createElement("span"); selo.className = "kanban-selo"; selo.textContent = "Aguardando o cliente confirmar";
        info.append(selo);
      }
      topo.append(moldura, textos, info);
      topo.insertAdjacentHTML("beforeend", SETA_BAIXO);

      const det = document.createElement("div");
      det.className = "kanban-detalhes";
      det.id = idDet;
      det.hidden = !aberto;
      const tabela = document.createElement("table");
      tabela.className = "tabela-servico";
      const corpo = document.createElement("tbody");
      corpo.append(
        U.linhaTabela("Cliente", `${s.cliente} (${ehCnpj ? "Pessoa jurídica" : "Pessoa física"})`),
        U.linhaTabela("Região", s.regiao || "Não informada"),
        U.linhaTabela("Como chegou", s.origem === "pedido" ? "Pedido pelo site" : "WhatsApp"),
        U.linhaTabela("Contato em", dataTxt(s.dataContato))
      );
      if (s.etapa === "contatos") {
        const prazo = document.createElement("strong"); prazo.textContent = dataTxt(s.prazoResposta);
        corpo.append(U.linhaTabela("Responder até", prazo));
      }
      if (s.orcamento) {
        const o = s.orcamento;
        corpo.append(
          U.linhaTabela("Valor total", U.formatarMoeda(o.valorTotal)),
          U.linhaTabela("Visita técnica", o.cobraVisita ? U.formatarMoeda(o.valorVisita) : "Não cobra")
        );
        if (o.inicioPrevisto) corpo.append(U.linhaTabela("Início previsto", U.formatarData(o.inicioPrevisto)));
        if (o.validadeDias) corpo.append(U.linhaTabela("Validade", `${o.validadeDias} dias`));
      }
      if (s.etapa === "prestado") corpo.append(U.linhaTabela("Avaliação", "Chega com as avaliações (próximo ciclo)"));
      tabela.append(corpo);
      det.append(tabela);

      if (s.orcamento && s.orcamento.descricao) {
        const d = document.createElement("div"); d.className = "kanban-descricao";
        const dt = document.createElement("strong"); dt.textContent = "Seu orçamento";
        const dp = document.createElement("p"); dp.textContent = s.orcamento.descricao;
        d.append(dt, dp); det.append(d);
      }
      if (s.mensagem) {
        const d = document.createElement("div"); d.className = "kanban-descricao";
        const dt = document.createElement("strong"); dt.textContent = "Pedido do cliente";
        const dp = document.createElement("p"); dp.textContent = s.mensagem;
        d.append(dt, dp); det.append(d);
      }
      const fotos = document.createElement("ul");
      fotos.className = "pd-miniaturas pd-miniaturas-ver kanban-fotos-pedido";
      det.append(fotos);
      let fotosLidas = false;
      const lerFotos = () => {
        if (fotosLidas || !s.fotos || !s.fotos.length || !window.SDPedidos) return;
        fotosLidas = true;
        window.SDPedidos.fotosDoPedido({ fotos: s.fotos }, fotos);
      };

      // Ações de cada etapa
      const acoes = document.createElement("div");
      acoes.className = "kanban-acoes";
      const botao = (texto, nome, classe = "") => {
        const b = document.createElement("button");
        b.type = "button"; b.className = `btn btn-pequeno ${classe}`; b.textContent = texto;
        b.addEventListener("click", () => acao(nome, s, b));
        acoes.append(b);
      };
      if (s.etapa === "contatos") {
        botao("Fiz orçamento", "orcar", "kanban-avancar");
        botao(s.origem === "pedido" ? "Não vou orçar" : "Não fiz", "nao-fiz", "kanban-encerrar");
      } else if (s.etapa === "orcado") {
        botao("Editar orçamento", "editar");
        botao("Encerrar", "encerrar", "kanban-encerrar");
      } else if (s.etapa === "realizar") {
        if (s.aguardandoCliente) {
          const nota = document.createElement("p"); nota.className = "kanban-nota";
          nota.textContent = "Você marcou como concluído. Quando o cliente confirmar, o serviço vai para Prestados.";
          acoes.append(nota);
        } else {
          botao("Marcar como concluído", "concluir", "kanban-avancar");
          botao("Editar orçamento", "editar");
          botao("Encerrar sem serviço", "encerrar", "kanban-encerrar");
        }
      }
      if (acoes.childElementCount) det.append(acoes);

      topo.addEventListener("click", () => {
        const abrir = det.hidden;
        det.hidden = !abrir;
        card.classList.toggle("expandido", abrir);
        topo.setAttribute("aria-expanded", String(abrir));
        if (abrir) { abertos.add(s.id); lerFotos(); } else abertos.delete(s.id);
        avisar();
      });
      if (aberto) lerFotos();
      card.append(topo, det);
      li.append(card);
      return li;
    }

    /* ---------- 5. ENCERRADOS (sanfona, começa fechada) ---------- */
    let encerradosAberto = false;
    function renderizarEncerrados() {
      if (!alvoEncerrados) return;
      const lista = servicos.filter((s) => s.etapa === "encerrado").sort((a, b) => (b.dataEncerramento || 0) - (a.dataEncerramento || 0));
      alvoEncerrados.className = "kanban-encerrados";
      alvoEncerrados.innerHTML = `
        <h3 class="kanban-encerrados-titulo">
          <button type="button" class="kanban-encerrados-botao" aria-expanded="${encerradosAberto}" aria-controls="kb-encerrados-corpo">
            <span class="kanban-marcador" aria-hidden="true"></span>${ENCERRADOS.nome} <span class="kanban-qtd">(${lista.length})</span>${SETA_BAIXO}
          </button>
        </h3>
        <p class="kanban-coluna-dica">${ENCERRADOS.dica}</p>
        <div id="kb-encerrados-corpo" ${encerradosAberto ? "" : "hidden"}>
          <p class="kanban-encerrados-aviso">Cada item é apagado automaticamente <strong>1 ano</strong> depois do contato. A lixeira tira do seu quadro antes.</p>
          <ul class="kanban-encerrados-lista"></ul>
          <p class="kanban-vazio" ${lista.length ? "hidden" : ""}>Nenhum contato encerrado.</p>
        </div>`;
      const ul = alvoEncerrados.querySelector(".kanban-encerrados-lista");
      lista.forEach((s) => {
        const li = document.createElement("li");
        li.className = "kanban-encerrado";
        const textos = document.createElement("div"); textos.className = "kanban-encerrado-textos";
        const t = document.createElement("strong"); t.textContent = s.servico;
        const c = document.createElement("span"); c.className = "kanban-card-cliente"; c.textContent = `${s.cliente} · ${s.tipoCliente === "cnpj" ? "CNPJ" : "CPF"}`;
        const m = document.createElement("span"); m.className = "kanban-motivo" + (s.situacao === "nao-escolhido" ? " recusado" : ""); m.textContent = s.motivo;
        const info = document.createElement("span"); info.className = "kanban-encerrado-info";
        info.textContent = `Encerrado em ${dataTxt(s.dataEncerramento)} · Será apagado em ${dataTxt(s.apagarEm)}`;
        textos.append(t, c, m, info);
        const lixo = document.createElement("button");
        lixo.type = "button"; lixo.className = "btn btn-pequeno btn-icone kanban-lixeira"; lixo.innerHTML = ICONE_LIXO;
        lixo.setAttribute("aria-label", `Tirar "${s.servico}" de ${s.cliente} do quadro`); lixo.title = "Tirar do quadro";
        lixo.addEventListener("click", () => acao("arquivar", s, null));
        li.append(textos, lixo);
        ul.append(li);
      });
      alvoEncerrados.querySelector(".kanban-encerrados-botao").addEventListener("click", () => {
        encerradosAberto = !encerradosAberto;
        renderizarEncerrados();
        alvoEncerrados.querySelector(".kanban-encerrados-botao").focus();
        avisar();
      });
    }

    /* ---------- 6. DESENHO GERAL ---------- */
    function renderizar() {
      ETAPAS.forEach((et) => {
        const col = colunas[et.id];
        const lista = col.querySelector(".kanban-lista");
        const doEtapa = servicos.filter((s) => s.etapa === et.id).sort((a, b) => (b[et.data] || 0) - (a[et.data] || 0));
        lista.innerHTML = "";
        doEtapa.forEach((s) => lista.append(criarCartao(s)));
        col.querySelector(".kanban-qtd").textContent = `(${doEtapa.length})`;
        col.querySelector(".kanban-coluna-soma").textContent = (doEtapa.length && et.id !== "contatos") ? U.formatarMoeda(doEtapa.reduce((t, s) => t + Number(s.valor || 0), 0)) : "";
        col.querySelector(".kanban-vazio").hidden = doEtapa.length > 0;
        lista.hidden = doEtapa.length === 0;
      });
      const soma = (ids) => servicos.filter((s) => ids.includes(s.etapa)).reduce((t, s) => t + Number(s.valor || 0), 0);
      if (resumo) {
        resumo.innerHTML = "";
        const novos = servicos.filter((s) => s.etapa === "contatos").length;
        [
          ["Contatos para responder", `${novos} ${novos === 1 ? "contato" : "contatos"}`],
          ["Orçado (aguardando)", soma(["orcado"])],
          ["A realizar", soma(["realizar"])],
          ["Prestados", soma(["prestado"])]
        ].forEach(([rot, val]) => {
          const d = document.createElement("div");
          const dt = document.createElement("dt"); dt.textContent = rot;
          const dd = document.createElement("dd"); dd.textContent = typeof val === "string" ? val : U.formatarMoeda(val);
          d.append(dt, dd); resumo.append(d);
        });
      }
      const ativos = servicos.filter((s) => s.etapa !== "encerrado").length;
      if (total) total.textContent = `${ativos} ${ativos === 1 ? "serviço" : "serviços"}`;
      renderizarEncerrados();
      aplicarSanfonas();
      avisar();
    }
    renderizar();

    return {
      get servicos() { return servicos.map((s) => ({ ...s })); },
      contar: (etapa) => servicos.filter((s) => s.etapa === etapa).length,
      atualizar(lista) { servicos = (lista || []).map((s) => ({ ...s })); renderizar(); anunciar("Quadro atualizado."); },
      etapas: ETAPAS.map((e) => ({ ...e }))
    };
  }

  window.SDKanban = { criar, ETAPAS, ENCERRADOS };
})();
