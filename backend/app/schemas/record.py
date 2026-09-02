from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RecordCreate(BaseModel):
    """Payload achatado que vem do formulário Angular."""

    name: str = Field(min_length=2, max_length=120)
    department: str = Field(min_length=2, max_length=80)
    reference_date: date
    deliveries: int = Field(ge=0, le=100_000)
    note: str | None = Field(default=None, max_length=280)

    @field_validator("name", "department")
    @classmethod
    def strip_and_require(cls, value: str) -> str:
        cleaned = " ".join(value.split())
        if not cleaned:
            raise ValueError("campo obrigatório")
        return cleaned

    @field_validator("note")
    @classmethod
    def normalize_note(cls, value: str | None) -> str | None:
        if value is None:
            return None
        return value.strip() or None


class EmployeeOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    department: str


class RecordOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference_date: date
    deliveries: int
    note: str | None
    created_at: datetime
    employee: EmployeeOut