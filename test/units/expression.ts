import 'mocha'
import * as assert from 'assert'
import { integer, string, number } from 'sukima'
import Knex = require('knex')

import { Expression } from '../../src/expression'
import { makeKnexRaw } from '../../src/utils/makeKnexRaw'

const knex = Knex({
  client: 'sqlite3',
  connection: {
    filename: ':memory:',
  },
  useNullAsDefault: true,
})

describe('Test Expression construction', () => {
  it('Should construct simple expression without bindings correctly', () => {
    const expression = new Expression('1 = 1', [], integer())
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '1 = 1')
    assert.deepEqual(bindings, [])
  })

  it('Should construct expression with distinct correctly', () => {
    const expression = new Expression('??', ['name'], integer()).distinct()
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, 'DISTINCT(??)')
    assert.deepEqual(bindings, ['name'])
  })

  it('Should construct expression with equals correctly', () => {
    const expression = new Expression('??', ['name'], string()).equals('Awesome')
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? = ?')
    assert.deepEqual(bindings, ['name', 'Awesome'])
  })

  it('Should construct expression with notEquals correctly', () => {
    const expression = new Expression('??', ['name'], string()).notEquals('Awesome')
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? <> ?')
    assert.deepEqual(bindings, ['name', 'Awesome'])
  })

  it('Should construct expression with greaterThan correctly', () => {
    const expression = new Expression('??', ['name'], integer()).greaterThan(1)
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? > ?')
    assert.deepEqual(bindings, ['name', 1])
  })

  it('Should construct expression with greaterThanEqual correctly', () => {
    const expression = new Expression('??', ['name'], integer()).greaterThanEqual(1)
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? >= ?')
    assert.deepEqual(bindings, ['name', 1])
  })

  it('Should construct expression with lessThan correctly', () => {
    const expression = new Expression('??', ['name'], integer()).lessThan(1)
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? < ?')
    assert.deepEqual(bindings, ['name', 1])
  })

  it('Should construct expression with lessThanEqual correctly', () => {
    const expression = new Expression('??', ['name'], integer()).lessThanEqual(1)
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? <= ?')
    assert.deepEqual(bindings, ['name', 1])
  })

  it('Should construct expression with like correctly', () => {
    const expression = new Expression('??', ['name'], string()).like('%Awesome%')
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? LIKE ?')
    assert.deepEqual(bindings, ['name', '%Awesome%'])
  })

  it('Should construct expression with notLike correctly', () => {
    const expression = new Expression('??', ['name'], string()).notLike('%Awesome%')
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? NOT LIKE ?')
    assert.deepEqual(bindings, ['name', '%Awesome%'])
  })

  it('Should construct expression with between correctly', () => {
    const expression = new Expression('??', ['name'], integer()).between(0, 10)
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? BETWEEN ? AND ?')
    assert.deepEqual(bindings, ['name', 0, 10])
  })

  it('Should construct expression with notBetween correctly', () => {
    const expression = new Expression('??', ['name'], integer()).notBetween(0, 10)
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? NOT BETWEEN ? AND ?')
    assert.deepEqual(bindings, ['name', 0, 10])
  })

  it('Should construct expression with in correctly', () => {
    const expression = new Expression('??', ['status'], integer()).in([0, 1, 2])
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? IN (?,?,?)')
    assert.deepEqual(bindings, ['status', 0, 1, 2])
  })

  it('Should construct expression with notIn correctly', () => {
    const expression = new Expression('??', ['status'], integer()).notIn([0, 1, 2])
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? NOT IN (?,?,?)')
    assert.deepEqual(bindings, ['status', 0, 1, 2])
  })

  it('Should construct expression with isNull correctly', () => {
    const expression = new Expression('??', ['optional'], integer()).isNull()
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? IS NULL')
    assert.deepEqual(bindings, ['optional'])
  })

  it('Should construct expression with isNotNull correctly', () => {
    const expression = new Expression('??', ['optional'], integer()).isNotNull()
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, '?? IS NOT NULL')
    assert.deepEqual(bindings, ['optional'])
  })

  it('Should construct expression with sum correctly', () => {
    const expression = new Expression('??', ['amount'], integer()).sum()
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, 'SUM(??)')
    assert.deepEqual(bindings, ['amount'])
  })

  it('Should construct expression with avg correctly', () => {
    const expression = new Expression('??', ['amount'], integer()).avg()
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, 'AVG(??)')
    assert.deepEqual(bindings, ['amount'])
  })

  it('Should construct expression with min correctly', () => {
    const expression = new Expression('??', ['amount'], integer()).min()
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, 'MIN(??)')
    assert.deepEqual(bindings, ['amount'])
  })

  it('Should construct expression with max correctly', () => {
    const expression = new Expression('??', ['amount'], integer()).max()
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, 'MAX(??)')
    assert.deepEqual(bindings, ['amount'])
  })

  it('Should construct expression with count correctly', () => {
    const expression = new Expression('??', ['amount'], integer()).count()
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, 'COUNT(??)')
    assert.deepEqual(bindings, ['amount'])
  })

  it('Should construct expression with not correctly', () => {
    const expression = new Expression('??', ['amount'], integer()).isNull().not()
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, 'NOT (?? IS NULL)')
    assert.deepEqual(bindings, ['amount'])
  })

  it('Should construct expression with and correctly', () => {
    const expression1 = new Expression('??', ['optional'], integer()).isNotNull().not()
    const expression2 = new Expression('??', ['name'], string()).like('Awesome')
    const expression = expression1.and(expression2)
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, 'NOT (?? IS NOT NULL) AND (?? LIKE ?)')
    assert.deepEqual(bindings, ['optional', 'name', 'Awesome'])
  })

  it('Should construct expression with or correctly', () => {
    const expression1 = new Expression('??', ['optional'], integer()).isNotNull().not()
    const expression2 = new Expression('??', ['name'], string()).like('Awesome')
    const expression = expression1.or(expression2)
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, 'NOT (?? IS NOT NULL) OR (?? LIKE ?)')
    assert.deepEqual(bindings, ['optional', 'name', 'Awesome'])
  })

  it('Should construct expression to compare 2 expression correctly', () => {
    const expression1 = new Expression('?? - ??', ['revenue', 'expense'], integer()).sum()
    const expression2 = new Expression('??', ['expected'], integer())
    const expression = expression1.equals(expression2)
    const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
    assert.equal(sql, 'SUM(?? - ??) = ??')
    assert.deepEqual(bindings, ['revenue', 'expense', 'expected'])
  })

  it('Should be able to explicitly set schema for an expression', () => {
    const baseExpression = new Expression('??', ['amount'], integer())
    const expression = baseExpression.withSchema(number())
    const { schema } = expression
    assert.deepEqual(number(), schema)
  })

  it('Should construct expression with custom bindable binding', () => {
    const customBinding = {
      bind(isSelect: true) {
        if (isSelect) {
          return 'selected'
        } else {
          return 'not selected'
        }
      },
    }
    const expression = new Expression('?', [customBinding], integer())
    {
      const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, true) as any
      assert.equal(sql, '?')
      assert.deepEqual(bindings, ['selected'])
    }
    {
      const { sql, bindings } = makeKnexRaw(knex, expression.sql, expression.bindings, false) as any
      assert.equal(sql, '?')
      assert.deepEqual(bindings, ['not selected'])
    }
  })
})
