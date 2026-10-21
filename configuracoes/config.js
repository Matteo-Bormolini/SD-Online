/* =====================================================================
   S.D SERVIÇOS DIGITAIS — CONFIGURAÇÕES DAS PÁGINAS (config.js)
   Carregar ANTES de navbar.js e rodape.js em todas as páginas.
   Aqui fica a configuração ÚNICA do site: endereços das páginas, itens do
   menu, links do rodapé, lojas e ícones compartilhados.

   Cada página informa no <body>:
     data-pagina → id do item atual do menu (inicio, servicos, clientes, prestador, sobre, politicas, suporte, perfil)
     data-logado → "sim" libera as opções com cadeado; "nao" (padrão) mantém bloqueadas
     data-raiz   → caminho até a pasta SDOnline (páginas dentro de uma pasta usam "../")
   ATENÇÃO: data-logado só muda a TELA. O bloqueio real tem de ser feito no servidor.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. ENDEREÇOS DAS PÁGINAS (relativos à pasta SDOnline) ---------- */
  const PAGINAS = {
    home:                "home/index.html",
    sobre:               "home/sobre.html",
    login:               "login-cadastro/index.html",
    cadastro:            "login-cadastro/index.html?acao=criar-conta",
    sair:                "login-cadastro/index.html?sair=1",
    perfilAdm:           "perfil-adm/index.html",
    perfilCpf:           "perfil-cliente-cpf/index.html",
    perfilCnpj:          "perfil-cliente-cnpj/index.html",
    inicioLogado:        "inicio-logado/index.html",
    localizarPrestador:  "localizar-prestador/index.html",
    localizarCondominio: "localizar-condominios/index.html",
    solicitacao:         "solicitacao/index.html",
    avaliacoes:          "avaliacoes/index.html",
    suporte:             "suporte/index.html",
    politicas:           "politica-privacidade/index.html",
    termos:              "politica-privacidade/termos.html",
    responsabilidade:    "politica-privacidade/responsabilidade.html",
    privacidade:         "politica-privacidade/privacidade.html"
  };

  /* ---------- 2. CONFIGURAÇÃO ÚNICA DO SITE (editar aqui) ---------- */
  const SD_CONFIG = {
    paginas: PAGINAS,
    urlPerfil: PAGINAS.perfilAdm,   // depois: página conforme o tipo de usuário
    // Itens da NavBar (7). requerLogin: mostra cadeado e leva ao login até a pessoa entrar.
    menu: [
      { id: "inicio",    texto: "Início",            href: PAGINAS.home },
      { id: "servicos",  texto: "Serviços",          href: PAGINAS.home + "#servicos" },
      { id: "clientes",  texto: "Para clientes",     href: PAGINAS.localizarPrestador,  requerLogin: true, destino: "localizar-prestador",   perfil: "cliente" },
      { id: "prestador", texto: "Seja um prestador", href: PAGINAS.localizarCondominio, requerLogin: true, destino: "localizar-condominios", perfil: "prestador" },
      { id: "sobre",     texto: "Sobre nós",         href: PAGINAS.sobre },
      { id: "politicas", texto: "Políticas",         href: PAGINAS.politicas },
      { id: "suporte",   texto: "Suporte",           href: PAGINAS.suporte }
    ],
    // Rodapé
    rodapeLinks: ["servicos", "clientes", "prestador", "sobre", "suporte"],
    rodapePoliticas: [
      { texto: "Política da empresa",       href: PAGINAS.politicas },
      { texto: "Termos de uso",             href: PAGINAS.termos },
      { texto: "Termo de responsabilidade", href: PAGINAS.responsabilidade }
    ],
    // Lojas: sem link até o app ser publicado (aparece "Em breve")
    lojas: [
      { nome: "Google Play", href: "" },
      { nome: "App Store",   href: "" }
    ],
    descricao: "Conectando clientes a prestadores de serviço."
  };

  /* ---------- 3. ÍCONES COMPARTILHADOS ---------- */
  const ICONE = {
    logo: '<svg viewBox="0 0 48 48" fill="none" stroke="#fff" stroke-width="2.4" aria-hidden="true"><circle cx="24" cy="29" r="9"/><circle cx="24" cy="29" r="3.5"/><path d="M24 16v3M24 39v3M11 29h3M34 29h3M14.8 19.8l2.1 2.1M31.1 36.1l2.1 2.1M14.8 38.2l2.1-2.1M31.1 21.9l2.1-2.1"/><path d="M12 15a12 9 0 0 1 24 0Z" fill="#fff" stroke="none"/><path d="M9 15.5h30"/></svg>',
    cadeado: '<svg class="cadeado" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>',
    lua: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>',
    sol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    usuario: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg>',
    sair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>',
    entrar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>',
    fechar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    celular: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/></svg>'
  };

  /* ---------- 4. FUNÇÕES COMPARTILHADAS (usadas pela NavBar e pelo Rodapé) ---------- */
  const corpo = document.body;
  const raiz = () => corpo.dataset.raiz || "";          // "../" nas páginas dentro de pastas
  const url = (caminho) => raiz() + caminho;             // monta o link a partir da pasta SDOnline
  const logado = () => corpo.dataset.logado === "sim";
  const paginaAtual = () => corpo.dataset.pagina || "";
  // App instalado/aberto pelo app → esconde "Baixe o app"
  const ehApp = () => new URLSearchParams(location.search).get("plataforma") === "app" ||
    (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches);

  // Link de um item: bloqueado → login com destino; liberado → página real
  function hrefItem(item) {
    if (item.requerLogin && !logado()) {
      return `${url(PAGINAS.login)}?destino=${encodeURIComponent(item.destino)}&perfil=${encodeURIComponent(item.perfil)}`;
    }
    return url(item.href);
  }
  function htmlItem(item, comCurrent) {
    const bloqueado = item.requerLogin && !logado();
    const atual = comCurrent && item.id === paginaAtual() ? ' aria-current="page"' : "";
    const rotulo = bloqueado ? ` aria-label="${item.texto} (requer login)" title="Disponível após entrar na conta"` : "";
    return `<a href="${hrefItem(item)}"${atual}${rotulo}>${bloqueado ? ICONE.cadeado : ""}<span>${item.texto}</span></a>`;
  }
  function marcaHTML() {
    return `<a class="marca" href="${url(PAGINAS.home)}" aria-label="S.D Serviços Digitais — página inicial">${ICONE.logo}<span class="marca-texto">Serviços<br>Digitais</span></a>`;
  }
  // Executa a função quando a página terminar de carregar
  function aoCarregar(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  // Disponível para navbar.js, rodape.js e as páginas
  window.SD_CONFIG = SD_CONFIG;
  window.SD = { CONFIG: SD_CONFIG, ICONE, url, logado, paginaAtual, ehApp, hrefItem, htmlItem, marcaHTML, aoCarregar };
})();
