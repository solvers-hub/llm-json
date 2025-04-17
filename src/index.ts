import { JsonExtractor } from './extractor';
import { JsonArrayExtractor } from './array-extractor';
import { ExtractOptions, ExtractResult } from './types';

/**
 * Main factory class for the LLM-JSON extractor SDK.
 */
export class LlmJson {
    private static instance: LlmJson;
    private objectExtractor: JsonExtractor;
    private arrayExtractor: JsonArrayExtractor;

    /**
     * Creates a new LlmJson instance with the specified options.
     * @param options - Configuration options for extraction.
     */
    constructor(options: ExtractOptions = {}) {
        this.objectExtractor = new JsonExtractor(options);
        this.arrayExtractor = new JsonArrayExtractor(options);
    }

    /**
     * Get or create a singleton instance of LlmJson.
     * @param options - Configuration options for extraction.
     * @returns The LlmJson singleton instance.
     */
    public static getInstance(options: ExtractOptions = {}): LlmJson {
        if (!LlmJson.instance) {
            LlmJson.instance = new LlmJson(options);
        }
        return LlmJson.instance;
    }

    /**
     * Extract JSON objects and text from a string input.
     * @param input - The input string that may contain JSON.
     * @returns An object containing arrays of extracted text and JSON.
     */
    public extract(input: string): ExtractResult {
        return this.objectExtractor.extract(input);
    }

    /**
     * Extract JSON objects, arrays, and text from a string input.
     * @param input - The input string that may contain JSON.
     * @returns An object containing arrays of extracted text and JSON.
     */
    public extractAll(input: string): ExtractResult {
        if (!input || typeof input !== 'string') {
            return { text: [], json: [] };
        }

        // First check if the input contains markdown code blocks
        const codeBlockRegex = /```(?:json)?\s*\n([\s\S]*?)\n\s*```/g;
        if (codeBlockRegex.test(input)) {
            // Reset regex state
            codeBlockRegex.lastIndex = 0;

            // Extract from code blocks first
            const codeBlockResult = this.objectExtractor.extract(input);
            if (codeBlockResult.json.length > 0) {
                // If we found JSON in code blocks, prioritize that
                return codeBlockResult;
            }
        }

        // If no code blocks with valid JSON were found, proceed with array extraction
        return this.arrayExtractor.extractArrays(input);
    }
}

// Export main class and types for convenience
export * from './types';
export default LlmJson; 