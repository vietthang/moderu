import { QueryBuilder, QueryInterface } from 'knex';

import { TableMeta } from '../table';
import { Column } from '../column';
import { Expression } from '../expression';
import { Query, QueryProps } from './base';
import { makeKnexRaw } from '../utils/makeKnexRaw';
import { mapValues } from '../utils/mapValues';
import { ModificationQuery, ModificationQueryProps, ValidationMode, ModificationModel } from './modification';

import { applyMixins } from '../utils/applyMixins';

export type InsertQueryProps<Model, Id extends keyof Model> = QueryProps<Model[Id]> & ModificationQueryProps<Model> & {

  readonly tableName: string;

  readonly idAttribute: Id;

};

export class InsertQuery<Model, Id extends keyof Model>
  extends Query<Model[Id], InsertQueryProps<Model, Id>>
  implements ModificationQuery<Model, InsertQueryProps<Model, Id>> {

  validationMode: (validationMode: ValidationMode) => this;

  value: (model: ModificationModel<Model>) => this;

  set: <K extends keyof Model>(
    column: K | Column<Model, K>,
    value: Model[K] | Expression<Model[K], string>,
  ) => this;

  /** @internal */
  constructor(tableMeta: TableMeta<Model, Id>) {
    super({
      schema: tableMeta.schema.getPropertySchema(tableMeta.idAttribute),
      validationMode: ValidationMode.SkipExpressions,
      inputSchema: tableMeta.schema.getPartialSchema(),
      tableName: tableMeta.name,
      idAttribute: tableMeta.idAttribute,
    });
  }

  /** @internal */
  protected buildQuery(query: QueryInterface): QueryBuilder {
    const { model, tableName, idAttribute } = this.props;

    if (!model) {
      throw new Error('Insert without any model.');
    }

    const rawModel = mapValues(model, (value, key) => {
      if (value instanceof Expression) {
        return makeKnexRaw(query, value.sql, value.bindings, false);
      } else {
        return value;
      }
    });

    return query.table(tableName).insert(rawModel).returning(idAttribute);
  }

}

applyMixins(InsertQuery, ModificationQuery);
