/* eslint-disable max-classes-per-file */
import { Type } from 'class-transformer';
import { IsDate, IsOptional, IsString, IsUUID, Length, ValidateNested } from 'class-validator';

import { DateMessage } from '@proto-schema/google/type/date';
import * as Proto from '@proto-schema/invest/svc/core/user';

class PayloadDTO {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  birthdate?: DateMessage;
}

export class UpdateUserDto implements Proto.UpdateUserRequest {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => PayloadDTO)
  payload: PayloadDTO;
}
