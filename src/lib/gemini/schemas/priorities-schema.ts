/**
 * JSON Schema for Gemini structured output: Topic prioritization
 */
export const prioritiesSchema = {
  type: "object",
  properties: {
    priorities: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: {
            type: "string",
            description: "Topic name",
          },
          relevance_score: {
            type: "integer",
            description: "Relevance score from 0 to 100",
          },
          reasoning: {
            type: "string",
            description: "Why this topic is important for the exam",
          },
          estimated_exam_weight: {
            type: "integer",
            description: "Estimated percentage weight in the exam (0-100)",
          },
          recommended_study_hours: {
            type: "number",
            description: "Recommended number of study hours",
          },
        },
        required: [
          "topic",
          "relevance_score",
          "reasoning",
          "estimated_exam_weight",
          "recommended_study_hours",
        ],
      },
    },
  },
  required: ["priorities"],
};
