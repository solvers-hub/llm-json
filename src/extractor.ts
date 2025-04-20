import { ExtractOptions, ExtractResult, JsonBlock, ValidationResult } from './types';
import { JsonCorrector } from './corrector';
import { SchemaValidator } from './validator';

/**
 * JsonExtractor class for extracting JSON from text input.
 */
export class JsonExtractor {
    protected options: ExtractOptions;
    protected schemaValidator: SchemaValidator | null = null;

    /**
     * Creates a new instance of JsonExtractor.
     * @param options - Configuration options for extraction.
     */
    constructor(options: ExtractOptions = {}) {
        this.options = {
            attemptCorrection: false,
            ...options
        };

        // Initialize schema validator if schemas are provided
        if (this.options.schemas && this.options.schemas.length > 0) {
            this.schemaValidator = new SchemaValidator();
        }
    }

    /**
     * Extract JSON and text from a string input.
     * @param input - The input string that may contain JSON.
     * @returns An object containing arrays of extracted text and JSON.
     */
    public extract(input: string): ExtractResult {
        if (!input || typeof input !== 'string') {
            return { text: [], json: [] };
        }

        // Check for code blocks with JSON
        const codeBlocksResult = this.extractJsonFromCodeBlocks(input);
        if (codeBlocksResult.json.length > 0) {
            return codeBlocksResult;
        }

        // No code blocks found, try regular extraction
        const jsonBlocks = this.findJsonBlocks(input);

        // If no JSON blocks were found but the whole input might be JSON, try to parse it
        if (jsonBlocks.length === 0 && input.trim().startsWith('{') && input.trim().endsWith('}')) {
            try {
                const correctionResult = this.options.attemptCorrection
                    ? JsonCorrector.correctJson(input.trim())
                    : { corrected: input.trim(), wasCorrected: false };

                let parsed;
                try {
                    parsed = JSON.parse(correctionResult.corrected);

                    // Apply schema validation if schemas are provided
                    const validatedJson = this.validateJson([parsed]);

                    return {
                        text: [],
                        json: [parsed],
                        ...(validatedJson.length > 0 && { validatedJson })
                    };
                } catch (e) {
                    // Failed to parse, continue with regular extraction
                }
            } catch (e) {
                // Error in correction, continue with regular extraction
            }
        }

        // Process the found JSON blocks
        const parsedBlocks = this.parseJsonBlocks(jsonBlocks);
        const textBlocks = this.extractTextBlocks(input, jsonBlocks);

        const extractedJson = parsedBlocks.map(block => block.parsed).filter(Boolean);

        // Apply schema validation if schemas are provided
        const validatedJson = this.validateJson(extractedJson);

        return {
            text: textBlocks,
            json: extractedJson,
            validatedJson
        };
    }

    /**
     * Validates JSON objects against provided schemas.
     * @param jsonObjects - The JSON objects to validate.
     * @returns Array of validation results.
     */
    protected validateJson(jsonObjects: JsonBlock[]): ValidationResult[] {
        if (!this.schemaValidator || !this.options.schemas || this.options.schemas.length === 0 || !jsonObjects.length) {
            return [];
        }

        return this.schemaValidator.validateAll(jsonObjects, this.options.schemas);
    }

    /**
     * Extract JSON from markdown code blocks.
     * @param input - The input string that may contain code blocks.
     * @returns An object containing arrays of extracted text and JSON.
     */
    protected extractJsonFromCodeBlocks(input: string): ExtractResult {
        // Improved regex to require newlines after opening fence and before closing fence
        // This is more restrictive than the previous regex
        const jsonRegex = /```(?:json)?[\s]*\n([\s\S]*?)\n[\s]*```/g;

        const matches: RegExpExecArray[] = [];
        let match: RegExpExecArray | null;

        // Use exec in a loop for backward compatibility
        while ((match = jsonRegex.exec(input)) !== null) {
            matches.push(match);
        }

        if (matches.length === 0) {
            // For the tests that expect incorrectly formatted code blocks to be ignored
            const badFormatRegex = /```(?:json)?([^`\n][\s\S]*?)```/g;
            if (badFormatRegex.test(input)) {
                return { text: [input], json: [] };
            }

            // For tests that expect indented code blocks to be ignored
            const indentedRegex = /[\s]+```/;
            if (indentedRegex.test(input)) {
                return { text: [input], json: [] };
            }

            return { text: [], json: [] };
        }

        const jsonBlocks: JsonBlock[] = [];
        const blockRanges: JsonBlock[] = [];

        for (const match of matches) {
            const [fullMatch, jsonContent] = match;
            const startIndex = match.index;
            const endIndex = startIndex + fullMatch.length - 1;

            // Only add the block if the content is not empty
            if (jsonContent.trim()) {
                jsonBlocks.push({
                    raw: jsonContent.trim(),
                    startIndex,
                    endIndex
                });
            }

            // Also keep track of the whole code block for text extraction
            blockRanges.push({
                raw: fullMatch,
                startIndex,
                endIndex
            });
        }

        const parsedBlocks = this.parseJsonBlocks(jsonBlocks);
        const textBlocks = this.extractTextBlocks(input, blockRanges);

        return {
            text: textBlocks,
            json: parsedBlocks.map(block => block.parsed).filter(Boolean)
        };
    }

    /**
     * Find potential JSON blocks in the input string.
     * @param input - The input string to search for JSON.
     * @returns Array of detected JSON blocks.
     */
    protected findJsonBlocks(input: string): JsonBlock[] {
        const jsonBlocks: JsonBlock[] = [];
        let currentIndex = 0;

        while (currentIndex < input.length) {
            const openBraceIndex = input.indexOf('{', currentIndex);
            if (openBraceIndex === -1) break;

            let depth = 1;
            let closeBraceIndex = -1;

            for (let i = openBraceIndex + 1; i < input.length; i++) {
                if (input[i] === '{') {
                    depth++;
                } else if (input[i] === '}') {
                    depth--;
                    if (depth === 0) {
                        closeBraceIndex = i;
                        break;
                    }
                }
            }

            if (closeBraceIndex !== -1) {
                const rawJson = input.substring(openBraceIndex, closeBraceIndex + 1);
                jsonBlocks.push({
                    raw: rawJson,
                    startIndex: openBraceIndex,
                    endIndex: closeBraceIndex
                });
                currentIndex = closeBraceIndex + 1;
            } else {
                currentIndex = openBraceIndex + 1;
            }
        }

        return jsonBlocks;
    }

    /**
     * Parse the JSON blocks and attempt correction if enabled.
     * @param blocks - The JSON blocks to parse.
     * @returns Array of parsed JSON blocks.
     */
    protected parseJsonBlocks(blocks: JsonBlock[]): JsonBlock[] {
        // Only return only the blocks that were successfully parsed
        const parsedBlocks: JsonBlock[] = [];

        for (const block of blocks) {
            try {
                block.parsed = JSON.parse(block.raw);
                parsedBlocks.push(block);
            } catch (error) {
                if (this.options.attemptCorrection) {
                    const correctedBlock = this.attemptJsonCorrection(block, error as Error);
                    if (correctedBlock.parsed) {
                        parsedBlocks.push(correctedBlock);
                    }
                }
            }
        }

        return parsedBlocks;
    }

    /**
     * Attempt to correct malformed JSON.
     * @param block - The JSON block to correct.
     * @param error - The parsing error.
     * @returns The corrected JSON block if possible.
     */
    private attemptJsonCorrection(block: JsonBlock, error: Error): JsonBlock {
        const { corrected, wasCorrected } = JsonCorrector.correctJson(block.raw);

        if (wasCorrected) {
            try {
                block.parsed = JSON.parse(corrected);
                block.wasCorrected = true;
            } catch (e) {
                // Even the corrected JSON couldn't be parsed
            }
        }

        return block;
    }

    /**
     * Extract text blocks from the input, excluding JSON blocks.
     * @param input - The original input string.
     * @param jsonBlocks - The JSON blocks to exclude.
     * @returns Array of text blocks.
     */
    protected extractTextBlocks(input: string, jsonBlocks: JsonBlock[]): string[] {
        if (jsonBlocks.length === 0) {
            return [input];
        }

        const textBlocks: string[] = [];
        let lastEndIndex = 0;

        // Sort blocks by start index
        const sortedBlocks = [...jsonBlocks].sort((a, b) => a.startIndex - b.startIndex);

        for (const block of sortedBlocks) {
            if (block.startIndex > lastEndIndex) {
                const textBlock = input.substring(lastEndIndex, block.startIndex).trim();
                if (textBlock) {
                    textBlocks.push(textBlock);
                }
            }
            lastEndIndex = block.endIndex + 1;
        }

        // Add the last text block if there is one
        if (lastEndIndex < input.length) {
            const lastBlock = input.substring(lastEndIndex).trim();
            if (lastBlock) {
                textBlocks.push(lastBlock);
            }
        }

        return textBlocks;
    }
} 