import { ClientGrpc } from '@nestjs/microservices';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { omit } from 'lodash';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';

import { DebugInfo, ResourceInfo } from '@proto-schema/google/rpc/error_details';
import * as Proto from '@proto-schema/invest/svc/core/user';

import { UserEntity } from 'src/domain/user';

import { dbDateToDateMessage } from 'src/common/helpers';

import { createUser, UserFactory } from './user.factory.spec';

import { initApp } from '../helpers';

describe('User', () => {
  let app: NestFastifyApplication;
  let client: ClientGrpc;
  let userServiceClient: Proto.UserServiceClient;
  let userRepository: Repository<UserEntity>;

  const metadata: Metadata = new Metadata();

  beforeAll(async () => {
    ({ app, client } = await initApp());

    userServiceClient = client.getService('UserService');
    userRepository = app.get('UserEntityRepository');
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    await userRepository.createQueryBuilder().delete().from(UserEntity).execute();
    metadata.remove('context-bin');
  });

  // ===========================================================================================
  describe('getUser', () => {
    it('returns user', async () => {
      await createUser(userRepository);
      const user = await createUser(userRepository);

      const result = await firstValueFrom(
        userServiceClient.getUser(
          {
            id: user.id,
          },
          metadata,
        ),
      );

      expect(result).toEqual(
        Proto.GetUserResponse.fromJSON({
          user: {
            ...user,
            birthdate: dbDateToDateMessage(user.birthdate),
          },
          status: {
            code: 0,
            details: [],
            message: '',
          },
        }),
      );
    });

    it('returns error when user does not exist', async () => {
      const result = await firstValueFrom(userServiceClient.getUser({ id: randomUUID() }, metadata));

      expect(result).toEqual({
        user: undefined,
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
        resourceType: 'User',
        resourceName: '',
        owner: '',
        description: "User can't be found",
      });
    });

    it('returns error when user is deleted', async () => {
      const user1 = await createUser(userRepository, UserFactory.deleted().build());

      const result = await firstValueFrom(userServiceClient.getUser({ id: user1.id }, metadata));

      expect(result).toEqual({
        user: undefined,
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
        resourceType: 'User',
        resourceName: '',
        owner: '',
        description: "User can't be found",
      });
    });
  });

  // ============================================================================================
  describe('createUser', () => {
    const user = UserFactory.build();

    const request: Proto.CreateUserRequest = {
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      login: user.login,
      password: user.passwordHash,
      birthdate: dbDateToDateMessage(user.birthdate),
    };

    it('returns created user', async () => {
      const result = await firstValueFrom(userServiceClient.createUser(request, metadata));

      expect(result.user).toEqual(expect.objectContaining(omit(request, ['password'])));

      expect(result.status).toEqual({
        code: 0,
        details: [],
        message: '',
      });
    });

    it('returns error on duplicate user login', async () => {
      await createUser(userRepository, { login: request.login });

      const result = await firstValueFrom(userServiceClient.createUser(request, metadata));

      expect(result).toEqual({
        user: undefined,
        status: {
          code: 6,
          message: 'ALREADY_EXISTS',
          details: [
            expect.objectContaining({
              typeUrl: 'type.googleapis.com/google.rpc.DebugInfo',
            }),
          ],
        },
      });

      expect(DebugInfo.decode(result.status!.details[0].value)).toEqual({
        detail: `Key (login)=(${request.login}) already exists.`,
        stackEntries: [],
      });
    });

    it('returns error on duplicate user email', async () => {
      await createUser(userRepository, { email: request.email });

      const result = await firstValueFrom(userServiceClient.createUser(request, metadata));

      expect(result).toEqual({
        user: undefined,
        status: {
          code: 6,
          message: 'ALREADY_EXISTS',
          details: [
            expect.objectContaining({
              typeUrl: 'type.googleapis.com/google.rpc.DebugInfo',
            }),
          ],
        },
      });

      expect(DebugInfo.decode(result.status!.details[0].value)).toEqual({
        detail: `Key (email)=(${request.email}) already exists.`,
        stackEntries: [],
      });
    });
  });

  // ============================================================================================
  describe('updateUser', () => {
    const updateData = UserFactory.build();

    const requestPayload: Proto.UpdateUserRequest_Payload = {
      firstName: updateData.firstName,
      lastName: updateData.lastName,
      birthdate: dbDateToDateMessage(updateData.birthdate),
    };

    const mask = ['firstName', 'lastName', 'birthdate'];

    it('returns updated user', async () => {
      const user = await createUser(userRepository);

      const result = await firstValueFrom(
        userServiceClient.updateUser(
          {
            id: user.id,
            payload: requestPayload,
            mask,
          },
          metadata,
        ),
      );

      expect(result.user).toEqual(expect.objectContaining({ ...requestPayload, id: user.id }));

      expect(result.user?.updatedAt).not.toEqual(user.updatedAt);

      expect(result.status).toEqual({
        code: 0,
        details: [],
        message: '',
      });
    });

    it('returns error when user does not exist', async () => {
      const result = await firstValueFrom(
        userServiceClient.updateUser({ id: randomUUID(), payload: requestPayload, mask }, metadata),
      );

      expect(result).toEqual({
        user: undefined,
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
        resourceType: 'User',
        resourceName: '',
        owner: '',
        description: "User can't be found",
      });
    });

    it('returns error when user is deleted', async () => {
      const user1 = await createUser(userRepository, UserFactory.deleted().build());

      const result = await firstValueFrom(
        userServiceClient.updateUser({ id: user1.id, payload: requestPayload, mask }, metadata),
      );

      expect(result).toEqual({
        user: undefined,
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
        resourceType: 'User',
        resourceName: '',
        owner: '',
        description: "User can't be found",
      });
    });
  });
});
