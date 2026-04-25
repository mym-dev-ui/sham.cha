'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VisitorStep } from '@/lib/types';
import { getStepUrl } from '@/lib/stepRoutes';

const STORAGE_KEY = 'shamcha_visitors';

function readVisitorStep(visitorId: string): VisitorStep | null {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const visitors = JSON.parse(data) as Array<{ id: string; currentStep: VisitorStep }>;
    const visitor = visitors.find((v) => v.id === visitorId);
    return visitor ? visitor.currentStep : null;
  } catch {
    return null;
  }
}

/**
 * Redirects the visitor to the page matching their current step in the visitor
 * context whenever their step differs from the page they are currently on.
 *
 * Works both on initial mount (handles the case where the dashboard transferred
 * the visitor while they were offline) and in real-time via the `storage` event
 * (fires when the dashboard tab updates localStorage from a different tab).
 */
export function useVisitorRedirect(currentPageStep: VisitorStep) {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const checkAndRedirect = () => {
      const visitorId = sessionStorage.getItem('currentVisitorId');
      if (!visitorId) return;

      const step = readVisitorStep(visitorId);
      if (step === null || step === currentPageStep) return;

      const targetUrl = getStepUrl(step);
      if (targetUrl) router.replace(targetUrl);
    };

    // Check on mount
    checkAndRedirect();

    // Listen for updates from other tabs/windows (e.g. dashboard in another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) checkAndRedirect();
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [currentPageStep, router]);
}
