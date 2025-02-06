import { registerAs } from '@nestjs/config';

export default registerAs('service', () => ({
  ports: {
    rest: process.env.REST_PORT,
    grpc: process.env.GRPC_PORT,
  },
  name: process.env.SERVICE_NAME,
  databaseUrl: process.env.DATABASE_URL,
}));
