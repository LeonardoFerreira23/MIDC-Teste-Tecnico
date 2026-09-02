/** A API devolve "YYYY-MM-DD". Formatar sem passar por Date evita o
 *  deslocamento de fuso que faria 01/06 virar 31/05. */
export function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("pt-BR").format(value);
}