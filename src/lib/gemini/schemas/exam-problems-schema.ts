/**
 * JSON Schema for Gemini structured output: Exam problem generation
 */
export const examProblemsSchema = {
  type: "object",
  properties: {
    problems: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier for the problem",
          },
          title: {
            type: "string",
            description: "Problem title",
          },
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
          },
          difficulty: {
            type: "integer",
            description: "Difficulty from 1 to 10",
          },
          topic: {
            type: "string",
            description: "Related topic",
          },
          description: {
            type: "string",
            description: "Full problem statement (may include LaTeX)",
          },
          hints: {
            type: "array",
            items: { type: "string" },
            description: "Hints for solving the problem",
          },
          solution: {
            type: "string",
            description: "Detailed model solution (may include LaTeX)",
          },
          points: {
            type: "integer",
            description: "Point value for this problem",
          },
        },
        required: [
          "id",
          "title",
          "type",
          "difficulty",
          "topic",
          "description",
          "hints",
          "solution",
          "points",
        ],
      },
    },
  },
  required: ["problems"],
};
