import { DateMessage } from '@proto-schema/google/type/date';

export function dateMessageToDbDate(dateMessage: DateMessage): string;
export function dateMessageToDbDate(dateMessage: undefined): undefined;
export function dateMessageToDbDate(dateMessage: DateMessage | undefined): string | undefined;
export function dateMessageToDbDate(dateMessage: DateMessage | undefined): string | undefined {
  if (!dateMessage) return undefined;

  const jsDate = new Date(dateMessage.year, dateMessage.month - 1, dateMessage.day); // DateMessage.month is 1-indexed

  return jsDate.toISOString();
}
