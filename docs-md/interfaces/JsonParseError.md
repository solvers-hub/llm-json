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

[types.ts:116](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L116)

___

### position

• `Optional` **position**: `number`

The position in the JSON string where the error occurred.

#### Defined in

[types.ts:126](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L126)

___

### raw

• **raw**: `string`

The raw JSON string that failed to parse.

#### Defined in

[types.ts:121](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L121)
