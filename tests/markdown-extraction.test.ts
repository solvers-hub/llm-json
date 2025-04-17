import LlmJson from '../src/index';

describe('LLM-JSON Markdown Extraction', () => {
    let llmJson: LlmJson;

    beforeEach(() => {
        llmJson = new LlmJson({ attemptCorrection: true });
    });

    test('should extract JSON from markdown code block with json tag', () => {
        const input = `Here's the JSON data you requested:

\`\`\`json
{
  "name": "Product",
  "price": 49.99,
  "available": true
}
\`\`\`

Let me know if you need anything else.`;

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({
            name: "Product",
            price: 49.99,
            available: true
        });
    });

    test('should extract JSON from markdown code block without language tag', () => {
        const input = `Here's the data:

\`\`\`
{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}
\`\`\``;

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0].users).toHaveLength(2);
        expect(result.json[0].users[0].name).toBe("Alice");
    });

    test('should extract multiple JSON objects from multiple markdown blocks', () => {
        const input = `First object:

\`\`\`json
{"type": "header", "text": "Welcome"}
\`\`\`

Second object:

\`\`\`json
{"type": "button", "text": "Click me"}
\`\`\``;

        const result = llmJson.extractAll(input);

        expect(result.json).toHaveLength(2);
        expect(result.json[0]).toEqual({ type: "header", text: "Welcome" });
        expect(result.json[1]).toEqual({ type: "button", text: "Click me" });
    });

    test('should extract JSON from markdown block mixed with other code blocks', () => {
        const input = `Here's a JavaScript snippet:

\`\`\`javascript
const x = 10;
console.log(x);
\`\`\`

And here's the JSON configuration:

\`\`\`json
{
  "server": "production",
  "port": 8080,
  "debug": false
}
\`\`\`

And here's some Python:

\`\`\`python
def hello():
    print("Hello, world!")
\`\`\``;

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({
            server: "production",
            port: 8080,
            debug: false
        });
    });

    test('Real LLM Example: API Response Documentation', () => {
        const input = `# API Response Format

The API returns a JSON object with the following structure:

\`\`\`json
{
  "status": "success",
  "data": {
    "id": "1234abcd",
    "createdAt": "2023-06-15T10:30:00Z",
    "attributes": {
      "name": "Example Item",
      "category": "test",
      "priority": 1
    },
    "metadata": {
      "version": "1.0",
      "source": "user"
    }
  },
  "pagination": {
    "totalItems": 1,
    "page": 1,
    "totalPages": 1
  }
}
\`\`\`

For error responses, the format is:

\`\`\`json
{
  "status": "error",
  "error": {
    "code": "NOT_FOUND",
    "message": "The requested resource was not found"
  }
}
\`\`\``;

        const result = llmJson.extractAll(input);

        expect(result.json).toHaveLength(2);
        expect(result.json[0]).toHaveProperty('status', 'success');
        expect(result.json[0].data).toHaveProperty('attributes');
        expect(result.json[1]).toHaveProperty('status', 'error');
        expect(result.json[1].error).toHaveProperty('code', 'NOT_FOUND');
    });

    test('Real LLM Example: Configuration with Comments', () => {
        const input = `I recommend the following configuration:

\`\`\`json
{
  // Main application settings
  "app": {
    "name": "Task Manager",
    "version": "2.0.0",
    "environment": "production"
  },
  // Database connection information
  "database": {
    "host": "localhost",
    "port": 5432,
    "name": "tasks_db",
    "maxConnections": 10
  },
  // Feature flags
  "features": {
    "enableNotifications": true,
    "enableExports": false,
    "enableBetaFeatures": false
  }
}
\`\`\`

Make sure to update the database host for your specific environment.`;

        const result = llmJson.extract(input);

        // The SDK should handle JSON with comments
        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toHaveProperty('app');
        expect(result.json[0].app).toHaveProperty('name', 'Task Manager');
        expect(result.json[0]).toHaveProperty('database');
        expect(result.json[0]).toHaveProperty('features');
    });

    test('Real LLM Example: Complex Markdown with JSON', () => {
        const input = `# System Architecture

## Components

The system consists of the following components:

- **Frontend**: React application
- **Backend**: Node.js API
- **Database**: PostgreSQL

## Configuration

### Frontend Configuration

\`\`\`json
{
  "build": {
    "outputPath": "dist",
    "sourceMaps": false,
    "optimization": true
  },
  "dependencies": {
    "react": "^18.0.0",
    "redux": "^4.2.0"
  }
}
\`\`\`

### Backend Configuration

\`\`\`json
{
  "server": {
    "port": 3000,
    "cors": {
      "origins": ["https://example.com"],
      "methods": ["GET", "POST"]
    }
  },
  "logging": {
    "level": "info",
    "format": "json"
  }
}
\`\`\``;

        const result = llmJson.extractAll(input);

        expect(result.json).toHaveLength(2);
        expect(result.json[0]).toHaveProperty('build');
        expect(result.json[0].build).toHaveProperty('outputPath', 'dist');
        expect(result.json[1]).toHaveProperty('server');
        expect(result.json[1].server.cors.origins).toHaveLength(1);
    });
}); 