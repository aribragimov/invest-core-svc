import { Injectable } from '@nestjs/common';

import { plainToInstance } from 'class-transformer';
import { DataSource, QueryRunner } from 'typeorm';

import { dateMessageToDate, getRepository } from 'src/common/helpers';

import { CreateUserDto } from './dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(private readonly datasource: DataSource) {}

  public async getById(id: string, queryRunner?: QueryRunner): Promise<UserEntity | null> {
    const userRepository = getRepository(queryRunner ?? this.datasource, UserEntity);

    return userRepository.findOne({ where: { id } });
  }

  public async create(data: CreateUserDto, queryRunner?: QueryRunner): Promise<UserEntity> {
    const userRepository = getRepository(queryRunner ?? this.datasource, UserEntity);

    const entity = userRepository.create({ ...data, birthdate: dateMessageToDate(data.birthdate) });

    return userRepository.save(entity);
  }

  async update(user: UserEntity, attrs: Partial<UserEntity>, queryRunner?: QueryRunner): Promise<UserEntity> {
    const result = await getRepository(queryRunner ?? this.datasource, UserEntity)
      .createQueryBuilder('users')
      .update(UserEntity, attrs)
      .whereEntity(user)
      .returning('*')
      .updateEntity(true)
      .execute();

    return plainToInstance(UserEntity, result.generatedMaps[0]);
  }
}
