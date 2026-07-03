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
