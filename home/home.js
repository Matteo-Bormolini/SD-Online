/* =====================================================================
   S.D — PÁGINA INICIAL / HOME (home/home.js)
   Uma só página com duas visões:
     • Visitante (data-logado="nao"): convite para entrar. Nada de
       prestadores, fotos ou avaliações.
     • Logado (data-logado="sim"): a parte de convite é REMOVIDA; aparecem
       os tipos de serviço e os prestadores reais perto do cliente.
     • Cliente (v0.8.5): logo depois do "Olá" vêm os "Comunicados da S.D" (para clientes ou para todos) e,
       embaixo, os "Anúncios" (etiqueta "Anúncio" sempre). Ordem:
       Olá → Avisos → Anúncios → Serviços → Prestadores perto de você.
     • Adm (v0.8.5): vê TUDO — o que os clientes veem (comunicados e anúncios) e o
       que os prestadores veem (comunicados, divulgações, eventos e grupos). Barra "Ver como"
       no topo (componentes/ver-como) mostra a página como Visitante, Cliente
       CPF, Cliente CNPJ ou Prestador.
       ESPELHO: a prévia do adm SEMPRE lê o banco na hora (sem cache) e, se falhar,
       mostra o motivo na tela (antes podia ficar uma leitura antiga vazia).
   ATENÇÃO: esconder na tela não é segurança. Em produção, os dados da
   vitrine devem vir do SERVIDOR e só para quem tem sessão válida.
   ===================================================================== */
(function () {
  "use strict";
  if (!window.SD) { console.error("[S.D] home.js: carregue configuracoes/config.js antes."); return; }

  /* ---------- 1. CAMINHOS ----------
     Vêm de configuracoes/config.js (window.SD), assim todas as páginas usam
     os mesmos endereços. Só as páginas exclusivas da Home ficam aqui. */
  const SD = window.SD;
  const CAMINHOS = {
    login:             SD.urlPagina("login"),
    cadastro:          SD.urlPagina("cadastro"),
    cadastroCliente:   SD.urlPagina("cadastro") + "&perfil=cliente",
    cadastroPrestador: SD.urlPagina("cadastro") + "&perfil=prestador",
    buscarPrestador:   SD.caminho("localizar-prestador/index.html"),    // menu "Serviços" (clientes)
    localizarCondominios: SD.caminho("localizar-condominios/index.html"), // menu "Seus Serviços" (prestador)
    perfilPrestador:   SD.caminho("perfil-prestador/index.html")        // abre com ?visao=cliente
  };

  /* ---------- 2. CATEGORIAS EM FOCO ----------
     A lista fica em configuracoes/config.js (a mesma de Localizar prestador). */
  const CATEGORIAS = SD.config.categorias;

  /* ---------- 3. DADOS ----------
     Sem dados fictícios (v0.7.9). A faixa "Prestadores perto de você" vem da
     VITRINE real (firebase.js → listarPrestadores). Avaliações, trabalhos e
     números do site voltam quando existirem dados reais (pós-MVP). */
  const MAX_PRESTADORES_HOME = 12;
  const distanciaKm = (a, b) => {
    const r = (g) => (g * Math.PI) / 180, dLat = r(b.lat - a.lat), dLng = r(b.lng - a.lng);
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(dLng / 2) ** 2;
    return 6371 * 2 * Math.asin(Math.sqrt(h));
  };

  /* ---------- 4. ÍCONES (traço, cor herdada) ---------- */
  // Ícones das categorias vêm de config.js; aqui ficam só os exclusivos da Home
  const P = {
    ...SD.iconesCategoria,
    lupa:     '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    esquerda: '<path d="m15 18-6-6 6-6"/>',
    direita:  '<path d="m9 18 6-6-6-6"/>',
    local:    '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>'
  };

  const icone = (nome, extra = "") =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${extra}>${P[nome] || ""}</svg>`;

  /* ---------- 5. UTILITÁRIOS ---------- */
  // Escapa texto vindo do servidor (evita injeção de HTML)
  const esc = SD.esc;
  const numBR = (n, casas = 1) => Number(n).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  const iniciais = SD.iniciais;


  /* ---------- 6. VISITANTE ---------- */
  function montarVisitante(raiz) {
    const lista = raiz.querySelector('[data-lista="categorias-visitante"]');
    if (lista) lista.innerHTML = CATEGORIAS.map((c) => `<li>${esc(c.nome)}</li>`).join("");
  }

  /* ---------- 7. LOGADO ----------
     tipoVisto: o tipo da conta OU, para o adm, a escolha do "Ver como" (v0.8.5).
     previa = true → adm vendo como outro tipo (dados lidos como adm). */
  function montarLogado(alvo, tipoVisto, previa = false) {
    const corpo = document.body;
    const nome = corpo.dataset.nome ? `, ${esc(corpo.dataset.nome)}` : "";   // servidor pode preencher data-nome
    const tipo = tipoVisto || corpo.dataset.tipo || "";                        // cliente-cpf | cliente-cnpj | prestador | adm
    const ehPrestador = tipo === "prestador";
    const ehCliente = tipo.startsWith("cliente");
    const ehAdm = tipo === "adm" && !previa;

    // PRESTADOR: não vê a vitrine (outros prestadores, avaliações e trabalhos são
    // dados da concorrência). Tem Home própria (v0.8.2): home/home-prestador.js.
    if (ehPrestador) { montarPrestador(alvo, nome, previa); return; }

    const atalhos = [
      `<a class="btn" href="${CAMINHOS.buscarPrestador}">Pedir orçamento</a>`,
      !ehCliente && `<a class="btn" href="${CAMINHOS.localizarCondominios}">Seus Serviços</a>`
    ].filter(Boolean).join("");

    alvo.innerHTML = `
      <section class="boas-vindas" aria-labelledby="ola-titulo">
        <h1 id="ola-titulo">Olá${nome}! O que precisa resolver hoje?</h1>
        <p>Escolha um tipo de serviço ou veja os prestadores perto de você.</p>
        <form class="busca" role="search" action="${CAMINHOS.buscarPrestador}" method="get">
          <label class="visualmente-oculto" for="busca-q">Buscar serviço ou prestador</label>
          <input id="busca-q" name="q" type="search" placeholder="Ex.: vazamento no banheiro, motor do portão" autocomplete="off">
          <button class="btn btn-grande" type="submit">${icone("lupa")}<span>Buscar</span></button>
        </form>
        <div class="atalhos">${atalhos}</div>
      </section>

      ${ehAdm ? '<h2 class="hc-grupo-titulo">O que os clientes veem</h2>' : ""}
      ${ehCliente || ehAdm ? '<div class="hc-divulgacoes" id="hc-divulgacoes" role="region" aria-label="Comunicados e anúncios"></div>' : ""}
      ${ehAdm ? '<h2 class="hc-grupo-titulo">O que os prestadores veem</h2><div id="hc-prestadores-veem"></div>' : ""}

      <section class="secao" id="servicos" aria-labelledby="servicos-titulo">
        <h2 id="servicos-titulo" class="secao-titulo">Serviços</h2>
        <ul class="categorias">
          ${CATEGORIAS.map((c) => `
            <li><a class="categoria" href="${CAMINHOS.buscarPrestador}?categoria=${c.id}">
              ${icone(c.icone)}<strong>${esc(c.nome)}</strong><span>${esc(c.desc)}</span>
            </a></li>`).join("")}
        </ul>
      </section>

      <section class="secao faixa" aria-labelledby="prestadores-titulo" id="secao-prestadores" hidden>
        <div class="secao-topo">
          <h2 id="prestadores-titulo" class="secao-titulo">Prestadores perto de você</h2>
          <div class="faixa-setas">
            <button type="button" class="btn btn-icone btn-seta" data-rolar="-1" aria-label="Prestadores anteriores" aria-controls="lista-prestadores">${icone("esquerda")}</button>
            <button type="button" class="btn btn-icone btn-seta" data-rolar="1" aria-label="Próximos prestadores" aria-controls="lista-prestadores">${icone("direita")}</button>
          </div>
        </div>
        <ul class="faixa-lista" id="lista-prestadores" tabindex="0" aria-label="Lista de prestadores (role para o lado)"></ul>
      </section>`;

    alvo.hidden = false;
    if (ehCliente || ehAdm) carregarDivulgacoesCliente(alvo.querySelector("#hc-divulgacoes"), previa || ehAdm);
    // Adm: seções da Home do prestador (comunicados, eventos e grupos), lidas como adm
    if (ehAdm && window.SDHomePrestador) window.SDHomePrestador.montar(alvo.querySelector("#hc-prestadores-veem"), "",
      { semBoasVindas: true, previa: true, carregar: async () => (await esperarDivulgacoes()).listarPrevia("prestador") });
    carregarPrestadores(alvo);
  }

  /* ---------- 7a. COMUNICADOS DA S.D + ANÚNCIOS (Home do cliente, v0.8.5) ----------
     Dados: firebase/divulgacoes.js (publico "clientes" ou "todos").
     Visual: o mesmo da Home do prestador (home-prestador.js). Anúncio SEMPRE com a etiqueta "Anúncio". */
  const ESPERA_MODULO_MS = 15000;
  function esperarDivulgacoes() {
    return new Promise((ok, falha) => {
      if (window.SDDivulgacoes) return ok(window.SDDivulgacoes);
      const t = setTimeout(() => falha(new Error("sem-modulo")), ESPERA_MODULO_MS);
      document.addEventListener("sd:divulgacoes-pronto", () => { clearTimeout(t); ok(window.SDDivulgacoes); }, { once: true });
    });
  }
  // v0.8.5: Comunicados da S.D + Anúncios no MESMO padrão da Home do prestador
  // (home-prestador.js → visão "cliente": blocos, faixas rolantes, pop-up, cores e cache).
  // A área de comunicados sempre aparece; "Anúncios" só quando houver.
  function carregarDivulgacoesCliente(caixa, previa) {
    if (!caixa || !window.SDHomePrestador) return;
    // previa (adm): sem cache e com o motivo do erro na tela
    window.SDHomePrestador.montar(caixa, "", {
      semBoasVindas: true, visao: "cliente", prefixo: "hc", previa: !!previa, cache: "cliente",
      carregar: async () => { const M = await esperarDivulgacoes(); return previa ? M.listarPrevia("cliente") : M.listarParaMim(); }
    });
  }


  // Faixa com prestadores REAIS (vitrine). Sem nenhum → a seção não aparece.
  async function carregarPrestadores(alvo) {
    const F = await new Promise((ok) => (window.SDFirebase ? ok(window.SDFirebase)
      : document.addEventListener("sd:firebase-pronto", () => ok(window.SDFirebase), { once: true })));
    if (!F || !F.listarPrestadores) return;
    let lista = [], eu = null;
    try { [lista, eu] = await Promise.all([F.listarPrestadores(null), F.meusDados().catch(() => null)]); } catch (_) { return; }
    const local = eu && eu.local && (!eu.interruptores || eu.interruptores.localizacao !== false) ? eu.local : null;
    // v0.8.4: Localização desligada = aparece, mas sem distância (vai para o fim) — mesma regra da busca
    lista = lista.filter((p) => p.nome).map(
      (p) => ({ ...p, km: local && p.localizacao && typeof p.lat === "number" ? distanciaKm(local, p) : null }));
    lista.sort((a, b) => (a.km ?? 1e9) - (b.km ?? 1e9) || a.nome.localeCompare(b.nome, "pt-BR"));
    lista = lista.slice(0, MAX_PRESTADORES_HOME);
    if (!lista.length) return;
    const ul = alvo.querySelector("#lista-prestadores");
    ul.innerHTML = lista.map((p) => `
      <li><article class="prestador">
        <div class="prestador-topo">
          ${p.foto ? `<img class="prestador-logo" src="${esc(p.foto)}" alt="" width="48" height="48">` : `<span class="prestador-logo" aria-hidden="true">${esc(iniciais(p.nome))}</span>`}
          <div><h3>${esc(p.nome)}</h3><p class="prestador-area">${esc(p.areaAtuacao || "")}</p></div>
        </div>
        <ul class="prestador-info">
          <li>${esc([p.bairro, p.cidade].filter(Boolean).join(", "))}${p.km != null ? ` · ${numBR(p.km)} km` : ""}</li>
        </ul>
        <a class="btn btn-pequeno" href="${CAMINHOS.perfilPrestador}?visao=cliente&amp;id=${encodeURIComponent(p.id)}">Ver perfil<span class="visualmente-oculto"> de ${esc(p.nome)}</span></a>
      </article></li>`).join("");
    alvo.querySelector("#secao-prestadores").hidden = false;
    iniciarFaixa(alvo);
  }

  /* ---------- 7b. LOGADO COMO PRESTADOR (v0.8.2) ----------
     Home própria do prestador: home/home-prestador.js (eventos, grupos e
     comunicados). Nada de dados de outros prestadores. Se o arquivo não
     carregar, ficam só os atalhos (como antes). */
  function montarPrestador(alvo, nome, previa = false) {
    // Prévia do adm (v0.8.5): a Home do prestador lê pela prévia (dados lidos como adm)
    const opcoes = previa ? { previa: true, carregar: async () => (await esperarDivulgacoes()).listarPrevia("prestador") } : {};
    if (window.SDHomePrestador) { window.SDHomePrestador.montar(alvo, nome, opcoes); return; }
    alvo.innerHTML = `
      <section class="boas-vindas" aria-labelledby="ola-titulo">
        <h1 id="ola-titulo">Olá${nome}!</h1>
        <div class="atalhos">
          <a class="btn" href="${esc(SD.caminho("perfil-prestador/index.html"))}#servicos">Meus serviços</a>
          <a class="btn" href="${esc(SD.urlPerfil())}">Meu perfil</a>
        </div>
      </section>`;
    alvo.hidden = false;
  }

  /* ---------- 8. SETAS DA FAIXA DE PRESTADORES ---------- */
  function iniciarFaixa(raiz) {
    const lista = raiz.querySelector("#lista-prestadores");
    const setas = raiz.querySelectorAll("[data-rolar]");
    if (!lista || !setas.length) return;
    const suave = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const atualizar = () => {
      const max = lista.scrollWidth - lista.clientWidth - 2;
      setas[0].disabled = lista.scrollLeft <= 2;
      setas[1].disabled = lista.scrollLeft >= max;
    };
    setas.forEach((b) => b.addEventListener("click", () => {
      lista.scrollBy({ left: Number(b.dataset.rolar) * lista.clientWidth * 0.9, behavior: suave ? "smooth" : "auto" });
    }));
    lista.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    atualizar();
  }

  /* ---------- 9. LINKS CENTRALIZADOS ---------- */
  function aplicarLinks() {
    document.querySelectorAll("[data-link]").forEach((a) => {
      const url = CAMINHOS[a.dataset.link];
      if (url) a.setAttribute("href", url);
    });
  }

  /* ---------- 10. INÍCIO ---------- */
  function iniciar() {
    const logado = document.body.dataset.logado === "sim";
    const visitante = document.querySelector('[data-visivel="visitante"]');
    const areaLogado = document.querySelector('[data-visivel="logado"]');

    // v0.8.5: adm escolhe como ver a página ("Ver como")
    const V = window.SDVerComo;
    const verComo = logado && V ? V.visao() : null;          // null = não é adm
    if (verComo) V.montar(document.getElementById("conteudo"));

    if (verComo === "visitante") {                           // prévia do visitante (o adm continua logado)
      document.getElementById("conteudo").classList.add("previa-adm");
      if (areaLogado) areaLogado.remove();
      if (visitante) montarVisitante(visitante);
      aplicarLinks();
    } else if (logado) {
      if (visitante) visitante.remove();          // toda a "atração" some
      const previa = !!verComo && verComo !== "adm";
      if (areaLogado) montarLogado(areaLogado, previa ? verComo : null, previa);
    } else {
      if (areaLogado) areaLogado.remove();        // vitrine não existe para visitante
      if (visitante) montarVisitante(visitante);
      aplicarLinks();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
