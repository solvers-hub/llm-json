import { JsonCorrector } from '../src/corrector';

describe('JsonCorrector', () => {
    test('should return valid JSON as is', () => {
        const validJson = '{"name": "John", "age": 30}';
        const result = JsonCorrector.correctJson(validJson);

        expect(result.corrected).toBe(validJson);
        expect(result.wasCorrected).toBe(false);
    });

    test('should fix unquoted keys', () => {
        const invalidJson = '{name: "John", age: 30}';
        const result = JsonCorrector.correctJson(invalidJson);

        expect(JSON.parse(result.corrected)).toEqual({ name: 'John', age: 30 });
        expect(result.wasCorrected).toBe(true);
    });

    test('should fix trailing commas', () => {
        const invalidJson = '{"items": [1, 2, 3,], "name": "Test",}';
        const result = JsonCorrector.correctJson(invalidJson);

        expect(JSON.parse(result.corrected)).toEqual({ items: [1, 2, 3], name: 'Test' });
        expect(result.wasCorrected).toBe(true);
    });

    test('should fix single quotes', () => {
        const invalidJson = "{'name': 'John', 'age': 30}";
        const result = JsonCorrector.correctJson(invalidJson);

        expect(JSON.parse(result.corrected)).toEqual({ name: 'John', age: 30 });
        expect(result.wasCorrected).toBe(true);
    });

    test('should fix missing braces', () => {
        const invalidJson = '{"name": "John", "nested": {"key": "value"';
        const result = JsonCorrector.correctJson(invalidJson);

        expect(JSON.parse(result.corrected)).toEqual({ name: 'John', nested: { key: 'value' } });
        expect(result.wasCorrected).toBe(true);
    });

    test('should fix multiple issues at once', () => {
        const invalidJson = "{name: 'John', items: [1, 2, 3,], }";
        const result = JsonCorrector.correctJson(invalidJson);

        expect(JSON.parse(result.corrected)).toEqual({ name: 'John', items: [1, 2, 3] });
        expect(result.wasCorrected).toBe(true);
    });

    test('should fix missing quotes around values', () => {
        const invalidJson = '{"name": John, "status": active}';
        const result = JsonCorrector.correctJson(invalidJson);

        expect(JSON.parse(result.corrected)).toEqual({ name: 'John', status: 'active' });
        expect(result.wasCorrected).toBe(true);
    });

    test('should handle complex nested structures', () => {
        const invalidJson = `{
      name: "Test",
      nested: {
        array: [1, 2, 3,],
        object: {key: value,}
      },
    }`;

        const result = JsonCorrector.correctJson(invalidJson);

        expect(result.wasCorrected).toBe(true);
        const parsed = JSON.parse(result.corrected);
        expect(parsed).toHaveProperty('name', 'Test');
        expect(parsed.nested.array).toEqual([1, 2, 3]);
        expect(parsed.nested.object).toHaveProperty('key');
    });
}); 