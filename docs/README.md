# LLM-JSON Extractor

A TypeScript SDK for extracting and correcting JSON data from LLM outputs.

## Overview

LLM-JSON is a lightweight library designed to parse and extract JSON objects from large language model (LLM) outputs. It can handle multiple JSON objects within text, extract text separately from JSON, and even attempt to fix malformed JSON.

## Features

- Extract JSON objects and arrays from text
- Separate text and JSON content
- Support for multiple JSON objects in a single input
- JSON validation and correction for common LLM mistakes
- Support for code block extraction (```json)
- Written in TypeScript with full type definitions

## Installation

```bash
npm install llm-json
```

## Usage

### Basic Usage

```typescript
import { LlmJson } from 'llm-json';

// Create an instance with auto-correction enabled
const llmJson = new LlmJson({ attemptCorrection: true });

// Extract JSON from a string
const input = 'This is some text with a JSON object: {"name": "John", "age": 30}';
const result = llmJson.extract(input);

console.log(result.text); // ['This is some text with a JSON object:']
console.log(result.json); // [{ name: 'John', age: 30 }]
```

### Extracting Arrays and Objects

```typescript
// Extract both JSON objects and arrays
const input = 'Here is an object: {"name": "John"} and an array: [1, 2, 3]';
const result = llmJson.extractAll(input);

console.log(result.json); // [{ name: 'John' }, [1, 2, 3]]
```

### Using the Singleton Pattern

```typescript
import { LlmJson } from 'llm-json';

// Get or create a singleton instance
const llmJson = LlmJson.getInstance({ attemptCorrection: true });

// Use the instance
const result = llmJson.extract('{"name": "John"}');
```

### Correcting Malformed JSON

```typescript
// Extract and correct malformed JSON
const input = 'Malformed JSON: {name: "John", items: [1, 2, 3,]}'; // Have no quotes on keys
const result = llmJson.extract(input);

console.log(result.json); // [{ name: 'John', items: [1, 2, 3] }]
```

## API Reference

### `LlmJson`

The main class for interacting with the library.

#### Constructor

```typescript
constructor(options?: ExtractOptions)
```

- `options.attemptCorrection` - Whether to attempt to correct malformed JSON (default: false)

#### Methods

- `extract(input: string): ExtractResult` - Extract JSON objects from text
- `extractAll(input: string): ExtractResult` - Extract both JSON objects and arrays
- `static getInstance(options?: ExtractOptions): LlmJson` - Get or create a singleton instance

### `ExtractResult`

The result of extraction operations.

```typescript
interface ExtractResult {
  text: string[];  // Array of text blocks from the input
  json: any[];     // Array of parsed JSON objects/arrays
}
```

### `JsonExtractor` and `JsonArrayExtractor`

Lower-level classes that can be used directly for more control:

```typescript
import { JsonExtractor, JsonArrayExtractor } from 'llm-json';

const extractor = new JsonExtractor({ attemptCorrection: true });
const result = extractor.extract('{"name": "John"}');

const arrayExtractor = new JsonArrayExtractor({ attemptCorrection: true });
const arrayResult = arrayExtractor.extractArrays('[1, 2, 3]');
```

## License

MIT 