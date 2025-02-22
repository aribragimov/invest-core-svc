/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import { IsDefined, IsEnum, IsOptional, IsUUID, ValidateNested } from 'class-validator';
import { Brackets } from 'typeorm';

import { SortingDirection } from '@proto-schema/invest/common/sorting';
import {
  GetTransactionsByCursorRequest,
  GetTransactionsByCursorRequest_Filter,
  GetTransactionsByCursorRequest_Sorting,
  GetTransactionsByCursorRequest_SortingField,
} from '@proto-schema/invest/svc/core';

import { CursorPagingDto } from 'src/common/dto';
import { DecodedCursor } from 'src/common/helpers';

export class TransactionCursorSortingDto implements GetTransactionsByCursorRequest_Sorting {
  @IsEnum(GetTransactionsByCursorRequest_SortingField)
  @IsDefined()
  field: GetTransactionsByCursorRequest_SortingField;

  @IsEnum(SortingDirection)
  @IsDefined()
  direction: SortingDirection;
}

export class TransactionCursorFilterDto implements GetTransactionsByCursorRequest_Filter {
  @IsUUID()
  portfolioId: string;
}

export class GetTransactionsByCursorDto implements GetTransactionsByCursorRequest {
  @ValidateNested()
  @IsDefined()
  @Type(() => CursorPagingDto)
  paging: CursorPagingDto;

  @ValidateNested()
  @IsDefined()
  @Type(() => TransactionCursorFilterDto)
  filter: TransactionCursorFilterDto;

  @ValidateNested()
  @IsOptional()
  @Type(() => TransactionCursorSortingDto)
  sorting: TransactionCursorSortingDto;

  static getSortDirection(
    sorting?: GetTransactionsByCursorRequest_Sorting,
    paging?: CursorPagingDto,
  ): SortingDirection {
    const isDescending = sorting?.direction === SortingDirection.DESC;
    if (paging?.endingBefore) {
      return isDescending ? SortingDirection.ASC : SortingDirection.DESC;
    }
    return isDescending ? SortingDirection.DESC : SortingDirection.ASC;
  }

  static applyCursor({ id, createdAt }: DecodedCursor, comparator: '>' | '<') {
    return new Brackets(qb => {
      qb.where(`transactions.createdAt ${comparator} :createdAt`, { createdAt }).orWhere(
        new Brackets(qbNested => {
          qbNested
            .where('transactions.createdAt = :createdAt', { createdAt })
            .andWhere(`transactions.id ${comparator} :id`, { id });
        }),
      );
    });
  }
}
