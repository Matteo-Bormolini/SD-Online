# Pedido de orçamento

Onde o cliente pede um orçamento a um prestador.

## Quem vê
- Clientes CPF e CNPJ (e o adm).

## Como vai funcionar
1. O cliente cria **uma solicitação**: descreve o problema e envia **3 fotos obrigatórias** (até 6) de ângulos diferentes.
2. Na página **Localizar prestador**, vê avaliações, serviços e localização e **marca os prestadores** que quer. O mesmo pedido vai para todos.
3. O pedido entra na etapa **A orçar** de cada prestador (aviso no site e por e-mail). Sem resposta em **10 dias**, expira.
4. O prestador escolhe: **Fazer orçamento** (valor + se cobra visita e quanto) ou **Não vou orçar** (vai para Encerrados).

## Arquivos
| Arquivo | Para que serve |
|---|---|
| `index.html` | Página provisória ("em desenvolvimento"). |

## Situação
- ➖ Página não usada desde a v0.8.0 (fluxo "Contato registrado"): o pedido acontece em **Localizar prestador** (WhatsApp ou "Pedir contato") e no perfil. Telas em `componentes/pedidos`. Fica guardada; decidir no fim do Ciclo 3 se apaga.
