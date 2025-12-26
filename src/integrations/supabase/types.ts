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
      business_amenities: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      business_amenity_assignments: {
        Row: {
          amenity_id: string
          business_id: string
          created_at: string
          id: string
        }
        Insert: {
          amenity_id: string
          business_id: string
          created_at?: string
          id?: string
        }
        Update: {
          amenity_id?: string
          business_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_amenity_assignments_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "business_amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_amenity_assignments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_claims: {
        Row: {
          admin_notes: string | null
          business_id: string
          claimant_id: string
          created_at: string
          id: string
          notes: string | null
          proof_document: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          business_id: string
          claimant_id: string
          created_at?: string
          id?: string
          notes?: string | null
          proof_document?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          business_id?: string
          claimant_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          proof_document?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_claims_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_hours: {
        Row: {
          break_end: string | null
          break_start: string | null
          business_id: string
          close_time: string | null
          created_at: string
          day_of_week: number
          id: string
          is_closed: boolean
          open_time: string | null
        }
        Insert: {
          break_end?: string | null
          break_start?: string | null
          business_id: string
          close_time?: string | null
          created_at?: string
          day_of_week: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
        }
        Update: {
          break_end?: string | null
          break_start?: string | null
          business_id?: string
          close_time?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          is_closed?: boolean
          open_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_hours_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_images: {
        Row: {
          business_id: string
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
        }
        Insert: {
          business_id: string
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
        }
        Update: {
          business_id?: string
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "business_images_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_tag_assignments: {
        Row: {
          business_id: string
          created_at: string
          custom_tag: string | null
          id: string
          tag_id: string | null
        }
        Insert: {
          business_id: string
          created_at?: string
          custom_tag?: string | null
          id?: string
          tag_id?: string | null
        }
        Update: {
          business_id?: string
          created_at?: string
          custom_tag?: string | null
          id?: string
          tag_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_tag_assignments_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "business_tag_assignments_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "business_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      business_tags: {
        Row: {
          created_at: string
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      business_transfers: {
        Row: {
          business_id: string
          created_at: string
          from_user_id: string
          id: string
          message: string | null
          status: string
          to_user_email: string
          to_user_id: string | null
          updated_at: string
        }
        Insert: {
          business_id: string
          created_at?: string
          from_user_id: string
          id?: string
          message?: string | null
          status?: string
          to_user_email: string
          to_user_id?: string | null
          updated_at?: string
        }
        Update: {
          business_id?: string
          created_at?: string
          from_user_id?: string
          id?: string
          message?: string | null
          status?: string
          to_user_email?: string
          to_user_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "business_transfers_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string
          alternate_email: string | null
          alternate_phone: string | null
          business_type: string | null
          category_id: string
          city: string
          created_at: string
          description: string | null
          email: string
          facebook_url: string | null
          google_maps_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          logo_url: string | null
          name: string
          owner_id: string
          phone: string
          pincode: string | null
          price_range: string | null
          rejection_reason: string | null
          short_description: string | null
          slug: string | null
          state: string
          status: Database["public"]["Enums"]["business_status"]
          telegram: string | null
          twitter_url: string | null
          updated_at: string
          website: string | null
          whatsapp: string | null
          year_established: number | null
          youtube_url: string | null
        }
        Insert: {
          address: string
          alternate_email?: string | null
          alternate_phone?: string | null
          business_type?: string | null
          category_id: string
          city: string
          created_at?: string
          description?: string | null
          email: string
          facebook_url?: string | null
          google_maps_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          name: string
          owner_id: string
          phone: string
          pincode?: string | null
          price_range?: string | null
          rejection_reason?: string | null
          short_description?: string | null
          slug?: string | null
          state: string
          status?: Database["public"]["Enums"]["business_status"]
          telegram?: string | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
          year_established?: number | null
          youtube_url?: string | null
        }
        Update: {
          address?: string
          alternate_email?: string | null
          alternate_phone?: string | null
          business_type?: string | null
          category_id?: string
          city?: string
          created_at?: string
          description?: string | null
          email?: string
          facebook_url?: string | null
          google_maps_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          name?: string
          owner_id?: string
          phone?: string
          pincode?: string | null
          price_range?: string | null
          rejection_reason?: string | null
          short_description?: string | null
          slug?: string | null
          state?: string
          status?: Database["public"]["Enums"]["business_status"]
          telegram?: string | null
          twitter_url?: string | null
          updated_at?: string
          website?: string | null
          whatsapp?: string | null
          year_established?: number | null
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "businesses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          slug: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          slug?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          slug?: string | null
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string
        }
        Relationships: []
      }
      indian_states: {
        Row: {
          code: string
          id: string
          name: string
        }
        Insert: {
          code: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          address: string | null
          app_name: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          favicon_url: string | null
          id: string
          logo_url: string | null
          seo_description: string | null
          seo_title: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          app_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          app_name?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          favicon_url?: string | null
          id?: string
          logo_url?: string | null
          seo_description?: string | null
          seo_title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_blocked: boolean | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          is_blocked?: boolean | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_blocked?: boolean | null
          phone?: string | null
          updated_at?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_category_slug: { Args: { name: string }; Returns: string }
      generate_slug: { Args: { name: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      business_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin", "user"],
      business_status: ["pending", "approved", "rejected"],
    },
  },
} as const
