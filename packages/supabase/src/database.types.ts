export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: Database["public"]["Enums"]["ai_message_role"]
          user_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["ai_message_role"]
          user_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["ai_message_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_messages_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      check_ins: {
        Row: {
          created_at: string
          date: string
          digestion: number
          energy: number
          id: string
          mood: number
          note: string | null
          sleep: number
          stress: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          digestion: number
          energy: number
          id?: string
          mood: number
          note?: string | null
          sleep: number
          stress: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          digestion?: number
          energy?: number
          id?: string
          mood?: number
          note?: string | null
          sleep?: number
          stress?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consent_events: {
        Row: {
          created_at: string
          granted: boolean
          id: number
          kind: Database["public"]["Enums"]["consent_kind"]
          policy_version: string
          user_id: string
        }
        Insert: {
          created_at?: string
          granted: boolean
          id?: never
          kind: Database["public"]["Enums"]["consent_kind"]
          policy_version?: string
          user_id: string
        }
        Update: {
          created_at?: string
          granted?: boolean
          id?: never
          kind?: Database["public"]["Enums"]["consent_kind"]
          policy_version?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "consent_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      consultation_reports: {
        Row: {
          body: string
          consultation_id: string
          created_at: string
          shared_at: string | null
          updated_at: string
        }
        Insert: {
          body: string
          consultation_id: string
          created_at?: string
          shared_at?: string | null
          updated_at?: string
        }
        Update: {
          body?: string
          consultation_id?: string
          created_at?: string
          shared_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "consultation_reports_consultation_id_fkey"
            columns: ["consultation_id"]
            isOneToOne: true
            referencedRelation: "consultations"
            referencedColumns: ["id"]
          },
        ]
      }
      consultations: {
        Row: {
          cal_booking_uid: string
          created_at: string
          email: string
          ends_at: string
          id: string
          location: string | null
          meeting_url: string | null
          mode: Database["public"]["Enums"]["consultation_mode"]
          starts_at: string
          status: Database["public"]["Enums"]["consultation_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          cal_booking_uid: string
          created_at?: string
          email: string
          ends_at: string
          id?: string
          location?: string | null
          meeting_url?: string | null
          mode: Database["public"]["Enums"]["consultation_mode"]
          starts_at: string
          status?: Database["public"]["Enums"]["consultation_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          cal_booking_uid?: string
          created_at?: string
          email?: string
          ends_at?: string
          id?: string
          location?: string | null
          meeting_url?: string | null
          mode?: Database["public"]["Enums"]["consultation_mode"]
          starts_at?: string
          status?: Database["public"]["Enums"]["consultation_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "consultations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      contents: {
        Row: {
          body: Json | null
          created_at: string
          duration_minutes: number | null
          id: string
          is_free: boolean
          kind: Database["public"]["Enums"]["content_kind"]
          media_path: string | null
          status: Database["public"]["Enums"]["publication_status"]
          title: NonNullable<Json>
          updated_at: string
        }
        Insert: {
          body?: Json | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_free?: boolean
          kind: Database["public"]["Enums"]["content_kind"]
          media_path?: string | null
          status?: Database["public"]["Enums"]["publication_status"]
          title: NonNullable<Json>
          updated_at?: string
        }
        Update: {
          body?: Json | null
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_free?: boolean
          kind?: Database["public"]["Enums"]["content_kind"]
          media_path?: string | null
          status?: Database["public"]["Enums"]["publication_status"]
          title?: NonNullable<Json>
          updated_at?: string
        }
        Relationships: []
      }
      enrollments: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          program_id: string
          started_on: string
          status: Database["public"]["Enums"]["enrollment_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          program_id: string
          started_on?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          program_id?: string
          started_on?: string
          status?: Database["public"]["Enums"]["enrollment_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      entitlements: {
        Row: {
          created_at: string
          email: string
          expires_at: string | null
          id: string
          product_id: string
          revoked_at: string | null
          source: Database["public"]["Enums"]["entitlement_source"]
          source_ref: string
          starts_at: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string | null
          id?: string
          product_id: string
          revoked_at?: string | null
          source: Database["public"]["Enums"]["entitlement_source"]
          source_ref: string
          starts_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string | null
          id?: string
          product_id?: string
          revoked_at?: string | null
          source?: Database["public"]["Enums"]["entitlement_source"]
          source_ref?: string
          starts_at?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "entitlements_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "entitlements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      journal_entries: {
        Row: {
          body: string | null
          created_at: string
          entry_date: string
          id: string
          photo_paths: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          photo_paths?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          entry_date?: string
          id?: string
          photo_paths?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "journal_entries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_completions: {
        Row: {
          completed_on: string
          created_at: string
          enrollment_id: string
          id: string
          practice_id: string
          user_id: string
        }
        Insert: {
          completed_on?: string
          created_at?: string
          enrollment_id: string
          id?: string
          practice_id: string
          user_id: string
        }
        Update: {
          completed_on?: string
          created_at?: string
          enrollment_id?: string
          id?: string
          practice_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_completions_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_completions_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "practice_completions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      practices: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          instructions: Json | null
          position: number
          program_day_id: string
          title: NonNullable<Json>
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          instructions?: Json | null
          position?: number
          program_day_id: string
          title: NonNullable<Json>
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          instructions?: Json | null
          position?: number
          program_day_id?: string
          title?: NonNullable<Json>
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "practices_program_day_id_fkey"
            columns: ["program_day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["product_kind"]
          program_id: string | null
          store_product_id: string | null
          stripe_price_id: string | null
          title: NonNullable<Json>
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind: Database["public"]["Enums"]["product_kind"]
          program_id?: string | null
          store_product_id?: string | null
          stripe_price_id?: string | null
          title: NonNullable<Json>
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["product_kind"]
          program_id?: string | null
          store_product_id?: string | null
          stripe_price_id?: string | null
          title?: NonNullable<Json>
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          dosha: Database["public"]["Enums"]["dosha"] | null
          email: string
          id: string
          locale: Database["public"]["Enums"]["app_locale"]
          role: Database["public"]["Enums"]["app_role"]
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          dosha?: Database["public"]["Enums"]["dosha"] | null
          email: string
          id: string
          locale?: Database["public"]["Enums"]["app_locale"]
          role?: Database["public"]["Enums"]["app_role"]
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          dosha?: Database["public"]["Enums"]["dosha"] | null
          email?: string
          id?: string
          locale?: Database["public"]["Enums"]["app_locale"]
          role?: Database["public"]["Enums"]["app_role"]
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      program_day_contents: {
        Row: {
          content_id: string
          position: number
          program_day_id: string
        }
        Insert: {
          content_id: string
          position?: number
          program_day_id: string
        }
        Update: {
          content_id?: string
          position?: number
          program_day_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_day_contents_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_day_contents_program_day_id_fkey"
            columns: ["program_day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
        ]
      }
      program_days: {
        Row: {
          created_at: string
          day_number: number
          id: string
          intro: Json | null
          program_id: string
          title: NonNullable<Json>
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_number: number
          id?: string
          intro?: Json | null
          program_id: string
          title: NonNullable<Json>
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_number?: number
          id?: string
          intro?: Json | null
          program_id?: string
          title?: NonNullable<Json>
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "program_days_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      programs: {
        Row: {
          cover_path: string | null
          created_at: string
          description: Json | null
          duration_days: number
          id: string
          is_free: boolean
          position: number
          slug: string
          status: Database["public"]["Enums"]["publication_status"]
          summary: Json | null
          title: NonNullable<Json>
          updated_at: string
        }
        Insert: {
          cover_path?: string | null
          created_at?: string
          description?: Json | null
          duration_days: number
          id?: string
          is_free?: boolean
          position?: number
          slug: string
          status?: Database["public"]["Enums"]["publication_status"]
          summary?: Json | null
          title: NonNullable<Json>
          updated_at?: string
        }
        Update: {
          cover_path?: string | null
          created_at?: string
          description?: Json | null
          duration_days?: number
          id?: string
          is_free?: boolean
          position?: number
          slug?: string
          status?: Database["public"]["Enums"]["publication_status"]
          summary?: Json | null
          title?: NonNullable<Json>
          updated_at?: string
        }
        Relationships: []
      }
      quiz_attempts: {
        Row: {
          created_at: string
          dosha: Database["public"]["Enums"]["dosha"] | null
          id: string
          quiz_id: string
          result: NonNullable<Json>
          selected_option_ids: string[]
          user_id: string
        }
        Insert: {
          created_at?: string
          dosha?: Database["public"]["Enums"]["dosha"] | null
          id?: string
          quiz_id: string
          result?: NonNullable<Json>
          selected_option_ids: string[]
          user_id: string
        }
        Update: {
          created_at?: string
          dosha?: Database["public"]["Enums"]["dosha"] | null
          id?: string
          quiz_id?: string
          result?: NonNullable<Json>
          selected_option_ids?: string[]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_attempts_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quiz_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_options: {
        Row: {
          created_at: string
          dosha_scores: NonNullable<Json>
          id: string
          is_correct: boolean
          label: NonNullable<Json>
          position: number
          question_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dosha_scores?: NonNullable<Json>
          id?: string
          is_correct?: boolean
          label: NonNullable<Json>
          position?: number
          question_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dosha_scores?: NonNullable<Json>
          id?: string
          is_correct?: boolean
          label?: NonNullable<Json>
          position?: number
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "quiz_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          created_at: string
          id: string
          position: number
          prompt: NonNullable<Json>
          quiz_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          position?: number
          prompt: NonNullable<Json>
          quiz_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          position?: number
          prompt?: NonNullable<Json>
          quiz_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_questions_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      quizzes: {
        Row: {
          created_at: string
          description: Json | null
          id: string
          kind: Database["public"]["Enums"]["quiz_kind"]
          program_id: string | null
          slug: string
          status: Database["public"]["Enums"]["publication_status"]
          title: NonNullable<Json>
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: Json | null
          id?: string
          kind: Database["public"]["Enums"]["quiz_kind"]
          program_id?: string | null
          slug: string
          status?: Database["public"]["Enums"]["publication_status"]
          title: NonNullable<Json>
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: Json | null
          id?: string
          kind?: Database["public"]["Enums"]["quiz_kind"]
          program_id?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["publication_status"]
          title?: NonNullable<Json>
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "quizzes_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
        ]
      }
      ratings: {
        Row: {
          comment: string | null
          content_id: string | null
          created_at: string
          id: string
          practice_id: string | null
          program_day_id: string | null
          program_id: string | null
          score: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          practice_id?: string | null
          program_day_id?: string | null
          program_id?: string | null
          score: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          content_id?: string | null
          created_at?: string
          id?: string
          practice_id?: string | null
          program_day_id?: string | null
          program_id?: string | null
          score?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "contents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_practice_id_fkey"
            columns: ["practice_id"]
            isOneToOne: false
            referencedRelation: "practices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_program_day_id_fkey"
            columns: ["program_day_id"]
            isOneToOne: false
            referencedRelation: "program_days"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_reviews: {
        Row: {
          created_at: string
          id: string
          metrics: NonNullable<Json>
          summary: string | null
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          metrics?: NonNullable<Json>
          summary?: string | null
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          metrics?: NonNullable<Json>
          summary?: string | null
          user_id?: string
          week_start?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_consent: {
        Args: {
          consent: Database["public"]["Enums"]["consent_kind"]
          target_user: string
        }
        Returns: boolean
      }
      has_program_access: { Args: { target_program: string }; Returns: boolean }
      is_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      set_user_role: {
        Args: {
          new_role: Database["public"]["Enums"]["app_role"]
          target_user: string
        }
        Returns: undefined
      }
    }
    Enums: {
      ai_message_role: "user" | "assistant"
      app_locale: "fr" | "en" | "es"
      app_role: "user" | "admin"
      consent_kind: "health_tracking" | "ai_processing" | "journal_sharing"
      consultation_mode: "video" | "in_person"
      consultation_status: "booked" | "cancelled" | "completed" | "no_show"
      content_kind: "article" | "recipe" | "practice" | "audio" | "video"
      dosha: "vata" | "pitta" | "kapha"
      enrollment_status: "active" | "paused" | "completed" | "abandoned"
      entitlement_source: "revenuecat" | "stripe" | "admin"
      product_kind: "program" | "subscription"
      publication_status: "draft" | "published" | "archived"
      quiz_kind: "dosha" | "knowledge"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      ai_message_role: ["user", "assistant"],
      app_locale: ["fr", "en", "es"],
      app_role: ["user", "admin"],
      consent_kind: ["health_tracking", "ai_processing", "journal_sharing"],
      consultation_mode: ["video", "in_person"],
      consultation_status: ["booked", "cancelled", "completed", "no_show"],
      content_kind: ["article", "recipe", "practice", "audio", "video"],
      dosha: ["vata", "pitta", "kapha"],
      enrollment_status: ["active", "paused", "completed", "abandoned"],
      entitlement_source: ["revenuecat", "stripe", "admin"],
      product_kind: ["program", "subscription"],
      publication_status: ["draft", "published", "archived"],
      quiz_kind: ["dosha", "knowledge"],
    },
  },
} as const

