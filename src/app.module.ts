import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

import { PortfolioModule } from './domain/portfolio';
import { UserModule } from './domain/user';
import { SvcConfigModule } from './config';
import { HealthController } from './health';

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
    PortfolioModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
