import 'mocha'
import * as assert from 'assert'
import { object, integer } from 'sukima'

import { petPropertyMap, userPropertyMap } from '../common'
import { defineTable } from '../../src/table'
import { convertToNullableSchema } from '../../src/common'
import { Expression } from '../../src/expression'

const petTable = defineTable({
  name: 'Pet',
  properties: petPropertyMap,
})

const userTable = defineTable({
  name: 'User',
  properties: userPropertyMap,
})

it('Should create table correctly', () => {
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
          table: petTable,
        },
        join: [
          {
            table: userTable,
            type: 'inner',
            expression: joinExpression,
          },
        ],
      },
    )
  })

  it('Should create JoinedTable with inner join with table alias correctly', () => {
    const joinExpression = new Expression<any>('1', [], integer())
    const userTableAlias = userTable.as('Owner')
    const joinedTable = petTable.innerJoin(userTableAlias, joinExpression)

    assert.deepEqual(
      joinedTable,
      {
        schemaMap: {
          Pet: petTable.meta.schema,
          Owner: userTable.meta.schema,
        },
        base: {
          table: petTable,
        },
        join: [
          {
            table: userTableAlias,
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
          table: petTable,
        },
        join: [
          {
            table: userTable,
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
          table: petTable,
        },
        join: [
          {
            table: userTable,
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
          table: petTable,
        },
        join: [
          {
            table: userTable,
            type: 'full',
            expression: joinExpression,
          },
        ],
      },
    )
  })
})
