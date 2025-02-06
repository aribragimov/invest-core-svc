import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';

import * as ProtoSchema from '@proto-schema/invest/svc/core';

import { microserviceSetup } from './common/utils/microservice-setup.utils';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter({ logger: true }));
  const appConfig: ConfigService = app.get(ConfigService);

  const protoPath = appConfig.get('proto.paths');

  await microserviceSetup({
    app,
    protoPath,
    appConfig,
    protoSchema: ProtoSchema,
  });
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => bootstrap())();
