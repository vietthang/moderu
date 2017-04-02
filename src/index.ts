import { object } from 'sukima'

import { Table } from './table'
import { JoinedTable } from './combinedTable'
import { DataSet } from './dataSet'
import { SimpleSelectQuery, makeSimpleQuery } from './query/simpleSelect'
import { CombinedSelectQuery, makeCombinedSelectQuery } from './query/combinedSelect'
import { InsertQuery } from './query/insert'
import { UpdateQuery } from './query/update'
import { DeleteQuery } from './query/delete'

export type BaseCombinedOuput<Model> = { [key in keyof Model]: object }

export function select<Model>(
  dataSet: JoinedTable<Model>,
): CombinedSelectQuery<{ [key in keyof Model]: object }, Model>

export function select<Model, Name extends string>(
  dataSet: DataSet<Model, Name>,
): SimpleSelectQuery<object, Model, Name>

export function select<Model, Name extends string>(
  input: JoinedTable<Model> | DataSet<Model, Name>,
): CombinedSelectQuery<BaseCombinedOuput<Model>, Model> | SimpleSelectQuery<object, Model, Name> {
  if (input instanceof JoinedTable) {
    return makeCombinedSelectQuery(input, object({})) as any
  } else {
    return makeSimpleQuery(input, object({}))
  }
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
