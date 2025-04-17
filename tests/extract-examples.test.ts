import LlmJson from '../src/index';

describe('LLM-JSON Real Examples', () => {
    let llmJson: LlmJson;

    beforeEach(() => {
        llmJson = new LlmJson({ attemptCorrection: true });
    });

    test('should extract JSON from simple string', () => {
        const input = 'Some text {"key": "value"} more text';
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ key: 'value' });
        expect(result.text).toHaveLength(2);
        expect(result.text[0]).toBe('Some text');
        expect(result.text[1]).toBe('more text');
    });

    test('should extract nested JSON', () => {
        const input = 'Complex text {"outer": {"inner": "value"}} more text';
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ outer: { inner: 'value' } });
    });

    test('should handle JSON with newlines', () => {
        const input = `Some text {
      "reasoning": "Detailed explanation",
      "score": 0
    } more text`;
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toHaveProperty('reasoning', 'Detailed explanation');
        expect(result.json[0]).toHaveProperty('score', 0);
    });

    test('should return empty arrays for no JSON', () => {
        const input = "No JSON here";
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(0);
        expect(result.text).toHaveLength(1);
        expect(result.text[0]).toBe("No JSON here");
    });

    test('should extract JSON from markdown code blocks', () => {
        const input = '```json\n{"key": "value"}\n```';
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ key: 'value' });
    });

    test('should handle complex nested JSON in markdown code blocks', () => {
        const input = `\`\`\`json
{
  "1": "First level",
  "2": {
    "2": "Second level",
    "2.1": {
      "2.1": "Third level",
      "2.1.1": "Fourth level"
    }
  }
}\n\`\`\``;
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({
            "1": "First level",
            "2": {
                "2": "Second level",
                "2.1": {
                    "2.1": "Third level",
                    "2.1.1": "Fourth level"
                }
            }
        });
    });

    test('should handle JSON with escaped characters in markdown blocks', () => {
        const input = '```json\n{"key": "value\\nwith\\nnewlines"}\n```';
        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({ key: 'value\nwith\nnewlines' });
    });

    test('Real LLM Example 1: Product Use Flow', () => {
        const input = '```json\n{\n  "1": "Confirm if the prototype is visible.",\n  "2": {\n    "2": "Explain the task details and confirm understanding.",\n    "2.1": "Ensure user knows they will explore the prototype."\n  },\n  "3": {\n    "3": "Ask for initial impressions and understanding of the start screen.",\n    "3.1": {\n      "3.1": "Focus on design, message, and emotional response.",\n      "3.1.1": "If user seems confused, ask what they find unclear."\n    }\n  },\n  "4": {\n    "4": "Instruct user to explore the prototype.",\n    "4.1": {\n      "4.1": "Observe navigation and usability.",\n      "4.1.1": "If user struggles, ask what they find difficult."\n    }\n  },\n  "5": {\n    "5": "Gather feedback on interaction and suggestions for improvement.",\n    "5.1": "Inquire about any changes they would make."\n  },\n  "6": {\n    "6": "Ask user to rate ease/difficulty of task on a scale of 1-5.",\n    "6.1": "Follow up with rationale for their rating."\n  },\n  "7": "Inform user we will move forward to the next section and get confirmation."\n}\n```';

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({
            "1": "Confirm if the prototype is visible.",
            "2": {
                "2": "Explain the task details and confirm understanding.",
                "2.1": "Ensure user knows they will explore the prototype."
            },
            "3": {
                "3": "Ask for initial impressions and understanding of the start screen.",
                "3.1": {
                    "3.1": "Focus on design, message, and emotional response.",
                    "3.1.1": "If user seems confused, ask what they find unclear."
                }
            },
            "4": {
                "4": "Instruct user to explore the prototype.",
                "4.1": {
                    "4.1": "Observe navigation and usability.",
                    "4.1.1": "If user struggles, ask what they find difficult."
                }
            },
            "5": {
                "5": "Gather feedback on interaction and suggestions for improvement.",
                "5.1": "Inquire about any changes they would make."
            },
            "6": {
                "6": "Ask user to rate ease/difficulty of task on a scale of 1-5.",
                "6.1": "Follow up with rationale for their rating."
            },
            "7": "Inform user we will move forward to the next section and get confirmation."
        });
    });

    test('Real LLM Example 2: Intern Screening Questions', () => {
        const input = `Based on the provided information, I'll create a screener for intern candidates that indirectly assesses the target characteristics without revealing the exact criteria. Here's the JSON output for the screener:

{
  "questions": [
    {
      "questionType": "radio",
      "text": "Which of the following best describes your current educational status?",
      "isRequired": true,
      "includeOtherOption": false,
      "answers": [
        {
          "text": "High school student",
          "answerValue": 2
        },
        {
          "text": "Currently enrolled in college",
          "answerValue": 1
        },
        {
          "text": "College graduate",
          "answerValue": 1
        },
        {
          "text": "Graduate student",
          "answerValue": 2
        },
        {
          "text": "Not currently a student",
          "answerValue": 2
        }
      ],
      "skipLogic": false
    },
    {
      "questionType": "radio",
      "text": "Which age group do you belong to?",
      "isRequired": true,
      "includeOtherOption": false,
      "answers": [
        {
          "text": "Under 18",
          "answerValue": 2
        },
        {
          "text": "18-20",
          "answerValue": 1
        },
        {
          "text": "21-29",
          "answerValue": 1
        },
        {
          "text": "30-39",
          "answerValue": 2
        },
        {
          "text": "40 or older",
          "answerValue": 2
        }
      ],
      "skipLogic": false
    }
  ]
}`;

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({
            "questions": [
                {
                    "questionType": "radio",
                    "text": "Which of the following best describes your current educational status?",
                    "isRequired": true,
                    "includeOtherOption": false,
                    "answers": [
                        {
                            "text": "High school student",
                            "answerValue": 2
                        },
                        {
                            "text": "Currently enrolled in college",
                            "answerValue": 1
                        },
                        {
                            "text": "College graduate",
                            "answerValue": 1
                        },
                        {
                            "text": "Graduate student",
                            "answerValue": 2
                        },
                        {
                            "text": "Not currently a student",
                            "answerValue": 2
                        }
                    ],
                    "skipLogic": false
                },
                {
                    "questionType": "radio",
                    "text": "Which age group do you belong to?",
                    "isRequired": true,
                    "includeOtherOption": false,
                    "answers": [
                        {
                            "text": "Under 18",
                            "answerValue": 2
                        },
                        {
                            "text": "18-20",
                            "answerValue": 1
                        },
                        {
                            "text": "21-29",
                            "answerValue": 1
                        },
                        {
                            "text": "30-39",
                            "answerValue": 2
                        },
                        {
                            "text": "40 or older",
                            "answerValue": 2
                        }
                    ],
                    "skipLogic": false
                }
            ]
        });
    });

    test('Real LLM Example 3: Screening Questions', () => {
        const input = `{"questions":[{"questionType":"radio","text":"What is your current occupation?","isRequired":true,"includeOtherOption":true,"answers":[{"text":"Digital Media Manager","answerValue":1,"goToQuestionUid":1,"isOther":false},{"text":"Content Creator","answerValue":2,"goToQuestionUid":1,"isOther":false},{"text":"Marketing Specialist","answerValue":2,"goToQuestionUid":1,"isOther":false},{"text":"Other","answerValue":2,"goToQuestionUid":1,"isOther":true}],"logic":null,"skipLogic":true},{"questionType":"radio","text":"How many years of experience do you have in content creation?","isRequired":true,"includeOtherOption":false,"answers":[{"text":"Less than 1 year","answerValue":2,"goToQuestionUid":-1,"isOther":false},{"text":"1-2 years","answerValue":1,"goToQuestionUid":2,"isOther":false},{"text":"3-5 years","answerValue":2,"goToQuestionUid":2,"isOther":false},{"text":"More than 5 years","answerValue":2,"goToQuestionUid":2,"isOther":false}],"logic":null,"skipLogic":true}]}`;

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({
            "questions": [
                {
                    "questionType": "radio",
                    "text": "What is your current occupation?",
                    "isRequired": true,
                    "includeOtherOption": true,
                    "answers": [
                        {
                            "text": "Digital Media Manager",
                            "answerValue": 1,
                            "goToQuestionUid": 1,
                            "isOther": false
                        },
                        {
                            "text": "Content Creator",
                            "answerValue": 2,
                            "goToQuestionUid": 1,
                            "isOther": false
                        },
                        {
                            "text": "Marketing Specialist",
                            "answerValue": 2,
                            "goToQuestionUid": 1,
                            "isOther": false
                        },
                        {
                            "text": "Other",
                            "answerValue": 2,
                            "goToQuestionUid": 1,
                            "isOther": true
                        }
                    ],
                    "logic": null,
                    "skipLogic": true
                },
                {
                    "questionType": "radio",
                    "text": "How many years of experience do you have in content creation?",
                    "isRequired": true,
                    "includeOtherOption": false,
                    "answers": [
                        {
                            "text": "Less than 1 year",
                            "answerValue": 2,
                            "goToQuestionUid": -1,
                            "isOther": false
                        },
                        {
                            "text": "1-2 years",
                            "answerValue": 1,
                            "goToQuestionUid": 2,
                            "isOther": false
                        },
                        {
                            "text": "3-5 years",
                            "answerValue": 2,
                            "goToQuestionUid": 2,
                            "isOther": false
                        },
                        {
                            "text": "More than 5 years",
                            "answerValue": 2,
                            "goToQuestionUid": 2,
                            "isOther": false
                        }
                    ],
                    "logic": null,
                    "skipLogic": true
                }
            ]
        });
    });

    test('Real LLM Example 4: Fix trailing comma in JSON', () => {
        const input = "```json\n{\n  \"targetGenders\": \"N/A\",\n  \"targetAgeGroups\": [\"21-29\", \"30-39\"],\n  \"targetEthnicities\": [],\n  \"targetHouseholdIncome\": [],\n  \"targetEducation\": [],\n}\n```";

        const result = llmJson.extract(input);

        expect(result.json).toHaveLength(1);
        expect(result.json[0]).toEqual({
            "targetGenders": "N/A",
            "targetAgeGroups": ["21-29", "30-39"],
            "targetEthnicities": [],
            "targetHouseholdIncome": [],
            "targetEducation": []
        });
    });
}); 