import { Injectable } from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { plainToInstance } from 'class-transformer';
import { toNumber } from 'lodash';
import { DataSource, QueryRunner } from 'typeorm';

import { SvcConfigService } from 'src/config';

import { buildDataFromPayloadAndMask, dateMessageToDbDate, getRepository } from 'src/common/helpers';

import { CreateUserDto, UpdateUserPayloadDto } from './dto';
import { UserEntity } from './user.entity';

@Injectable()
export class UserService {
  constructor(private readonly datasource: DataSource, private readonly svcConfigService: SvcConfigService) {}

  public async getById(id: string, queryRunner?: QueryRunner): Promise<UserEntity | null> {
    const userRepository = getRepository(queryRunner ?? this.datasource, UserEntity);

    return userRepository.findOneBy({ id });
  }

  public async create(data: CreateUserDto, queryRunner?: QueryRunner): Promise<UserEntity> {
    const userRepository = getRepository(queryRunner ?? this.datasource, UserEntity);

    const entity = userRepository.create({
      ...data,
      birthdate: dateMessageToDbDate(data.birthdate),
      passwordHash: await this.generatePasswordHash(data.password),
    });

    return userRepository.save(entity);
  }

  public async update(
    user: UserEntity,
    payload: UpdateUserPayloadDto,
    mask: string[],
    queryRunner?: QueryRunner,
  ): Promise<UserEntity> {
    const attrs = buildDataFromPayloadAndMask({ payload, mask });

    const result = await getRepository(queryRunner ?? this.datasource, UserEntity)
      .createQueryBuilder('users')
      .update(UserEntity, {
        ...attrs,
        birthdate: attrs.birthdate ? dateMessageToDbDate(attrs.birthdate) : undefined,
      })
      .whereEntity(user)
      .returning('*')
      .updateEntity(true)
      .execute();

    return plainToInstance(UserEntity, result.generatedMaps[0]);
  }

  private async generatePasswordHash(password: string): Promise<string> {
    const bcryptRounds = toNumber(this.svcConfigService.get<number>('service.bcryptRounds')) ?? 7;
    const passwordHash = await bcrypt.hash(password, bcryptRounds);

    return passwordHash;
  }
}
