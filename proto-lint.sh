#! /bin/sh

docker run --volume "$(pwd):/src" --workdir /src yoheimuta/protolint lint --fix .
