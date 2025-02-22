import * as CoreProtoSchema from '@proto-schema/invest/svc/core';

import { BASE_PATH, grpcConfig, PROTO_SCHEMA_PATH } from 'src/common/constants';

export const CORE = {
  package: 'invest.svc.core',
  protoPath: [
    // ==========---  P  ---====================================================================
    `${BASE_PATH}/core/portfolio.proto`,
    // ==========---  T  ---====================================================================
    `${BASE_PATH}/core/transaction.proto`,
    // ==========---  U  ---====================================================================
    `${BASE_PATH}/core/user.proto`,
  ],
  url: process.env.CORE_SERVICE_URL,
  services: {
    portfolio: 'PortfolioService',
    transaction: 'TransactionService',
    user: 'UserService',
  },
  ...grpcConfig(CoreProtoSchema, PROTO_SCHEMA_PATH),
};
