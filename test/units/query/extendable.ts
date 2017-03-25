import 'mocha'
import { assert } from 'chai'

import { Extendable } from '../../../src/query/extendable'
import { applyMixins } from '../../../src/utils/applyMixins'

interface TestProps {
  foo: string
  bar: number
  complicated: {
    fooz: string;
    barz: {
      barzz: number;
    };
  }
}

class TestClass implements Extendable<TestProps> {

  /** @internal */
  readonly props: TestProps

  /** @internal */
  extend: (props: Partial<TestProps>) => this

  constructor (props: TestProps) {
    this.props = props
  }

}

applyMixins(TestClass, Extendable)

it('Should extend with new property correctly', () => {
  const source = new TestClass({
    foo: 'string',
    bar: 1,
    complicated: {
      fooz: 'string',
      barz: {
        barzz: 2,
      },
    },
  })

  const extended = source.extend({ foo: 'string2' })
  assert.equal(extended.constructor, TestClass)
  assert.deepEqual(extended.props, { ...source.props, foo: 'string2' })
  assert.deepEqual(extended.props.foo, 'string2')
})
