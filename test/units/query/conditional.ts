import 'mocha'
import * as assert from 'assert'
import { integer } from 'sukima'

import { ConditionalQuery } from '../../../src/query/conditional'
import { AnyExpression, Expression } from '../../../src/expression'

interface MockProps {
  foo: string
  bar: number
  where?: AnyExpression
}

class MockClass extends ConditionalQuery<MockProps> {

  public readonly props: MockProps

  constructor(props: MockProps) {
    super()
    this.props = props
  }

}

describe('Test ConditionalQuery class', () => {
  const expression1 = new Expression('1', [], integer())
  const expression2 = new Expression('2', [], integer())

  it('Should create new instance and it should be update with where correctly', () => {
    const instance = new MockClass({ foo: 'foo', bar: 1 })
    assert.deepEqual(instance, {
      props: {
        foo: 'foo',
        bar: 1,
      },
    })

    const newInstance1 = instance.where(expression1)
    assert.deepEqual(newInstance1, {
      props: {
        foo: 'foo',
        bar: 1,
        where: expression1,
      },
    })

    const newInstance2 = instance.where(expression1).where(expression2)
    assert.deepEqual(newInstance2, {
      props: {
        foo: 'foo',
        bar: 1,
        where: expression1.and(expression2),
      },
    })
  })
})
