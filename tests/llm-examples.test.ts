import LlmJson from '../src/index';

describe('LLM-JSON Additional Real Examples', () => {
    let llmJson: LlmJson;

    beforeEach(() => {
        llmJson = new LlmJson({ attemptCorrection: true });
    });

    test('Example 1: Basic weather report', () => {
        const input = `Based on your request for a weather forecast, here's the current information:

{
  "location": "San Francisco",
  "currentWeather": {
    "temperature": 72,
    "condition": "Sunny",
    "humidity": 65,
    "windSpeed": 8
  },
  "forecast": [
    {
      "day": "Tomorrow",
      "high": 74,
      "low": 58,
      "condition": "Partly Cloudy"
    },
    {
      "day": "Wednesday",
      "high": 68,
      "low": 55,
      "condition": "Foggy Morning"
    }
  ]
}

I hope this helps with your planning!`;

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toHaveProperty('location', 'San Francisco');
        expect(result.json[0].currentWeather).toHaveProperty('temperature', 72);
        expect(result.json[0].forecast).toHaveLength(2);
        expect(result.json[0].forecast[1].condition).toBe('Foggy Morning');
    });

    test('Example 2: Product analysis with code blocks', () => {
        const input = `Here's my analysis of the product performance:

\`\`\`json
{
  "productName": "Smart Speaker Pro",
  "overallRating": 4.2,
  "metrics": {
    "customerSatisfaction": 4.5,
    "reliability": 4.0,
    "valueForMoney": 3.8
  },
  "topFeatures": [
    "Voice recognition",
    "Sound quality",
    "Smart home integration"
  ],
  "improvementAreas": [
    "Battery life",
    "Mobile app interface"
  ]
}
\`\`\`

Let me know if you need any clarification on these points.`;

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toHaveProperty('productName', 'Smart Speaker Pro');
        expect(result.json[0]).toHaveProperty('overallRating', 4.2);
        expect(result.json[0].metrics).toHaveProperty('customerSatisfaction', 4.5);
        expect(result.json[0].topFeatures).toContain('Voice recognition');
        expect(result.json[0].improvementAreas).toHaveLength(2);
    });

    test('Example 3: User analysis with correctable JSON', () => {
        const input = `Based on our analysis, here's the user profile:

{
  "userId": "U12345",
  "demographics": {
    "ageGroup": "25-34",
    "occupation": "Software Developer",
    "location": "Urban"
  },
  "appUsage": {
    "frequencyPerWeek": 12,
    "averageSessionMinutes": 18.5,
    "mostUsedFeatures": ["Dashboard", "Reports", "Settings"],
  },
  "feedbackScore": 4.7
}`;

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toHaveProperty('userId', 'U12345');
        expect(result.json[0].demographics).toHaveProperty('ageGroup', '25-34');
        expect(result.json[0].appUsage.mostUsedFeatures).toContain('Dashboard');
        expect(result.json[0]).toHaveProperty('feedbackScore', 4.7);
    });

    test('Example 4: Multiple JSON objects in response', () => {
        const input = `Here are two separate data objects:

First, the user profile:
{
  "name": "Jane Smith",
  "role": "Project Manager",
  "accessLevel": 3,
  "lastLogin": "2023-04-15T14:32:00Z"
}

And here's the project status:
{
  "projectId": "PRJ-2023-005",
  "completion": 68,
  "status": "On Track",
  "nextMilestone": "Backend Integration",
  "dueDate": "2023-06-30"
}`;

        const result = llmJson.extractAll(input);

        expect(result.json).toHaveLength(2);
        expect(result.json[0]).toHaveProperty('name', 'Jane Smith');
        expect(result.json[1]).toHaveProperty('projectId', 'PRJ-2023-005');
        expect(result.json[1]).toHaveProperty('completion', 68);
    });

    test('Example 5: Complex nested structure', () => {
        const input = `The team organization structure is as follows:

{
  "department": "Engineering",
  "headcount": 42,
  "teams": [
    {
      "name": "Frontend",
      "lead": "Alex Chen",
      "members": 12,
      "projects": [
        {
          "name": "UI Redesign",
          "priority": "High",
          "status": "In Progress",
          "technologies": ["React", "TypeScript", "Styled Components"]
        },
        {
          "name": "Performance Optimization",
          "priority": "Medium",
          "status": "Planning",
          "technologies": ["JavaScript", "Webpack"]
        }
      ]
    },
    {
      "name": "Backend",
      "lead": "Sam Johnson",
      "members": 15,
      "projects": [
        {
          "name": "API Gateway",
          "priority": "High",
          "status": "In Progress",
          "technologies": ["Node.js", "Express", "MongoDB"]
        }
      ]
    }
  ]
}`;

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toHaveProperty('department', 'Engineering');
        expect(result.json[0].teams).toHaveLength(2);
        expect(result.json[0].teams[0].projects[0].name).toBe('UI Redesign');
        expect(result.json[0].teams[1].projects[0].technologies).toContain('Express');
    });

    test('Example 6: Handling malformed JSON with correction', () => {
        const input = `Here's the event schedule:

{
  "eventName": "Tech Conference 2023",
  "date": "2023-09-15",
  "location": "Convention Center",
  "sessions": [
    {
      "time": "09:00",
      "title": "Opening Keynote",
      "speaker": "Dr. Lisa Wang",
      "room": "Main Hall"
    },
    {
      "time": "10:30",
      "title": "Future of AI",
      "speaker": "Prof. James Miller",
      "room": "Room A",
    },
    {
      "time": "13:00",
      "title": "Networking Lunch",
      "room": "Dining Area"
    },
  ]
}`;

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toHaveProperty('eventName', 'Tech Conference 2023');
        expect(result.json[0].sessions).toHaveLength(3);
        expect(result.json[0].sessions[1].title).toBe('Future of AI');
        expect(result.json[0].sessions[2].title).toBe('Networking Lunch');
    });
}); 