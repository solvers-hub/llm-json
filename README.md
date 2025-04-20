# LLM-JSON Extractor

A TypeScript SDK for extracting and correcting JSON data from LLM outputs.

[![npm version](https://badge.fury.io/js/llm-json.svg)](https://badge.fury.io/js/llm-json)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

LLM-JSON is a lightweight library designed to parse and extract JSON objects from large language model (LLM) outputs. It can handle multiple JSON objects within text, extract text separately from JSON, and even attempt to fix malformed JSON.

## Key Features

- **Text/JSON Separation**: Cleanly separates text content from JSON data in LLM outputs
- **Multiple JSON Support**: Extracts multiple JSON objects or arrays from a single input
- **JSON Validation & Correction**: Automatically fixes common JSON formatting errors from LLMs
- **Code Block Support**: Extracts JSON from markdown code blocks (```json)
- **Schema Validation**: Validates extracted JSON against provided schemas
- **TypeScript Support**: Written in TypeScript with full type definitions

## Quick Start

### Installation

```bash
npm install @solvers-hub/llm-json
```

### Basic Usage

```typescript
import { LlmJson } from '@solvers-hub/llm-json';

const llmOutput = `Here's some text followed by JSON:

{
  "name": "John",
  "age": 30,
  "skills": ["JavaScript", "TypeScript", "React"]
}`;

const llmJson = new LlmJson({ attemptCorrection: true });
const { text, json } = llmJson.extract(llmOutput);

console.log(text); // ['Here\'s some text followed by JSON:']
console.log(json); // [{ name: 'John', age: 30, skills: ['JavaScript', 'TypeScript', 'React'] }]
```

### Schema Validation

You can validate extracted JSON against schemas:

```typescript
import { LlmJson } from '@solvers-hub/llm-json';

const schemas = [
  {
    name: 'person',
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        age: { type: 'integer' }
      },
      required: ['name', 'age']
    }
  }
];

const llmJson = new LlmJson({ 
  attemptCorrection: true,
  schemas
});

const llmOutput = `Here's a person: {"name": "John", "age": 30}
And some other data: {"title": "Meeting notes"}`;
const result = llmJson.extract(llmOutput);

// Note: All extracted JSON objects are included in the json array
console.log(result.json);
// [
//   { name: 'John', age: 30 },
//   { title: 'Meeting notes' }
// ]

// The validatedJson array includes validation results for each JSON object
console.log(result.validatedJson);
// [
//   {
//     json: { name: 'John', age: 30 },
//     matchedSchema: 'person',
//     isValid: true
//   },
//   {
//     json: { title: 'Meeting notes' },
//     matchedSchema: null,
//     isValid: false,
//     validationErrors: [...]  // Validation errors
//   }
// ]

```

## Examples

See the [examples](examples) directory for more examples of how to use the library.

How to run the examples:

```bash
npm run example:run -- examples/example.ts
```

## License

MIT © 2025 
