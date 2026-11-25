# Ver como — barra do adm (v0.8.5)

Só o **administrador** vê. Fica no topo do **Início** e mostra a página como cada conta vê, sem entrar em outro perfil:

**Adm (normal) · Visitante · Cliente CPF · Cliente CNPJ · Prestador**

- A escolha fica salva **só nesta aba** (vale ao recarregar).
- É só prévia: os dados são lidos como adm.
- **Espelho (25/11):** a prévia lê o banco **na hora** (sem leitura guardada) e separa os itens com as **mesmas funções** do cliente e do prestador (`firebase/divulgacoes.js` → `listarPrevia`). Se falhar, mostra o motivo na tela.
- Limite: a prévia **não testa as regras** da conta cliente/prestador (o adm lê tudo). Para isso, entrar com a conta real.
- Avaliações e Políticas hoje são iguais para todos. Entram aqui quando tiverem diferença.

Arquivos: `ver-como.js`, `ver-como.css` (prefixo `ver-como-`).
Mudar as opções: bloco `1. OPÇÕES` de `ver-como.js`.
