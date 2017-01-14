import { Table } from './table';
import { UpdateQuery } from './query/update';
import { DeleteQuery } from './query/delete';
import { InsertQuery } from './query/insert';
import { SelectQuery } from './query/select';

export function insert<Model, Name extends string, Id extends keyof Model>(
  table: Table<Model, Name, Name, Id>,
) {
  return new InsertQuery<Model, Name, Name, Id>(table.$meta);
}

export function select<Model, Name extends string, Id extends keyof Model>(
  table: Table<Model, Name, Name, Id>,
) {
  return new SelectQuery<{}>(table.$meta);
}

export function update<Model, Name extends string, Id extends keyof Model>(
  table: Table<Model, Name, Name, Id>,
) {
  return new UpdateQuery<Model, Name, Name, Id>(table.$meta);
}

export function del<Model, Name extends string, Id extends keyof Model>(
  table: Table<Model, Name, Name, Id>,
) {
  return new DeleteQuery<Model, Name, Name, Id>(table.$meta);
}
