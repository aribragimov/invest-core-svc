import { registerAs } from '@nestjs/config';

import * as fs from 'fs';
import { join } from 'path';

import { PROJECT_ROOT_PATH } from 'src/common/constants';

function buildProtoPaths(serviceName: string | undefined): string[] {
  if (!serviceName) throw new Error('Unknown service name');

  const protoDirectoryPath = `${PROJECT_ROOT_PATH}/dist/libs/proto-schema/invest/svc/${serviceName}/`;

  let protoPaths: string[] = [];

  try {
    const files = fs.readdirSync(protoDirectoryPath);
    protoPaths = files.map(file => join(protoDirectoryPath, file));
  } catch (err) {
    throw new Error(`Error reading the directory: ${err}`);
  }

  return protoPaths;
}

export default registerAs('proto', () => ({
  paths: buildProtoPaths(process.env.SERVICE_NAME),
}));
