'use client';

import { useState, useCallback } from 'react';
import { Visitor, VisitorStep, RegistrationData } from '@/lib/types';

const INITIAL_VISITORS: Visitor[] = [
  {
    id: '1',
    name: 'أحمد محمد',
    phone: '0501234567',
    currentStep: 1,
    registrationData: {
      fullName: 'أحمد محمد',
      phone: '0501234567',
    },
    createdAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: '2',
    name: 'فاطمة علي',
    phone: '0559876543',
    email: 'fatima@example.com',
    currentStep: 2,
    registrationData: {
      fullName: 'فاطمة علي',
      phone: '0559876543',
      idNumber: '1098765432',
      address: 'الرياض، حي النزهة',
      email: 'fatima@example.com',
    },
    createdAt: new Date().toISOString(),
    status: 'active',
  },
  {
    id: '3',
    name: 'خالد السعيد',
    phone: '0531122334',
    currentStep: 3,
    registrationData: {
      fullName: 'خالد السعيد',
      phone: '0531122334',
      idNumber: '1055667788',
      address: 'جدة، حي الزهراء',
      email: 'khaled@example.com',
    },
    createdAt: new Date().toISOString(),
    status: 'active',
  },
];

export function useVisitors() {
  const [visitors, setVisitors] = useState<Visitor[]>(INITIAL_VISITORS);

  const addVisitor = useCallback((data: Partial<Visitor>) => {
    const newVisitor: Visitor = {
      id: Date.now().toString(),
      name: data.name || 'زائر جديد',
      phone: data.phone || '',
      currentStep: 1,
      registrationData: data.registrationData || {},
      createdAt: new Date().toISOString(),
      status: 'active',
      ...data,
    };
    setVisitors((prev) => [newVisitor, ...prev]);
    return newVisitor.id;
  }, []);

  const updateVisitorStep = useCallback(
    (visitorId: string, step: VisitorStep) => {
      setVisitors((prev) =>
        prev.map((v) =>
          v.id === visitorId ? { ...v, currentStep: step } : v
        )
      );
    },
    []
  );

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

  const transferVisitor = useCallback(
    (visitorId: string, targetStep: VisitorStep) => {
      setVisitors((prev) =>
        prev.map((v) =>
          v.id === visitorId ? { ...v, currentStep: targetStep } : v
        )
      );
    },
    []
  );

  const completeVisitor = useCallback((visitorId: string) => {
    setVisitors((prev) =>
      prev.map((v) =>
        v.id === visitorId ? { ...v, status: 'completed' as const } : v
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

  return {
    visitors,
    addVisitor,
    updateVisitorStep,
    updateVisitorData,
    transferVisitor,
    completeVisitor,
    removeVisitor,
    getVisitor,
  };
}
