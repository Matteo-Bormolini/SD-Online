/* =====================================================================
   S.D — LOCALIZAR PRESTADOR / menu "Serviços" (localizar-prestador/localizar-prestador.js)
   1. O cliente escolhe um tipo de serviço (caixas, mesma lista da Home).
   2. Abre a lista de prestadores (do mais perto ao mais longe) e o mapa.
   3. Ao escolher um prestador: o mapa mostra a empresa e, abaixo do mapa,
      aparece o cartão (logo, nome, WhatsApp ou "Pedir contato", serviços, visita, "Ver perfil").
   Regras aprovadas (05/11/2026):
     - Destaque pago (tag "destaque"): contorno vermelho e etiqueta, mas
       NÃO muda a posição na lista (ordem só por distância).
     - Prestador com localização desativada no perfil: não aparece.
     - Cliente com localização desativada: lista em ordem alfabética,
       sem distância, com aviso para ativar no perfil.
     - WhatsApp só aparece se o prestador ativar "Mostrar meu WhatsApp
       na busca"; se não, botão cinza "liberado após o orçamento".
     - Sem botões de rota (Maps/Waze): o mapa basta.
   DADOS REAIS (v0.7.9, sem fictícios): a lista vem da VITRINE dos prestadores
   (firebase.js → listarPrestadores). O ponto do cliente vem do PERFIL (endereço)
   ou, se ele tocar em "Usar minha localização atual", do GPS do aparelho
   (pede permissão; o GPS NÃO é salvo em lugar nenhum). A distância é em linha reta.
   O ponto público do prestador é aproximado (~110 m), protegendo quem trabalha em casa.
   v0.8.0 (Ciclo 3):
     - FILTROS na tela (sem novas leituras do banco): nome, horário (1º horário = principal:
       dias de semana / fim de semana; "Atende emergência"), distância e preço da visita
       (quem não cobra = R$ 0; quem não informou só aparece em "Qualquer preço").
     - WhatsApp passa pelo AVISO DE COBRANÇA e registra o contato (componentes/pedidos).
     - Prestador sem contatos à mostra: botão "Pedir contato".
   ===================================================================== */
(function () {
  "use strict";
  if (!window.SD) { console.error("[S.D] localizar-prestador.js: carregue configuracoes/config.js antes."); return; }
  const SD = window.SD;
  const C = SD.config;
  const esc = SD.esc;

  /* ---------- 1. CONFIGURAÇÃO (fácil de ajustar) ---------- */
  const CONFIG = {
    maxServicosCartao: 3,                        // mostra 3 serviços e "+N" para o resto
    mensagemWhatsApp: "Olá! Encontrei sua empresa na S.D Serviços Digitais e gostaria de falar sobre um serviço.",
    larguraComputador: "(min-width: 62rem)"      // a partir daqui, lista e mapa ficam lado a lado
  };

  /* ---------- 2. CONEXÃO (firebase/firebase.js) ---------- */
  const firebase = () => (window.SDFirebase ? Promise.resolve(window.SDFirebase) : new Promise((ok) => {
    const t = setTimeout(() => ok(window.SDFirebase), 8000);
    document.addEventListener("sd:firebase-pronto", () => { clearTimeout(t); ok(window.SDFirebase); }, { once: true });
  }));

  /* ---------- 3. DISTÂNCIA (linha reta, em km) ----------
     Fórmula de Haversine (calculada no aparelho do cliente). */
  function distanciaKm(a, b) {
    const rad = (g) => (g * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  }
  const km = (n) => `${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;

  /* ---------- 4. DADOS REAIS ----------
     Cliente: ponto do perfil, se a Localização estiver ligada no perfil. */
  async function lerCliente() {
    const F = await firebase();
    const eu = F && F.meusDados ? await F.meusDados().catch(() => null) : null;
    const ligada = !(eu && eu.interruptores && eu.interruptores.localizacao === false);
    if (!eu || !ligada) return { localizacaoAtiva: false, motivo: "desligada" };
    if (!eu.local) return { localizacaoAtiva: false, motivo: "sem-ponto" };
    return { localizacaoAtiva: true, lat: eu.local.lat, lng: eu.local.lng, origem: "perfil" };
  }

  async function buscarPrestadores(categoria, cliente) {
    const F = await firebase();
    let vitrine = [];
    try { vitrine = F && F.listarPrestadores ? await F.listarPrestadores(categoria) : []; }
    catch (e) { console.warn("[S.D] Lista de prestadores:", e.code || e); throw e; }
    const comLocal = cliente.localizacaoAtiva;
    // v0.8.4 (decisão 23/11): Localização desligada = continua na LISTA, mas sem ponto no mapa e sem distância
    const lista = vitrine
      .filter((p) => p.nome)
      .map((p) => ({ ...p, semPonto: !(p.localizacao && typeof p.lat === "number" && typeof p.lng === "number") }))
      .map((p) => ({
        id: p.id, nome: p.nome, logo: p.foto || null, semPonto: p.semPonto,
        servicos: [p.areaAtuacao, ...(p.especialidades || [])].filter(Boolean),
        secundarias: (p.especialidades || []).length > 0,
        bairro: [p.bairro, p.cidade].filter(Boolean).join(", "),
        lat: p.semPonto ? null : p.lat, lng: p.semPonto ? null : p.lng, tags: [],
        whatsapp: p.whatsapp || null,                                           // só vem de quem liberou
        distancia: comLocal && !p.semPonto ? distanciaKm(cliente, p) : null,
        // v0.8.0: dados dos filtros e do aviso de cobrança
        emergencia: !!p.emergencia,
        faixaPrincipal: p.horarioAtendimento && Array.isArray(p.horarioAtendimento.faixas) ? p.horarioAtendimento.faixas[0] || null : null,
        cobraVisita: typeof p.cobraVisita === "boolean" ? p.cobraVisita : undefined,
        valorVisita: Number(p.valorVisita) || 0
      }));
    // Ordem: distância (com localização) ou alfabética (sem). Destaque NÃO muda a ordem.
    // Prestador sem ponto no mapa vai para o FIM da lista (em ordem alfabética).
    const alfabetica = (a, b) => a.nome.localeCompare(b.nome, "pt-BR");
    lista.sort(comLocal
      ? (a, b) => (a.semPonto - b.semPonto) || (a.semPonto ? alfabetica(a, b) : a.distancia - b.distancia)
      : alfabetica);
    return lista;
  }

  /* ---------- 5. ESTADO DA PÁGINA ---------- */
  const el = {
    setores: document.getElementById("setores"),
    resultados: document.getElementById("resultados"),
    titulo: document.getElementById("resultados-titulo"),
    dica: document.getElementById("resultados-dica"),
    lista: document.getElementById("lista-prestadores"),
    vazia: document.getElementById("lista-vazia"),
    mapa: document.getElementById("mapa"),
    mapaAviso: document.getElementById("mapa-aviso"),
    colunaMapa: document.querySelector(".coluna-mapa"),
    cartao: document.getElementById("cartao-prestador"),
    aviso: document.getElementById("aviso-localizacao"),
    avisoTexto: document.getElementById("aviso-localizacao-texto"),
    linkAtivar: document.getElementById("link-ativar-localizacao"),
    gps: document.getElementById("btn-gps"),
    gpsMsg: document.getElementById("msg-gps")
  };
  const estado = { cliente: { localizacaoAtiva: false }, categoria: null, lista: [], visiveis: [], selecionado: null, mapa: null, mapaPromessa: null };

  /* ---------- 5b. FILTROS (v0.8.0) ← MUDE AQUI as opções no index.html ---------- */
  const filtro = {
    form: document.getElementById("filtros"),
    nome: document.getElementById("filtro-nome"),
    horario: document.getElementById("filtro-horario"),
    distancia: document.getElementById("filtro-distancia"),
    visita: document.getElementById("filtro-visita"),
    limpar: document.getElementById("filtro-limpar"),
    limpar2: document.getElementById("filtro-limpar-2"),
    dica: document.getElementById("filtro-dica"),
    vazia: document.getElementById("lista-filtrada-vazia")
  };
  const semAcento = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const DIAS_SEMANA = [1, 2, 3, 4, 5], FIM_DE_SEMANA = [0, 6];          // 0 = domingo (componentes/datahora)
  function passaFiltros(p) {
    const nome = semAcento(filtro.nome.value.trim());
    if (nome && !semAcento(p.nome).includes(nome)) return false;
    const h = filtro.horario.value, dias = (p.faixaPrincipal && p.faixaPrincipal.dias) || [];
    if (h === "semana" && !dias.some((d) => DIAS_SEMANA.includes(d))) return false;
    if (h === "fimdesemana" && !dias.some((d) => FIM_DE_SEMANA.includes(d))) return false;
    if (h === "emergencia" && !p.emergencia) return false;
    const km = filtro.distancia.value;
    if (km && (p.distancia == null || p.distancia > Number(km))) return false;   // sem ponto: não dá para saber a distância
    const visita = filtro.visita.value;
    if (visita !== "") {
      if (p.cobraVisita === undefined) return false;                     // não informou: só em "Qualquer preço"
      const preco = p.cobraVisita ? p.valorVisita : 0;                   // não cobra = R$ 0
      if (preco > Number(visita)) return false;
    }
    return true;
  }
  const filtrosAtivos = () => [filtro.nome.value.trim(), filtro.horario.value, filtro.distancia.value, filtro.visita.value].filter(Boolean).length;
  function aplicarFiltros() {
    estado.visiveis = estado.lista.filter(passaFiltros);
    const ativos = filtrosAtivos();
    filtro.limpar.hidden = !ativos;
    filtro.dica.textContent = ativos ? `Mostrando ${estado.visiveis.length} de ${estado.lista.length}.` : "";
    filtro.vazia.hidden = !(ativos && estado.lista.length && !estado.visiveis.length);
    renderizarLista();
    if (estado.selecionado && !estado.visiveis.some((p) => p.id === estado.selecionado)) { estado.selecionado = null; renderizarCartao(null); salvarNaUrl(); }
    else if (estado.selecionado) el.lista.querySelectorAll(".item-prestador").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === estado.selecionado)));
    if (estado.mapa) {
      estado.mapa.definirPontos(pontosDoMapa(),
        { aoClicar: aoClicarNoMapa });
      if (estado.selecionado) estado.mapa.selecionar(estado.selecionado);
    }
  }
  function iniciarFiltros() {
    let espera = null;
    filtro.nome.addEventListener("input", () => { clearTimeout(espera); espera = setTimeout(aplicarFiltros, 200); });
    [filtro.horario, filtro.distancia, filtro.visita].forEach((c) => c.addEventListener("change", aplicarFiltros));
    filtro.form.addEventListener("submit", (e) => { e.preventDefault(); aplicarFiltros(); });
    filtro.form.addEventListener("reset", () => setTimeout(aplicarFiltros, 0));
    filtro.limpar2.addEventListener("click", () => { filtro.form.reset(); filtro.nome.focus(); });
  }
  // Sem a localização do cliente, o filtro de distância não funciona
  function atualizarFiltroDistancia() {
    filtro.distancia.disabled = !estado.cliente.localizacaoAtiva;
    if (filtro.distancia.disabled) filtro.distancia.value = "";
    filtro.distancia.title = filtro.distancia.disabled ? "Ative a localização no perfil ou use a localização atual" : "";
  }
  const suave = () => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  // Guarda a escolha no endereço da página (ao voltar do perfil, tudo continua igual)
  function salvarNaUrl() {
    const url = new URL(location.href);
    estado.categoria ? url.searchParams.set("categoria", estado.categoria) : url.searchParams.delete("categoria");
    estado.selecionado ? url.searchParams.set("prestador", estado.selecionado) : url.searchParams.delete("prestador");
    history.replaceState(null, "", url.href);
  }

  /* ---------- 6. CAIXAS DOS TIPOS DE SERVIÇO ---------- */
  function montarSetores() {
    el.setores.innerHTML = C.categorias.map((c) => `
      <li><button type="button" class="setor" data-categoria="${esc(c.id)}" aria-pressed="false" aria-controls="resultados">
        ${SD.iconeCategoria(c.icone)}<strong>${esc(c.nome)}</strong><span>${esc(c.desc)}</span>
      </button></li>`).join("");
    el.setores.addEventListener("click", (e) => {
      const botao = e.target.closest(".setor");
      if (botao) escolherCategoria(botao.dataset.categoria, { rolar: true });
    });
    // v0.8.5: "Trocar tipo de serviço" abre/fecha a lista de novo
    document.getElementById("btn-trocar-setor").addEventListener("click", () => recolherSetores(!el.setores.hidden));
  }

  // v0.8.5: recolhe a lista depois da escolha (fica o tipo escolhido + "Trocar tipo de serviço")
  function recolherSetores(recolher) {
    const caixa = document.getElementById("setor-escolhido"), botao = document.getElementById("btn-trocar-setor");
    const categoria = C.categorias.find((c) => c.id === estado.categoria);
    if (!categoria) { caixa.hidden = true; el.setores.hidden = false; return; }
    document.getElementById("setor-chip").innerHTML = `${SD.iconeCategoria(categoria.icone)}<span><span class="visualmente-oculto">Tipo escolhido: </span>${esc(categoria.nome)}</span>`;
    caixa.hidden = false;
    el.setores.hidden = recolher;
    botao.setAttribute("aria-expanded", String(!recolher));
    botao.textContent = recolher ? "Trocar tipo de serviço" : "Fechar lista de tipos";
    if (!recolher) { const atual = el.setores.querySelector('.setor[aria-pressed="true"]'); if (atual) atual.focus(); }
  }

  async function escolherCategoria(id, { rolar = false, prestador = null } = {}) {
    const categoria = C.categorias.find((c) => c.id === id);
    if (!categoria) return;
    estado.categoria = id;
    estado.selecionado = null;
    el.setores.querySelectorAll(".setor").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.categoria === id)));
    recolherSetores(true);

    try { estado.lista = await buscarPrestadores(id, estado.cliente); }
    catch (_) { estado.lista = []; el.vazia.textContent = "Não foi possível carregar a lista agora. Confira a internet e tente de novo."; }
    const n = estado.lista.length;
    el.titulo.textContent = `${categoria.nome} · ${n} ${n === 1 ? "prestador" : "prestadores"}`;
    el.dica.textContent = estado.cliente.localizacaoAtiva
      ? `Do mais perto ao mais longe (${estado.cliente.origem === "gps" ? "da sua localização atual" : "do endereço do seu perfil"}). Toque em um prestador para ver no mapa.`
      : "Em ordem alfabética (sem a sua localização). Toque em um prestador para ver no mapa.";
    estado.visiveis = estado.lista.filter(passaFiltros);
    aplicarFiltros();
    renderizarCartao(null);

    el.resultados.hidden = false;
    el.resultados.classList.remove("abrindo");
    void el.resultados.offsetWidth;                   // reinicia a animação de "descer"
    el.resultados.classList.add("abrindo");
    if (rolar) {
      el.resultados.scrollIntoView({ behavior: suave(), block: "start" });
      el.titulo.focus({ preventScroll: true });
    }
    await atualizarMapa();
    if (prestador && estado.visiveis.some((p) => p.id === prestador)) selecionar(prestador, { rolar: false });
    salvarNaUrl();
  }

  /* ---------- 7. LISTA DE PRESTADORES ---------- */
  const iniciais = (nome) => nome.split(/\s+/).filter((p) => /[A-Za-zÀ-ú]/.test(p)).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  const logo = (p, classe) => p.logo
    ? `<img class="${classe}" src="${esc(p.logo)}" alt="" width="56" height="56" loading="lazy">`
    : `<span class="${classe}" aria-hidden="true">${esc(iniciais(p.nome))}</span>`;
  const atributoDestaque = (p) => (SD.ehDestaque(p) ? ` data-tag="${esc(C.destaque.tag)}"` : "");
  const etiquetaDestaque = (p) => (SD.ehDestaque(p) ? `<span class="tag-destaque">${esc(C.destaque.rotulo)}</span>` : "");

  function renderizarLista() {
    el.vazia.hidden = estado.lista.length > 0;
    el.lista.innerHTML = estado.visiveis.map((p) => `
      <li><button type="button" class="item-prestador" data-id="${esc(p.id)}" aria-pressed="false"${atributoDestaque(p)}>
        ${logo(p, "item-logo")}
        <span class="item-texto">
          <strong class="item-nome">${esc(p.nome)}</strong>
          <span class="item-local">${esc(p.bairro)}${p.distancia != null ? ` · ${km(p.distancia)}` : ""}${p.semPonto ? " · sem localização no mapa" : ""}</span>
          ${etiquetaDestaque(p)}
        </span>
      </button></li>`).join("");
  }
  el.lista.addEventListener("click", (e) => {
    const botao = e.target.closest(".item-prestador");
    if (botao) selecionar(botao.dataset.id, { rolar: true });
  });

  function selecionar(id, { rolar = false } = {}) {
    const p = estado.lista.find((x) => x.id === id);
    if (!p) return;
    estado.selecionado = id;
    el.lista.querySelectorAll(".item-prestador").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === id)));
    if (estado.mapa) estado.mapa.selecionar(id);
    renderizarCartao(p);
    salvarNaUrl();
    // Celular/tablet: o mapa fica abaixo da lista, então desce até ele
    if (rolar && !window.matchMedia(CONFIG.larguraComputador).matches) {
      el.colunaMapa.scrollIntoView({ behavior: suave(), block: "start" });
    }
  }

  /* ---------- 8. CARTÃO (abaixo do mapa) ---------- */
  function renderizarCartao(p) {
    if (!p) {
      el.cartao.removeAttribute("data-tag");
      el.cartao.innerHTML = '<p class="cartao-vazio">Selecione um prestador na lista para ver os detalhes.</p>';
      return;
    }
    const visiveis = p.servicos.slice(0, CONFIG.maxServicosCartao);
    const resto = p.servicos.length - visiveis.length;
    const perfil = `${SD.urlPagina("perfilPrestador")}?visao=cliente&id=${encodeURIComponent(p.id)}`;
    const perfilUrl = `${perfil}&categoria=${encodeURIComponent(estado.categoria || "")}`;
    // v0.8.0: WhatsApp com aviso de cobrança + registro; sem contatos à mostra → "Pedir contato"
    const whatsapp = p.whatsapp
      ? `<a class="btn btn-whatsapp" id="cartao-whatsapp" href="https://wa.me/55${esc(p.whatsapp.replace(/\D/g, ""))}?text=${encodeURIComponent(CONFIG.mensagemWhatsApp)}" target="_blank" rel="noopener noreferrer">${SD.icones.whatsapp}<span>WhatsApp<span class="visualmente-oculto"> de ${esc(p.nome)} (abre em nova aba)</span></span></a>`
      : `<button type="button" class="btn btn-pedir-contato" id="cartao-pedir-contato">${SD.icones.whatsapp}<span>Pedir contato<span class="visualmente-oculto"> a ${esc(p.nome)}</span></span></button>`;
    const visita = p.cobraVisita === true ? `Visita técnica: ${Number(p.valorVisita).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`
      : p.cobraVisita === false ? "Não cobra visita técnica" : "Visita técnica: não informado";

    SD.ehDestaque(p) ? el.cartao.setAttribute("data-tag", C.destaque.tag) : el.cartao.removeAttribute("data-tag");
    el.cartao.innerHTML = `
      <div class="cartao-topo">
        ${logo(p, "cartao-logo")}
        <div>
          <h3 class="cartao-nome">${esc(p.nome)}</h3>
          ${etiquetaDestaque(p)}
        </div>
      </div>
      <h4 class="cartao-rotulo">Serviços</h4>
      <ul class="cartao-servicos">
        ${visiveis.map((s) => `<li>${esc(s)}</li>`).join("")}
        ${resto > 0 ? `<li class="cartao-mais" title="${esc(p.servicos.slice(CONFIG.maxServicosCartao).join(", "))}">+${resto}<span class="visualmente-oculto"> serviços: ${esc(p.servicos.slice(CONFIG.maxServicosCartao).join(", "))}</span></li>` : ""}
      </ul>
      <p class="cartao-visita">${esc(visita)}</p>
      ${p.semPonto ? '<p class="nota cartao-aviso cartao-sem-ponto">Este prestador não mostra a localização no mapa.</p>' : ""}
      ${p.secundarias ? `<p class="nota cartao-aviso">${esc(C.avisoSecundarias)}</p>` : ""}
      <div class="cartao-acoes">
        ${whatsapp}
        <a class="btn btn-orcamento" href="${esc(perfilUrl)}">Ver perfil<span class="visualmente-oculto"> de ${esc(p.nome)}</span></a>
      </div>`;
    ligarContato(p);
  }

  /* ---------- 8b. CONTATO (v0.8.0): aviso de cobrança + registro (componentes/pedidos) ---------- */
  function ligarContato(p) {
    const categoria = C.categorias.find((c) => c.id === estado.categoria);
    const dados = {
      prestador: { id: p.id, nome: p.nome, cobraVisita: p.cobraVisita, valorVisita: p.valorVisita, secundarias: p.secundarias },
      categoria: estado.categoria, servicoNome: categoria ? categoria.nome : "Serviço"
    };
    const zap = document.getElementById("cartao-whatsapp");
    if (zap) zap.addEventListener("click", (e) => {
      if (!window.SDPedidos) return;                                     // módulo ainda não carregou: link normal
      window.SDPedidos.chamarWhatsApp(e, { ...dados, link: zap.href });
    });
    const pedir = document.getElementById("cartao-pedir-contato");
    if (pedir) pedir.addEventListener("click", () => {
      if (!window.SDPedidos) return;                                     // ainda carregando
      window.SDPedidos.pedirContato(dados);
    });
  }

  /* ---------- 9. MAPA ---------- */
  // Só quem tem ponto vai para o mapa (Localização desligada = só na lista)
  const pontosDoMapa = () => estado.visiveis.filter((p) => !p.semPonto)
    .map((p) => ({ id: p.id, nome: p.nome, lat: p.lat, lng: p.lng, destaque: SD.ehDestaque(p) }));
  function aoClicarNoMapa(id) {
    selecionar(id);
    const botao = el.lista.querySelector(`.item-prestador[data-id="${CSS.escape(id)}"]`);
    if (botao) botao.scrollIntoView({ behavior: suave(), block: "nearest" });
  }
  function avisoMapa(texto) {
    el.mapaAviso.textContent = texto;
    el.mapaAviso.hidden = !texto;
  }

  async function atualizarMapa() {
    if (!window.SDMapa) { avisoMapa("O mapa não está disponível. A lista continua funcionando."); return; }
    try {
      if (!estado.mapaPromessa) {
        const centro = estado.cliente.localizacaoAtiva ? estado.cliente : C.mapa.centroPadrao;
        estado.mapaPromessa = SDMapa.criar(el.mapa, {
          centro,
          aoFalhar: () => avisoMapa("Não foi possível carregar o desenho do mapa agora. A lista continua funcionando.")
        });
      }
      estado.mapa = await estado.mapaPromessa;
      avisoMapa("");
      estado.mapa.redimensionar();
      estado.mapa.marcarUsuario(estado.cliente.localizacaoAtiva ? estado.cliente : null);
      estado.mapa.definirPontos(
        pontosDoMapa(),
        { aoClicar: aoClicarNoMapa }
      );
      estado.mapa.ajustarVisao();
    } catch (erro) {
      estado.mapaPromessa = null;   // tenta de novo na próxima escolha
      console.warn("[S.D] Mapa:", erro && erro.message ? erro.message : erro);
      avisoMapa("Não foi possível carregar o mapa agora. A lista continua funcionando.");
    }
  }

  /* ---------- 10. LOCALIZAÇÃO DO CLIENTE (perfil ou GPS) ---------- */
  function mostrarAvisoLocal() {
    const c = estado.cliente;
    el.aviso.hidden = c.localizacaoAtiva;
    if (c.localizacaoAtiva) return;
    el.avisoTexto.textContent = c.motivo === "sem-ponto"
      ? "Ainda não encontramos o ponto do seu endereço no mapa. Confira o CEP e o número no perfil ou use a localização atual."
      : "Sua localização está desativada no perfil. A lista aparece em ordem alfabética, sem distância.";
    el.linkAtivar.href = SD.urlPerfil();
  }
  // GPS do aparelho: pede permissão; vale só nesta página (não é salvo)
  function usarGps() {
    if (!("geolocation" in navigator)) { el.gpsMsg.textContent = "Este aparelho não informa a localização."; return; }
    el.gps.disabled = true;
    el.gpsMsg.textContent = "Procurando sua localização…";
    navigator.geolocation.getCurrentPosition(async (pos) => {
      estado.cliente = { localizacaoAtiva: true, lat: pos.coords.latitude, lng: pos.coords.longitude, origem: "gps" };
      el.gps.disabled = false;
      el.gpsMsg.textContent = "Usando sua localização atual (não fica salva).";
      mostrarAvisoLocal();
      atualizarFiltroDistancia();
      if (estado.mapa) estado.mapa.marcarUsuario(estado.cliente);
      if (estado.categoria) await escolherCategoria(estado.categoria, { prestador: estado.selecionado });
    }, (erro) => {
      el.gps.disabled = false;
      el.gpsMsg.textContent = erro.code === 1
        ? "Permissão negada. Para usar, libere a localização deste site no navegador."
        : "Não foi possível obter a localização agora. Tente de novo.";
    }, { enableHighAccuracy: false, timeout: 15000, maximumAge: 300000 });
  }

  /* ---------- 11. INÍCIO ---------- */
  async function iniciar() {
    montarSetores();
    el.gps.addEventListener("click", usarGps);
    iniciarFiltros();
    estado.cliente = await lerCliente();
    mostrarAvisoLocal();
    atualizarFiltroDistancia();
    // Chegou com um tipo escolhido (Home ou voltando do perfil do prestador)
    const params = new URLSearchParams(location.search);
    const categoria = params.get("categoria");
    if (categoria) escolherCategoria(categoria, { prestador: params.get("prestador") });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
