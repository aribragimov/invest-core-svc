import { InterceptingCall } from '@grpc/grpc-js';
import * as fs from 'fs';
import * as path from 'path';

function findProjectRootPath(startDir: string) {
  const rootMarker = 'package.json';
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    if (fs.existsSync(path.join(currentDir, rootMarker))) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }
  return null;
}

export const PROJECT_ROOT_PATH = findProjectRootPath(process.cwd());

export const PROTO_SCHEMA_PATH = `${PROJECT_ROOT_PATH}/dist/libs/proto-schema`;
export const BASE_PATH = `${PROTO_SCHEMA_PATH}/workaxle/svc`;

export function grpcConfig(protoSchema, protoSchemaPath) {
  return {
    loader: {
      keepCase: true,
      includeDirs: [protoSchemaPath],
    },
    channelOptions: {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      interceptors: [
        (options, nextCall) => {
          const requestEncoder = protoSchema[`${options.method_definition.path.split('/').pop()}Request`];
          if (requestEncoder !== undefined) {
            // eslint-disable-next-line no-param-reassign
            options.method_definition.requestSerialize = value => requestEncoder.encode(value).finish();
          }

          const responseDecoder = protoSchema[`${options.method_definition.path.split('/').pop()}Response`];
          if (responseDecoder !== undefined) {
            // eslint-disable-next-line no-param-reassign
            options.method_definition.responseDeserialize = value => responseDecoder.decode(value);
          }
          return new InterceptingCall(nextCall(options));
        },
      ] as any,
    },
  };
}
