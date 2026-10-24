import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, MessageCircle, Phone, X } from 'lucide-react';
import { HOSTEL_CONTACT, INSTITUTE_CONTACT } from '../data/organizationData';
import { buildWhatsAppUrl, formatPakPhoneForTel } from '../utils/validation';
import { useApp } from '../context/AppContext';
import { BreadcrumbBar, SeoHead } from './SeoHead';
import { PortalSearchBar } from './PortalSearchBar';

export function Layout({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const { hostelSettings, instituteSettings } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [waSwitcherOpen, setWaSwitcherOpen] = useState(false);

  const isHostel = pathname.startsWith('/girls-hostel');
  const isInstitute = pathname.startsWith('/paramedical-institute');

  const brandTitle = isHostel
    ? 'Umm-e-Aiman Girls Hostel'
    : isInstitute
    ? 'Umm-e-Aiman Paramedical Institute'
    : 'Umm-e-Aiman';

  const brandHref = isHostel ? '/girls-hostel' : isInstitute ? '/paramedical-institute' : '/';

  const navLinks = isHostel
    ? [
        { label: 'Overview', to: '/girls-hostel' },
        { label: 'Facilities', to: '/girls-hostel/facilities' },
        { label: 'Rooms & Pricing', to: '/girls-hostel/rooms-pricing' },
        { label: 'Gallery', to: '/girls-hostel/gallery' },
        { label: 'Rules', to: '/girls-hostel/rules' },
      ]
    : isInstitute
    ? [
        { label: 'Courses', to: '/paramedical-institute/courses' },
        { label: 'Admissions', to: '/paramedical-institute/admissions' },
        { label: 'Facilities', to: '/paramedical-institute/facilities' },
        { label: 'Gallery', to: '/paramedical-institute/gallery' },
        { label: 'Contact', to: '/paramedical-institute/contact' },
      ]
    : [
        { label: 'Girls Hostel', to: '/girls-hostel' },
        { label: 'Paramedical Institute', to: '/paramedical-institute' },
        { label: 'About', to: '/about' },
        { label: 'Media Studio', to: '/media-studio' },
        { label: 'Contact', to: '/contact' },
      ];

  const primaryCta = isHostel
    ? { label: 'Book Your Room', to: '/girls-hostel/booking', cls: 'bg-[#0f2342] hover:bg-[#193560] text-white' }
    : isInstitute
    ? { label: 'Apply for Admission', to: '/paramedical-institute/admissions', cls: 'bg-[#0d7a78] hover:bg-[#0a6361] text-white' }
    : { label: 'Admin Portal', to: '/admin', cls: 'bg-slate-900 hover:bg-slate-800 text-white' };

  const headerBorder = isHostel
    ? 'bg-[#fbf8f1]/95 border-stone-200'
    : isInstitute
    ? 'bg-white/95 border-slate-200'
    : 'bg-[#faf8f4]/95 border-stone-200';

  const hostelWaUrl = buildWhatsAppUrl(
    hostelSettings.whatsappPhone || HOSTEL_CONTACT.primaryWhatsapp,
    HOSTEL_CONTACT.defaultWhatsappMessage
  );
  const instituteWaUrl = buildWhatsAppUrl(
    instituteSettings.whatsappPhone || INSTITUTE_CONTACT.primaryWhatsapp,
    INSTITUTE_CONTACT.defaultWhatsappMessage
  );

  return (
    <div className="min-h-screen flex flex-col">
      <SeoHead />

      {/* Strict 3-Zone Top Bar Contract */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b ${headerBorder}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 sm:gap-8">
          {/* Zone 1: Single text element wordmark */}
          <Link
            to={brandHref}
            className="font-display text-[15px] sm:text-xl font-semibold tracking-tight text-slate-900 whitespace-nowrap truncate max-w-[255px] sm:max-w-none"
          >
            {brandTitle}
          </Link>

          {/* Zone 2: 5 single-line text links */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-700">
            {navLinks.map((item) => {
              const active = pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                    active
                      ? isHostel
                        ? 'border-[#b4832e] text-[#0f2342] font-semibold'
                        : isInstitute
                        ? 'border-[#0d7a78] text-[#0b3b60] font-semibold'
                        : 'border-slate-900 text-slate-900 font-semibold'
                      : 'border-transparent hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action + mobile menu button */}
          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={primaryCta.to}
              className={`hidden sm:inline-flex items-center justify-center px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${primaryCta.cls}`}
            >
              {primaryCta.label}
            </Link>

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-800 hover:bg-slate-100 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-200 px-4 pt-3 pb-5 space-y-3 shadow-lg">
            <div className="pb-2 border-b border-slate-100">
              <PortalSearchBar
                variant="utility"
                theme={isHostel ? 'hostel' : isInstitute ? 'institute' : 'neutral'}
                onResultSelect={() => setMobileMenuOpen(false)}
              />
            </div>
            <div className="flex flex-col space-y-1">
              {navLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                    pathname === item.to ? 'bg-slate-100 text-slate-900 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              {(isHostel || isInstitute) && (
                <>
                  <Link
                    to={isHostel ? '/paramedical-institute' : '/girls-hostel'}
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Switch to {isHostel ? 'Paramedical Institute (Bhowana)' : 'Girls Hostel (Jhang)'}
                  </Link>
                  <Link
                    to="/"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Main Umm-e-Aiman Portal
                  </Link>
                </>
              )}
            </div>
            <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to={primaryCta.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`w-full text-center px-4 py-2.5 text-sm font-semibold rounded-lg ${primaryCta.cls}`}
              >
                {primaryCta.label}
              </Link>
            </div>
          </div>
        )}
      </header>

      <BreadcrumbBar theme={isHostel ? 'hostel' : isInstitute ? 'institute' : 'neutral'} />

      <main className="flex-1">{children}</main>

      {/* Organization-Separated Floating WhatsApp Action */}
      <div className="fixed bottom-4 right-4 sm:bottom-5 sm:right-5 z-40">
        {isHostel ? (
          <a
            href={hostelWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Umm-e-Aiman Girls Hostel Jhang"
            className="inline-flex items-center justify-center sm:justify-start gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-full bg-[#0f2342] hover:bg-[#193560] text-white text-xs font-semibold shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 text-[#e2be78] shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Hostel WhatsApp</span>
          </a>
        ) : isInstitute ? (
          <a
            href={instituteWaUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="WhatsApp Umm-e-Aiman Paramedical Institute Bhowana"
            className="inline-flex items-center justify-center sm:justify-start gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-full bg-[#0d7a78] hover:bg-[#0a6361] text-white text-xs font-semibold shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 text-white shrink-0" aria-hidden="true" />
            <span className="hidden sm:inline">Admissions WhatsApp</span>
          </a>
        ) : (
          <div className="relative">
            {waSwitcherOpen && (
              <div className="absolute bottom-14 right-0 w-72 bg-white border border-slate-200 rounded-xl shadow-xl p-3.5 space-y-2.5">
                <p className="text-xs font-semibold text-slate-900">Select Organization WhatsApp</p>
                <a
                  href={hostelWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2.5 rounded-lg bg-[#fbf8f1] hover:bg-[#f4ebd9] border border-stone-200 transition-colors"
                >
                  <p className="text-xs font-semibold text-[#0f2342]">Girls Hostel (Jhang)</p>
                  <p className="text-[11px] text-slate-600 font-mono tabular-nums mt-0.5">
                    {hostelSettings.whatsappPhone}
                  </p>
                </a>
                <a
                  href={instituteWaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2.5 rounded-lg bg-[#eef7f7] hover:bg-[#dff0f0] border border-slate-200 transition-colors"
                >
                  <p className="text-xs font-semibold text-[#0b3b60]">Paramedical Institute (Bhowana)</p>
                  <p className="text-[11px] text-slate-600 leading-tight font-mono tabular-nums mt-0.5">
                    {instituteSettings.whatsappPhone}
                  </p>
                </a>
              </div>
            )}
            <button
              type="button"
              onClick={() => setWaSwitcherOpen((prev) => !prev)}
              aria-expanded={waSwitcherOpen}
              aria-label="Open WhatsApp contact options for Hostel or Institute"
              className="inline-flex items-center justify-center sm:justify-start gap-2 w-11 h-11 sm:w-auto sm:h-auto sm:px-4 sm:py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-lg transition-transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" aria-hidden="true" />
              <span className="hidden sm:inline">WhatsApp Inquiry</span>
            </button>
          </div>
        )}
      </div>

      {/* Professional Footer with Separate Entities & Mandatory Developer Credits */}
      <footer className="bg-[#0b1526] text-slate-300 border-t border-slate-800 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-20 sm:pb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Column 1: Girls Hostel */}
            <div className="space-y-3">
              <p className="text-xs text-[#e2be78] tracking-wide">Student Accommodation · Jhang</p>
              <h3 className="font-display text-lg font-semibold text-white">Umm-e-Aiman Girls Hostel</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Branch 1: Near Riaz Chowk, Bahari Colony Road, House No. 14/9, Satellite Town, Jhang.
                <br />
                Branch 2: House No. 391, Lalazar, Jhang.
              </p>
              <div className="space-y-1 pt-1 text-xs font-mono tabular-nums">
                <a
                  href={`tel:${formatPakPhoneForTel(hostelSettings.primaryPhone)}`}
                  className="flex items-center gap-2 text-slate-200 hover:text-[#e2be78]"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{hostelSettings.primaryPhone}</span>
                </a>
                <a
                  href={`tel:${formatPakPhoneForTel(hostelSettings.secondaryPhone)}`}
                  className="flex items-center gap-2 text-slate-200 hover:text-[#e2be78]"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{hostelSettings.secondaryPhone}</span>
                </a>
              </div>
              <div className="pt-1 flex flex-wrap gap-3 text-xs">
                <Link to="/girls-hostel" className="text-[#e2be78] hover:underline">
                  Hostel Home
                </Link>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <Link to="/girls-hostel/rooms-pricing" className="text-[#e2be78] hover:underline">
                  Pricing
                </Link>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <Link to="/girls-hostel/booking" className="text-[#e2be78] hover:underline">
                  Book Room
                </Link>
              </div>
            </div>

            {/* Column 2: Paramedical Institute */}
            <div className="space-y-3">
              <p className="text-xs text-[#5ec2bf] tracking-wide">Healthcare Education · Bhowana</p>
              <h3 className="font-display text-lg font-semibold text-white">Umm-e-Aiman Paramedical Institute</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Ameenpur Road, Near the Street of Punjab International Model High School, Bhowana, District Chiniot, Punjab, Pakistan.
              </p>
              <div className="space-y-1 pt-1 text-xs font-mono tabular-nums">
                <a
                  href={`tel:${formatPakPhoneForTel(instituteSettings.primaryPhone)}`}
                  className="flex items-center gap-2 text-slate-200 hover:text-[#5ec2bf]"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{instituteSettings.primaryPhone} (Chief Executive)</span>
                </a>
                <a
                  href={`tel:${formatPakPhoneForTel(instituteSettings.secondaryPhone)}`}
                  className="flex items-center gap-2 text-slate-200 hover:text-[#5ec2bf]"
                >
                  <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>{instituteSettings.secondaryPhone}</span>
                </a>
              </div>
              <div className="pt-1 flex flex-wrap gap-3 text-xs">
                <Link to="/paramedical-institute" className="text-[#5ec2bf] hover:underline">
                  Institute Home
                </Link>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <Link to="/paramedical-institute/courses" className="text-[#5ec2bf] hover:underline">
                  Courses
                </Link>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <Link to="/paramedical-institute/admissions" className="text-[#5ec2bf] hover:underline">
                  Apply Online
                </Link>
              </div>
            </div>

            {/* Column 3: Hostel & Institute Directory */}
            <div className="space-y-3">
              <p className="text-xs text-slate-400 tracking-wide">Quick Navigation</p>
              <h3 className="font-display text-lg font-semibold text-white">Explore Both Portals</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/" className="hover:text-white transition-colors">
                    Central Homepage
                  </Link>
                </li>
                <li>
                  <Link to="/search" className="hover:text-white transition-colors">
                    Search Courses &amp; Facilities
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    About Both Organizations
                  </Link>
                </li>
                <li>
                  <Link to="/girls-hostel/facilities" className="hover:text-white transition-colors">
                    Hostel Facilities (Jhang)
                  </Link>
                </li>
                <li>
                  <Link to="/girls-hostel/rules" className="hover:text-white transition-colors">
                    Hostel Rules &amp; Regulations
                  </Link>
                </li>
                <li>
                  <Link to="/paramedical-institute/facilities" className="hover:text-white transition-colors">
                    Institute Laboratories (Bhowana)
                  </Link>
                </li>
                <li>
                  <Link to="/paramedical-institute/contact" className="hover:text-white transition-colors">
                    Institute Contact &amp; Map
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: Policies, Tools & Administration */}
            <div className="space-y-3">
              <p className="text-xs text-slate-400 tracking-wide">Information &amp; Governance</p>
              <h3 className="font-display text-lg font-semibold text-white">Resources &amp; Legal</h3>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link to="/faq" className="hover:text-white transition-colors">
                    Frequently Asked Questions
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="hover:text-white transition-colors">
                    General Contact Directory
                  </Link>
                </li>
                <li>
                  <Link to="/media-studio" className="hover:text-white transition-colors">
                    Promotional Media &amp; Video Studio
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-white transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="hover:text-white transition-colors">
                    Terms and Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/admin" className="hover:text-white transition-colors">
                    Administrator Dashboard
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Copyright & Mandatory Developer Credits */}
          <div className="mt-12 pt-8 border-t border-slate-800/90 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 text-xs text-slate-400">
            <p>
              &copy; {new Date().getFullYear()} Umm-e-Aiman Girls Hostel (Jhang) &amp; Umm-e-Aiman Paramedical Institute (Bhowana, District Chiniot). All rights reserved.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-300 font-medium">
              <span>Senior Web Developer: Okasha Hassan</span>
              <span aria-hidden="true" className="hidden sm:inline text-slate-600">·</span>
              <span>Junior Web Developer: Moavia Hassan</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
