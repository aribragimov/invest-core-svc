#! /bin/sh

BASEDIR=$(dirname $0)
SRC_DIR="${BASEDIR}/libs/proto-schema"
DEST_DIR="${BASEDIR}/libs/proto-schema/gen"

rm -rf $DEST_DIR
mkdir -p $DEST_DIR

protoc \
  --experimental_allow_proto3_optional \
  --plugin=${BASEDIR}/node_modules/.bin/protoc-gen-ts_proto \
  --ts_proto_opt=outputEncodeMethods=true,useEnumNames=false,removeEnumPrefix=all,asClass=false,outputJsonMethods=true,context=false,nestJs=true,outputClientImpl=false,addNestjsRestParameter=true,useOptionals=messages,useDate=true,unrecognizedEnum=false,stringEnums=true,addGrpcMetadata=true \
  --ts_proto_out=${DEST_DIR} \
  -I=${SRC_DIR}/dependencies \
  -I=${SRC_DIR}/internal \
  ${SRC_DIR}/dependencies/**/**/*.proto \
  ${SRC_DIR}/internal/**/**/*.proto \


for dir in $DEST_DIR/invest/*
do
  touch $dir/index.ts
  cat /dev/null > $dir/index.ts

  for file in $dir/*
  do
    if [[ $(basename $file .ts) == 'index' ]]; then
      continue
    fi

    echo "// @ts-ignore" >> $dir/index.ts
    echo "export * from './$(basename $file .ts)'" >> $dir/index.ts
  done
done
