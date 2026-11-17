/* =====================================================================
   S.D — DATAHORA (componentes/datahora/datahora.js)
   Uma peça só para TODO campo de data e/ou hora do site.
   (Substitui componentes/hora-rolante.)

   1) CAMPO  → SDDataHora.criar(alvo, opções)
      Campo compacto: dá para DIGITAR (08:30 · 17/11/2026) ou clicar no
      ícone e escolher no painel:
        - relógio: duas rodinhas (horas : minutos) — roda com o dedo, com a
          rodinha do mouse (1 passo por "clique" da rodinha), arrastando,
          clicando no número ou pelo teclado (↑ ↓ PageUp PageDown Home End);
        - calendário: mês com setas ‹ ›, clique no dia ou teclado (setas).
      Opções: { id, rotulo, modo: "hora" | "data" | "datahora", valor,
                passoMinutos (5), min / max (data AAAA-MM-DD), descricao, aoMudar }
      Valor: "HH:MM" · "AAAA-MM-DD" · "AAAA-MM-DDTHH:MM" ("" = vazio)

   2) SEMANA → SDDataHora.semana(alvo, opções)
      Horários por dia da semana (até 3 faixas): [Seg Ter … Dom] das 08:00 às 17:00.
      Usado em "Horário para visitas" (CNPJ) e "Horário de atendimento" (Prestador).
      Valor: { faixas: [{ dias: [1..5], inicio: "08:00", fim: "17:00" }], obs } ou null (não informado)
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. CONFIGURAÇÃO ← MUDE AQUI ---------- */
  const CONFIG = {
    passoMinutos: 5,               // rodinha dos minutos: 00, 05, 10 … 55
    pixelsPorPasso: 40,            // trackpad: quanto rolar para andar 1 número
    maxFaixas: 3                   // faixas de horário na semana
  };
  const DIAS = [                   // ordem na tela: segunda → domingo (0 = domingo, igual ao JavaScript)
    { n: 1, curto: "Seg", nome: "Segunda" }, { n: 2, curto: "Ter", nome: "Terça" }, { n: 3, curto: "Qua", nome: "Quarta" },
    { n: 4, curto: "Qui", nome: "Quinta" }, { n: 5, curto: "Sex", nome: "Sexta" }, { n: 6, curto: "Sáb", nome: "Sábado" },
    { n: 0, curto: "Dom", nome: "Domingo" }
  ];
  const ABREV = { 0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" };
  const MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  const ICONE = {
    relogio: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
    calendario: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>'
  };

  const dois = (n) => String(n).padStart(2, "0");
  const horaValida = (h) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h || "");
  const dataValida = (d) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d || "");
    if (!m) return false;
    const dt = new Date(+m[1], +m[2] - 1, +m[3]);
    return dt.getFullYear() === +m[1] && dt.getMonth() === +m[2] - 1 && dt.getDate() === +m[3];
  };
  const isoData = (dt) => `${dt.getFullYear()}-${dois(dt.getMonth() + 1)}-${dois(dt.getDate())}`;
  const dataTela = (iso) => (dataValida(iso) ? iso.split("-").reverse().join("/") : "");
  let contador = 0;
  const novoId = (base) => `${base || "dh"}-${++contador}`;

  /* ---------- 2. RODINHA (horas ou minutos) ---------- */
  function criarRoda({ valores, nome, aoMudar }) {
    const roda = document.createElement("div");
    roda.className = "dh-roda";
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
      li.addEventListener("click", () => { if (!arrastou) escolher(i, true); });
      lista.append(li);
    });
    roda.append(lista);

    let indice = 0, automatico = false, espera = null, arrastou = false;
    const alturaItem = () => (lista.firstElementChild ? lista.firstElementChild.offsetHeight : 0);

    function posicionar(suave) {
      const h = alturaItem();
      if (!h) return;                                    // escondida: posiciona quando aparecer
      automatico = true;
      roda.scrollTo({ top: indice * h, behavior: suave ? "smooth" : "auto" });
      clearTimeout(espera);
      espera = setTimeout(() => { automatico = false; }, suave ? 350 : 30);
    }
    function pintar() {
      roda.setAttribute("aria-valuenow", String(valores[indice]));
      roda.setAttribute("aria-valuetext", `${dois(valores[indice])} ${nome.toLowerCase()}`);
      [...lista.children].forEach((li, i) => li.classList.toggle("escolhido", i === indice));
    }
    function escolher(i, suave) {
      const novo = Math.max(0, Math.min(valores.length - 1, i));
      const mudou = novo !== indice;
      indice = novo; pintar(); posicionar(suave);
      if (mudou && aoMudar) aoMudar();
    }

    // RODINHA DO MOUSE / TRACKPAD: 1 passo por "clique" (antes pulava 3 números ou não andava)
    let acumulado = 0, ultimo = 0;
    roda.addEventListener("wheel", (e) => {
      e.preventDefault();                                // não rola a página junto
      const agora = Date.now();
      if (agora - ultimo > 250) acumulado = 0;           // novo movimento
      ultimo = agora;
      // deltaMode 1 = linhas (Firefox com mouse) · 0 = pixels (Chrome/Edge/Opera, trackpad)
      const px = e.deltaMode === 1 ? e.deltaY * CONFIG.pixelsPorPasso : e.deltaY;
      acumulado += px;
      // mouse comum manda ~100 px por clique: anda 1; trackpad manda pouco: soma até o limite
      if (Math.abs(acumulado) >= CONFIG.pixelsPorPasso) {
        escolher(indice + Math.sign(acumulado), true);
        acumulado = 0;
      }
    }, { passive: false });

    // DEDO (celular): rolagem nativa; quando para, o número do meio é o escolhido
    let parar = null;
    roda.addEventListener("scroll", () => {
      if (automatico) return;
      clearTimeout(parar);
      parar = setTimeout(() => {
        const h = alturaItem();
        if (!h) return;
        const i = Math.round(roda.scrollTop / h);
        if (i !== indice) { indice = Math.max(0, Math.min(valores.length - 1, i)); pintar(); if (aoMudar) aoMudar(); }
        posicionar(true);                                // encaixa certinho no meio
      }, 120);
    }, { passive: true });

    // MOUSE ARRASTANDO para cima/baixo
    let arrasto = null;
    roda.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      arrasto = { y: e.clientY, topo: roda.scrollTop }; arrastou = false;
    });
    window.addEventListener("pointermove", (e) => {
      if (!arrasto) return;
      const dy = e.clientY - arrasto.y;
      if (Math.abs(dy) > 4) { arrastou = true; roda.scrollTop = arrasto.topo - dy; }
    });
    window.addEventListener("pointerup", () => {
      if (!arrasto) return;
      arrasto = null;
      if (arrastou) { const h = alturaItem(); if (h) escolher(Math.round(roda.scrollTop / h), true); }
      setTimeout(() => { arrastou = false; }, 0);
    });

    // TECLADO
    roda.addEventListener("keydown", (e) => {
      const passos = { ArrowUp: -1, ArrowDown: 1, PageUp: -3, PageDown: 3 };
      if (e.key in passos) { e.preventDefault(); escolher(indice + passos[e.key], true); }
      if (e.key === "Home") { e.preventDefault(); escolher(0, true); }
      if (e.key === "End") { e.preventDefault(); escolher(valores.length - 1, true); }
    });

    return {
      elemento: roda,
      posicionar,
      get valor() { return valores[indice]; },
      definir(v) {                                       // fora da lista (ex.: 08:07) → o mais próximo
        let melhor = 0;
        valores.forEach((x, i) => { if (Math.abs(x - v) < Math.abs(valores[melhor] - v)) melhor = i; });
        indice = melhor; pintar(); posicionar(false);
      }
    };
  }

  /* ---------- 3. RELÓGIO (duas rodinhas) ---------- */
  function criarRelogio(aoMudar) {
    const caixa = document.createElement("div");
    caixa.className = "dh-relogio";
    const horas = criarRoda({ valores: Array.from({ length: 24 }, (_, i) => i), nome: "Horas", aoMudar });
    const minutos = criarRoda({ valores: Array.from({ length: 60 / CONFIG.passoMinutos }, (_, i) => i * CONFIG.passoMinutos), nome: "Minutos", aoMudar });
    const sep = document.createElement("span");
    sep.className = "dh-separador"; sep.textContent = ":"; sep.setAttribute("aria-hidden", "true");
    caixa.append(horas.elemento, sep, minutos.elemento);
    return {
      elemento: caixa,
      focar: () => horas.elemento.focus(),
      posicionar: () => { horas.posicionar(false); minutos.posicionar(false); },
      get valor() { return `${dois(horas.valor)}:${dois(minutos.valor)}`; },
      definir(h) {
        const m = /^(\d{1,2}):(\d{2})$/.exec(h || "");
        horas.definir(m ? Math.min(23, +m[1]) : 8);
        minutos.definir(m ? Math.min(59, +m[2]) : 0);
      }
    };
  }

  /* ---------- 4. CALENDÁRIO ---------- */
  function criarCalendario({ min, max, aoEscolher }) {
    const caixa = document.createElement("div");
    caixa.className = "dh-calendario";
    caixa.innerHTML = `
      <div class="dh-mes">
        <button type="button" class="dh-seta" data-mes="-1" aria-label="Mês anterior">‹</button>
        <span class="dh-mes-nome" aria-live="polite"></span>
        <button type="button" class="dh-seta" data-mes="1" aria-label="Próximo mês">›</button>
      </div>
      <div class="dh-semana" aria-hidden="true">${["D", "S", "T", "Q", "Q", "S", "S"].map((d) => `<span>${d}</span>`).join("")}</div>
      <div class="dh-dias" role="grid"></div>`;
    const grade = caixa.querySelector(".dh-dias");
    let mostrado = new Date(), escolhido = "", foco = isoData(new Date());
    const permitido = (iso) => (!min || iso >= min) && (!max || iso <= max);

    function desenhar(focar) {
      const ano = mostrado.getFullYear(), mes = mostrado.getMonth();
      caixa.querySelector(".dh-mes-nome").textContent = `${MESES[mes]} de ${ano}`;
      grade.innerHTML = "";
      const inicio = new Date(ano, mes, 1).getDay();
      for (let i = 0; i < inicio; i++) grade.append(document.createElement("span"));
      const total = new Date(ano, mes + 1, 0).getDate(), hoje = isoData(new Date());
      for (let d = 1; d <= total; d++) {
        const iso = isoData(new Date(ano, mes, d));
        const b = document.createElement("button");
        b.type = "button"; b.className = "dh-dia"; b.textContent = d; b.dataset.data = iso;
        b.setAttribute("aria-label", `${d} de ${MESES[mes]} de ${ano}`);
        if (iso === escolhido) b.setAttribute("aria-pressed", "true");
        if (iso === hoje) b.classList.add("hoje");
        if (!permitido(iso)) b.disabled = true;
        b.tabIndex = iso === foco ? 0 : -1;
        b.addEventListener("click", () => { escolhido = iso; foco = iso; desenhar(false); aoEscolher(iso); });
        grade.append(b);
      }
      if (focar) { const alvo = grade.querySelector(`[data-data="${foco}"]`); if (alvo) alvo.focus(); }
    }
    caixa.querySelectorAll(".dh-seta").forEach((b) => b.addEventListener("click", () => {
      mostrado = new Date(mostrado.getFullYear(), mostrado.getMonth() + Number(b.dataset.mes), 1);
      foco = isoData(mostrado); desenhar(false);
    }));
    grade.addEventListener("keydown", (e) => {
      const passos = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
      if (!(e.key in passos)) return;
      e.preventDefault();
      const [a, m, d] = foco.split("-").map(Number);
      const nova = new Date(a, m - 1, d + passos[e.key]);
      foco = isoData(nova);
      if (nova.getMonth() !== mostrado.getMonth() || nova.getFullYear() !== mostrado.getFullYear()) mostrado = new Date(nova.getFullYear(), nova.getMonth(), 1);
      desenhar(true);
    });
    return {
      elemento: caixa,
      focar: () => desenhar(true),
      definir(iso) {
        escolhido = dataValida(iso) ? iso : "";
        const base = escolhido ? new Date(...escolhido.split("-").map((n, i) => (i === 1 ? n - 1 : +n))) : new Date();
        mostrado = new Date(base.getFullYear(), base.getMonth(), 1);
        foco = escolhido || isoData(new Date());
        desenhar(false);
      }
    };
  }

  /* ---------- 5. CAMPO COMPLETO ---------- */
  let aberto = null;                                    // só um painel aberto por vez
  document.addEventListener("pointerdown", (e) => { if (aberto && !aberto.raiz.contains(e.target)) aberto.fechar(false); });

  function criar(alvo, opcoes = {}) {
    const modo = opcoes.modo || "hora";
    const id = opcoes.id || novoId("dh");
    const temHora = modo !== "data", temData = modo !== "hora";
    const raiz = document.createElement("div");
    raiz.className = "dh";
    raiz.innerHTML = `
      ${opcoes.rotulo ? `<label class="dh-rotulo" for="${id}">${opcoes.rotulo}</label>` : ""}
      <div class="dh-campo">
        <input type="text" id="${id}" inputmode="numeric" autocomplete="off"
          placeholder="${modo === "hora" ? "00:00" : modo === "data" ? "dd/mm/aaaa" : "dd/mm/aaaa 00:00"}"
          maxlength="${modo === "hora" ? 5 : modo === "data" ? 10 : 16}"${opcoes.descricao ? ` aria-describedby="${opcoes.descricao}"` : ""}>
        <button type="button" class="dh-abrir" aria-haspopup="dialog" aria-expanded="false" aria-controls="${id}-painel"
          aria-label="${temData ? "Abrir calendário" : "Abrir relógio"}${opcoes.rotulo ? ": " + opcoes.rotulo : ""}">${temData ? ICONE.calendario : ICONE.relogio}</button>
      </div>
      <div class="dh-painel" id="${id}-painel" role="dialog" aria-label="${opcoes.rotulo || "Escolher"}" hidden></div>`;
    alvo.append(raiz);
    const input = raiz.querySelector("input"), botao = raiz.querySelector(".dh-abrir"), painel = raiz.querySelector(".dh-painel");

    let data = "", hora = "";
    const avisar = () => { if (opcoes.aoMudar) opcoes.aoMudar(controle.valor); };
    const mostrar = () => { input.value = [dataTela(data), temHora ? hora : ""].filter(Boolean).join(" "); };

    const relogio = temHora ? criarRelogio(() => { hora = relogio.valor; mostrar(); avisar(); }) : null;
    const calendario = temData ? criarCalendario({ min: opcoes.min, max: opcoes.max,
      aoEscolher: (iso) => { data = iso; mostrar(); avisar(); if (!temHora) fechar(true); } }) : null;
    if (calendario) painel.append(calendario.elemento);
    if (relogio) painel.append(relogio.elemento);
    const pronto = document.createElement("button");
    pronto.type = "button"; pronto.className = "btn btn-pequeno dh-pronto"; pronto.textContent = "Pronto";
    pronto.addEventListener("click", () => fechar(true));
    painel.append(pronto);

    function abrir() {
      if (aberto && aberto !== api) aberto.fechar(false);
      painel.hidden = false; botao.setAttribute("aria-expanded", "true"); raiz.classList.add("aberto");
      if (relogio) { if (!hora) { hora = horaValida(opcoes.padrao) ? opcoes.padrao : "08:00"; mostrar(); avisar(); } relogio.definir(hora); relogio.posicionar(); }
      if (calendario) calendario.definir(data);
      aberto = api;
      requestAnimationFrame(() => { if (relogio) relogio.posicionar(); (calendario || relogio).focar(); });
    }
    function fechar(focarBotao) {
      if (painel.hidden) return;
      painel.hidden = true; botao.setAttribute("aria-expanded", "false"); raiz.classList.remove("aberto");
      if (aberto === api) aberto = null;
      if (focarBotao) botao.focus();
    }
    const api = { raiz, fechar };
    botao.addEventListener("click", () => (painel.hidden ? abrir() : fechar(true)));
    painel.addEventListener("keydown", (e) => { if (e.key === "Escape") { e.stopPropagation(); fechar(true); } });

    // DIGITAR: máscara (só números) e conferência ao sair do campo
    input.addEventListener("input", () => {
      const n = input.value.replace(/\D/g, "");
      let t = n;
      if (modo === "hora") t = n.length > 2 ? `${n.slice(0, 2)}:${n.slice(2, 4)}` : n;
      else {
        t = n.slice(0, 2) + (n.length > 2 ? "/" + n.slice(2, 4) : "") + (n.length > 4 ? "/" + n.slice(4, 8) : "");
        if (modo === "datahora" && n.length > 8) t += " " + n.slice(8, 10) + (n.length > 10 ? ":" + n.slice(10, 12) : "");
      }
      input.value = t;
    });
    input.addEventListener("change", () => {
      const t = input.value.trim();
      if (!t) { data = ""; hora = ""; avisar(); return; }
      const mh = /(\d{2}):(\d{2})$/.exec(t), md = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(t);
      if (temHora) hora = mh && horaValida(`${mh[1]}:${mh[2]}`) ? `${mh[1]}:${mh[2]}` : hora;
      if (temData) data = md && dataValida(`${md[3]}-${md[2]}-${md[1]}`) ? `${md[3]}-${md[2]}-${md[1]}` : data;
      mostrar(); avisar();
    });
    input.addEventListener("keydown", (e) => { if (e.key === "ArrowDown" && e.altKey) { e.preventDefault(); abrir(); } });

    const controle = {
      elemento: raiz, input,
      get valor() {
        if (modo === "hora") return horaValida(hora) ? hora : "";
        if (modo === "data") return dataValida(data) ? data : "";
        return dataValida(data) && horaValida(hora) ? `${data}T${hora}` : "";
      },
      definir(v) {
        v = String(v || "");
        if (modo === "hora") hora = horaValida(v) ? v : "";
        else if (modo === "data") data = dataValida(v) ? v : "";
        else { const [d, h] = v.split("T"); data = dataValida(d) ? d : ""; hora = horaValida(h) ? h : ""; }
        mostrar();
      },
      focar: () => input.focus(),
      fechar: () => fechar(false)
    };
    controle.definir(opcoes.valor);
    return controle;
  }

  /* ---------- 6. SEMANA (faixas de dias + horas) ---------- */
  // [1,2,3,4,5] → "Seg a Sex" · [1,3,5] → "Seg, Qua, Sex"
  function textoDias(dias) {
    const pos = DIAS.map((d, i) => (dias.includes(d.n) ? i : -1)).filter((i) => i >= 0);
    const blocos = [];
    pos.forEach((p) => { const u = blocos[blocos.length - 1]; if (u && p === u[1] + 1) u[1] = p; else blocos.push([p, p]); });
    return blocos.map(([a, z]) => (a === z ? ABREV[DIAS[a].n] : `${ABREV[DIAS[a].n]}${z - a > 1 ? " a " : ", "}${ABREV[DIAS[z].n]}`)).join(", ");
  }
  // Texto para mostrar no perfil (aceita o formato antigo, que era texto livre)
  function textoSemana(h) {
    if (typeof h === "string") return h || "—";
    if (!h || !Array.isArray(h.faixas) || !h.faixas.length) return "—";
    const t = h.faixas.map((f) => `${textoDias(f.dias || [])}, ${f.inicio} às ${f.fim}`).join(" · ");
    return h.obs ? `${t} — ${h.obs}` : t;
  }

  function semana(alvo, opcoes = {}) {
    const base = opcoes.idBase || novoId("semana");
    const max = opcoes.maxFaixas || CONFIG.maxFaixas;
    const raiz = document.createElement("div");
    raiz.className = "dh-semana-editor";
    raiz.innerHTML = `
      <ol class="dh-faixas"></ol>
      <button type="button" class="btn btn-pequeno dh-add-faixa">+ Adicionar horário</button>
      ${opcoes.comObs === false ? "" : `
      <div class="campo dh-obs">
        <label for="${base}-obs">Observação <span class="nota">(opcional)</span></label>
        <input type="text" id="${base}-obs" maxlength="${opcoes.maxObs || 80}" placeholder="${opcoes.dicaObs || ""}" aria-describedby="${base}-obs-erro">
        <span class="campo-erro" id="${base}-obs-erro"></span>
      </div>`}`;
    alvo.append(raiz);
    const lista = raiz.querySelector(".dh-faixas"), add = raiz.querySelector(".dh-add-faixa"), obs = raiz.querySelector(`#${base}-obs`);
    let faixas = [];                                     // [{ li, inicio, fim }]

    function criarFaixa(f) {
      const n = faixas.length + 1;
      const li = document.createElement("li");
      li.className = "dh-faixa";
      li.innerHTML = `
        <fieldset class="dh-dias-semana"><legend class="visualmente-oculto">Horário ${n}: dias</legend>
          ${DIAS.map((d, j) => `<label class="dh-dia-caixa" title="${d.nome}"><input type="checkbox" value="${d.n}"${j === 0 ? ` id="${base}-${n}-dias"` : ""}${(f.dias || []).includes(d.n) ? " checked" : ""}>
            <span aria-hidden="true">${d.curto}</span><span class="visualmente-oculto">${d.nome}</span></label>`).join("")}
        </fieldset>
        <span class="dh-par"><span class="dh-texto">das</span><span class="dh-lugar" data-hora="inicio"></span></span>
        <span class="dh-par"><span class="dh-texto">às</span><span class="dh-lugar" data-hora="fim"></span></span>
        <button type="button" class="btn btn-pequeno btn-icone dh-remover" aria-label="Remover horário ${n}" title="Remover horário ${n}">${ICONE.x}</button>
        <span class="campo-erro dh-faixa-erro" id="${base}-${n}-erro" role="alert"></span>`;
      const item = { li };
      item.inicio = criar(li.querySelector('[data-hora="inicio"]'), { id: `${base}-${n}-inicio`, modo: "hora", valor: f.inicio || "", padrao: "08:00", descricao: `${base}-${n}-erro` });
      item.fim = criar(li.querySelector('[data-hora="fim"]'), { id: `${base}-${n}-fim`, modo: "hora", valor: f.fim || "", padrao: "17:00", descricao: `${base}-${n}-erro` });
      item.inicio.input.setAttribute("aria-label", `Horário ${n}: início`);
      item.fim.input.setAttribute("aria-label", `Horário ${n}: fim`);
      li.querySelector(".dh-remover").addEventListener("click", () => {
        const atual = ler(); atual.faixas.splice(faixas.indexOf(item), 1); montar(atual.faixas); add.focus();
      });
      lista.append(li);
      faixas.push(item);
    }
    function montar(lista_) {
      lista.innerHTML = ""; faixas = [];
      (lista_.length ? lista_ : [{ dias: [], inicio: "", fim: "" }]).slice(0, max).forEach(criarFaixa);
      raiz.querySelectorAll(".dh-remover").forEach((b) => { b.hidden = faixas.length === 1; });
      add.disabled = faixas.length >= max;
      if (opcoes.aoMudar) opcoes.aoMudar();
    }
    function ler() {
      return {
        faixas: faixas.map((it) => ({
          dias: [...it.li.querySelectorAll('input[type="checkbox"]:checked')].map((c) => Number(c.value)),
          inicio: it.inicio.valor, fim: it.fim.valor
        })),
        obs: obs ? obs.value.trim() : ""
      };
    }
    add.addEventListener("click", () => {
      const atual = ler();
      if (atual.faixas.length >= max) return;
      atual.faixas.push({ dias: [], inicio: "", fim: "" });
      montar(atual.faixas);
      const ultimo = raiz.querySelector(`#${base}-${faixas.length}-dias`); if (ultimo) ultimo.focus();
    });

    const controle = {
      elemento: raiz,
      // null = nada preenchido (o campo continua "não informado")
      get valor() {
        const v = ler();
        v.faixas = v.faixas.filter((f) => f.dias.length || f.inicio || f.fim);
        return v.faixas.length || v.obs ? v : null;
      },
      definir(h) {
        const ok = h && typeof h === "object" && Array.isArray(h.faixas);
        montar(ok ? h.faixas : []);
        if (obs) obs.value = ok ? h.obs || "" : "";
      },
      // Confere e marca os erros. marcar(id, mensagem) vem do formulário.
      validar(marcar) {
        const v = ler();
        v.faixas.forEach((f, i) => {
          const n = i + 1, vazia = !f.dias.length && !f.inicio && !f.fim;
          if (vazia) return;                             // faixa em branco é ignorada
          if (!f.dias.length) marcar(`${base}-${n}-dias`, `Horário ${n}: marque pelo menos um dia.`);
          else if (!f.inicio || !f.fim) marcar(`${base}-${n}-inicio`, `Horário ${n}: escolha o início e o fim.`);
          else if (f.fim <= f.inicio) marcar(`${base}-${n}-fim`, `Horário ${n}: o fim precisa ser depois do início.`);
        });
        if (obs && v.obs && v.obs.length < 3) marcar(`${base}-obs`, "Observação muito curta.");
      },
      limpar() { controle.definir(null); }
    };
    controle.definir(opcoes.valor);
    return controle;
  }

  window.SDDataHora = Object.freeze({ criar, semana, textoSemana, textoDias, horaValida, dataValida, CONFIG });
})();
