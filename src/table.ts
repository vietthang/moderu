import { Schema } from 'sukima'

import { Column } from './column'

export interface TableMeta<Model, Id extends keyof Model> extends DataSetMeta<Model> {

  readonly name: string

  readonly idAttribute: Id

}

export type PropertyMap<T> = { [key in keyof T]: Schema<T[key]> }

export interface DataSetMeta<Model> {

  readonly schema: PropertyMap<Model>

}

export type Table<Model, Id extends keyof Model> = {

  readonly [P in keyof Model]: Column<Model, P>;

} & {

  readonly $meta: TableMeta<Model, Id>;

}

export type DataSet<Model> = {

  readonly [P in keyof Model]: Column<Model, P>;

} & {

  readonly $meta: DataSetMeta<Model>;

}

export function defineTable<Model, Id extends keyof Model> (
  name: string,
  schema: PropertyMap<Model>,
  idAttribute: Id,
): Table<Model, Id> {
  const meta = {
    name,
    schema,
    idAttribute,
  }

  const keys = Object.keys(schema) as (keyof Model)[]
  const indexedColumns = keys.reduce(
    (prevValue, key) => {
      return {
        ...prevValue,
        [key]: new Column<Model, keyof Model>(schema[key], key, meta.name),
      }
    },
    {} as any,
  )

  return {
    $meta: meta,
    ...indexedColumns,
  } as Table<Model, Id>
}
