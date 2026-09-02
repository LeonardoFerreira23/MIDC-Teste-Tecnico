export interface Employee {
  id: number;
  name: string;
  department: string;
}

export interface Record {
  id: number;
  reference_date: string;
  deliveries: number;
  note: string | null;
  created_at: string;
  employee: Employee;
}

export interface DepartmentTotal {
  department: string;
  deliveries: number;
  records: number;
}

export interface DateTotal {
  reference_date: string;
  deliveries: number;
}

export interface Summary {
  total_records: number;
  total_deliveries: number;
  average_deliveries: number;
  total_employees: number;
  by_department: DepartmentTotal[];
  by_date: DateTotal[];
}