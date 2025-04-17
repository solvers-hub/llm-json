import { SchemaDefinition, ValidationResult } from './types';
import Ajv from 'ajv';

/**
 * SchemaValidator class for validating JSON against schemas.
 */
export class SchemaValidator {
    private ajv: Ajv;

    /**
     * Creates a new instance of SchemaValidator.
     */
    constructor() {
        this.ajv = new Ajv({
            allErrors: true,
            verbose: true
        });
    }

    /**
     * Validates a JSON object against a set of schemas.
     * 
     * @param json - The JSON object to validate.
     * @param schemas - The schemas to validate against.
     * @returns A validation result with matched schema information.
     */
    public validate(json: any, schemas: SchemaDefinition[]): ValidationResult {
        if (!json || !schemas || schemas.length === 0) {
            return {
                json,
                matchedSchema: null,
                isValid: false
            };
        }

        // Try each schema until one matches
        for (const schemaObj of schemas) {
            const validate = this.ajv.compile(schemaObj.schema);
            const isValid = validate(json);

            if (isValid) {
                return {
                    json,
                    matchedSchema: schemaObj.name,
                    isValid: true
                };
            }
        }

        // If we reach here, none of the schemas matched
        // Return the validation errors from the first schema as a fallback
        const firstTry = this.ajv.compile(schemas[0].schema);
        firstTry(json);

        return {
            json,
            matchedSchema: null,
            isValid: false,
            validationErrors: firstTry.errors || []
        };
    }

    /**
     * Validates an array of JSON objects against a set of schemas.
     * 
     * @param jsonObjects - The JSON objects to validate.
     * @param schemas - The schemas to validate against.
     * @returns An array of validation results.
     */
    public validateAll(jsonObjects: any[], schemas: SchemaDefinition[]): ValidationResult[] {
        if (!jsonObjects || jsonObjects.length === 0 || !schemas || schemas.length === 0) {
            return [];
        }

        return jsonObjects.map(json => this.validate(json, schemas));
    }
} 