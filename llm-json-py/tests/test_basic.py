import unittest
import sys
import os

# Check if the package is installed or if we're running from source
try:
    # Try to import from installed package
    from llm_json import LlmJson, get_instance
    import llm_json
    is_installed = True
except ImportError:
    # Fall back to importing from source
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from src.llm_json import LlmJson, get_instance  
    import src.llm_json as llm_json
    is_installed = False


class TestLlmJson(unittest.TestCase):
    """Basic tests for the LlmJson class."""
    
    def setUp(self):
        """Set up a LlmJson instance for each test."""
        self.llm_json = LlmJson(attempt_correction=True)
    
    def test_extract_json_objects(self):
        """Test extracting JSON objects from text."""
        input_text = 'This is a JSON object: {"name": "John", "age": 30}'
        result = self.llm_json.extract(input_text)
        
        self.assertEqual(len(result.text), 1)
        self.assertEqual(len(result.json), 1)
        self.assertEqual(result.json[0], {"name": "John", "age": 30})
    
    def test_extract_all_objects_and_arrays(self):
        """Test extracting both JSON objects and arrays."""
        input_text = 'JSON object: {"name": "John"} and JSON array: [1, 2, 3]'
        result = self.llm_json.extract_all(input_text)
        
        self.assertGreater(len(result.text), 0)
        self.assertEqual(len(result.json), 2)
        self.assertIn({"name": "John"}, result.json)
        self.assertIn([1, 2, 3], result.json)
    
    def test_extract_from_code_blocks(self):
        """Test extracting JSON from markdown code blocks."""
        input_text = """Here is some JSON in a code block:
        
```json
{
  "name": "Alice",
  "age": 25,
  "skills": ["Python", "TypeScript", "React"]
}
```

Followed by more text."""
        
        result = self.llm_json.extract(input_text)
        
        self.assertEqual(len(result.text), 2)
        self.assertEqual(len(result.json), 1)
        self.assertEqual(result.json[0]["name"], "Alice")
        self.assertEqual(result.json[0]["skills"], ["Python", "TypeScript", "React"])
    
    def test_extract_with_json_correction(self):
        """Test extracting and correcting malformed JSON."""
        input_text = """Here is some malformed JSON:
        
{
  name: "Jane",
  age: 28,
  skills: ["Java", "C++"]
}"""
        
        result = self.llm_json.extract(input_text)
        
        self.assertEqual(len(result.json), 1)
        self.assertEqual(result.json[0]["name"], "Jane")
        self.assertEqual(result.json[0]["skills"], ["Java", "C++"])
    
    def test_extract_with_schema_validation(self):
        """Test extracting JSON with schema validation."""
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
        
        llm_json_with_schema = LlmJson(attempt_correction=True, schemas=schemas)
        
        input_text = """Valid person: {"name": "John", "age": 30}
Invalid person: {"name": "Bob"}"""
        
        result = llm_json_with_schema.extract(input_text)
        
        self.assertEqual(len(result.json), 2)
        self.assertIsNotNone(result.validated_json)
        self.assertEqual(len(result.validated_json), 2)
        
        # First object should be valid
        self.assertEqual(result.validated_json[0].is_valid, True)
        self.assertEqual(result.validated_json[0].matched_schema, "person")
        
        # Second object should be invalid
        self.assertEqual(result.validated_json[1].is_valid, False)
        self.assertIsNone(result.validated_json[1].matched_schema)
        self.assertIsNotNone(result.validated_json[1].validation_errors)
    
    def test_singleton_pattern(self):
        """Test the singleton pattern for class instances."""
        # Reset the singleton instance to ensure clean test
        LlmJson._instance = None
        
        instance1 = LlmJson.get_instance(attempt_correction=True)
        instance2 = LlmJson.get_instance(attempt_correction=False)
        
        self.assertIs(instance1, instance2)
    
    def test_global_singleton_pattern(self):
        """Test the global singleton pattern."""
        # Reset global singleton instance
        llm_json._instance = None
        
        instance1 = get_instance(attempt_correction=True)
        instance2 = get_instance(attempt_correction=False)
        
        self.assertIs(instance1, instance2)


if __name__ == '__main__':
    unittest.main() 