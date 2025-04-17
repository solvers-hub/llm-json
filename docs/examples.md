# LLM-JSON Examples

This document provides examples of using the LLM-JSON library with real-world use cases.

## Example 1: Processing LLM Research Planning Output

```typescript
import { LlmJson } from 'llm-json';

const llmOutput = `<research_planning>
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

\`\`\`json
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
\`\`\``;

const llmJson = new LlmJson({ attemptCorrection: true });
const { text, json } = llmJson.extract(llmOutput);

console.log("Extracted text:");
console.log(text[0]); // Will contain the research planning text

console.log("\nExtracted JSON data:");
console.log(json[0]); // Will contain the parsed JSON object with study information
```

## Example 2: Processing Study Plan Breakdown

```typescript
import { LlmJson } from 'llm-json';

const llmOutput = `<study_plan_breakdown>
1. Required Section Types:
   - Voice Interview (only type required)
   - Since only Voice Interview is required, I'll create 6 Voice Interview sections as per the guidelines

2. Planned Sections:
   1. Introduction (Voice Interview) - To establish rapport and learn background
   2. Career Path Exploration (Voice Interview) - To understand their professional services experience and career trajectory
   3. Job Search Experience (Voice Interview) - To examine pain points in recent job search
   4. Decision-Making Process (Voice Interview) - To understand how they evaluate opportunities
   5. Current Needs Assessment (Voice Interview) - To identify unmet needs in job searching
   6. Debrief (Voice Interview) - To gather final thoughts and conclude

3. Alignment with Study Objective and Demographics:
   - The sections are designed to address all three research objectives:
     a. Understanding which area of Professional Services and which type of professional to target first
     b. Identifying unmet needs, pain points, and barriers in job searching
     c. Gauging appeal of the proposed platform and features

   - Demographics alignment:
     - All sections focus on professionals with experience in or seeking to enter Professional Services
     - Questions will be tailored to those who recently changed jobs or are considering a move
     - Will explore the uncertainty factor mentioned in demographics
     - Will be appropriate for those with up to 10 years of post-education work experience

4. Approach:
   - Begin with an introduction to establish rapport and gather background information
   - Move to career path exploration to understand their professional services experience
   - Dive into job search experiences to identify pain points
   - Explore decision-making processes to understand how they evaluate opportunities
   - Assess current needs to identify gaps in existing solutions
   - Conclude with a debrief to gather final thoughts and feedback on the concept

   Each section will have clear objectives that build upon each other to create a comprehensive understanding of the target audience and their needs.
</study_plan_breakdown>

{
  "sections": [
    {
      "type": "voiceInterview",
      "name": "Introduction",
      "sectionObjective": "Establish rapport and gather background information about the participant's current or recent professional role, career stage, and general attitude toward job searching."
    },
    {
      "type": "voiceInterview",
      "name": "Career Path Exploration",
      "sectionObjective": "Understand the participant's experience in Professional Services, their career trajectory, and what specific sector they work in or are interested in (consulting, accounting, legal, etc.)."
    },
    {
      "type": "voiceInterview",
      "name": "Job Search Experience",
      "sectionObjective": "Explore recent job search experiences, focusing on pain points, frustrations, and barriers encountered during the process of finding and applying for positions."
    },
    {
      "type": "voiceInterview",
      "name": "Decision-Making Process",
      "sectionObjective": "Investigate how participants evaluate job opportunities, what factors influence their decisions, and how they deal with uncertainty when considering career moves."
    },
    {
      "type": "voiceInterview",
      "name": "Current Needs Assessment",
      "sectionObjective": "Identify unmet needs in the job search process and gather reactions to the concept of an AI-powered job platform that understands individual preferences and goals."
    },
    {
      "type": "voiceInterview",
      "name": "Debrief",
      "sectionObjective": "Summarize key insights, gather final thoughts on most valuable potential features for a job platform, and thank the participant for their time and input."
    }
  ]
}`;

const llmJson = new LlmJson({ attemptCorrection: true });
const { text, json } = llmJson.extract(llmOutput);

console.log("Extracted text:");
console.log(text[0]); // Will contain the study plan breakdown text

console.log("\nExtracted JSON data:");
console.log(json[0]); // Will contain the parsed JSON object with sections information
```

## Example 3: Fixing Common LLM JSON Errors

```typescript
import { LlmJson } from 'llm-json';

// Example of malformed JSON as often produced by LLMs
const llmOutput = `Here is the user information:

{
  name: "John Smith",
  email: "john@example.com",
  preferences: {
    theme: "dark",
    notifications: true,
  },
  savedItems: [1, 2, 3, 4,]
}`;

const llmJson = new LlmJson({ attemptCorrection: true });
const { text, json } = llmJson.extract(llmOutput);

console.log("Extracted text:");
console.log(text[0]); // Will contain "Here is the user information:"

console.log("\nExtracted JSON data:");
console.log(json[0]); 
// Will contain the corrected and parsed JSON:
// {
//   name: "John Smith",
//   email: "john@example.com",
//   preferences: {
//     theme: "dark",
//     notifications: true
//   },
//   savedItems: [1, 2, 3, 4]
// }
```

## Example 4: Multiple JSON Objects and Arrays

```typescript
import { LlmJson } from 'llm-json';

const llmOutput = `Here's the user profile:

{
  "name": "Jane Doe",
  "role": "Designer",
  "skills": ["UI/UX", "Wireframing", "Prototyping"]
}

And here are her recent projects:

[
  {
    "name": "Website Redesign",
    "client": "Acme Inc",
    "completedDate": "2023-05-15"
  },
  {
    "name": "Mobile App UI",
    "client": "TechStart",
    "completedDate": "2023-07-22"
  }
]`;

const llmJson = new LlmJson({ attemptCorrection: true });
const { text, json } = llmJson.extractAll(llmOutput);

console.log("Extracted text blocks:");
console.log(text); // Will contain two text blocks

console.log("\nExtracted JSON data:");
console.log(json); // Will contain both the user profile object and the projects array
``` 