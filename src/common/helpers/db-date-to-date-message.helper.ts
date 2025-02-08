import { DateMessage } from '@proto-schema/google/type/date';

export function dbDateToDateMessage(date: string): DateMessage;
export function dbDateToDateMessage(date: undefined | null): undefined;
export function dbDateToDateMessage(date: string | undefined | null): DateMessage | undefined;
export function dbDateToDateMessage(date: string | undefined | null): DateMessage | undefined {
  if (!date) return undefined;

  const jsDate = new Date(date);

  return {
    year: jsDate.getFullYear(),
    month: jsDate.getMonth() + 1, // DateMessage.month is 1-indexed
    day: jsDate.getDate(),
  };
}
