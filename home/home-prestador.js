/* =====================================================================
   S.D — HOME DO PRESTADOR (home/home-prestador.js) · v0.8.2
   Conceito interno (não aparece na tela): COMUNIDADE E NETWORKING PROFISSIONAL.
   Página só INFORMATIVA e de divulgação. NÃO é painel: contatos, orçamentos,
   serviços e dados da empresa continuam no Perfil do prestador (não duplicar).

   Seções (cada uma só aparece quando tem conteúdo publicado):
     1. Comunicados da S.D (discreta) — comunicados para TODOS os usuários (v0.8.5)
     2. Divulgações — comunicados só para prestadores (todos ou da área) (v0.8.5)
     3. Agenda de eventos (principal) — gerais e da área do prestador
     4. Grupos e comunidades — links externos (WhatsApp, Instagram…)

   De onde vêm os dados: firebase/divulgacoes.js (window.SDDivulgacoes).
   Este arquivo NÃO fala com o banco. Sem dados fictícios.
   Depende de: configuracoes/config.js (SD) e componentes/utilidades (SDUtil.ligarPopup).
   Uso (home/home.js): SDHomePrestador.montar(elemento, ", Nome")
   Prévia do adm (v0.8.5, "Ver como"): montar(elemento, nome, { carregar: () => dados, previa: true })
     → a prévia SEMPRE lê o banco na hora (sem cache) e, se falhar, mostra o motivo na tela.
   ===================================================================== */
(function () {
  "use strict";
  if (!window.SD) { console.error("[S.D] home-prestador.js: carregue configuracoes/config.js antes."); return; }
  const SD = window.SD;

  // Prefixo dos ids do bloco que está sendo desenhado (a Home do adm tem 2 blocos: "hp" e "hc")
  let PREF = "hp";

  /* ---------- 1. TEXTOS E AJUSTES ← MUDE AQUI ---------- */
  const TEXTO = {
    subtitulo: "Eventos, grupos e novidades para o seu trabalho.",
    carregando: "Carregando eventos e comunidades…",
    vazio: "Ainda não há eventos, grupos ou comunicados para a sua área. Quando a S.D publicar, eles aparecem aqui.",
    erro: "Não foi possível carregar os eventos e comunidades agora.",
    // v0.8.5: a leitura nova falhou, mas há uma leitura anterior na tela
    atualizarFalhou: "Não foi possível atualizar agora. Mostrando a última leitura.",
    externo: "abre outro site",
    // v0.8.5: Home dos clientes (mesmo visual da Home do prestador)
    carregandoCliente: "Carregando comunicados…",
    vazioCliente: "Nenhum comunicado no momento.",
    erroCliente: "Não foi possível carregar os comunicados agora.",
    // v0.8.5: prévia do adm ("Ver como") — motivo do erro na tela
    erroPrevia: "Não foi possível carregar a prévia agora.",
    motivo: {
      "conta-errada": "Neste navegador, o Firebase está conectado com outra conta (não adm). Isso acontece quando uma conta cliente ou prestador entra em outra aba. Clique em Sair, entre de novo como adm e volte ao Início.",
      "sem-login": "O login do adm expirou neste navegador. Clique em Sair e entre de novo como adm.",
      "sem-modulo": "O arquivo do banco (firebase/divulgacoes.js) não carregou. Aperte Ctrl+Shift+R para recarregar.",
      "sem-permissao": "O banco recusou a leitura (permissão negada). Confira se as regras v0.8.5 estão publicadas.",
      "sem-internet": "Sem conexão com o banco. Confira a internet e tente de novo.",
      "outro": "Erro inesperado. Detalhe técnico no Console (F12)."
    }
  };
  // Erro → motivo (texto acima)
  function motivoErro(e) {
    if (!e) return "outro";
    if (e.motivo === "sem-login") return "sem-login";
    if (e.motivo) return "conta-errada";                       // conta-cliente-cpf, conta-prestador…
    if (e.message === "sem-modulo") return "sem-modulo";
    if (e.code === "permission-denied") return "sem-permissao";
    if (e.code === "unavailable" || e.code === "deadline-exceeded") return "sem-internet";
    return "outro";
  }
  const ESPERA_MAX_MS = 15000;   // tempo máximo esperando o módulo do banco
  const LIMITE_RESUMO = 160;     // caracteres do resumo nos cartões

  /* ---------- 2. ÍCONES (traço, cor herdada) ---------- */
  const P = {
    calendario: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    relogio:    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    local:      '<path d="M12 21s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12Z"/><circle cx="12" cy="9" r="2.5"/>',
    online:     '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    externo:    '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    esquerda:   '<path d="m15 18-6-6 6-6"/>',
    direita:    '<path d="m9 18 6-6-6-6"/>',
    pessoas:    '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 20a6.5 6.5 0 0 0-2.5-5.1"/>',
    aviso:      '<path d="M12 3 2 21h20L12 3Z"/><path d="M12 10v5M12 18h.01"/>',
    info:       '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    megafone:   '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z"/><path d="M15 9a4 4 0 0 1 0 6M18 6.5a8 8 0 0 1 0 11"/>',
    // Redes: ícones simples e genéricos (o nome da rede sempre aparece escrito ao lado)
    whatsapp:   '<path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.4 8.4 0 1 1 21 11.5Z"/>',
    telegram:   '<path d="m21 4-18 7 6 2 2 6 3-4 5 4 2-15Z"/><path d="m9 13 8-6"/>',
    instagram:  '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><path d="M17.5 6.5h.01"/>',
    facebook:   '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M15 8h-2a2 2 0 0 0-2 2v11M9 13h5"/>',
    youtube:    '<rect x="2.5" y="5" width="19" height="14" rx="4"/><path d="m10 9 5 3-5 3V9Z"/>',
    linkedin:   '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7h.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>',
    site:       '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'
  };
  const icone = (nome) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${P[nome] || ""}</svg>`;
  const NOME_REDE = { whatsapp: "WhatsApp", telegram: "Telegram", instagram: "Instagram", facebook: "Facebook", youtube: "YouTube", linkedin: "LinkedIn", site: "Site" };
  const MODALIDADE = { presencial: "Presencial", online: "Online", hibrido: "Híbrido (presencial e online)" };
  const ESTACIONAMENTO = { gratuito: "Gratuito", pago: "Pago", nao: "Não tem" };

  /* ---------- 3. UTILITÁRIOS ---------- */
  const esc = SD.esc;
  const resumo = (t, max = LIMITE_RESUMO) => (t.length > max ? t.slice(0, max).replace(/\s+\S*$/, "") + "…" : t);
  const iniciais = SD.iniciais;
  const dominio = (url) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch (_) { return ""; } };
  // Imagem: arquivo do site (caminho a partir da raiz) ou imagem em texto (data:)
  const srcImagem = (v) => (!v ? "" : v.startsWith("data:") ? v : SD.caminho(v));
  // "2026-12-05" → Date local (sem mudar o dia pelo fuso)
  const paraData = (iso) => { const [a, m, d] = iso.split("-").map(Number); return new Date(a, m - 1, d); };
  const fmt = (iso, op) => paraData(iso).toLocaleDateString("pt-BR", op);
  function textoData(e) {
    const ini = fmt(e.data, { weekday: "short", day: "2-digit", month: "short" });
    const fim = e.dataFim && e.dataFim !== e.data ? " a " + fmt(e.dataFim, { weekday: "short", day: "2-digit", month: "short" }) : "";
    return (ini + fim).replace(/\./g, "");
  }
  const textoHora = (e) => (e.horaInicio ? e.horaInicio + (e.horaFim ? "–" + e.horaFim : "") : "");
  const lugar = (i) => [i.cidade, i.uf].filter(Boolean).join("/");

  // Etiqueta do público: geral ou da área do prestador
  function etiquetaPublico(i) {
    const ex = i.exemplo ? `<span class="hp-tag hp-tag-exemplo">Exemplo ilustrativo</span>` : "";   // v0.8.3: criado pelo adm só para visualizar
    return ex + etiquetaPublicoSo(i);
  }
  function etiquetaPublicoSo(i) {
    if (i.publico === "atividades") {
      // Mostra a 1ª atividade que combina; as outras viram "+N" (lista completa no title e no leitor de tela)
      const lista = i.paraMim && i.paraMim.length ? i.paraMim : i.atividades;
      const extra = lista.length > 1 ? ` +${lista.length - 1}` : "";
      return `<span class="hp-tag hp-tag-area" title="${esc(lista.join(", "))}"><span class="visualmente-oculto">Público: </span>Para a sua área · ${esc(lista[0])}<span aria-hidden="true">${extra}</span>${extra ? `<span class="visualmente-oculto"> e também ${esc(lista.slice(1).join(", "))}</span>` : ""}</span>`;
    }
    if (i.publico === "todos") return `<span class="hp-tag"><span class="visualmente-oculto">Público: </span>Todos os usuários</span>`;
    return `<span class="hp-tag"><span class="visualmente-oculto">Público: </span>Todos os prestadores</span>`;
  }
  // Link externo seguro (nova aba, sem acesso à página da S.D)
  const linkExterno = (url, rotulo, classe = "btn btn-pequeno", ic = "externo") =>
    `<a class="${classe}" href="${esc(url)}" target="_blank" rel="noopener noreferrer external">${icone(ic)}<span>${esc(rotulo)}</span><span class="visualmente-oculto"> (${TEXTO.externo}: ${esc(dominio(url))})</span></a>`;

  /* ---------- 4. CARTÕES ---------- */
  function cartaoComunicado(c) {
    const longo = c.descricao.length > LIMITE_RESUMO || c.link;
    return `
      <li><article class="hp-cartao hp-comunicado${c.nivel === "atencao" ? " hp-atencao" : ""}" aria-labelledby="${PREF}-t-${esc(c.id)}">
        <p class="hp-linha-topo">
          <span class="hp-nivel">${icone(c.nivel === "atencao" ? "aviso" : "info")}${c.nivel === "atencao" ? "Importante" : "Comunicado"}</span>${c.exemplo ? ' <span class="hp-tag hp-tag-exemplo">Exemplo</span>' : ""}
        </p>
        ${c.data ? `<p class="hp-data"><time datetime="${esc(c.data)}">${esc(fmt(c.data, { day: "2-digit", month: "short", year: "numeric" }).replace(/\./g, ""))}</time></p>` : ""}
        <h3 id="${PREF}-t-${esc(c.id)}">${esc(c.titulo)}</h3>
        ${c.descricao ? `<p class="hp-texto">${esc(resumo(c.descricao))}</p>` : ""}
        ${longo ? `<button type="button" class="btn btn-pequeno" data-detalhe="${esc(c.id)}">Ler mais<span class="visualmente-oculto">: ${esc(c.titulo)}</span></button>` : ""}
      </article></li>`;
  }

  // v0.8.5: Divulgações (comunicado só para prestadores) = cartão de comunicado + etiqueta do público
  function cartaoDivulgacao(c) {
    return cartaoComunicado(c).replace('<h3 id=', `<p class="hp-etiquetas">${etiquetaPublicoSo(c)}</p>\n        <h3 id=`);
  }

  function cartaoEvento(e) {
    const capa = e.imagem
      ? `<img class="hp-capa" src="${esc(srcImagem(e.imagem))}" alt="" loading="lazy" decoding="async">`
      : `<div class="hp-capa hp-capa-data" aria-hidden="true"><strong>${esc(fmt(e.data, { day: "2-digit" }))}</strong><span>${esc(fmt(e.data, { month: "short" }).replace(".", ""))}</span></div>`;
    const ondeTxt = e.modalidade === "online" ? "Online" : [e.localNome, lugar(e)].filter(Boolean).join(" · ");
    return `
      <li><article class="hp-cartao hp-evento" aria-labelledby="${PREF}-t-${esc(e.id)}">
        ${capa}
        <div class="hp-corpo">
          <p class="hp-etiquetas">${etiquetaPublico(e)}</p>
          <h3 id="${PREF}-t-${esc(e.id)}">${esc(e.titulo)}</h3>
          ${e.subtitulo ? `<p class="hp-sub">${esc(e.subtitulo)}</p>` : ""}
          <ul class="hp-meta">
            <li>${icone("calendario")}<span><time datetime="${esc(e.data)}">${esc(textoData(e))}</time>${textoHora(e) ? ` · ${esc(textoHora(e))}` : ""}</span></li>
            ${ondeTxt ? `<li>${icone(e.modalidade === "online" ? "online" : "local")}<span>${esc(ondeTxt)}</span></li>` : ""}
          </ul>
          <button type="button" class="btn btn-pequeno hp-acao" data-detalhe="${esc(e.id)}">Ver detalhes<span class="visualmente-oculto"> de ${esc(e.titulo)}</span></button>
        </div>
      </article></li>`;
  }

  function cartaoGrupo(g) {
    const logo = g.imagem
      ? `<img class="hp-logo" src="${esc(srcImagem(g.imagem))}" alt="" width="56" height="56" loading="lazy" decoding="async">`
      : `<span class="hp-logo" aria-hidden="true">${esc(iniciais(g.titulo))}</span>`;
    const redes = Object.entries(g.redes).map(([r, url]) =>
      `<li>${linkExterno(url, NOME_REDE[r] || r, "btn btn-pequeno hp-rede", r)}</li>`).join("");
    const regiao = g.regiao || lugar(g);
    return `
      <li><article class="hp-cartao hp-grupo" aria-labelledby="${PREF}-t-${esc(g.id)}">
        <div class="hp-corpo">
          <div class="hp-grupo-topo">${logo}<div><h3 id="${PREF}-t-${esc(g.id)}">${esc(g.titulo)}</h3>${regiao ? `<p class="hp-sub">${icone("local")}${esc(regiao)}</p>` : ""}</div></div>
          <p class="hp-etiquetas">${etiquetaPublico(g)}</p>
          ${g.descricao ? `<p class="hp-texto">${esc(resumo(g.descricao, 140))}</p>` : ""}
          ${redes ? `<ul class="hp-redes" aria-label="Canais de ${esc(g.titulo)} (links externos)">${redes}</ul>` : ""}
          ${g.descricao.length > 140 || g.link ? `<button type="button" class="btn btn-pequeno hp-acao" data-detalhe="${esc(g.id)}">Ver detalhes<span class="visualmente-oculto"> de ${esc(g.titulo)}</span></button>` : ""}
        </div>
      </article></li>`;
  }

  // v0.8.5: anúncio (Home dos clientes) — sempre com a etiqueta "Anúncio"
  function cartaoAnuncio(a) {
    // Sem imagem: capa padrão do mesmo tamanho (cartões iguais lado a lado)
    const capa = a.imagem ? `<img class="hp-capa" src="${esc(srcImagem(a.imagem))}" alt="" loading="lazy" decoding="async">`
      : `<div class="hp-capa hp-capa-anuncio" aria-hidden="true">${icone("megafone")}<span>${esc(a.organizador || "Anúncio")}</span></div>`;
    return `
      <li><article class="hp-cartao hp-anuncio" aria-labelledby="${PREF}-t-${esc(a.id)}">
        ${capa}
        <div class="hp-corpo">
          <p class="hp-etiquetas"><span class="hp-tag hp-tag-anuncio">Anúncio</span>${a.exemplo ? '<span class="hp-tag hp-tag-exemplo">Exemplo ilustrativo</span>' : ""}</p>
          <h3 id="${PREF}-t-${esc(a.id)}">${esc(a.titulo)}</h3>
          ${a.organizador ? `<p class="hp-sub">Anunciante: ${esc(a.organizador)}</p>` : ""}
          ${a.descricao ? `<p class="hp-texto">${esc(resumo(a.descricao, 140))}</p>` : ""}
          ${a.link ? linkExterno(a.link, a.linkTexto || "Saiba mais", "btn btn-pequeno hp-acao") : ""}
        </div>
      </article></li>`;
  }

  /* ---------- 5. SEÇÃO COM FAIXA ROLANTE (toque, setas e teclado) ---------- */
  function secao(id, titulo, classe, itens, montarCartao, rotuloLista) {
    if (!itens.length) return "";
    id = id.replace(/^hp-/, PREF + "-");
    return `
      <section class="hp-secao ${classe}" aria-labelledby="${id}-titulo">
        <div class="hp-secao-topo">
          <h2 id="${id}-titulo" class="hp-secao-titulo">${titulo}</h2>
          <div class="hp-setas" hidden>
            <button type="button" class="btn btn-icone btn-seta" data-rolar="-1" aria-label="Anteriores: ${esc(titulo)}" aria-controls="${id}-lista">${icone("esquerda")}</button>
            <button type="button" class="btn btn-icone btn-seta" data-rolar="1" aria-label="Próximos: ${esc(titulo)}" aria-controls="${id}-lista">${icone("direita")}</button>
          </div>
        </div>
        <ul class="hp-faixa" id="${id}-lista" tabindex="0" aria-label="${esc(rotuloLista)} (${itens.length}). Role para o lado ou use as setas do teclado.">
          ${itens.map(montarCartao).join("")}
        </ul>
      </section>`;
  }

  const suave = () => (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");
  function ligarFaixa(sec) {
    const lista = sec.querySelector(".hp-faixa");
    const caixaSetas = sec.querySelector(".hp-setas");
    const [ant, prox] = sec.querySelectorAll("[data-rolar]");
    // v0.8.5 (25/11): seção sem faixa (ex.: "Comunicados da S.D" VAZIA do cliente) não tem setas.
    // Antes dava erro aqui e a leitura nova do banco NUNCA acontecia (a tela ficava com a leitura vazia guardada).
    if (!lista || !caixaSetas || !ant || !prox) return;
    const passo = () => { const c = lista.querySelector("li"); return c ? c.getBoundingClientRect().width + 16 : lista.clientWidth * 0.9; };
    const rolar = (dir) => lista.scrollBy({ left: dir * passo(), behavior: suave() });   // 1 cartão
    const atualizar = () => {
      const max = lista.scrollWidth - lista.clientWidth - 2;
      caixaSetas.hidden = max <= 0;                         // cabe tudo → sem setas
      ant.disabled = lista.scrollLeft <= 2;
      prox.disabled = lista.scrollLeft >= max;
    };
    [ant, prox].forEach((b) => b.addEventListener("click", () => lista.scrollBy({ left: Number(b.dataset.rolar) * lista.clientWidth * 0.9, behavior: suave() })));
    // Teclado na lista: ← → um cartão · Home/End início e fim
    lista.addEventListener("keydown", (ev) => {
      if (ev.target !== lista) return;
      if (ev.key === "ArrowRight") { ev.preventDefault(); rolar(1); }
      else if (ev.key === "ArrowLeft") { ev.preventDefault(); rolar(-1); }
      else if (ev.key === "Home") { ev.preventDefault(); lista.scrollTo({ left: 0, behavior: suave() }); }
      else if (ev.key === "End") { ev.preventDefault(); lista.scrollTo({ left: lista.scrollWidth, behavior: suave() }); }
    });
    lista.addEventListener("scroll", atualizar, { passive: true });
    window.addEventListener("resize", atualizar);
    atualizar();
  }

  /* ---------- 6. DETALHES (pop-up, sem página nova) ---------- */
  function linhaDet(rotulo, valor) { return valor ? `<div><dt>${esc(rotulo)}</dt><dd>${valor}</dd></div>` : ""; }
  function conteudoDetalhe(i) {
    const capa = i.imagem && i.tipo === "evento" ? `<img class="hp-modal-capa" src="${esc(srcImagem(i.imagem))}" alt="">` : "";
    const desc = i.descricao ? `<div class="hp-modal-texto">${i.descricao.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, "<br>")}</p>`).join("")}</div>` : "";
    let dados = "";
    if (i.tipo === "evento") {
      const buffet = i.buffet === true ? "Sim" + (i.buffetEmpresa ? ` — ${esc(i.buffetEmpresa)}` : "") : i.buffet === false ? "Não" : "";
      const estac = i.estacionamento ? esc(ESTACIONAMENTO[i.estacionamento]) + (i.estacionamentoObs ? ` — ${esc(i.estacionamentoObs)}` : "") : "";
      dados = `<dl class="hp-dados">
        ${linhaDet("Data", esc(textoData(i)))}
        ${linhaDet("Horário", esc(textoHora(i)))}
        ${linhaDet("Modalidade", esc(MODALIDADE[i.modalidade] || ""))}
        ${linhaDet("Local", esc(i.localNome))}
        ${linhaDet("Cidade", esc(lugar(i)))}
        ${linhaDet("Endereço", esc(i.endereco))}
        ${linhaDet("Buffet", buffet)}
        ${linhaDet("Estacionamento", estac)}
        ${linhaDet("Organização", esc(i.organizador))}
      </dl>`;
    } else if (i.tipo === "grupo") {
      dados = `<dl class="hp-dados">${linhaDet("Região", esc(i.regiao || lugar(i)))}</dl>`;
      const redes = Object.entries(i.redes).map(([r, url]) => `<li>${linkExterno(url, NOME_REDE[r] || r, "btn btn-pequeno hp-rede", r)}</li>`).join("");
      if (redes) dados += `<ul class="hp-redes" aria-label="Canais (links externos)">${redes}</ul>`;
    } else if (i.tipo === "anuncio") {
      dados = i.organizador ? `<dl class="hp-dados">${linhaDet("Anunciante", esc(i.organizador))}</dl>` : "";
    } else if (i.data) {
      dados = `<dl class="hp-dados">${linhaDet("Data", esc(fmt(i.data, { day: "2-digit", month: "long", year: "numeric" })))}</dl>`;
    }
    const link = i.link
      ? `<p class="hp-aviso-externo">Link externo: abre o site ${esc(dominio(i.link))}. O que você preencher lá não passa pela S.D.</p>
         ${linkExterno(i.link, i.linkTexto || (i.tipo === "evento" ? "Inscrição e informações" : "Abrir link"), "btn")}`
      : "";
    return `
      ${capa}
      <p class="hp-etiquetas">${i.tipo === "comunicado" ? `<span class="hp-tag">Comunicado da S.D</span>` : i.tipo === "anuncio" ? `<span class="hp-tag hp-tag-anuncio">Anúncio</span>` : etiquetaPublico(i)}</p>
      <h2 id="${PREF}-modal-titulo" class="hp-modal-titulo" tabindex="-1" autofocus>${esc(i.titulo)}</h2>
      ${i.subtitulo ? `<p class="hp-sub">${esc(i.subtitulo)}</p>` : ""}
      ${dados}
      ${desc}
      <div class="modal-acoes">${link}<button type="button" class="btn" data-fechar>Fechar</button></div>`;
  }

  /* ---------- 7. ESTADOS (carregando, vazio, erro) ---------- */
  const estado = (raiz, texto, comBotao) => {
    const caixa = raiz.querySelector(".hp-estado");
    caixa.innerHTML = `<p>${esc(texto)}</p>${comBotao ? '<button type="button" class="btn btn-pequeno" data-recarregar>Tentar de novo</button>' : ""}`;
    caixa.hidden = false;
  };

  // Espera o módulo do banco (firebase/divulgacoes.js) ficar pronto
  function esperarModulo() {
    return new Promise((ok, falha) => {
      if (window.SDDivulgacoes) return ok(window.SDDivulgacoes);
      const t = setTimeout(() => falha(new Error("sem-modulo")), ESPERA_MAX_MS);
      document.addEventListener("sd:divulgacoes-pronto", () => { clearTimeout(t); ok(window.SDDivulgacoes); }, { once: true });
    });
  }

  /* ---------- 7b. CACHE DA ÚLTIMA LEITURA (v0.8.5 — página mais leve) ----------
     A Home mostra NA HORA o que foi lido na última visita (guardado neste
     navegador) e, ao mesmo tempo, busca no banco o que há de novo.
     Só guarda divulgações (conteúdo público, sem dados pessoais), ligado à conta.
     Validade ← MUDE AQUI. Sem armazenamento: funciona igual, só sem o atalho. */
  const CACHE_HORAS = 24;
  const uidSessao = () => {
    for (const area of [sessionStorage, localStorage]) {
      try { const s = JSON.parse(area.getItem("sd-sessao") || "null"); if (s && s.uid) return s.uid; } catch (_) { /* sem armazenamento */ }
    }
    return "";
  };
  const cache = {
    ler(chave) {
      try {
        const c = JSON.parse(localStorage.getItem("sd-div-" + chave) || "null");
        return c && c.uid === uidSessao() && Date.now() - c.em < CACHE_HORAS * 3600000 ? c.dados : null;
      } catch (_) { return null; }
    },
    gravar(chave, dados) {
      const valor = (d) => JSON.stringify({ uid: uidSessao(), em: Date.now(), dados: d });
      try { localStorage.setItem("sd-div-" + chave, valor(dados)); }
      catch (_) {                                  // cheio (imagens grandes): guarda sem as imagens em texto
        try {
          const leve = JSON.parse(JSON.stringify(dados), (k, v) => (k === "imagem" && typeof v === "string" && v.startsWith("data:") ? "" : v));
          localStorage.setItem("sd-div-" + chave, valor(leve));
        } catch (_) { /* sem espaço: segue sem cache */ }
      }
    }
  };

  // v0.8.5: a prévia do adm não usa mais cache → apaga as leituras antigas guardadas
  // (uma leitura antiga VAZIA ficava na tela quando a leitura nova falhava).
  ["adm-cliente", "adm-prestador"].forEach((k) => { try { localStorage.removeItem("sd-div-" + k); } catch (_) { /* sem armazenamento */ } });

  /* ---------- 8. MONTAGEM ----------
     opcoes.carregar      → função que traz os dados (prévia do adm)
     opcoes.semBoasVindas → true = só as seções (Home do adm junta tudo, v0.8.5)
     opcoes.cache         → nome do cache (padrão "prestador") · false = sem cache (prévia do adm)
     opcoes.previa        → true = prévia do adm: lê sempre na hora e mostra o MOTIVO do erro
     opcoes.visao         → "cliente" = Comunicados da S.D + Anúncios (Home dos clientes, v0.8.5)
     opcoes.prefixo       → prefixo dos ids (padrão "hp"; cliente "hc") */
  function montar(alvo, nome, opcoes = {}) {
    const previa = opcoes.previa === true;
    const chaveCache = previa || opcoes.cache === false ? "" : opcoes.cache || "prestador";   // "" = sem cache
    const cliente = opcoes.visao === "cliente";
    const prefixo = opcoes.prefixo || (cliente ? "hc" : "hp");
    const txt = cliente ? { carregando: TEXTO.carregandoCliente, vazio: TEXTO.vazioCliente, erro: TEXTO.erroCliente } : TEXTO;
    alvo.innerHTML = `
      <div class="home-prestador">
        ${opcoes.semBoasVindas ? "" : `<section class="boas-vindas hp-boas-vindas" aria-labelledby="ola-titulo">
          <h1 id="ola-titulo">Olá${nome || ""}!</h1>
          <p>${esc(TEXTO.subtitulo)}</p>
          <div class="atalhos">
            <a class="btn" href="${esc(SD.caminho("perfil-prestador/index.html"))}#servicos">Meus serviços</a>
            <a class="btn" href="${esc(SD.urlPerfil())}">Meu perfil</a>
          </div>
        </section>`}
        <div class="hp-estado" role="status" aria-live="polite"><p>${esc(txt.carregando)}</p></div>
        <div class="hp-secoes"></div>
        <dialog class="modal modal-largo hp-modal" aria-labelledby="${prefixo}-modal-titulo"><div class="hp-modal-corpo"></div></dialog>
      </div>`;
    alvo.hidden = false;
    const raiz = alvo.querySelector(".home-prestador");
    const modal = window.SDUtil && window.SDUtil.ligarPopup ? window.SDUtil.ligarPopup(raiz.querySelector(".hp-modal")) : raiz.querySelector(".hp-modal");
    let itensPorId = new Map();

    // Cliques: detalhes, fechar, tentar de novo
    raiz.addEventListener("click", (ev) => {
      const det = ev.target.closest("[data-detalhe]");
      if (det) {
        const item = itensPorId.get(det.dataset.detalhe);
        if (!item) return;
        PREF = prefixo;
        modal.querySelector(".hp-modal-corpo").innerHTML = conteudoDetalhe(item);
        modal.abrir ? modal.abrir() : modal.showModal();
        return;
      }
      if (ev.target.closest("[data-fechar]")) { modal.close(); return; }
      if (ev.target.closest("[data-recarregar]")) carregar();
    });

    let mostrado = "";                               // o que está na tela (evita redesenhar igual)
    // Falhou: sem nada na tela → mensagem de erro · com leitura anterior → aviso (antes era silencioso)
    function falhou(e) {
      if (previa) {                                  // adm: diz o MOTIVO (a prévia nunca mostra leitura antiga)
        mostrado = "";
        raiz.querySelector(".hp-secoes").innerHTML = "";
        estado(raiz, `${TEXTO.erroPrevia} ${TEXTO.motivo[motivoErro(e)]}`, true);
        return;
      }
      if (mostrado) avisoNaTela = true;
      estado(raiz, mostrado ? TEXTO.atualizarFalhou : txt.erro, true);
    }
    let avisoNaTela = false;                         // aviso "Mostrando a última leitura" visível
    async function carregar() {
      // 1) Na hora: a última leitura guardada (se houver; a prévia do adm não usa)
      const salvo = chaveCache ? cache.ler(chaveCache) : null;
      // Erro ao desenhar a leitura guardada NUNCA pode impedir a leitura nova
      if (salvo && !mostrado) { try { mostrar(salvo); } catch (e) { console.warn("[S.D] Home: leitura guardada ignorada:", e); mostrado = ""; } }
      else if (!mostrado) { raiz.querySelector(".hp-secoes").innerHTML = ""; estado(raiz, txt.carregando, false); }
      // 2) Do banco: o que há de novo
      let dados = null;
      try { dados = opcoes.carregar ? await opcoes.carregar() : await (await esperarModulo()).listarParaMim(); }
      catch (e) { console.warn("[S.D] Home (divulgações):", e && (e.code || e.message || e), e && e.motivo ? "· " + e.motivo : ""); falhou(e); return; }
      if (!dados) { falhou(null); return; }
      if (chaveCache) cache.gravar(chaveCache, dados);
      if (avisoNaTela) { avisoNaTela = false; mostrado = ""; }   // força redesenhar e tirar o aviso
      mostrar(dados);
    }

    function mostrar(dados) {
      const assinatura = JSON.stringify(dados);
      if (assinatura === mostrado) return;          // nada mudou desde a última leitura
      mostrado = assinatura;
      PREF = prefixo;
      let html;
      if (cliente) {                                  // Home dos clientes: Comunicados da S.D + Anúncios
        const avisos = dados.avisos || [], anuncios = dados.anuncios || [];
        itensPorId = new Map([...avisos, ...anuncios].map((i) => [i.id, i]));
        // A área de comunicados SEMPRE aparece para o cliente (vazia: mensagem)
        html = (avisos.length ? secao("hp-comunicados", "Comunicados da S.D", "hp-secao-comunicados", avisos, cartaoComunicado, "Comunicados")
                : `<section class="hp-secao hp-secao-comunicados" aria-labelledby="${prefixo}-comunicados-titulo"><div class="hp-secao-topo"><h2 id="${prefixo}-comunicados-titulo" class="hp-secao-titulo">Comunicados da S.D</h2></div><p class="hp-vazio">${esc(txt.vazio)}</p></section>`) +
               secao("hp-anuncios", "Anúncios", "hp-secao-anuncios", anuncios, cartaoAnuncio, "Anúncios");
      } else {
        // v0.8.5: Comunicados da S.D (todos) → Divulgações (só prestadores) → Agenda → Grupos
        const comunicados = dados.comunicados || [], divulgacoes = dados.divulgacoes || [];
        const eventos = dados.eventos || [], grupos = dados.grupos || [];
        itensPorId = new Map([...comunicados, ...divulgacoes, ...eventos, ...grupos].map((i) => [i.id, i]));
        html =
          secao("hp-comunicados", "Comunicados da S.D", "hp-secao-comunicados", comunicados, cartaoComunicado, "Comunicados") +
          secao("hp-divulg", "Divulgações", "hp-secao-comunicados hp-secao-divulgacoes", divulgacoes, cartaoDivulgacao, "Divulgações") +
          secao("hp-eventos", "Agenda de eventos", "hp-secao-eventos", eventos, cartaoEvento, "Eventos") +
          secao("hp-grupos", "Grupos e comunidades", "hp-secao-grupos", grupos, cartaoGrupo, "Grupos e comunidades");
      }
      const caixa = raiz.querySelector(".hp-secoes");
      caixa.innerHTML = html;
      if (!html) { estado(raiz, txt.vazio, false); return; }
      raiz.querySelector(".hp-estado").hidden = true;
      caixa.querySelectorAll(".hp-secao").forEach(ligarFaixa);
      // Imagem que não abriu: some (o cartão continua)
      caixa.querySelectorAll("img").forEach((img) => img.addEventListener("error", () => img.remove(), { once: true }));
    }

    carregar();
    return { recarregar: carregar, mostrar };   // "mostrar" também serve para a prévia com dados de teste (fora do site)
  }

  window.SDHomePrestador = Object.freeze({ montar, cache });   // cache: também usado pelos avisos dos clientes (home.js)
})();
