# Versões

## Como os números funcionam (SemVer)

`vX.Y.Z` → **X** muda no lançamento (v1.0.0) · **Y** muda a cada Ciclo concluído · **Z** muda em correções.
Versões de teste no meio de um Ciclo: `vX.Y.Z-alpha.N`.

- Nenhuma versão antiga é apagada: dá para voltar se algo quebrar.
- Cada versão = uma **tag** + uma **Release** no GitHub.

## Plano

| Versão | Quando |
|---|---|
| v0.6.0 | Fim do Ciclo 1 (decisões: servidor, domínio, CNPJ verificado) |
| v0.7.0 | Fim do Ciclo 2 (contas reais) |
| v0.8.0 | Fim do Ciclo 3 (encontrar e pedir) |
| v0.9.0 | Fim do Ciclo 4 (orçar e decidir) |
| v0.10.0 | Fim do Ciclo 5 (segurança e LGPD) |
| v1.0.0 | Lançamento fechado (inclui os textos legais com advogado) |

## Histórico

| Versão | Data | O que entrou |
|---|---|---|
| v0.6.0 | 11/11/2026 | Fim do Ciclo 1: decisões fechadas (servidor Firebase, CNPJ conferido com selo, sem domínio no 1º ano). |
| v0.7.0-alpha.2 | 11/11/2026 | Senha mínima de 6 caracteres (antes 12), no site e no Firebase. |
| v0.7.0-alpha.1 | 11/11/2026 | Firebase: pasta `firebase/` (login, cadastro com CPF/CNPJ único, sair, esqueci a senha pelo pop-up, confirmação de e-mail, perfil real com editar/excluir, botões liga/desliga salvos) e regras do banco (`firebase/firestore.rules`). Login só por e-mail no MVP. Modo demonstração desligado. |
| v0.6.0-alpha.2 | 09/11/2026 | Decisões do funcionamento do pedido (fotos 3 obrigatórias até 6; sem contraproposta); quadro: A orçar expira em 10 dias, só o cliente finaliza (Prestados); aviso quando "Mostrar meus contatos" está desligado; botão também no cadastro do Prestador; backlog com parceiros/ofertas e explicação das versões. |
| v0.6.0-alpha.1 | 09/11/2026 | READMEs para projeto individual; quadro do prestador com A orçar, sanfona no celular e Encerrados; pop-up de confirmação padrão; botões Localização e Mostrar meus contatos; lista única de botões liga/desliga; WhatsApp/Ligar no "Ver como cliente"; e-mail do Suporte; relatório de testes. |
| v0.5.1 | 06/11/2026 | Recuperação de acesso e componentes (tag aponta para f53503f). |
| v0.5.0 | 06/11/2026 | Componentes (tag aponta para d5e17f1, versão incompleta). |
| v0.4.0 | 05/11/2026 | Localizar prestador. |
| v0.3.1-Faxina_tecnica | 03/11/2026 | Ajustes das páginas. |
| v0.3.0 | 30/10/2026 | READMEs, backlog e fluxos. |
| v0.2.0-alpha.1 | 30/10/2026 | Página Suporte. |
| v0.0.0 | — | Perfis. |

Observação: também existe a tag `V0.4.0` (V maiúsculo), fora do padrão. Fica guardada, não apagar.
