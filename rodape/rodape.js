/* =====================================================================
   S.D — RODAPÉ / FOOTER (rodape.js)
   Monta o rodapé a partir da configuração única.
   Depende de configuracoes/config.js (carregar antes).
   Na página: <footer id="sd-rodape"></footer>
   ===================================================================== */
(function () {
  "use strict";
  const { CONFIG, ICONE, url, ehApp, htmlItem, marcaHTML, aoCarregar } = window.SD;

  function montarRodape() {
    const alvo = document.getElementById("sd-rodape");
    if (!alvo) return;
    alvo.className = "rodape";
    const p = CONFIG.paginas;
    const itens = CONFIG.rodapeLinks.map((id) => CONFIG.menu.find((m) => m.id === id)).filter(Boolean);
    // "Baixe o app" só aparece no SITE (no app fica oculto)
    const lojas = ehApp() ? "" : `
      <div>
        <h2>Baixe o app</h2>
        <div class="lojas">
          ${CONFIG.lojas.map((l) => l.href
            ? `<a class="loja" href="${l.href}" rel="noopener">${ICONE.celular}<span>${l.nome}</span></a>`
            : `<a class="loja" aria-disabled="true" role="link" aria-label="${l.nome} — em breve">${ICONE.celular}<span><small>Em breve</small>${l.nome}</span></a>`).join("")}
        </div>
      </div>`;

    alvo.innerHTML = `
      <div class="rodape-conteudo">
        <div class="rodape-colunas">
          <div class="rodape-marca">
            ${marcaHTML()}
            <p>${CONFIG.descricao}</p>
          </div>
          <div>
            <h2>Navegação</h2>
            <ul>${itens.map((i) => `<li>${htmlItem(i, false)}</li>`).join("")}</ul>
          </div>
          <div>
            <h2>Políticas</h2>
            <ul>${CONFIG.rodapePoliticas.map((x) => `<li><a href="${url(x.href)}">${x.texto}</a></li>`).join("")}</ul>
          </div>
          ${lojas}
        </div>
        <p class="rodape-aviso"><strong>Suporte</strong> é exclusivo para erros e melhorias da plataforma. Não é canal de reclamação sobre prestadores ou clientes.</p>
        <div class="rodape-base">
          <span>© ${new Date().getFullYear()} S.D Serviços Digitais</span>
          <span><a href="${url(p.termos)}">Termos</a> · <a href="${url(p.privacidade)}">Privacidade</a></span>
        </div>
      </div>`;
  }

  aoCarregar(montarRodape);
})();
