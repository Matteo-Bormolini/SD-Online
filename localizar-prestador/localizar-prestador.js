/* =====================================================================
   S.D — LOCALIZAR PRESTADOR / menu "Serviços" (localizar-prestador/localizar-prestador.js)
   1. O cliente escolhe um tipo de serviço (caixas, mesma lista da Home).
   2. Abre a lista de prestadores (do mais perto ao mais longe) e o mapa.
   3. Ao escolher um prestador: o mapa mostra a empresa e, abaixo do mapa,
      aparece o cartão (logo, nome, WhatsApp, serviços, "Fazer orçamento").
   Regras aprovadas (05/11/2026):
     - Destaque pago (tag "destaque"): contorno vermelho e etiqueta, mas
       NÃO muda a posição na lista (ordem só por distância).
     - Prestador com localização desativada no perfil: não aparece.
     - Cliente com localização desativada: lista em ordem alfabética,
       sem distância, com aviso para ativar no perfil.
     - WhatsApp só aparece se o prestador ativar "Mostrar meu WhatsApp
       na busca"; se não, botão cinza "liberado após o orçamento".
     - Sem botões de rota (Maps/Waze): o mapa basta.
   ATENÇÃO: em produção a lista vem do SERVIDOR, já filtrada e com a
   distância calculada lá (o endereço exato do cliente não sai do servidor).
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

  /* ---------- 2. DADOS DE DEMONSTRAÇÃO ----------
     Substituir pela resposta da API, por exemplo:
       GET /api/prestadores?categoria=eletrica
     O servidor devolve SÓ prestadores com localização ativa, a distância já
     calculada e o WhatsApp apenas de quem liberou. Nomes e números fictícios. */
  const DEMO = {
    // Cliente logado: ponto do endereço do cadastro (o servidor calcula a partir do perfil).
    // Para testar sem localização: abra a página com ?localizacao=desativada
    cliente: { localizacaoAtiva: true, lat: -23.5614, lng: -46.6559 },
    prestadores: [
      { id: "p1",  nome: "Alfa Elétrica",           categorias: ["eletrica"],                   servicos: ["Quadros elétricos", "Tomadas e interruptores", "Iluminação", "Aterramento", "Laudo NR-10"], bairro: "Centro",         lat: -23.5489, lng: -46.6388, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000001", tags: ["destaque"] },
      { id: "p7",  nome: "Volt Instalações",        categorias: ["eletrica"],                   servicos: ["Iluminação", "Tomadas e interruptores"],                    bairro: "Consolação",     lat: -23.5530, lng: -46.6600, localizacaoAtiva: true,  whatsappPublico: false, whatsapp: "11920000007", tags: [] },
      { id: "p8",  nome: "Circuito Certo",          categorias: ["eletrica", "reparos"],        servicos: ["Quadros elétricos", "Padrão de entrada", "Pequenos reparos"], bairro: "Pinheiros",      lat: -23.5670, lng: -46.6930, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000008", tags: [] },
      { id: "p9",  nome: "Luz & Cia",               categorias: ["eletrica"],                   servicos: ["Iluminação de áreas comuns", "Sensores de presença"],        bairro: "Vila Mariana",   lat: -23.5890, lng: -46.6340, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000009", tags: [] },
      { id: "p10", nome: "Energia Sul",             categorias: ["eletrica"],                   servicos: ["Geradores", "Quadros elétricos"],                            bairro: "Moema",          lat: -23.6010, lng: -46.6650, localizacaoAtiva: false, whatsappPublico: true,  whatsapp: "11920000010", tags: [] },
      { id: "p2",  nome: "Beta Hidráulica",         categorias: ["hidraulica"],                 servicos: ["Vazamentos", "Caça-vazamento", "Bombas de recalque", "Caixa d'água"], bairro: "Vila Nova Conceição", lat: -23.5880, lng: -46.6700, localizacaoAtiva: true, whatsappPublico: true, whatsapp: "11920000002", tags: [] },
      { id: "p11", nome: "Fluxo Encanamentos",      categorias: ["hidraulica"],                 servicos: ["Desentupimento", "Troca de registros"],                      bairro: "Santa Cecília",  lat: -23.5370, lng: -46.6510, localizacaoAtiva: true,  whatsappPublico: false, whatsapp: "11920000011", tags: ["destaque"] },
      { id: "p12", nome: "Gota Zero",               categorias: ["hidraulica", "infiltracao"],  servicos: ["Caça-vazamento", "Impermeabilização de reservatórios"],     bairro: "Perdizes",       lat: -23.5360, lng: -46.6770, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000012", tags: [] },
      { id: "p3",  nome: "Gama Impermeabilizações", categorias: ["infiltracao"],                servicos: ["Lajes", "Telhados e calhas", "Paredes", "Garagens"],          bairro: "Jardim América", lat: -23.5770, lng: -46.6800, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000003", tags: [] },
      { id: "p13", nome: "Telhado Firme",           categorias: ["infiltracao", "reparos"],     servicos: ["Telhados", "Calhas e rufos"],                                bairro: "Aclimação",      lat: -23.5720, lng: -46.6300, localizacaoAtiva: true,  whatsappPublico: false, whatsapp: "11920000013", tags: [] },
      { id: "p6",  nome: "Zeta Pinturas",           categorias: ["pintura"],                    servicos: ["Pintura interna", "Fachadas", "Textura", "Grafiato", "Verniz"], bairro: "Mooca",          lat: -23.5590, lng: -46.5990, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000006", tags: [] },
      { id: "p14", nome: "Cor Viva Acabamentos",    categorias: ["pintura"],                    servicos: ["Pintura interna", "Massa corrida"],                           bairro: "Bela Vista",     lat: -23.5580, lng: -46.6450, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000014", tags: ["destaque"] },
      { id: "p15", nome: "Pincel de Ouro",          categorias: ["pintura"],                    servicos: ["Fachadas", "Pintura de garagens"],                            bairro: "Lapa",           lat: -23.5220, lng: -46.7040, localizacaoAtiva: true,  whatsappPublico: false, whatsapp: "11920000015", tags: [] },
      { id: "p4",  nome: "Delta Climatização",      categorias: ["climatizacao"],               servicos: ["Instalação", "Limpeza e higienização", "Reparo", "PMOC"],     bairro: "Bela Vista",     lat: -23.5600, lng: -46.6500, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000004", tags: ["destaque"] },
      { id: "p16", nome: "Polar Refrigeração",      categorias: ["climatizacao"],               servicos: ["Limpeza e higienização", "Carga de gás"],                    bairro: "Itaim Bibi",     lat: -23.5850, lng: -46.6780, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000016", tags: [] },
      { id: "p5",  nome: "Épsilon Portões",         categorias: ["portoes"],                    servicos: ["Motores de portão", "Fechaduras", "Interfones"],             bairro: "Santa Cecília",  lat: -23.5400, lng: -46.6530, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000005", tags: [] },
      { id: "p17", nome: "Acesso Seguro",           categorias: ["portoes", "monitoramento"],   servicos: ["Interfones", "Controle de acesso", "Câmeras"],               bairro: "Liberdade",      lat: -23.5580, lng: -46.6350, localizacaoAtiva: true,  whatsappPublico: false, whatsapp: "11920000017", tags: [] },
      { id: "p18", nome: "Olho Vivo CFTV",          categorias: ["monitoramento"],              servicos: ["Câmeras", "Gravadores (DVR/NVR)", "TVs de monitoramento"],   bairro: "Paraíso",        lat: -23.5760, lng: -46.6410, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000018", tags: ["destaque"] },
      { id: "p19", nome: "Faz Tudo Reparos",        categorias: ["reparos"],                    servicos: ["Alvenaria", "Marcenaria", "Serralheria", "Pequenos reparos"], bairro: "Cambuci",        lat: -23.5660, lng: -46.6200, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000019", tags: [] },
      { id: "p20", nome: "Casa Equipada",           categorias: ["equipamentos"],               servicos: ["TVs de monitoramento", "Bombas d'água", "Motores de portão"], bairro: "Brás",           lat: -23.5440, lng: -46.6160, localizacaoAtiva: true,  whatsappPublico: true,  whatsapp: "11920000020", tags: [] }
    ]
  };

  /* ---------- 3. DISTÂNCIA (linha reta, em km) ----------
     Fórmula de Haversine. Em produção, o cálculo é feito no servidor. */
  function distanciaKm(a, b) {
    const rad = (g) => (g * Math.PI) / 180;
    const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  }
  const km = (n) => `${Number(n).toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} km`;

  /* ---------- 4. "SERVIDOR" DE DEMONSTRAÇÃO ----------
     Faz o que a API fará: filtra, esconde dados não liberados, calcula e ordena. */
  function lerCliente() {
    const desativada = C.modoDemonstracao && new URLSearchParams(location.search).get("localizacao") === "desativada";
    return desativada ? { localizacaoAtiva: false } : DEMO.cliente;
  }

  function buscarPrestadores(categoria, cliente) {
    const comLocal = cliente.localizacaoAtiva;
    const lista = DEMO.prestadores
      .filter((p) => p.localizacaoAtiva && p.categorias.includes(categoria))   // localização desligada = não aparece
      .map((p) => ({
        id: p.id, nome: p.nome, logo: p.logo || null, servicos: p.servicos.slice(),
        bairro: p.bairro, lat: p.lat, lng: p.lng, tags: p.tags.slice(),
        whatsapp: p.whatsappPublico ? p.whatsapp : null,                        // número só de quem liberou
        distancia: comLocal ? distanciaKm(cliente, p) : null
      }));
    // Ordem: distância (com localização) ou alfabética (sem). Destaque NÃO muda a ordem.
    lista.sort(comLocal
      ? (a, b) => a.distancia - b.distancia
      : (a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
    return Promise.resolve(lista);
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
    linkAtivar: document.getElementById("link-ativar-localizacao")
  };
  const estado = { cliente: lerCliente(), categoria: null, lista: [], selecionado: null, mapa: null, mapaPromessa: null };
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
  }

  async function escolherCategoria(id, { rolar = false, prestador = null } = {}) {
    const categoria = C.categorias.find((c) => c.id === id);
    if (!categoria) return;
    estado.categoria = id;
    estado.selecionado = null;
    el.setores.querySelectorAll(".setor").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.categoria === id)));

    estado.lista = await buscarPrestadores(id, estado.cliente);
    const n = estado.lista.length;
    el.titulo.textContent = `${categoria.nome} · ${n} ${n === 1 ? "prestador" : "prestadores"}`;
    el.dica.textContent = estado.cliente.localizacaoAtiva
      ? "Do mais perto ao mais longe. Toque em um prestador para ver no mapa."
      : "Em ordem alfabética (localização desativada). Toque em um prestador para ver no mapa.";
    renderizarLista();
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
    if (prestador && estado.lista.some((p) => p.id === prestador)) selecionar(prestador, { rolar: false });
    salvarNaUrl();
  }

  /* ---------- 7. LISTA DE PRESTADORES ---------- */
  const iniciais = (nome) => nome.split(/\s+/).filter((p) => /[A-Za-zÀ-ú]/.test(p)).slice(0, 2).map((p) => p[0]).join("").toUpperCase();
  const logo = (p, classe) => p.logo
    ? `<img class="${classe}" src="${esc(SD.caminho(p.logo))}" alt="" width="56" height="56" loading="lazy">`
    : `<span class="${classe}" aria-hidden="true">${esc(iniciais(p.nome))}</span>`;
  const atributoDestaque = (p) => (SD.ehDestaque(p) ? ` data-tag="${esc(C.destaque.tag)}"` : "");
  const etiquetaDestaque = (p) => (SD.ehDestaque(p) ? `<span class="tag-destaque">${esc(C.destaque.rotulo)}</span>` : "");

  function renderizarLista() {
    el.vazia.hidden = estado.lista.length > 0;
    el.lista.innerHTML = estado.lista.map((p) => `
      <li><button type="button" class="item-prestador" data-id="${esc(p.id)}" aria-pressed="false"${atributoDestaque(p)}>
        ${logo(p, "item-logo")}
        <span class="item-texto">
          <strong class="item-nome">${esc(p.nome)}</strong>
          <span class="item-local">${esc(p.bairro)}${p.distancia != null ? ` · ${km(p.distancia)}` : ""}</span>
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
    const whatsapp = p.whatsapp
      ? `<a class="btn btn-whatsapp" href="https://wa.me/55${esc(p.whatsapp.replace(/\D/g, ""))}?text=${encodeURIComponent(CONFIG.mensagemWhatsApp)}" target="_blank" rel="noopener noreferrer">${SD.icones.whatsapp}<span>WhatsApp<span class="visualmente-oculto"> de ${esc(p.nome)} (abre em nova aba)</span></span></a>`
      : `<span class="btn btn-whatsapp-off" role="note">${SD.icones.whatsapp}<span>WhatsApp liberado após o orçamento</span></span>`;

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
      <div class="cartao-acoes">
        ${whatsapp}
        <a class="btn btn-orcamento" href="${esc(perfil)}">Fazer orçamento<span class="visualmente-oculto"> com ${esc(p.nome)}</span></a>
      </div>`;
  }

  /* ---------- 9. MAPA ---------- */
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
        estado.lista.map((p) => ({ id: p.id, nome: p.nome, lat: p.lat, lng: p.lng, destaque: SD.ehDestaque(p) })),
        { aoClicar: (id) => {
          selecionar(id);
          const botao = el.lista.querySelector(`.item-prestador[data-id="${CSS.escape(id)}"]`);
          if (botao) botao.scrollIntoView({ behavior: suave(), block: "nearest" });
        } }
      );
      estado.mapa.ajustarVisao();
    } catch (erro) {
      estado.mapaPromessa = null;   // tenta de novo na próxima escolha
      console.warn("[S.D] Mapa:", erro && erro.message ? erro.message : erro);
      avisoMapa("Não foi possível carregar o mapa agora. A lista continua funcionando.");
    }
  }

  /* ---------- 10. INÍCIO ---------- */
  function iniciar() {
    // Aviso de localização desativada (link leva ao perfil do próprio tipo de conta)
    if (!estado.cliente.localizacaoAtiva) {
      el.aviso.hidden = false;
      el.linkAtivar.href = SD.urlPerfil();
    }
    montarSetores();
    // Chegou com um tipo escolhido (Home ou voltando do perfil do prestador)
    const params = new URLSearchParams(location.search);
    const categoria = params.get("categoria");
    if (categoria) escolherCategoria(categoria, { prestador: params.get("prestador") });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
