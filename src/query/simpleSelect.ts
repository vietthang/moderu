import { QueryInterface, QueryBuilder } from 'knex'
import { Schema, array } from 'sukima'

import { BaseSelectQuery, BaseSelectQueryProps } from './baseSelect'
import { Selector } from '../selector'
import { DataSet, makeDataSet } from '../dataSet'

export type SimpleSelectQueryProps<Model, DataSetModel, Name extends string> =
  BaseSelectQueryProps<Model>
  & {
    from: DataSet<DataSetModel, Name>,
  }

export class SimpleSelectQueryCore<Model, DataSetModel, Name extends string>
  extends BaseSelectQuery<Model, SimpleSelectQueryProps<Model, DataSetModel, Name>> {

  constructor(dataSet: DataSet<DataSetModel, Name>, schema: Schema<Model>) {
    super({
      from: dataSet,
      schema: array(schema),
    })
  }

  column<Column extends keyof DataSetModel>(
    column: Selector<DataSetModel, Column, Name>,
  ): SimpleSelectQueryCore<Model & { [column in Column]: DataSetModel[column] }, DataSetModel, Name> {
    return null as any
  }

  /** @internal */
  protected buildQuery(qb: QueryInterface): QueryBuilder {
    return qb.table('a')
  }

}

export type SimpleSelectQuery<Model, DataSetModel, Name extends string>
  = SimpleSelectQueryCore<Model, DataSetModel, Name>
  & DataSet<DataSetModel, Name>

export function makeSimpleQuery<DataSetModel, Model, Name extends string>(
  dataSet: DataSet<DataSetModel, Name>,
  schema: Schema<Model>,
): SimpleSelectQuery<Model, DataSetModel, Name> {
  const base = new SimpleSelectQueryCore<Model, DataSetModel, Name>(dataSet, schema)

  return makeDataSet(
    'query',
    dataSet.meta.schema,
    base as any,
  )
}
