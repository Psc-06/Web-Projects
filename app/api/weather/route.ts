import { NextRequest, NextResponse } from "next/server";

const WEATHER_API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_URL = "https://api.openweathermap.org/data/2.5";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat") || "40.7128";
  const lon = searchParams.get("lon") || "-74.0060";

  if (!WEATHER_API_KEY) {
    return NextResponse.json({ error: "Weather API key not configured" }, { status: 500 });
  }

  try {
    // Fetch current weather
    const currentResponse = await fetch(
      `${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`
    );
    const currentData = await currentResponse.json();

    // Fetch forecast
    const forecastResponse = await fetch(
      `${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`
    );
    const forecastData = await forecastResponse.json();

    // Process forecast for next 3 days
    const dailyForecasts: any[] = [];
    const processedDays = new Set();

    forecastData.list?.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toDateString();

      if (!processedDays.has(dayKey) && dailyForecasts.length < 3) {
        processedDays.add(dayKey);
        dailyForecasts.push({
          day: date.toLocaleDateString("en-US", { weekday: "short" }),
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: item.weather[0].main,
          icon: item.weather[0].icon,
        });
      }
    });

    return NextResponse.json({
      current: {
        temp: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        icon: currentData.weather[0].icon,
      },
      forecast: dailyForecasts,
    });
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json({ error: "Failed to fetch weather data" }, { status: 500 });
  }
}
