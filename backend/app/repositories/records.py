from sqlalchemy import func, select
from sqlalchemy.orm import Session, selectinload

from app.models import Employee, Record
from app.schemas import DateTotal, DepartmentTotal, SummaryOut


def get_or_create_employee(db: Session, *, name: str, department: str) -> Employee:
    """Reaproveita o funcionário quando o par (nome, departamento) já existe.
    Comparação case-insensitive para "Ana Souza" e "ana souza" não duplicarem."""
    stmt = select(Employee).where(
        func.lower(Employee.name) == name.lower(),
        func.lower(Employee.department) == department.lower(),
    )
    employee = db.scalars(stmt).first()
    if employee is not None:
        return employee

    employee = Employee(name=name, department=department)
    db.add(employee)
    db.flush()  # gera o id sem fechar a transação
    return employee


def record_exists(db: Session, *, employee_id: int, reference_date) -> bool:
    stmt = select(Record.id).where(
        Record.employee_id == employee_id,
        Record.reference_date == reference_date,
    )
    return db.scalars(stmt).first() is not None


def create_record(db: Session, *, employee, reference_date, deliveries, note) -> Record:
    record = Record(
        employee=employee,
        reference_date=reference_date,
        deliveries=deliveries,
        note=note,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


def list_records(db: Session) -> list[Record]:
    stmt = (
        select(Record)
        .options(selectinload(Record.employee))
        .order_by(Record.reference_date.desc(), Record.id.desc())
    )
    return list(db.scalars(stmt).all())


def build_summary(db: Session) -> SummaryOut:
    """Agregações calculadas pelo PostgreSQL, não em Python."""
    total_records, total_deliveries, average_deliveries = db.execute(
        select(
            func.count(Record.id),
            func.coalesce(func.sum(Record.deliveries), 0),
            func.coalesce(func.avg(Record.deliveries), 0),
        )
    ).one()

    total_employees = db.scalar(select(func.count(Employee.id))) or 0

    by_department = [
        DepartmentTotal(
            department=row.department, deliveries=row.deliveries, records=row.records
        )
        for row in db.execute(
            select(
                Employee.department.label("department"),
                func.coalesce(func.sum(Record.deliveries), 0).label("deliveries"),
                func.count(Record.id).label("records"),
            )
            .join(Record, Record.employee_id == Employee.id)
            .group_by(Employee.department)
            .order_by(func.sum(Record.deliveries).desc())
        )
    ]

    by_date = [
        DateTotal(reference_date=row.reference_date, deliveries=row.deliveries)
        for row in db.execute(
            select(
                Record.reference_date.label("reference_date"),
                func.coalesce(func.sum(Record.deliveries), 0).label("deliveries"),
            )
            .group_by(Record.reference_date)
            .order_by(Record.reference_date.asc())
        )
    ]

    return SummaryOut(
        total_records=total_records,
        total_deliveries=int(total_deliveries),
        average_deliveries=round(float(average_deliveries), 2),
        total_employees=total_employees,
        by_department=by_department,
        by_date=by_date,
    )