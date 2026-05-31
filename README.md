# @MatureLeek/calculator

Private npm package for parsing and calculating arithmetic formulas with variables.

## Features

- Supports `+`, `-`, `*`, `/`
- Supports nested parentheses
- Supports unary `+` and `-`
- Supports variables from a `data` object
- Does not use `eval`, `Function`, Math.js, or other formula parsers
- Uses exact fraction arithmetic internally to avoid common decimal errors like `0.1 + 0.2`

## Usage

```js
const assert = require('node:assert/strict');
const Lib = require('@MatureLeek/calculator');

const result = Lib.calculate({
  formula: '(x+y)*z',
  data: {
    x: 0.1,
    y: 0.2,
    z: 1
  }
});

assert.equal(result, 0.3);
```

## Local Reference From Another Project

Because this package is private and does not need to be published, another local project can reference it by path:

```json
{
  "dependencies": {
    "@MatureLeek/calculator": "file:../NPMPackage"
  }
}
```

Then install dependencies in that project:

```bash
npm install
```

## API

### `calculate({ formula, data })`

Returns the numeric result of the formula.

- `formula`: non-empty string
- `data`: object containing variable values

Unknown variables, invalid syntax, and division by zero throw errors.
