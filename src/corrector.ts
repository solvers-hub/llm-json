import { JsonBlock, JsonParseError } from './types';

/**
 * JsonCorrector class for correcting malformed JSON from LLM outputs.
 */
export class JsonCorrector {
    /**
     * Try to correct malformed JSON using various correction strategies.
     * @param jsonString - The raw JSON string to correct.
     * @returns The corrected JSON string if successful, or the original string if unsuccessful.
     */
    public static correctJson(jsonString: string): { corrected: string; wasCorrected: boolean } {
        // First, try to remove comments if they exist
        const withoutComments = this.removeComments(jsonString);
        const wasCommentsRemoved = withoutComments !== jsonString;
        jsonString = withoutComments;

        try {
            // If it's already valid, just return it
            JSON.parse(jsonString);
            return { corrected: jsonString, wasCorrected: wasCommentsRemoved };
        } catch (error) {
            // Try different correction strategies
            const strategies = [
                this.fixUnquotedKeys,
                this.fixTrailingCommas,
                this.fixMissingQuotes,
                this.fixMissingBraces,
                this.fixSingleQuotes,
                this.fixExtraCommas
            ];

            for (const strategy of strategies) {
                const correctedJson = strategy(jsonString);
                try {
                    JSON.parse(correctedJson);
                    return { corrected: correctedJson, wasCorrected: true };
                } catch (e) {
                    // Try the next strategy
                }
            }

            // If all strategies failed, try a combination of them
            let attemptedCorrection = jsonString;
            let wasCorrected = wasCommentsRemoved;

            for (const strategy of strategies) {
                attemptedCorrection = strategy(attemptedCorrection);
                try {
                    JSON.parse(attemptedCorrection);
                    wasCorrected = true;
                    break;
                } catch (e) {
                    // Continue with the next strategy
                }
            }

            return {
                corrected: attemptedCorrection,
                wasCorrected
            };
        }
    }

    /**
     * Remove comments from JSON strings.
     * @param jsonString - The JSON string that may contain comments.
     * @returns The JSON string with comments removed.
     */
    private static removeComments(jsonString: string): string {
        // Remove single-line comments (// comment)
        let result = jsonString.replace(/\/\/.*$/gm, '');

        // Remove multi-line comments (/* comment */)
        result = result.replace(/\/\*[\s\S]*?\*\//g, '');

        return result;
    }

    /**
     * Fix unquoted property keys in JSON.
     * @param jsonString - The JSON string to fix.
     * @returns The corrected JSON string.
     */
    private static fixUnquotedKeys(jsonString: string): string {
        return jsonString.replace(/(\{|\,)\s*([a-zA-Z0-9_]+)\s*\:/g, '$1"$2":');
    }

    /**
     * Fix trailing commas in JSON.
     * @param jsonString - The JSON string to fix.
     * @returns The corrected JSON string.
     */
    private static fixTrailingCommas(jsonString: string): string {
        // Fix trailing commas in objects and arrays
        let result = jsonString.replace(/,\s*\}/g, '}');
        result = result.replace(/,\s*\]/g, ']');
        return result;
    }

    /**
     * Fix missing quotes around string values.
     * @param jsonString - The JSON string to fix.
     * @returns The corrected JSON string.
     */
    private static fixMissingQuotes(jsonString: string): string {
        // This is a simple heuristic and might not work for all cases
        return jsonString.replace(/:\s*([a-zA-Z][a-zA-Z0-9_\s]*[a-zA-Z0-9_])\s*(,|\})/g, ':"$1"$2');
    }

    /**
     * Fix missing closing braces and brackets.
     * @param jsonString - The JSON string to fix.
     * @returns The corrected JSON string.
     */
    private static fixMissingBraces(jsonString: string): string {
        let result = jsonString.trim();

        // Track correct nesting of braces
        let openBraces = 0;
        let closeBraces = 0;
        let openBrackets = 0;
        let closeBrackets = 0;

        // Process character by character for more precise tracking
        for (let i = 0; i < result.length; i++) {
            const char = result[i];
            if (char === '{') openBraces++;
            else if (char === '}') closeBraces++;
            else if (char === '[') openBrackets++;
            else if (char === ']') closeBrackets++;
        }

        // First handle any missing closing braces
        while (openBraces > closeBraces) {
            result += '}';
            closeBraces++;
        }

        // Then handle any missing closing brackets
        while (openBrackets > closeBrackets) {
            result += ']';
            closeBrackets++;
        }

        return result;
    }

    /**
     * Fix single quotes used instead of double quotes.
     * @param jsonString - The JSON string to fix.
     * @returns The corrected JSON string.
     */
    private static fixSingleQuotes(jsonString: string): string {
        // This is a simple approach that might not handle edge cases
        return jsonString.replace(/'/g, '"');
    }

    /**
     * Fix extra commas in JSON.
     * @param jsonString - The JSON string to fix.
     * @returns The corrected JSON string.
     */
    private static fixExtraCommas(jsonString: string): string {
        // Replace multiple commas with a single comma
        return jsonString.replace(/,\s*,+/g, ',');
    }
} 