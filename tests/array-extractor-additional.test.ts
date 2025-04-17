import { JsonArrayExtractor } from '../src/array-extractor';

describe('JsonArrayExtractor Additional Coverage Tests', () => {
    let extractor: JsonArrayExtractor;

    beforeEach(() => {
        extractor = new JsonArrayExtractor({ attemptCorrection: true });
    });

    test('should handle deeply nested arrays', () => {
        const input = 'Deep nesting: [[[1, 2], [3, 4]], [[5, 6], [7, 8]]]';
        const result = extractor.extractArrays(input);
        expect(result.text.length).toBeGreaterThan(0);
        expect(result.json.length).toBeGreaterThan(0);

        // Check that we correctly parsed the nested array structure
        const foundArray = result.json.find(item => Array.isArray(item) && item.length === 2);
        expect(foundArray).toBeDefined();
        if (foundArray) {
            expect(Array.isArray(foundArray[0])).toBe(true);
            expect(Array.isArray(foundArray[1])).toBe(true);
        }
    });

    test('should handle arrays with no valid JSON content', () => {
        const input = 'Bad array: [not a valid array]';
        const result = extractor.extractArrays(input);
        expect(result.json).toHaveLength(0);
        expect(result.text.length).toBeGreaterThan(0);
    });

    test('should properly extract text around arrays', () => {
        const input = 'Text before [1, 2, 3] text between [4, 5, 6] text after';
        const result = extractor.extractArrays(input);
        expect(result.json.length).toBeGreaterThan(0);
        expect(result.text.length).toBeGreaterThan(0);

        // Check that text is properly extracted
        expect(result.text).toContain('Text before');
        expect(result.text).toContain('text between');
        expect(result.text).toContain('text after');
    });

    test('should handle objects with nested arrays', () => {
        const input = '{"name": "Test", "values": [1, 2, 3]}';
        const result = extractor.extractArrays(input);

        // Should only have one JSON object, not extract the nested array separately
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toHaveProperty('name', 'Test');
        expect(result.json[0]).toHaveProperty('values');
        expect(Array.isArray(result.json[0].values)).toBe(true);
    });

    test('should handle objects with multiple nested arrays', () => {
        const input = `{
            "data": {
                "series1": [1, 2, 3],
                "series2": [4, 5, 6]
            }
        }`;
        const result = extractor.extractArrays(input);

        // Should have only one JSON object
        expect(result.json).toHaveLength(1);

        // Both arrays should be nested under data
        expect(result.json[0]).toHaveProperty('data');
        expect(result.json[0].data).toHaveProperty('series1');
        expect(result.json[0].data).toHaveProperty('series2');

        // Both should be arrays
        expect(Array.isArray(result.json[0].data.series1)).toBe(true);
        expect(Array.isArray(result.json[0].data.series2)).toBe(true);
    });
}); 