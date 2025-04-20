import LlmJson from '../src/index';

describe('Schema Validation Tests', () => {
    test('should validate JSON against matching schema', () => {
        const schemas = [
            {
                name: 'person',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'integer' }
                    },
                    required: ['name', 'age']
                }
            }
        ];

        const llmJson = new LlmJson({ attemptCorrection: true, schemas });
        const input = 'Here is a person: {"name": "John", "age": 30}';
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.validatedJson).toHaveLength(1);
        expect(result.validatedJson![0].isValid).toBe(true);
        expect(result.validatedJson![0].matchedSchema).toBe('person');
    });

    test('should report when JSON does not match any schema', () => {
        const schemas = [
            {
                name: 'person',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'integer' }
                    },
                    required: ['name', 'age']
                }
            }
        ];

        const llmJson = new LlmJson({ attemptCorrection: true, schemas });
        const input = 'Here is a location: {"city": "New York", "country": "USA"}';
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.validatedJson).toHaveLength(1);
        expect(result.validatedJson![0].isValid).toBe(false);
        expect(result.validatedJson![0].matchedSchema).toBeNull();
        expect(result.validatedJson![0].validationErrors).toBeDefined();
        expect(result.validatedJson![0].validationErrors!.length).toBeGreaterThan(0);
    });

    test('should validate multiple JSON objects against multiple schemas', () => {
        const schemas = [
            {
                name: 'person',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'integer' }
                    },
                    required: ['name', 'age']
                }
            },
            {
                name: 'location',
                schema: {
                    type: 'object',
                    properties: {
                        city: { type: 'string' },
                        country: { type: 'string' }
                    },
                    required: ['city', 'country']
                }
            }
        ];

        const llmJson = new LlmJson({ attemptCorrection: true, schemas });
        const input = `
            Here is a person: {"name": "John", "age": 30}
            And a location: {"city": "New York", "country": "USA"}
            And something else: {"title": "Test", "value": 123}
        `;
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(3);
        expect(result.validatedJson).toHaveLength(3);

        // First should match person schema
        expect(result.validatedJson![0].isValid).toBe(true);
        expect(result.validatedJson![0].matchedSchema).toBe('person');

        // Second should match location schema
        expect(result.validatedJson![1].isValid).toBe(true);
        expect(result.validatedJson![1].matchedSchema).toBe('location');

        // Third shouldn't match any schema
        expect(result.validatedJson![2].isValid).toBe(false);
        expect(result.validatedJson![2].matchedSchema).toBeNull();
    });

    test('should not include validatedJson if no schemas are provided', () => {
        const llmJson = new LlmJson({ attemptCorrection: true });
        const input = 'Here is a person: {"name": "John", "age": 30}';
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.validatedJson).toHaveLength(0);
    });

    test('should validate JSON after correction', () => {
        const schemas = [
            {
                name: 'person',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'integer' }
                    },
                    required: ['name', 'age']
                }
            }
        ];

        const llmJson = new LlmJson({ attemptCorrection: true, schemas });
        const input = 'Here is a person with errors: {name: "John", age: 30}';
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.validatedJson).toHaveLength(1);
        expect(result.validatedJson![0].isValid).toBe(true);
        expect(result.validatedJson![0].matchedSchema).toBe('person');
    });

    test('should maintain same index between json and validatedJson arrays', () => {
        const schemas = [
            {
                name: 'person',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        age: { type: 'integer' }
                    },
                    required: ['name', 'age']
                }
            },
            {
                name: 'product',
                schema: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        price: { type: 'number' }
                    },
                    required: ['id', 'price']
                }
            }
        ];

        const llmJson = new LlmJson({ attemptCorrection: true, schemas });
        const input = `
            Valid person: {"name": "Alice", "age": 25}
            Invalid person: {"name": "Bob"}
            Valid product: {"id": "prod-123", "price": 99.99}
            Invalid product: {"id": "prod-456"}
        `;
        const result = llmJson.extract(input);

        // Check that arrays have same length
        expect(result.json.length).toBe(result.validatedJson!.length);

        // Check that each item in validatedJson corresponds to same item in json
        for (let i = 0; i < result.json.length; i++) {
            expect(JSON.stringify(result.validatedJson![i].json)).toBe(JSON.stringify(result.json[i]));
        }

        // Check specific validation results
        expect(result.validatedJson![0].isValid).toBe(true);
        expect(result.validatedJson![0].matchedSchema).toBe('person');

        expect(result.validatedJson![1].isValid).toBe(false);
        expect(result.validatedJson![1].matchedSchema).toBeNull();

        expect(result.validatedJson![2].isValid).toBe(true);
        expect(result.validatedJson![2].matchedSchema).toBe('product');

        expect(result.validatedJson![3].isValid).toBe(false);
        expect(result.validatedJson![3].matchedSchema).toBeNull();
    });

    test('should handle complex nested schema validation', () => {
        const schemas = [
            {
                name: 'nestedSchema',
                schema: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        details: {
                            type: 'object',
                            properties: {
                                age: { type: 'integer' },
                                address: {
                                    type: 'object',
                                    properties: {
                                        street: { type: 'string' },
                                        city: { type: 'string' }
                                    },
                                    required: ['street', 'city']
                                }
                            },
                            required: ['address']
                        }
                    },
                    required: ['name', 'details']
                }
            }
        ];

        const llmJson = new LlmJson({ attemptCorrection: true, schemas });
        const input = `
            Valid nested: {
                "name": "John",
                "details": {
                    "age": 30,
                    "address": {
                        "street": "123 Main St",
                        "city": "New York"
                    }
                }
            }
            Invalid nested (missing city): {
                "name": "Jane",
                "details": {
                    "age": 25,
                    "address": {
                        "street": "456 Elm St"
                    }
                }
            }
        `;
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(2);
        expect(result.validatedJson).toHaveLength(2);

        // First object should be valid
        expect(result.validatedJson![0].isValid).toBe(true);
        expect(result.validatedJson![0].matchedSchema).toBe('nestedSchema');

        // Second object should be invalid
        expect(result.validatedJson![1].isValid).toBe(false);
        expect(result.validatedJson![1].matchedSchema).toBeNull();
        expect(result.validatedJson![1].validationErrors).toBeDefined();
    });

    test('should validate JSON arrays against schema', () => {
        const schemas = [
            {
                name: 'personArray',
                schema: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            name: { type: 'string' },
                            age: { type: 'integer' }
                        },
                        required: ['name', 'age']
                    }
                }
            }
        ];

        const llmJson = new LlmJson({ attemptCorrection: true, schemas });
        const input = `Here's an array of people: [
            {"name": "John", "age": 30},
            {"name": "Jane", "age": 25}
        ]`;
        const result = llmJson.extractAll(input);

        expect(result.json).toHaveLength(1);
        expect(result.validatedJson).toHaveLength(1);
        expect(result.validatedJson![0].isValid).toBe(true);
        expect(result.validatedJson![0].matchedSchema).toBe('personArray');
    });
}); 