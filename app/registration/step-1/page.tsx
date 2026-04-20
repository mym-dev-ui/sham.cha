'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StepIndicator from '@/components/StepIndicator';
import { useVisitorContext } from '@/contexts/VisitorContext';

interface FormData {
  fullName: string;
  phone: string;
  idNumber: string;
  address: string;
}

interface FormErrors {
  fullName?: string;
  phone?: string;
  idNumber?: string;
  address?: string;
}

export default function Step1Page() {
  const router = useRouter();
  const { addVisitor } = useVisitorContext();
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    phone: '',
    idNumber: '',
    address: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'الاسم الكامل مطلوب';
    } else if (formData.fullName.trim().length < 3) {
      newErrors.fullName = 'الاسم يجب أن يكون 3 أحرف على الأقل';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^[0-9+\-\s]{7,15}$/.test(formData.phone.trim())) {
      newErrors.phone = 'رقم الهاتف غير صحيح';
    }

    if (!formData.idNumber.trim()) {
      newErrors.idNumber = 'رقم الهوية مطلوب';
    } else if (!/^[0-9]{7,15}$/.test(formData.idNumber.trim())) {
      newErrors.idNumber = 'رقم الهوية يجب أن يكون أرقاماً فقط (7-15 رقم)';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'العنوان مطلوب';
    } else if (formData.address.trim().length < 5) {
      newErrors.address = 'العنوان يجب أن يكون 5 أحرف على الأقل';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    // Create a new visitor in the global context (persisted to localStorage)
    const visitorId = addVisitor({
      name: formData.fullName.trim(),
      phone: formData.phone.trim(),
      currentStep: 1,
      registrationData: {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        idNumber: formData.idNumber.trim(),
        address: formData.address.trim(),
      },
    });

    // Store visitor ID in sessionStorage so subsequent steps know which visitor to update
    sessionStorage.setItem('currentVisitorId', visitorId);

    await new Promise((r) => setTimeout(r, 400));
    router.push('/registration/step-2');
  };

  return (
    <div className="min-h-screen bg-[#1a2332] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#4A7FFF] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#4A7FFF]/30">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">المعلومات الشخصية</h1>
          <p className="text-[#a0aec0] text-sm">أدخل بياناتك الشخصية للمتابعة</p>
        </div>

        {/* Step Indicator */}
        <StepIndicator currentStep={1} />

        {/* Form Card */}
        <div className="bg-[#1e2d3d] rounded-2xl p-6 border border-[#2d3a4f]">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>

            {/* Full Name */}
            <div>
              <label className="block text-[#a0aec0] text-sm font-medium mb-2">
                الاسم الكامل
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  placeholder="أدخل اسمك الكامل"
                  className={`input-field ${errors.fullName ? 'error' : ''}`}
                  dir="rtl"
                />
              </div>
              {errors.fullName && <p className="error-text">{errors.fullName}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-[#a0aec0] text-sm font-medium mb-2">
                رقم الهاتف
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="05xxxxxxxx"
                  className={`input-field ${errors.phone ? 'error' : ''}`}
                  dir="rtl"
                />
              </div>
              {errors.phone && <p className="error-text">{errors.phone}</p>}
            </div>

            {/* ID Number */}
            <div>
              <label className="block text-[#a0aec0] text-sm font-medium mb-2">
                رقم الهوية
              </label>
              <div className="relative">
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0aec0] pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={formData.idNumber}
                  onChange={(e) => handleChange('idNumber', e.target.value)}
                  placeholder="أدخل رقم الهوية"
                  className={`input-field ${errors.idNumber ? 'error' : ''}`}
                  dir="rtl"
                  inputMode="numeric"
                />
              </div>
              {errors.idNumber && <p className="error-text">{errors.idNumber}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="block text-[#a0aec0] text-sm font-medium mb-2">
                العنوان
              </label>
              <div className="relative">
                <div className="absolute right-3 top-4 text-[#a0aec0] pointer-events-none">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <textarea
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder="أدخل عنوانك الكامل"
                  rows={3}
                  className={`input-field resize-none ${errors.address ? 'error' : ''}`}
                  style={{ paddingTop: '14px' }}
                  dir="rtl"
                />
              </div>
              {errors.address && <p className="error-text">{errors.address}</p>}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary mt-2 flex items-center justify-center gap-2"
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

        {/* Back link */}
        <div className="text-center mt-4">
          <a href="/" className="text-[#a0aec0] hover:text-white text-sm transition-colors">
            ← العودة للصفحة الرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
