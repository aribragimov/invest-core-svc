import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';

import * as Proto from '@proto-schema/invest/svc/core/user';

import { UpdateUserPayloadDto } from './update-user-payload.dto';

export class UpdateUserDto implements Proto.UpdateUserRequest {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => UpdateUserPayloadDto)
  payload: UpdateUserPayloadDto;

  @IsArray()
  @IsString({ each: true })
  public mask: string[];
}
