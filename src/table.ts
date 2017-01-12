import { Schema } from 'sukima';

import { Column } from './column';

export interface MetaData<Model, Name extends string, Alias extends string, Id extends keyof Model> {

  readonly schema: Schema<Model>;

  readonly name: Name;

  readonly idAttribute: Id;

  readonly alias: Alias;

}

export type Table<Model, Name extends string, Alias extends string, Id extends keyof Model> = {

  readonly [P in keyof Model]: Column<Model[P], P>;

} & {

  readonly $meta: MetaData<Model, Name, Alias, Id>;

}