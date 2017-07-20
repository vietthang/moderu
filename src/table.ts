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

export interface TableCore<Model, Name extends string> extends DataSetCore<Model, Name> {

  readonly meta: {

    readonly name: Name,

    readonly schema: ObjectSchema<Model>,

    readonly tableName: string,

    readonly format?: (model: Partial<Model>) => any,

    readonly parse?: (raw: any) => Partial<Model>,

  },

  as<Alias extends string>(alias: Alias): Table<Model, Alias>

}

export type Table<Model, Name extends string>
  = Joinable<{ [key in Name]: Model }>
  & TableCore<Model, Name>
  & DataSet<Model, Name>

export interface Joinable<CombinedModel> {

  innerJoin<Model, Name extends string>(
    table: Table<Model, Name>,
    expression: AnyExpression,
  ): JoinedTable<CombinedModel & { [name in Name]: Model }>

  leftJoin<Model, Name extends string>(
    table: Table<Model, Name>,
    expression: AnyExpression,
  ): JoinedTable<CombinedModel & { [name in Name]: ValueNullable<Model> }>

  rightJoin<Model, Name extends string>(
    table: Table<Model, Name>,
    expression: AnyExpression,
  ): JoinedTable<{ [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> } & { [key in Name]: Model }>

  fullOuterJoin<Model, Name extends string>(
    table: Table<Model, Name>,
    expression: AnyExpression,
  ): JoinedTable<
    { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }
    & { [key in Name]: ValueNullable<Model> }
  >

}

export interface TableDefinition<Model, Name extends string> {

  name: Name

  properties: PropertyMap<Model>

  format?: (model: any) => any

  parse?: (raw: any) => any

}

function defineTableWithAlias<Model, Name extends string>(
  { name, properties, format, parse }: TableDefinition<Model, Name>,
  tableName: string,
): Table<Model, Name> {
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
          format,
          parse,
        },
      ),

      as<Alias extends string>(alias: Alias): Table<Model, Alias> {
        return defineTableWithAlias<Model, Alias>(
          { properties, name: alias },
          tableName,
        )
      },

      innerJoin<JoinModel, JoinModelName extends string>(
        joinTable: Table<JoinModel, JoinModelName>,
        expression: AnyExpression,
      ): JoinedTable<CombinedModel & { [name in JoinModelName]: JoinModel }> {
        return makeJoinedTable(table).innerJoin(joinTable, expression)
      },

      leftJoin<JoinModel, JoinModelName extends string>(
        joinTable: Table<JoinModel, JoinModelName>,
        expression: AnyExpression,
      ): JoinedTable<CombinedModel & { [name in JoinModelName]: ValueNullable<JoinModel> }> {
        return makeJoinedTable(table).leftJoin(joinTable, expression)
      },

      rightJoin<JoinModel, Name extends string>(
        joinTable: Table<JoinModel, Name>,
        expression: AnyExpression,
      ): JoinedTable<{ [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> } & { [key in Name]: JoinModel }> {
        return makeJoinedTable(table).rightJoin(joinTable, expression)
      },

      fullOuterJoin<JoinModel, Name extends string>(
        joinTable: Table<JoinModel, Name>,
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

export function defineTable<Model, Name extends string>(
  definition: TableDefinition<Model, Name>,
): Table<Model, Name> {
  return defineTableWithAlias<Model, Name>(definition, definition.name)
}
