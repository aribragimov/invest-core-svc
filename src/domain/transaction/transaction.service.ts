import { Injectable } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { SortingDirection } from '@proto-schema/invest/common';

import { buildCursorPageInfo, decodeCursor, encodeCursor, getRepository } from 'src/common/helpers';

import { CreateTransactionDto, GetTransactionsByCursorDto } from './dto';
import { TransactionEntity } from './transaction.entity';

@Injectable()
export class TransactionService {
  constructor(private readonly datasource: DataSource) {}

  public async create(data: CreateTransactionDto, queryRunner?: QueryRunner): Promise<TransactionEntity> {
    const transactionRepository = getRepository(queryRunner ?? this.datasource, TransactionEntity);

    const entity = transactionRepository.create(data);

    return transactionRepository.save(entity);
  }

  public async getByCursor({ paging, filter, sorting }: GetTransactionsByCursorDto, queryRunner?: QueryRunner) {
    const limit = paging?.limit ?? 10;

    const sortDirection = GetTransactionsByCursorDto.getSortDirection(sorting, paging);

    const query = getRepository(queryRunner ?? this.datasource, TransactionEntity)
      .createQueryBuilder('transactions')
      .limit(limit + 1)
      .andWhere('transactions.portfolio_id = :portfolioId', { portfolioId: filter.portfolioId });

    const comparator = sortDirection === SortingDirection.ASC ? '>' : '<';

    if (paging?.startingAfter) {
      const decodedStartingCursor = decodeCursor(paging.startingAfter);
      query.andWhere(GetTransactionsByCursorDto.applyCursor(decodedStartingCursor, comparator));
    }

    if (paging?.endingBefore) {
      const decodedEndingCursor = decodeCursor(paging?.endingBefore);
      query.andWhere(GetTransactionsByCursorDto.applyCursor(decodedEndingCursor, comparator));
    }

    query.orderBy({
      'transactions.created_at': sortDirection,
      'transactions.id': sortDirection,
    });

    const transactions = await query.getMany();

    if (paging?.endingBefore) {
      transactions.reverse();
    }

    const pageInfo = buildCursorPageInfo(transactions, limit, paging);

    if (transactions.length > limit) {
      if (paging.endingBefore) {
        transactions.shift();
      } else {
        transactions.pop();
      }
    }

    return {
      edges: transactions.map(transaction => ({
        node: transaction,
        cursor: encodeCursor([transaction.id, transaction.createdAt]),
      })),
      pageInfo,
    };
  }
}
