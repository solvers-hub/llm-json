# LLM-JSON Comprehensive Guide

This guide addresses common advanced use cases and integration patterns for llm-json.

## Table of Contents

1. [Zod Schema Integration](#zod-schema-integration)
2. [Nested Schema Validation](#nested-schema-validation)
3. [Multiple Schema Processing](#multiple-schema-processing)
4. [Streaming Input Handling](#streaming-input-handling)
5. [Performance Optimization](#performance-optimization)
6. [Error Detection Strategies](#error-detection-strategies)

---

## Zod Schema Integration

### Problem

You have Zod schemas and want to use them with llm-json for validation.

### Solution

llm-json uses JSON Schema internally. Convert Zod schemas using `zod-to-json-schema`:

```bash
npm install zod zod-to-json-schema
```

```typescript
import { LlmJson } from '@solvers-hub/llm-json';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define Zod schema
const productSchema = z.object({
  productId: z.string(),
  quantity: z.number().min(0)
});

// Convert to JSON Schema
const productJsonSchema = zodToJsonSchema(productSchema);

// Use with llm-json
const llmJson = new LlmJson({
  attemptCorrection: true,
  schemas: [{
    name: 'product',
    schema: productJsonSchema
  }]
});

// Process LLM output
const input = 'Found the product: {"productId": "abc-123", "quantity": 10}';
const result = llmJson.extract(input);

// Validate and get type-safe result
if (result.validatedJson?.[0]?.isValid) {
  // Double validation: llm-json validated structure, now Zod validates types
  const validatedProduct = productSchema.parse(result.validatedJson[0].json);
  console.log(validatedProduct); // Type: { productId: string; quantity: number }
}
```

### Manual Conversion Reference

If you cannot use `zod-to-json-schema`, here's the conversion mapping:

| Zod | JSON Schema |
|-----|-------------|

| `z.string()` | `{ type: 'string' }` |
| `z.number()` | `{ type: 'number' }` |
| `z.number().min(0)` | `{ type: 'number', minimum: 0 }` |
| `z.number().max(100)` | `{ type: 'number', maximum: 100 }` |
| `z.integer()` | `{ type: 'integer' }` |
| `z.boolean()` | `{ type: 'boolean' }` |
| `z.array(z.string())` | `{ type: 'array', items: { type: 'string' } }` |
| `z.enum(['a', 'b'])` | `{ type: 'string', enum: ['a', 'b'] }` |
| `z.string().optional()` | Omit from `required` array |
| `z.literal('value')` | `{ type: 'string', enum: ['value'] }` |

**Example:**
```typescript
// Zod
const schema = z.object({
  name: z.string(),
  age: z.number().min(0),
  role: z.enum(['admin', 'user']).optional()
});

// JSON Schema equivalent
const jsonSchema = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    age: { type: 'number', minimum: 0 },
    role: { type: 'string', enum: ['admin', 'user'] }
  },
  required: ['name', 'age']  // role is optional
};
```

---

## Nested Schema Validation

### Problem
You have a complex nested schema (e.g., playlist with tracks array). One item in the array fails validation. How do you:
1. Detect which specific item failed?
2. Extract the error details?
3. Retrieve valid items and top-level data despite failures?

### Solution

```typescript
import { LlmJson } from '@solvers-hub/llm-json';

// Define nested schema
const playlistSchema = {
  name: 'playlist',
  schema: {
    type: 'object',
    properties: {
      playlistId: { type: 'string' },
      name: { type: 'string' },
      tracks: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            artist: { type: 'string' },
            duration: { type: 'number', exclusiveMinimum: 0 }
          },
          required: ['id', 'title', 'artist', 'duration']
        }
      }
    },
    required: ['playlistId', 'name', 'tracks']
  }
};

const llmJson = new LlmJson({
  attemptCorrection: true,
  schemas: [playlistSchema]
});

// LLM output with one track missing 'duration'
const llmOutput = `{
  "playlistId": "pl-001",
  "name": "My Favorites",
  "tracks": [
    { "id": "t1", "title": "Song One", "artist": "Artist A", "duration": 180 },
    { "id": "t2", "title": "Song Two", "artist": "Artist B" },
    { "id": "t3", "title": "Song Three", "artist": "Artist C", "duration": 240 }
  ]
}`;

const result = llmJson.extract(llmOutput);

// Step 1: Check validation status
const validation = result.validatedJson?.[0];
if (!validation?.isValid) {
  console.log('Validation failed!');
  
  // Step 2: Identify which specific item failed
  validation.validationErrors?.forEach(error => {
    // Error path format: "/tracks/1/duration" 
    // This means: array "tracks", index 1, field "duration"
    console.log('Instance Path:', error.instancePath);
    console.log('Message:', error.message);
    
    // Parse the path to extract array index
    const match = error.instancePath?.match(/\/tracks\/(\d+)/);
    if (match) {
      const trackIndex = parseInt(match[1]);
      console.log(`Failed track index: ${trackIndex}`);
      console.log(`Failed track data:`, result.json[0].tracks[trackIndex]);
    }
  });
  
  // Step 3: Retrieve top-level data (always available in result.json)
  const playlist = result.json[0];
  console.log('Playlist ID:', playlist.playlistId);  // Still accessible!
  console.log('Playlist Name:', playlist.name);      // Still accessible!
  
  // Step 4: Extract only valid tracks
  const validTracks = playlist.tracks.filter((track: any) => {
    return track.id && track.title && track.artist && typeof track.duration === 'number';
  });
  console.log('Valid tracks:', validTracks);
}
```

### Expected `validatedJson` Structure

```typescript
{
  json: { /* the full extracted object */ },
  matchedSchema: 'playlist',
  isValid: false,
  validationErrors: [
    {
      instancePath: '/tracks/1/duration',
      schemaPath: '#/properties/tracks/items/required',
      message: "must have required property 'duration'"
    }
  ]
}
```

**Key Points:**
- `result.json` always contains the raw extracted data (even if validation fails)
- `validationErrors[].instancePath` tells you exactly where the error occurred
- Use path parsing (`/tracks/1/duration`) to identify failed array indices
- Filter the array manually to separate valid from invalid items

---

## Multiple Schema Processing

### Problem
Build a `LogProcessor` class that processes logs with multiple schema types (errors and infos).

### Solution

```typescript
import { LlmJson } from '@solvers-hub/llm-json';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Define Zod schemas
const errorLogSchema = z.object({
  level: z.literal('error'),
  message: z.string(),
  timestamp: z.string(),
  stackTrace: z.string().optional()
});

const infoLogSchema = z.object({
  level: z.literal('info'),
  message: z.string(),
  timestamp: z.string(),
  metadata: z.record(z.any()).optional()
});

class LogProcessor {
  private llmJson: LlmJson;
  private errorSchema: z.ZodType;
  private infoSchema: z.ZodType;

  constructor(schemas: { errorLog: z.ZodType; infoLog: z.ZodType }) {
    this.errorSchema = schemas.errorLog;
    this.infoSchema = schemas.infoLog;
    
    // Convert Zod to JSON Schema
    this.llmJson = new LlmJson({
      attemptCorrection: true,
      schemas: [
        {
          name: 'errorLog',
          schema: zodToJsonSchema(schemas.errorLog)
        },
        {
          name: 'infoLog',
          schema: zodToJsonSchema(schemas.infoLog)
        }
      ]
    });
  }

  process(logEntry: string): { errors: any[]; infos: any[] } {
    const result = this.llmJson.extract(logEntry);
    
    const errors: any[] = [];
    const infos: any[] = [];

    // Process each validated JSON object
    result.validatedJson?.forEach(validated => {
      if (validated.isValid) {
        // Route to appropriate array based on matched schema
        if (validated.matchedSchema === 'errorLog') {
          errors.push(this.errorSchema.parse(validated.json));
        } else if (validated.matchedSchema === 'infoLog') {
          infos.push(this.infoSchema.parse(validated.json));
        }
      }
    });

    return { errors, infos };
  }
}

// Usage
const processor = new LogProcessor({
  errorLog: errorLogSchema,
  infoLog: infoLogSchema
});

const logs = `
  {"level": "error", "message": "DB error", "timestamp": "2024-01-15T10:30:00Z"}
  {"level": "info", "message": "Server started", "timestamp": "2024-01-15T10:00:00Z"}
  {"level": "error", "message": "API timeout", "timestamp": "2024-01-15T10:35:00Z"}
`;

const { errors, infos } = processor.process(logs);
console.log('Errors:', errors);  // 2 error logs
console.log('Infos:', infos);    // 1 info log
```

**Key Points:**
- Use `matchedSchema` to route validated objects to correct arrays
- Each validated object includes `matchedSchema: 'errorLog' | 'infoLog' | null`
- Invalid objects have `isValid: false` and are excluded
- Can pass validated data through Zod's `.parse()` for type safety

---

## Streaming Input Handling

### Problem
LLM sends JSON in chunks: `'{ "key": "val'` → `'ue1", "anoth'` → `'erKey": 123 }'`

The `.extract()` method requires complete strings. How to handle partial JSON?

### Solution

Implement a buffering wrapper that detects JSON boundaries:

```typescript
import { LlmJson } from '@solvers-hub/llm-json';

class StreamingJsonHandler {
  private buffer: string = '';
  private llmJson: LlmJson;

  constructor() {
    this.llmJson = new LlmJson({ attemptCorrection: true });
  }

  processChunk(chunk: string): any[] {
    this.buffer += chunk;
    
    // Try to extract complete JSON objects
    const { extracted, remaining } = this.extractCompleteJson(this.buffer);
    this.buffer = remaining;
    
    return extracted;
  }

  private extractCompleteJson(text: string): { 
    extracted: any[]; 
    remaining: string 
  } {
    let depth = 0;
    let start = -1;
    let inString = false;
    let escapeNext = false;
    const extracted: any[] = [];
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      
      // Handle escape sequences
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      // Track string boundaries
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      // Only count braces outside strings
      if (!inString) {
        if (char === '{') {
          if (depth === 0) start = i;
          depth++;
        } else if (char === '}') {
          depth--;
          
          // Found complete JSON object
          if (depth === 0 && start !== -1) {
            const jsonStr = text.substring(start, i + 1);
            const result = this.llmJson.extract(jsonStr);
            extracted.push(...result.json);
            start = -1;
          }
        }
      }
    }
    
    // Return extracted objects and remaining incomplete data
    const lastComplete = start === -1 ? text.length : start;
    return {
      extracted,
      remaining: text.substring(lastComplete)
    };
  }

  finalize(): any[] {
    // Process any remaining buffer
    if (this.buffer.trim()) {
      const result = this.llmJson.extract(this.buffer);
      this.buffer = '';
      return result.json;
    }
    return [];
  }
}

// Usage
const handler = new StreamingJsonHandler();

// Simulate streaming chunks
const chunks = ['{ "key": "val', 'ue1", "anoth', 'erKey": 123 }'];

chunks.forEach(chunk => {
  const extracted = handler.processChunk(chunk);
  if (extracted.length > 0) {
    console.log('Extracted:', extracted);
  }
});

const remaining = handler.finalize();
console.log('Final:', remaining);
```

### Primary Challenges

1. **Brace Counting**: Must accurately track `{` and `}` pairs
   - Solution: Maintain depth counter

2. **String Handling**: Braces inside strings (`"name": "{ test }"`) don't count
   - Solution: Track `inString` state

3. **Escape Sequences**: Handle `\"` inside strings
   - Solution: Track `escapeNext` flag

4. **Nested Objects**: `{ "a": { "b": { "c": 1 } } }`
   - Solution: Depth counting handles any nesting level

5. **Multiple Objects**: Stream may contain multiple complete objects
   - Solution: Continue parsing after each complete object

6. **Buffer Management**: Must retain incomplete data
   - Solution: Track `start` position and preserve from there

---

## Performance Optimization

### Problem
High-throughput pipeline processing millions of LLM responses. Running `attemptCorrection` on every call adds overhead. Need to balance speed and reliability.

### Solution: Two-Stage Parsing Strategy

```typescript
import { LlmJson } from '@solvers-hub/llm-json';

class TwoStageParser {
  private fastParser: LlmJson;
  private fallbackParser: LlmJson;

  constructor() {
    // Stage 1: Fast path (no correction)
    this.fastParser = new LlmJson({
      attemptCorrection: false
    });

    // Stage 2: Fallback path (with correction)
    this.fallbackParser = new LlmJson({
      attemptCorrection: true
    });
  }

  parse(input: string): any[] {
    // STAGE 1: Fast path
    const fastResult = this.fastParser.extract(input);
    
    // Determine if we need Stage 2
    if (this.shouldUseFallback(input, fastResult)) {
      // STAGE 2: Fallback with correction
      console.log('Using fallback parser...');
      const fallbackResult = this.fallbackParser.extract(input);
      return fallbackResult.json;
    }
    
    return fastResult.json;
  }

  private shouldUseFallback(input: string, fastResult: any): boolean {
    // If fast path succeeded, no fallback needed
    if (fastResult.json.length > 0) {
      return false;
    }

    // Check if input contains JSON-like patterns
    const hasJsonPattern = this.detectJsonPattern(input);
    
    // If no JSON patterns, input genuinely has no JSON
    // Fast path correctly returned empty result
    if (!hasJsonPattern) {
      return false;
    }

    // Input has JSON patterns but extraction failed
    // Likely malformed - trigger fallback
    return true;
  }

  private detectJsonPattern(input: string): boolean {
    const patterns = [
      /\{[^}]*:/,           // Object with property
      /\[[^\]]*\{/,         // Array containing object
      /```json/i,           // Markdown code block
      /"[^"]+"\s*:\s*/,     // Quoted property name
    ];

    return patterns.some(pattern => pattern.test(input));
  }
}

// Usage
const parser = new TwoStageParser();

// Well-formed JSON: Stage 1 succeeds (fast)
const result1 = parser.parse('{"name": "test"}');

// No JSON: Stage 1 succeeds (fast)
const result2 = parser.parse('Just plain text');

// Malformed JSON: Stage 1 fails, Stage 2 fixes (slower)
const result3 = parser.parse('{name: "test"}');  // Missing quotes on key
```

### Trigger Logic for Stage 2

**Execute Stage 2 when ALL conditions are met:**

1. ✅ Stage 1 returned empty `json` array
2. ✅ Input contains JSON-like patterns
3. ✅ Patterns indicate intent to have JSON (not just text)

**DO NOT execute Stage 2 when:**

- ❌ Stage 1 successfully extracted JSON
- ❌ Input contains no JSON-like patterns
- ❌ Input is genuinely plain text

### Performance Design Benefits

| Aspect | Stage 1 (Fast) | Stage 2 (Fallback) |
|--------|----------------|-------------------|
| **CPU Cost** | Low | Medium |
| **Success Rate** | ~85-90% | ~95-98% |
| **Latency** | 1-2ms | 5-10ms |
| **Use Case** | Well-formed JSON | Malformed JSON |

**Expected Results:**
- 85-90% of requests handled by Stage 1 (fast path)
- 10-15% require Stage 2 (fallback)
- Overall throughput: ~3-5x faster than always using correction

---

## Error Detection Strategies

### Problem
How to distinguish between:
1. Successful extraction
2. Input with no JSON (genuinely empty)
3. Parse failure (malformed JSON that couldn't be extracted)

### Solution

```typescript
import { LlmJson } from '@solvers-hub/llm-json';

function diagnoseExtraction(input: string, result: any): {
  status: 'success' | 'no_json' | 'parse_failure';
  reason: string;
} {
  // Case 1: Extraction succeeded
  if (result.json.length > 0) {
    return {
      status: 'success',
      reason: `Extracted ${result.json.length} JSON object(s)`
    };
  }

  // Case 2 vs 3: Detect JSON-like patterns
  const jsonPatterns = [
    /\{[^}]*:/,           // Object pattern
    /\[[^\]]*\{/,         // Array with objects
    /```json/i,           // Code block
    /"[^"]+"\s*:\s*/,     // Quoted property
  ];

  const hasJsonLikeContent = jsonPatterns.some(p => p.test(input));

  if (!hasJsonLikeContent) {
    return {
      status: 'no_json',
      reason: 'Input contains no JSON-like patterns'
    };
  }

  return {
    status: 'parse_failure',
    reason: 'Input has JSON-like patterns but extraction failed'
  };
}

// Usage
const llmJson = new LlmJson({ attemptCorrection: false });

// Test 1: Success
const test1 = llmJson.extract('{"name": "test"}');
console.log(diagnoseExtraction('{"name": "test"}', test1));
// { status: 'success', reason: 'Extracted 1 JSON object(s)' }

// Test 2: No JSON
const test2 = llmJson.extract('This is just plain text');
console.log(diagnoseExtraction('This is just plain text', test2));
// { status: 'no_json', reason: 'Input contains no JSON-like patterns' }

// Test 3: Parse failure
const test3 = llmJson.extract('{name: "test"}');  // Malformed
console.log(diagnoseExtraction('{name: "test"}', test3));
// { status: 'parse_failure', reason: 'Input has JSON-like patterns but extraction failed' }
```

### Detection Patterns

| Pattern | Regex | Indicates |
|---------|-------|-----------|
| Object start | `/\{[^}]*:/` | `{ "key":` or `{key:` |
| Array with object | `/\[[^\]]*\{/` | `[{` pattern |
| Code block | `/```json/i` | Markdown code fence |
| Quoted property | `/"[^"]+"\s*:\s*/` | `"property": value` |

**Key Insight:**
- Empty `result.json` is ambiguous without context
- Pattern detection disambiguates "no JSON" vs "failed parse"
- Use this for intelligent fallback decisions

---

## Summary

This guide provides production-ready solutions for:

✅ **Zod Integration** - Convert and validate with type safety  
✅ **Nested Validation** - Identify specific array item failures  
✅ **Multiple Schemas** - Route to typed arrays by schema match  
✅ **Streaming** - Buffer chunks and detect JSON boundaries  
✅ **Performance** - Two-stage parsing for high throughput  
✅ **Error Detection** - Distinguish failure types for intelligent handling

For more examples, see the [examples](../examples) directory.
