# SDOnline — S.D Serviços Digitais

Site/app que conecta clientes (casas, empresas e condomínios) a prestadores de serviço.

Abra `index.html` (leva à Home) ou qualquer `index.html` dentro das pastas.

## Mapa do projeto

| Pasta | O que faz | Situação |
|---|---|---|
| `navbar/` | Barra de navegação do topo | Pronta |
| `rodape/` | Rodapé (footer) | Pronto |
| `configuracoes/` | Configurações das páginas: links, menu, cores, botões, modelo de página | Pronta |
| `home/` | Página Home + Sobre nós | A incluir |
| `login-cadastro/` | Login e cadastro | A incluir |
| `perfil-adm/` | Perfil do administrador | Pronta (demonstração) |
| `perfil-cliente-cpf/` | Perfil do cliente CPF | A criar |
| `perfil-cliente-cnpj/` | Perfil do cliente CNPJ | A criar |
| `inicio-logado/` | Tela inicial dos logados | A criar |
| `localizar-prestador/` | Cliente localiza prestadores | A criar |
| `localizar-condominios/` | Prestador vê onde fica cada condomínio que está orçando | A criar |
| `solicitacao/` | Solicitação de serviço | A criar |
| `avaliacoes/` | Avaliações | A criar |
| `suporte/` | Suporte (erros e melhorias) | A criar |
| `politica-privacidade/` | Políticas, termos e privacidade | A criar |
| `base-de-dados/` | Estrutura do banco de dados | A definir |
| `chaves-api/` | Modelo de chaves (sem chaves reais) | Modelo |
| `seguranca/` | Regras de segurança | Regras iniciais |
| `fotos/` | Logo e imagens do site | Logo provisório |
| `docs/` | Decisões do projeto | Atualizado |

**Para continuar com outra IA:** envie `CONTEXTO-PARA-IA.md` + os arquivos da parte a trabalhar.
**Para enviar ao GitHub:** dois cliques em `enviar-github.bat` (precisa do Git para Windows).

Cada pasta tem um `README.md` explicando a parte.

## Como criar uma página nova

1. Copie `configuracoes/modelo-pagina.html` para a pasta da página com o nome `index.html`.
2. Ajuste `<title>`, `data-pagina` e `data-logado`.
3. Coloque o CSS e o JS da página na mesma pasta.

## Importante

- Tudo ainda roda só no navegador (demonstração). Login real, gravação de dados e envio de fotos dependem do servidor.
- Chaves de API e senhas **nunca** vão para o GitHub (ver `chaves-api/` e `.gitignore`).
