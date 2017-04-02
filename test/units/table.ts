import 'mocha'
import * as assert from 'assert'
import { object, integer } from 'sukima'

import { petPropertyMap, userPropertyMap } from '../common'
import { defineTable } from '../../src/table'
import { convertToNullableSchema } from '../../src/common'
import { Expression } from '../../src/expression'

const petTable = defineTable(
  'Pet',
  petPropertyMap,
  'id',
)

const userTable = defineTable(
  'User',
  userPropertyMap,
  'id',
)

it('Should create table correctly', () => {
  assert.equal(petTable.meta.idAttribute, 'id')
  assert.equal(petTable.meta.name, 'Pet')
  assert.equal(petTable.meta.tableName, 'Pet')
  assert.deepEqual(petTable.meta.schema, object(petPropertyMap))
})

describe('Test tables joining', () => {
  it('Should create JoinedTable with inner join correctly', () => {
    const joinExpression = new Expression<any>('1', [], integer())
    const joinedTable = petTable.innerJoin(userTable, joinExpression)

    assert.deepEqual(
      joinedTable,
      {
        schemaMap: {
          Pet: petTable.meta.schema,
          User: userTable.meta.schema,
        },
        base: {
          tableName: 'Pet',
          alias: 'Pet',
        },
        join: [
          {
            tableName: 'User',
            alias: 'User',
            type: 'inner',
            expression: joinExpression,
          },
        ],
      },
    )
  })

  it('Should create JoinedTable with inner join with table alias correctly', () => {
    const joinExpression = new Expression<any>('1', [], integer())
    const joinedTable = petTable.innerJoin(userTable.as('Owner'), joinExpression)

    assert.deepEqual(
      joinedTable,
      {
        schemaMap: {
          Pet: petTable.meta.schema,
          Owner: userTable.meta.schema,
        },
        base: {
          tableName: 'Pet',
          alias: 'Pet',
        },
        join: [
          {
            tableName: 'User',
            alias: 'Owner',
            type: 'inner',
            expression: joinExpression,
          },
        ],
      },
    )
  })

  it('Should create JoinedTable with left join correctly', () => {
    const joinExpression = new Expression<any>('1', [], integer())
    const joinedTable = petTable.leftJoin(userTable, joinExpression)

    assert.deepEqual(
      joinedTable,
      {
        schemaMap: {
          Pet: petTable.meta.schema,
          User: convertToNullableSchema(userTable.meta.schema),
        },
        base: {
          tableName: 'Pet',
          alias: 'Pet',
        },
        join: [
          {
            tableName: 'User',
            alias: 'User',
            type: 'left',
            expression: joinExpression,
          },
        ],
      },
    )
  })

  it('Should create JoinedTable with right join correctly', () => {
    const joinExpression = new Expression<any>('1', [], integer())
    const joinedTable = petTable.rightJoin(userTable, joinExpression)

    assert.deepEqual(
      joinedTable,
      {
        schemaMap: {
          Pet: convertToNullableSchema(petTable.meta.schema),
          User: userTable.meta.schema,
        },
        base: {
          tableName: 'Pet',
          alias: 'Pet',
        },
        join: [
          {
            tableName: 'User',
            alias: 'User',
            type: 'right',
            expression: joinExpression,
          },
        ],
      },
    )
  })

  it('Should create JoinedTable with full join correctly', () => {
    const joinExpression = new Expression<any>('1', [], integer())
    const joinedTable = petTable.fullOuterJoin(userTable, joinExpression)

    assert.deepEqual(
      joinedTable,
      {
        schemaMap: {
          Pet: convertToNullableSchema(petTable.meta.schema),
          User: convertToNullableSchema(userTable.meta.schema),
        },
        base: {
          tableName: 'Pet',
          alias: 'Pet',
        },
        join: [
          {
            tableName: 'User',
            alias: 'User',
            type: 'full',
            expression: joinExpression,
          },
        ],
      },
    )
  })
})
