# Selos das lojas (Baixe o app)

Enquanto os selos não forem ligados, o rodapé mostra o botão de texto com o ícone de celular.

| Arquivo | De onde baixar | Versão |
|---|---|---|
| `app-store.svg` | [Apple — Marketing Resources](https://developer.apple.com/app-store/marketing/guidelines/) | Selo **branco** em **Português Brasil** (fica bom no fundo vinho) |
| `google-play.svg` | [Google Play — Partner Marketing Hub](https://partnermarketinghub.withgoogle.com/brands/google-play/google-play/lockups-icons-badges/) | Selo oficial em português |

## Regras das lojas (conferidas em 06/11/2026)
- **Não desenhar, recolorir, girar ou animar** os selos. Usar o arquivo oficial.
- **Apple:** oferece selo preto (preferido) e branco. Não usar a maçã sozinha.
- **Google Play:** o selo **não pode** mudar de cor nem virar monocromático. Não usar o ícone (triângulo) sozinho.
- Por isso um selo "sem cor" só é possível na Apple (branco). O do Google fica com as cores oficiais.

## Como ligar
1. Salve os arquivos aqui com estes nomes: `app-store.svg` e `google-play.svg`.
2. Em `configuracoes/config.js` → `lojas`, preencha `selo` de cada loja (ex.: `"fotos/marca/lojas/app-store.svg"`).
3. Quando o app for publicado, preencha também `href` com o link da loja.
