import 'mocha';
import { assert } from 'chai';
import { object, integer, string } from 'sukima';
import Knex = require('knex');

import { createTable } from '../../../src/table';
import { InsertQuery } from '../../../src/query/insert';
import { Expression } from '../../../src/expression';

const petTable = createTable(
  'Pet',
  object({
    id: integer().minimum(0),
    name: string(),
  }),
  'id',
);

const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
});

it('Should generate correct insert statement with simple model', () => {
  const query = new InsertQuery(petTable.$meta).value({ id: 1, name: 'abc' });
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, [1, 'abc']);
  assert.equal('insert into "Pet" ("id", "name") values (?, ?)', sql);
});

it('Should generate correct insert statement with model contains expression', () => {
  const now = new Expression(`strftime('%s', 'now')`, [], integer(), 'now');
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

it('Should generate correct insert statement with set to expression', () => {
  const now = new Expression(`strftime('%s', 'now')`, [], integer(), 'now');
  const query = new InsertQuery(petTable.$meta).set('id', now);
  const { sql, bindings } = query.toSQL(knex);
  assert.deepEqual(bindings, []);
  assert.equal(`insert into "Pet" ("id") values (strftime('%s', 'now'))`, sql);
});
