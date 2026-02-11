/**
 * JSON Schema for Gemini structured output: Study plan generation
 */
export const studyPlanSchema = {
  type: "object",
  properties: {
    days: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: {
            type: "integer",
            description: "Day number (1-7)",
          },
          focus_topic: {
            type: "string",
            description: "Main focus topic for this day",
          },
          tasks: {
            type: "array",
            items: {
              type: "object",
              properties: {
                time_block: {
                  type: "string",
                  description: "Time block (e.g., Vormittag, Nachmittag, Abend)",
                },
                activity: {
                  type: "string",
                  description: "What to study/practice",
                },
                duration_minutes: {
                  type: "integer",
                  description: "Duration in minutes",
                },
                resources: {
                  type: "array",
                  items: { type: "string" },
                  description: "Recommended resources or materials",
                },
              },
              required: [
                "time_block",
                "activity",
                "duration_minutes",
                "resources",
              ],
            },
          },
          review_topics: {
            type: "array",
            items: { type: "string" },
            description: "Topics to review from previous days",
          },
        },
        required: ["day", "focus_topic", "tasks", "review_topics"],
      },
    },
  },
  required: ["days"],
};
