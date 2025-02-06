import { registerAs } from '@nestjs/config';

import { join } from 'path';

interface Proto {
  [key: string]: Array<string>;
}

const proto: Proto = {
  invest: ['example/api.proto'],
};

function buildProtoPath(serviceName: string | undefined) {
  if (!serviceName) {
    throw new Error('Unknown service name');
  }
  const protoDirectoryPath = join(process.cwd(), `/dist/libs/proto-schema/workaxle/svc/${serviceName}/`);
  const protoNames = proto[serviceName];

  return protoNames.map(name => join(protoDirectoryPath, name));
}

export default registerAs('proto', () => ({
  paths: buildProtoPath(process.env.SERVICE_NAME),
}));
