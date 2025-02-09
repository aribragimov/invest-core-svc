import { faker } from '@faker-js/faker/.';
import { randomUUID } from 'crypto';
import { Factory } from 'fishery';
import { Repository } from 'typeorm';

import { PortfolioBroker, PortfolioCurrency } from '@proto-schema/invest/svc/core';

import { PortfolioEntity } from 'src/domain/portfolio';

class EntityFactory extends Factory<PortfolioEntity> {
  public deleted() {
    return this.params({
      deletedAt: new Date(),
    });
  }
}

export const PortfolioFactory = EntityFactory.define(({ params }) => {
  const entity = new PortfolioEntity();
  entity.id = randomUUID();
  entity.broker = PortfolioBroker.VTB;
  entity.currency = PortfolioCurrency.RUB;
  entity.userId = params.userId ?? randomUUID();
  entity.name = faker.finance.accountName();

  return entity;
});

export function createPortfolio(repo: Repository<PortfolioEntity>, params?: Partial<PortfolioEntity>) {
  return repo.save(PortfolioFactory.build(params));
}
