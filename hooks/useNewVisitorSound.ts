'use client';

import { useEffect, useRef } from 'react';

export function useNewVisitorSound(visitorCount: number) {
  const prevCountRef = useRef<number | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!audioRef.current) {
      const audio = new Audio('/sounds/new-visitor.mp3');
      audio.volume = 0.7;
      audioRef.current = audio;
    }

    if (!initializedRef.current) {
      prevCountRef.current = visitorCount;
      initializedRef.current = true;
      return;
    }

    if (prevCountRef.current !== null && visitorCount > prevCountRef.current) {
      audioRef.current?.play().catch(() => {});
    }

    prevCountRef.current = visitorCount;
  }, [visitorCount]);
}
