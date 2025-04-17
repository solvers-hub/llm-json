[@solvers-hub/llm-json](../README.md) / [Exports](../modules.md) / LlmJson

# Class: LlmJson

Main factory class for the LLM-JSON extractor SDK.

## Table of contents

### Constructors

- [constructor](LlmJson.md#constructor)

### Properties

- [arrayExtractor](LlmJson.md#arrayextractor)
- [objectExtractor](LlmJson.md#objectextractor)
- [instance](LlmJson.md#instance)

### Methods

- [extract](LlmJson.md#extract)
- [extractAll](LlmJson.md#extractall)
- [getInstance](LlmJson.md#getinstance)

## Constructors

### constructor

• **new LlmJson**(`options?`): [`LlmJson`](LlmJson.md)

Creates a new LlmJson instance with the specified options.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`ExtractOptions`](../interfaces/ExtractOptions.md) | Configuration options for extraction. |

#### Returns

[`LlmJson`](LlmJson.md)

#### Defined in

[index.ts:17](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/index.ts#L17)

## Properties

### arrayExtractor

• `Private` **arrayExtractor**: `JsonArrayExtractor`

#### Defined in

[index.ts:11](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/index.ts#L11)

___

### objectExtractor

• `Private` **objectExtractor**: `JsonExtractor`

#### Defined in

[index.ts:10](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/index.ts#L10)

___

### instance

▪ `Static` `Private` **instance**: [`LlmJson`](LlmJson.md)

#### Defined in

[index.ts:9](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/index.ts#L9)

## Methods

### extract

▸ **extract**(`input`): [`ExtractResult`](../interfaces/ExtractResult.md)

Extract JSON objects and text from a string input.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `string` | The input string that may contain JSON. |

#### Returns

[`ExtractResult`](../interfaces/ExtractResult.md)

An object containing arrays of extracted text and JSON.

#### Defined in

[index.ts:39](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/index.ts#L39)

___

### extractAll

▸ **extractAll**(`input`): [`ExtractResult`](../interfaces/ExtractResult.md)

Extract JSON objects, arrays, and text from a string input.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `input` | `string` | The input string that may contain JSON. |

#### Returns

[`ExtractResult`](../interfaces/ExtractResult.md)

An object containing arrays of extracted text and JSON.

#### Defined in

[index.ts:48](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/index.ts#L48)

___

### getInstance

▸ **getInstance**(`options?`): [`LlmJson`](LlmJson.md)

Get or create a singleton instance of LlmJson.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `options` | [`ExtractOptions`](../interfaces/ExtractOptions.md) | Configuration options for extraction. |

#### Returns

[`LlmJson`](LlmJson.md)

The LlmJson singleton instance.

#### Defined in

[index.ts:27](https://github.com/solvers-hub/llm-json/blob/4d60f7fa6cdcace0d353b33e3d79c6fd33db1860/src/index.ts#L27)
