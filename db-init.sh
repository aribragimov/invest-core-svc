#!/bin/sh -e

psql --variable=ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE "invest_core_development";
  CREATE DATABASE "invest_core_test";
EOSQL

psql --variable=ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname=invest_core_development <<-EOSQL
  CREATE EXTENSION "citext";
  CREATE EXTENSION "uuid-ossp";
EOSQL

psql --variable=ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname=invest_core_test <<-EOSQL
  CREATE EXTENSION "citext";
  CREATE EXTENSION "uuid-ossp";
EOSQL
