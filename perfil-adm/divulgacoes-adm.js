/* =====================================================================
   S.D — ABA "DIVULGAÇÕES" DO ADM (perfil-adm/divulgacoes-adm.js) · v0.8.3 / v0.8.5
   Cadastra, edita, publica/suspende/encerra e apaga o que aparece na
   Home do prestador (eventos, grupos e comunicados) e, desde a v0.8.5,
   na Home dos clientes (Avisos da S.D = comunicado para "Clientes";
   Anúncios = tipo "Anúncio", sempre para "Clientes"). Tudo numa aba só,
   um bloco embaixo do outro:
     1. Exemplos ilustrativos (criar / apagar — apagar antes do lançamento)
     2. Formulário (nova divulgação ou edição)
     3. Lista do que está cadastrado
   Banco: só por firebase/divulgacoes.js (window.SDDivulgacoes.adm).
   As regras do banco (área 80) também conferem: só o adm grava.
   Padrão do site: editar, mudar situação e excluir pedem confirmação (SDConfirmar).
   ===================================================================== */
(function () {
  "use strict";
  const SD = window.SD, U = window.SDUtil;
  const raiz = document.getElementById("adm-divulgacoes");
  if (!raiz || !SD) return;

  /* ---------- 1. TEXTOS E OPÇÕES ← MUDE AQUI ---------- */
  const TIPO = { evento: "Evento", grupo: "Grupo / comunidade", comunicado: "Comunicado / aviso", anuncio: "Anúncio (só clientes)" };
  const PUBLICO = { geral: "Todos os prestadores", atividades: "Prestadores de algumas atividades", clientes: "Clientes (CPF e CNPJ)" };
  const SITUACAO = { publicado: "Publicado", suspenso: "Suspenso", encerrado: "Encerrado" };
  const REDES = { whatsapp: "WhatsApp", telegram: "Telegram", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", linkedin: "LinkedIn", site: "Site" };
  const IMAGEM = { largura: 1280, maxCaracteres: 290000 };   // limite do banco: 300.000
  const ATIVIDADES = SD.config.servicos.map((s) => s.nome);  // lista única (configuracoes/config.js)

  const esc = (t) => String(t == null ? "" : t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = (s) => raiz.querySelector(s);
  const atualizarAltura = () => { if (window.SDPerfil && window.SDPerfil.atualizarAltura) window.SDPerfil.atualizarAltura(); };
  const confirmar = (o) => (window.SDConfirmar ? window.SDConfirmar(o) : Promise.resolve(window.confirm(o.titulo)));
  const mensagem = (alvo, tipo, texto) => { if (U && U.mostrarMensagem) U.mostrarMensagem(alvo, tipo, texto); else alvo.textContent = texto; };

  /* ---------- 2. CAMPOS DO FORMULÁRIO ---------- */
  const campo = (id, rotulo, html, extra = "") =>
    `<div class="campo ${extra}"><label for="dv-${id}">${rotulo}</label>${html}<span class="campo-erro" id="e-dv-${id}"></span></div>`;
  const texto = (id, rotulo, max, extra = "", tipo = "text", attrs = "") =>
    campo(id, rotulo, `<input type="${tipo}" id="dv-${id}" ${max ? `maxlength="${max}"` : ""} ${attrs} aria-describedby="e-dv-${id}">`, extra);
  const opcoes = (id, rotulo, lista, extra = "") =>
    campo(id, rotulo, `<select id="dv-${id}" aria-describedby="e-dv-${id}">${Object.entries(lista).map(([v, t]) => `<option value="${v}">${t}</option>`).join("")}</select>`, extra);

  function montarTela() {
    raiz.innerHTML = `
      <section class="dv-bloco" aria-labelledby="dv-ex-titulo">
        <h3 id="dv-ex-titulo">Exemplos ilustrativos</h3>
        <p class="nota">Cria 13 divulgações FICTÍCIAS (marcadas "Exemplo"): 9 para a Home do prestador e 4 para a Home dos clientes (avisos e anúncios). <strong>Apague antes do lançamento.</strong></p>
        <div class="dv-acoes">
          <button type="button" class="btn" id="dv-criar-exemplos">Criar exemplos ilustrativos</button>
          <button type="button" class="btn" id="dv-apagar-exemplos">Apagar exemplos</button>
        </div>
        <div class="mensagem" id="dv-msg-exemplos" role="status" aria-live="polite"></div>
      </section>

      <section class="dv-bloco" aria-labelledby="dv-form-titulo">
        <h3 id="dv-form-titulo">Nova divulgação</h3>
        <form id="dv-form" novalidate>
          <div class="form-grade">
            ${opcoes("tipo", 'Tipo <span class="obrigatorio">*</span>', TIPO)}
            ${opcoes("situacao", 'Situação <span class="obrigatorio">*</span>', SITUACAO)}
            ${texto("titulo", 'Título <span class="obrigatorio">*</span>', 120, "largura-total")}
            <fieldset class="grupo largura-total" id="dv-publico">
              <legend>Quem vê</legend>
              <div class="campo campo-check"><input type="radio" name="dv-publico" id="dv-publico-geral" value="geral" checked><label for="dv-publico-geral">Todos os prestadores</label></div>
              <div class="campo campo-check"><input type="radio" name="dv-publico" id="dv-publico-ativ" value="atividades"><label for="dv-publico-ativ">Só algumas atividades (área de atuação ou atividade secundária)</label></div>
              <div class="campo campo-check"><input type="radio" name="dv-publico" id="dv-publico-clientes" value="clientes"><label for="dv-publico-clientes">Clientes CPF e CNPJ (Home dos clientes)</label></div>
              <span class="campo-erro" id="e-dv-publico"></span>
              <div class="dv-atividades" id="dv-lista-atividades" hidden>
                ${ATIVIDADES.map((a, i) => `<div class="campo campo-check"><input type="checkbox" id="dv-at-${i}" value="${esc(a)}"><label for="dv-at-${i}">${esc(a)}</label></div>`).join("")}
              </div>
              <span class="campo-erro" id="e-dv-atividades"></span>
            </fieldset>
            ${campo("descricao", "Descrição (linha em branco = novo parágrafo)", '<textarea id="dv-descricao" rows="5" maxlength="1500" aria-describedby="e-dv-descricao"></textarea>', "largura-total")}
            ${texto("data", "Data", 0, "", "date")}
            ${texto("ordem", "Ordem (menor aparece primeiro; vazio = fim)", 0, "", "number", 'min="0" max="999" step="1"')}
            ${texto("link", "Link (https://…)", 500, "", "url", 'placeholder="https://"')}
            ${texto("linkTexto", "Texto do botão do link", 40)}

            <fieldset class="grupo largura-total" id="dv-imagem-grupo">
              <legend>Imagem (opcional)</legend>
              <div class="dv-imagem">
                <img id="dv-imagem-previa" alt="Prévia da imagem" hidden>
                <div>
                  <button type="button" class="btn btn-pequeno" id="dv-imagem-enviar">Escolher imagem</button>
                  <button type="button" class="btn btn-pequeno" id="dv-imagem-tirar" hidden>Tirar imagem</button>
                  <p class="nota">JPG, PNG ou WEBP. É reduzida para ${IMAGEM.largura} px e salva no banco. Ou digite o nome de um arquivo da pasta <code>fotos/divulgacoes/</code>.</p>
                  ${texto("imagemArquivo", "Nome do arquivo (opcional)", 60, "", "text", 'placeholder="ex.: feira-2026.webp"')}
                  <span class="campo-erro" id="e-dv-imagem"></span>
                </div>
              </div>
              <input type="file" id="dv-imagem-input" accept="image/jpeg,image/png,image/webp" class="visualmente-oculto" tabindex="-1" aria-hidden="true">
            </fieldset>

            <fieldset class="grupo largura-total" data-so="evento">
              <legend>Evento</legend>
              <div class="form-grade form-grade-interna">
                ${texto("subtitulo", "Subtítulo / breve apresentação", 160, "largura-total")}
                ${texto("dataFim", "Data final (se tiver vários dias)", 0, "", "date")}
                ${opcoes("modalidade", "Modalidade", { "": "Não informada", presencial: "Presencial", online: "Online", hibrido: "Híbrida" })}
                ${texto("horaInicio", "Início", 0, "", "time")}
                ${texto("horaFim", "Término", 0, "", "time")}
                ${texto("localNome", "Nome do local", 120)}
                ${texto("organizador", "Organizador", 120)}
                ${texto("cidade", "Cidade", 80)}
                ${texto("uf", "UF", 2, "", "text", 'placeholder="SP" autocapitalize="characters"')}
                ${texto("endereco", "Endereço", 200, "largura-total")}
                ${opcoes("buffet", "Buffet", { "": "Não informado", sim: "Sim", nao: "Não" })}
                ${texto("buffetEmpresa", "Empresa do buffet", 120)}
                ${opcoes("estacionamento", "Estacionamento", { "": "Não informado", gratuito: "Gratuito", pago: "Pago", nao: "Não tem" })}
                ${texto("estacionamentoObs", "Observação do estacionamento", 120)}
              </div>
            </fieldset>

            <fieldset class="grupo largura-total" data-so="grupo">
              <legend>Grupo / comunidade</legend>
              <div class="form-grade form-grade-interna">
                ${texto("regiao", "Região (ex.: Zona Sul)", 80)}
                ${texto("grupoCidade", "Cidade", 80)}
                ${texto("grupoUf", "UF", 2, "", "text", 'placeholder="SP"')}
                ${Object.entries(REDES).map(([k, n]) => texto("rede-" + k, n + " (https://…)", 500, "", "url", 'placeholder="https://"')).join("")}
              </div>
            </fieldset>

            <fieldset class="grupo largura-total" data-so="comunicado">
              <legend>Comunicado / aviso</legend>
              ${opcoes("nivel", "Destaque", { info: "Normal", atencao: "Importante (borda amarela)" })}
            </fieldset>

            <fieldset class="grupo largura-total" data-so="anuncio">
              <legend>Anúncio (v0.8.5)</legend>
              <p class="nota">Aparece só na Home dos clientes, sempre com a etiqueta "Anúncio". Precisa de imagem ou descrição.</p>
              ${texto("anunciante", "Anunciante (empresa ou pessoa)", 120)}
            </fieldset>
          </div>
          <div class="dv-acoes">
            <button type="submit" class="btn" id="dv-salvar">Salvar divulgação</button>
            <button type="button" class="btn" id="dv-cancelar" hidden>Cancelar edição</button>
          </div>
          <div class="mensagem" id="dv-msg-form" role="status" aria-live="polite"></div>
        </form>
      </section>

      <section class="dv-bloco" aria-labelledby="dv-lista-titulo">
        <div class="dv-lista-topo">
          <h3 id="dv-lista-titulo">Cadastradas</h3>
          <button type="button" class="btn btn-pequeno" id="dv-recarregar">Atualizar lista</button>
        </div>
        <div class="mensagem" id="dv-msg-lista" role="status" aria-live="polite"></div>
        <div id="dv-lista"><p class="nota">Carregando…</p></div>
      </section>`;
  }

  /* ---------- 3. ESTADO ---------- */
  let modulo = null, itens = [], editando = null, imagemDados = "";

  function esperarModulo() {
    return new Promise((ok, falha) => {
      if (window.SDDivulgacoes) return ok(window.SDDivulgacoes);
      const t = setTimeout(() => falha(new Error("O módulo de divulgações não carregou.")), 15000);
      document.addEventListener("sd:divulgacoes-pronto", () => { clearTimeout(t); ok(window.SDDivulgacoes); }, { once: true });
    });
  }
  const erroTexto = (e) => (e && e.code === "permission-denied"
    ? "Permissão negada pelo banco. Confira se as regras v0.8.5 foram publicadas e se esta conta é adm."
    : (window.SDFirebase && window.SDFirebase.mensagemErro ? window.SDFirebase.mensagemErro(e) : String(e && e.message || e)));

  /* ---------- 4. FORMULÁRIO: mostrar campos do tipo, ler e preencher ---------- */
  function mostrarPorTipo() {
    const tipo = $("#dv-tipo").value;
    raiz.querySelectorAll("[data-so]").forEach((f) => { f.hidden = f.dataset.so !== tipo; });
    // v0.8.5: anúncio = só Clientes · evento e grupo = só prestadores · comunicado = qualquer público
    const geral = $("#dv-publico-geral"), ativ = $("#dv-publico-ativ"), cli = $("#dv-publico-clientes");
    geral.disabled = ativ.disabled = tipo === "anuncio";
    cli.disabled = tipo === "evento" || tipo === "grupo";
    if (tipo === "anuncio") cli.checked = true;
    if (cli.disabled && cli.checked) geral.checked = true;
    $("#dv-lista-atividades").hidden = !$("#dv-publico-ativ").checked;
    atualizarAltura();
  }
  const val = (id) => { const el = $("#dv-" + id); return el ? el.value.trim() : ""; };

  function lerFormulario() {
    const tipo = val("tipo");
    const d = {
      tipo, situacao: val("situacao"), titulo: val("titulo"),
      publico: $("#dv-publico-clientes").checked ? "clientes" : $("#dv-publico-ativ").checked ? "atividades" : "geral",
      atividades: [...raiz.querySelectorAll("#dv-lista-atividades input:checked")].map((c) => c.value),
      descricao: val("descricao"), data: val("data"), link: val("link"), linkTexto: val("linkTexto"),
      imagem: imagemDados || val("imagemArquivo")
    };
    const ordem = val("ordem");
    if (ordem !== "") d.ordem = Math.max(0, Math.min(999, parseInt(ordem, 10) || 0));
    if (tipo === "evento") {
      ["subtitulo", "dataFim", "modalidade", "horaInicio", "horaFim", "localNome", "organizador", "cidade", "endereco", "buffetEmpresa",
        "estacionamento", "estacionamentoObs"].forEach((c) => { d[c] = val(c); });
      d.uf = val("uf").toUpperCase();
      const b = val("buffet"); if (b) d.buffet = b === "sim";
    }
    if (tipo === "grupo") {
      d.regiao = val("regiao"); d.cidade = val("grupoCidade"); d.uf = val("grupoUf").toUpperCase();
      d.redes = {}; Object.keys(REDES).forEach((k) => { d.redes[k] = val("rede-" + k); });
    }
    if (tipo === "comunicado") d.nivel = val("nivel");
    if (tipo === "anuncio") d.organizador = val("anunciante");
    if (editando && editando.exemplo === true) d.exemplo = true;   // mantém a marca de exemplo
    return d;
  }

  function limparFormulario() {
    $("#dv-form").reset();
    editando = null; imagemDados = "";
    mostrarImagem("");
    $("#dv-form-titulo").textContent = "Nova divulgação";
    $("#dv-salvar").textContent = "Salvar divulgação";
    $("#dv-cancelar").hidden = true;
    limparErros();
    mostrarPorTipo();
  }

  function preencher(item) {
    limparFormulario();
    editando = item;
    const set = (id, v) => { const el = $("#dv-" + id); if (el) el.value = v == null ? "" : v; };
    ["tipo", "situacao", "titulo", "descricao", "data", "link", "linkTexto", "subtitulo", "dataFim", "modalidade", "horaInicio", "horaFim",
      "localNome", "organizador", "endereco", "buffetEmpresa", "estacionamento", "estacionamentoObs", "regiao", "nivel"].forEach((c) => set(c, item[c]));
    set("ordem", Number.isInteger(item.ordem) ? item.ordem : "");
    if (item.tipo === "evento") { set("cidade", item.cidade); set("uf", item.uf); set("buffet", item.buffet === true ? "sim" : item.buffet === false ? "nao" : ""); }
    if (item.tipo === "grupo") { set("grupoCidade", item.cidade); set("grupoUf", item.uf); Object.keys(REDES).forEach((k) => set("rede-" + k, (item.redes || {})[k])); }
    $("#dv-publico-ativ").checked = item.publico === "atividades";
    $("#dv-publico-clientes").checked = item.publico === "clientes";
    $("#dv-publico-geral").checked = item.publico !== "atividades" && item.publico !== "clientes";
    if (item.tipo === "anuncio") set("anunciante", item.organizador);
    raiz.querySelectorAll("#dv-lista-atividades input").forEach((c) => { c.checked = (item.atividades || []).includes(c.value); });
    if (item.imagem && String(item.imagem).startsWith("data:")) { imagemDados = item.imagem; mostrarImagem(item.imagem); }
    else if (item.imagem) { set("imagemArquivo", item.imagem); mostrarImagem(SD.caminho("fotos/divulgacoes/" + item.imagem)); }
    $("#dv-form-titulo").textContent = "Editar: " + item.titulo;
    $("#dv-salvar").textContent = "Salvar alterações";
    $("#dv-cancelar").hidden = false;
    mostrarPorTipo();
    $("#dv-form-titulo").scrollIntoView({ behavior: "smooth", block: "start" });
    $("#dv-titulo").focus({ preventScroll: true });
  }

  function limparErros() {
    raiz.querySelectorAll(".campo-erro").forEach((s) => { s.textContent = ""; });
    raiz.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
  }
  function mostrarErros(erros) {
    limparErros();
    let primeiro = null;
    Object.entries(erros).forEach(([c, msg]) => {
      const idErro = c === "imagem" ? "e-dv-imagem" : c === "uf" && val("tipo") === "grupo" ? "e-dv-grupoUf" : c === "cidade" && val("tipo") === "grupo" ? "e-dv-grupoCidade" : "e-dv-" + c;
      const span = raiz.querySelector("#" + idErro);
      if (span) span.textContent = msg;
      const el = raiz.querySelector("#" + idErro.replace("e-dv-", "dv-"));
      if (el) { el.setAttribute("aria-invalid", "true"); primeiro = primeiro || el; }
    });
    if (primeiro) primeiro.focus();
    atualizarAltura();
  }

  /* ---------- 5. IMAGEM: reduz no navegador e guarda como texto (data:image) ---------- */
  function mostrarImagem(src) {
    const img = $("#dv-imagem-previa");
    img.hidden = !src; if (src) img.src = src; else img.removeAttribute("src");
    $("#dv-imagem-tirar").hidden = !src;
    atualizarAltura();
  }
  function reduzirImagem(arquivo) {
    return new Promise((ok, falha) => {
      const url = URL.createObjectURL(arquivo);
      const img = new Image();
      img.onload = () => {
        const escala = Math.min(1, IMAGEM.largura / img.naturalWidth);
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * escala); c.height = Math.round(img.naturalHeight * escala);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);   // redesenhar também tira a localização escondida (EXIF)
        URL.revokeObjectURL(url);
        for (let q = 0.8; q >= 0.4; q -= 0.1) {
          let d = c.toDataURL("image/webp", q);
          if (!d.startsWith("data:image/webp")) d = c.toDataURL("image/jpeg", q);   // Safari: sem WEBP
          if (d.length <= IMAGEM.maxCaracteres) return ok(d);
        }
        falha(new Error("A imagem continua grande demais. Use uma imagem menor."));
      };
      img.onerror = () => { URL.revokeObjectURL(url); falha(new Error("Não foi possível abrir a imagem.")); };
      img.src = url;
    });
  }

  /* ---------- 6. LISTA ---------- */
  const hoje = () => { const h = new Date(); return `${h.getFullYear()}-${String(h.getMonth() + 1).padStart(2, "0")}-${String(h.getDate()).padStart(2, "0")}`; };
  const dataBR = (iso) => (iso ? iso.split("-").reverse().join("/") : "");
  function linha(i) {
    const passou = i.tipo === "evento" && (i.dataFim || i.data) && (i.dataFim || i.data) < hoje();
    const publico = i.publico === "atividades" ? "Atividades: " + (i.atividades || []).join(", ") : PUBLICO[i.publico] || PUBLICO.geral;
    const botaoSituacao = i.situacao === "publicado"
      ? `<button type="button" class="btn btn-pequeno" data-acao="suspenso" data-id="${esc(i.id)}">Suspender</button>`
      : `<button type="button" class="btn btn-pequeno" data-acao="publicado" data-id="${esc(i.id)}">Publicar</button>`;
    return `
      <li class="dv-item">
        <div class="dv-item-texto">
          <p class="dv-etiquetas">
            <span class="dv-tag dv-sit-${esc(i.situacao)}">${esc(SITUACAO[i.situacao] || i.situacao)}</span>
            ${i.exemplo ? '<span class="dv-tag dv-exemplo">Exemplo</span>' : ""}
            ${passou ? '<span class="dv-tag">Data já passou (não aparece)</span>' : ""}
          </p>
          <strong>${esc(i.titulo)}</strong>
          <span class="nota">${esc(publico)}${i.data ? " · " + esc(dataBR(i.data)) : ""}</span>
        </div>
        <div class="dv-item-acoes">
          <button type="button" class="btn btn-pequeno" data-acao="editar" data-id="${esc(i.id)}">Editar<span class="visualmente-oculto"> ${esc(i.titulo)}</span></button>
          ${botaoSituacao}
          ${i.situacao !== "encerrado" ? `<button type="button" class="btn btn-pequeno" data-acao="encerrado" data-id="${esc(i.id)}">Encerrar</button>` : ""}
          <button type="button" class="btn btn-pequeno" data-acao="excluir" data-id="${esc(i.id)}">Excluir<span class="visualmente-oculto"> ${esc(i.titulo)}</span></button>
        </div>
      </li>`;
  }
  async function carregarLista() {
    const caixa = $("#dv-lista");
    try { itens = await modulo.adm.listarTodas(); }
    catch (e) { caixa.innerHTML = ""; mensagem($("#dv-msg-lista"), "erro", erroTexto(e)); atualizarAltura(); return; }
    $("#dv-msg-lista").textContent = ""; $("#dv-msg-lista").className = "mensagem";
    const qtdEx = itens.filter((i) => i.exemplo === true).length;
    $("#dv-apagar-exemplos").textContent = `Apagar exemplos (${qtdEx})`;
    $("#dv-apagar-exemplos").disabled = !qtdEx;
    if (!itens.length) { caixa.innerHTML = '<p class="nota">Nada cadastrado ainda.</p>'; atualizarAltura(); return; }
    const ordem = { publicado: 0, suspenso: 1, encerrado: 2 };
    caixa.innerHTML = Object.entries({ evento: "Eventos", grupo: "Grupos e comunidades", comunicado: "Comunicados e avisos", anuncio: "Anúncios (clientes)" }).map(([t, nome]) => {
      const lista = itens.filter((i) => i.tipo === t)
        .sort((a, b) => (ordem[a.situacao] ?? 3) - (ordem[b.situacao] ?? 3) || String(a.data || "").localeCompare(String(b.data || "")) || String(a.titulo).localeCompare(String(b.titulo), "pt-BR"));
      return lista.length ? `<h4>${nome} (${lista.length})</h4><ul class="dv-itens">${lista.map(linha).join("")}</ul>` : "";
    }).join("");
    atualizarAltura();
  }

  /* ---------- 7. AÇÕES ---------- */
  function ligar() {
    $("#dv-tipo").addEventListener("change", mostrarPorTipo);
    raiz.querySelectorAll('input[name="dv-publico"]').forEach((r) => r.addEventListener("change", mostrarPorTipo));
    $("#dv-cancelar").addEventListener("click", limparFormulario);
    $("#dv-recarregar").addEventListener("click", carregarLista);
    // Máximo de atividades marcadas
    $("#dv-lista-atividades").addEventListener("change", (e) => {
      const marcadas = raiz.querySelectorAll("#dv-lista-atividades input:checked");
      if (marcadas.length > modulo.LIMITES.atividades) { e.target.checked = false; mostrarErros({ atividades: `Máximo de ${modulo.LIMITES.atividades} atividades.` }); }
    });

    $("#dv-imagem-enviar").addEventListener("click", () => $("#dv-imagem-input").click());
    $("#dv-imagem-tirar").addEventListener("click", () => { imagemDados = ""; $("#dv-imagemArquivo").value = ""; mostrarImagem(""); });
    $("#dv-imagem-input").addEventListener("change", async (e) => {
      const arq = e.target.files[0]; e.target.value = "";
      if (!arq) return;
      if (!/^image\/(jpeg|png|webp)$/.test(arq.type)) { mostrarErros({ imagem: "Use JPG, PNG ou WEBP." }); return; }
      try { imagemDados = await reduzirImagem(arq); $("#dv-imagemArquivo").value = ""; mostrarImagem(imagemDados); limparErros(); }
      catch (err) { mostrarErros({ imagem: err.message }); }
    });
    $("#dv-imagemArquivo").addEventListener("input", () => {
      const v = val("imagemArquivo");
      if (v) { imagemDados = ""; mostrarImagem(/^[a-z0-9-]{1,60}\.(webp|jpg|jpeg|png)$/.test(v) ? SD.caminho("fotos/divulgacoes/" + v) : ""); }
    });

    // Salvar (novo ou edição)
    $("#dv-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const msg = $("#dv-msg-form");
      const dados = lerFormulario();
      const erros = modulo.adm.validar(dados);
      if (Object.keys(erros).length) { mostrarErros(erros); mensagem(msg, "erro", "Corrija os campos marcados."); return; }
      if (editando && !(await confirmar({ titulo: "Salvar as alterações?", texto: `"${editando.titulo}" será atualizado na Home.`, sim: "Sim, salvar", tipo: "editar" }))) return;
      const parar = U && U.carregando ? U.carregando($("#dv-salvar"), "Salvando…") : () => {};
      try {
        await modulo.adm.salvar(editando ? editando.id : "", dados, editando ? editando.criadoEm : null);
        parar(); limparFormulario();
        mensagem(msg, "sucesso", "Divulgação salva.");
        await carregarLista();
      } catch (err) { parar(); if (err.erros) mostrarErros(err.erros); mensagem(msg, "erro", "Não foi possível salvar: " + erroTexto(err)); }
    });

    // Botões da lista
    $("#dv-lista").addEventListener("click", async (e) => {
      const b = e.target.closest("[data-acao]");
      if (!b) return;
      const item = itens.find((i) => i.id === b.dataset.id);
      if (!item) return;
      const acao = b.dataset.acao, msg = $("#dv-msg-lista");
      if (acao === "editar") { preencher(item); return; }
      try {
        if (acao === "excluir") {
          if (!(await confirmar({ titulo: "Excluir esta divulgação?", texto: `"${item.titulo}" será apagada do banco. Não dá para desfazer.`, sim: "Sim, excluir", tipo: "excluir" }))) return;
          await modulo.adm.apagar(item.id);
          if (editando && editando.id === item.id) limparFormulario();
        } else {
          const nome = SITUACAO[acao].toLowerCase();
          const efeito = acao === "publicado" ? "vai aparecer" : "deixa de aparecer";
          if (!(await confirmar({ titulo: `Mudar para "${nome}"?`, texto: `"${item.titulo}" ${efeito} na Home ${item.publico === "clientes" ? "dos clientes" : "dos prestadores"}.`, sim: "Sim, mudar", tipo: "editar" }))) return;
          await modulo.adm.mudarSituacao(item.id, acao);
        }
        await carregarLista();
      } catch (err) { mensagem(msg, "erro", erroTexto(err)); atualizarAltura(); }
    });

    // Exemplos ilustrativos
    $("#dv-criar-exemplos").addEventListener("click", async () => {
      const msg = $("#dv-msg-exemplos");
      if (itens.some((i) => i.exemplo === true) && !(await confirmar({ titulo: "Já existem exemplos.", texto: "Criar outro conjunto de 13 exemplos?", sim: "Sim, criar", tipo: "editar" }))) return;
      const parar = U && U.carregando ? U.carregando($("#dv-criar-exemplos"), "Criando…") : () => {};
      try { await modulo.adm.criarExemplos(); parar(); mensagem(msg, "sucesso", "13 exemplos criados. Abra o Início e use \"Ver como\" (Prestador ou Cliente) para ver."); await carregarLista(); }
      catch (err) { parar(); mensagem(msg, "erro", erroTexto(err)); atualizarAltura(); }
    });
    $("#dv-apagar-exemplos").addEventListener("click", async () => {
      const msg = $("#dv-msg-exemplos");
      if (!(await confirmar({ titulo: "Apagar todos os exemplos?", texto: "Só as divulgações marcadas \"Exemplo\" serão apagadas. As reais ficam.", sim: "Sim, apagar", tipo: "excluir" }))) return;
      try { const n = await modulo.adm.apagarExemplos(); mensagem(msg, "sucesso", `${n} exemplo(s) apagado(s).`); await carregarLista(); }
      catch (err) { mensagem(msg, "erro", erroTexto(err)); atualizarAltura(); }
    });
  }

  /* ---------- 8. INÍCIO ---------- */
  async function iniciar() {
    if (!SD.logado() || SD.tipoUsuario() !== "adm") return;
    montarTela();
    try { modulo = await esperarModulo(); }
    catch (e) { $("#dv-lista").innerHTML = ""; mensagem($("#dv-msg-lista"), "erro", e.message); return; }
    ligar();
    mostrarPorTipo();
    carregarLista();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
