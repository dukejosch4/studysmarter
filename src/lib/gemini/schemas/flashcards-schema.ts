/**
 * JSON Schema for Gemini structured output: Flashcard generation
 */
export const flashcardsSchema = {
  type: "object",
  properties: {
    flashcards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: {
            type: "string",
            description: "Unique identifier",
          },
          front: {
            type: "string",
            description: "Front side of the flashcard (question/term, may include LaTeX)",
          },
          back: {
            type: "string",
            description: "Back side of the flashcard (answer/definition, may include LaTeX)",
          },
          category: {
            type: "string",
            enum: [
              "definition",
              "theorem",
              "proof_technique",
              "formula",
              "concept",
            ],
          },
          difficulty: {
            type: "integer",
            description: "Difficulty from 1 (easy) to 5 (hard)",
          },
          tags: {
            type: "array",
            items: { type: "string" },
            description: "Topic tags for categorization",
          },
        },
        required: ["id", "front", "back", "category", "difficulty", "tags"],
      },
    },
  },
  required: ["flashcards"],
};
