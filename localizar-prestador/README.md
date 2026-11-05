# Encontrar prestadores ("Para clientes")

**Sprint 3 · Épico E4 Encontrar · 🟡 Tela pronta (demonstração)**

O cliente escolhe o tipo de serviço e vê os prestadores daquela área, do mais perto ao mais longe, com um mapa ao lado.

## Para quem
Clientes CPF e CNPJ (exige login) e administrador. Prestadores **não** acessam esta página.

## O que entrega
1. **Caixas** com os tipos de serviço (a mesma lista da Home).
2. Ao clicar, desce a **lista** de prestadores e abre o **mapa** ao lado (no celular, abaixo).
3. Ao escolher um prestador, o mapa mostra a empresa e aparece o **cartão**: logo, nome, serviços (3 + "+N"), WhatsApp e **Fazer orçamento** (abre o perfil do prestador).
4. **Destaque pago**: contorno vermelho e etiqueta. Não muda a posição na lista.
5. Ao voltar do perfil do prestador, a página abre no mesmo tipo e no mesmo prestador.

## Regras
- Ordem: do mais perto ao mais longe (pelo endereço do perfil do cliente).
- Prestador com localização **desligada** no perfil: não aparece na lista nem no mapa.
- Cliente com localização desligada: lista em ordem alfabética, sem distância, com aviso e link para o perfil.
- WhatsApp: verde só se o prestador ligar "Mostrar meu WhatsApp na busca"; senão, botão cinza "WhatsApp liberado após o orçamento".
- Sem botões de rota (Maps/Waze).

## Histórias atendidas
- **US11** — encontrar por área e proximidade, com mapa.
- **US20** — voltar à lista sem perder a escolha.
- **US12** — filtros por nome e avaliação (futuro).

## Pronto quando
- [x] Lista por área, ordenada por distância, funcionando na tela.
- [x] Mapa centrado no cliente, com destaque em vermelho.
- [x] Cartão abre a página do prestador.
- [x] Funciona no celular e no computador, tema claro e escuro.
- [ ] Botões "localização ligada/desligada" e "Mostrar meu WhatsApp na busca" nos perfis.
- [ ] Dados vindo do servidor (Sprint 5).

## Como testar
- Entre como **Cliente CPF** ou **CNPJ** (login de demonstração) e abra **Para clientes**.
- Sem localização: abra `localizar-prestador/index.html?localizacao=desativada`.
- Já com um tipo escolhido: `?categoria=eletrica` (mesmos links da Home).

## Parte técnica
| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página. |
| `localizar-prestador.css` | Caixas, lista, cartão e botões. |
| `localizar-prestador.js` | Dados de demonstração, ordem, cartão e mapa. |

- Mapa: `componentes/mapa/` (MapLibre + OpenFreeMap, grátis e sem chave).
- Tipos de serviço, destaque e endereço do mapa: `configuracoes/config.js`.
- Em produção: `GET /api/prestadores?categoria=<id>` devolve só quem tem localização ligada, a distância já calculada no servidor e o WhatsApp só de quem liberou.
