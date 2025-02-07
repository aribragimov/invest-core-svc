import { Controller, NotFoundException, UseInterceptors } from '@nestjs/common';

import { Metadata } from '@grpc/grpc-js';

import { Status } from '@proto-schema/google/rpc/status';
import {
  GetUserRequest,
  GetUserResponse,
  UserServiceController,
  UserServiceControllerMethods,
} from '@proto-schema/invest/svc/core';

import { HandleErrorsInterceptor } from 'src/common/interceptors/grpc-error.interceptor';

import { UserService } from './user.service';

@Controller()
@UserServiceControllerMethods()
@UseInterceptors(HandleErrorsInterceptor)
export class UserController implements UserServiceController {
  constructor(private readonly userService: UserService) {}

  public async getUser({ id }: GetUserRequest, metadata: Metadata): Promise<GetUserResponse> {
    const user = await this.userService.getById(id);
    if (!user) throw new NotFoundException('User');

    return GetUserResponse.fromJSON({
      status: Status.fromJSON({}),
      user,
    });
  }
}
