'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ResetStep = 'security-code' | 'new-password' | 'success';

export default function PasswordResetPage() {
  const router = useRouter();
  const [step, setStep] = useState<ResetStep>('security-code');

  // Security code step
  const [securityCode] = useState(() => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  });
  const [enteredCode, setEnteredCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [copied, setCopied] = useState(false);

  // New password step
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(securityCode);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = securityCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enteredCode.trim()) {
      setCodeError('رمز الأمان مطلوب');
      return;
    }
    if (enteredCode.trim().toUpperCase() !== securityCode) {
      setCodeError('رمز الأمان غير صحيح');
      return;
    }
    setCodeError('');
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 400));
    setIsSubmitting(false);
    setStep('new-password');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof passwordErrors = {};

    if (!newPassword) {
      errors.newPassword = 'كلمة السر الجديدة مطلوبة';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'كلمة السر يجب أن تكون 8 أحرف على الأقل';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'تأكيد كلمة السر مطلوب';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'كلمتا السر غير متطابقتين';
    }

    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    setPasswordErrors({});
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    setIsSubmitting(false);
    setStep('success');
  };

  // Success screen
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">تم تغيير كلمة السر!</h1>
          <p className="text-[#a0aec0] text-base mb-8">
            تم تحديث كلمة السر بنجاح. يمكنك الآن تسجيل الدخول بكلمة السر الجديدة.
          </p>
          <button onClick={() => router.push('/')} className="btn-primary">
            العودة للصفحة الرئيسية
          </button>
        </div>
      </div>
    );
  }

  // New Password screen
  if (step === 'new-password') {
    return (
      <div className="min-h-screen bg-[#1a2332] flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-[#4A7FFF] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4A7FFF]/30">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">كلمة السر الجديدة</h1>
            <p className="text-[#a0aec0] text-sm">أدخل كلمة السر الجديدة</p>
          </div>

          <div className="bg-[#1e2d3d] rounded-2xl p-6 border border-[#2d3a4f]">
            <form onSubmit={handlePasswordSubmit} className="space-y-5" noValidate>
              {/* New Password */}
              <div>
                <label className="block text-[#a0aec0] text-sm font-medium mb-2">
                  كلمة السر الجديدة
                </label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      if (passwordErrors.newPassword)
                        setPasswordErrors((p) => ({ ...p, newPassword: undefined }));
                    }}
                    placeholder="أدخل كلمة السر الجديدة"
                    className={`input-field pl-12 ${passwordErrors.newPassword ? 'error' : ''}`}
                    dir="rtl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0aec0] hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="error-text">{passwordErrors.newPassword}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[#a0aec0] text-sm font-medium mb-2">
                  تأكيد كلمة السر
                </label>
                <div className="relative">
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] pointer-events-none">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      if (passwordErrors.confirmPassword)
                        setPasswordErrors((p) => ({ ...p, confirmPassword: undefined }));
                    }}
                    placeholder="أعد إدخال كلمة السر"
                    className={`input-field pl-12 ${passwordErrors.confirmPassword ? 'error' : ''}`}
                    dir="rtl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a0aec0] hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="error-text">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    جاري الحفظ...
                  </>
                ) : (
                  'تأكيد كلمة السر الجديدة'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // Security Code screen (first step of password reset)
  return (
    <div className="min-h-screen bg-[#f0f4f8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4A7FFF] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4A7FFF]/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-1">نسيت كلمة السر؟</h1>
          <p className="text-gray-500 text-sm">أدخل رمز الأمان للمتابعة إلى إعادة التعيين</p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg">
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

          <form onSubmit={handleCodeSubmit} className="space-y-4" noValidate>
            <div>
              <label className="block text-gray-600 text-sm font-medium mb-2">
                أدخل رمز الأمان
              </label>
              <input
                type="text"
                value={enteredCode}
                onChange={(e) => {
                  setEnteredCode(e.target.value.toUpperCase());
                  if (codeError) setCodeError('');
                }}
                placeholder="أدخل الرمز هنا"
                maxLength={8}
                className={`w-full border rounded-xl px-4 py-3 text-center text-xl font-bold tracking-widest font-mono transition-all duration-200 focus:outline-none ${
                  codeError
                    ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-1 focus:ring-red-400'
                    : 'border-gray-300 bg-white focus:border-[#4A7FFF] focus:ring-1 focus:ring-[#4A7FFF]'
                }`}
                dir="ltr"
              />
              {codeError && (
                <p className="text-red-500 text-sm mt-1 text-right">{codeError}</p>
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
                  متابعة
                  <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>
        </div>

        <div className="text-center mt-4">
          <button
            onClick={() => router.back()}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← العودة
          </button>
        </div>
      </div>
    </div>
  );
}
