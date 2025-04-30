import sys
import os
import json

# Check if the package is installed or if we're running from source
try:
    # Try to import from installed package
    from solvers_hub_llm_json import LlmJson
except ImportError:
    # Fall back to importing from source
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from src.llm_json import LlmJson


def run_schema_validation_example():
    """Example demonstrating how to use schema validation with the LLM-JSON library."""
    
    print('Schema Validation Example')
    print('=========================\n')

    # Define some schemas for validation
    schemas = [
        {
            "name": "person",
            "schema": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "age": {"type": "integer"},
                    "email": {"type": "string"}
                },
                "required": ["name", "age"]
            }
        },
        {
            "name": "product",
            "schema": {
                "type": "object",
                "properties": {
                    "id": {"type": "string"},
                    "name": {"type": "string"},
                    "price": {"type": "number"}
                },
                "required": ["id", "name", "price"]
            }
        }
    ]

    # Create an instance with auto-correction and schemas
    llm_json = LlmJson(attempt_correction=True, schemas=schemas)

    # Example 1: Valid JSON matching a schema
    print('Example 1: Valid JSON matching a schema')
    print('----------------------------------------')

    input1 = """Here's some customer information:
  
  {
    "name": "John Doe",
    "age": 32,
    "email": "john.doe@example.com"
  }
  
  Please process this customer data."""

    result1 = llm_json.extract(input1)

    print('Extracted JSON:')
    print(json.dumps(result1.json, indent=2))
    print('\nValidation Results:')
    
    # Convert validation results to a dict for JSON serialization
    validation_results = []
    for validation in result1.validated_json:
        validation_results.append({
            "json": validation.json,
            "matched_schema": validation.matched_schema,
            "is_valid": validation.is_valid
        })
        
    print(json.dumps(validation_results, indent=2))
    print('\n')

    # Example 2: Valid JSON but doesn't match any schema
    print('Example 2: Valid JSON but doesn\'t match any schema')
    print('--------------------------------------------------')

    input2 = """Here's some location data:
  
  {
    "latitude": 37.7749,
    "longitude": -122.4194,
    "city": "San Francisco"
  }"""

    result2 = llm_json.extract(input2)

    print('Extracted JSON:')
    print(json.dumps(result2.json, indent=2))
    print('\nValidation Results:')
    
    # Convert validation results to a dict for JSON serialization
    validation_results = []
    for validation in result2.validated_json:
        result_dict = {
            "json": validation.json,
            "matched_schema": validation.matched_schema,
            "is_valid": validation.is_valid
        }
        if validation.validation_errors:
            result_dict["has_errors"] = True
        validation_results.append(result_dict)
        
    print(json.dumps(validation_results, indent=2))
    print('\n')

    # Example 3: Multiple JSON objects with some matching schemas
    print('Example 3: Multiple JSON objects with some matching schemas')
    print('--------------------------------------------------------')

    input3 = """Here are two different objects:
  
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
  }"""

    result3 = llm_json.extract(input3)

    print('Extracted JSON:')
    print(json.dumps(result3.json, indent=2))
    print('\nValidation Results:')
    
    # Convert validation results to a dict for JSON serialization
    validation_results = []
    for validation in result3.validated_json:
        result_dict = {
            "json": validation.json,
            "matched_schema": validation.matched_schema,
            "is_valid": validation.is_valid
        }
        if validation.validation_errors:
            result_dict["has_errors"] = True
        validation_results.append(result_dict)
        
    print(json.dumps(validation_results, indent=2))
    print('\n')

    # Example 4: Malformed JSON that gets corrected and validated
    print('Example 4: Malformed JSON that gets corrected and validated')
    print('----------------------------------------------------------')

    input4 = """This JSON has errors but should be fixed:
  
  {
    name: "Alex Johnson",
    age: 42,
    email: "alex@example.com"
  }"""

    result4 = llm_json.extract(input4)

    print('Extracted JSON:')
    print(json.dumps(result4.json, indent=2))
    print('\nValidation Results:')
    
    # Convert validation results to a dict for JSON serialization
    validation_results = []
    for validation in result4.validated_json:
        result_dict = {
            "json": validation.json,
            "matched_schema": validation.matched_schema,
            "is_valid": validation.is_valid
        }
        if validation.validation_errors:
            result_dict["has_errors"] = True
        validation_results.append(result_dict)
        
    print(json.dumps(validation_results, indent=2))


if __name__ == "__main__":
    run_schema_validation_example() 