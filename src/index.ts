import { Table } from './table';
import { UpdateQuery } from './query/update';
import { DeleteQuery } from './query/delete';
import { InsertQuery } from './query/insert';
import { SelectQuery } from './query/select';

export function insert<Model, Id extends keyof Model>(
  table: Table<Model, Id>,
) {
  return new InsertQuery<Model, Id>(table.$meta);
}

export function select() {
  return new SelectQuery<{}>();
}

export function update<Model, Id extends keyof Model>(
  table: Table<Model, Id>,
) {
  return new UpdateQuery<Model>(table.$meta);
}

export function del<Model, Id extends keyof Model>(
  table: Table<Model, Id>,
) {
  return new DeleteQuery<Model>(table.$meta);
}

export { defineTable } from './table';
