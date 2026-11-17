# Encontrar prestadores (menu "Serviços")

O cliente escolhe o tipo de serviço e vê os prestadores daquela área, do mais perto ao mais longe, com um mapa ao lado.

## Quem vê
- Clientes CPF e CNPJ (precisa entrar na conta) e o adm.
- O prestador **nunca** abre esta página (seria ver a concorrência).

## Como funciona
1. Caixas com os tipos de serviço (a mesma lista da Home).
2. Ao clicar: lista de prestadores + mapa (no celular, abaixo).
3. Ao escolher um prestador: cartão com logo, nome, serviços, WhatsApp e **Fazer orçamento**.
4. Destaque: contorno vermelho e etiqueta. **Não** sobe na lista.

## Regras
- Dados reais (v0.7.9): prestadores da **vitrine** (cartão público). Ponto do cliente = endereço do perfil ou **Usar minha localização atual** (GPS, pede permissão, não é salvo).
- Prestador com o botão **Localização** desligado: não aparece.
- Cliente com o botão **Localização** desligado: lista em ordem alfabética, com aviso.
- WhatsApp só aparece se o prestador deixar **Mostrar meus contatos** ligado. Senão, botão cinza "liberado após o orçamento".

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` / `localizar-prestador.css` / `localizar-prestador.js` | Página, visual e regras (dados reais). |

## Situação
✅ pronto · 🟡 só na demonstração · ⬜ a fazer

- ✅ Tela pronta (US11, US20) com dados reais e GPS (v0.7.9).
- ⬜ Botão "Pedir orçamento" grava o pedido — **Ciclo 3**.
- ⬜ Filtros por nome e avaliação — depois do MVP (US12).
