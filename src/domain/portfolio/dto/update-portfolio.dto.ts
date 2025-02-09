import { Type } from 'class-transformer';
import { IsArray, IsString, IsUUID, ValidateNested } from 'class-validator';

import * as Proto from '@proto-schema/invest/svc/core/portfolio';

import { UpdatePortfolioPayloadDto } from './update-portfolio-payload.dto';

export class UpdatePortfolioDto implements Proto.UpdatePortfolioRequest {
  @IsUUID()
  id: string;

  @ValidateNested()
  @Type(() => UpdatePortfolioPayloadDto)
  payload: UpdatePortfolioPayloadDto;

  @IsArray()
  @IsString({ each: true })
  public mask: string[];
}
