import 'mocha'
import * as assert from 'assert'

import { Extendable } from '../../../src/query/extendable'

interface MockProps {
  foo: string
  bar: number
}

class MockClass extends Extendable<MockProps> {

  public readonly props: MockProps

  constructor(props: MockProps) {
    super()
    this.props = props
  }

}

describe('Test Extendable class', () => {
  it('Should create new instance and it should be extend correctly', () => {
    const instance = new MockClass({ foo: 'foo', bar: 1 })
    assert.deepEqual(instance, {
      props: {
        foo: 'foo',
        bar: 1,
      },
    })

    const newInstance1 = instance.extend({ foo: 'fooz' })
    assert.notEqual(instance, newInstance1)
    assert.deepEqual(newInstance1, {
      props: {
        foo: 'fooz',
        bar: 1,
      },
    })

    const newInstance2 = instance.extend({ foo: 'fooz', bar: 0 })
    assert.notEqual(instance, newInstance2)
    assert.deepEqual(newInstance2, {
      props: {
        foo: 'fooz',
        bar: 0,
      },
    })
  })
})
