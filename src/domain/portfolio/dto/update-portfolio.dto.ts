import { Type } from 'class-transformer';
import { IsUUID, ValidateNested } from 'class-validator';

import * as Proto from '@proto-schema/invest/svc/core/user';

import { UpdateUserPayloadDto } from './update-portfolio-payload.dto';

export class UpdateUserDto implements Proto.UpdateUserRequest {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => UpdateUserPayloadDto)
  payload: UpdateUserPayloadDto;
}
