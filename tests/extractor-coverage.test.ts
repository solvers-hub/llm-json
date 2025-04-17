import { JsonExtractor } from '../src/extractor';
import { SchemaValidator } from '../src/validator';

// Mock the SchemaValidator to test specific branches
jest.mock('../src/validator', () => {
    return {
        SchemaValidator: jest.fn().mockImplementation(() => {
            return {
                validateAll: jest.fn().mockReturnValue([
                    { json: { test: true }, isValid: true, matchedSchema: 'test' }
                ])
            };
        })
    };
});

describe('JsonExtractor Coverage Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('extract handles malformed input that fails correction', () => {
        const extractor = new JsonExtractor({ attemptCorrection: true });
        const result = extractor.extract('{this is: not valid json and: cannot be fixed}');

        expect(result.json).toEqual([]);
        expect(result.text.length).toBe(0);
    });

    test('extract attempts to parse whole input as JSON even without braces', () => {
        const extractor = new JsonExtractor({ attemptCorrection: true });
        const result = extractor.extract('name: "John", age: 30');

        // This isn't JSON, so it should be treated as text
        expect(result.json).toEqual([]);
        expect(result.text.length).toBeGreaterThan(0);
    });

    test('extract handles JSON string that fails to parse even after correction', () => {
        const extractor = new JsonExtractor({ attemptCorrection: true });

        // This JSON-like string can't be parsed even after correction attempts
        const input = '{ "name": "John", "age": function() { return 30; } }';
        const result = extractor.extract(input);

        expect(result.json).toEqual([]);
        expect(result.text.length).toBe(0);
    });

    test('extract handles error during correction process', () => {
        const extractor = new JsonExtractor({ attemptCorrection: true });

        // Create a scenario where correction throws an error
        const badInput = '{ "array": [1, 2, '.repeat(1000); // Create very nested structure that will cause stack overflow
        const result = extractor.extract(badInput);

        expect(result.json).toEqual([]);
    });

    test('extract handles code blocks with invalid JSON content', () => {
        const extractor = new JsonExtractor({ attemptCorrection: true });

        // Code block with invalid JSON
        const input = '```json\n{"name": "John", age: function() {}}\n```';
        const result = extractor.extract(input);

        // Because the JSON in the code block is invalid, it should be treated as text
        expect(result.json).toEqual([]);
    });

    test('extractTextBlocks handles edge cases', () => {
        const extractor = new JsonExtractor();

        // Test with no JSON blocks
        const result1 = extractor.extract('No JSON here, just plain text');
        expect(result1.text).toEqual(['No JSON here, just plain text']);

        // Test with one JSON block at the very beginning
        const result2 = extractor.extract('{"first": true} followed by text');
        expect(result2.text).toEqual(['followed by text']);

        // Test with one JSON block at the very end
        const result3 = extractor.extract('Text followed by {"last": true}');
        expect(result3.text).toEqual(['Text followed by']);

        // Test with multiple adjacent JSON blocks
        const result4 = extractor.extract('{"block1": true}{"block2": true}');

        expect(result4.json.length).toBe(2);
        expect(result4.text).toEqual([]);
    });

    test('validateJson returns empty array when conditions are not met', () => {
        // Create an extractor without schemas
        const extractor = new JsonExtractor();

        // Use the protected method via a new class that exposes it
        class TestExtractor extends JsonExtractor {
            public testValidateJson(jsonObjects: any[]) {
                return this.validateJson(jsonObjects);
            }
        }

        const testExtractor = new TestExtractor();
        expect(testExtractor.testValidateJson([{ test: true }])).toEqual([]);

        // Create an extractor with schemas but no validator
        const extractor2 = new JsonExtractor({ schemas: [{ name: 'test', schema: {} }] });
        const testExtractor2 = new TestExtractor({ schemas: [{ name: 'test', schema: {} }] });

        // Replace the schemaValidator with null to test that branch
        (testExtractor2 as any).schemaValidator = null;
        expect(testExtractor2.testValidateJson([{ test: true }])).toEqual([]);

        // Test with empty json array
        const testExtractor3 = new TestExtractor({
            schemas: [{ name: 'test', schema: {} }]
        });
        expect(testExtractor3.testValidateJson([])).toEqual([]);
    });
}); 