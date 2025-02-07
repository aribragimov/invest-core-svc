import { DateMessage } from '@proto-schema/google/type/date';

export function dateMessageToDate(dateMessage: DateMessage): Date;
export function dateMessageToDate(dateMessage: undefined): undefined;
export function dateMessageToDate(dateMessage: DateMessage | undefined): Date | undefined;
export function dateMessageToDate(dateMessage: DateMessage | undefined): Date | undefined {
  return dateMessage
    ? new Date(dateMessage.year, dateMessage.month - 1, dateMessage.day) // DateMessage.month is 1-indexed
    : undefined;
}
