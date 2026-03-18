export function formatTimeRange(time: string, timeTo?: string | null): string {
  return timeTo ? `${time} – ${timeTo}` : time;
}
