import { JsonArrayExtractor } from '../src/array-extractor';

describe('JsonArrayExtractor', () => {
    let arrayExtractor: JsonArrayExtractor;

    beforeEach(() => {
        arrayExtractor = new JsonArrayExtractor({ attemptCorrection: true });
    });

    test('should extract standalone arrays', () => {
        const input = `
        Here is a list of items:
        [
            "apple",
            "banana",
            "cherry"
        ]
        `;

        const result = arrayExtractor.extractArrays(input);

        expect(result.text).toHaveLength(1);
        expect(result.text[0].trim()).toBe('Here is a list of items:');
        expect(result.json).toHaveLength(1);
        expect(Array.isArray(result.json[0])).toBe(true);
        expect(result.json[0]).toEqual(["apple", "banana", "cherry"]);
    });

    test('should extract arrays with objects', () => {
        const input = `
        Team members:
        [
            {
                "name": "John",
                "role": "Developer"
            },
            {
                "name": "Alice",
                "role": "Designer"
            }
        ]
        `;

        const result = arrayExtractor.extractArrays(input);

        expect(result.text).toHaveLength(1);
        expect(result.text[0].trim()).toBe('Team members:');
        expect(result.json).toHaveLength(1);
        expect(Array.isArray(result.json[0])).toBe(true);
        expect(result.json[0]).toHaveLength(2);
        expect(result.json[0][0].name).toBe('John');
        expect(result.json[0][1].role).toBe('Designer');
    });

    test('should not extract arrays inside objects', () => {
        const input = `
        User data:
        {
            "name": "John",
            "hobbies": ["reading", "hiking", "coding"]
        }
        `;

        const result = arrayExtractor.extractArrays(input);

        expect(result.text).toHaveLength(1);
        expect(result.json).toHaveLength(1);
        // Should extract the object, not the array inside it
        expect(Array.isArray(result.json[0])).toBe(false);
        expect(result.json[0].name).toBe('John');
        expect(Array.isArray(result.json[0].hobbies)).toBe(true);
    });

    test('should handle malformed arrays with correction enabled', () => {
        const input = `
        Favorite colors:
        [
            "red",
            "blue",
            "green",
        ]
        `;

        const result = arrayExtractor.extractArrays(input);

        expect(result.text).toHaveLength(1);
        expect(result.json).toHaveLength(1);
        expect(Array.isArray(result.json[0])).toBe(true);
        expect(result.json[0]).toEqual(["red", "blue", "green"]);
    });

    test('should ignore invalid arrays when correction is disabled', () => {
        // Create extractor with correction disabled
        const noCorrectExtractor = new JsonArrayExtractor({ attemptCorrection: false });

        const input = `
        Favorite colors:
        [
            "red",
            "blue",
            "green",
        ]
        `;

        const result = noCorrectExtractor.extractArrays(input);

        // With correction disabled, it should not extract the malformed array
        expect(result.text).toHaveLength(1);
        expect(result.json).toHaveLength(0);
    });

    test('should handle multiple arrays and objects', () => {
        const input = `
        Colors:
        [
            "red",
            "blue",
            "green"
        ]

        User:
        {
            "name": "John",
            "age": 30
        }

        Numbers:
        [1, 2, 3, 4, 5]
        `;

        const result = arrayExtractor.extractArrays(input);

        expect(result.text.length).toBeGreaterThanOrEqual(3);
        expect(result.json).toHaveLength(3);

        // Check the arrays and object
        const arrays = result.json.filter(item => Array.isArray(item));
        const objects = result.json.filter(item => !Array.isArray(item));

        expect(arrays).toHaveLength(2);
        expect(objects).toHaveLength(1);

        // Find the string array and number array
        const stringArray = arrays.find(arr => typeof arr[0] === 'string');
        const numberArray = arrays.find(arr => typeof arr[0] === 'number');

        expect(stringArray).toEqual(["red", "blue", "green"]);
        expect(numberArray).toEqual([1, 2, 3, 4, 5]);
        expect(objects[0]).toEqual({ name: "John", age: 30 });
    });

    test('should handle nested arrays', () => {
        const input = `
        Matrix:
        [
            [1, 2, 3],
            [4, 5, 6],
            [7, 8, 9]
        ]
        `;

        const result = arrayExtractor.extractArrays(input);

        expect(result.text).toHaveLength(1);
        expect(result.json).toHaveLength(1);
        expect(Array.isArray(result.json[0])).toBe(true);
        expect(result.json[0]).toHaveLength(3);
        expect(result.json[0][0]).toEqual([1, 2, 3]);
        expect(result.json[0][1]).toEqual([4, 5, 6]);
        expect(result.json[0][2]).toEqual([7, 8, 9]);
    });

    test('should handle empty or invalid input', () => {
        // Test with empty string
        expect(arrayExtractor.extractArrays('')).toEqual({ text: [], json: [] });

        // Test with null (should handle gracefully)
        expect(arrayExtractor.extractArrays(null as any)).toEqual({ text: [], json: [] });

        // Test with undefined (should handle gracefully)
        expect(arrayExtractor.extractArrays(undefined as any)).toEqual({ text: [], json: [] });

        // Test with non-string input (should handle gracefully)
        expect(arrayExtractor.extractArrays(123 as any)).toEqual({ text: [], json: [] });
    });
}); 