/* =====================================================================
   S.D — PÁGINA INICIAL / HOME (home/home.js)
   Uma só página com duas visões:
     • Visitante (data-logado="nao"): convite para entrar. Nada de
       prestadores, fotos ou avaliações.
     • Logado (data-logado="sim"): a parte de convite é REMOVIDA e a
       vitrine (prestadores, avaliações, fotos, ideias) é montada aqui.
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

  /* ---------- 3. DADOS DE DEMONSTRAÇÃO ----------
     Substituir pela resposta da API (ex.: GET /api/inicio) quando o
     servidor existir. Nomes fictícios; a tela mostra "Dados de demonstração". */
  const DEMO = {
    numeros: [
      { valor: "1.250", rotulo: "serviços concluídos" },
      { valor: "320",   rotulo: "prestadores cadastrados" },
      { valor: "4,7",   rotulo: "avaliação média (de 5)" },
      { valor: "85",    rotulo: "condomínios atendidos" }
    ],
    prestadores: [
      { id: "p1", nome: "Alfa Elétrica",          area: "Elétrica",            bairro: "Centro",        km: 1.2, nota: 4.9, qtd: 128, concluidos: 310, tags: ["destaque"] },
      { id: "p2", nome: "Beta Hidráulica",        area: "Hidráulica",          bairro: "Vila Nova",     km: 2.8, nota: 4.8, qtd: 94,  concluidos: 205, tags: [] },
      { id: "p3", nome: "Gama Impermeabilizações", area: "Infiltração",        bairro: "Jardim América", km: 3.5, nota: 4.7, qtd: 61, concluidos: 140, tags: [] },
      { id: "p4", nome: "Delta Climatização",     area: "Ar-condicionado",     bairro: "Bela Vista",    km: 4.1, nota: 4.9, qtd: 77,  concluidos: 182, tags: ["destaque"] },
      { id: "p5", nome: "Épsilon Portões",        area: "Portões e interfones", bairro: "Santa Cecília", km: 5.0, nota: 4.6, qtd: 39,  concluidos: 88,  tags: [] },
      { id: "p6", nome: "Zeta Pinturas",          area: "Pintura",             bairro: "Mooca",         km: 6.3, nota: 4.8, qtd: 52,  concluidos: 117, tags: [] }
    ],
    avaliacoes: [
      { nota: 5, texto: "Chegaram no horário combinado com o zelador e resolveram a infiltração da garagem em dois dias.", servico: "Impermeabilização", prestador: "Gama Impermeabilizações", cliente: "Cliente CNPJ · Condomínio residencial" },
      { nota: 5, texto: "Explicou o problema do quadro elétrico antes de começar e deixou tudo organizado.", servico: "Troca de disjuntores", prestador: "Alfa Elétrica", cliente: "Cliente CPF · Casa" },
      { nota: 4, texto: "Bom atendimento e preço justo. Precisou voltar uma vez para ajustar o motor do portão.", servico: "Manutenção de portão", prestador: "Épsilon Portões", cliente: "Cliente CNPJ · Empresa" }
    ],
    trabalhos: [
      { titulo: "Revisão de quadro elétrico",       prestador: "Alfa Elétrica",          icone: "raio" },
      { titulo: "Impermeabilização de laje",        prestador: "Gama Impermeabilizações", icone: "telhado" },
      { titulo: "Instalação de ar-condicionado",    prestador: "Delta Climatização",     icone: "floco" },
      { titulo: "Troca de motor de portão",         prestador: "Épsilon Portões",        icone: "portao" },
      { titulo: "Pintura de fachada",               prestador: "Zeta Pinturas",          icone: "pincel" },
      { titulo: "Reparo de vazamento",              prestador: "Beta Hidráulica",        icone: "gota" }
    ],
    ideias: [
      { tag: "Antes das chuvas", titulo: "Revise calhas, rufos e impermeabilização", texto: "Folhas e sujeira entopem calhas e a água volta para lajes e paredes.", categoria: "infiltracao" },
      { tag: "Segurança",        titulo: "Quadro elétrico aquecendo ou desarmando?", texto: "Disjuntor que desarma sempre é sinal de sobrecarga. Chame um eletricista.", categoria: "eletrica" },
      { tag: "Conforto",         titulo: "Limpeza do ar-condicionado",              texto: "Filtros sujos aumentam o consumo de energia e pioram a qualidade do ar.", categoria: "climatizacao" },
      { tag: "Condomínios",      titulo: "Plano de manutenção preventiva",           texto: "A ABNT NBR 5674 orienta a organizar as manutenções da edificação com rotina e registro.", categoria: "reparos" }
    ]
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
  const ESTRELA = '<path d="m12 2.8 2.8 5.8 6.4.9-4.6 4.5 1.1 6.3L12 17.3l-5.7 3 1.1-6.3L2.8 9.5l6.4-.9Z"/>';

  /* ---------- 5. UTILITÁRIOS ---------- */
  // Escapa texto vindo do servidor (evita injeção de HTML)
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const numBR = (n, casas = 1) => Number(n).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
  const iniciais = (nome) => nome.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase();

  function estrelas(nota, qtd) {
    let html = "";
    for (let i = 1; i <= 5; i++) {
      const cheia = nota >= i - 0.25;
      html += `<svg viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.6" fill="${cheia ? "currentColor" : "none"}" aria-hidden="true">${ESTRELA}</svg>`;
    }
    const rotulo = `Nota ${numBR(nota)} de 5` + (qtd ? `, ${qtd} avaliações` : "");
    return `<span class="estrelas" role="img" aria-label="${rotulo}">${html}<span class="nota" aria-hidden="true">${numBR(nota)}</span>${qtd ? `<span class="qtd" aria-hidden="true">(${qtd})</span>` : ""}</span>`;
  }

  // Imagem ilustrativa (SVG) enquanto não há fotos reais dos trabalhos
  function imagemIlustrativa(nomeIcone, indice) {
    const fundos = ["#800000", "#5C0000", "#6E1A1A", "#4A3B35", "#7A2E2E", "#3D2F2A"];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><rect width="400" height="300" fill="${fundos[indice % fundos.length]}"/><circle cx="330" cy="60" r="110" fill="#fff" opacity=".07"/><circle cx="60" cy="270" r="90" fill="#fff" opacity=".05"/><g transform="translate(150 100) scale(4.2)" fill="none" stroke="#F2ECE6" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${P[nomeIcone]}</g></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  /* ---------- 6. VISITANTE ---------- */
  function montarVisitante(raiz) {
    const lista = raiz.querySelector('[data-lista="categorias-visitante"]');
    if (lista) lista.innerHTML = CATEGORIAS.map((c) => `<li>${esc(c.nome)}</li>`).join("");

    const numeros = raiz.querySelector('[data-lista="numeros"]');
    if (numeros) numeros.innerHTML = DEMO.numeros
      .map((n) => `<div class="numero"><dt>${esc(n.rotulo)}</dt><dd>${esc(n.valor)}</dd></div>`).join("");
  }

  /* ---------- 7. LOGADO ---------- */
  function montarLogado(alvo) {
    const corpo = document.body;
    const nome = corpo.dataset.nome ? `, ${esc(corpo.dataset.nome)}` : "";   // servidor pode preencher data-nome
    const tipo = corpo.dataset.tipo || "";                                     // cliente-cpf | cliente-cnpj | prestador | adm
    const ehPrestador = tipo === "prestador";
    const ehCliente = tipo.startsWith("cliente");

    // PRESTADOR: não vê a vitrine (outros prestadores, avaliações e trabalhos são
    // dados da concorrência). A Home própria do prestador ainda será definida.
    if (ehPrestador) { montarPrestador(alvo, nome); return; }

    const atalhos = [
      `<a class="btn" href="${CAMINHOS.buscarPrestador}">Pedir orçamento</a>`,
      !ehCliente && `<a class="btn" href="${CAMINHOS.localizarCondominios}">Seus Serviços</a>`
    ].filter(Boolean).join("");

    alvo.innerHTML = `
      <section class="boas-vindas" aria-labelledby="ola-titulo">
        <h1 id="ola-titulo">Olá${nome}! O que precisa resolver hoje?</h1>
        <p>Busque um serviço ou navegue pelos prestadores, avaliações e trabalhos abaixo.</p>
        <form class="busca" role="search" action="${CAMINHOS.buscarPrestador}" method="get">
          <label class="visualmente-oculto" for="busca-q">Buscar serviço ou prestador</label>
          <input id="busca-q" name="q" type="search" placeholder="Ex.: vazamento no banheiro, motor do portão" autocomplete="off">
          <button class="btn btn-grande" type="submit">${icone("lupa")}<span>Buscar</span></button>
        </form>
        <div class="atalhos">${atalhos}</div>
      </section>

      <section class="secao" id="servicos" aria-labelledby="servicos-titulo">
        <h2 id="servicos-titulo" class="secao-titulo">Serviços</h2>
        <ul class="categorias">
          ${CATEGORIAS.map((c) => `
            <li><a class="categoria" href="${CAMINHOS.buscarPrestador}?categoria=${c.id}">
              ${icone(c.icone)}<strong>${esc(c.nome)}</strong><span>${esc(c.desc)}</span>
            </a></li>`).join("")}
        </ul>
      </section>

      <section class="secao faixa" aria-labelledby="prestadores-titulo">
        <div class="secao-topo">
          <div>
            <h2 id="prestadores-titulo" class="secao-titulo">Prestadores perto de você</h2>
            <span class="selo-demo">Dados de demonstração</span>
          </div>
          <div class="faixa-setas">
            <button type="button" class="btn btn-icone btn-seta" data-rolar="-1" aria-label="Prestadores anteriores" aria-controls="lista-prestadores">${icone("esquerda")}</button>
            <button type="button" class="btn btn-icone btn-seta" data-rolar="1" aria-label="Próximos prestadores" aria-controls="lista-prestadores">${icone("direita")}</button>
          </div>
        </div>
        <ul class="faixa-lista" id="lista-prestadores" tabindex="0" aria-label="Lista de prestadores (role para o lado)">
          ${DEMO.prestadores.map((p) => `
            <li><article class="prestador"${SD.ehDestaque(p) ? ` data-tag="${SD.config.destaque.tag}"` : ""}>
              ${SD.ehDestaque(p) ? `<span class="tag-destaque">${esc(SD.config.destaque.rotulo)}</span>` : ""}
              <div class="prestador-topo">
                <span class="prestador-logo" aria-hidden="true">${esc(iniciais(p.nome))}</span>
                <div><h3>${esc(p.nome)}</h3><p class="prestador-area">${esc(p.area)}</p></div>
              </div>
              ${estrelas(p.nota, p.qtd)}
              <ul class="prestador-info">
                <li>${esc(p.bairro)} · ${numBR(p.km)} km</li>
                <li>${p.concluidos} serviços concluídos</li>
              </ul>
              <a class="btn btn-pequeno" href="${CAMINHOS.perfilPrestador}?visao=cliente&amp;id=${encodeURIComponent(p.id)}">Ver perfil<span class="visualmente-oculto"> de ${esc(p.nome)}</span></a>
            </article></li>`).join("")}
        </ul>
      </section>

      <section class="secao" aria-labelledby="avaliacoes-titulo">
        <div class="secao-topo">
          <h2 id="avaliacoes-titulo" class="secao-titulo">Avaliações recentes</h2>
          <span class="selo-demo">Dados de demonstração</span>
        </div>
        <ul class="avaliacoes">
          ${DEMO.avaliacoes.map((a) => `
            <li><figure class="avaliacao">
              ${estrelas(a.nota)}
              <blockquote>${esc(a.texto)}</blockquote>
              <figcaption><strong>${esc(a.servico)}</strong> · ${esc(a.prestador)}<br>${esc(a.cliente)}</figcaption>
            </figure></li>`).join("")}
        </ul>
      </section>

      <section class="secao" aria-labelledby="trabalhos-titulo">
        <div class="secao-topo">
          <h2 id="trabalhos-titulo" class="secao-titulo">Trabalhos realizados</h2>
          <span class="selo-demo">Imagens ilustrativas</span>
        </div>
        <ul class="galeria">
          ${DEMO.trabalhos.map((t, i) => `
            <li><figure>
              <img class="foto" src="${imagemIlustrativa(t.icone, i)}" alt="Imagem ilustrativa: ${esc(t.titulo)}" width="400" height="300" loading="lazy">
              <figcaption>${esc(t.titulo)}<span>${esc(t.prestador)}</span></figcaption>
            </figure></li>`).join("")}
        </ul>
      </section>

      <section class="secao" aria-labelledby="ideias-titulo">
        <div class="secao-topo">
          <h2 id="ideias-titulo" class="secao-titulo">Ideias para o seu imóvel</h2>
          <span class="selo-demo">Conteúdo provisório</span>
        </div>
        <ul class="ideias">
          ${DEMO.ideias.map((d) => `
            <li><article class="ideia">
              <span class="ideia-tag">${esc(d.tag)}</span>
              <h3>${esc(d.titulo)}</h3>
              <p>${esc(d.texto)}</p>
              <a class="link" href="${CAMINHOS.buscarPrestador}?categoria=${d.categoria}">Ver prestadores</a>
            </article></li>`).join("")}
        </ul>
      </section>`;

    alvo.hidden = false;
    iniciarFaixa(alvo);
  }

  /* ---------- 7b. LOGADO COMO PRESTADOR (provisório) ----------
     Só atalhos para as áreas dele. Nada de dados de outros prestadores. */
  function montarPrestador(alvo, nome) {
    alvo.innerHTML = `
      <section class="boas-vindas" aria-labelledby="ola-titulo">
        <h1 id="ola-titulo">Olá${nome}!</h1>
        <p>A sua página inicial de prestador está em construção. Use os atalhos abaixo.</p>
        <div class="atalhos">
          <a class="btn" href="${CAMINHOS.localizarCondominios}">Seus Serviços</a>
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

    if (logado) {
      if (visitante) visitante.remove();          // toda a "atração" some
      if (areaLogado) montarLogado(areaLogado);
    } else {
      if (areaLogado) areaLogado.remove();        // vitrine não existe para visitante
      if (visitante) montarVisitante(visitante);
      aplicarLinks();
    }
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
