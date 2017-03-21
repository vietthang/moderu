import { ObjectSchema } from 'sukima';

import { Column } from './column';

export interface TableMeta<Model, Id extends keyof Model> extends DataSetMeta<Model> {

  readonly name: string;

  readonly idAttribute: Id;

}

export interface DataSetMeta<Model> {

  readonly schema: ObjectSchema<Model>;

}

export type Table<Model, Id extends keyof Model> = {

  readonly [P in keyof Model]: Column<Model, P>;

} & {

  readonly $meta: TableMeta<Model, Id>;

};

export type DataSet<Model> = {

  readonly [P in keyof Model]: Column<Model, P>;

} & {

  readonly $meta: DataSetMeta<Model>;

};

export function defineTable<Model, Id extends keyof Model>(
  name: string,
  schema: ObjectSchema<Model>,
  idAttribute: Id,
): Table<Model, Id> {
  const meta = {
    name,
    schema,
    idAttribute,
  };

  const keys = schema.keys();
  const indexedColumns = keys.reduce(
    (prevValue, key) => {
      return {
        ...prevValue,
        [key]: new Column<Model, any>(meta.schema.getPropertySchema(key as any), key, meta.name),
      };
    },
    {} as any,
  );

  return {
    $meta: meta,
    ...indexedColumns,
  } as Table<Model, Id>;
}
