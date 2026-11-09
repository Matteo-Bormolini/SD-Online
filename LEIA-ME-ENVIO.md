# Como enviar ao GitHub — v0.6.0-alpha.2 (09/11/2026)

Este pacote tem **63 arquivos** e já inclui tudo da alpha.1.
Mandou a alpha.1? Pode mandar este por cima. Não mandou? Mande só este.

## 1. Commit (1 envio — limite do GitHub pelo navegador: 100 arquivos)
1. Extraia o ZIP e abra a pasta **SD-Online**.
2. No GitHub, na **página inicial do repositório** → **Add file → Upload files**.
3. Selecione **tudo que está dentro de SD-Online** (as pastas + README.md, CONTEXTO-PARA-IA.md e .gitignore) e **arraste**.
4. Antes de confirmar, confira na lista: os caminhos devem ter a pasta na frente (ex.: `componentes/confirmacao/confirmacao.js`). Só `confirmacao.js`? **Cancele.**
5. Título do commit:
   `v0.6.0-alpha.2: quadro (A orçar expira em 10 dias, cliente finaliza), sem contraproposta, aviso de contatos, READMEs individuais`
6. Marque **Commit directly to the main branch** → **Commit changes**.

Pastas deste envio: CONTEXTO-PARA-IA.md · README.md · .gitignore · base-de-dados · chaves-api · componentes · configuracoes · docs · fotos · home · interruptores · localizar-condominios · localizar-prestador · login-cadastro · modelo-pagina · navbar · perfil-adm · perfil-cliente-cnpj · perfil-cliente-cpf · perfil-prestador · politica-privacidade · rodape · seguranca · servicos · solicitacao · suporte · avaliacoes

Arquivos ocultos (`.gitignore`, `chaves-api/.env.example`): no Windows, ative **Exibir → Itens ocultos**. Se mesmo assim não forem, crie no GitHub com **Add file → Create new file** e cole o conteúdo.

## 2. Release (depois do commit)
1. No repositório → **Releases** (lado direito) → **Draft a new release**.
2. **Choose a tag** → digite `v0.6.0-alpha.2` → **Create new tag** (alvo: `main`).
3. Título da release:
   `v0.6.0-alpha.2 — Quadro do prestador, confirmações e botões liga/desliga`
4. Descrição (copie):
   ```
   Prévia do Ciclo 1 (projeto individual, organizado em Ciclos).
   - READMEs reescritos para projeto individual
   - Quadro do prestador: A orçar (expira em 10 dias), sanfona no celular, Encerrados (apagados em 1 ano, lixeira); só o cliente finaliza (Prestados)
   - Pop-up "Tem certeza?" em todo excluir/editar
   - Botões liga/desliga (cinza = desligado, vinho = ligado): Localização e Mostrar meus contatos (com aviso; também no cadastro)
   - Lista de todos os botões: configuracoes/interruptores.js e página interruptores/ (adm)
   - Pedido: 3 fotos obrigatórias (até 6); contraproposta retirada (negociação pelo WhatsApp)
   - E-mail do Suporte definido
   - Testes: docs/testes-e-seguranca.md
   ```
5. Marque **Set as a pre-release** → **Publish release**.
