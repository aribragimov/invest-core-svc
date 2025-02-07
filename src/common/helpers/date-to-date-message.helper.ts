import { DateMessage } from '@proto-schema/google/type/date';

export function dateToDateMessage(date: Date): DateMessage;
export function dateToDateMessage(date: undefined | null): undefined;
export function dateToDateMessage(date: Date | undefined | null): DateMessage | undefined;
export function dateToDateMessage(date: Date | undefined | null): DateMessage | undefined {
  return date
    ? {
        year: date.getFullYear(),
        month: date.getMonth() + 1, // DateMessage.month is 1-indexed
        day: date.getDate(),
      }
    : undefined;
}
