export function formatDate(inputDate: string, includeTime?: boolean) {
  const date = new Date(inputDate);

  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }),
  };

  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

/** 24-hour time: "14:32:05", or "14:32" with `withSeconds: false` */
export function formatTime(
  inputDate: string | number,
  { withSeconds = true }: { withSeconds?: boolean } = {}
) {
  const date = new Date(inputDate);

  if (Number.isNaN(date.getTime())) return "--";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    ...(withSeconds && { second: "2-digit" }),
  }).format(date);
}

/** "2 Nov 2026": a calendar day without the time, in the app's en-GB style */
export function formatDayMonthYear(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
