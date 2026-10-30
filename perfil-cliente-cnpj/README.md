# Perfil do Cliente CNPJ (empresas e condomínios)

**Sprint 1 · Épico E3 Perfis · ✅ Pronto (demonstração)**

O espaço das empresas, condomínios e MEI. Além dos dados da empresa, mostra **com quem o prestador deve falar no local** e as áreas que costumam precisar de manutenção.

## Para quem
Para síndicos, administradores, gestores e responsáveis por empresas. Só a própria empresa (e o administrador, para suporte) abre esta página.

## O que entrega
- **Dados da empresa:** tipo de estabelecimento, razão social, nome fantasia e CNPJ (não pode ser alterado).
- **Responsável pela conta:** nome, cargo e contatos.
- **Contato no local:** zelador, portaria ou recepção, com telefone e horário para visitas.
- **Endereço**, telefone principal e até 4 secundários.
- **Fotos do local (opcional):** até 12 fotos das áreas, com aviso para não fotografar pessoas, placas ou documentos.
- **Aba Serviços realizados**, editar perfil, foto/logo opcional e excluir perfil.

## Histórias atendidas
- **US07** — responsável, contato no local e fotos das áreas.
- **US25** — serviços já contratados, com fotos.
- **US16, US17 e US19** — comparar até 4 orçamentos, decidir e pedir de novo (Sprint 4).
- **US32** — corrigir e apagar os dados (LGPD).

## Pronto quando
- [x] Dados, edição, fotos do local, histórico e exclusão funcionam na tela.
- [ ] Aba **Serviços** com duas partes: **Orçamentos** (até 4 por pedido) e **Serviços realizados** (Sprint 4).
- [ ] As alterações são salvas no servidor (Sprint 5).

## Como testar
Entre pelo modo demonstração como **Cliente CNPJ** e clique em **Meu perfil**.

## Parte técnica

| Arquivo | Para que serve |
|---|---|
| `index.html` | Estrutura da página. |
| `perfil-cliente-cnpj.css` | Visual do que é só deste perfil. |
| `perfil-cliente-cnpj.js` | Dados de demonstração, fotos do local e áreas comuns. |

O comportamento comum vem de [`componentes/`](../componentes/).
