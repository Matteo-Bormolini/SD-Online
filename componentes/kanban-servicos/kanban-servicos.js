/* =====================================================================
   S.D — QUADRO DE SERVIÇOS DO PRESTADOR (componentes/kanban-servicos/kanban-servicos.js)
   Componente reutilizável. Organiza os serviços em etapas (colunas):
   A orçar → Orçando → Aceito → A realizar → Prestados
   + área ENCERRADOS (sem serviço), embaixo do quadro.
   Celular: cada coluna abre e fecha (sanfona) para ocupar menos espaço.
   Excluir e encerrar pedem confirmação (componentes/confirmacao).
   Depende de: componentes/utilidades, componentes/carrossel e
   componentes/kanban-servicos/kanban-servicos.css.

   Uso:
     const quadro = SDKanban.criar({
       alvo: elemento,             // onde as colunas serão montadas
       resumo: elemento <dl>,      // números (valores por etapa) — opcional
       encerrados: elemento,       // onde montar a área Encerrados — opcional
       total: elemento,            // contador geral — opcional
       anuncio: elemento aria-live // avisos para leitor de tela — opcional
       servicos: [...],            // ver formato abaixo
       fotoPadraoCliente: { cpf: "...", cnpj: "..." },
       aoMudar: () => {}           // chamado quando algo muda (altura etc.)
     });

   Formato de cada serviço:
     { id, etapa: "aorcar"|"orcando"|"aceito"|"realizar"|"prestado"|"encerrado",
       motivo (só encerrado: texto), dataEncerramento (AAAA-MM-DD),
       servico, descricao, cliente, tipoCliente: "cpf"|"cnpj", fotoCliente,
       bairro, local, visita (texto), dataPedido, dataAgendada, dataConclusao (AAAA-MM-DD),
       valor (R$), telefone (só liberado após o aceite), avaliacaoRecebida (1-5 ou null),
       fotos: [{ src, legenda }] }

   Mudança de etapa: botões "Voltar para…"/"Mover para…" em cada serviço
   (funciona com teclado, toque e leitor de tela) + arrastar com o mouse.
   IMPORTANTE: demonstração — a mudança real será gravada pelo servidor.
   ===================================================================== */
(function () {
  "use strict";
  const U = window.SDUtil;
  if (!U) { console.error("[S.D] kanban-servicos.js: carregue componentes/utilidades/utilidades.js antes."); return; }

  /* ---------- 1. ETAPAS (ordem do fluxo) — editar nomes aqui ---------- */
  const ETAPAS = [
    { id: "aorcar",   nome: "A orçar",    dica: "Pedidos novos de clientes — decida se vai orçar", data: "dataPedido", rotuloData: "Pedido em",   rotuloValor: "Valor" },
    { id: "orcando",  nome: "Orçando",    dica: "Orçamentos enviados, aguardando o cliente",   data: "dataPedido",    rotuloData: "Pedido em",      rotuloValor: "Valor orçado" },
    { id: "aceito",   nome: "Aceito",     dica: "Cliente aceitou — combinar data e detalhes",  data: "dataAgendada",  rotuloData: "Agendar até",    rotuloValor: "Valor aceito" },
    { id: "realizar", nome: "A realizar", dica: "Agendados ou em andamento",                   data: "dataAgendada",  rotuloData: "Agendado para",  rotuloValor: "Valor a receber" },
    { id: "prestado", nome: "Prestados",  dica: "Serviços concluídos",                         data: "dataConclusao", rotuloData: "Concluído em",   rotuloValor: "Valor recebido" }
  ];
  const indiceEtapa = (id) => ETAPAS.findIndex((e) => e.id === id);

  /* ---------- 1b. ENCERRADOS (pedidos que terminaram SEM serviço) ----------
     Ficam guardados por 1 ano e depois o SERVIDOR apaga sozinho.
     O prestador pode apagar antes, pelo botão da lixeira. */
  const ENCERRADOS = {
    nome: "Encerrados",
    dica: "Pedidos e orçamentos que terminaram sem serviço (recusados, cancelados ou não atendidos).",
    diasParaExcluir: 365,
    // Pedido em "A orçar" sem resposta por este número de dias expira e vai para Encerrados.
    // (Decisão de 09/11/2026: 10 dias; pode mudar depois de pesquisa de mercado.)
    diasParaExpirarAOrcar: 10,
    motivos: {
      expirado: "Expirou: sem resposta em 10 dias",
      prestador: "Encerrado por você",
      naoAtendido: "Você não quis orçar",
      recusado: "Recusado pelo cliente",
      cancelado: "Cancelado pelo cliente"
    }
  };
  // Celular: até esta largura as colunas viram sanfona
  const CELULAR = window.matchMedia("(max-width: 47.99rem)");
  // PRESTADOS: quem marca como finalizado é o CLIENTE (com 2 a 6 fotos e a avaliação).
  // O prestador não move cartões para Prestados nem tira de lá.
  const SO_CLIENTE_FINALIZA = true;
  const confirmar = (o) => (window.SDConfirmar ? window.SDConfirmar(o) : Promise.resolve(true));
  const ICONE_LIXO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v6M14 11v6"/></svg>';
  // Soma dias a uma data AAAA-MM-DD
  function somarDias(iso, dias) {
    const d = new Date(iso + "T12:00:00");
    d.setDate(d.getDate() + dias);
    return d.toISOString().slice(0, 10);
  }

  const SETA_BAIXO = '<svg class="kanban-seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>';
  const SETA_ESQ = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>';
  const SETA_DIR = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>';
  const ICONE_FOTO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="11" r="2"/><path d="m21 16-5-5-8 8"/></svg>';
  const ICONE_ALCA = '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.6"/><circle cx="15" cy="6" r="1.6"/><circle cx="9" cy="12" r="1.6"/><circle cx="15" cy="12" r="1.6"/><circle cx="9" cy="18" r="1.6"/><circle cx="15" cy="18" r="1.6"/></svg>';

  /* ===================================================================== */
  function criar(opcoes) {
    const { alvo, resumo, total, anuncio, encerrados: alvoEncerrados, fotoPadraoCliente = {}, aoMudar } = opcoes;
    const servicos = opcoes.servicos.map((s) => ({ ...s }));   // cópia de trabalho
    const abertos = new Set();                                  // ids expandidos
    const colunasAbertas = new Set();                           // colunas abertas no celular (começam fechadas)

    // Demonstração: pedidos vencidos em "A orçar" vão para Encerrados (no site real, o servidor faz isso)
    const hoje = U.hojeISO();
    servicos.forEach((s) => {
      if (s.etapa !== "aorcar" || !s.dataPedido) return;
      const limite = somarDias(s.dataPedido, ENCERRADOS.diasParaExpirarAOrcar);
      if (limite < hoje) { s.etapa = "encerrado"; s.motivo = ENCERRADOS.motivos.expirado; s.dataEncerramento = limite; }
    });

    // Aviso visível acima do quadro (ex.: "só o cliente marca como finalizado")
    const avisoQuadro = document.createElement("p");
    avisoQuadro.className = "mensagem atencao kanban-aviso";
    avisoQuadro.setAttribute("role", "status");
    avisoQuadro.hidden = true;
    alvo.before(avisoQuadro);
    let tempoAviso = null;
    const mostrarAviso = (texto) => {
      avisoQuadro.textContent = texto; avisoQuadro.hidden = false;
      clearTimeout(tempoAviso); tempoAviso = setTimeout(() => { avisoQuadro.hidden = true; avisar(); }, 6000);
      anunciar(texto); avisar();
    };
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
      ligarSoltar(col, et.id);
      col.querySelector(".kanban-coluna-botao").addEventListener("click", () => {
        if (colunasAbertas.has(et.id)) colunasAbertas.delete(et.id); else colunasAbertas.add(et.id);
        aplicarSanfonas();
        avisar();
      });
    });

    // Sanfona das colunas: só no celular. No computador todas ficam abertas.
    function aplicarSanfonas() {
      ETAPAS.forEach((et) => {
        const col = colunas[et.id];
        const botao = col.querySelector(".kanban-coluna-botao");
        const aberta = !CELULAR.matches || colunasAbertas.has(et.id);
        col.classList.toggle("recolhida", !aberta);
        botao.disabled = !CELULAR.matches;                       // no computador é só um título
        if (CELULAR.matches) botao.setAttribute("aria-expanded", String(aberta)); else botao.removeAttribute("aria-expanded");
      });
    }
    const aoTrocarTela = () => { aplicarSanfonas(); avisar(); };
    if (CELULAR.addEventListener) CELULAR.addEventListener("change", aoTrocarTela); else if (CELULAR.addListener) CELULAR.addListener(aoTrocarTela);

    /* ---------- 3. UM CARTÃO ---------- */
    function criarCartao(s) {
      const et = ETAPAS[indiceEtapa(s.etapa)];
      const idDet = "kb-det-" + s.id;
      const aberto = abertos.has(s.id);
      const fotos = Array.isArray(s.fotos) ? s.fotos : [];
      const ehCnpj = s.tipoCliente === "cnpj";

      const li = document.createElement("li");
      const card = document.createElement("article");
      card.className = "kanban-card" + (aberto ? " expandido" : "");
      card.dataset.id = s.id;
      card.draggable = true;                     // arrastar com o mouse (desktop)
      card.setAttribute("aria-label", `${s.servico} — ${s.cliente}`);

      // Topo clicável (botão = acessível por teclado)
      const topo = document.createElement("button");
      topo.type = "button";
      topo.className = "kanban-card-topo";
      topo.setAttribute("aria-expanded", String(aberto));
      topo.setAttribute("aria-controls", idDet);

      const moldura = document.createElement("span");
      moldura.className = "kanban-foto";
      const img = document.createElement("img");
      img.alt = ""; img.width = 40; img.height = 40; img.loading = "lazy";
      U.aplicarFoto(img, s.fotoCliente, fotoPadraoCliente[s.tipoCliente] || "", ehCnpj ? "predio" : "casa");
      moldura.append(img);

      const textos = document.createElement("span");
      textos.className = "kanban-card-textos";
      const titulo = document.createElement("span");
      titulo.className = "kanban-card-titulo"; titulo.textContent = s.servico;
      const cliente = document.createElement("span");
      cliente.className = "kanban-card-cliente";
      cliente.textContent = `${s.cliente} · ${ehCnpj ? "CNPJ" : "CPF"}`;
      textos.append(titulo, cliente);

      const linhaInfo = document.createElement("span");
      linhaInfo.className = "kanban-card-info";
      const valor = document.createElement("span");
      valor.className = "kanban-card-valor";
      valor.textContent = s.valor == null ? "Sem valor ainda" : U.formatarMoeda(s.valor);
      const data = document.createElement("span");
      data.className = "kanban-card-data";
      data.textContent = `${et.rotuloData} ${U.formatarData(s[et.data])}`;
      const qtdFotos = document.createElement("span");
      qtdFotos.className = "kanban-card-fotos";
      qtdFotos.innerHTML = ICONE_FOTO;
      qtdFotos.append(document.createTextNode(String(fotos.length)));
      qtdFotos.title = `${fotos.length} ${fotos.length === 1 ? "foto" : "fotos"}`;
      linhaInfo.append(valor, data, qtdFotos);

      topo.append(moldura, textos, linhaInfo);
      topo.insertAdjacentHTML("beforeend", SETA_BAIXO);

      // Detalhes (abre ao clicar)
      const det = document.createElement("div");
      det.className = "kanban-detalhes";
      det.id = idDet;
      det.hidden = !aberto;

      const tabela = document.createElement("table");
      tabela.className = "tabela-servico";
      const corpo = document.createElement("tbody");
      if (s.etapa === "aorcar" && s.dataPedido) {
        const prazo = document.createElement("strong");
        prazo.textContent = U.formatarData(somarDias(s.dataPedido, ENCERRADOS.diasParaExpirarAOrcar));
        corpo.append(U.linhaTabela("Responder até", prazo));
      }
      corpo.append(
        U.linhaTabela("Cliente", `${s.cliente} (${ehCnpj ? "Pessoa jurídica" : "Pessoa física"})`),
        U.linhaTabela("Local", [s.local, s.bairro].filter(Boolean).join(" — ") || "—"),
        U.linhaTabela("Visita", s.visita || "—"),
        U.linhaTabela("Pedido em", U.formatarData(s.dataPedido))
      );
      if (s.dataAgendada) corpo.append(U.linhaTabela(s.etapa === "prestado" ? "Agendado para" : "Data combinada", U.formatarData(s.dataAgendada)));
      if (s.dataConclusao) corpo.append(U.linhaTabela("Concluído em", U.formatarData(s.dataConclusao)));
      if (s.valor != null) {
        const v = document.createElement("span");
        v.className = "valor-dinheiro"; v.textContent = U.formatarMoeda(s.valor);
        corpo.append(U.linhaTabela(et.rotuloValor, v));
      }

      // Contato: liberado somente depois que o cliente aceita o orçamento
      if (s.etapa === "aorcar" || s.etapa === "orcando") {
        const bloq = document.createElement("span");
        bloq.className = "kanban-bloqueado";
        bloq.textContent = "Liberado quando o cliente aceitar o orçamento";
        corpo.append(U.linhaTabela("Contato", bloq));
      } else if (s.telefone) {
        const a = document.createElement("a");
        a.className = "link";
        a.href = "https://wa.me/55" + U.soDigitos(s.telefone);
        a.target = "_blank"; a.rel = "noopener noreferrer";
        a.textContent = "WhatsApp " + U.formatarTelefone(s.telefone);
        corpo.append(U.linhaTabela("Contato", a));
      }
      if (s.etapa === "prestado") {
        const av = document.createElement("span");
        if (s.avaliacaoRecebida == null) { av.className = "sem-avaliacao"; av.textContent = "Cliente ainda não avaliou"; }
        else {
          av.className = "estrelas"; av.innerHTML = U.estrelasSVG(s.avaliacaoRecebida);
          const t = document.createElement("span"); t.className = "estrelas-texto"; t.textContent = `${s.avaliacaoRecebida} de 5`;
          av.append(t);
        }
        corpo.append(U.linhaTabela("Avaliação recebida", av));
      }
      tabela.append(corpo);

      const descricao = document.createElement("div");
      descricao.className = "kanban-descricao";
      const dt = document.createElement("strong"); dt.textContent = "Pedido do cliente";
      const dp = document.createElement("p"); dp.textContent = s.descricao || "Sem descrição.";
      descricao.append(dt, dp);

      const areaFotos = document.createElement("div");
      areaFotos.className = "kanban-fotos";

      // Ações: mover entre etapas (alternativa ao arrastar — WCAG 2.5.7)
      const acoes = document.createElement("div");
      acoes.className = "kanban-acoes";
      const i = indiceEtapa(s.etapa);
      const bloqueadoPeloCliente = SO_CLIENTE_FINALIZA && (s.etapa === "prestado" || ETAPAS[i + 1]?.id === "prestado");
      if (i > 0 && !(SO_CLIENTE_FINALIZA && s.etapa === "prestado")) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "btn btn-pequeno";
        b.innerHTML = SETA_ESQ; b.append(document.createTextNode(`Voltar para ${ETAPAS[i - 1].nome}`));
        b.addEventListener("click", () => mover(s.id, ETAPAS[i - 1].id, true));
        acoes.append(b);
      }
      if (bloqueadoPeloCliente && s.etapa === "realizar") {
        const nota = document.createElement("p");
        nota.className = "kanban-nota";
        nota.textContent = "Quando o serviço terminar, o cliente marca como finalizado (com fotos e avaliação) e ele vai para Prestados.";
        acoes.append(nota);
      }
      if (i < ETAPAS.length - 1 && !bloqueadoPeloCliente) {
        const b = document.createElement("button");
        b.type = "button"; b.className = "btn btn-pequeno kanban-avancar";
        // Em "A orçar" o próximo passo é orçar. Na versão final abre o orçamento padrão (US15).
        b.append(document.createTextNode(s.etapa === "aorcar" ? "Fazer orçamento" : `Mover para ${ETAPAS[i + 1].nome}`));
        b.insertAdjacentHTML("beforeend", SETA_DIR);
        b.addEventListener("click", () => mover(s.id, ETAPAS[i + 1].id, true));
        acoes.append(b);
      }

      // Encerrar sem serviço (A orçar, Orçando, Aceito, A realizar)
      if (s.etapa !== "prestado") {
        const b = document.createElement("button");
        b.type = "button"; b.className = "btn btn-pequeno kanban-encerrar";
        b.textContent = s.etapa === "aorcar" ? "Não vou orçar" : "Encerrar sem serviço";
        b.addEventListener("click", async () => {
          const ok = await confirmar({
            titulo: s.etapa === "aorcar" ? "Não orçar este pedido?" : "Encerrar sem prestar o serviço?",
            texto: `"${s.servico}" vai para ${ENCERRADOS.nome}. Ele fica guardado por 1 ano e depois é apagado.`,
            sim: "Sim, encerrar"
          });
          if (ok) encerrar(s.id, s.etapa === "aorcar" ? ENCERRADOS.motivos.naoAtendido : ENCERRADOS.motivos.prestador);
        });
        acoes.append(b);
      }

      det.append(tabela, descricao, areaFotos, acoes);

      // Carrossel de fotos do serviço (criado só na primeira abertura)
      let carrossel = null;
      const montarCarrossel = () => {
        if (carrossel || !window.SDCarrossel) return;
        carrossel = window.SDCarrossel.criar({
          alvo: areaFotos,
          rotulo: "Fotos do serviço: " + s.servico,
          fotos: fotos.map((f, n) => ({ src: f.src, legenda: f.legenda, alt: f.legenda || `Foto ${n + 1} do serviço ${s.servico}` })),
          vazio: (s.etapa === "orcando" || s.etapa === "aorcar") ? "O cliente não enviou fotos para este orçamento." : "Nenhuma foto registrada para este serviço."
        });
      };
      if (aberto) montarCarrossel();

      topo.addEventListener("click", () => {
        const abrir = det.hidden;
        det.hidden = !abrir;
        card.classList.toggle("expandido", abrir);
        topo.setAttribute("aria-expanded", String(abrir));
        if (abrir) { abertos.add(s.id); montarCarrossel(); } else abertos.delete(s.id);
        avisar();
      });

      // Arrastar (HTML5 drag and drop). Não inicia arrasto a partir dos detalhes
      // (carrossel, links, botões), para não atrapalhar fotos e seleção de texto.
      let inicioNosDetalhes = false;
      card.addEventListener("pointerdown", (e) => { inicioNosDetalhes = !!e.target.closest(".kanban-detalhes"); });
      card.addEventListener("dragstart", (e) => {
        if (inicioNosDetalhes) { e.preventDefault(); return; }
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", s.id);
        card.classList.add("arrastando");
        alvo.classList.add("arrastando-ativo");
      });
      card.addEventListener("dragend", () => {
        card.classList.remove("arrastando");
        alvo.classList.remove("arrastando-ativo");
        Object.values(colunas).forEach((c) => c.classList.remove("alvo-soltar"));
      });

      // Alça de arrasto (mouse). No Firefox o arrasto não começa sobre botões; a alça resolve.
      const alca = document.createElement("span");
      alca.className = "kanban-alca";
      alca.title = "Arraste para mudar de etapa";
      alca.setAttribute("aria-hidden", "true");
      alca.innerHTML = ICONE_ALCA;

      card.append(alca, topo, det);
      li.append(card);
      return li;
    }

    /* ---------- 4. SOLTAR NUMA COLUNA ---------- */
    function ligarSoltar(col, etapaId) {
      col.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; col.classList.add("alvo-soltar"); });
      col.addEventListener("dragleave", (e) => { if (!col.contains(e.relatedTarget)) col.classList.remove("alvo-soltar"); });
      col.addEventListener("drop", (e) => {
        e.preventDefault();
        col.classList.remove("alvo-soltar");
        const id = e.dataTransfer.getData("text/plain");
        if (id) mover(id, etapaId, false);
      });
    }

    /* ---------- 5. MOVER SERVIÇO DE ETAPA ---------- */
    function mover(id, etapaId, focar) {
      const s = servicos.find((x) => x.id === id);
      if (!s || s.etapa === etapaId) return;
      if (SO_CLIENTE_FINALIZA && (etapaId === "prestado" || s.etapa === "prestado")) {
        mostrarAviso("Só o cliente marca o serviço como finalizado (Prestados). Ele faz isso pelo perfil dele, com fotos e avaliação.");
        return;
      }
      s.etapa = etapaId;
      if (etapaId === "prestado" && !s.dataConclusao) s.dataConclusao = U.hojeISO();   // demo: conclui hoje
      if (etapaId !== "prestado") s.dataConclusao = null;
      // Vai para o topo da coluna de destino
      servicos.splice(servicos.indexOf(s), 1);
      servicos.unshift(s);
      renderizar();
      const et = ETAPAS[indiceEtapa(etapaId)];
      anunciar(`"${s.servico}" movido para ${et.nome}.`);
      const card = alvo.querySelector(`.kanban-card[data-id="${CSS.escape(id)}"]`);
      if (card) {
        card.classList.add("recem-movido");
        setTimeout(() => card.classList.remove("recem-movido"), 1200);
        if (focar) card.querySelector(".kanban-card-topo").focus();
      }
    }

    /* ---------- 5b. ENCERRAR E EXCLUIR ---------- */
    function encerrar(id, motivo) {
      const s = servicos.find((x) => x.id === id);
      if (!s) return;
      s.etapaAnterior = s.etapa;
      s.etapa = "encerrado";
      s.motivo = motivo;
      s.dataEncerramento = U.hojeISO();
      abertos.delete(id);
      renderizar();
      anunciar(`"${s.servico}" foi para ${ENCERRADOS.nome}.`);
    }
    async function excluir(id) {
      const s = servicos.find((x) => x.id === id);
      if (!s) return;
      const ok = await confirmar({
        titulo: "Excluir de vez?",
        texto: `"${s.servico}" (${s.cliente}) será apagado e não poderá ser recuperado.`,
        sim: "Sim, excluir"
      });
      if (!ok) return;
      servicos.splice(servicos.indexOf(s), 1);   // demonstração: o servidor apagará de verdade
      renderizar();
      anunciar(`"${s.servico}" foi excluído.`);
      const lixo = alvoEncerrados && alvoEncerrados.querySelector(".kanban-encerrados-botao");
      if (lixo) lixo.focus();
    }

    /* ---------- 5c. ÁREA ENCERRADOS (sanfona, começa fechada) ---------- */
    let encerradosAberto = false;
    function renderizarEncerrados() {
      if (!alvoEncerrados) return;
      const lista = servicos.filter((s) => s.etapa === "encerrado")
        .sort((a, b) => String(b.dataEncerramento).localeCompare(String(a.dataEncerramento)));
      alvoEncerrados.className = "kanban-encerrados";
      alvoEncerrados.innerHTML = `
        <h3 class="kanban-encerrados-titulo">
          <button type="button" class="kanban-encerrados-botao" aria-expanded="${encerradosAberto}" aria-controls="kb-encerrados-corpo">
            <span class="kanban-marcador" aria-hidden="true"></span>${ENCERRADOS.nome} <span class="kanban-qtd">(${lista.length})</span>${SETA_BAIXO}
          </button>
        </h3>
        <p class="kanban-coluna-dica">${ENCERRADOS.dica}</p>
        <div id="kb-encerrados-corpo" ${encerradosAberto ? "" : "hidden"}>
          <p class="kanban-encerrados-aviso">Cada item é apagado automaticamente <strong>1 ano</strong> depois de encerrado. Você pode apagar antes pela lixeira.</p>
          <ul class="kanban-encerrados-lista"></ul>
          <p class="kanban-vazio" ${lista.length ? "hidden" : ""}>Nenhum pedido encerrado.</p>
        </div>`;
      const ul = alvoEncerrados.querySelector(".kanban-encerrados-lista");
      lista.forEach((s) => {
        const li = document.createElement("li");
        li.className = "kanban-encerrado";
        const recusado = s.motivo === ENCERRADOS.motivos.recusado;
        const textos = document.createElement("div");
        textos.className = "kanban-encerrado-textos";
        const t = document.createElement("strong"); t.textContent = s.servico;
        const c = document.createElement("span"); c.className = "kanban-card-cliente";
        c.textContent = `${s.cliente} · ${s.tipoCliente === "cnpj" ? "CNPJ" : "CPF"}`;
        const m = document.createElement("span");
        m.className = "kanban-motivo" + (recusado ? " recusado" : "");
        m.textContent = s.motivo || ENCERRADOS.motivos.prestador;
        const info = document.createElement("span");
        info.className = "kanban-encerrado-info";
        info.textContent = `Encerrado em ${U.formatarData(s.dataEncerramento)} · Será apagado em ${U.formatarData(somarDias(s.dataEncerramento, ENCERRADOS.diasParaExcluir))}`;
        textos.append(t, c, m, info);
        const lixo = document.createElement("button");
        lixo.type = "button";
        lixo.className = "btn btn-pequeno btn-icone kanban-lixeira";
        lixo.innerHTML = ICONE_LIXO;
        lixo.setAttribute("aria-label", `Excluir "${s.servico}" de ${s.cliente}`);
        lixo.title = "Excluir agora";
        lixo.addEventListener("click", () => excluir(s.id));
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
        const doEtapa = servicos.filter((s) => s.etapa === et.id);
        lista.innerHTML = "";
        doEtapa.forEach((s) => lista.append(criarCartao(s)));
        col.querySelector(".kanban-qtd").textContent = `(${doEtapa.length})`;
        col.querySelector(".kanban-coluna-soma").textContent = (doEtapa.length && et.id !== "aorcar") ? U.formatarMoeda(doEtapa.reduce((t, s) => t + Number(s.valor || 0), 0)) : "";
        col.querySelector(".kanban-vazio").hidden = doEtapa.length > 0;
        lista.hidden = doEtapa.length === 0;
      });

      // Resumo em números (sem gráficos)
      const soma = (ids) => servicos.filter((s) => ids.includes(s.etapa)).reduce((t, s) => t + Number(s.valor || 0), 0);
      if (resumo) {
        resumo.innerHTML = "";
        const novos = servicos.filter((s) => s.etapa === "aorcar").length;
        [
          ["Pedidos a orçar", `${novos} ${novos === 1 ? "pedido" : "pedidos"}`],
          ["Em orçamento", soma(["orcando"])],
          ["A receber (aceitos + a realizar)", soma(["aceito", "realizar"])],
          ["Recebido (prestados)", soma(["prestado"])]
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
      mover: (id, etapa) => mover(id, etapa, false),
      encerrar, excluir,
      etapas: ETAPAS.map((e) => ({ ...e }))
    };
  }

  window.SDKanban = { criar, ETAPAS, ENCERRADOS };
})();
