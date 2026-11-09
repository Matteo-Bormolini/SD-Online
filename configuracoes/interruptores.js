/* =====================================================================
   S.D — LISTA ÚNICA DOS BOTÕES LIGA/DESLIGA (configuracoes/interruptores.js)
   PADRÃO DO SITE (09/11/2026):
     - TODO botão liga/desliga do site está cadastrado AQUI.
     - Desligado = cinza escuro · Ligado = vinho (cor do site).
     - Para ver a lista em forma de tabela: página interruptores/ (só adm).
   Para mudar o PADRÃO de um botão (como ele começa numa conta nova),
   troque "padrao: true/false" abaixo. O servidor usará esta mesma lista.

   Campos:
     nome     → texto que aparece ao lado do botão
     oQueFaz  → explicação simples (aparece na página interruptores/)
     ligado   → o que acontece quando está LIGADO
     desligado→ o que acontece quando está DESLIGADO
     padrao   → true = começa ligado · false = começa desligado
     quem     → tipos de conta que têm este botão
     onde     → em que página/lugar ele fica
     situacao → "ativo" (já na tela) ou "planejado" (ainda não criado)
     avisoDesligado → (opcional) aviso que aparece embaixo do botão quando ele está DESLIGADO
   ===================================================================== */
(function () {
  "use strict";

  const LISTA = {
    "localizacao": {
      nome: "Localização",
      oQueFaz: "Usa o endereço do cadastro para calcular distâncias e mostrar no mapa.",
      ligado: "Prestador aparece no mapa e na lista por proximidade. Cliente vê os prestadores do mais perto ao mais longe.",
      desligado: "Prestador não aparece em mapas nem listas. Cliente vê a lista em ordem alfabética.",
      padrao: true,
      quem: ["cliente-cpf", "cliente-cnpj", "prestador"],
      onde: "Meu perfil — linha das abas, à direita",
      situacao: "ativo"
    },
    "mostrar-contatos": {
      nome: "Mostrar meus contatos",
      oQueFaz: "Mostra telefone, WhatsApp e e-mail aos clientes que entram no perfil do prestador. (Clientes CPF/CNPJ não têm este botão: o contato deles nunca aparece; quem libera contato é o prestador.)",
      ligado: "Quem entra no seu perfil vê os contatos (prestador: botões WhatsApp e Ligar funcionam, também na busca).",
      desligado: "Contatos escondidos. Eles só são liberados depois do orçamento, quando você autorizar.",
      padrao: true,
      quem: ["prestador"],
      onde: "Cadastro do Prestador e Meu perfil (Prestador) — linha das abas, à direita",
      situacao: "ativo",
      avisoDesligado: "Com os contatos escondidos, fica mais difícil o cliente falar com você antes do orçamento. Muitos clientes preferem prestadores que mostram o contato."
    },
    "compartilhar-dados-cpf": {
      nome: "Mostrar meus dados aos prestadores",
      oQueFaz: "Mostra seu primeiro nome e bairro aos prestadores com quem você negocia.",
      ligado: "Prestador vê primeiro nome e bairro.",
      desligado: "Prestador vê só a região aproximada.",
      padrao: false,
      quem: ["cliente-cpf"],
      onde: "Meu perfil (Cliente CPF) — bloco Privacidade",
      situacao: "ativo"
    },
    "tema-escuro": {
      nome: "Tema escuro",
      oQueFaz: "Troca as cores do site para o modo escuro. A escolha fica salva entre as páginas.",
      ligado: "Site escuro.",
      desligado: "Site claro (padrão).",
      padrao: false,
      quem: ["visitante", "cliente-cpf", "cliente-cnpj", "prestador", "adm"],
      onde: "Barra do menu (ícone de lua/sol)",
      situacao: "ativo"
    },
    "destaque": {
      nome: "Destaque",
      oQueFaz: "Marca o prestador como destaque (contorno vermelho e etiqueta). Assinatura mensal, cancelável.",
      ligado: "Prestador aparece com contorno vermelho e a etiqueta \"Destaque\".",
      desligado: "Prestador aparece normal.",
      padrao: false,
      quem: ["adm"],
      onde: "Página do administrador (US44)",
      situacao: "planejado"
    }
  };

  /* ---------- Memória da DEMONSTRAÇÃO ----------
     Guarda a escolha só nesta aba (sessionStorage) para outras páginas
     lerem (ex.: Localizar prestador lê "localizacao").
     Na versão final quem guarda é o servidor. */
  const CHAVE = "sd-interruptores-demo";
  const lerTudo = () => { try { return JSON.parse(sessionStorage.getItem(CHAVE) || "{}"); } catch (_) { return {}; } };

  function ler(id) {
    const salvo = lerTudo()[id];
    if (typeof salvo === "boolean") return salvo;
    return LISTA[id] ? LISTA[id].padrao : false;
  }
  function gravar(id, ligado) {
    const tudo = lerTudo();
    tudo[id] = !!ligado;
    try { sessionStorage.setItem(CHAVE, JSON.stringify(tudo)); } catch (_) { /* sem armazenamento: só vale nesta tela */ }
  }

  window.SD_INTERRUPTORES = Object.freeze({ LISTA, ler, gravar });
})();

/* ---------- LIGAR OS BOTÕES DA PÁGINA ----------
   Qualquer página pode ter um botão assim (o resto é montado aqui):
     <button type="button" class="interruptor" data-interruptor="localizacao"></button>
   SD_INTERRUPTORES_LIGAR(raiz) liga todos dentro de "raiz" (padrão: a página).
   A cada troca dispara o evento "sd:interruptor" { id, ligado } no document. */
(function () {
  "use strict";
  const R = window.SD_INTERRUPTORES;
  if (!R) return;

  function montar(botao) {
    const id = botao.dataset.interruptor;
    const item = R.LISTA[id];
    if (!item) { console.error("[S.D] interruptor sem cadastro em configuracoes/interruptores.js:", id); return; }
    botao.type = "button";
    botao.setAttribute("role", "switch");
    botao.title = item.oQueFaz;
    if (!botao.querySelector(".interruptor-trilho")) {
      botao.innerHTML =
        '<span class="interruptor-trilho" aria-hidden="true"><span class="interruptor-bola"></span></span>' +
        '<span class="interruptor-texto"></span><span class="interruptor-estado" aria-hidden="true"></span>';
      botao.querySelector(".interruptor-texto").textContent = item.nome;
    }
    // Aviso que aparece embaixo do botão quando ele está desligado (se o cadastro tiver)
    let aviso = null;
    if (item.avisoDesligado) {
      aviso = document.createElement("p");
      aviso.className = "mensagem atencao interruptor-aviso";
      aviso.setAttribute("role", "status");
      aviso.textContent = item.avisoDesligado;
      botao.insertAdjacentElement("afterend", aviso);
    }
    const pintar = (ligado) => {
      botao.setAttribute("aria-checked", String(ligado));
      botao.querySelector(".interruptor-estado").textContent = ligado ? "Ligado" : "Desligado";
      if (aviso) aviso.hidden = ligado;
    };
    pintar(R.ler(id));
    botao.addEventListener("click", () => {
      const ligado = botao.getAttribute("aria-checked") !== "true";
      pintar(ligado);
      R.gravar(id, ligado);
      document.dispatchEvent(new CustomEvent("sd:interruptor", { detail: { id, ligado, item } }));
    });
  }

  window.SD_INTERRUPTORES_LIGAR = (raiz = document) =>
    raiz.querySelectorAll("button.interruptor[data-interruptor]").forEach(montar);
})();
