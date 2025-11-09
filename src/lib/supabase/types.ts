export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chats: {
        Row: {
          created_at: string | null
          id: string
          is_open: boolean | null
          request_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_open?: boolean | null
          request_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_open?: boolean | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chats_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_ledger: {
        Row: {
          amount: number
          created_at: string | null
          direction: string
          id: string
          reason: string
          reference_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          direction: string
          id?: string
          reason: string
          reference_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          direction?: string
          id?: string
          reason?: string
          reference_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "credit_ledger_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          request_id: string
          status: Database["public"]["Enums"]["escrow_status"]
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          request_id: string
          status?: Database["public"]["Enums"]["escrow_status"]
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          request_id?: string
          status?: Database["public"]["Enums"]["escrow_status"]
        }
        Relationships: [
          {
            foreignKeyName: "escrow_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: true
            referencedRelation: "requests"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string | null
          chat_id: string
          created_at: string | null
          id: string
          kind: string
          metadata: Json | null
          sender_id: string
        }
        Insert: {
          body?: string | null
          chat_id: string
          created_at?: string | null
          id?: string
          kind?: string
          metadata?: Json | null
          sender_id: string
        }
        Update: {
          body?: string | null
          chat_id?: string
          created_at?: string | null
          id?: string
          kind?: string
          metadata?: Json | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey"
            columns: ["chat_id"]
            isOneToOne: false
            referencedRelation: "chats"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          id: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          id?: string
          username?: string
        }
        Relationships: []
      }
      requests: {
        Row: {
          borrower_id: string
          created_at: string | null
          id: string
          lender_id: string
          note: string | null
          resource_id: string
          status: Database["public"]["Enums"]["request_status"]
          total_estimated_credits: number
        }
        Insert: {
          borrower_id: string
          created_at?: string | null
          id?: string
          lender_id: string
          note?: string | null
          resource_id: string
          status?: Database["public"]["Enums"]["request_status"]
          total_estimated_credits?: number
        }
        Update: {
          borrower_id?: string
          created_at?: string | null
          id?: string
          lender_id?: string
          note?: string | null
          resource_id?: string
          status?: Database["public"]["Enums"]["request_status"]
          total_estimated_credits?: number
        }
        Relationships: [
          {
            foreignKeyName: "requests_borrower_id_fkey"
            columns: ["borrower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_lender_id_fkey"
            columns: ["lender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "requests_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          created_at: string | null
          daily_rate_credits: number
          description: string | null
          id: string
          main_image_url: string | null
          name: string
          owner_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          daily_rate_credits: number
          description?: string | null
          id?: string
          main_image_url?: string | null
          name: string
          owner_id: string
          status?: string
        }
        Update: {
          created_at?: string | null
          daily_rate_credits?: number
          description?: string | null
          id?: string
          main_image_url?: string | null
          name?: string
          owner_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_credits: number
          locked_credits: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          available_credits?: number
          locked_credits?: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          available_credits?: number
          locked_credits?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
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
      [_ in never]: never
    }
    Enums: {
      escrow_status: "held" | "released" | "refunded"
      request_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "canceled"
        | "completed"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      escrow_status: ["held", "released", "refunded"],
      request_status: [
        "pending",
        "accepted",
        "rejected",
        "canceled",
        "completed",
      ],
    },
  },
} as const
