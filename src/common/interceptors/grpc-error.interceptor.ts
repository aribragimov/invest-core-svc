import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
  UnauthorizedException,
  ValidationError,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { catchError, Observable, of } from 'rxjs';
import { QueryFailedError } from 'typeorm';

import { Any } from '@proto-schema/google/protobuf/any';
import { Code, codeToNumber } from '@proto-schema/google/rpc/code';
import { BadRequest, DebugInfo, ResourceInfo } from '@proto-schema/google/rpc/error_details';
import { Status } from '@proto-schema/google/rpc/status';

import { ValidationFailedError } from '../errors';

const NOT_UNIQUE_DB_CODE_ERROR = '23505';

function buildStatus(code: Code, detail: string): Status {
  return Status.fromJSON({
    code: codeToNumber(code),
    message: code,
    details: [
      Any.fromJSON({
        typeUrl: 'type.googleapis.com/google.rpc.DebugInfo',
        value: DebugInfo.encode(
          DebugInfo.fromJSON({
            detail,
          }),
        ).finish(),
      }),
    ],
  });
}

function buildFieldError(error: ValidationError) {
  let description = '';
  if (error.constraints !== undefined) {
    description = Object.values(error.constraints).join('. ').trim();
  }

  return {
    field: error.property,
    description,
  };
}

function buildBadRequestStatus(exception: ValidationFailedError) {
  const fieldViolations = exception.errors.map(buildFieldError);

  return Status.fromJSON({
    code: codeToNumber(Code.INVALID_ARGUMENT),
    message: Code.INVALID_ARGUMENT,
    details: [
      Any.fromJSON({
        typeUrl: 'type.googleapis.com/google.rpc.BadRequest',
        value: BadRequest.encode(
          BadRequest.fromJSON({
            fieldViolations,
          }),
        ).finish(),
      }),
    ],
  });
}

function buildNotFoundStatus(exception: NotFoundException) {
  return Status.fromJSON({
    code: codeToNumber(Code.NOT_FOUND),
    message: Code.NOT_FOUND,
    details: [
      Any.fromJSON({
        typeUrl: 'type.googleapis.com/google.rpc.ResourceInfo',
        value: ResourceInfo.encode(
          ResourceInfo.fromJSON({
            resourceType: exception.message,
            description: `${exception.message} can't be found`,
          }),
        ).finish(),
      }),
    ],
  });
}

function buildUnauthenticatedStatus() {
  return Status.fromJSON({
    code: codeToNumber(Code.UNAUTHENTICATED),
    message: Code.UNAUTHENTICATED,
    details: [],
  });
}

function buildGrpcError(exception: Error | QueryFailedError | ValidationFailedError): Status {
  if (exception instanceof QueryFailedError) {
    switch (exception.driverError.code) {
      case NOT_UNIQUE_DB_CODE_ERROR: {
        return buildStatus(Code.ALREADY_EXISTS, exception.driverError.detail);
      }

      default:
        return buildStatus(Code.INTERNAL, `There is db exception with code ${exception.driverError.code}`);
    }
  } else if (exception instanceof ValidationFailedError) {
    return buildBadRequestStatus(exception);
  } else if (exception instanceof NotFoundException) {
    return buildNotFoundStatus(exception);
  } else if (exception instanceof UnauthorizedException) {
    return buildUnauthenticatedStatus();
  } else if (exception instanceof Error) {
    return buildStatus(Code.INTERNAL, exception.message);
  }

  return buildStatus(Code.UNKNOWN, 'Unhandled exception. Ask developers.');
}

@Injectable()
export class HandleErrorsInterceptor implements NestInterceptor {
  constructor(private readonly configService: ConfigService) {}

  public intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      catchError(err => {
        if (this.configService.get('service.logLevel') === 'debug') {
          // eslint-disable-next-line no-console
          console.debug(err);
        }

        const status = buildGrpcError(err);

        return of({
          status,
        });
      }),
    );
  }
}
