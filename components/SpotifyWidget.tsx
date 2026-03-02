"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import { Music, Music2 } from "lucide-react";
import Image from "next/image";
import { SpotifyTrack, SpotifyRecentTrack } from "@/types";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function SpotifyWidget() {
  const { data: nowPlaying, error } = useSWR<SpotifyTrack>("/api/spotify", fetcher, {
    refreshInterval: 5000,
  });

  const { data: recentData } = useSWR<{ tracks: SpotifyRecentTrack[] }>(
    "/api/spotify?type=recent",
    fetcher,
    {
      refreshInterval: 30000,
    }
  );

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (nowPlaying?.isPlaying && nowPlaying.duration) {
      const percentage = (nowPlaying.progress / nowPlaying.duration) * 100;
      setProgress(percentage);
    }
  }, [nowPlaying]);

  if (error) {
    return (
      <div className="widget">
        <h3 className="widget-title flex items-center gap-2">
          <Music className="w-5 h-5 text-primary" />
          Now Playing
        </h3>
        <p className="text-white/50 text-sm">Connect Spotify to see what's playing</p>
      </div>
    );
  }

  return (
    <div className="widget">
      <h3 className="widget-title flex items-center gap-2">
        <Music className="w-5 h-5 text-primary" />
        Now Playing
      </h3>

      {nowPlaying?.isPlaying ? (
        <div className="space-y-4">
          <div className="flex gap-4">
            {nowPlaying.albumArt && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={nowPlaying.albumArt}
                  alt={nowPlaying.album}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-white truncate">{nowPlaying.name}</h4>
              <p className="text-white/60 text-sm truncate">{nowPlaying.artist}</p>
              <p className="text-white/40 text-xs truncate">{nowPlaying.album}</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-1000"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-white/50">
          <Music2 className="w-8 h-8" />
          <p className="text-sm">Not currently playing</p>
        </div>
      )}

      {/* Recently Played */}
      {recentData?.tracks && recentData.tracks.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <h4 className="text-sm font-medium text-white/70 mb-3">Recently Played</h4>
          <div className="space-y-2">
            {recentData.tracks.slice(0, 3).map((track, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                <p className="text-white/60 truncate">
                  {track.name} <span className="text-white/40">by {track.artist}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
