'use client';

import { useEffect, useRef } from 'react';

export function useNewVisitorSound(visitorCount: number) {
  const prevCountRef = useRef<number | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!initializedRef.current) {
      prevCountRef.current = visitorCount;
      initializedRef.current = true;
      return;
    }

    if (prevCountRef.current !== null && visitorCount > prevCountRef.current) {
      const audio = new Audio('/sounds/notification.mp3');
      audio.play().catch(() => {});
    }

    prevCountRef.current = visitorCount;
  }, [visitorCount]);
}
