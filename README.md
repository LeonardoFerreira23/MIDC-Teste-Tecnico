# Cadastro e painel de indicadores de funcionários

Desafio técnico full stack — registro de indicadores de entregas por funcionário
e período, com API em FastAPI e PostgreSQL.

## Arquitetura

O sistema separa **funcionário** de **registro** em duas tabelas relacionadas:

- `employees` — nome e departamento, com unicidade no par (nome, departamento).
- `records` — data de referência, quantidade de entregas e observação opcional,
  ligados ao funcionário por chave estrangeira.

O formulário envia um payload achatado (nome, departamento, data, entregas,
observação). É o backend que decide separar nas duas tabelas, reaproveitando o
funcionário quando ele já existe — a comparação é case-insensitive, para
"Ana Souza" e "ana souza" não virarem dois cadastros distintos.

**Regra de histórico:** todo envio é um INSERT. Não existe UPDATE em nenhum ponto
do projeto, então um período já cadastrado nunca é sobrescrito por outro. Além
disso há uma constraint de unicidade em (funcionário, data de referência):
tentar cadastrar o mesmo funcionário duas vezes na mesma data devolve HTTP 409
com mensagem explicativa, em vez de duplicar a linha.

### Camadas do backend

```
backend/
  app/
    core/config.py      configuração via variáveis de ambiente (pydantic-settings)
    db/session.py       engine, sessão por request e base declarativa
    models/             Employee e Record (SQLAlchemy 2.0, tipado)
    schemas/            validação de entrada e serialização de saída (Pydantic v2)
    repositories/       todo o SQL — as rotas não montam query
    api/routes.py       endpoints
    main.py             criação do app, CORS e criação do schema no startup
  requirements.txt
```

A validação acontece em duas camadas: no Pydantic (campos obrigatórios,
quantidade não negativa, normalização de espaços) e no próprio banco
(`CHECK deliveries >= 0` e as constraints de unicidade).

## Endpoints

| Método | Rota       | Descrição |
| ------ | ---------- | --------- |
| POST   | `/records` | Cria um registro. `201` em sucesso, `409` se já existe registro do funcionário naquela data, `422` se os dados forem inválidos. |
| GET    | `/records` | Histórico completo, da data de referência mais recente para a mais antiga. |
| GET    | `/summary` | Total de registros, total de entregas, média, total de funcionários e quebras por departamento e por data. |
| GET    | `/health`  | Health check. |

Documentação OpenAPI gerada pelo FastAPI em `http://localhost:8080/docs`.

Os agregados de `/summary` são calculados com `GROUP BY` no PostgreSQL, não em
Python, e chegam prontos no formato que o gráfico consumiria.

## Como executar

Pré-requisitos: Python 3.12, Node 20 e Docker.

### 1. Banco de dados

```bash
docker run -d --name pg-dev -p 5433:5432 \
  -e POSTGRES_USER=app -e POSTGRES_PASSWORD=app -e POSTGRES_DB=indicadores \
  postgres:16-alpine
```

A porta 5433 é usada para não conflitar com um PostgreSQL já instalado na
máquina de desenvolvimento.

### 2. Variáveis de ambiente

Copie `.env.example` para `.env` na raiz do projeto e ajuste se necessário.

### 3. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate          # Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

As tabelas são criadas automaticamente no startup, com retry caso o banco ainda
não esteja aceitando conexões.

Valide o fluxo em `http://localhost:8080/docs`.

### 4. Frontends

```bash
cd frontend-react
npm install
npm run dev
```

```bash
cd frontend-angular
npm install
npm start
```

Os servidores sobem em 5173 e 4200, mas as páginas renderizam em branco — ver
Limitações conhecidas.

## Portas

| Serviço            | Porta |
| ------------------ | ----- |
| PostgreSQL         | 5433  |
| API FastAPI        | 8080  |
| Documentação (Swagger) | 8080/docs |
| Painel React       | 5173  |
| Cadastro Angular   | 4200  |

A API usa 8080 porque a porta 8000 está reservada pelo sistema no ambiente de
desenvolvimento (Windows/Hyper-V).

## Decisões

- **Duas tabelas em vez de uma** — preserva o histórico por período e evita
  repetir nome e departamento em cada registro.
- **Camada de repositório separada das rotas** — as rotas orquestram, o
  repositório consulta. Facilita testar e isolar mudanças de persistência.
- **409 na duplicidade** — a alternativa seria aceitar duas linhas para o mesmo
  funcionário na mesma data de referência, o que tornaria os agregados ambíguos.
- **Agregação no banco** — `/summary` usa `GROUP BY` em vez de somar em Python,
  e devolve os dados já no formato de consumo do gráfico.
- **`selectinload` em `GET /records`** — evita o problema N+1 ao serializar o
  funcionário de cada registro.
- **Configuração por variáveis de ambiente** — a mesma imagem roda local e em
  container sem alteração de código.
- **CORS restrito** às origens dos frontends (4200 e 5173).

## Limitações conhecidas

O fluxo de dados está funcional do banco até a API. Os frontends não chegaram a
renderizar dentro do tempo da prova.

- **Painel React e formulário Angular não renderizam.** Ambos compilam e os
  servidores de desenvolvimento sobem sem erro no terminal,