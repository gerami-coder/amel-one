export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      attendees: {
        Row: {
          created_at: string;
          email: string;
          full_name: string;
          id: string;
          organization_id: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          full_name: string;
          id?: string;
          organization_id: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          full_name?: string;
          id?: string;
          organization_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "attendees_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      audit_logs: {
        Row: {
          action: string;
          actor_id: string | null;
          created_at: string;
          entity_id: string;
          id: string;
          metadata: Json;
          organization_id: string;
        };
        Insert: {
          action: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id: string;
          id?: string;
          metadata?: Json;
          organization_id: string;
        };
        Update: {
          action?: string;
          actor_id?: string | null;
          created_at?: string;
          entity_id?: string;
          id?: string;
          metadata?: Json;
          organization_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      event_versions: {
        Row: {
          created_at: string;
          event_id: string;
          id: string;
          organization_id: string;
          snapshot: Json;
          version: number;
        };
        Insert: {
          created_at?: string;
          event_id: string;
          id?: string;
          organization_id: string;
          snapshot: Json;
          version: number;
        };
        Update: {
          created_at?: string;
          event_id?: string;
          id?: string;
          organization_id?: string;
          snapshot?: Json;
          version?: number;
        };
        Relationships: [
          {
            foreignKeyName: "event_versions_organization_id_event_id_fkey";
            columns: ["organization_id", "event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      events: {
        Row: {
          active_version_id: string | null;
          created_at: string;
          description: string;
          draft: Json;
          ends_at: string;
          event_type: string;
          id: string;
          location: string;
          name: string;
          organization_id: string;
          published_at: string | null;
          registration_closes_at: string | null;
          revision: number;
          slug: string;
          starts_at: string;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          active_version_id?: string | null;
          created_at?: string;
          description?: string;
          draft?: Json;
          ends_at: string;
          event_type?: string;
          id?: string;
          location?: string;
          name: string;
          organization_id: string;
          published_at?: string | null;
          registration_closes_at?: string | null;
          revision?: number;
          slug: string;
          starts_at: string;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          active_version_id?: string | null;
          created_at?: string;
          description?: string;
          draft?: Json;
          ends_at?: string;
          event_type?: string;
          id?: string;
          location?: string;
          name?: string;
          organization_id?: string;
          published_at?: string | null;
          registration_closes_at?: string | null;
          revision?: number;
          slug?: string;
          starts_at?: string;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "active_version_event_fk";
            columns: ["organization_id", "id", "active_version_id"];
            isOneToOne: false;
            referencedRelation: "event_versions";
            referencedColumns: ["organization_id", "event_id", "id"];
          },
          {
            foreignKeyName: "events_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
        ];
      };
      organization_members: {
        Row: {
          created_at: string;
          organization_id: string;
          role_key: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          organization_id: string;
          role_key: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          organization_id?: string;
          role_key?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_role_key_fkey";
            columns: ["role_key"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["key"];
          },
        ];
      };
      organizations: {
        Row: {
          created_at: string;
          created_by: string;
          id: string;
          name: string;
        };
        Insert: {
          created_at?: string;
          created_by: string;
          id?: string;
          name: string;
        };
        Update: {
          created_at?: string;
          created_by?: string;
          id?: string;
          name?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          key: string;
        };
        Insert: {
          key: string;
        };
        Update: {
          key?: string;
        };
        Relationships: [];
      };
      registration_answers: {
        Row: {
          answers: Json;
          organization_id: string;
          registration_id: string;
        };
        Insert: {
          answers: Json;
          organization_id: string;
          registration_id: string;
        };
        Update: {
          answers?: Json;
          organization_id?: string;
          registration_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registration_answers_organization_id_registration_id_fkey";
            columns: ["organization_id", "registration_id"];
            isOneToOne: true;
            referencedRelation: "registrations";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      registration_status_history: {
        Row: {
          actor_id: string | null;
          created_at: string;
          from_status: string | null;
          id: string;
          organization_id: string;
          registration_id: string;
          to_status: string;
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          organization_id: string;
          registration_id: string;
          to_status: string;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          from_status?: string | null;
          id?: string;
          organization_id?: string;
          registration_id?: string;
          to_status?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registration_status_history_organization_id_registration_i_fkey";
            columns: ["organization_id", "registration_id"];
            isOneToOne: false;
            referencedRelation: "registrations";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      registration_types: {
        Row: {
          active: boolean;
          approval: boolean;
          capacity: number;
          event_id: string;
          id: string;
          name: string;
          organization_id: string;
        };
        Insert: {
          active?: boolean;
          approval?: boolean;
          capacity: number;
          event_id: string;
          id: string;
          name: string;
          organization_id: string;
        };
        Update: {
          active?: boolean;
          approval?: boolean;
          capacity?: number;
          event_id?: string;
          id?: string;
          name?: string;
          organization_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registration_types_organization_id_event_id_fkey";
            columns: ["organization_id", "event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["organization_id", "id"];
          },
        ];
      };
      registrations: {
        Row: {
          attendee_id: string;
          created_at: string;
          email: string;
          event_id: string;
          fingerprint: string;
          full_name: string;
          id: string;
          organization_id: string;
          reference: string;
          request_id: string;
          status: string;
          type_id: string;
          version_id: string;
        };
        Insert: {
          attendee_id: string;
          created_at?: string;
          email: string;
          event_id: string;
          fingerprint: string;
          full_name: string;
          id?: string;
          organization_id: string;
          reference?: string;
          request_id: string;
          status: string;
          type_id: string;
          version_id: string;
        };
        Update: {
          attendee_id?: string;
          created_at?: string;
          email?: string;
          event_id?: string;
          fingerprint?: string;
          full_name?: string;
          id?: string;
          organization_id?: string;
          reference?: string;
          request_id?: string;
          status?: string;
          type_id?: string;
          version_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "registrations_organization_id_attendee_id_fkey";
            columns: ["organization_id", "attendee_id"];
            isOneToOne: false;
            referencedRelation: "attendees";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "registrations_organization_id_event_id_fkey";
            columns: ["organization_id", "event_id"];
            isOneToOne: false;
            referencedRelation: "events";
            referencedColumns: ["organization_id", "id"];
          },
          {
            foreignKeyName: "registrations_organization_id_event_id_type_id_fkey";
            columns: ["organization_id", "event_id", "type_id"];
            isOneToOne: false;
            referencedRelation: "registration_types";
            referencedColumns: ["organization_id", "event_id", "id"];
          },
          {
            foreignKeyName: "registrations_organization_id_event_id_version_id_fkey";
            columns: ["organization_id", "event_id", "version_id"];
            isOneToOne: false;
            referencedRelation: "event_versions";
            referencedColumns: ["organization_id", "event_id", "id"];
          },
        ];
      };
      role_permissions: {
        Row: {
          permission_key: string;
          role_key: string;
        };
        Insert: {
          permission_key: string;
          role_key: string;
        };
        Update: {
          permission_key?: string;
          role_key?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey";
            columns: ["permission_key"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["key"];
          },
          {
            foreignKeyName: "role_permissions_role_key_fkey";
            columns: ["role_key"];
            isOneToOne: false;
            referencedRelation: "roles";
            referencedColumns: ["key"];
          },
        ];
      };
      roles: {
        Row: {
          key: string;
          name: string;
        };
        Insert: {
          key: string;
          name: string;
        };
        Update: {
          key?: string;
          name?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      create_event: { Args: { payload: Json }; Returns: Json };
      create_organization: { Args: { org_name: string }; Returns: string };
      public_event: { Args: { event_slug: string }; Returns: Json };
      publish_event: {
        Args: { expected_revision: number; target: string };
        Returns: string;
      };
      review_registration: {
        Args: { decision: string; target: string };
        Returns: undefined;
      };
      save_event: {
        Args: { expected_revision: number; payload: Json; target: string };
        Returns: Json;
      };
      submit_registration: {
        Args: {
          answers: Json;
          email_address: string;
          event_slug: string;
          name: string;
          registration_type: string;
          request: string;
          version: string;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
