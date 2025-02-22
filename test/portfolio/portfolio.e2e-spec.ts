import { ClientGrpc } from '@nestjs/microservices';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { omit } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { ResourceInfo } from '@proto-schema/google/rpc/error_details';
import * as Proto from '@proto-schema/invest/svc/core/portfolio';

import { createUser } from 'test/user';

import { PortfolioEntity } from 'src/domain/portfolio';
import { UserEntity } from 'src/domain/user';

import { createPortfolio, PortfolioFactory } from './portfolio.factory.spec';

import { initApp } from '../helpers';

describe('Portfolio', () => {
  let app: NestFastifyApplication;
  let client: ClientGrpc;
  let portfolioServiceClient: Proto.PortfolioServiceClient;
  let userRepository: Repository<UserEntity>;
  let portfolioRepository: Repository<PortfolioEntity>;

  const metadata: Metadata = new Metadata();

  beforeAll(async () => {
    ({ app, client } = await initApp());

    portfolioServiceClient = client.getService('PortfolioService');
    userRepository = app.get('UserEntityRepository');
    portfolioRepository = app.get('PortfolioEntityRepository');
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await portfolioRepository.createQueryBuilder().delete().from(PortfolioEntity).execute();
    await userRepository.createQueryBuilder().delete().from(UserEntity).execute();
    metadata.remove('context-bin');
  });

  // ===========================================================================================
  describe('getPortfolios', () => {
    it('returns portfolios', async () => {
      const user = await createUser(userRepository);
      const portfolio = await createPortfolio(portfolioRepository, { userId: user.id });

      const user2 = await createUser(userRepository);
      await createPortfolio(portfolioRepository, { userId: user2.id });

      const result = await firstValueFrom(
        portfolioServiceClient.getPortfolios(
          {
            userId: user.id,
          },
          metadata,
        ),
      );

      expect(result).toEqual(
        Proto.GetPortfoliosResponse.fromJSON({
          portfolios: [portfolio],
          status: {
            code: 0,
            details: [],
            message: '',
          },
        }),
      );
    });

    it('returns empty array when portfolio does not exist', async () => {
      const result = await firstValueFrom(portfolioServiceClient.getPortfolios({ userId: randomUUID() }, metadata));

      expect(result).toEqual(
        Proto.GetPortfoliosResponse.fromJSON({
          portfolios: [],
          status: {
            code: 0,
            details: [],
            message: '',
          },
        }),
      );
    });

    it('returns empty array when portfolio is deleted', async () => {
      const user = await createUser(userRepository);
      await createPortfolio(portfolioRepository, PortfolioFactory.deleted().build({ userId: user.id }));

      const result = await firstValueFrom(portfolioServiceClient.getPortfolios({ userId: user.id }, metadata));

      expect(result).toEqual(
        Proto.GetPortfoliosResponse.fromJSON({
          portfolios: [],
          status: {
            code: 0,
            details: [],
            message: '',
          },
        }),
      );
    });
  });

  // ============================================================================================
  describe('createPortfolio', () => {
    const portfolio = PortfolioFactory.build();

    const requestData: Proto.CreatePortfolioRequest = {
      broker: portfolio.broker,
      currency: portfolio.currency,
      userId: portfolio.userId,
      name: portfolio.name,
    };

    it('returns created portfolio', async () => {
      const user = await createUser(userRepository);

      const request = {
        ...requestData,
        userId: user.id,
      };

      const result = await firstValueFrom(portfolioServiceClient.createPortfolio(request, metadata));

      expect(result.portfolio).toEqual(expect.objectContaining(request));

      expect(result.status).toEqual({
        code: 0,
        details: [],
        message: '',
      });
    });

    it('returns error when user does not exist', async () => {
      const result = await firstValueFrom(portfolioServiceClient.createPortfolio(requestData, metadata));

      expect(result).toEqual({
        portfolio: undefined,
        status: {
          code: 13,
          message: 'INTERNAL',
          details: [
            expect.objectContaining({
              typeUrl: 'type.googleapis.com/google.rpc.DebugInfo',
            }),
          ],
        },
      });
    });
  });

  // ============================================================================================
  describe('updatePortfolio', () => {
    const updateData = PortfolioFactory.build();

    const requestPayload: Proto.UpdatePortfolioRequest_Payload = {
      name: updateData.name,
      description: updateData.description,
    };

    const mask = ['name', 'description'];

    it('returns updated portfolio', async () => {
      const user = await createUser(userRepository);
      const portfolio = await createPortfolio(portfolioRepository, { userId: user.id });

      const result = await firstValueFrom(
        portfolioServiceClient.updatePortfolio(
          {
            id: portfolio.id,
            payload: requestPayload,
            mask,
          },
          metadata,
        ),
      );

      expect(result.portfolio).toEqual(
        expect.objectContaining(omit({ ...portfolio, ...requestPayload }, ['updatedAt', 'deletedAt', 'description'])),
      );

      expect(result.portfolio?.updatedAt).not.toEqual(portfolio.updatedAt);

      expect(result.status).toEqual({
        code: 0,
        details: [],
        message: '',
      });
    });

    it('returns error when portfolio does not exist', async () => {
      const result = await firstValueFrom(
        portfolioServiceClient.updatePortfolio({ id: randomUUID(), payload: requestPayload, mask }, metadata),
      );

      expect(result).toEqual({
        portfolio: undefined,
        status: {
          code: 5,
          message: 'NOT_FOUND',
          details: [
            expect.objectContaining({
              typeUrl: 'type.googleapis.com/google.rpc.ResourceInfo',
            }),
          ],
        },
      });

      expect(ResourceInfo.decode(result.status!.details[0].value)).toEqual({
        resourceType: 'Portfolio',
        resourceName: '',
        owner: '',
        description: "Portfolio can't be found",
      });
    });

    it('returns error when portfolio is deleted', async () => {
      const user = await createUser(userRepository);
      const portfolio1 = await createPortfolio(
        portfolioRepository,
        PortfolioFactory.deleted().build({ userId: user.id }),
      );

      const result = await firstValueFrom(
        portfolioServiceClient.updatePortfolio({ id: portfolio1.id, payload: requestPayload, mask }, metadata),
      );

      expect(result).toEqual({
        portfolio: undefined,
        status: {
          code: 5,
          message: 'NOT_FOUND',
          details: [
            expect.objectContaining({
              typeUrl: 'type.googleapis.com/google.rpc.ResourceInfo',
            }),
          ],
        },
      });

      expect(ResourceInfo.decode(result.status!.details[0].value)).toEqual({
        resourceType: 'Portfolio',
        resourceName: '',
        owner: '',
        description: "Portfolio can't be found",
      });
    });
  });
});
