import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';

import { DateMessage } from '@proto-schema/google/type/date';
import * as Proto from '@proto-schema/invest/svc/core/user';

import { DateMessageDto } from 'src/common/dto';

export class UpdateUserPayloadDto implements Proto.UpdateUserRequest_Payload {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateMessageDto)
  birthdate?: DateMessage;
}
