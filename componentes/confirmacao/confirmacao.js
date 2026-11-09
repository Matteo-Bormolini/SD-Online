/* =====================================================================
   S.D — POP-UP DE CONFIRMAÇÃO (componentes/confirmacao/confirmacao.js)
   PADRÃO DO SITE (09/11/2026): todo botão que EXCLUI ou EDITA algo
   pergunta antes. Evita mudança sem querer.
   Usa o estilo .modal de configuracoes/base.css (seção 9).

   Uso:
     const ok = await SDConfirmar({
       titulo: "Excluir telefone?",
       texto:  "O número (11) 90000-0000 será removido.",
       sim:    "Sim, excluir",       // texto do botão de confirmar
       tipo:   "excluir"             // "excluir" (ícone de alerta) ou "editar"
     });
     if (ok) { ...faz a ação... }

   Cancelar, tecla Esc ou clique fora = NÃO faz nada.
   O foco começa em "Cancelar" (o mais seguro).
   ===================================================================== */
(function () {
  "use strict";

  const ICONES = {
    excluir: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg>',
    editar:  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>'
  };

  let dialogo = null;

  // Cria o pop-up uma única vez e reaproveita
  function montar() {
    if (dialogo) return dialogo;
    dialogo = document.createElement("dialog");
    dialogo.className = "modal";
    dialogo.id = "sd-confirmacao";
    dialogo.setAttribute("aria-labelledby", "sd-confirmacao-titulo");
    dialogo.setAttribute("aria-describedby", "sd-confirmacao-texto");
    dialogo.innerHTML = `
      <div class="modal-icone" aria-hidden="true"></div>
      <h2 id="sd-confirmacao-titulo"></h2>
      <p id="sd-confirmacao-texto"></p>
      <div class="modal-acoes">
        <button type="button" class="btn" data-resposta="nao">Cancelar</button>
        <button type="button" class="btn" data-resposta="sim"></button>
      </div>`;
    document.body.append(dialogo);
    if (window.SDUtil) window.SDUtil.ligarPopup(dialogo);   // clique fora fecha e o foco volta
    return dialogo;
  }

  function SDConfirmar(opcoes = {}) {
    const d = montar();
    const tipo = opcoes.tipo === "editar" ? "editar" : "excluir";
    const icone = d.querySelector(".modal-icone");
    icone.innerHTML = ICONES[tipo];
    icone.classList.toggle("modal-icone-editar", tipo === "editar");
    d.querySelector("#sd-confirmacao-titulo").textContent = opcoes.titulo || "Tem certeza?";
    d.querySelector("#sd-confirmacao-texto").textContent = opcoes.texto || "";
    d.querySelector('[data-resposta="sim"]').textContent = opcoes.sim || (tipo === "editar" ? "Sim, salvar" : "Sim, excluir");

    return new Promise((resolver) => {
      let resposta = false;
      const aoClicar = (e) => {
        const b = e.target.closest("[data-resposta]");
        if (!b) return;
        resposta = b.dataset.resposta === "sim";
        d.close();
      };
      const aoFechar = () => {
        d.removeEventListener("click", aoClicar);
        d.removeEventListener("close", aoFechar);
        resolver(resposta);
      };
      d.addEventListener("click", aoClicar);
      d.addEventListener("close", aoFechar);
      if (d.abrir) d.abrir(); else d.showModal();
      d.querySelector('[data-resposta="nao"]').focus();
    });
  }

  window.SDConfirmar = SDConfirmar;
})();
