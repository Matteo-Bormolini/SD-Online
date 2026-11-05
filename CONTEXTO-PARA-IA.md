# CONTEXTO DO PROJETO — LEIA ANTES DE TUDO

> Cole este arquivo (ou anexe) no início da conversa com qualquer IA que for continuar o projeto.
> Junto com ele, envie o arquivo da parte que será trabalhada.

## 1. O que é o projeto
- **SDOnline / S.D Serviços Digitais**: site e app que conecta clientes a prestadores de serviço (como GetNinjas/Cronoshare).
- Dono: Marco. GitHub: **Matteo-Bormolini**, repositório **SDOnline**.
- Foco atual: **manutenções** e itens que o cliente precisa (ex.: infiltração no teto → prestador; TV de monitoramento quebrada → comparar preços).
- 4 tipos de usuário: **Administrador**, **Cliente CPF** (casas), **Cliente CNPJ** (empresas/condomínios), **Prestador**.
- Diferencial: busca por proximidade, avaliação, contato e recomendações. Destaques pagos aparecem identificados.
- **Tudo tem de ser grátis e sem prazo de validade** (APIs, mapas, banco, hospedagem), inclusive no lançamento. Lista conferida: `docs/guia-tecnico.md`, seção 11.

## 2. Como a IA deve trabalhar (regras do Marco)
- Responder em português, simples, direto e resumido. Poucos emojis.
- Não inventar informações. Não dizer que testou algo sem testar.
- **Não mudar o objetivo, o visual nem partes prontas sem autorização.**
- Manter os nomes, pastas e padrões já definidos (abaixo).
- Código com comentários curtos em português, nomes claros, fácil de editar.
- Ao corrigir, alterar só o necessário; entregar o arquivo completo pronto para copiar.
- Perguntar só quando faltar algo essencial.
- Concluir uma parte antes de começar a próxima.

## 3. Onde está cada coisa
- **Plano do produto (macro-objetivo, épicos, histórias, MoSCoW, Sprints):** `docs/backlog.md`. Leia antes de propor qualquer coisa nova.
- **Visão geral e mapa das pastas:** `README.md` da raiz.
- **Regras técnicas:** `docs/guia-tecnico.md`.
- **Cada pasta tem um README** no formato de entrega de Sprint (status, histórias, "Pronto quando").
- **Decisões antigas (até 20/10/2026):** `docs/decisoes.md`.

## 4. Regras técnicas obrigatórias
- Toda página nova nasce de `modelo-pagina/index.html`, salva como `<pasta>/index.html`.
- Ordem dos scripts: `../seguranca/acesso.js` → `../configuracoes/config.js` → `../navbar/navbar.js` → `../rodape/rodape.js` → componentes → arquivo da página. CSS: `base.css` → `navbar.css` → `rodape.css` → componentes → página.
- `<body data-pagina="..." data-logado="sim|nao" data-tipo="..." data-raiz="../">`, `<header id="sd-navbar">` e `<footer id="sd-rodape">` vazios. Navbar e rodapé são montados por JS. **Nunca escrever navbar/rodapé à mão.**
- Links entre páginas: ficam só em `configuracoes/config.js`.
- Usar os tokens de cor do `base.css` (`var(--cor-...)`). Não criar cores novas sem autorização.
- Segurança: senha só com hash no servidor (ninguém vê, nem o adm). Bloqueio de acesso real é feito no servidor; `data-logado` só muda a tela. Chaves e fotos de usuários nunca vão para o GitHub.
- A S.D **não faz pagamentos**: cliente e prestador combinam entre eles. No futuro o prestador só informa como cobra.

## 5. Padrão visual
- Fundo `#F2ECE6`. Abre no tema claro; se o usuário escolher o escuro, a escolha fica salva em todas as páginas.
- Destaque pago: vermelho brilhante `#E00000` (contorno + etiqueta "Destaque pago"); tag `destaque` no banco e no HTML (`data-tag="destaque"`).
- Navbar e rodapé vinho `#800000` com texto branco; hover `#5C0000` com contorno branco.
- Botões brancos com borda preta; hover vinho com texto branco. Links vinho.
- Cartões brancos com contorno fino preto e cantos arredondados.
- Menu compacto (3 riscos) abaixo de 1260px. Responsivo para celular, tablet, PC e TV.
- Marca: "Serviços" em cima, "Digitais" embaixo; logo = engrenagem com capacete (provisório).
- Números sem gráficos e sem emojis.

## 6. Fluxo do pedido (aprovado)
Resumo abaixo; versão completa em `docs/backlog.md`, seção 3.
1. Cliente escolhe a área e vê os prestadores do mais perto ao mais longe (mapa centrado nele).
2. Na página do prestador, escolhe o serviço e pede orçamento (a quantos quiser).
3. Pedido entra na coluna "A orçar" do prestador (aviso no site e por e-mail); ele decide se atende.
4. Prestador envia orçamento padrão (serviço, materiais, mão de obra, valores, datas).
5. Cliente compara até 4 orçamentos por pedido (os extras ficam guardados, com aviso).
6. Cliente aceita (com confirmação), recusa (sem motivo; prestador vê em vermelho; arquivado após 30 dias) ou faz contraproposta.
7. Prestador libera WhatsApp (verde) e/ou e-mail (vinho); cinza = não liberado.
8. Prestador vê só a região aproximada do cliente. A S.D não faz pagamentos.

## 7. Próximos passos
Seguir a Sprint atual em `docs/backlog.md` (seção 5). Concluir a Sprint antes de começar a próxima.
