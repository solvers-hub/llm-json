[@solvers-hub/llm-json](../README.md) / [Exports](../modules.md) / JsonBlock

# Interface: JsonBlock

Information about a detected JSON block.

## Table of contents

### Properties

- [endIndex](JsonBlock.md#endindex)
- [parsed](JsonBlock.md#parsed)
- [raw](JsonBlock.md#raw)
- [startIndex](JsonBlock.md#startindex)
- [wasCorrected](JsonBlock.md#wascorrected)

## Properties

### endIndex

• **endIndex**: `number`

The end index of the JSON block in the input string.

#### Defined in

[types.ts:96](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L96)

___

### parsed

• `Optional` **parsed**: `any`

The parsed JSON object.

#### Defined in

[types.ts:106](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L106)

___

### raw

• **raw**: `string`

The raw JSON string.

#### Defined in

[types.ts:86](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L86)

___

### startIndex

• **startIndex**: `number`

The start index of the JSON block in the input string.

#### Defined in

[types.ts:91](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L91)

___

### wasCorrected

• `Optional` **wasCorrected**: `boolean`

Whether the JSON was corrected.

#### Defined in

[types.ts:101](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L101)
