/* =====================================================================
   S.D — PERFIL DO CLIENTE CPF (perfil-cliente-cpf/perfil-cliente-cpf.js)
   O comportamento comum (abas, telefones, edição, foto, exclusão) vem de
   componentes/perfil-base/perfil-base.js. Aqui fica só o exclusivo do CPF:
     - "Tipo de conta" no lugar de "Cargo"; documento = CPF (inalterável).
     - Só a foto de perfil (sem galeria), opcional → foto padrão do sistema.
     - Sem "Avaliações": o cliente não vê as notas que recebeu (só prestadores).
     - Aba "Serviços realizados" (componentes/servicos-realizados); o nome da
       empresa abre o perfil público do prestador.
     - Botão "Mostrar meus dados aos prestadores" (liga/desliga a qualquer momento).
   DADOS: sempre os REAIS (Firebase). Sem dados fictícios desde a v0.7.9.
   ===================================================================== */
(function () {
  "use strict";
  const U = window.SDUtil, P = window.SDPerfil, SD = window.SD;
  const $ = P.$;

  /* ---------- 1. CONFIGURAÇÃO (fácil de ajustar) ---------- */
  const CONFIG = {
    ...P.PADRAO,   // telefones (4), fotos (JPG/PNG/WEBP até 5 MB)
    // Fotos padrão do sistema (arquivos ainda a criar). Sem o arquivo, aparece um ícone provisório.
    fotoPadraoCliente: SD.caminho("fotos/padrao/cliente-cpf.png"),
    fotoPadraoEmpresa: SD.caminho("fotos/padrao/prestador.png")
  };

  /* ---------- 2. DADOS DO PERFIL ----------
     Começa VAZIO; carregarDadosReais() preenche com a conta logada. */
  const perfil = {
    nome: "", tipoConta: "Cliente - Pessoa física (CPF)", documento: "", email: "",
    telefones: [{ numero: "", principal: true }],
    endereco: "", numero: "", complemento: "", bairro: "", cep: "", cidade: "", uf: "",
    foto: null,                             // null = usa a foto padrão
    // Autorização do cadastro: prestador vê primeiro nome e bairro (pode mudar a qualquer momento)
    compartilharDados: false
  };
  // Histórico de serviços realizados: chega com os pedidos reais (Ciclo 3/4)
  const servicos = [];

  let telefones = null, foto = null;

  /* ---------- 3. EXIBIÇÃO DOS DADOS ---------- */
  function renderizarDados() {
    P.preencherCampos({
      nome: perfil.nome,
      tipoConta: perfil.tipoConta,
      documento: perfil.documento,
      email: perfil.email,
      ...P.enderecoParaTela(perfil)
    });
    P.preencherPlaceholders({
      "f-nome": perfil.nome, "f-email": perfil.email,
      "f-telefone": U.formatarTelefone(perfil.telefones.find((t) => t.principal)?.numero),
      ...P.placeholdersEndereco(perfil),
      "f-senha": "Deixe vazio para manter a atual", "f-senha2": "Repita a nova senha"
    });
    if (telefones) telefones.renderizar();
    if (foto) foto.renderizar();
  }

  /* ---------- 4. INÍCIO ---------- */
  document.addEventListener("DOMContentLoaded", async () => {
    // Conta real (Firebase): dados da conta logada
    const real = await P.carregarDadosReais(perfil, "cliente-cpf");
    if (real && !perfil.local && perfil.cidade && window.SDFirebase.atualizarLocal) window.SDFirebase.atualizarLocal(perfil);   // ponto no mapa (uma vez)
    P.iniciarInterruptoresPerfil();                        // botão Localização (linha das abas)
    telefones = P.iniciarTelefones(perfil, { max: CONFIG.maxTelefonesSecundarios });
    foto = P.iniciarFotoOpcional({
      perfil, config: CONFIG, padrao: CONFIG.fotoPadraoCliente, tipoIcone: "pessoa",
      textoAlt: (temFoto) => (temFoto ? "Foto de perfil de " + perfil.nome : "Foto padrão de perfil")
    });
    renderizarDados();
    window.SDServicos.renderizar({
      lista: $("#lista-servicos"), total: $("#servicos-total"), vazio: $("#servicos-vazio"),
      servicos, fotoPadraoEmpresa: CONFIG.fotoPadraoEmpresa
    });
    P.iniciarSanfona();
    P.iniciarFormulario({
      perfil,
      coletar: (valor) => ({ nome: valor("f-nome") }),
      camposTexto: ["nome"],
      validar: (d, marcar) => {
        if (d.nome && d.nome.split(/\s+/).length < 2) marcar("f-nome", "Informe nome e sobrenome.");
      },
      aoConcluir: renderizarDados
    });
    P.iniciarExclusao();
    // Privacidade: a mudança vale na hora para os próximos pedidos (o servidor grava a data do consentimento)
    P.iniciarInterruptor($("#sw-compartilhar"), {
      ligado: perfil.compartilharDados,
      aoMudar: (ligado) => {
        perfil.compartilharDados = ligado;
        const texto = ligado ? "Ligado: prestadores dos seus pedidos verão seu primeiro nome e bairro." : "Desligado: prestadores verão só a região aproximada.";
        if (!perfil._real) {
          U.mostrarMensagem($("#msg-privacidade"), "erro", "Sem conexão com a conta. Entre de novo para salvar.");
          P.atualizarAltura();
          return;
        }
        // Conta real: grava a escolha e a data (consentimento LGPD)
        perfil.compartilharDadosEm = new Date().toISOString();
        P.salvarDadosReais(perfil, ["compartilharDados", "compartilharDadosEm"])
          .then(() => U.mostrarMensagem($("#msg-privacidade"), "sucesso", texto + " Salvo."))
          .catch((e) => U.mostrarMensagem($("#msg-privacidade"), "erro", "Não foi salvo: " + window.SDFirebase.mensagemErro(e)))
          .finally(() => P.atualizarAltura());
      }
    });
    P.iniciarAbas({ abas: ["#aba-perfil", "#aba-servicos"] });
  });
})();
