import { UnauthorizedException } from '@nestjs/common';

import { Metadata } from '@grpc/grpc-js';

import { RequestContext } from '@proto-schema/invest/common';

import { GrpcContext } from 'src/common/interfaces';

// TODO: transform to decorator
export function getGrpcContext(metadata: Metadata): GrpcContext {
  let context: RequestContext | undefined;
  const rawContext = metadata.get('context-bin');

  if (rawContext.length > 0) {
    context = RequestContext.decode(Buffer.from(rawContext[0]));
  }

  if (!context) {
    throw new UnauthorizedException();
  }

  return {
    userId: context.userId,
    sourceSvc: context.sourceSvc,
  };
}
