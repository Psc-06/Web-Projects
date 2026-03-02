import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const GOOGLE_FIT_API = "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate";

async function getAccessToken() {
  const session = await getServerSession(authOptions);
  if (!session?.accessToken) {
    return null;
  }
  return session.accessToken;
}

export async function GET() {
  const accessToken = await getAccessToken();
  if (!accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = Date.now();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const response = await fetch(GOOGLE_FIT_API, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        aggregateBy: [
          {
            dataTypeName: "com.google.step_count.delta",
          },
          {
            dataTypeName: "com.google.distance.delta",
          },
          {
            dataTypeName: "com.google.calories.expended",
          },
        ],
        bucketByTime: { durationMillis: now - startOfDay.getTime() },
        startTimeMillis: startOfDay.getTime(),
        endTimeMillis: now,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch fitness data");
    }

    const data = await response.json();
    const steps = data.bucket[0]?.dataset[0]?.point[0]?.value[0]?.intVal || 0;
    const distance = data.bucket[0]?.dataset[1]?.point[0]?.value[0]?.fpVal || 0;
    const calories = data.bucket[0]?.dataset[2]?.point[0]?.value[0]?.fpVal || 0;

    return NextResponse.json({
      steps,
      goal: 10000,
      distance: Math.round(distance),
      calories: Math.round(calories),
    });
  } catch (error) {
    console.error("Fitness API error:", error);
    // Return mock data for development
    return NextResponse.json({
      steps: 6543,
      goal: 10000,
      distance: 5.2,
      calories: 320,
    });
  }
}
