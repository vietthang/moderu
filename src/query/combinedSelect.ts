import { array, Schema } from 'sukima'
import { QueryInterface, QueryBuilder } from 'knex'

import { BaseSelectQuery, BaseSelectQueryProps } from './baseSelect'
import { Selector } from '../selector'
import { JoinedTable } from '../combinedTable'
import { DataSet, makeDataSet } from '../dataSet'

export type CombinedSelectQueryProps<Model, DataSetModel> =
  BaseSelectQueryProps<Model>
  & {
    from: JoinedTable<DataSetModel>,
  }

export class CombinedSelectQueryCore<Model, DataSetModel>
  extends BaseSelectQuery<Model, CombinedSelectQueryProps<Model, DataSetModel>> {

  constructor(dataSet: JoinedTable<DataSetModel>, schema: Schema<Model>) {
    super({
      from: dataSet,
      schema: array(schema),
    })
  }

  column<Column extends keyof DataSetModel, Key extends keyof DataSetModel[Column]>(
    column: Selector<DataSetModel[Column], Key, Column>,
  ): CombinedSelectQuery<Model & { [column in Column]: { [key in Key]: DataSetModel[Column][key] } }, DataSetModel> {
    return null as any
  }

  /** @internal */
  protected buildQuery(qb: QueryInterface): QueryBuilder {
    return qb.table('a')
  }

}

export type CombinedSelectQuery<Model, DataSetModel>
  = CombinedSelectQueryCore<Model, DataSetModel>
  & DataSet<DataSetModel, string>

export function makeCombinedSelectQuery<Model, DataSetModel>(
  joinedTable: JoinedTable<DataSetModel>,
  schema: Schema<Model>,
): CombinedSelectQuery<Model, DataSetModel> {
  const base = new CombinedSelectQueryCore<Model, DataSetModel>(joinedTable, schema)

  return makeDataSet(
    'query',
    joinedTable.schemaMap,
    base as any,
  )
}
