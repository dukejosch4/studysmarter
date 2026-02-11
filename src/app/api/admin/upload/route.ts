import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/admin";

const MAX_FILE_SIZE = 50 * 1024 * 1024;
const MAX_FILES = 50;
const ALLOWED_TYPES = ["application/pdf"];
const VALID_DOC_TYPES = ["lecture_script", "exercise_sheet", "solution", "old_exam", "notes"];

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdmin(request);
    if (auth !== true) return auth;

    const formData = await request.formData();
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return NextResponse.json({ error: `Maximum ${MAX_FILES} files allowed` }, { status: 400 });
    }

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
    const adminSessionId = process.env.ADMIN_SESSION_ID!;
    const uploadedDocuments: Array<{
      id: string;
      fileName: string;
      fileSize: number;
      storagePath: string;
    }> = [];

    for (const file of files) {
      const docId = crypto.randomUUID();
      const storagePath = `${adminSessionId}/${docId}/${file.name}`;

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
    console.error("Admin upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
