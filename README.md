# Document Management System

Aplicação mínima para upload, listagem e download de documentos armazenados
localmente.

## Execução

Em terminais separados:

```bash
cd backend && npm install && npm start
cd frontend && npm install && npm run dev
```

O frontend fica disponível em `http://localhost:5173` e usa o proxy `/api`
para encaminhar as chamadas ao backend em `http://localhost:3000`.

## Configuração

- `PORT`: porta do backend, padrão `3000`.
- `MAX_UPLOAD_SIZE`: limite do upload em bytes, padrão `10485760` (10 MB).
- `VITE_USER_ID`: usuário usado pela interface, padrão `demo-user`.

O backend exige o header `x-user-id` e valida seu formato para manter os
documentos isolados por usuário. Esse mecanismo é uma identificação simples
para o ambiente do exercício, não substitui autenticação real em produção.

## Testes

```bash
cd backend && npm test
cd frontend && npm run build
```

Os arquivos são gravados em `backend/storage` com nomes físicos aleatórios; o
nome informado pelo usuário é mantido apenas nos metadados.

<img src="https://octodex.github.com/images/Professortocat_v2.png" align="right" height="200px" />

Hey leonardo-nichelatti!

Mona here. I'm done preparing your exercise. Hope you enjoy! 💚

Remember, it's self-paced so feel free to take a break! ☕️

[![](https://img.shields.io/badge/Go%20to%20Exercise-%E2%86%92-1f883d?style=for-the-badge&logo=github&labelColor=197935)](https://github.com/treinamentos-serpro/document-management-system-nichelatti/issues/1)

---

&copy; 2025 GitHub &bull; [Code of Conduct](https://www.contributor-covenant.org/version/2/1/code_of_conduct/code_of_conduct.md) &bull; [MIT License](https://gh.io/mit)

