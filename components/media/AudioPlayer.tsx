"use client";

import { useRef, useState } from "react";
import { formatMediaTime } from "@/components/media/mediaTime";

const RATES = [1, 1.25, 1.5, 2, 0.75];

interface AudioPlayerProps {
  src: string;
  title?: string;
  className?: string;
}

/**
 * נגן אודיו מותאם אישית בעיצוב האתר — כרטיס "סטיקר" לבן עם כפתור
 * ניגון בגרדיאנט, פס התקדמות, עוצמת שמע ומהירות. מנגן קבצים מהאחסון שלנו בלבד.
 */
export default function AudioPlayer({ src, title, className = "" }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [rate, setRate] = useState(1);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) void audio.play();
    else audio.pause();
  };

  const cycleRate = () => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = RATES[(RATES.indexOf(rate) + 1) % RATES.length];
    audio.playbackRate = next;
    setRate(next);
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      role="region"
      aria-label={title ? `נגן אודיו: ${title}` : "נגן אודיו"}
      className={`card-soft flex flex-col gap-3 p-5 ${className}`}
    >
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration || 0)}
      />

      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={togglePlay}
          aria-label={playing ? "השהיה" : "הפעלה"}
          className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#4f7bff] to-[#7c5cff] text-white shadow-[0_10px_25px_rgba(79,123,255,0.4)] transition-transform hover:scale-105"
        >
          {playing ? (
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6" aria-hidden>
              <rect x="6" y="4" width="4.5" height="16" rx="1.5" />
              <rect x="13.5" y="4" width="4.5" height="16" rx="1.5" />
            </svg>
          ) : (
            // משולש מאוזן + הזחה אופטית קלה ימינה כדי שיישב במרכז העיגול
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 translate-x-[1.5px]"
              aria-hidden
            >
              <path d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z" />
            </svg>
          )}
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          {title && <p className="truncate font-bold text-ink">{title}</p>}
          <div dir="ltr" className="flex items-center gap-2.5">
            <span className="text-xs font-bold tabular-nums text-muted">
              {formatMediaTime(currentTime)}
            </span>
            <input
              type="range"
              min={0}
              max={duration || 0}
              step={0.1}
              value={currentTime}
              aria-label="מיקום בהקלטה"
              aria-valuetext={`${formatMediaTime(currentTime)} מתוך ${formatMediaTime(duration)}`}
              onChange={(e) => {
                const audio = audioRef.current;
                if (!audio) return;
                audio.currentTime = Number(e.target.value);
                setCurrentTime(audio.currentTime);
              }}
              className="media-range h-1.5 flex-1"
              style={{
                background: `linear-gradient(to right, #4f7bff 0%, #7c5cff ${progress}%, #e2e8f0 ${progress}%)`,
              }}
            />
            <span className="text-xs font-bold tabular-nums text-muted">
              {formatMediaTime(duration)}
            </span>
          </div>
        </div>
      </div>

      <div dir="ltr" className="flex items-center gap-2 pl-[4.5rem]">
        <button
          type="button"
          onClick={cycleRate}
          aria-label={`מהירות ניגון — כרגע פי ${rate}`}
          className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-muted transition-colors hover:bg-slate-200 hover:text-ink"
        >
          {rate}x
        </button>
        <button
          type="button"
          onClick={() => {
            const audio = audioRef.current;
            if (!audio) return;
            audio.muted = !audio.muted;
            setMuted(audio.muted);
          }}
          aria-label={muted ? "ביטול השתקה" : "השתקה"}
          className="grid h-8 w-8 place-items-center rounded-full text-muted transition-colors hover:bg-slate-100 hover:text-ink"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4.5 w-4.5" aria-hidden>
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
                d="M16.5 8.5a5 5 0 0 1 0 7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </svg>
        </button>
        <input
          type="range"
          min={0}
          max={1}
          step={0.05}
          value={muted ? 0 : volume}
          aria-label="עוצמת שמע"
          onChange={(e) => {
            const audio = audioRef.current;
            if (!audio) return;
            const next = Number(e.target.value);
            audio.volume = next;
            audio.muted = next === 0;
            setVolume(next);
            setMuted(next === 0);
          }}
          className="media-range h-1 w-20"
          style={{
            background: `linear-gradient(to right, #7c5cff ${(muted ? 0 : volume) * 100}%, #e2e8f0 ${(muted ? 0 : volume) * 100}%)`,
          }}
        />
      </div>
    </div>
  );
}
