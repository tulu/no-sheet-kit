/** 6 weeks × 7 days, aligned to `weekStartsOn` (0 = Sunday, 1 = Monday). */
export function getMonthGridDates(anchorMonth: Date, weekStartsOn: 0 | 1): Date[] {
  const y = anchorMonth.getFullYear();
  const m = anchorMonth.getMonth();
  const firstOfMonth = new Date(y, m, 1);
  const startDow = firstOfMonth.getDay();
  const offset = (startDow - weekStartsOn + 7) % 7;
  const start = new Date(y, m, 1 - offset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }
  return cells;
}
