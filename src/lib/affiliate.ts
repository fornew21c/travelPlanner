/**
 * Affiliate-ready outbound hotel-search links.
 *
 * The links work today as plain search URLs. Once you sign up for a partner
 * program and set the matching env var, the same links automatically become
 * commission-tracking links — no code change:
 *
 *   NEXT_PUBLIC_HOTEL_PROVIDER = "booking" | "agoda"   (default "booking")
 *   NEXT_PUBLIC_BOOKING_AID    = Booking.com affiliate "aid"
 *   NEXT_PUBLIC_AGODA_CID      = Agoda Partners "cid"
 *
 * Provider note: Booking.com reliably pre-fills a search-results page from free
 * text + dates (e.g. "다운타운 LA 인근 숙소" + 체크인/아웃), which is exactly what
 * this app passes. Agoda is more popular in Korea/Asia, but its search URL does
 * NOT reliably pre-fill from arbitrary text (it bounces to the homepage), so the
 * Agoda link is coarser — it still carries the cid for commission and the user
 * re-runs the search. Default is therefore "booking"; switch via env when you
 * have an Agoda account.
 *
 * These are NEXT_PUBLIC_ vars because the ids are embedded in a user-visible
 * link (not secrets).
 */

type HotelProvider = "booking" | "agoda";

const PROVIDER: HotelProvider =
  process.env.NEXT_PUBLIC_HOTEL_PROVIDER === "agoda" ? "agoda" : "booking";
const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID;
const AGODA_CID = process.env.NEXT_PUBLIC_AGODA_CID;
const KLOOK_AID = process.env.NEXT_PUBLIC_KLOOK_AID;

export interface HotelSearchParams {
  /** Free-text location: a city, area, or "OO 인근 숙소". */
  query: string;
  checkIn?: string | null; // "YYYY-MM-DD"
  checkOut?: string | null; // "YYYY-MM-DD"
  adults?: number;
  children?: number;
}

function bookingUrl(p: HotelSearchParams): string {
  const url = new URL("https://www.booking.com/searchresults.html");
  url.searchParams.set("ss", p.query);
  if (p.checkIn) url.searchParams.set("checkin", p.checkIn);
  if (p.checkOut) url.searchParams.set("checkout", p.checkOut);
  if (p.adults && p.adults > 0) url.searchParams.set("group_adults", String(p.adults));
  if (p.children && p.children > 0) url.searchParams.set("group_children", String(p.children));
  if (BOOKING_AID) url.searchParams.set("aid", BOOKING_AID);
  return url.toString();
}

function agodaUrl(p: HotelSearchParams): string {
  const url = new URL("https://www.agoda.com/search");
  url.searchParams.set("textToSearch", p.query);
  if (p.checkIn) url.searchParams.set("checkIn", p.checkIn);
  if (p.checkOut) url.searchParams.set("checkOut", p.checkOut);
  if (p.adults && p.adults > 0) url.searchParams.set("adults", String(p.adults));
  if (p.children && p.children > 0) url.searchParams.set("children", String(p.children));
  if (AGODA_CID) url.searchParams.set("cid", AGODA_CID);
  return url.toString();
}

/**
 * Build a hotel-search URL pre-filled with the trip context, for the configured
 * provider. Returns a plain search link when no affiliate id is set.
 */
export function buildHotelSearchUrl(params: HotelSearchParams): string {
  return PROVIDER === "agoda" ? agodaUrl(params) : bookingUrl(params);
}

/** Which provider the hotel links point at. */
export const hotelProvider = PROVIDER;

/** True when hotel commission tracking is active (affiliate id set for the provider). */
export const isAffiliateEnabled = Boolean(PROVIDER === "agoda" ? AGODA_CID : BOOKING_AID);

/**
 * Build a Klook activity/ticket search URL for an attraction or destination.
 * Klook's free-text search reliably pre-fills (verified: query param preserved,
 * 200 OK). Returns a plain search link when no affiliate id is configured.
 *
 *   NEXT_PUBLIC_KLOOK_AID = Klook affiliate id
 *
 * Note: the exact Klook affiliate parameter can differ by program
 * (Partnerize/Travelpayouts) — `aid` is the scaffold; adjust on signup.
 */
export function buildActivitySearchUrl(params: { query: string }): string {
  const url = new URL("https://www.klook.com/search/result/");
  url.searchParams.set("query", params.query);
  if (KLOOK_AID) url.searchParams.set("aid", KLOOK_AID);
  return url.toString();
}

/** True when activity commission tracking is active. */
export const isActivityAffiliateEnabled = Boolean(KLOOK_AID);
