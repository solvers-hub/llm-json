import { SchemaValidator } from '../src/validator';
import { SchemaDefinition } from '../src/types';

describe('SchemaValidator Coverage Tests', () => {
    let validator: SchemaValidator;

    beforeEach(() => {
        validator = new SchemaValidator();
    });

    test('validate handles null or undefined json', () => {
        const schemas: SchemaDefinition[] = [
            {
                name: 'person',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' }
                    }
                }
            }
        ];

        // Test with null json
        const result1 = validator.validate(null, schemas);
        expect(result1.isValid).toBe(false);
        expect(result1.matchedSchema).toBeNull();
        expect(result1.json).toBeNull();

        // Test with undefined json
        const result2 = validator.validate(undefined, schemas);
        expect(result2.isValid).toBe(false);
        expect(result2.matchedSchema).toBeNull();
        expect(result2.json).toBeUndefined();
    });

    test('validate handles empty or undefined schemas array', () => {
        const json = { name: 'John' };

        // Test with empty schemas array
        const result1 = validator.validate(json, []);
        expect(result1.isValid).toBe(false);
        expect(result1.matchedSchema).toBeNull();
        expect(result1.json).toEqual(json);

        // Test with undefined schemas
        const result2 = validator.validate(json, undefined as any);
        expect(result2.isValid).toBe(false);
        expect(result2.matchedSchema).toBeNull();
        expect(result2.json).toEqual(json);
    });

    test('validateAll handles empty input arrays', () => {
        const schemas: SchemaDefinition[] = [
            {
                name: 'person',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' }
                    }
                }
            }
        ];

        // Test with empty json array
        const result1 = validator.validateAll([], schemas);
        expect(result1).toEqual([]);

        // Test with null json array
        const result2 = validator.validateAll(null as any, schemas);
        expect(result2).toEqual([]);

        // Test with undefined json array
        const result3 = validator.validateAll(undefined as any, schemas);
        expect(result3).toEqual([]);
    });

    test('validateAll handles empty schemas array', () => {
        const jsonObjects = [{ name: 'John' }];

        // Test with empty schemas array
        const result1 = validator.validateAll(jsonObjects, []);
        expect(result1).toEqual([]);

        // Test with null schemas array
        const result2 = validator.validateAll(jsonObjects, null as any);
        expect(result2).toEqual([]);

        // Test with undefined schemas array
        const result3 = validator.validateAll(jsonObjects, undefined as any);
        expect(result3).toEqual([]);
    });
}); 