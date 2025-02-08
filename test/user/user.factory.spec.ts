import { faker } from '@faker-js/faker/.';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { Factory } from 'fishery';
import { toNumber } from 'lodash';
import { Repository } from 'typeorm';

import { UserEntity } from 'src/domain/user';

class EntityFactory extends Factory<UserEntity> {
  public deleted() {
    return this.params({
      deletedAt: new Date(),
    });
  }
}

export const UserFactory = EntityFactory.define(({ params }) => {
  const entity = new UserEntity();
  entity.id = randomUUID();
  entity.login = params.login ?? faker.word.noun();
  entity.email = params.email ?? faker.internet.email();
  entity.firstName = params.firstName ?? faker.person.firstName();
  entity.lastName = params.lastName ?? faker.person.lastName();
  entity.birthdate = params.birthdate ?? faker.date.past().toISOString();

  const bcryptRounds = toNumber(process.env.BCRYPT_ROUNDS) ?? 7;
  const password = faker.internet.password();
  const passwordHash = bcrypt.hashSync(password, bcryptRounds);

  entity.passwordHash = params.passwordHash ?? passwordHash;

  return entity;
});

export function createUser(repo: Repository<UserEntity>, params?: Partial<UserEntity>) {
  return repo.save(UserFactory.build(params));
}
