import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';

import { TransactionType } from '@proto-schema/invest/svc/core';

import { PortfolioEntity } from 'src/domain/portfolio/portfolio.entity';

import { BaseEntity } from 'src/common';

@Entity({ name: 'transactions' })
@Index(['portfolioId', 'date'])
export class TransactionEntity extends BaseEntity {
  @Column({ type: 'varchar', length: 10 })
  public ticket: string;

  @Column({ type: 'varchar', length: 100 })
  public assetName: string;

  @Column({ type: 'uuid' })
  public portfolioId: string;

  @Column({ type: 'decimal', precision: 18, scale: 4 })
  public price: number;

  @Column({ type: 'int' })
  public quantity: number;

  @Column({ type: 'timestamptz', precision: 3 })
  public date: Date;

  @Column({ type: 'enum', enum: TransactionType })
  public type: TransactionType;

  @Column({ type: 'text', nullable: true })
  public note?: string;

  @ManyToOne(() => PortfolioEntity, portfolio => portfolio.transactions, {
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'portfolio_id' })
  portfolio: Relation<PortfolioEntity>;
}
