import { JsonArrayExtractor } from '../src/array-extractor';

describe('JsonArrayExtractor Coverage Tests', () => {
    let extractor: JsonArrayExtractor;

    beforeEach(() => {
        extractor = new JsonArrayExtractor({ attemptCorrection: true });
    });

    test('should handle null input', () => {
        const result = extractor.extractArrays(null as any);
        expect(result.text).toHaveLength(0);
        expect(result.json).toHaveLength(0);
    });

    test('should handle undefined input', () => {
        const result = extractor.extractArrays(undefined as any);
        expect(result.text).toHaveLength(0);
        expect(result.json).toHaveLength(0);
    });

    test('should handle empty string input', () => {
        const result = extractor.extractArrays('');
        expect(result.text).toHaveLength(0);
        expect(result.json).toHaveLength(0);
    });

    test('should handle invalid array brackets', () => {
        const input = 'This [is not a valid array';
        const result = extractor.extractArrays(input);
        expect(result.text).toHaveLength(1);
        expect(result.text[0]).toBe('This [is not a valid array');
        expect(result.json).toHaveLength(0);
    });

    test('should extract nested arrays correctly', () => {
        const input = 'Nested arrays: [[1, 2], [3, 4]]';
        const result = extractor.extractArrays(input);
        expect(result.text).toHaveLength(1);
        expect(result.text[0]).toBe('Nested arrays:');
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual([[1, 2], [3, 4]]);
    });

    test('should handle complex mixed content', () => {
        const input = `Here's an object: {"name": "Test"} 
        And here's an array: [1, 2, 3, 4]
        And another array: ["a", "b", "c"]`;

        const result = extractor.extractArrays(input);
        expect(result.text.length).toBeGreaterThan(0);
        expect(result.json).toHaveLength(3);
        expect(result.json).toContainEqual({ name: 'Test' });
        expect(result.json).toContainEqual([1, 2, 3, 4]);
        expect(result.json).toContainEqual(['a', 'b', 'c']);
    });

    test('should handle arrays with correctable syntax errors', () => {
        const input = 'Array with errors: [1, 2, 3, ]';
        const result = extractor.extractArrays(input);
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual([1, 2, 3]);
    });

    test('should handle arrays with objects', () => {
        const input = `[
            {"id": 1, "name": "First"},
            {"id": 2, "name": "Second"},
            {"id": 3, "name": "Third"}
        ]`;
        const result = extractor.extractArrays(input);
        expect(result.json.length).toBeGreaterThan(0);

        // Check that we have the array with objects
        const firstJson = result.json.find(item => Array.isArray(item) && item.length === 3);
        expect(firstJson).toBeDefined();

        if (firstJson) {
            expect(firstJson[0].name).toBe('First');
            expect(firstJson[2].id).toBe(3);
        }
    });

    test('should handle arrays adjacent to text', () => {
        const input = 'Before[1,2,3]After';
        const result = extractor.extractArrays(input);
        expect(result.text).toHaveLength(2);
        expect(result.text[0]).toBe('Before');
        expect(result.text[1]).toBe('After');
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual([1, 2, 3]);
    });

    test('should find array with no closing bracket', () => {
        const input = 'Incomplete array: [1, 2, 3';
        // This should not throw an error but return an empty result
        const result = extractor.extractArrays(input);
        expect(result.text).toHaveLength(1);
        expect(result.json).toHaveLength(0);
    });
}); 