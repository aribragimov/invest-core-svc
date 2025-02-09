import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { PortfolioBroker, PortfolioCurrency } from '@proto-schema/invest/svc/core';

import { UserEntity } from 'src/domain/user/user.entity';

import { BaseEntity } from 'src/common';

@Entity({ name: 'portfolios' })
export class PortfolioEntity extends BaseEntity {
  @Index()
  @Column({ type: 'uuid', nullable: false })
  public userId: string;

  @Column({ type: 'varchar', length: 50 })
  public name: string;

  @Column({ type: 'text', nullable: true })
  public description: string;

  @Column({ type: 'enum', enum: PortfolioCurrency })
  public currency: PortfolioCurrency;

  @Column({ type: 'enum', enum: PortfolioBroker })
  public broker: PortfolioBroker;

  @ManyToOne(() => UserEntity, user => user.portfolios, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: Relation<UserEntity>;
}
