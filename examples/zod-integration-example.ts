import LlmJson from '../src/index';
import { z } from 'zod';

/**
 * COMPREHENSIVE ZOD INTEGRATION GUIDE
 * 
 * This example demonstrates how to use Zod schemas with llm-json.
 * llm-json uses JSON Schema internally, so you need to convert Zod schemas to JSON Schema format.
 * 
 * Install zod-to-json-schema: npm install zod-to-json-schema
 */

// For this example, we'll show the manual conversion approach
// In production, use: import { zodToJsonSchema } from 'zod-to-json-schema';

/**
 * EXAMPLE 1: Simple Zod Schema Conversion
 * Question 2: Process string with Zod schema validation
 */
function example1_SimpleZodSchema() {
    console.log('=== Example 1: Simple Zod Schema with llm-json ===\n');

    // Step 1: Define your Zod schema
    const productSchema = z.object({
        productId: z.string(),
        quantity: z.number().min(0)
    });

    // Step 2: Convert Zod schema to JSON Schema format (manual approach)
    // In production, use: zodToJsonSchema(productSchema)
    const productJsonSchema = {
        name: 'product',
        schema: {
            type: 'object',
            properties: {
                productId: { type: 'string' },
                quantity: { type: 'number', minimum: 0 }
            },
            required: ['productId', 'quantity'],
            additionalProperties: false
        }
    };

    // Step 3: Initialize LlmJson with the JSON Schema
    const llmJson = new LlmJson({
        attemptCorrection: true,
        schemas: [productJsonSchema]
    });

    // Step 4: Process the LLM output
    const llmOutput = 'Found the product: {"productId": "abc-123", "quantity": 10}';
    const result = llmJson.extract(llmOutput);

    // Step 5: Get validated result
    console.log('Extracted JSON:', result.json);
    console.log('\nValidation Result:', result.validatedJson);

    // Step 6: Check if validation passed
    if (result.validatedJson && result.validatedJson.length > 0) {
        const validatedProduct = result.validatedJson[0];
        
        if (validatedProduct.isValid && validatedProduct.matchedSchema === 'product') {
            console.log('\n✅ Product validated successfully!');
            console.log('Validated product:', validatedProduct.json);
            
            // Now you can safely use with Zod's parse for type safety
            const typedProduct = productSchema.parse(validatedProduct.json);
            console.log('Type-safe product:', typedProduct);
        } else {
            console.log('\n❌ Validation failed!');
            console.log('Errors:', validatedProduct.validationErrors);
        }
    }
}

/**
 * EXAMPLE 2: Using zod-to-json-schema Library (RECOMMENDED)
 * This is the production-ready approach
 */
function example2_WithZodToJsonSchema() {
    console.log('\n\n=== Example 2: Using zod-to-json-schema (RECOMMENDED) ===\n');

    /**
     * In production code, use this approach:
     * 
     * import { zodToJsonSchema } from 'zod-to-json-schema';
     * 
     * const productSchema = z.object({
     *     productId: z.string(),
     *     quantity: z.number().min(0)
     * });
     * 
     * const llmJson = new LlmJson({
     *     attemptCorrection: true,
     *     schemas: [{
     *         name: 'product',
     *         schema: zodToJsonSchema(productSchema)
     *     }]
     * });
     */

    console.log('Manual conversion shown in Example 1.');
    console.log('For production, install: npm install zod-to-json-schema');
    console.log('Then use: zodToJsonSchema(yourZodSchema)');
}

/**
 * EXAMPLE 3: Multiple Zod Schemas (LogProcessor Pattern)
 * Question 7: Process logs with multiple Zod schemas
 */
function example3_LogProcessorPattern() {
    console.log('\n\n=== Example 3: LogProcessor with Multiple Zod Schemas ===\n');

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

    // Convert to JSON Schema (manual approach for demonstration)
    const schemas = [
        {
            name: 'errorLog',
            schema: {
                type: 'object',
                properties: {
                    level: { type: 'string', enum: ['error'] },
                    message: { type: 'string' },
                    timestamp: { type: 'string' },
                    stackTrace: { type: 'string' }
                },
                required: ['level', 'message', 'timestamp']
            }
        },
        {
            name: 'infoLog',
            schema: {
                type: 'object',
                properties: {
                    level: { type: 'string', enum: ['info'] },
                    message: { type: 'string' },
                    timestamp: { type: 'string' },
                    metadata: { type: 'object' }
                },
                required: ['level', 'message', 'timestamp']
            }
        }
    ];

    /**
     * LogProcessor Class Implementation
     */
    class LogProcessor {
        private llmJson: LlmJson;

        constructor(zodSchemas: { errorLog: z.ZodType; infoLog: z.ZodType }) {
            // In production, convert Zod schemas using zod-to-json-schema
            this.llmJson = new LlmJson({
                attemptCorrection: true,
                schemas: schemas
            });
        }

        process(logEntry: string): { errors: any[]; infos: any[] } {
            const result = this.llmJson.extract(logEntry);
            
            const errors: any[] = [];
            const infos: any[] = [];

            // Process validated results
            if (result.validatedJson) {
                result.validatedJson.forEach(validated => {
                    if (validated.isValid) {
                        if (validated.matchedSchema === 'errorLog') {
                            errors.push(validated.json);
                        } else if (validated.matchedSchema === 'infoLog') {
                            infos.push(validated.json);
                        }
                    }
                });
            }

            return { errors, infos };
        }
    }

    // Usage
    const processor = new LogProcessor({ errorLogSchema, infoLogSchema } as any);
    
    const logInput = `
        Here are some logs:
        {"level": "error", "message": "Database connection failed", "timestamp": "2024-01-15T10:30:00Z", "stackTrace": "Error at line 42"}
        {"level": "info", "message": "Server started", "timestamp": "2024-01-15T10:00:00Z"}
        {"level": "error", "message": "API timeout", "timestamp": "2024-01-15T10:35:00Z"}
    `;

    const { errors, infos } = processor.process(logInput);
    
    console.log('Errors:', JSON.stringify(errors, null, 2));
    console.log('\nInfos:', JSON.stringify(infos, null, 2));
}

/**
 * EXAMPLE 4: Complex Nested Zod Schema
 * Question 8: Nested playlist schema with track validation
 */
function example4_NestedPlaylistSchema() {
    console.log('\n\n=== Example 4: Nested Playlist Schema (Detecting Specific Validation Errors) ===\n');

    // Define nested Zod schema
    const trackSchema = z.object({
        id: z.string(),
        title: z.string(),
        artist: z.string(),
        duration: z.number().positive() // This will fail if missing
    });

    const playlistSchema = z.object({
        playlistId: z.string(),
        name: z.string(),
        tracks: z.array(trackSchema)
    });

    // Convert to JSON Schema
    const playlistJsonSchema = {
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
        schemas: [playlistJsonSchema]
    });

    // LLM output with one track missing the 'duration' field
    const llmOutput = `
    Here's your playlist:
    {
        "playlistId": "pl-001",
        "name": "My Favorites",
        "tracks": [
            {
                "id": "t1",
                "title": "Song One",
                "artist": "Artist A",
                "duration": 180
            },
            {
                "id": "t2",
                "title": "Song Two",
                "artist": "Artist B"
            },
            {
                "id": "t3",
                "title": "Song Three",
                "artist": "Artist C",
                "duration": 240
            }
        ]
    }
    `;

    const result = llmJson.extract(llmOutput);

    console.log('Extracted JSON:', JSON.stringify(result.json[0], null, 2));

    if (result.validatedJson && result.validatedJson.length > 0) {
        const validation = result.validatedJson[0];
        
        console.log('\nValidation Status:', validation.isValid);
        console.log('Matched Schema:', validation.matchedSchema);
        
        if (!validation.isValid && validation.validationErrors) {
            console.log('\n⚠️  Validation Errors Detected:');
            console.log(JSON.stringify(validation.validationErrors, null, 2));
            
            // Programmatically detect which track failed
            validation.validationErrors.forEach(error => {
                console.log('\nError Details:');
                console.log('- Instance Path:', error.instancePath);
                console.log('- Schema Path:', error.schemaPath);
                console.log('- Message:', error.message);
                
                // Parse the path to identify the problematic track
                // instancePath format: "/tracks/1/duration" means track at index 1
                const pathMatch = error.instancePath?.match(/\/tracks\/(\d+)/);
                if (pathMatch) {
                    const trackIndex = parseInt(pathMatch[1]);
                    console.log(`- 🎯 Failed Track Index: ${trackIndex}`);
                    console.log(`- 🎵 Track Data:`, JSON.stringify(result.json[0].tracks[trackIndex], null, 2));
                }
            });
            
            // Extract valid tracks despite validation failure
            console.log('\n✅ Retrieving Valid Tracks:');
            const playlist = result.json[0];
            const validTracks = playlist.tracks.filter((track: any, index: number) => {
                try {
                    trackSchema.parse(track);
                    return true;
                } catch {
                    console.log(`  - Track ${index} (${track.title}) is invalid - missing duration`);
                    return false;
                }
            });
            
            console.log('\nValid Tracks:', JSON.stringify(validTracks, null, 2));
            console.log(`\nTop-level playlist data: ID=${playlist.playlistId}, Name=${playlist.name}`);
        }
    }
}

/**
 * HELPER: Zod to JSON Schema Conversion Guide
 */
function zodToJsonSchemaGuide() {
    console.log('\n\n=== Zod to JSON Schema Conversion Reference ===\n');
    
    const examples = `
Common Zod to JSON Schema Conversions:

1. Basic Types:
   z.string()           → { type: 'string' }
   z.number()           → { type: 'number' }
   z.boolean()          → { type: 'boolean' }
   z.integer()          → { type: 'integer' }

2. Constraints:
   z.string().min(5)    → { type: 'string', minLength: 5 }
   z.number().min(0)    → { type: 'number', minimum: 0 }
   z.number().max(100)  → { type: 'number', maximum: 100 }
   z.array(z.string())  → { type: 'array', items: { type: 'string' } }

3. Objects:
   z.object({
     name: z.string(),
     age: z.number()
   })
   →
   {
     type: 'object',
     properties: {
       name: { type: 'string' },
       age: { type: 'number' }
     },
     required: ['name', 'age']
   }

4. Optional Fields:
   z.object({
     name: z.string(),
     email: z.string().optional()
   })
   →
   {
     type: 'object',
     properties: {
       name: { type: 'string' },
       email: { type: 'string' }
     },
     required: ['name']  // email is not required
   }

5. Enums:
   z.enum(['admin', 'user'])
   →
   { type: 'string', enum: ['admin', 'user'] }

6. RECOMMENDED APPROACH:
   Instead of manual conversion, use the library:
   
   npm install zod-to-json-schema
   
   import { zodToJsonSchema } from 'zod-to-json-schema';
   
   const myZodSchema = z.object({ ... });
   const jsonSchema = zodToJsonSchema(myZodSchema);
   
   const llmJson = new LlmJson({
     schemas: [{ name: 'mySchema', schema: jsonSchema }]
   });
`;
    
    console.log(examples);
}

// Run all examples
if (require.main === module) {
    example1_SimpleZodSchema();
    example2_WithZodToJsonSchema();
    example3_LogProcessorPattern();
    example4_NestedPlaylistSchema();
    zodToJsonSchemaGuide();
}

export {
    example1_SimpleZodSchema,
    example2_WithZodToJsonSchema,
    example3_LogProcessorPattern,
    example4_NestedPlaylistSchema,
    zodToJsonSchemaGuide
};
