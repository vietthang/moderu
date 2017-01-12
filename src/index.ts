import { array } from 'sukima';

import { Table } from './table';
import { UpdateQuery } from './query/update';
import { DeleteQuery } from './query/delete';
import { InsertQuery } from './query/insert';
import { SelectQuery } from './query/select';

export function insert<Model, TableName extends string, Id extends keyof Model>(
  table: Table<Model, TableName, Id>,
  value: Partial<Model>,
) {
  const idSchema = table.$schema.getPropertySchema(table.$idAttribute);
  return new InsertQuery<Model, Id>(table.$name, value, idSchema);
}

export function select<Model, TableName extends string, Id extends keyof Model>(
  table: Table<Model, TableName, Id>,
) {
  return new SelectQuery<Model>(table.$name, array().items(table.$schema));
}

export function update<Model, TableName extends string, Id extends keyof Model>(
  table: Table<Model, TableName, Id>,
  model?: Partial<Model>,
) {
  return new UpdateQuery<Model>(table.$name, model);
}

export function del<Model, TableName extends string, Id extends keyof Model>(
  table: Table<Model, TableName, Id>,
) {
  return new DeleteQuery(table.$name);
}
