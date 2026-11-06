# Fotos e marca

**Sprint 1 · Épico E1 Base do site · 🟡 Pronto com imagens provisórias**

Aqui ficam a logo da S.D e as fotos que aparecem quando alguém ainda não colocou a sua.

## Para quem
Para todos: é a cara da marca no site, nas abas do navegador e no futuro app.

## O que entrega

| Pasta | O que tem |
|---|---|
| `marca/` | Logo (engrenagem com capacete) em versão vinho, branca e sobre quadrado vinho. **Provisória.** |
| `padrao/` | Fotos padrão de Cliente CPF, Cliente CNPJ e Prestador. **Provisórias.** Detalhes no [LEIA-ME](padrao/LEIA-ME.md). |

## Histórias atendidas
- **US01** — mesma identidade visual em todo o site.
- **US33** — fotos sem a localização escondida no arquivo (Sprint 5).

## Pronto quando
- [x] Toda página mostra uma imagem, mesmo sem foto do usuário.
- [ ] Logo oficial no lugar da provisória.

## Parte técnica
- **Trocar a logo:** substitua os arquivos de `marca/` **mantendo os mesmos nomes** e atualize o ícone `ICONES.logo` em `configuracoes/config.js`.
- **Trocar uma foto padrão:** salve a nova com o mesmo nome (quadrada, mínimo 200 × 200 px).
- **Fotos enviadas pelos usuários não ficam no GitHub.** A pasta `fotos/usuarios/` é bloqueada pelo `.gitignore`.
- Formatos aceitos: JPG, PNG e WEBP até 5 MB. Galerias com no máximo 12 fotos.
- No servidor, toda foto enviada deve perder os dados escondidos (EXIF), que podem conter a localização de onde foi tirada.
