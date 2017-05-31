import 'mocha'
import * as assert from 'assert'
import { Schema, object, string, integer } from 'sukima'

import { Pet, petPropertyMap } from '../../common'
import { ModifiableQuery, ModifiableModel } from '../../../src/query/modifiable'
import { mapValues } from '../../../src/utils'
import { Expression } from '../../../src/expression'
import { Table, defineTable } from '../../../src/table'

interface MockProps {
  table: Table<Pet, any, any>
  model?: ModifiableModel<Pet>
  inputSchema: Schema<Partial<Pet>>
}

const petTable = defineTable({
  name: 'Pet',
  properties: petPropertyMap,
  idAttribute: 'id',
})

class MockClass extends ModifiableQuery<Pet, MockProps, 'Pet'> {

  public readonly props: MockProps

  constructor(props: MockProps) {
    super()
    this.props = props
  }

}

describe('Test ModifiableQuery class', () => {
  const inputSchema = object(
    mapValues(
      (schema: any) => schema.optional(),
      petPropertyMap,
    ),
  )
  it('Should create new instance correctly', () => {
    const instance = new MockClass({ table: petTable, inputSchema })

    assert.deepEqual(instance, {
      props: {
        table: petTable,
        inputSchema,
      },
    })
  })

  it('Should work with set correctly', () => {
    const query = new MockClass({ table: petTable, inputSchema })

    const newQuery = query.set('id', 1)
    assert.deepEqual(newQuery, {
      props: {
        table: petTable,
        inputSchema,
        model: {
          id: 1,
        },
      },
    })
  })

  it('Should throw if set to invalid value', () => {
    const query = new MockClass({ table: petTable, inputSchema })

    assert.throws(() => query.set('id', -1))
  })

  it('Should set invalid value using setUnsafe', () => {
    const query = new MockClass({ table: petTable, inputSchema })

    const newQuery = query.setUnsafe('id', -1)
    assert.deepEqual(newQuery, {
      props: {
        table: petTable,
        inputSchema,
        model: {
          id: -1,
        },
      },
    })
  })

  it('Should set to an expression using setUnsafe', () => {
    const dummyExpression = new Expression('1', [], integer())
    const query = new MockClass({ table: petTable, inputSchema })

    const newQuery = query.setUnsafe('id', dummyExpression)
    assert.deepEqual(newQuery, {
      props: {
        table: petTable,
        inputSchema,
        model: {
          id: dummyExpression,
        },
      },
    })
  })

  it('Should set to an expression with column using setUnsafe', () => {
    const dummyExpression = new Expression('1', [], integer())
    const query = new MockClass({ table: petTable, inputSchema })

    const newQuery = query.setUnsafe('id', dummyExpression)
    assert.deepEqual(newQuery, {
      props: {
        table: petTable,
        inputSchema,
        model: {
          id: dummyExpression,
        },
      },
    })
  })

  it('Should throw if setAttribute with invalid value', () => {
    const query = new MockClass({ table: petTable, inputSchema })

    assert.throws(() => query.setAttributes({
      id: -1,
      name: 'Pluto',
    }))
  })

  it('Should be able to set to expression or invalid value using setAttributesUnsafe', () => {
    const query = new MockClass({ table: petTable, inputSchema })
    const dummyExpression = new Expression('"ok"', [], string())

    const newQuery = query.setAttributesUnsafe({
      id: -1,
      name: dummyExpression,
    })

    assert.deepEqual(newQuery, {
      props: {
        table: petTable,
        inputSchema,
        model: {
          id: -1,
          name: dummyExpression,
        },
      },
    })
  })
})
