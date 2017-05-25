import { PropertyMap, object, ObjectSchema } from 'sukima'

import { Selector } from './selector'
import { Column, makeColumn } from './column'

export type ColumnMap<Model, Key extends keyof Model, Name extends string> = {

  [key in Key]: Column<Model, key, Name>

}

export interface DataSetCore<Model, Name extends string> {

  readonly meta: {

    readonly schema: ObjectSchema<Model>,

    readonly name: Name,

  },

  as<Alias extends string>(alias: Alias): DataSet<Model, Alias>

}

export type DataSet<Model, Name extends string>
  = DataSetCore<Model, Name>
  & ColumnMap<Model, keyof Model, Name>
  & Selector<Model, keyof Model, Name>
  & { model: Model }

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

  const ret = Object.create(base.constructor.prototype) as T

  return Object.assign(
    ret,
    base,
    {
      meta: {
        name,
        schema: object<Model>(propertyMap),
        keys,
      },
      as<Alias extends string>(alias: Alias): DataSet<Model, Alias> {
        return makeDataSet<Model, Alias, T>(alias, propertyMap, base)
      },
      model: null as any as Model,
    },
    columnMap,
  )
}
