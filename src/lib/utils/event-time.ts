export function hasEventStarted(eventDate: Date | string, eventTime: string): boolean {
  const date = typeof eventDate === "string" ? new Date(eventDate) : eventDate;
  const [hours, minutes] = eventTime.split(":").map(Number);

  const eventStart = new Date(date);
  eventStart.setHours(hours, minutes, 0, 0);

  return new Date() >= eventStart;
}
