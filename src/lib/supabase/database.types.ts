// =============================================================================
// Database types
//
// Hand-written to mirror supabase/migrations/0001_init.sql.
// For production, regenerate from Supabase CLI:
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
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
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
        Insert: Omit<
          Database["public"]["Tables"]["trips"]["Row"],
          "id" | "duration_days" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["trips"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["trips"]["Row"]>;
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
        Insert: Omit<
          Database["public"]["Tables"]["itinerary_days"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["itinerary_days"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["itinerary_days"]["Row"]>;
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
        Insert: Omit<
          Database["public"]["Tables"]["itinerary_items"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["itinerary_items"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["itinerary_items"]["Row"]>;
      };
      packing_lists: {
        Row: {
          id: string;
          trip_id: string;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["packing_lists"]["Row"],
          "id" | "created_at" | "updated_at"
        > &
          Partial<
            Pick<
              Database["public"]["Tables"]["packing_lists"]["Row"],
              "id" | "created_at" | "updated_at"
            >
          >;
        Update: Partial<Database["public"]["Tables"]["packing_lists"]["Row"]>;
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
        Insert: Omit<Database["public"]["Tables"]["packing_items"]["Row"], "id" | "created_at"> &
          Partial<Pick<Database["public"]["Tables"]["packing_items"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["packing_items"]["Row"]>;
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
        Insert: Omit<Database["public"]["Tables"]["favorites"]["Row"], "id" | "created_at"> &
          Partial<Pick<Database["public"]["Tables"]["favorites"]["Row"], "id" | "created_at">>;
        Update: Partial<Database["public"]["Tables"]["favorites"]["Row"]>;
      };
    };
    Enums: {
      travel_style: TravelStyle;
      transport_pref: TransportPref;
      travel_pace: TravelPace;
      trip_status: TripStatus;
      itinerary_item_type: ItineraryItemType;
    };
  };
}

export type Trip = Database["public"]["Tables"]["trips"]["Row"];
export type ItineraryDay = Database["public"]["Tables"]["itinerary_days"]["Row"];
export type ItineraryItem = Database["public"]["Tables"]["itinerary_items"]["Row"];
export type PackingItem = Database["public"]["Tables"]["packing_items"]["Row"];
export type Favorite = Database["public"]["Tables"]["favorites"]["Row"];
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
