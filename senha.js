/* =====================================================================
   S.D — REGRAS DE SENHA (componentes/senha/senha.js)
   UMA regra de senha para o site todo: cadastro, Editar perfil e
   "Esqueceu a senha?". Mudou a regra? Mude só aqui (e no servidor).

   Regra atual (mínimo trocado de 12 para 6 em 11/11/2026, pedido do Marco):
     - mínimo de 6 caracteres (máximo 128) — igual à política do Firebase;
     - aceita letras, números, espaços e símbolos (não obriga misturar);
     - bloqueia senhas comuns e previsíveis (123456..., "senha2026",
       "qwerty", repetições, sequências e variações como "S3nh@");
     - bloqueia senha com o nome, o e-mail ou o documento da pessoa.
   A regra "não pode ser igual à senha atual" só o SERVIDOR consegue
   conferir (ele compara com o hash). Aqui só existe a mensagem padrão.

   ATENÇÃO: conferir no navegador ajuda a pessoa, mas NÃO é segurança.
   O servidor tem de repetir TODAS estas regras antes de salvar.
   Uso:
     SDSenha.avaliar(senha, { nome, email, documento }) → { ok, erros, nivel, rotulo }
     SDSenha.ligarMedidor(input, caixa, () => contexto)   → mostra a força ao digitar
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. CONFIGURAÇÃO ---------- */
  const REGRA = {
    minimo: 6,
    maximo: 128,
    textoIgualAnterior: "A nova senha não pode ser igual à sua senha anterior."
  };
  const DICA = `Mínimo de ${REGRA.minimo} caracteres. Pode usar letras, números, espaços e símbolos. Quanto maior, mais segura (ex.: "janela azul chove cedo").`;

  // Palavras e senhas muito usadas (comparadas sem acentos, em minúsculas e sem números/símbolos no fim)
  const COMUNS = new Set(("senha password passw0rd admin administrador root usuario user login entrar acesso " +
    "teste test qwerty qwertyuiop asdfgh asdfghjkl zxcvbn abc abcd abcdef abcdefgh abc123 iloveyou " +
    "teamo amor meuamor familia deus jesus jesuscristo gloria brasil saopaulo riodejaneiro " +
    "flamengo corinthians palmeiras santos vasco gremio cruzeiro internacional botafogo fluminense " +
    "mudar trocar mudar123 bemvindo welcome princesa dragon monkey master sunshine futebol " +
    "sdonline servicosdigitais servicos digitais servico manutencao condominio sindico prestador cliente " +
    "segredo minhasenha suasenha novasenha senhanova senhaforte").split(" "));

  // Sequências de teclado, letras e números (ida e volta)
  const SEQUENCIAS = ["abcdefghijklmnopqrstuvwxyz", "qwertyuiop", "asdfghjkl", "zxcvbnm", "01234567890", "1qaz2wsx3edc"];

  /* ---------- 2. FUNÇÕES DE APOIO ---------- */
  const semAcento = (t) => String(t || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  // Letras que costumam virar número/símbolo ("S3nh@" = "senha")
  const TROCAS = { a: "a4@", e: "e3", i: "i1!", o: "o0", s: "s5$", t: "t7", l: "l1", g: "g9" };
  const padraoPalavra = (p) => [...p].map((c) => (TROCAS[c] ? `[${TROCAS[c].replace("$", "\\$")}]` : c)).join("");
  // 1 ou 2 palavras comuns, com números/símbolos antes, entre ou depois:
  // "Senha@2026!", "S3nh@S3nh@12", "brasilamor123", "2026flamengo"
  const REGEX_COMUNS = new RegExp(`^[\\d\\W_]*(?:(?:${[...COMUNS].map(padraoPalavra).join("|")})[\\d\\W_]*){1,2}$`, "i");

  const ehComum = (senha) => REGEX_COMUNS.test(semAcento(senha).replace(/\s/g, ""));
  const semLetras = (senha) => !/\p{L}/u.test(senha);              // só números/símbolos (ex.: datas)

  // A senha é quase toda uma sequência? (ex.: "123456789012", "abcdefghijkl", "qwertyuiop12")
  function ehSequencia(t) {
    const s = t.replace(/\s/g, "");
    if (s.length < 4) return false;
    let dentro = 0;
    for (let i = 0; i + 3 <= s.length; i++) {
      const trecho = s.slice(i, i + 3);
      if (SEQUENCIAS.some((q) => q.includes(trecho) || [...q].reverse().join("").includes(trecho))) dentro++;
    }
    return dentro / (s.length - 2) >= 0.7;
  }

  // Poucos caracteres diferentes ou um padrão repetido (ex.: "aaaaaaaaaaaa", "abababababab", "senhasenha12")
  function ehRepeticao(t) {
    const s = t.replace(/\s/g, "");
    if (new Set(s).size <= 3) return true;
    return /^(.{1,6})\1{2,}/.test(s) || /^(.{4,})\1/.test(s);
  }

  // Contém dados da própria pessoa? (nome, parte do e-mail ou documento)
  function usaDadosPessoais(senha, ctx = {}) {
    const t = semAcento(senha).replace(/\s/g, "");
    const partes = [];
    if (ctx.email) partes.push(...semAcento(ctx.email.split("@")[0]).split(/[._\-+]/));
    if (ctx.nome) partes.push(...semAcento(ctx.nome).split(/\s+/));
    if (partes.some((p) => p.length >= 4 && new RegExp(padraoPalavra(p.replace(/[^a-z0-9]/g, ""))).test(t))) return true;
    const doc = String(ctx.documento || "").replace(/[^0-9a-z]/gi, "").toLowerCase();
    return doc.length >= 8 && t.replace(/[^0-9a-z]/g, "").includes(doc.slice(0, 8));
  }

  /* ---------- 3. AVALIAR ---------- */
  function avaliar(senha, ctx = {}) {
    const s = String(senha || "");
    const erros = [];
    if (s.length < REGRA.minimo) erros.push(`Use pelo menos ${REGRA.minimo} caracteres (faltam ${REGRA.minimo - s.length}).`);
    if (s.length > REGRA.maximo) erros.push(`Use no máximo ${REGRA.maximo} caracteres.`);
    if (s && !s.trim()) erros.push("A senha não pode ter só espaços.");
    if (s.length >= REGRA.minimo) {
      if (semLetras(s)) erros.push("Evite usar só números e símbolos (datas e telefones são fáceis de adivinhar).");
      else if (ehComum(s)) erros.push("Senha muito comum ou previsível. Evite palavras como \"senha\", nomes de times e anos.");
      else if (ehSequencia(s.toLowerCase())) erros.push("Evite sequências como 123456, abcdef ou qwerty.");
      else if (ehRepeticao(s.toLowerCase())) erros.push("Evite repetir o mesmo caractere ou trecho.");
      if (usaDadosPessoais(s, ctx)) erros.push("Não use seu nome, e-mail ou documento na senha.");
    }

    // Força aproximada: tamanho + variedade (0 a 4). Só para orientar a pessoa.
    let variedade = 0;
    [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9\s]/, /\s/].forEach((r) => { if (r.test(s)) variedade++; });
    let nivel = 0;
    if (!erros.length) {
      nivel = s.length >= 10 ? 2 : 1;                 // curta: aceita, mas mostra "Fraca"
      if (s.length >= 16 || variedade >= 3) nivel = 3;
      if (s.length >= 20 || (s.length >= 16 && variedade >= 3)) nivel = 4;
    } else if (s.length >= 8) nivel = 1;
    const rotulo = ["Muito fraca", "Fraca", "Boa", "Forte", "Muito forte"][nivel];
    return { ok: erros.length === 0, erros, nivel, rotulo };
  }

  /* ---------- 4. MEDIDOR NA TELA ----------
     input   → campo da nova senha
     caixa   → elemento vazio onde o medidor aparece
     contexto() → { nome, email, documento } atuais (opcional) */
  function ligarMedidor(input, caixa, contexto) {
    caixa.classList.add("senha-medidor");
    caixa.innerHTML = '<span class="senha-barra" aria-hidden="true"><span></span></span><span class="senha-forca" aria-live="polite"></span>';
    const barra = caixa.querySelector(".senha-barra > span"), texto = caixa.querySelector(".senha-forca");
    const atualizar = () => {
      if (!input.value) { caixa.dataset.nivel = ""; texto.textContent = ""; return; }
      const r = avaliar(input.value, contexto ? contexto() : {});
      caixa.dataset.nivel = String(r.nivel);
      barra.style.width = `${(r.nivel + 1) * 20}%`;
      texto.textContent = `Força: ${r.rotulo}`;
    };
    input.addEventListener("input", atualizar);
    atualizar();
    return { atualizar };
  }

  window.SDSenha = Object.freeze({ REGRA, DICA, avaliar, ligarMedidor });
})();
