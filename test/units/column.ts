import 'mocha'
import * as assert from 'assert'

import { ColumnBinding, makeColumn } from '../../src/column'
import { petPropertyMap } from '../common'

describe('Test Column', () => {
  const idColumn = makeColumn(petPropertyMap, 'id', 'Pet')

  assert.deepEqual(
    idColumn,
    {
      sql: '??',
      bindings: [{ field: 'id', dataSetName: 'Pet' }],
      schema: petPropertyMap.id,
      meta: {
        name: 'Pet',
        keys: ['id'],
      },
    },
  )
})

describe('Test ColumnBinding', () => {
  const binding = new ColumnBinding('id', 'Pet')
  it('Should return only key if context is not select', () => {
    assert(binding.bind(false) === 'id')
  })

  it('Should return data set name with key if context is select', () => {
    assert(binding.bind(true) === 'Pet.id')
  })
})
