/* =====================================================================
   S.D — PERFIL DO USUÁRIO (perfil.js)
   Comportamentos da página de perfil do administrador.
   IMPORTANTE: tudo aqui roda só no navegador (demonstração). Salvar,
   excluir e enviar fotos de verdade dependem do servidor (etapa futura).
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. CONFIGURAÇÃO (fácil de ajustar) ---------- */
  const CONFIG = {
    maxTelefonesSecundarios: 4,
    maxFotosGaleria: 12,
    tamanhoMaxFotoMB: 5,
    tiposFoto: ["image/jpeg", "image/png", "image/webp"],
    // Endereço vem da configuração única (configuracoes/config.js)
    urlAvaliacoes: window.SD ? window.SD.url(window.SD.CONFIG.paginas.avaliacoes) : "../avaliacoes/index.html"
  };

  /* ---------- 2. DADOS DE DEMONSTRAÇÃO ----------
     Substituir pelos dados vindos do servidor depois do login. */
  const perfil = {
    login: "admin.sd",
    nome: "Nome Sobrenome Exemplo",
    cargoBase: "Administrador",          // fixo para o tipo adm
    cargoLider: "Suporte da plataforma", // definido pelo líder
    documento: "000.000.000-00",
    email: "admin@exemplo.com.br",
    telefones: [{ numero: "11900000000", principal: true }],
    endereco: "Rua Exemplo",
    numero: "100",
    complemento: "Sala 1",
    bairro: "Centro",
    cep: "01000000",
    avaliacao: { media: 4.8, total: 12 },
    foto: null,
    galeria: []
  };

  /* ---------- 3. UTILITÁRIOS ---------- */
  const $ = (sel) => document.querySelector(sel);
  const soDigitos = (v) => String(v || "").replace(/\D/g, "");

  function formatarTelefone(v) {
    const d = soDigitos(v).slice(0, 11);
    if (d.length <= 2) return d ? "(" + d : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }
  function formatarCep(v) {
    const d = soDigitos(v).slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  }
  const telefoneValido = (v) => /^\d{10,11}$/.test(soDigitos(v));
  const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);

  function mostrarMensagem(el, tipo, texto) {
    el.className = "mensagem " + tipo;
    el.textContent = texto;
  }
  function limparMensagem(el) { el.className = "mensagem"; el.textContent = ""; }

  // Avatar provisório (iniciais) quando não há foto
  function avatarIniciais(nome) {
    const ini = nome.trim().split(/\s+/).filter(Boolean);
    const txt = ((ini[0] || "")[0] || "") + ((ini.length > 1 ? ini[ini.length - 1] : "")[0] || "");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="#EADFD6"/><text x="100" y="118" font-family="Inter,Segoe UI,Arial,sans-serif" font-size="64" font-weight="700" fill="#800000" text-anchor="middle">${txt.toUpperCase()}</text></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  const ICONE_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  const ICONE_OLHO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const ICONE_OLHO_RISCADO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

  function estrelasSVG(media) {
    let html = '<span class="estrelas-icones" aria-hidden="true">';
    for (let i = 1; i <= 5; i++) {
      const cheia = media >= i;              // estrela cheia só quando atinge o valor
      const meia = !cheia && media >= i - 0.5; // meia estrela a partir de ,5
      const id = "meia-" + i;
      html += `<svg viewBox="0 0 24 24"><defs><linearGradient id="${id}"><stop offset="50%" stop-color="currentColor"/><stop offset="50%" stop-color="transparent"/></linearGradient></defs><path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z" fill="${cheia ? "currentColor" : meia ? `url(#${id})` : "none"}" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>`;
    }
    return html + "</span>";
  }

  /* ---------- 4. EXIBIÇÃO DOS DADOS ---------- */
  function renderizarDados() {
    const v = {
      login: perfil.login,
      nome: perfil.nome,
      cargo: perfil.cargoBase + " - " + perfil.cargoLider,  // espaço antes e depois do "-"
      documento: perfil.documento,
      email: perfil.email,
      endereco: perfil.endereco || "—",
      numero: perfil.numero || "—",
      complemento: perfil.complemento || "—",
      bairro: perfil.bairro || "—",
      cep: perfil.cep ? formatarCep(perfil.cep) : "—"
    };
    document.querySelectorAll("[data-campo]").forEach((el) => {
      el.textContent = v[el.dataset.campo] ?? "";
    });

    // Avaliação (hiperlink)
    const media = perfil.avaliacao.media.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });
    const link = $("#link-avaliacoes");
    link.href = CONFIG.urlAvaliacoes;
    link.innerHTML = estrelasSVG(perfil.avaliacao.media) +
      `<span>${media} (${perfil.avaliacao.total} ${perfil.avaliacao.total === 1 ? "avaliação" : "avaliações"})</span>`;
    link.setAttribute("aria-label", `Avaliação ${media} de 5, ${perfil.avaliacao.total} avaliações. Ver avaliações`);

    // Placeholders do formulário = valores atuais (mostra o que será mantido)
    const ph = {
      "f-login": perfil.login, "f-nome": perfil.nome, "f-email": perfil.email,
      "f-telefone": formatarTelefone(perfil.telefones.find((t) => t.principal)?.numero),
      "f-endereco": perfil.endereco, "f-numero": perfil.numero, "f-complemento": perfil.complemento,
      "f-bairro": perfil.bairro, "f-cep": formatarCep(perfil.cep),
      "f-senha": "Deixe vazio para manter a atual", "f-senha2": "Repita a nova senha"
    };
    Object.entries(ph).forEach(([id, val]) => { const el = document.getElementById(id); if (el) el.placeholder = val || ""; });

    renderizarTelefones();
    renderizarFoto();
  }

  /* ---------- 5. TELEFONES (principal + secundários) ---------- */
  function renderizarTelefones() {
    const lista = $("#lista-telefones");
    lista.innerHTML = "";
    perfil.telefones.forEach((t, i) => {
      const li = document.createElement("li");
      const num = document.createElement("span");
      num.textContent = formatarTelefone(t.numero);
      const tipo = document.createElement("span");
      tipo.className = "tipo-tel";
      tipo.textContent = t.principal ? "(principal)" : "(secundário)";
      li.append(num, tipo);
      if (!t.principal) {
        const rem = document.createElement("button");
        rem.type = "button";
        rem.className = "btn-remover";
        rem.innerHTML = ICONE_X;
        rem.setAttribute("aria-label", "Remover telefone " + formatarTelefone(t.numero));
        rem.addEventListener("click", () => { perfil.telefones.splice(i, 1); renderizarTelefones(); });
        li.append(rem);
      }
      lista.append(li);
    });
    const secundarios = perfil.telefones.filter((t) => !t.principal).length;
    const btn = $("#btn-add-telefone");
    const cheio = secundarios >= CONFIG.maxTelefonesSecundarios;
    btn.disabled = cheio;
    btn.title = cheio ? `Limite de ${CONFIG.maxTelefonesSecundarios} telefones secundários` : "Adicionar telefone secundário";
    atualizarAltura();
  }

  function iniciarTelefones() {
    const btn = $("#btn-add-telefone"), caixa = $("#add-telefone"), input = $("#novo-telefone"), erro = $("#erro-novo-telefone");
    const abrir = (sim) => {
      caixa.hidden = !sim;
      btn.setAttribute("aria-expanded", String(sim));
      if (sim) input.focus(); else { input.value = ""; erro.textContent = ""; input.removeAttribute("aria-invalid"); btn.focus(); }
      atualizarAltura();
    };
    btn.addEventListener("click", () => abrir(caixa.hidden));
    $("#btn-cancelar-telefone").addEventListener("click", () => abrir(false));
    input.addEventListener("input", () => { input.value = formatarTelefone(input.value); });
    const salvar = () => {
      const d = soDigitos(input.value);
      let msg = "";
      if (!telefoneValido(d)) msg = "Informe DDD + número (10 ou 11 dígitos).";
      else if (perfil.telefones.some((t) => t.numero === d)) msg = "Este telefone já está cadastrado.";
      if (msg) { erro.textContent = msg; input.setAttribute("aria-invalid", "true"); input.focus(); return; }
      perfil.telefones.push({ numero: d, principal: false });
      renderizarTelefones();
      abrir(false);
    };
    $("#btn-salvar-telefone").addEventListener("click", salvar);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") { e.preventDefault(); salvar(); }
      if (e.key === "Escape") abrir(false);
    });
  }

  /* ---------- 6. ABAS COM ROLAGEM LATERAL ---------- */
  const trilho = () => $("#perfil-trilho");
  const abas = () => [$("#aba-perfil"), $("#aba-admin")];
  let painelAtivo = 0;

  // A altura do trilho acompanha o painel visível (evita espaço vazio)
  function atualizarAltura() {
    const t = trilho();
    if (!t) return;
    const painel = t.children[painelAtivo];
    t.style.height = painel.scrollHeight + "px";
  }

  function ativarAba(indice, rolar) {
    painelAtivo = indice;
    abas().forEach((aba, i) => {
      const ativo = i === indice;
      aba.setAttribute("aria-selected", String(ativo));
      aba.tabIndex = ativo ? 0 : -1;
      // Painel fora da tela não recebe foco por Tab
      document.getElementById(aba.getAttribute("aria-controls")).inert = !ativo;
    });
    if (rolar) trilho().scrollTo({ left: indice * trilho().clientWidth });
    atualizarAltura();
  }

  function iniciarAbas() {
    abas().forEach((aba, i) => {
      aba.addEventListener("click", () => ativarAba(i, true));
      aba.addEventListener("keydown", (e) => {   // setas esquerda/direita entre abas
        const total = abas().length;
        let novo = null;
        if (e.key === "ArrowRight") novo = (i + 1) % total;
        if (e.key === "ArrowLeft") novo = (i - 1 + total) % total;
        if (e.key === "Home") novo = 0;
        if (e.key === "End") novo = total - 1;
        if (novo !== null) { e.preventDefault(); ativarAba(novo, true); abas()[novo].focus(); }
      });
    });

    // Mouse: arrastar o conteúdo para os lados (no celular o deslize já é nativo)
    let arrasto = null;
    trilho().addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("input, button, a, label, textarea, select")) return;
      arrasto = { x: e.clientX, inicio: trilho().scrollLeft, moveu: false };
    });
    window.addEventListener("pointermove", (e) => {
      if (!arrasto) return;
      const dx = e.clientX - arrasto.x;
      if (Math.abs(dx) > 8) { arrasto.moveu = true; trilho().style.scrollSnapType = "none"; trilho().style.scrollBehavior = "auto"; trilho().scrollLeft = arrasto.inicio - dx; }
    });
    window.addEventListener("pointerup", (e) => {
      if (!arrasto) return;
      const dx = e.clientX - arrasto.x, moveu = arrasto.moveu;
      arrasto = null;
      trilho().style.scrollSnapType = ""; trilho().style.scrollBehavior = "";
      if (moveu) {
        const limite = trilho().clientWidth * 0.15;   // arrastar 15% troca de seção
        let novo = painelAtivo;
        if (dx < -limite) novo = Math.min(abas().length - 1, painelAtivo + 1);
        if (dx > limite) novo = Math.max(0, painelAtivo - 1);
        ativarAba(novo, true);
      }
    });

    // Deslizar com o dedo/trackpad também troca a aba
    let espera;
    trilho().addEventListener("scroll", () => {
      clearTimeout(espera);
      espera = setTimeout(() => {
        const i = Math.round(trilho().scrollLeft / trilho().clientWidth);
        if (i !== painelAtivo) ativarAba(i, false);
      }, 80);
    }, { passive: true });

    // Recalcula ao redimensionar a janela ou quando o conteúdo muda
    window.addEventListener("resize", () => { trilho().scrollLeft = painelAtivo * trilho().clientWidth; atualizarAltura(); });
    if ("ResizeObserver" in window) {
      const ro = new ResizeObserver(atualizarAltura);
      [...trilho().children].forEach((p) => ro.observe(p));
    }
    ativarAba(0, false);
  }

  /* ---------- 7. SANFONA "EDITAR PERFIL" ----------
     Só esconde/mostra: o que foi digitado permanece até confirmar. */
  function abrirSanfona(abrir) {
    const btn = $("#btn-editar"), sanfona = $("#sanfona-editar");
    sanfona.hidden = !abrir;
    btn.setAttribute("aria-expanded", String(abrir));
    atualizarAltura();
  }

  function iniciarSanfona() {
    $("#btn-editar").addEventListener("click", () => abrirSanfona($("#sanfona-editar").hidden));
    // Olho da linha "Senha": a senha real não pode ser exibida (fica criptografada no servidor),
    // então o botão mostra/esconde o aviso explicando isso.
    const olho = $("#btn-ver-senha"), aviso = $("#aviso-senha");
    olho.innerHTML = ICONE_OLHO;
    olho.addEventListener("click", () => {
      const abrir = aviso.hidden;
      aviso.hidden = !abrir;
      olho.innerHTML = abrir ? ICONE_OLHO_RISCADO : ICONE_OLHO;
      olho.setAttribute("aria-pressed", String(abrir));
      olho.setAttribute("aria-label", abrir ? "Ocultar aviso da senha" : "Visualizar senha");
      atualizarAltura();
    });
  }

  /* ---------- 8. FORMULÁRIO DE EDIÇÃO ---------- */
  function erroCampo(id, msg) {
    const input = document.getElementById(id);
    const span = document.getElementById("e-" + id.replace("f-", ""));
    if (span) span.textContent = msg || "";
    if (msg) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid");
  }

  function iniciarFormulario() {
    const form = $("#form-editar"), msg = $("#msg-form");
    const valor = (id) => document.getElementById(id).value.trim();

    $("#f-telefone").addEventListener("input", (e) => { e.target.value = formatarTelefone(e.target.value); });
    $("#f-cep").addEventListener("input", (e) => { e.target.value = formatarCep(e.target.value); });
    $("#f-login").addEventListener("input", (e) => { e.target.value = e.target.value.toLowerCase().replace(/\s/g, ""); });

    // Mostrar/ocultar senha digitada
    document.querySelectorAll(".btn-olho[data-alvo]").forEach((b) => {
      b.innerHTML = ICONE_OLHO;
      b.addEventListener("click", () => {
        const input = document.getElementById(b.dataset.alvo);
        const mostrar = input.type === "password";
        input.type = mostrar ? "text" : "password";
        b.innerHTML = mostrar ? ICONE_OLHO_RISCADO : ICONE_OLHO;
        b.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
        b.setAttribute("aria-pressed", String(mostrar));
      });
    });

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      limparMensagem(msg);
      form.querySelectorAll(".campo-erro").forEach((el) => (el.textContent = ""));
      form.querySelectorAll("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));

      const dados = {
        login: valor("f-login"), nome: valor("f-nome"), email: valor("f-email"),
        telefone: soDigitos(valor("f-telefone")),
        endereco: valor("f-endereco"), numero: valor("f-numero"), complemento: valor("f-complemento"),
        bairro: valor("f-bairro"), cep: soDigitos(valor("f-cep")),
        senha: document.getElementById("f-senha").value, senha2: document.getElementById("f-senha2").value
      };

      // Validação: só valida o que foi preenchido
      const erros = [];
      const marcar = (id, m) => { erroCampo(id, m); erros.push(id); };
      if (dados.login && !/^[a-z0-9._]{3,30}$/.test(dados.login)) marcar("f-login", "Use 3 a 30 caracteres: letras minúsculas, números, ponto ou _.");
      if (dados.nome && dados.nome.split(/\s+/).length < 2) marcar("f-nome", "Informe nome e sobrenome.");
      if (dados.email && !emailValido(dados.email)) marcar("f-email", "E-mail inválido.");
      if (dados.telefone && !telefoneValido(dados.telefone)) marcar("f-telefone", "Informe DDD + número (10 ou 11 dígitos).");
      if (dados.numero && !/^[0-9A-Za-z\s/-]{1,10}$/.test(dados.numero)) marcar("f-numero", "Número inválido.");
      if (dados.cep && dados.cep.length !== 8) marcar("f-cep", "O CEP deve ter 8 dígitos.");
      if (dados.senha || dados.senha2) {
        if (dados.senha.length < 8 || !/[A-Za-z]/.test(dados.senha) || !/\d/.test(dados.senha)) marcar("f-senha", "A senha precisa de 8+ caracteres, com letras e números.");
        else if (dados.senha !== dados.senha2) marcar("f-senha2", "As senhas não coincidem.");
      }

      if (erros.length) {
        mostrarMensagem(msg, "erro", "Corrija os campos destacados. Nada foi alterado.");
        document.getElementById(erros[0]).focus();
        return;
      }

      // Aplica somente os campos preenchidos; vazios mantêm o anterior
      const alterados = [];
      ["login", "nome", "email", "endereco", "numero", "complemento", "bairro", "cep"].forEach((c) => {
        if (dados[c] && dados[c] !== perfil[c]) { perfil[c] = dados[c]; alterados.push(c); }
      });
      if (dados.telefone) {
        const p = perfil.telefones.find((t) => t.principal);
        if (p && p.numero !== dados.telefone) { p.numero = dados.telefone; alterados.push("telefone"); }
      }
      if (dados.senha) alterados.push("senha");  // a senha real é enviada só ao servidor (nunca exibida)

      if (!alterados.length) {
        mostrarMensagem(msg, "info", "Nenhuma alteração informada. Os dados atuais foram mantidos.");
        return;
      }

      renderizarDados();
      form.reset();
      form.querySelectorAll(".btn-olho[data-alvo]").forEach((b) => { if (b.getAttribute("aria-pressed") === "true") b.click(); });
      mostrarMensagem(msg, "atencao",
        `Alteração aplicada nesta tela (${alterados.length} ${alterados.length === 1 ? "campo" : "campos"}). ` +
        "Demonstração: ainda não foi salva no servidor.");
    });
  }

  /* ---------- 9. FOTO DE PERFIL E GALERIA ---------- */
  function renderizarFoto() {
    const img = $("#foto-perfil");
    img.src = perfil.foto || avatarIniciais(perfil.nome);
    img.alt = "Foto de perfil de " + perfil.nome;
  }

  function validarArquivo(arq) {
    if (!CONFIG.tiposFoto.includes(arq.type)) return `"${arq.name}": use JPG, PNG ou WEBP.`;
    if (arq.size > CONFIG.tamanhoMaxFotoMB * 1024 * 1024) return `"${arq.name}": máximo de ${CONFIG.tamanhoMaxFotoMB} MB.`;
    return "";
  }

  function renderizarGaleria() {
    const grade = $("#galeria-grade");
    grade.innerHTML = "";
    perfil.galeria.forEach((url, i) => {
      const li = document.createElement("li");
      const img = document.createElement("img");
      img.src = url; img.alt = `Foto secundária ${i + 1}`; img.loading = "lazy";
      const rem = document.createElement("button");
      rem.type = "button"; rem.className = "btn-remover"; rem.innerHTML = ICONE_X;
      rem.setAttribute("aria-label", `Remover foto secundária ${i + 1}`);
      rem.addEventListener("click", () => { URL.revokeObjectURL(url); perfil.galeria.splice(i, 1); renderizarGaleria(); });
      li.append(img, rem);
      grade.append(li);
    });
    $("#titulo-galeria").textContent = `Galeria (${perfil.galeria.length})`;
    $("#galeria-vazia").hidden = perfil.galeria.length > 0;
    $("#btn-galeria").disabled = perfil.galeria.length >= CONFIG.maxFotosGaleria;
    atualizarAltura();
  }

  function iniciarFotos() {
    const msg = $("#msg-foto");
    $("#btn-foto").addEventListener("click", () => $("#input-foto").click());
    $("#btn-galeria").addEventListener("click", () => $("#input-galeria").click());

    $("#input-foto").addEventListener("change", (e) => {
      const arq = e.target.files[0];
      e.target.value = "";
      if (!arq) return;
      const erro = validarArquivo(arq);
      if (erro) { mostrarMensagem(msg, "erro", erro); return; }
      if (perfil.foto) URL.revokeObjectURL(perfil.foto);
      perfil.foto = URL.createObjectURL(arq);
      renderizarFoto();
      mostrarMensagem(msg, "atencao", "Pré-visualização atualizada (ainda não enviada ao servidor).");
    });

    $("#input-galeria").addEventListener("change", (e) => {
      const arquivos = [...e.target.files];
      e.target.value = "";
      const problemas = [];
      arquivos.forEach((arq) => {
        if (perfil.galeria.length >= CONFIG.maxFotosGaleria) { problemas.push(`Limite de ${CONFIG.maxFotosGaleria} fotos atingido.`); return; }
        const erro = validarArquivo(arq);
        if (erro) problemas.push(erro); else perfil.galeria.push(URL.createObjectURL(arq));
      });
      renderizarGaleria();
      if (problemas.length) mostrarMensagem(msg, "erro", [...new Set(problemas)].join(" "));
      else if (arquivos.length) mostrarMensagem(msg, "atencao", "Fotos adicionadas à pré-visualização (ainda não enviadas ao servidor).");
    });
  }

  /* ---------- 10. POP-UP DE EXCLUSÃO ---------- */
  function iniciarExclusao() {
    const modal = $("#modal-excluir");
    $("#btn-excluir").addEventListener("click", () => modal.showModal());
    $("#modal-cancelar").addEventListener("click", () => modal.close());
    // Clique fora da caixa fecha
    modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });
    modal.addEventListener("close", () => $("#btn-excluir").focus());
    $("#modal-confirmar").addEventListener("click", () => {
      modal.close();
      // A exclusão real será feita pelo servidor; aqui não apagamos nada
      mostrarMensagem($("#msg-geral"), "atencao", "Exclusão não executada: esta é uma demonstração sem servidor. Na versão final, o perfil será apagado e você sairá da conta.");
    });
  }

  /* ---------- 11. INÍCIO ---------- */
  document.addEventListener("DOMContentLoaded", () => {
    renderizarDados();
    renderizarGaleria();
    iniciarTelefones();
    iniciarSanfona();
    iniciarFormulario();
    iniciarFotos();
    iniciarExclusao();
    iniciarAbas();
  });
})();
