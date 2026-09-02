import logging
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from app.api.routes import router
from app.core.config import settings
from app.db.session import Base, engine
from app.models import Employee, Record  # noqa: F401 - registra os models no metadata

logger = logging.getLogger("uvicorn.error")


def init_db(retries: int = 10, delay: float = 2.0) -> None:
    """Cria as tabelas. Reintenta porque o Postgres pode subir depois da API."""
    for attempt in range(1, retries + 1):
        try:
            Base.metadata.create_all(bind=engine)
            logger.info("Schema pronto.")
            return
        except OperationalError:
            logger.warning("Banco indisponível (tentativa %s/%s).", attempt, retries)
            time.sleep(delay)
    raise RuntimeError("Não foi possível conectar ao PostgreSQL.")


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Painel de Indicadores de Funcionários",
    description="Cada envio gera um registro novo associado a uma data de "
                "referência; registros anteriores nunca são sobrescritos.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health", tags=["infra"])
def health() -> dict[str, str]:
    return {"status": "ok"}