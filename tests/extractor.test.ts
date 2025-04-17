import { JsonExtractor } from '../src/extractor';

describe('JsonExtractor', () => {
    let extractor: JsonExtractor;

    beforeEach(() => {
        extractor = new JsonExtractor({ attemptCorrection: true });
    });

    test('should extract JSON from a string', () => {
        const input = 'This is some text with a JSON object: {"name": "John", "age": 30}';
        const result = extractor.extract(input);

        expect(result.text).toHaveLength(1);
        expect(result.text[0]).toBe('This is some text with a JSON object:');
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ name: 'John', age: 30 });
    });

    test('should extract multiple JSON objects', () => {
        const input = 'First JSON: {"name": "John"} and second JSON: {"name": "Jane"}';
        const result = extractor.extract(input);

        expect(result.text).toHaveLength(2);
        expect(result.text[0]).toBe('First JSON:');
        expect(result.text[1]).toBe('and second JSON:');
        expect(result.json).toHaveLength(2);
        expect(result.json[0]).toEqual({ name: 'John' });
        expect(result.json[1]).toEqual({ name: 'Jane' });
    });

    test('should correct malformed JSON if correction is enabled', () => {
        const input = 'Malformed JSON: {name: "John", age: 30}';
        const result = extractor.extract(input);

        expect(result.text).toHaveLength(1);
        expect(result.text[0]).toBe('Malformed JSON:');
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ name: 'John', age: 30 });
    });

    test('should handle nested JSON objects', () => {
        const input = 'Nested JSON: {"person": {"name": "John", "address": {"city": "New York"}}}';
        const result = extractor.extract(input);

        expect(result.text).toHaveLength(1);
        expect(result.text[0]).toBe('Nested JSON:');
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({
            person: {
                name: 'John',
                address: { city: 'New York' }
            }
        });
    });

    test('should handle a complex example with text and JSON', () => {
        const input = `<research_planning>
a. Summary: The given organization is unnamed and works in the area of "something new," which suggests an innovative or emerging field.
b. Potential Product Features: 
   - Exploration of new technologies (VR/AR interfaces, IoT integration)
   - User onboarding and education tools 
</research_planning>

\`\`\`json
{
  "studyName": "Demo - Innovator Insight",
  "userPersona": "Tech-savvy early adopter exploring new innovations.",
  "objectives": [
    {
      "objectiveTitle": "Onboarding Process Evaluation",
      "objectiveDescription": "Assess the effectiveness of the user onboarding process."
    }
  ]
}
\`\`\``;

        const result = extractor.extract(input);

        expect(result.text).toHaveLength(1);
        expect(result.text[0]).toContain('<research_planning>');
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toHaveProperty('studyName', 'Demo - Innovator Insight');
    });

    test('should return empty arrays for invalid input', () => {
        expect(extractor.extract('')).toEqual({ text: [], json: [] });
        expect(extractor.extract(null as any)).toEqual({ text: [], json: [] });
        expect(extractor.extract(undefined as any)).toEqual({ text: [], json: [] });
    });

    test('should handle JSON with special characters', () => {
        const input = 'JSON with special chars: {"description": "This has \\"quotes\\" and \\n newlines"}';
        const result = extractor.extract(input);

        expect(result.json[0]).toEqual({ description: 'This has "quotes" and \n newlines' });
    });
}); 