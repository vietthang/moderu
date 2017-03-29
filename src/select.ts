import { object } from 'sukima'

import { JoinedTable } from './combinedTable'
import { DataSet } from './dataSet'
import { SimpleSelectQuery, makeSimpleQuery } from './query/simpleSelect'
import { CombinedSelectQuery, makeCombinedSelectQuery } from './query/combinedSelect'

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
