import 'mocha'
import * as assert from 'assert'
import { integer } from 'sukima'
import Knex = require('knex')

import { petPropertyMap } from '../../common'
import { defineTable } from '../../../src/table'
import { InsertQuery } from '../../../src/query/insert'
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

const now = new Expression(`strftime('%s', 'now')`, [], integer())

it('Should throw without model', () => {
  const query = new InsertQuery(petTable)
  assert.throws(() => query.toSQL(knex))
})

it('Should generate correct insert statement with simple model', () => {
  const query = new InsertQuery(petTable).setAttributes({ id: 1, name: 'abc' })
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, [1, 'abc'])
  assert.equal('insert into "Pet" ("id", "name") values (?, ?)', sql)
})

it('Should generate correct insert statement with model contains expression', () => {
  const query = new InsertQuery(petTable).setAttributesUnsafe({ id: now, name: 'abc' })
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, ['abc'])
  assert.equal(`insert into "Pet" ("id", "name") values (strftime('%s', 'now'), ?)`, sql)
})

it('Should generate correct insert statement with set', () => {
  const query = new InsertQuery(petTable).set('name', 'abc')
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, ['abc'])
  assert.equal('insert into "Pet" ("name") values (?)', sql)
})

it('Should generate correct insert statement with set by column', () => {
  const query = new InsertQuery(petTable).set(petTable.name, 'abc')
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, ['abc'])
  assert.equal('insert into "Pet" ("name") values (?)', sql)
})

it('Should generate correct insert statement with set to expression', () => {
  const query = new InsertQuery(petTable).setUnsafe('id', now)
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, [])
  assert.equal(`insert into "Pet" ("id") values (strftime('%s', 'now'))`, sql)
})

it('Should generate correct insert statement when set an expression by column', () => {
  const query = new InsertQuery(petTable).setUnsafe(petTable.id, now)
  const { sql, bindings } = query.toSQL(knex)
  assert.deepEqual(bindings, [])
  assert.equal(`insert into "Pet" ("id") values (strftime('%s', 'now'))`, sql)
})

it('Should fail if set with invalid data', () => {
  const query = new InsertQuery(petTable)
  assert.throws(() => query.set('ownerId', -1))
})
