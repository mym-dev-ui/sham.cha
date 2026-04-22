'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Logo from '@/components/Logo';
import FloatingInput from '@/components/FloatingInput';

const ADMIN_EMAIL = 'admin@shamcash.com';
const ADMIN_PASSWORD = 'shamcash2024';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    if (email.trim() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      sessionStorage.setItem('dashboard_auth', 'true');
      router.push('/dashboard');
    } else {
      setError('البريد الإلكتروني أو كلمة المرور غير صحيحة');
    }

    setIsLoading(false);
  };

  const EyeIcon = (
    <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-white transition-colors">
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        {showPassword
          ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
        }
      </svg>
    </button>
  );

  const EmailIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );

  const LockIcon = (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#020617] to-[#020c2b] text-white flex flex-col items-center justify-center px-4 py-8" dir="rtl">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <Logo size={80} />
          <h1 className="text-xl font-bold mt-3">SHAM CASH</h1>
          <p className="text-blue-400 text-sm mt-1">نظام إدارة الزوار والمدفوعات</p>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">تسجيل الدخول</h2>
          <p className="text-gray-400 text-sm mt-1">أدخل بياناتك للوصول إلى لوحة التحكم</p>
        </div>

        <div className="bg-[#0f172a] rounded-2xl p-6 shadow-lg">
          <form onSubmit={handleLogin} className="space-y-4" noValidate>

            <FloatingInput
              label="البريد الإلكتروني"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              icon={EmailIcon}
              dir="ltr"
              autoComplete="email"
            />

            <FloatingInput
              label="كلمة المرور"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              icon={LockIcon}
              rightElement={EyeIcon}
              autoComplete="current-password"
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !email || !password}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3.5 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {isLoading ? (
                <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>جاري التحقق...</>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  دخول
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-gray-600 text-xs mt-6">
          للدخول كمسؤول استخدم البريد وكلمة المرور المخصصة
        </p>
      </div>
    </main>
  );
}
