import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { UserModule } from './domain/user';
import { HealthController } from './health/health.controller';
import { SvcConfigModule } from './config';

@Module({
  imports: [
    HttpModule,
    SvcConfigModule,
    ConfigModule,
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<{ database: TypeOrmModuleOptions }, true>) =>
        configService.get('database'),
    }),
    UserModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
