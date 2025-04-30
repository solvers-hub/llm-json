import sys
import os

# Check if the package is installed or if we're running from source
try:
    # Try to import from installed package
    from solvers_hub_llm_json import LlmJson
except ImportError:
    # Fall back to importing from source
    sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
    from src.llm_json import LlmJson


def run_example():
    """Example demonstrating how to use the LLM-JSON library."""
    
    # Create an instance with auto-correction enabled
    llm_json = LlmJson(attempt_correction=True)

    # Example from the requirements
    input_text = """<research_planning>
a. Summary: The given organization is unnamed and works in the area of "something new," which suggests an innovative or emerging field. This could involve novel technologies, fresh market approaches, or unexplored domains. Without specific details, assumptions about the sector or industry may involve startups, tech innovation, or trendsetting industries. The focus and goals may lean toward exploration, user adoption, and refinement of novel concepts.

b. Potential Product Features: 
   - Exploration of new technologies (VR/AR interfaces, IoT integration)
   - User onboarding and education tools 
   - Novel interaction models or user interfaces
   - Feedback and improvement loops
   - Community engagement and collaboration spaces

c. User Persona: Considering the organization's innovative nature, the primary user could be an early adopter, tech-savvy individual who is curious and willing to explore new technologies. This persona is likely someone who enjoys experimenting with novel ideas and is motivated by the excitement of participating in pioneering efforts. 
   Study Name: "Demo - Innovator Insight"

d. Potential Research Objectives:
   - Evaluate user onboarding process effectiveness in helping users understand the product's novel features.
   - Assess user engagement with community collaboration spaces to identify areas for increased interaction.
   - Verify the intuitiveness of new interaction models and user interfaces.
   - Explore user satisfaction with feedback and improvement loops.
   - Measure the impact of educational tools on user empowerment and confidence.
   - Analyze user behavior patterns to refine product workflows.
   - Investigate potential barriers to user adoption and retention.
   
e. Narrowing Down Objectives: 
   After considering the potential research objectives, the focus shifted towards objectives that can be directly evaluated through a live web application. The final objectives chosen were geared towards user onboarding, interaction intuitiveness, and community engagement, as they align with the persona of an early adopter and focus on improving user experience in areas relevant to the organization's innovative nature.
</research_planning>

```json
{
  "studyName": "Demo - Innovator Insight",
  "userPersona": "Tech-savvy early adopter exploring new innovations.",
  "objectives": [
    {
      "objectiveTitle": "Onboarding Process Evaluation",
      "objectiveDescription": "Assess the effectiveness of the user onboarding process in enabling users to grasp the novel features of the product quickly and efficiently, ensuring that it enhances initial user engagement and reduces learning curves."
    },
    {
      "objectiveTitle": "Community Interaction Analysis",
      "objectiveDescription": "Investigate user engagement within community collaboration spaces, identifying potential improvements to foster more interaction, sharing, and collaboration among users, enhancing overall community dynamics."
    },
    {
      "objectiveTitle": "Interface Intuition Verification",
      "objectiveDescription": "Verify the intuitiveness of new interaction models and user interfaces, focusing on how users adapt and navigate through the product, aiming to identify any areas needing refinement for better usability."
    }
  ]
}
```"""

    # Extract JSON and text
    result = llm_json.extract(input_text)

    print("Extracted text:")
    print("------------------")
    for i, text in enumerate(result.text):
        print(f"Text block {i + 1}:")
        print(text)
        print()

    print("Extracted JSON:")
    print("------------------")
    for i, json_obj in enumerate(result.json):
        print(f"JSON object {i + 1}:")
        import json
        print(json.dumps(json_obj, indent=2))
        print()

    # Example with malformed JSON
    print("\nExample with malformed JSON:")
    print("---------------------------")

    malformed_input = """Here is some information:
  
  {
    name: "John",
    age: 30,
    skills: ["JavaScript", "TypeScript"],
    preferences: {
      theme: "dark",
      notifications: true,
    }
  }"""

    malformed_result = llm_json.extract(malformed_input)

    print("Text:")
    print(malformed_result.text[0])
    print("\nCorrected JSON:")
    import json
    print(json.dumps(malformed_result.json[0], indent=2))


if __name__ == "__main__":
    run_example() 