import { Table } from './table'
import { makeJoinedTable } from './combinedTable'
import { SelectQuery } from './query/select'
import { InsertQuery } from './query/insert'
import { UpdateQuery } from './query/update'
import { DeleteQuery } from './query/delete'

export type BaseCombinedOuput<Model> = { [key in keyof Model]: object }

export function select<Model, Name extends string>(
  table: Table<Model, Name, any>,
): SelectQuery<{ [key in Name]: Model }, {}, { [key in Name]: Model }> {
  return new SelectQuery<{ [key in Name]: Model }, {}, { [key in Name]: Model }>(
    makeJoinedTable(table.meta.tableName, table.meta.name, table.meta.schema),
  )
}

export function insert<Model, Name extends string, ID extends keyof Model>(
  table: Table<Model, Name, ID>,
): InsertQuery<Model, Name, ID> {
  return new InsertQuery<Model, Name, ID>(table)
}

export function update<Model, Name extends string, ID extends keyof Model>(
  table: Table<Model, Name, ID>,
): UpdateQuery<Model, Name, ID> {
  return new UpdateQuery<Model, Name, ID>(table)
}

export function del<Model, Name extends string, ID extends keyof Model>(
  table: Table<Model, Name, ID>,
): DeleteQuery<Model> {
  return new DeleteQuery<Model>(table)
}
