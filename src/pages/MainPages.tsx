import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  MapPin,
  MessageCircle,
  Microscope,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import {
  FAQ_ITEMS,
  HOSTEL_BRANCHES,
  HOSTEL_CONTACT,
  HOSTEL_FACILITIES,
  INSTITUTE_CONTACT,
  INSTITUTE_FACILITIES,
} from '../data/organizationData';
import { useApp } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  buildWhatsAppUrl,
  formatPakPhoneForTel,
  isValidPakistaniPhone,
} from '../utils/validation';
import { SmartMedia } from '../components/HostelInfoPlate';
import { LocationMapsExplorer } from '../components/GroundingWidgets';
import { PortalSearchBar } from '../components/PortalSearchBar';

export function HomePage() {
  const { courses, hostelSettings, instituteSettings } = useApp();

  const hostelWa = buildWhatsAppUrl(
    hostelSettings.whatsappPhone || HOSTEL_CONTACT.primaryWhatsapp,
    HOSTEL_CONTACT.defaultWhatsappMessage
  );
  const instituteWa = buildWhatsAppUrl(
    instituteSettings.whatsappPhone || INSTITUTE_CONTACT.primaryWhatsapp,
    INSTITUTE_CONTACT.defaultWhatsappMessage
  );

  return (
    <div>
      {/* Full-Width Dual-Path Hero Section */}
      <section className="bg-[#0b1526] text-white py-16 lg:py-24 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <p className="text-xs text-slate-300 tracking-wide">
              Umm-e-Aiman Official Portal · Jhang &amp; Bhowana (District Chiniot), Punjab
            </p>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.5rem] font-semibold leading-[1.12] tracking-tight mt-3">
              Two Paths. One Commitment to Your Future.
            </h1>
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed mt-5 max-w-xl text-pretty">
              Explore comfortable student accommodation at Umm-e-Aiman Girls Hostel and career-focused healthcare education at Umm-e-Aiman Paramedical Institute.
            </p>

            {/* Unified Portal Course & Facility Search Bar */}
            <PortalSearchBar variant="hero" />
          </div>

          {/* Two Visually Distinctive Organization Cards */}
          <div className="grid lg:grid-cols-2 gap-8 mt-12 items-stretch">
            {/* Card 1 — Umm-e-Aiman Girls Hostel */}
            <article className="bg-[#fbf8f1] text-slate-900 rounded-2xl p-8 sm:p-10 border border-stone-200 flex flex-col justify-between">
              <div>
                <p className="text-xs font-medium text-[#6e1e32]">
                  Umm-e-Aiman Girls Hostel · Jhang, Punjab
                </p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0f2342] mt-2">
                  A Comfortable Place to Call Home
                </h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed mt-3">
                  Discover a welcoming girls&apos; hostel in Jhang, with accommodation options, essential facilities, and a focus on student comfort.
                </p>

                <ul className="mt-6 space-y-2 text-xs sm:text-sm text-slate-700 border-t border-stone-200 pt-5">
                  <li className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#b4832e] shrink-0" aria-hidden="true" />
                    <span>24-hour security arrangements, CCTV surveillance &amp; study-friendly living</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#b4832e] shrink-0" aria-hidden="true" />
                    <span>Two Jhang locations: Satellite Town &amp; Lalazar</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 flex flex-wrap items-center gap-3">
                <Link
                  to="/girls-hostel"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0f2342] hover:bg-[#193560] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore Girls Hostel</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/girls-hostel/rooms-pricing"
                  className="inline-flex items-center px-5 py-3 text-sm font-semibold text-[#0f2342] bg-white hover:bg-stone-100 border border-stone-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  View Rooms &amp; Pricing
                </Link>
              </div>
            </article>

            {/* Card 2 — Umm-e-Aiman Paramedical Institute */}
            <article className="bg-[#f4f9fa] text-slate-900 rounded-2xl p-8 sm:p-10 border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-medium text-[#0d7a78]">
                    Umm-e-Aiman Paramedical Institute · Bhowana, District Chiniot
                  </p>
                  <img
                    src={INSTITUTE_CONTACT.logoUrl}
                    alt="Umm-e-Aiman Paramedical Institute official crest"
                    referrerPolicy="no-referrer"
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                </div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0b3b60] mt-2">
                  Build Your Future in Healthcare
                </h2>
                <p className="text-sm sm:text-base text-slate-700 leading-relaxed mt-3">
                  Explore medical diploma and healthcare training opportunities at Umm-e-Aiman Paramedical Institute in Bhowana, District Chiniot.
                </p>

                <ul className="mt-6 space-y-2 text-xs sm:text-sm text-slate-700 border-t border-slate-200 pt-5">
                  <li className="flex items-center gap-2">
                    <Microscope className="w-4 h-4 text-[#0d7a78] shrink-0" aria-hidden="true" />
                    <span>Dispenser, MLT, OTT, Radiography, Pharmacy Tech, LHV, CNA &amp; CMW</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-[#0d7a78] shrink-0" aria-hidden="true" />
                    <span>Matric Science (45% min. marks) eligible for principal FSc-level diplomas</span>
                  </li>
                </ul>
              </div>

              <div className="mt-8 pt-4 flex flex-wrap items-center gap-3">
                <Link
                  to="/paramedical-institute"
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0d7a78] hover:bg-[#0a6361] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Explore the Institute</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/paramedical-institute/admissions"
                  className="inline-flex items-center px-5 py-3 text-sm font-semibold text-[#0b3b60] bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Apply for Admission
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* Introduction & Why Choose Umm-e-Aiman */}
      <section className="py-16 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs text-slate-500">Institutional Overview</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 mt-1.5">
                Why Students &amp; Parents Choose Umm-e-Aiman
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed mt-3">
                Operating across two distinct locations with dedicated management teams, Umm-e-Aiman addresses two essential needs for families in central Punjab: dignified residential care for female students in Jhang and accessible allied healthcare training in Bhowana.
              </p>
              <div className="mt-6">
                <Link
                  to="/about"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-900 hover:underline"
                >
                  <span>Read Full Organization Profile</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </div>
            </div>

            <div className="lg:col-span-7 grid sm:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <p className="text-xs text-[#6e1e32] font-medium">01. Residential Security in Jhang</p>
                <h3 className="font-display text-lg font-semibold text-[#0f2342] mt-1.5">
                  Supervised Female Accommodation
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  24-hour security arrangements, CCTV monitoring, a 9:00 PM entry policy, quality meals, filtered water, and proximity to Jhang&apos;s educational institutions.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-xs text-[#0d7a78] font-medium">02. Practical Allied Health Skills</p>
                <h3 className="font-display text-lg font-semibold text-[#0b3b60] mt-1.5">
                  Hands-On Laboratory Training
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  On-campus medical laboratory, pharmacy lab, demonstration rooms, classrooms, and library facilities on Ameenpur Road, Bhowana.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-stone-200">
                <p className="text-xs text-[#6e1e32] font-medium">03. Clear Policies &amp; Concessions</p>
                <h3 className="font-display text-lg font-semibold text-[#0f2342] mt-1.5">
                  Transparent Fee &amp; Rule Structure
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  Published monthly sharing tiers, written resident rules, and special concessions considered for deserving and orphan students subject to management approval.
                </p>
              </div>

              <div className="bg-white p-6 rounded-xl border border-slate-200">
                <p className="text-xs text-[#0d7a78] font-medium">04. Direct Communication</p>
                <h3 className="font-display text-lg font-semibold text-[#0b3b60] mt-1.5">
                  Separate Administration Channels
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2">
                  Dedicated phone numbers, WhatsApp inquiry links, and online submission portals ensure hostel inquiries in Jhang and admission applications in Bhowana reach the right office immediately.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Facilities & Featured Medical Courses */}
      <section className="py-16 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Featured Hostel Facilities */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs text-[#6e1e32] font-medium">Umm-e-Aiman Girls Hostel · Jhang</p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0f2342] mt-1">
                  Featured Hostel Facilities
                </h2>
              </div>
              <Link
                to="/girls-hostel/facilities"
                className="text-sm font-semibold text-[#0f2342] hover:underline whitespace-nowrap shrink-0"
              >
                View All 14 Hostel Facilities &rarr;
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {HOSTEL_FACILITIES.slice(0, 4).map((fac) => (
                <div key={fac.id} className="p-5 rounded-xl bg-[#fbf8f1] border border-stone-200">
                  <p className="text-xs text-stone-500">{fac.category}</p>
                  <h3 className="font-display text-base font-semibold text-[#0f2342] mt-1">{fac.title}</h3>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">{fac.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Medical Courses */}
          <div className="pt-8 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs text-[#0d7a78] font-medium">Umm-e-Aiman Paramedical Institute · Bhowana</p>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0b3b60] mt-1">
                  Featured Medical Diploma Programs
                </h2>
              </div>
              <Link
                to="/paramedical-institute/courses"
                className="text-sm font-semibold text-[#0d7a78] hover:underline whitespace-nowrap shrink-0"
              >
                Explore All Medical Courses &rarr;
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {courses.slice(0, 4).map((course) => (
                <div
                  key={course.id}
                  className="p-5 rounded-xl bg-[#f4f9fa] border border-slate-200 flex flex-col justify-between"
                >
                  <div>
                    <p className="text-xs text-[#0d7a78]">{course.shortCode} · Principal Program</p>
                    <h3 className="font-display text-base font-semibold text-[#0b3b60] mt-1">{course.title}</h3>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed line-clamp-3">{course.overview}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Min. 45% Matric Science</span>
                    <Link
                      to={`/paramedical-institute/admissions?course=${encodeURIComponent(course.title)}`}
                      className="font-semibold text-[#0b3b60] hover:underline"
                    >
                      Apply &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Photo & Video Campus Highlights */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs text-slate-500">Verified Visual Highlights</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 mt-1">
                Campus Photographs, Posters &amp; Video Tour
              </h2>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <Link to="/girls-hostel/gallery" className="text-[#0f2342] hover:underline">
                Hostel Gallery
              </Link>
              <span aria-hidden="true" className="text-slate-400">·</span>
              <Link to="/paramedical-institute/gallery" className="text-[#0d7a78] hover:underline">
                Institute Gallery
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="aspect-[16/10]">
                <SmartMedia
                  src="/assets/extracted/institute-lab-session.jpg"
                  alt="Students practicing microscopy and centrifugation in the Umm-e-Aiman medical laboratory"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500">Real Campus Photograph · Paramedical Institute</p>
                <h3 className="font-display text-base font-semibold text-slate-900 mt-1">
                  Practical Medical Lab Training
                </h3>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="aspect-[16/10]">
                <SmartMedia
                  src="/assets/extracted/institute-signboard.jpg"
                  alt="Official Umm-e-Aiman Paramedical Institute signboard in Bhowana"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500">Official Campus Signboard · Bhowana</p>
                <h3 className="font-display text-base font-semibold text-slate-900 mt-1">
                  Advertised Courses &amp; Campus Banner
                </h3>
              </div>
            </div>

            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <div className="aspect-[16/10]">
                <SmartMedia
                  src="plate:hostel-pricing"
                  alt="Umm-e-Aiman Girls Hostel Jhang advertised accommodation tariff"
                  className="w-full h-full"
                />
              </div>
              <div className="p-4">
                <p className="text-xs text-slate-500">Official Information Plate · Girls Hostel Jhang</p>
                <h3 className="font-display text-base font-semibold text-slate-900 mt-1">
                  Jhang Hostel Monthly Room Options
                </h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Separate Locations, Contacts & WhatsApp Actions */}
      <section className="py-16 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10">
            <p className="text-xs text-slate-500">Locations &amp; Direct Communication</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 mt-1">
              Separate Campuses &amp; Dedicated Contact Numbers
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Please contact the Jhang numbers for Girls Hostel room inquiries and the Bhowana Chief Executive numbers for Paramedical Institute admissions.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Hostel Contacts Card */}
            <div className="p-7 rounded-2xl bg-[#fbf8f1] border border-stone-200 flex flex-col justify-between space-y-6">
              <div>
                <p className="text-xs font-medium text-[#6e1e32]">Jhang, Punjab · Female Student Housing</p>
                <h3 className="font-display text-xl font-semibold text-[#0f2342] mt-1">
                  Umm-e-Aiman Girls Hostel
                </h3>
                <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-700">
                  {HOSTEL_BRANCHES.map((branch) => (
                    <div key={branch.id} className="p-3.5 bg-white rounded-xl border border-stone-200">
                      <p className="font-semibold text-[#0f2342]">{branch.name}</p>
                      <p className="text-slate-600 mt-0.5">{branch.address}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-4 grid sm:grid-cols-2 gap-2 text-xs font-mono tabular-nums text-slate-800">
                  <span>General: {hostelSettings.primaryPhone}</span>
                  <span>General: {hostelSettings.secondaryPhone}</span>
                  <span>Admin: {HOSTEL_CONTACT.adminPhones[0]}</span>
                  <span>Admin: {HOSTEL_CONTACT.adminPhones[1]}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={hostelWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0f2342] hover:bg-[#193560] rounded-lg transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4 text-[#e2be78]" aria-hidden="true" />
                  <span>WhatsApp Hostel ({hostelSettings.whatsappPhone})</span>
                </a>
                <a
                  href={`tel:${formatPakPhoneForTel(hostelSettings.primaryPhone)}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0f2342] bg-white border border-stone-300 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>Call Hostel</span>
                </a>
              </div>
            </div>

            {/* Institute Contacts Card */}
            <div className="p-7 rounded-2xl bg-[#f4f9fa] border border-slate-200 flex flex-col justify-between space-y-6">
              <div>
                <p className="text-xs font-medium text-[#0d7a78]">Bhowana, District Chiniot · Healthcare Diplomas</p>
                <h3 className="font-display text-xl font-semibold text-[#0b3b60] mt-1">
                  Umm-e-Aiman Paramedical Institute
                </h3>
                <div className="mt-4 p-4 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700">
                  <p className="font-semibold text-[#0b3b60]">Main Campus Address</p>
                  <p className="text-slate-600 mt-1 leading-relaxed">{instituteSettings.addressSummary}</p>
                </div>
                <div className="mt-4 grid sm:grid-cols-2 gap-2 text-xs font-mono tabular-nums text-slate-800">
                  <span>Chief Executive: {instituteSettings.primaryPhone}</span>
                  <span>Chief Executive: {instituteSettings.secondaryPhone}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={instituteWa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0d7a78] hover:bg-[#0a6361] rounded-lg transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-4 h-4" aria-hidden="true" />
                  <span>WhatsApp Admissions ({instituteSettings.whatsappPhone})</span>
                </a>
                <a
                  href={`tel:${formatPakPhoneForTel(instituteSettings.primaryPhone)}`}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-[#0b3b60] bg-white border border-slate-300 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Phone className="w-4 h-4" aria-hidden="true" />
                  <span>Call Institute</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions Preview */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs text-slate-500">Student &amp; Parent Guidance</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 mt-1">
                Frequently Asked Questions
              </h2>
            </div>
            <Link to="/faq" className="text-sm font-semibold text-slate-900 hover:underline whitespace-nowrap">
              All FAQs &rarr;
            </Link>
          </div>

          <div className="space-y-4">
            {FAQ_ITEMS.slice(0, 4).map((faq, idx) => (
              <details
                key={idx}
                className="group bg-white border border-stone-200 rounded-xl p-5 open:shadow-xs"
              >
                <summary className="font-semibold text-sm sm:text-base text-slate-900 cursor-pointer list-none flex items-center justify-between gap-4">
                  <span>{faq.question}</span>
                  <span className="text-xs text-slate-400 group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-3 pt-3 border-t border-stone-100">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function AboutPage() {
  const { instituteSettings } = useApp();

  return (
    <div className="py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        <header className="max-w-3xl">
          <p className="text-xs text-slate-500">About Umm-e-Aiman</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 mt-2">
            Two Dedicated Institutions Serving Students Across Jhang &amp; Bhowana
          </h1>
          <p className="text-base text-slate-600 leading-relaxed mt-4">
            Umm-e-Aiman brings together two distinct student-serving organizations in Punjab, Pakistan: residential female student housing in Jhang and practical allied health education in Bhowana, District Chiniot.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <section className="bg-[#fbf8f1] border border-stone-200 rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#6e1e32] font-medium">
              <Building2 className="w-4 h-4" aria-hidden="true" />
              <span>Organization 01 · Jhang, Punjab</span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#0f2342]">Umm-e-Aiman Girls Hostel</h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              Operating two residential branches in Jhang — Satellite Town (Near Riaz Chowk, Bahari Colony Road, House No. 14/9) and Lalazar (House No. 391) — Umm-e-Aiman Girls Hostel provides female students with a peaceful, respectful, and secure place to stay near educational institutions.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              Essential facilities include 24-hour security arrangements, CCTV surveillance, ventilated shared rooms, meal options, filtered drinking water, Wi-Fi internet, geyser hot-water access, and ironing arrangements, alongside fee concession consideration for deserving and orphan students subject to management approval.
            </p>
            <div className="pt-2">
              <Link
                to="/girls-hostel"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0f2342] hover:bg-[#193560] rounded-lg"
              >
                <span>Visit Girls Hostel Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          <section className="bg-[#f4f9fa] border border-slate-200 rounded-2xl p-8 space-y-4">
            <div className="flex items-center gap-2 text-xs text-[#0d7a78] font-medium">
              <GraduationCap className="w-4 h-4" aria-hidden="true" />
              <span>Organization 02 · Bhowana, District Chiniot</span>
            </div>
            <h2 className="font-display text-2xl font-semibold text-[#0b3b60]">
              Umm-e-Aiman Paramedical Institute
            </h2>
            <p className="text-sm text-slate-700 leading-relaxed">
              Situated on Ameenpur Road near the street of Punjab International Model High School in Bhowana, District Chiniot, Umm-e-Aiman Paramedical Institute offers allied health diploma preparation and practical laboratory training for Matric Science graduates.
            </p>
            <p className="text-sm text-slate-700 leading-relaxed">
              Campus resources include training centers, classrooms, demonstration rooms, a pharmacy laboratory, a medical laboratory, and library materials supporting Dispenser, MLT, OTT, Radiography, Pharmacy Technician, LHV, CNA, and CMW programs.
            </p>
            <div className="pt-2">
              <Link
                to="/paramedical-institute"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-[#0d7a78] hover:bg-[#0a6361] rounded-lg"
              >
                <span>Visit Paramedical Institute Portal</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>
        </div>

        {/* Transparent Regulatory & Source Review Notes */}
        <section className="bg-white border border-slate-200 rounded-2xl p-8 space-y-4">
          <p className="text-xs text-slate-500">Regulatory References &amp; Public Disclosure</p>
          <h2 className="font-display text-2xl font-semibold text-slate-900">
            Registration References &amp; Source Documentation Notes
          </h2>
          <p className="text-sm text-slate-700 leading-relaxed">{instituteSettings.regulatoryReviewNote}</p>

          <div className="grid sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500">Displayed Promotional References</p>
              <p className="font-mono text-sm font-semibold text-slate-900 mt-1">
                {INSTITUTE_CONTACT.regulatoryReferences.pmfReference} · {INSTITUTE_CONTACT.regulatoryReferences.pcpReference}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Mentioned in promotional posters alongside Punjab Medical Faculty, Pharmacy Council, and Nursing Council references (subject to official verification at admission).
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <p className="text-xs text-slate-500">Preserved Source Notes for Verification</p>
              <ul className="text-xs text-slate-600 space-y-1.5 mt-1 leading-relaxed">
                {instituteSettings.rulesList.map((note, idx) => (
                  <li key={idx}>• {note}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Campus Facilities Snapshot */}
        <section>
          <h2 className="font-display text-2xl font-semibold text-slate-900 mb-6">
            Educational Facilities in Bhowana
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {INSTITUTE_FACILITIES.slice(0, 4).map((f) => (
              <div key={f.id} className="bg-white border border-slate-200 rounded-xl p-5">
                <h3 className="font-display text-base font-semibold text-[#0b3b60]">{f.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export function GeneralContactPage() {
  const { user, signInWithGoogle, hostelSettings, instituteSettings } = useApp();
  const [organization, setOrganization] = useState<'hostel' | 'institute' | 'general'>('hostel');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);

  const targetWhatsappPhone =
    organization === 'institute' ? instituteSettings.whatsappPhone : hostelSettings.whatsappPhone;

  const prefilledWaUrl = buildWhatsAppUrl(
    targetWhatsappPhone,
    `Hello Umm-e-Aiman (${organization === 'institute' ? 'Paramedical Institute, Bhowana' : 'Girls Hostel, Jhang'}),\nName: ${fullName || 'Visitor'}\nPhone: ${phone || 'N/A'}\nSubject: ${subject || 'General Inquiry'}\nMessage: ${message || 'Please share details.'}`
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSavedId(null);

    if (fullName.trim().length < 2 || fullName.trim().length > 100) {
      setFormError('Please enter your full name (2–100 characters).');
      return;
    }
    if (!isValidPakistaniPhone(phone)) {
      setFormError('Please enter a valid Pakistani mobile number (e.g., 0341-3827124).');
      return;
    }
    if (subject.trim().length < 2 || subject.trim().length > 140) {
      setFormError('Please enter a brief subject (2–140 characters).');
      return;
    }
    if (message.trim().length < 5 || message.trim().length > 1500) {
      setFormError('Please enter your message (5–1,500 characters).');
      return;
    }

    setSubmitting(true);
    try {
      let activeUser = user;
      if (!activeUser) {
        activeUser = await signInWithGoogle();
      }
      if (!activeUser) {
        throw new Error('Google Sign-In was cancelled. You can also send your message directly via WhatsApp below.');
      }

      const ref = await addDoc(collection(db, 'contactMessages'), {
        applicantUid: activeUser.uid,
        organization,
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        status: 'New',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setSavedId(ref.id);
      setSubject('');
      setMessage('');
    } catch (err) {
      try {
        if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
          handleFirestoreError(err, OperationType.CREATE, 'contactMessages');
        }
      } catch {
        // Logged structured JSON
      }
      setFormError(
        err instanceof Error
          ? err.message
          : 'Could not save online inquiry. Please use the WhatsApp button to reach management immediately.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        <header className="max-w-3xl">
          <p className="text-xs text-slate-500">Contact Directory</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 mt-1.5">
            Separate Direct Contacts for Jhang Hostel &amp; Bhowana Campus
          </h1>
          <p className="text-base text-slate-600 mt-3 leading-relaxed">
            Reach the dedicated management team for Umm-e-Aiman Girls Hostel in Jhang or Umm-e-Aiman Paramedical Institute in Bhowana, District Chiniot.
          </p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Hostel Contact Box */}
          <div className="bg-[#fbf8f1] border border-stone-200 rounded-2xl p-7 space-y-5">
            <div>
              <p className="text-xs font-medium text-[#6e1e32]">Girls Hostel · Jhang, Punjab</p>
              <h2 className="font-display text-2xl font-semibold text-[#0f2342] mt-1">
                Umm-e-Aiman Girls Hostel
              </h2>
            </div>

            <div className="space-y-3">
              {HOSTEL_BRANCHES.map((b) => (
                <div key={b.id} className="bg-white p-4 rounded-xl border border-stone-200">
                  <p className="text-xs font-semibold text-[#0f2342]">{b.name}</p>
                  <p className="text-xs text-slate-600 mt-1">{b.address}</p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(b.directionsQuery)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#b4832e] hover:underline mt-2"
                  >
                    <span>Get Directions</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono tabular-nums">
              <a
                href={`tel:${formatPakPhoneForTel(hostelSettings.primaryPhone)}`}
                className="p-3 bg-white border border-stone-200 rounded-lg hover:border-[#0f2342]"
              >
                Inquiry 1: {hostelSettings.primaryPhone}
              </a>
              <a
                href={`tel:${formatPakPhoneForTel(hostelSettings.secondaryPhone)}`}
                className="p-3 bg-white border border-stone-200 rounded-lg hover:border-[#0f2342]"
              >
                Inquiry 2: {hostelSettings.secondaryPhone}
              </a>
              <a
                href={`tel:${formatPakPhoneForTel(HOSTEL_CONTACT.adminPhones[0])}`}
                className="p-3 bg-white border border-stone-200 rounded-lg hover:border-[#0f2342]"
              >
                Admin 1: {HOSTEL_CONTACT.adminPhones[0]}
              </a>
              <a
                href={`tel:${formatPakPhoneForTel(HOSTEL_CONTACT.adminPhones[1])}`}
                className="p-3 bg-white border border-stone-200 rounded-lg hover:border-[#0f2342]"
              >
                Admin 2: {HOSTEL_CONTACT.adminPhones[1]}
              </a>
            </div>

            <p className="text-xs text-slate-600">
              Instagram:{' '}
              <a
                href={HOSTEL_CONTACT.instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-[#0f2342] hover:underline"
              >
                {HOSTEL_CONTACT.instagramHandle}
              </a>
            </p>
          </div>

          {/* Institute Contact Box */}
          <div className="bg-[#f4f9fa] border border-slate-200 rounded-2xl p-7 space-y-5">
            <div>
              <p className="text-xs font-medium text-[#0d7a78]">Paramedical Institute · Bhowana, District Chiniot</p>
              <h2 className="font-display text-2xl font-semibold text-[#0b3b60] mt-1">
                Umm-e-Aiman Paramedical Institute
              </h2>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200">
              <p className="text-xs font-semibold text-[#0b3b60]">Campus Address</p>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{instituteSettings.addressSummary}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(INSTITUTE_CONTACT.directionsQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#0d7a78] hover:underline mt-2"
              >
                <span>Open in Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-xs font-mono tabular-nums">
              <a
                href={`tel:${formatPakPhoneForTel(instituteSettings.primaryPhone)}`}
                className="p-3 bg-white border border-slate-200 rounded-lg hover:border-[#0d7a78]"
              >
                Chief Executive: {instituteSettings.primaryPhone}
              </a>
              <a
                href={`tel:${formatPakPhoneForTel(instituteSettings.secondaryPhone)}`}
                className="p-3 bg-white border border-slate-200 rounded-lg hover:border-[#0d7a78]"
              >
                Chief Executive: {instituteSettings.secondaryPhone}
              </a>
            </div>

            <div className="pt-2">
              <Link
                to="/paramedical-institute/contact"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b3b60] hover:underline"
              >
                <span>Go to Dedicated Institute Contact Page</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Online Inquiry Form + WhatsApp Fallback */}
        <div className="bg-white border border-stone-200 rounded-2xl p-7 sm:p-9 max-w-3xl">
          <h2 className="font-display text-2xl font-semibold text-slate-900">Send an Online Inquiry</h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Select the organization you wish to contact so your message is routed to the appropriate administration desk.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-org" className="block text-xs font-semibold text-slate-800 mb-1">
                  Target Organization *
                </label>
                <select
                  id="contact-org"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value as 'hostel' | 'institute' | 'general')}
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white"
                >
                  <option value="hostel">Umm-e-Aiman Girls Hostel (Jhang)</option>
                  <option value="institute">Umm-e-Aiman Paramedical Institute (Bhowana)</option>
                  <option value="general">General Inquiry</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-name" className="block text-xs font-semibold text-slate-800 mb-1">
                  Full Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contact-phone" className="block text-xs font-semibold text-slate-800 mb-1">
                  Mobile Number *
                </label>
                <input
                  id="contact-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg font-mono"
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="block text-xs font-semibold text-slate-800 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  id="contact-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact-subject" className="block text-xs font-semibold text-slate-800 mb-1">
                Subject *
              </label>
              <input
                id="contact-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Room availability / Diploma admission question"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            <div>
              <label htmlFor="contact-message" className="block text-xs font-semibold text-slate-800 mb-1">
                Message *
              </label>
              <textarea
                id="contact-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your question clearly..."
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
              />
            </div>

            {formError && (
              <div role="alert" className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
                {formError}
              </div>
            )}

            {savedId && (
              <div
                role="status"
                className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Inquiry Recorded Successfully (Ref: {savedId.slice(0, 8)})</p>
                  <p className="mt-0.5">
                    Your message has been saved for review by Umm-e-Aiman management.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors disabled:opacity-60"
              >
                {submitting ? 'Submitting...' : user ? 'Submit Online Inquiry' : 'Sign In & Submit Online'}
              </button>

              <a
                href={prefilledWaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-800 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-700" />
                <span>Send via WhatsApp Instead</span>
              </a>
            </div>
          </form>
        </div>

        {/* Live Google Maps Grounding Area Explorer */}
        <LocationMapsExplorer
          defaultQuery="Colleges, hospitals, and public transport near Satellite Town Jhang and Ameenpur Road Bhowana Chiniot"
          organizationLabel="Jhang & Bhowana Locations"
        />
      </div>
    </div>
  );
}

export function FaqPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const [filter, setFilter] = useState<'all' | 'hostel' | 'institute'>('all');
  const shown = filter === 'all' ? FAQ_ITEMS : FAQ_ITEMS.filter((f) => f.category === filter || f.category === 'general');

  useEffect(() => {
    if (!focusId) return;
    setFilter('all');
    const timer = window.setTimeout(() => {
      document.getElementById(focusId)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [focusId]);

  return (
    <div className="py-14 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-xs text-slate-500">Help &amp; Guidance</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 mt-1.5">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-600 mt-3">
          Clear answers regarding Umm-e-Aiman Girls Hostel in Jhang and Umm-e-Aiman Paramedical Institute in Bhowana.
        </p>

        <div className="flex flex-wrap items-center justify-between gap-3 my-8">
          <div className="flex items-center gap-1.5 p-1.5 bg-stone-200/70 rounded-xl w-fit">
            {[
              { id: 'all', label: 'All Topics' },
              { id: 'hostel', label: 'Girls Hostel (Jhang)' },
              { id: 'institute', label: 'Paramedical Institute (Bhowana)' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as 'all' | 'hostel' | 'institute')}
                className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  filter === tab.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {focusId && (
            <button
              type="button"
              onClick={() => setSearchParams({}, { replace: true })}
              className="text-xs font-semibold text-slate-700 hover:underline whitespace-nowrap shrink-0 cursor-pointer"
            >
              Clear Search Highlight
            </button>
          )}
        </div>

        <div className="space-y-4">
          {shown.map((item) => {
            const origIdx = FAQ_ITEMS.indexOf(item);
            const itemDomId = `faq-${origIdx}`;
            const isFocused = focusId === itemDomId;
            return (
              <article
                key={itemDomId}
                id={itemDomId}
                className={`scroll-mt-24 bg-white rounded-xl p-6 border transition-shadow ${
                  isFocused ? 'border-slate-900 ring-2 ring-slate-900/20' : 'border-stone-200'
                }`}
              >
                <p className="text-xs text-slate-500 capitalize">{item.category} Information</p>
                <h2 className="font-display text-lg font-semibold text-slate-900 mt-1">{item.question}</h2>
                <p className="text-sm text-slate-600 leading-relaxed mt-2">{item.answer}</p>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function PrivacyPolicyPage() {
  return (
    <div className="py-14 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <p className="text-xs text-slate-500">Data Protection &amp; Confidentiality</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900">
          Privacy Policy &amp; Student Data Protection
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          Umm-e-Aiman Girls Hostel (Jhang) and Umm-e-Aiman Paramedical Institute (Bhowana, District Chiniot) treat student, resident, and guardian information with strict confidentiality.
        </p>

        <section className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-slate-900">1. Information We Collect</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            When you submit a hostel accommodation inquiry or an online paramedical admission application, we collect only the personal, academic, and guardian contact information required to evaluate your request — including student name, guardian name, Pakistani phone/WhatsApp numbers, CNIC/B-Form numbers, Matriculation marks, and supporting admission documents.
          </p>
        </section>

        <section className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-slate-900">
            2. Private Storage &amp; Access Controls
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Online submissions and uploaded educational/identity documents are protected by authenticated Firebase Security Rules. Access to submitted PII and attachment records is strictly restricted to the verified submitting account and authorized Umm-e-Aiman administrators. Public visitors cannot query or view private inquiries or documents.
          </p>
        </section>

        <section className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-slate-900">3. Data Retention &amp; Inquiries</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Records are retained solely for admission verification, hostel allocation, and student administration. Applicants may request correction or deletion of their inquiry record by contacting the respective Hostel or Institute administration office.
          </p>
        </section>
      </div>
    </div>
  );
}

export function TermsPage() {
  return (
    <div className="py-14 lg:py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <p className="text-xs text-slate-500">Legal Notice</p>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900">
          Terms and Conditions of Use
        </h1>

        <section className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-slate-900">
            1. Hostel Inquiries Are Subject to Confirmation
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Submitting an accommodation inquiry form or WhatsApp message for Umm-e-Aiman Girls Hostel (Jhang) does not constitute an automatic room reservation. Room allocation, monthly tariffs, and concessions are finalized only upon confirmation by hostel management and payment of the required PKR 3,000 admission security deposit.
          </p>
        </section>

        <section className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-slate-900">
            2. Institute Applications &amp; Program Details
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Submitting an online admission application to Umm-e-Aiman Paramedical Institute (Bhowana, District Chiniot) records your application as &ldquo;Submitted&rdquo; for administrative review. Acceptance is subject to original document verification, seat availability, and applicable regulatory body requirements. Completion of any course does not guarantee employment.
          </p>
        </section>

        <section className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
          <h2 className="font-display text-xl font-semibold text-slate-900">
            3. Separate Organizational Administration
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Umm-e-Aiman Girls Hostel in Jhang and Umm-e-Aiman Paramedical Institute in Bhowana maintain separate locations, rules, and administration phone lines. Please verify all fee schedules and policies directly with the relevant office.
          </p>
        </section>
      </div>
    </div>
  );
}
