import { Logger, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreRpcClientService } from 'libs/shared';

import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  providers: [UserService, CoreRpcClientService, Logger],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
