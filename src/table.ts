import { ObjectSchema } from 'sukima';

import { Expression } from './expression';
import { Column } from './column';
import { ModificationModel } from './query/modification'

export interface TableMeta<Model, Id extends keyof Model> extends DataSetMeta<Model> {

  readonly name: string;

  readonly idAttribute: Id;

  readonly beforeInsert?: (
    model: ModificationModel<Model>,
  ) => Promise<ModificationModel<Model>>;

  readonly afterInsert?: (
    model: ModificationModel<Model>,
    id: Id,
  ) => Promise<void>;

  readonly beforeUpdate?: (
    model: ModificationModel<Model>,
    condition: Expression<any, any> | undefined,
  ) => Promise<ModificationModel<Model>>;

  readonly afterUpdate?: (
    model: ModificationModel<Model>,
    condition: Expression<any, any> | undefined,
    updatedCount: number,
  ) => Promise<void>;

  readonly beforeDelete?: (
    condition: Expression<any, any> | undefined
  ) => Promise<void>;

  readonly afterDelete?: (
    condition: Expression<any, any> | undefined,
    deletedCount: number,
  ) => Promise<void>;

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
