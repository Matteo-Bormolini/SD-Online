# Envio v0.8.6 — revisão geral (25/11/2026)

Versão **v0.8.6** (correções da v0.8.5). **As regras do banco MUDARAM** (áreas 60 e 80).

## 1. Firebase Console → Firestore → Regras
Apague tudo, cole `firebase/firestore.rules` → **Publicar**. Linha 2 = `REGRAS DO BANCO v0.8.6 (25/11/2026)`.
Opcional: Firestore → Índices → apague o índice `divulgacoes` · `situacao` + `atividades` (não é mais usado).

## 2. GitHub → Upload files
**ARRASTE as pastas** e os arquivos soltos de `SD-Online-envio` para a página "Upload files".
Não use "choose your files": ele joga tudo na raiz (fora das pastas).
Commit: `v0.8.6 - Revisão geral e testes reais de orçamento`

## 3. Sua pasta no computador
Troque a pasta inteira pela do `SD-Online-v0.8.6-completo.zip` (igual ao GitHub + estas mudanças).

## 4. Conferir (Claude testa ao vivo nas abas logadas)
- Prestador de Elétrica → Início: aparecem "Palestra NR-10" e "Comunidade de Eletricistas".
- Prestador → orçamento com valor acima de R$ 10.000.000: mensagem de erro (não salva).
- Cliente → Meu perfil → Serviços: "Em orçamento e em andamento" aparece antes de "Serviços realizados".
- Sino: avisos continuam chegando (fechar, orçar, concluir).

## 5. Antes do lançamento
Aba Divulgações → **Apagar exemplos** + apagar `fotos/divulgacoes/exemplo-*.webp`.
