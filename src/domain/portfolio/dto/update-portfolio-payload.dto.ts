import { Type } from 'class-transformer';
import { IsOptional, IsString, Length, ValidateNested } from 'class-validator';

import { DateMessage } from '@proto-schema/google/type/date';

import { DateMessageDto } from 'src/common/dto';

export class UpdateUserPayloadDto {
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
