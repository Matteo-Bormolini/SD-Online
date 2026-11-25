# Envio v0.8.5 — pasta completa + espelho do adm (25/11/2026)

Versão continua **v0.8.5**. **Regras do banco não mudaram** (as que estão publicadas valem).

**Erro corrigido:** na conta adm, "Ver como → Cliente CPF/CNPJ" mostrava "Nenhum comunicado no momento".
Causa: a última leitura guardada no navegador estava vazia; ao desenhar a área vazia dava um erro
(`Cannot read properties of undefined (reading 'addEventListener')`) e a leitura nova do banco não acontecia.

## 1. Sua pasta no computador
Troque a pasta inteira por esta (ela é igual ao GitHub + as mudanças abaixo).
As pastas `solicitacao/` e `interruptores/` **não existem mais** desde a v0.8.5 (não copie de volta).

## 2. GitHub → Upload files (só estes 12 arquivos; o resto já está igual)
- `firebase/divulgacoes.js` · `firebase/README.md`
- `home/home.js` · `home/home-prestador.js` · `home/README.md`
- `perfil-adm/divulgacoes-adm.js` · `perfil-adm/README.md`
- `componentes/ver-como/README.md`
- `docs/versoes.md` · `README.md` · `CONTEXTO-PARA-IA.md` · `LEIA-ME-ENVIO.md`

Commit: `v0.8.5 - espelho do adm e Divulgacoes`

## 3. Conferir (conta adm)
1. Início → **Ctrl+Shift+R** (recarrega os arquivos novos).
2. **Ver como → Cliente CPF** e **Cliente CNPJ**: Comunicados da S.D + Anúncios iguais aos da conta cliente.
3. **Ver como → Prestador**: Comunicados da S.D → Divulgações → Agenda → Grupos.
4. Se aparecer "Não foi possível carregar a prévia agora…", a frase seguinte diz o motivo e o que fazer.
5. Exemplo novo "complete seu perfil" (Divulgações): aba Divulgações → **Apagar exemplos** → **Criar exemplos ilustrativos** (14).

## 4. Antes do lançamento
Aba Divulgações → **Apagar exemplos** + apagar `fotos/divulgacoes/exemplo-*.webp`.
