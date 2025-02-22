import { ClientGrpc } from '@nestjs/microservices';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { Metadata } from '@grpc/grpc-js';
import { omit } from 'lodash';
import { DateTime } from 'luxon';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { SortingDirection } from '@proto-schema/invest/common';
import * as Proto from '@proto-schema/invest/svc/core/transaction';

import { createPortfolio } from 'test/portfolio';
import { createUser } from 'test/user';

import { PortfolioEntity } from 'src/domain/portfolio';
import { TransactionEntity } from 'src/domain/transaction';
import { UserEntity } from 'src/domain/user';

import { encodeCursor } from 'src/common/helpers';

import { createTransaction, TransactionFactory } from './transaction.factory.spec';

import { initApp } from '../helpers';

describe('Transaction', () => {
  let app: NestFastifyApplication;
  let client: ClientGrpc;
  let transactionServiceClient: Proto.TransactionServiceClient;

  let userRepository: Repository<UserEntity>;
  let portfolioRepository: Repository<PortfolioEntity>;
  let transactionRepository: Repository<TransactionEntity>;

  const metadata: Metadata = new Metadata();

  beforeAll(async () => {
    ({ app, client } = await initApp());

    transactionServiceClient = client.getService('TransactionService');
    userRepository = app.get('UserEntityRepository');
    portfolioRepository = app.get('PortfolioEntityRepository');
    transactionRepository = app.get('TransactionEntityRepository');
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await transactionRepository.createQueryBuilder().delete().from(TransactionEntity).execute();
    await portfolioRepository.createQueryBuilder().delete().from(PortfolioEntity).execute();
    await userRepository.createQueryBuilder().delete().from(UserEntity).execute();
    metadata.remove('context-bin');
  });

  // ============================================================================================
  describe('createTransaction', () => {
    it('returns created transaction', async () => {
      const user = await createUser(userRepository);

      const portfolio = await createPortfolio(portfolioRepository, { user });

      const request: Proto.CreateTransactionRequest = TransactionFactory.build({ portfolioId: portfolio.id });

      const result = await firstValueFrom(transactionServiceClient.createTransaction(request, metadata));

      expect(result.transaction).toMatchObject(omit(request, ['id', 'createdAt', 'updatedAt']));

      expect(result.status).toEqual({
        code: 0,
        details: [],
        message: '',
      });
    });
  });

  // ============================================================================================
  describe('getTransactionsByCursor', () => {
    const currentDateTime = DateTime.utc();

    let transactions: TransactionEntity[];

    let encodeCursors: string[];
    let portfolioId: string;

    beforeEach(async () => {
      const user = await createUser(userRepository);

      const portfolio = await createPortfolio(portfolioRepository, { user });
      portfolioId = portfolio.id;

      transactions = await Promise.all(
        Array.from(Array(5)).map((_, i) =>
          createTransaction(transactionRepository, {
            createdAt: currentDateTime.plus({ hour: i }).toJSDate(),
            portfolio,
            portfolioId,
          }),
        ),
      );

      encodeCursors = transactions.map(transaction => encodeCursor([transaction.id, transaction.createdAt]));
    });

    it('returns transactions and page info with startingAfter cursor data and desc sorting', async () => {
      const result = await firstValueFrom(
        transactionServiceClient.getTransactionsByCursor(
          {
            paging: {
              limit: 2,
              startingAfter: encodeCursors[2],
            },
            sorting: {
              direction: SortingDirection.DESC,
              field: Proto.GetTransactionsByCursorRequest_SortingField.CREATED_AT,
            },
            filter: {
              portfolioId,
            },
          },
          metadata,
        ),
      );

      expect(result).toEqual({
        edges: [
          {
            node: expect.objectContaining({ id: transactions[1].id }),
            cursor: encodeCursors[1],
          },
          {
            node: expect.objectContaining({ id: transactions[0].id }),
            cursor: encodeCursors[0],
          },
        ],
        pageInfo: {
          startCursor: encodeCursors[1],
          endCursor: encodeCursors[0],
          hasNextPage: false,
          hasPreviousPage: true,
        },
        status: {
          code: 0,
          details: [],
          message: '',
        },
      });
    });

    it('returns transactions and page info with endingBefore cursor data and asc sorting', async () => {
      const result = await firstValueFrom(
        transactionServiceClient.getTransactionsByCursor(
          {
            paging: {
              limit: 2,
              endingBefore: encodeCursors[2],
            },
            sorting: {
              direction: SortingDirection.ASC,
              field: Proto.GetTransactionsByCursorRequest_SortingField.CREATED_AT,
            },
            filter: {
              portfolioId,
            },
          },
          metadata,
        ),
      );

      expect(result).toEqual({
        edges: [
          {
            node: expect.objectContaining({ id: transactions[0].id }),
            cursor: encodeCursors[0],
          },
          {
            node: expect.objectContaining({ id: transactions[1].id }),
            cursor: encodeCursors[1],
          },
        ],
        pageInfo: {
          startCursor: encodeCursors[0],
          endCursor: encodeCursors[1],
          hasNextPage: true,
          hasPreviousPage: false,
        },
        status: {
          code: 0,
          details: [],
          message: '',
        },
      });
    });
  });
});
