import LlmJson from '../src/index';

/**
 * Example demonstrating how to use schema validation with the LLM-JSON library.
 */
function runSchemaValidationExample() {
    console.log('Schema Validation Example');
    console.log('=========================\n');

    // Define some schemas for validation
    const schemas = [
        {
            name: 'person',
            schema: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                    age: { type: 'integer' },
                    email: { type: 'string' }
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
                    name: { type: 'string' },
                    price: { type: 'number' }
                },
                required: ['id', 'name', 'price']
            }
        }
    ];

    // Create an instance with auto-correction and schemas
    const llmJson = new LlmJson({
        attemptCorrection: true,
        schemas
    });

    // Example 1: Valid JSON matching a schema
    console.log('Example 1: Valid JSON matching a schema');
    console.log('----------------------------------------');

    const input1 = `Here's some customer information:
  
  {
    "name": "John Doe",
    "age": 32,
    "email": "john.doe@example.com"
  }
  
  Please process this customer data.`;

    const result1 = llmJson.extract(input1);

    console.log('Extracted JSON:');
    console.log(JSON.stringify(result1.json, null, 2));
    console.log('\nValidation Results:');
    console.log(JSON.stringify(result1.validatedJson, null, 2));
    console.log('\n');

    // Example 2: Valid JSON but doesn't match any schema
    console.log('Example 2: Valid JSON but doesn\'t match any schema');
    console.log('--------------------------------------------------');

    const input2 = `Here's some location data:
  
  {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "city": "San Francisco"
  }`;

    const result2 = llmJson.extract(input2);

    console.log('Extracted JSON:');
    console.log(JSON.stringify(result2.json, null, 2));
    console.log('\nValidation Results:');
    console.log(JSON.stringify(result2.validatedJson, null, 2));
    console.log('\n');

    // Example 3: Multiple JSON objects with some matching schemas
    console.log('Example 3: Multiple JSON objects with some matching schemas');
    console.log('--------------------------------------------------------');

    const input3 = `Here are two different objects:
  
  First, a person:
  {
    "name": "Jane Smith",
    "age": 28
  }
  
  And a product:
  {
    "id": "prod-123",
    "name": "Laptop",
    "price": 999.99
  }
  
  And something that doesn't match our schemas:
  {
    "title": "Meeting Notes",
    "date": "2023-05-15"
  }`;

    const result3 = llmJson.extract(input3);

    console.log('Extracted JSON:');
    console.log(JSON.stringify(result3.json, null, 2));
    console.log('\nValidation Results:');
    console.log(JSON.stringify(result3.validatedJson, null, 2));
    console.log('\n');

    // Example 4: Malformed JSON that gets corrected and validated
    console.log('Example 4: Malformed JSON that gets corrected and validated');
    console.log('----------------------------------------------------------');

    const input4 = `This JSON has errors but should be fixed:
  
  {
    name: "Alex Johnson",
    age: 42,
    email: "alex@example.com"
  }`;

    const result4 = llmJson.extract(input4);

    console.log('Extracted JSON:');
    console.log(JSON.stringify(result4.json, null, 2));
    console.log('\nValidation Results:');
    console.log(JSON.stringify(result4.validatedJson, null, 2));
}

// Run the example
runSchemaValidationExample(); 