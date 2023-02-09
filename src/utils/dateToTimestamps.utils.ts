export async function dateToTimestamps(dateStr: string) {
  const [day, month, year] = dateStr.split('/');

  const date = new Date(+year, +month - 1, +day);

  return Math.floor(date.getTime() / 1000);
}

export function convertTimeStampsToString(ts) {
  const date = new Date(ts * 1000);

  const year = date.getFullYear();
  const month = padTo2Digits(date.getMonth() + 1);
  const day = padTo2Digits(date.getDate());

  return `${day}/${month}/${year}`;
}

function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}
