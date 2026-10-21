/* =====================================================================
   S.D — NAVBAR (navbar.js)
   Monta a barra de navegação, o botão de tema e o menu compacto.
   Depende de configuracoes/config.js (carregar antes).
   Na página: <header id="sd-navbar"></header>
   ===================================================================== */
(function () {
  "use strict";
  const { CONFIG, ICONE, url, logado, paginaAtual, htmlItem, marcaHTML, aoCarregar } = window.SD;

  /* ---------- 1. MONTAGEM DA BARRA ---------- */
  function montarNavbar() {
    const alvo = document.getElementById("sd-navbar");
    if (!alvo) return;
    alvo.className = "navbar";
    const p = CONFIG.paginas;
    const acoesConta = logado()
      ? `<a class="nav-btn" href="${url(CONFIG.urlPerfil)}" aria-label="Meu perfil"${paginaAtual() === "perfil" ? ' aria-current="page"' : ""}>${ICONE.usuario}<span class="rotulo-oculto-celular">Meu perfil</span></a>
         <a class="nav-btn" href="${url(p.sair)}" aria-label="Sair da conta">${ICONE.sair}<span class="rotulo-oculto-celular">Sair</span></a>`
      : `<a class="nav-btn" href="${url(p.login)}">${ICONE.entrar}<span>Entrar</span></a>
         <a class="nav-btn nav-btn-destaque" href="${url(p.cadastro)}"><span>Criar conta</span></a>`;

    alvo.innerHTML = `
      <a class="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>
      <nav class="navbar-conteudo" aria-label="Navegação principal">
        ${marcaHTML()}
        <ul class="menu" id="sd-menu">
          ${CONFIG.menu.map((i) => `<li>${htmlItem(i, true)}</li>`).join("")}
        </ul>
        <div class="nav-direita">
          <button type="button" class="nav-btn" id="sd-btn-tema" aria-pressed="false" aria-label="Ativar tema escuro">${ICONE.lua}</button>
          ${acoesConta}
          <button type="button" class="nav-btn btn-menu" id="sd-btn-menu" aria-expanded="false" aria-controls="sd-menu" aria-label="Abrir menu">${ICONE.menu}</button>
        </div>
      </nav>`;
  }

  /* ---------- 2. TEMA (sempre abre no claro; escuro só se o usuário escolher) ---------- */
  function iniciarTema() {
    const btn = document.getElementById("sd-btn-tema");
    if (!btn) return;
    document.documentElement.setAttribute("data-tema", "claro");
    btn.addEventListener("click", () => {
      const escuro = document.documentElement.getAttribute("data-tema") !== "escuro";
      document.documentElement.setAttribute("data-tema", escuro ? "escuro" : "claro");
      btn.innerHTML = escuro ? ICONE.sol : ICONE.lua;
      btn.setAttribute("aria-pressed", String(escuro));
      btn.setAttribute("aria-label", escuro ? "Ativar tema claro" : "Ativar tema escuro");
    });
  }

  /* ---------- 3. MENU COMPACTO (3 riscos, abaixo de 1260px) ---------- */
  function iniciarMenu() {
    const btn = document.getElementById("sd-btn-menu"), menu = document.getElementById("sd-menu");
    if (!btn || !menu) return;
    const definir = (aberto) => {
      menu.classList.toggle("aberto", aberto);
      btn.setAttribute("aria-expanded", String(aberto));
      btn.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
      btn.innerHTML = aberto ? ICONE.fechar : ICONE.menu;
    };
    btn.addEventListener("click", () => definir(!menu.classList.contains("aberto")));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && menu.classList.contains("aberto")) { definir(false); btn.focus(); } });
    // Clique fora da barra fecha o menu (composedPath funciona mesmo se o ícone foi trocado)
    document.addEventListener("click", (e) => { if (!e.composedPath().some((el) => el.classList && el.classList.contains("navbar"))) definir(false); });
  }

  aoCarregar(() => { montarNavbar(); iniciarTema(); iniciarMenu(); });
})();
