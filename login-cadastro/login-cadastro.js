/* =====================================================================
   S.D — LOGIN E CADASTRO (login-cadastro/login-cadastro.js)
   "Fazer login" e "Criar login" (Cliente CPF, Cliente CNPJ, Prestador).
   NavBar, Rodapé, cores e campos seguem o padrão do site.

   Endereço: componentes/endereco (CEP primeiro, preenche rua, bairro,
   cidade e UF sozinho). Senha: regra única em componentes/senha.
   Recuperação de acesso (pop-ups): login-cadastro/recuperacao.js.

   LOGIN REAL (desde 11/11/2026): firebase/firebase.js (window.SDFirebase).
     - Entrar: só com E-MAIL + senha (MVP). CPF/CNPJ voltam depois.
     - Criar conta: cria o login, salva o perfil e reserva o CPF/CNPJ
       (1 conta por documento). Envia o e-mail de confirmação.
   DEMONSTRAÇÃO (modoDemonstracao: true em config.js): nenhuma senha é
   guardada; escolhe o tipo de conta e navega logado só nesta aba.
   ===================================================================== */
(function () {
  "use strict";
  const SD = window.SD, U = window.SDUtil, SENHA = window.SDSenha, END = window.SDEndereco, ID = window.SDIdentificadores;
  if (!SD || !U || !SENHA || !END || !ID) { console.error("[S.D] login-cadastro.js: carregue config.js, utilidades, senha, endereco e identificadores antes."); return; }
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);
  const parametros = new URLSearchParams(location.search);

  /* ---------- 1. CONFIGURAÇÃO DOS 3 CADASTROS (edite rótulos e campos aqui) ---------- */
  const CAMPOS_SENHA = [
    { chave: "senha", rotulo: "Senha", obrigatorio: true, senha: true, dica: SENHA.DICA, auto: "new-password", medidor: true },
    { chave: "senha2", rotulo: "Confirmação de senha", obrigatorio: true, senha: true, auto: "new-password" }
  ];
  // E-mail: obrigatório em todos (usado para entrar e para receber o link de nova senha)
  const CAMPO_EMAIL = { chave: "email", rotulo: "E-mail", obrigatorio: true, tipo: "email", auto: "email", ph: "seu@email.com" };
  // Marca a posição do bloco de endereço (montado por componentes/endereco)
  const ENDERECO = { endereco: true };

  // perfil = tipo de usuário usado em todo o site (seguranca/acesso.js)
  const TIPOS = {
    cpf: {
      perfil: "cliente-cpf",
      titulo: "Cadastro – Cliente CPF",
      sub: "Pessoa física (casas e apartamentos)",
      botao: "Criar login de Cliente CPF",
      // Sem "Nome de login": e-mail, CPF ou CNPJ já identificam a conta (decisão de 06/11/2026)
      campos: [
        { chave: "nome", rotulo: "Nome completo", obrigatorio: true, largo: true, auto: "name", max: 120 },
        { chave: "cpf", rotulo: "CPF", obrigatorio: true, mascara: "cpf", ph: "000.000.000-00" },
        { chave: "tel", rotulo: "Telefone", obrigatorio: true, mascara: "tel", ph: "(00) 00000-0000", tipo: "tel", auto: "tel" },
        { ...CAMPO_EMAIL, largo: true },
        ENDERECO,
        ...CAMPOS_SENHA
      ],
      privTexto: "Autorizo que prestadores vejam meu primeiro nome e bairro quando eu solicitar um serviço.",
      privNota: "Seu CPF, telefone e endereço completo nunca são exibidos publicamente. Nada é compartilhado sem a sua autorização, e você pode mudar isso a qualquer momento."
    },
    cnpj: {
      perfil: "cliente-cnpj",
      titulo: "Cadastro – Cliente CNPJ",
      sub: "Empresas e condomínios",
      botao: "Criar login de Cliente CNPJ",
      campos: [
        { chave: "cnpj", rotulo: "CNPJ", obrigatorio: true, mascara: "cnpj", ph: "00.000.000/0000-00" },
        { chave: "nome", rotulo: "Nome da empresa / condomínio", auto: "organization", max: 150 },
        { chave: "resp", rotulo: "Responsável principal", dica: "Opcional – pode mudar com o tempo", max: 120 },
        { chave: "tel", rotulo: "Telefone", obrigatorio: true, mascara: "tel", ph: "(00) 00000-0000", tipo: "tel", auto: "tel" },
        { ...CAMPO_EMAIL, largo: true },
        ENDERECO,
        ...CAMPOS_SENHA
      ],
      privTexto: "Autorizo exibir o nome da empresa/condomínio para prestadores.",
      privNota: "Telefone, endereço e responsável só são compartilhados com sua autorização. Clientes CPF não veem seus dados."
    },
    prest: {
      perfil: "prestador",
      titulo: "Cadastro – Prestador",
      sub: "Atende casas, condomínios e empresas",
      botao: "Criar login de Prestador",
      campos: [
        { chave: "cnpj", rotulo: "CNPJ", obrigatorio: true, mascara: "cnpj", ph: "00.000.000/0000-00" },
        { chave: "nome", rotulo: "Nome da empresa", auto: "organization", max: 150 },
        { chave: "resp", rotulo: "Responsável principal", dica: "Opcional – pode mudar com o tempo", max: 120 },
        { chave: "tel", rotulo: "Telefone", obrigatorio: true, mascara: "tel", ph: "(00) 00000-0000", tipo: "tel", auto: "tel" },
        { ...CAMPO_EMAIL, largo: true },
        ENDERECO,
        ...CAMPOS_SENHA
      ],
      privTexto: "Autorizo exibir o perfil da minha empresa nas buscas de clientes.",
      privNota: "Telefone, endereço e responsável só são mostrados a clientes com sua autorização.",
      // Botões liga/desliga do cadastro (lista em configuracoes/interruptores.js). Começam no padrão de lá.
      interruptores: ["mostrar-contatos"]
    }
  };

  // "?perfil=" aceito na URL → cadastro que abre
  const PERFIL_URL = { prestador: "prest", cpf: "cpf", "cliente-cpf": "cpf", cliente_cpf: "cpf", cnpj: "cnpj", "cliente-cnpj": "cnpj", cliente_cnpj: "cnpj" };

  // firebase/firebase.js carrega por último (type="module"): espera até 8 s por ele
  const firebase = () => (window.SDFirebase ? Promise.resolve(window.SDFirebase) : new Promise((ok) => {
    const t = setTimeout(() => ok(window.SDFirebase), 8000);
    document.addEventListener("sd:firebase-pronto", () => { clearTimeout(t); ok(window.SDFirebase); }, { once: true });
  }));

  /* ---------- 2. ESTADO DA TELA ---------- */
  const estado = { loginAberto: true, criarAberto: true, tipoAberto: null };   // tipoAberto: cpf | cnpj | prest | null

  // Conferir CPF/CNPJ? Vem do botão do adm (configuracoes/site no banco).
  // Começa LIGADO (padrão seguro) até o banco responder.
  let conferirDocumentos = true;
  firebase().then((F) => F && F.ativo && F.configSite()).then((c) => { if (c) conferirDocumentos = c.conferirDocumentos !== false; }).catch(() => {});

  /* ---------- 3. UTILIDADES ---------- */
  const ICONE_OLHO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const ICONE_OLHO_RISCADO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 3l18 18"/><path d="M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4.1M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/><path d="M9.9 9.9a3 3 0 0 0 4.2 4.2"/></svg>';

  // Cria elemento: el("div", { class: "x" }, [filhos ou texto])
  function el(tag, atributos = {}, filhos = []) {
    const elemento = document.createElement(tag);
    for (const [nome, valor] of Object.entries(atributos)) {
      if (valor === undefined || valor === null || valor === false) continue;
      elemento.setAttribute(nome, valor === true ? "" : valor);
    }
    for (const filho of [].concat(filhos)) elemento.append(filho instanceof Node ? filho : document.createTextNode(filho));
    return elemento;
  }

  // Aplica um padrão como "000.000.000-00" aos dígitos digitados
  function formatar(digitos, padrao) {
    let saida = "", i = 0;
    for (const c of padrao) {
      if (i >= digitos.length) break;
      if (c === "0") { saida += digitos[i]; i++; } else saida += c;
    }
    return saida;
  }
  function aplicarMascara(tipo, valor) {
    const d = U.soDigitos(valor);
    if (tipo === "cpf") return formatar(d.slice(0, 11), "000.000.000-00");
    if (tipo === "cnpj") return U.formatarCnpj(valor);          // aceita o CNPJ alfanumérico
    if (tipo === "tel") return U.formatarTelefone(d);
    return valor;
  }

  // Botão de ver/ocultar senha
  function ligarOlho(botao, campo) {
    botao.innerHTML = ICONE_OLHO;
    botao.addEventListener("click", () => {
      const mostrar = campo.type === "password";
      campo.type = mostrar ? "text" : "password";
      botao.innerHTML = mostrar ? ICONE_OLHO_RISCADO : ICONE_OLHO;
      botao.setAttribute("aria-label", mostrar ? "Ocultar senha" : "Mostrar senha");
      botao.setAttribute("aria-pressed", String(mostrar));
    });
  }

  // Erros dos campos (usa .campo-erro do formulario.css)
  function mostrarErro(input, mensagem) {
    const span = document.getElementById(input.getAttribute("aria-describedby").split(" ").pop());
    input.setAttribute("aria-invalid", "true");
    span.textContent = mensagem;
  }
  function limparErro(input) {
    const ids = (input.getAttribute("aria-describedby") || "").split(" ");
    const span = document.getElementById(ids[ids.length - 1]);
    input.removeAttribute("aria-invalid");
    if (span && span.classList.contains("campo-erro")) span.textContent = "";
  }

  /* ---------- 4. MONTA OS 3 FORMULÁRIOS DE CADASTRO ---------- */
  const enderecos = {};      // id do cadastro → controle do bloco de endereço

  function montarCadastros() {
    const destino = $("#cadastros");
    for (const [id, tipo] of Object.entries(TIPOS)) {
      const grade = el("div", { class: "form-grade" });

      for (const c of tipo.campos) {
        // Bloco de endereço (CEP primeiro; só o complemento é opcional)
        if (c.endereco) {
          const fs = el("fieldset", { class: "largura-total" });
          grade.append(fs);
          enderecos[id] = END.montarFormulario(fs, {
            prefixo: `${id}-end`, obrigatorio: true, legenda: "Endereço",
            idErro: (chave) => `${id}-end-${chave}-erro`,
            nota: "Digite o CEP: rua, bairro, cidade e UF são preenchidos sozinhos."
          });
          Object.values(enderecos[id].campos).forEach((campo) => campo.addEventListener("input", () => limparErro(campo)));
          continue;
        }
        const idCampo = `${id}-${c.chave}`;
        const descricao = [c.dica ? `${idCampo}-dica` : null, `${idCampo}-erro`].filter(Boolean).join(" ");
        const input = el("input", {
          id: idCampo, name: c.chave,
          type: c.senha ? "password" : (c.tipo || "text"),
          placeholder: c.ph, autocomplete: c.auto || "off",
          inputmode: c.mascara === "cnpj" ? "text" : (c.mascara ? "numeric" : (c.tipo === "email" ? "email" : undefined)),
          autocapitalize: c.mascara === "cnpj" ? "characters" : undefined,
          maxlength: c.senha ? SENHA.REGRA.maximo : (c.tipo === "email" ? 254 : c.max),   // tamanhos = firebase/firestore.rules (LIMITES)
          required: c.obrigatorio || undefined,
          "aria-describedby": descricao
        });
        if (c.mascara) input.addEventListener("input", () => { input.value = aplicarMascara(c.mascara, input.value); });
        input.addEventListener("input", () => limparErro(input));

        const rotulo = el("label", { for: idCampo }, [c.rotulo]);
        if (c.obrigatorio) rotulo.append(el("span", { class: "obrigatorio", "aria-hidden": "true" }, [" *"]));

        let caixa = input;
        if (c.senha) {
          const olho = el("button", { type: "button", class: "btn-olho", "aria-label": "Mostrar senha", "aria-pressed": "false" });
          caixa = el("div", { class: "senha-caixa" }, [input, olho]);
          ligarOlho(olho, input);
        }

        const bloco = el("div", { class: c.largo ? "campo largura-total" : "campo" }, [rotulo, caixa]);
        if (c.dica) bloco.append(el("span", { class: "nota", id: `${idCampo}-dica` }, [c.dica]));
        if (c.medidor) {
          const medidor = el("div");
          bloco.append(medidor);
          SENHA.ligarMedidor(input, medidor, () => contextoSenha(id));
        }
        bloco.append(el("span", { class: "campo-erro", id: `${idCampo}-erro` }));
        grade.append(bloco);
      }

      const privacidade = el("div", { class: "privacidade" }, [
        el("div", { class: "campo campo-check" }, [
          el("input", { id: `${id}-priv`, name: "autorizacao", type: "checkbox" }),
          el("label", { for: `${id}-priv` }, [tipo.privTexto])
        ]),
        el("p", { class: "nota" }, [tipo.privNota])
      ]);

      // Botões liga/desliga (ex.: "Mostrar meus contatos" no cadastro do Prestador)
      if (tipo.interruptores && window.SD_INTERRUPTORES_LIGAR) {
        const caixa = el("div", { class: "cadastro-interruptores" });
        tipo.interruptores.forEach((idBotao) => caixa.append(el("button", { type: "button", class: "interruptor", "data-interruptor": idBotao })));
        privacidade.append(caixa);
        window.SD_INTERRUPTORES_LIGAR(caixa);
      }

      const msg = el("div", { class: "mensagem", role: "alert" });
      const form = el("form", { novalidate: true }, [grade, privacidade, msg, el("button", { type: "submit", class: "btn btn-grande" }, [tipo.botao])]);
      form.addEventListener("submit", (e) => { e.preventDefault(); enviarCadastro(id, form, msg); });

      const subtitulo = el("p", { class: "login-texto" }, [tipo.sub]);
      destino.append(el("div", { id: `cadastro-${id}`, class: "cadastro", hidden: true }, [el("h3", {}, [tipo.titulo]), subtitulo, form]));
    }
  }

  /* ---------- 5. VALIDAÇÃO E ENVIO DO CADASTRO ---------- */
  // Dados da pessoa que a senha NÃO pode conter (nome, e-mail, documento)
  function contextoSenha(id) {
    const v = (chave) => { const e = document.getElementById(`${id}-${chave}`); return e ? e.value.trim() : ""; };
    return { nome: v("nome") + " " + v("resp"), email: v("email"), documento: v("cpf") || v("cnpj") };
  }

  function enviarCadastro(id, form, msg) {
    const tipo = TIPOS[id];
    const pegar = (chave) => document.getElementById(`${id}-${chave}`);
    let primeiroErro = null;
    const erro = (input, texto) => { mostrarErro(input, texto); primeiroErro = primeiroErro || input; };

    for (const c of tipo.campos) {
      if (c.endereco) continue;
      const input = pegar(c.chave), valor = input.value.trim();
      limparErro(input);
      if (c.obrigatorio && !valor) { erro(input, "Campo obrigatório."); continue; }
      if (!valor) continue;
      // Modo teste do adm (conferirDocumentos desligado): só confere o tamanho
      if (c.mascara === "cpf") {
        if (U.soDigitos(valor).length !== 11) erro(input, "CPF incompleto.");
        else if (conferirDocumentos && !U.cpfValido(valor)) erro(input, "CPF inválido. Confira os números.");
      }
      if (c.mascara === "cnpj") {
        if (!/^[0-9A-Z]{12}\d{2}$/.test(U.normalizarCnpj(valor))) erro(input, "CNPJ incompleto.");
        else if (conferirDocumentos && !U.cnpjValido(valor)) erro(input, "CNPJ inválido. Confira os caracteres.");
      }
      if (c.mascara === "tel" && !U.telefoneValido(valor)) erro(input, "Telefone incompleto.");
      if (c.tipo === "email" && !U.emailValido(valor)) erro(input, "E-mail inválido.");
    }

    // Endereço (componentes/endereco)
    const endereco = enderecos[id];
    if (endereco) {
      Object.values(endereco.campos).forEach(limparErro);
      END.validar(endereco.ler(), true, (chave, texto) => erro(endereco.campos[chave], texto));
    }

    // Senha (regra única: componentes/senha)
    const senha = pegar("senha"), senha2 = pegar("senha2");
    if (senha.value) {
      const r = SENHA.avaliar(senha.value, contextoSenha(id));
      if (!r.ok) erro(senha, r.erros[0]);
    }
    if (senha2.value && senha2.value !== senha.value) erro(senha2, "As senhas não conferem.");

    if (primeiroErro) {
      U.mostrarMensagem(msg, "erro", "Confira os campos destacados.");
      primeiroErro.focus();
      return;
    }
    U.limparMensagem(msg);

    // DEMONSTRAÇÃO: não envia nada. Senhas NUNCA são guardadas no navegador.
    if (SD.config.modoDemonstracao) {
      const nome = id === "cpf" ? pegar("nome").value.trim().split(/\s+/)[0] : (pegar("nome").value.trim() || SD_ACESSO_NOME(tipo.perfil));
      senha.value = ""; senha2.value = "";
      entrar(tipo.perfil, nome);
      return;
    }
    criarContaReal(id, form, msg);
  }

  // Monta os dados do perfil (mesmos nomes usados nas páginas de perfil)
  function dadosDoCadastro(id) {
    const tipo = TIPOS[id];
    const v = (chave) => { const e = document.getElementById(`${id}-${chave}`); return e ? e.value.trim() : ""; };
    const autorizou = document.getElementById(`${id}-priv`).checked;
    const dados = {
      tipo: tipo.perfil,
      email: v("email").toLowerCase(),
      senha: document.getElementById(`${id}-senha`).value,
      documento: id === "cpf" ? U.soDigitos(v("cpf")) : U.normalizarCnpj(v("cnpj")),
      telefones: [{ numero: U.soDigitos(v("tel")), principal: true }],
      ...enderecos[id].ler(),
      interruptores: {}
    };
    if (id === "cpf") {
      dados.nome = v("nome");
      dados.compartilharDados = autorizou;           // prestador vê 1º nome e bairro
      dados.compartilharDadosEm = new Date().toISOString();
    } else {
      dados.razaoSocial = v("nome");
      dados.responsavelNome = v("resp");
      dados.autorizacaoExibir = autorizou;           // nome/perfil aparece para prestadores ou nas buscas
    }
    // Botões liga/desliga do cadastro (ex.: "Mostrar meus contatos")
    (tipo.interruptores || []).forEach((idBotao) => {
      const b = document.querySelector(`#cadastro-${id} [data-interruptor="${idBotao}"]`);
      dados.interruptores[idBotao] = b ? b.getAttribute("aria-checked") === "true" : true;
    });
    return dados;
  }

  async function criarContaReal(id, form, msg) {
    const F = await firebase();
    if (!F || !F.ativo) { U.mostrarMensagem(msg, "atencao", "O cadastro ainda não está disponível: o Firebase não foi configurado."); return; }
    const botao = form.querySelector('[type="submit"]');
    botao.disabled = true; botao.setAttribute("aria-busy", "true");
    U.mostrarMensagem(msg, "info", "Criando sua conta…");
    try {
      const dados = dadosDoCadastro(id);
      // Prestador: consulta o CNPJ na Receita (API pública). Só BLOQUEIA CNPJ baixado/inapto/suspenso.
      // O resto (não achou, nome diferente, API fora do ar) entra e fica para o adm conferir antes do selo.
      if (id === "prest") {
        if (conferirDocumentos && window.SDConsultaCnpj) {
          U.mostrarMensagem(msg, "info", "Consultando o CNPJ na Receita Federal…");
          const consulta = await window.SDConsultaCnpj.consultar(dados.documento, dados.razaoSocial);
          if (consulta.resultado === "inativo") {
            botao.disabled = false; botao.removeAttribute("aria-busy");
            const campo = document.getElementById("prest-cnpj");
            const texto = `Este CNPJ está com situação "${consulta.situacao}" na Receita Federal. Só CNPJ ativo pode se cadastrar como prestador.`;
            mostrarErro(campo, texto); campo.focus();
            U.mostrarMensagem(msg, "erro", texto);
            return;
          }
          dados.cnpjConsulta = consulta;
        } else {
          dados.cnpjConsulta = { resultado: "modo-teste", consultadoEm: new Date().toISOString() };
        }
        U.mostrarMensagem(msg, "info", "Criando sua conta…");
      }
      await F.cadastrar(dados);
      document.getElementById(`${id}-senha`).value = "";
      document.getElementById(`${id}-senha2`).value = "";
      // Passo 1 concluído: volta a esta página com o aviso "confirme o e-mail" (passo 2)
      const url = new URL(location.href);
      url.search = "";
      url.searchParams.set("conta", "pendente");
      if (parametros.get("destino")) url.searchParams.set("destino", parametros.get("destino"));
      location.href = url.href;
    } catch (e) {
      botao.disabled = false; botao.removeAttribute("aria-busy");
      const campo = e.code === "auth/email-already-in-use" ? document.getElementById(`${id}-email`)
        : e.code === "DOCUMENTO_EM_USO" ? document.getElementById(`${id}-${id === "cpf" ? "cpf" : "cnpj"}`)
        : (e.code === "auth/weak-password" || e.code === "auth/password-does-not-meet-requirements") ? document.getElementById(`${id}-senha`) : null;
      if (campo) { mostrarErro(campo, F.mensagemErro(e)); campo.focus(); }
      U.mostrarMensagem(msg, "erro", F.mensagemErro(e));
    }
  }

  const SD_ACESSO_NOME = (perfil) => (window.SD_ACESSO ? window.SD_ACESSO.nomePerfil(perfil) : perfil);

  /* ---------- 6. FAZER LOGIN ---------- */
  function enviarLogin(e) {
    e.preventDefault();
    const id = $("#login-id"), senha = $("#login-senha"), msg = $("#msg-login");
    [id, senha].forEach(limparErro);
    U.limparMensagem(msg);
    // MVP: só e-mail (servicos/identificadores.js; CPF/CNPJ voltam depois)
    const identificador = ID.identificar(id.value, SD.config.modoDemonstracao ? undefined : ["email"]);
    if (!id.value.trim()) mostrarErro(id, "Informe seu e-mail.");
    else if (!identificador.valido) mostrarErro(id, "Digite um e-mail válido.");
    if (!senha.value) mostrarErro(senha, "Informe a senha.");
    if (!identificador.valido || !senha.value) {
      U.mostrarMensagem(msg, "erro", "Preencha os campos destacados.");
      (identificador.valido ? senha : id).focus();
      return;
    }
    if (!SD.config.modoDemonstracao) { entrarReal(identificador.valor, senha, msg); return; }
    // Aqui entrará a consulta ao servidor ({ tipo do identificador, valor normalizado, senha }),
    // que devolve o tipo real do usuário. O nome exibido vem do servidor; na demonstração,
    // nunca mostramos o documento: só o e-mail ou o tipo de conta.
    senha.value = "";
    const tipoDemo = $("#login-demo-tipo").value;
    entrar(tipoDemo, identificador.tipo === "email" ? identificador.valor : SD_ACESSO_NOME(tipoDemo));
  }

  // Login REAL (Firebase)
  async function entrarReal(email, senha, msg) {
    const F = await firebase();
    if (!F || !F.ativo) { U.mostrarMensagem(msg, "atencao", "O login ainda não está disponível: o Firebase não foi configurado."); return; }
    const botao = $('#form-login [type="submit"]');
    botao.disabled = true; botao.setAttribute("aria-busy", "true");
    try {
      const r = await F.entrar(email, senha.value, $("#login-manter").checked);
      senha.value = "";
      irParaDestino(r.tipo);
    } catch (e) {
      botao.disabled = false; botao.removeAttribute("aria-busy");
      if (e.code === "EMAIL_NAO_CONFIRMADO") {          // cadastro esperando o e-mail
        senha.value = "";
        U.mostrarMensagem(msg, "atencao", F.mensagemErro(e));
        avisoCadastroPendente();
        return;
      }
      U.mostrarMensagem(msg, "erro", F.mensagemErro(e));
      senha.focus();
    }
  }

  // Leva para o destino pedido (se o tipo de conta puder ver) ou para o início
  function irParaDestino(perfil) {
    const destino = parametros.get("destino");
    const item = SD.config.menu.find((m) => m.id === destino);
    const permitido = item && window.SD_ACESSO && window.SD_ACESSO.pode(perfil, item.id);
    location.href = permitido ? SD.caminho(item.href) : SD.urlPagina("inicio");
  }

  // Guarda a sessão de DEMONSTRAÇÃO e leva para o destino
  function entrar(perfil, nome) {
    if (!SD.config.modoDemonstracao || !SD.sessaoDemo.entrar(perfil, nome)) {
      U.mostrarMensagem($("#aviso"), "atencao", "Login de demonstração desligado.");
      return;
    }
    irParaDestino(perfil);
  }

  /* ---------- 7. ATUALIZA O QUE APARECE ---------- */
  function atualizarTela() {
    $("#btn-abrir-login").setAttribute("aria-expanded", String(estado.loginAberto));
    $("#form-login").hidden = !estado.loginAberto;
    $("#btn-abrir-criar").setAttribute("aria-expanded", String(estado.criarAberto));
    $("#corpo-criar").hidden = !estado.criarAberto;
    $$(".tipo-conta").forEach((b) => b.setAttribute("aria-expanded", String(estado.tipoAberto === b.dataset.tipo)));
    for (const id of Object.keys(TIPOS)) $(`#cadastro-${id}`).hidden = estado.tipoAberto !== id;
  }

  // Já está logado (sessão de demonstração)? Mostra atalhos em vez dos formulários.
  function mostrarJaConectado() {
    if (!SD.logado()) return false;
    const nome = document.body.dataset.nome;
    $("#texto-conectado").textContent = `Conectado como ${SD_ACESSO_NOME(SD.tipoUsuario())}${nome ? ` (${nome})` : ""}. Para entrar com outra conta, saia primeiro.`;
    $("#btn-ir-inicio").href = SD.urlPagina("inicio");
    $("#btn-ir-perfil").href = SD.urlPerfil();
    $("#btn-sair-conta").href = SD.urlPagina("sair");
    $("#ja-conectado").hidden = false;
    $("#login-colunas").hidden = true;
    avisoConfirmarEmail();
    return true;
  }

  // Conta criada agora / e-mail ainda não confirmado → aviso + botão de reenviar
  async function avisoConfirmarEmail() {
    const caixa = $("#aviso-verificacao"), botao = $("#btn-reenviar-verificacao");
    if (parametros.get("conta") === "criada") U.mostrarMensagem($("#aviso"), "sucesso", "Conta criada! Seja bem-vindo(a) à S.D.");
    const F = await firebase();
    if (!F || !F.ativo || await F.emailConfirmado()) return;
    const email = F.emailAtual();
    if (!email) return;
    U.mostrarMensagem(caixa, "atencao", `Enviamos um link de confirmação para ${email}. Abra o e-mail e clique no link (confira também o spam).`);
    botao.hidden = false;
    botao.onclick = async () => {
      botao.disabled = true;
      try { await F.reenviarVerificacao(); U.mostrarMensagem(caixa, "sucesso", `E-mail de confirmação enviado de novo para ${email}.`); }
      catch (e) { U.mostrarMensagem(caixa, "erro", F.mensagemErro(e)); }
      setTimeout(() => { botao.disabled = false; }, 60000);       // espera 1 min para pedir de novo
    };
  }

  // Cadastro esperando o e-mail (passo 2 de 2) → aviso + "Reenviar" + "Já confirmei"
  async function avisoCadastroPendente() {
    const F = await firebase();
    if (!F || !F.ativo || !F.estadoCadastro) return;
    const est = await F.estadoCadastro();
    if (!est.logado || est.perfil || !est.pendente) return;
    const caixa = $("#aviso-verificacao"), botao = $("#btn-reenviar-verificacao");
    U.mostrarMensagem(caixa, "atencao", `Falta 1 passo: enviamos um link para ${est.email}. Abra o e-mail e clique no link para concluir o cadastro (confira também o spam).`);
    botao.hidden = false;
    botao.onclick = async () => {
      botao.disabled = true;
      try { await F.reenviarVerificacao(); U.mostrarMensagem(caixa, "sucesso", `E-mail de confirmação enviado de novo para ${est.email}.`); }
      catch (e) { U.mostrarMensagem(caixa, "erro", F.mensagemErro(e)); }
      setTimeout(() => { botao.disabled = false; }, 60000);       // espera 1 min para pedir de novo
    };
    // "Já cliquei no link" (link aberto em outro aparelho, por exemplo)
    let jaConfirmei = $("#btn-ja-confirmei");
    if (!jaConfirmei) {
      jaConfirmei = document.createElement("button");
      jaConfirmei.type = "button";
      jaConfirmei.className = "link-botao";
      jaConfirmei.id = "btn-ja-confirmei";
      jaConfirmei.textContent = "Já cliquei no link";
      botao.after(jaConfirmei);
    }
    jaConfirmei.onclick = async () => {
      jaConfirmei.disabled = true;
      try {
        const r = await F.concluirCadastro();
        U.mostrarMensagem(caixa, "sucesso", "Cadastro concluído!");
        irParaDestino(r.tipo);
      } catch (e) {
        U.mostrarMensagem(caixa, e.code === "EMAIL_NAO_CONFIRMADO" ? "atencao" : "erro", F.mensagemErro(e));
        jaConfirmei.disabled = false;
      }
    };
  }

  // Abre a parte certa conforme o endereço (links da Home e da NavBar)
  function lerEndereco() {
    if (parametros.get("acao") === "criar-conta") {
      estado.loginAberto = false;          // economiza tela: mostra só o cadastro
      estado.criarAberto = true;
      estado.tipoAberto = PERFIL_URL[parametros.get("perfil")] || null;   // "cliente" sozinho: a pessoa escolhe CPF ou CNPJ
    }
    if (parametros.get("sair") === "1") U.mostrarMensagem($("#aviso"), "sucesso", "Você saiu da sua conta.");
    else if (parametros.has("destino")) U.mostrarMensagem($("#aviso"), "info", "Entre na sua conta para acessar essa área.");
  }

  /* ---------- 8. INÍCIO ---------- */
  function iniciar() {
    // A demonstração (escolher o tipo de conta) só aparece no modo demonstração
    $("#bloco-demo").hidden = !SD.config.modoDemonstracao;
    if (mostrarJaConectado()) return;

    montarCadastros();
    ligarOlho($('[data-alvo="login-senha"]'), $("#login-senha"));
    $("#form-login").addEventListener("submit", enviarLogin);
    $("#login-id").addEventListener("input", (e) => limparErro(e.target));
    $("#login-senha").addEventListener("input", (e) => limparErro(e.target));

    $("#btn-abrir-login").addEventListener("click", () => { estado.loginAberto = !estado.loginAberto; atualizarTela(); });
    $("#btn-abrir-criar").addEventListener("click", () => { estado.criarAberto = !estado.criarAberto; atualizarTela(); });
    // Tipos de conta: clicar abre; clicar no mesmo recolhe; clicar em outro troca
    $$(".tipo-conta").forEach((b) => b.addEventListener("click", () => {
      estado.tipoAberto = estado.tipoAberto === b.dataset.tipo ? null : b.dataset.tipo;
      atualizarTela();
    }));
    // Recuperação de acesso ("Esqueceu a senha/login?"): login-cadastro/recuperacao.js

    lerEndereco();
    atualizarTela();
    avisoCadastroPendente();
    if (parametros.get("acao") === "criar-conta") requestAnimationFrame(() => $("#cartao-criar").scrollIntoView({ block: "start" }));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();
