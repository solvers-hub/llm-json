/**
 * Options for JSON extraction.
 */
export interface ExtractOptions {
    /**
     * Whether to attempt to correct malformed JSON.
     * @default false
     */
    attemptCorrection?: boolean;

    /**
     * JSON schemas to validate extracted JSON against.
     * If provided, the extracted JSON will be validated against these schemas.
     * @default undefined
     */
    schemas?: SchemaDefinition[];
}

/**
 * Definition of a JSON schema for validation.
 */
export interface SchemaDefinition {
    /**
     * A unique name for the schema to identify which schema matched.
     */
    name: string;

    /**
     * The JSON schema object conforming to JSON Schema specification.
     */
    schema: object;
}

/**
 * Result of schema validation for a JSON object.
 */
export interface ValidationResult {
    /**
     * The JSON object that was validated.
     */
    json: any;

    /**
     * The name of the schema that matched, or null if no schema matched.
     */
    matchedSchema: string | null;

    /**
     * Whether the JSON is valid according to the matched schema.
     */
    isValid: boolean;

    /**
     * Validation errors if any, or undefined if validation passed.
     */
    validationErrors?: any[];
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

    /**
     * Array of validated JSON results, only present if schemas were provided.
     */
    validatedJson?: ValidationResult[];
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