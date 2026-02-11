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

// Admin login
export const adminLoginSchema = z.object({
  password: z.string().min(1),
});

// POST /api/admin/products
export const createProductSchema = z.object({
  title: z.string().min(1).max(200),
  subject: z.string().min(1).max(100),
  description: z.string().max(2000).optional().default(""),
  price_eur: z.number().positive().max(999),
  documentIds: z.array(z.string().uuid()).min(1).max(50),
});

// PATCH /api/admin/products/[id]
export const updateProductSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  subject: z.string().min(1).max(100).optional(),
  description: z.string().max(2000).optional(),
  price_eur: z.number().positive().max(999).optional(),
  is_published: z.boolean().optional(),
});

// POST /api/orders
export const createOrderSchema = z.object({
  product_id: z.string().uuid(),
  customer_email: z.string().email().max(254),
});

// POST /api/admin/orders/[id]/confirm
export const confirmOrderSchema = z.object({
  orderId: z.string().uuid(),
});
