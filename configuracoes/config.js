/* =====================================================================
   S.D SERVIÇOS DIGITAIS — CONFIGURAÇÃO ÚNICA (configuracoes/config.js)
   Ordem dos scripts em TODA página (todos com "defer"):
     1. ../seguranca/acesso.js   → regras de quem vê o quê
     2. ../configuracoes/config.js (este arquivo)
     3. ../navbar/navbar.js  e  ../rodape/rodape.js
     4. componentes e o script da própria página
   Aqui ficam: caminhos das páginas, menu, rodapé, lojas, ícones,
   categorias, destaque pago, mapa, tema salvo, sessão de demonstração
   e funções usadas pela NavBar, pelo Rodapé e pelas páginas.

   Cada página informa no <body>:
     data-pagina="inicio"   → id do item do menu que fica destacado
     data-logado="nao|sim"  → o SERVIDOR preenche (só muda a TELA)
     data-tipo="cliente-cpf|cliente-cnpj|prestador|adm" (quando logado)
     data-raiz="../"        → caminho até a pasta SDOnline
   ATENÇÃO: esconder/mostrar na tela NÃO é segurança. O controle de
   acesso real tem de ser feito no servidor.
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. CONFIGURAÇÃO (editar aqui) ---------- */
  const CONFIG = {
    nome: "S.D Serviços Digitais",
    descricao: "Conectando clientes a prestadores de serviço.",
    logo: "fotos/marca/logo.svg",            // usado como ícone da aba

    // DEMONSTRAÇÃO (sem servidor): o login de teste fica guardado só nesta aba
    // do navegador (sessionStorage) para dar para navegar logado entre as páginas.
    // Quando o servidor existir: trocar para false.
    modoDemonstracao: true,

    // Caminhos a partir da pasta SDOnline (cada página = <pasta>/index.html)
    paginas: {
      inicio:      "home/index.html",
      login:       "login-cadastro/index.html",
      cadastro:    "login-cadastro/index.html?acao=criar-conta",
      sair:        "login-cadastro/index.html?sair=1",
      avaliacoes:  "avaliacoes/index.html",
      sobre:       "home/sobre.html",
      // Os 4 documentos legais ficam juntos na pasta politica-privacidade/
      politicas:        "politica-privacidade/index.html",          // Política da empresa
      termos:           "politica-privacidade/termos.html",
      responsabilidade: "politica-privacidade/responsabilidade.html",
      privacidade:      "politica-privacidade/privacidade.html",
      localizarPrestador: "localizar-prestador/index.html",
      perfilPrestador:    "perfil-prestador/index.html"              // abre com ?visao=cliente&id=...
    },

    // "Meu perfil" abre a página do tipo de usuário (data-tipo no <body>)
    perfilPorTipo: {
      "adm":          "perfil-adm/index.html",
      "cliente-cpf":  "perfil-cliente-cpf/index.html",
      "cliente-cnpj": "perfil-cliente-cnpj/index.html",
      "prestador":    "perfil-prestador/index.html"
    },

    // Itens da NavBar (7). requerLogin: cadeado + vai ao login até a pessoa entrar.
    // Depois do login, o item só aparece se seguranca/acesso.js permitir.
    menu: [
      { id: "inicio",    texto: "Início",            href: "home/index.html" },
      { id: "servicos",  texto: "Serviços",          href: "home/index.html#servicos" },
      { id: "clientes",  texto: "Para clientes",     href: "localizar-prestador/index.html",   requerLogin: true },
      { id: "prestador", texto: "Seja um prestador", href: "localizar-condominios/index.html", requerLogin: true },
      { id: "sobre",     texto: "Sobre nós",         href: "home/sobre.html" },
      { id: "politicas", texto: "Políticas",         href: "politica-privacidade/index.html" },
      { id: "suporte",   texto: "Suporte",           href: "suporte/index.html" }
    ],

    // Rodapé
    rodapeLinks: ["servicos", "clientes", "prestador", "sobre", "suporte"],
    rodapePoliticas: [
      { texto: "Política da empresa",       href: "politica-privacidade/index.html" },
      { texto: "Termos de uso",             href: "politica-privacidade/termos.html" },
      { texto: "Termo de responsabilidade", href: "politica-privacidade/responsabilidade.html" }
    ],
    // Lojas: deixar href vazio até o app ser publicado (mostra "Em breve")
    lojas: [
      { nome: "Google Play", href: "" },
      { nome: "App Store",   href: "" }
    ],

    // DESTAQUE PAGO — a "tag" é a palavra usada no banco de dados e no HTML.
    // Dado do prestador:  tags: ["destaque"]   → HTML: data-tag="destaque"
    // O CSS (base.css, seção 7) pinta qualquer elemento com essa tag de vermelho.
    destaque: { tag: "destaque", rotulo: "Destaque pago" },

    // TEMA: a escolha (claro/escuro) fica salva neste navegador até clicar de novo
    chaveTema: "sd-tema",

    // MAPA (grátis, sem chave): MapLibre GL + mapas do OpenFreeMap.
    // Para trocar de servidor de mapas, mude só "estilo".
    mapa: {
      script: "https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.js",
      css:    "https://cdn.jsdelivr.net/npm/maplibre-gl@5.24.0/dist/maplibre-gl.css",
      estilo: "https://tiles.openfreemap.org/styles/liberty",
      centroPadrao: { lat: -23.5505, lng: -46.6333 },  // São Paulo (usado se não houver localização)
      zoom: 12
    },

    // CATEGORIAS EM FOCO (manutenções + itens) — usadas na Home e em Localizar prestador.
    // Guardadas para o futuro (NÃO excluir, só ocultas): Serviços domésticos, Aulas,
    // Eventos, Beleza e bem-estar, Automóveis, Pets.
    categorias: [
      { id: "eletrica",      nome: "Elétrica",                        desc: "Tomadas, quadros e iluminação",       icone: "raio" },
      { id: "hidraulica",    nome: "Hidráulica",                      desc: "Vazamentos, canos e bombas",          icone: "gota" },
      { id: "infiltracao",   nome: "Infiltração e impermeabilização", desc: "Lajes, paredes e telhados",           icone: "telhado" },
      { id: "pintura",       nome: "Pintura",                         desc: "Interna, externa e fachadas",         icone: "pincel" },
      { id: "climatizacao",  nome: "Ar-condicionado",                 desc: "Instalação, limpeza e reparo",        icone: "floco" },
      { id: "portoes",       nome: "Portões e interfones",            desc: "Motores, fechaduras e interfonia",    icone: "portao" },
      { id: "monitoramento", nome: "Câmeras e monitoramento",         desc: "CFTV, TVs e gravadores",              icone: "camera" },
      { id: "reparos",       nome: "Reparos gerais",                  desc: "Alvenaria, marcenaria e serralheria", icone: "chave" },
      { id: "equipamentos",  nome: "Comprar equipamentos",            desc: "Compare preços do mercado",           icone: "carrinho" }
    ]
  };

  /* ---------- 1b. TEMA SALVO ----------
     Aplicado aqui (antes de montar a NavBar) para a página já abrir no tema escolhido.
     Sem armazenamento disponível (aba anônima, bloqueio), abre no claro. */
  const tema = {
    ler() {
      try { return localStorage.getItem(CONFIG.chaveTema) === "escuro" ? "escuro" : "claro"; }
      catch (_) { return "claro"; }
    },
    salvar(valor) {
      try { localStorage.setItem(CONFIG.chaveTema, valor === "escuro" ? "escuro" : "claro"); }
      catch (_) { /* navegador sem armazenamento: vale só nesta página */ }
    }
  };
  document.documentElement.setAttribute("data-tema", tema.ler());

  /* ---------- 2. ÍCONES (SVG, cor herdada) ---------- */
  const svg = (conteudo, traco = 2) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${traco}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${conteudo}</svg>`;
  const ICONES = {
    // Logo provisória: engrenagem com capacete (trocar pelo arquivo oficial)
    logo: '<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true" focusable="false"><circle cx="24" cy="29" r="9"/><circle cx="24" cy="29" r="3.5"/><path d="M24 16v3M24 39v3M11 29h3M34 29h3M14.8 19.8l2.1 2.1M31.1 36.1l2.1 2.1M14.8 38.2l2.1-2.1M31.1 21.9l2.1-2.1"/><path d="M12 15a12 9 0 0 1 24 0Z" fill="currentColor" stroke="none"/><path d="M9 15.5h30"/></svg>',
    cadeado: svg('<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>', 2.2).replace("<svg ", '<svg class="cadeado" '),
    lua:     svg('<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/>'),
    sol:     svg('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
    usuario: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    sair:    svg('<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>'),
    entrar:  svg('<path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/>'),
    menu:    svg('<path d="M4 6h16M4 12h16M4 18h16"/>', 2.2),
    fechar:  svg('<path d="M18 6 6 18M6 6l12 12"/>', 2.2),
    celular: svg('<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>'),
    whatsapp: svg('<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5Z"/>'),
    local:   svg('<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>')
  };

  // Ícones das categorias (traço, cor herdada) — mesmo desenho na Home e nas buscas
  const ICONES_CATEGORIA = {
    raio:     '<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z"/>',
    gota:     '<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
    telhado:  '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-5h4v5"/>',
    pincel:   '<path d="M4 4h12v5H4z"/><path d="M16 6h3v5h-7v3"/><path d="M11 14h2v6h-2z"/>',
    floco:    '<path d="M12 2v20M3.5 7l17 10M20.5 7l-17 10"/><path d="m9 4 3 2 3-2M9 20l3-2 3 2"/>',
    portao:   '<path d="M3 21V8l9-5 9 5v13"/><path d="M7 21V11h10v10M10 11v10M14 11v10"/>',
    camera:   '<path d="M3 7h12l5-3v10l-5-3H3z"/><path d="M7 11v5M5 20h8"/>',
    chave:    '<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8V21h3.2l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.8-2.8 2.4-2.8Z"/>',
    carrinho: '<circle cx="9" cy="20" r="1.5"/><circle cx="18" cy="20" r="1.5"/><path d="M2 3h3l2.5 12h11.5l2-8H6.2"/>'
  };
  const iconeCategoria = (nome) => svg(ICONES_CATEGORIA[nome] || "");

  /* ---------- 3. SESSÃO DE DEMONSTRAÇÃO (sem servidor) ----------
     Guarda só { tipo, nome } nesta aba do navegador. NUNCA guarda senha.
     Na versão final quem diz se a pessoa está logada é o SERVIDOR. */
  const CHAVE_SESSAO = "sd-sessao-demonstracao";
  const acesso = window.SD_ACESSO;
  const sessaoDemo = {
    ler() {
      if (!CONFIG.modoDemonstracao) return null;
      try {
        const s = JSON.parse(sessionStorage.getItem(CHAVE_SESSAO) || "null");
        return s && acesso && acesso.perfilValido(s.tipo) && s.tipo !== "visitante" ? s : null;
      } catch (_) { return null; }
    },
    entrar(tipo, nome) {
      if (!CONFIG.modoDemonstracao) return false;
      try { sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify({ tipo, nome: String(nome || "").slice(0, 60) })); return true; }
      catch (_) { return false; }
    },
    sair() {
      try { sessionStorage.removeItem(CHAVE_SESSAO); } catch (_) { /* navegador sem armazenamento */ }
    }
  };

  // "?sair=1" encerra a sessão ANTES de montar a NavBar (assim ela já aparece deslogada)
  if (new URLSearchParams(location.search).get("sair") === "1") sessaoDemo.sair();

  // Aplica a sessão de demonstração no <body> (como o servidor faria)
  (function aplicarSessao() {
    const s = sessaoDemo.ler();
    if (!s || !document.body) return;
    document.body.dataset.logado = "sim";
    document.body.dataset.tipo = s.tipo;
    if (s.nome) document.body.dataset.nome = s.nome;
  })();

  /* ---------- 3b. PROTEÇÃO DAS PÁGINAS (só no modo demonstração) ----------
     A página diz no <body> qual regra de seguranca/acesso.js ela usa:
       data-recurso="perfil-adm"                        → regra da página
       data-recurso-publico="perfil-prestador-publico"  → (opcional) versão pública
     Sem permissão: visitante vai para o login; quem já entrou vai para o início.
     No site real quem bloqueia é o SERVIDOR, antes de enviar a página. */
  (function protegerPagina() {
    const b = document.body;
    if (!CONFIG.modoDemonstracao || !b || !acesso || !b.dataset.recurso) return;
    const s = sessaoDemo.ler();
    const tipo = s ? s.tipo : "visitante";
    if (acesso.pode(tipo, b.dataset.recurso)) return;
    const publico = b.dataset.recursoPublico;
    if (publico && acesso.pode(tipo, publico)) {
      b.dataset.visao = "cliente";                       // abre só a versão pública
      const url = new URL(location.href);
      if (url.searchParams.get("visao") !== "cliente") {
        url.searchParams.set("visao", "cliente");
        location.replace(url.href);
      }
      return;
    }
    const destino = tipo === "visitante"
      ? `${CONFIG.paginas.login}?destino=${encodeURIComponent(b.dataset.recurso)}`
      : CONFIG.paginas.inicio;
    location.replace((b.dataset.raiz || "") + destino);
  })();

  /* ---------- 4. ESTADO DA PÁGINA (lido do <body>) ---------- */
  const corpo = () => document.body || document.createElement("body");
  const raiz = () => corpo().dataset.raiz || "";
  const logado = () => corpo().dataset.logado === "sim";
  const paginaAtual = () => corpo().dataset.pagina || "";
  const tipoUsuario = () => (logado() ? corpo().dataset.tipo || "" : "visitante");
  // Aberto pelo app (?plataforma=app) ou instalado (standalone) → esconde "Baixe o app"
  const ehApp = () =>
    new URLSearchParams(location.search).get("plataforma") === "app" ||
    (typeof window.matchMedia === "function" && window.matchMedia("(display-mode: standalone)").matches);

  /* ---------- 5. FUNÇÕES DE APOIO ---------- */
  // Escapa texto antes de colocar no HTML (evita injeção)
  const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  // Monta o caminho a partir da raiz do site (links externos e data:/blob: ficam iguais)
  const caminho = (rel) => (/^(https?:|mailto:|tel:|data:|blob:|#)/i.test(rel) ? rel : raiz() + rel);

  const urlPagina = (nome) => caminho(CONFIG.paginas[nome] || CONFIG.paginas.inicio);
  const urlPerfil = () => caminho(CONFIG.perfilPorTipo[tipoUsuario()] || CONFIG.perfilPorTipo["cliente-cpf"]);
  // Pode ver o recurso? (usa seguranca/acesso.js; sem o arquivo, mostra tudo)
  const pode = (recurso) => (acesso ? acesso.pode(tipoUsuario(), recurso) : true);

  // Item bloqueado → login com destino; liberado → página real
  function hrefItem(item) {
    if (item.requerLogin && !logado()) {
      return `${urlPagina("login")}?destino=${encodeURIComponent(item.id)}`;
    }
    return caminho(item.href);
  }
  // Itens que aparecem: visitante vê todos (os bloqueados com cadeado);
  // logado vê só os permitidos para o seu tipo (ex.: prestador não vê "Para clientes").
  const itemVisivel = (item) => !logado() || pode(item.id);

  // <a> de um item do menu (usado na NavBar e no Rodapé)
  function linkMenu(item, marcarAtual) {
    const bloqueado = item.requerLogin && !logado();
    const atual = marcarAtual && item.id === paginaAtual() ? ' aria-current="page"' : "";
    const extra = bloqueado ? ` aria-label="${esc(item.texto)} (requer login)" title="Disponível após entrar na conta"` : "";
    return `<a href="${esc(hrefItem(item))}"${atual}${extra}>${bloqueado ? ICONES.cadeado : ""}<span>${esc(item.texto)}</span></a>`;
  }

  // Destaque pago: o item tem a tag "destaque"? (ex.: { tags: ["destaque"] })
  const ehDestaque = (item) => !!item && Array.isArray(item.tags) && item.tags.includes(CONFIG.destaque.tag);

  // Ícone da aba do navegador (se a página não tiver um)
  if (!document.querySelector('link[rel~="icon"]') && document.head) {
    const icone = document.createElement("link");
    icone.rel = "icon";
    icone.type = "image/svg+xml";
    icone.href = caminho(CONFIG.logo);
    document.head.appendChild(icone);
  }

  /* ---------- 6. EXPORTA PARA navbar.js, rodape.js e páginas ---------- */
  window.SD = Object.freeze({
    config: CONFIG, icones: ICONES, sessaoDemo, tema, iconeCategoria, ehDestaque,
    iconesCategoria: Object.freeze({ ...ICONES_CATEGORIA }),
    esc, caminho, urlPagina, urlPerfil, hrefItem, linkMenu, itemVisivel, pode,
    logado, paginaAtual, tipoUsuario, ehApp
  });
})();
