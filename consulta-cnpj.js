/* =====================================================================
   S.D — CONSULTA DO CNPJ DO PRESTADOR (servicos/consulta-cnpj.js)
   Decisão de 09/11/2026: conferir o CNPJ/MEI do prestador numa API pública.
     1º CNPJá (open.cnpja.com) — grátis, sem chave, 5 consultas/min por IP
     2º CNPJ.ws (publica.cnpj.ws) — grátis, sem chave, 3 consultas/min por IP (reserva)
   Nenhuma das duas precisa de chave ou cadastro. Para trocar de API, mude o bloco 1.

   IMPORTANTE (plano grátis, sem servidor próprio):
     a consulta roda no NAVEGADOR. Ela barra quem digita CNPJ baixado/inapto por
     engano, mas não é prova: o SELO "verificado" só é dado pelo adm (campo
     "verificado" no banco, protegido pelas regras). Selo automático = pós-MVP (pago).

   Uso: const r = await SDConsultaCnpj.consultar("12345678000195", "Nome digitado");
     r.resultado → "ok" | "divergente" | "inativo" | "nao-encontrado" | "sem-resposta"
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. APIs (fácil de trocar) ---------- */
  const APIS = [
    {
      nome: "CNPJá",
      url: (cnpj) => `https://open.cnpja.com/office/${cnpj}`,
      ler: (j) => ({
        situacao: j.status && j.status.text,
        mei: !!(j.company && j.company.simei && j.company.simei.optant),
        nome: j.company && j.company.name,
        cnaePrincipal: j.mainActivity ? String(j.mainActivity.id) : "",
        cnaesSecundarios: (j.sideActivities || []).map((a) => String(a.id))
      })
    },
    {
      nome: "CNPJ.ws",
      url: (cnpj) => `https://publica.cnpj.ws/cnpj/${cnpj}`,
      ler: (j) => {
        const e = j.estabelecimento || {};
        return {
          situacao: e.situacao_cadastral,
          mei: !!(j.simples && /sim/i.test(j.simples.mei || "")),
          nome: j.razao_social,
          cnaePrincipal: e.atividade_principal ? String(e.atividade_principal.id) : "",
          cnaesSecundarios: (e.atividades_secundarias || []).map((a) => String(a.id))
        };
      }
    }
  ];
  const ESPERA_MAX_MS = 8000;                 // desiste de uma API depois de 8 s

  /* ---------- 2. AJUDANTES ---------- */
  // Compara nomes sem acento, pontuação e palavras de tipo de empresa
  const IGNORAR = /\b(LTDA|ME|EPP|EIRELI|SA|S A|MEI|DE|DA|DO|DAS|DOS|E)\b/g;
  const simplificar = (t) => String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toUpperCase().replace(/[^A-Z0-9 ]/g, " ").replace(IGNORAR, " ").replace(/\s+/g, " ").trim();
  // "Bate" se uma palavra importante (3+ letras) do nome digitado aparece no nome da Receita
  function nomeBate(digitado, receita) {
    const a = simplificar(digitado).split(" ").filter((p) => p.length >= 3);
    const b = new Set(simplificar(receita).split(" "));
    return a.length === 0 || a.some((p) => b.has(p));
  }

  async function buscar(api, cnpj) {
    const controle = new AbortController();
    const tempo = setTimeout(() => controle.abort(), ESPERA_MAX_MS);
    try {
      const r = await fetch(api.url(cnpj), { signal: controle.signal, headers: { Accept: "application/json" } });
      if (r.status === 400 || r.status === 404) return { naoEncontrado: true };
      if (!r.ok) return null;                       // limite de consultas (429) ou API fora do ar
      return api.ler(await r.json());
    } catch (_) {
      return null;
    } finally {
      clearTimeout(tempo);
    }
  }

  /* ---------- 3. CONSULTA ---------- */
  async function consultar(cnpj, nomeDigitado) {
    const base = { consultadoEm: new Date().toISOString() };
    for (const api of APIS) {
      const d = await buscar(api, cnpj);
      if (!d) continue;                                     // tenta a próxima API
      if (d.naoEncontrado) return { ...base, fonte: api.nome, resultado: "nao-encontrado" };
      const ativa = /^ativa$/i.test(String(d.situacao || "").trim());
      const resultado = !ativa ? "inativo" : nomeBate(nomeDigitado, d.nome) ? "ok" : "divergente";
      // Guarda só o mínimo necessário (LGPD): sem sócios, endereço ou telefones da Receita
      return { ...base, fonte: api.nome, resultado, situacao: d.situacao || "", mei: d.mei,
        nomeReceita: d.nome || "", cnaePrincipal: d.cnaePrincipal, cnaesSecundarios: d.cnaesSecundarios.slice(0, 20) };
    }
    return { ...base, fonte: "", resultado: "sem-resposta" };
  }

  window.SDConsultaCnpj = Object.freeze({ consultar, nomeBate });
})();
