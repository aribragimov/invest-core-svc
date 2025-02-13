import { Controller, NotFoundException, UseInterceptors } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';

import { Status } from '@proto-schema/google/rpc/status';
import {
  CreateUserResponse,
  GetUserRequest,
  GetUserResponse,
  UpdateUserResponse,
  UserServiceController,
  UserServiceControllerMethods,
} from '@proto-schema/invest/svc/core';

import { HandleErrorsInterceptor } from 'src/common/interceptors/grpc-error.interceptor';

import { CreateUserDto, UpdateUserDto } from './dto';
import { userDbToProto } from './helpers';
import { UserService } from './user.service';

@Controller()
@UserServiceControllerMethods()
@UseInterceptors(HandleErrorsInterceptor)
export class UserController implements UserServiceController {
  constructor(private readonly userService: UserService) {}

  public async getUser({ id }: GetUserRequest): Promise<GetUserResponse> {
    const user = await this.userService.getById(id);
    if (!user) throw new NotFoundException('User');

    return GetUserResponse.fromJSON({
      status: Status.fromJSON({}),
      user: userDbToProto(user),
    });
  }

  public async createUser(@Payload() data: CreateUserDto): Promise<CreateUserResponse> {
    const user = await this.userService.create(data);

    return CreateUserResponse.fromJSON({
      status: Status.fromJSON({}),
      user: userDbToProto(user),
    });
  }

  public async updateUser(@Payload() { id, payload, mask }: UpdateUserDto): Promise<UpdateUserResponse> {
    const user = await this.userService.getById(id);
    if (!user) throw new NotFoundException('User');

    const updatedUser = await this.userService.update(user, payload, mask);

    return UpdateUserResponse.fromJSON({
      status: Status.fromJSON({}),
      user: userDbToProto(updatedUser),
    });
  }
}
