/* =====================================================================
   S.D — PÁGINA DOS BOTÕES LIGA/DESLIGA (interruptores/interruptores.js)
   Monta um cartão para cada botão cadastrado em configuracoes/interruptores.js.
   Não liga nem desliga nada: é só consulta.
   ===================================================================== */
(function () {
  "use strict";
  document.addEventListener("DOMContentLoaded", () => {
    const R = window.SD_INTERRUPTORES, A = window.SD_ACESSO;
    const lista = document.getElementById("interruptores-lista");
    if (!R || !lista) return;
    const nomeTipo = (t) => (A ? A.nomePerfil(t) : t);
    const itens = Object.entries(R.LISTA);
    document.getElementById("interruptores-total").textContent = `${itens.length} botões cadastrados`;

    itens.forEach(([id, b]) => {
      const li = document.createElement("li");
      li.className = "interruptor-cartao";
      const h2 = document.createElement("h2");
      const nome = document.createElement("span"); nome.textContent = b.nome;
      h2.append(nome);
      if (b.situacao === "planejado") {
        const s = document.createElement("span"); s.className = "situacao-planejado"; s.textContent = "Planejado"; h2.append(s);
      }
      // Amostra do botão no estado PADRÃO
      const amostra = document.createElement("span");
      amostra.className = "interruptor";
      amostra.setAttribute("aria-hidden", "true");
      amostra.innerHTML = '<span class="interruptor-trilho"><span class="interruptor-bola"></span></span><span class="interruptor-estado"></span>';
      amostra.setAttribute("aria-checked", String(b.padrao));
      amostra.querySelector(".interruptor-estado").textContent = b.padrao ? "Ligado" : "Desligado";
      const codigo = document.createElement("span"); codigo.className = "interruptor-id"; codigo.textContent = id;
      const p = document.createElement("p"); p.textContent = b.oQueFaz;

      const dl = document.createElement("dl");
      [
        ["Começa", b.padrao ? "Ligado" : "Desligado"],
        ["Ligado", b.ligado],
        ["Desligado", b.desligado],
        ["Quem tem", b.quem.map(nomeTipo).join(", ")],
        ["Onde fica", b.onde]
      ].forEach(([t, d]) => {
        const dt = document.createElement("dt"); dt.textContent = t;
        const dd = document.createElement("dd"); dd.textContent = d;
        dl.append(dt, dd);
      });
      li.append(h2, codigo, amostra, p, dl);
      lista.append(li);
    });
  });
})();
