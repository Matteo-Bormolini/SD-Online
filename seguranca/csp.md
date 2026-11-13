# CSP — lista do que o site pode carregar

**CSP** (Content-Security-Policy) é uma proteção grátis do navegador: o site só carrega scripts, estilos, imagens e conexões **desta lista**.
Se alguém conseguir colocar código malicioso numa página, o navegador **bloqueia**.

## Onde fica
Linha `<meta http-equiv="Content-Security-Policy" ...>` logo no começo do `<head>` de **todas** as páginas (`.html`).
O GitHub Pages não deixa configurar o servidor, então vai na própria página.

## O que está liberado

| Regra | Liberado |
|---|---|
| `default-src` | 'self' |
| `script-src` | 'self' https://www.gstatic.com https://cdn.jsdelivr.net |
| `style-src` | 'self' https://cdn.jsdelivr.net |
| `img-src` | 'self' data: blob: https://tiles.openfreemap.org https://www.google.com |
| `font-src` | 'self' |
| `connect-src` | 'self' https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://viacep.com.br https://brasilapi.com.br https://open.cnpja.com https://publica.cnpj.ws https://tiles.openfreemap.org https://cdn.jsdelivr.net |
| `worker-src` | 'self' blob: |
| `child-src` | blob: |
| `frame-src` | https://plataforma-sdonline.firebaseapp.com |
| `object-src` | 'none' |
| `base-uri` | 'self' |
| `form-action` | 'self' |
| `upgrade-insecure-requests` | — |

- `'self'` = arquivos do próprio site.
- `https://www.google.com` em `img-src`: o Firebase (Firestore) usa uma imagem do Google para testar a conexão quando a internet falha (13/11/2026).
- **Proibido:** código dentro do HTML (`<script>...</script>`, `<style>...</style>`, `onclick=`). Use sempre arquivo `.js` / `.css` separado.

## Como mudar (ex.: nova API)
1. Descubra o endereço (ex.: `https://api.exemplo.com.br`).
2. Coloque na regra certa: busca de dados → `connect-src` · script → `script-src` · imagem → `img-src`.
3. Troque a linha **igual em todas as páginas** (VS Code: Editar → Substituir em arquivos).
4. Teste: F12 → Console. Bloqueio aparece como *"violates the following Content Security Policy directive"*.

## Limites (GitHub Pages)
- `frame-ancestors` (impedir o site dentro de outro site) e relatório de bloqueios **não funcionam** pela página; só com servidor próprio (pós-MVP).
