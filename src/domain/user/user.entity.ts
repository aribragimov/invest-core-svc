import { Column, Entity } from 'typeorm';

import { BaseEntity } from 'src/common';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 100 })
  public first_name: string;

  @Column({ type: 'varchar', length: 100 })
  public last_name: string;

  @Column({ type: 'varchar', length: 250, unique: true })
  public email: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  public login: string;

  @Column({ type: 'bytea' })
  public password_hash: string;
}
