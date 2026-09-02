from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories import records as repo
from app.schemas import RecordCreate, RecordOut, SummaryOut

router = APIRouter()


@router.post("/records", response_model=RecordOut, status_code=201, tags=["records"],
             summary="Cadastrar um registro de entregas")
def create_record(payload: RecordCreate, db: Session = Depends(get_db)):
    """Cria um registro novo para a data de referência informada.
    O funcionário é reaproveitado quando já existe; registros anteriores
    nunca são sobrescritos."""
    employee = repo.get_or_create_employee(
        db, name=payload.name, department=payload.department
    )

    if employee.id is not None and repo.record_exists(
        db, employee_id=employee.id, reference_date=payload.reference_date
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Já existe um registro de {employee.name} para "
                   f"{payload.reference_date.strftime('%d/%m/%Y')}.",
        )

    return repo.create_record(
        db,
        employee=employee,
        reference_date=payload.reference_date,
        deliveries=payload.deliveries,
        note=payload.note,
    )


@router.get("/records", response_model=list[RecordOut], tags=["records"],
            summary="Listar registros por data de referência")
def list_records(db: Session = Depends(get_db)):
    """Histórico completo, da data mais recente para a mais antiga."""
    return repo.list_records(db)


@router.get("/summary", response_model=SummaryOut, tags=["summary"],
            summary="Indicadores agregados do painel")
def get_summary(db: Session = Depends(get_db)):
    """Totais, média e quebras por departamento e por data."""
    return repo.build_summary(db)