import { useState } from 'react';
import { Building2, ImageOff, Lock, MapPin, ShieldCheck } from 'lucide-react';
import { HOSTEL_BRANCHES, INITIAL_HOSTEL_PRICING, INITIAL_HOSTEL_RULES } from '../data/organizationData';

export function classificationLabel(
  cls: 'real_campus_photo' | 'official_poster' | 'illustrative_visual' | 'promotional_video'
): string {
  switch (cls) {
    case 'real_campus_photo':
      return 'Real Campus Photograph';
    case 'official_poster':
      return 'Official Promotional Material';
    case 'promotional_video':
      return 'Official Promotional Video';
    case 'illustrative_visual':
    default:
      return 'Illustrative Reference Graphic';
  }
}

export function HostelInfoPlate({ plateKey }: { plateKey: string }) {
  if (plateKey === 'plate:hostel-pricing') {
    return (
      <div className="w-full h-full min-h-[308px] bg-[#0f2342] text-white p-6 flex flex-col justify-between">
        <div>
          <p className="text-xs text-[#e2be78] tracking-wide">Umm-e-Aiman Girls Hostel · Jhang</p>
          <h4 className="font-display text-lg font-semibold mt-1">Advertised Accommodation Tariff</h4>
        </div>
        <div className="space-y-2 my-4">
          {INITIAL_HOSTEL_PRICING.map((tier) => (
            <div
              key={tier.id}
              className="flex items-center justify-between text-xs border-b border-white/15 pb-1.5"
            >
              <span className="text-stone-200">{tier.title}</span>
              <span className="font-mono tabular-nums font-semibold text-[#f3d493]">
                PKR {tier.pricePkr.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-stone-300">Subject to confirmation by hostel management.</p>
      </div>
    );
  }

  if (plateKey === 'plate:hostel-branches') {
    return (
      <div className="w-full h-full min-h-[308px] bg-[#fbf8f1] text-slate-900 p-6 border border-stone-200 flex flex-col justify-between">
        <div>
          <p className="text-xs text-[#6e1e32] font-medium">Jhang Residential Locations</p>
          <h4 className="font-display text-lg font-semibold text-[#0f2342] mt-1">Two Convenient Branches</h4>
        </div>
        <div className="space-y-3 my-4">
          {HOSTEL_BRANCHES.map((b) => (
            <div key={b.id} className="p-3 bg-white border border-stone-200 rounded-lg">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0f2342]">
                <MapPin className="w-3.5 h-3.5 text-[#b4832e]" aria-hidden="true" />
                <span>{b.shortName}</span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{b.address}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">Illustrative branch overview · Separate from Bhowana Institute</p>
      </div>
    );
  }

  if (plateKey === 'plate:hostel-security') {
    return (
      <div className="w-full h-full min-h-[308px] bg-gradient-to-br from-[#0f2342] to-[#1a355e] text-white p-6 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <ShieldCheck className="w-8 h-8 text-[#e2be78]" aria-hidden="true" />
          <Lock className="w-5 h-5 text-white/60" aria-hidden="true" />
        </div>
        <div className="my-4">
          <h4 className="font-display text-xl font-semibold">24-Hour Security &amp; Privacy</h4>
          <p className="text-xs text-stone-200 mt-2 leading-relaxed">
            CCTV surveillance, respectful Islamic residential atmosphere, 9:00 PM entry policy, and dedicated female student privacy.
          </p>
        </div>
        <p className="text-[11px] text-[#e2be78]">Illustrative Residential Safety Overview</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[308px] bg-white text-slate-900 p-6 border border-stone-200 flex flex-col justify-between">
      <div>
        <p className="text-xs text-slate-500">Resident Code Summary</p>
        <h4 className="font-display text-lg font-semibold text-[#0f2342] mt-1">Key Hostel Policies</h4>
      </div>
      <ol className="space-y-1.5 my-3 text-xs text-slate-700 list-decimal list-inside">
        {INITIAL_HOSTEL_RULES.slice(0, 4).map((r, i) => (
          <li key={i} className="truncate">
            {r}
          </li>
        ))}
      </ol>
      <p className="text-[11px] text-[#6e1e32] font-medium">Dues payable 1st–5th · PKR 200 late fee after 10th</p>
    </div>
  );
}

export function SmartMedia({
  src,
  alt,
  className = '',
  fallbackTitle,
}: {
  src?: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (src && src.startsWith('plate:')) {
    return <HostelInfoPlate plateKey={src} />;
  }

  if (!src || failed) {
    return (
      <div
        className={`bg-gradient-to-br from-slate-100 to-slate-200 flex flex-col items-center justify-center p-6 text-center text-slate-600 ${className}`}
      >
        {src ? (
          <ImageOff className="w-7 h-7 text-slate-400 mb-2" aria-hidden="true" />
        ) : (
          <Building2 className="w-8 h-8 text-[#0d7a78] mb-2" aria-hidden="true" />
        )}
        <span className="text-xs font-medium text-slate-800">{fallbackTitle || alt}</span>
        <span className="text-[11px] text-slate-500 mt-1">Illustrative Facility Reference</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
