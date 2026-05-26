// =============================================================================
// Database types
//
// Hand-written to mirror supabase/migrations/0001_init.sql.
// Shape follows the format Supabase CLI would generate so that supabase-js's
// generic inference works correctly with `.select("*")` and column lists.
//
// To regenerate from a real Supabase project:
//   npm run db:types
// =============================================================================

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TravelStyle =
  | "relaxed"
  | "sightseeing"
  | "adventure"
  | "cultural"
  | "foodie"
  | "shopping"
  | "balanced";

export type TransportPref = "public" | "rental_car" | "taxi" | "walking" | "mixed";
export type TravelPace = "slow" | "moderate" | "packed";
export type TripStatus = "draft" | "generated" | "archived";
export type ItineraryItemType =
  | "attraction"
  | "restaurant"
  | "transport"
  | "accommodation"
  | "activity"
  | "rest"
  | "note";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          avatar_url: string | null;
          locale: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          avatar_url?: string | null;
          locale?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      trips: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          destination: string;
          destination_country: string | null;
          start_date: string;
          end_date: string;
          duration_days: number;
          budget_krw: number;
          adults: number;
          children: number;
          child_ages: number[];
          travel_style: TravelStyle;
          transport: TransportPref;
          pace: TravelPace;
          notes: string | null;
          status: TripStatus;
          cover_image_url: string | null;
          share_token: string | null;
          ai_provider: string | null;
          ai_model: string | null;
          ai_summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          destination: string;
          destination_country?: string | null;
          start_date: string;
          end_date: string;
          budget_krw?: number;
          adults?: number;
          children?: number;
          child_ages?: number[];
          travel_style?: TravelStyle;
          transport?: TransportPref;
          pace?: TravelPace;
          notes?: string | null;
          status?: TripStatus;
          cover_image_url?: string | null;
          share_token?: string | null;
          ai_provider?: string | null;
          ai_model?: string | null;
          ai_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          destination?: string;
          destination_country?: string | null;
          start_date?: string;
          end_date?: string;
          budget_krw?: number;
          adults?: number;
          children?: number;
          child_ages?: number[];
          travel_style?: TravelStyle;
          transport?: TransportPref;
          pace?: TravelPace;
          notes?: string | null;
          status?: TripStatus;
          cover_image_url?: string | null;
          share_token?: string | null;
          ai_provider?: string | null;
          ai_model?: string | null;
          ai_summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      itinerary_days: {
        Row: {
          id: string;
          trip_id: string;
          day_index: number;
          date: string;
          title: string | null;
          summary: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          day_index: number;
          date: string;
          title?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          day_index?: number;
          date?: string;
          title?: string | null;
          summary?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      itinerary_items: {
        Row: {
          id: string;
          day_id: string;
          trip_id: string;
          order_index: number;
          type: ItineraryItemType;
          title: string;
          description: string | null;
          location_name: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          start_time: string | null;
          end_time: string | null;
          estimated_cost_krw: number;
          child_friendly: boolean;
          tips: string | null;
          url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_id: string;
          trip_id: string;
          order_index: number;
          type: ItineraryItemType;
          title: string;
          description?: string | null;
          location_name?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          start_time?: string | null;
          end_time?: string | null;
          estimated_cost_krw?: number;
          child_friendly?: boolean;
          tips?: string | null;
          url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_id?: string;
          trip_id?: string;
          order_index?: number;
          type?: ItineraryItemType;
          title?: string;
          description?: string | null;
          location_name?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          start_time?: string | null;
          end_time?: string | null;
          estimated_cost_krw?: number;
          child_friendly?: boolean;
          tips?: string | null;
          url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      packing_lists: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trip_id: string;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trip_id?: string;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      packing_items: {
        Row: {
          id: string;
          list_id: string;
          user_id: string;
          category: string;
          name: string;
          quantity: number;
          checked: boolean;
          for_child: boolean;
          notes: string | null;
          order_index: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          list_id: string;
          user_id: string;
          category: string;
          name: string;
          quantity?: number;
          checked?: boolean;
          for_child?: boolean;
          notes?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          list_id?: string;
          user_id?: string;
          category?: string;
          name?: string;
          quantity?: number;
          checked?: boolean;
          for_child?: boolean;
          notes?: string | null;
          order_index?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      favorites: {
        Row: {
          id: string;
          user_id: string;
          trip_id: string | null;
          item_id: string | null;
          name: string;
          location_name: string | null;
          address: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          trip_id?: string | null;
          item_id?: string | null;
          name: string;
          location_name?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          trip_id?: string | null;
          item_id?: string | null;
          name?: string;
          location_name?: string | null;
          address?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      travel_style: TravelStyle;
      transport_pref: TransportPref;
      travel_pace: TravelPace;
      trip_status: TripStatus;
      itinerary_item_type: ItineraryItemType;
    };
    CompositeTypes: Record<string, never>;
  };
}

export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type ItineraryDay = Database["public"]["Tables"]["itinerary_days"]["Row"];
export type ItineraryItem = Database["public"]["Tables"]["itinerary_items"]["Row"];
export type PackingItem = Database["public"]["Tables"]["packing_items"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
