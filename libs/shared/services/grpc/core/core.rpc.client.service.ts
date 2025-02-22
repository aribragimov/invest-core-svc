import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc, Transport } from '@nestjs/microservices';

import { PortfolioServiceClient, TransactionServiceClient, UserServiceClient } from '@proto-schema/invest/svc/core';

import { CORE } from './core-definition.constants';

interface Services {
  user: UserServiceClient;
  portfolio: PortfolioServiceClient;
  transaction: TransactionServiceClient;
}

@Injectable()
export class CoreRpcClientService implements OnModuleInit {
  @Client({
    transport: Transport.GRPC,
    options: CORE,
  })
  private readonly client: ClientGrpc;

  public svc: Services;

  onModuleInit() {
    this.svc = {
      user: this.client.getService<UserServiceClient>(CORE.services.user),
      portfolio: this.client.getService<PortfolioServiceClient>(CORE.services.portfolio),
      transaction: this.client.getService<TransactionServiceClient>(CORE.services.transaction),
    };
  }
}
