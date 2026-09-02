# Cadastro e painel de indicadores de funcionários

Desafio técnico full stack. API em FastAPI com banco PostgreSQL, mais um painel
em React e um formulário em Angular.

## Como funciona

O banco tem duas tabelas:

- `employees` — nome e departamento do funcionário.
- `records` — data de referência, quantidade de entregas e observação, ligados
  ao funcionário.

O formulário manda tudo junto (nome, departamento, data, entregas, observação) e
a API separa nas duas tabelas. Se o funcionário já foi cadastrado antes, ela
reaproveita o cadastro em vez de criar outro.

Cada envio cria um registro novo. Não tem nenhum UPDATE no projeto, então
cadastrar junho não apaga o que foi cadastrado em maio. Se tentar cadastrar o
mesmo funcionário duas vezes na mesma data, a API responde 409 e avisa que já
existe.

## Pastas

```
backend/
  app/
    core/      configurações (URL do banco, CORS)
    db/        conexão com o banco
    models/    as duas tabelas
    schemas/   validação dos dados que entram e saem
    repositories/  as consultas ao banco
    api/       os endpoints
    main.py    onde o app é montado
frontend-react/     painel de consulta
frontend-angular/   formulário de cadastro
```

## Endpoints

| Método | Rota | O que faz |
| ------ | ---- | --------- |
| POST | `/records` | Cadastra um registro. 201 se deu certo, 409 se já existe, 422 se os dados estiverem errados. |
| GET | `/records` | Lista os registros, do mais recente para o mais antigo. |
| GET | `/summary` | Total de registros, total de entregas, média e os totais por departamento e por data. |
| GET | `/health` | Só para saber se a API está no ar. |

A documentação do FastAPI fica em `http://localhost:8080/docs`.

## Como rodar

Precisa de Python 3.12, Node 20 e Docker.

**1. Banco**

```bash
docker run -d --name

## O que não ficou pronto

Comparando com os critérios de aceite do enunciado:

| Item pedido | Situação |
| ----------- | -------- |
| Backend FastAPI | Pronto |
| PostgreSQL com histórico por período | Pronto |
| Documentação da API (`/docs`) | Pronto |
| Frontend Angular | Não funciona |
| Frontend React com Tailwind | Funcionando |
| Docker Compose subindo os 4 serviços | Não feito |

**React — painel.** Funcionando parcial em `http://localhost:5173`. Mostra o gráfico do departamento e algumas informações.

**React — painel.** Mesmo caso. O código em `frontend-react/` tem os quatro
cartões de resumo, o gráfico de barras por departamento (recharts), a tabela com
nome, departamento, data e quantidade, e as telas de carregando, de erro e de
lista vazia. Sobe em 5173 e abre em branco. O requisito "o React exibe dados
reais da API em cartões, um gráfico e uma tabela" **não** está atendido.

**Docker.** Não cheguei a escrever os Dockerfiles nem o `docker-compose.yml`. Não
existe `docker compose up --build` funcionando neste repositório. O Postgres sobe
por `docker run` e o backend roda direto na máquina, como está nas instruções de
execução acima.

**O que dá para validar hoje.** Subindo o banco e o backend, em
`http://localhost:8080/docs`:

- cadastrar um registro (POST /records)
- cadastrar o mesmo funcionário em outra data e ver os dois coexistindo
- tentar repetir a mesma data e receber 409
- mandar quantidade negativa e receber 422
- listar o histórico (GET /records) e ver os totais (GET /summary)
