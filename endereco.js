/* =====================================================================
   S.D — ENDEREÇO COM CEP AUTOMÁTICO (componentes/endereco/endereco.js)
   Um lugar só para o endereço de TODOS os usuários (cadastro e perfis).

   Ordem dos campos (aprovada em 06/11/2026):
     CEP | Endereço (rua)
     UF  | Cidade | Bairro
     Número | Complemento
   Ao digitar o CEP (8 dígitos), rua, bairro, cidade e UF são preenchidos
   sozinhos (ViaCEP; se falhar, BrasilAPI — ambos grátis e sem chave,
   configurados em configuracoes/config.js → cep). Tudo continua editável.
   Só o complemento é opcional.

   Uso automático (sem escrever JS na página):
     <div data-endereco="exibir"></div>                    → tabela de leitura (perfis)
     <fieldset data-endereco="formulario" data-prefixo="f"></fieldset> → campos (Editar perfil)
   Uso por JS (cadastro):
     SDEndereco.montarFormulario(alvo, { prefixo, obrigatorio, idErro })
   Depende de: componentes/utilidades/utilidades.js e configuracoes/config.js.
   Privacidade: só os 8 dígitos do CEP saem do navegador (nada de nome, CPF etc.).
   ===================================================================== */
(function () {
  "use strict";
  const U = window.SDUtil;
  if (!U) { console.error("[S.D] endereco.js: carregue componentes/utilidades/utilidades.js antes."); return; }

  /* ---------- 1. CONFIGURAÇÃO ---------- */
  const PADRAO_CEP = {
    provedores: [
      { nome: "ViaCEP", url: "https://viacep.com.br/ws/{cep}/json/" },
      { nome: "BrasilAPI", url: "https://brasilapi.com.br/api/cep/v1/{cep}" }
    ],
    tempoLimiteMs: 6000
  };
  const configCep = () => (window.SD && window.SD.config.cep) || PADRAO_CEP;

  const UFS = ["AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG", "PA",
    "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO"];

  // Campos na ordem da tela. classe = posição na grade (endereco.css)
  const CAMPOS = [
    { chave: "cep",         rotulo: "CEP",            auto: "postal-code",    max: 9,   mascara: "cep", numerico: true, ph: "00000-000" },
    { chave: "endereco",    rotulo: "Endereço (rua)", auto: "address-line1",  max: 150 },
    { chave: "uf",          rotulo: "UF",             auto: "address-level1", lista: UFS },
    { chave: "cidade",      rotulo: "Cidade",         auto: "address-level2", max: 80 },
    { chave: "bairro",      rotulo: "Bairro",         auto: "address-level3", max: 80 },
    { chave: "numero",      rotulo: "Número",         max: 10, ph: "Ex.: 120 ou S/N" },
    { chave: "complemento", rotulo: "Complemento",    auto: "address-line2",  max: 60, opcional: true, ph: "Apto, bloco, sala…" }
  ];
  const CHAVES = CAMPOS.map((c) => c.chave);

  /* ---------- 2. BUSCAR O CEP ----------
     Devolve { endereco, bairro, cidade, uf } · null = CEP não existe.
     Lança erro quando nenhum serviço respondeu (sem internet, fora do ar). */
  function converter(nome, d) {
    if (!d || d.erro === true || d.erro === "true") return null;
    if (nome === "BrasilAPI") return { endereco: d.street || "", bairro: d.neighborhood || "", cidade: d.city || "", uf: d.state || "" };
    return { endereco: d.logradouro || "", bairro: d.bairro || "", cidade: d.localidade || "", uf: d.uf || "" };
  }

  async function buscarCep(cep) {
    const digitos = U.soDigitos(cep);
    if (digitos.length !== 8) return null;
    const { provedores, tempoLimiteMs } = configCep();
    let falhas = 0;
    for (const p of provedores) {
      const controle = new AbortController();
      const relogio = setTimeout(() => controle.abort(), tempoLimiteMs || 6000);
      try {
        const r = await fetch(p.url.replace("{cep}", digitos), { signal: controle.signal, headers: { Accept: "application/json" }, referrerPolicy: "no-referrer" });
        if (r.status === 404 || r.status === 400) return null;      // CEP inexistente
        if (!r.ok) throw new Error("HTTP " + r.status);
        return converter(p.nome, await r.json());
      } catch (_) {
        falhas++;                                                    // tenta o próximo serviço
      } finally {
        clearTimeout(relogio);
      }
    }
    if (falhas) throw new Error("CEP indisponível");
    return null;
  }

  /* ---------- 3. CRIAR ELEMENTOS ---------- */
  function el(tag, atributos = {}, filhos = []) {
    const e = document.createElement(tag);
    for (const [n, v] of Object.entries(atributos)) {
      if (v === undefined || v === null || v === false) continue;
      e.setAttribute(n, v === true ? "" : v);
    }
    [].concat(filhos).forEach((f) => e.append(f instanceof Node ? f : document.createTextNode(f)));
    return e;
  }

  /* ---------- 4. FORMULÁRIO (cadastro e Editar perfil) ----------
     opcoes.prefixo     → ids "<prefixo>-cep", "<prefixo>-endereco"...
     opcoes.obrigatorio → true no cadastro (asterisco + required). Complemento sempre opcional.
     opcoes.idErro(ch)  → id do <span> de erro de cada campo (padrão "e-<chave>")
     opcoes.legenda     → texto do <legend> (padrão "Endereço")
     opcoes.nota        → texto de ajuda abaixo da legenda (opcional)
     Devolve { campos: { cep: <input>, ... }, ler(), limpar() } */
  function montarFormulario(alvo, opcoes = {}) {
    const prefixo = opcoes.prefixo || "f";
    const obrigatorio = !!opcoes.obrigatorio;
    const idErro = opcoes.idErro || ((chave) => "e-" + chave);
    const campos = {};

    alvo.classList.add("grupo", "endereco-grupo");
    alvo.textContent = "";
    alvo.append(el("legend", {}, [opcoes.legenda || "Endereço"]));
    if (opcoes.nota) alvo.append(el("p", { class: "nota endereco-nota" }, [opcoes.nota]));

    const grade = el("div", { class: "endereco-form" });
    CAMPOS.forEach((c) => {
      const id = `${prefixo}-${c.chave}`;
      const exigido = obrigatorio && !c.opcional;
      const rotulo = el("label", { for: id }, [c.rotulo]);
      if (exigido) rotulo.append(el("span", { class: "obrigatorio", "aria-hidden": "true" }, [" *"]));
      if (c.opcional && obrigatorio) rotulo.append(el("span", { class: "nota" }, [" (opcional)"]));

      let campo;
      if (c.lista) {
        campo = el("select", { id, name: c.chave, autocomplete: c.auto, required: exigido || undefined, "aria-describedby": idErro(c.chave) });
        campo.append(new Option(obrigatorio ? "Selecione" : "—", ""));
        c.lista.forEach((uf) => campo.append(new Option(uf, uf)));
      } else {
        campo = el("input", {
          id, name: c.chave, type: "text", maxlength: c.max, placeholder: c.ph,
          autocomplete: c.auto || "off", inputmode: c.numerico ? "numeric" : undefined,
          required: exigido || undefined, "aria-describedby": idErro(c.chave)
        });
      }
      campos[c.chave] = campo;
      grade.append(el("div", { class: `campo end-${c.chave}` }, [rotulo, campo, el("span", { class: "campo-erro", id: idErro(c.chave) })]));
    });

    // Aviso da busca do CEP (lido pelo leitor de tela)
    const status = el("p", { class: "nota endereco-status", role: "status", "aria-live": "polite" });
    alvo.append(grade, status);
    const busca = ligarCep(campos, status);

    const controle = {
      campos,
      ler: () => Object.fromEntries(CHAVES.map((k) => [k, k === "cep" ? U.soDigitos(campos[k].value) : campos[k].value.trim()])),
      limpar: () => { CHAVES.forEach((k) => { campos[k].value = ""; }); busca.reiniciar(); }
    };
    alvo._sdEndereco = controle;            // o formulário acha o controle pelo próprio <fieldset>
    return controle;
  }

  // Máscara + busca automática quando o CEP fica completo
  function ligarCep(campos, status) {
    const cep = campos.cep;
    let pedido = 0, ultimoBuscado = "";
    const avisar = (texto, tipo) => { status.textContent = texto; status.dataset.tipo = tipo || ""; };

    async function consultar() {
      const d = U.soDigitos(cep.value);
      if (d.length !== 8) { if (!d.length) avisar(""); return; }
      if (d === ultimoBuscado) return;
      ultimoBuscado = d;
      const meu = ++pedido;
      cep.setAttribute("aria-busy", "true");
      avisar("Buscando endereço…");
      try {
        const r = await buscarCep(d);
        if (meu !== pedido) return;                              // chegou resposta de um CEP antigo
        if (!r) { avisar("CEP não encontrado. Confira o número ou preencha o endereço.", "erro"); return; }
        if (r.endereco) campos.endereco.value = r.endereco;
        if (r.bairro) campos.bairro.value = r.bairro;
        if (r.cidade) campos.cidade.value = r.cidade;
        if (r.uf && UFS.includes(r.uf)) campos.uf.value = r.uf;
        [campos.endereco, campos.bairro, campos.cidade, campos.uf].forEach((c) => c.dispatchEvent(new Event("input", { bubbles: true })));
        // CEP geral da cidade (sem rua) → a pessoa digita a rua; senão vai para o número
        if (!r.endereco) { avisar("Cidade encontrada. Informe a rua e o bairro.", "info"); campos.endereco.focus(); }
        else { avisar("Endereço preenchido. Confira e informe o número.", "ok"); campos.numero.focus(); }
      } catch (_) {
        if (meu !== pedido) return;
        ultimoBuscado = "";                                      // deixa tentar de novo
        avisar("Não foi possível buscar o CEP agora. Preencha o endereço manualmente.", "erro");
      } finally {
        if (meu === pedido) cep.removeAttribute("aria-busy");
      }
    }

    cep.addEventListener("input", () => {
      cep.value = U.formatarCep(cep.value);
      if (U.soDigitos(cep.value).length === 8) consultar();
    });
    cep.addEventListener("blur", consultar);
    return { reiniciar: () => { pedido++; ultimoBuscado = ""; avisar(""); cep.removeAttribute("aria-busy"); } };
  }

  /* ---------- 5. VALIDAÇÃO ----------
     dados = { cep, endereco, uf, cidade, bairro, numero, complemento }
     obrigatorio = true → todos menos complemento precisam estar preenchidos.
     marcar(chave, mensagem) é chamado para cada erro. */
  function validar(dados, obrigatorio, marcar) {
    if (obrigatorio) {
      CAMPOS.filter((c) => !c.opcional).forEach((c) => { if (!dados[c.chave]) marcar(c.chave, "Campo obrigatório."); });
    }
    if (dados.cep && dados.cep.length !== 8) marcar("cep", "O CEP deve ter 8 dígitos.");
    if (dados.uf && !UFS.includes(dados.uf)) marcar("uf", "UF inválida.");
    if (dados.numero && !/^(\d{1,6}[A-Za-z]?|s\/?n)$/i.test(dados.numero.replace(/\s/g, ""))) marcar("numero", "Use só o número (ex.: 120 ou 120A) ou S/N.");
    if (dados.cidade && dados.cidade.length < 2) marcar("cidade", "Cidade muito curta.");
  }

  /* ---------- 6. EXIBIÇÃO (tabela de leitura dos perfis) ----------
     As células usam data-campo → preenchidas por SDPerfil.preencherCampos(). */
  function montarExibicao(alvo) {
    alvo.classList.add("grade-local");
    alvo.textContent = "";
    [["cep", "CEP"], ["endereco", "Endereço"], ["numero", "Número"], ["complemento", "Complemento"],
     ["bairro", "Bairro"], ["cidade", "Cidade"], ["uf", "UF"]].forEach(([chave, rotulo]) => {
      alvo.append(el("div", { class: `celula cel-${chave}` }, [
        el("span", { class: "celula-rotulo" }, [rotulo]),
        el("span", { class: "valor", "data-campo": chave })
      ]));
    });
  }

  /* ---------- 7. MONTAGEM AUTOMÁTICA ---------- */
  function montarAutomatico() {
    document.querySelectorAll('[data-endereco="exibir"]').forEach(montarExibicao);
    document.querySelectorAll('[data-endereco="formulario"]').forEach((f) => {
      montarFormulario(f, {
        prefixo: f.dataset.prefixo || "f",
        obrigatorio: f.dataset.obrigatorio === "sim",
        legenda: f.dataset.legenda || "Localização",
        nota: f.dataset.nota || ""
      });
    });
  }

  window.SDEndereco = Object.freeze({ CHAVES, UFS, buscarCep, montarFormulario, montarExibicao, validar });

  // Scripts com "defer" rodam com a página já lida: dá para montar agora,
  // antes do script da página preencher os dados.
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montarAutomatico);
  else montarAutomatico();
})();
