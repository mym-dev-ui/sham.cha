'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import { useVisitorRedirect } from '@/hooks/useVisitorRedirect';

const STORAGE_KEY = 'shamcha_visitors';

interface VisitorInfo {
  name: string;
  phone: string;
}

function loadVisitorInfo(): VisitorInfo | null {
  if (typeof window === 'undefined') return null;
  try {
    const visitorId = sessionStorage.getItem('currentVisitorId');
    if (!visitorId) return null;
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return null;
    const visitors = JSON.parse(data) as Array<{ id: string; name: string; phone: string }>;
    const visitor = visitors.find((v) => v.id === visitorId);
    return visitor ? { name: visitor.name, phone: visitor.phone } : null;
  } catch {
    return null;
  }
}

export default function AppUpdatePage() {
  const router = useRouter();
  const [visitorInfo, setVisitorInfo] = useState<VisitorInfo | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDone, setIsDone] = useState(false);

  useVisitorRedirect('app-update');

  useEffect(() => {
    setVisitorInfo(loadVisitorInfo());
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsUpdating(false);
    setIsDone(true);
  };

  if (isDone) {
    return (
      <main
        className="min-h-screen bg-gradient-to-b from-[#020617] to-[#020c2b] text-white flex items-center justify-center px-4"
        dir="rtl"
      >
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">تم التحديث بنجاح!</h1>
          <p className="text-gray-400 text-base mb-8">
            تم تحديث التطبيق بنجاح. يمكنك الآن المتابعة.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-2xl transition-colors"
          >
            العودة للصفحة الرئيسية
          </button>
        </div>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen bg-gradient-to-b from-[#020617] to-[#020c2b] text-white flex flex-col items-center px-4 py-8"
      dir="rtl"
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size={80} />
          <h1 className="text-xl font-bold mt-2">SHAM CASH</h1>
          <p className="text-teal-400 text-sm">نظام إدارة الزوار والمدفوعات</p>
        </div>

        {/* Update Icon */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 bg-teal-500/20 rounded-2xl flex items-center justify-center mb-4">
            <svg
              className="w-10 h-10 text-teal-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.8}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white">تحديث التطبيق</h2>
          <p className="text-gray-400 text-sm mt-2 text-center">
            يرجى إتمام عملية تحديث التطبيق للاستمرار في استخدام الخدمة
          </p>
        </div>

        {/* Visitor info */}
        {visitorInfo && (
          <div className="bg-[#1e2d3d] border border-[#2d3a4f] rounded-2xl p-4 mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-500/20 rounded-full flex items-center justify-center text-teal-400 font-bold shrink-0">
              {visitorInfo.name.charAt(0)}
            </div>
            <div>
              <p className="text-white font-semibold">{visitorInfo.name}</p>
              <p className="text-gray-400 text-sm">{visitorInfo.phone}</p>
            </div>
          </div>
        )}

        {/* Info Card */}
        <div className="bg-[#1e2d3d] border border-[#2d3a4f] rounded-2xl p-6 mb-6">
          <h3 className="text-white font-bold text-lg mb-4">ما الجديد في هذا التحديث؟</h3>
          <ul className="space-y-3">
            {[
              'تحسين الأداء وسرعة التطبيق',
              'إصلاح بعض المشكلات التقنية',
              'تحسينات على واجهة المستخدم',
              'تعزيز أمان البيانات والخصوصية',
            ].map((item) => (
              <li key={item} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-teal-500/20 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-teal-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                </span>
                <span className="text-gray-300 text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Update Button */}
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          {isUpdating ? (
            <>
              <svg
                className="animate-spin w-5 h-5"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              جاري التحديث...
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              تحديث الآن
            </>
          )}
        </button>

        <div className="text-center mt-4">
          <button
            onClick={() => router.back()}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ← العودة
          </button>
        </div>
      </div>
    </main>
  );
}
