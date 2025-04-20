[@solvers-hub/llm-json](../README.md) / [Exports](../modules.md) / ExtractOptions

# Interface: ExtractOptions

Options for JSON extraction.

## Table of contents

### Properties

- [attemptCorrection](ExtractOptions.md#attemptcorrection)
- [schemas](ExtractOptions.md#schemas)

## Properties

### attemptCorrection

• `Optional` **attemptCorrection**: `boolean`

Whether to attempt to correct malformed JSON.

**`Default`**

```ts
false
```

#### Defined in

[types.ts:9](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L9)

___

### schemas

• `Optional` **schemas**: [`SchemaDefinition`](SchemaDefinition.md)[]

JSON schemas to validate extracted JSON against.
If provided, the extracted JSON will be validated against these schemas.

**`Default`**

```ts
undefined
```

#### Defined in

[types.ts:16](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L16)
