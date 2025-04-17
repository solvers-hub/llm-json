[@solvers-hub/llm-json](../README.md) / [Exports](../modules.md) / JsonParseError

# Interface: JsonParseError

Error information for JSON parsing failures.

## Table of contents

### Properties

- [message](JsonParseError.md#message)
- [position](JsonParseError.md#position)
- [raw](JsonParseError.md#raw)

## Properties

### message

• **message**: `string`

The original error message.

#### Defined in

[types.ts:64](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/types.ts#L64)

___

### position

• `Optional` **position**: `number`

The position in the JSON string where the error occurred.

#### Defined in

[types.ts:74](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/types.ts#L74)

___

### raw

• **raw**: `string`

The raw JSON string that failed to parse.

#### Defined in

[types.ts:69](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/types.ts#L69)
