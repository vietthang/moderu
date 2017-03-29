import { PropertyMap, object } from 'sukima'

import { Selector } from './selector'
import { Column, makeColumn } from './column'
import { ModelSchema } from './common'

export type ColumnMap<Model, Key extends keyof Model, Name extends string> = {

  [key in Key]: Column<Model, key, Name>

}

export type DataSet<Model, Name extends string> = {

  readonly '*': Selector<Model, keyof Model, Name>

  readonly meta: {

    readonly name: Name,

    readonly schema: ModelSchema<Model>,

  },

  as<Alias extends string>(alias: Alias): DataSet<Model, Alias>

}
& ColumnMap<Model, keyof Model, Name>
& Selector<Model, keyof Model, Name>

export function makeDataSet<Model, Name extends string, T>(
  name: Name,
  propertyMap: PropertyMap<Model>,
  base: T,
): T & DataSet<Model, Name> {
  const keys = Object.keys(propertyMap) as (keyof Model)[]

  const columnMap = keys
    .reduce(
      (columnMap, key) => {
        return Object.assign({}, columnMap, {
          [key]: makeColumn<Model, keyof Model, Name>(propertyMap, key, name),
        })
      },
      {} as ColumnMap<Model, keyof Model, Name>,
    )

  return Object.assign(
    base,
    {
      meta: {
        name,
        schema: object<Model>(propertyMap),
        keys,
      },
      '*': base as any,
      as<Alias extends string>(alias: Alias): DataSet<Model, Alias> {
        return makeDataSet<Model, Alias, T>(alias, propertyMap, base)
      },
    },
    columnMap,
  )
}
