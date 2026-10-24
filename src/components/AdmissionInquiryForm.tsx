import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  MessageCircle,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import { INSTITUTE_CONTACT } from '../data/organizationData';
import { useApp } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  ADMISSION_INQUIRY_QUALIFICATIONS,
  buildInstituteInquiryWhatsAppMessage,
  buildWhatsAppUrl,
  formatPakPhoneForTel,
  InstituteAdmissionInquiryInput,
  validateInstituteAdmissionInquiry,
} from '../utils/validation';

interface SavedStudentInquiry {
  id: string;
  studentFullName: string;
  interestedCourse: string;
  matricQualification: string;
  inquiryMessage: string;
  status: string;
}

export function AdmissionInquiryForm() {
  const { user, signInWithGoogle, courses, instituteSettings } = useApp();

  const defaultCourse = courses[0]?.title || 'Medical Laboratory Technology (MLT)';

  const [form, setForm] = useState<InstituteAdmissionInquiryInput>({
    studentFullName: '',
    guardianName: '',
    phoneNumber: '',
    whatsappNumber: '',
    email: user?.email || '',
    cityOrDistrict: 'Bhowana, District Chiniot',
    interestedCourse: defaultCourse,
    matricQualification: ADMISSION_INQUIRY_QUALIFICATIONS[0],
    inquiryMessage: '',
    consentGiven: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedInquiryId, setSavedInquiryId] = useState<string | null>(null);

  // Student's own inquiries synced securely via applicantUid == user.uid
  const [myInquiries, setMyInquiries] = useState<SavedStudentInquiry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNote, setEditNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  // Sync verified Google email if email field is still blank
  useEffect(() => {
    if (user?.email) {
      setForm((prev) => (prev.email.trim() === '' ? { ...prev, email: user.email || '' } : prev));
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setMyInquiries([]);
      return;
    }

    const q = query(
      collection(db, 'admissionInquiries'),
      where('applicantUid', '==', user.uid)
    );

    const unsubscribe = onSnapshot(
      q,
      (snap) => {
        setMyInquiries(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              studentFullName: String(data.studentFullName || ''),
              interestedCourse: String(data.interestedCourse || ''),
              matricQualification: String(data.matricQualification || ''),
              inquiryMessage: String(data.inquiryMessage || ''),
              status: String(data.status || 'New Inquiry'),
            };
          })
        );
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'admissionInquiries');
        } catch {
          // Structured error logged
        }
      }
    );

    return () => unsubscribe();
  }, [user]);

  const updateField = <K extends keyof InstituteAdmissionInquiryInput>(
    key: K,
    value: InstituteAdmissionInquiryInput[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleCopyMobileToWhatsApp = () => {
    if (!form.phoneNumber.trim()) return;
    updateField('whatsappNumber', form.phoneNumber.trim());
  };

  const handlePreSignIn = async () => {
    setSubmitError(null);
    const signedIn = await signInWithGoogle();
    if (!signedIn) {
      setSubmitError(
        'Google Sign-In did not complete. Verified sign-in is required before saving student contact PII to Firestore.'
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSavedInquiryId(null);

    const validationErrors = validateInstituteAdmissionInquiry(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    try {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await signInWithGoogle();
      }
      if (!activeUser) {
        throw new Error(
          'Verified Google Sign-In is required to securely store your contact details in Firestore. You may also send your inquiry via WhatsApp below.'
        );
      }

      const sanitizedPayload = {
        applicantUid: activeUser.uid,
        studentFullName: form.studentFullName.trim().slice(0, 100),
        guardianName: form.guardianName.trim().slice(0, 100),
        phoneNumber: form.phoneNumber.trim().slice(0, 20),
        whatsappNumber: form.whatsappNumber.trim().slice(0, 20),
        email: form.email.trim().slice(0, 160),
        cityOrDistrict: form.cityOrDistrict.trim().slice(0, 100),
        interestedCourse: form.interestedCourse.trim().slice(0, 120),
        matricQualification: form.matricQualification,
        inquiryMessage: form.inquiryMessage.trim().slice(0, 1000),
        consentGiven: true,
        status: 'New Inquiry',
        adminNotes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'admissionInquiries'), sanitizedPayload);
      setSavedInquiryId(docRef.id);
      setForm((prev) => ({
        ...prev,
        inquiryMessage: '',
        consentGiven: false,
      }));
    } catch (err) {
      try {
        if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
          handleFirestoreError(err, OperationType.CREATE, 'admissionInquiries');
        }
      } catch {
        // Logged structured FirestoreErrorInfo JSON
      }
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to save admission inquiry to Firestore. Please try again or contact Admissions via WhatsApp.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveApplicantNote = async (inq: SavedStudentInquiry) => {
    setSavingNote(true);
    setSubmitError(null);
    try {
      await updateDoc(doc(db, 'admissionInquiries', inq.id), {
        inquiryMessage: editNote.trim().slice(0, 1000),
        interestedCourse: inq.interestedCourse,
        updatedAt: serverTimestamp(),
      });
      setEditingId(null);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `admissionInquiries/${inq.id}`);
      } catch (e) {
        setSubmitError(e instanceof Error ? e.message : 'Unable to update inquiry note.');
      }
    } finally {
      setSavingNote(false);
    }
  };

  const waUrl = buildWhatsAppUrl(
    instituteSettings.whatsappPhone || INSTITUTE_CONTACT.primaryWhatsapp,
    buildInstituteInquiryWhatsAppMessage(form)
  );

  return (
    <section
      id="admission-inquiry"
      aria-labelledby="admission-inquiry-heading"
      className="py-16 lg:py-20 bg-[#f4f9fa] border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Guidance, Security Isolation Notice & Live Applicant Records */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <p className="text-xs text-[#0d7a78] font-medium">
                Admissions Counseling · Bhowana, District Chiniot · Secure Firestore Registry
              </p>
              <h2
                id="admission-inquiry-heading"
                className="font-display text-2xl sm:text-3xl font-semibold text-[#0b3b60] mt-1.5"
              >
                Request Admission &amp; Course Counseling
              </h2>
              <p className="text-sm text-slate-600 mt-3 leading-relaxed">
                Submit your contact details and preferred medical diploma track for direct follow-up from the Umm-e-Aiman Paramedical Institute admissions office in Bhowana.
              </p>
            </div>

            {/* Security & Identity Protection Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#f4f9fa] border border-slate-200 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-[#0d7a78]" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-[#0b3b60]">
                    Protected Student Contact Records
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    Your phone, WhatsApp, and guardian details are saved privately in Firestore under your verified Google account so only you and authorized institute administrators can access them.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                {user ? (
                  <p className="text-xs text-slate-700">
                    <span className="font-semibold text-[#0b3b60]">Verified Session:</span>{' '}
                    <span className="font-mono">{user.email}</span>
                  </p>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="text-xs text-slate-600">
                      Not signed in yet (prompted automatically on save)
                    </span>
                    <button
                      type="button"
                      onClick={handlePreSignIn}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#0b3b60] bg-[#f4f9fa] hover:bg-[#e5f1f3] border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Lock className="w-3.5 h-3.5 text-[#0d7a78]" aria-hidden="true" />
                      <span>Verify with Google</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Direct Chief Executive Contacts & Full Application Link */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
              <p className="text-xs text-slate-500">
                Direct Bhowana Campus Lines · Ready to Upload Documents?
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-[#0b3b60] font-semibold">
                <a
                  href={`tel:${formatPakPhoneForTel(instituteSettings.primaryPhone)}`}
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0d7a78]" aria-hidden="true" />
                  <span>{instituteSettings.primaryPhone}</span>
                </a>
                <span aria-hidden="true">·</span>
                <a
                  href={`tel:${formatPakPhoneForTel(instituteSettings.secondaryPhone)}`}
                  className="inline-flex items-center gap-1.5 hover:underline"
                >
                  <Phone className="w-3.5 h-3.5 text-[#0d7a78]" aria-hidden="true" />
                  <span>{instituteSettings.secondaryPhone}</span>
                </a>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                Already have your Matriculation result card and CNIC scans ready? Proceed to our{' '}
                <Link
                  to="/paramedical-institute/admissions"
                  className="font-semibold text-[#0d7a78] hover:underline"
                >
                  Full Online Admission Application &rarr;
                </Link>
              </p>
            </div>

            {/* Real-Time Applicant Inquiry Tracker */}
            {user && myInquiries.length > 0 && (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
                <h3 className="font-display text-base font-semibold text-[#0b3b60]">
                  Your Submitted Admission Inquiries ({myInquiries.length})
                </h3>
                <div className="space-y-3">
                  {myInquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-3.5 rounded-xl bg-[#f4f9fa] border border-slate-200 space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="font-mono tabular-nums text-slate-500">
                          Ref: {inq.id.slice(0, 8)}
                        </span>
                        <span className="font-semibold text-[#0d7a78]">{inq.status}</span>
                      </div>
                      <p className="text-xs font-semibold text-slate-900">{inq.interestedCourse}</p>
                      {inq.inquiryMessage && editingId !== inq.id && (
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {inq.inquiryMessage}
                        </p>
                      )}

                      {inq.status === 'New Inquiry' &&
                        (editingId === inq.id ? (
                          <div className="space-y-2 pt-1">
                            <label
                              htmlFor={`edit-inq-${inq.id}`}
                              className="block text-[11px] font-semibold text-slate-700"
                            >
                              Update Inquiry Note
                            </label>
                            <input
                              id={`edit-inq-${inq.id}`}
                              type="text"
                              maxLength={1000}
                              value={editNote}
                              onChange={(e) => setEditNote(e.target.value)}
                              className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg"
                            />
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                disabled={savingNote}
                                onClick={() => handleSaveApplicantNote(inq)}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#0b3b60] rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                {savingNote ? 'Saving...' : 'Save Note'}
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingId(null)}
                                className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 whitespace-nowrap shrink-0 cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(inq.id);
                              setEditNote(inq.inquiryMessage);
                            }}
                            className="text-xs font-semibold text-[#0b3b60] hover:underline cursor-pointer"
                          >
                            Edit Inquiry Note
                          </button>
                        ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Validated Firestore Admission Inquiry Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs"
            >
              <div className="pb-3 border-b border-slate-100">
                <p className="text-xs text-slate-500">
                  Umm-e-Aiman Paramedical Institute · Bhowana Admissions Desk
                </p>
                <h3 className="font-display text-xl font-semibold text-[#0b3b60] mt-0.5">
                  Student Contact &amp; Program Inquiry Form
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="inq-student-name"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Student Full Name *
                  </label>
                  <input
                    id="inq-student-name"
                    type="text"
                    maxLength={100}
                    value={form.studentFullName}
                    onChange={(e) => updateField('studentFullName', e.target.value)}
                    aria-invalid={Boolean(errors.studentFullName)}
                    placeholder="e.g., Ayesha Siddiqa"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0d7a78]"
                  />
                  {errors.studentFullName && (
                    <p className="text-xs text-red-700 mt-1">{errors.studentFullName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="inq-guardian-name"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Father’s / Guardian’s Name *
                  </label>
                  <input
                    id="inq-guardian-name"
                    type="text"
                    maxLength={100}
                    value={form.guardianName}
                    onChange={(e) => updateField('guardianName', e.target.value)}
                    aria-invalid={Boolean(errors.guardianName)}
                    placeholder="e.g., Muhammad Akram"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0d7a78]"
                  />
                  {errors.guardianName && (
                    <p className="text-xs text-red-700 mt-1">{errors.guardianName}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="inq-phone"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Mobile Number *
                  </label>
                  <input
                    id="inq-phone"
                    type="tel"
                    maxLength={20}
                    value={form.phoneNumber}
                    onChange={(e) => updateField('phoneNumber', e.target.value)}
                    aria-invalid={Boolean(errors.phoneNumber)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:border-[#0d7a78]"
                  />
                  {errors.phoneNumber && (
                    <p className="text-xs text-red-700 mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label
                      htmlFor="inq-whatsapp"
                      className="block text-xs font-semibold text-slate-800"
                    >
                      WhatsApp Number *
                    </label>
                    <button
                      type="button"
                      onClick={handleCopyMobileToWhatsApp}
                      className="text-[11px] font-semibold text-[#0d7a78] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Same as Mobile
                    </button>
                  </div>
                  <input
                    id="inq-whatsapp"
                    type="tel"
                    maxLength={20}
                    value={form.whatsappNumber}
                    onChange={(e) => updateField('whatsappNumber', e.target.value)}
                    aria-invalid={Boolean(errors.whatsappNumber)}
                    placeholder="03XX-XXXXXXX"
                    className="w-full px-3.5 py-2.5 text-sm font-mono tabular-nums border border-slate-300 rounded-lg focus:outline-none focus:border-[#0d7a78]"
                  />
                  {errors.whatsappNumber && (
                    <p className="text-xs text-red-700 mt-1">{errors.whatsappNumber}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="inq-email"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Email Address *
                  </label>
                  <input
                    id="inq-email"
                    type="email"
                    maxLength={160}
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    aria-invalid={Boolean(errors.email)}
                    placeholder="student@example.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0d7a78]"
                  />
                  {errors.email && <p className="text-xs text-red-700 mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label
                    htmlFor="inq-city"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    City &amp; District *
                  </label>
                  <input
                    id="inq-city"
                    type="text"
                    maxLength={100}
                    value={form.cityOrDistrict}
                    onChange={(e) => updateField('cityOrDistrict', e.target.value)}
                    aria-invalid={Boolean(errors.cityOrDistrict)}
                    placeholder="Bhowana, District Chiniot"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0d7a78]"
                  />
                  {errors.cityOrDistrict && (
                    <p className="text-xs text-red-700 mt-1">{errors.cityOrDistrict}</p>
                  )}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="inq-course"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Program of Interest *
                  </label>
                  <select
                    id="inq-course"
                    value={form.interestedCourse}
                    onChange={(e) => updateField('interestedCourse', e.target.value)}
                    aria-invalid={Boolean(errors.interestedCourse)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0d7a78]"
                  >
                    {courses.map((course) => (
                      <option key={course.id} value={course.title}>
                        {course.title}
                      </option>
                    ))}
                  </select>
                  {errors.interestedCourse && (
                    <p className="text-xs text-red-700 mt-1">{errors.interestedCourse}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="inq-qualification"
                    className="block text-xs font-semibold text-slate-800 mb-1"
                  >
                    Current Qualification *
                  </label>
                  <select
                    id="inq-qualification"
                    value={form.matricQualification}
                    onChange={(e) => updateField('matricQualification', e.target.value)}
                    aria-invalid={Boolean(errors.matricQualification)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-[#0d7a78]"
                  >
                    {ADMISSION_INQUIRY_QUALIFICATIONS.map((qual) => (
                      <option key={qual} value={qual}>
                        {qual}
                      </option>
                    ))}
                  </select>
                  {errors.matricQualification && (
                    <p className="text-xs text-red-700 mt-1">{errors.matricQualification}</p>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <label
                    htmlFor="inq-message"
                    className="block text-xs font-semibold text-slate-800"
                  >
                    Questions for the Admissions Office (Optional)
                  </label>
                  <span className="text-[11px] font-mono tabular-nums text-slate-500">
                    {form.inquiryMessage.length} / 1000
                  </span>
                </div>
                <textarea
                  id="inq-message"
                  rows={3}
                  maxLength={1000}
                  value={form.inquiryMessage}
                  onChange={(e) => updateField('inquiryMessage', e.target.value)}
                  placeholder="Ask about practical laboratory training, session dates, required Matric documents, or fee schedules..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:border-[#0d7a78]"
                />
                {errors.inquiryMessage && (
                  <p className="text-xs text-red-700 mt-1">{errors.inquiryMessage}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="inq-consent"
                  className="flex items-start gap-2.5 cursor-pointer select-none"
                >
                  <input
                    id="inq-consent"
                    type="checkbox"
                    checked={form.consentGiven}
                    onChange={(e) => updateField('consentGiven', e.target.checked)}
                    aria-invalid={Boolean(errors.consentGiven)}
                    className="mt-1 w-4 h-4 rounded border-slate-300 text-[#0d7a78] focus:ring-[#0d7a78]"
                  />
                  <span className="text-xs text-slate-700 leading-relaxed">
                    I authorize Umm-e-Aiman Paramedical Institute (Bhowana) to contact me using the phone, WhatsApp, and email details provided above, and I understand that submitting an inquiry is subject to official eligibility review and does not guarantee admission. *
                  </span>
                </label>
                {errors.consentGiven && (
                  <p className="text-xs text-red-700 mt-1">{errors.consentGiven}</p>
                )}
              </div>

              {Object.keys(errors).length > 0 && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800"
                >
                  Please review the highlighted fields above before saving your admission inquiry.
                </div>
              )}

              {submitError && (
                <div
                  role="alert"
                  className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800"
                >
                  {submitError}
                </div>
              )}

              {savedInquiryId && (
                <div
                  role="status"
                  className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5"
                >
                  <CheckCircle2
                    className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="font-semibold">
                      Admission Inquiry Saved to Firestore (Ref: {savedInquiryId.slice(0, 8)})
                    </p>
                    <p className="mt-1 text-emerald-900 leading-relaxed">
                      Our Bhowana admissions office has received your contact details and will follow up regarding {form.interestedCourse}.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0d7a78] hover:bg-[#0a6361] rounded-xl transition-colors disabled:opacity-60 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{submitting ? 'Saving Inquiry...' : 'Save Admission Inquiry'}</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0b3b60] bg-[#f4f9fa] hover:bg-[#e5f1f3] border border-slate-300 rounded-xl transition-colors whitespace-nowrap shrink-0"
                >
                  <MessageCircle className="w-4 h-4 text-[#0d7a78]" aria-hidden="true" />
                  <span>Inquire on WhatsApp</span>
                </a>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
