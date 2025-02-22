import { Controller, UseInterceptors } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';

import { Status } from '@proto-schema/google/rpc/status';
import {
  CreateTransactionResponse,
  GetTransactionsByCursorResponse,
  TransactionServiceController,
  TransactionServiceControllerMethods,
} from '@proto-schema/invest/svc/core';

import { HandleErrorsInterceptor } from 'src/common/interceptors/grpc-error.interceptor';

import { CreateTransactionDto, GetTransactionsByCursorDto } from './dto';
import { TransactionService } from './transaction.service';

@Controller()
@TransactionServiceControllerMethods()
@UseInterceptors(HandleErrorsInterceptor)
export class TransactionController implements TransactionServiceController {
  constructor(private readonly transactionService: TransactionService) {}

  public async getTransactionsByCursor(
    @Payload() data: GetTransactionsByCursorDto,
  ): Promise<GetTransactionsByCursorResponse> {
    const { edges, pageInfo } = await this.transactionService.getByCursor(data);

    return GetTransactionsByCursorResponse.fromJSON({
      status: Status.fromJSON({}),
      edges,
      pageInfo,
    });
  }

  public async createTransaction(@Payload() data: CreateTransactionDto): Promise<CreateTransactionResponse> {
    const transaction = await this.transactionService.create(data);

    return CreateTransactionResponse.fromJSON({
      status: Status.fromJSON({}),
      transaction,
    });
  }
}
