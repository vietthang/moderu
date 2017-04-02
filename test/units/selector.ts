import 'mocha'
import * as assert from 'assert'

import { Pet } from '../common'
import { makeSelector } from '../../src/selector'

it('Should construct simple selector correctly', () => {
  const mock = {
    foo: 'foo',
    bar: 'bar',
  }

  const mockSelector = makeSelector<Pet, 'id', 'Pet', typeof mock>(
    'Pet',
    ['id'],
    mock,
  )

  assert.deepEqual(
    mockSelector,
    {
      'foo': 'foo',
      'bar': 'bar',
      'meta': {
        'name': 'Pet',
        'keys': ['id'],
      },
    },
  )
})

it('Should construct selector with multiple columns correctly', () => {
  const mock = {
    foo: 'foo',
    bar: 'bar',
  }

  const mockSelector = makeSelector<Pet, 'id' | 'name' | 'ownerId', 'Pet', typeof mock>(
    'Pet',
    ['id', 'name', 'ownerId'],
    mock,
  )

  assert.deepEqual(
    mockSelector,
    {
      'foo': 'foo',
      'bar': 'bar',
      'meta': {
        'name': 'Pet',
        'keys': ['id', 'name', 'ownerId'],
      },
    },
  )
})
