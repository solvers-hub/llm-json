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

[types.ts:44](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/types.ts#L44)

___

### parsed

• `Optional` **parsed**: `any`

The parsed JSON object.

#### Defined in

[types.ts:54](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/types.ts#L54)

___

### raw

• **raw**: `string`

The raw JSON string.

#### Defined in

[types.ts:34](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/types.ts#L34)

___

### startIndex

• **startIndex**: `number`

The start index of the JSON block in the input string.

#### Defined in

[types.ts:39](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/types.ts#L39)

___

### wasCorrected

• `Optional` **wasCorrected**: `boolean`

Whether the JSON was corrected.

#### Defined in

[types.ts:49](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/types.ts#L49)
