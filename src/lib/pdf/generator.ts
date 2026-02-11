import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import { ReportDocument, type ReportData } from "./templates/report";

/**
 * Generate a PDF report buffer from analysis results.
 */
export async function generateReportPdf(data: ReportData): Promise<Buffer> {
  const element = React.createElement(ReportDocument, { data });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buffer = await renderToBuffer(element as any);
  return Buffer.from(buffer);
}
