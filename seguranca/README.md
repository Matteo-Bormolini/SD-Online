# Segurança

Regras de segurança do projeto.

- Senhas guardadas com hash no servidor; ninguém vê a senha, nem o administrador.
- O bloqueio das páginas (logado / tipo de usuário) tem de ser feito no **servidor**. O `data-logado` do HTML só muda a tela.
- Dados pessoais (e-mail, telefone, endereço, CPF/CNPJ) seguem a LGPD.
- Chaves de API: ver `chaves-api/`.
