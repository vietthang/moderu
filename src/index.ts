import { Schema, array } from 'sukima';
import mapValues = require('lodash/mapValues');

import { Table } from './table';
import { Column } from './column';
import { UpdateQuery } from './query/update';
import { DeleteQuery } from './query/delete';
import { InsertQuery } from './query/insert';
import { SelectQuery } from './query/select';

export function createTable<Model, Name extends string, Id extends keyof Model>(
  name: Name,
  schema: Schema<Model>,
  idAttribute: Id,
): Table<Model, Name, Name, Id> {
  const { properties } = schema.schema;
  const columns = mapValues(properties, (jsonSchema, key: any) => {
    return new Column(key, key, schema.getPropertySchema(key));
  });

  return {
    $meta: {
      name,
      alias: name,
      schema,
      idAttribute,
    },
    ...columns,
  } as any as Table<Model, Name, Name, Id>;
}

export function insert<Model, Name extends string, Id extends keyof Model>(
  table: Table<Model, Name, Name, Id>,
  value: Partial<Model>,
) {
  const idSchema = table.$meta.schema.getPropertySchema(table.$meta.idAttribute);
  return new InsertQuery<Model, Id>(table.$meta.name, value, idSchema);
}

export function select<Model, Name extends string, Id extends keyof Model>(
  table: Table<Model, Name, Name, Id>,
) {
  return new SelectQuery<Model>(table.$meta.name, array().items(table.$meta.schema));
}

export function update<Model, Name extends string, Id extends keyof Model>(
  table: Table<Model, Name, Name, Id>,
  model?: Partial<Model>,
) {
  return new UpdateQuery<Model>(table.$meta.name, model);
}

export function del<Model, Name extends string, Id extends keyof Model>(
  table: Table<Model, Name, Name, Id>,
) {
  return new DeleteQuery(table.$meta.name);
}
