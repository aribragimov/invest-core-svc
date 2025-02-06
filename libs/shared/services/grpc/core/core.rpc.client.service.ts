import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, ClientGrpc, Transport } from '@nestjs/microservices';

import { UserServiceClient } from '@proto-schema/invest/svc/core';

import { CORE } from './core-definition.constants';

interface Services {
  user: UserServiceClient;
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
    };
  }
}
