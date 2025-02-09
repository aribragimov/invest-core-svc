import { IsOptional, IsString, Length } from 'class-validator';

import * as Proto from '@proto-schema/invest/svc/core/portfolio';

export class UpdatePortfolioPayloadDto implements Proto.UpdatePortfolioRequest_Payload {
  @IsOptional()
  @IsString()
  @Length(1, 50)
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
