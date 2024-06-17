export function formatDate(inputDate: string) {
  // Parse the input date string to a Date object
  const date = new Date(inputDate);

  // Define the options for formatting the date
  const options = { day: '2-digit', month: 'short', year: 'numeric' };

  // Format the date to the desired format
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  const formattedDate = new Intl.DateTimeFormat('en-GB', options).format(date);

  return formattedDate;
}
