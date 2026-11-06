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
   IMPORTANTE: demonstração — salvar, excluir, enviar fotos e buscar o
   histórico dependem do servidor.
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

  /* ---------- 2. DADOS DE DEMONSTRAÇÃO ----------
     Substituir pelos dados vindos do servidor depois do login. */
  const perfil = {
    nome: "Nome Sobrenome Exemplo",
    tipoConta: "Cliente - Pessoa física (CPF)",
    documento: "000.000.000-00",
    email: "cliente@exemplo.com.br",
    telefones: [{ numero: "11900000000", principal: true }],
    endereco: "Rua Exemplo",
    numero: "100",
    complemento: "Apto 12",
    bairro: "Centro",
    cep: "01000000",
    cidade: "São Paulo",
    uf: "SP",
    foto: null,                             // null = usa a foto padrão
    // Autorização do cadastro: prestador vê primeiro nome e bairro (pode mudar a qualquer momento)
    compartilharDados: false
  };

  // Histórico de serviços (exemplo). data = AAAA-MM-DD; valor em reais;
  // estrelas = nota que o cliente deu (null = ainda não avaliou); foto = da empresa;
  // fotos = fotos do serviço realizado (aparecem no carrossel ao expandir o item).
  const demo = (texto) => window.SDCarrossel.imagemDemo(texto);
  const servicos = [
    { data: "2026-10-02", servico: "Conserto de infiltração no teto", prestador: "Empresa Exemplo A", prestadorId: "p-exemplo-a", valor: 850.00, estrelas: 5, foto: null,
      fotos: [{ src: demo("Antes — mancha no teto"), legenda: "Antes" }, { src: demo("Durante — impermeabilização"), legenda: "Durante o serviço" }, { src: demo("Depois — teto pintado"), legenda: "Depois" }] },
    { data: "2026-08-15", servico: "Instalação de chuveiro elétrico", prestador: "Prestador Exemplo B", prestadorId: "p-exemplo-b", valor: 180.00, estrelas: 4, foto: null,
      fotos: [{ src: demo("Chuveiro instalado"), legenda: "Chuveiro instalado" }] },
    { data: "2026-06-20", servico: "Manutenção de portão eletrônico", prestador: "Empresa Exemplo C", prestadorId: "p-exemplo-c", valor: 320.50, estrelas: null, foto: null,
      fotos: [] }
  ];

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
  document.addEventListener("DOMContentLoaded", () => {
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
        U.mostrarMensagem($("#msg-privacidade"), "atencao",
          (ligado ? "Ligado: prestadores dos seus pedidos verão seu primeiro nome e bairro." : "Desligado: prestadores verão só a região aproximada.") +
          " Demonstração: ainda não foi salvo no servidor.");
        P.atualizarAltura();
      }
    });
    P.iniciarAbas({ abas: ["#aba-perfil", "#aba-servicos"] });
  });
})();
