import { faker } from '@faker-js/faker/.';
import { randomUUID } from 'crypto';
import { Factory } from 'fishery';
import { Repository } from 'typeorm';

import { TransactionType } from '@proto-schema/invest/svc/core';

import { TransactionEntity } from 'src/domain/transaction';

class EntityFactory extends Factory<TransactionEntity> {
  public deleted() {
    return this.params({
      deletedAt: new Date(),
    });
  }
}

export const TransactionFactory = EntityFactory.define(({ params }) => {
  const entity = new TransactionEntity();
  entity.id = randomUUID();
  entity.ticket = params.ticket ?? faker.string.alphanumeric(10);
  entity.assetName = params.assetName ?? faker.commerce.productName();
  entity.portfolioId = params.portfolioId ?? randomUUID();
  entity.price = params.price ?? parseFloat(faker.finance.amount({ min: 1, max: 1000 }));
  entity.quantity = params.quantity ?? faker.number.int({ min: 1, max: 1000 });
  entity.date = params.date ?? faker.date.recent();
  entity.type = params.type ?? faker.helpers.arrayElement(Object.values(TransactionType));
  entity.note = params.note ?? faker.lorem.sentence();

  return entity;
});

export function createTransaction(repo: Repository<TransactionEntity>, params?: Partial<TransactionEntity>) {
  return repo.save(TransactionFactory.build(params));
}
