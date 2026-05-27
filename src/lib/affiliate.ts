/**
 * Affiliate-ready outbound booking links.
 *
 * The links work today as plain search URLs. Once you sign up for a partner
 * program (Booking.com affiliate, etc.) and set the env var below, the same
 * links automatically become commission-tracking links — no code change.
 *
 *   NEXT_PUBLIC_BOOKING_AID = your Booking.com affiliate id ("aid")
 *
 * It's a NEXT_PUBLIC_ var because the id is embedded in a user-visible link
 * (it is not a secret).
 */

const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID;

export interface HotelSearchParams {
  /** Free-text location: a city, area, or "OO 인근 숙소". */
  query: string;
  checkIn?: string | null; // "YYYY-MM-DD"
  checkOut?: string | null; // "YYYY-MM-DD"
  adults?: number;
  children?: number;
}

/**
 * Build a Booking.com hotel-search URL pre-filled with the trip context.
 * Returns a plain search link when no affiliate id is configured.
 */
export function buildHotelSearchUrl(params: HotelSearchParams): string {
  const url = new URL("https://www.booking.com/searchresults.html");
  url.searchParams.set("ss", params.query);
  if (params.checkIn) url.searchParams.set("checkin", params.checkIn);
  if (params.checkOut) url.searchParams.set("checkout", params.checkOut);
  if (params.adults && params.adults > 0) {
    url.searchParams.set("group_adults", String(params.adults));
  }
  if (params.children && params.children > 0) {
    url.searchParams.set("group_children", String(params.children));
  }
  if (BOOKING_AID) url.searchParams.set("aid", BOOKING_AID);
  return url.toString();
}

/** True when commission tracking is active (affiliate id configured). */
export const isAffiliateEnabled = Boolean(BOOKING_AID);
