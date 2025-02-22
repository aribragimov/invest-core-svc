import { BadRequestException } from '@nestjs/common';

import { CursorPageInfo } from '@proto-schema/invest/common';

import { BaseEntity } from '../base.entity';
import { CursorPagingDto } from '../dto';

export type CursorData = [string, Date];
export type DecodedCursor = { id: string; createdAt: string };

export function encodeCursor(cursorData: CursorData): string {
  const json = JSON.stringify(cursorData);

  return Buffer.from(json).toString('base64');
}

export function decodeCursor(encodedCursor: string): DecodedCursor {
  const json = Buffer.from(encodedCursor, 'base64').toString();
  const cursorData: DecodedCursor = JSON.parse(json);

  if (
    !Array.isArray(cursorData) ||
    cursorData.length !== 2 ||
    typeof cursorData[0] !== 'string' ||
    typeof cursorData[1] !== 'string'
  ) {
    throw new BadRequestException('Invalid cursor');
  }

  const [id, createdAt] = cursorData;

  return { id, createdAt };
}

export function buildCursorPageInfo<T extends BaseEntity>(
  entities: T[],
  limit: number,
  paging?: CursorPagingDto,
): CursorPageInfo {
  if (!entities.length) {
    return {
      startCursor: '',
      endCursor: '',
      hasNextPage: false,
      hasPreviousPage: false,
    };
  }

  const isOverLimit = entities.length > limit;

  const hasNextPage = !!paging?.endingBefore || isOverLimit;
  const hasPreviousPage = !!paging?.startingAfter || (!!paging?.endingBefore && isOverLimit);

  const firstEntity = !!paging?.endingBefore && isOverLimit ? entities[1] : entities[0];
  const startCursorData: CursorData = [firstEntity.id, firstEntity.createdAt];
  const index = (!!paging?.endingBefore && 1) || (isOverLimit ? 2 : 1);

  const lastEntity = entities[entities.length - index];
  const endCursorData: CursorData = [lastEntity.id, lastEntity.createdAt];

  const startCursor = encodeCursor(startCursorData);
  const endCursor = encodeCursor(endCursorData);

  return {
    startCursor,
    endCursor,
    hasNextPage,
    hasPreviousPage,
  };
}
