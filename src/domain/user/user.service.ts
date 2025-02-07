import { Injectable } from '@nestjs/common';

import { DataSource, QueryRunner } from 'typeorm';

import { getRepository } from 'src/common/helpers';

import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(private readonly datasource: DataSource) {}

  public async getById(id: string, queryRunner?: QueryRunner): Promise<UserEntity | null> {
    const userRepository = getRepository(queryRunner ?? this.datasource, UserEntity);

    return userRepository.findOne({ where: { id } });
  }
}
