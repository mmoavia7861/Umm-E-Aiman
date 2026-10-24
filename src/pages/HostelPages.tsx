import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  addDoc,
  collection,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import {
  ArrowRight,
  Award,
  BedDouble,
  BookOpen,
  Camera,
  CheckCircle2,
  Droplets,
  ExternalLink,
  Flame,
  HeartHandshake,
  Home,
  Lightbulb,
  Lock,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Shirt,
  Utensils,
  Wifi,
  Wind,
} from 'lucide-react';
import {
  HOSTEL_BRANCHES,
  HOSTEL_CONTACT,
  HOSTEL_FACILITIES,
} from '../data/organizationData';
import { useApp } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  buildHostelBookingWhatsAppMessage,
  buildWhatsAppUrl,
  formatPakPhoneForTel,
  HostelBookingInput,
  validateHostelBooking,
} from '../utils/validation';
import { VirtualTour } from '../components/VirtualTour';
import { SmartMedia } from '../components/HostelInfoPlate';
import { LocationMapsExplorer } from '../components/GroundingWidgets';

function FacilityIcon({ name }: { name: string }) {
  const cls = 'w-5 h-5 text-[#b4832e]';
  switch (name) {
    case 'ShieldCheck':
      return <ShieldCheck className={cls} aria-hidden="true" />;
    case 'Camera':
      return <Camera className={cls} aria-hidden="true" />;
    case 'Wind':
      return <Wind className={cls} aria-hidden="true" />;
    case 'Wifi':
      return <Wifi className={cls} aria-hidden="true" />;
    case 'Utensils':
      return <Utensils className={cls} aria-hidden="true" />;
    case 'Droplets':
      return <Droplets className={cls} aria-hidden="true" />;
    case 'BookOpen':
      return <BookOpen className={cls} aria-hidden="true" />;
    case 'HeartHandshake':
      return <HeartHandshake className={cls} aria-hidden="true" />;
    case 'Flame':
      return <Flame className={cls} aria-hidden="true" />;
    case 'Shirt':
      return <Shirt className={cls} aria-hidden="true" />;
    case 'Lightbulb':
      return <Lightbulb className={cls} aria-hidden="true" />;
    case 'MapPin':
      return <MapPin className={cls} aria-hidden="true" />;
    case 'Lock':
      return <Lock className={cls} aria-hidden="true" />;
    default:
      return <Award className={cls} aria-hidden="true" />;
  }
}

export function HostelBranchCards() {
  const { hostelSettings } = useApp();
  return (
    <div className="grid md:grid-cols-2 gap-6">
      {HOSTEL_BRANCHES.map((branch, idx) => {
        const branchPhone = idx === 0 ? hostelSettings.primaryPhone : hostelSettings.secondaryPhone;
        const waLink = buildWhatsAppUrl(
          branchPhone,
          `Hello, I would like information about room availability at Umm-e-Aiman Girls Hostel (${branch.name}).`
        );
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.directionsQuery)}`;

        return (
          <article
            key={branch.id}
            className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5"
          >
            <div>
              <p className="text-xs text-[#6e1e32] font-medium">Jhang Residential Location · Branch {idx + 1}</p>
              <h3 className="font-display text-xl font-semibold text-[#0f2342] mt-1">{branch.name}</h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">{branch.address}</p>
              <p className="text-xs font-mono tabular-nums text-slate-700 mt-3">
                Direct Inquiry: {branchPhone}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-stone-100">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0f2342] bg-[#fbf8f1] hover:bg-[#f3ead6] border border-stone-300 rounded-lg transition-colors whitespace-nowrap"
              >
                <MapPin className="w-3.5 h-3.5 text-[#b4832e]" aria-hidden="true" />
                <span>Get Directions</span>
                <ExternalLink className="w-3 h-3" aria-hidden="true" />
              </a>

              <a
                href={waLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#0f2342] hover:bg-[#193560] rounded-lg transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#e2be78]" aria-hidden="true" />
                <span>WhatsApp Branch</span>
              </a>

              <a
                href={`tel:${formatPakPhoneForTel(branchPhone)}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                <Phone className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Call</span>
              </a>
            </div>
          </article>
        );
      })}
    </div>
  );
}

export function HostelLandingPage() {
  const navigate = useNavigate();
  const { hostelPricing, hostelSettings } = useApp();

  const [quickBranch, setQuickBranch] = useState(HOSTEL_BRANCHES[0].name);
  const [quickRoom, setQuickRoom] = useState('Two-person sharing (PKR 12,000)');
  const [quickDate, setQuickDate] = useState('');

  const handleQuickInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    params.set('branch', quickBranch);
    params.set('room', quickRoom);
    if (quickDate) params.set('date', quickDate);
    navigate(`/girls-hostel/booking?${params.toString()}`);
  };

  return (
    <div className="bg-[#fbf8f1]">
      {/* Hostel Hero Section */}
      <section className="bg-[#0f2342] text-white py-16 lg:py-24 border-b border-[#1f3b66]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <p className="text-xs text-[#e2be78] tracking-wide">
                Umm-e-Aiman Girls Hostel · Jhang, Punjab, Pakistan
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold leading-[1.14] tracking-tight">
                Your Comfort, Safety &amp; Peace of Mind Matter.
              </h1>
              <p className="text-base sm:text-lg text-stone-200 leading-relaxed max-w-xl text-pretty">
                Welcome to Umm-e-Aiman Girls Hostel in Jhang. Discover convenient accommodation, essential facilities, a supportive environment, and room options designed for female students.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <Link
                  to="/girls-hostel/booking"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#0f2342] bg-[#e2be78] hover:bg-[#ecd096] rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Book Your Room</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/girls-hostel/facilities"
                  className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg transition-colors whitespace-nowrap shrink-0"
                >
                  Explore Hostel Facilities
                </Link>
              </div>

              <p className="text-xs text-stone-300 pt-2">
                {hostelSettings.announcementBanner}
              </p>
            </div>

            {/* Availability Inquiry Panel */}
            <div className="lg:col-span-5">
              <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-7 border border-stone-200 shadow-lg">
                <p className="text-xs font-medium text-[#6e1e32]">Room Availability Inquiry</p>
                <h2 className="font-display text-xl font-semibold text-[#0f2342] mt-1">
                  Check Accommodation Options
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Select your preferred Jhang branch and sharing option to proceed to the booking inquiry form.
                </p>

                <form onSubmit={handleQuickInquiry} className="mt-5 space-y-4">
                  <div>
                    <label htmlFor="quick-branch" className="block text-xs font-semibold text-slate-800 mb-1">
                      Preferred Jhang Branch
                    </label>
                    <select
                      id="quick-branch"
                      value={quickBranch}
                      onChange={(e) => setQuickBranch(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-white"
                    >
                      {HOSTEL_BRANCHES.map((b) => (
                        <option key={b.id} value={b.name}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quick-room" className="block text-xs font-semibold text-slate-800 mb-1">
                      Room Sharing Option
                    </label>
                    <select
                      id="quick-room"
                      value={quickRoom}
                      onChange={(e) => setQuickRoom(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-white"
                    >
                      <option value="Three-person sharing (PKR 15,000)">Three-person sharing (PKR 15,000)</option>
                      <option value="Two-person sharing (PKR 12,000)">Two-person sharing (PKR 12,000)</option>
                      <option value="Accommodation without food (PKR 7,000)">Accommodation without food (PKR 7,000)</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="quick-date" className="block text-xs font-semibold text-slate-800 mb-1">
                      Expected Move-In Date
                    </label>
                    <input
                      id="quick-date"
                      type="date"
                      value={quickDate}
                      onChange={(e) => setQuickDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-white"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 px-4 text-sm font-semibold text-white bg-[#0f2342] hover:bg-[#193560] rounded-lg transition-colors"
                  >
                    Continue to Room Inquiry Form
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Hostel Facilities */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs text-[#6e1e32] font-medium">Substantiated Student Amenities</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0f2342] mt-1">
                Designed for Female Student Safety &amp; Study Focus
              </h2>
            </div>
            <Link
              to="/girls-hostel/facilities"
              className="text-sm font-semibold text-[#0f2342] hover:underline whitespace-nowrap"
            >
              View All 14 Hostel Facilities &rarr;
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOSTEL_FACILITIES.slice(0, 8).map((fac) => (
              <div key={fac.id} className="bg-white border border-stone-200 rounded-xl p-5 space-y-2.5">
                <FacilityIcon name={fac.iconName} />
                <p className="text-xs text-stone-500">{fac.category}</p>
                <h3 className="font-display text-base font-semibold text-[#0f2342]">{fac.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{fac.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Advertised Room Pricing Summary */}
      <section className="py-16 bg-white border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-xs text-[#6e1e32] font-medium">Monthly Accommodation Schedule</p>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0f2342] mt-1">
                Hostel Rooms &amp; Advertised Pricing
              </h2>
            </div>
            <Link
              to="/girls-hostel/rooms-pricing"
              className="text-sm font-semibold text-[#0f2342] hover:underline whitespace-nowrap"
            >
              Full Pricing &amp; Details &rarr;
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {hostelPricing.map((tier) => (
              <div
                key={tier.id}
                className="p-6 rounded-2xl bg-[#fbf8f1] border border-stone-200 flex flex-col justify-between"
              >
                <div>
                  <p className="text-xs text-stone-500">{tier.billingPeriod}</p>
                  <h3 className="font-display text-lg font-semibold text-[#0f2342] mt-1">{tier.title}</h3>
                  <p className="font-mono tabular-nums text-2xl font-bold text-[#6e1e32] mt-3">
                    PKR {tier.pricePkr.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-600 mt-3 leading-relaxed">{tier.summary}</p>
                </div>
                <div className="mt-5 pt-3 border-t border-stone-200">
                  <Link
                    to={`/girls-hostel/booking?room=${encodeURIComponent(`${tier.title} (PKR ${tier.pricePkr.toLocaleString()})`)}`}
                    className="text-xs font-semibold text-[#0f2342] hover:underline"
                  >
                    Inquire About This Option &rarr;
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-600 mt-6 bg-stone-100 border border-stone-200 rounded-lg px-4 py-3">
            Note: {HOSTEL_CONTACT.pricingDisclaimer}
          </p>
        </div>
      </section>

      {/* Two Jhang Hostel Branches & Contact Details */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-2xl">
            <p className="text-xs text-[#6e1e32] font-medium">Jhang Branches &amp; Administration</p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0f2342] mt-1">
              Two Convenient Hostel Branches in Jhang
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              General Inquiry Numbers: {hostelSettings.primaryPhone}, {hostelSettings.secondaryPhone} · Administration: {HOSTEL_CONTACT.adminPhones.join(', ')} · Instagram: {HOSTEL_CONTACT.instagramHandle}
            </p>
          </div>

          <HostelBranchCards />

          <LocationMapsExplorer
            defaultQuery="Educational colleges and landmarks near Riaz Chowk Satellite Town Jhang and Lalazar Colony Jhang"
            organizationLabel="Umm-e-Aiman Girls Hostel, Jhang"
            accentClass="bg-[#0f2342] hover:bg-[#193560]"
          />
        </div>
      </section>
    </div>
  );
}

export function HostelFacilitiesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const focusedFacility = focusId ? HOSTEL_FACILITIES.find((f) => f.id === focusId) : undefined;

  useEffect(() => {
    if (!focusId) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`hostel-facility-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [focusId]);

  return (
    <div className="bg-[#fbf8f1] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="max-w-3xl space-y-3">
          <p className="text-xs text-[#6e1e32] font-medium">Umm-e-Aiman Girls Hostel · Jhang</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0f2342]">
            Essential Facilities for Safe &amp; Focused Student Living
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Every amenity listed below is directly substantiated by the official Umm-e-Aiman Girls Hostel promotional materials for female students in Jhang.
          </p>
          {focusedFacility && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[#0f2342] font-semibold">
                Viewing searched facility: {focusedFacility.title}
              </span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="font-semibold text-[#6e1e32] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Clear Highlight
              </button>
            </div>
          )}
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {HOSTEL_FACILITIES.map((fac) => {
            const isFocused = focusId === fac.id;
            return (
              <article
                key={fac.id}
                id={`hostel-facility-${fac.id}`}
                className={`scroll-mt-24 bg-white rounded-2xl p-6 space-y-3 border transition-shadow ${
                  isFocused ? 'border-[#b4832e] ring-2 ring-[#b4832e]/40 shadow-md' : 'border-stone-200'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-[#fbf8f1] border border-stone-200 flex items-center justify-center">
                  <FacilityIcon name={fac.iconName} />
                </div>
                <p className="text-xs text-stone-500">{fac.category}</p>
                <h2 className="font-display text-lg font-semibold text-[#0f2342]">{fac.title}</h2>
                <p className="text-sm text-slate-600 leading-relaxed">{fac.description}</p>
              </article>
            );
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-6 pt-4">
          <div className="rounded-2xl overflow-hidden border border-stone-200">
            <SmartMedia src="plate:hostel-security" alt="Hostel security and privacy overview" />
          </div>
          <div className="rounded-2xl overflow-hidden border border-stone-200">
            <SmartMedia src="plate:hostel-branches" alt="Jhang hostel branch locations" />
          </div>
        </div>

        <div className="bg-[#0f2342] text-white rounded-2xl p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Ready to Inquire About Room Availability?</h2>
            <p className="text-sm text-stone-300 mt-1">
              Review advertised monthly sharing tiers or submit a room inquiry for Satellite Town or Lalazar, Jhang.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 shrink-0">
            <Link
              to="/girls-hostel/rooms-pricing"
              className="px-5 py-2.5 text-xs font-semibold text-white bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg whitespace-nowrap"
            >
              View Pricing
            </Link>
            <Link
              to="/girls-hostel/booking"
              className="px-5 py-2.5 text-xs font-semibold text-[#0f2342] bg-[#e2be78] hover:bg-[#ecd096] rounded-lg whitespace-nowrap"
            >
              Book Your Room
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HostelRoomsPricingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const focusId = searchParams.get('focus');
  const { hostelPricing, hostelSettings } = useApp();
  const focusedTier = focusId ? hostelPricing.find((t) => t.id === focusId) : undefined;

  useEffect(() => {
    if (!focusId) return;
    const timer = window.setTimeout(() => {
      document.getElementById(`room-${focusId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [focusId]);

  return (
    <div className="bg-[#fbf8f1] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <header className="max-w-3xl space-y-3">
          <p className="text-xs text-[#6e1e32] font-medium">Accommodation Tariff · Jhang</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0f2342]">
            Transparent Room Options &amp; Advertised Monthly Pricing
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Explore shared student rooms and meal-optional accommodation at Umm-e-Aiman Girls Hostel across our Satellite Town and Lalazar branches in Jhang.
          </p>
          {focusedTier && (
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <span className="text-[#0f2342] font-semibold">
                Viewing searched option: {focusedTier.title}
              </span>
              <span aria-hidden="true" className="text-stone-400">·</span>
              <button
                type="button"
                onClick={() => setSearchParams({}, { replace: true })}
                className="font-semibold text-[#6e1e32] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Clear Highlight
              </button>
            </div>
          )}
        </header>

        {/* Mandatory Pricing Confirmation Notice */}
        <div className="bg-white border border-stone-300 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <p className="text-xs sm:text-sm font-medium text-[#0f2342]">
            {HOSTEL_CONTACT.pricingDisclaimer}
          </p>
          <Link
            to="/girls-hostel/rules"
            className="text-xs font-semibold text-[#6e1e32] hover:underline whitespace-nowrap shrink-0"
          >
            Read Dues &amp; Deposit Policy &rarr;
          </Link>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {hostelPricing.map((tier) => {
            const isFocused = focusId === tier.id;
            const roomParam = tier.isDeposit
              ? 'Two-person sharing (PKR 12,000)'
              : `${tier.title} (PKR ${tier.pricePkr.toLocaleString()})`;
            const waUrl = buildWhatsAppUrl(
              hostelSettings.whatsappPhone || HOSTEL_CONTACT.primaryWhatsapp,
              `Hello, I would like to inquire about "${tier.title}" (advertised at PKR ${tier.pricePkr.toLocaleString()}) at Umm-e-Aiman Girls Hostel in Jhang.`
            );

            return (
              <article
                key={tier.id}
                id={`room-${tier.id}`}
                className={`scroll-mt-24 bg-white rounded-2xl p-7 flex flex-col justify-between space-y-6 border transition-shadow ${
                  isFocused ? 'border-[#b4832e] ring-2 ring-[#b4832e]/40 shadow-md' : 'border-stone-200'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-stone-500">{tier.billingPeriod}</p>
                      <h2 className="font-display text-2xl font-semibold text-[#0f2342] mt-1">{tier.title}</h2>
                    </div>
                    <div className="w-11 h-11 rounded-xl bg-[#fbf8f1] border border-stone-200 flex items-center justify-center shrink-0">
                      {tier.isDeposit ? (
                        <ShieldCheck className="w-5 h-5 text-[#b4832e]" aria-hidden="true" />
                      ) : (
                        <BedDouble className="w-5 h-5 text-[#0f2342]" aria-hidden="true" />
                      )}
                    </div>
                  </div>

                  <p className="font-mono tabular-nums text-3xl font-bold text-[#6e1e32] mt-4">
                    PKR {tier.pricePkr.toLocaleString()}
                  </p>
                  <p className="text-xs text-stone-500 mt-1">{tier.availabilityNote}</p>

                  <p className="text-sm text-slate-600 mt-4 leading-relaxed">{tier.summary}</p>

                  <ul className="mt-5 pt-4 border-t border-stone-100 space-y-2 text-xs sm:text-sm text-slate-700">
                    {tier.includedHighlights.map((hl, i) => (
                      <li key={i} className="flex items-center gap-2">
                        <Home className="w-3.5 h-3.5 text-[#b4832e] shrink-0" aria-hidden="true" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link
                    to={`/girls-hostel/booking?room=${encodeURIComponent(roomParam)}`}
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#0f2342] hover:bg-[#193560] rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Room Inquiry Form</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </Link>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-[#0f2342] bg-[#fbf8f1] hover:bg-[#f3ead6] border border-stone-300 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#b4832e]" aria-hidden="true" />
                    <span>WhatsApp Booking Inquiry</span>
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <HostelBranchCards />
      </div>
    </div>
  );
}

export function HostelGalleryPage() {
  const { galleryItems } = useApp();
  const hostelItems = galleryItems.filter((item) => item.organization === 'hostel');

  return (
    <div className="bg-[#fbf8f1] py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="max-w-3xl">
          <p className="text-xs text-[#6e1e32] font-medium">
            Umm-e-Aiman Girls Hostel · Interactive Virtual Tour · Jhang
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0f2342] mt-1.5">
            Girls Hostel Virtual Tour &amp; Information Gallery
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Explore our interactive Jhang hostel tour covering advertised room tariffs, Satellite Town and Lalazar branch locations, 24-hour security standards, and resident policies. Click any visual in the grid to inspect it in a full-screen tour modal.
          </p>
        </header>

        <VirtualTour items={hostelItems} theme="hostel" />
      </div>
    </div>
  );
}

export function HostelRulesPage() {
  const { hostelSettings } = useApp();

  return (
    <div className="bg-[#fbf8f1] py-14 lg:py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header>
          <p className="text-xs text-[#6e1e32] font-medium">Official Hostel Policy · Jhang</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0f2342] mt-1.5">
            Hostel Rules &amp; Resident Code of Conduct
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            All residents and guardians applying for accommodation at Umm-e-Aiman Girls Hostel are required to review and observe the following regulations as stated in the official hostel policy.
          </p>
        </header>

        <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-200">
          {hostelSettings.rulesList.map((rule, index) => (
            <div key={index} className="p-5 sm:p-6 flex items-start gap-4">
              <span className="font-mono tabular-nums text-sm font-bold text-[#6e1e32] bg-[#fbf8f1] border border-stone-200 w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                {String(index + 1).padStart(2, '0')}
              </span>
              <p className="text-sm sm:text-base text-slate-800 leading-relaxed pt-0.5">{rule}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#0f2342] text-white rounded-2xl p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div>
            <h2 className="font-display text-xl font-semibold">Proceed to Accommodation Inquiry</h2>
            <p className="text-xs sm:text-sm text-stone-300 mt-1">
              You will be asked to confirm that you have read and understood these rules on the booking inquiry form.
            </p>
          </div>
          <Link
            to="/girls-hostel/booking"
            className="px-5 py-3 text-xs font-semibold text-[#0f2342] bg-[#e2be78] hover:bg-[#ecd096] rounded-lg whitespace-nowrap shrink-0"
          >
            Open Hostel Booking Form
          </Link>
        </div>
      </div>
    </div>
  );
}

interface SavedHostelInquiry {
  id: string;
  preferredBranch: string;
  preferredRoomType: string;
  expectedMoveInDate: string;
  status: string;
}

export function HostelBookingPage() {
  const [searchParams] = useSearchParams();
  const { user, signInWithGoogle, hostelSettings } = useApp();

  const [form, setForm] = useState<HostelBookingInput>({
    fullName: '',
    mobileNumber: '',
    whatsappNumber: '',
    email: '',
    preferredBranch: searchParams.get('branch') || HOSTEL_BRANCHES[0].name,
    preferredRoomType: searchParams.get('room') || 'Two-person sharing (PKR 12,000)',
    occupantsCount: 1,
    expectedMoveInDate: searchParams.get('date') || '',
    guardianName: '',
    guardianContact: '',
    additionalMessage: '',
    acceptedRules: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedInquiryId, setSavedInquiryId] = useState<string | null>(null);
  const [myInquiries, setMyInquiries] = useState<SavedHostelInquiry[]>([]);

  useEffect(() => {
    if (!user) {
      setMyInquiries([]);
      return;
    }
    const q = query(collection(db, 'hostelInquiries'), where('applicantUid', '==', user.uid));
    const unsub = onSnapshot(
      q,
      (snap) => {
        setMyInquiries(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              preferredBranch: String(data.preferredBranch || ''),
              preferredRoomType: String(data.preferredRoomType || ''),
              expectedMoveInDate: String(data.expectedMoveInDate || ''),
              status: String(data.status || 'New Inquiry'),
            };
          })
        );
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'hostelInquiries');
        } catch {
          // Handled
        }
      }
    );
    return () => unsub();
  }, [user]);

  const updateField = <K extends keyof HostelBookingInput>(key: K, value: HostelBookingInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSavedInquiryId(null);

    const validationErrors = validateHostelBooking(form);
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
          'Google Sign-In is required to store your inquiry online and track status. Alternatively, use the WhatsApp Inquiry button below.'
        );
      }

      const docRef = await addDoc(collection(db, 'hostelInquiries'), {
        applicantUid: activeUser.uid,
        fullName: form.fullName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
        email: form.email.trim(),
        preferredBranch: form.preferredBranch,
        preferredRoomType: form.preferredRoomType,
        occupantsCount: Number(form.occupantsCount),
        expectedMoveInDate: form.expectedMoveInDate,
        guardianName: form.guardianName.trim(),
        guardianContact: form.guardianContact.trim(),
        additionalMessage: form.additionalMessage.trim(),
        acceptedRules: form.acceptedRules,
        status: 'New Inquiry',
        adminNotes: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSavedInquiryId(docRef.id);
    } catch (err) {
      try {
        if (err instanceof Error && err.message.includes('Missing or insufficient permissions')) {
          handleFirestoreError(err, OperationType.CREATE, 'hostelInquiries');
        }
      } catch {
        // Logged structured JSON
      }
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Unable to save inquiry to the database. Please send your inquiry directly via WhatsApp below.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappAlternativeUrl = buildWhatsAppUrl(
    hostelSettings.whatsappPhone || HOSTEL_CONTACT.primaryWhatsapp,
    buildHostelBookingWhatsAppMessage(form)
  );

  return (
    <div className="bg-[#fbf8f1] py-14 lg:py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="max-w-3xl">
          <p className="text-xs text-[#6e1e32] font-medium">Umm-e-Aiman Girls Hostel · Jhang</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-[#0f2342] mt-1.5">
            Hostel Accommodation &amp; Room Availability Inquiry
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Complete the form below to submit an accommodation inquiry for our Satellite Town or Lalazar branch in Jhang. Submitting an inquiry records your request for review — a room is reserved only once confirmed by hostel management.
          </p>
        </header>

        <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-9">
          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="hb-fullname" className="block text-xs font-semibold text-slate-800 mb-1">
                  Student Full Name *
                </label>
                <input
                  id="hb-fullname"
                  type="text"
                  value={form.fullName}
                  onChange={(e) => updateField('fullName', e.target.value)}
                  placeholder="Enter student's full name"
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="hb-email" className="block text-xs font-semibold text-slate-800 mb-1">
                  Email Address (Optional)
                </label>
                <input
                  id="hb-email"
                  type="email"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  placeholder="student@example.com"
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="hb-mobile" className="block text-xs font-semibold text-slate-800 mb-1">
                  Mobile Number *
                </label>
                <input
                  id="hb-mobile"
                  type="tel"
                  value={form.mobileNumber}
                  onChange={(e) => updateField('mobileNumber', e.target.value)}
                  placeholder="0341-3827124"
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg font-mono"
                />
                {errors.mobileNumber && <p className="text-xs text-red-600 mt-1">{errors.mobileNumber}</p>}
              </div>

              <div>
                <label htmlFor="hb-whatsapp" className="block text-xs font-semibold text-slate-800 mb-1">
                  WhatsApp Number *
                </label>
                <input
                  id="hb-whatsapp"
                  type="tel"
                  value={form.whatsappNumber}
                  onChange={(e) => updateField('whatsappNumber', e.target.value)}
                  placeholder="0316-6508054"
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg font-mono"
                />
                {errors.whatsappNumber && <p className="text-xs text-red-600 mt-1">{errors.whatsappNumber}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="hb-branch" className="block text-xs font-semibold text-slate-800 mb-1">
                  Preferred Hostel Branch *
                </label>
                <select
                  id="hb-branch"
                  value={form.preferredBranch}
                  onChange={(e) => updateField('preferredBranch', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  {HOSTEL_BRANCHES.map((b) => (
                    <option key={b.id} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
                {errors.preferredBranch && <p className="text-xs text-red-600 mt-1">{errors.preferredBranch}</p>}
              </div>

              <div>
                <label htmlFor="hb-room" className="block text-xs font-semibold text-slate-800 mb-1">
                  Preferred Room Type *
                </label>
                <select
                  id="hb-room"
                  value={form.preferredRoomType}
                  onChange={(e) => updateField('preferredRoomType', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  <option value="Three-person sharing (PKR 15,000)">Three-person sharing (PKR 15,000)</option>
                  <option value="Two-person sharing (PKR 12,000)">Two-person sharing (PKR 12,000)</option>
                  <option value="Accommodation without food (PKR 7,000)">Accommodation without food (PKR 7,000)</option>
                </select>
                {errors.preferredRoomType && <p className="text-xs text-red-600 mt-1">{errors.preferredRoomType}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="hb-occupants" className="block text-xs font-semibold text-slate-800 mb-1">
                  Number of Occupants *
                </label>
                <select
                  id="hb-occupants"
                  value={form.occupantsCount}
                  onChange={(e) => updateField('occupantsCount', Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg bg-white"
                >
                  <option value={1}>1 Student</option>
                  <option value={2}>2 Students</option>
                  <option value={3}>3 Students</option>
                </select>
                {errors.occupantsCount && <p className="text-xs text-red-600 mt-1">{errors.occupantsCount}</p>}
              </div>

              <div>
                <label htmlFor="hb-movein" className="block text-xs font-semibold text-slate-800 mb-1">
                  Expected Move-in Date *
                </label>
                <input
                  id="hb-movein"
                  type="date"
                  value={form.expectedMoveInDate}
                  onChange={(e) => updateField('expectedMoveInDate', e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
                />
                {errors.expectedMoveInDate && <p className="text-xs text-red-600 mt-1">{errors.expectedMoveInDate}</p>}
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-5 pt-2 border-t border-stone-100">
              <div>
                <label htmlFor="hb-guardian" className="block text-xs font-semibold text-slate-800 mb-1">
                  Father&apos;s / Guardian&apos;s Name *
                </label>
                <input
                  id="hb-guardian"
                  type="text"
                  value={form.guardianName}
                  onChange={(e) => updateField('guardianName', e.target.value)}
                  placeholder="Enter guardian full name"
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
                />
                {errors.guardianName && <p className="text-xs text-red-600 mt-1">{errors.guardianName}</p>}
              </div>

              <div>
                <label htmlFor="hb-guardian-phone" className="block text-xs font-semibold text-slate-800 mb-1">
                  Guardian Contact Number *
                </label>
                <input
                  id="hb-guardian-phone"
                  type="tel"
                  value={form.guardianContact}
                  onChange={(e) => updateField('guardianContact', e.target.value)}
                  placeholder="03XX-XXXXXXX"
                  className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg font-mono"
                />
                {errors.guardianContact && <p className="text-xs text-red-600 mt-1">{errors.guardianContact}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="hb-message" className="block text-xs font-semibold text-slate-800 mb-1">
                Additional Message (College/University name, meal questions, etc.)
              </label>
              <textarea
                id="hb-message"
                rows={3}
                value={form.additionalMessage}
                onChange={(e) => updateField('additionalMessage', e.target.value)}
                placeholder="Share any specific questions for hostel management..."
                className="w-full px-3.5 py-2.5 text-sm border border-stone-300 rounded-lg"
              />
              {errors.additionalMessage && <p className="text-xs text-red-600 mt-1">{errors.additionalMessage}</p>}
            </div>

            {/* Mandatory Hostel Rules Confirmation Checkbox */}
            <div className="p-4 rounded-xl bg-[#fbf8f1] border border-stone-200">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.acceptedRules}
                  onChange={(e) => updateField('acceptedRules', e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-stone-300 text-[#0f2342]"
                />
                <span className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                  I have read and understood the hostel rules and regulations (including the PKR 3,000 admission security deposit, 9:00 PM entry policy, and 1st–5th monthly dues schedule).{' '}
                  <Link to="/girls-hostel/rules" className="font-semibold text-[#6e1e32] underline">
                    Review Rules
                  </Link>
                </span>
              </label>
              {errors.acceptedRules && <p className="text-xs text-red-600 mt-2">{errors.acceptedRules}</p>}
            </div>

            {submitError && (
              <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
                {submitError}
              </div>
            )}

            {savedInquiryId && (
              <div
                role="status"
                className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-950 flex items-start gap-3"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">
                    Accommodation Inquiry Received (Reference ID: {savedInquiryId.slice(0, 8)})
                  </p>
                  <p className="mt-1 text-emerald-900 leading-relaxed">
                    Your inquiry has been saved in the Umm-e-Aiman Girls Hostel system with status &ldquo;New Inquiry&rdquo;. Please note that a room is not reserved until hostel management confirms availability with you and your guardian.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-3 text-sm font-semibold text-white bg-[#0f2342] hover:bg-[#193560] rounded-lg transition-colors disabled:opacity-60"
              >
                {submitting
                  ? 'Saving Inquiry...'
                  : user
                  ? 'Submit Accommodation Inquiry'
                  : 'Sign In with Google & Submit Inquiry'}
              </button>

              <a
                href={whatsappAlternativeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-[#0f2342] bg-[#fbf8f1] hover:bg-[#f3ead6] border border-stone-300 rounded-lg transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-[#b4832e]" aria-hidden="true" />
                <span>Send Details via WhatsApp</span>
              </a>
            </div>
          </form>
        </div>

        {/* Live Status Tracker for Signed-In Student */}
        {user && myInquiries.length > 0 && (
          <section className="bg-white border border-stone-200 rounded-2xl p-6 space-y-4">
            <h2 className="font-display text-lg font-semibold text-[#0f2342]">
              Your Submitted Hostel Inquiries ({myInquiries.length})
            </h2>
            <div className="divide-y divide-stone-200">
              {myInquiries.map((inq) => (
                <div key={inq.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div>
                    <p className="font-semibold text-slate-900">{inq.preferredRoomType}</p>
                    <p className="text-slate-600">
                      {inq.preferredBranch} · Expected Move-in: {inq.expectedMoveInDate}
                    </p>
                  </div>
                  <span className="font-mono font-semibold text-[#0f2342]">Status: {inq.status}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
