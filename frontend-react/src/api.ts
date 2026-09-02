import type { Record, Summary } from "./type";

// URL da API do ponto de vista do NAVEGADOR (não o nome do serviço do compose).
const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Falha ao consultar ${path} (HTTP ${response.status})`);
  }
  return response.json() as Promise<T>;
}

/** Busca as duas rotas em paralelo: o painel só renderiza com as duas prontas. */
export function fetchDashboard(): Promise<[Summary, Record[]]> {
  return Promise.all([get<Summary>("/summary"), get<Record[]>("/records")]);
}