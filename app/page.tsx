import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#1a2332] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#4A7FFF] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4A7FFF]/30">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">شام كاش</h1>
          <p className="text-[#a0aec0] text-base">نظام إدارة الزوار والمدفوعات</p>
        </div>

        {/* Action Cards */}
        <div className="space-y-4">
          {/* Visitor Registration */}
          <Link href="/registration/step-1">
            <div className="bg-[#1e2d3d] rounded-2xl p-5 border border-[#2d3a4f] hover:border-[#4A7FFF]/50 hover:bg-[#4A7FFF]/5 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#4A7FFF]/20 rounded-xl flex items-center justify-center group-hover:bg-[#4A7FFF]/30 transition-all duration-200">
                  <svg className="w-6 h-6 text-[#4A7FFF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">تسجيل زائر جديد</h3>
                  <p className="text-[#a0aec0] text-sm">ابدأ عملية التسجيل للزوار الجدد</p>
                </div>
                <svg className="w-5 h-5 text-[#4A7FFF] rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Dashboard */}
          <Link href="/dashboard">
            <div className="bg-[#1e2d3d] rounded-2xl p-5 border border-[#2d3a4f] hover:border-[#4A7FFF]/50 hover:bg-[#4A7FFF]/5 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-all duration-200">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">لوحة التحكم</h3>
                  <p className="text-[#a0aec0] text-sm">إدارة الزوار ومتابعة الحالات</p>
                </div>
                <svg className="w-5 h-5 text-purple-400 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>

          {/* Forgot Password */}
          <Link href="/password-reset">
            <div className="bg-[#1e2d3d] rounded-2xl p-5 border border-[#2d3a4f] hover:border-[#4A7FFF]/50 hover:bg-[#4A7FFF]/5 transition-all duration-200 cursor-pointer group">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center group-hover:bg-orange-500/30 transition-all duration-200">
                  <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg">نسيت كلمة السر</h3>
                  <p className="text-[#a0aec0] text-sm">إعادة تعيين كلمة السر عبر رمز الأمان</p>
                </div>
                <svg className="w-5 h-5 text-orange-400 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        </div>

        {/* Footer */}
        <p className="text-center text-[#4a5568] text-sm mt-8">
          © 2024 شام كاش - جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
