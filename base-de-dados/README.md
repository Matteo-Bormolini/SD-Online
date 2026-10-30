# Banco de dados

**Sprint 5 · Épico E9 Servidor, segurança e LGPD · ⬜ Planejada**

É onde as informações vão ficar guardadas de verdade: contas, pedidos, orçamentos e avaliações.
Sem ele, o site é só demonstração.

## Para quem
Para todos os usuários (de forma invisível) e para a equipe S.D.

## O que vai guardar
Contas (4 tipos) · telefones · endereços · pedidos · orçamentos · contrapropostas · avaliações · fotos · avisos.

## Histórias atendidas
- **US30** — dados guardados com segurança.
- **US32** — ver, corrigir, baixar e apagar os dados.
- **US03 a US05** — contas reais.

## Pronto quando
- [ ] Tabelas criadas e documentadas aqui.
- [ ] Senhas guardadas só como *hash* (ninguém consegue ler).
- [ ] CPF/CNPJ único e sem alteração.
- [ ] Localização guardada de forma que o prestador só receba uma área aproximada.
- [ ] Prazo definido para apagar dados antigos (ex.: orçamentos arquivados).
- [ ] Testes de segurança feitos.

## Parte técnica
- Hoje: só este README. A estrutura será definida na Sprint 5.
- Cópias do banco (backup) **nunca** vão para o GitHub. O `.gitignore` bloqueia os formatos mais comuns.
