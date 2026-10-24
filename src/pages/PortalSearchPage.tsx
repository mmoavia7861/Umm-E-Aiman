import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  buildPortalSearchIndex,
  getSearchCategoryCounts,
  PORTAL_QUICK_SEARCHES,
  PortalSearchCategory,
  searchPortalIndex,
} from '../utils/portalSearch';

export function PortalSearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { courses, hostelPricing, hostelSettings } = useApp();

  const query = searchParams.get('q') || '';
  const orgParam = searchParams.get('org');
  const typeParam = searchParams.get('type');

  const activeOrg: 'all' | 'institute' | 'hostel' =
    orgParam === 'institute' || orgParam === 'hostel' ? orgParam : 'all';

  const activeType: 'all' | PortalSearchCategory =
    typeParam === 'course' ||
    typeParam === 'facility' ||
    typeParam === 'pricing' ||
    typeParam === 'faq'
      ? typeParam
      : 'all';

  const searchIndex = useMemo(
    () =>
      buildPortalSearchIndex({
        courses,
        hostelPricing,
        hostelRules: hostelSettings.rulesList,
      }),
    [courses, hostelPricing, hostelSettings.rulesList]
  );

  const counts = useMemo(
    () => getSearchCategoryCounts(searchIndex, query, activeOrg),
    [searchIndex, query, activeOrg]
  );

  const results = useMemo(
    () =>
      searchPortalIndex(searchIndex, query, {
        category: activeType,
        organization: activeOrg,
      }),
    [searchIndex, query, activeType, activeOrg]
  );

  const updateParams = (updates: {
    q?: string;
    org?: 'all' | 'institute' | 'hostel';
    type?: 'all' | PortalSearchCategory;
  }) => {
    const next = new URLSearchParams(searchParams);
    if (updates.q !== undefined) {
      if (updates.q.trim()) next.set('q', updates.q);
      else next.delete('q');
    }
    if (updates.org !== undefined) {
      if (updates.org !== 'all') next.set('org', updates.org);
      else next.delete('org');
    }
    if (updates.type !== undefined) {
      if (updates.type !== 'all') next.set('type', updates.type);
      else next.delete('type');
    }
    setSearchParams(next, { replace: true });
  };

  const orgOptions: { id: 'all' | 'institute' | 'hostel'; label: string }[] = [
    { id: 'all', label: 'Both Organizations' },
    { id: 'institute', label: 'Paramedical Institute (Bhowana)' },
    { id: 'hostel', label: 'Girls Hostel (Jhang)' },
  ];

  const typeOptions: { id: 'all' | PortalSearchCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All Entries', count: counts.all },
    { id: 'course', label: 'Medical Courses', count: counts.course },
    { id: 'facility', label: 'Facilities & Labs', count: counts.facility },
    { id: 'pricing', label: 'Rooms & Tariff', count: counts.pricing },
    { id: 'faq', label: 'Policies & FAQ', count: counts.faq },
  ];

  return (
    <div className="bg-[#faf8f4] min-h-[70vh] py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header & Search Form */}
        <header className="max-w-3xl space-y-4">
          <p className="text-xs text-slate-600 font-medium">
            Umm-e-Aiman Unified Portal Directory · Bhowana Institute &amp; Jhang Girls Hostel
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900">
            Search Courses, Laboratories &amp; Hostel Facilities
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Find specific medical diploma programs, laboratory infrastructure in Bhowana (District Chiniot), or female student accommodation facilities and tariffs in Jhang.
          </p>

          <form
            role="search"
            onSubmit={(e) => e.preventDefault()}
            className="pt-2"
          >
            <label htmlFor="directory-search-input" className="sr-only">
              Search courses, facilities, rooms, and policies
            </label>
            <div className="flex items-center bg-white border border-slate-300 rounded-xl px-4 py-3 shadow-xs focus-within:border-slate-800 transition-colors">
              <Search className="w-5 h-5 text-slate-400 shrink-0" aria-hidden="true" />
              <input
                id="directory-search-input"
                type="search"
                value={query}
                onChange={(e) => updateParams({ q: e.target.value })}
                placeholder="Type a course (e.g., MLT, Dispenser, LHV) or facility (e.g., Microscope, CCTV, Wi-Fi, Geyser)..."
                className="w-full px-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => updateParams({ q: '' })}
                  aria-label="Clear search query"
                  className="p-1 text-slate-400 hover:text-slate-800 rounded-md cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>

          {/* Quick Suggestion Buttons */}
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-slate-600">
            <span className="text-slate-500">Popular topics:</span>
            {PORTAL_QUICK_SEARCHES.map((topic, idx) => (
              <React.Fragment key={topic.label}>
                {idx > 0 && (
                  <span aria-hidden="true" className="text-slate-400">
                    ·
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => updateParams({ q: topic.query })}
                  className="font-medium text-slate-800 hover:text-[#0d7a78] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {topic.label}
                </button>
              </React.Fragment>
            ))}
          </div>
        </header>

        {/* Organization & Resource Type Filter Controls */}
        <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Organization Segmented Filter */}
            <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start">
              {orgOptions.map((opt) => {
                const isSelected = activeOrg === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => updateParams({ org: opt.id })}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <p className="text-xs font-mono tabular-nums text-slate-600">
              Showing {results.length} {results.length === 1 ? 'entry' : 'entries'}
              {query.trim() ? ` for "${query.trim()}"` : ' across the portal'}
            </p>
          </div>

          {/* Category Filter Bar */}
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-1.5">
            {typeOptions.map((tab) => {
              const isSelected = activeType === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => updateParams({ type: tab.id })}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isSelected
                      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1.5 font-mono tabular-nums text-[11px] ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    ({tab.count})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Results Grid */}
        {results.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {results.map((item) => {
              const isInstitute = item.organization === 'institute';
              const isHostel = item.organization === 'hostel';

              const metaColor = isInstitute
                ? 'text-[#0d7a78]'
                : isHostel
                ? 'text-[#6e1e32]'
                : 'text-slate-600';
              const headingColor = isInstitute
                ? 'text-[#0b3b60]'
                : isHostel
                ? 'text-[#0f2342]'
                : 'text-slate-900';
              const primaryBtnClass = isInstitute
                ? 'bg-[#0d7a78] hover:bg-[#0a6361] text-white'
                : isHostel
                ? 'bg-[#0f2342] hover:bg-[#193560] text-white'
                : 'bg-slate-900 hover:bg-slate-800 text-white';

              return (
                <article
                  key={item.id}
                  className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-2.5">
                    <p className={`text-xs font-medium ${metaColor}`}>
                      <span>{item.organizationLabel}</span>
                      <span aria-hidden="true"> · </span>
                      <span>{item.categoryLabel}</span>
                    </p>

                    <h2 className={`font-display text-xl font-semibold ${headingColor}`}>
                      {item.title}
                    </h2>

                    <p className="text-xs text-slate-500">{item.subtitle}</p>

                    <p className="text-sm text-slate-600 leading-relaxed pt-1">
                      {item.description}
                    </p>

                    {item.matchedDetail && (
                      <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                        Matched detail: {item.matchedDetail}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
                    <Link
                      to={item.href}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${primaryBtnClass}`}
                    >
                      <span>View on Page</span>
                      <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                    </Link>

                    {item.secondaryActionHref && item.secondaryActionLabel && (
                      <Link
                        to={item.secondaryActionHref}
                        className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        {item.secondaryActionLabel}
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-stone-200 rounded-2xl p-10 text-center space-y-4">
            <h2 className="font-display text-2xl font-semibold text-slate-900">
              No Courses or Facilities Matched Your Search
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
              We could not find an entry matching &ldquo;{query.trim()}&rdquo; under the selected filters. Reset your filters below or browse all medical courses and hostel facilities directly.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => updateParams({ q: '', org: 'all', type: 'all' })}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0 cursor-pointer"
              >
                Reset Search &amp; Filters
              </button>
              <Link
                to="/paramedical-institute/courses"
                className="px-5 py-2.5 text-xs font-semibold text-[#0b3b60] bg-[#f4f9fa] border border-slate-300 rounded-lg whitespace-nowrap shrink-0"
              >
                Browse Medical Courses
              </Link>
              <Link
                to="/girls-hostel/facilities"
                className="px-5 py-2.5 text-xs font-semibold text-[#0f2342] bg-[#fbf8f1] border border-stone-300 rounded-lg whitespace-nowrap shrink-0"
              >
                Browse Hostel Facilities
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
