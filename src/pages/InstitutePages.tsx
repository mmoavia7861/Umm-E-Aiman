import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from 'firebase/firestore';
import {
  Activity,
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Library,
  MapPin,
  MessageCircle,
  Microscope,
  Phone,
  Pill,
  Stethoscope,
  Upload,
  Users,
} from 'lucide-react';
import {
  INSTITUTE_CONTACT,
  INSTITUTE_FACILITIES,
  MedicalCourse,
} from '../data/organizationData';
import { useApp } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  AdmissionFormInput,
  buildAdmissionWhatsAppMessage,
  buildWhatsAppUrl,
  calculateMatricPercentage,
  formatPakPhoneForTel,
  isValidPakistaniPhone,
  meetsMinimumMatricEligibility,
  validateAdmissionApplication,
  validateDocumentAttachment,
} from '../utils/validation';
import { PromoVideoSection } from '../components/MediaGalleryView';
import { VirtualTour } from '../components/VirtualTour';
import { AdmissionInquiryForm } from '../components/AdmissionInquiryForm';
import { classificationLabel, SmartMedia } from '../components/HostelInfoPlate';
import { HealthcareSearchExplorer, LocationMapsExplorer } from '../components/GroundingWidgets';

function InstituteFacilityIcon({ name }: { name: string }) {
  const cls = 'w-5 h-5 text-[#0d7a78]';
  switch (name) {
    case 'Microscope':
      return <Microscope className={cls} aria-hidden="true" />;
    case 'Building2':
      return <Building2 className={cls} aria-hidden="true" />;
    case 'GraduationCap':
      return <GraduationCap className={cls} aria-hidden="true" />;
    case 'Stethoscope':
      return <Stethoscope className={cls} aria-hidden="true" />;
    case 'Pill':
      return <Pill className={cls} aria-hidden="true" />;
    case 'Library':
      return <Library className={cls} aria-hidden="true" />;
    case 'Activity':
      return <Activity className={cls} aria-hidden="true" />;
    default:
      return <Users className={cls} aria-hidden="true" />;
  }
}

function CourseCard({
  course,
  whatsappPhone,
  isFocused = false,
}: {
  course: MedicalCourse;
  whatsappPhone: string;
  isFocused?: boolean;
}) {
  const waUrl = buildWhatsAppUrl(
    whatsappPhone,
    `Hello Umm-e-Aiman Paramedical Institute, I would like admission details for the "${course.title}" program in Bhowana.`
  );

  return (
    <article
      id={`course-${course.id}`}
      className={`scroll-mt-24 bg-white rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-6 border transition-shadow ${
        isFocused ? 'border-[#0d7a78] ring-2 ring-[#0d7a78]/40 shadow-md' : 'border-slate-200'
      }`}
    >
      <div className="space-y-3">
        <p className="text-xs text-[#0d7a78] font-medium">
          <span>{course.shortCode}</span>
          <span aria-hidden="true"> · </span>
          <span>{course.durationLabel}</span>
        </p>

        <h3 className="font-display text-xl font-semibold text-[#0b3b60]">{course.title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{course.overview}</p>

        <div className="pt-3 border-t border-slate-100 space-y-3">
          <div>
            <p className="text-xs font-semibold text-slate-900">Key Subjects &amp; Learning Areas</p>
            <ul className="mt-1.5 grid sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
              {course.keyLearningAreas.map((area, idx) => (
                <li key={idx}>• {area}</li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-900">Practical Training Overview</p>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{course.practicalTraining}</p>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div>
              <p className="text-xs font-semibold text-slate-900">Entry Requirements</p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{course.eligibilityLabel}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-900">Possible Career Pathways</p>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                {course.careerPathways.join(' · ')} (employment not guaranteed)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
        <Link
          to={`/paramedical-institute/admissions?course=${encodeURIComponent(course.title)}`}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0d7a78] hover:bg-[#0a6361] rounded-lg transition-colors whitespace-nowrap"
        >
          <span>Apply Now</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </Link>
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0b3b60] bg-[#f4f9fa] hover:bg-[#e5f1f3] border border-slate-300 rounded-lg transition-colors whitespace-nowrap"
        >
          <MessageCircle className="w-3.5 h-3.5 text-[#0d7a78]" aria-hidden="true" />
          <span>WhatsApp Inquiry</span>
        </a>
      </div>
    </article>
  );
}

export function InstituteLandingPage() {
  const { courses, instituteSettings } = useApp();
  const principalCourses = courses.filter((c) => c.category === 'principal');

  const instituteWa = buildWhatsAppUrl(
    instituteSettings.whatsappPhone || INSTITUTE_CONTACT.primaryWhatsapp,
    INSTITUTE_CONTACT.defaultWhatsappMessage
  );

  return (
    <div className="bg-[#f4f9fa]">
      {/* Medical Education Hero Section */}
      <section className="bg-[#0b3b60] text-white py-16 lg:py-24 border-b border-[#14507d]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <img
                  src={INSTITUTE_CONTACT.logoUrl}
                  alt="Umm-e-Aiman Paramedical Institute official emblem"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-full object-cover border border-white/30 bg-white shrink-0"
                />
                <p className="text-xs text-[#8de0dd] tracking-wide">
                  Umm-e-Aiman Paramedical Institute · Bhowana, District Chiniot
                </p>
              </div>

              <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.14] tracking-tight">
                Start Your Journey Towards a Career in Healthcare.
              </h1>
              <p className="text-base sm:text-lg text-slate-200 leading-relaxed max-w-xl text-pretty">
                Explore practical healthcare education and medical diploma programs at Umm-e-Aiman Paramedical Institute, Bhowana. Develop essential knowledge and practical skills for your future in healthcare.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/paramedical-institute/admissions"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#0d7a78] hover:bg-[#0f8f8c] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Apply for Admission</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/paramedical-institute/courses"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Explore Medical Courses
                </Link>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden border border-white/20 bg-white text-slate-900 shadow-lg">
                <div className="aspect-[16/10] bg-slate-900">
                  <SmartMedia
                    src="/assets/extracted/institute-lab-session.jpg"
                    alt="Umm-e-Aiman Paramedical Institute students in practical medical laboratory session"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 space-y-3">
                  <p className="text-xs text-[#0d7a78] font-medium">
                    Admissions Announcement · Bhowana Campus
                  </p>
                  <h2 className="font-display text-lg font-semibold text-[#0b3b60]">
                    {instituteSettings.announcementBanner}
                  </h2>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Matriculation with Science (Biology, Chemistry, Physics — min. 45% marks) eligible for advertised principal diploma programs.
                  </p>
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 text-xs font-mono tabular-nums text-[#0b3b60]">
                    <span>Chief Executive: {instituteSettings.primaryPhone}</span>
                    <a
                      href="#admission-inquiry"
                      className="font-sans font-semibold text-[#0d7a78] hover:underline whitespace-nowrap"
                    >
                      Quick Admission Inquiry &darr;
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Promotional Video Section */}
      <PromoVideoSection
        videoUrl={instituteSettings.videoUrl || INSTITUTE_CONTACT.promotionalVideoUrl}
        posterUrl={INSTITUTE_CONTACT.promotionalVideoPoster}
        summary={instituteSettings.videoSummary || INSTITUTE_CONTACT.promotionalVideoSummary}
      />

      {/* Principal Medical Diploma Programs Preview */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-[#0d7a78] font-medium">Allied Health &amp; Nursing Support Diplomas</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0b3b60] mt-1">
                Available Medical Courses in Bhowana
              </h2>
            </div>
            <Link
              to="/paramedical-institute/courses"
              className="text-sm font-semibold text-[#0d7a78] hover:underline whitespace-nowrap"
            >
              View All 11 Advertised Programs &rarr;
            </Link>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {principalCourses.slice(0, 6).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                whatsappPhone={instituteSettings.whatsappPhone || INSTITUTE_CONTACT.primaryWhatsapp}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Secure Student Admission Inquiry Form (Saves to Firestore) */}
      <AdmissionInquiryForm />

      {/* Registration, Recognition & Verification Notice */}
      <section className="py-14 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-3">
              <p className="text-xs text-slate-500">Registration &amp; Regulatory References</p>
              <h2 className="font-display text-2xl font-semibold text-[#0b3b60]">
                Promotional Reference Numbers &amp; Verification Guidance
              </h2>
              <p className="text-sm text-slate-600 leading-relaxed">
                {instituteSettings.regulatoryReviewNote}
              </p>
              <p className="text-xs font-mono text-slate-800 pt-1">
                Displayed References: {INSTITUTE_CONTACT.regulatoryReferences.pmfReference} · {INSTITUTE_CONTACT.regulatoryReferences.pcpReference}
              </p>
            </div>

            <div className="lg:col-span-5 bg-[#f4f9fa] border border-slate-200 rounded-2xl p-6 space-y-4">
              <h3 className="font-display text-lg font-semibold text-[#0b3b60]">
                Speak Directly with the Admissions Office
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {instituteSettings.addressSummary}
              </p>
              <div className="flex flex-wrap gap-3">
                <a
                  href={instituteWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0d7a78] hover:bg-[#0a6361] rounded-lg"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Admissions</span>
                </a>
                <a
                  href={`tel:${formatPakPhoneForTel(instituteSettings.primaryPhone)}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0b3b60] bg-white border border-slate-300 rounded-lg"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="font-mono">{instituteSettings.primaryPhone}</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export function InstituteCoursesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const { courses, instituteSettings } = useApp();
  const principalCourses = courses.filter((c) => c.category === 'principal');
  const additionalCourses = courses.filter((c) => c.category === 'additional');
  const waPhone = instituteSettings.whatsappPhone || INSTITUTE_CONTACT.primaryWhatsapp;
  const focusedCourse = focusId ? courses.find((c) => c.id === focusId) : undefined;

  useEffect(() => {
    if (!focusId) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`course-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [focusId]);

  return (
    <div className="bg-[#f4f9fa] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <header className="max-w-3xl space-y-3">
          <p className="text-xs text-[#0d7a78] font-medium">Umm-e-Aiman Paramedical Institute · Bhowana</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0b3b60]">
            Medical Diploma &amp; Allied Healthcare Training Programs
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Explore our principal advertised medical diploma courses and additional specialized technician programs. Duration and entry criteria are stated conservatively based on verified institute materials; confirm program-specific schedules directly with administration.
          </p>
          {focusedCourse && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[#0b3b60] font-semibold">
                Viewing searched program: {focusedCourse.title}
              </span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="font-semibold text-[#0d7a78] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Clear Highlight
              </button>
            </div>
          )}
        </header>

        {/* Principal Courses */}
        <section className="space-y-6">
          <div>
            <p className="text-xs text-slate-500">01. Principal Advertised Programs</p>
            <h2 className="font-display text-2xl font-semibold text-[#0b3b60] mt-1">
              Core Medical Diploma, Pharmacy &amp; Maternal Care Courses
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {principalCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                whatsappPhone={waPhone}
                isFocused={focusId === course.id}
              />
            ))}
          </div>
        </section>

        {/* Additional Advertised Programs */}
        <section className="space-y-6 pt-6 border-t border-slate-200">
          <div>
            <p className="text-xs text-slate-500">02. Subject to Batch &amp; Seat Confirmation</p>
            <h2 className="font-display text-2xl font-semibold text-[#0b3b60] mt-1">
              Additional Advertised Programs
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              The following technician programs appear in supplemental promotional material; current session availability, duration, and affiliation details are subject to confirmation by institute management.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {additionalCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                whatsappPhone={waPhone}
                isFocused={focusId === course.id}
              />
            ))}
          </div>
        </section>

        {/* Search Grounded Career & Council Info Explorer */}
        <HealthcareSearchExplorer />
      </div>
    </div>
  );
}

export function InstituteFacilitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const focusedFacility = focusId ? INSTITUTE_FACILITIES.find((f) => f.id === focusId) : undefined;

  useEffect(() => {
    if (!focusId) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`inst-facility-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [focusId]);

  return (
    <div className="bg-[#f4f9fa] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="max-w-3xl space-y-3">
          <p className="text-xs text-[#0d7a78] font-medium">Bhowana Campus Infrastructure</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0b3b60]">
            Practical Laboratories &amp; Academic Training Facilities
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Umm-e-Aiman Paramedical Institute provides structured laboratory and classroom spaces for allied health students. Real campus photographs extracted from official institute video footage are clearly distinguished from illustrative reference graphics.
          </p>
          {focusedFacility && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[#0b3b60] font-semibold">
                Viewing searched facility: {focusedFacility.title}
              </span>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="font-semibold text-[#0d7a78] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Clear Highlight
              </button>
            </div>
          )}
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          {INSTITUTE_FACILITIES.map((fac) => {
            const isFocused = focusId === fac.id;
            return (
              <article
                key={fac.id}
                id={`inst-facility-${fac.id}`}
                className={`scroll-mt-24 bg-white rounded-2xl overflow-hidden flex flex-col justify-between border transition-shadow ${
                  isFocused ? 'border-[#0d7a78] ring-2 ring-[#0d7a78]/40 shadow-md' : 'border-slate-200'
                }`}
              >
                <div>
                  {fac.imageUrl && (
                    <div className="aspect-[16/9] bg-slate-100">
                      <SmartMedia src={fac.imageUrl} alt={fac.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[#f4f9fa] border border-slate-200 flex items-center justify-center">
                        <InstituteFacilityIcon name={fac.iconName} />
                      </div>
                      <span className="text-xs text-slate-500">
                        {classificationLabel(fac.sourceClassification)}
                      </span>
                    </div>

                    <h2 className="font-display text-xl font-semibold text-[#0b3b60]">{fac.title}</h2>
                    <p className="text-sm text-slate-600 leading-relaxed">{fac.description}</p>
                    <p className="text-xs text-[#0d7a78] font-medium pt-2 border-t border-slate-100">
                      Practical Highlight: {fac.practicalHighlight}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className="bg-[#0b3b60] text-white rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Visit Campus or Submit Your Online Application</h2>
            <p className="text-sm text-slate-200 mt-1">
              Ameenpur Road, Near the Street of Punjab International Model High School, Bhowana, District Chiniot.
            </p>
          </div>
          <Link
            to="/paramedical-institute/admissions"
            className="px-6 py-3 text-xs font-semibold text-white bg-[#0d7a78] hover:bg-[#0f8f8c] rounded-lg whitespace-nowrap shrink-0"
          >
            Apply for Admission
          </Link>
        </div>
      </div>
    </div>
  );
}

export function InstituteGalleryPage() {
  const { galleryItems, instituteSettings } = useApp();
  const instItems = galleryItems.filter((i) => i.organization === 'institute');

  return (
    <div className="bg-[#f4f9fa]">
      <div className="py-14 lg:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="max-w-3xl">
          <p className="text-xs text-[#0d7a78] font-medium">
            Umm-e-Aiman Paramedical Institute · Interactive Campus Virtual Tour · Bhowana
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0b3b60] mt-1.5">
            Campus Virtual Tour, Photos, Posters &amp; Video
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Step inside Umm-e-Aiman Paramedical Institute in Bhowana through authentic laboratory photographs, counseling office views, outdoor campus signboards, and official prospectuses. Select any image in the grid to launch the full-screen tour viewer.
          </p>
        </header>

        <VirtualTour items={instItems} theme="institute" />
      </div>

      <PromoVideoSection
        videoUrl={instituteSettings.videoUrl || INSTITUTE_CONTACT.promotionalVideoUrl}
        posterUrl={INSTITUTE_CONTACT.promotionalVideoPoster}
        summary={instituteSettings.videoSummary || INSTITUTE_CONTACT.promotionalVideoSummary}
      />
    </div>
  );
}

interface UploadedDocDraft {
  docType: 'matric_result' | 'student_cnic' | 'guardian_cnic' | 'passport_photo';
  label: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
}

async function compressFileToSafeDataUrl(file: File): Promise<{ dataUrl: string; mimeType: string; sizeBytes: number }> {
  if (file.type === 'application/pdf') {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const res = String(reader.result || '');
        resolve({ dataUrl: res, mimeType: 'application/pdf', sizeBytes: file.size });
      };
      reader.onerror = () => reject(new Error('Failed to read PDF file.'));
      reader.readAsDataURL(file);
    });
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 900;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas compression unavailable.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL('image/jpeg', 0.72);
        const approxBytes = Math.round((compressed.length * 3) / 4);
        resolve({ dataUrl: compressed, mimeType: 'image/jpeg', sizeBytes: approxBytes });
      };
      img.onerror = () => reject(new Error('Invalid image file selected.'));
      img.src = String(reader.result || '');
    };
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

interface SavedAdmissionRecord {
  id: string;
  selectedCourse: string;
  calculatedPercentage: number;
  status: string;
}

export function InstituteAdmissionsPage() {
  const [searchParams] = useSearchParams();
  const { user, signInWithGoogle, courses, instituteSettings } = useApp();

  const [form, setForm] = useState<AdmissionFormInput>({
    studentFullName: '',
    guardianName: '',
    gender: 'Female',
    dateOfBirth: '',
    cnicOrBForm: '',
    contactNumber: '',
    whatsappNumber: '',
    email: '',
    residentialAddress: '',
    cityAndDistrict: 'Bhowana, District Chiniot',
    matricBoard: 'BISE Faisalabad',
    passingYear: 2025,
    totalMarks: 1100,
    obtainedMarks: 660,
    selectedCourse: searchParams.get('course') || courses[0]?.title || 'Medical Laboratory Technology (MLT)',
    consentGiven: false,
  });

  const [docs, setDocs] = useState<Record<string, UploadedDocDraft>>({});
  const [docErrors, setDocErrors] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedAppId, setSavedAppId] = useState<string | null>(null);
  const [myApps, setMyApps] = useState<SavedAdmissionRecord[]>([]);

  useEffect(() => {
    if (!user) {
      setMyApps([]);
      return;
    }
    const q = query(collection(db, 'admissionApplications'), where('applicantUid', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMyApps(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              selectedCourse: String(data.selectedCourse || ''),
              calculatedPercentage: Number(data.calculatedPercentage ?? 0),
              status: String(data.status || 'Submitted'),
            };
          })
        );
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'admissionApplications');
        } catch {
          // Handled
        }
      }
    );
    return () => unsub();
  }, [user]);

  const percentage = calculateMatricPercentage(form.obtainedMarks, form.totalMarks);
  const isEligible45 = meetsMinimumMatricEligibility(percentage, 45);

  const updateField = <K extends keyof AdmissionFormInput>(key: K, value: AdmissionFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleFileChange = async (
    docType: UploadedDocDraft['docType'],
    label: string,
    fileList: FileList | null
  ) => {
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];
    const check = validateDocumentAttachment(file);
    if (!check.valid) {
      setDocErrors((prev) => ({ ...prev, [docType]: check.error || 'Invalid file.' }));
      return;
    }
    try {
      const encoded = await compressFileToSafeDataUrl(file);
      if (encoded.sizeBytes > 215000 || encoded.dataUrl.length > 315000) {
        setDocErrors((prev) => ({
          ...prev,
          [docType]: 'Compressed document exceeds 210 KB limit. Please choose a smaller scan or photo.',
        }));
        return;
      }
      setDocErrors((prev) => {
        const next = { ...prev };
        delete next[docType];
        return next;
      });
      setDocs((prev) => ({
        ...prev,
        [docType]: {
          docType,
          label,
          fileName: file.name.slice(0, 130),
          mimeType: encoded.mimeType,
          sizeBytes: encoded.sizeBytes,
          dataUrl: encoded.dataUrl,
        },
      }));
    } catch (err) {
      setDocErrors((prev) => ({
        ...prev,
        [docType]: err instanceof Error ? err.message : 'Could not process selected file.',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSavedAppId(null);

    const validationErrors = validateAdmissionApplication(form);
    if (percentage === null) {
      validationErrors.obtainedMarks = 'Please enter valid Matriculation marks to calculate percentage.';
    }
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
          'Google Sign-In is required to submit your online application and store private documents securely. You may also inquire via WhatsApp below.'
        );
      }

      const uploadedList = Object.values(docs);
      const appRef = await addDoc(collection(db, 'admissionApplications'), {
        applicantUid: activeUser.uid,
        studentFullName: form.studentFullName.trim(),
        guardianName: form.guardianName.trim(),
        gender: form.gender,
        dateOfBirth: form.dateOfBirth,
        cnicOrBForm: form.cnicOrBForm.trim(),
        contactNumber: form.contactNumber.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
        email: form.email.trim(),
        residentialAddress: form.residentialAddress.trim(),
        cityAndDistrict: form.cityAndDistrict.trim(),
        matricBoard: form.matricBoard.trim(),
        passingYear: Number(form.passingYear),
        totalMarks: Number(form.totalMarks),
        obtainedMarks: Number(form.obtainedMarks),
        calculatedPercentage: Number(percentage),
        selectedCourse: form.selectedCourse,
        documentCount: uploadedList.length,
        consentGiven: form.consentGiven,
        status: 'Submitted',
        adminNotes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Store each attached document inside the private /documents subcollection
      for (const item of uploadedList) {
        await setDoc(doc(db, 'admissionApplications', appRef.id, 'documents', item.docType), {
          applicantUid: activeUser.uid,
          applicationId: appRef.id,
          docType: item.docType,
          fileName: item.fileName,
          mimeType: item.mimeType,
          sizeBytes: item.sizeBytes,
          dataUrl: item.dataUrl,
          createdAt: serverTimestamp(),
        });
      }

      setSavedAppId(appRef.id);
    } catch (err) {
      try {
        if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
          handleFirestoreError(err, OperationType.CREATE, 'admissionApplications');
        }
      } catch {
        // Logged structured JSON
      }
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to submit online application. Please use the WhatsApp Admission Inquiry option below.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const waUrl = buildWhatsAppUrl(
    instituteSettings.whatsappPhone || INSTITUTE_CONTACT.primaryWhatsapp,
    buildAdmissionWhatsAppMessage(form, percentage)
  );

  const steps = [
    { num: '01', title: 'Select Your Course', desc: 'Choose from our advertised allied health, pharmacy, or maternal care programs.' },
    { num: '02', title: 'Check Eligibility', desc: 'Verify Matric Science (Biology, Chemistry, Physics) with at least 45% marks for principal FSc-level diplomas.' },
    { num: '03', title: 'Prepare Required Documents', desc: 'Gather Matric result card, student B-Form/CNIC, guardian CNIC, and passport-size photos.' },
    { num: '04', title: 'Submit Your Application', desc: 'Complete the secure online application form below or visit the Bhowana admissions office.' },
    { num: '05', title: 'Receive Confirmation', desc: 'Await official review and document verification from Umm-e-Aiman Paramedical Institute.' },
  ];

  return (
    <div className="bg-[#f4f9fa] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <header className="max-w-3xl">
          <p className="text-xs text-[#0d7a78] font-medium">Admissions · Bhowana, District Chiniot</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0b3b60] mt-1.5">
            Admissions Guide, Eligibility &amp; Online Application
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Review the advertised eligibility requirements and required documents below, then complete your online admission application for Umm-e-Aiman Paramedical Institute.
          </p>
        </header>

        {/* Eligibility & Required Documents Cards */}
        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-white border border-slate-200 rounded-2xl p-7 space-y-4">
            <p className="text-xs text-[#0d7a78] font-medium">Advertised FSc-Level Diploma Criteria</p>
            <h2 className="font-display text-2xl font-semibold text-[#0b3b60]">Basic Eligibility Requirements</h2>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Matriculation with Science</li>
              <li>• Compulsory Science Subjects: Biology, Chemistry, and Physics</li>
              <li>• Minimum 45% marks in Matriculation</li>
            </ul>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Note: Specific age, gender, or subject criteria may vary by qualification or regulatory council (e.g., LHV, CNA, CMW, or additional technician courses). Confirm program-specific criteria with administration.
            </p>
          </section>

          <section className="bg-white border border-slate-200 rounded-2xl p-7 space-y-4">
            <p className="text-xs text-[#0d7a78] font-medium">Admission Checklist</p>
            <h2 className="font-display text-2xl font-semibold text-[#0b3b60]">
              Documents Mentioned in Promotional Material
            </h2>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>• Matriculation result card or certificate copy</li>
              <li>• Student B-Form or CNIC copy</li>
              <li>• Father&apos;s or guardian&apos;s CNIC copy</li>
              <li>• Passport-size photographs</li>
            </ul>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              Original academic certificates and additional board migration/domicile documents, if applicable, are verified in person only after confirmation by the institute.
            </p>
          </section>
        </div>

        {/* 5-Step Admission Guide */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-[#0b3b60] mb-6">
            Five-Step Admission Process
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {steps.map((s) => (
              <div key={s.num} className="bg-white border border-slate-200 rounded-xl p-5">
                <p className="font-mono text-xs font-bold text-[#0d7a78]">Step {s.num}</p>
                <h3 className="font-display text-base font-semibold text-[#0b3b60] mt-1">{s.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Online Admission Application Form */}
        <section id="application-form" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-9 max-w-5xl">
          <div className="mb-6">
            <p className="text-xs text-[#0d7a78] font-medium">Secure Online Submission</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0b3b60] mt-1">
              Online Admission Application Form
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Applications submitted online are recorded as &ldquo;Submitted&rdquo; and are not treated as accepted until reviewed and confirmed by the institute administrator.
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-8">
            {/* 1. Personal Information */}
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-[#0b3b60] pb-2 border-b border-slate-200">
                1. Personal Information
              </h3>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="adm-name" className="block text-xs font-semibold text-slate-800 mb-1">
                    Student Full Name *
                  </label>
                  <input
                    id="adm-name"
                    type="text"
                    value={form.studentFullName}
                    onChange={(e) => updateField('studentFullName', e.target.value)}
                    placeholder="Enter full name as on Matric certificate"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                  {errors.studentFullName && <p className="text-xs text-red-600 mt-1">{errors.studentFullName}</p>}
                </div>

                <div>
                  <label htmlFor="adm-guardian" className="block text-xs font-semibold text-slate-800 mb-1">
                    Father&apos;s or Guardian&apos;s Name *
                  </label>
                  <input
                    id="adm-guardian"
                    type="text"
                    value={form.guardianName}
                    onChange={(e) => updateField('guardianName', e.target.value)}
                    placeholder="Enter father or guardian full name"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                  {errors.guardianName && <p className="text-xs text-red-600 mt-1">{errors.guardianName}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="adm-gender" className="block text-xs font-semibold text-slate-800 mb-1">
                    Gender *
                  </label>
                  <select
                    id="adm-gender"
                    value={form.gender}
                    onChange={(e) => updateField('gender', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="adm-dob" className="block text-xs font-semibold text-slate-800 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    id="adm-dob"
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => updateField('dateOfBirth', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                  {errors.dateOfBirth && <p className="text-xs text-red-600 mt-1">{errors.dateOfBirth}</p>}
                </div>

                <div>
                  <label htmlFor="adm-cnic" className="block text-xs font-semibold text-slate-800 mb-1">
                    CNIC or B-Form Number *
                  </label>
                  <input
                    id="adm-cnic"
                    type="text"
                    value={form.cnicOrBForm}
                    onChange={(e) => updateField('cnicOrBForm', e.target.value)}
                    placeholder="33201-1234567-1"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                  {errors.cnicOrBForm && <p className="text-xs text-red-600 mt-1">{errors.cnicOrBForm}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="adm-phone" className="block text-xs font-semibold text-slate-800 mb-1">
                    Contact Number *
                  </label>
                  <input
                    id="adm-phone"
                    type="tel"
                    value={form.contactNumber}
                    onChange={(e) => updateField('contactNumber', e.target.value)}
                    placeholder="0333-8985588"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                  {errors.contactNumber && <p className="text-xs text-red-600 mt-1">{errors.contactNumber}</p>}
                </div>

                <div>
                  <label htmlFor="adm-whatsapp" className="block text-xs font-semibold text-slate-800 mb-1">
                    WhatsApp Number *
                  </label>
                  <input
                    id="adm-whatsapp"
                    type="tel"
                    value={form.whatsappNumber}
                    onChange={(e) => updateField('whatsappNumber', e.target.value)}
                    placeholder="0334-7727235"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                  />
                  {errors.whatsappNumber && <p className="text-xs text-red-600 mt-1">{errors.whatsappNumber}</p>}
                </div>

                <div>
                  <label htmlFor="adm-email" className="block text-xs font-semibold text-slate-800 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="adm-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    placeholder="applicant@example.com"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                  {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="adm-address" className="block text-xs font-semibold text-slate-800 mb-1">
                    Residential Address *
                  </label>
                  <input
                    id="adm-address"
                    type="text"
                    value={form.residentialAddress}
                    onChange={(e) => updateField('residentialAddress', e.target.value)}
                    placeholder="House / Street / Mohallah / Village"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                  {errors.residentialAddress && (
                    <p className="text-xs text-red-600 mt-1">{errors.residentialAddress}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="adm-city" className="block text-xs font-semibold text-slate-800 mb-1">
                    City and District *
                  </label>
                  <input
                    id="adm-city"
                    type="text"
                    value={form.cityAndDistrict}
                    onChange={(e) => updateField('cityAndDistrict', e.target.value)}
                    placeholder="Bhowana, District Chiniot"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                  {errors.cityAndDistrict && <p className="text-xs text-red-600 mt-1">{errors.cityAndDistrict}</p>}
                </div>
              </div>
            </div>

            {/* 2. Academic Information & Course Selection */}
            <div className="space-y-4">
              <h3 className="font-display text-lg font-semibold text-[#0b3b60] pb-2 border-b border-slate-200">
                2. Academic Information &amp; Course Selection
              </h3>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="adm-course" className="block text-xs font-semibold text-slate-800 mb-1">
                    Course Selection *
                  </label>
                  <select
                    id="adm-course"
                    value={form.selectedCourse}
                    onChange={(e) => updateField('selectedCourse', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.title}>
                        {c.title} {c.category === 'additional' ? '(Subject to Confirmation)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="adm-board" className="block text-xs font-semibold text-slate-800 mb-1">
                    Matriculation Board *
                  </label>
                  <input
                    id="adm-board"
                    type="text"
                    value={form.matricBoard}
                    onChange={(e) => updateField('matricBoard', e.target.value)}
                    placeholder="e.g., BISE Faisalabad / BISE Sargodha"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                  />
                  {errors.matricBoard && <p className="text-xs text-red-600 mt-1">{errors.matricBoard}</p>}
                </div>
              </div>

              <div className="grid sm:grid-cols-4 gap-5">
                <div>
                  <label htmlFor="adm-year" className="block text-xs font-semibold text-slate-800 mb-1">
                    Passing Year *
                  </label>
                  <input
                    id="adm-year"
                    type="number"
                    min={1990}
                    max={2030}
                    value={form.passingYear}
                    onChange={(e) => updateField('passingYear', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                  {errors.passingYear && <p className="text-xs text-red-600 mt-1">{errors.passingYear}</p>}
                </div>

                <div>
                  <label htmlFor="adm-total" className="block text-xs font-semibold text-slate-800 mb-1">
                    Total Marks *
                  </label>
                  <input
                    id="adm-total"
                    type="number"
                    min={100}
                    max={2000}
                    value={form.totalMarks}
                    onChange={(e) => updateField('totalMarks', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                  {errors.totalMarks && <p className="text-xs text-red-600 mt-1">{errors.totalMarks}</p>}
                </div>

                <div>
                  <label htmlFor="adm-obtained" className="block text-xs font-semibold text-slate-800 mb-1">
                    Obtained Marks *
                  </label>
                  <input
                    id="adm-obtained"
                    type="number"
                    min={0}
                    max={form.totalMarks}
                    value={form.obtainedMarks}
                    onChange={(e) => updateField('obtainedMarks', Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono tabular-nums"
                  />
                  {errors.obtainedMarks && <p className="text-xs text-red-600 mt-1">{errors.obtainedMarks}</p>}
                </div>

                <div>
                  <span className="block text-xs font-semibold text-slate-800 mb-1">
                    Calculated Percentage
                  </span>
                  <div
                    data-testid="calculated-percentage"
                    className={`px-3.5 py-2.5 text-sm font-mono tabular-nums font-semibold rounded-lg border ${
                      isEligible45
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}
                  >
                    {percentage !== null ? `${percentage.toFixed(2)}%` : 'Invalid'}
                    <span className="ml-1.5 text-[11px] font-sans font-normal">
                      {percentage !== null ? (isEligible45 ? '(>= 45%)' : '(< 45%)') : ''}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Private Document Uploads */}
            <div className="space-y-4">
              <div className="pb-2 border-b border-slate-200">
                <h3 className="font-display text-lg font-semibold text-[#0b3b60]">
                  3. Supporting Document Uploads (Private Storage)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Upload clear JPG/PNG photos (up to 5 MB, automatically optimized) or compact PDFs (&le; 200 KB). Stored in an access-controlled subcollection viewable only by you and authorized administrators.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: 'matric_result' as const, label: 'Matric Result Card' },
                  { key: 'student_cnic' as const, label: 'Student CNIC / B-Form' },
                  { key: 'guardian_cnic' as const, label: 'Father / Guardian CNIC' },
                  { key: 'passport_photo' as const, label: 'Passport-Size Photograph' },
                ].map((slot) => {
                  const attached = docs[slot.key];
                  const slotErr = docErrors[slot.key];
                  return (
                    <div key={slot.key} className="p-4 rounded-xl bg-[#f4f9fa] border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-slate-800">{slot.label}</span>
                        {attached && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>Attached</span>
                          </span>
                        )}
                      </div>

                      <label className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-[#0b3b60] bg-white border border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50">
                        <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>{attached ? 'Replace File' : 'Choose JPG/PNG/PDF'}</span>
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          onChange={(e) => handleFileChange(slot.key, slot.label, e.target.files)}
                          className="sr-only"
                        />
                      </label>

                      {attached && (
                        <p className="text-[11px] text-slate-600 truncate">
                          {attached.fileName} ({Math.round(attached.sizeBytes / 1024)} KB)
                        </p>
                      )}
                      {slotErr && <p className="text-xs text-red-600">{slotErr}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Consent Checkbox */}
            <div className="p-4 rounded-xl bg-[#f4f9fa] border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.consentGiven}
                  onChange={(e) => updateField('consentGiven', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-slate-300 text-[#0d7a78]"
                />
                <span className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  I confirm that the personal and academic details provided above are accurate to the best of my knowledge, and I consent to Umm-e-Aiman Paramedical Institute reviewing my application and uploaded documents. I understand that submission does not constitute final acceptance until verified by administration.
                </span>
              </label>
              {errors.consentGiven && <p className="text-xs text-red-600 mt-2">{errors.consentGiven}</p>}
            </div>

            {submitError && (
              <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                {submitError}
              </div>
            )}

            {savedAppId && (
              <div
                role="status"
                className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    Application Submitted for Review (Application ID: {savedAppId.slice(0, 8)})
                  </p>
                  <p className="mt-1 text-emerald-900 leading-relaxed">
                    Your online application has been securely recorded with status &ldquo;Submitted&rdquo;. The admissions office at Umm-e-Aiman Paramedical Institute (Bhowana) will review your academic eligibility and documents before issuing official confirmation.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#0d7a78] hover:bg-[#0a6361] rounded-lg transition-colors disabled:opacity-60"
              >
                {submitting
                  ? 'Submitting Application...'
                  : user
                  ? 'Submit Online Application'
                  : 'Sign In with Google & Submit Application'}
              </button>

              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0b3b60] bg-[#f4f9fa] hover:bg-[#e5f1f3] border border-slate-300 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#0d7a78]" aria-hidden="true" />
                <span>WhatsApp Admission Inquiry</span>
              </a>
            </div>
          </form>
        </section>

        {/* Live Status Tracker for Signed-In Applicant */}
        {user && myApps.length > 0 && (
          <section className="bg-white border border-slate-200 rounded-2xl p-6 max-w-5xl space-y-4">
            <h2 className="font-display text-lg font-semibold text-[#0b3b60]">
              Your Submitted Admission Applications ({myApps.length})
            </h2>
            <div className="divide-y divide-slate-200">
              {myApps.map((app) => (
                <div key={app.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">{app.selectedCourse}</p>
                    <p className="text-slate-600 font-mono tabular-nums">
                      Matric Percentage: {app.calculatedPercentage}%
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-[#0d7a78]">Status: {app.status}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export function InstituteContactPage() {
  const { user, signInWithGoogle, instituteSettings } = useApp();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('Course & Admission Inquiry');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const waUrl = buildWhatsAppUrl(
    instituteSettings.whatsappPhone || INSTITUTE_CONTACT.primaryWhatsapp,
    `Hello Umm-e-Aiman Paramedical Institute (Bhowana),\nName: ${fullName || 'Prospective Student'}\nPhone: ${phone || 'N/A'}\nInquiry: ${message || 'I would like information about admission and available medical courses.'}`
  );

  const mapsDirections = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    INSTITUTE_CONTACT.directionsQuery
  )}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSavedId(null);

    if (fullName.trim().length < 2) {
      setError('Please enter your full name.');
      return;
    }
    if (!isValidPakistaniPhone(phone)) {
      setError('Please enter a valid Pakistani mobile number.');
      return;
    }
    if (message.trim().length < 5) {
      setError('Please write your inquiry message.');
      return;
    }

    setSubmitting(true);
    try {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await signInWithGoogle();
      }
      if (!activeUser) {
        throw new Error('Google Sign-In cancelled. You can contact the Chief Executive directly via WhatsApp.');
      }

      const ref = await addDoc(collection(db, 'contactMessages'), {
        applicantUid: activeUser.uid,
        organization: 'institute',
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: activeUser.email || '',
        subject: subject.trim(),
        message: message.trim(),
        status: 'New',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSavedId(ref.id);
      setMessage('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save inquiry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-[#f4f9fa] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="max-w-3xl">
          <p className="text-xs text-[#0d7a78] font-medium">Bhowana, District Chiniot · Direct Contact</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0b3b60] mt-1.5">
            Contact Umm-e-Aiman Paramedical Institute, Bhowana
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Connect directly with the Chief Executive and admissions office for medical diploma inquiries, eligibility guidance, and campus directions.
          </p>
        </header>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <p className="text-xs text-[#0d7a78] font-medium">Chief Executive Line 1</p>
            <h2 className="font-mono tabular-nums text-2xl font-bold text-[#0b3b60]">
              {instituteSettings.primaryPhone}
            </h2>
            <p className="text-xs text-slate-600">Call or WhatsApp for admissions and course guidance.</p>
            <div className="flex gap-2.5 pt-2">
              <a
                href={`tel:${formatPakPhoneForTel(instituteSettings.primaryPhone)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0b3b60] rounded-lg"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <a
                href={buildWhatsAppUrl(instituteSettings.primaryPhone, INSTITUTE_CONTACT.defaultWhatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0d7a78] bg-[#f4f9fa] border border-slate-300 rounded-lg"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <p className="text-xs text-[#0d7a78] font-medium">Chief Executive Line 2</p>
            <h2 className="font-mono tabular-nums text-2xl font-bold text-[#0b3b60]">
              {instituteSettings.secondaryPhone}
            </h2>
            <p className="text-xs text-slate-600">Secondary admissions and campus administration contact.</p>
            <div className="flex gap-2.5 pt-2">
              <a
                href={`tel:${formatPakPhoneForTel(instituteSettings.secondaryPhone)}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0b3b60] rounded-lg"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
              <a
                href={buildWhatsAppUrl(instituteSettings.secondaryPhone, INSTITUTE_CONTACT.defaultWhatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0d7a78] bg-[#f4f9fa] border border-slate-300 rounded-lg"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <p className="text-xs text-[#0d7a78] font-medium">Verified Campus Address</p>
            <h2 className="font-display text-lg font-semibold text-[#0b3b60]">Bhowana, District Chiniot</h2>
            <p className="text-xs text-slate-600 leading-relaxed">{instituteSettings.addressSummary}</p>
            <div className="pt-2">
              <a
                href={mapsDirections}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0d7a78] rounded-lg"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>Google Maps Directions</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Institute Inquiry Form */}
        <div className="bg-white border border-slate-200 rounded-2xl p-7 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-[#0b3b60]">Send an Institute Inquiry</h2>
          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="inst-cname" className="block text-xs font-semibold text-slate-800 mb-1">
                  Student / Parent Name *
                </label>
                <input
                  id="inst-cname"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label htmlFor="inst-cphone" className="block text-xs font-semibold text-slate-800 mb-1">
                  Mobile Number *
                </label>
                <input
                  id="inst-cphone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                />
              </div>
            </div>

            <div>
              <label htmlFor="inst-csubject" className="block text-xs font-semibold text-slate-800 mb-1">
                Inquiry Topic
              </label>
              <input
                id="inst-csubject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="inst-cmsg" className="block text-xs font-semibold text-slate-800 mb-1">
                Message *
              </label>
              <textarea
                id="inst-cmsg"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask about Dispenser, MLT, OTT, Radiography, Pharmacy Technician, LHV, CNA, or CMW..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            {error && (
              <p role="alert" className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
                {error}
              </p>
            )}
            {savedId && (
              <p role="status" className="text-xs text-emerald-900 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                Inquiry recorded (Ref: {savedId.slice(0, 8)}). Our Bhowana admissions office will review your message.
              </p>
            )}

            <div className="flex flex-wrap gap-3 pt-1">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#0b3b60] hover:bg-[#082c48] rounded-lg disabled:opacity-60"
              >
                {submitting ? 'Sending...' : 'Submit Institute Inquiry'}
              </button>
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#0d7a78] bg-[#f4f9fa] border border-slate-300 rounded-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Message on WhatsApp</span>
              </a>
            </div>
          </form>
        </div>

        <LocationMapsExplorer
          defaultQuery="Ameenpur Road near Punjab International Model High School Bhowana District Chiniot"
          organizationLabel="Umm-e-Aiman Paramedical Institute, Bhowana"
          accentClass="bg-[#0d7a78] hover:bg-[#0a6361]"
        />
      </div>
    </div>
  );
}
