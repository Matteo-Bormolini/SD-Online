# Testes e segurança

## 12/11/2026 — testes automáticos no Firebase real (v0.7.5)
187 testes (57 por conta: cliente CPF, cliente CNPJ, prestador + 16 sem login/força bruta/ciclo de vida).
Contas de teste @example.com, apagadas no fim. Adm não testado. **178 passaram, 9 falharam** → corrigidos na v0.7.6:

| Falha | Correção (v0.7.6) |
|---|---|
| Servidor aceitava CPF/CNPJ com dígito errado | Dígitos conferidos nas regras do banco |
| Campo de texto sem limite (aceitou 700 KB) | `LIMITES()` + lista fechada de campos |
| Apagar só o perfil e recriar com outro tipo | Tipo guardado na reserva; perfil só sai junto com a reserva |
| Cadastro revela e-mail já usado | Aceito (limite do Firebase) |
| E-mail não confirmado criava perfil | Cadastro em 2 passos |
| Site sem CSP | CSP em todas as páginas (`seguranca/csp.md`) |

**Protegido (passou):** dados de outra conta, listar usuários/reservas, virar adm, campos protegidos, destaque, configurações, cadastro forjado, senha 6–128 no servidor, mesma mensagem no login errado, bloqueio após ~5 senhas erradas.

---

## 09/11/2026 — cópia local (v0.6.0-alpha.1)

Testes feitos numa **cópia local** do site (versão v0.6.0-alpha.1).
O site publicado **não** foi atacado: ele roda no GitHub, e atacar a estrutura de outra empresa é proibido.

**Legenda:** ✅ passou · ⚠️ risco a corrigir · ❌ não testado

---

## 1. Navegadores

Cada combinação abriu **20 páginas × 5 tipos de usuário** (visitante, CPF, CNPJ, prestador, adm) = 100 verificações:
página abre, sem erro no navegador, sem rolagem para os lados e sem link quebrado.

| Navegador | Tela cheia (1366 px) | Celular (390 px) | Observação |
|---|---|---|---|
| Google Chrome 153 | ✅ 100/100 | ✅ 100/100 | Navegador real. |
| Chromium (motor do Chrome) | ✅ 100/100 | ✅ 100/100 | |
| Microsoft Edge | ❌ | ❌ | Não deu para instalar no computador de testes (download bloqueado). Usa o mesmo motor do Chrome: risco baixo. |
| Brave | ❌ | ❌ | Mesmo caso do Edge. Atenção: o Brave bloqueia anúncios por padrão. |
| Opera GX | ❌ | ❌ | Não existe para Linux (computador de testes). Mesmo motor do Chrome. |
| Firefox | ❌ | ❌ | Download bloqueado. Motor **diferente** (Gecko): risco médio. |

**Teste manual sugerido (Edge, Brave, Opera GX e Firefox), 5 minutos cada:**
1. Entrar como Prestador → Meu perfil → aba Meus serviços: as 5 etapas aparecem; no celular (F12 → modo celular) abrem e fecham.
2. Abrir Encerrados → lixeira → aparece "Tem certeza?".
3. Desligar "Mostrar meus contatos" → Ver como cliente → botões cinza.
4. Trocar para o tema escuro e mudar de página: continua escuro.
5. Arrastar um cartão do quadro com o mouse.

## 2. Logins (5 testes por tipo de conta = 20)

| Teste | Cliente CPF | Cliente CNPJ | Prestador | Adm |
|---|---|---|---|---|
| Entrar com e-mail válido | ✅ | ✅ | ✅ | ✅ |
| Entrar com CPF/CNPJ válido | ✅ | ✅ | ✅ | ✅ |
| Identificador inválido é recusado | ✅ | ✅ | ✅ | ✅ |
| Senha vazia é recusada | ✅ | ✅ | ✅ | ✅ |
| Abre o próprio perfil, é barrado no de outro tipo e Sair limpa a sessão | ✅ | ✅ | ✅ | ✅ |

Feito no Google Chrome 153. O Cliente CPF que abre o perfil de um prestador vê só a versão pública (correto).

⚠️ **Na demonstração qualquer senha entra.** Isso é esperado agora, mas o login real (Ciclo 2) precisa: conferir a senha no servidor, bloquear depois de várias tentativas erradas e desligar o modo demonstração.

## 3. Ataques testados

| Ataque | Resultado |
|---|---|
| Código malicioso pelo endereço da página (XSS em `?categoria=`, `?destino=`, `?visao=`) | ✅ Bloqueado |
| Código malicioso digitado no perfil (nome fantasia, sobre) | ✅ Bloqueado (aparece como texto) |
| Código malicioso no Suporte e no assistente | ✅ Bloqueado |
| Mandar a pessoa para um site falso depois do login (`?destino=https://...`) | ✅ Bloqueado |
| Tipo de conta inventado no navegador | ✅ Ignorado |
| Nome gigante ou com código na sessão | ✅ Sem efeito |
| **Virar adm mexendo no navegador** (sessionStorage) | ✅ Desde v0.7.0: a tela pode até mudar, mas **nenhum dado** vem — o banco confere o tipo da conta (regras) |
| **Colocar o site dentro de outro site** (iframe / clickjacking) | ⚠️ Funciona |
| Chaves ou senhas esquecidas no GitHub | ✅ Nenhuma encontrada |
| Links que abrem outra aba sem proteção | ✅ Todos com `noopener` |

## 3b. Testes do fechamento do Ciclo 2 (11/11/2026, v0.7.5)
Chromium (Playwright) + Firebase FALSO em memória (o emulador do Firestore não baixa no ambiente de testes).
- ✅ 28 verificações de ponta a ponta: cadastro CPF/CNPJ/prestador, CPF inválido, documento repetido, e-mail repetido, cadastro parado no meio (apagado no login / reaproveitado no cadastro), CNPJ ativo/baixado/nome diferente/APIs fora do ar (reserva CNPJ.ws), botão do adm (modo teste), não-adm não muda a configuração, excluir conta, aviso de e-mail em todas as páginas.
- ✅ 32 aberturas de página (16 páginas, visitante e logado): 0 erros.
- ✅ No site publicado: leitura do banco sem login negada; APIs CNPJá, CNPJ.ws e BrasilAPI respondem do navegador (CORS liberado).
- ❌ Não testado aqui: regras reais com login (testar no "Playground de regras" do console) e o projeto real com e-mail de verdade.

## 4. Piores cenários e como contornar

| Cenário | Risco | Como contornar | Quando |
|---|---|---|---|
| Alguém se passa por adm ou por outro usuário | Médio | ✅ Login do Firebase + regras do banco conferem o tipo em toda consulta; demonstração desligada. ⏸️ Cookie HttpOnly: pausado (precisa de servidor pago). | Feito no Ciclo 2 |
| Alguém quer dados de outras pessoas | Alto | Servidor só envia o que o tipo de conta pode ver (`permissoes.json`); prestador recebe só região aproximada; nada de CPF/telefone de cliente no navegador. | Ciclos 2 e 4 |
| Prestador falso para descobrir endereço de condomínios | Alto | ✅ CNPJ consultado na Receita no cadastro (inativo não entra) + selo dado pelo adm. Falta: só mostrar região aproximada. | Ciclo 2 (consulta) · Ciclo 4 |
| Robô copiando a lista de prestadores | Médio | Lista só para clientes logados (já é assim); limite de consultas por conta e por IP. | Ciclo 5 |
| Derrubar o site (muitos acessos de uma vez) | Médio | Páginas estáticas em CDN aguentam bem. No servidor: proteção grátis da Cloudflare, limite de tentativas e verificação anti-robô grátis (Cloudflare Turnstile) em login, cadastro e Suporte. | Ciclos 2 e 5 |
| Gastar a cota grátis do banco (ex.: 100 mil gravações/dia) com pedidos falsos | Médio | Limite de pedidos por conta/dia e anti-robô. Isso também protege a regra "tudo grátis". | Ciclo 5 |
| Site colocado dentro de um site falso (clickjacking) | Médio | No servidor de lançamento, cabeçalhos `X-Frame-Options: DENY` e `Content-Security-Policy: frame-ancestors 'none'`. O GitHub Pages não permite esses cabeçalhos. | Ciclo 6 |
| Biblioteca do mapa trocada no site de onde vem (jsDelivr) | Baixo | Usar `integrity` (SRI) ou guardar a biblioteca no próprio site. | Ciclo 5 |
| E-mail do Suporte público no código | Baixo | Vai receber spam. Depois do MVP: formulário que envia pelo servidor e e-mail com o domínio da S.D. O e-mail atual é de instituição de ensino e pode deixar de existir. | Ciclo 6 |
| Foto que revela onde a pessoa mora (EXIF) | Médio | Servidor apaga os dados escondidos de toda foto. | Ciclo 5 |

## 5. Riscos jurídicos (não é parecer de advogado)

**"Empresa querendo o site para ela"**
- Registrar a **marca** "S.D Serviços Digitais" no **INPI**. No Brasil, em regra, a marca é de quem registra primeiro.
- Registrar o **domínio** (.com.br) no Registro.br.
- O código está público. Sem uma licença, os direitos são seus, mas qualquer um consegue copiar na prática. Avaliar deixar o repositório **privado** antes do lançamento (o GitHub permite repositório privado grátis).

**"Processar o site"**
- Termos de uso claros: a S.D só aproxima; não intermedeia, não recebe e não garante pagamento ou serviço.
- O STF mudou em 2025 a regra do artigo 19 do Marco Civil da Internet. Pontos que afetam a S.D:
  - **anúncios e impulsionamentos pagos** passam a ter presunção de responsabilidade da plataforma. O **destaque** é um impulsionamento pago. Por isso, conferir o CNPJ de quem assina o destaque é ainda mais importante;
  - a plataforma deve ter **regras publicadas**, **canal de notificação** (denúncia) para usuários e não usuários, processo de moderação e **relatório anual de transparência**;
  - a plataforma se protege quando prova que agiu **rápido e com cuidado** ao retirar conteúdo ilícito depois de avisada.
- Avaliações e fotos são conteúdo de terceiros: ter um botão "Denunciar" e prazo de resposta.
- LGPD: política de privacidade, canal para pedidos sobre dados e plano de aviso de vazamento (já no Ciclo 5).

## 6. Impostos (não é orientação contábil)

- Cobrar o destaque e receber dinheiro de anúncios exige um **CNPJ da S.D**.
- A atividade de portal/plataforma na internet (CNAE **6319-4/00**) **não é permitida para MEI**.
- No **Simples Nacional**, serviços ficam no Anexo III (a partir de **6%**) ou no Anexo V (a partir de **15,5%**). Com o **Fator R** (folha de pagamento, incluindo pró-labore, igual ou acima de 28% do faturamento), a empresa vai para o Anexo III, que paga menos.
- Para pagar o mínimo **dentro da lei**: escolher com um contador a atividade (CNAE) e o anexo certos antes de abrir o CNPJ, e planejar o pró-labore para o Fator R.
- A reforma tributária (IBS/CBS) está em transição. Confirmar as regras com o contador na hora de abrir a empresa.

## 7. Anúncios: onde pode

Regras do Google AdSense (o serviço mais comum):
- **Não pode:** em conversas privadas e chats (o **assistente do Suporte**), em pop-ups, em páginas que redirecionam sozinhas, nem em conteúdo que o Google não consegue ver (páginas que exigem login, como perfis e o quadro).
- **Cuidado com clique sem querer:** manter espaço entre o anúncio e botões e menus. O anúncio não pode parecer item do menu.
- **Bons lugares para começar:** Home do visitante, Sobre nós e páginas de conteúdo aberto (ex.: dicas de manutenção).
- Anúncios usam **cookies**: precisa de aviso e consentimento (LGPD) antes de ligar.

## Fontes

- [Google AdSense — política de posicionamento de anúncios](https://support.google.com/adsense/answer/1346295?hl=pt)
- [Google AdSense — políticas do programa](https://support.google.com/adsense/answer/23921?hl=pt)
- [Tabelas Fiscais — CNAE 6319-4/00](https://tabelasfiscais.com.br/cnae/6319400)
- [Agilize — atividades e anexos do Simples Nacional 2026](https://agilize.com.br/artigos/atividades-anexos-simples-nacional-2026/)
- [Teletime — STF publica decisão sobre o art. 19 do Marco Civil (06/11/2025)](https://teletime.com.br/06/11/2025/stf-publica-decisao-sobre-o-art-19-do-marco-civil-da-internet/)
