# CONTEXTO DO PROJETO — LEIA ANTES DE TUDO

> Cole este arquivo no início da conversa com qualquer IA que for continuar o projeto.
> Junto, envie os arquivos da parte que será trabalhada.

## 1. O projeto
- **S.D Serviços Digitais (SD-Online):** site/app que conecta clientes a prestadores de manutenção.
- Projeto **individual** do Marco (GitHub **Matteo-Bormolini**, repositório **SD-Online**). Sem equipe, sem Scrum.
- 4 tipos de conta: **Administrador**, **Cliente CPF**, **Cliente CNPJ**, **Prestador** (CNPJ ou MEI).
- **Dinheiro:** a S.D não intermedeia o serviço nem o pagamento. Cliente não paga nada. Sem preço padrão: cada orçamento diz o valor e se cobra visita (e quanto).
  A S.D ganha com **anúncios** e **destaque** do prestador (mensal, cancelável, a partir de R$ 20 — depois do MVP).
- **Tudo grátis e sem prazo** (APIs, mapas, banco, hospedagem). Lista: `docs/guia-tecnico.md`, seção 11.

## 2. Como a IA deve trabalhar
- Português simples, direto e resumido. Poucos emojis.
- Não inventar. Não dizer que testou sem testar.
- Não mudar objetivo, visual ou partes prontas sem autorização. **Avisar antes de mexer em pastas de código.**
- Código com comentários curtos em português e nomes claros.
- Uma coisa por vez: concluir a parte atual antes da próxima.

## 3. Onde está cada coisa
- Lista de tarefas e Ciclos: `docs/backlog.md` · Decisões: `docs/decisoes.md` · Versões: `docs/versoes.md`.
- Testes e riscos: `docs/testes-e-seguranca.md` · Regras técnicas: `docs/guia-tecnico.md`.
- Cada pasta tem um README curto.

## 4. Regras técnicas obrigatórias
- Página nova nasce de `modelo-pagina/index.html`.
- Scripts: `seguranca/acesso.js` → `configuracoes/config.js` → (`configuracoes/interruptores.js`) → `navbar` → `rodape` → componentes → página → **`firebase/firebase.js` por último** (`type="module"`).
- **Servidor = Firebase** (Auth + Firestore, plano grátis). Só `firebase/firebase.js` fala com ele. Regras do banco: `firebase/firestore.rules` (colar no console). Login do MVP só por e-mail.
- Navbar e rodapé são montados por JS. **Nunca escrever à mão.** Links só em `configuracoes/config.js`.
- Só cores do `base.css` (`var(--cor-...)`).
- **Excluir ou editar:** sempre `SDConfirmar(...)` (`componentes/confirmacao/`).
- **Botões liga/desliga:** desligado cinza escuro, ligado vinho; todos cadastrados em `configuracoes/interruptores.js`.
- Bloqueio real é das **regras do banco** (`firebase/firestore.rules`); a tela só esconde. Senha: só o Firebase guarda (com hash); o site nunca grava senha.
- Prestador **nunca** vê a área "Serviços" nem outros prestadores. Avaliações anônimas por padrão.

## 5. Fluxo do pedido
1. Cliente escolhe a área → prestadores do mais perto ao mais longe.
2. Cliente cria **uma solicitação** (3 fotos obrigatórias, até 6) e marca vários prestadores em Localizar → entra em **A orçar** de cada um (aviso no site e por e-mail). Sem resposta em **10 dias** → expira.
3. Prestador: *Fazer orçamento* (orçamento padrão + cobra visita? quanto?) ou *Não vou orçar*.
4. Ao enviar o orçamento, o contato do prestador é liberado. Cliente compara até 4 e aceita ou recusa. **Sem contraproposta:** negociação pelo WhatsApp.
5. **Só o cliente** marca como finalizado (2 a 6 fotos + avaliação) → Prestados. Prestador pode responder à avaliação.
6. Terminou sem serviço → **Encerrados** (apagado 1 ano depois; lixeira apaga antes).

## 6. Agora
Ver "Agora" em `docs/backlog.md`.
