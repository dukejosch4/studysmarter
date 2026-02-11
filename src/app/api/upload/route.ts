import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireSession } from "@/lib/validation/helpers";
import { checkRateLimit } from "@/lib/utils/rate-limiter";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_FILES = 50;
const ALLOWED_TYPES = ["application/pdf"];
const VALID_DOC_TYPES = ["lecture_script", "exercise_sheet", "solution", "old_exam", "notes"];

export async function POST(request: NextRequest) {
  try {
    const session = requireSession(request);
    if (session instanceof NextResponse) return session;
    const { sessionId } = session;

    // Rate limit: 10 uploads per minute per session
    const rateLimit = checkRateLimit(`upload:${sessionId}`, { maxRequests: 10, windowMs: 60000 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Zu viele Uploads. Bitte warte einen Moment." },
        { status: 429 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed` }, { status: 400 });
    }

    // Validate files
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only PDFs are allowed.` },
          { status: 400 }
        );
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum 50MB per file.` },
          { status: 400 }
        );
      }
    }

    const supabase = createAdminClient();
    const uploadedDocuments: Array<{
      id: string;
      fileName: string;
      fileSize: number;
      storagePath: string;
    }> = [];

    for (const file of files) {
      const docId = crypto.randomUUID();
      const storagePath = `${sessionId}/${docId}/${file.name}`;

      // Upload to Supabase Storage
      const arrayBuffer = await file.arrayBuffer();
      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(storagePath, arrayBuffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        return NextResponse.json(
          { error: `Failed to upload ${file.name}: ${uploadError.message}` },
          { status: 500 }
        );
      }

      // Validate and sanitize docType
      const rawDocType = (formData.get(`docType_${file.name}`) as string) || "lecture_script";
      const docType = VALID_DOC_TYPES.includes(rawDocType) ? rawDocType : "lecture_script";

      const { data: doc, error: docError } = await supabase
        .from("documents")
        .insert({
          id: docId,
          file_name: file.name,
          file_size: file.size,
          storage_path: storagePath,
          doc_type: docType,
          status: "pending",
        })
        .select()
        .single();

      if (docError) {
        console.error("Document insert error:", docError);
        return NextResponse.json({ error: `Failed to record ${file.name}` }, { status: 500 });
      }

      uploadedDocuments.push({
        id: doc.id,
        fileName: doc.file_name,
        fileSize: doc.file_size,
        storagePath: doc.storage_path,
      });
    }

    return NextResponse.json({
      documents: uploadedDocuments,
      count: uploadedDocuments.length,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
