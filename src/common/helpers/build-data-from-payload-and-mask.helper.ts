import { camelCase, pick } from 'lodash';

interface BuildArgs<T> {
  payload: T;
  mask: string[];
}
export function buildDataFromPayloadAndMask<T>({ mask, payload }: BuildArgs<T>): Partial<T> {
  return pick(payload, mask.map(camelCase));
}
