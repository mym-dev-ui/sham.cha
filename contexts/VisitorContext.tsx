'use client';

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from 'react';
import { Visitor, VisitorStep, RegistrationData } from '@/lib/types';

interface VisitorContextType {
  visitors: Visitor[];
  addVisitor: (data: Partial<Visitor>) => string;
  updateVisitorStep: (visitorId: string, step: VisitorStep) => void;
  updateVisitorData: (visitorId: string, data: Partial<RegistrationData>) => void;
  transferVisitor: (visitorId: string, targetStep: VisitorStep) => void;
  completeVisitor: (visitorId: string) => void;
  removeVisitor: (visitorId: string) => void;
  getVisitor: (visitorId: string) => Visitor | undefined;
}

const VisitorContext = createContext<VisitorContextType | null>(null);

const STORAGE_KEY = 'shamcha_visitors';

function loadFromStorage(): Visitor[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? (JSON.parse(data) as Visitor[]) : [];
  } catch {
    return [];
  }
}

export function VisitorProvider({ children }: { children: ReactNode }) {
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setVisitors(loadFromStorage());
    setInitialized(true);
  }, []);

  useEffect(() => {
    if (!initialized) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(visitors));
    } catch {
      // ignore storage errors
    }
  }, [visitors, initialized]);

  const addVisitor = useCallback((data: Partial<Visitor>): string => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `visitor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const newVisitor: Visitor = {
      name: data.name || 'زائر جديد',
      phone: data.phone || '',
      currentStep: data.currentStep !== undefined ? data.currentStep : 1,
      registrationData: data.registrationData || {},
      createdAt: data.createdAt || new Date().toISOString(),
      status: data.status || 'active',
      email: data.email,
      ...data,
      id,
    };
    setVisitors((prev) => [newVisitor, ...prev]);
    return id;
  }, []);

  const updateVisitorStep = useCallback((visitorId: string, step: VisitorStep) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, currentStep: step } : v))
    );
  }, []);

  const updateVisitorData = useCallback(
    (visitorId: string, data: Partial<RegistrationData>) => {
      setVisitors((prev) =>
        prev.map((v) =>
          v.id === visitorId
            ? { ...v, registrationData: { ...v.registrationData, ...data } }
            : v
        )
      );
    },
    []
  );

  const transferVisitor = useCallback((visitorId: string, targetStep: VisitorStep) => {
    setVisitors((prev) =>
      prev.map((v) => (v.id === visitorId ? { ...v, currentStep: targetStep } : v))
    );
  }, []);

  const completeVisitor = useCallback((visitorId: string) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitorId
          ? { ...v, status: 'completed' as const, currentStep: 4 as const }
          : v
      )
    );
  }, []);

  const removeVisitor = useCallback((visitorId: string) => {
    setVisitors((prev) => prev.filter((v) => v.id !== visitorId));
  }, []);

  const getVisitor = useCallback(
    (visitorId: string) => visitors.find((v) => v.id === visitorId),
    [visitors]
  );

  return (
    <VisitorContext.Provider
      value={{
        visitors,
        addVisitor,
        updateVisitorStep,
        updateVisitorData,
        transferVisitor,
        completeVisitor,
        removeVisitor,
        getVisitor,
      }}
    >
      {children}
    </VisitorContext.Provider>
  );
}

export function useVisitorContext(): VisitorContextType {
  const ctx = useContext(VisitorContext);
  if (!ctx) {
    throw new Error('useVisitorContext must be used within a VisitorProvider');
  }
  return ctx;
}
