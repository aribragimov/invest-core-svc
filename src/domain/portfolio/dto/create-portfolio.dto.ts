import { IsEnum, IsOptional, IsString, Length } from 'class-validator';

import { CreatePortfolioRequest, PortfolioBroker, PortfolioCurrency } from '@proto-schema/invest/svc/core';

export class CreatePortfolioDto implements CreatePortfolioRequest {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  userId: string;

  @IsEnum(PortfolioBroker)
  broker: PortfolioBroker;

  @IsEnum(PortfolioCurrency)
  currency: PortfolioCurrency;
}
