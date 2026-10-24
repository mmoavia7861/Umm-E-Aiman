/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import {
  AboutPage,
  FaqPage,
  GeneralContactPage,
  HomePage,
  PrivacyPolicyPage,
  TermsPage,
} from './pages/MainPages';
import {
  HostelBookingPage,
  HostelFacilitiesPage,
  HostelGalleryPage,
  HostelLandingPage,
  HostelRoomsPricingPage,
  HostelRulesPage,
} from './pages/HostelPages';
import {
  InstituteAdmissionsPage,
  InstituteContactPage,
  InstituteCoursesPage,
  InstituteFacilitiesPage,
  InstituteGalleryPage,
  InstituteLandingPage,
} from './pages/InstitutePages';
import { MediaStudioPage } from './pages/MediaStudioPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { PortalSearchPage } from './pages/PortalSearchPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
}

function NotFoundPage() {
  return (
    <div className="py-24 max-w-xl mx-auto px-4 text-center space-y-5">
      <p className="text-xs font-mono text-slate-500">404 · Page Not Found</p>
      <h1 className="font-display text-3xl font-semibold text-slate-900">
        The Requested Page Could Not Be Found
      </h1>
      <p className="text-sm text-slate-600">
        Choose either Umm-e-Aiman Girls Hostel (Jhang) or Umm-e-Aiman Paramedical Institute (Bhowana) below.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
        >
          Central Homepage
        </Link>
        <Link
          to="/girls-hostel"
          className="px-5 py-2.5 text-xs font-semibold text-[#0f2342] bg-[#fbf8f1] border border-stone-300 rounded-lg"
        >
          Girls Hostel (Jhang)
        </Link>
        <Link
          to="/paramedical-institute"
          className="px-5 py-2.5 text-xs font-semibold text-[#0b3b60] bg-[#f4f9fa] border border-slate-300 rounded-lg"
        >
          Paramedical Institute (Bhowana)
        </Link>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <ScrollToTop />
        <Layout>
          <Routes>
            {/* Central Portal Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/search" element={<PortalSearchPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<GeneralContactPage />} />
            <Route path="/faq" element={<FaqPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            {/* Umm-e-Aiman Girls Hostel (Jhang) Routes */}
            <Route path="/girls-hostel" element={<HostelLandingPage />} />
            <Route path="/girls-hostel/facilities" element={<HostelFacilitiesPage />} />
            <Route path="/girls-hostel/rooms-pricing" element={<HostelRoomsPricingPage />} />
            <Route path="/girls-hostel/gallery" element={<HostelGalleryPage />} />
            <Route path="/girls-hostel/rules" element={<HostelRulesPage />} />
            <Route path="/girls-hostel/booking" element={<HostelBookingPage />} />

            {/* Umm-e-Aiman Paramedical Institute (Bhowana) Routes */}
            <Route path="/paramedical-institute" element={<InstituteLandingPage />} />
            <Route path="/paramedical-institute/courses" element={<InstituteCoursesPage />} />
            <Route path="/paramedical-institute/admissions" element={<InstituteAdmissionsPage />} />
            <Route path="/paramedical-institute/facilities" element={<InstituteFacilitiesPage />} />
            <Route path="/paramedical-institute/gallery" element={<InstituteGalleryPage />} />
            <Route path="/paramedical-institute/contact" element={<InstituteContactPage />} />

            {/* Promotional Media Studio & Secure Admin Console */}
            <Route path="/media-studio" element={<MediaStudioPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />

            {/* 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Layout>
      </AppProvider>
    </BrowserRouter>
  );
}
