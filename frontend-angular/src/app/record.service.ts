import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

export interface RecordPayload {
  name: string;
  department: string;
  reference_date: string;
  deliveries: number;
  note: string | null;
}

export interface RecordResponse {
  id: number;
  reference_date: string;
  deliveries: number;
  note: string | null;
  employee: { id: number; name: string; department: string };
}

// URL da API do ponto de vista do NAVEGADOR.
const API_URL = 'http://localhost:8080';

@Injectable({ providedIn: 'root' })
export class RecordService {
  private readonly http = inject(HttpClient);

  create(payload: RecordPayload): Observable<RecordResponse> {
    return this.http.post<RecordResponse>(`${API_URL}/records`, payload);
  }
}