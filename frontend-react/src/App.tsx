import { useCallback, useEffect, useState } from "react";

import DeliveriesChart from "./components/DeliveriesChart";
import RecordsTable from "./components/RecordsTable";
import SummaryCard from "./components/SummaryCard";
import { fetchDashboard } from "./api";
import { formatNumber } from "./format";
import type { Record, Summary } from "./type";

export default function App() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryData, recordsData] = await fetchDashboard();
      setSummary(summaryData);
      setRecords(recordsData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Não foi possível carregar os dados. Verifique se a API está no ar.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <div>
            <h1 className="text-lg font-semibold">Painel de indicadores</h1>
            <p className="text-sm text-slate-500">Entregas por funcionário e período</p>
          </div>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            {loading ? "Atualizando…" : "Atualizar"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {loading && (
          <p className="py-20 text-center text-sm text-slate-500">Carregando dados…</p>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <p className="font-medium text-red-800">Não foi possível carregar o painel</p>
            <p className="mt-1 text-sm text-red-700">{error}</p>
            <button
              onClick={() => void load()}
              className="mt-4 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {!loading && !error && summary && (
          <div className="space-y-8">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard
                label="Registros"
                value={formatNumber(summary.total_records)}
                hint="Total de envios no histórico"
              />
              <SummaryCard
                label="Entregas"
                value={formatNumber(summary.total_deliveries)}
                hint="Soma de todos os períodos"
              />
              <SummaryCard
                label="Média por registro"
                value={formatNumber(summary.average_deliveries)}
              />
              <SummaryCard
                label="Funcionários"
                value={formatNumber(summary.total_employees)}
              />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <h2 className="mb-4 text-sm font-medium text-slate-700">
                Entregas por departamento
              </h2>
              <DeliveriesChart data={summary.by_department} />
            </section>

            <section className="rounded-lg border border-slate-200 bg-white">
              <h2 className="border-b border-slate-200 px-5 py-4 text-sm font-medium text-slate-700">
                Histórico de registros
              </h2>
              <RecordsTable records={records} />
            </section>
          </div>
        )}
      </main>
    </div>
  );
}