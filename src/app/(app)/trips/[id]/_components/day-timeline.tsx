"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Dictionary } from "@/lib/i18n";
import { formatDateFull } from "@/lib/format";
import type { ItineraryDay, ItineraryItem } from "@/lib/supabase/database.types";

import { ItineraryItemRow, type HotelSearchContext } from "./itinerary-item-row";

interface DayTimelineProps {
  day: ItineraryDay;
  items: ItineraryItem[];
  dict: Dictionary;
  /** Owner view: enables per-item inline editing. Omitted on the public share page. */
  editable?: boolean;
  tripId?: string;
  /** Trip dates/party size used to pre-fill the hotel-search link on lodging items. */
  hotelContext?: HotelSearchContext;
  /** Number of children on the trip; controls child-suitability badges. */
  tripChildren?: number;
}

export function DayTimeline({
  day,
  items,
  dict,
  editable,
  tripId,
  hotelContext,
  tripChildren,
}: DayTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              Day {day.day_index} · {formatDateFull(day.date)}
            </p>
            <CardTitle>{day.title ?? `${day.day_index}일차`}</CardTitle>
          </div>
        </div>
        {day.summary && <p className="text-sm text-muted-foreground">{day.summary}</p>}
      </CardHeader>
      <CardContent>
        <ol className="relative space-y-5 border-l border-border pl-6">
          {items.map((item, idx) => (
            <ItineraryItemRow
              key={item.id}
              item={item}
              idx={idx}
              dict={dict}
              editable={editable}
              tripId={tripId}
              hotelContext={hotelContext}
              dayDate={day.date}
              tripChildren={tripChildren}
            />
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
