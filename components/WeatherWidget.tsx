"use client";

import useSWR from "swr";
import { Cloud, CloudRain, CloudSnow, Sun, Wind } from "lucide-react";
import { WeatherData } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const getWeatherIcon = (condition: string) => {
  switch (condition.toLowerCase()) {
    case "clear":
      return <Sun className="w-12 h-12 text-yellow-300" />;
    case "rain":
      return <CloudRain className="w-12 h-12 text-blue-300" />;
    case "snow":
      return <CloudSnow className="w-12 h-12 text-blue-200" />;
    case "clouds":
      return <Cloud className="w-12 h-12 text-gray-300" />;
    default:
      return <Wind className="w-12 h-12 text-gray-300" />;
  }
};

export function WeatherWidget() {
  const { data, error } = useSWR<WeatherData>("/api/weather", fetcher, {
    refreshInterval: 600000, // Refresh every 10 minutes
  });

  if (error) {
    return (
      <div className="widget">
        <h3 className="widget-title flex items-center gap-2">
          <Cloud className="w-5 h-5 text-accent-blue" />
          Weather
        </h3>
        <p className="text-white/50 text-sm">Unable to fetch weather data</p>
      </div>
    );
  }

  return (
    <div className="widget">
      <h3 className="widget-title flex items-center gap-2">
        <Cloud className="w-5 h-5 text-accent-blue" />
        Weather
      </h3>

      {data ? (
        <div className="space-y-6">
          {/* Current Weather */}
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              {getWeatherIcon(data.current.condition)}
            </div>
            <div className="mb-2">
              <p className="text-5xl font-bold text-white">{data.current.temp}°</p>
              <p className="text-white/60 text-sm mt-1">{data.current.condition}</p>
            </div>
          </div>

          {/* 3-Day Forecast */}
          <div className="pt-6 border-t border-white/10">
            <p className="text-sm font-medium text-white/70 mb-3">3-Day Forecast</p>
            <div className="space-y-2">
              {data.forecast.map((day, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <span className="text-white/80 text-sm font-medium w-12">{day.day}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 flex items-center justify-center">
                      {getWeatherIcon(day.condition)}
                    </div>
                    <span className="text-white/60 text-xs w-16">{day.condition}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium text-sm">{day.high}°</span>
                    <span className="text-white/40 text-sm">{day.low}°</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-white/5 rounded" />
          <div className="space-y-2">
            <div className="h-12 bg-white/5 rounded" />
            <div className="h-12 bg-white/5 rounded" />
            <div className="h-12 bg-white/5 rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
