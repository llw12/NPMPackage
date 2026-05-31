'use strict';

class FormulaSyntaxError extends Error {
  constructor(message, position) {
    super(`${message} at position ${position}`);
    this.name = 'FormulaSyntaxError';
    this.position = position;
  }
}

class Fraction {
  constructor(numerator, denominator = 1n) {
    if (denominator === 0n) {
      throw new RangeError('Division by zero');
    }

    if (denominator < 0n) {
      numerator = -numerator;
      denominator = -denominator;
    }

    const divisor = gcd(abs(numerator), denominator);
    this.numerator = numerator / divisor;
    this.denominator = denominator / divisor;
  }

  static from(value) {
    if (value instanceof Fraction) {
      return value;
    }

    if (typeof value !== 'number' && typeof value !== 'bigint' && typeof value !== 'string') {
      throw new TypeError(`Unsupported value type: ${typeof value}`);
    }

    const text = String(value).trim();
    if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) {
      throw new TypeError(`Invalid numeric value: ${text}`);
    }

    return Fraction.fromDecimalString(text);
  }

  static fromDecimalString(text) {
    let sign = 1n;
    let source = text.toLowerCase();

    if (source.startsWith('-')) {
      sign = -1n;
      source = source.slice(1);
    } else if (source.startsWith('+')) {
      source = source.slice(1);
    }

    const [mantissa, exponentText = '0'] = source.split('e');
    const exponent = Number(exponentText);
    const [integerPart, fractionPart = ''] = mantissa.split('.');
    const digits = `${integerPart || '0'}${fractionPart}`;
    const scale = fractionPart.length - exponent;

    if (scale <= 0) {
      return new Fraction(sign * BigInt(digits) * 10n ** BigInt(-scale), 1n);
    }

    return new Fraction(sign * BigInt(digits), 10n ** BigInt(scale));
  }

  add(other) {
    return new Fraction(
      this.numerator * other.denominator + other.numerator * this.denominator,
      this.denominator * other.denominator
    );
  }

  subtract(other) {
    return new Fraction(
      this.numerator * other.denominator - other.numerator * this.denominator,
      this.denominator * other.denominator
    );
  }

  multiply(other) {
    return new Fraction(this.numerator * other.numerator, this.denominator * other.denominator);
  }

  divide(other) {
    if (other.numerator === 0n) {
      throw new RangeError('Division by zero');
    }

    return new Fraction(this.numerator * other.denominator, this.denominator * other.numerator);
  }

  toNumber() {
    return Number(this.numerator) / Number(this.denominator);
  }
}

class Parser {
  constructor(formula, data) {
    this.formula = formula;
    this.data = data;
    this.position = 0;
  }

  parse() {
    const value = this.parseExpression();
    this.skipWhitespace();

    if (!this.isEnd()) {
      throw new FormulaSyntaxError(`Unexpected token "${this.peek()}"`, this.position);
    }

    return value;
  }

  parseExpression() {
    let left = this.parseTerm();

    while (true) {
      this.skipWhitespace();
      const operator = this.peek();

      if (operator !== '+' && operator !== '-') {
        return left;
      }

      this.position += 1;
      const right = this.parseTerm();
      left = operator === '+' ? left.add(right) : left.subtract(right);
    }
  }

  parseTerm() {
    let left = this.parseFactor();

    while (true) {
      this.skipWhitespace();
      const operator = this.peek();

      if (operator !== '*' && operator !== '/') {
        return left;
      }

      this.position += 1;
      const right = this.parseFactor();
      left = operator === '*' ? left.multiply(right) : left.divide(right);
    }
  }

  parseFactor() {
    this.skipWhitespace();
    const token = this.peek();

    if (token === '+' || token === '-') {
      this.position += 1;
      const value = this.parseFactor();
      return token === '-' ? new Fraction(-value.numerator, value.denominator) : value;
    }

    if (token === '(') {
      this.position += 1;
      const value = this.parseExpression();
      this.skipWhitespace();

      if (this.peek() !== ')') {
        throw new FormulaSyntaxError('Expected closing parenthesis', this.position);
      }

      this.position += 1;
      return value;
    }

    if (isDigit(token) || token === '.') {
      return this.parseNumber();
    }

    if (isIdentifierStart(token)) {
      return this.parseVariable();
    }

    if (this.isEnd()) {
      throw new FormulaSyntaxError('Unexpected end of formula', this.position);
    }

    throw new FormulaSyntaxError(`Unexpected token "${token}"`, this.position);
  }

  parseNumber() {
    const start = this.position;
    let hasDigit = false;

    while (isDigit(this.peek())) {
      this.position += 1;
      hasDigit = true;
    }

    if (this.peek() === '.') {
      this.position += 1;

      while (isDigit(this.peek())) {
        this.position += 1;
        hasDigit = true;
      }
    }

    if (!hasDigit) {
      throw new FormulaSyntaxError('Expected number', start);
    }

    if (this.peek().toLowerCase() === 'e') {
      this.position += 1;

      if (this.peek() === '+' || this.peek() === '-') {
        this.position += 1;
      }

      const exponentStart = this.position;
      while (isDigit(this.peek())) {
        this.position += 1;
      }

      if (this.position === exponentStart) {
        throw new FormulaSyntaxError('Expected exponent digits', this.position);
      }
    }

    return Fraction.from(this.formula.slice(start, this.position));
  }

  parseVariable() {
    const start = this.position;
    this.position += 1;

    while (isIdentifierPart(this.peek())) {
      this.position += 1;
    }

    const name = this.formula.slice(start, this.position);
    if (!Object.prototype.hasOwnProperty.call(this.data, name)) {
      throw new ReferenceError(`Unknown variable: ${name}`);
    }

    return Fraction.from(this.data[name]);
  }

  skipWhitespace() {
    while (/\s/.test(this.peek())) {
      this.position += 1;
    }
  }

  peek() {
    return this.formula[this.position] || '';
  }

  isEnd() {
    return this.position >= this.formula.length;
  }
}

function calculate(input) {
  if (!input || typeof input !== 'object') {
    throw new TypeError('calculate expects an object argument');
  }

  const { formula, data = {} } = input;
  if (typeof formula !== 'string' || formula.trim() === '') {
    throw new TypeError('formula must be a non-empty string');
  }

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new TypeError('data must be an object');
  }

  return new Parser(formula, data).parse().toNumber();
}

function abs(value) {
  return value < 0n ? -value : value;
}

function gcd(left, right) {
  while (right !== 0n) {
    const remainder = left % right;
    left = right;
    right = remainder;
  }

  return left || 1n;
}

function isDigit(value) {
  return value >= '0' && value <= '9';
}

function isIdentifierStart(value) {
  return /[A-Za-z_$]/.test(value);
}

function isIdentifierPart(value) {
  return /[A-Za-z0-9_$]/.test(value);
}

module.exports = {
  calculate
};
