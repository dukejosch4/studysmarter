import { z } from "zod";

// Shared
export const uuidSchema = z.string().uuid();
export const sessionCookieSchema = z.string().uuid();

// POST /api/analysis
export const createAnalysisSchema = z.object({
  documentIds: z.array(z.string().uuid()).min(1).max(50),
});

// POST /api/pipeline/process
export const pipelineProcessSchema = z.object({
  analysisId: z.string().uuid(),
  startFromStage: z.number().int().min(0).max(9).optional(),
});

// POST /api/webhooks/mathpix
export const mathpixWebhookSchema = z.object({
  pdf_id: z.string().min(1),
  status: z.enum(["completed", "error"]),
  error: z.string().optional(),
  num_pages: z.number().optional(),
});

// POST /api/webhooks/paypal
export const paypalWebhookSchema = z.object({
  id: z.string(),
  event_type: z.string(),
  resource: z.object({
    id: z.string(),
    status: z.string().optional(),
    purchase_units: z.array(z.object({
      amount: z.object({
        currency_code: z.string(),
        value: z.string(),
      }),
      custom_id: z.string().optional(),
    })).optional(),
  }),
});

// GET /api/auth/callback
export const authCallbackSchema = z.object({
  code: z.string().min(1),
  next: z.string().regex(/^\/[a-zA-Z0-9/_-]*$/).optional().default("/"),
});

// GET /api/export/*
export const exportQuerySchema = z.object({
  analysisId: z.string().uuid(),
});
