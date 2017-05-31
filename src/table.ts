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

    readonly format?: (model: Partial<Model>) => any,

    readonly parse?: (raw: any) => Partial<Model>,

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

export interface TableDefinition<Model, Name extends string, ID extends keyof Model> {

  name: Name

  properties: PropertyMap<Model>

  idAttribute: ID

  format?: (model: Partial<Model>) => any

  parse?: (raw: any) => Partial<Model>

}

function defineTableWithAlias<Model, Name extends string, ID extends keyof Model>(
  { name, properties, idAttribute, format, parse }: TableDefinition<Model, Name, ID>,
  tableName: string,
): Table<Model, Name, ID> {
  type CombinedModel = { [key in Name]: Model }

  const ret = makeDataSet(name, properties, {})

  const table = Object.assign(
    ret,
    {

      meta: Object.assign(
        {},
        ret.meta,
        {
          tableName,
          idAttribute,
          format,
          parse,
        },
      ),

      as<Alias extends string>(alias: Alias): Table<Model, Alias, ID> {
        return defineTableWithAlias<Model, Alias, ID>(
          { properties, idAttribute, name: alias },
          tableName,
        )
      },

      innerJoin<JoinModel, JoinModelName extends string>(
        joinTable: Table<JoinModel, JoinModelName, any>,
        expression: AnyExpression,
      ): JoinedTable<CombinedModel & { [name in JoinModelName]: JoinModel }> {
        return makeJoinedTable(table).innerJoin(joinTable, expression)
      },

      leftJoin<JoinModel, JoinModelName extends string>(
        joinTable: Table<JoinModel, JoinModelName, any>,
        expression: AnyExpression,
      ): JoinedTable<CombinedModel & { [name in JoinModelName]: ValueNullable<JoinModel> }> {
        return makeJoinedTable(table).leftJoin(joinTable, expression)
      },

      rightJoin<JoinModel, Name extends string>(
        joinTable: Table<JoinModel, Name, any>,
        expression: AnyExpression,
      ): JoinedTable<{ [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> } & { [key in Name]: JoinModel }> {
        return makeJoinedTable(table).rightJoin(joinTable, expression)
      },

      fullOuterJoin<JoinModel, Name extends string>(
        joinTable: Table<JoinModel, Name, any>,
        expression: AnyExpression,
      ): JoinedTable<
        { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }
        & { [key in Name]: ValueNullable<JoinModel> }
      > {
        return makeJoinedTable(table).fullOuterJoin(joinTable, expression)
      },

    },
  )

  return table
}

export function defineTable<Model, Name extends string, ID extends keyof Model>(
  definition: TableDefinition<Model, Name, ID>,
): Table<Model, Name, ID> {
  return defineTableWithAlias<Model, Name, ID>(definition, definition.name)
}
