# CONTEXTO DO PROJETO — LEIA ANTES DE TUDO

> Cole este arquivo (ou anexe) no início da conversa com qualquer IA que for continuar o projeto.
> Junto com ele, envie o arquivo da parte que será trabalhada.

## 1. O que é o projeto
- **SDOnline / S.D Serviços Digitais**: site e app que conecta clientes a prestadores de serviço (como GetNinjas/Cronoshare).
- Dono: Marco. GitHub: **Matteo-Bormolini**, repositório **SDOnline**.
- Foco atual: **manutenções** e itens que o cliente precisa (ex.: infiltração no teto → prestador; TV de monitoramento quebrada → comparar preços).
- 4 tipos de usuário: **Administrador**, **Cliente CPF** (casas), **Cliente CNPJ** (empresas/condomínios), **Prestador**.
- Diferencial: busca por proximidade, avaliação, contato e recomendações. Destaques pagos aparecem identificados.

## 2. Como a IA deve trabalhar (regras do Marco)
- Responder em português, simples, direto e resumido. Poucos emojis.
- Não inventar informações. Não dizer que testou algo sem testar.
- **Não mudar o objetivo, o visual nem partes prontas sem autorização.**
- Manter os nomes, pastas e padrões já definidos (abaixo).
- Código com comentários curtos em português, nomes claros, fácil de editar.
- Ao corrigir, alterar só o necessário; entregar o arquivo completo pronto para copiar.
- Perguntar só quando faltar algo essencial.
- Concluir uma parte antes de começar a próxima.

## 3. Estrutura de pastas (uma pasta por parte)
| Pasta | Parte | Situação |
|---|---|---|
| `configuracoes/` | `config.js` (links, menu, ícones), `base.css` (cores, botões), `modelo-pagina.html` | Pronta |
| `navbar/` | `navbar.js` + `navbar.css` | Pronta |
| `rodape/` | `rodape.js` + `rodape.css` | Pronto |
| `home/` | `index.html` (Home) + `sobre.html` | Em construção |
| `login-cadastro/` | Login e cadastro | Em construção |
| `perfil-adm/` | `index.html`, `perfil.css`, `perfil.js` | Pronta (demonstração) |
| `perfil-cliente-cpf/` | Perfil cliente CPF | A criar |
| `perfil-cliente-cnpj/` | Perfil cliente CNPJ | A criar |
| `inicio-logado/` | Tela inicial dos logados | A criar |
| `localizar-prestador/` | Cliente busca prestadores | A criar |
| `localizar-condominios/` | Prestador vê onde ficam os condomínios que está orçando | A criar |
| `solicitacao/` | Pedido de serviço | A criar |
| `avaliacoes/` | Avaliações | A criar |
| `suporte/` | Suporte | A criar |
| `politica-privacidade/` | Políticas, termos, privacidade | A criar |
| `base-de-dados/` | Banco de dados | A definir |
| `chaves-api/` | Só o modelo `.env.example` (nunca chaves reais) | Modelo |
| `seguranca/` | Regras de segurança | Regras iniciais |
| `fotos/` | Logo e imagens do site | Logo provisório |
| `docs/decisoes.md` | **Todas as decisões detalhadas** | Atualizado |

## 4. Regras técnicas obrigatórias
- Toda página nova nasce de `configuracoes/modelo-pagina.html`, salva como `<pasta>/index.html`.
- Toda página carrega, nesta ordem: `../configuracoes/base.css`, `../navbar/navbar.css`, `../rodape/rodape.css`, `../configuracoes/config.js`, `../navbar/navbar.js`, `../rodape/rodape.js` e depois os arquivos da própria página.
- `<body data-pagina="..." data-logado="sim|nao" data-raiz="../">`, `<header id="sd-navbar">` e `<footer id="sd-rodape">` vazios. Navbar e rodapé são montados por JS. **Nunca escrever navbar/rodapé à mão.**
- Links entre páginas: usar `SD.url(SD.CONFIG.paginas.<nome>)`. Para mudar um link, editar só `configuracoes/config.js`.
- Usar os tokens de cor do `base.css` (`var(--cor-...)`). Não criar cores novas sem autorização.
- Segurança: senha só com hash no servidor (ninguém vê, nem o adm). Bloqueio de acesso real é feito no servidor; `data-logado` só muda a tela. Chaves e fotos de usuários nunca vão para o GitHub.

## 5. Padrão visual
- Fundo `#F2ECE6`. Abre sempre no tema claro; o escuro só ativa se o usuário escolher.
- Navbar e rodapé vinho `#800000` com texto branco; hover `#5C0000` com contorno branco.
- Botões brancos com borda preta; hover vinho com texto branco. Links vinho.
- Cartões brancos com contorno fino preto e cantos arredondados.
- Menu compacto (3 riscos) abaixo de 1260px. Responsivo para celular, tablet, PC e TV.
- Marca: "Serviços" em cima, "Digitais" embaixo; logo = engrenagem com capacete (provisório).
- Números sem gráficos e sem emojis.

## 6. Fluxo do cliente
1. Seleciona o que precisa e descreve o caso.
2. Marca se precisa ir ao local (data em dia útil, ou falar com o zelador).
3. Recebe os 3 primeiros orçamentos; se nenhum servir, vê a lista completa.
4. Escolhe o prestador e negocia por WhatsApp ou telefone.

## 7. Próximos passos sugeridos
1. Incluir a Home original e o login.html do Marco (adaptando ao padrão: remover navbar/rodapé escritos à mão).
2. Perfil Cliente CPF e Perfil Cliente CNPJ (partindo do perfil-adm).
3. Solicitação → Localizar prestador → Localizar condomínios.
4. Avaliações, Suporte e textos legais (revisar com advogado, LGPD).
5. Servidor e banco de dados (login real, gravação, fotos).
