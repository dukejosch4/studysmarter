import type {
  MathpixSubmitOptions,
  MathpixSubmitResponse,
  MathpixStatusResponse,
  MathpixConversionResult,
} from "./types";

const MATHPIX_API_BASE = "https://api.mathpix.com/v3";

function getHeaders(): Record<string, string> {
  const appId = process.env.MATHPIX_APP_ID;
  const appKey = process.env.MATHPIX_APP_KEY;

  if (!appId || !appKey) {
    throw new Error("MATHPIX_APP_ID and MATHPIX_APP_KEY must be set");
  }

  return {
    app_id: appId,
    app_key: appKey,
  };
}

/**
 * Submit a PDF to Mathpix for processing.
 * Can accept a URL or a file buffer.
 */
export async function submitPdf(
  input: { url: string } | { buffer: ArrayBuffer; fileName: string },
  options: MathpixSubmitOptions = {}
): Promise<MathpixSubmitResponse> {
  const headers = getHeaders();
  const {
    enableTablesDetection = true,
    callbackUrl,
  } = options;

  let body: FormData | string;
  let contentType: string | undefined;

  if ("url" in input) {
    const payload: Record<string, unknown> = {
      url: input.url,
      math_inline_delimiters: ["$", "$"],
      math_display_delimiters: ["$$", "$$"],
      enable_tables_fallback: enableTablesDetection,
    };

    if (callbackUrl) {
      payload.callback = { post: callbackUrl };
    }

    body = JSON.stringify(payload);
    contentType = "application/json";
  } else {
    const formData = new FormData();
    const blob = new Blob([input.buffer], { type: "application/pdf" });
    formData.append("file", blob, input.fileName);

    const optionsPayload: Record<string, unknown> = {
      math_inline_delimiters: ["$", "$"],
      math_display_delimiters: ["$$", "$$"],
      enable_tables_fallback: enableTablesDetection,
    };

    if (callbackUrl) {
      optionsPayload.callback = { post: callbackUrl };
    }

    formData.append("options_json", JSON.stringify(optionsPayload));
    body = formData as unknown as string; // FormData handled natively by fetch
    contentType = undefined; // Let fetch set multipart boundary
  }

  const fetchHeaders: Record<string, string> = { ...headers };
  if (contentType) fetchHeaders["Content-Type"] = contentType;

  const response = await fetch(`${MATHPIX_API_BASE}/pdf`, {
    method: "POST",
    headers: fetchHeaders,
    body,
  });

  const responseText = await response.text();
  console.log(`[Mathpix] Submit response (${response.status}):`, responseText);

  if (!response.ok) {
    throw new Error(`Mathpix submit failed (${response.status}): ${responseText}`);
  }

  const parsed = JSON.parse(responseText) as MathpixSubmitResponse;

  if (!parsed.pdf_id) {
    throw new Error(`Mathpix submit returned no pdf_id: ${responseText}`);
  }

  console.log(`[Mathpix] Got pdf_id: ${parsed.pdf_id}`);
  return parsed;
}

/**
 * Check the status of a PDF processing job.
 */
export async function checkStatus(
  pdfId: string
): Promise<MathpixStatusResponse> {
  const headers = getHeaders();

  console.log(`[Mathpix] Checking status for pdf_id: ${pdfId}`);
  console.log(`[Mathpix] Using app_id: ${headers.app_id}`);

  const response = await fetch(`${MATHPIX_API_BASE}/pdf/${pdfId}`, {
    method: "GET",
    headers,
  });

  const responseText = await response.text();
  console.log(`[Mathpix] Status response (${response.status}):`, responseText);

  if (!response.ok) {
    throw new Error(
      `Mathpix status check failed (${response.status}): ${responseText}`
    );
  }

  return JSON.parse(responseText);
}

/**
 * Get the conversion result (extracted text) for a completed PDF.
 * Returns Mathpix Markdown (MMD) format which preserves LaTeX.
 */
export async function getResult(
  pdfId: string
): Promise<MathpixConversionResult> {
  const headers = getHeaders();

  const response = await fetch(`${MATHPIX_API_BASE}/pdf/${pdfId}.mmd`, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Mathpix result fetch failed (${response.status}): ${errorText}`
    );
  }

  const mmdText = await response.text();

  return {
    pdf_id: pdfId,
    status: "completed",
    mmd: mmdText,
  };
}

/**
 * Poll for completion with exponential backoff.
 * Returns the final status once completed or errored.
 */
export async function waitForCompletion(
  pdfId: string,
  {
    maxWaitMs = 5 * 60 * 1000, // 5 minutes
    initialIntervalMs = 2000,
    maxIntervalMs = 10000,
  } = {}
): Promise<MathpixStatusResponse> {
  const startTime = Date.now();
  let interval = initialIntervalMs;

  while (Date.now() - startTime < maxWaitMs) {
    const status = await checkStatus(pdfId);

    if (status.status === "completed" || status.status === "error") {
      return status;
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
    interval = Math.min(interval * 1.5, maxIntervalMs);
  }

  throw new Error(`Mathpix processing timed out after ${maxWaitMs}ms`);
}
