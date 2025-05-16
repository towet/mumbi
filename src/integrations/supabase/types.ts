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
      alerts: {
        Row: {
          animal_id: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string
          id: string
          priority: string
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date: string
          id?: string
          priority: string
          status: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string
          id?: string
          priority?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alerts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      animals: {
        Row: {
          age: string | null
          birth_date: string | null
          breed: string
          created_at: string
          health_status: string
          id: string
          image_url: string | null
          name: string
          notes: string | null
          sex: string
          status: string
          tag_number: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          age?: string | null
          birth_date?: string | null
          breed: string
          created_at?: string
          health_status: string
          id?: string
          image_url?: string | null
          name: string
          notes?: string | null
          sex: string
          status: string
          tag_number: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          age?: string | null
          birth_date?: string | null
          breed?: string
          created_at?: string
          health_status?: string
          id?: string
          image_url?: string | null
          name?: string
          notes?: string | null
          sex?: string
          status?: string
          tag_number?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: []
      }
      events: {
        Row: {
          animal_id: string | null
          created_at: string
          date: string
          description: string
          event_type: string
          id: string
          notes: string | null
          performed_by: string | null
          updated_at: string
        }
        Insert: {
          animal_id?: string | null
          created_at?: string
          date?: string
          description: string
          event_type: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          updated_at?: string
        }
        Update: {
          animal_id?: string | null
          created_at?: string
          date?: string
          description?: string
          event_type?: string
          id?: string
          notes?: string | null
          performed_by?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_settings: {
        Row: {
          created_at: string
          created_by: string | null
          currency: string | null
          date_format: string | null
          farm_name: string
          id: string
          language: string | null
          location: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          date_format?: string | null
          farm_name: string
          id?: string
          language?: string | null
          location?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          currency?: string | null
          date_format?: string | null
          farm_name?: string
          id?: string
          language?: string | null
          location?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_transactions: {
        Row: {
          amount: number
          animal_id: string | null
          category: string
          created_at: string
          date: string
          description: string
          id: string
          payment_method: string
          reference: string | null
          related_to: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          animal_id?: string | null
          category: string
          created_at?: string
          date?: string
          description: string
          id?: string
          payment_method: string
          reference?: string | null
          related_to: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          animal_id?: string | null
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          payment_method?: string
          reference?: string | null
          related_to?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          administered_by: string | null
          animal_id: string | null
          created_at: string
          date: string
          description: string
          follow_up: string | null
          id: string
          notes: string | null
          outcome: string | null
          record_type: string
          status: string
          updated_at: string
        }
        Insert: {
          administered_by?: string | null
          animal_id?: string | null
          created_at?: string
          date?: string
          description: string
          follow_up?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          record_type: string
          status: string
          updated_at?: string
        }
        Update: {
          administered_by?: string | null
          animal_id?: string | null
          created_at?: string
          date?: string
          description?: string
          follow_up?: string | null
          id?: string
          notes?: string | null
          outcome?: string | null
          record_type?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
