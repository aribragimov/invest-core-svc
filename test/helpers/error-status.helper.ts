import { BadRequest } from '@proto-schema/google/rpc/error_details';
import { Status } from '@proto-schema/google/rpc/status';

function decodeBadRequestStatusValue(value: Uint8Array): BadRequest {
  return BadRequest.decode(value);
}

export function expectBadRequestStatusDetails(status: Status, expected: any[]) {
  const details = status.details.map(d => decodeBadRequestStatusValue(d.value));
  expect(details).toEqual(expected);
}

export function expectInvalidArgumentStatus(status: Status, expectedErrors: any[]): void {
  expect(status).toEqual({
    code: 3,
    message: 'INVALID_ARGUMENT',
    details: expect.arrayContaining([
      expect.objectContaining({ typeUrl: 'type.googleapis.com/google.rpc.BadRequest' }),
    ]),
  });

  expectBadRequestStatusDetails(status, expectedErrors);
}
