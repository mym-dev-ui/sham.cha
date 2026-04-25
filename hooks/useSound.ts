'use client';

import { useCallback, useEffect, useRef } from 'react';

const SOUND_PATH = '/sounds/notification.mp3';

function playNotificationSound() {
  if (typeof window === 'undefined') return;
  const audio = new Audio(SOUND_PATH);
  audio.play().catch(() => {});
}

export function useSound() {
  const play = useCallback(() => {
    playNotificationSound();
  }, []);

  return { play };
}

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
      playNotificationSound();
    }

    prevCountRef.current = visitorCount;
  }, [visitorCount]);
}
