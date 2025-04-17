import LlmJson from '../src/index';

describe('LLM-JSON Array Extraction Examples', () => {
  let llmJson: LlmJson;

  beforeEach(() => {
    llmJson = new LlmJson({ attemptCorrection: true });
  });

  test('should extract JSON arrays from a string', () => {
    const input = 'Here are some numbers: [1, 2, 3, 4, 5]';
    const result = llmJson.extractAll(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0]).toEqual([1, 2, 3, 4, 5]);
    expect(result.text).toHaveLength(1);
    expect(result.text[0]).toBe('Here are some numbers:');
  });

  test('should extract both objects and arrays', () => {
    const input = 'Object: {"name": "Example"} and array: [1, 2, 3]';
    const result = llmJson.extractAll(input);

    expect(result.json).toHaveLength(2);
    expect(result.json).toContainEqual({ name: 'Example' });
    expect(result.json).toContainEqual([1, 2, 3]);
  });

  test('should extract nested arrays', () => {
    const input = 'Nested array: [[1, 2], [3, 4]]';
    const result = llmJson.extractAll(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0]).toEqual([[1, 2], [3, 4]]);
  });

  test('Real LLM Example: User Portfolio and Projects', () => {
    const input = `Here's the user profile:

  {
    "name": "Jane Smith",
    "role": "Designer",
    "skills": ["UI/UX", "Wireframing", "Prototyping"]
  }

  And here are their recent projects:

  [
    {
      "name": "Website Redesign",
      "client": "Example Corp",
      "completedDate": "2023-05-15"
    },
    {
      "name": "Mobile App UI",
      "client": "Tech Startup",
      "completedDate": "2023-07-22"
    }
  ]`;

    const result = llmJson.extractAll(input);

    // 1st JSON object
    expect(result.json).toHaveLength(2);
    expect(result.json[0]).toHaveProperty('name', 'Jane Smith');
    expect(result.json[0]).toHaveProperty('role', 'Designer');
    expect(result.json[0]).toHaveProperty('skills');
    expect(result.json[0].skills).toEqual(['UI/UX', 'Wireframing', 'Prototyping']);

    // 2nd JSON array
    expect(Array.isArray(result.json[1])).toBe(true);
    expect(result.json[1]).toHaveLength(2);
    expect(result.json[1][0]).toHaveProperty('name', 'Website Redesign');
    expect(result.json[1][1]).toHaveProperty('client', 'Tech Startup');
    expect(result.json[1][0]).toHaveProperty('completedDate', '2023-05-15');

    // 1st text segment
    expect(result.text).toHaveLength(2);
    expect(result.text[0]).toBe("Here's the user profile:");

    // 2nd text segment
    expect(result.text).toHaveLength(2);
    expect(result.text[1]).toBe("And here are their recent projects:");
  });

  test('Real LLM Example: Task List Array', () => {
    const input = `Here's a prioritized list of tasks:

  [
    {
      "id": 1,
      "title": "Complete project requirements document",
      "priority": "high",
      "dueDate": "2023-09-15"
    },
    {
      "id": 2,
      "title": "Design user interface mockups",
      "priority": "medium",
      "dueDate": "2023-09-20"
    },
    {
      "id": 3,
      "title": "Set up development environment",
      "priority": "high",
      "dueDate": "2023-09-10"
    },
    {
      "id": 4,
      "title": "Create project timeline",
      "priority": "medium",
      "dueDate": "2023-09-12"
    }
  ]`;

    const result = llmJson.extractAll(input);

    expect(result.json).toHaveLength(1);
    expect(Array.isArray(result.json[0])).toBe(true);
    expect(result.json[0]).toHaveLength(4);
    expect(result.json[0][0]).toHaveProperty('id', 1);
    expect(result.json[0][0]).toHaveProperty('title');
    expect(result.json[0][2]).toHaveProperty('priority', 'high');
  });

  test('Real LLM Example: User Preferences with Array', () => {
    const input = `{
  "username": "user123",
  "theme": "dark",
  "notifications": true,
  "favorites": [
    "technology",
    "science",
    "books"
  ],
  "recentSearches": [
    "programming tips",
    "new tech gadgets",
    "sci-fi books"
  ]
}`;

    const result = llmJson.extractAll(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0]).toHaveProperty('username', 'user123');
    expect(result.json[0]).toHaveProperty('theme', 'dark');
    expect(result.json[0]).toHaveProperty('favorites');
    expect(Array.isArray(result.json[0].favorites)).toBe(true);
    expect(result.json[0].favorites).toHaveLength(3);
    expect(result.json[0].recentSearches).toContain('programming tips');
  });

  test('Real LLM Example: Fix Trailing Commas in Arrays', () => {
    const input = `{
  "name": "Project Schedule",
  "description": "Timeline for project completion",
  "milestones": [
    "Requirements Gathering",
    "Design Phase",
    "Development",
    "Testing",
    "Deployment",
  ],
  "dates": [
    "2023-09-01",
    "2023-09-15",
    "2023-10-01",
    "2023-10-15",
    "2023-11-01",
  ]
}`;

    const result = llmJson.extractAll(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0]).toHaveProperty('name');
    expect(result.json[0]).toHaveProperty('milestones');
    expect(result.json[0].milestones).toHaveLength(5);
    expect(result.json[0].dates).toHaveLength(5);
    expect(result.json[0].milestones[4]).toBe('Deployment');
  });

  test('Real LLM Example: Complex Nested Data Structure', () => {
    const input = `{
  "project": "Data Analytics Platform",
  "teams": [
    {
      "name": "Frontend Team",
      "members": [
        {"name": "Alex Johnson", "role": "Lead Developer"},
        {"name": "Sam Taylor", "role": "UI Designer"},
        {"name": "Jordan Lee", "role": "Frontend Developer"}
      ],
      "tasks": [
        "Component architecture",
        "Responsive design",
        "User testing"
      ]
    },
    {
      "name": "Backend Team",
      "members": [
        {"name": "Casey Morgan", "role": "Backend Lead"},
        {"name": "Jamie Rivera", "role": "Database Engineer"}
      ],
      "tasks": [
        "API development",
        "Database optimization",
        "Security implementation"
      ]
    }
  ],
  "timeline": [
    {"phase": "Planning", "duration": "2 weeks"},
    {"phase": "Development", "duration": "8 weeks"},
    {"phase": "Testing", "duration": "3 weeks"},
    {"phase": "Deployment", "duration": "1 week"}
  ]
}`;

    const result = llmJson.extractAll(input);

    expect(result.json).toHaveLength(1);
    expect(result.json[0]).toHaveProperty('project');
    expect(result.json[0]).toHaveProperty('teams');
    expect(result.json[0].teams).toHaveLength(2);
    expect(result.json[0].teams[0].members).toHaveLength(3);
    expect(result.json[0].timeline).toHaveLength(4);

    // Check nested array access
    expect(result.json[0].teams[1].tasks[1]).toBe('Database optimization');
  });
}); 