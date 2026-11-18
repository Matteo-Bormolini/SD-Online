# Pedidos — telas do fluxo "Contato registrado" (v0.8.0)

Carregado **sozinho** por `firebase/pedidos.js` para quem tem conta completa (não precisa colocar `<script>` nas páginas).

| Parte | Quem vê | O que faz |
|---|---|---|
| Aviso de cobrança | Cliente | Antes do WhatsApp: visita técnica, taxa extra, "a S.D não participa da negociação". Repete só depois de 7 dias. |
| Pedir contato | Cliente | Prestador com contatos escondidos: descrição (10–500) + fotos opcionais (até 6). |
| "Você fez orçamento?" | Prestador | Janela ao entrar no site. Não → Encerrados · Sim → formulário · Responder depois. |
| Formulário do orçamento | Prestador | Informativo: valor total*, validade*, visita, visitas, materiais, mão de obra, funcionários, início, duração, observações. |
| Bloco "Em orçamento" | Cliente | Perfil → Serviços. Um bloco por pedido, um cartão por prestador, "Fechei com este", "Não fechei com nenhum", aviso sutil de 10 dias, lembretes. |

## Mudar textos e prazos
- Textos: bloco `1. TEXTOS` de `pedidos.js`.
- Prazos (10 dias, 7 dias, 1 ano, lembretes) e **fotos obrigatórias** (US13): bloco `1. CONFIGURAÇÃO` de `firebase/pedidos.js` (+ área 00 das regras do banco).

Arquivos: `pedidos.js`, `pedidos.css` (prefixo `pd-`).
