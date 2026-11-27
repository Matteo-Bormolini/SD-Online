# Fotos e marca

A logo da S.D, as fotos que aparecem quando alguém ainda não colocou a sua e as imagens das divulgações.

## Pastas
| Pasta | O que tem |
|---|---|
| `marca/` | Logo (engrenagem com capacete) em vinho, branca e sobre fundo vinho. **Provisória.** |
| `marca/lojas/` | Lugar para os selos oficiais das lojas de apps ([LEIA-ME](marca/lojas/LEIA-ME.md)). |
| `padrao/` | Fotos padrão de Cliente CPF, Cliente CNPJ e Prestador. **Provisórias** ([LEIA-ME](padrao/LEIA-ME.md)). |
| `divulgacoes/` | Imagens de eventos e grupos da Home ([README](divulgacoes/README.md)). |

## Onde ficam as fotos dos usuários
- Fotos de perfil, de trabalhos, do local e do "Pedir contato" ficam gravadas **de graça no banco** (Firestore), compactadas (`firebase/fotos.js`).
- Elas **nunca** vão para o GitHub.

## Como mudar
- Trocar a logo do menu: desenho em `configuracoes/config.js` → `ICONES.logo`.
- Trocar o ícone da aba do navegador: salve o arquivo novo em `marca/` **com o mesmo nome** (`logo.svg`).
- Trocar uma foto padrão: mesmo nome, quadrada, mínimo 200 × 200 px.

## Regras
- Aceitos: JPG, PNG e WEBP até 5 MB.
- Antes de salvar, toda foto é redesenhada no navegador e perde os dados escondidos (EXIF), que podem mostrar onde foi tirada.

## Situação
✅ pronto · ⬜ a fazer · ⏸️ pago (depois do MVP)

- ✅ Pasta pronta: logo, fotos padrão e imagens das divulgações funcionando no site.
- ✅ Fotos dos usuários gravadas de graça no banco (v0.8.0).
- ⬜ Logo e fotos padrão oficiais: quando a logo nova for criada (trocar os arquivos, mesmo nome). Não impede o MVP.
- ⬜ Antes do lançamento: apagar as imagens `divulgacoes/exemplo-*.webp`.
- ⏸️ Fotos no Cloud Storage (mais leves).
