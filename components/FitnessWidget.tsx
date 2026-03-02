"use client";

import useSWR from "swr";
import { Activity, Target } from "lucide-react";
import { FitnessData } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function FitnessWidget() {
  const { data, error } = useSWR<FitnessData>("/api/fitness", fetcher, {
    refreshInterval: 300000, // Refresh every 5 minutes
  });

  if (error) {
    return (
      <div className="widget">
        <h3 className="widget-title flex items-center gap-2">
          <Activity className="w-5 h-5 text-accent-pink" />
          Daily Activity
        </h3>
        <p className="text-white/50 text-sm">Connect Google Fit to track your activity</p>
      </div>
    );
  }

  const progress = data ? (data.steps / data.goal) * 100 : 0;
  const isGoalReached = progress >= 100;

  return (
    <div className="widget">
      <h3 className="widget-title flex items-center gap-2">
        <Activity className="w-5 h-5 text-accent-pink" />
        Daily Activity
      </h3>

      {data ? (
        <div className="space-y-6">
          {/* Steps Progress */}
          <div>
            <div className="flex items-end justify-between mb-2">
              <div>
                <p className="text-3xl font-bold text-white">
                  {data.steps.toLocaleString()}
                </p>
                <p className="text-white/60 text-sm">steps today</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-semibold text-white/80">
                  {Math.round(progress)}%
                </p>
                <p className="text-white/40 text-xs">of goal</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  isGoalReached
                    ? "bg-gradient-to-r from-primary to-green-400"
                    : "bg-gradient-to-r from-accent-pink to-accent-purple"
                }`}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>

            {/* Goal Indicator */}
            <div className="flex items-center justify-between mt-2 text-xs text-white/50">
              <span>0</span>
              <div className="flex items-center gap-1">
                <Target className="w-3 h-3" />
                <span>{data.goal.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Additional Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-white/60 text-xs mb-1">Distance</p>
              <p className="text-xl font-semibold text-white">{data.distance} <span className="text-sm text-white/60">km</span></p>
            </div>
            <div className="p-3 rounded-lg bg-white/5">
              <p className="text-white/60 text-xs mb-1">Calories</p>
              <p className="text-xl font-semibold text-white">{data.calories} <span className="text-sm text-white/60">kcal</span></p>
            </div>
          </div>
        </div>
      ) : (
        <div className="animate-pulse space-y-4">
          <div className="h-16 bg-white/5 rounded" />
          <div className="h-3 bg-white/5 rounded" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-white/5 rounded" />
            <div className="h-16 bg-white/5 rounded" />
          </div>
        </div>
      )}
    </div>
  );
}
