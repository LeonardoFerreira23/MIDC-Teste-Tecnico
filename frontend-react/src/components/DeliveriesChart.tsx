import {
  Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";

import type { DepartmentTotal } from "../type";
import { formatNumber } from "../format";

interface Props {
  data: DepartmentTotal[];
}

/** Os dados já chegam agregados do backend (GROUP BY no PostgreSQL). */
export default function DeliveriesChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">
        Nenhum dado para exibir no gráfico.
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, bottom: 8, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="department" tick={{ fontSize: 12, fill: "#64748b" }} />
        <YAxis tick={{ fontSize: 12, fill: "#64748b" }} allowDecimals={false} />
        <Tooltip
          formatter={(value: number) => [formatNumber(value), "Entregas"]}
          contentStyle={{ borderRadius: 8, borderColor: "#e2e8f0", fontSize: 13 }}
        />
        <Bar dataKey="deliveries" fill="#0f766e" radius={[4, 4, 0, 0]} maxBarSize={64} />
      </BarChart>
    </ResponsiveContainer>
  );
}