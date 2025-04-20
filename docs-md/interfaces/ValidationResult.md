[@solvers-hub/llm-json](../README.md) / [Exports](../modules.md) / ValidationResult

# Interface: ValidationResult

Result of schema validation for a JSON object.

## Table of contents

### Properties

- [isValid](ValidationResult.md#isvalid)
- [json](ValidationResult.md#json)
- [matchedSchema](ValidationResult.md#matchedschema)
- [validationErrors](ValidationResult.md#validationerrors)

## Properties

### isValid

• **isValid**: `boolean`

Whether the JSON is valid according to the matched schema.

#### Defined in

[types.ts:51](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L51)

___

### json

• **json**: `any`

The JSON object that was validated.

#### Defined in

[types.ts:41](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L41)

___

### matchedSchema

• **matchedSchema**: ``null`` \| `string`

The name of the schema that matched, or null if no schema matched.

#### Defined in

[types.ts:46](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L46)

___

### validationErrors

• `Optional` **validationErrors**: `any`[]

Validation errors if any, or undefined if validation passed.

#### Defined in

[types.ts:56](https://github.com/solvers-hub/llm-json/blob/6d8d00890ee1d42b63f8bb8c3f6401333e41041e/src/types.ts#L56)
