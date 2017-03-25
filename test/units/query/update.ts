import 'mocha';
import { assert } from 'chai';
import { integer, string } from 'sukima';
import Knex = require('knex');

import { defineTable } from '../../../src/table';
import { UpdateQuery } from '../../../src/query/update';
import { Expression } from '../../../src/expression';

const petTable = defineTable(
  'Pet',
  {
    id: integer().minimum(0),
    name: string(),
    updated: integer().minimum(0),
  },
  'id',
);

const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
});

const nowExpression = new Expression(`strftime('%s', 'now')`, [], integer(), 'now');
const now = Date.now();

it('Should throw without model', () => {
  const query = new UpdateQuery(petTable.$meta);
  assert.throw(() => query.toSQL(knex));
});

it('Should generate correct update statement with simple model', () => {
  const query = new UpdateQuery(petTable.$meta).value({ name: 'abc', updated: now });
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, ['abc', now]);
  assert.equal('update "Pet" set "name" = ?, "updated" = ?', sql);
});

it('Should generate correct update statement with model contains expression', () => {
  const query = new UpdateQuery(petTable.$meta).value({ name: 'abc', updated: nowExpression });
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, ['abc']);
  assert.equal(`update "Pet" set "name" = ?, "updated" = strftime('%s', 'now')`, sql);
});

it('Should generate correct update statement with set', () => {
  const query = new UpdateQuery(petTable.$meta).set('name', 'abc');
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, ['abc']);
  assert.equal('update "Pet" set "name" = ?', sql);
});

it('Should generate correct update statement with set by column', () => {
  const query = new UpdateQuery(petTable.$meta).set(petTable.name, 'abc');
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, ['abc']);
  assert.equal('update "Pet" set "name" = ?', sql);
});

it('Should generate correct insert statement with set to expression', () => {
  const query = new UpdateQuery(petTable.$meta).set('updated', nowExpression);
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal(`update "Pet" set "updated" = strftime('%s', 'now')`, sql);
});

it('Should fail if set with invalid data', () => {
  const query = new UpdateQuery(petTable.$meta);
  assert.throw(() => query.set('updated', -1));
});

it('Should fail if set with expression but validation is disallow expression', () => {
  const query = new UpdateQuery(petTable.$meta).validationMode(1);
  assert.throw(() => query.set('updated', nowExpression));
});

it('Should success if set with valid data, without expression and validation is disallow expression', () => {
  const query = new UpdateQuery(petTable.$meta).validationMode(1);
  assert.doesNotThrow(() => query.set('updated', now));
});

it('Should skip if set with invalid data but validation mode is disabled', () => {
  const query = new UpdateQuery(petTable.$meta).validationMode(2);
  assert.doesNotThrow(() => query.set('updated', -1));
});

it('Should fail if set with invalid validation mode', () => {
  const query = new UpdateQuery(petTable.$meta).validationMode(4);
  assert.throw(() => query.set('updated', now));
});

it('Should generate correct update statement with where', () => {
  const query = new UpdateQuery(petTable.$meta)
    .value({ name: 'abc' })
    .where(petTable.name.equals('Awesome'));
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, ['abc', 'Awesome']);
  assert.equal(`update "Pet" set "name" = ? where "name" = ?`, sql);
});
