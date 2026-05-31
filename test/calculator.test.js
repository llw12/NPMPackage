'use strict';

const assert = require('node:assert/strict');
const Lib = require('..');

assert.equal(
  Lib.calculate({
    formula: '(x+y)*z',
    data: {
      x: 0.1,
      y: 0.2,
      z: 1
    }
  }),
  0.3
);

assert.equal(
  Lib.calculate({
    formula: '2 + 3 * (a - 1) / 2',
    data: {
      a: 5
    }
  }),
  8
);

assert.equal(
  Lib.calculate({
    formula: '-x + +y * 10',
    data: {
      x: 1.5,
      y: '0.25'
    }
  }),
  1
);

assert.throws(
  () => Lib.calculate({ formula: '1 / zero', data: { zero: 0 } }),
  /Division by zero/
);

assert.throws(
  () => Lib.calculate({ formula: '(1 + 2', data: {} }),
  /Expected closing parenthesis/
);

console.log('All calculator tests passed.');
