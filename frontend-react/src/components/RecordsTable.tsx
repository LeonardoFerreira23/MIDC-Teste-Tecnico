import type { Record } from "../type";
import { formatDate, formatNumber } from "../format";

interface Props {
  records: Record[];
}

export default function RecordsTable({ records }: Props) {
  if (records.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">
        Nenhum registro cadastrado ainda. Use a aplicação de cadastro para incluir o primeiro.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-200 text-slate-500">
          <tr>
            <th className="px-4 py-3 font-medium">Funcionário</th>
            <th className="px-4 py-3 font-medium">Departamento</th>
            <th className="px-4 py-3 font-medium">Data de referência</th>
            <th className="px-4 py-3 text-right font-medium">Entregas</th>
            <th className="px-4 py-3 font-medium">Observação</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {records.map((record) => (
            <tr key={record.id} className="hover:bg-slate-50">
              <td className="px-4 py-3 text-slate-900">{record.employee.name}</td>
              <td className="px-4 py-3 text-slate-600">{record.employee.department}</td>
              <td className="px-4 py-3 tabular-nums text-slate-600">
                {formatDate(record.reference_date)}
              </td>
              <td className="px-4 py-3 text-right tabular-nums text-slate-900">
                {formatNumber(record.deliveries)}
              </td>
              <td className="px-4 py-3 text-slate-500">{record.note ?? "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}