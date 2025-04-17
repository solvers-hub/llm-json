import { ExtractOptions, ExtractResult, JsonBlock } from './types';
import { JsonExtractor } from './extractor';
import { JsonCorrector } from './corrector';

/**
 * Specialized extractor for handling JSON arrays in text.
 */
export class JsonArrayExtractor extends JsonExtractor {
    /**
     * Creates a new instance of JsonArrayExtractor.
     * @param options - Configuration options for extraction.
     */
    constructor(options: ExtractOptions = {}) {
        super(options);
    }

    /**
     * Find potential JSON array blocks in the input string.
     * @param input - The input string to search for JSON arrays.
     * @returns Array of detected JSON blocks containing arrays.
     */
    protected findJsonArrayBlocks(input: string): JsonBlock[] {
        const jsonBlocks: JsonBlock[] = [];
        let currentIndex = 0;

        while (currentIndex < input.length) {
            const openBracketIndex = input.indexOf('[', currentIndex);
            if (openBracketIndex === -1) break;

            let depth = 1;
            let closeBracketIndex = -1;

            for (let i = openBracketIndex + 1; i < input.length; i++) {
                if (input[i] === '[') {
                    depth++;
                } else if (input[i] === ']') {
                    depth--;
                    if (depth === 0) {
                        closeBracketIndex = i;
                        break;
                    }
                }
            }

            if (closeBracketIndex !== -1) {
                const rawJson = input.substring(openBracketIndex, closeBracketIndex + 1);
                jsonBlocks.push({
                    raw: rawJson,
                    startIndex: openBracketIndex,
                    endIndex: closeBracketIndex
                });
                currentIndex = closeBracketIndex + 1;
            } else {
                currentIndex = openBracketIndex + 1;
            }
        }

        return jsonBlocks;
    }

    /**
     * Determines if a potential array block is inside a JSON object.
     * @param arrayBlock - The array block to check.
     * @param objectBlocks - Array of object blocks to check against.
     * @returns True if the array is inside an object, false otherwise.
     */
    private isArrayInsideObject(arrayBlock: JsonBlock, objectBlocks: JsonBlock[]): boolean {
        // Check if array is inside any object block's range
        for (const objBlock of objectBlocks) {
            if (arrayBlock.startIndex > objBlock.startIndex &&
                arrayBlock.endIndex < objBlock.endIndex) {
                return true;
            }
        }

        // Check if the array appears after a property name
        const MIN_CONTEXT_LENGTH = 50; // Check up to 50 chars before array
        const startPos = Math.max(0, arrayBlock.startIndex - MIN_CONTEXT_LENGTH);
        const context = arrayBlock.raw.substring(startPos, arrayBlock.startIndex);

        // Look for patterns like "property": [ or "property":[ which indicate array is part of an object
        const propertyPattern = /"[^"]+"\s*:\s*$/;
        return propertyPattern.test(context);
    }

    /**
     * Clean up text blocks to match the expected format.
     * @param blocks - The text blocks to clean.
     * @returns Cleaned text blocks.
     */
    private cleanTextBlocks(blocks: string[]): string[] {
        if (!blocks || blocks.length === 0) return [];

        // Filter out empty blocks and those just containing punctuation or brackets
        const cleanedBlocks = blocks.filter(block => {
            const trimmed = block.trim();
            // Filter out blocks that are empty or just contain punctuation, brackets, or braces
            return trimmed && !/^[,.:;'"!?\[\]{}]*$/.test(trimmed);
        });

        return cleanedBlocks;
    }

    /**
     * Extract JSON arrays and text from a string input.
     * @param input - The input string that may contain JSON arrays.
     * @returns An object containing arrays of extracted text and JSON.
     */
    public extractArrays(input: string): ExtractResult {
        if (!input || typeof input !== 'string') {
            return { text: [], json: [] };
        }

        // First, get all JSON objects using standard extraction
        const objectExtraction = super.extract(input);
        const objectsResult = [...objectExtraction.json];

        // Then find all top-level array blocks
        const arrayBlocks = this.findJsonArrayBlocks(input);
        const objectBlocks = this.findJsonBlocks(input);

        // Only include standalone arrays (not part of objects)
        const standaloneArrays: any[] = [];

        // Track individual objects that come from arrays to exclude them later
        const objectsFromArrays = new Set<string>();

        // Process array blocks
        for (const arrayBlock of arrayBlocks) {
            // Skip arrays contained within objects
            if (this.isArrayInsideObject(arrayBlock, objectBlocks)) {
                continue;
            }

            try {
                // Try to parse the array
                let parsedArray;
                if (this.options.attemptCorrection) {
                    const { corrected } = JsonCorrector.correctJson(arrayBlock.raw);
                    parsedArray = JSON.parse(corrected);
                } else {
                    parsedArray = JSON.parse(arrayBlock.raw);
                }

                // Only process valid arrays
                if (Array.isArray(parsedArray)) {
                    // Add the standalone array
                    standaloneArrays.push(parsedArray);

                    // Track individual objects from this array to avoid duplication
                    for (const item of parsedArray) {
                        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                            objectsFromArrays.add(JSON.stringify(item));
                        }
                    }
                }
            } catch (error) {
                // Skip invalid JSON
                continue;
            }
        }

        // Filter out any individual objects that are actually elements of arrays
        const filteredObjects = objectsResult.filter(obj => {
            // Keep non-object items
            if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
                return true;
            }

            // Skip objects that are elements of standalone arrays
            return !objectsFromArrays.has(JSON.stringify(obj));
        });

        // Extract text blocks
        // We need to get text blocks that occur before JSON blocks
        const visibleJsonBlocks = [...objectBlocks];
        const standaloneArrayBlocks = arrayBlocks.filter(
            arrayBlock => !this.isArrayInsideObject(arrayBlock, objectBlocks)
        );
        visibleJsonBlocks.push(...standaloneArrayBlocks);

        // Sort blocks by start index for proper text extraction
        visibleJsonBlocks.sort((a, b) => a.startIndex - b.startIndex);

        // Extract text blocks and clean them up
        const rawTextBlocks = this.extractTextBlocks(input, visibleJsonBlocks);
        const cleanedTextBlocks = this.cleanTextBlocks(rawTextBlocks);

        return {
            text: cleanedTextBlocks,
            json: [...filteredObjects, ...standaloneArrays]
        };
    }
} 