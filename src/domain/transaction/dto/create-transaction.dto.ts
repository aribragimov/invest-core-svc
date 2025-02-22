import { IsDate, IsDefined, IsEnum, IsNumber, IsOptional, IsString, IsUUID, Length } from 'class-validator';

import { CreateTransactionRequest, TransactionType } from '@proto-schema/invest/svc/core';

export class CreateTransactionDto implements CreateTransactionRequest {
  @IsString()
  @Length(4, 10)
  ticket: string;

  @IsString()
  @Length(1, 100)
  assetName: string;

  @IsUUID()
  portfolioId: string;

  @IsNumber()
  price: number;

  @IsNumber()
  quantity: number;

  @IsDefined()
  @IsDate()
  date: Date;

  @IsEnum(TransactionType)
  type: TransactionType;

  @IsOptional()
  @IsString()
  note?: string;
}
