import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

type SendDownloadEmailParams = {
  to: string;
  productTitle: string;
  downloadUrl: string;
  expiresAt: Date;
};

export async function sendDownloadEmail({
  to,
  productTitle,
  downloadUrl,
  expiresAt,
}: SendDownloadEmailParams) {
  const expiresFormatted = expiresAt.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const resend = getResend();
  await resend.emails.send({
    from: "StudySmarter <noreply@cortexboard.de>",
    to,
    subject: `Dein Download: ${productTitle}`,
    html: `
      <!DOCTYPE html>
      <html lang="de">
      <head><meta charset="utf-8"></head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1f2937;">
        <div style="text-align: center; margin-bottom: 32px;">
          <h1 style="color: #4f46e5; font-size: 24px; margin: 0;">StudySmarter</h1>
        </div>

        <h2 style="font-size: 20px; margin-bottom: 8px;">Dein Download ist bereit!</h2>

        <p style="color: #6b7280; line-height: 1.6;">
          Vielen Dank für deinen Kauf von <strong>${productTitle}</strong>.
          Klicke auf den Button unten, um dein Klausurvorbereitungspaket herunterzuladen.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${downloadUrl}" style="display: inline-block; background-color: #4f46e5; color: white; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px;">
            PDF herunterladen
          </a>
        </div>

        <p style="color: #9ca3af; font-size: 14px; text-align: center;">
          Dieser Link ist gültig bis ${expiresFormatted}.
        </p>

        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">

        <p style="color: #9ca3af; font-size: 12px; text-align: center;">
          StudySmarter — KI-gestützte Klausurvorbereitung
        </p>
      </body>
      </html>
    `,
  });
}
