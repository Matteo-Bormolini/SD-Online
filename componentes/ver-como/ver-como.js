/* =====================================================================
   S.D — "VER COMO" DO ADM (componentes/ver-como/ver-como.js) · v0.8.5
   Barra no topo da página, SÓ para o administrador. Mostra a página como
   cada tipo de conta vê, sem entrar em outros perfis:
     Adm (normal) · Visitante · Cliente CPF · Cliente CNPJ · Prestador
   A escolha fica guardada só nesta aba (sessionStorage) e vale ao recarregar.
   É só PRÉVIA: os dados continuam sendo lidos como adm (regras do banco).
   Hoje ligado no Início (home/). Outras páginas entram quando tiverem
   diferença entre os tipos (avaliações e políticas hoje são iguais para todos).

   Uso:
     SDVerComo.visao()                → "adm" | "visitante" | "cliente-cpf" | "cliente-cnpj" | "prestador"
     SDVerComo.montar(elementoMain)   → coloca a barra no topo (troca = recarrega a página)
   ===================================================================== */
(function () {
  "use strict";

  /* ---------- 1. OPÇÕES ← MUDE AQUI ---------- */
  const VISOES = [
    { id: "adm",          nome: "Adm (normal)" },
    { id: "visitante",    nome: "Visitante" },
    { id: "cliente-cpf",  nome: "Cliente CPF" },
    { id: "cliente-cnpj", nome: "Cliente CNPJ" },
    { id: "prestador",    nome: "Prestador" }
  ];
  const CHAVE = "sd-ver-como";

  const ehAdm = () => window.SD && window.SD.logado() && window.SD.tipoUsuario() === "adm";

  /* ---------- 2. ESCOLHA GUARDADA (só nesta aba) ---------- */
  function visao() {
    if (!ehAdm()) return null;
    let v = "adm";
    try { v = sessionStorage.getItem(CHAVE) || "adm"; } catch (_) { /* sem armazenamento: normal */ }
    return VISOES.some((o) => o.id === v) ? v : "adm";
  }
  function escolher(v) {
    try { sessionStorage.setItem(CHAVE, v); } catch (_) { /* só nesta tela */ }
    location.reload();
  }

  /* ---------- 3. BARRA ---------- */
  function montar(alvo) {
    if (!ehAdm() || !alvo || document.getElementById("ver-como")) return;
    const atual = visao();
    const barra = document.createElement("nav");
    barra.id = "ver-como";
    barra.className = "ver-como";
    barra.setAttribute("aria-label", "Ver a página como outro tipo de conta (só adm)");
    const rotulo = document.createElement("span");
    rotulo.className = "ver-como-rotulo";
    rotulo.textContent = "Ver como:";
    const lista = document.createElement("div");
    lista.className = "ver-como-opcoes";
    VISOES.forEach((o) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "btn btn-pequeno ver-como-opcao";
      b.textContent = o.nome;
      b.setAttribute("aria-pressed", String(o.id === atual));
      b.addEventListener("click", () => { if (o.id !== atual) escolher(o.id); });
      lista.append(b);
    });
    barra.append(rotulo, lista);
    if (atual !== "adm") {
      const nota = document.createElement("span");
      nota.className = "ver-como-nota";
      nota.setAttribute("role", "status");
      nota.textContent = "Prévia: é assim que essa conta vê. Os dados são lidos como adm.";
      barra.append(nota);
    }
    alvo.prepend(barra);
  }

  window.SDVerComo = Object.freeze({ VISOES, visao, montar });
})();
