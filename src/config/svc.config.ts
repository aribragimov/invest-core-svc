import { registerAs } from '@nestjs/config';

export default registerAs('service', () => ({
  ports: {
    rest: process.env.REST_PORT,
    grpc: process.env.GRPC_PORT,
  },
  name: process.env.SERVICE_NAME,
  databaseUrl: process.env.DATABASE_URL,
  sentry: {
    dsn: process.env.SENTRY_DSN,
    env: process.env.SENTRY_ENVIRONMENT,
  },
  rmqUrl: process.env.RMQ_URL,
  outbox: {
    publisher: {
      enabled: process.env.OUTBOX_PUBLISHER_ENABLED !== 'false',
    },
  },
}));
