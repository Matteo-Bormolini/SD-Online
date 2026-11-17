/* =====================================================================
   S.D — LISTA DE ESCOLHA (componentes/lista-escolha/lista-escolha.js)
   Escolher VÁRIOS itens de uma lista, sem digitar: [lista ▾] [Adicionar]
   e os escolhidos viram etiquetas com "×" para remover.
   Não aceita repetido, nem item fora da lista, nem passar do máximo.
   Usado em: Atividades secundárias e Cidades atendidas (perfil do prestador).

   Uso:
     const l = SDListaEscolha.criar(alvo, {
       id: "f-secundarias", rotulo: "Adicionar atividade", max: 8,
       opcoes: () => ["Elétrica", "Hidráulica"],   // função: a lista pode mudar (ex.: tira o principal)
       valor: ["Elétrica"], vazio: "Nenhuma escolhida", aoMudar: (lista) => {}
     });
     l.valor → ["Elétrica"] · l.definir([...]) · l.atualizarOpcoes()
   ===================================================================== */
(function () {
  "use strict";
  const X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  const igual = (a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }) === 0;   // "Pintura" = "pintura"

  function criar(alvo, o = {}) {
    const id = o.id || "lista-" + Math.random().toString(36).slice(2, 7);
    const raiz = document.createElement("div");
    raiz.className = "lista-escolha";
    raiz.innerHTML = `
      <div class="lista-escolha-linha">
        <select id="${id}" aria-label="${o.rotulo || "Escolher item"}"${o.descricao ? ` aria-describedby="${o.descricao}"` : ""}></select>
        <button type="button" class="btn btn-pequeno">Adicionar</button>
      </div>
      <ul class="chips chips-remover" aria-label="${o.rotuloLista || "Escolhidos"}"></ul>
      <span class="nota lista-escolha-contador" aria-live="polite"></span>`;
    alvo.append(raiz);
    const sel = raiz.querySelector("select"), add = raiz.querySelector("button"), ul = raiz.querySelector("ul"), cont = raiz.querySelector(".lista-escolha-contador");
    let itens = [];

    function desenhar() {
      const disponiveis = (o.opcoes ? o.opcoes() : []).filter((x) => !itens.some((i) => igual(i, x)));
      sel.innerHTML = "";
      sel.append(new Option(itens.length >= o.max ? `Limite de ${o.max} atingido` : (o.textoEscolha || "Escolha na lista…"), ""));
      disponiveis.forEach((x) => sel.append(new Option(x, x)));
      sel.disabled = add.disabled = itens.length >= o.max || !disponiveis.length;
      ul.innerHTML = "";
      if (!itens.length) { const li = document.createElement("li"); li.className = "chip-vazio"; li.textContent = o.vazio || "Nenhum escolhido"; ul.append(li); }
      itens.forEach((t, i) => {
        const li = document.createElement("li");
        const nome = document.createElement("span"); nome.textContent = t;
        const b = document.createElement("button");
        b.type = "button"; b.className = "chip-x"; b.innerHTML = X; b.setAttribute("aria-label", "Remover " + t);
        b.addEventListener("click", () => { itens.splice(i, 1); desenhar(); mudou(); sel.focus(); });
        li.append(nome, b); ul.append(li);
      });
      cont.textContent = o.max ? `${itens.length} de ${o.max}` : "";
    }
    const mudou = () => { if (o.aoMudar) o.aoMudar(itens.slice()); };
    function adicionar() {
      const v = sel.value;
      if (!v || itens.length >= o.max || itens.some((i) => igual(i, v))) return;
      itens.push(v); desenhar(); mudou(); sel.focus();
    }
    add.addEventListener("click", adicionar);
    sel.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); adicionar(); } });

    const api = {
      elemento: raiz, select: sel,
      get valor() { return itens.slice(); },
      // Limpa repetidos e o que passar do máximo (dados antigos digitados à mão)
      definir(lista) {
        itens = [];
        (Array.isArray(lista) ? lista : []).forEach((x) => { x = String(x).trim(); if (x && !itens.some((i) => igual(i, x)) && itens.length < o.max) itens.push(x); });
        desenhar();
      },
      atualizarOpcoes: desenhar
    };
    api.definir(o.valor);
    return api;
  }

  window.SDListaEscolha = Object.freeze({ criar });
})();
