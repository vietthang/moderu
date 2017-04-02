import { mapValues } from './utils'
import { ModelSchema, convertToNullableSchema, toPartial, toMappedValue, ValueNullable } from './common'
import { AnyExpression } from './expression'
import { Joinable, Table } from './table'

export type SchemaMap<CombinedModel> = {
  [key in keyof CombinedModel]: ModelSchema<CombinedModel[key]>
}

export type JoinEntryType = 'inner' | 'left' | 'right' | 'full'

export interface BaseJoinEntry {
  tableName: string
  alias: string
}

export interface JoinEntry extends BaseJoinEntry {
  type: JoinEntryType
  expression: AnyExpression
}

export class JoinedTable<CombinedModel> implements Joinable<CombinedModel> {

  constructor(
    readonly schemaMap: SchemaMap<CombinedModel>,
    readonly base: BaseJoinEntry,
    readonly join: JoinEntry[] = [],
  ) {
  }

  innerJoin<JoinModel, Name extends string>(
    table: Table<JoinModel, Name, any>,
    expression: AnyExpression,
  ): JoinedTable<CombinedModel & { [name in Name]: JoinModel }> {
    return new JoinedTable<CombinedModel & { [name in Name]: JoinModel }>(
      Object.assign(
        {},
        this.schemaMap,
        toPartial<any, any>(table.meta.name, table.meta.schema),
      ) as any,
      this.base,
      this.join.concat({
        tableName: table.meta.tableName,
        alias: table.meta.name,
        type: 'inner',
        expression,
      }),
    )
  }

  leftJoin<JoinModel, Name extends string>(
    table: Table<JoinModel, Name, any>,
    expression: AnyExpression,
  ): JoinedTable<CombinedModel & { [name in Name]: ValueNullable<JoinModel> }> {
    const rightPropertyMap = toMappedValue<Name, ModelSchema<ValueNullable<JoinModel>>>(
      table.meta.name,
      convertToNullableSchema(table.meta.schema),
    )

    return new JoinedTable<CombinedModel & { [name in Name]: ValueNullable<JoinModel> }>(
      Object.assign(
        {},
        this.schemaMap,
        rightPropertyMap,
      ) as any,
      this.base,
      this.join.concat({
        tableName: table.meta.tableName,
        alias: table.meta.name,
        type: 'left',
        expression,
      }),
    )
  }

  rightJoin<JoinModel, Name extends string>(
    table: Table<JoinModel, Name, any>,
    expression: AnyExpression,
  ): JoinedTable<{ [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> } & { [key in Name]: JoinModel }> {
    const leftPropertyMap = mapValues(
      (schema: ModelSchema<CombinedModel[keyof CombinedModel]>) => {
        return convertToNullableSchema(schema)
      },
      this.schemaMap as any,
    ) as { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }

    const rightPropertyMap = toMappedValue<Name, ModelSchema<JoinModel>>(table.meta.name, table.meta.schema)

    return new JoinedTable<CombinedModel & { [name in Name]: JoinModel }>(
      Object.assign(
        {},
        leftPropertyMap,
        rightPropertyMap,
      ) as any,
      this.base,
      this.join.concat({
        tableName: table.meta.tableName,
        alias: table.meta.name,
        type: 'right',
        expression,
      }),
    )
  }

  fullOuterJoin<JoinModel, Name extends string>(
    table: Table<JoinModel, Name, any>,
    expression: AnyExpression,
  ): JoinedTable<
    { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }
    & { [key in Name]: ValueNullable<JoinModel> }
  > {
    const leftPropertyMap = mapValues(
      (propertyMap: ModelSchema<CombinedModel[keyof CombinedModel]>) => {
        return convertToNullableSchema(propertyMap)
      },
      this.schemaMap as any,
    ) as { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }

    const rightPropertyMap = toMappedValue<Name, ModelSchema<ValueNullable<JoinModel>>>(
      table.meta.name,
      convertToNullableSchema(table.meta.schema),
    )

    return new JoinedTable<
      { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }
      & { [key in Name]: ValueNullable<JoinModel> }
    >(
      Object.assign(
        {},
        leftPropertyMap,
        rightPropertyMap,
      ),
      this.base,
      this.join.concat({
        tableName: table.meta.tableName,
        alias: table.meta.name,
        type: 'full',
        expression,
      }),
    )
  }

}

export function makeJoinedTable<Model, Name extends string>(
  tableName: string,
  name: Name,
  schema: ModelSchema<Model>,
): JoinedTable<{ [key in Name]: Model }> {
  return new JoinedTable<{ [key in Name]: Model }>(
    toMappedValue(name, schema),
    {
      tableName,
      alias: name,
    },
  )
}
