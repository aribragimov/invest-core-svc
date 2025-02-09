import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { CoreRpcClientService } from 'libs/shared';

import { SvcConfigModule } from 'src/config';

import { UserController } from './user.controller';
import { UserEntity } from './user.entity';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity]), SvcConfigModule],
  providers: [UserService, CoreRpcClientService],
  exports: [UserService],
  controllers: [UserController],
})
export class UserModule {}
