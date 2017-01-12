import { QueryInterface, Raw } from 'knex';

export function makeRaw(query: QueryInterface, sql: string, bindings: any[]): Raw {
  const client = (query as any).client;
  return client.raw(sql, bindings) as Raw;
}
