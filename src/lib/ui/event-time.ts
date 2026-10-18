/** datetime-local fields in this UI always represent WIB, independent of browser timezone. */
export function toWibInput(value: Date | string): string {
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return "";
  return new Date(date.getTime() + 7 * 60 * 60 * 1000).toISOString().slice(0, 16);
}
export function fromWibInput(value: string): string {
  const date = new Date(value + ":00+07:00");
  if (!Number.isFinite(date.getTime())) throw new Error("Tanggal atau waktu tidak valid.");
  return date.toISOString();
}
