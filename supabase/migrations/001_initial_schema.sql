-- StudySmarter Initial Schema Migration
-- Created: 2026-02-11
-- Description: Complete database schema including tables, types, RLS policies, and storage buckets

-- ============================================================================
-- EXTENSIONS
-- ============================================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- CUSTOM TYPES (ENUMS)
-- ============================================================================

-- Analysis processing status
CREATE TYPE analysis_status AS ENUM (
  'pending',
  'uploading',
  'extracting',
  'analyzing',
  'generating',
  'completed',
  'failed'
);

-- Document type classification
CREATE TYPE document_type AS ENUM (
  'lecture_script',
  'exercise_sheet',
  'solution',
  'old_exam',
  'notes'
);

-- Document processing status
CREATE TYPE document_status AS ENUM (
  'pending',
  'uploading',
  'extracting',
  'extracted',
  'failed'
);

-- Chunk content category for AI context
CREATE TYPE chunk_category AS ENUM (
  'definition',
  'theorem',
  'proof',
  'example',
  'exercise',
  'solution',
  'narrative'
);

-- User subscription tier
CREATE TYPE user_tier AS ENUM (
  'free',
  'paid'
);

-- Payment transaction status
CREATE TYPE payment_status AS ENUM (
  'pending',
  'completed',
  'failed',
  'refunded'
);

-- ============================================================================
-- TABLES
-- ============================================================================

-- User profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  email TEXT,
  credits INT NOT NULL DEFAULT 1,
  tier user_tier NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE profiles IS 'User profile data extending Supabase auth.users';
COMMENT ON COLUMN profiles.credits IS 'Number of analysis credits remaining';
COMMENT ON COLUMN profiles.tier IS 'User subscription tier (free or paid)';

-- Anonymous/temporary sessions for non-authenticated users
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  credits INT NOT NULL DEFAULT 1,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE sessions IS 'Temporary sessions for anonymous users, expires after 24 hours';
COMMENT ON COLUMN sessions.user_id IS 'Optional link to authenticated user';
COMMENT ON COLUMN sessions.expires_at IS 'Session expiration time (24 hours from creation)';

-- Analysis jobs (main entity)
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status analysis_status NOT NULL DEFAULT 'pending',
  stage INT NOT NULL DEFAULT 0,

  -- AI-generated results (stored as JSONB for flexibility)
  result_concepts JSONB,
  result_task_patterns JSONB,
  result_priorities JSONB,
  result_exam_problems JSONB,
  result_study_plan JSONB,
  result_flashcards JSONB,
  result_report_url TEXT,

  -- Metadata
  total_pages INT NOT NULL DEFAULT 0,
  total_tokens_used INT NOT NULL DEFAULT 0,
  processing_time_ms INT,
  error_message TEXT,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE analyses IS 'Main analysis job tracking table';
COMMENT ON COLUMN analyses.stage IS 'Current processing stage (0-based index)';
COMMENT ON COLUMN analyses.result_concepts IS 'Extracted concepts from documents';
COMMENT ON COLUMN analyses.result_task_patterns IS 'Identified task patterns for exam prep';
COMMENT ON COLUMN analyses.result_priorities IS 'Priority matrix for study topics';
COMMENT ON COLUMN analyses.result_exam_problems IS 'Generated exam-style problems';
COMMENT ON COLUMN analyses.result_study_plan IS 'Personalized study plan';
COMMENT ON COLUMN analyses.result_flashcards IS 'Generated flashcard sets';
COMMENT ON COLUMN analyses.total_tokens_used IS 'Total AI tokens consumed';

-- Documents uploaded for analysis
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  analysis_id UUID REFERENCES analyses(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size BIGINT,
  storage_path TEXT,
  doc_type document_type NOT NULL DEFAULT 'lecture_script',
  status document_status NOT NULL DEFAULT 'pending',

  -- Mathpix OCR integration
  mathpix_job_id TEXT,
  extracted_text TEXT,
  extraction_metadata JSONB,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE documents IS 'Uploaded documents for analysis';
COMMENT ON COLUMN documents.storage_path IS 'Path in Supabase storage bucket';
COMMENT ON COLUMN documents.mathpix_job_id IS 'Mathpix API job ID for OCR tracking';
COMMENT ON COLUMN documents.extraction_metadata IS 'Mathpix extraction metadata (confidence, page count, etc)';

-- Text chunks for AI processing
CREATE TABLE chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  analysis_id UUID NOT NULL REFERENCES analyses(id) ON DELETE CASCADE,
  chunk_index INT NOT NULL,
  content TEXT NOT NULL,
  token_count INT,
  category chunk_category,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE chunks IS 'Text chunks for AI context window management';
COMMENT ON COLUMN chunks.chunk_index IS 'Sequential index within document';
COMMENT ON COLUMN chunks.token_count IS 'Estimated token count for this chunk';
COMMENT ON COLUMN chunks.category IS 'Semantic category of chunk content';

-- Payment transactions
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  paypal_order_id TEXT,
  amount_eur NUMERIC(10,2) NOT NULL,
  credits_granted INT NOT NULL,
  status payment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE payments IS 'Payment transaction history';
COMMENT ON COLUMN payments.paypal_order_id IS 'PayPal order/transaction ID';
COMMENT ON COLUMN payments.amount_eur IS 'Payment amount in EUR';
COMMENT ON COLUMN payments.credits_granted IS 'Number of analysis credits granted';

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Analyses
CREATE INDEX idx_analyses_session_id ON analyses(session_id);
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_status ON analyses(status);

-- Documents
CREATE INDEX idx_documents_analysis_id ON documents(analysis_id);

-- Chunks
CREATE INDEX idx_chunks_document_id ON chunks(document_id);
CREATE INDEX idx_chunks_analysis_id ON chunks(analysis_id);

-- Payments
CREATE INDEX idx_payments_session_id ON payments(session_id);

-- ============================================================================
-- TRIGGERS AND FUNCTIONS
-- ============================================================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION update_updated_at_column IS 'Automatically updates updated_at timestamp on row modification';

-- Trigger for profiles table
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for analyses table
CREATE TRIGGER set_analyses_updated_at
  BEFORE UPDATE ON analyses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', SPLIT_PART(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION handle_new_user IS 'Automatically creates profile when new user signs up';

-- Trigger on auth.users for profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read and update their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Sessions: permissive access (auth handled at API layer)
CREATE POLICY "Sessions are accessible"
  ON sessions FOR ALL
  USING (true);

-- Analyses: accessible by session or user owner
CREATE POLICY "Analyses are accessible by session or user"
  ON analyses FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions) OR
    user_id = auth.uid()
  );

-- Documents: accessible via analysis ownership
CREATE POLICY "Documents are accessible via analysis"
  ON documents FOR ALL
  USING (
    analysis_id IN (
      SELECT id FROM analyses
      WHERE session_id IN (SELECT id FROM sessions)
        OR user_id = auth.uid()
    )
  );

-- Chunks: accessible via analysis ownership
CREATE POLICY "Chunks are accessible via analysis"
  ON chunks FOR ALL
  USING (
    analysis_id IN (
      SELECT id FROM analyses
      WHERE session_id IN (SELECT id FROM sessions)
        OR user_id = auth.uid()
    )
  );

-- Payments: accessible by session or user
CREATE POLICY "Payments are accessible by session or user"
  ON payments FOR ALL
  USING (
    session_id IN (SELECT id FROM sessions) OR
    user_id = auth.uid()
  );

-- ============================================================================
-- STORAGE BUCKETS
-- ============================================================================

-- Create uploads bucket for user-uploaded documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'uploads',
  'uploads',
  false,
  52428800, -- 50MB in bytes
  ARRAY['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

COMMENT ON TABLE storage.buckets IS 'Storage buckets configuration';

-- Create reports bucket for generated PDF reports
INSERT INTO storage.buckets (id, name, public, file_size_limit)
VALUES (
  'reports',
  'reports',
  false,
  52428800 -- 50MB in bytes
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for uploads bucket
CREATE POLICY "Authenticated users can upload files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'uploads' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

CREATE POLICY "Users can view their own uploads"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'uploads' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

CREATE POLICY "Users can delete their own uploads"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'uploads' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

-- Storage policies for reports bucket
CREATE POLICY "Authenticated users can create reports"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'reports' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

CREATE POLICY "Users can view reports"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'reports' AND
    (auth.role() = 'authenticated' OR auth.role() = 'anon')
  );

-- ============================================================================
-- INITIAL DATA (OPTIONAL)
-- ============================================================================

-- Note: No seed data inserted in migration. Use separate seed script if needed.

-- ============================================================================
-- COMPLETION
-- ============================================================================

COMMENT ON SCHEMA public IS 'StudySmarter database schema v1.0 - Initial migration completed';
