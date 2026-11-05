/* =====================================================================
   S.D — MAPA (componentes/mapa/mapa.js)
   Mapa gratuito e sem chave: MapLibre GL (biblioteca) + OpenFreeMap (mapas).
   Endereços dos arquivos ficam em configuracoes/config.js → CONFIG.mapa.
   A biblioteca só é baixada quando o mapa é usado pela primeira vez
   (a página abre mais rápido).

   Como usar:
     const mapa = await SDMapa.criar(elemento, { centro: {lat, lng} });
     mapa.marcarUsuario({ lat, lng });                 // ponto "Você"
     mapa.definirPontos(lista, { aoClicar: (id) => {} });
        lista = [{ id, nome, lat, lng, destaque: true|false }]
     mapa.selecionar(id);                              // centraliza e realça
     mapa.ajustarVisao();                              // mostra todos os pontos
   Se o mapa não carregar (sem internet, navegador sem WebGL), criar()
   dá erro e a página mostra um aviso; a lista continua funcionando.
   ===================================================================== */
(function () {
  "use strict";
  if (!window.SD) { console.error("[S.D] mapa.js: carregue configuracoes/config.js antes."); return; }
  const SD = window.SD;
  const C = SD.config.mapa;

  /* ---------- 1. CARREGAR A BIBLIOTECA (uma vez só) ---------- */
  let carregando = null;
  function carregarBiblioteca() {
    if (window.maplibregl) return Promise.resolve(window.maplibregl);
    if (carregando) return carregando;
    carregando = new Promise((ok, erro) => {
      const css = document.createElement("link");
      css.rel = "stylesheet";
      css.href = C.css;
      document.head.appendChild(css);
      const js = document.createElement("script");
      js.src = C.script;
      js.async = true;
      js.onload = () => (window.maplibregl ? ok(window.maplibregl) : erro(new Error("Biblioteca do mapa não carregou.")));
      js.onerror = () => { carregando = null; erro(new Error("Sem conexão com o servidor do mapa.")); };
      document.head.appendChild(js);
    });
    return carregando;
  }

  /* ---------- 2. MARCADORES (desenhados com HTML + CSS) ---------- */
  function elementoMarcador(classe, rotulo) {
    const el = document.createElement("div");
    el.className = "mapa-marcador " + classe;
    el.setAttribute("aria-hidden", "true");     // quem usa teclado escolhe pela lista
    el.title = rotulo;
    return el;
  }

  // Textos do mapa em português
  const TEXTOS = {
    "AttributionControl.ToggleAttribution": "Mostrar créditos do mapa",
    "AttributionControl.MapFeedback": "Enviar sugestão sobre o mapa",
    "CooperativeGesturesHandler.WindowsHelpText": "Use Ctrl + rolagem para aproximar o mapa",
    "CooperativeGesturesHandler.MacHelpText": "Use ⌘ + rolagem para aproximar o mapa",
    "CooperativeGesturesHandler.MobileHelpText": "Use dois dedos para mover o mapa",
    "Map.Title": "Mapa",
    "Marker.Title": "Ponto no mapa",
    "NavigationControl.ZoomIn": "Aproximar",
    "NavigationControl.ZoomOut": "Afastar",
    "NavigationControl.ResetBearing": "Voltar o norte para cima",
    "Popup.Close": "Fechar"
  };

  /* ---------- 3. CRIAR O MAPA ---------- */
  async function criar(elemento, opcoes = {}) {
    const maplibregl = await carregarBiblioteca();
    const centro = opcoes.centro || C.centroPadrao;

    const mapa = new maplibregl.Map({
      container: elemento,
      style: C.estilo,
      center: [centro.lng, centro.lat],   // MapLibre usa [longitude, latitude]
      zoom: opcoes.zoom || C.zoom,
      attributionControl: { compact: true },
      cooperativeGestures: true,           // a página continua rolando; mapa: Ctrl + rolagem ou 2 dedos
      locale: TEXTOS
    });
    mapa.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    // Erro ao baixar os mapas: avisa a página uma vez (a lista continua)
    let avisou = false;
    mapa.on("error", (e) => {
      if (avisou || typeof opcoes.aoFalhar !== "function") return;
      avisou = true;
      opcoes.aoFalhar(e && e.error ? e.error : e);
    });

    const pontos = new Map();   // id → { marcador, elemento, ponto }
    let usuario = null;
    let aoClicar = null;

    const api = {
      marcarUsuario(ponto) {
        if (usuario) { usuario.remove(); usuario = null; }
        if (!ponto) return;
        usuario = new maplibregl.Marker({ element: elementoMarcador("mapa-marcador-voce", "Você") })
          .setLngLat([ponto.lng, ponto.lat]).addTo(mapa);
        api.usuario = ponto;
      },
      definirPontos(lista, extra = {}) {
        pontos.forEach((p) => p.marcador.remove());
        pontos.clear();
        aoClicar = extra.aoClicar || null;
        lista.forEach((p) => {
          const el = elementoMarcador(p.destaque ? "mapa-marcador-destaque" : "", p.nome);
          el.addEventListener("click", (e) => { e.stopPropagation(); if (aoClicar) aoClicar(p.id); });
          const marcador = new maplibregl.Marker({ element: el }).setLngLat([p.lng, p.lat]).addTo(mapa);
          pontos.set(p.id, { marcador, elemento: el, ponto: p });
        });
      },
      selecionar(id) {
        pontos.forEach((p, chave) => p.elemento.classList.toggle("selecionado", chave === id));
        const alvo = pontos.get(id);
        if (!alvo) return;
        // Só centraliza (aproxima um pouco se estiver longe), sem esconder os vizinhos
        mapa.easeTo({ center: [alvo.ponto.lng, alvo.ponto.lat], zoom: Math.max(mapa.getZoom(), 12.5), duration: 600 });
      },
      ajustarVisao() {
        const todos = [...pontos.values()].map((p) => [p.ponto.lng, p.ponto.lat]);
        if (api.usuario) todos.push([api.usuario.lng, api.usuario.lat]);
        if (!todos.length) return;
        if (todos.length === 1) { mapa.easeTo({ center: todos[0], zoom: 14, duration: 0 }); return; }
        const caixa = new maplibregl.LngLatBounds(todos[0], todos[0]);
        todos.forEach((t) => caixa.extend(t));
        mapa.fitBounds(caixa, { padding: 48, maxZoom: 15, duration: 0 });
      },
      redimensionar() { mapa.resize(); },
      usuario: null,
      bruto: mapa                           // acesso direto ao MapLibre, se precisar
    };
    return api;
  }

  window.SDMapa = Object.freeze({ criar });
})();
