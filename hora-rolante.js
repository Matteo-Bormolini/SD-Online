/* =====================================================================
   S.D — HORA ROLANTE (componentes/hora-rolante/hora-rolante.js)
   Seletor de hora em "rodinhas" (como no celular): uma roda para as
   HORAS (00 a 23) e outra para os MINUTOS (de 5 em 5). Só existe hora
   válida: não dá para escolher "110:23".

   Como usar a roda:
     - rolar com o dedo, o mouse ou o trackpad (o número do meio é o escolhido);
     - clicar em um número;
     - teclado: setas ↑ ↓, Page Up/Down (±3), Home e End.
   Acessível: cada roda é um "spinbutton" com o valor falado pelo leitor de tela.

   Uso:
     const h = SDHoraRolante.criar(alvo, { id: "f-hor-1-inicio", rotulo: "Das", valor: "08:00" });
     h.valor          → "08:00"
     h.definir("17:30")
   O id vai na roda das HORAS (para mensagens de erro e foco).
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. CONFIGURAÇÃO ---------- */
  const PASSO_MINUTOS = 5;                    // 00, 05, 10 … 55
  const HORAS = Array.from({ length: 24 }, (_, i) => i);
  const MINUTOS = Array.from({ length: 60 / PASSO_MINUTOS }, (_, i) => i * PASSO_MINUTOS);
  const dois = (n) => String(n).padStart(2, "0");

  /* ---------- 2. UMA RODA ---------- */
  function criarRoda({ id, valores, nome, aoMudar }) {
    const roda = document.createElement("div");
    roda.className = "roda";
    if (id) roda.id = id;
    roda.tabIndex = 0;
    roda.setAttribute("role", "spinbutton");
    roda.setAttribute("aria-label", nome);
    roda.setAttribute("aria-valuemin", String(valores[0]));
    roda.setAttribute("aria-valuemax", String(valores[valores.length - 1]));
    const lista = document.createElement("ul");
    lista.setAttribute("aria-hidden", "true");          // o leitor de tela usa o aria-valuenow
    valores.forEach((v, i) => {
      const li = document.createElement("li");
      li.textContent = dois(v);
      li.addEventListener("click", () => escolher(i, true));
      lista.append(li);
    });
    roda.append(lista);

    let indice = 0, automatico = false, espera = null;
    const alturaItem = () => (lista.firstElementChild ? lista.firstElementChild.offsetHeight : 0);

    // Leva o número escolhido para o meio da roda
    function posicionar(suave) {
      const h = alturaItem();
      if (!h) return;                                    // roda escondida: posiciona quando aparecer
      automatico = true;
      roda.scrollTo({ top: indice * h, behavior: suave ? "smooth" : "auto" });
      clearTimeout(espera);
      espera = setTimeout(() => { automatico = false; }, suave ? 400 : 50);
    }
    function pintar() {
      roda.setAttribute("aria-valuenow", String(valores[indice]));
      roda.setAttribute("aria-valuetext", `${dois(valores[indice])} ${nome.toLowerCase()}`);
      [...lista.children].forEach((li, i) => li.classList.toggle("escolhido", i === indice));
    }
    function escolher(i, suave) {
      const novo = Math.max(0, Math.min(valores.length - 1, i));
      const mudou = novo !== indice;
      indice = novo;
      pintar();
      posicionar(suave);
      if (mudou && aoMudar) aoMudar();
    }

    // Rolagem feita pela pessoa: o número que parou no meio vira o escolhido
    let parar = null;
    roda.addEventListener("scroll", () => {
      if (automatico) return;
      clearTimeout(parar);
      parar = setTimeout(() => {
        const h = alturaItem();
        if (!h) return;
        const i = Math.round(roda.scrollTop / h);
        if (i !== indice) { indice = Math.max(0, Math.min(valores.length - 1, i)); pintar(); if (aoMudar) aoMudar(); }
      }, 90);
    }, { passive: true });

    // Teclado
    roda.addEventListener("keydown", (e) => {
      const passos = { ArrowUp: -1, ArrowDown: 1, PageUp: -3, PageDown: 3 };
      if (e.key in passos) { e.preventDefault(); escolher(indice + passos[e.key], true); }
      if (e.key === "Home") { e.preventDefault(); escolher(0, true); }
      if (e.key === "End") { e.preventDefault(); escolher(valores.length - 1, true); }
    });

    // Quando a roda aparece (ex.: abrir "Editar perfil"), volta ao número certo
    if ("ResizeObserver" in window) new ResizeObserver(() => posicionar(false)).observe(roda);

    return {
      elemento: roda,
      get valor() { return valores[indice]; },
      definir(v) {
        // Valor fora da lista (ex.: 08:07) → o mais próximo
        let melhor = 0;
        valores.forEach((x, i) => { if (Math.abs(x - v) < Math.abs(valores[melhor] - v)) melhor = i; });
        indice = melhor; pintar(); posicionar(false);
      }
    };
  }

  /* ---------- 3. SELETOR COMPLETO (horas : minutos) ---------- */
  function criar(alvo, opcoes = {}) {
    const id = opcoes.id || "hora-" + Math.random().toString(36).slice(2, 8);
    const caixa = document.createElement("div");
    caixa.className = "hora-rolante";
    caixa.setAttribute("role", "group");
    caixa.setAttribute("aria-labelledby", id + "-rotulo");

    const rotulo = document.createElement("span");
    rotulo.className = "hora-rotulo";
    rotulo.id = id + "-rotulo";
    rotulo.textContent = opcoes.rotulo || "Hora";

    const rodas = document.createElement("div");
    rodas.className = "rodas";
    const aoMudar = () => { if (opcoes.aoMudar) opcoes.aoMudar(controle.valor); };
    const horas = criarRoda({ id, valores: HORAS, nome: "Horas", aoMudar });
    const minutos = criarRoda({ id: id + "-min", valores: MINUTOS, nome: "Minutos", aoMudar });
    const separador = document.createElement("span");
    separador.className = "rodas-separador";
    separador.setAttribute("aria-hidden", "true");
    separador.textContent = ":";
    if (opcoes.descricao) horas.elemento.setAttribute("aria-describedby", opcoes.descricao);
    rodas.append(horas.elemento, separador, minutos.elemento);
    caixa.append(rotulo, rodas);
    alvo.append(caixa);

    const controle = {
      get valor() { return `${dois(horas.valor)}:${dois(minutos.valor)}`; },
      definir(texto) {
        const m = /^(\d{1,2}):(\d{2})$/.exec(String(texto || ""));
        horas.definir(m ? Math.min(23, Number(m[1])) : 8);
        minutos.definir(m ? Math.min(59, Number(m[2])) : 0);
      },
      focar: () => horas.elemento.focus()
    };
    controle.definir(opcoes.valor || "08:00");
    return controle;
  }

  window.SDHoraRolante = Object.freeze({ criar, PASSO_MINUTOS });
})();
