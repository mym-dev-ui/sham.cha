'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVisitorContext as useVisitors } from '@/contexts/VisitorContext';
import { useNewVisitorSound } from '@/hooks/useNewVisitorSound';
import { Visitor, VisitorStep, STEP_LABELS, STEP_COLORS } from '@/lib/types';
import TransferVisitorModal from '@/components/TransferVisitorModal';
import VisitorStepBadge from '@/components/VisitorStepBadge';
import DashboardGuard from '@/components/DashboardGuard';

const STEP_ICONS: Record<string, string> = {
  '1': '👤',
  '2': '📧',
  '3': '🔐',
  '4': '✅',
  'password-reset': '🔑',
};

function DashboardContent() {
  const router = useRouter();
  const {
    visitors,
    transferVisitor,
    completeVisitor,
    removeVisitor,
    addVisitor,
  } = useVisitors();

  useNewVisitorSound(visitors.length);

  const handleLogout = () => {
    sessionStorage.removeItem('dashboard_auth');
    router.push('/login');
  };

  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [filterStep, setFilterStep] = useState<string>('all');
  const [lastTransferred, setLastTransferred] = useState<string | null>(null);

  const handleTransfer = (visitorId: string, targetStep: VisitorStep) => {
    transferVisitor(visitorId, targetStep);
    setLastTransferred(visitorId);
    setTimeout(() => setLastTransferred(null), 2000);
  };

  const handleAddTestVisitor = () => {
    const names = ['محمد عبدالله', 'سارة أحمد', 'عمر الحسن', 'نورا محمد', 'يوسف علي'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    addVisitor({
      name: randomName,
      phone: `05${Math.floor(10000000 + Math.random() * 90000000)}`,
      registrationData: {
        fullName: randomName,
      },
    });
  };

  const filteredVisitors = filterStep === 'all'
    ? visitors
    : visitors.filter((v) => String(v.currentStep) === filterStep);

  const stepCounts = visitors.reduce<Record<string, number>>((acc, v) => {
    const key = String(v.currentStep);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const completedCount = visitors.filter((v) => v.status === 'completed').length;

  return (
    <div className="min-h-screen bg-[#1a2332]" dir="rtl">
      {/* Top Navigation */}
      <nav className="bg-[#1e2d3d] border-b border-[#2d3a4f] px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#4A7FFF] rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-lg leading-none">شام كاش</h1>
              <p className="text-[#a0aec0] text-xs">لوحة التحكم</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/registration/step-1"
              className="flex items-center gap-2 bg-[#4A7FFF] hover:bg-[#3a6fee] text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              زائر جديد
            </Link>
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#2d3a4f] hover:bg-[#3a4a5f] text-[#a0aec0] hover:text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              الرئيسية
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="md:col-span-1 bg-[#1e2d3d] rounded-2xl p-4 border border-[#2d3a4f] text-center">
            <p className="text-3xl font-bold text-white">{visitors.length}</p>
            <p className="text-[#a0aec0] text-sm mt-1">إجمالي الزوار</p>
          </div>
          {(['1', '2', '3', '4'] as const).map((step) => (
            <div key={step} className="bg-[#1e2d3d] rounded-2xl p-4 border border-[#2d3a4f] text-center">
              <p className="text-2xl font-bold text-white">{stepCounts[step] || 0}</p>
              <p className="text-[#a0aec0] text-xs mt-1">
                {step === '1' ? 'معلومات شخصية' :
                 step === '2' ? 'بريد وكلمة سر' :
                 step === '3' ? 'رمز الأمان' : 'تحقق نهائي'}
              </p>
              <span className={`inline-block w-2 h-2 rounded-full mt-2 ${
                step === '1' ? 'bg-blue-400' :
                step === '2' ? 'bg-purple-400' :
                step === '3' ? 'bg-yellow-400' : 'bg-green-400'
              }`} />
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <span className="text-[#a0aec0] text-sm shrink-0">تصفية حسب الخطوة:</span>
          {[
            { value: 'all', label: 'الكل' },
            { value: '1', label: 'الخطوة ١' },
            { value: '2', label: 'الخطوة ٢' },
            { value: '3', label: 'الخطوة ٣' },
            { value: '4', label: 'الخطوة ٤' },
            { value: 'password-reset', label: 'إعادة تعيين' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => setFilterStep(f.value)}
              className={`shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                filterStep === f.value
                  ? 'bg-[#4A7FFF] text-white'
                  : 'bg-[#1e2d3d] border border-[#2d3a4f] text-[#a0aec0] hover:text-white hover:border-[#4A7FFF]/50'
              }`}
            >
              {f.label}
              {f.value !== 'all' && stepCounts[f.value] ? (
                <span className="mr-1.5 bg-white/20 text-xs px-1.5 py-0.5 rounded-full">
                  {stepCounts[f.value]}
                </span>
              ) : null}
            </button>
          ))}

          <button
            onClick={handleAddTestVisitor}
            className="shrink-0 mr-auto flex items-center gap-2 bg-[#2d3a4f] hover:bg-[#3a4a5f] text-[#a0aec0] hover:text-white border border-[#4a5568] px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            إضافة زائر تجريبي
          </button>
        </div>

        {/* Visitors Grid */}
        {filteredVisitors.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-[#2d3a4f] rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#4a5568]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className="text-[#a0aec0] text-lg">لا يوجد زوار في هذه الخطوة</p>
            <p className="text-[#4a5568] text-sm mt-1">
              {filterStep !== 'all' ? 'جرب تغيير الفلتر أو أضف زائراً جديداً' : 'أضف زائراً جديداً للبدء'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredVisitors.map((visitor) => {
              const isJustTransferred = lastTransferred === visitor.id;
              const stepKey = String(visitor.currentStep);
              const stepColorClass = STEP_COLORS[stepKey] || 'bg-gray-500';

              return (
                <div
                  key={visitor.id}
                  className={`bg-[#1e2d3d] rounded-2xl border transition-all duration-300 overflow-hidden ${
                    isJustTransferred
                      ? 'border-green-500/50 shadow-lg shadow-green-500/10'
                      : 'border-[#2d3a4f] hover:border-[#4A7FFF]/30'
                  }`}
                >
                  {/* Card Header */}
                  <div className="px-5 py-4 flex items-center gap-3 border-b border-[#2d3a4f]">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg ${stepColorClass}`}>
                      {visitor.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-semibold text-base truncate">
                        {visitor.name}
                      </h3>
                      <p className="text-[#a0aec0] text-sm">{visitor.phone}</p>
                    </div>
                    {isJustTransferred && (
                      <span className="text-green-400 text-xs font-medium animate-pulse">
                        ✓ تم النقل
                      </span>
                    )}
                    {visitor.status === 'completed' && (
                      <span className="bg-green-500/20 text-green-400 text-xs font-medium px-2 py-1 rounded-full">
                        مكتمل
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="px-5 py-4">
                    {/* Current Step */}
                    <div className="flex items-center justify-between mb-4">
                      <VisitorStepBadge step={visitor.currentStep} />
                      <span className="text-[#4a5568] text-xs">
                        {STEP_ICONS[stepKey]} الخطوة الحالية
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((s) => {
                          const stepNum = typeof visitor.currentStep === 'number' ? visitor.currentStep : 0;
                          return (
                            <div
                              key={s}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                s <= stepNum
                                  ? stepColorClass
                                  : 'bg-[#2d3a4f]'
                              }`}
                            />
                          );
                        })}
                      </div>
                      <p className="text-[#4a5568] text-xs mt-1 text-left">
                        {typeof visitor.currentStep === 'number'
                          ? `${visitor.currentStep}/4`
                          : '—'}
                      </p>
                    </div>

                    {/* Registration Data Summary */}
                    {visitor.registrationData.email && (
                      <div className="flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-[#4a5568] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[#a0aec0] text-sm truncate">{visitor.registrationData.email}</span>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => {
                          setSelectedVisitor(visitor);
                          setShowTransferModal(true);
                        }}
                        disabled={visitor.status === 'completed'}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          visitor.status === 'completed'
                            ? 'bg-[#2d3a4f]/50 text-[#4a5568] cursor-not-allowed'
                            : 'bg-[#4A7FFF]/15 hover:bg-[#4A7FFF]/25 text-[#4A7FFF] border border-[#4A7FFF]/30 hover:border-[#4A7FFF]/50'
                        }`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                        نقل الزائر
                      </button>

                      {visitor.status !== 'completed' && (
                        <button
                          onClick={() => completeVisitor(visitor.id)}
                          className="px-3 py-2.5 rounded-xl bg-green-500/10 hover:bg-green-500/20 text-green-400 border border-green-500/20 hover:border-green-500/40 transition-all duration-200"
                          title="إتمام"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </button>
                      )}

                      <button
                        onClick={() => removeVisitor(visitor.id)}
                        className="px-3 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 hover:border-red-500/40 transition-all duration-200"
                        title="حذف"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Transfer Modal */}
      {showTransferModal && selectedVisitor && (
        <TransferVisitorModal
          visitor={selectedVisitor}
          onTransfer={handleTransfer}
          onClose={() => {
            setShowTransferModal(false);
            setSelectedVisitor(null);
          }}
        />
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardGuard>
      <DashboardContent />
    </DashboardGuard>
  );
}
