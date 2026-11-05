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

## Campos já definidos (05/11/2026)
Prestador:
- `tags` — lista de etiquetas. **`destaque`** = destaque pago (liga/desliga pelo administrador).
- `localizacao_ativa` (sim/não) — desligado: não aparece em mapas e listas; o perfil informa que não disponibilizou a localização.
- `whatsapp_publico` (sim/não) — desligado: o número **não** é enviado ao navegador na busca.
- `latitude`, `longitude` — calculados pelo servidor a partir do endereço da empresa.

Clientes (CPF e CNPJ):
- `localizacao_ativa` (sim/não) e o ponto do endereço do perfil (só para calcular distâncias; nunca enviado ao prestador).

## Parte técnica
- Hoje: só este README. A estrutura será definida na Sprint 5.
- Cópias do banco (backup) **nunca** vão para o GitHub. O `.gitignore` bloqueia os formatos mais comuns.
