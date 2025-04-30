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


def run_array_example():
    """Example demonstrating how to extract and work with JSON arrays."""
    
    print('JSON Array Extraction Example')
    print('=============================\n')

    # Create an instance with auto-correction enabled
    llm_json = LlmJson(attempt_correction=True)

    # Example 1: Simple standalone array
    print('Example 1: Simple standalone array')
    print('----------------------------------')

    input1 = """Here's a simple array of numbers: [1, 2, 3, 4, 5]"""

    result1 = llm_json.extract_all(input1)

    print('Extracted text:')
    print(result1.text[0])
    print('\nExtracted JSON:')
    print(json.dumps(result1.json, indent=2))
    print('\n')

    # Example 2: Array with objects
    print('Example 2: Array with objects')
    print('----------------------------')

    input2 = """Here's an array of people:
    
[
  {
    "name": "Alice",
    "age": 28
  },
  {
    "name": "Bob",
    "age": 32
  },
  {
    "name": "Charlie",
    "age": 24
  }
]"""

    result2 = llm_json.extract_all(input2)

    print('Extracted text:')
    print(result2.text[0])
    print('\nExtracted JSON:')
    print(json.dumps(result2.json, indent=2))
    print('\n')

    # Example 3: Mixed arrays and objects
    print('Example 3: Mixed arrays and objects')
    print('----------------------------------')

    input3 = """This example has both objects and arrays:

User profile: {"name": "Jane", "id": "user123"}

User's favorite numbers: [7, 42, 99]

Recent activity: [
  {"action": "login", "timestamp": "2023-05-10T13:45:00Z"},
  {"action": "update_profile", "timestamp": "2023-05-10T13:52:30Z"},
  {"action": "logout", "timestamp": "2023-05-10T14:20:00Z"}
]"""

    result3 = llm_json.extract_all(input3)

    print('Extracted text:')
    for i, text in enumerate(result3.text):
        print(f"Text block {i+1}: {text}")
    print('\nExtracted JSON:')
    print(json.dumps(result3.json, indent=2))
    print('\n')

    # Example 4: Array inside object
    print('Example 4: Array inside object but also standalone array')
    print('------------------------------------------------------')

    input4 = """Here's an object with an array inside it:

{
  "name": "Shopping List",
  "items": ["apples", "milk", "bread", "eggs"]
}

And here's a separate standalone array:

["red", "green", "blue"]"""

    result4 = llm_json.extract_all(input4)

    print('Extracted text:')
    for i, text in enumerate(result4.text):
        print(f"Text block {i+1}: {text}")
    print('\nExtracted JSON:')
    print(json.dumps(result4.json, indent=2))


if __name__ == "__main__":
    run_array_example() 