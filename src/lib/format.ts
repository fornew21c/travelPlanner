/**
 * Korean-locale formatters. Centralized so the app stays consistent and
 * we can later extend per-locale via i18n if needed.
 */

const KRW = new Intl.NumberFormat("ko-KR", {
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 0,
});

const KRW_COMPACT = new Intl.NumberFormat("ko-KR", {
  notation: "compact",
  style: "currency",
  currency: "KRW",
  maximumFractionDigits: 1,
});

export const formatKRW = (n: number) => KRW.format(n);
export const formatKRWCompact = (n: number) => KRW_COMPACT.format(n);

const dateFull = new Intl.DateTimeFormat("ko-KR", {
  year: "numeric",
  month: "long",
  day: "numeric",
  weekday: "short",
});

const dateShort = new Intl.DateTimeFormat("ko-KR", {
  month: "long",
  day: "numeric",
});

const timeShort = new Intl.DateTimeFormat("ko-KR", {
  hour: "2-digit",
  minute: "2-digit",
});

export const formatDateFull = (d: Date | string) =>
  dateFull.format(typeof d === "string" ? new Date(d) : d);

export const formatDateShort = (d: Date | string) =>
  dateShort.format(typeof d === "string" ? new Date(d) : d);

export const formatTime = (d: Date | string) =>
  timeShort.format(typeof d === "string" ? new Date(d) : d);

/** Formats "HH:MM" → "오전/오후 H시 MM분" friendly form. */
export const formatTimeString = (hhmm: string | null | undefined): string => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h)) return hhmm;
  const period = h < 12 ? "오전" : "오후";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${period} ${h12}:${String(m ?? 0).padStart(2, "0")}`;
};

export const formatDuration = (days: number) => `${days - 1}박 ${days}일`;
