import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreRpcClientService } from 'libs/shared';

import { PortfolioController } from './portfolio.controller';
import { PortfolioEntity } from './portfolio.entity';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity])],
  providers: [PortfolioService, CoreRpcClientService],
  exports: [PortfolioService],
  controllers: [PortfolioController],
})
export class PortfolioModule {}
