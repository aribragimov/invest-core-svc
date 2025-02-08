import { IsNumber } from 'class-validator';

import * as Proto from '@proto-schema/google/type/date';

export class DateMessageDto implements Proto.DateMessage {
  @IsNumber()
  year: number;

  @IsNumber()
  month: number;

  @IsNumber()
  day: number;
}
