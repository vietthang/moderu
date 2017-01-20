import { QueryInterface, Raw } from 'knex';

import { ColumnBinding } from '../table';

export function makeKnexRaw(query: QueryInterface, sql: string, bindings: any[], isSelect: boolean): Raw {
  const client = (query as any).client;

  const finalBindings = bindings.map((binding) => {
    if (binding instanceof ColumnBinding) {
      if (isSelect) {
        return `${binding.dataSetAlias}.${binding.field}`;
      } else {
        return binding.field;
      }
    }

    return binding;
  });

  return client.raw(sql, finalBindings) as Raw;
}
