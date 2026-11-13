/* Monta a tabela da página de regras (seguranca/index.html) a partir de window.SD_ACESSO.
   Fora do HTML por causa da CSP (seguranca/csp.md). */
document.addEventListener("DOMContentLoaded", function () {
  var A = window.SD_ACESSO, tabela = document.getElementById("tabela-acesso");
  if (!A) return;
  var perfis = Object.keys(A.PERFIS);
  var cab = "<thead><tr><th scope=\"col\">Recurso</th>" + perfis.map(function (p) { return "<th scope=\"col\">" + A.PERFIS[p] + "</th>"; }).join("") + "</tr></thead>";
  var linhas = Object.keys(A.REGRAS).map(function (r) {
    return "<tr><th scope=\"row\"><code>" + r + "</code></th>" + perfis.map(function (p) {
      return A.pode(p, r) ? "<td><span class=\"sim\">Sim</span></td>" : "<td><span class=\"nao\">Não</span></td>";
    }).join("") + "</tr>";
  }).join("");
  tabela.insertAdjacentHTML("beforeend", cab + "<tbody>" + linhas + "</tbody>");
});
