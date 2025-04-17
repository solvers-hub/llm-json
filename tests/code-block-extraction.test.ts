import LlmJson from '../src/index';

describe('Code Block Extraction Edge Cases', () => {
    let llmJson: LlmJson;

    beforeEach(() => {
        llmJson = new LlmJson({ attemptCorrection: true });
    });

    test('should handle code blocks with language specifiers', () => {
        const input = [
            '```json',
            '{',
            '  "data": "value"',
            '}',
            '```'
        ].join('\n');

        const result = llmJson.extract(input);
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ data: 'value' });
    });

    test('should handle code blocks without language specifiers', () => {
        const input = [
            '```',
            '{',
            '  "data": "value"',
            '}',
            '```'
        ].join('\n');

        const result = llmJson.extract(input);
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ data: 'value' });
    });

    test('should handle incorrectly formatted code blocks', () => {
        // Missing newline after opening fence
        const input = '```json{  "data": "value"  }```';

        const result = llmJson.extract(input);
        // Should not recognize this as a code block due to missing newline
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ data: "value" });
    });

    test('should handle multiple code blocks in a single input', () => {
        const input = [
            'First block:',
            '```json',
            '{',
            '  "id": 1',
            '}',
            '```',
            'Second block:',
            '```json',
            '{',
            '  "id": 2',
            '}',
            '```'
        ].join('\n');

        const result = llmJson.extract(input);
        expect(result.json).toHaveLength(2);
        expect(result.json[0]).toEqual({ id: 1 });
        expect(result.json[1]).toEqual({ id: 2 });
    });

    test('should handle code blocks with indentation', () => {
        const input = [
            'Indented block:',
            '  ```json',
            '  {',
            '    "data": "indented"',
            '  }',
            '  ```'
        ].join('\n');

        const result = llmJson.extract(input);
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ data: "indented" });
    });

    test('should handle code blocks with correctable JSON', () => {
        const input = [
            '```json',
            '{',
            '  name: "Unquoted key",',
            '  values: [1, 2, 3,]',
            '}',
            '```'
        ].join('\n');

        const result = llmJson.extract(input);
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ name: 'Unquoted key', values: [1, 2, 3] });
    });

    test('should handle nested JSON with special characters in code blocks', () => {
        const input = [
            '```json',
            '{',
            '  "data": {',
            '    "text": "Special chars: \\\\, \\", \\n, \\t",',
            '    "regex": "^test\\\\w+$"',
            '  }',
            '}',
            '```'
        ].join('\n');

        const result = llmJson.extract(input);
        expect(result.json).toHaveLength(1);
        expect(result.json[0].data.text).toBe('Special chars: \\, ", \n, \t');
        expect(result.json[0].data.regex).toBe('^test\\w+$');
    });

    test('should handle code blocks with invalid JSON', () => {
        const input = [
            '```json',
            '{',
            '  "incomplete: true',
            '}',
            '```'
        ].join('\n');

        const result = llmJson.extract(input);
        // With correction enabled, it might try to fix this but likely will fail
        expect(result.json).toHaveLength(0);
    });

    test('should handle empty code blocks', () => {
        const input = '```json\n```';
        const result = llmJson.extract(input);
        expect(result.json).toHaveLength(0);
    });
}); 