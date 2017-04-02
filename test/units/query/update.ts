import 'mocha'
import * as assert from 'assert'
import { integer } from 'sukima'
import Knex = require('knex')

import { petPropertyMap } from '../../common'
import { defineTable } from '../../../src/table'
import { UpdateQuery } from '../../../src/query/update'
import { Expression } from '../../../src/expression'

const petTable = defineTable(
  'Pet',
  petPropertyMap,
  'id',
)

const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
})

const nowExpression = new Expression(`strftime('%s', 'now')`, [], integer())
const now = Date.now()

it('Should throw without model', () => {
  const query = new UpdateQuery(petTable)
  assert.throws(() => query.toSQL(knex))
})

it('Should generate correct update statement with simple model', () => {
  const query = new UpdateQuery(petTable).setAttributes({ name: 'abc', updated: now })
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, ['abc', now])
  assert.equal('update "Pet" set "name" = ?, "updated" = ?', sql)
})

it('Should generate correct update statement with model contains expression', () => {
  const query = new UpdateQuery(petTable).setAttributesUnsafe({ name: 'abc', updated: nowExpression })
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, ['abc'])
  assert.equal(`update "Pet" set "name" = ?, "updated" = strftime('%s', 'now')`, sql)
})

it('Should generate correct update statement with set', () => {
  const query = new UpdateQuery(petTable).set('name', 'abc')
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, ['abc'])
  assert.equal('update "Pet" set "name" = ?', sql)
})

it('Should generate correct update statement with set by column', () => {
  const query = new UpdateQuery(petTable).set(petTable.name, 'abc')
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, ['abc'])
  assert.equal('update "Pet" set "name" = ?', sql)
})

it('Should generate correct insert statement with set to expression', () => {
  const query = new UpdateQuery(petTable).setUnsafe('updated', nowExpression)
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, [])
  assert.equal(`update "Pet" set "updated" = strftime('%s', 'now')`, sql)
})

it('Should fail if set with invalid data', () => {
  const query = new UpdateQuery(petTable)
  assert.throws(() => query.set('ownerId', -1))
})

it('Should generate correct update statement with where', () => {
  const query = new UpdateQuery(petTable)
    .setAttributes({ name: 'abc' })
    .where(petTable.name.equals('Awesome'))
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, ['abc', 'Awesome'])
  assert.equal(`update "Pet" set "name" = ? where "name" = ?`, sql)
})
