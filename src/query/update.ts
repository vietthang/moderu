import { integer } from 'sukima';
import { QueryBuilder } from 'knex';

import { MetaData, TableColumn } from '../table';
import { Column } from '../column';
import { ConditionalQuery, ConditionalQueryProps } from './conditional';
import { makeRaw } from './utils';

export type UpdateModel<Model> = Partial<Model | { [K in keyof Model]: Column<Model[K], K> }>;

export type UpdateQueryProps<Model> = ConditionalQueryProps & {
  model?: UpdateModel<Model>;
}

export class UpdateQuery<
  Model, Name extends string, Alias extends string, Id extends keyof Model,
> extends ConditionalQuery<number, UpdateQueryProps<Model>, Model, Name, Alias, Id> {

  private static schema = integer().minimum(0);

  constructor(
    tableMeta: MetaData<Model, Name, Alias, Id>,
  ) {
    super(tableMeta, { }, UpdateQuery.schema);
  }

  set(model: UpdateModel<Model>): this;

  set<K extends keyof Model>(
    column: K | TableColumn<Model, Name, Alias, Id, K>,
    value: Model[K] | Column<Model[K], string>,
  ): this;

  set(key: any, value?: any): this {
    if (value !== undefined) {
      if (typeof key === 'string') {
        return this.set({ [key]: value } as any as UpdateModel<Model>);
      } else {
        const column: TableColumn<Model, Name, Alias, Id, any> = key;

        return this.set({ [column.alias]: value } as any as UpdateModel<Model>);
      }
    } else {
      const model: {} = key;

      return this.extend({
        model: {
          ...(this.props.model || {}),
          ...model,
        } as Partial<Model>,
      });
    }
  }

  protected transformQuery(qb: QueryBuilder): QueryBuilder {
    const { where, model } = this.props;

    const builder = qb.update(model);

    if (where) {
      return builder.where(makeRaw(qb, where.sql, where.bindings));
    } else {
      return builder;
    }
  }

}
