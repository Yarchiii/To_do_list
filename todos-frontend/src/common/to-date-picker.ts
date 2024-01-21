import dayjs from 'dayjs';

export function toDatePicker(date: string): string {
  // 2024-01-04T10:00:00.000Z
  // 2024-01-09T07:00
  return dayjs(date).format('YYYY-MM-DDTHH:mm');
}
