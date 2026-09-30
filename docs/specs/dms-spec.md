# Especificação - Document Management System

## 1. Objetivo

Disponibilizar um sistema web para envio, listagem e download de documentos, com controle simples do usuário proprietário e armazenamento local dos arquivos.

## 2. Escopo

### Dentro do escopo

- Upload de documentos.
- Listagem dos documentos enviados.
- Download de documentos por identificador.
- Associação de cada documento a um usuário proprietário.
- Persistência dos arquivos no filesystem local.
- Persistência dos metadados em memória.
- Interface web em React.
- API HTTP em Node.js com Express.

### Fora do escopo

- Armazenamento externo, em nuvem ou em serviços de terceiros.
- Autenticação e autorização completas.
- Versionamento de documentos.
- Exclusão ou edição de documentos.
- Persistência dos metadados em banco de dados.
- Compartilhamento entre usuários.
- Conversão, pré-visualização ou processamento do conteúdo dos arquivos.

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O usuário deve poder enviar um documento por multipart/form-data. |
| RF-02 | O sistema deve rejeitar uploads sem arquivo. |
| RF-03 | O sistema deve gerar um identificador único para cada documento. |
| RF-04 | O sistema deve armazenar o arquivo enviado em `backend/storage`. |
| RF-05 | O sistema deve registrar os metadados do documento em memória. |
| RF-06 | O usuário deve poder listar os documentos disponíveis. |
| RF-07 | A listagem deve retornar os metadados dos documentos, sem expor o caminho físico do arquivo. |
| RF-08 | O usuário deve poder baixar um documento pelo identificador. |
| RF-09 | O download deve retornar o conteúdo binário do arquivo original. |
| RF-10 | O sistema deve informar erro quando o identificador solicitado não existir. |
| RF-11 | Cada documento deve possuir um proprietário identificado por usuário. |
| RF-12 | A interface web deve permitir upload, listagem e download dos documentos. |
| RF-13 | O frontend deve consumir a API usando `fetch` pelo prefixo `/api`. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | O backend deve utilizar Node.js e Express. |
| RNF-02 | O upload deve utilizar Multer com `diskStorage`. |
| RNF-03 | Os arquivos devem ser gravados exclusivamente em `backend/storage`. |
| RNF-04 | Os metadados devem permanecer em memória nesta fase. |
| RNF-05 | A configuração deve utilizar variáveis de ambiente, seguindo o princípio 12-Factor. |
| RNF-06 | O backend deve seguir o fluxo `routes -> controllers -> services -> repositories`. |
| RNF-07 | Controllers devem cuidar de HTTP e validações básicas. |
| RNF-08 | Services devem concentrar as regras de negócio. |
| RNF-09 | Repositories devem cuidar do armazenamento dos arquivos e metadados. |
| RNF-10 | O frontend deve utilizar componentes funcionais e React Hooks. |
| RNF-11 | Erros devem ser tratados nos limites da aplicação e retornar respostas HTTP adequadas. |
| RNF-12 | O sistema deve funcionar após reinicialização, embora os metadados em memória sejam perdidos. |
| RNF-13 | O sistema não deve depender de provedores externos de armazenamento ou upload. |

## 5. Modelo de dados

### Metadado do documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| `id` | string | Sim | Identificador único do documento. |
| `originalName` | string | Sim | Nome original informado pelo usuário. |
| `size` | number | Sim | Tamanho do arquivo em bytes. |
| `uploadedAt` | string | Sim | Data e hora do upload em formato ISO 8601. |
| `owner` | string | Sim | Identificador do usuário proprietário. |

O caminho físico e o nome interno do arquivo podem ser mantidos pelo repositório, mas não devem fazer parte da resposta pública da API.

### Identificação do usuário

Nesta primeira versão, o usuário será identificado pelo header HTTP:

```text
X-User-Id: identificador-do-usuario
```

A autenticação não faz parte do escopo. Quando o header não for informado, o backend deve utilizar um identificador padrão definido pela aplicação, como `anonymous`, ou rejeitar a requisição conforme a decisão adotada durante a implementação.

## 6. Contratos de API

### `POST /upload`

Envia um documento.

#### Requisição

- Content-Type: `multipart/form-data`
- Campo do arquivo: `file`
- Header opcional: `X-User-Id`

#### Resposta de sucesso

- Status: `201 Created`
- Content-Type: `application/json`

```json
{
  "id": "document-id",
  "originalName": "relatorio.pdf",
  "size": 24576,
  "uploadedAt": "2026-09-30T12:00:00.000Z",
  "owner": "user-123"
}
```

#### Erros esperados

- `400 Bad Request`: nenhum arquivo foi enviado.
- `400 Bad Request`: arquivo inválido ou dados obrigatórios ausentes.
- `413 Payload Too Large`: arquivo acima do limite configurado.
- `500 Internal Server Error`: falha ao gravar o arquivo ou os metadados.

### `GET /documents`

Lista os documentos.

#### Requisição

- Header opcional: `X-User-Id`
- Parâmetro opcional de filtragem por usuário, caso seja implementado.

#### Resposta de sucesso

- Status: `200 OK`
- Content-Type: `application/json`

```json
[
  {
    "id": "document-id",
    "originalName": "relatorio.pdf",
    "size": 24576,
    "uploadedAt": "2026-09-30T12:00:00.000Z",
    "owner": "user-123"
  }
]
```

A resposta deve retornar uma lista vazia quando não houver documentos.

### `GET /documents/:id/download`

Baixa um documento.

#### Parâmetros

- `id`: identificador único do documento.

#### Resposta de sucesso

- Status: `200 OK`
- Content-Type compatível com o arquivo, quando disponível.
- Conteúdo binário do arquivo.
- Header `Content-Disposition` com o nome original do documento.

#### Erros esperados

- `404 Not Found`: documento inexistente.
- `404 Not Found`: arquivo associado não encontrado no filesystem.
- `500 Internal Server Error`: falha na leitura do arquivo.

## 7. Arquitetura

### Backend

A implementação deve respeitar a seguinte dependência:

```text
routes -> controllers -> services -> repositories
```

Responsabilidades:

- `routes/`: registra endpoints e middlewares do Multer.
- `controllers/`: lê requisições, valida entradas básicas e monta respostas HTTP.
- `services/`: aplica regras de negócio e coordena os repositórios.
- `repositories/`: grava arquivos localmente e mantém os metadados em memória.
- `app.js`: configura o Express, middlewares, rotas e inicialização do servidor.

### Frontend

A organização deve seguir:

- `components/`: componentes reutilizáveis de upload, listagem e download.
- `pages/`: composição das telas da aplicação.
- `services/`: funções de acesso à API usando `fetch`.
- `App.jsx`: composição principal da aplicação.

O Vite deve encaminhar requisições `/api` para o backend, removendo o prefixo antes do envio.

## 8. Configuração

As configurações devem ser obtidas por variáveis de ambiente sempre que aplicável:

| Variável | Descrição | Valor padrão sugerido |
| --- | --- | --- |
| `PORT` | Porta do backend | `3000` |
| `STORAGE_DIR` | Diretório dos arquivos enviados | `backend/storage` |
| `MAX_FILE_SIZE` | Limite máximo do arquivo em bytes | definido pela aplicação |

A pasta de armazenamento deve existir ou ser criada durante a inicialização do repositório de arquivos.

## 9. Plano de execução

### Etapa 1 - Preparação da especificação

Arquivos:

- Criar `docs/specs/dms-spec.md`.

Atividades:

- Consolidar objetivo, escopo, requisitos, modelo de dados, contratos e decisões arquiteturais.

Critérios de aceite:

- A especificação descreve os três endpoints previstos.
- A restrição de armazenamento local com Multer está explícita.
- O plano não executa alterações de backend ou frontend.

### Etapa 2 - Repositórios de persistência

Arquivos:

- Criar ou alterar arquivos em `backend/src/repositories/`.

Atividades:

- Implementar armazenamento local usando `multer.diskStorage`.
- Implementar repositório de metadados em memória.
- Definir operações para criar, listar, localizar e obter o caminho de um documento.

Critérios de aceite:

- Arquivos são gravados em `backend/storage`.
- Metadados não dependem de banco de dados.
- O caminho físico não é exposto pela API.

### Etapa 3 - Serviços de negócio

Arquivos:

- Criar ou alterar arquivos em `backend/src/services/`.

Atividades:

- Implementar upload de documento.
- Implementar listagem.
- Implementar localização de documento para download.
- Validar documento inexistente e entradas inválidas.

Critérios de aceite:

- As regras de negócio não dependem diretamente de objetos HTTP.
- O serviço retorna metadados no formato especificado.
- Erros de negócio podem ser tratados pelo controller.

### Etapa 4 - Controllers e rotas

Arquivos:

- Criar ou alterar arquivos em `backend/src/controllers/`.
- Criar ou alterar arquivos em `backend/src/routes/`.
- Alterar `backend/src/app.js`.

Atividades:

- Adicionar `POST /upload`.
- Adicionar `GET /documents`.
- Adicionar `GET /documents/:id/download`.
- Configurar Multer com `diskStorage`.
- Mapear erros para códigos HTTP.

Critérios de aceite:

- Os endpoints respondem conforme os contratos.
- Upload sem arquivo retorna `400`.
- Documento inexistente retorna `404`.
- O download retorna conteúdo binário e nome original.

### Etapa 5 - Testes do backend

Arquivos:

- Alterar `backend/test/app.test.js`.
- Criar testes adicionais em `backend/test/`, quando necessário.

Atividades:

- Testar upload.
- Testar listagem.
- Testar download.
- Testar validações e documentos inexistentes.
- Limpar arquivos temporários gerados pelos testes.

Critérios de aceite:

- Os testes cobrem os fluxos principais e erros previstos.
- Os testes não dependem de armazenamento externo.
- `npm test` executa com sucesso no backend.

### Etapa 6 - Serviço e componentes do frontend

Arquivos:

- Criar ou alterar arquivos em `frontend/src/services/`.
- Criar componentes em `frontend/src/components/`.
- Criar ou alterar arquivos em `frontend/src/pages/`.
- Alterar `frontend/src/App.jsx`.

Atividades:

- Criar serviço para upload, listagem e download.
- Criar componente de upload.
- Criar componente de listagem.
- Criar controle de download.
- Exibir estados de carregamento, sucesso e erro.

Critérios de aceite:

- O frontend envia arquivos para `/api/upload`.
- A lista é carregada de `/api/documents`.
- O usuário consegue iniciar o download de um documento.
- Erros da API são apresentados de forma compreensível.

### Etapa 7 - Integração e validação final

Arquivos:

- `backend/src/app.js`.
- `backend/src/routes/`.
- `frontend/src/`.
- `frontend/vite.config.js`, se necessário.
- Testes existentes.

Atividades:

- Validar o proxy `/api`.
- Executar backend e frontend.
- Confirmar o fluxo completo de upload, listagem e download.
- Validar comportamento sem documentos e com erros.
- Executar testes do backend e build do frontend.

Critérios de aceite:

- O backend inicia pela configuração definida.
- O frontend inicia pelo Vite.
- Upload, listagem e download funcionam de ponta a ponta.
- `npm test` e `npm run build` concluem sem erros.

## 10. Riscos e decisões

- Os metadados serão perdidos quando o processo for reiniciado; isso é aceitável nesta fase e está documentado como limitação.
- Arquivos órfãos podem permanecer no filesystem caso a gravação dos metadados falhe; o serviço deve tratar essa situação conforme a estratégia definida na implementação.
- Sem autenticação real, o header `X-User-Id` serve apenas para identificação funcional do proprietário.
- O limite de tamanho e as extensões permitidas devem ser definidos por configuração, evitando regras rígidas espalhadas pelo código.
- O armazenamento deve permanecer estritamente local; não devem ser adicionados serviços externos ou provedores de nuvem.