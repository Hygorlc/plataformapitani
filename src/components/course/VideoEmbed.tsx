"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { normalizeVideoUrl } from "@/lib/utils/embed";

type YouTubePlayer = {
  destroy: () => void;
  getPlayerState: () => number;
  getVolume: () => number;
  isMuted: () => boolean;
  mute: () => void;
  pauseVideo: () => void;
  playVideo: () => void;
  setVolume: (volume: number) => void;
  unMute: () => void;
};

type YouTubePlayerEvent = { target: YouTubePlayer; data: number };

declare global {
  interface Window {
    YT?: {
      Player: new (
        elementId: string,
        options: {
          videoId: string;
          playerVars: Record<string, number>;
          events: {
            onReady: (event: YouTubePlayerEvent) => void;
            onStateChange: (event: YouTubePlayerEvent) => void;
          };
        }
      ) => YouTubePlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

function getYouTubeId(url: string): string | null {
  return url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([\w-]+)/)?.[1] ?? null;
}

function NativeVideoEmbed({ url, title }: { url: string; title: string }) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded-xl bg-black">
      <iframe
        src={normalizeVideoUrl(url)}
        title={title}
        className="h-full w-full"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}

export function VideoEmbed({ url, title }: { url: string; title: string }) {
  const videoId = getYouTubeId(url);
  const reactId = useId();
  const playerElementId = `youtube-player-${reactId.replace(/:/g, "")}`;
  const playerRef = useRef<YouTubePlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(100);

  useEffect(() => {
    if (!videoId) return;

    const createPlayer = () => {
      if (!window.YT || playerRef.current) return;

      playerRef.current = new window.YT.Player(playerElementId, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
        },
        events: {
          onReady: (event) => {
            setVolume(event.target.getVolume());
            setMuted(event.target.isMuted());
            setReady(true);
          },
          onStateChange: (event) => setPlaying(event.data === 1),
        },
      });
    };

    if (window.YT?.Player) {
      createPlayer();
    } else {
      const previousReady = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previousReady?.();
        createPlayer();
      };

      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.async = true;
        document.head.appendChild(script);
      }
    }

    return () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [playerElementId, videoId]);

  if (!videoId) return <NativeVideoEmbed url={url} title={title} />;

  const togglePlayback = () => {
    if (!playerRef.current || !ready) return;
    if (playerRef.current.getPlayerState() === 1) playerRef.current.pauseVideo();
    else playerRef.current.playVideo();
  };

  const toggleMute = () => {
    if (!playerRef.current || !ready) return;
    if (playerRef.current.isMuted()) {
      playerRef.current.unMute();
      setMuted(false);
    } else {
      playerRef.current.mute();
      setMuted(true);
    }
  };

  const changeVolume = (nextVolume: number) => {
    if (!playerRef.current || !ready) return;
    playerRef.current.setVolume(nextVolume);
    if (nextVolume > 0 && playerRef.current.isMuted()) playerRef.current.unMute();
    setVolume(nextVolume);
    setMuted(nextVolume === 0);
  };

  return (
    <div className="overflow-hidden rounded-xl bg-black" aria-label={`Player de vídeo: ${title}`}>
      <div className="relative aspect-video w-full overflow-hidden">
        <div id={playerElementId} className="pointer-events-none h-full w-full" />
        {!playing && (
          <button
            type="button"
            onClick={togglePlayback}
            disabled={!ready}
            aria-label="Reproduzir vídeo"
            className="absolute inset-0 m-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg transition hover:scale-105 disabled:opacity-50"
          >
            <Play size={30} fill="currentColor" className="ml-1" />
          </button>
        )}
      </div>

      <div className="flex h-14 items-center gap-4 border-t border-white/10 bg-neutral-950 px-4 text-white">
        <button
          type="button"
          onClick={togglePlayback}
          disabled={!ready}
          aria-label={playing ? "Pausar vídeo" : "Reproduzir vídeo"}
          className="rounded-md p-2 transition hover:bg-white/10 disabled:opacity-50"
        >
          {playing ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
        </button>

        <button
          type="button"
          onClick={toggleMute}
          disabled={!ready}
          aria-label={muted ? "Ativar som" : "Silenciar"}
          className="rounded-md p-2 transition hover:bg-white/10 disabled:opacity-50"
        >
          {muted || volume === 0 ? <VolumeX size={22} /> : <Volume2 size={22} />}
        </button>

        <input
          type="range"
          min="0"
          max="100"
          value={muted ? 0 : volume}
          onChange={(event) => changeVolume(Number(event.target.value))}
          disabled={!ready}
          aria-label="Volume"
          className="h-1 w-28 cursor-pointer accent-primary disabled:opacity-50"
        />
      </div>
    </div>
  );
}
