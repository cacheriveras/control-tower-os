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
      activity_log: {
        Row: {
          action: string
          actor_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          workspace_id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          workspace_id: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_log_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          milestone_id: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          id?: string
          milestone_id?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          milestone_id?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_metrics: {
        Row: {
          comment: string | null
          created_at: string
          current_value: number | null
          id: string
          measured_at: string | null
          name: string
          sort_order: number
          status: string | null
          target_value: number | null
          unit: string | null
          updated_at: string
          workspace_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          current_value?: number | null
          id?: string
          measured_at?: string | null
          name: string
          sort_order?: number
          status?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          workspace_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          current_value?: number | null
          id?: string
          measured_at?: string | null
          name?: string
          sort_order?: number
          status?: string | null
          target_value?: number | null
          unit?: string | null
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_metrics_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      decision_milestones: {
        Row: {
          decision_id: string
          milestone_id: string
        }
        Insert: {
          decision_id: string
          milestone_id: string
        }
        Update: {
          decision_id?: string
          milestone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decision_milestones_decision_id_fkey"
            columns: ["decision_id"]
            isOneToOne: false
            referencedRelation: "decisions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decision_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          context: string | null
          created_at: string
          decided_at: string | null
          decision: string | null
          id: string
          is_parking_lot: boolean
          options_considered: string | null
          owner_id: string | null
          rationale: string | null
          review_at: string | null
          status: string
          title: string
          updated_at: string
          workspace_id: string
        }
        Insert: {
          context?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          id?: string
          is_parking_lot?: boolean
          options_considered?: string | null
          owner_id?: string | null
          rationale?: string | null
          review_at?: string | null
          status?: string
          title: string
          updated_at?: string
          workspace_id: string
        }
        Update: {
          context?: string | null
          created_at?: string
          decided_at?: string | null
          decision?: string | null
          id?: string
          is_parking_lot?: boolean
          options_considered?: string | null
          owner_id?: string | null
          rationale?: string | null
          review_at?: string | null
          status?: string
          title?: string
          updated_at?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "decisions_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      evidence_links: {
        Row: {
          created_at: string
          created_by: string
          id: string
          label: string
          milestone_id: string
          url: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          label: string
          milestone_id: string
          url: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          label?: string
          milestone_id?: string
          url?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "evidence_links_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "evidence_links_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      milestone_dependencies: {
        Row: {
          depends_on_milestone_id: string
          milestone_id: string
        }
        Insert: {
          depends_on_milestone_id: string
          milestone_id: string
        }
        Update: {
          depends_on_milestone_id?: string
          milestone_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestone_dependencies_depends_on_milestone_id_fkey"
            columns: ["depends_on_milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestone_dependencies_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "milestones"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          blocked_at: string | null
          blocked_reason: string | null
          code: string
          completed_at: string | null
          created_at: string
          definition_of_done: Json
          description: string | null
          due_date: string | null
          effort: Database["public"]["Enums"]["effort_size"] | null
          focus_pinned: boolean
          id: string
          is_launch_gate: boolean
          next_action: string | null
          owner_id: string | null
          priority: Database["public"]["Enums"]["milestone_priority"]
          progress: number
          requires_professional: Database["public"]["Enums"]["requires_professional"]
          risk_level: Database["public"]["Enums"]["risk_level"]
          snoozed_until: string | null
          source_document: string | null
          source_reference: string | null
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at: string
          week_target: number
          why_it_matters: string | null
          workspace_id: string
          workstream_id: string
        }
        Insert: {
          blocked_at?: string | null
          blocked_reason?: string | null
          code: string
          completed_at?: string | null
          created_at?: string
          definition_of_done?: Json
          description?: string | null
          due_date?: string | null
          effort?: Database["public"]["Enums"]["effort_size"] | null
          focus_pinned?: boolean
          id?: string
          is_launch_gate?: boolean
          next_action?: string | null
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["milestone_priority"]
          progress?: number
          requires_professional?: Database["public"]["Enums"]["requires_professional"]
          risk_level?: Database["public"]["Enums"]["risk_level"]
          snoozed_until?: string | null
          source_document?: string | null
          source_reference?: string | null
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at?: string
          week_target?: number
          why_it_matters?: string | null
          workspace_id: string
          workstream_id: string
        }
        Update: {
          blocked_at?: string | null
          blocked_reason?: string | null
          code?: string
          completed_at?: string | null
          created_at?: string
          definition_of_done?: Json
          description?: string | null
          due_date?: string | null
          effort?: Database["public"]["Enums"]["effort_size"] | null
          focus_pinned?: boolean
          id?: string
          is_launch_gate?: boolean
          next_action?: string | null
          owner_id?: string | null
          priority?: Database["public"]["Enums"]["milestone_priority"]
          progress?: number
          requires_professional?: Database["public"]["Enums"]["requires_professional"]
          risk_level?: Database["public"]["Enums"]["risk_level"]
          snoozed_until?: string | null
          source_document?: string | null
          source_reference?: string | null
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          updated_at?: string
          week_target?: number
          why_it_matters?: string | null
          workspace_id?: string
          workstream_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_workstream_id_fkey"
            columns: ["workstream_id"]
            isOneToOne: false
            referencedRelation: "workstreams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          blockers: string | null
          closed_at: string | null
          confidence_score: number | null
          created_at: string
          decisions: string | null
          end_date: string
          evidence_learned: string | null
          id: string
          main_risk: string | null
          next_top_three: Json
          progress_snapshot: Json | null
          start_date: string
          stop_doing: string | null
          updated_at: string
          week_number: number
          wins: string | null
          workspace_id: string
        }
        Insert: {
          blockers?: string | null
          closed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          decisions?: string | null
          end_date: string
          evidence_learned?: string | null
          id?: string
          main_risk?: string | null
          next_top_three?: Json
          progress_snapshot?: Json | null
          start_date: string
          stop_doing?: string | null
          updated_at?: string
          week_number: number
          wins?: string | null
          workspace_id: string
        }
        Update: {
          blockers?: string | null
          closed_at?: string | null
          confidence_score?: number | null
          created_at?: string
          decisions?: string | null
          end_date?: string
          evidence_learned?: string | null
          id?: string
          main_risk?: string | null
          next_top_three?: Json
          progress_snapshot?: Json | null
          start_date?: string
          stop_doing?: string | null
          updated_at?: string
          week_number?: number
          wins?: string | null
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "weekly_reviews_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          created_at: string
          invited_email: string | null
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          invited_email?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          invited_email?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          created_at: string
          focus_milestone_id: string | null
          id: string
          jurisdiction: string
          launch_markets: string[]
          name: string
          owner_id: string
          start_date: string
          target_date: string
          timezone: string
          updated_at: string
          weekly_review_day: number
          wip_limit: number
        }
        Insert: {
          created_at?: string
          focus_milestone_id?: string | null
          id?: string
          jurisdiction?: string
          launch_markets?: string[]
          name: string
          owner_id: string
          start_date?: string
          target_date?: string
          timezone?: string
          updated_at?: string
          weekly_review_day?: number
          wip_limit?: number
        }
        Update: {
          created_at?: string
          focus_milestone_id?: string | null
          id?: string
          jurisdiction?: string
          launch_markets?: string[]
          name?: string
          owner_id?: string
          start_date?: string
          target_date?: string
          timezone?: string
          updated_at?: string
          weekly_review_day?: number
          wip_limit?: number
        }
        Relationships: []
      }
      workstreams: {
        Row: {
          code: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          sort_order: number
          weight: number
          workspace_id: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          sort_order?: number
          weight?: number
          workspace_id: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          sort_order?: number
          weight?: number
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workstreams_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_workspace_member: {
        Args: { _uid: string; _ws: string }
        Returns: boolean
      }
      is_workspace_owner: {
        Args: { _uid: string; _ws: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "owner" | "collaborator"
      effort_size: "S" | "M" | "L"
      milestone_priority: "P0" | "P1" | "P2"
      milestone_status:
        | "not_started"
        | "in_progress"
        | "blocked"
        | "in_validation"
        | "completed"
        | "parked"
      requires_professional:
        | "none"
        | "lawyer"
        | "accountant"
        | "insurance"
        | "multiple"
      risk_level: "low" | "medium" | "high"
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
      app_role: ["owner", "collaborator"],
      effort_size: ["S", "M", "L"],
      milestone_priority: ["P0", "P1", "P2"],
      milestone_status: [
        "not_started",
        "in_progress",
        "blocked",
        "in_validation",
        "completed",
        "parked",
      ],
      requires_professional: [
        "none",
        "lawyer",
        "accountant",
        "insurance",
        "multiple",
      ],
      risk_level: ["low", "medium", "high"],
    },
  },
} as const
