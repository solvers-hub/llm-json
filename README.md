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
- **TypeScript Support**: Written in TypeScript with full type definitions

## Quick Start

### Installation

```bash
npm install llm-json
```

### Basic Usage

```typescript
import { LlmJson } from 'llm-json';

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

## Documentation

For detailed documentation including API references and examples:

- [API Documentation](./docs/README.md)
- [Examples](./docs/examples.md)

## License

MIT © 2023 
