# Configurações

O "painel de controle" do site. Tudo que vale para o site inteiro fica aqui, **uma vez só**.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `base.css` | Cores (claro e escuro), letras, botões, links, mensagens, pop-ups e **botões liga/desliga**. |
| `config.js` | Links das páginas, itens do menu e do rodapé, ícones, tema escuro salvo, sessão da tela e a **lista única de serviços** (área principal + atividades secundárias + aviso de taxa). |
| `interruptores.js` | **Lista de todos os botões liga/desliga**: nome, o que faz, se começa ligado ou desligado, quem tem e onde fica. |

## Como mudar
- Uma cor → `base.css`, seção 1 (claro) e 2 (escuro).
- Um link ou item do menu → `config.js`, parte `paginas` ou `menu`.
- Se um botão começa ligado ou desligado → `interruptores.js`, campo `padrao` (`true` = ligado).
- Aviso que aparece quando o botão está desligado → campo `avisoDesligado`.
- Ver todos os botões em cartões → página `interruptores/` (entrar como adm).

## Padrão dos botões liga/desliga
- Desligado = **cinza escuro**. Ligado = **vinho**.
- O estado também aparece escrito ("Ligado" / "Desligado").

## Cuidado
- O modo demonstração (dados fictícios) foi retirado na v0.7.9: o login é sempre o real (Firebase).
