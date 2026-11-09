/* =====================================================================
   S.D — PERFIL DO CLIENTE CNPJ (perfil-cliente-cnpj/perfil-cliente-cnpj.js)
   O comportamento comum (abas, telefones, edição, foto, exclusão) vem de
   componentes/perfil-base/perfil-base.js. Aqui fica só o exclusivo do CNPJ:
     - Dados da empresa: razão social, nome fantasia, CNPJ (inalterável),
       tipo de estabelecimento, responsável pela conta (cargo em lista),
       contato no local (zelador/portaria/recepção) e horário para visitas
       (dias da semana + horas válidas; observação livre opcional).
     - Foto de perfil (logo) opcional → foto padrão do sistema.
     - "Fotos do local": carrossel OPCIONAL; cada foto indica a área.
     - Aba "Serviços realizados" (componentes/servicos-realizados) com "Local".
   IMPORTANTE: demonstração — salvar, excluir, enviar fotos e buscar o
   histórico dependem do servidor.
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

  // Dias da semana (0 = domingo, como no JavaScript)
  const DIAS = [
    { n: 1, curto: "Seg", nome: "Segunda" }, { n: 2, curto: "Ter", nome: "Terça" }, { n: 3, curto: "Qua", nome: "Quarta" },
    { n: 4, curto: "Qui", nome: "Quinta" }, { n: 5, curto: "Sex", nome: "Sexta" }, { n: 6, curto: "Sáb", nome: "Sábado" },
    { n: 0, curto: "Dom", nome: "Domingo" }
  ];
  const MAX_FAIXAS = 3;

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

  /* ---------- 2. DADOS DE DEMONSTRAÇÃO ----------
     Substituir pelos dados vindos do servidor depois do login. */
  const demo = (texto) => window.SDCarrossel.imagemDemo(texto);

  const perfil = {
    razaoSocial: "Condomínio Edifício Exemplo",
    nomeFantasia: "Residencial Exemplo",
    tipoConta: "Cliente - Pessoa jurídica (CNPJ)",
    documento: "00.000.000/0001-00",
    tipoEstabelecimento: "Condomínio residencial",
    responsavelNome: "Nome Sobrenome Exemplo",
    responsavelCargo: "Síndico(a)",
    email: "administracao@exemplo.com.br",
    telefones: [{ numero: "1130000000", principal: true }],
    contatoNome: "Nome do Zelador",
    contatoFuncao: "Zelador(a)",
    contatoTelefone: "11911111111",
    // Horário para visitas: faixas com dias (0=dom … 6=sáb) e horas HH:MM + observação livre
    horarioVisitas: {
      faixas: [{ dias: [1, 2, 3, 4, 5], inicio: "08:00", fim: "17:00" }, { dias: [6], inicio: "08:00", fim: "12:00" }],
      obs: ""
    },
    endereco: "Avenida Exemplo",
    numero: "500",
    complemento: "",
    bairro: "Centro",
    cep: "01000000",
    cidade: "São Paulo",
    uf: "SP",
    // Notas que os prestadores dão ao cliente NÃO aparecem aqui (só os prestadores as veem).
    foto: null,                              // null = usa a foto padrão
    // Fotos do local (opcional). area = uma das AREAS ("" = não informada)
    fotosLocal: [
      { src: demo("Fachada do prédio"), area: "Fachada e área externa" },
      { src: demo("Garagem — vista geral"), area: "Garagem e estacionamento" },
      { src: demo("Área de lazer — piscina"), area: "Área de lazer" }
    ]
  };

  // Histórico de serviços (exemplo). local = área onde o serviço foi feito (CNPJ);
  // fotos = fotos do serviço realizado (aparecem no carrossel ao expandir o item).
  const servicos = [
    { data: "2026-10-10", servico: "Manutenção preventiva das bombas de recalque", local: "Caixa d'água, reservatórios e bombas",
      prestador: "Empresa Exemplo A", prestadorId: "p-exemplo-a", valor: 1450.00, estrelas: 5, foto: null,
      fotos: [{ src: demo("Bombas — antes"), legenda: "Antes" }, { src: demo("Troca de selos"), legenda: "Durante o serviço" }, { src: demo("Bombas — depois"), legenda: "Depois" }] },
    { data: "2026-09-03", servico: "Troca do motor do portão da garagem", local: "Garagem e estacionamento",
      prestador: "Empresa Exemplo B", prestadorId: "p-exemplo-b", valor: 2380.00, estrelas: 4, foto: null,
      fotos: [{ src: demo("Motor antigo"), legenda: "Motor antigo" }, { src: demo("Motor novo instalado"), legenda: "Motor novo instalado" }] },
    { data: "2026-07-18", servico: "Recarga e inspeção dos extintores", local: "Sistema de incêndio",
      prestador: "Prestador Exemplo C", prestadorId: "p-exemplo-c", valor: 640.00, estrelas: null, foto: null,
      fotos: [] }
  ];

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
      horarioVisitas: textoHorario(perfil.horarioVisitas),
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
    carregarHorario(perfil.horarioVisitas);
    if (telefones) telefones.renderizar();
    if (foto) foto.renderizar();
  }

  /* ---------- 3b. CARGO DO RESPONSÁVEL (lista + "Outro") ---------- */
  function preencherCargos() {
    const sel = $("#f-resp-cargo");
    sel.innerHTML = "";
    sel.append(new Option(`Manter atual (${perfil.responsavelCargo || "não informado"})`, ""));
    CARGOS.forEach((g) => {
      const grupo = document.createElement("optgroup");
      grupo.label = g.grupo;
      g.itens.forEach((c) => grupo.append(new Option(c, c)));
      sel.append(grupo);
    });
    sel.append(new Option("Outro (escrever)", CARGO_OUTRO));
    $("#campo-cargo-outro").hidden = true;
  }
  // Cargo escolhido: da lista ou o texto de "Outro"
  const cargoEscolhido = () => ($("#f-resp-cargo").value === CARGO_OUTRO ? $("#f-resp-cargo-outro").value.trim() : $("#f-resp-cargo").value);

  /* ---------- 3c. HORÁRIO PARA VISITAS ----------
     Dias: botões Seg…Dom. Horas: rodinhas de início e fim (componentes/hora-rolante).
     Só aceita dias que existem e horas reais (00:00 a 23:59). Observação livre embaixo. */
  const horaValida = (h) => /^([01]\d|2[0-3]):[0-5]\d$/.test(h);

  // [1,2,3,4,5] → "Seg a Sex" · [1,3,5] → "Seg, Qua, Sex"
  function textoDias(dias) {
    const ordem = DIAS.map((d) => d.n).filter((n) => dias.includes(n));
    const pos = ordem.map((n) => DIAS.findIndex((d) => d.n === n));
    const blocos = [];
    pos.forEach((p) => {
      const ultimo = blocos[blocos.length - 1];
      if (ultimo && p === ultimo[1] + 1) ultimo[1] = p; else blocos.push([p, p]);
    });
    return blocos.map(([a, z]) => (a === z ? DIAS[a].curto : `${DIAS[a].curto}${z - a > 1 ? " a " : ", "}${DIAS[z].curto}`)).join(", ");
  }
  function textoHorario(h) {
    if (!h || !h.faixas || !h.faixas.length) return "—";
    const t = h.faixas.map((f) => `${textoDias(f.dias)}, ${f.inicio} às ${f.fim}`).join(" · ");
    return h.obs ? `${t} — ${h.obs}` : t;
  }

  // Uma faixa: dias (caixas) + das HH:MM às HH:MM + remover
  function criarFaixa(f, i) {
    const n = i + 1;
    const li = document.createElement("li");
    li.className = "horario-faixa";
    const dias = DIAS.map((d, j) => `
      <label class="dia-caixa"><input type="checkbox" value="${d.n}"${j === 0 ? ` id="f-hor-${n}-dias" aria-describedby="e-hor-${n}-dias"` : ""}${f.dias.includes(d.n) ? " checked" : ""}>
        <span aria-hidden="true">${d.curto}</span><span class="visualmente-oculto">${d.nome}</span></label>`).join("");
    li.innerHTML = `
      <fieldset class="horario-dias"><legend>Horário ${n}: dias</legend><div class="dias-lista">${dias}</div>
        <span class="campo-erro" id="e-hor-${n}-dias"></span></fieldset>
      <div class="horario-horas">
        <div class="campo" data-hora="inicio"><span class="campo-erro" id="e-hor-${n}-inicio"></span></div>
        <div class="campo" data-hora="fim"><span class="campo-erro" id="e-hor-${n}-fim"></span></div>
        <button type="button" class="btn btn-pequeno btn-icone btn-remover-faixa" aria-label="Remover horário ${n}" title="Remover horário ${n}">${P.ICONES.x}</button>
      </div>`;
    // Horas em "rodinhas" (componentes/hora-rolante): só aceitam horas que existem
    const rodas = (qual, rotulo, valor) => {
      const caixa = li.querySelector(`[data-hora="${qual}"]`);
      const erro = caixa.querySelector(".campo-erro");
      const h = window.SDHoraRolante.criar(caixa, { id: `f-hor-${n}-${qual}`, rotulo, valor, descricao: erro.id });
      caixa.append(erro);                                   // mensagem de erro abaixo das rodas
      return h;
    };
    li._inicio = rodas("inicio", "Das", f.inicio);
    li._fim = rodas("fim", "Às", f.fim);
    li.querySelector(".btn-remover-faixa").addEventListener("click", async () => {
      if (!(await P.confirmar({ titulo: "Excluir esta faixa de horário?", texto: "Os dias e horas desta faixa serão removidos.", sim: "Sim, excluir" }))) return;
      const atual = lerHorario();
      atual.faixas.splice(i, 1);
      carregarHorario(atual);
      $("#btn-add-faixa").focus();
    });
    return li;
  }

  // Monta os campos a partir de um horário salvo
  function carregarHorario(h) {
    const lista = $("#horario-faixas");
    const faixas = h && h.faixas && h.faixas.length ? h.faixas : [{ dias: [], inicio: "08:00", fim: "17:00" }];
    lista.innerHTML = "";
    faixas.forEach((f, i) => lista.append(criarFaixa(f, i)));
    lista.querySelectorAll(".btn-remover-faixa").forEach((b) => { b.hidden = faixas.length === 1; });
    $("#btn-add-faixa").disabled = faixas.length >= MAX_FAIXAS;
    $("#f-horario-obs").value = (h && h.obs) || "";
    P.atualizarAltura();
  }

  // Lê o que está na tela
  function lerHorario() {
    const faixas = [...$("#horario-faixas").children].map((li) => ({
      dias: [...li.querySelectorAll('input[type="checkbox"]:checked')].map((c) => Number(c.value)),
      inicio: li._inicio.valor,
      fim: li._fim.valor
    }));
    return { faixas, obs: $("#f-horario-obs").value.trim() };
  }

  function validarHorario(h, marcar) {
    h.faixas.forEach((f, i) => {
      const n = i + 1;
      if (!f.dias.length) marcar(`f-hor-${n}-dias`, "Marque pelo menos um dia.");
      if (!horaValida(f.inicio)) marcar(`f-hor-${n}-inicio`, "Hora inválida (use de 00:00 a 23:59).");
      if (!horaValida(f.fim)) marcar(`f-hor-${n}-fim`, "Hora inválida (use de 00:00 a 23:59).");
      else if (horaValida(f.inicio) && f.fim <= f.inicio) marcar(`f-hor-${n}-fim`, "O fim precisa ser depois do início.");
    });
    if (h.obs && h.obs.length < 3) marcar("f-horario-obs", "Observação muito curta.");
  }

  function iniciarHorario() {
    $("#btn-add-faixa").addEventListener("click", () => {
      const atual = lerHorario();
      if (atual.faixas.length >= MAX_FAIXAS) return;
      atual.faixas.push({ dias: [], inicio: "08:00", fim: "12:00" });
      carregarHorario(atual);
      $(`#f-hor-${atual.faixas.length}-dias`).focus();
    });
  }

  /* ---------- 4. FOTOS DO LOCAL (carrossel opcional) ---------- */
  let carrosselLocal = null;

  const fotosParaCarrossel = () => perfil.fotosLocal.map((f, i) => ({
    src: f.src,
    legenda: f.area || "Área não informada",
    alt: `Foto ${i + 1} do local: ${f.area || "área não informada"}`
  }));

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

    // Trocar a área da foto atual
    sel.addEventListener("change", () => {
      const i = carrosselLocal.indice;
      if (!perfil.fotosLocal[i]) return;
      perfil.fotosLocal[i].area = sel.value;
      redesenharFotosLocal(i);
    });

    // Remover a foto atual
    $("#btn-remover-foto-local").addEventListener("click", async () => {
      if (!(await P.confirmar({ titulo: "Excluir esta foto do local?", texto: "A foto que está aparecendo agora será removida.", sim: "Sim, excluir" }))) return;
      const i = carrosselLocal.indice;
      const [removida] = perfil.fotosLocal.splice(i, 1);
      if (removida && removida.src.startsWith("blob:")) URL.revokeObjectURL(removida.src);
      redesenharFotosLocal(Math.max(0, Math.min(i, perfil.fotosLocal.length - 1)));
      U.mostrarMensagem(msg, "atencao", "Foto removida nesta tela (ainda não salvo no servidor).");
      if (!perfil.fotosLocal.length) $("#btn-add-fotos-local").focus();
    });

    // Adicionar fotos (várias de uma vez, respeitando o limite)
    $("#btn-add-fotos-local").addEventListener("click", () => $("#input-fotos-local").click());
    $("#input-fotos-local").addEventListener("change", (e) => {
      const arquivos = [...e.target.files];
      e.target.value = "";
      if (!arquivos.length) return;
      const erros = [], primeiraNova = perfil.fotosLocal.length;
      let adicionadas = 0;
      arquivos.forEach((arq) => {
        if (perfil.fotosLocal.length >= CONFIG.maxFotosLocal) { erros.push(`"${arq.name}": limite de ${CONFIG.maxFotosLocal} fotos atingido.`); return; }
        const erro = P.validarArquivo(arq, CONFIG);
        if (erro) { erros.push(erro); return; }
        perfil.fotosLocal.push({ src: URL.createObjectURL(arq), area: "" });
        adicionadas++;
      });
      if (adicionadas) {
        redesenharFotosLocal(primeiraNova);          // mostra a 1ª foto nova
        const texto = `${adicionadas} ${adicionadas === 1 ? "foto adicionada" : "fotos adicionadas"} (pré-visualização, ainda não enviadas ao servidor). Escolha a área de cada foto.`;
        U.mostrarMensagem(msg, "atencao", erros.length ? `${texto} Não adicionadas: ${erros.join(" ")}` : texto);
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
        contatoTelefone: U.soDigitos(valor("f-local-telefone")), horarioVisitas: lerHorario()
      }),
      camposTexto: ["razaoSocial", "nomeFantasia", "tipoEstabelecimento", "responsavelNome", "responsavelCargo",
        "contatoNome", "contatoFuncao", "contatoTelefone"],
      validar: (d, marcar) => {
        if (d.razaoSocial && d.razaoSocial.length < 3) marcar("f-razao", "Informe a razão social completa.");
        if (d.nomeFantasia && d.nomeFantasia.length < 2) marcar("f-fantasia", "Nome fantasia muito curto.");
        if (d.responsavelNome && d.responsavelNome.split(/\s+/).length < 2) marcar("f-resp-nome", "Informe nome e sobrenome.");
        if (d.cargoOutro && (!d.responsavelCargo || d.responsavelCargo.length < 2)) marcar("f-resp-cargo-outro", "Escreva o cargo.");
        if (d.contatoNome && d.contatoNome.length < 2) marcar("f-local-nome", "Nome muito curto.");
        if (d.contatoTelefone && !U.telefoneValido(d.contatoTelefone)) marcar("f-local-telefone", "Informe DDD + número (10 ou 11 dígitos).");
        validarHorario(d.horarioVisitas, marcar);
      },
      // Horário: aplica se mudou (os campos já vêm preenchidos com o valor atual)
      aplicarExtra: (d, alterados) => {
        if (JSON.stringify(d.horarioVisitas) !== JSON.stringify(perfil.horarioVisitas)) {
          perfil.horarioVisitas = d.horarioVisitas;
          alterados.push("horarioVisitas");
        }
      },
      aoConcluir: renderizarDados
    });
  }

  /* ---------- 6. INÍCIO ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    P.iniciarInterruptoresPerfil();                        // botão Localização (linha das abas)
    telefones = P.iniciarTelefones(perfil, { max: CONFIG.maxTelefonesSecundarios });
    foto = P.iniciarFotoOpcional({
      perfil, config: CONFIG, padrao: CONFIG.fotoPadraoCliente, tipoIcone: "predio",
      textoAlt: (temFoto) => (temFoto ? "Foto de perfil de " + (perfil.nomeFantasia || perfil.razaoSocial) : "Foto padrão de perfil da empresa")
    });
    renderizarDados();
    iniciarFotosLocal();
    window.SDServicos.renderizar({
      lista: $("#lista-servicos"), total: $("#servicos-total"), vazio: $("#servicos-vazio"),
      servicos, fotoPadraoEmpresa: CONFIG.fotoPadraoEmpresa
    });
    P.iniciarSanfona();
    iniciarHorario();
    $("#f-resp-cargo").addEventListener("change", (e) => {
      const outro = e.target.value === CARGO_OUTRO;
      $("#campo-cargo-outro").hidden = !outro;
      if (outro) $("#f-resp-cargo-outro").focus();
      P.atualizarAltura();
    });
    iniciarFormulario();
    P.iniciarExclusao();
    P.iniciarAbas({ abas: ["#aba-perfil", "#aba-servicos"] });
  });
})();
