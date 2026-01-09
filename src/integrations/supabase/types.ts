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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      daily_objectives: {
        Row: {
          completed: boolean
          created_at: string
          current_distance: number
          date: string
          id: string
          reward_claimed: boolean
          target_distance: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          current_distance?: number
          date?: string
          id?: string
          reward_claimed?: boolean
          target_distance?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          current_distance?: number
          date?: string
          id?: string
          reward_claimed?: boolean
          target_distance?: number
          user_id?: string
        }
        Relationships: []
      }
      marathon_events: {
        Row: {
          completed: boolean
          created_at: string
          distance_completed: number
          event_date: string
          event_type: string
          id: string
          reward_amount: number
          reward_claimed: boolean
          target_distance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          distance_completed?: number
          event_date?: string
          event_type: string
          id?: string
          reward_amount: number
          reward_claimed?: boolean
          target_distance: number
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          distance_completed?: number
          event_date?: string
          event_type?: string
          id?: string
          reward_amount?: number
          reward_claimed?: boolean
          target_distance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      monthly_stats: {
        Row: {
          coins_earned: number
          created_at: string
          id: string
          levels_gained: number
          month_start: string
          total_calories: number
          total_distance: number
          total_duration: number
          total_runs: number
          total_score: number
          user_id: string
        }
        Insert: {
          coins_earned?: number
          created_at?: string
          id?: string
          levels_gained?: number
          month_start: string
          total_calories?: number
          total_distance?: number
          total_duration?: number
          total_runs?: number
          total_score?: number
          user_id: string
        }
        Update: {
          coins_earned?: number
          created_at?: string
          id?: string
          levels_gained?: number
          month_start?: string
          total_calories?: number
          total_distance?: number
          total_duration?: number
          total_runs?: number
          total_score?: number
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          coins: number
          created_at: string
          equipped_shoes: string
          exp: number
          id: string
          last_run_date: string | null
          level: number
          owned_shoes: string[]
          reputation: number
          reputation_level: string
          score_upgrade_level: number
          shoe_upgrades: Json
          skill_coins: number
          skill_points: number
          skill_score: number
          streak_days: number
          total_distance: number
          total_score: number
          updated_at: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          coins?: number
          created_at?: string
          equipped_shoes?: string
          exp?: number
          id: string
          last_run_date?: string | null
          level?: number
          owned_shoes?: string[]
          reputation?: number
          reputation_level?: string
          score_upgrade_level?: number
          shoe_upgrades?: Json
          skill_coins?: number
          skill_points?: number
          skill_score?: number
          streak_days?: number
          total_distance?: number
          total_score?: number
          updated_at?: string
          username: string
        }
        Update: {
          avatar_url?: string | null
          coins?: number
          created_at?: string
          equipped_shoes?: string
          exp?: number
          id?: string
          last_run_date?: string | null
          level?: number
          owned_shoes?: string[]
          reputation?: number
          reputation_level?: string
          score_upgrade_level?: number
          shoe_upgrades?: Json
          skill_coins?: number
          skill_points?: number
          skill_score?: number
          streak_days?: number
          total_distance?: number
          total_score?: number
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          created_at: string
          currency: string
          id: string
          item_id: string
          price: number
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          item_id: string
          price: number
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          item_id?: string
          price?: number
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      reputation_history: {
        Row: {
          created_at: string
          date: string
          distance_km: number
          id: string
          reputation_earned: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          distance_km?: number
          id?: string
          reputation_earned?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          distance_km?: number
          id?: string
          reputation_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      runs: {
        Row: {
          avg_speed: number
          calories: number
          coins_earned: number
          created_at: string
          distance: number
          duration: number
          exp_earned: number
          id: string
          path: Json | null
          score_earned: number
          user_id: string
        }
        Insert: {
          avg_speed?: number
          calories?: number
          coins_earned?: number
          created_at?: string
          distance?: number
          duration?: number
          exp_earned?: number
          id?: string
          path?: Json | null
          score_earned?: number
          user_id: string
        }
        Update: {
          avg_speed?: number
          calories?: number
          coins_earned?: number
          created_at?: string
          distance?: number
          duration?: number
          exp_earned?: number
          id?: string
          path?: Json | null
          score_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      weekly_stats: {
        Row: {
          created_at: string
          id: string
          total_calories: number
          total_distance: number
          total_duration: number
          total_runs: number
          total_score: number
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          total_calories?: number
          total_distance?: number
          total_duration?: number
          total_runs?: number
          total_score?: number
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          total_calories?: number
          total_distance?: number
          total_duration?: number
          total_runs?: number
          total_score?: number
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
