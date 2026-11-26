/* =====================================================================
   S.D — SEUS SERVIÇOS (localizar-condominios/seus-servicos.js) · v0.8.7
   Quadro do prestador (antes ficava na aba "Meus serviços" do perfil).
   Blocos: Resumo (4 números) · Quadro (etapas) · Encerrados (fechado).
   Dados: componentes/pedidos + firebase/pedidos.js (contatos REAIS).
   ===================================================================== */
(function () {
  "use strict";
  const U = window.SDUtil, SD = window.SD;
  const $ = (s) => document.querySelector(s);
  let quadro = null;

  /* ---------- 1. ESPERA O MÓDULO DE PEDIDOS (carregado pelo firebase.js) ---------- */
  const pedidosApi = () => (window.SDPedidos ? Promise.resolve(window.SDPedidos) : new Promise((ok) => {
    const t = setTimeout(() => ok(window.SDPedidos || null), 12000);
    document.addEventListener("sd:pedidos-pronto", () => { clearTimeout(t); ok(window.SDPedidos); }, { once: true });
  }));

  // Texto no lugar dos blocos (carregando, adm, erro). Vazio = mostra os blocos.
  function estado(texto) {
    const e = $("#ss-estado");
    e.textContent = texto;
    e.hidden = !texto;
    $("#ss-blocos").hidden = !!texto;
  }

  /* ---------- 2. BOTÕES DOS CARTÕES ---------- */
  async function acaoQuadro(acao, s) {
    const T = window.SDPedidos, D = window.SDPedidosDados;
    try {
      if (acao === "orcar" || acao === "editar") await T.abrirOrcamento(s._orig);
      else if (acao === "nao-fiz") await D.responderNao(s.id);
      else if (acao === "concluir") await D.concluir(s.id);
      else if (acao === "encerrar") await D.encerrarPeloPrestador(s.id);
      else if (acao === "arquivar") await D.arquivar(s.id);
    } catch (e) {
      U.mostrarMensagem($("#msg-geral"), "erro", "Não foi salvo: " + D.mensagemErro(e));
    }
  }

  /* ---------- 3. INÍCIO ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    // O adm não tem quadro próprio (cada prestador vê só os dele)
    if (SD.tipoUsuario() === "adm") {
      estado("Esta página mostra o quadro de cada prestador: contatos, orçamentos e serviços. Entre com uma conta de prestador para ver um quadro.");
      return;
    }
    const T = await pedidosApi(), D = window.SDPedidosDados;
    if (!T || !D) { estado("Não foi possível carregar seus serviços agora. Recarregue a página."); return; }
    try { await D.carregar(); } catch (e) { estado("Não foi possível carregar seus serviços: " + D.mensagemErro(e)); return; }
    if (D.papel() !== "prestador") { estado("Esta página é só para contas de prestador."); return; }

    estado("");
    quadro = window.SDKanban.criar({
      alvo: $("#kanban"), resumo: $("#kanban-resumo"), total: $("#servicos-total"), anuncio: $("#kanban-anuncio"),
      encerrados: $("#kanban-encerrados"),
      servicos: T.paraKanban(), aoAcao: acaoQuadro,
      umaPorVez: true                                    // celular: uma etapa aberta por vez
    });
    document.addEventListener("sd:pedidos-mudou", () => quadro.atualizar(T.paraKanban()));
  });

  // Gancho só para testes automatizados
  window.__SDSeusServicos = { get quadro() { return quadro; } };
})();
