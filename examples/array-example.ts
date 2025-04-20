import LlmJson from '../src/index';

/**
 * Example demonstrating how to use the LLM-JSON library for arrays.
 */
function runArrayExample() {
    // Create an instance with auto-correction enabled
    const llmJson = new LlmJson({ attemptCorrection: true });

    // Simple array example
    const simpleArrayInput = `Here is a list of names: ["John", "Jane", "Bob"]`;

    console.log("=== Simple Array Example ===");

    // Using extract - might not properly handle standalone arrays
    const simpleExtractResult = llmJson.extract(simpleArrayInput);
    console.log("With extract():");
    console.log("Text:", simpleExtractResult.text);
    console.log("JSON:", JSON.stringify(simpleExtractResult.json, null, 2));
    console.log();

    // Using extractAll - properly handles arrays
    const simpleExtractAllResult = llmJson.extractAll(simpleArrayInput);
    console.log("With extractAll():");
    console.log("Text:", simpleExtractAllResult.text);
    console.log("JSON:", JSON.stringify(simpleExtractAllResult.json, null, 2));
    console.log();

    // Complex array example
    const complexArrayInput = `Here's an array of users:
  [
    {
      "name": "John Doe",
      "age": 30,
      "skills": ["JavaScript", "TypeScript"]
    },
    {
      "name": "Jane Smith",
      "age": 28,
      "skills": ["Python", "Machine Learning"]
    }
  ]`;

    console.log("=== Complex Array Example ===");

    // Using extractAll - properly handles complex arrays
    const complexResult = llmJson.extractAll(complexArrayInput);
    console.log("With extractAll():");
    console.log("Text:", complexResult.text);
    console.log("JSON:", JSON.stringify(complexResult.json, null, 2));
    console.log();

    // Multiple JSON structures example
    const mixedInput = `Here's an object: {"name": "John", "age": 30}
  
  And here's an array: [1, 2, 3, 4, 5]
  
  And another object: {"city": "New York", "country": "USA"}`;

    console.log("=== Mixed JSON Types Example ===");

    // Using extractAll - handles both objects and arrays
    const mixedResult = llmJson.extractAll(mixedInput);
    console.log("With extractAll():");
    console.log("Text:", mixedResult.text);
    console.log("JSON:", JSON.stringify(mixedResult.json, null, 2));
}

runArrayExample(); 