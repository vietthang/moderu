import 'mocha'
import * as assert from 'assert'

import { petPropertyMap } from '../common'
import { makeDataSet } from '../../src/dataSet'

describe('Test DataSet', () => {
  it('Should construct simple data set correctly', () => {
    const mock = {
      foo: 'foo',
      bar: 'bar',
    }

    const mockDataSet = makeDataSet('Pet', petPropertyMap, mock)

    assert.notEqual(mock, mockDataSet)
    assert.equal(mockDataSet['*'], mockDataSet)
    assert.equal(mockDataSet.foo, 'foo')
    assert.equal(mockDataSet.bar, 'bar')
    assert.deepEqual(mockDataSet.meta, {
      name: 'Pet',
      keys: ['id', 'ownerId', 'name', 'updated'],
      schema: {
        'props': {
          'properties': {
            'id': {
              'props': {
                'type': 'integer',
                'minimum': 0,
              },
            },
            'ownerId': {
              'props': {
                'type': 'integer',
                'minimum': 0,
              },
            },
            'name': {
              'props': {
                'type': 'string',
              },
            },
            'updated': {
              'props': {
                'type': 'integer',
              },
            },
          },
          'type': 'object',
        },
      },
    })

    assert.deepEqual(
      mockDataSet.id,
      {
        'sql': '??',
        'bindings': [{'field': 'id','dataSetName': 'Pet'}],
        'schema': {'props': {'type': 'integer','minimum': 0}},
        'meta': {'name': 'Pet','keys': ['id']},
      },
    )

    assert.deepEqual(
      mockDataSet.ownerId,
      {
        'sql': '??',
        'bindings': [{'field': 'ownerId','dataSetName': 'Pet'}],
        'schema': {'props': {'type': 'integer','minimum': 0}},
        'meta': {'name': 'Pet','keys': ['ownerId']},
      },
    )

    assert.deepEqual(
      mockDataSet.name,
      {
        'sql': '??',
        'bindings': [{'field': 'name','dataSetName': 'Pet'}],
        'schema': {'props': {'type': 'string'}},
        'meta': {'name': 'Pet','keys': ['name']},
      },
    )

    assert.deepEqual(
      mockDataSet.updated,
      {
        'sql': '??',
        'bindings': [{'field': 'updated','dataSetName': 'Pet'}],
        'schema': {'props': {'type': 'integer'}},
        'meta': {'name': 'Pet','keys': ['updated']},
      },
    )

    const aliasDataSet = mockDataSet.as('Dog')
    assert.notEqual(aliasDataSet, mockDataSet)
    assert.equal(aliasDataSet.meta.name, 'Dog')
  })
})
