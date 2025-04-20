[@solvers-hub/llm-json](../README.md) / [Exports](../modules.md) / ExtractResult

# Interface: ExtractResult

Result of the JSON extraction.

## Table of contents

### Properties

- [json](ExtractResult.md#json)
- [text](ExtractResult.md#text)
- [validatedJson](ExtractResult.md#validatedjson)

## Properties

### json

• **json**: `any`[]

Array of parsed JSON objects extracted from the input.

#### Defined in

[types.ts:71](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L71)

___

### text

• **text**: `string`[]

Array of text blocks extracted from the input.

#### Defined in

[types.ts:66](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L66)

___

### validatedJson

• `Optional` **validatedJson**: [`ValidationResult`](ValidationResult.md)[]

Array of validated JSON results, only present if schemas were provided.

#### Defined in

[types.ts:76](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L76)
