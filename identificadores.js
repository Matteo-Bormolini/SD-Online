/* =====================================================================
   S.D — SERVIÇO DE IDENTIFICAÇÃO (servicos/identificadores.js)
   Diz QUAL identificador a pessoa digitou no login (e-mail, CPF, CNPJ…),
   deixa o valor no formato padrão (normaliza) e confere se é válido.

   Preparado para crescer: cada identificador é um item da lista TIPOS.
     ativo: true  → aceito para entrar hoje
     ativo: false → previsto para o futuro (nome de login, telefone…)
   Para ligar um novo identificador: escrever detectar/normalizar/validar
   e trocar "ativo" para true — AQUI e no SERVIDOR (tabela de
   identificadores, ver base-de-dados/README.md).

   Regras de segurança:
     - O mesmo valor normalizado só pode pertencer a UMA conta (o servidor garante).
     - Um identificador só entra no login depois de confirmado (titularidade).
     - Nunca mostrar o valor completo de outra pessoa: use mascarar().
   Depende de: componentes/utilidades/utilidades.js
   ===================================================================== */
(function () {
  "use strict";
  const U = window.SDUtil;
  if (!U) { console.error("[S.D] identificadores.js: carregue componentes/utilidades/utilidades.js antes."); return; }

  /* ---------- 1. TIPOS DE IDENTIFICADOR (ordem = ordem de detecção) ---------- */
  const TIPOS = {
    email: {
      nome: "E-mail", ativo: true,
      detectar: (v) => v.includes("@"),
      normalizar: (v) => v.trim().toLowerCase(),
      validar: (v) => U.emailValido(v) && v.length <= 254,
      // ma***@ex***.com.br
      mascarar: (v) => {
        const [usuario, dominio = ""] = v.split("@");
        const [nomeDominio, ...resto] = dominio.split(".");
        return `${usuario.slice(0, 2)}***@${nomeDominio.slice(0, 2)}***${resto.length ? "." + resto.join(".") : ""}`;
      }
    },
    cpf: {
      nome: "CPF", ativo: true,
      detectar: (v) => !/[a-z@]/i.test(v) && U.soDigitos(v).length === 11,
      normalizar: (v) => U.soDigitos(v),
      validar: (v) => U.cpfValido(v),
      formatar: (v) => U.formatarCpf(v),
      mascarar: (v) => `***.***.${v.slice(6, 9)}-**`
    },
    cnpj: {
      nome: "CNPJ", ativo: true,
      // aceita o CNPJ alfanumérico (letras nas 12 primeiras posições)
      detectar: (v) => !v.includes("@") && U.normalizarCnpj(v).length === 14,
      normalizar: (v) => U.normalizarCnpj(v),
      validar: (v) => U.cnpjValido(v),
      formatar: (v) => U.formatarCnpj(v),
      mascarar: (v) => `**.***.${v.slice(5, 8)}/****-**`
    },
    // ----- FUTURO (não aceitos agora) -----
    telefone: { nome: "Telefone principal", ativo: false },
    login:    { nome: "Nome de login",      ativo: false }
  };

  /* ---------- 2. FUNÇÕES ---------- */
  const ativos = () => Object.entries(TIPOS).filter(([, t]) => t.ativo);

  // "maria@x.com" → { tipo: "email", valor: "maria@x.com", valido: true }
  // Nada reconhecido → { tipo: null, valido: false }
  function identificar(texto, permitidos) {
    const bruto = String(texto || "").trim();
    for (const [chave, t] of ativos()) {
      if (permitidos && !permitidos.includes(chave)) continue;
      if (!t.detectar(bruto)) continue;
      const valor = t.normalizar(bruto);
      return { tipo: chave, nome: t.nome, valor, valido: t.validar(valor) };
    }
    return { tipo: null, nome: "", valor: "", valido: false };
  }

  // Texto com os identificadores aceitos hoje: "E-mail, CPF ou CNPJ"
  function nomesAtivos() {
    const n = ativos().map(([, t]) => t.nome);
    return n.length > 1 ? `${n.slice(0, -1).join(", ")} ou ${n[n.length - 1]}` : n.join("");
  }

  const formatar = (tipo, valor) => (TIPOS[tipo] && TIPOS[tipo].formatar ? TIPOS[tipo].formatar(valor) : valor);
  const mascarar = (tipo, valor) => (TIPOS[tipo] && TIPOS[tipo].mascarar ? TIPOS[tipo].mascarar(valor) : "***");

  window.SDIdentificadores = Object.freeze({ TIPOS, identificar, nomesAtivos, formatar, mascarar });
})();
