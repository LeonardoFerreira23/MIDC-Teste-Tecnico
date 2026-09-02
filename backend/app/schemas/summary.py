from datetime import date

from pydantic import BaseModel


class DepartmentTotal(BaseModel):
    department: str
    deliveries: int
    records: int


class DateTotal(BaseModel):
    reference_date: date
    deliveries: int


class SummaryOut(BaseModel):
    total_records: int
    total_deliveries: int
    average_deliveries: float
    total_employees: int
    by_department: list[DepartmentTotal]
    by_date: list[DateTotal]