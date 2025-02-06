import { Logger, ValidationError, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import { NestFastifyApplication } from '@nestjs/platform-fastify';

import { join } from 'path';

import { MicroserviceUtils } from './microservice.utils';

import { ValidationFailedError } from '../errors';

export async function microserviceSetup({
  app,
  protoPath,
  appConfig,
  protoSchema,
}: {
  app: NestFastifyApplication;
  protoPath: string[];
  appConfig: ConfigService;
  protoSchema: any;
}) {
  const hostname = '0.0.0.0';

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (validationErrors: ValidationError[] = []) => new ValidationFailedError(validationErrors),
    }),
  );

  MicroserviceUtils.handleShutdown(app);
  app.connectMicroservice(
    {
      transport: Transport.GRPC,
      options: {
        url: `${hostname}:${appConfig.get('service.ports.grpc')}`,
        package: `workaxle.svc.${appConfig.get('service.name')}`,
        protoPath,
        loader: {
          includeDirs: [join(process.cwd(), '/dist/libs/proto-schema')],
        },
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const { server } = app.getMicroservices()[0] as any;

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions,@typescript-eslint/no-shadow
  (server.grpcClient.handlers as Map<string, any>).forEach((options, key) => {
    const responseEncoder = protoSchema[`${key.split('/').pop()}Response`];
    if (responseEncoder !== undefined) {
      // eslint-disable-next-line no-param-reassign
      options.serialize = value => responseEncoder.encode(value).finish();
    }

    const requestDecoder = protoSchema[`${key.split('/').pop()}Request`];
    if (requestDecoder !== undefined) {
      // eslint-disable-next-line no-param-reassign
      options.deserialize = value => requestDecoder.decode(value);
    }
  });

  Logger.log(
    `GRPC ${appConfig.get('service.name')} running on port: ${appConfig.get('service.ports.grpc')}`,
    'Bootstrap',
  );

  await app.listen(appConfig.get<number>('service.ports.rest') || 3000, hostname);
  Logger.log(
    `REST ${appConfig.get('service.name')} running on port: ${appConfig.get('service.ports.rest')}`,
    'Bootstrap',
  );
}
