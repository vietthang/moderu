import { ObjectSchema } from 'sukima'

import { mapValues } from './utils'
import { convertToNullableSchema, toPartial, toMappedValue, ValueNullable } from './common'
import { AnyExpression } from './expression'
import { Joinable, Table } from './table'

export type SchemaMap<CombinedModel> = {
  [key in keyof CombinedModel]: ObjectSchema<CombinedModel[key]>
}

export type JoinEntryType = 'inner' | 'left' | 'right' | 'full'

export interface BaseJoinEntry {
  table: Table<any, any>
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
    table: Table<JoinModel, Name>,
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
        table: table as any,
        type: 'inner',
        expression,
      } as JoinEntry),
    )
  }

  leftJoin<JoinModel, Name extends string>(
    table: Table<JoinModel, Name>,
    expression: AnyExpression,
  ): JoinedTable<CombinedModel & { [name in Name]: ValueNullable<JoinModel> }> {
    const rightPropertyMap = toMappedValue<Name, ObjectSchema<ValueNullable<JoinModel>>>(
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
        table: table as any,
        type: 'left',
        expression,
      }),
    )
  }

  rightJoin<JoinModel, Name extends string>(
    table: Table<JoinModel, Name>,
    expression: AnyExpression,
  ): JoinedTable<{ [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> } & { [key in Name]: JoinModel }> {
    const leftPropertyMap = mapValues(
      (schema: ObjectSchema<CombinedModel[keyof CombinedModel]>) => {
        return convertToNullableSchema(schema)
      },
      this.schemaMap as any,
    ) as { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }

    const rightPropertyMap = toMappedValue<Name, ObjectSchema<JoinModel>>(table.meta.name, table.meta.schema)

    return new JoinedTable<CombinedModel & { [name in Name]: JoinModel }>(
      Object.assign(
        {},
        leftPropertyMap,
        rightPropertyMap,
      ) as any,
      this.base,
      this.join.concat({
        table: table as any,
        type: 'right',
        expression,
      }),
    )
  }

  fullOuterJoin<JoinModel, Name extends string>(
    table: Table<JoinModel, Name>,
    expression: AnyExpression,
  ): JoinedTable<
    { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }
    & { [key in Name]: ValueNullable<JoinModel> }
  > {
    const leftPropertyMap = mapValues(
      (propertyMap: ObjectSchema<CombinedModel[keyof CombinedModel]>) => {
        return convertToNullableSchema(propertyMap)
      },
      this.schemaMap as any,
    ) as { [key in keyof CombinedModel]: ValueNullable<CombinedModel[key]> }

    const rightPropertyMap = toMappedValue<Name, ObjectSchema<ValueNullable<JoinModel>>>(
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
        table: table as any,
        type: 'full',
        expression,
      }),
    )
  }

}

export function makeJoinedTable<Model, Name extends string>(
  table: Table<Model, Name>,
): JoinedTable<{ [key in Name]: Model }> {
  return new JoinedTable<{ [key in Name]: Model }>(
    toMappedValue(table.meta.name, table.meta.schema),
    {
      table: table as any,
    },
  )
}
