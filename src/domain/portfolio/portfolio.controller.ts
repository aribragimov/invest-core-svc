import { Controller, NotFoundException, UseInterceptors } from '@nestjs/common';
import { Payload } from '@nestjs/microservices';

import { Status } from '@proto-schema/google/rpc/status';
import {
  CreatePortfolioResponse,
  GetPortfoliosRequest,
  GetPortfoliosResponse,
  PortfolioServiceController,
  PortfolioServiceControllerMethods,
  UpdatePortfolioResponse,
} from '@proto-schema/invest/svc/core';

import { HandleErrorsInterceptor } from 'src/common/interceptors/grpc-error.interceptor';

import { CreatePortfolioDto, UpdatePortfolioDto } from './dto';
import { PortfolioService } from './portfolio.service';

@Controller()
@PortfolioServiceControllerMethods()
@UseInterceptors(HandleErrorsInterceptor)
export class PortfolioController implements PortfolioServiceController {
  constructor(private readonly portfolioService: PortfolioService) {}

  public async getPortfolios({ userIds }: GetPortfoliosRequest): Promise<GetPortfoliosResponse> {
    const portfolios = await this.portfolioService.getByUserIds(userIds);

    return GetPortfoliosResponse.fromJSON({
      status: Status.fromJSON({}),
      portfolios,
    });
  }

  public async createPortfolio(@Payload() data: CreatePortfolioDto): Promise<CreatePortfolioResponse> {
    const portfolio = await this.portfolioService.create(data);

    return CreatePortfolioResponse.fromJSON({
      status: Status.fromJSON({}),
      portfolio,
    });
  }

  public async updatePortfolio(@Payload() { id, payload, mask }: UpdatePortfolioDto): Promise<UpdatePortfolioResponse> {
    let portfolio = await this.portfolioService.getById(id);
    if (!portfolio) throw new NotFoundException('Portfolio');

    portfolio = await this.portfolioService.update(portfolio, payload, mask);

    return UpdatePortfolioResponse.fromJSON({
      status: Status.fromJSON({}),
      portfolio,
    });
  }
}
