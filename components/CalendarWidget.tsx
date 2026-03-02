"use client";

import useSWR from "swr";
import { Calendar, MapPin, Clock } from "lucide-react";
import { CalendarEvent } from "@/types";
import { format, parseISO } from "date-fns";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function CalendarWidget() {
  const { data, error } = useSWR<{ events: CalendarEvent[] }>(
    "/api/calendar",
    fetcher,
    {
      refreshInterval: 60000, // Refresh every minute
    }
  );

  if (error) {
    return (
      <div className="widget">
        <h3 className="widget-title flex items-center gap-2">
          <Calendar className="w-5 h-5 text-accent-blue" />
          Next Up
        </h3>
        <p className="text-white/50 text-sm">Connect Google Calendar to see your events</p>
      </div>
    );
  }

  return (
    <div className="widget">
      <h3 className="widget-title flex items-center gap-2">
        <Calendar className="w-5 h-5 text-accent-blue" />
        Next Up
      </h3>

      {data?.events && data.events.length > 0 ? (
        <div className="space-y-3">
          {data.events.map((event) => {
            const startDate = parseISO(event.start);
            return (
              <div
                key={event.id}
                className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              >
                <h4 className="font-medium text-white mb-2">{event.title}</h4>
                <div className="space-y-1 text-xs text-white/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{format(startDate, "MMM d, h:mm a")}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-white/20 mx-auto mb-2" />
          <p className="text-white/50 text-sm">No upcoming events</p>
        </div>
      )}
    </div>
  );
}
