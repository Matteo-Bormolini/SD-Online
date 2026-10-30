/* =====================================================================
   S.D — ASSISTENTE DO SUPORTE (suporte/assistente.js)
   "Cérebro" do chat. Hoje roda no MODO LOCAL (demonstração): respostas
   fixas e cálculos feitos aqui mesmo, sem internet e sem custo.
   No futuro: trocar CONFIG.modo para "servidor" e informar o endpoint.
   A chave da IA fica SOMENTE no servidor (pasta chaves-api), nunca aqui.
   Regras de comportamento da IA: ver assistente-regras.md.

   Exporta window.SDAssistente = { config, responder(texto), resumir(historico), reiniciar() }
   Cada resposta: { texto, tipo, opcoes? }
     tipo: ok | calculo | esclarecer | ideia | recusa | desconhecido | erro
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. CONFIGURAÇÃO (editar aqui) ---------- */
  const CONFIG = {
    modo: "local",          // "local" (demonstração) | "servidor" (IA real, futuro)
    endpoint: "",           // ex.: "../api/assistente" (POST { mensagens } → { texto, tipo })
    tempoLimiteMs: 15000,   // tempo máximo de espera do servidor
    limiteMensagens: 20,    // mensagens do usuário por conversa (conversa temporária)
    limiteCaracteres: 300   // tamanho máximo de cada mensagem
  };

  /* ---------- 2. MEMÓRIA DA CONVERSA (só na tela; some ao recarregar) ---------- */
  let memoria = { medidas: null, aguardandoIdeia: false };
  let historico = [];       // { autor: "usuario"|"bot", texto, tipo }

  /* ---------- 3. TEXTO E NÚMEROS ---------- */
  // Minúsculas, sem acentos e sem espaços repetidos (facilita comparar palavras)
  const normalizar = (t) => String(t).toLowerCase().normalize("NFD")
    .replace(/[̀-ͯ]/g, "").replace(/\s+/g, " ").trim();

  // Número no padrão brasileiro: "1.250,5" → 1250.5 · "2,5" → 2.5 · "2.5" → 2.5
  function numero(txt) {
    let s = String(txt).trim();
    if (/^\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) s = s.replace(/\./g, "").replace(",", ".");
    else s = s.replace(",", ".");
    const n = Number(s);
    return Number.isFinite(n) ? n : NaN;
  }
  const RE_NUM = /\d+(?:[.,]\d+)*/g;
  // Números da frase, ignorando unidades como m2/m³ (o "2" e o "3" não são medidas)
  const numerosDe = (t) => (t.replace(/m[²³23]\b/g, "m").match(RE_NUM) || []).map(numero).filter((n) => !Number.isNaN(n));
  const fmt = (n) => n.toLocaleString("pt-BR", { maximumFractionDigits: 4 });

  /* ---------- 4. CALCULADORA SEGURA (sem eval) ---------- */
  // Aceita: números, + - * / ^ ( ) e "x" ou "×" como multiplicação
  function calcularExpressao(expr) {
    const s = expr.replace(/(\d|\))\s*[x×]\s*(?=[\d(])/gi, "$1*").replace(/÷/g, "/").replace(/:/g, "/").replace(/\s+/g, "");
    const tokens = s.match(/\d+(?:[.,]\d+)*|[-+*/^()]/g);
    if (!tokens || tokens.join("") !== s) return null;
    let i = 0;
    const ver = () => tokens[i];
    const pegar = () => tokens[i++];
    function soma() {
      let v = produto();
      while (ver() === "+" || ver() === "-") { const op = pegar(); const b = produto(); v = op === "+" ? v + b : v - b; }
      return v;
    }
    function produto() {
      let v = potencia();
      while (ver() === "*" || ver() === "/") {
        const op = pegar(); const b = potencia();
        if (op === "/" && b === 0) throw new Error("divisao-zero");
        v = op === "*" ? v * b : v / b;
      }
      return v;
    }
    function potencia() { const b = unario(); if (ver() === "^") { pegar(); return Math.pow(b, potencia()); } return b; }
    function unario() { if (ver() === "-") { pegar(); return -unario(); } if (ver() === "+") { pegar(); return unario(); } return primario(); }
    function primario() {
      const t = pegar();
      if (t === "(") { const v = soma(); if (pegar() !== ")") throw new Error("parenteses"); return v; }
      const n = numero(t);
      if (Number.isNaN(n)) throw new Error("numero");
      return n;
    }
    const resultado = soma();
    if (i !== tokens.length || !Number.isFinite(resultado)) throw new Error("expressao");
    return resultado;
  }

  /* ---------- 5. CÁLCULOS PARA SERVIÇOS ---------- */
  const N = "(\\d+(?:[.,]\\d+)*)";
  const UNIDADES = { mm: 0.001, milimetro: 0.001, milimetros: 0.001, cm: 0.01, centimetro: 0.01, centimetros: 0.01,
                     m: 1, metro: 1, metros: 1, km: 1000, quilometro: 1000, quilometros: 1000 };
  const RE_UNID = "(mm|cm|km|m|milimetros?|centimetros?|metros?|quilometros?)";

  function tentarCalculo(t) {
    let m;
    // 5.1 Desconto / aumento: "desconto de 10% em 200" · "aumento de 5% sobre 1.000"
    if ((m = t.match(new RegExp("(desconto|abatimento|aumento|acrescimo|reajuste)\\s*(?:de)?\\s*" + N + "\\s*(?:%|por cento)\\D*?" + N)))) {
      const desconto = /desconto|abatimento/.test(m[1]);
      const p = numero(m[2]), v = numero(m[3]);
      const r = desconto ? v * (1 - p / 100) : v * (1 + p / 100);
      return `${fmt(v)} com ${desconto ? "desconto" : "aumento"} de ${fmt(p)}% = ${fmt(r)} (diferença de ${fmt(Math.abs(r - v))})`;
    }
    // 5.2 Porcentagem: "15% de 300"
    if ((m = t.match(new RegExp(N + "\\s*(?:%|por cento)\\s*(?:de|sobre|do|da)\\s*" + N)))) {
      const p = numero(m[1]), v = numero(m[2]);
      return `${fmt(p)}% de ${fmt(v)} = ${fmt((p / 100) * v)}`;
    }
    // 5.3 Quantos % A é de B: "30 e quantos por cento de 120"
    if ((m = t.match(new RegExp(N + "\\s*(?:e|representa)\\s*quant[oa]s?\\s*(?:%|por cento)\\s*de\\s*" + N)))) {
      const a = numero(m[1]), b = numero(m[2]);
      if (b === 0) return "Não é possível calcular porcentagem sobre zero.";
      return `${fmt(a)} é ${fmt((a / b) * 100)}% de ${fmt(b)}`;
    }
    // 5.4 Conversão de medidas: "2,5 m em cm"
    if ((m = t.match(new RegExp(N + "\\s*" + RE_UNID + "\\s*(?:em|para|pra)\\s*" + RE_UNID + "\\b")))) {
      const v = numero(m[1]), de = UNIDADES[m[2]], para = UNIDADES[m[3]];
      if (de && para) return `${fmt(v)} ${m[2]} = ${fmt((v * de) / para)} ${m[3]}`;
    }
    // 5.5 Regra de três: "regra de tres 2 para 10, 5 para x"
    if (/regra de tres/.test(t)) {
      const n = numerosDe(t);
      if (n.length < 3) return { esclarecer: "Para a regra de três, informe 3 valores. Ex.: regra de três 2 para 10, 5 para x." };
      if (n[0] === 0) return "O primeiro valor não pode ser zero.";
      return `Se ${fmt(n[0])} → ${fmt(n[1])}, então ${fmt(n[2])} → ${fmt((n[1] * n[2]) / n[0])}`;
    }
    // 5.6 Geometria (medidas em metros; "cm" é convertido)
    const querArea = /\barea\b|metros? quadrados?|\bm[2²]\b/.test(t);
    const querPerim = /perimetro|contorno|rodape/.test(t);
    const querVol = /volume|metros? cubicos?|\bm[3³]\b|litros/.test(t);
    const circulo = /circul|redond|raio|diametro/.test(t);
    if (querArea || querPerim || querVol) {
      let n = numerosDe(t);
      let aviso = "";
      if (/\bcm\b|centimetro/.test(t) && !/\bm\b|metro/.test(t.replace(/centimetros?/g, ""))) { n = n.map((x) => x / 100); aviso = " (medidas convertidas de cm para m)"; }
      if (circulo) {
        if (!n.length) return { esclarecer: "Informe o raio ou o diâmetro. Ex.: área do círculo raio 2." };
        const r = /diametro/.test(t) ? n[0] / 2 : n[0];
        memoria.medidas = null;
        if (querVol) {
          if (n.length < 2) return { esclarecer: "Para o volume do cilindro, informe raio (ou diâmetro) e altura." };
          const v = Math.PI * r * r * n[1];
          return `Volume do cilindro = ${fmt(v)} m³ (${fmt(v * 1000)} litros)${aviso}`;
        }
        if (querPerim) return `Perímetro do círculo = ${fmt(2 * Math.PI * r)} m${aviso}`;
        return `Área do círculo = ${fmt(Math.PI * r * r)} m²${aviso}`;
      }
      // Continuidade: usa as últimas medidas quando faltar alguma ("e o perímetro?")
      if (memoria.medidas) {
        if (querVol && n.length === 1) n = [memoria.medidas[0], memoria.medidas[1], n[0]];
        else if (!n.length) n = memoria.medidas.slice();
      }
      if (querVol) {
        if (n.length < 3) return { esclarecer: "Para o volume, informe comprimento, largura e altura. Ex.: volume 4 x 3 x 0,1." };
        memoria.medidas = n.slice(0, 3);
        const v = n[0] * n[1] * n[2];
        return `Volume = ${fmt(n[0])} × ${fmt(n[1])} × ${fmt(n[2])} = ${fmt(v)} m³ (${fmt(v * 1000)} litros)${aviso}`;
      }
      if (n.length < 2) return { esclarecer: "Informe as duas medidas. Ex.: área 3 x 4 (em metros)." };
      memoria.medidas = n.slice(0, 2);
      if (querPerim) return `Perímetro = 2 × (${fmt(n[0])} + ${fmt(n[1])}) = ${fmt(2 * (n[0] + n[1]))} m${aviso}`;
      return `Área = ${fmt(n[0])} × ${fmt(n[1])} = ${fmt(n[0] * n[1])} m²${aviso}`;
    }
    // 5.7 Conta direta: "quanto é 25 x 4 + 10", "120/3"
    const expr = t.replace(/^(quanto (e|da|fica)|calcul[ae]r?|resultado de|conta|faz)\s*/, "").replace(/[?=]+$/, "").trim();
    if (/^[\d\s.,+\-*/x×÷:^()]+$/.test(expr) && /\d\s*[-+*/x×÷:^]\s*[\d(]/.test(expr)) {
      try {
        const r = calcularExpressao(expr);
        if (r !== null) return `${expr.replace(/\*/g, "×")} = ${fmt(r)}`;
      } catch (e) {
        if (e.message === "divisao-zero") return "Não é possível dividir por zero.";
      }
    }
    return null;
  }

  /* ---------- 6. BASE DE CONHECIMENTO DA PLATAFORMA ----------
     Somente o que JÁ existe no site. Ao criar recursos novos, atualizar aqui. */
  const PLATAFORMA = [
    { termos: [/o que e (a )?(s\.?d|plataforma|site)/, /como funciona (a )?(plataforma|site|s\.?d)/, /para que serve/],
      resposta: "A S.D conecta clientes (pessoas, empresas e condomínios) a prestadores de serviço, com foco em manutenção. Você encontra o prestador, vê as avaliações e combina o serviço diretamente com ele." },
    { termos: [/cadastr/, /criar (uma |minha )?conta/, /abrir (uma )?conta/, /registrar/],
      resposta: "Clique em “Criar conta” no topo da página e escolha o tipo: Cliente CPF (pessoa), Cliente CNPJ (empresa, condomínio ou MEI) ou Prestador. A senha precisa ter letras e números." },
    { termos: [/(esqueci|perdi|recuperar|redefinir).{0,20}(senha|login)/, /(senha|login).{0,15}(esqueci|perdi)/],
      resposta: "A recuperação de senha ainda está em desenvolvimento. Por enquanto, envie o pedido pelo botão “Dúvidas” acima ou pelos e-mails do suporte." },
    { termos: [/(trocar|mudar|alterar|atualizar).{0,15}senha/],
      resposta: "Entre na conta, clique em “Meu perfil” no topo e use “Editar perfil”. A nova senha precisa ter letras e números." },
    { termos: [/senha (fraca|invalida|nao aceita)/, /(regra|requisito)s? d[ae] senha/, /que senha/],
      resposta: "A senha precisa ter letras e números." },
    { termos: [/\b(entrar|login|logar)\b/, /acessar (a |minha )?conta/],
      resposta: "Clique em “Entrar” no topo e informe seus dados de acesso. Itens do menu com cadeado só ficam disponíveis depois de entrar." },
    { termos: [/(editar|alterar|mudar|atualizar|trocar|corrigir).{0,25}(perfil|dados|telefone|endereco|nome|foto|e-?mail)/],
      resposta: "Entre na conta, clique em “Meu perfil” no topo e use “Editar perfil”." },
    { termos: [/(excluir|apagar|deletar|encerrar|cancelar|remover).{0,15}(minha )?conta/],
      resposta: "Em “Meu perfil” há a opção de excluir a conta. A exclusão pede confirmação antes de ser feita." },
    { termos: [/(ser|virar|tornar|cadastrar como|como ser).{0,15}prestador/, /oferecer (meus )?servic/, /divulgar (meu )?(trabalho|servico)/],
      resposta: "Em “Criar conta”, escolha o tipo “Prestador”. Depois complete seu perfil com serviços e contatos para os clientes encontrarem você." },
    { termos: [/(encontrar|achar|procurar|buscar|localizar|contratar).{0,20}(prestador|profissional|servic|tecnico)/, /como contrat/],
      resposta: "Entre como cliente e use “Para clientes” no menu para localizar prestadores. Veja as avaliações e combine o serviço diretamente com o prestador." },
    { termos: [/\bpag(ar|amento|o)\b/, /\bpix\b/, /cartao/, /boleto/],
      resposta: "A S.D não intermedia pagamentos. Valor e forma de pagamento são combinados diretamente entre cliente e prestador." },
    { termos: [/avalia/, /estrela/],
      resposta: "As avaliações (estrelas) ficam no perfil do prestador e ajudam outros clientes a escolher." },
    { termos: [/reclama/, /denunci/, /problema com (o |a )?(prestador|cliente|servico)/],
      resposta: "O suporte não é canal de reclamação sobre prestadores ou clientes. Trate o serviço diretamente com a outra parte. Erros da plataforma podem ser enviados pelo botão “Dúvidas”." },
    { termos: [/\btema\b/, /modo (escuro|claro|noturno)/],
      resposta: "Use o botão de lua/sol no topo da página para alternar entre tema claro e escuro." },
    { termos: [/aplicativo/, /\bapp\b/, /play store|app store|google play/],
      resposta: "O aplicativo ainda não foi publicado. No rodapé, as lojas aparecem como “Em breve”." },
    { termos: [/privacidade/, /\blgpd\b/, /(meus )?dados pessoais/],
      resposta: "O tratamento de dados segue a Política de Privacidade (link no rodapé). Nunca informe sua senha neste chat ou por e-mail." },
    { termos: [/cadeado/, /(item|menu|pagina).{0,15}bloquead/],
      resposta: "Itens com cadeado exigem login. Entre na sua conta para liberar." },
    { termos: [/falar com (alguem|atendente|humano|pessoa|suporte)/, /atendente/, /e-?mail do suporte/, /\bcontato\b/],
      resposta: "Use os e-mails em “Fale direto com o suporte”, no fim desta página." }
  ];

  function buscarPlataforma(t) {
    let melhor = null, pontos = 0;
    for (const item of PLATAFORMA) {
      const p = item.termos.reduce((s, re) => s + (re.test(t) ? 1 : 0), 0);
      if (p > pontos) { pontos = p; melhor = item; }
    }
    return melhor ? melhor.resposta : null;
  }

  /* ---------- 7. RESPOSTA LOCAL (ordem das verificações importa) ---------- */
  const OPCOES_IDEIA = [
    { acao: "guardar-ideia", texto: "Guardar como sugestão" },
    { acao: "recusar-ideia", texto: "Não, obrigado" }
  ];

  function responderLocal(original) {
    const t = normalizar(original);
    const palavras = t.split(" ").filter(Boolean);

    // 7.1 Aguardando a descrição de uma ideia
    if (memoria.aguardandoIdeia) {
      memoria.aguardandoIdeia = false;
      if (palavras.length >= 3) return { tipo: "ideia", texto: "Entendi a ideia. Quer guardá-la como sugestão de melhoria?", opcoes: OPCOES_IDEIA, ideia: original };
    }
    // 7.2 Links, fotos e áudios
    if (/https?:\/\/|www\.|\.com(\.br)?\b/.test(t)) return { tipo: "recusa", texto: "Por segurança, não abro links. Descreva sua dúvida em texto." };
    if (/\b(link|url)\b/.test(t)) return { tipo: "recusa", texto: "Não envio links. Posso explicar o caminho dentro da plataforma." };
    if (/(envi|mand|ger|mostr|cri)\w*.{0,15}(foto|imagem|desenho|audio|video)/.test(t))
      return { tipo: "recusa", texto: "Ainda não envio nem recebo fotos ou áudios. Esse recurso está em desenvolvimento." };

    // 7.3 Saudações e agradecimentos (mensagens curtas)
    if (palavras.length <= 4 && /^(oi+|ola|bom dia|boa tarde|boa noite|e ai|opa|hello)\b/.test(t))
      return { tipo: "ok", texto: "Olá! Qual é sua dúvida sobre a plataforma ou o cálculo que precisa fazer?" };
    if (palavras.length <= 5 && /^(obrigad|valeu|vlw|agradec|ok obrigad)/.test(t))
      return { tipo: "ok", texto: "Por nada. Se precisar, é só perguntar." };

    // 7.4 Cálculos
    const calc = tentarCalculo(t);
    if (calc && typeof calc === "object" && calc.esclarecer) return { tipo: "esclarecer", texto: calc.esclarecer };
    if (calc) return { tipo: "calculo", texto: calc };

    // 7.5 Preços e comparativos (não faz)
    if (/(preco|precos|quanto custa|quanto cobra|quanto vale|mais barat|comparar|comparativo|valor medio|valor de mercado|orcamento medio)/.test(t))
      return { tipo: "recusa", texto: "Não informo nem comparo preços. O valor é combinado com o prestador. Posso calcular quantidades (área, volume) para ajudar no orçamento." };

    // 7.6 Ideias e sugestões para a plataforma
    if (/(sugest|ideia|melhoria|seria (bom|legal|util|interessante)|poderia(m)? ter|deveria(m)? ter|gostaria que (tivesse|a plataforma|o site))/.test(t)) {
      if (palavras.length <= 4) { memoria.aguardandoIdeia = true; return { tipo: "esclarecer", texto: "Pode descrever sua ideia em uma ou duas frases?" }; }
      return { tipo: "ideia", texto: "Entendi a ideia. Quer guardá-la como sugestão de melhoria?", opcoes: OPCOES_IDEIA, ideia: original };
    }

    // 7.7 Dúvidas da plataforma
    const resposta = buscarPlataforma(t);
    if (resposta) return { tipo: "ok", texto: resposta };

    // 7.8 Pedidos de cálculo sem dados suficientes
    if (/(calcul|geometria|matematica|conta|medida|quantidade)/.test(t) || (numerosDe(t).length && palavras.length <= 6))
      return { tipo: "esclarecer", texto: "O que deseja calcular? Exemplos: área 3 x 4 · volume 4 x 3 x 0,1 · 15% de 200 · 2,5 m em cm · regra de três 2 para 10, 5 para x." };

    // 7.9 Mensagem curta demais para entender
    if (palavras.length <= 2) return { tipo: "esclarecer", texto: "Não entendi. Pode explicar com mais detalhes o que precisa?" };

    // 7.10 Fora do conhecimento
    return { tipo: "desconhecido", texto: "Ainda não tenho conhecimento sobre esse assunto, então não posso passar essa informação." };
  }

  /* ---------- 8. RESPOSTA PELO SERVIDOR (futuro) ---------- */
  async function responderServidor() {
    const controle = new AbortController();
    const espera = setTimeout(() => controle.abort(), CONFIG.tempoLimiteMs);
    try {
      const r = await fetch(CONFIG.endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagens: historico.map(({ autor, texto }) => ({ autor, texto })) }),
        signal: controle.signal
      });
      if (!r.ok) throw new Error("http " + r.status);
      const dados = await r.json();
      return { tipo: dados.tipo || "ok", texto: String(dados.texto || "").slice(0, 1000), opcoes: dados.opcoes };
    } catch (e) {
      return { tipo: "erro", texto: "Assistente indisponível no momento. Use os botões “Dúvidas” ou “Sugestões”." };
    } finally {
      clearTimeout(espera);
    }
  }

  /* ---------- 9. FUNÇÕES PÚBLICAS ---------- */
  async function responder(texto) {
    const limpo = String(texto).trim().slice(0, CONFIG.limiteCaracteres);
    historico.push({ autor: "usuario", texto: limpo });
    const r = CONFIG.modo === "servidor" && CONFIG.endpoint ? await responderServidor() : responderLocal(limpo);
    historico.push({ autor: "bot", texto: r.texto, tipo: r.tipo });
    return r;
  }

  // Resumo da conversa para "Sobre a plataforma".
  //   resumo      → aparece para o usuário e vai para a equipe
  //   necessidade → só para a equipe (o que o cliente precisa)
  //   melhoria    → só para a equipe (possível melhoria)
  // No modo servidor, a IA deverá gerar esse resumo analisando a conversa;
  // aqui ele é montado a partir do tipo de cada resposta.
  const ASSUNTO_POR_TIPO = {
    ok: "dúvidas sobre a plataforma", calculo: "cálculos", ideia: "ideias de melhoria",
    esclarecer: "perguntas que precisaram de mais detalhes", recusa: "pedidos fora das regras (preços, links ou fotos)",
    desconhecido: "assuntos que o assistente ainda não conhece", erro: "falha do assistente"
  };
  const citar = (t) => `“${t.length > 160 ? t.slice(0, 157) + "…" : t}”`;

  function resumir() {
    const usuario = historico.filter((m) => m.autor === "usuario");
    if (!usuario.length) return null;
    const semResposta = [];
    const assuntos = [];
    historico.forEach((m, i) => {
      if (m.autor !== "bot") return;
      const a = ASSUNTO_POR_TIPO[m.tipo];
      if (a && !assuntos.includes(a)) assuntos.push(a);
      if ((m.tipo === "desconhecido" || m.tipo === "erro") && historico[i - 1]) semResposta.push(historico[i - 1].texto);
    });
    const lista = assuntos.length > 1 ? assuntos.slice(0, -1).join(", ") + " e " + assuntos[assuntos.length - 1] : (assuntos[0] || "assuntos diversos");
    const qtd = usuario.length === 1 ? "1 mensagem" : `${usuario.length} mensagens`;
    const ultimaDuvida = semResposta[semResposta.length - 1];
    return {
      resumo: `Conversa com ${qtd} sobre ${lista}.` +
        (ultimaDuvida ? ` O assistente não soube responder: ${citar(ultimaDuvida)}.` : " O assistente respondeu às mensagens."),
      necessidade: citar(ultimaDuvida || usuario[usuario.length - 1].texto),
      melhoria: ultimaDuvida
        ? `Incluir na plataforma/assistente informações sobre ${citar(ultimaDuvida)}.`
        : "Avaliar se as respostas do assistente atenderam o cliente."
    };
  }

  function reiniciar() {
    historico = [];
    memoria = { medidas: null, aguardandoIdeia: false };
  }

  window.SDAssistente = Object.freeze({
    config: CONFIG,
    responder, resumir, reiniciar,
    totalUsuario: () => historico.filter((m) => m.autor === "usuario").length,
    _teste: { calcularExpressao, responderLocal, normalizar }   // usado só nos testes
  });
})();
