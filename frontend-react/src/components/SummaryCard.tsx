interface Props {
  label: string;
  value: string;
  hint?: string;
}

/** Cartão de indicador. Reutilizado pelos quatro números do topo. */
export default function SummaryCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tabular-nums text-slate-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </div>
  );
}