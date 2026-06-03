# @MatureLeek/calculator

一个私有 npm 包，用于解析并计算带变量的四则运算公式。

该包的入口文件是 `src/index.js`，包名为 `@MatureLeek/calculator`，当前版本为 `1.0.0`，并且在 `package.json` 中被标记为私有包。项目提供的测试命令是 `npm test`。 

## 功能特性

- 支持加、减、乘、除：`+`、`-`、`*`、`/`
- 支持括号和嵌套括号，例如 `(x + y) * z`
- 支持一元正负号，例如 `-x + +y * 10`
- 支持从 `data` 对象中读取变量
- 支持数字、字符串数字、科学计数法等数值输入
- 内部使用分数计算，尽量避免常见浮点误差，例如 `0.1 + 0.2`
- 不使用 `eval`、`Function`、Math.js 或其他公式解析器

## 安装方式

如果另一个项目需要引用它，可以在那个项目的 `package.json` 中使用本地路径依赖：

```json
{
  "dependencies": {
    "@MatureLeek/calculator": "file:../NPMPackage"
  }
}
```

然后在引用方项目中执行：

```bash
npm install
```

## 使用示例

```js
const Lib = require('@MatureLeek/calculator');

const result = Lib.calculate({
  formula: '(x + y) * z',
  data: {
    x: 0.1,
    y: 0.2,
    z: 1
  }
});

console.log(result); // 0.3
```

也可以使用字符串数字：

```js
const Lib = require('@MatureLeek/calculator');

const result = Lib.calculate({
  formula: '-x + +y * 10',
  data: {
    x: 1.5,
    y: '0.25'
  }
});

console.log(result); // 1
```

## API 文档

### `calculate({ formula, data })`

计算公式并返回数字结果。

#### 参数

| 参数 | 类型 | 必填 | 说明 |
|---|---|---:|---|
| `formula` | `string` | 是 | 要计算的公式，不能为空字符串 |
| `data` | `object` | 否 | 变量数据对象，默认为 `{}` |

#### 返回值

返回 `number` 类型的计算结果。

```js
const result = Lib.calculate({
  formula: '2 + 3 * (a - 1) / 2',
  data: {
    a: 5
  }
});

console.log(result); // 8
```

## 支持的公式语法

### 数字

```js
Lib.calculate({ formula: '1 + 2.5' });
```

### 变量

```js
Lib.calculate({
  formula: 'price * count',
  data: {
    price: 19.9,
    count: 3
  }
});
```

### 括号

```js
Lib.calculate({
  formula: '(x + y) * z',
  data: {
    x: 1,
    y: 2,
    z: 3
  }
});
```

### 一元正负号

```js
Lib.calculate({
  formula: '-x + +y',
  data: {
    x: 10,
    y: 3
  }
});
```

## 错误处理

以下情况会抛出错误：

- `formula` 不是非空字符串
- `data` 不是对象
- 公式语法错误
- 缺少右括号
- 使用了未定义变量
- 除数为 0
- 变量值不是合法数字

示例：

```js
const Lib = require('@MatureLeek/calculator');

try {
  Lib.calculate({
    formula: '1 / zero',
    data: {
      zero: 0
    }
  });
} catch (error) {
  console.error(error.message); // Division by zero
}
```

## 本地测试

在项目根目录执行：

```bash
npm test
```

测试文件位于：

```text
test/calculator.test.js
```

测试内容包括：

- 小数计算：`(x + y) * z`
- 运算优先级：`2 + 3 * (a - 1) / 2`
- 一元正负号：`-x + +y * 10`
- 除零错误
- 括号语法错误

## 项目结构

```text
NPMPackage/
├── package.json
├── README.md
├── src/
│   └── index.js
└── test/
    └── calculator.test.js
```
