"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { LogOut, Settings } from "lucide-react";
import { SpotifyWidget } from "@/components/SpotifyWidget";
import { CalendarWidget } from "@/components/CalendarWidget";
import { TaskWidget } from "@/components/TaskWidget";
import { FitnessWidget } from "@/components/FitnessWidget";
import { WeatherWidget } from "@/components/WeatherWidget";

export default function Dashboard() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 max-w-md w-full text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
            Project Zenith
          </h1>
          <p className="text-white/60 mb-8">Your personal life dashboard</p>
          
          <div className="space-y-3">
            <button
              onClick={() => signIn("google")}
              className="w-full px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Continue with Google
            </button>
            <button
              onClick={() => signIn("spotify")}
              className="w-full px-6 py-3 rounded-lg bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              Continue with Spotify
            </button>
          </div>

          <p className="text-white/40 text-xs mt-6">
            Connect your services to access your personalized dashboard
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-1 bg-gradient-to-r from-primary to-accent-blue bg-clip-text text-transparent">
              Welcome back, {session.user?.name?.split(" ")[0]}
            </h1>
            <p className="text-white/60 text-sm md:text-base">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-lg glass-card hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5 text-white/70" />
            </button>
            <button
              onClick={() => signOut()}
              className="p-2 rounded-lg glass-card hover:bg-white/10 transition-colors"
            >
              <LogOut className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-auto">
        {/* Row 1 */}
        <div className="md:col-span-1">
          <SpotifyWidget />
        </div>
        <div className="md:col-span-1">
          <CalendarWidget />
        </div>
        <div className="md:col-span-1 lg:row-span-2">
          <TaskWidget />
        </div>

        {/* Row 2 */}
        <div className="md:col-span-1">
          <FitnessWidget />
        </div>
        <div className="md:col-span-1">
          <WeatherWidget />
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-white/40 text-sm">
        <p>Project Zenith • Your Central Hub</p>
      </footer>
    </div>
  );
}
