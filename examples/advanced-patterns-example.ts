import LlmJson from '../src/index';

/**
 * ADVANCED PATTERNS AND STRATEGIES
 * 
 * This file demonstrates advanced usage patterns including:
 * - Two-stage parsing for performance optimization
 * - Streaming/chunked input handling
 * - Error detection and recovery strategies
 */

/**
 * EXAMPLE 1: Two-Stage Parsing Strategy (Performance Optimization)
 * Question 10: Fast path vs fallback path with attemptCorrection
 * 
 * Use Case: High-throughput data pipeline processing millions of LLM responses
 * Goal: Balance speed (fast path) with reliability (fallback path)
 */
class TwoStageParser {
    private fastParser: LlmJson;
    private fallbackParser: LlmJson;
    private stats = {
        fastPathSuccess: 0,
        fallbackPathUsed: 0,
        totalFailures: 0
    };

    constructor() {
        // Stage 1: Fast path - no correction, minimal overhead
        this.fastParser = new LlmJson({
            attemptCorrection: false  // Fast: no correction overhead
        });

        // Stage 2: Fallback path - with correction for reliability
        this.fallbackParser = new LlmJson({
            attemptCorrection: true   // Slower but fixes malformed JSON
        });
    }

    /**
     * Two-stage parsing with intelligent fallback
     * 
     * Stage 1 (Fast Path):
     * - Try parsing without correction
     * - 90%+ of well-formed LLM outputs succeed here
     * - Minimal CPU overhead
     * 
     * Stage 2 (Fallback Path):
     * - Triggered when Stage 1 fails
     * - Uses correction to fix malformed JSON
     * - Higher CPU cost but recovers data
     */
    parse(llmOutput: string): { success: boolean; data: any[]; errors?: any[] } {
        // STAGE 1: FAST PATH
        const fastResult = this.fastParser.extract(llmOutput);
        
        // Determine if fast path succeeded
        const fastPathSucceeded = this.shouldUseFastPath(llmOutput, fastResult);
        
        if (fastPathSucceeded) {
            this.stats.fastPathSuccess++;
            return {
                success: true,
                data: fastResult.json
            };
        }

        // STAGE 2: FALLBACK PATH
        console.log('Fast path failed, trying fallback with correction...');
        this.stats.fallbackPathUsed++;
        
        const fallbackResult = this.fallbackParser.extract(llmOutput);
        
        if (fallbackResult.json.length > 0) {
            return {
                success: true,
                data: fallbackResult.json
            };
        }

        // Both stages failed
        this.stats.totalFailures++;
        return {
            success: false,
            data: [],
            errors: ['Both fast and fallback parsing failed']
        };
    }

    /**
     * CRITICAL LOGIC: When to trigger Stage 2
     * 
     * Trigger fallback (Stage 2) when:
     * 1. Input clearly contains JSON-like patterns but extraction failed
     * 2. Detected common malformation patterns
     * 3. Partial JSON detected but parsing failed
     * 
     * DO NOT trigger fallback when:
     * 1. Input genuinely contains no JSON (just text)
     * 2. Fast path successfully extracted JSON
     */
    private shouldUseFastPath(input: string, result: any): boolean {
        // Success case: JSON was extracted
        if (result.json.length > 0) {
            return true;
        }

        // Check if input contains JSON-like patterns
        const hasJsonPattern = this.detectJsonPattern(input);
        
        // If no JSON-like patterns detected, input genuinely has no JSON
        // Fast path succeeded (nothing to extract)
        if (!hasJsonPattern) {
            return true;
        }

        // Input has JSON-like patterns but extraction failed
        // Trigger fallback (return false)
        return false;
    }

    /**
     * Detect if input contains JSON-like patterns
     * This helps distinguish between:
     * - Input with no JSON (fast path success)
     * - Input with malformed JSON (needs fallback)
     */
    private detectJsonPattern(input: string): boolean {
        // Check for common JSON indicators
        const jsonIndicators = [
            /\{[^}]*:/,           // Object pattern: { "key":
            /\[[^\]]*\{/,         // Array of objects: [{ 
            /:\s*["{\[]/,         // Property with object/array/string value
            /```json/i,           // Markdown JSON code block
            /"[^"]+"\s*:\s*/,     // Quoted property name
        ];

        return jsonIndicators.some(pattern => pattern.test(input));
    }

    getStats() {
        return {
            ...this.stats,
            fastPathPercentage: (this.stats.fastPathSuccess / 
                (this.stats.fastPathSuccess + this.stats.fallbackPathUsed) * 100).toFixed(2) + '%'
        };
    }
}

/**
 * Example usage of two-stage parser
 */
function example1_TwoStageParsingDemo() {
    console.log('=== Example 1: Two-Stage Parsing Strategy ===\n');
    
    const parser = new TwoStageParser();
    
    // Test Case 1: Well-formed JSON (fast path succeeds)
    console.log('Test 1: Well-formed JSON');
    const test1 = parser.parse('{"name": "John", "age": 30}');
    console.log('Result:', test1);
    console.log();

    // Test Case 2: No JSON in input (fast path succeeds - nothing to extract)
    console.log('Test 2: No JSON in input');
    const test2 = parser.parse('This is just plain text without any JSON data');
    console.log('Result:', test2);
    console.log();

    // Test Case 3: Malformed JSON (fast path fails, fallback succeeds)
    console.log('Test 3: Malformed JSON (triggers fallback)');
    const test3 = parser.parse('Here is data: {name: "John", age: 30}'); // Missing quotes on keys
    console.log('Result:', test3);
    console.log();

    // Test Case 4: Multiple malformed objects
    console.log('Test 4: Multiple malformed objects');
    const test4 = parser.parse(`
        First object: {id: 1, value: "test"}
        Second object: {"id": 2, "value": "valid"}
        Third object: {id: 3 value: "broken"}
    `);
    console.log('Result:', test4);
    console.log();

    console.log('Performance Stats:', parser.getStats());
}

/**
 * EXAMPLE 2: Streaming/Chunked Input Handler
 * Question 9: Handle real-time streaming text from LLM
 * 
 * Challenge: LLM sends JSON in chunks, but .extract() needs complete strings
 * Solution: Buffer chunks and detect JSON boundaries before extraction
 */
class StreamingJsonHandler {
    private buffer: string = '';
    private extractedObjects: any[] = [];
    private llmJson: LlmJson;

    constructor() {
        this.llmJson = new LlmJson({ attemptCorrection: true });
    }

    /**
     * Process a chunk of streaming data
     * 
     * Strategy:
     * 1. Append chunk to buffer
     * 2. Detect complete JSON objects in buffer
     * 3. Extract complete objects
     * 4. Keep incomplete data in buffer
     */
    processChunk(chunk: string): { 
        extractedNow: any[]; 
        bufferStatus: string;
        totalExtracted: number;
    } {
        // Append chunk to buffer
        this.buffer += chunk;

        // Try to detect and extract complete JSON objects
        const { extracted, remaining } = this.extractCompleteJson(this.buffer);

        // Update buffer with remaining incomplete data
        this.buffer = remaining;

        // Store extracted objects
        this.extractedObjects.push(...extracted);

        return {
            extractedNow: extracted,
            bufferStatus: this.getBufferStatus(),
            totalExtracted: this.extractedObjects.length
        };
    }

    /**
     * CRITICAL: Detect complete JSON boundaries in stream
     * 
     * Challenges:
     * 1. Brace counting: Must match { and } pairs
     * 2. String handling: Braces inside strings don't count
     * 3. Nested objects: Track nesting depth
     * 4. Multiple objects: May have multiple complete objects
     */
    private extractCompleteJson(text: string): { extracted: any[]; remaining: string } {
        const extracted: any[] = [];
        let remaining = text;
        let lastExtractedEnd = 0;

        // Try to find complete JSON objects
        while (true) {
            const boundary = this.findNextCompleteJsonBoundary(remaining);
            
            if (boundary === null) {
                // No complete JSON found, keep in buffer
                break;
            }

            // Extract the complete JSON substring
            const jsonString = remaining.substring(0, boundary.end);
            
            try {
                // Use llm-json to parse the complete object
                const result = this.llmJson.extract(jsonString);
                if (result.json.length > 0) {
                    extracted.push(...result.json);
                    lastExtractedEnd = boundary.end;
                    remaining = remaining.substring(boundary.end);
                } else {
                    // No valid JSON found, might be text
                    break;
                }
            } catch (error) {
                // Failed to parse, stop trying
                break;
            }
        }

        return {
            extracted,
            remaining: lastExtractedEnd > 0 ? text.substring(lastExtractedEnd) : text
        };
    }

    /**
     * Find the boundary of the next complete JSON object
     * Returns the end index if found, null otherwise
     */
    private findNextCompleteJsonBoundary(text: string): { start: number; end: number } | null {
        // Find first opening brace
        const objectStart = text.indexOf('{');
        const arrayStart = text.indexOf('[');
        
        let start = -1;
        let openChar = '';
        let closeChar = '';
        
        if (objectStart !== -1 && (arrayStart === -1 || objectStart < arrayStart)) {
            start = objectStart;
            openChar = '{';
            closeChar = '}';
        } else if (arrayStart !== -1) {
            start = arrayStart;
            openChar = '[';
            closeChar = ']';
        } else {
            return null;
        }

        // Track brace depth
        let depth = 0;
        let inString = false;
        let escapeNext = false;

        for (let i = start; i < text.length; i++) {
            const char = text[i];

            // Handle string escaping
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
                if (char === openChar) {
                    depth++;
                } else if (char === closeChar) {
                    depth--;
                    
                    // Found complete JSON object
                    if (depth === 0) {
                        return { start, end: i + 1 };
                    }
                }
            }
        }

        // No complete object found
        return null;
    }

    /**
     * Get buffer status for debugging
     */
    private getBufferStatus(): string {
        if (this.buffer.length === 0) return 'empty';
        if (this.buffer.trim().length === 0) return 'whitespace';
        
        const hasOpenBrace = this.buffer.includes('{');
        const hasCloseBrace = this.buffer.includes('}');
        
        if (hasOpenBrace && !hasCloseBrace) return 'incomplete object';
        if (hasOpenBrace && hasCloseBrace) return 'potential complete object';
        
        return `buffering (${this.buffer.length} chars)`;
    }

    /**
     * Finalize stream - try to extract any remaining data
     */
    finalize(): any[] {
        if (this.buffer.trim().length > 0) {
            try {
                const result = this.llmJson.extract(this.buffer);
                this.extractedObjects.push(...result.json);
            } catch (error) {
                console.warn('Failed to parse remaining buffer:', this.buffer);
            }
        }
        return this.extractedObjects;
    }

    getExtracted(): any[] {
        return this.extractedObjects;
    }

    getBuffer(): string {
        return this.buffer;
    }
}

/**
 * Example usage of streaming handler
 */
function example2_StreamingJsonDemo() {
    console.log('\n\n=== Example 2: Streaming JSON Handler ===\n');
    
    const handler = new StreamingJsonHandler();
    
    // Simulate streaming chunks
    const chunks = [
        '{ "key": "val',      // Incomplete object start
        'ue1", "anoth',       // Middle of object
        'erKey": 123 }',      // Object complete
        ' Some text ',        // Text between objects
        '{"second": "obj',    // Second object starts
        'ect", "num": 456}'   // Second object complete
    ];

    console.log('Processing streaming chunks:\n');
    
    chunks.forEach((chunk, index) => {
        console.log(`Chunk ${index + 1}: "${chunk}"`);
        const result = handler.processChunk(chunk);
        console.log('  Extracted now:', result.extractedNow);
        console.log('  Buffer status:', result.bufferStatus);
        console.log('  Total extracted:', result.totalExtracted);
        console.log();
    });

    const final = handler.finalize();
    console.log('Final extracted objects:', JSON.stringify(final, null, 2));
}

/**
 * EXAMPLE 3: Detecting Parse Failures vs Empty Input
 * Question 10: How to distinguish between failure and genuinely no JSON
 */
function example3_DetectingParseFailures() {
    console.log('\n\n=== Example 3: Detecting Parse Failures vs Empty Input ===\n');
    
    const llmJson = new LlmJson({ attemptCorrection: false });
    
    // Test cases
    const testCases = [
        {
            name: 'Valid JSON',
            input: '{"name": "test"}',
            expected: 'success'
        },
        {
            name: 'No JSON (just text)',
            input: 'This is plain text without any JSON',
            expected: 'no_json'
        },
        {
            name: 'Malformed JSON',
            input: '{name: "test"}',  // Missing quotes on key
            expected: 'parse_failure'
        },
        {
            name: 'Incomplete JSON',
            input: '{"name": "test"',  // Missing closing brace
            expected: 'parse_failure'
        },
        {
            name: 'Empty string',
            input: '',
            expected: 'no_json'
        }
    ];

    testCases.forEach(test => {
        const result = llmJson.extract(test.input);
        const diagnosis = diagnoseResult(test.input, result);
        
        console.log(`\nTest: ${test.name}`);
        console.log(`Input: "${test.input}"`);
        console.log(`Expected: ${test.expected}`);
        console.log(`Diagnosed: ${diagnosis.status}`);
        console.log(`Reasoning: ${diagnosis.reason}`);
        console.log(`Match: ${diagnosis.status === test.expected ? '✅' : '❌'}`);
    });
}

/**
 * Diagnose extraction result to determine:
 * - Success: JSON was extracted
 * - No JSON: Input genuinely contains no JSON
 * - Parse Failure: Input has JSON-like content but parsing failed
 */
function diagnoseResult(input: string, result: any): { status: string; reason: string } {
    // Case 1: Extraction succeeded
    if (result.json.length > 0) {
        return {
            status: 'success',
            reason: `Successfully extracted ${result.json.length} JSON object(s)`
        };
    }

    // Case 2: No extraction, but does input contain JSON-like patterns?
    const jsonPatterns = [
        /\{[^}]*:/,           // Object pattern
        /\[[^\]]*\{/,         // Array with object
        /```json/i,           // Markdown code block
        /"[^"]+"\s*:\s*/,     // Quoted property
    ];

    const hasJsonLikeContent = jsonPatterns.some(pattern => pattern.test(input));

    if (!hasJsonLikeContent) {
        return {
            status: 'no_json',
            reason: 'Input contains no JSON-like patterns'
        };
    }

    // Case 3: Has JSON-like patterns but extraction failed
    return {
        status: 'parse_failure',
        reason: 'Input contains JSON-like patterns but extraction failed (likely malformed)'
    };
}

// Run all examples
if (require.main === module) {
    example1_TwoStageParsingDemo();
    example2_StreamingJsonDemo();
    example3_DetectingParseFailures();
}

export {
    TwoStageParser,
    StreamingJsonHandler,
    example1_TwoStageParsingDemo,
    example2_StreamingJsonDemo,
    example3_DetectingParseFailures,
    diagnoseResult
};
