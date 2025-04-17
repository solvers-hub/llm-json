import LlmJson from '../src/index';

describe('LlmJson', () => {
  let llmJson: LlmJson;

  beforeEach(() => {
    llmJson = new LlmJson({ attemptCorrection: true });
  });

  test('should extract JSON objects', () => {
    const input = 'This is a JSON object: {"name": "John", "age": 30}';
    const result = llmJson.extract(input);

    expect(result.text).toHaveLength(1);
    expect(result.json).toHaveLength(1);
    expect(result.json[0]).toEqual({ name: 'John', age: 30 });
  });

  test('should extract JSON objects and arrays with extractAll', () => {
    const input = 'JSON object: {"name": "John"} and JSON array: [1, 2, 3]';
    const result = llmJson.extractAll(input);

    expect(result.text.length).toBeGreaterThan(0);
    expect(result.json).toHaveLength(2);
    expect(result.json).toContainEqual({ name: 'John' });
    expect(result.json).toContainEqual([1, 2, 3]);
  });

  test('should handle the first example from requirements', () => {
    const input = `<research_planning>
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

    const result = llmJson.extractAll(input);

    expect(result.text).toHaveLength(1);
    expect(result.text[0]).toContain('<research_planning>');
    expect(result.json).toHaveLength(1);
    expect(result.json[0]).toHaveProperty('studyName', 'Demo - Innovator Insight');
    expect(result.json[0]).toHaveProperty('objectives');
    expect(result.json[0].objectives).toHaveLength(3);
  });

  test('should handle the second example from requirements', () => {
    const input = `<study_plan_breakdown>
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

    const result = llmJson.extractAll(input);

    expect(result.text).toHaveLength(1);
    expect(result.text[0]).toContain('<study_plan_breakdown>');
    expect(result.json).toHaveLength(1);
    expect(result.json[0]).toHaveProperty('sections');
    expect(result.json[0].sections).toHaveLength(6);
    expect(result.json[0].sections[0]).toHaveProperty('type', 'voiceInterview');
  });

  test('should use the singleton pattern correctly', () => {
    const instance1 = LlmJson.getInstance({ attemptCorrection: true });
    const instance2 = LlmJson.getInstance({ attemptCorrection: false });

    expect(instance1).toBe(instance2);
  });
}); 