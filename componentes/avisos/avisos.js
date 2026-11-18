/* =====================================================================
   S.D — CENTRAL DE AVISOS / SINO (componentes/avisos/avisos.js) · v0.8.0
   Carregado sozinho por firebase/pedidos.js (quem tem conta completa).
   - Botão de sino na NavBar (ao lado de "Meu perfil") com o número de não lidos.
   - Lista os avisos da coleção "avisos" (apagados sozinhos em 30 dias) e os
     LEMBRETES do cliente (orçamentos sem "Fechei com este": 3º, 7º e 15º dia).
   - Clicar no aviso marca como lido e abre o perfil na aba Serviços.
   GRÁTIS: sem e-mail/notificação no celular (precisam de servidor pago).
   O aviso aparece quando a pessoa abre o site.
   ===================================================================== */
(function () {
  "use strict";
  const D = window.SDPedidosDados, SD = window.SD;
  if (!D || !SD) return;
  const esc = SD.esc;
  const ATUALIZAR_A_CADA_MS = 2 * 60 * 1000;      // ao voltar para a aba, lê de novo (no máximo a cada 2 min) ← MUDE AQUI

  /* ---------- 1. TEXTO DE CADA TIPO ← MUDE AQUI ---------- */
  const TEXTOS = {
    "novo-contato": (n, s) => `${n} chamou você pelo site (${s}). Você fez orçamento?`,
    "orcamento": (n, s) => `${n} enviou um orçamento para ${s}.`,
    "orcamento-alterado": (n, s) => `${n} alterou o orçamento de ${s}.`,
    "nao-orcou": (n, s) => `${n} não vai orçar ${s}.`,
    "escolhido": (n, s) => `${n} fechou com você: ${s}.`,
    "nao-escolhido": (n, s) => `${n} escolheu outro prestador para ${s}.`,
    "cancelado": (n, s) => `${n} não vai seguir com ${s}.`,
    "encerrado": (n, s) => `${n} encerrou o atendimento de ${s}.`,
    "concluido": (n, s) => `${n} marcou ${s} como concluído. Confirme se o serviço foi feito.`,
    "prestado": (n, s) => `${n} confirmou que ${s} foi realizado.`
  };
  const textoAviso = (a) => (TEXTOS[a.tipo] || ((n, s) => `${n}: ${s}`))(a.nome || "Alguém", a.servico || "o serviço");
  const quando = (t) => {
    const dias = Math.floor(D.diasDesde(t));
    if (dias <= 0) return "hoje";
    if (dias === 1) return "ontem";
    return `há ${dias} dias`;
  };
  const destino = () => {
    const url = D.papel() === "prestador" ? SD.urlPagina("perfilPrestador") : SD.urlPerfil();
    return url + "#servicos";
  };

  const SINO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/></svg>';

  /* ---------- 2. BOTÃO NA NAVBAR + PAINEL ---------- */
  let botao = null, painel = null, avisos = [], ultimaLeitura = 0;

  function montar() {
    const direita = document.querySelector("#sd-navbar .nav-direita");
    if (!direita || document.getElementById("sd-btn-avisos")) return !!direita;
    const caixa = document.createElement("div");
    caixa.className = "sino-caixa";
    caixa.innerHTML = `
      <button type="button" class="nav-btn sino-botao" id="sd-btn-avisos" aria-expanded="false" aria-controls="sd-avisos-painel" aria-label="Avisos">
        ${SINO}<span class="sino-numero" hidden></span>
      </button>
      <section class="sino-painel" id="sd-avisos-painel" hidden aria-labelledby="sd-avisos-titulo">
        <header class="sino-topo">
          <h2 id="sd-avisos-titulo">Avisos</h2>
          <button type="button" class="sino-ler-todos" hidden>Marcar todos como lidos</button>
        </header>
        <ul class="sino-lista"></ul>
        <p class="sino-vazio">Nenhum aviso por enquanto.</p>
        <p class="sino-rodape">Os avisos são apagados depois de 30 dias.</p>
      </section>`;
    const perfil = direita.querySelector("a.nav-btn");
    direita.insertBefore(caixa, perfil || direita.firstChild);
    botao = caixa.querySelector("#sd-btn-avisos");
    painel = caixa.querySelector("#sd-avisos-painel");
    botao.addEventListener("click", () => abrir(painel.hidden));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !painel.hidden) { abrir(false); botao.focus(); } });
    document.addEventListener("click", (e) => { if (!painel.hidden && !e.composedPath().includes(caixa)) abrir(false); });
    caixa.querySelector(".sino-ler-todos").addEventListener("click", async () => {
      const nao = avisos.filter((a) => !a.lido && !a.local);
      nao.forEach((a) => { a.lido = true; });
      desenhar();
      await Promise.all(nao.map((a) => D.marcarLido(a.id).catch(() => null)));
    });
    return true;
  }
  function abrir(sim) {
    painel.hidden = !sim;
    botao.setAttribute("aria-expanded", String(sim));
  }

  function desenhar() {
    if (!botao) return;
    const lista = painel.querySelector(".sino-lista");
    const naoLidos = avisos.filter((a) => !a.lido).length;
    const numero = botao.querySelector(".sino-numero");
    numero.hidden = !naoLidos;
    numero.textContent = naoLidos > 9 ? "9+" : String(naoLidos);
    botao.setAttribute("aria-label", naoLidos ? `Avisos: ${naoLidos} não ${naoLidos === 1 ? "lido" : "lidos"}` : "Avisos");
    painel.querySelector(".sino-vazio").hidden = avisos.length > 0;
    painel.querySelector(".sino-ler-todos").hidden = !avisos.some((a) => !a.lido && !a.local);
    lista.innerHTML = "";
    avisos.forEach((a) => {
      const li = document.createElement("li");
      li.className = "sino-item" + (a.lido ? "" : " nao-lido");
      const link = document.createElement("a");
      link.href = destino();
      link.innerHTML = `<span class="sino-texto">${esc(a.texto)}</span><span class="sino-quando">${esc(a.quando)}</span>`;
      link.addEventListener("click", (e) => {
        e.preventDefault();
        abrir(false);
        if (!a.local && !a.lido) { a.lido = true; desenhar(); D.marcarLido(a.id).catch(() => null); }
        // Contato ainda sem resposta (prestador): reabre a mesma janela "Você fez orçamento?"
        if (a.tipo === "novo-contato" && window.SDPedidos && window.SDPedidos.responderContato(a.orcamentoId)) return;
        irPara(link.href);
      });
      li.append(link);
      lista.append(li);
    });
  }

  // Abre o perfil na aba Serviços. Já está na página? Só troca a aba (sem recarregar).
  function irPara(href) {
    const destinoUrl = new URL(href, location.href);
    if (destinoUrl.pathname === location.pathname) {
      if (location.hash !== destinoUrl.hash) location.hash = destinoUrl.hash;
      else window.dispatchEvent(new HashChangeEvent("hashchange"));
      return;
    }
    location.href = destinoUrl.href;
  }

  /* ---------- 3. LER (ao abrir e ao voltar para a aba) ---------- */
  async function atualizar() {
    if (Date.now() - ultimaLeitura < 5000) return;
    ultimaLeitura = Date.now();
    let doBanco = [];
    try { doBanco = await D.listarAvisos(); } catch (e) { console.warn("[S.D] Avisos:", e.code || e); }
    const lembretes = D.lembretesCliente().map((l) => ({
      id: "lembrete-" + l.pedidoId, local: true, lido: false,
      texto: `Lembrete: você tem ${l.qtd} ${l.qtd === 1 ? "orçamento" : "orçamentos"} de ${l.servico} há ${l.dias} dias. Já fechou com alguém?`,
      quando: "lembrete"
    }));
    avisos = [...lembretes, ...doBanco.map((a) => ({ ...a, texto: textoAviso(a), quando: quando(a.criadoEm) }))];
    desenhar();
  }

  function iniciar() {
    if (!montar()) return;
    atualizar();
    document.addEventListener("sd:pedidos-mudou", () => { ultimaLeitura = 0; atualizar(); });
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible" && Date.now() - ultimaLeitura > ATUALIZAR_A_CADA_MS) atualizar();
    });
  }
  // A NavBar é montada por navbar/navbar.js (defer); espera se ainda não existir
  if (document.querySelector("#sd-navbar .nav-direita")) iniciar();
  else document.addEventListener("DOMContentLoaded", iniciar);
  window.SDAvisos = Object.freeze({ atualizar, textoAviso });
})();
