import { PropertyMap, ObjectSchema } from 'sukima'

import { ValueNullable } from './common'
import { DataSetCore, DataSet, ColumnMap, makeDataSet } from './dataSet'
import { AnyExpression } from './expression'
import { makeJoinedTable, JoinedTable } from './combinedTable'

export type Selector<Model, Key extends keyof Model, Name extends string> = {
  meta: {
    name: Name,
  },
} & ColumnMap<Model, Key, Name>

export interface TableCore<Model, Name extends string, ID extends keyof Model> extends DataSetCore<Model, Name> {

  readonly meta: {

    readonly name: Name,

    readonly schema: ObjectSchema<Model>,

    readonly tableName: string,

    readonly idAttribute: ID,

  },

  as<Alias extends string>(alias: Alias): Table<Model, Alias, ID>

}

export type Table<Model, Name extends string, ID extends keyof Model>
  = Joinable<{ [key in Name]: Model }>
  & TableCore<Model, Name, ID>
  & DataSet<Model, Name>

export interface Joinable<CombinedModel> {

  innerJoin<Model, Name extends string>(
    table: Table<Model, Name, any>,
    expression: AnyExpression,
  ): JoinedTable<CombinedModel & { [name in Name]: Model }>

  leftJoin<Model, Name extends string>(
    table: Table<Model, Name, any>,
    expression: AnyExpression,
  ): JoinedTable<CombinedModel & { [name in Name]: ValueNullable<Model> }>

  rightJoin<Model, Name extends string>(
    table: Table<Model, Name, any>,
    expression: AnyExpression,
  ): JoinedTable<{ [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> } & { [key in Name]: Model }>

  fullOuterJoin<Model, Name extends string>(
    table: Table<Model, Name, any>,
    expression: AnyExpression,
  ): JoinedTable<
    { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }
    & { [key in Name]: ValueNullable<Model> }
  >

}

function defineTableWithAlias<Model, Name extends string, ID extends keyof Model>(
  tableName: string,
  propertyMap: PropertyMap<Model>,
  idAttribute: ID,
  name: Name,
): Table<Model, Name, ID> {
  type CombinedModel = { [key in Name]: Model }

  const ret = makeDataSet(name, propertyMap, {})

  const { schema } = ret.meta

  return Object.assign(
    ret,
    {

      meta: Object.assign(
        {},
        ret.meta,
        {
          tableName,
          idAttribute,
        },
      ),

      as<Alias extends string>(alias: Alias): Table<Model, Alias, ID> {
        return defineTableWithAlias<Model, Alias, ID>(tableName, propertyMap, idAttribute, alias)
      },

      innerJoin<JoinModel, JoinModelName extends string>(
        table: Table<JoinModel, JoinModelName, any>,
        expression: AnyExpression,
      ): JoinedTable<CombinedModel & { [name in JoinModelName]: JoinModel }> {
        return makeJoinedTable(tableName, name, schema).innerJoin(table, expression)
      },

      leftJoin<JoinModel, JoinModelName extends string>(
        table: Table<JoinModel, JoinModelName, any>,
        expression: AnyExpression,
      ): JoinedTable<CombinedModel & { [name in JoinModelName]: ValueNullable<JoinModel> }> {
        return makeJoinedTable(tableName, name, schema).leftJoin(table, expression)
      },

      rightJoin<JoinModel, Name extends string>(
        table: Table<JoinModel, Name, any>,
        expression: AnyExpression,
      ): JoinedTable<{ [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> } & { [key in Name]: JoinModel }> {
        return makeJoinedTable(tableName, name, schema).rightJoin(table, expression)
      },

      fullOuterJoin<JoinModel, Name extends string>(
        table: Table<JoinModel, Name, any>,
        expression: AnyExpression,
      ): JoinedTable<
        { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }
        & { [key in Name]: ValueNullable<JoinModel> }
      > {
        return makeJoinedTable(tableName, name, schema).fullOuterJoin(table, expression)
      },

    },
  )
}

export function defineTable<Model, Name extends string, ID extends keyof Model>(
  name: Name,
  propertyMap: PropertyMap<Model>,
  idAttribute: ID,
): Table<Model, Name, ID> {
  return defineTableWithAlias<Model, Name, ID>(name, propertyMap, idAttribute, name)
}
