'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/StepIndicator';

export default function Step3Page() {
  const router = useRouter();
  const [securityCode] = useState(() => {
    // Generate a mock security code
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  });
  const [enteredCode, setEnteredCode] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(securityCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = securityCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!enteredCode.trim()) {
      setError('رمز الأمان مطلوب');
      return;
    }

    if (enteredCode.trim().toUpperCase() !== securityCode) {
      setError('رمز الأمان غير صحيح، يرجى المحاولة مرة أخرى');
      return;
    }

    setError('');
    setIsSubmitting(true);

    const existing = JSON.parse(sessionStorage.getItem('registrationData') || '{}');
    sessionStorage.setItem(
      'registrationData',
      JSON.stringify({ ...existing, securityCode: enteredCode.trim().toUpperCase() })
    );

    await new Promise((r) => setTimeout(r, 400));
    router.push('/registration/step-4');
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4A7FFF] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4A7FFF]/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">رمز الأمان</h1>
          <p className="text-gray-500 text-sm">انسخ رمز الأمان وأدخله في الحقل أدناه</p>
        </div>

        {/* Step Indicator */}
        <div className="mb-8">
          <StepIndicator currentStep={3} />
        </div>

        {/* Security Code Display Card */}
        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg mb-4">
          <p className="text-gray-600 text-sm text-center mb-4">رمز الأمان الخاص بك</p>

          <div className="flex items-center justify-between bg-[#f0f4f8] rounded-xl px-5 py-4 border border-gray-200 mb-6">
            <button
              type="button"
              onClick={handleCopy}
              className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 ${
                copied ? 'text-green-500' : 'text-[#4A7FFF] hover:text-[#3a6fee]'
              }`}
            >
              {copied ? (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  تم النسخ!
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  نسخ
                </>
              )}
            </button>

            <span className="text-2xl font-bold tracking-widest text-gray-800 font-mono select-all">
              {securityCode}
            </span>
          </div>

          {/* Enter Code Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">
                أدخل رمز الأمان
              </label>
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => {
                  setEnteredCode(e.target.value.toUpperCase());
                  if (error) setError('');
                }}
                placeholder="أدخل الرمز هنا"
                maxLength={8}
                className={`w-full border rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest font-mono transition-all duration-200 focus:outline-none ${
                  error
                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                    : 'border-gray-300 bg-white focus:border-[#4A7FFF] focus:ring-1 focus:ring-[#4A7FFF]'
                }`}
                dir="ltr"
              />
              {error && (
                <p className="text-red-500 text-sm mt-1 text-right">{error}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#4A7FFF] hover:bg-[#3a6fee] text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 text-base flex items-center justify-center gap-2"
              style={{ minHeight: '52px' }}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري التحقق...
                </>
              ) : (
                <>
                  تأكيد الرمز
                  <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Back link */}
        <div className="text-center mt-4">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← العودة للخطوة السابقة
          </button>
        </div>
      </div>
    </div>
  );
}
