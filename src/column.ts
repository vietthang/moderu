import { Schema } from 'sukima'

import { Expression, Bindable } from './expression'

class ColumnBinding implements Bindable {

  constructor(
    private readonly field: string,
    private readonly dataSetAlias: string,
  ) {

  }

  bind(isSelect: boolean): string {
    if (isSelect) {
      return `${this.dataSetAlias}.${this.field}`
    } else {
      return this.field
    }
  }

}

export class Column<Model, Field extends keyof Model> extends Expression<Model[Field], Field> {

  constructor(
    schema: Schema<Model[Field]>,
    field: Field,
    dataSetAlias: string,
  ) {
    super('??', [new ColumnBinding(field, dataSetAlias)], schema, field)
  }

}
