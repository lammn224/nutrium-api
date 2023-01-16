export async function dateToTimestamps(dateStr: string) {
  const [day, month, year] = dateStr.split('/');

  const date = new Date(+year, +month - 1, +day);

  return Math.floor(date.getTime() / 1000);
}
