import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  public first_name: string;

  @Column({ type: 'varchar', length: 50 })
  public last_name: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  public email: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  public login: string;

  @Column({ type: 'bytea' })
  public password_hash: string;

  @Column({ type: 'date' })
  public birthdate: Date;
}
