import LlmJson from '../src/index';
import { JsonCorrector } from '../src/corrector';

describe('LLM-JSON Correction Examples', () => {
  let llmJson: LlmJson;

  beforeEach(() => {
    llmJson = new LlmJson({ attemptCorrection: true });
  });

  test('Correcting unquoted keys', () => {
    const input = `{
      name: "Product",
      price: 99.99,
      inStock: true
    }`;

    const result = llmJson.extract(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0]).toEqual({
      name: "Product",
      price: 99.99,
      inStock: true
    });
  });

  test('Correcting trailing commas', () => {
    const input = `{
      "items": [
        "apple",
        "banana",
        "orange",
      ],
      "config": {
        "active": true,
        "version": 1.0,
      }
    }`;

    const result = llmJson.extract(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0].items).toHaveLength(3);
    expect(result.json[0].config.version).toBe(1.0);
  });

  test('Correcting single quotes', () => {
    const input = `{
      'user': 'John Doe',
      'email': 'john@example.com',
      'roles': ['admin', 'editor']
    }`;

    const result = llmJson.extract(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0].user).toBe('John Doe');
    expect(result.json[0].roles).toHaveLength(2);
  });

  test('Correcting missing closing braces', () => {
    const input = `{
      "metadata": {
        "created": "2023-01-01",
        "author": "User"
    }`;

    const result = llmJson.extract(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0].created).toBe('2023-01-01');
    expect(result.json[0].author).toBe('User');
  });

  test('Correcting unquoted string values', () => {
    const input = `{
      "status": success,
      "mode": production,
      "code": 200
    }`;

    const result = llmJson.extract(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0].status).toBe('success');
    expect(result.json[0].mode).toBe('production');
    expect(result.json[0].code).toBe(200);
  });

  test('Handling multiple correction issues', () => {
    const input = `{
      name: 'Advanced Configuration',
      settings: {
        theme: dark,
        notifications: true,
        limits: [
          10,
          20,
          30,
        ],
      },
      lastUpdated: '2023-05-15',
    }`;

    const result = llmJson.extract(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0].name).toBe('Advanced Configuration');
    expect(result.json[0].settings.theme).toBe('dark');
    expect(result.json[0].settings.limits).toHaveLength(3);
    expect(result.json[0].lastUpdated).toBe('2023-05-15');
  });

  test('Real LLM Example: Malformed Configuration', () => {
    const input = `Here's a configuration you could use:

{
  apiSettings: {
    endpoint: "https://api.example.com/v2",
    timeout: 30000,
    retryCount: 3,
  },
  featureFlags: {
    enableNewUI: true,
    enableBetaFeatures: false,
    loggingLevel: verbose,
  },
  userPreferences: {
    theme: 'dark',
    fontSize: 14,
    language: 'en-US',
  }
}`;

    const result = llmJson.extract(input);

    expect(result.json).toHaveLength(0); // Because the JSON is malformed, it will not be extracted
  });

  test('Real LLM Example: Mixed Quote Styles', () => {
    const input = `The app configuration should be:

{
  "app": {
    'name': "Task Manager",
    'version': "2.1.0",
    'buildDate': '2023-09-15'
  },
  "database": {
    'connection': "postgres://user:password@localhost:5432/tasks",
    'poolSize': 10,
    'ssl': false
  }
}`;

    const result = llmJson.extract(input);

    expect(result.json).toHaveLength(0); // Because the JSON is malformed, it will not be extracted
  });

  test('Real LLM Example: Missing Quotes Around Keywords', () => {
    const input = `Set up your plugin with this configuration:

{
  "plugin": {
    "name": "Data Analyzer",
    "enabled": true,
    "priority": high,
    "mode": development
  },
  "permissions": [
    "read",
    "write",
    "execute"
  ],
  "dependencies": {
    "required": true,
    "packages": [
      "analytics",
      "reporter"
    ]
  }
}`;

    const result = llmJson.extract(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0].plugin.priority).toBe('high');
    expect(result.json[0].plugin.mode).toBe('development');
    expect(result.json[0].permissions).toHaveLength(3);
  });

  test('Direct correction using JsonCorrector', () => {
    const malformedJson = `{
          key: 'value',
          nested: {
            array: [1, 2, 3,],
            status: pending
          }
        }`;

    const result = JsonCorrector.correctJson(malformedJson);
    const parsed = JSON.parse(result.corrected);

    expect(parsed.key).toBe('value');
    expect(parsed.nested.array).toHaveLength(3);
    expect(parsed.nested.status).toBe('pending');
  });
}); 