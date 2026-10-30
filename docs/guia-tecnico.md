# Guia técnico — S.D Serviços Digitais

Tudo o que você precisa saber para mexer no código sem quebrar o padrão.

---

## 1. Regras de ouro

1. **Menu, rodapé, cores, botões e campos** existem uma vez só. Para mudar, edite só a pasta deles.
2. **Toda página nova** nasce do [`modelo-pagina/`](../modelo-pagina/).
3. **Todo link entre páginas** fica em `configuracoes/config.js`.
4. **Esconder na tela não é segurança.** O bloqueio de verdade é feito no servidor.

## 2. Onde mudar cada coisa

| Quero mudar... | Arquivo |
|---|---|
| Cores, fontes, botões, links, mensagens | `configuracoes/base.css` |
| Links das páginas, itens do menu e do rodapé, ícones | `configuracoes/config.js` |
| Quem vê cada página e cada dado | `seguranca/acesso.js` **e** `seguranca/permissoes.json` |
| Barra do topo | `navbar/` |
| Rodapé | `rodape/` |
| Campos de formulário | `componentes/formulario/formulario.css` |
| Formatar telefone, CEP, data, R$, estrelas | `componentes/utilidades/utilidades.js` |
| O que é igual nos 4 perfis | `componentes/perfil-base/` |

## 3. Como toda página é montada

Cada página fica em `<pasta>/index.html`, com o CSS e o JS dela na mesma pasta.

**Ordem dos arquivos no `<head>`:**

```html
<!-- 1. Estilos do padrão -->
<link rel="stylesheet" href="../configuracoes/base.css">
<link rel="stylesheet" href="../navbar/navbar.css">
<link rel="stylesheet" href="../rodape/rodape.css">
<!-- 2. Estilos dos componentes usados (opcional) e da página -->
<link rel="stylesheet" href="NOME-DA-PAGINA.css">

<!-- 3. Scripts, nesta ordem -->
<script src="../seguranca/acesso.js" defer></script>
<script src="../configuracoes/config.js" defer></script>
<script src="../navbar/navbar.js" defer></script>
<script src="../rodape/rodape.js" defer></script>
<!-- 4. Scripts dos componentes usados (opcional) e da página -->
<script src="NOME-DA-PAGINA.js" defer></script>
```

**Estrutura do `<body>`:**

```html
<body data-pagina="inicio" data-logado="nao" data-tipo="" data-raiz="../" data-recurso="">
  <header id="sd-navbar"></header>   <!-- o menu é montado sozinho -->
  <main id="conteudo"> ... </main>
  <footer id="sd-rodape"></footer>   <!-- o rodapé é montado sozinho -->
</body>
```

| Atributo | Para que serve | Valores |
|---|---|---|
| `data-pagina` | Destaca o item atual do menu | inicio, servicos, clientes, prestador, sobre, politicas, suporte, perfil |
| `data-logado` | Diz se a pessoa entrou (o servidor preenche) | `sim` / `nao` |
| `data-tipo` | Tipo de usuário logado | cliente-cpf, cliente-cnpj, prestador, adm |
| `data-raiz` | Caminho até a pasta principal | `../` |
| `data-recurso` | Regra de acesso da página (vazio = página pública) | um nome de `seguranca/acesso.js`, ex.: `perfil-adm` |
| `data-recurso-publico` | (opcional) Versão pública da página | ex.: `perfil-prestador-publico` |

## 4. Criar uma página nova

1. Copie a pasta `modelo-pagina/` e renomeie (ex.: `sobre/`).
2. Troque o `<title>`, o `data-pagina` e o conteúdo.
3. Se precisar de estilo próprio, crie `sobre.css` usando só as cores `var(--cor-...)` do `base.css`.
4. Se a página não for pública, crie a regra em `seguranca/acesso.js` **e** em `seguranca/permissoes.json`, e coloque `data-recurso` no `<body>`.
5. Coloque o caminho da página em `configuracoes/config.js`.
6. Escreva o README da pasta (use o modelo do item 9).

## 5. Tipos de usuário

O mesmo nome é usado em todo o site.

| Tipo | "Meu perfil" abre | No menu, depois de entrar |
|---|---|---|
| `cliente-cpf` | `perfil-cliente-cpf/` | vê "Para clientes" |
| `cliente-cnpj` | `perfil-cliente-cnpj/` | vê "Para clientes" |
| `prestador` | `perfil-prestador/` | vê "Seja um prestador" |
| `adm` | `perfil-adm/` | vê os dois |

O visitante vê os itens com cadeado e é levado ao login ao clicar.

## 6. Modo demonstração (sem servidor)

- Em `configuracoes/config.js`: `modoDemonstracao: true`.
- Ao "entrar", o site guarda só `{ tipo, nome }` na aba do navegador (`sessionStorage`). **Nunca guarda senha.**
- Fechar a aba ou abrir `?sair=1` desconecta.
- **Proteção das páginas:** se a pessoa não pode ver a página (`data-recurso`), o visitante vai para o login e quem já entrou vai para o início. Se existir `data-recurso-publico` e a pessoa puder vê-lo, abre só a versão pública (`?visao=cliente`).
- Quando o servidor existir: troque para `modoDemonstracao: false`.

## 7. Cores oficiais

| Uso | Cor |
|---|---|
| Fundo (tema claro) | `#F2ECE6` |
| Botões | fundo `#FFFFFF`, borda `#000000` |
| Hover de botões, links e setas | `#800000` |
| Menu e rodapé | `#800000` (hover do menu `#5C0000`) |
| Fundo (tema escuro) | `#161312` |

O site sempre abre no tema claro. O escuro só aparece se a pessoa escolher.
Regras visuais completas: [`padrao-global.md`](padrao-global.md) e [`prompt-mestre-padrao-visual.md`](prompt-mestre-padrao-visual.md).

## 8. Segurança

- `data-logado`, `data-tipo` e a sessão de demonstração **só mudam a tela**. Qualquer pessoa pode alterar isso no navegador.
- Login, permissões e dados têm de ser conferidos **no servidor** (Sprint 5).
- Senha: só o *hash* fica no servidor. Ninguém vê, nem o administrador.
- Textos vindos de fora passam por escape (`textContent` ou `SD.esc`) antes de entrar na página.
- Chaves de API, fotos de usuários e cópias do banco **nunca** vão para o GitHub. O `.gitignore` da raiz bloqueia esses arquivos.
- Localização: o servidor envia ao navegador só uma área aproximada, nunca o endereço exato.

## 9. Modelo de README de pasta

Cada pasta é tratada como uma entrega de Sprint:

```markdown
# Nome da entrega

**Sprint X · Épico EX · Status**

Uma ou duas frases dizendo o que é, em linguagem simples.

## Para quem
## O que entrega
## Histórias atendidas
## Pronto quando
## Como testar
## Parte técnica
```

## 10. Publicar no GitHub Pages

1. Envie o conteúdo do projeto para a raiz do repositório.
2. No GitHub: **Settings → Pages → Source: Deploy from a branch** → branch `main`, pasta `/ (root)`.
3. O `index.html` da raiz abre a página inicial.
