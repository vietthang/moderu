import { Schema } from 'sukima';

import { Column } from './column';

export type DataSet<Model, Name extends string> = {

  readonly [P in keyof Model]: Column<Model[P], P>;

} & {

  readonly $name: Name;

  readonly $schema: Schema<Model>;

  readonly $alias: string;

};

export type Table<Model, TableName extends string, Id extends keyof Model> = DataSet<Model, TableName> & {

  readonly $idAttribute: Id;

}