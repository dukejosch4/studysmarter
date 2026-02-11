/**
 * JSON Schema for Gemini structured output: Concept extraction
 */
export const conceptExtractionSchema = {
  type: "object",
  properties: {
    concepts: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", description: "Name of the concept" },
          description: {
            type: "string",
            description: "Brief description of the concept (1-2 sentences)",
          },
          importance: {
            type: "integer",
            description: "Importance score from 1 (low) to 10 (high)",
          },
          frequency: {
            type: "integer",
            description: "How many times this concept appears across all documents",
          },
          related_concepts: {
            type: "array",
            items: { type: "string" },
            description: "Names of related concepts",
          },
          category: {
            type: "string",
            description: "Subject area category, e.g. calculus, linear_algebra, probability",
          },
        },
        required: [
          "name",
          "description",
          "importance",
          "frequency",
          "related_concepts",
          "category",
        ],
      },
    },
  },
  required: ["concepts"],
};
