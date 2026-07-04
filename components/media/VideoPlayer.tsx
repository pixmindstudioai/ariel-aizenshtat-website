"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatMediaTime } from "@/components/media/mediaTime";

/** אייקוני SVG קטנים לנגן — עצמאיים, בלי תלות באסטים חיצוניים */
/* משולש ה-play מאוזן סביב מרכז ה-viewBox — ההזחה האופטית הקלה ימינה
   נעשית ב-translate קטן אצל הכפתור עצמו, לא בציור */
const PlayIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <path d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" />
  </svg>
);

const PauseIcon = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
    <rect x="6" y="4" width="4.5" height="16" rx="1.5" />
    <rect x="13.5" y="4" width="4.5" height="16" rx="1.5" />
  </svg>
);

const VolumeIcon = ({ muted }: { muted: boolean }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5" aria-hidden>
    <path d="M4 9.5A1.5 1.5 0 0 1 5.5 8h2.6l4.02-3.35A1.2 1.2 0 0 1 14.1 5.6v12.8a1.2 1.2 0 0 1-1.98.95L8.1 16H5.5A1.5 1.5 0 0 1 4 14.5v-5Z" />
    {muted ? (
      <path
        d="m17 9.5 4.5 4.5m0-4.5L17 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    ) : (
      <path
        d="M16.5 8.5a5 5 0 0 1 0 7M18.5 6a8 8 0 0 1 0 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    )}
  </svg>
);

const FullscreenIcon = ({ active }: { active: boolean }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    className="h-5 w-5"
    aria-hidden
  >
    {active ? (
      <path d="M9 4v3a2 2 0 0 1-2 2H4m16 0h-3a2 2 0 0 1-2-2V4M4 15h3a2 2 0 0 1 2 2v3m6 0v-3a2 2 0 0 1 2-2h3" />
    ) : (
      <path d="M4 9V6a2 2 0 0 1 2-2h3m6 0h3a2 2 0 0 1 2 2v3m0 6v3a2 2 0 0 1-2 2h-3m-6 0H6a2 2 0 0 1-2-2v-3" />
    )}
  </svg>
);

const RATES = [1, 1.25, 1.5, 2, 0.75];

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
}

/**
 * נגן וידאו מותאם אישית בעיצוב האתר — מנגן אך ורק קבצים מהאחסון שלנו.
 * שליטה מלאה: הפעלה, פס התקדמות בגרדיאנט, ווליום, מהירות ומסך מלא.
 * מקלדת: רווח = הפעלה/השהיה · חצים = דילוג 10ש׳ · M = השתקה · F = מסך מלא.
 */
export default function VideoPlayer({ src, title, poster, className = "" }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [rate, setRate] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);

  const showControls = useCallback(() => {
    setControlsVisible(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      if (!videoRef.current?.paused) setControlsVisible(false);
    }, 2600);
  }, []);

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
  }, []);

  useEffect(() => {
    const onFullscreenChange = () =>
      setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
    showControls();
  }, [showControls]);

  const seekBy = useCallback(
    (seconds: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.min(Math.max(video.currentTime + seconds, 0), video.duration || 0);
      showControls();
    },
    [showControls]
  );

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    showControls();
  }, [showControls]);

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) void document.exitFullscreen();
    else void containerRef.current?.requestFullscreen();
    showControls();
  }, [showControls]);

  const cycleRate = () => {
    const video = videoRef.current;
    if (!video) return;
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    video.playbackRate = next;
    setRate(next);
    showControls();
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if ((e.target as HTMLElement).tagName === "INPUT") return;
    switch (e.key) {
      case " ":
      case "k":
        e.preventDefault();
        togglePlay();
        break;
      case "ArrowRight":
        e.preventDefault();
        seekBy(10);
        break;
      case "ArrowLeft":
        e.preventDefault();
        seekBy(-10);
        break;
      case "m":
        toggleMute();
        break;
      case "f":
        toggleFullscreen();
        break;
    }
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const barsVisible = controlsVisible || !playing;

  return (
    <div
      ref={containerRef}
      dir="ltr"
      tabIndex={0}
      role="region"
      aria-label={title ? `נגן וידאו: ${title}` : "נגן וידאו"}
      onKeyDown={onKeyDown}
      onPointerMove={showControls}
      onPointerLeave={() => {
        if (playing) setControlsVisible(false);
      }}
      className={`group relative overflow-hidden rounded-[2rem] bg-slate-950 shadow-[0_20px_60px_rgba(15,23,42,0.15)] outline-none focus-visible:ring-4 focus-visible:ring-blue/40 ${className}`}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => {
          setPlaying(true);
          showControls();
        }}
        onPause={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onEnded={() => {
          setPlaying(false);
          setControlsVisible(true);
        }}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          setDuration(e.currentTarget.duration || 0);
          setVolume(e.currentTarget.volume);
        }}
        className={
          fullscreen
            ? "h-full w-full object-contain" // מסך מלא: ממלאים את כל הגובה, הסרטון ממורכז
            : "aspect-video w-full"
        }
      />

      {/* כפתור הפעלה מרכזי — באותה שפה עיצובית של כרטיסי הווידאו באתר */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          aria-label="הפעלת הסרטון"
          className="absolute inset-0 grid place-items-center"
        >
          <span className="grid h-20 w-20 place-items-center rounded-full bg-gradient-to-br from-[#4f7bff] to-[#7c5cff] text-white shadow-[0_14px_35px_rgba(79,123,255,0.45)] transition-transform duration-300 hover:scale-110">
            <PlayIcon className="h-8 w-8 translate-x-[2px]" />
          </span>
        </button>
      )}

      {/* סרגל שליטה תחתון */}
      <div
        className={`absolute inset-x-0 bottom-0 flex flex-col gap-1.5 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-4 pb-3 pt-12 transition-opacity duration-300 ${
          barsVisible ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          aria-label="מיקום בסרטון"
          aria-valuetext={`${formatMediaTime(currentTime)} מתוך ${formatMediaTime(duration)}`}
          onChange={(e) => {
            const video = videoRef.current;
            if (!video) return;
            video.currentTime = Number(e.target.value);
            setCurrentTime(video.currentTime);
            showControls();
          }}
          className="media-range h-1.5 w-full"
          style={{
            background: `linear-gradient(to right, #4f7bff 0%, #7c5cff ${progress}%, rgba(255,255,255,0.25) ${progress}%)`,
          }}
        />

        <div className="flex items-center gap-2 text-white">
          <button
            type="button"
            onClick={togglePlay}
            aria-label={playing ? "השהיה" : "הפעלה"}
            className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/15"
          >
            {playing ? <PauseIcon /> : <PlayIcon className="h-5 w-5 translate-x-[1px]" />}
          </button>

          <span className="text-xs font-bold tabular-nums text-white/90">
            {formatMediaTime(currentTime)} / {formatMediaTime(duration)}
          </span>

          <span className="flex-1" />

          <button
            type="button"
            onClick={cycleRate}
            aria-label={`מהירות ניגון — כרגע פי ${rate}`}
            className="rounded-full px-2.5 py-1 text-xs font-black transition-colors hover:bg-white/15"
          >
            {rate}x
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              aria-label={muted ? "ביטול השתקה" : "השתקה"}
              className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/15"
            >
              <VolumeIcon muted={muted} />
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={muted ? 0 : volume}
              aria-label="עוצמת שמע"
              onChange={(e) => {
                const video = videoRef.current;
                if (!video) return;
                const next = Number(e.target.value);
                video.volume = next;
                video.muted = next === 0;
                setVolume(next);
                setMuted(next === 0);
              }}
              className="media-range hidden h-1 w-20 sm:block"
              style={{
                background: `linear-gradient(to right, #fff ${(muted ? 0 : volume) * 100}%, rgba(255,255,255,0.25) ${(muted ? 0 : volume) * 100}%)`,
              }}
            />
          </div>

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? "יציאה ממסך מלא" : "מסך מלא"}
            className="grid h-9 w-9 place-items-center rounded-full transition-colors hover:bg-white/15"
          >
            <FullscreenIcon active={fullscreen} />
          </button>
        </div>
      </div>
    </div>
  );
}
