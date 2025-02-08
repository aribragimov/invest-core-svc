import { User } from '@proto-schema/invest/svc/core';

import { dbDateToDateMessage } from 'src/common/helpers';

import { UserEntity } from '../user.entity';

export function userDbToProto(user: UserEntity): User {
  return {
    ...user,
    birthdate: dbDateToDateMessage(user.birthdate),
  };
}
