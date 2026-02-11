// ============================================================================
// Enums and Union Types
// ============================================================================

export type UserTier = 'free' | 'paid';

export type AnalysisStatus =
  | 'pending'
  | 'uploading'
  | 'extracting'
  | 'analyzing'
  | 'generating'
  | 'completed'
  | 'failed';

export type DocumentType =
  | 'lecture_script'
  | 'exercise_sheet'
  | 'solution'
  | 'old_exam'
  | 'notes';

export type DocumentStatus =
  | 'pending'
  | 'uploading'
  | 'extracting'
  | 'extracted'
  | 'failed';

export type ChunkCategory =
  | 'definition'
  | 'theorem'
  | 'proof'
  | 'example'
  | 'exercise'
  | 'solution'
  | 'narrative';

export type PaymentStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'refunded';

export type OrderStatus = 'pending' | 'confirmed' | 'expired';

export type PipelineStage = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, string> = {
  0: 'Initialized',
  1: 'Documents Uploaded',
  2: 'Text Extraction Started',
  3: 'Text Extraction Completed',
  4: 'Analysis Started',
  5: 'Concepts Identified',
  6: 'Task Patterns Analyzed',
  7: 'Priorities Calculated',
  8: 'Resources Generated',
  9: 'Completed',
};

// ============================================================================
// Database Table Types
// ============================================================================

export type Profile = {
  id: string; // UUID, PK → auth.users
  display_name: string | null;
  email: string;
  credits: number; // default 1
  tier: UserTier; // default 'free'
  created_at: string;
  updated_at: string;
};

export type Session = {
  id: string; // UUID
  user_id: string | null; // FK → profiles, nullable
  credits: number; // default 1
  expires_at: string; // 24h from creation
  created_at: string;
};

export type Analysis = {
  id: string; // UUID
  session_id: string; // FK → sessions
  user_id: string | null; // FK → profiles, nullable
  status: AnalysisStatus;
  stage: PipelineStage; // 0-9
  result_concepts: Concept[] | null;
  result_task_patterns: TaskPattern[] | null;
  result_priorities: Priority[] | null;
  result_exam_problems: ExamProblem[] | null;
  result_study_plan: StudyPlanDay[] | null;
  result_flashcards: Flashcard[] | null;
  result_report_url: string | null;
  total_pages: number | null;
  total_tokens_used: number | null;
  processing_time_ms: number | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string; // UUID
  analysis_id: string | null; // FK → analyses, nullable until linked
  file_name: string;
  file_size: number; // bytes
  storage_path: string;
  doc_type: DocumentType;
  status: DocumentStatus;
  mathpix_job_id: string | null;
  extracted_text: string | null;
  extraction_metadata: ExtractionMetadata | null;
  created_at: string;
};

export type Chunk = {
  id: string; // UUID
  document_id: string; // FK → documents
  analysis_id: string; // FK → analyses
  chunk_index: number;
  content: string;
  token_count: number;
  category: ChunkCategory;
  created_at: string;
};

export type Payment = {
  id: string; // UUID
  session_id: string; // FK → sessions
  user_id: string | null; // FK → profiles
  paypal_order_id: string;
  amount_eur: number;
  credits_granted: number;
  status: PaymentStatus;
  created_at: string;
};

export type Product = {
  id: string;
  analysis_id: string;
  title: string;
  subject: string;
  description: string;
  price_eur: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  product_id: string;
  customer_email: string;
  status: OrderStatus;
  download_token: string | null;
  download_token_expires_at: string | null;
  confirmed_at: string | null;
  created_at: string;
};

// ============================================================================
// Result Types (stored in JSONB columns)
// ============================================================================

export type Concept = {
  name: string;
  description: string;
  importance: number; // 1-10
  frequency: number; // how often it appears
  related_concepts: string[];
  category: string; // e.g., "calculus", "linear_algebra", "probability"
};

export type TaskPattern = {
  type: 'calculation' | 'proof' | 'mc' | 'short_answer' | 'essay' | 'modeling';
  frequency: number; // how often this pattern appears
  difficulty: number; // 1-10
  example_topics: string[];
  description: string;
};

export type Priority = {
  topic: string;
  relevance_score: number; // 0-100
  reasoning: string;
  estimated_exam_weight: number; // percentage (0-100)
  recommended_study_hours: number;
};

export type ExamProblem = {
  id: string;
  title: string;
  type: 'calculation' | 'proof' | 'mc' | 'short_answer' | 'essay' | 'modeling';
  difficulty: number; // 1-10
  topic: string;
  description: string;
  hints: string[];
  solution: string;
  points: number;
};

export type StudyPlanDay = {
  day: number; // 1-7
  focus_topic: string;
  tasks: StudyPlanTask[];
  review_topics: string[];
};

export type StudyPlanTask = {
  time_block: string; // e.g., "Morning", "Afternoon", "Evening"
  activity: string;
  duration_minutes: number;
  resources: string[];
};

export type Flashcard = {
  id: string;
  front: string;
  back: string;
  category: 'definition' | 'theorem' | 'proof_technique' | 'formula' | 'concept';
  difficulty: number; // 1-5
  tags: string[];
};

// ============================================================================
// Metadata Types
// ============================================================================

export type ExtractionMetadata = {
  mathpix_job_id?: string;
  page_count?: number;
  processing_time_ms?: number;
  confidence_score?: number;
  warnings?: string[];
  error?: string;
};

// ============================================================================
// Database Type for Supabase Compatibility
// ============================================================================

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          display_name?: string | null;
          email: string;
          credits?: number;
          tier?: UserTier;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Profile, 'id'>>;
        Relationships: [];
      };
      sessions: {
        Row: Session;
        Insert: {
          id?: string;
          user_id?: string | null;
          credits?: number;
          expires_at?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Session, 'id'>>;
        Relationships: [];
      };
      analyses: {
        Row: Analysis;
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          status?: AnalysisStatus;
          stage?: number;
          result_concepts?: Concept[] | null;
          result_task_patterns?: TaskPattern[] | null;
          result_priorities?: Priority[] | null;
          result_exam_problems?: ExamProblem[] | null;
          result_study_plan?: StudyPlanDay[] | null;
          result_flashcards?: Flashcard[] | null;
          result_report_url?: string | null;
          total_pages?: number;
          total_tokens_used?: number;
          processing_time_ms?: number | null;
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Analysis, 'id' | 'created_at'>>;
        Relationships: [];
      };
      documents: {
        Row: Document;
        Insert: {
          id?: string;
          analysis_id?: string | null;
          file_name: string;
          file_size?: number;
          storage_path?: string;
          doc_type?: DocumentType;
          status?: DocumentStatus;
          mathpix_job_id?: string | null;
          extracted_text?: string | null;
          extraction_metadata?: ExtractionMetadata | null;
          created_at?: string;
        };
        Update: Partial<Omit<Document, 'id'>>;
        Relationships: [];
      };
      chunks: {
        Row: Chunk;
        Insert: {
          id?: string;
          document_id: string;
          analysis_id: string;
          chunk_index: number;
          content: string;
          token_count?: number;
          category?: ChunkCategory;
          created_at?: string;
        };
        Update: Partial<Omit<Chunk, 'id'>>;
        Relationships: [];
      };
      payments: {
        Row: Payment;
        Insert: {
          id?: string;
          session_id: string;
          user_id?: string | null;
          paypal_order_id?: string;
          amount_eur: number;
          credits_granted: number;
          status?: PaymentStatus;
          created_at?: string;
        };
        Update: Partial<Omit<Payment, 'id'>>;
        Relationships: [];
      };
      products: {
        Row: Product;
        Insert: {
          id?: string;
          analysis_id: string;
          title: string;
          subject: string;
          description?: string;
          price_eur: number;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Product, 'id'>>;
        Relationships: [];
      };
      orders: {
        Row: Order;
        Insert: {
          id?: string;
          product_id: string;
          customer_email: string;
          status?: OrderStatus;
          download_token?: string | null;
          download_token_expires_at?: string | null;
          confirmed_at?: string | null;
          created_at?: string;
        };
        Update: Partial<Omit<Order, 'id'>>;
        Relationships: [];
      };
    };
    Views: Record<string, unknown>;
    Functions: Record<string, unknown>;
    Enums: {
      analysis_status: AnalysisStatus;
      document_type: DocumentType;
      document_status: DocumentStatus;
      chunk_category: ChunkCategory;
      user_tier: UserTier;
      payment_status: PaymentStatus;
      order_status: OrderStatus;
    };
    CompositeTypes: Record<string, unknown>;
  };
};

// ============================================================================
// Utility Types
// ============================================================================

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Inserts<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert'];

export type Updates<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update'];

// ============================================================================
// API Response Types
// ============================================================================

export type ApiResponse<T = unknown> = {
  success: true;
  data: T;
} | {
  success: false;
  error: string;
  code?: string;
};

export type AnalysisWithDocuments = Analysis & {
  documents: Document[];
};

export type AnalysisWithChunks = Analysis & {
  chunks: Chunk[];
};

export type AnalysisFullDetails = Analysis & {
  documents: (Document & {
    chunks: Chunk[];
  })[];
  session: Session;
  profile: Profile | null;
};

export type ProductWithAnalysis = Product & {
  analyses: Analysis;
};

export type OrderWithProduct = Order & {
  products: Product;
};
