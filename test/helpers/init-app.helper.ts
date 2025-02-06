import { ConfigService } from '@nestjs/config';
import { ClientGrpc, ClientsModule, Transport } from '@nestjs/microservices';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Test } from '@nestjs/testing';

import { InterceptingCall } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { join } from 'path';
import { AppModule } from 'src/app.module';

import * as ProtoSchema from '@proto-schema/invest/user';

import { microserviceSetup } from 'src/common/utils/microservice-setup.utils';

interface TestApp {
  app: NestFastifyApplication;
  client: ClientGrpc;
}

export async function initApp(): Promise<TestApp> {
  const name = randomUUID();

  const moduleFixture = await Test.createTestingModule({
    imports: [
      AppModule,
      ClientsModule.registerAsync([
        {
          inject: [ConfigService],
          name,
          useFactory: async (configService: ConfigService) => ({
            transport: Transport.GRPC,
            options: {
              package: 'invest-core.svc.setsvcname',
              protoPath: configService.get('proto.paths'),
              url: 'localhost:5001',
              loader: {
                keepCase: true,
                includeDirs: [join(__dirname, '../../dist/libs/proto-schema')],
              },
              channelOptions: {
                /* eslint-disable @typescript-eslint/consistent-type-assertions */
                interceptors: [
                  (options, nextCall) => {
                    const requestEncoder = ProtoSchema[`${options.method_definition.path.split('/').pop()}Request`];
                    if (requestEncoder !== undefined) {
                      // eslint-disable-next-line no-param-reassign
                      options.method_definition.requestSerialize = value => requestEncoder.encode(value).finish();
                    }

                    const responseDecoder = ProtoSchema[`${options.method_definition.path.split('/').pop()}Response`];
                    if (responseDecoder !== undefined) {
                      // eslint-disable-next-line no-param-reassign
                      options.method_definition.responseDeserialize = value => responseDecoder.decode(value);
                    }

                    return new InterceptingCall(nextCall(options));
                  },
                ] as any,
              },
            },
          }),
        },
      ]),
    ],
  }).compile();

  const app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());
  const appConfig: ConfigService = app.get(ConfigService);
  const protoPath = appConfig.get('proto.paths');

  await microserviceSetup({
    app,
    protoPath,
    appConfig,
    protoSchema: ProtoSchema,
  });

  const client = app.get(name);
  return { app, client };
}
