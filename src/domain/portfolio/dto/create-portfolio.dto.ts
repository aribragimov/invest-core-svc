import { Type } from 'class-transformer';
import { IsEmail, IsOptional, IsString, Length, ValidateNested } from 'class-validator';

import { DateMessage } from '@proto-schema/google/type/date';
import * as Proto from '@proto-schema/invest/svc/core/user';

import { DateMessageDto } from 'src/common/dto';

export class CreatePortfolioDto implements Proto.CreateUserRequest {
  @IsString()
  @Length(1, 50)
  firstName: string;

  @IsString()
  @Length(1, 50)
  lastName: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(1, 50)
  login: string;

  @IsString()
  @Length(6, 100)
  password: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => DateMessageDto)
  birthdate?: DateMessage;
}
