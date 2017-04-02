import { Schema, validate } from 'sukima'

import { Column } from '../column'
import { Expression } from '../expression'
import { Extendable } from './extendable'
import { applyMixins } from '../utils/applyMixins'
import { toPartial } from '../common'

export type ModifiableModel<Model> = Partial<{ [K in keyof Model]: (Expression<Model[K]> | Model[K]) }>

export type ModifiableQueryProps<Model> = {
  model?: ModifiableModel<Model>;
  inputSchema: Schema<Partial<Model>>;
}

export class ModifiableQuery<
  Model, Props extends ModifiableQueryProps<Model>, Name extends string
> implements Extendable<Props> {

  /** @internal */
  readonly props: Props

  /** @internal */
  extend: <Keys extends keyof Props>(props: Pick<Props, Keys>) => this

  set<K extends keyof Model>(column: K | Column<Model, K, Name>, value: Model[K]): this {
    const key = column instanceof Expression ? column.meta.keys[0] as K : column

    return this.setAttributes(toPartial<Model, K>(key, value))
  }

  setAttributes(model: Partial<Model>): this {
    const validatedModel = validate(this.props.inputSchema, model)

    return this.setAttributesUnsafe(validatedModel)
  }

  setUnsafe<K extends keyof Model>(
    column: K | Column<Model, K, Name>,
    value: Model[K] | Expression<Model[K]>,
  ): this {
    const key = column instanceof Expression ? column.meta.keys[0] as K : column

    return this.setAttributesUnsafe(toPartial<ModifiableModel<Model>, K>(key, value))
  }

  setAttributesUnsafe(model: ModifiableModel<Model>): this {
    return this.extend({
      model: Object.assign(
        {},
        this.props.model,
        model,
      ),
    })
  }

}

applyMixins(ModifiableQuery, Extendable)