import { Schema, ObjectSchema } from 'sukima';

import { Expression } from './expression';

/** @internal */
export class ColumnBinding {

  constructor(
    public readonly field: string,
    public readonly dataSetAlias: string,
  ) {

  }

}

export class Column<Model, Field extends keyof Model> extends Expression<Model[Field], Field> {

  constructor(
    schema: Schema<Model[Field]>,
    field: Field,
    dataSetAlias: string,
  ) {
    super('??', [new ColumnBinding(field, dataSetAlias)], schema, field);
  }

}

export interface TableMeta<Model, Id extends keyof Model> extends DataSetMeta<Model> {

  readonly name: string;

  readonly idAttribute: Id;

}

export interface DataSetMeta<Model> {

  readonly schema: ObjectSchema<Model>;

  readonly alias: string;

}

export type Table<Model, Id extends keyof Model> = {

  readonly [P in keyof Model]: Column<Model, P>;

} & {

  readonly $meta: TableMeta<Model, Id>;

};

export type DataSet<Model> = {

  readonly [P in keyof Model]: Expression<Model[P], P>;

} & {

  readonly $meta: DataSetMeta<Model>;

};

export function createTable<Model, Id extends keyof Model>(
  name: string,
  schema: ObjectSchema<Model>,
  idAttribute: Id,
): Table<Model, Id> {
  const meta = {
    name,
    alias: name,
    schema,
    idAttribute,
  };

  const keys = schema.keys();
  const indexedColumns = keys.reduce(
    (prevValue, key) => {
      return {
        ...prevValue,
        [key]: new Column<Model, any>(meta.schema.getPropertySchema(key as any), key, meta.alias),
      };
    },
    {} as any,
  )

  return {
    $meta: meta,
    ...indexedColumns,
  } as Table<Model, Id>;
}
