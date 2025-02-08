import { Column, Entity, OneToMany, Relation } from 'typeorm';

import { PortfolioEntity } from 'src/domain/portfolio/portfolio.entity';

import { BaseEntity } from 'src/common';

@Entity({ name: 'users' })
export class UserEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  public firstName: string;

  @Column({ type: 'varchar', length: 50 })
  public lastName: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  public email: string;

  @Column({ type: 'varchar', length: 50, unique: true })
  public login: string;

  @Column({ type: 'bytea' })
  public passwordHash: string;

  @Column({ type: 'date' })
  public birthdate: string;

  @OneToMany(() => PortfolioEntity, portfolio => portfolio.user, { cascade: true })
  portfolios: Relation<PortfolioEntity[]>;
}
