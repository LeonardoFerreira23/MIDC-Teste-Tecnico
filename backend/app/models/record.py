from datetime import date, datetime

from sqlalchemy import (
    CheckConstraint, Date, DateTime, ForeignKey, Integer, String,
    UniqueConstraint, func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Record(Base):
    """Registro histórico de entregas em uma data de referência.

    Cada envio cria uma linha nova. Não existe UPDATE no projeto, então um
    período já cadastrado nunca é sobrescrito.
    """

    __tablename__ = "records"
    __table_args__ = (
        UniqueConstraint(
            "employee_id", "reference_date", name="uq_record_employee_reference_date"
        ),
        CheckConstraint("deliveries >= 0", name="ck_record_deliveries_non_negative"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    employee_id: Mapped[int] = mapped_column(
        ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True
    )
    reference_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    deliveries: Mapped[int] = mapped_column(Integer, nullable=False)
    note: Mapped[str | None] = mapped_column(String(280), nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    employee: Mapped["Employee"] = relationship(back_populates="records")