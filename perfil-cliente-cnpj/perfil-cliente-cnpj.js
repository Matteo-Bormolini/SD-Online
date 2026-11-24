/* =====================================================================
   S.D — PERFIL DO CLIENTE CNPJ (perfil-cliente-cnpj/perfil-cliente-cnpj.js)
   O comportamento comum (abas, telefones, edição, foto, exclusão) vem de
   componentes/perfil-base/perfil-base.js. Aqui fica só o exclusivo do CNPJ:
     - Dados da empresa: razão social, nome fantasia, CNPJ (inalterável),
       tipo de estabelecimento, responsável pela conta (cargo em lista que segue o tipo, v0.8.5),
       contato no local (zelador/portaria/recepção) e horário para visitas
       (dias da semana + horas válidas; observação livre opcional).
     - Foto de perfil (logo) opcional → foto padrão do sistema.
     - "Fotos do local": carrossel OPCIONAL; cada foto indica a área.
     - Aba "Serviços realizados" (componentes/servicos-realizados) com "Local".
   DADOS: sempre os REAIS (Firebase). Sem dados fictícios desde a v0.7.9.
   Horário para visitas: OPCIONAL (componentes/datahora → semana).
   ===================================================================== */
(function () {
  "use strict";
  const U = window.SDUtil, P = window.SDPerfil, SD = window.SD;
  const $ = P.$;

  /* ---------- 1. CONFIGURAÇÃO (fácil de ajustar) ---------- */
  const CONFIG = {
    ...P.PADRAO,   // telefones (4), fotos (JPG/PNG/WEBP até 5 MB)
    maxFotosLocal: 12,
    // Fotos padrão do sistema (arquivos ainda a criar). Sem o arquivo, aparece um ícone provisório.
    fotoPadraoCliente: SD.caminho("fotos/padrao/cliente-cnpj.png"),
    fotoPadraoEmpresa: SD.caminho("fotos/padrao/prestador.png")
  };

  // Tipos de estabelecimento (lista do campo de seleção)
  const TIPOS_ESTABELECIMENTO = [
    "Condomínio residencial", "Condomínio comercial", "Condomínio misto",
    "Empresa / escritório", "Comércio / loja", "Indústria / galpão", "Outro"
  ];

  // Cargos do responsável (condomínios e empresas, do MEI à grande empresa).
  // "Outro" abre um campo para escrever.
  const CARGOS = [
    { grupo: "Condomínio", itens: ["Síndico(a)", "Subsíndico(a)", "Síndico(a) profissional", "Conselheiro(a)", "Administradora de condomínio", "Gerente predial"] },
    { grupo: "Empresa", itens: ["Proprietário(a) / Sócio(a)", "Empresário(a) individual / MEI", "Diretor(a)", "Gerente", "Gerente de facilities / manutenção",
      "Coordenador(a) / Supervisor(a)", "Compras / Suprimentos", "Administrativo / Financeiro"] }
  ];
  const CARGO_OUTRO = "__outro__";

  // Aviso "Finalize seu cadastro": campos que contam ← MUDE AQUI
  const CAMPOS_CADASTRO = [
    { rotulo: "Nome fantasia",              vazio: (p) => !p.nomeFantasia },
    { rotulo: "Tipo de estabelecimento",    vazio: (p) => !p.tipoEstabelecimento },
    { rotulo: "Cargo do responsável",       vazio: (p) => !p.responsavelCargo },
    { rotulo: "Contato no local",           vazio: (p) => !p.contatoNome || !p.contatoTelefone },
    { rotulo: "Horário para visitas",       vazio: (p) => !p.horarioVisitas || !(p.horarioVisitas.faixas || []).length },
    { rotulo: "WhatsApp/Telefone",          vazio: (p) => !(p.telefones || []).some((t) => t.principal && t.numero) },
    { rotulo: "Endereço (número)",          vazio: (p) => !p.cep || !p.numero }
  ];
  let horarioEditor = null;

  // Áreas mais comuns para manutenção em condomínios e empresas
  // (base: sistemas citados na ABNT NBR 5674 — manutenção de edificações).
  const AREAS = [
    { nome: "Fachada e área externa",                 exemplos: "pintura, revestimento, infiltrações, muros" },
    { nome: "Portaria, recepção e acessos",           exemplos: "portões de pedestres, interfone, controle de acesso" },
    { nome: "Hall, corredores e escadas",             exemplos: "iluminação, pisos, corrimãos, portas corta-fogo" },
    { nome: "Garagem e estacionamento",               exemplos: "portão automático, piso, demarcação, drenagem" },
    { nome: "Telhado, cobertura e calhas",            exemplos: "telhas, impermeabilização, rufos, calhas" },
    { nome: "Caixa d'água, reservatórios e bombas",   exemplos: "limpeza, boias, bombas de recalque, registros" },
    { nome: "Elevadores e casa de máquinas",          exemplos: "cabine, portas, casa de máquinas" },
    { nome: "Quadros elétricos, medidores e gerador", exemplos: "disjuntores, aterramento, gerador, SPDA (para-raios)" },
    { nome: "Sistema de incêndio",                    exemplos: "extintores, hidrantes, iluminação de emergência" },
    { nome: "Área de lazer",                          exemplos: "piscina, salão de festas, academia, churrasqueira, playground" },
    { nome: "Jardins e áreas verdes",                 exemplos: "irrigação, poda, paisagismo" },
    { nome: "Banheiros, vestiários e copa",           exemplos: "hidráulica, louças, revestimentos, exaustão" },
    { nome: "Salas, escritórios e lojas",             exemplos: "ar-condicionado, iluminação, divisórias, rede" },
    { nome: "Galpão, depósito e área técnica",        exemplos: "estrutura, piso industrial, docas, portas de enrolar" },
    { nome: "Outra área",                             exemplos: "" }
  ];

  /* ---------- 2. DADOS DO PERFIL ----------
     Começa VAZIO; carregarDadosReais() preenche com a conta logada. */
  const perfil = {
    razaoSocial: "", nomeFantasia: "", tipoConta: "Cliente - Pessoa jurídica (CNPJ)", documento: "",
    tipoEstabelecimento: "", responsavelNome: "", responsavelCargo: "", email: "",
    telefones: [{ numero: "", principal: true }],
    contatoNome: "", contatoFuncao: "", contatoTelefone: "",
    horarioVisitas: null,                     // { faixas: [{ dias, inicio, fim }], obs } — opcional
    endereco: "", numero: "", complemento: "", bairro: "", cep: "", cidade: "", uf: "",
    // Notas que os prestadores dão ao cliente NÃO aparecem aqui (só os prestadores as veem).
    foto: null,                               // null = usa a foto padrão
    fotosLocal: []                            // opcional; [{ id, area }] — a imagem fica em fotos/{id} (v0.8.0)
  };
  // Histórico de serviços realizados: chega com os pedidos reais (Ciclo 3/4)
  const servicos = [];

  let telefones = null, foto = null;

  /* ---------- 3. EXIBIÇÃO DOS DADOS ---------- */
  function textoContatoLocal() {
    const partes = [];
    if (perfil.contatoNome) partes.push(perfil.contatoFuncao ? `${perfil.contatoNome} (${perfil.contatoFuncao})` : perfil.contatoNome);
    if (perfil.contatoTelefone) partes.push(U.formatarTelefone(perfil.contatoTelefone));
    return partes.join(" · ") || "—";
  }

  function renderizarDados() {
    P.preencherCampos({
      razaoSocial: perfil.razaoSocial,
      nomeFantasia: P.ouTraco(perfil.nomeFantasia),
      tipoConta: perfil.tipoConta,
      documento: perfil.documento,
      tipoEstabelecimento: P.ouTraco(perfil.tipoEstabelecimento),
      responsavel: perfil.responsavelCargo ? `${perfil.responsavelNome} — ${perfil.responsavelCargo}` : perfil.responsavelNome,
      email: perfil.email,
      contatoLocal: textoContatoLocal(),
      horarioVisitas: window.SDDataHora.textoSemana(perfil.horarioVisitas),
      ...P.enderecoParaTela(perfil)
    });
    P.preencherPlaceholders({
      "f-razao": perfil.razaoSocial, "f-fantasia": perfil.nomeFantasia,
      "f-resp-nome": perfil.responsavelNome, "f-resp-cargo": perfil.responsavelCargo, "f-email": perfil.email,
      "f-telefone": U.formatarTelefone(perfil.telefones.find((t) => t.principal)?.numero),
      "f-local-nome": perfil.contatoNome, "f-local-funcao": perfil.contatoFuncao,
      "f-local-telefone": U.formatarTelefone(perfil.contatoTelefone),
      ...P.placeholdersEndereco(perfil),
      "f-senha": "Deixe vazio para manter a atual", "f-senha2": "Repita a nova senha"
    });
    P.preencherSelect($("#f-tipo"), perfil.tipoEstabelecimento || "não informado", TIPOS_ESTABELECIMENTO);
    preencherCargos();
    if (horarioEditor) horarioEditor.definir(perfil.horarioVisitas);
    if (telefones) telefones.renderizar();
    if (foto) foto.renderizar();
    P.avisoCadastro(perfil, CAMPOS_CADASTRO);
  }

  /* ---------- 3b. CARGO DO RESPONSÁVEL (lista + "Outro") ----------
     v0.8.5: a lista de cargos segue o TIPO DE ESTABELECIMENTO:
       Condomínio (residencial, comercial, misto) → só cargos de condomínio
       Empresa, Comércio, Indústria               → só cargos de empresa
       Outro ou vazio                             → os dois grupos  ← MUDE AQUI (GRUPOS_POR_TIPO) */
  const GRUPOS_POR_TIPO = (tipo) => {
    const t = String(tipo || "");
    if (t.startsWith("Condomínio")) return ["Condomínio"];
    if (/^(Empresa|Comércio|Indústria)/.test(t)) return ["Empresa"];
    return ["Condomínio", "Empresa"];
  };
  // Tipo que vale agora: o escolhido no formulário ou, se "Manter atual", o salvo
  const tipoAtual = () => $("#f-tipo").value || perfil.tipoEstabelecimento || "";
  // Grupo de um cargo da lista (null = cargo escrito em "Outro")
  const grupoDoCargo = (cargo) => (CARGOS.find((g) => g.itens.includes(cargo)) || {}).grupo || null;

  function preencherCargos() {
    const sel = $("#f-resp-cargo");
    const escolhido = sel.value;
    const grupos = GRUPOS_POR_TIPO(tipoAtual());
    sel.innerHTML = "";
    sel.append(new Option(`Manter atual (${perfil.responsavelCargo || "não informado"})`, ""));
    CARGOS.filter((g) => grupos.includes(g.grupo)).forEach((g) => {
      const grupo = document.createElement("optgroup");
      grupo.label = g.grupo;
      g.itens.forEach((c) => grupo.append(new Option(c, c)));
      sel.append(grupo);
    });
    sel.append(new Option("Outro (escrever)", CARGO_OUTRO));
    // Mantém a escolha se ela ainda existe na lista nova
    if (escolhido && [...sel.options].some((o) => o.value === escolhido)) sel.value = escolhido;
    $("#campo-cargo-outro").hidden = sel.value !== CARGO_OUTRO;
  }
  // Cargo escolhido: da lista ou o texto de "Outro"
  const cargoEscolhido = () => ($("#f-resp-cargo").value === CARGO_OUTRO ? $("#f-resp-cargo-outro").value.trim() : $("#f-resp-cargo").value);

  /* ---------- 3c. HORÁRIO PARA VISITAS (opcional) ----------
     componentes/datahora → semana: dias S T Q Q S S D + "das 08:00 às 17:00".
     Nada marcado = não informado (não bloqueia salvar o resto do perfil). */
  function iniciarHorario() {
    horarioEditor = window.SDDataHora.semana($("#horario-visitas-editor"), {
      idBase: "f-visita", valor: perfil.horarioVisitas, aoMudar: P.atualizarAltura,
      dicaObs: "Ex.: avisar a portaria com 1 dia de antecedência"
    });
  }

  /* ---------- 4. FOTOS DO LOCAL (carrossel opcional) ----------
     v0.8.0: SALVAS de graça (firebase/fotos.js): reduzidas (até 1080 px, WebP 0,80;
     iPhone: JPEG), 1 documento por foto em "fotos". O perfil guarda [{ id, area }].
     Só a própria empresa e o adm veem (regras do banco). */
  let carrosselLocal = null;
  const srcFotos = new Map();                  // id → imagem lida (fora do perfil, não vai ao banco)
  const fotosApi = () => (window.SDFotos ? Promise.resolve(window.SDFotos) : new Promise((ok) => {
    const t = setTimeout(() => ok(window.SDFotos || null), 10000);
    document.addEventListener("sd:fotos-pronto", () => { clearTimeout(t); ok(window.SDFotos); }, { once: true });
  }));
  const CARREGANDO_FOTO = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#EADFD6"/></svg>');

  const fotosParaCarrossel = () => perfil.fotosLocal.map((f, i) => ({
    src: srcFotos.get(f.id) || CARREGANDO_FOTO,
    legenda: f.area || "Área não informada",
    alt: `Foto ${i + 1} do local: ${f.area || "área não informada"}`
  }));
  async function lerFotosLocal() {
    const F = await fotosApi();
    if (!F) return;
    for (const f of perfil.fotosLocal) {
      if (srcFotos.has(f.id)) continue;
      try { srcFotos.set(f.id, await F.ler(f.id)); } catch (_) { srcFotos.set(f.id, ""); }
      if (carrosselLocal) redesenharFotosLocal(carrosselLocal.indice);
    }
  }
  async function salvarListaFotos(msg, textoOk) {
    if (!perfil._real) return;
    perfil.fotosLocal = perfil.fotosLocal.map((f) => ({ id: f.id, area: f.area || "" }));
    try {
      await P.salvarDadosReais(perfil, ["fotosLocal"]);
      if (textoOk) U.mostrarMensagem(msg, "sucesso", textoOk);
    } catch (e) {
      U.mostrarMensagem(msg, "erro", "A lista de fotos não foi salva: " + window.SDFirebase.mensagemErro(e));
    }
  }

  // Controles da foto atual (área + remover) e contadores
  function sincronizarControles(indice) {
    const total = perfil.fotosLocal.length;
    $("#controles-foto-atual").hidden = total === 0;
    $("#fotos-local-total").textContent = `${total} de ${CONFIG.maxFotosLocal} fotos`;
    const cheio = total >= CONFIG.maxFotosLocal;
    const add = $("#btn-add-fotos-local");
    add.disabled = cheio;
    add.title = cheio ? `Limite de ${CONFIG.maxFotosLocal} fotos` : "";
    if (!total) return;
    const i = Math.min(indice, total - 1);
    $("#area-foto").value = perfil.fotosLocal[i].area || "";
    $("#area-foto-posicao").textContent = `(foto ${i + 1} de ${total})`;
  }

  function redesenharFotosLocal(indice) {
    carrosselLocal.atualizar(fotosParaCarrossel(), indice);
    sincronizarControles(carrosselLocal.indice);
    P.atualizarAltura();
  }

  function iniciarFotosLocal() {
    const msg = $("#msg-fotos-local");
    $("#max-fotos-local").textContent = CONFIG.maxFotosLocal;

    // Lista de áreas sugeridas e opções do campo "Área desta foto"
    const lista = $("#lista-areas"), sel = $("#area-foto");
    sel.append(new Option("Selecione a área…", ""));
    AREAS.forEach((a) => {
      const li = document.createElement("li");
      li.textContent = a.nome;
      if (a.exemplos) { const s = document.createElement("small"); s.textContent = a.exemplos; li.append(s); }
      lista.append(li);
      sel.append(new Option(a.nome, a.nome));
    });
    // Abrir/fechar a lista de áreas muda a altura do painel
    $(".areas-sugeridas").addEventListener("toggle", P.atualizarAltura);

    carrosselLocal = window.SDCarrossel.criar({
      alvo: $("#carrossel-local"),
      rotulo: "Fotos do local",
      fotos: fotosParaCarrossel(),
      vazio: "Nenhuma foto do local adicionada. É opcional — use o botão \"Adicionar fotos do local\".",
      aoMudar: (i) => sincronizarControles(i)
    });
    sincronizarControles(0);
    lerFotosLocal();

    // Trocar a área da foto atual (salva na hora)
    sel.addEventListener("change", async () => {
      const i = carrosselLocal.indice;
      const f = perfil.fotosLocal[i];
      if (!f) return;
      f.area = sel.value;
      redesenharFotosLocal(i);
      const F = await fotosApi();
      if (F && perfil._real) F.legenda(f.id, f.area).catch(() => null);
      salvarListaFotos(msg, "Área salva.");
    });

    // Remover a foto atual (apaga do banco)
    $("#btn-remover-foto-local").addEventListener("click", async () => {
      if (!(await P.confirmar({ titulo: "Excluir esta foto do local?", texto: "A foto que está aparecendo agora será apagada.", sim: "Sim, excluir" }))) return;
      const i = carrosselLocal.indice;
      const [removida] = perfil.fotosLocal.splice(i, 1);
      redesenharFotosLocal(Math.max(0, Math.min(i, perfil.fotosLocal.length - 1)));
      if (removida && perfil._real) {
        const F = await fotosApi();
        if (F) F.apagar(removida.id).catch(() => null);
        srcFotos.delete(removida.id);
        await salvarListaFotos(msg, "Foto apagada.");
      }
      if (!perfil.fotosLocal.length) $("#btn-add-fotos-local").focus();
    });

    // Adicionar fotos (várias de uma vez, respeitando o limite)
    $("#btn-add-fotos-local").addEventListener("click", () => $("#input-fotos-local").click());
    $("#input-fotos-local").addEventListener("change", async (e) => {
      const arquivos = [...e.target.files];
      e.target.value = "";
      if (!arquivos.length) return;
      if (!perfil._real) { U.mostrarMensagem(msg, "erro", "Entre na sua conta para salvar fotos."); return; }
      const F = await fotosApi();
      if (!F) { U.mostrarMensagem(msg, "erro", "O envio de fotos não carregou. Recarregue a página."); return; }
      const erros = [], primeiraNova = perfil.fotosLocal.length;
      let adicionadas = 0;
      const parar = U.carregando($("#btn-add-fotos-local"), "Enviando fotos…");
      for (const arq of arquivos) {
        if (perfil.fotosLocal.length >= CONFIG.maxFotosLocal) { erros.push(`"${arq.name}": limite de ${CONFIG.maxFotosLocal} fotos atingido.`); continue; }
        const erro = P.validarArquivo(arq, CONFIG);
        if (erro) { erros.push(erro); continue; }
        U.mostrarMensagem(msg, "info", `Reduzindo e enviando "${arq.name}"…`);
        try {
          const f = await F.salvar(arq, { tipo: "local" });
          srcFotos.set(f.id, f.src);
          perfil.fotosLocal.push({ id: f.id, area: "" });
          adicionadas++;
        } catch (err) {
          erros.push(`"${arq.name}": ${err.message === "FOTO_INVALIDA" ? "não foi possível ler a imagem" : window.SDFirebase.mensagemErro(err)}.`);
        }
      }
      parar();
      if (adicionadas) {
        await salvarListaFotos(msg);
        redesenharFotosLocal(primeiraNova);          // mostra a 1ª foto nova
        const texto = `${adicionadas} ${adicionadas === 1 ? "foto salva" : "fotos salvas"}. Escolha a área de cada foto.`;
        U.mostrarMensagem(msg, erros.length ? "atencao" : "sucesso", erros.length ? `${texto} Não salvas: ${erros.join(" ")}` : texto);
        $("#area-foto").focus();
      } else {
        U.mostrarMensagem(msg, "erro", erros.join(" "));
      }
    });
  }

  /* ---------- 5. FORMULÁRIO: campos e regras exclusivas do CNPJ ---------- */
  function iniciarFormulario() {
    P.iniciarFormulario({
      perfil,
      coletar: (valor) => ({
        razaoSocial: valor("f-razao"), nomeFantasia: valor("f-fantasia"),
        tipoEstabelecimento: $("#f-tipo").value,
        responsavelNome: valor("f-resp-nome"), responsavelCargo: cargoEscolhido(),
        cargoOutro: $("#f-resp-cargo").value === CARGO_OUTRO,
        contatoNome: valor("f-local-nome"), contatoFuncao: valor("f-local-funcao"),
        contatoTelefone: U.soDigitos(valor("f-local-telefone")), horarioVisitas: horarioEditor.valor
      }),
      camposTexto: ["razaoSocial", "nomeFantasia", "tipoEstabelecimento", "responsavelNome", "responsavelCargo",
        "contatoNome", "contatoFuncao", "contatoTelefone"],
      validar: (d, marcar) => {
        if (d.razaoSocial && d.razaoSocial.length < 3) marcar("f-razao", "Informe a razão social completa.");
        if (d.nomeFantasia && d.nomeFantasia.length < 2) marcar("f-fantasia", "Nome fantasia muito curto.");
        if (d.responsavelNome && d.responsavelNome.split(/\s+/).length < 2) marcar("f-resp-nome", "Informe nome e sobrenome.");
        if (d.cargoOutro && (!d.responsavelCargo || d.responsavelCargo.length < 2)) marcar("f-resp-cargo-outro", "Escreva o cargo.");
        // v0.8.5: cargo da lista precisa combinar com o tipo (só confere quando o tipo ou o cargo muda)
        if (d.tipoEstabelecimento || d.responsavelCargo) {
          const tipo = d.tipoEstabelecimento || perfil.tipoEstabelecimento || "";
          const cargo = d.responsavelCargo || perfil.responsavelCargo || "";
          const grupo = d.cargoOutro ? null : grupoDoCargo(cargo);
          if (grupo && !GRUPOS_POR_TIPO(tipo).includes(grupo))
            marcar("f-resp-cargo", `O cargo "${cargo}" é de ${grupo.toLowerCase()} e não combina com "${tipo}". Escolha um cargo da lista.`);
        }
        if (d.contatoNome && d.contatoNome.length < 2) marcar("f-local-nome", "Nome muito curto.");
        if (d.contatoTelefone && !U.telefoneValido(d.contatoTelefone)) marcar("f-local-telefone", "Informe DDD + número (10 ou 11 dígitos).");
        horarioEditor.validar(marcar);
      },
      // Horário: aplica se mudou (os campos já vêm preenchidos com o valor atual)
      aplicarExtra: (d, alterados) => {
        if (JSON.stringify(d.horarioVisitas) !== JSON.stringify(perfil.horarioVisitas || null)) {
          perfil.horarioVisitas = d.horarioVisitas;
          alterados.push("horarioVisitas");
        }
      },
      aoConcluir: renderizarDados
    });
  }

  /* ---------- SERVIÇOS: EM ORÇAMENTO + REALIZADOS (v0.8.0) ----------
     Pedidos reais (componentes/pedidos): bloco "Em orçamento/Em andamento" e,
     embaixo, os serviços que o cliente confirmou como realizados. */
  function renderizarServicos() {
    const T = window.SDPedidos;
    const lista = T ? T.realizados() : servicos;
    window.SDServicos.renderizar({
      lista: $("#lista-servicos"), total: $("#servicos-total"), vazio: $("#servicos-vazio"),
      servicos: lista, fotoPadraoEmpresa: CONFIG.fotoPadraoEmpresa
    });
    if (T) T.renderizarEmOrcamento($("#em-orcamento"), { aoMudar: P.atualizarAltura });
    P.atualizarAltura();
  }
  function ligarPedidos() {
    const ligar = () => { renderizarServicos(); document.addEventListener("sd:pedidos-mudou", renderizarServicos); };
    if (window.SDPedidos) ligar(); else document.addEventListener("sd:pedidos-pronto", ligar, { once: true });
  }

  /* ---------- 6. INÍCIO ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    // Conta real (Firebase): dados da conta logada
    const real = await P.carregarDadosReais(perfil, "cliente-cnpj");
    P.iniciarInterruptoresPerfil();                        // botão Localização (linha das abas)
    telefones = P.iniciarTelefones(perfil, { max: CONFIG.maxTelefonesSecundarios });
    foto = P.iniciarFotoOpcional({
      perfil, config: CONFIG, padrao: CONFIG.fotoPadraoCliente, tipoIcone: "predio",
      textoAlt: (temFoto) => (temFoto ? "Foto de perfil de " + (perfil.nomeFantasia || perfil.razaoSocial) : "Foto padrão de perfil da empresa")
    });
    renderizarDados();
    iniciarFotosLocal();
    renderizarServicos();
    ligarPedidos();
    P.iniciarSanfona();
    iniciarHorario();
    if (real && !perfil.local && perfil.cidade && window.SDFirebase.atualizarLocal) window.SDFirebase.atualizarLocal(perfil);   // ponto no mapa (uma vez)
    $("#f-tipo").addEventListener("change", () => { preencherCargos(); P.atualizarAltura(); });   // v0.8.5: cargos por tipo
    $("#f-resp-cargo").addEventListener("change", (e) => {
      const outro = e.target.value === CARGO_OUTRO;
      $("#campo-cargo-outro").hidden = !outro;
      if (outro) $("#f-resp-cargo-outro").focus();
      P.atualizarAltura();
    });
    iniciarFormulario();
    P.iniciarExclusao();
    const abas = P.iniciarAbas({ abas: ["#aba-perfil", "#aba-servicos"] });
    // Avisos do sino abrem direto a aba Serviços (#servicos)
    const abrirServicosPeloEndereco = () => { if (location.hash === "#servicos") abas.ativar(1, true); };
    abrirServicosPeloEndereco();
    window.addEventListener("hashchange", abrirServicosPeloEndereco);
  });
})();
