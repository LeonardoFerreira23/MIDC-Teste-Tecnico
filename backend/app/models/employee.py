from datetime import datetime

from sqlalchemy import DateTime, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.session import Base


class Employee(Base):
    """Funcionário, identificado pelo par (nome, departamento)."""

    __tablename__ = "employees"
    __table_args__ = (
        UniqueConstraint("name", "department", name="uq_employee_name_department"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False, index=True)
    department: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    records: Mapped[list["Record"]] = relationship(
        back_populates="employee", cascade="all, delete-orphan"
    )