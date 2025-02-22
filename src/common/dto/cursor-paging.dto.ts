import { IsDefined, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

import { CursorPaging } from '@proto-schema/invest/common';

export class CursorPagingDto implements CursorPaging {
  @Min(1)
  @Max(100)
  @IsInt()
  @IsNumber()
  @IsDefined()
  limit: number;

  @IsOptional()
  @IsString()
  endingBefore?: string;

  @IsOptional()
  @IsString()
  startingAfter?: string;
}
