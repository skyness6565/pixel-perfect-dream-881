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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          age: number | null
          appointment_date: string
          appointment_time: string
          country: string | null
          created_at: string
          full_name: string
          id: string
          notes: string | null
          phone: string | null
          status: string
          user_id: string
        }
        Insert: {
          age?: number | null
          appointment_date: string
          appointment_time: string
          country?: string | null
          created_at?: string
          full_name: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          user_id: string
        }
        Update: {
          age?: number | null
          appointment_date?: string
          appointment_time?: string
          country?: string | null
          created_at?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      kyc_submissions: {
        Row: {
          back_path: string
          created_at: string
          front_path: string
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["kyc_status"]
          user_id: string
        }
        Insert: {
          back_path: string
          created_at?: string
          front_path: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          user_id: string
        }
        Update: {
          back_path?: string
          created_at?: string
          front_path?: string
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["kyc_status"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          balance: number
          block_reason: string | null
          blocked: boolean
          created_at: string
          email: string | null
          full_name: string | null
          id: string
        }
        Insert: {
          balance?: number
          block_reason?: string | null
          blocked?: boolean
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
        }
        Update: {
          balance?: number
          block_reason?: string | null
          blocked?: boolean
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_transaction_reviews: {
        Row: {
          created_at: string
          id: string
          reason: string
          reviewed_by: string
          status: string
          transaction_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason: string
          reviewed_by: string
          status: string
          transaction_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string
          reviewed_by?: string
          status?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawal_transaction_reviews_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "withdrawal_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_transactions: {
        Row: {
          account_holder: string
          account_last4: string
          account_type: string
          amount: number
          bank_name: string
          created_at: string
          email: string
          id: string
          reference: string
          reviewed_at: string | null
          reviewed_by: string | null
          routing_last4: string
          status: string
          status_reason: string
          user_id: string
        }
        Insert: {
          account_holder: string
          account_last4: string
          account_type: string
          amount: number
          bank_name: string
          created_at?: string
          email: string
          id?: string
          reference?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          routing_last4: string
          status?: string
          status_reason?: string
          user_id: string
        }
        Update: {
          account_holder?: string
          account_last4?: string
          account_type?: string
          amount?: number
          bank_name?: string
          created_at?: string
          email?: string
          id?: string
          reference?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          routing_last4?: string
          status?: string
          status_reason?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_adjust_balance: {
        Args: { _amount: number; _user_id: string }
        Returns: number
      }
      admin_review_withdrawal: {
        Args: { _id: string; _reason: string; _status: string }
        Returns: {
          account_holder: string
          account_last4: string
          account_type: string
          amount: number
          bank_name: string
          created_at: string
          email: string
          id: string
          reference: string
          reviewed_at: string | null
          reviewed_by: string | null
          routing_last4: string
          status: string
          status_reason: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "withdrawal_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_kyc_approved: { Args: { _user_id: string }; Returns: boolean }
      request_withdrawal: {
        Args: {
          _account_holder: string
          _account_number: string
          _account_type: string
          _amount: number
          _bank_name: string
          _email: string
          _routing_number: string
        }
        Returns: {
          account_holder: string
          account_last4: string
          account_type: string
          amount: number
          bank_name: string
          created_at: string
          email: string
          id: string
          reference: string
          reviewed_at: string | null
          reviewed_by: string | null
          routing_last4: string
          status: string
          status_reason: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "withdrawal_transactions"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "user"
      kyc_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "user"],
      kyc_status: ["pending", "approved", "rejected"],
    },
  },
} as const
