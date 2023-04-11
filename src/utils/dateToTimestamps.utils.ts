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

export function startOfWeek(date) {
  const diff = date.getDate() - date.getDay() + (date.getDay() === 0 ? -6 : 1);

  return new Date(date.setDate(diff));
}

export function endOfWeek(date) {
  const lastday = date.getDate() - (date.getDay() - 1) + 6;
  return new Date(date.setDate(lastday));
}
