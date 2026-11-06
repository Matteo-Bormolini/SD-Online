/* =====================================================================
   S.D — RODAPÉ (rodape/rodape.js)
   Monta o rodapé a partir de configuracoes/config.js (window.SD).
   Colunas: marca · Navegação · Baixe o app.
   Linha de baixo: © e os 4 documentos legais (canto direito, ocupa pouco espaço).
   Precisa de: <footer id="sd-rodape"></footer> na página.
   ===================================================================== */
(function () {
  "use strict";

  if (!window.SD) {
    console.error("[S.D] rodape.js: carregue configuracoes/config.js antes deste arquivo.");
    return;
  }
  const SD = window.SD;
  const I = SD.icones;
  const C = SD.config;

  /* ---------- 1. "BAIXE O APP" (não aparece dentro do app) ----------
     Cada loja mostra o SELO OFICIAL (arquivo em fotos/marca/lojas/).
     Se o arquivo ainda não existir, volta para o botão de texto com ícone de celular. */
  function htmlLoja(l) {
    const emBreve = !l.href;
    const texto = `${I.celular}<span>${emBreve ? "<small>Em breve</small>" : ""}${SD.esc(l.nome)}</span>`;
    const selo = l.selo
      ? `<img class="loja-selo" src="${SD.esc(SD.caminho(l.selo))}" alt="" height="40" data-reserva="1">`
      : "";
    const rotulo = emBreve ? `${l.nome} — em breve` : `Baixar na ${l.nome}`;
    const atributos = emBreve
      ? `role="link" aria-disabled="true"`
      : `href="${SD.esc(l.href)}" target="_blank" rel="noopener noreferrer"`;
    return `<a class="loja${l.selo ? " com-selo" : ""}" ${atributos} aria-label="${SD.esc(rotulo)}">${selo}<span class="loja-texto">${texto}</span></a>`;
  }

  function htmlLojas() {
    if (SD.ehApp()) return "";
    return `<div class="rodape-lojas"><h2>Baixe o app</h2><div class="lojas">${C.lojas.map(htmlLoja).join("")}</div></div>`;
  }

  // Selo carregou → esconde o texto; falhou → remove a imagem e fica o texto
  function ligarSelos(raiz) {
    raiz.querySelectorAll("img.loja-selo").forEach((img) => {
      const loja = img.closest(".loja");
      const ok = () => loja.classList.add("selo-ok");
      const falhou = () => { img.remove(); loja.classList.remove("com-selo"); };
      if (img.complete) { if (img.naturalWidth) ok(); else falhou(); }
      else { img.addEventListener("load", ok, { once: true }); img.addEventListener("error", falhou, { once: true }); }
    });
  }

  /* ---------- 2. MONTAGEM ---------- */
  function montar() {
    const alvo = document.getElementById("sd-rodape");
    if (!alvo) return;
    alvo.classList.add("rodape");

    const itens = C.rodapeLinks.map((id) => C.menu.find((m) => m.id === id)).filter(Boolean).filter(SD.itemVisivel);
    const documentos = (C.rodapeDocumentos || [])
      .map((d) => `<li><a href="${SD.esc(SD.caminho(d.href))}">${SD.esc(d.texto)}</a></li>`).join("");

    alvo.innerHTML = `
      <div class="rodape-conteudo">
        <div class="rodape-colunas">
          <div class="rodape-marca">
            <a class="marca" href="${SD.esc(SD.urlPagina("inicio"))}" aria-label="${SD.esc(C.nome)} — página inicial">${I.logo}<span class="marca-texto" aria-hidden="true">Serviços<br>Digitais</span></a>
          </div>
          <nav aria-label="Navegação do rodapé">
            <h2>Navegação</h2>
            <ul>${itens.map((i) => `<li>${SD.linkMenu(i, false)}</li>`).join("")}</ul>
          </nav>
          ${htmlLojas()}
        </div>
        <p class="rodape-aviso"><strong>Suporte</strong> é exclusivo para erros e melhorias da plataforma. Não é canal de reclamação sobre prestadores ou clientes.</p>
        <div class="rodape-base">
          <span>© ${new Date().getFullYear()} ${SD.esc(C.nome)}</span>
          <nav aria-label="Políticas e termos"><ul class="rodape-documentos">${documentos}</ul></nav>
        </div>
      </div>`;
    ligarSelos(alvo);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montar);
  else montar();
})();
