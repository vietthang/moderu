import 'mocha';
import { assert } from 'chai';
import { integer, string } from 'sukima';
import Knex = require('knex');

import { defineTable } from '../../../src/table';
import { InsertQuery } from '../../../src/query/insert';
import { Expression } from '../../../src/expression';

const petTable = defineTable(
  'Pet',
  {
    id: integer().minimum(0),
    name: string(),
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

const now = new Expression(`strftime('%s', 'now')`, [], integer(), 'now');

it('Should throw without model', () => {
  const query = new InsertQuery(petTable.$meta);
  assert.throw(() => query.toSQL(knex));
});

it('Should generate correct insert statement with simple model', () => {
  const query = new InsertQuery(petTable.$meta).value({ id: 1, name: 'abc' });
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, [1, 'abc']);
  assert.equal('insert into "Pet" ("id", "name") values (?, ?)', sql);
});

it('Should generate correct insert statement with model contains expression', () => {
  const query = new InsertQuery(petTable.$meta).value({ id: now, name: 'abc' });
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, ['abc']);
  assert.equal(`insert into "Pet" ("id", "name") values (strftime('%s', 'now'), ?)`, sql);
});

it('Should generate correct insert statement with set', () => {
  const query = new InsertQuery(petTable.$meta).set('name', 'abc');
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, ['abc']);
  assert.equal('insert into "Pet" ("name") values (?)', sql);
});

it('Should generate correct insert statement with set by column', () => {
  const query = new InsertQuery(petTable.$meta).set(petTable.name, 'abc');
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, ['abc']);
  assert.equal('insert into "Pet" ("name") values (?)', sql);
});

it('Should generate correct insert statement with set to expression', () => {
  const query = new InsertQuery(petTable.$meta).set('id', now);
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal(`insert into "Pet" ("id") values (strftime('%s', 'now'))`, sql);
});

it('Should fail if set with invalid data', () => {
  const query = new InsertQuery(petTable.$meta);
  assert.throw(() => query.set('id', -1));
});

it('Should fail if set with expression but validation is disallow expression', () => {
  const query = new InsertQuery(petTable.$meta).validationMode(1);
  assert.throw(() => query.set('id', now));
});

it('Should success if set with valid data, without expression and validation is disallow expression', () => {
  const query = new InsertQuery(petTable.$meta).validationMode(1);
  assert.doesNotThrow(() => query.set('id', 1));
});

it('Should skip if set with invalid data but validation mode is disabled', () => {
  const query = new InsertQuery(petTable.$meta).validationMode(2);
  assert.doesNotThrow(() => query.set('id', -1));
});

it('Should fail if set with invalid validation mode', () => {
  const query = new InsertQuery(petTable.$meta).validationMode(4);
  assert.throw(() => query.set('id', 1));
});
