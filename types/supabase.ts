export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      cities: {
        Row: {
          id: number;
          city_name: string;
        };
        Insert: {
          id?: number;
          city_name: string;
        };
        Update: {
          id?: number;
          city_name?: string;
        };
      };
      dormitories: {
        Row: {
          id: number;
          dorm_name: string;
          city_id: number;
        };
        Insert: {
          id?: number;
          dorm_name: string;
          city_id: number;
        };
        Update: {
          id?: number;
          dorm_name?: string;
          city_id?: number;
        };
      };
      meals: {
        Row: {
          id: number;
          meal_date: string;
          meal_type: "BREAKFAST" | "DINNER";
          city_id: number;
          dorm_id: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          meal_date: string;
          meal_type: "BREAKFAST" | "DINNER";
          city_id: number;
          dorm_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          meal_date?: string;
          meal_type?: "BREAKFAST" | "DINNER";
          city_id?: number;
          dorm_id?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      meal_items: {
        Row: {
          id: number;
          meal_id: number;
          item_name: string;
          calories: number | null;
          description: string | null;
        };
        Insert: {
          id?: number;
          meal_id: number;
          item_name: string;
          calories?: number | null;
          description?: string | null;
        };
        Update: {
          id?: number;
          meal_id?: number;
          item_name?: string;
          calories?: number | null;
          description?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          created_at: string;
          updated_at: string;
          email: string | null;
          phone: string | null;
          full_name: string | null;
          city_id: number | null;
          dorm_id: number | null;
        };
        Insert: {
          id: string;
          created_at?: string;
          updated_at?: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          city_id?: number | null;
          dorm_id?: number | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          email?: string | null;
          phone?: string | null;
          full_name?: string | null;
          city_id?: number | null;
          dorm_id?: number | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
