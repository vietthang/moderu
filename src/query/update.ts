import { integer } from 'sukima';
import { QueryBuilder, QueryInterface } from 'knex';

import { Query, QueryProps } from './base';
import { TableMeta } from '../table';
import { Column } from '../column';
import { Expression } from '../expression';
import { ModificationQueryProps, ValidationMode, ModificationModel, ModificationQuery } from './modification';
import { ConditionalQuery, ConditionalQueryProps } from './conditional';
import { makeKnexRaw } from '../utils/makeKnexRaw';
import { mapValues } from '../utils/mapValues';
import { applyMixins } from '../utils/applyMixins';

export type UpdateQueryProps<Model> =
  QueryProps<number> &
  ModificationQueryProps<Model> &
  ConditionalQueryProps & {

  tableName: string;

  readonly beforeUpdate?: (
    model: ModificationModel<Model>,
    condition: Expression<any, any> | undefined,
  ) => Promise<ModificationModel<Model>>;

  readonly afterUpdate?: (
    model: ModificationModel<Model>,
    condition: Expression<any, any> | undefined,
    updatedCount: number,
  ) => Promise<void>;

};

export class UpdateQuery<Model>
  extends Query<number, UpdateQueryProps<Model>>
  implements ModificationQuery<Model, UpdateQueryProps<Model>>, ConditionalQuery<UpdateQueryProps<Model>> {

  /** @internal */
  private static schema = integer().minimum(0);

  validationMode: (validationMode: ValidationMode) => this;

  value: (model: ModificationModel<Model>) => this;

  set: <K extends keyof Model>(
    column: K | Column<Model, K>,
    value: Model[K] | Expression<Model[K], string>,
  ) => this;

  where: (condition: Expression<any, any>) => this;

  /** @internal */
  constructor(
    tableMeta: TableMeta<Model, any>,
  ) {
    super({
      validationMode: ValidationMode.SkipExpressions,
      schema: UpdateQuery.schema,
      inputSchema: tableMeta.schema.getPartialSchema(),
      tableName: tableMeta.name,
      beforeUpdate: tableMeta.beforeUpdate,
      afterUpdate: tableMeta.afterUpdate,
    });
  }

  /** @internal */
  protected buildQuery(query: QueryInterface): QueryBuilder {
    const { where, model, tableName, beforeUpdate } = this.props;

    if (beforeUpdate) {
      beforeUpdate(model as any, where);
    }

    if (!model) {
      throw new Error('Update without any model.');
    }

    const rawModel = mapValues(model, (value, key) => {
      if (value instanceof Expression) {
        return makeKnexRaw(query, value.sql, value.bindings, false);
      } else {
        return value;
      }
    });

    const builder = query.table(tableName).update(rawModel);

    if (where) {
      return builder.where(makeKnexRaw(query, where.sql, where.bindings, false));
    } else {
      return builder;
    }
  }

  protected async afterQuery(output: number) {
    const { afterUpdate, model, where } = this.props;

    if (afterUpdate) {
      afterUpdate(model as any, where, output);
    }
  }

}

applyMixins(UpdateQuery, ModificationQuery, ConditionalQuery);
