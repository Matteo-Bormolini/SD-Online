/* =====================================================================
   S.D — PERFIL DO PRESTADOR DE SERVIÇOS (perfil-prestador/perfil-prestador.js)
   O comportamento comum (abas, telefones, edição, exclusão) vem de
   componentes/perfil-base/perfil-base.js. Aqui fica só o exclusivo do Prestador:
     - Dados da empresa + área de atuação (principal), ATIVIDADES SECUNDÁRIAS
       (lista, com aviso de taxa adicional ao cliente), responsável técnico,
       registros/certificações, região (distância + cidades em lista) e
       horário de atendimento (dias + horas, componentes/datahora).
     - Vitrine pública (estilo LinkedIn): nome, especialidades e números.
     - LOGO OBRIGATÓRIA: sem logo, usa a foto padrão e mostra alerta urgente.
     - "Trabalhos e empresa": carrossel OPCIONAL de fotos com legenda.
     - Avaliações recentes (públicas e anônimas; nome só com autorização de quem avaliou).
     - "Ver como cliente": mostra o perfil como o cliente vê (sem dados privados).
     - v0.8.7: o quadro de serviços saiu do perfil → página "Seus Serviços"
       (seus-servicos/). Aqui só o número de serviços concluídos.
     - Visita técnica (aviso de preço) e fotos de trabalhos SALVAS (firebase/fotos.js) — v0.8.0.
     - Visão do cliente: WhatsApp passa pelo aviso de cobrança e registra o contato;
       contatos escondidos → "Pedir contato".
   DADOS: sempre os REAIS (Firebase). Sem dados fictícios desde a v0.7.9.
     - Dono: lê/salva o próprio perfil e atualiza a VITRINE (cartão público).
     - Cliente (?visao=cliente&id=…): lê só a vitrine do prestador (dados públicos).
   ===================================================================== */
(function () {
  "use strict";
  const U = window.SDUtil, P = window.SDPerfil, SD = window.SD;
  const $ = P.$;

  /* ---------- 1. CONFIGURAÇÃO (fácil de ajustar) ---------- */
  const CONFIG = {
    ...P.PADRAO,                                 // telefones (4), fotos (JPG/PNG/WEBP até 5 MB)
    maxFotosTrabalho: 12,
    maxEspecialidades: 8,
    maxCertificacoes: 10,          // limites iguais aos de firebase/firestore.rules
    maxCaracteresItem: 40,
    tamanhoMinLogoPx: 200,                       // logo menor que isso fica borrada
    urlAvaliacoes: SD.urlPagina("avaliacoes"),
    // Fotos padrão do sistema (arquivos ainda a criar). Sem o arquivo, aparece um ícone provisório.
    fotoPadraoPrestador: SD.caminho("fotos/padrao/prestador.png"),
    fotoPadraoCliente: { cpf: SD.caminho("fotos/padrao/cliente-cpf.png"), cnpj: SD.caminho("fotos/padrao/cliente-cnpj.png") }
  };

  // Área de atuação (principal) e atividades secundárias: LISTA ÚNICA em configuracoes/config.js (servicos)
  const AREAS_ATUACAO = SD.config.servicos.filter((x) => x.principal).map((x) => x.nome);
  const TODOS_SERVICOS = SD.config.servicos.filter((x) => x.nome !== "Outra").map((x) => x.nome);
  // Início das atividades: de 1975 (config) até o ano ATUAL — muda sozinho todo ano
  const ANOS = (() => { const l = []; for (let a = new Date().getFullYear(); a >= SD.config.anoInicioMinimo; a--) l.push(String(a)); return l; })();
  const MAX_CIDADES = 20;
  // Aviso "Finalize seu cadastro": campos que contam ← MUDE AQUI
  const CAMPOS_CADASTRO = [
    { rotulo: "Nome fantasia",          vazio: (p) => !p.nomeFantasia },
    { rotulo: "Área de atuação",        vazio: (p) => !p.areaAtuacao },
    { rotulo: "Sobre a empresa",        vazio: (p) => !p.sobre },
    { rotulo: "Cargo do responsável",   vazio: (p) => !p.responsavelCargo },
    { rotulo: "Início das atividades",  vazio: (p) => !p.anoInicio },
    { rotulo: "Horário de atendimento", vazio: (p) => !p.horarioAtendimento && !p.horario },
    { rotulo: "WhatsApp/Telefone",      vazio: (p) => !(p.telefones || []).some((t) => t.principal && t.numero) },
    { rotulo: "Endereço (número)",      vazio: (p) => !p.cep || !p.numero }
  ];
  // Distância máxima de atendimento (km) — usada na busca por proximidade
  const RAIOS_KM = [5, 10, 15, 20, 30, 50, 100];

  /* ---------- 2. DADOS DO PERFIL ----------
     Começa VAZIO; carregarDadosReais() (dono) ou carregarVitrine() (cliente) preenche. */
  const perfil = {
    razaoSocial: "", nomeFantasia: "",
    tipoConta: "Prestador de serviços - Pessoa jurídica (CNPJ)",
    documento: "", areaAtuacao: "", especialidades: [],
    responsavelNome: "", responsavelCargo: "", certificacoes: [], anoInicio: "", membroDesde: "",
    email: "", telefones: [{ numero: "", principal: true }],
    raioKm: 15, cidadesAtendidas: [], bairrosAtendidos: "", emergencia: false,
    cobraVisita: null, valorVisita: 0,            // visita técnica: null = não informado
    horarioAtendimento: null, horario: "",
    endereco: "", numero: "", complemento: "", bairro: "", cep: "", cidade: "", uf: "",
    sobre: "", avaliacao: { media: 0, total: 0 }, servicosAnteriores: 0,
    foto: null,                                    // null = SEM LOGO → foto padrão + alerta
    fotosTrabalho: []                              // [{ id, legenda }] — a imagem fica em fotos/{id} (firebase/fotos.js)
  };
  // Imagens já lidas das fotos de trabalho (id → src), fora do perfil para não ir ao banco
  const srcFotos = new Map();
  // Avaliações reais chegam no próximo ciclo; contatos/orçamentos vêm de SDPedidos (v0.8.0).
  const avaliacoes = [];
  let categoriaVisita = new URLSearchParams(location.search).get("categoria") || "";
  let horarioEditor = null, secundarias = null, cidades = null;

  let telefones = null, abas = null;

  /* ---------- 3. EXIBIÇÃO DOS DADOS ---------- */
  function textoRegiao() {
    let t = `Até ${perfil.raioKm} km a partir de ${perfil.bairro || "endereço da empresa"}`;
    if (perfil.cidadesAtendidas && perfil.cidadesAtendidas.length) t += ` · ${perfil.cidadesAtendidas.join(", ")}`;
    else if (perfil.bairrosAtendidos) t += ` · ${perfil.bairrosAtendidos}`;   // formato antigo (texto livre)
    return t;
  }
  // Horário novo (dias + horas) ou o texto antigo, se ainda não foi editado
  const textoHorario = () => window.SDDataHora.textoSemana(perfil.horarioAtendimento || perfil.horario) + (perfil.emergencia ? " · Atende emergências" : "");

  // Visita técnica (aviso de preço): sim + valor / não / não informado
  const textoVisita = () => (perfil.cobraVisita === true
    ? `Cobra visita: ${U.formatarMoeda(perfil.valorVisita)}`
    : perfil.cobraVisita === false ? "Não cobra visita técnica" : "Não informado");

  // Etiquetas (especialidades / certificações)
  function renderizarChips(ul, itens, vazio) {
    ul.innerHTML = "";
    if (!itens.length) {
      const li = document.createElement("li"); li.className = "chip-vazio"; li.textContent = vazio; ul.append(li); return;
    }
    itens.forEach((t) => { const li = document.createElement("li"); li.textContent = t; ul.append(li); });
  }

  function renderizarDados() {
    P.preencherCampos({
      nomeExibicao: perfil.nomeFantasia || perfil.razaoSocial,
      razaoSocial: perfil.razaoSocial,
      nomeFantasia: P.ouTraco(perfil.nomeFantasia),
      tipoConta: perfil.tipoConta,
      documento: perfil.documento,
      areaAtuacao: P.ouTraco(perfil.areaAtuacao),
      regiaoResumo: `Atende até ${perfil.raioKm} km de ${perfil.bairro || "sua base"}`,
      responsavel: perfil.responsavelCargo ? `${perfil.responsavelNome} — ${perfil.responsavelCargo}` : perfil.responsavelNome,
      email: perfil.email,
      regiao: textoRegiao(),
      horario: textoHorario(),
      visita: textoVisita(),
      sobre: perfil.sobre || "A empresa ainda não escreveu uma apresentação.",
      avisoSecundarias: perfil.especialidades.length ? SD.config.avisoSecundarias : "",
      ...P.enderecoParaTela(perfil)
    });

    renderizarChips($("#vitrine-especialidades"), perfil.especialidades, "Nenhuma atividade secundária informada");
    renderizarChips($("#lista-especialidades"), perfil.especialidades, "Nenhuma atividade secundária informada");
    renderizarChips($("#lista-certificacoes"), perfil.certificacoes, "Nenhum registro informado");
    P.preencherLinkAvaliacoes($("#link-avaliacoes"), perfil.avaliacao, CONFIG.urlAvaliacoes);
    $("#link-todas-avaliacoes").href = CONFIG.urlAvaliacoes;
    renderizarNumeros();

    atualizarContatos();
    const principal = perfil.telefones.find((t) => t.principal);

    P.preencherPlaceholders({
      "f-razao": perfil.razaoSocial, "f-fantasia": perfil.nomeFantasia,
      "f-sobre": perfil.sobre, "f-certificacoes": perfil.certificacoes.join(", "),
      "f-resp-nome": perfil.responsavelNome, "f-resp-cargo": perfil.responsavelCargo,
      "f-email": perfil.email, "f-telefone": U.formatarTelefone(principal && principal.numero),
      ...P.placeholdersEndereco(perfil),
      "f-senha": "Deixe vazio para manter a atual", "f-senha2": "Repita a nova senha"
    });
    P.preencherSelect($("#f-area"), perfil.areaAtuacao || "não informada", AREAS_ATUACAO);
    P.preencherSelect($("#f-inicio"), perfil.anoInicio || "não informado", ANOS);
    P.preencherSelect($("#f-raio"), `${perfil.raioKm} km`, RAIOS_KM.map((r) => ({ texto: `${r} km`, valor: String(r) })));
    $("#f-emergencia").checked = !!perfil.emergencia;
    $("#f-cobra-visita").value = perfil.cobraVisita === true ? "sim" : perfil.cobraVisita === false ? "nao" : "";
    $("#f-valor-visita").value = perfil.cobraVisita === true && perfil.valorVisita ? String(perfil.valorVisita) : "";
    $("#f-valor-visita").disabled = perfil.cobraVisita !== true;
    $("#contato-visita").textContent = perfil.cobraVisita === true ? `Visita técnica: ${U.formatarMoeda(perfil.valorVisita)}.` : perfil.cobraVisita === false ? "Não cobra visita técnica." : "";
    // Listas e horário já vêm com o valor atual (mudou → salva)
    if (secundarias) { secundarias.definir(perfil.especialidades); }
    if (cidades) cidades.definir(perfil.cidadesAtendidas);
    if (horarioEditor) horarioEditor.definir(perfil.horarioAtendimento);
    $("#contador-sobre").textContent = $("#f-sobre").value.length;
    P.avisoCadastro(perfil, CAMPOS_CADASTRO);

    if (telefones) telefones.renderizar();
    renderizarFoto();
  }

  // Serviços confirmados pelo cliente (contatos reais · componentes/pedidos)
  // (só na conta do próprio prestador: o cliente e o adm não somam os pedidos deles)
  let contarPrestados = false;
  const prestados = () => (contarPrestados && window.SDPedidosDados ? window.SDPedidosDados.lista().filter((o) => o.situacao === "prestado").length : 0);
  // Números da vitrine (somente números, sem gráficos)
  function renderizarNumeros() {
    const concluidos = perfil.servicosAnteriores + prestados();
    // Ano de início vazio (conta nova) → "Não informado" (antes mostrava "2026 anos")
    const anos = Number(perfil.anoInicio) > 0 ? new Date().getFullYear() - Number(perfil.anoInicio) : null;
    $("#num-concluidos").textContent = concluidos.toLocaleString("pt-BR");
    $("#num-avaliacao").textContent = perfil.avaliacao.total ? `${U.decimal(perfil.avaliacao.media)} / 5` : "Sem avaliações";
    $("#num-experiencia").textContent = anos === null ? "Não informado" : anos > 0 ? `${anos} ${anos === 1 ? "ano" : "anos"}` : "Menos de 1 ano";
    $("#num-desde").textContent = perfil.membroDesde || "—";
  }

  /* ---------- 4. LOGO (foto de perfil OBRIGATÓRIA) ---------- */
  function renderizarFoto() {
    const img = $("#foto-perfil"), semLogo = !perfil.foto;
    U.aplicarFoto(img, perfil.foto, CONFIG.fotoPadraoPrestador, "prestador");
    img.alt = semLogo ? "Foto padrão: a empresa ainda não adicionou a logo" : "Logo de " + (perfil.nomeFantasia || perfil.razaoSocial);
    $("#foto-moldura").classList.toggle("sem-logo", semLogo);
    $("#selo-sem-logo").hidden = !semLogo;
    $("#alerta-logo").hidden = !semLogo;
    $("#btn-foto").textContent = semLogo ? "Adicionar logo" : "Trocar logo";
    P.atualizarAvisosTopo();
    P.atualizarAltura();
  }

  // Lê largura/altura da imagem para recusar logos muito pequenas
  function medirImagem(url) {
    return new Promise((ok) => {
      const i = new Image();
      i.onload = () => ok({ largura: i.naturalWidth, altura: i.naturalHeight });
      i.onerror = () => ok(null);
      i.src = url;
    });
  }

  function iniciarLogo() {
    const msg = $("#msg-foto");
    const escolher = () => $("#input-foto").click();
    $("#btn-foto").addEventListener("click", escolher);
    $("#btn-alerta-logo").addEventListener("click", () => {
      if (abas && abas.ativo !== 0) abas.ativar(0, true);
      $("#btn-foto").scrollIntoView({ block: "center", behavior: "smooth" });
      escolher();
    });

    $("#input-foto").addEventListener("change", async (e) => {
      const arq = e.target.files[0];
      e.target.value = "";
      if (!arq) return;
      const erro = P.validarArquivo(arq, CONFIG);
      if (erro) { U.mostrarMensagem(msg, "erro", erro); return; }
      const url = URL.createObjectURL(arq);
      const medida = await medirImagem(url);
      if (!medida) { URL.revokeObjectURL(url); U.mostrarMensagem(msg, "erro", `"${arq.name}": não foi possível ler a imagem.`); return; }
      if (medida.largura < CONFIG.tamanhoMinLogoPx || medida.altura < CONFIG.tamanhoMinLogoPx) {
        URL.revokeObjectURL(url);
        U.mostrarMensagem(msg, "erro", `Imagem muito pequena (${medida.largura} × ${medida.altura} px). Use no mínimo ${CONFIG.tamanhoMinLogoPx} × ${CONFIG.tamanhoMinLogoPx} px.`);
        return;
      }
      URL.revokeObjectURL(url);
      if (perfil.foto && !(await P.confirmar({ tipo: "editar", titulo: "Trocar a logo?", texto: `A logo atual será substituída por "${arq.name}".`, sim: "Sim, trocar" }))) return;
      // Reduz (256 px) e salva no perfil; depois atualiza o cartão público
      if (await P.salvarFoto(perfil, arq, msg, renderizarFoto)) {
        publicar();
        const quadrada = Math.abs(medida.largura - medida.altura) / Math.max(medida.largura, medida.altura) < 0.1;
        if (!quadrada) U.mostrarMensagem(msg, "sucesso", "Logo salva. Dica: a imagem não era quadrada; o centro foi usado.");
      }
    });
  }

  /* ---------- 5. FOTOS DE TRABALHOS (carrossel opcional) ----------
     v0.8.0: SALVAS de graça (firebase/fotos.js): cada foto é reduzida (até 1080 px,
     WebP 0,80; iPhone: JPEG) e vira 1 documento em "fotos". O perfil guarda só a
     lista [{ id, legenda }]; a vitrine pública também (o cliente vê as fotos). */
  let carrosselTrabalho = null;
  const fotosApi = () => (window.SDFotos ? Promise.resolve(window.SDFotos) : new Promise((ok) => {
    const t = setTimeout(() => ok(window.SDFotos || null), 10000);
    document.addEventListener("sd:fotos-pronto", () => { clearTimeout(t); ok(window.SDFotos); }, { once: true });
  }));
  const CARREGANDO_FOTO = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#EADFD6"/></svg>');

  const fotosParaCarrossel = () => perfil.fotosTrabalho.map((f, i) => ({
    src: srcFotos.get(f.id) || CARREGANDO_FOTO,
    legenda: f.legenda || "",
    alt: f.legenda ? `Foto ${i + 1}: ${f.legenda}` : `Foto ${i + 1} de trabalhos da empresa`
  }));

  // Lê as imagens que ainda não estão na tela (uma por vez, sem travar a página)
  async function lerFotosTrabalho() {
    const F = await fotosApi();
    if (!F) return;
    for (const f of perfil.fotosTrabalho) {
      if (srcFotos.has(f.id)) continue;
      try { srcFotos.set(f.id, await F.ler(f.id)); } catch (_) { srcFotos.set(f.id, ""); }
      if (carrosselTrabalho) redesenharFotos(carrosselTrabalho.indice);
    }
  }
  // Salva a lista no perfil e atualiza a vitrine (cliente vê)
  async function salvarListaFotos(msg, textoOk) {
    if (!perfil._real) return;
    perfil.fotosTrabalho = perfil.fotosTrabalho.map((f) => ({ id: f.id, legenda: f.legenda || "" }));
    try {
      await P.salvarDadosReais(perfil, ["fotosTrabalho"]);
      publicar();
      if (textoOk) U.mostrarMensagem(msg, "sucesso", textoOk);
    } catch (e) {
      U.mostrarMensagem(msg, "erro", "A lista de fotos não foi salva: " + window.SDFirebase.mensagemErro(e));
    }
  }

  function sincronizarControles(indice) {
    const total = perfil.fotosTrabalho.length;
    $("#controles-foto-atual").hidden = total === 0;
    $("#fotos-trabalho-total").textContent = `${total} de ${CONFIG.maxFotosTrabalho} fotos`;
    const cheio = total >= CONFIG.maxFotosTrabalho;
    const add = $("#btn-add-fotos-trabalho");
    add.disabled = cheio;
    add.title = cheio ? `Limite de ${CONFIG.maxFotosTrabalho} fotos` : "";
    // Na visão do cliente, sem fotos o bloco inteiro some
    $(".fotos-trabalho").classList.toggle("so-dono", total === 0);
    if (!total) return;
    const i = Math.min(indice, total - 1);
    const input = $("#legenda-foto");
    if (document.activeElement !== input) input.value = perfil.fotosTrabalho[i].legenda || "";
    $("#legenda-foto-posicao").textContent = `(foto ${i + 1} de ${total})`;
  }

  function redesenharFotos(indice) {
    carrosselTrabalho.atualizar(fotosParaCarrossel(), indice);
    sincronizarControles(carrosselTrabalho.indice);
    P.atualizarAltura();
  }

  function iniciarFotosTrabalho() {
    const msg = $("#msg-fotos-trabalho");
    $("#max-fotos-trabalho").textContent = CONFIG.maxFotosTrabalho;

    carrosselTrabalho = window.SDCarrossel.criar({
      alvo: $("#carrossel-trabalho"),
      rotulo: "Fotos de trabalhos e da empresa",
      fotos: fotosParaCarrossel(),
      vazio: "Nenhuma foto adicionada. É opcional — use o botão \"Adicionar fotos\".",
      aoMudar: (i) => sincronizarControles(i)
    });
    sincronizarControles(0);
    lerFotosTrabalho();

    // Legenda da foto atual (salva ao sair do campo ou com Enter)
    const legenda = $("#legenda-foto");
    const aplicarLegenda = async () => {
      const i = carrosselTrabalho.indice;
      const f = perfil.fotosTrabalho[i];
      if (!f) return;
      const nova = legenda.value.trim().slice(0, 80);
      if (nova === (f.legenda || "")) return;
      f.legenda = nova;
      redesenharFotos(i);
      const F = await fotosApi();
      if (F && perfil._real) F.legenda(f.id, nova).catch(() => null);
      salvarListaFotos(msg, "Legenda salva.");
    };
    legenda.addEventListener("change", aplicarLegenda);
    legenda.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); aplicarLegenda(); } });

    $("#btn-remover-foto-trabalho").addEventListener("click", async () => {
      if (!(await P.confirmar({ titulo: "Excluir esta foto?", texto: "A foto que está aparecendo agora (e a legenda dela) será apagada.", sim: "Sim, excluir" }))) return;
      const i = carrosselTrabalho.indice;
      const [removida] = perfil.fotosTrabalho.splice(i, 1);
      legenda.value = "";
      redesenharFotos(Math.max(0, Math.min(i, perfil.fotosTrabalho.length - 1)));
      if (removida && perfil._real) {
        const F = await fotosApi();
        if (F) F.apagar(removida.id).catch(() => null);
        srcFotos.delete(removida.id);
        await salvarListaFotos(msg, "Foto apagada.");
      }
      if (!perfil.fotosTrabalho.length) $("#btn-add-fotos-trabalho").focus();
    });

    $("#btn-add-fotos-trabalho").addEventListener("click", () => $("#input-fotos-trabalho").click());
    $("#input-fotos-trabalho").addEventListener("change", async (e) => {
      const arquivos = [...e.target.files];
      e.target.value = "";
      if (!arquivos.length) return;
      if (!perfil._real) { U.mostrarMensagem(msg, "erro", "Entre na sua conta para salvar fotos."); return; }
      const F = await fotosApi();
      if (!F) { U.mostrarMensagem(msg, "erro", "O envio de fotos não carregou. Recarregue a página."); return; }
      const erros = [], primeiraNova = perfil.fotosTrabalho.length;
      let adicionadas = 0;
      const parar = U.carregando($("#btn-add-fotos-trabalho"), "Enviando fotos…");
      for (const arq of arquivos) {
        if (perfil.fotosTrabalho.length >= CONFIG.maxFotosTrabalho) { erros.push(`"${arq.name}": limite de ${CONFIG.maxFotosTrabalho} fotos atingido.`); continue; }
        const erro = P.validarArquivo(arq, CONFIG);
        if (erro) { erros.push(erro); continue; }
        U.mostrarMensagem(msg, "info", `Reduzindo e enviando "${arq.name}"…`);
        try {
          const f = await F.salvar(arq, { tipo: "trabalho" });
          srcFotos.set(f.id, f.src);
          perfil.fotosTrabalho.push({ id: f.id, legenda: "" });
          adicionadas++;
        } catch (err) {
          erros.push(`"${arq.name}": ${err.message === "FOTO_INVALIDA" ? "não foi possível ler a imagem" : window.SDFirebase.mensagemErro(err)}.`);
        }
      }
      parar();
      if (adicionadas) {
        await salvarListaFotos(msg);
        legenda.value = "";
        redesenharFotos(primeiraNova);
        const texto = `${adicionadas} ${adicionadas === 1 ? "foto salva" : "fotos salvas"}. Escreva uma legenda para cada foto.`;
        U.mostrarMensagem(msg, erros.length ? "atencao" : "sucesso", erros.length ? `${texto} Não salvas: ${erros.join(" ")}` : texto);
        legenda.focus();
      } else {
        U.mostrarMensagem(msg, "erro", erros.join(" "));
      }
    });
  }

  /* ---------- 6. AVALIAÇÕES RECENTES (as 3 mais novas) ---------- */
  function renderizarAvaliacoes() {
    const lista = $("#lista-avaliacoes");
    lista.innerHTML = "";
    [...avaliacoes].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 3).forEach((a) => {
      const li = document.createElement("li");
      li.className = "avaliacao-item";
      const topo = document.createElement("div");
      topo.className = "avaliacao-topo";
      const est = document.createElement("span");
      est.className = "estrelas";
      est.innerHTML = U.estrelasSVG(a.nota);
      const nota = document.createElement("span");
      nota.textContent = `${a.nota} de 5`;
      est.append(nota);
      const data = document.createElement("time");
      data.dateTime = a.data; data.textContent = U.formatarData(a.data);
      topo.append(est, data);
      const p = document.createElement("p"); p.textContent = a.texto;
      const autor = document.createElement("span"); autor.className = "avaliacao-autor";
      autor.textContent = a.nomeAutorizado ? `${a.nomeAutorizado} (autorizou mostrar o nome)` : "Avaliação anônima";
      li.append(topo, p, autor);
      lista.append(li);
    });
    $("#avaliacoes-vazio").hidden = avaliacoes.length > 0;
  }

  /* ---------- 6b. CONTATO RÁPIDO (visão do cliente) ----------
     Segue o botão "Mostrar meus contatos" (configuracoes/interruptores.js).
     Ligado: WhatsApp abre a conversa e "Ligar" mostra o número (no computador
     o número fica visível, porque nem todo PC sabe fazer ligação).
     Desligado: botões cinza e e-mail/telefones escondidos até o orçamento. */
  function atualizarContatos() {
    const mostrar = window.SD_INTERRUPTORES ? window.SD_INTERRUPTORES.ler("mostrar-contatos") : true;
    document.body.dataset.contatos = mostrar ? "visiveis" : "ocultos";
    const principal = perfil.telefones.find((t) => t.principal);
    const tel = U.soDigitos(principal && principal.numero);
    const zap = $("#btn-whatsapp"), ligar = $("#btn-ligar");
    [zap, ligar].forEach((b) => {
      if (mostrar && tel) b.removeAttribute("aria-disabled"); else b.setAttribute("aria-disabled", "true");
    });
    if (mostrar && tel) {
      zap.href = "https://wa.me/55" + tel;
      ligar.href = "tel:+55" + tel;
      $("#btn-whatsapp-texto").textContent = "Chamar no WhatsApp";
      $("#btn-ligar-texto").textContent = "Ligar " + U.formatarTelefone(tel);
    } else {
      zap.removeAttribute("href"); ligar.removeAttribute("href");
      $("#btn-whatsapp-texto").textContent = "WhatsApp liberado após o orçamento";
      $("#btn-ligar-texto").textContent = "Telefone liberado após o orçamento";
    }
    $("#contato-nota").hidden = mostrar;
    // v0.8.0 (cliente vendo o perfil): contatos escondidos → "Pedir contato" (botão ativo)
    if (!mostrar && vitrineAtual) {
      zap.removeAttribute("aria-disabled");
      zap.setAttribute("role", "button");
      zap.href = "#";
      $("#btn-whatsapp-texto").textContent = "Pedir contato";
    } else zap.removeAttribute("role");
  }

  /* ---------- 6c. CLIENTE: WHATSAPP COM AVISO DE COBRANÇA E REGISTRO (v0.8.0) ----------
     Antes de abrir o WhatsApp: aviso de visita/taxa (componentes/pedidos). O contato fica
     registrado e o prestador é avisado. Sem os contatos: "Pedir contato". */
  function iniciarContatoCliente() {
    const dadosPrestador = () => ({
      id: vitrineAtual.id, nome: vitrineAtual.nome, cobraVisita: vitrineAtual.cobraVisita, valorVisita: vitrineAtual.valorVisita,
      secundarias: (vitrineAtual.especialidades || []).length > 0
    });
    const servicoNome = () => {
      const c = SD.config.categorias.find((x) => x.id === categoriaVisita);
      return c ? c.nome : (vitrineAtual.areaAtuacao || "Serviço");
    };
    $("#btn-whatsapp").addEventListener("click", (e) => {
      if (!vitrineAtual || !window.SDPedidos || !/^cliente-/.test(SD.tipoUsuario())) return;   // adm ou sem o módulo: link normal
      const zap = e.currentTarget;
      if (zap.getAttribute("aria-disabled") === "true") { e.preventDefault(); return; }
      if (!vitrineAtual.whatsapp) { e.preventDefault(); window.SDPedidos.pedirContato({ prestador: dadosPrestador(), categoria: categoriaVisita, servicoNome: servicoNome() }); return; }
      window.SDPedidos.chamarWhatsApp(e, { prestador: dadosPrestador(), categoria: categoriaVisita, servicoNome: servicoNome(), link: zap.href });
    });
  }

  // Mensagem curta quando o prestador liga/desliga um botão
  function iniciarInterruptores() {
    P.iniciarInterruptoresPerfil();
    document.addEventListener("sd:interruptor", (e) => { if (e.detail.id === "mostrar-contatos") atualizarContatos(); });
  }

  /* ---------- 7. VISÃO: DONO x CLIENTE ----------
     Só muda a TELA. Na versão final o servidor envia ao cliente somente os
     dados públicos (nunca senha nem endereço completo). */
  const visaoCliente = () => document.body.dataset.visao === "cliente";

  function definirVisao(visao, focar) {
    document.body.dataset.visao = visao;
    const cliente = visao === "cliente";
    $("#aviso-visao").hidden = !cliente;
    $("#titulo-pagina").textContent = cliente ? (perfil.nomeFantasia || perfil.razaoSocial) : "Perfil do prestador";
    // Fecha a edição ao trocar de visão (o texto digitado é mantido)
    if (cliente && !$("#sanfona-editar").hidden) P.abrirSanfona(false);
    abas.ativar(0, false);
    $("#perfil-trilho").scrollLeft = 0;
    const url = new URL(location.href);
    if (cliente) url.searchParams.set("visao", "cliente"); else url.searchParams.delete("visao");
    try { history.replaceState(null, "", url); } catch (_) { /* arquivo local ou sandbox: ignora */ }
    if (focar) (cliente ? $("#btn-voltar-edicao") : $("#btn-ver-como-cliente")).focus();
    P.atualizarAltura();
  }

  function iniciarVisao() {
    $("#btn-ver-como-cliente").addEventListener("click", () => definirVisao("cliente", true));
    $("#btn-voltar-edicao").addEventListener("click", () => definirVisao("dono", true));
    const pedida = new URLSearchParams(location.search).get("visao");
    // Só o dono (ou o adm) pode voltar para a edição; o cliente vê só a versão pública
    const dono = window.SD.pode("perfil-prestador");
    if (!dono) $("#btn-voltar-edicao").hidden = true;
    definirVisao(pedida === "cliente" || !dono ? "cliente" : "dono", false);
  }

  /* ---------- 7b. CIDADES DO ESTADO (lista oficial do IBGE, grátis e sem chave) ----------
     https://servicodados.ibge.gov.br/api/docs/localidades — guardada nesta aba para não pedir de novo. */
  const IBGE = "https://servicodados.ibge.gov.br/api/v1/localidades/estados/{uf}/municipios?orderBy=nome";
  let cidadesDaUf = [];
  async function carregarCidades(uf) {
    if (!/^[A-Z]{2}$/.test(uf || "")) return [];
    const chave = "sd-cidades-" + uf;
    try { const c = JSON.parse(sessionStorage.getItem(chave) || "null"); if (c) return c; } catch (_) { /* sem armazenamento */ }
    try {
      const r = await fetch(IBGE.replace("{uf}", uf));
      if (!r.ok) return [];
      const lista = (await r.json()).map((m) => m.nome);
      try { sessionStorage.setItem(chave, JSON.stringify(lista)); } catch (_) { /* sem armazenamento */ }
      return lista;
    } catch (_) { return []; }
  }

  let vitrineAtual = null;                       // visão do cliente: cartão público lido
  /* ---------- 7c. VITRINE (cartão público) ----------
     Dono: depois de abrir/salvar, atualiza a cópia pública que os clientes leem. */
  async function publicar() {
    const F = window.SDFirebase;
    if (!perfil._real || !F || !F.publicarVitrine) return;
    // v0.8.4: se o banco recusar, o prestador fica SEM aparecer certo na busca → avisa na tela
    if (!(await F.publicarVitrine(perfil)) && !visaoCliente()) {
      U.mostrarMensagem($("#msg-geral"), "atencao", "Seu cartão na busca de prestadores não foi atualizado agora. Os clientes podem ver dados antigos. Tente salvar de novo; se continuar, fale com o Suporte.");
    }
  }
  // Cliente abrindo ?visao=cliente&id=… → mostra só os dados públicos da vitrine
  async function carregarVitrine(id) {
    const F = await new Promise((ok) => (window.SDFirebase ? ok(window.SDFirebase)
      : document.addEventListener("sd:firebase-pronto", () => ok(window.SDFirebase), { once: true })));
    let v = null;
    try { v = F && F.lerVitrine ? await F.lerVitrine(id) : null; } catch (_) { v = null; }
    if (!v) {
      U.mostrarMensagem($("#msg-geral"), "atencao", "Este prestador não foi encontrado ou não está disponível agora.");
      return false;
    }
    Object.assign(perfil, {
      nomeFantasia: v.nome, razaoSocial: v.nome, areaAtuacao: v.areaAtuacao || "", especialidades: v.especialidades || [],
      sobre: v.sobre || "", anoInicio: v.anoInicio || "", emergencia: !!v.emergencia, raioKm: v.raioKm || 0,
      cidadesAtendidas: v.cidadesAtendidas || [], horarioAtendimento: v.horarioAtendimento || null,
      bairro: v.bairro || "", cidade: v.cidade || "", uf: v.uf || "", foto: v.foto || null,
      telefones: [{ numero: v.whatsapp || "", principal: true }], documento: "—", email: "",
      cobraVisita: typeof v.cobraVisita === "boolean" ? v.cobraVisita : null, valorVisita: v.valorVisita || 0,
      fotosTrabalho: Array.isArray(v.fotosTrabalho) ? v.fotosTrabalho : []
    });
    vitrineAtual = { id, ...v };
    if (!categoriaVisita) categoriaVisita = (v.categorias || [])[0] || "";
    // Sem WhatsApp na vitrine = o prestador não liberou o contato
    if (window.SD_INTERRUPTORES) window.SD_INTERRUPTORES.gravar("mostrar-contatos", !!v.whatsapp);
    return true;
  }

  /* ---------- 8. FORMULÁRIO: campos e regras exclusivas do Prestador ---------- */
  function iniciarFormulario() {
    $("#aviso-secundarias-texto").textContent = `"${SD.config.avisoSecundarias}"`;
    // Atividades secundárias: lista única (sem a área principal)
    secundarias = window.SDListaEscolha.criar($("#campo-secundarias"), {
      id: "f-secundarias", rotulo: "Adicionar atividade secundária", rotuloLista: "Atividades secundárias escolhidas",
      max: CONFIG.maxEspecialidades, descricao: "d-secundarias e-secundarias", vazio: "Nenhuma atividade secundária",
      opcoes: () => TODOS_SERVICOS.filter((n) => n !== ($("#f-area").value || perfil.areaAtuacao)),
      valor: perfil.especialidades, aoMudar: P.atualizarAltura
    });
    $("#f-area").addEventListener("change", () => secundarias.atualizarOpcoes());
    // Cidades atendidas: lista do IBGE do estado da empresa (+ a própria cidade primeiro)
    cidades = window.SDListaEscolha.criar($("#campo-cidades"), {
      id: "f-cidades", rotulo: "Adicionar cidade atendida", rotuloLista: "Cidades atendidas", max: MAX_CIDADES,
      descricao: "d-cidades", vazio: "Nenhuma cidade escolhida (vale só a distância)", textoEscolha: "Carregando cidades…",
      opcoes: () => cidadesDaUf, valor: perfil.cidadesAtendidas, aoMudar: P.atualizarAltura
    });
    carregarCidades(perfil.uf).then((lista) => {
      cidadesDaUf = lista;
      cidades.atualizarOpcoes();
      if (!lista.length) cidades.select.options[0].textContent = perfil.uf ? "Lista indisponível agora (tente mais tarde)" : "Salve o endereço primeiro";
    });
    // Horário de atendimento (dias + horas)
    horarioEditor = window.SDDataHora.semana($("#campo-horario-atendimento"), {
      idBase: "f-atend", valor: perfil.horarioAtendimento, dicaObs: "Ex.: plantão aos domingos só para emergências",
      aoMudar: P.atualizarAltura
    });

    // Valor da visita só com "Sim, cobro visita"
    $("#f-cobra-visita").addEventListener("change", (e) => {
      const sim = e.target.value === "sim";
      $("#f-valor-visita").disabled = !sim;
      if (!sim) $("#f-valor-visita").value = "";
    });
    $("#f-sobre").addEventListener("input", (e) => { $("#contador-sobre").textContent = e.target.value.length; P.atualizarAltura(); });
    P.iniciarFormulario({
      perfil,
      coletar: (valor) => ({
        razaoSocial: valor("f-razao"), nomeFantasia: valor("f-fantasia"),
        areaAtuacao: $("#f-area").value, sobre: valor("f-sobre"),
        especialidades: secundarias.valor, certificacoes: valor("f-certificacoes"),
        responsavelNome: valor("f-resp-nome"), responsavelCargo: valor("f-resp-cargo"), anoInicio: $("#f-inicio").value,
        horarioAtendimento: horarioEditor.valor, raioKm: $("#f-raio").value, cidadesAtendidas: cidades.valor,
        emergencia: $("#f-emergencia").checked,
        cobraVisita: $("#f-cobra-visita").value, valorVisita: $("#f-valor-visita").value
      }),
      camposTexto: ["razaoSocial", "nomeFantasia", "areaAtuacao", "sobre", "responsavelNome", "responsavelCargo", "anoInicio"],
      validar: (d, marcar) => {
        const anoAtual = new Date().getFullYear();
        if (d.razaoSocial && d.razaoSocial.length < 3) marcar("f-razao", "Informe a razão social completa.");
        if (d.nomeFantasia && d.nomeFantasia.length < 2) marcar("f-fantasia", "Nome fantasia muito curto.");
        if (d.sobre && d.sobre.length < 30) marcar("f-sobre", "Escreva pelo menos 30 caracteres para apresentar a empresa.");
        // Atividades secundárias: a lista já impede repetido e item fora da lista; o principal não pode repetir
        const principal = d.areaAtuacao || perfil.areaAtuacao;
        if (principal && d.especialidades.includes(principal)) marcar("f-secundarias", `"${principal}" já é a área de atuação (principal).`);
        if (d.certificacoes && new Set(U.listaDeTexto(d.certificacoes).map((x) => x.toLowerCase())).size < U.listaDeTexto(d.certificacoes).length) marcar("f-certificacoes", "Há registros repetidos.");
        if (d.certificacoes && U.listaDeTexto(d.certificacoes).length > CONFIG.maxCertificacoes) marcar("f-certificacoes", `Informe no máximo ${CONFIG.maxCertificacoes} certificações.`);
        if (d.certificacoes && U.listaDeTexto(d.certificacoes).some((x) => x.length > CONFIG.maxCaracteresItem)) marcar("f-certificacoes", `Cada certificação pode ter no máximo ${CONFIG.maxCaracteresItem} caracteres.`);
        if (d.responsavelNome && d.responsavelNome.split(/\s+/).length < 2) marcar("f-resp-nome", "Informe nome e sobrenome.");
        if (d.responsavelCargo && d.responsavelCargo.length < 2) marcar("f-resp-cargo", "Cargo muito curto.");
        if (d.anoInicio && !ANOS.includes(d.anoInicio)) marcar("f-inicio", `Escolha um ano entre ${SD.config.anoInicioMinimo} e ${anoAtual}.`);
        horarioEditor.validar(marcar);
        if (d.cobraVisita === "sim" && !(Number(d.valorVisita) > 0)) marcar("f-valor-visita", "Informe o valor da visita (ou escolha \"Não cobro visita\").");
        if (Number(d.valorVisita) > 100000) marcar("f-valor-visita", "Valor muito alto (máximo R$ 100.000).");
      },
      // Listas, número e caixa de seleção (não são texto simples)
      aplicarExtra: (d, alterados) => {
        // Listas que já vêm preenchidas com o valor atual: mudou → salva (vazia = apagou tudo)
        [["especialidades", d.especialidades], ["cidadesAtendidas", d.cidadesAtendidas]].forEach(([c, nova]) => {
          if (nova.join("|") !== (perfil[c] || []).join("|")) { perfil[c] = nova; alterados.push(c); }
        });
        // Antigas digitadas à mão (texto livre) somem quando as listas novas são salvas
        if (alterados.includes("cidadesAtendidas") && perfil.bairrosAtendidos) { perfil.bairrosAtendidos = null; alterados.push("bairrosAtendidos"); }
        if (d.certificacoes) {
          const nova = U.listaDeTexto(d.certificacoes);
          if (nova.join("|") !== perfil.certificacoes.join("|")) { perfil.certificacoes = nova; alterados.push("certificacoes"); }
        }
        if (JSON.stringify(d.horarioAtendimento) !== JSON.stringify(perfil.horarioAtendimento || null)) {
          perfil.horarioAtendimento = d.horarioAtendimento; alterados.push("horarioAtendimento");
          if (perfil.horario) { perfil.horario = null; alterados.push("horario"); }     // texto antigo sai
        }
        if (d.raioKm && Number(d.raioKm) !== perfil.raioKm) { perfil.raioKm = Number(d.raioKm); alterados.push("raioKm"); }
        if (d.emergencia !== !!perfil.emergencia) { perfil.emergencia = d.emergencia; alterados.push("emergencia"); }
        // Visita técnica: "" = não informado (apaga do banco), "nao" = false, "sim" = true + valor
        const cobra = d.cobraVisita === "sim" ? true : d.cobraVisita === "nao" ? false : null;
        const valorVisita = cobra ? Math.round(Number(d.valorVisita) * 100) / 100 : null;
        const antesCobra = typeof perfil.cobraVisita === "boolean" ? perfil.cobraVisita : null, antesValor = perfil.valorVisita || null;
        if (cobra !== antesCobra) { perfil.cobraVisita = cobra; alterados.push("cobraVisita"); }
        if ((valorVisita || null) !== antesValor) { perfil.valorVisita = valorVisita; alterados.push("valorVisita"); }
      },
      depoisDeSalvar: () => {
        publicar();
        // Estado mudou → recarrega a lista de cidades do novo estado
        if (cidadesDaUf.length === 0 || perfil.uf) carregarCidades(perfil.uf).then((l) => { cidadesDaUf = l; cidades.atualizarOpcoes(); });
      },
      aoConcluir: () => renderizarDados()
    });
  }

  /* ---------- 9. INÍCIO ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    // Conta real (Firebase): troca o exemplo pelos dados do prestador logado.
    // Dono: dados reais da conta · Cliente (?id=): só a vitrine pública
    const idOutro = new URLSearchParams(location.search).get("id");
    // Links antigos (#servicos) → página Seus Serviços (v0.8.7)
    if (location.hash === "#servicos" && !idOutro && SD.tipoUsuario() === "prestador") { location.replace(SD.urlPagina("seusServicos")); return; }
    const real = idOutro ? false : await P.carregarDadosReais(perfil, "prestador");
    if (idOutro) await carregarVitrine(idOutro);
    telefones = P.iniciarTelefones(perfil, { max: CONFIG.maxTelefonesSecundarios, classeRemover: "so-dono" });
    renderizarDados();
    iniciarFotosTrabalho();
    renderizarAvaliacoes();
    P.iniciarSanfona();
    iniciarFormulario();
    iniciarLogo();
    P.iniciarExclusao();
    abas = P.iniciarAbas({ abas: ["#aba-perfil"], semArrasto: () => true });   // painel único (ajusta a altura)
    iniciarInterruptores();
    iniciarVisao();
    if (idOutro) iniciarContatoCliente();
    if (real && SD.tipoUsuario() === "prestador") {                    // serviços concluídos
      contarPrestados = true;
      renderizarNumeros();
      document.addEventListener("sd:pedidos-mudou", renderizarNumeros);
    }
    if (real) {
      // Perfil sem ponto no mapa (contas antigas): calcula uma vez pelo endereço
      if (!perfil.local && perfil.cidade && window.SDFirebase.atualizarLocal) await window.SDFirebase.atualizarLocal(perfil);
      publicar();                                        // mantém o cartão público em dia
    }
  });

  // Ganchos só para testes automatizados (não usados pela página)
  window.__SDPrestador = { perfil, definirVisao };
})();
