import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PortfolioController } from './portfolio.controller';
import { PortfolioEntity } from './portfolio.entity';
import { PortfolioService } from './portfolio.service';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity])],
  providers: [PortfolioService],
  exports: [PortfolioService],
  controllers: [PortfolioController],
})
export class PortfolioModule {}
