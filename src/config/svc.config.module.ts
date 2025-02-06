import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import dbConfig from './db.config';
import protoConfig from './proto.config';
import svcConfig from './svc.config';
import { SvcConfigService } from './svc.config.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`.env.${process.env.NODE_ENV}.local`, `.env.${process.env.NODE_ENV}`],
      isGlobal: true,
      load: [svcConfig, dbConfig, protoConfig],
    }),
  ],
  providers: [SvcConfigService],
  exports: [SvcConfigService],
})
export class SvcConfigModule {}
