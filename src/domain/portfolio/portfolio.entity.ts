import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { UserEntity } from 'src/domain/user/user.entity';

import { BaseEntity } from 'src/common';

import { Broker, Currency } from './enums';

@Entity({ name: 'portfolios' })
export class PortfolioEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 50 })
  public name: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  @Column({ type: 'enum', enum: Currency })
  public currency: Currency;

  @Column({ type: 'enum', enum: Broker })
  public broker: Broker;

  @ManyToOne(() => UserEntity, user => user.portfolios, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @Index()
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;
}
