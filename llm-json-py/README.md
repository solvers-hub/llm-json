# LLM-JSON Extractor for Python

A Python library for extracting and correcting JSON data from LLM outputs.

## Overview

LLM-JSON is a lightweight library designed to parse and extract JSON objects from large language model (LLM) outputs. It can handle multiple JSON objects within text, extract text separately from JSON, and even attempt to fix malformed JSON.

## Key Features

- **Text/JSON Separation**: Cleanly separates text content from JSON data in LLM outputs
- **Multiple JSON Support**: Extracts multiple JSON objects or arrays from a single input
- **JSON Validation & Correction**: Automatically fixes common JSON formatting errors from LLMs
- **Code Block Support**: Extracts JSON from markdown code blocks (```json)
- **Schema Validation**: Validates extracted JSON against provided schemas
- **Python Typing**: Full type hints for better IDE support

## Quick Start

### Installation

```bash
pip install solvers_hub_llm_json
```

### Basic Usage

```python
from solvers_hub_llm_json import LlmJson

llm_output = """Here's some text followed by JSON:

{
  "name": "John",
  "age": 30,
  "skills": ["JavaScript", "TypeScript", "React"]
}"""

llm_json = LlmJson(attempt_correction=True)
result = llm_json.extract(llm_output)

print(result.text)  # ['Here\'s some text followed by JSON:']
print(result.json)  # [{'name': 'John', 'age': 30, 'skills': ['JavaScript', 'TypeScript', 'React']}]
```

### Schema Validation

You can validate extracted JSON against schemas:

```python
from solvers_hub_llm_json import LlmJson

schemas = [
  {
    "name": "person",
    "schema": {
      "type": "object",
      "properties": {
        "name": {"type": "string"},
        "age": {"type": "integer"}
      },
      "required": ["name", "age"]
    }
  }
]

llm_json = LlmJson(
  attempt_correction=True,
  schemas=schemas
)

llm_output = """Here's a person: {"name": "John", "age": 30}
And some other data: {"title": "Meeting notes"}"""
result = llm_json.extract(llm_output)

# Note: All extracted JSON objects are included in the json array
print(result.json)
# [
#   {'name': 'John', 'age': 30},
#   {'title': 'Meeting notes'}
# ]

# The validated_json array includes validation results for each JSON object
print(result.validated_json)
# [
#   {
#     'json': {'name': 'John', 'age': 30},
#     'matched_schema': 'person',
#     'is_valid': True
#   },
#   {
#     'json': {'title': 'Meeting notes'},
#     'matched_schema': None,
#     'is_valid': False,
#     'validation_errors': [...]  # Validation errors
#   }
# ]
```

## Examples

See the [examples](examples) directory for more examples of how to use the library.

## License

MIT 