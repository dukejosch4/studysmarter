/**
 * JSON Schema for Gemini structured output: Task pattern analysis
 */
export const taskPatternsSchema = {
  type: "object",
  properties: {
    patterns: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: [
              "calculation",
              "proof",
              "mc",
              "short_answer",
              "essay",
              "modeling",
            ],
            description: "Type of task/question",
          },
          frequency: {
            type: "integer",
            description: "How often this pattern appears",
          },
          difficulty: {
            type: "integer",
            description: "Average difficulty from 1 (easy) to 10 (hard)",
          },
          example_topics: {
            type: "array",
            items: { type: "string" },
            description: "Topics where this pattern is commonly used",
          },
          description: {
            type: "string",
            description: "Description of this task pattern",
          },
        },
        required: [
          "type",
          "frequency",
          "difficulty",
          "example_topics",
          "description",
        ],
      },
    },
  },
  required: ["patterns"],
};
