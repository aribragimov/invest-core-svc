import { Logger, LogLevel } from '@nestjs/common';

import { snakeCase } from 'lodash';

type LoggableRecord = Record<string, string | number>;

function logTagged(logger: Logger, logLevel: LogLevel, message: string, tags: LoggableRecord) {
  logger[logLevel](
    `${Object.keys(tags)
      .map((key: string) => `${snakeCase(key)}=${tags[key]}`)
      .join(' ')} ${message}`,
  );
}

export function logTaggedError(logger: Logger, message: string, tags: LoggableRecord) {
  logTagged(logger, 'error', message, tags);
}

export function logTaggedLog(logger: Logger, message: string, tags: LoggableRecord) {
  logTagged(logger, 'log', message, tags);
}
