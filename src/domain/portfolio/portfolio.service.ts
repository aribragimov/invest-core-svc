import { Injectable } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { DataSource, QueryRunner } from 'typeorm';

import { getRepository } from 'src/common/helpers';

import { CreatePortfolioDto, UpdatePortfolioPayloadDto } from './dto';
import { PortfolioEntity } from './portfolio.entity';

@Injectable()
export class PortfolioService {
  constructor(private readonly datasource: DataSource) {}

  public async getById(id: string, queryRunner?: QueryRunner): Promise<PortfolioEntity | null> {
    const portfolioRepository = getRepository(queryRunner ?? this.datasource, PortfolioEntity);

    return portfolioRepository.findOneBy({ id });
  }

  public async create(data: CreatePortfolioDto, queryRunner?: QueryRunner): Promise<PortfolioEntity> {
    const portfolioRepository = getRepository(queryRunner ?? this.datasource, PortfolioEntity);

    const entity = portfolioRepository.create(data);

    return portfolioRepository.save(entity);
  }

  public async update(
    portfolio: PortfolioEntity,
    payload: UpdatePortfolioPayloadDto,
    queryRunner?: QueryRunner,
  ): Promise<PortfolioEntity> {
    const result = await getRepository(queryRunner ?? this.datasource, PortfolioEntity)
      .createQueryBuilder('portfolios')
      .update(PortfolioEntity, payload)
      .whereEntity(portfolio)
      .returning('*')
      .updateEntity(true)
      .execute();

    return plainToInstance(PortfolioEntity, result.generatedMaps[0]);
  }
}
