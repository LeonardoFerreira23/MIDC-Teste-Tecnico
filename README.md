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