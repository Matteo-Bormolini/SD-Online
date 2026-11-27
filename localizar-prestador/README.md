# Encontrar prestadores (menu "Serviços")

O cliente escolhe o tipo de serviço e vê os prestadores daquela área, do mais perto ao mais longe, com um mapa ao lado.

## Quem vê
- Clientes CPF e CNPJ (precisa entrar na conta) e o adm.
- O prestador **nunca** abre esta página (seria ver a concorrência).

## Como funciona
1. Caixas com os tipos de serviço (a mesma lista da Home).
2. Ao clicar: lista de prestadores + mapa (no celular, abaixo).
3. **Filtros** (v0.8.0): nome, horário (1º horário: dias de semana / fim de semana; Atende emergência), distância e preço da visita (não cobra = R$ 0; não informado só em "Qualquer preço").
4. Ao escolher um prestador: cartão com logo, nome, serviços, **visita técnica**, WhatsApp (ou **Pedir contato**) e **Ver perfil**.
5. Destaque: contorno vermelho e etiqueta. **Não** sobe na lista.

## Regras
- Dados reais (v0.7.9): prestadores da **vitrine** (cartão público). Ponto do cliente = endereço do perfil ou **Usar minha localização atual** (GPS, pede permissão, não é salvo).
- Prestador com o botão **Localização** desligado (v0.8.4): continua na lista, no fim e sem distância, com "sem localização no mapa". Não aparece no mapa; ao clicar nele o mapa volta para o cliente. Some quando o cliente filtra por distância.
- Cliente com o botão **Localização** desligado: lista em ordem alfabética, com aviso.
- WhatsApp só aparece se o prestador deixar **Mostrar meus contatos** ligado; antes de abrir, **aviso de cobrança** e o contato é **registrado** (v0.8.0). Senão, botão **Pedir contato**.

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `localizar-prestador.css` / `localizar-prestador.js` | Página, visual e regras (dados reais). |

## Situação
✅ pronto · ⬜ a fazer

- ✅ Tela pronta (US11) com dados reais e GPS (v0.7.9).
- ✅ Filtros (nome, horário, distância, preço da visita), aviso de cobrança, contato registrado e Pedir contato (v0.8.0). Contato registrado testado no site publicado em 25/11/2026.
- ✅ Mapa desenhado de verdade no site publicado (27/11/2026).
- ⬜ Filtro por **avaliação** — logo depois da página Avaliações (**Ciclo 4**).
- ⬜ Voltar à lista sem perder os filtros — **Ciclo 4** (US20; hoje o tipo e o prestador já ficam guardados).
