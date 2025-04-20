import LlmJson from '../src/index';

/**
 * Comprehensive examples of schema validation with LLM-JSON
 */
function runSchemaValidationExamples() {
    // Example 1: Basic schema with required and optional fields
    
    const input1 = `Here's a user profile:
    {
        "name": "John Doe",
        "age": 30,
        "email": "john@example.com",
        "location": "New York"
    }`;

    const userSchema = {
        name: 'user',
        schema: {
            type: 'object',
            required: ['name', 'email'],  // These fields must be present
            properties: {
                name: { type: 'string' },
                email: { type: 'string', format: 'email' },
                age: { type: 'number' },  // Optional field
                location: { type: 'string' }  // Optional field
            }
        }
    };

    // Example 2: Complex schema with nested objects and arrays

    const input2 = `Here's a product catalog:
    {
        "product": {
            "id": "123",
            "name": "Smartphone",
            "price": 599.99,
            "specifications": {
                "brand": "TechCo",
                "model": "X100",
                "features": ["5G", "Wireless Charging", "Dual Camera"]
            },
            "inventory": {
                "inStock": true,
                "quantity": 50,
                "locations": [
                    {
                        "store": "Main Store",
                        "quantity": 30
                    },
                    {
                        "store": "Branch Store",
                        "quantity": 20
                    }
                ]
            }
        }
    }`;

    const productSchema = {
        name: 'product',
        schema: {
            type: 'object',
            required: ['product'],
            properties: {
                product: {
                    type: 'object',
                    required: ['id', 'name', 'price', 'specifications', 'inventory'],
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        price: { type: 'number', minimum: 0 },
                        specifications: {
                            type: 'object',
                            required: ['brand', 'model', 'features'],
                            properties: {
                                brand: { type: 'string' },
                                model: { type: 'string' },
                                features: {
                                    type: 'array',
                                    items: { type: 'string' }
                                }
                            }
                        },
                        inventory: {
                            type: 'object',
                            required: ['inStock', 'quantity', 'locations'],
                            properties: {
                                inStock: { type: 'boolean' },
                                quantity: { type: 'integer', minimum: 0 },
                                locations: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        required: ['store', 'quantity'],
                                        properties: {
                                            store: { type: 'string' },
                                            quantity: { type: 'integer', minimum: 0 }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    };

    // Example 3: Multiple schemas for different types of data

    const input3 = `Here are different types of records:
    {
        "employee": {
            "id": "E123",
            "name": "Jane Smith",
            "department": "Engineering",
            "skills": ["JavaScript", "TypeScript", "React"],
            "contact": {
                "email": "jane@company.com",
                "phone": "+1-234-567-8900"
            }
        }
    }

    {
        "project": {
            "id": "P789",
            "name": "Website Redesign",
            "status": "in-progress",
            "deadline": "2024-12-31",
            "teamSize": 5,
            "budget": 50000
        }
    }`;

    const employeeSchema = {
        name: 'employee',
        schema: {
            type: 'object',
            required: ['employee'],
            properties: {
                employee: {
                    type: 'object',
                    required: ['id', 'name', 'department', 'skills', 'contact'],
                    properties: {
                        id: { type: 'string', pattern: '^E\\d+$' },  // Must start with E followed by numbers
                        name: { type: 'string' },
                        department: { type: 'string' },
                        skills: { 
                            type: 'array',
                            items: { type: 'string' },
                            minItems: 1  // Must have at least one skill
                        },
                        contact: {
                            type: 'object',
                            required: ['email'],
                            properties: {
                                email: { type: 'string', format: 'email' },
                                phone: { type: 'string' }  // Optional
                            }
                        }
                    }
                }
            }
        }
    };

    const projectSchema = {
        name: 'project',
        schema: {
            type: 'object',
            required: ['project'],
            properties: {
                project: {
                    type: 'object',
                    required: ['id', 'name', 'status', 'deadline', 'teamSize'],
                    properties: {
                        id: { type: 'string', pattern: '^P\\d+$' },  // Must start with P followed by numbers
                        name: { type: 'string' },
                        status: { 
                            type: 'string',
                            enum: ['not-started', 'in-progress', 'completed']  // Only these values allowed
                        },
                        deadline: { 
                            type: 'string',
                            format: 'date'  // Must be a valid date string
                        },
                        teamSize: { 
                            type: 'integer',
                            minimum: 1,
                            maximum: 20  // Team size constraints
                        },
                        budget: {
                            type: 'number',
                            minimum: 0  // Optional but must be positive
                        }
                    }
                }
            }
        }
    };

    // Create LlmJson instances with different schema combinations
    const llmJson1 = new LlmJson({ attemptCorrection: true, schemas: [userSchema] });
    const llmJson2 = new LlmJson({ attemptCorrection: true, schemas: [productSchema] });
    const llmJson3 = new LlmJson({ attemptCorrection: true, schemas: [employeeSchema, projectSchema] });

    // Run the examples
    const result1 = llmJson1.extract(input1);
    console.log('User Schema Validation Result:');
    result1.json.forEach((json, i) => {
        console.log(`JSON block ${i + 1}:`);
        console.log(JSON.stringify(json, null, 2));
        if (result1.validatedJson) {
            console.log('Validation:');
            console.log(JSON.stringify(result1.validatedJson[i], null, 2));
        }
        console.log();
    });

    const result2 = llmJson2.extract(input2);
    console.log('\nProduct Schema Validation Result:');
    result2.json.forEach((json, i) => {
        console.log(`JSON block ${i + 1}:`);
        console.log(JSON.stringify(json, null, 2));
        if (result2.validatedJson) {
            console.log('Validation:');
            console.log(JSON.stringify(result2.validatedJson[i], null, 2));
        }
        console.log();
    });

    const result3 = llmJson3.extract(input3);
    console.log('\nMultiple Schemas Validation Result:');
    result3.json.forEach((json, i) => {
        console.log(`JSON block ${i + 1}:`);
        console.log(JSON.stringify(json, null, 2));
        if (result3.validatedJson) {
            console.log('Validation:');
            console.log(JSON.stringify(result3.validatedJson[i], null, 2));
        }
        console.log();
    });
}

runSchemaValidationExamples();