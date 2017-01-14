import { Schema } from 'sukima';
import mapValues = require('lodash/mapValues');

import { Expression } from './expression';

export class Column<
  Model, Name extends string, Alias extends string, Id extends keyof Model, Field extends keyof Model,
> extends Expression<Model[Field], Field> {

  constructor(
    meta: MetaData<Model, Name, Alias, Id>,
    field: Field,
  ) {
    super('??', [`${meta.alias}.${field}`], meta.schema.getPropertySchema(field), field);
  }

}

export interface MetaData<Model, Name extends string, Alias extends string, Id extends keyof Model> {

  readonly schema: Schema<Model>;

  readonly name: Name;

  readonly idAttribute: Id;

  readonly alias: Alias;

}

export type Table<Model, Name extends string, Alias extends string, Id extends keyof Model> = {

  readonly [P in keyof Model]: Column<Model, Name, Alias, Id, P>;

} & {

  readonly $meta: MetaData<Model, Name, Alias, Id>;

}

export function createTable<Model, Name extends string, Id extends keyof Model>(
  name: Name,
  schema: Schema<Model>,
  idAttribute: Id,
): Table<Model, Name, Name, Id> {
  const meta = {
    name,
    alias: name,
    schema,
    idAttribute,
  };

  const { properties } = schema.schema;
  const columns = mapValues(properties, (jsonSchema, key: any) => {
    return new Column(meta, key);
  });

  return {
    $meta: meta,
    ...columns,
  } as any as Table<Model, Name, Name, Id>;
}
