/**
 * Options for JSON extraction.
 */
export interface ExtractOptions {
    /**
     * Whether to attempt to correct malformed JSON.
     * @default false
     */
    attemptCorrection?: boolean;
}

/**
 * Result of the JSON extraction.
 */
export interface ExtractResult {
    /**
     * Array of text blocks extracted from the input.
     */
    text: string[];

    /**
     * Array of parsed JSON objects extracted from the input.
     */
    json: any[];
}

/**
 * Information about a detected JSON block.
 */
export interface JsonBlock {
    /**
     * The raw JSON string.
     */
    raw: string;

    /**
     * The start index of the JSON block in the input string.
     */
    startIndex: number;

    /**
     * The end index of the JSON block in the input string.
     */
    endIndex: number;

    /**
     * Whether the JSON was corrected.
     */
    wasCorrected?: boolean;

    /**
     * The parsed JSON object.
     */
    parsed?: any;
}

/**
 * Error information for JSON parsing failures.
 */
export interface JsonParseError {
    /**
     * The original error message.
     */
    message: string;

    /**
     * The raw JSON string that failed to parse.
     */
    raw: string;

    /**
     * The position in the JSON string where the error occurred.
     */
    position?: number;
} 