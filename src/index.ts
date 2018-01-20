import { Schema, any } from 'sukima'

import { Table } from './table'
import { makeJoinedTable } from './combinedTable'
import { SelectQuery } from './query/select'
import { InsertQuery } from './query/insert'
import { UpdateQuery } from './query/update'
import { DeleteQuery } from './query/delete'
import { Expression } from './Expression'

export type BaseCombinedOuput<Model> = { [key in keyof Model]: object }

export function select<Model, Name extends string>(
  table: Table<Model, Name>,
): SelectQuery<{ [key in Name]: Model }, {}, { [key in Name]: Model }> {
  return new SelectQuery<{ [key in Name]: Model }, {}, { [key in Name]: Model }>(
    makeJoinedTable(table),
  )
}

export function insert<Model, Name extends string>(
  table: Table<Model, Name>,
): InsertQuery<Model, Name> {
  return new InsertQuery<Model, Name>(table)
}

export function update<Model, Name extends string>(
  table: Table<Model, Name>,
): UpdateQuery<Model, Name> {
  return new UpdateQuery<Model, Name>(table)
}

export function del<Model, Name extends string>(
  table: Table<Model, Name>,
): DeleteQuery<Model> {
  return new DeleteQuery<Model>(table)
}

export function exp<OT>(
  sql: string,
  bindings: any[] = [],
  schema: Schema<OT> = any(),
): Expression<OT> {
  return new Expression(sql, bindings, schema)
}

export { defineTable } from './table'

export { Expression } from './expression'

export { Table } from './table'
