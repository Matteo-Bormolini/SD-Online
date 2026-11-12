/* =====================================================================
   S.D — BASE DOS PERFIS (componentes/perfil-base/perfil-base.js)
   Tudo o que é IGUAL nos 4 perfis (Administrador, Cliente CPF,
   Cliente CNPJ e Prestador) fica aqui, em um lugar só:
     1. Preencher dados na tela        5. Formulário "Editar perfil"
     2. Abas com rolagem lateral       6. Foto de perfil opcional
     3. Telefones (principal + extras) 7. Pop-up "Excluir perfil"
     4. Sanfona + olho da senha
   Cada perfil (pasta perfil-<tipo>, arquivo perfil-<tipo>.js) só guarda o que é exclusivo dele.
   Depende de: componentes/utilidades/utilidades.js, componentes/senha/senha.js
   e componentes/endereco/endereco.js (CEP primeiro, preenche o resto).
   DADOS REAIS (Firebase, desde 11/11/2026): carregarDadosReais() troca os
   dados de exemplo pelos da conta logada; "Editar perfil" e "Excluir perfil"
   salvam no banco. Fotos ainda NÃO são enviadas (precisam do Cloud Storage,
   que exige o plano pago do Firebase): ficam só na tela.
   ===================================================================== */
(function () {
  "use strict";
  const U = window.SDUtil;
  if (!U) { console.error("[S.D] perfil-base.js: carregue componentes/utilidades/utilidades.js antes."); return; }

  /* ---------- 0. PADRÕES (cada perfil pode trocar no seu CONFIG) ---------- */
  const PADRAO = {
    maxTelefonesSecundarios: 4,
    tamanhoMaxFotoMB: 5,
    tiposFoto: ["image/jpeg", "image/png", "image/webp"]
  };

  const $ = (sel) => document.querySelector(sel);
  // PADRÃO: excluir ou editar sempre pergunta antes (componentes/confirmacao)
  const confirmar = (opcoes) => (window.SDConfirmar ? window.SDConfirmar(opcoes) : Promise.resolve(true));
  const ICONES = {
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>',
    olho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    olhoRiscado: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>'
  };

  // Altura do painel: as funções abaixo chamam atualizarAltura() sempre que o
  // conteúdo muda. Antes das abas existirem, não faz nada.
  let controleAbas = null;
  const atualizarAltura = () => { if (controleAbas) controleAbas.atualizarAltura(); };

  /* ---------- 0b. DADOS REAIS (Firebase) ----------
     Uso em cada perfil, no início:  const real = await P.carregarDadosReais(perfil, "cliente-cpf");
     - Só carrega se a pessoa logada for desse tipo e a página NÃO for de
       outra pessoa (?id=...). Senão devolve false e a tela fica no exemplo.
     - Apaga os valores de exemplo (para não mostrar dado falso) e coloca os do banco. */
  const firebase = () => (window.SDFirebase ? Promise.resolve(window.SDFirebase) : new Promise((ok) => {
    const t = setTimeout(() => ok(window.SDFirebase), 8000);
    document.addEventListener("sd:firebase-pronto", () => { clearTimeout(t); ok(window.SDFirebase); }, { once: true });
  }));
  // Campos de exemplo que continuam (textos fixos da página)
  const MANTER_EXEMPLO = ["tipoConta", "cargoBase", "raioKm"];

  function zerar(valor) {
    if (Array.isArray(valor)) return [];
    if (valor === null) return null;
    if (typeof valor === "string") return "";
    if (typeof valor === "number") return 0;
    if (typeof valor === "boolean") return false;
    if (typeof valor === "object") return Object.fromEntries(Object.entries(valor).map(([k, v]) => [k, zerar(v)]));
    return valor;
  }

  async function carregarDadosReais(perfil, tipo) {
    if (window.SD && window.SD.config.modoDemonstracao) return false;
    if (new URLSearchParams(location.search).get("id")) return false;    // perfil de outra pessoa
    const F = await firebase();
    if (!F || !F.ativo) return false;
    let dados = null;
    try { dados = await F.meusDados(); }
    catch (e) { console.warn("[S.D] Não foi possível carregar o perfil:", e.code || e); return false; }
    if (!dados || dados.tipo !== tipo) return false;

    Object.keys(perfil).forEach((k) => { if (!MANTER_EXEMPLO.includes(k)) perfil[k] = zerar(perfil[k]); });
    const { criadoEm, atualizadoEm, uid, documentoChave, interruptores, ...resto } = dados;
    Object.assign(perfil, resto);
    // Documento sempre formatado na tela (o banco guarda só números/letras)
    if (dados.documento) perfil.documento = dados.documento.length === 11 ? U.formatarCpf(dados.documento) : U.formatarCnpj(dados.documento);
    if (!Array.isArray(perfil.telefones) || !perfil.telefones.length) perfil.telefones = [{ numero: "", principal: true }];
    if ("membroDesde" in perfil && criadoEm && criadoEm.toDate) perfil.membroDesde = String(criadoEm.toDate().getFullYear());
    // Botões liga/desliga salvos na conta → valem nesta tela
    if (interruptores && window.SD_INTERRUPTORES) Object.entries(interruptores).forEach(([id, v]) => window.SD_INTERRUPTORES.gravar(id, v));
    Object.defineProperty(perfil, "_real", { value: true, enumerable: false });
    // Conta real: esconde o selo "Dados de demonstração" do topo da página
    document.querySelectorAll('.selo-demo[role="note"]').forEach((selo) => { selo.hidden = true; });
    return true;
  }

  // Salva os campos do perfil que mudaram (nomes = chaves do objeto perfil)
  async function salvarDadosReais(perfil, chaves) {
    const F = await firebase();
    const campos = {};
    chaves.forEach((k) => { if (k in perfil) campos[k] = perfil[k]; });
    await F.atualizarCampos(campos);
  }

  /* ---------- 1. PREENCHER DADOS NA TELA ---------- */
  // <td data-campo="email"> recebe valores.email (sempre como texto, nunca HTML)
  function preencherCampos(valores) {
    document.querySelectorAll("[data-campo]").forEach((el) => {
      el.textContent = valores[el.dataset.campo] ?? "";
    });
  }
  // Placeholders do formulário = valores atuais (mostra o que será mantido)
  function preencherPlaceholders(mapa) {
    Object.entries(mapa).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.placeholder = val || ""; });
  }
  // Lista de seleção: a 1ª opção ("Manter atual") mantém o valor que já existe
  function preencherSelect(select, textoAtual, opcoes) {
    select.innerHTML = "";
    select.append(new Option(`Manter atual (${textoAtual})`, ""));
    opcoes.forEach((o) => (typeof o === "string" ? select.append(new Option(o, o)) : select.append(new Option(o.texto, o.valor))));
  }
  // Valores padrão quando o campo está vazio
  const ouTraco = (v) => (v ? v : "—");

  // Endereço na tabela de leitura (células data-campo de componentes/endereco)
  const enderecoParaTela = (perfil) => ({
    cep: perfil.cep ? U.formatarCep(perfil.cep) : "—",
    endereco: ouTraco(perfil.endereco), numero: ouTraco(perfil.numero), complemento: ouTraco(perfil.complemento),
    bairro: ouTraco(perfil.bairro), cidade: ouTraco(perfil.cidade), uf: ouTraco(perfil.uf)
  });
  // Placeholders do endereço no "Editar perfil" (UF é lista: 1ª opção mostra o valor atual)
  function placeholdersEndereco(perfil) {
    const uf = document.getElementById("f-uf");
    if (uf && uf.options[0]) uf.options[0].textContent = `Manter atual (${perfil.uf || "—"})`;
    return {
      "f-cep": U.formatarCep(perfil.cep), "f-endereco": perfil.endereco, "f-numero": perfil.numero,
      "f-complemento": perfil.complemento, "f-bairro": perfil.bairro, "f-cidade": perfil.cidade
    };
  }

  /* ---------- 2. ABAS COM ROLAGEM LATERAL ----------
     opcoes.abas: seletores das abas (ex.: ["#aba-perfil", "#aba-servicos"])
     opcoes.navegaveis(): abas que podem ser escolhidas agora (padrão: todas)
     opcoes.semArrasto(): true = não troca de aba arrastando (ex.: visão do cliente) */
  function iniciarAbas(opcoes) {
    const trilho = $("#perfil-trilho");
    const todas = opcoes.abas.map((s) => $(s));
    const navegaveis = opcoes.navegaveis || (() => todas);
    const semArrasto = opcoes.semArrasto || (() => false);
    let ativo = 0;

    // A altura do trilho acompanha o painel visível (evita espaço vazio)
    function ajustarAltura() {
      const painel = trilho.children[ativo];
      if (painel) trilho.style.height = painel.scrollHeight + "px";
    }

    function ativar(indice, rolar) {
      ativo = indice;
      todas.forEach((aba, i) => {
        const sim = i === indice;
        aba.setAttribute("aria-selected", String(sim));
        aba.tabIndex = sim ? 0 : -1;
        // Painel fora da tela não recebe foco por Tab
        document.getElementById(aba.getAttribute("aria-controls")).inert = !sim;
      });
      if (rolar) trilho.scrollTo({ left: indice * trilho.clientWidth });
      ajustarAltura();
    }

    // Clique e teclado (← → Home End) nas abas
    todas.forEach((aba, i) => {
      aba.addEventListener("click", () => ativar(i, true));
      aba.addEventListener("keydown", (e) => {
        const total = navegaveis().length;
        let novo = null;
        if (e.key === "ArrowRight") novo = (i + 1) % total;
        if (e.key === "ArrowLeft") novo = (i - 1 + total) % total;
        if (e.key === "Home") novo = 0;
        if (e.key === "End") novo = total - 1;
        if (novo !== null) { e.preventDefault(); ativar(novo, true); todas[novo].focus(); }
      });
    });

    // Mouse: arrastar o conteúdo para os lados (no celular o deslize já é nativo).
    // Dentro do carrossel o arrasto troca a FOTO; no quadro de serviços move o CARTÃO.
    let arrasto = null;
    trilho.addEventListener("pointerdown", (e) => {
      if (semArrasto() || e.pointerType !== "mouse" || e.button !== 0 ||
          e.target.closest("input, button, a, label, textarea, select, summary, .carrossel, .kanban")) return;
      arrasto = { x: e.clientX, inicio: trilho.scrollLeft, moveu: false };
    });
    window.addEventListener("pointermove", (e) => {
      if (!arrasto) return;
      const dx = e.clientX - arrasto.x;
      if (Math.abs(dx) > 8) {
        arrasto.moveu = true;
        trilho.style.scrollSnapType = "none"; trilho.style.scrollBehavior = "auto";
        trilho.scrollLeft = arrasto.inicio - dx;
      }
    });
    window.addEventListener("pointerup", (e) => {
      if (!arrasto) return;
      const dx = e.clientX - arrasto.x, moveu = arrasto.moveu;
      arrasto = null;
      trilho.style.scrollSnapType = ""; trilho.style.scrollBehavior = "";
      if (moveu) {
        const limite = trilho.clientWidth * 0.15;   // arrastar 15% troca de seção
        let novo = ativo;
        if (dx < -limite) novo = Math.min(navegaveis().length - 1, ativo + 1);
        if (dx > limite) novo = Math.max(0, ativo - 1);
        ativar(novo, true);
      }
    });

    // Deslizar com o dedo/trackpad também troca a aba
    let espera;
    trilho.addEventListener("scroll", () => {
      // O trilho só rola para os lados. Durante a animação de altura o navegador pode
      // rolá-lo para baixo ao focar um campo — isso esconderia o topo do painel.
      if (trilho.scrollTop) trilho.scrollTop = 0;
      clearTimeout(espera);
      espera = setTimeout(() => {
        const i = Math.min(navegaveis().length - 1, Math.round(trilho.scrollLeft / trilho.clientWidth));
        if (i !== ativo) ativar(i, false);
      }, 80);
    }, { passive: true });

    // Recalcula ao redimensionar a janela ou quando o conteúdo muda
    window.addEventListener("resize", () => { trilho.scrollLeft = ativo * trilho.clientWidth; ajustarAltura(); });
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(ajustarAltura);
      [...trilho.children].forEach((p) => ro.observe(p));
    }

    controleAbas = { ativar, atualizarAltura: ajustarAltura, get ativo() { return ativo; } };
    ativar(0, false);
    return controleAbas;
  }

  /* ---------- 3. TELEFONES (principal + secundários) ----------
     perfil.telefones = [{ numero: "11900000000", principal: true }, ...] */
  function iniciarTelefones(perfil, opcoes = {}) {
    const max = opcoes.max ?? PADRAO.maxTelefonesSecundarios;
    const classeRemover = "btn-remover" + (opcoes.classeRemover ? " " + opcoes.classeRemover : "");
    const lista = $("#lista-telefones");
    const btn = $("#btn-add-telefone"), caixa = $("#add-telefone"), input = $("#novo-telefone"), erro = $("#erro-novo-telefone");

    function renderizar() {
      lista.innerHTML = "";
      perfil.telefones.forEach((t, i) => {
        const li = document.createElement("li");
        const num = document.createElement("span");
        num.textContent = U.formatarTelefone(t.numero);
        const tipo = document.createElement("span");
        tipo.className = "tipo-tel";
        tipo.textContent = t.principal ? "(principal)" : "(secundário)";
        li.append(num, tipo);
        if (!t.principal) {
          const rem = document.createElement("button");
          rem.type = "button";
          rem.className = classeRemover;
          rem.innerHTML = ICONES.x;
          rem.setAttribute("aria-label", "Remover telefone " + U.formatarTelefone(t.numero));
          rem.addEventListener("click", async () => {
            const ok = await confirmar({ titulo: "Excluir este telefone?", texto: `O número ${U.formatarTelefone(t.numero)} será removido do seu perfil.`, sim: "Sim, excluir" });
            if (!ok) return;
            perfil.telefones.splice(i, 1); renderizar(); btn.focus();
            salvarTelefones();
          });
          li.append(rem);
        }
        lista.append(li);
      });
      const cheio = perfil.telefones.filter((t) => !t.principal).length >= max;
      btn.disabled = cheio;
      btn.title = cheio ? `Limite de ${max} telefones secundários` : "Adicionar telefone secundário";
      atualizarAltura();
    }

    const abrir = (sim) => {
      caixa.hidden = !sim;
      btn.setAttribute("aria-expanded", String(sim));
      if (sim) input.focus(); else { input.value = ""; erro.textContent = ""; input.removeAttribute("aria-invalid"); btn.focus(); }
      atualizarAltura();
    };
    const salvar = () => {
      const d = U.soDigitos(input.value);
      let msg = "";
      if (!U.telefoneValido(d)) msg = "Informe DDD + número (10 ou 11 dígitos).";
      else if (perfil.telefones.some((t) => t.numero === d)) msg = "Este telefone já está cadastrado.";
      if (msg) { erro.textContent = msg; input.setAttribute("aria-invalid", "true"); input.focus(); return; }
      perfil.telefones.push({ numero: d, principal: false });
      renderizar();
      abrir(false);
      salvarTelefones();
    };
    // Conta real: grava a lista de telefones no banco
    async function salvarTelefones() {
      if (!perfil._real) return;
      try { await salvarDadosReais(perfil, ["telefones"]); }
      catch (e) { erro.textContent = "Não foi salvo: " + (window.SDFirebase ? window.SDFirebase.mensagemErro(e) : "tente de novo."); }
    }
    btn.addEventListener("click", () => abrir(caixa.hidden));
    $("#btn-cancelar-telefone").addEventListener("click", () => abrir(false));
    $("#btn-salvar-telefone").addEventListener("click", salvar);
    input.addEventListener("input", () => { input.value = U.formatarTelefone(input.value); });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); salvar(); }
      if (e.key === "Escape") abrir(false);
    });

    renderizar();
    return { renderizar };
  }

  /* ---------- 4. SANFONA "EDITAR PERFIL" + OLHO DA LINHA "SENHA" ----------
     A sanfona só esconde/mostra: o que foi digitado permanece até confirmar. */
  function abrirSanfona(abrir) {
    $("#sanfona-editar").hidden = !abrir;
    $("#btn-editar").setAttribute("aria-expanded", String(abrir));
    atualizarAltura();
  }
  function iniciarSanfona() {
    $("#btn-editar").addEventListener("click", () => abrirSanfona($("#sanfona-editar").hidden));
    // A senha real nunca pode ser exibida (fica criptografada no servidor);
    // o olho mostra/esconde o aviso que explica isso.
    const olho = $("#btn-ver-senha"), aviso = $("#aviso-senha");
    if (!olho || !aviso) return;
    olho.innerHTML = ICONES.olho;
    olho.addEventListener("click", () => {
      const abrir = aviso.hidden;
      aviso.hidden = !abrir;
      olho.innerHTML = abrir ? ICONES.olhoRiscado : ICONES.olho;
      olho.setAttribute("aria-pressed", String(abrir));
      olho.setAttribute("aria-label", abrir ? "Ocultar aviso da senha" : "Visualizar senha");
      atualizarAltura();
    });
  }

  /* ---------- 5. FORMULÁRIO "EDITAR PERFIL" ----------
     Regras: só valida e aplica o que foi PREENCHIDO; vazio mantém o valor atual.
     Máscaras automáticas pelo atributo data-mascara no <input>:
       telefone · cep · ano (4 dígitos)
     opcoes:
       perfil       → objeto com os dados atuais
       coletar()    → { campo: valor } lido do formulário
       camposTexto  → campos simples copiados para o perfil se preenchidos
       validar(dados, marcar) → regras exclusivas da página (opcional)
       aplicarExtra(dados, alterados) → campos especiais (listas, números…) (opcional)
       aoConcluir() → redesenha a tela depois de aplicar */
  const MASCARAS = {
    telefone: (v) => U.formatarTelefone(v),
    cep: (v) => U.formatarCep(v),
    ano: (v) => U.soDigitos(v).slice(0, 4)
  };

  function erroCampo(id, msg) {
    const input = document.getElementById(id);
    const span = document.getElementById("e-" + id.replace("f-", ""));
    if (span) span.textContent = msg || "";
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
  }

  // Campos do endereço (mesmos nomes de componentes/endereco)
  const CAMPOS_ENDERECO = ["cep", "endereco", "uf", "cidade", "bairro", "numero", "complemento"];
  const cepMudou = (d, perfil) => !!d.cep && d.cep !== perfil.cep;

  // Validações que valem para TODOS os perfis
  function validarComuns(d, marcar, perfil) {
    if (d.email && !U.emailValido(d.email)) marcar("f-email", "E-mail inválido.");
    if (d.telefone && !U.telefoneValido(d.telefone)) marcar("f-telefone", "Informe DDD + número (10 ou 11 dígitos).");
    // Endereço: CEP novo = endereço novo inteiro (só o complemento pode ficar vazio)
    if (window.SDEndereco) window.SDEndereco.validar(d, cepMudou(d, perfil), (chave, m) => marcar("f-" + chave, m));
    // Senha: regra única do site (componentes/senha)
    if (d.senha || d.senha2) {
      const r = window.SDSenha
        ? window.SDSenha.avaliar(d.senha, { nome: perfil.nome || perfil.responsavelNome, email: perfil.email, documento: perfil.documento })
        : { ok: d.senha.length >= 6, erros: ["Use pelo menos 6 caracteres."] };
      if (!d.senha) marcar("f-senha", "Informe a nova senha.");
      else if (!r.ok) marcar("f-senha", r.erros[0]);
      else if (d.senha !== d.senha2) marcar("f-senha2", "As senhas não coincidem.");
    }
  }

  // Botões de mostrar/ocultar a senha digitada (campos "Nova senha")
  function ligarOlhosDeSenha(raiz) {
    raiz.querySelectorAll(".btn-olho[data-alvo]").forEach((b) => {
      b.innerHTML = ICONES.olho;
      b.addEventListener("click", () => {
        const input = document.getElementById(b.dataset.alvo);
        const mostrar = input.type === "password";
        input.type = mostrar ? "text" : "password";
        b.innerHTML = mostrar ? ICONES.olhoRiscado : ICONES.olho;
        b.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
        b.setAttribute("aria-pressed", String(mostrar));
      });
    });
  }

  function iniciarFormulario(opcoes) {
    const { perfil, coletar, camposTexto = [], validar, aplicarExtra, aoConcluir } = opcoes;
    const form = $("#form-editar"), msg = $("#msg-form");

    form.querySelectorAll("[data-mascara]").forEach((input) => {
      const mascara = MASCARAS[input.dataset.mascara];
      if (mascara) input.addEventListener("input", () => { input.value = mascara(input.value); });
    });
    ligarOlhosDeSenha(form);

    // Regra e medidor da senha (componentes/senha)
    const dicaSenha = $("#d-senha"), caixaMedidor = $("#medidor-senha");
    if (window.SDSenha && dicaSenha) dicaSenha.textContent = window.SDSenha.DICA;
    const medidor = window.SDSenha && caixaMedidor
      ? window.SDSenha.ligarMedidor($("#f-senha"), caixaMedidor, () => ({ nome: perfil.nome || perfil.responsavelNome, email: perfil.email, documento: perfil.documento }))
      : { atualizar() {} };
    $("#f-senha").setAttribute("maxlength", "128");
    $("#f-senha2").setAttribute("maxlength", "128");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      U.limparMensagem(msg);
      form.querySelectorAll(".campo-erro").forEach((el) => (el.textContent = ""));
      form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));

      // Campos comuns + os da página
      const valor = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ""; };
      const dados = Object.assign({
        email: valor("f-email"), telefone: U.soDigitos(valor("f-telefone")),
        endereco: valor("f-endereco"), numero: valor("f-numero"), complemento: valor("f-complemento"),
        bairro: valor("f-bairro"), cidade: valor("f-cidade"), uf: valor("f-uf"), cep: U.soDigitos(valor("f-cep")),
        senha: $("#f-senha").value, senha2: $("#f-senha2").value
      }, coletar ? coletar(valor) : {});

      // Validação
      const erros = [];
      const marcar = (id, m) => { if (!erros.includes(id)) { erroCampo(id, m); erros.push(id); } };
      validarComuns(dados, marcar, perfil);
      if (validar) validar(dados, marcar);
      if (erros.length) {
        U.mostrarMensagem(msg, "erro", "Corrija os campos destacados. Nada foi alterado.");
        document.getElementById(erros[0]).focus();
        return;
      }

      // PADRÃO: confirmar antes de editar
      const ok = await confirmar({
        tipo: "editar", titulo: "Confirmar alteração do perfil?",
        texto: "Os campos que você preencheu vão substituir os dados atuais. Campos vazios continuam como estão.",
        sim: "Sim, alterar"
      });
      if (!ok) { U.mostrarMensagem(msg, "info", "Alteração cancelada. Nada foi mudado e o que você digitou continua no formulário."); return; }

      // Aplica somente os campos preenchidos; vazios mantêm o anterior
      // (cópia para desfazer se o banco recusar)
      const copia = perfil._real ? JSON.parse(JSON.stringify(perfil)) : null;
      const emailNovo = perfil._real && dados.email && dados.email !== perfil.email ? dados.email : "";
      if (emailNovo) dados.email = "";            // o e-mail só muda depois do link de confirmação
      const alterados = [];
      // CEP novo → troca o endereço inteiro (inclusive complemento vazio)
      if (cepMudou(dados, perfil)) {
        CAMPOS_ENDERECO.forEach((c) => { if ((dados[c] || "") !== (perfil[c] || "")) { perfil[c] = dados[c] || ""; alterados.push(c); } });
      }
      ["email", ...CAMPOS_ENDERECO, ...camposTexto].forEach((c) => {
        if (dados[c] && dados[c] !== perfil[c]) { perfil[c] = dados[c]; alterados.push(c); }
      });
      if (dados.telefone) {
        const p = perfil.telefones.find((t) => t.principal);
        if (p && p.numero !== dados.telefone) { p.numero = dados.telefone; alterados.push("telefone"); }
      }
      if (aplicarExtra) aplicarExtra(dados, alterados);
      if (dados.senha) alterados.push("senha");  // a senha real é enviada só ao servidor (nunca exibida)

      if (emailNovo) alterados.push("email");
      if (!alterados.length) {
        U.mostrarMensagem(msg, "info", "Nenhuma alteração informada. Os dados atuais foram mantidos.");
        return;
      }

      // CONTA REAL: grava no banco (senha e e-mail vão pelo login do Firebase)
      const avisos = [];
      if (perfil._real) {
        const botao = form.querySelector('[type="submit"]');
        botao.disabled = true; botao.setAttribute("aria-busy", "true");
        U.mostrarMensagem(msg, "info", "Salvando…");
        const F = await firebase();
        try {
          const campos = [...new Set(alterados.filter((c) => !["senha", "email", "telefone"].includes(c)))];
          if (alterados.includes("telefone")) campos.push("telefones");
          if (campos.length) await salvarDadosReais(perfil, campos);
          if (dados.senha) await F.trocarSenha(dados.senha);
          if (emailNovo) { await F.trocarEmail(emailNovo); avisos.push(`Enviamos um link para ${emailNovo}: o e-mail só muda depois que você clicar nele.`); }
        } catch (e) {
          Object.keys(copia).forEach((k) => { perfil[k] = copia[k]; });   // desfaz na tela
          botao.disabled = false; botao.removeAttribute("aria-busy");
          if (aoConcluir) aoConcluir();
          U.mostrarMensagem(msg, "erro", "Não foi salvo: " + F.mensagemErro(e));
          atualizarAltura();
          return;
        }
        botao.disabled = false; botao.removeAttribute("aria-busy");
      }

      form.reset();
      medidor.atualizar();
      form.querySelectorAll("[data-endereco]").forEach((f) => { if (f._sdEndereco) f._sdEndereco.limpar(); });
      if (aoConcluir) aoConcluir();
      form.querySelectorAll(".btn-olho[data-alvo]").forEach((b) => { if (b.getAttribute("aria-pressed") === "true") b.click(); });
      const total = new Set(alterados).size;
      if (perfil._real) U.mostrarMensagem(msg, "sucesso", `Alteração salva (${total} ${total === 1 ? "campo" : "campos"}). ${avisos.join(" ")}`.trim());
      else U.mostrarMensagem(msg, "atencao",
        `Alteração aplicada nesta tela (${total} ${total === 1 ? "campo" : "campos"}). ` +
        "Demonstração: ainda não foi salva no servidor.");
      atualizarAltura();
    });
  }

  /* ---------- 6. FOTOS ---------- */
  // Confere tipo e tamanho do arquivo escolhido
  function validarArquivo(arq, config = PADRAO) {
    const tipos = config.tiposFoto || PADRAO.tiposFoto, maxMB = config.tamanhoMaxFotoMB || PADRAO.tamanhoMaxFotoMB;
    if (!tipos.includes(arq.type)) return `"${arq.name}": use JPG, PNG ou WEBP.`;
    if (arq.size > maxMB * 1024 * 1024) return `"${arq.name}": máximo de ${maxMB} MB.`;
    return "";
  }

  // Foto de perfil OPCIONAL (Cliente CPF e CNPJ): sem foto → foto padrão do sistema.
  // "Remover foto" só aparece quando existe foto própria.
  function iniciarFotoOpcional({ perfil, padrao, tipoIcone, textoAlt, config = PADRAO }) {
    const img = $("#foto-perfil"), msg = $("#msg-foto"), remover = $("#btn-remover-foto");
    function renderizar() {
      U.aplicarFoto(img, perfil.foto, padrao, tipoIcone);
      img.alt = textoAlt(!!perfil.foto);
      remover.hidden = !perfil.foto;
      atualizarAltura();
    }
    $("#btn-foto").addEventListener("click", () => $("#input-foto").click());
    $("#input-foto").addEventListener("change", async (e) => {
      const arq = e.target.files[0];
      e.target.value = "";
      if (!arq) return;
      const erro = validarArquivo(arq, config);
      if (erro) { U.mostrarMensagem(msg, "erro", erro); return; }
      if (!(await confirmar({ tipo: "editar", titulo: "Trocar a foto de perfil?", texto: `A foto atual será substituída por "${arq.name}".`, sim: "Sim, trocar" }))) return;
      if (perfil.foto) URL.revokeObjectURL(perfil.foto);
      perfil.foto = URL.createObjectURL(arq);
      renderizar();
      U.mostrarMensagem(msg, "atencao", "Pré-visualização atualizada (ainda não enviada ao servidor).");
    });
    remover.addEventListener("click", async () => {
      if (!(await confirmar({ titulo: "Remover a foto de perfil?", texto: "Será usada a foto padrão do site.", sim: "Sim, remover" }))) return;
      if (perfil.foto) URL.revokeObjectURL(perfil.foto);
      perfil.foto = null;
      renderizar();
      $("#btn-foto").focus();
      U.mostrarMensagem(msg, "atencao", "Foto removida nesta tela; será usada a foto padrão (ainda não salvo no servidor).");
    });
    renderizar();
    return { renderizar };
  }

  /* ---------- 7. POP-UP DE EXCLUSÃO ---------- */
  function iniciarExclusao() {
    const modal = U.ligarPopup($("#modal-excluir"));        // clique fora fecha e o foco volta ao botão
    $("#btn-excluir").addEventListener("click", () => modal.abrir());
    $("#modal-cancelar").addEventListener("click", () => modal.close());
    $("#modal-confirmar").addEventListener("click", async () => {
      modal.close();
      const F = window.SD && !window.SD.config.modoDemonstracao ? await firebase() : null;
      if (!F || !F.ativo) {
        U.mostrarMensagem($("#msg-geral"), "atencao", "Exclusão não executada: esta é uma demonstração sem servidor. Na versão final, o perfil será apagado e você sairá da conta.");
        atualizarAltura();
        return;
      }
      U.mostrarMensagem($("#msg-geral"), "info", "Excluindo a conta…");
      try {
        await F.excluirConta();
        location.href = window.SD.urlPagina("sair");               // volta ao login, já sem conta
      } catch (e) {
        U.mostrarMensagem($("#msg-geral"), "erro", "A conta não foi excluída. " + F.mensagemErro(e));
        atualizarAltura();
      }
    });
  }

  /* ---------- 7b. INTERRUPTOR LIGA/DESLIGA (role="switch") ----------
     <button class="interruptor" role="switch" aria-checked="false">…<span class="interruptor-estado"></span></button>
     opcoes.ligado → estado inicial · opcoes.aoMudar(ligado) → chamado a cada troca */
  function iniciarInterruptor(botao, opcoes = {}) {
    if (!botao) return null;
    // Botões com data-interruptor são ligados por configuracoes/interruptores.js
    if (botao.dataset.interruptor && window.SD_INTERRUPTORES_LIGAR) return null;
    const estadoTxt = botao.querySelector(".interruptor-estado");
    const pintar = (ligado) => {
      botao.setAttribute("aria-checked", String(ligado));
      if (estadoTxt) estadoTxt.textContent = ligado ? "Ligado" : "Desligado";
    };
    pintar(!!opcoes.ligado);
    botao.addEventListener("click", () => {
      const ligado = botao.getAttribute("aria-checked") !== "true";
      pintar(ligado);
      if (opcoes.aoMudar) opcoes.aoMudar(ligado);
    });
    return { definir: pintar };
  }

  /* ---------- 7c. BOTÕES LIGA/DESLIGA DA LINHA DAS ABAS ----------
     Liga os botões de .perfil-interruptores (lista em configuracoes/interruptores.js)
     e mostra uma mensagem curta explicando o que mudou. */
  function iniciarInterruptoresPerfil() {
    const caixa = $(".perfil-interruptores");
    if (!caixa || !window.SD_INTERRUPTORES_LIGAR) return;
    window.SD_INTERRUPTORES_LIGAR(caixa);
    const msg = $("#msg-interruptores");
    document.addEventListener("sd:interruptor", (e) => {
      const { ligado, item } = e.detail;
      if (msg) U.mostrarMensagem(msg, "info", `${item.nome}: ${ligado ? item.ligado : item.desligado} (Demonstração: ainda não salvo no servidor.)`);
      atualizarAltura();
    });
  }

  /* ---------- 8. LINK DE AVALIAÇÕES (estrelas + média) ---------- */
  function preencherLinkAvaliacoes(link, avaliacao, href) {
    const media = U.decimal(avaliacao.media);
    link.href = href;
    link.innerHTML = U.estrelasSVG(avaliacao.media) +
      `<span>${media} (${avaliacao.total} ${avaliacao.total === 1 ? "avaliação" : "avaliações"})</span>`;
    link.setAttribute("aria-label", `Avaliação ${media} de 5, ${avaliacao.total} avaliações. Ver avaliações`);
  }

  window.SDPerfil = Object.freeze({
    carregarDadosReais, salvarDadosReais,
    PADRAO, ICONES, $, ouTraco, atualizarAltura, enderecoParaTela, placeholdersEndereco,
    preencherCampos, preencherPlaceholders, preencherSelect, preencherLinkAvaliacoes,
    iniciarAbas, iniciarTelefones, iniciarSanfona, abrirSanfona,
    iniciarFormulario, ligarOlhosDeSenha, validarArquivo, iniciarFotoOpcional, iniciarExclusao, iniciarInterruptor,
    iniciarInterruptoresPerfil, confirmar
  });
})();
