/* =====================================================================
   S.D — PERFIL DO ADMINISTRADOR (perfil-adm/perfil-adm.js)
   O comportamento comum (abas, telefones, edição, exclusão) vem de
   componentes/perfil-base/perfil-base.js. Aqui fica só o exclusivo do adm:
     - "Cargo" = "Administrador - <cargo definido pelo líder>"
     - Foto de perfil (sem foto → iniciais do nome) + galeria de até 12 fotos
     - Aba "Administração" (v0.8.5: todos os botões liga/desliga juntos) e aba "Divulgações" (divulgacoes-adm.js)
   O adm vê dados sigilosos dos usuários, mas NUNCA a senha (hash no servidor).
   DADOS: sempre os REAIS (Firebase). Sem dados fictícios desde a v0.7.9.
   Galeria de fotos: ainda só na tela (próximo ciclo).
   ===================================================================== */
(function () {
  "use strict";
  const U = window.SDUtil, P = window.SDPerfil, SD = window.SD;
  const $ = P.$;

  /* ---------- 1. CONFIGURAÇÃO (fácil de ajustar) ---------- */
  const CONFIG = {
    ...P.PADRAO,                 // telefones (4), fotos (JPG/PNG/WEBP até 5 MB)
    maxFotosGaleria: 12,
    urlAvaliacoes: SD.urlPagina("avaliacoes")
  };

  /* ---------- 2. DADOS DO PERFIL ----------
     Começa VAZIO; carregarDadosReais() preenche com a conta logada. */
  const perfil = {
    nome: "", cargoBase: "Administrador", cargoLider: "", documento: "", email: "",
    telefones: [{ numero: "", principal: true }],
    endereco: "", numero: "", complemento: "", bairro: "", cep: "", cidade: "", uf: "",
    avaliacao: { media: 0, total: 0 }, foto: null, galeria: []
  };

  let telefones = null;

  /* ---------- 3. EXIBIÇÃO DOS DADOS ---------- */
  function renderizarDados() {
    P.preencherCampos({
      nome: perfil.nome,
      cargo: perfil.cargoLider ? perfil.cargoBase + " - " + perfil.cargoLider : perfil.cargoBase,  // espaço antes e depois do "-"
      documento: perfil.documento,
      email: perfil.email,
      ...P.enderecoParaTela(perfil)
    });
    P.preencherLinkAvaliacoes($("#link-avaliacoes"), perfil.avaliacao, CONFIG.urlAvaliacoes);
    P.preencherPlaceholders({
      "f-nome": perfil.nome, "f-email": perfil.email,
      "f-telefone": U.formatarTelefone(perfil.telefones.find((t) => t.principal)?.numero),
      ...P.placeholdersEndereco(perfil),
      "f-senha": "Deixe vazio para manter a atual", "f-senha2": "Repita a nova senha"
    });
    if (telefones) telefones.renderizar();
    renderizarFoto();
  }

  /* ---------- 4. FOTO DE PERFIL E GALERIA ---------- */
  function renderizarFoto() {
    const img = $("#foto-perfil");
    img.src = perfil.foto || U.iconeIniciais(perfil.nome);
    img.alt = "Foto de perfil de " + perfil.nome;
  }

  function renderizarGaleria() {
    const grade = $("#galeria-grade");
    grade.innerHTML = "";
    perfil.galeria.forEach((url, i) => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      img.src = url; img.alt = `Foto secundária ${i + 1}`; img.loading = "lazy";
      const rem = document.createElement("button");
      rem.type = "button"; rem.className = "btn-remover"; rem.innerHTML = P.ICONES.x;
      rem.setAttribute("aria-label", `Remover foto secundária ${i + 1}`);
      rem.addEventListener("click", () => { URL.revokeObjectURL(url); perfil.galeria.splice(i, 1); renderizarGaleria(); $("#btn-galeria").focus(); });
      li.append(img, rem);
      grade.append(li);
    });
    $("#titulo-galeria").textContent = `Galeria (${perfil.galeria.length})`;
    $("#galeria-vazia").hidden = perfil.galeria.length > 0;
    $("#btn-galeria").disabled = perfil.galeria.length >= CONFIG.maxFotosGaleria;
    P.atualizarAltura();
  }

  function iniciarFotos() {
    const msg = $("#msg-foto");
    $("#btn-foto").addEventListener("click", () => $("#input-foto").click());
    $("#btn-galeria").addEventListener("click", () => $("#input-galeria").click());

    $("#input-foto").addEventListener("change", async (e) => {
      const arq = e.target.files[0];
      e.target.value = "";
      if (!arq) return;
      const erro = P.validarArquivo(arq, CONFIG);
      if (erro) { U.mostrarMensagem(msg, "erro", erro); return; }
      await P.salvarFoto(perfil, arq, msg, renderizarFoto);   // reduz (256 px) e salva no perfil
    });

    $("#input-galeria").addEventListener("change", (e) => {
      const arquivos = [...e.target.files];
      e.target.value = "";
      const problemas = [];
      arquivos.forEach((arq) => {
        if (perfil.galeria.length >= CONFIG.maxFotosGaleria) { problemas.push(`Limite de ${CONFIG.maxFotosGaleria} fotos atingido.`); return; }
        const erro = P.validarArquivo(arq, CONFIG);
        if (erro) problemas.push(erro); else perfil.galeria.push(URL.createObjectURL(arq));
      });
      renderizarGaleria();
      if (problemas.length) U.mostrarMensagem(msg, "erro", [...new Set(problemas)].join(" "));
      else if (arquivos.length) U.mostrarMensagem(msg, "atencao", "Fotos adicionadas à pré-visualização (ainda não enviadas ao servidor).");
    });
  }

  /* ---------- 5. ABA ADMINISTRAÇÃO (v0.8.5: todos os botões juntos) ----------
     a) Botões do SITE TODO: funcionam de verdade. Começam no estado real do banco,
        salvam na hora e confirmam "Salvo". Se o banco recusar, o botão VOLTA
        sozinho (sem tentar salvar de novo) e aparece o erro.
     b) Botões de CADA CONTA: só consulta (texto), sem botão falso. */
  // id do botão → campo em configuracoes/site ← MUDE AQUI (igual a firebase.js → INTERRUPTORES_DO_SITE)
  const BOTOES_DO_SITE = { "conferir-documentos": "conferirDocumentos" };

  async function iniciarConfigSite() {
    const caixa = $("#adm-config-site"), msg = $("#msg-config-site");
    const F = window.SDFirebase, R = window.SD_INTERRUPTORES;
    if (!caixa || !R) return;
    if (!F || !F.ativo) { caixa.textContent = "Disponível só com o Firebase ligado."; return; }
    let cfg;
    try { cfg = await F.configSite(true); }
    catch (_) { caixa.textContent = "Não foi possível ler as configurações agora."; return; }
    caixa.innerHTML = "";
    for (const [id, campo] of Object.entries(BOTOES_DO_SITE)) {
      R.gravar(id, cfg[campo] !== false);                // começa no estado REAL do banco
      const b = document.createElement("button");
      b.className = "interruptor";
      b.dataset.interruptor = id;
      caixa.append(b);
    }
    window.SD_INTERRUPTORES_LIGAR(caixa);

    // Mostra o estado do botão sem disparar o salvamento de novo
    const pintar = (botao, ligado) => {
      botao.setAttribute("aria-checked", String(ligado));
      botao.querySelector(".interruptor-estado").textContent = ligado ? "Ligado" : "Desligado";
      const aviso = botao.nextElementSibling;
      if (aviso && aviso.classList.contains("interruptor-aviso")) aviso.hidden = ligado;
    };
    const botaoDe = (id) => caixa.querySelector(`[data-interruptor="${id}"]`);
    // Clique: trava o botão enquanto salva
    document.addEventListener("sd:interruptor", (ev) => {
      const b = botaoDe(ev.detail.id);
      if (!b || !BOTOES_DO_SITE[ev.detail.id]) return;
      b.disabled = true;
      U.mostrarMensagem(msg, "info", "Salvando…");
    });
    document.addEventListener("sd:interruptor-salvo", (ev) => {
      const b = botaoDe(ev.detail.id);
      if (!b) return;
      b.disabled = false;
      U.mostrarMensagem(msg, "sucesso", `Salvo: "${R.LISTA[ev.detail.id].nome}" ${ev.detail.ligado ? "ligado" : "desligado"}.`);
    });
    document.addEventListener("sd:interruptor-erro", (ev) => {
      const b = botaoDe(ev.detail.id);
      if (!b) return;
      const voltar = b.getAttribute("aria-checked") !== "true";   // estado de antes do clique
      pintar(b, voltar);
      R.gravar(ev.detail.id, voltar);
      b.disabled = false;
      U.mostrarMensagem(msg, "erro", "Não foi possível salvar (o botão voltou como estava): " + ev.detail.erro);
    });
    P.atualizarAltura();
  }

  // Botões de cada conta: cartões só de consulta
  function montarBotoesContas() {
    const ul = $("#adm-botoes-contas"), R = window.SD_INTERRUPTORES, A = window.SD_ACESSO;
    if (!ul || !R) return;
    const nomeTipo = (t) => (A ? A.nomePerfil(t) : t);
    ul.innerHTML = "";
    Object.entries(R.LISTA).filter(([id]) => !BOTOES_DO_SITE[id]).forEach(([id, b]) => {
      const li = document.createElement("li");
      li.className = "adm-botao-info";
      const h4 = document.createElement("h4");
      h4.textContent = b.nome;
      if (b.situacao === "planejado") { const t = document.createElement("span"); t.className = "dv-tag"; t.textContent = "Planejado"; h4.append(t); }
      const p = document.createElement("p"); p.className = "nota"; p.textContent = b.oQueFaz;
      const dl = document.createElement("dl");
      [["Começa", b.padrao ? "Ligado" : "Desligado"], ["Ligado", b.ligado], ["Desligado", b.desligado],
       ["Quem tem", b.quem.map(nomeTipo).join(", ")], ["Onde fica", b.onde]].forEach(([t, d]) => {
        const dt = document.createElement("dt"); dt.textContent = t;
        const dd = document.createElement("dd"); dd.textContent = d;
        dl.append(dt, dd);
      });
      li.append(h4, p, dl);
      ul.append(li);
    });
  }

  /* ---------- 6. INÍCIO ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    // Conta real (Firebase): dados do adm logado
    await P.carregarDadosReais(perfil, "adm");
    telefones = P.iniciarTelefones(perfil, { max: CONFIG.maxTelefonesSecundarios });
    renderizarDados();
    renderizarGaleria();
    P.iniciarSanfona();
    P.iniciarFormulario({
      perfil,
      coletar: (valor) => ({ nome: valor("f-nome") }),
      camposTexto: ["nome"],
      validar: (d, marcar) => {
        if (d.nome && d.nome.split(/\s+/).length < 2) marcar("f-nome", "Informe nome e sobrenome.");
      },
      aoConcluir: renderizarDados
    });
    iniciarFotos();
    P.iniciarExclusao();
    P.iniciarAbas({ abas: ["#aba-perfil", "#aba-admin", "#aba-divulgacoes"] });
    montarBotoesContas();
    iniciarConfigSite();
  });
})();
