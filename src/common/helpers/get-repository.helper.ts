import { DataSource, EntityTarget, ObjectLiteral, QueryRunner, Repository } from 'typeorm';

type Source = QueryRunner | DataSource;

export function getRepository<Entity extends ObjectLiteral>(
  source: Source,
  target: EntityTarget<Entity>,
): Repository<Entity> {
  return source.manager.getRepository(target);
}
