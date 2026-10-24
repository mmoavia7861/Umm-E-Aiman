import React, { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  buildPortalSearchIndex,
  getSearchCategoryCounts,
  PORTAL_QUICK_SEARCHES,
  PortalSearchCategory,
  PortalSearchItem,
  searchPortalIndex,
} from '../utils/portalSearch';

interface PortalSearchBarProps {
  variant?: 'hero' | 'utility';
  theme?: 'neutral' | 'hostel' | 'institute';
  onResultSelect?: () => void;
}

export function PortalSearchBar({
  variant = 'utility',
  theme = 'neutral',
  onResultSelect,
}: PortalSearchBarProps) {
  const navigate = useNavigate();
  const inputId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { courses, hostelPricing, hostelSettings } = useApp();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<'all' | PortalSearchCategory>('all');
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const searchIndex = useMemo(
    () =>
      buildPortalSearchIndex({
        courses,
        hostelPricing,
        hostelRules: hostelSettings.rulesList,
      }),
    [courses, hostelPricing, hostelSettings.rulesList]
  );

  const trimmedQuery = query.trim();

  const counts = useMemo(
    () => getSearchCategoryCounts(searchIndex, trimmedQuery, 'all'),
    [searchIndex, trimmedQuery]
  );

  const results = useMemo(
    () =>
      trimmedQuery
        ? searchPortalIndex(searchIndex, trimmedQuery, {
            category: activeCategory,
            limit: 7,
          })
        : [],
    [searchIndex, trimmedQuery, activeCategory]
  );

  useEffect(() => {
    setActiveIndex(-1);
  }, [trimmedQuery, activeCategory]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Global "/" shortcut for utility bar (or hero bar on homepage) when not typing inside a form field
  useEffect(() => {
    const handleGlobalShortcut = (e: KeyboardEvent) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }
      if (!inputRef.current || inputRef.current.offsetParent === null) return;
      e.preventDefault();
      inputRef.current.focus();
      setOpen(true);
    };
    window.addEventListener('keydown', handleGlobalShortcut);
    return () => window.removeEventListener('keydown', handleGlobalShortcut);
  }, []);

  const handleSelectResult = (item: PortalSearchItem) => {
    setOpen(false);
    onResultSelect?.();
    navigate(item.href);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeIndex >= 0 && activeIndex < results.length) {
      handleSelectResult(results[activeIndex]);
      return;
    }
    setOpen(false);
    onResultSelect?.();
    const params = new URLSearchParams();
    if (trimmedQuery) params.set('q', trimmedQuery);
    if (activeCategory !== 'all') params.set('type', activeCategory);
    if (theme === 'hostel' && !trimmedQuery) params.set('org', 'hostel');
    if (theme === 'institute' && !trimmedQuery) params.set('org', 'institute');
    const qs = params.toString();
    navigate(qs ? `/search?${qs}` : '/search');
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (!open || results.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev <= 0 ? results.length - 1 : prev - 1));
    }
  };

  const categoryTabs: { id: 'all' | PortalSearchCategory; label: string; count: number }[] = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'course', label: 'Courses', count: counts.course },
    { id: 'facility', label: 'Facilities', count: counts.facility },
    { id: 'pricing', label: 'Rooms & Tariff', count: counts.pricing },
  ];

  const isHero = variant === 'hero';

  const submitBtnClass =
    theme === 'hostel'
      ? 'bg-[#0f2342] hover:bg-[#193560] text-white'
      : theme === 'institute'
      ? 'bg-[#0d7a78] hover:bg-[#0a6361] text-white'
      : isHero
      ? 'bg-[#0d7a78] hover:bg-[#0f8f8c] text-white'
      : 'bg-slate-900 hover:bg-slate-800 text-white';

  const showDropdown = open && trimmedQuery.length > 0;

  return (
    <div
      ref={containerRef}
      className={isHero ? 'relative w-full max-w-3xl mt-8' : 'relative w-full sm:w-80 lg:w-96'}
    >
      <form role="search" onSubmit={handleFormSubmit} className="relative">
        <label htmlFor={inputId} className="sr-only">
          Search medical courses, campus laboratories, hostel facilities, and room options
        </label>

        <div
          className={
            isHero
              ? 'flex items-center bg-white rounded-xl border border-slate-300 shadow-lg p-1.5 focus-within:ring-2 focus-within:ring-[#5ec2bf]'
              : 'flex items-center bg-white rounded-lg border border-slate-300 px-3 py-1.5 focus-within:border-slate-500 transition-colors'
          }
        >
          <Search
            className={
              isHero
                ? 'w-5 h-5 text-slate-400 ml-2.5 shrink-0'
                : 'w-4 h-4 text-slate-400 shrink-0'
            }
            aria-hidden="true"
          />

          <input
            ref={inputRef}
            id={inputId}
            type="search"
            value={query}
            onFocus={() => setOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onKeyDown={handleInputKeyDown}
            placeholder={
              isHero
                ? 'Search courses (MLT, Pharmacy Tech) or facilities (Lab, CCTV, Wi-Fi)...'
                : 'Search courses & facilities...'
            }
            autoComplete="off"
            className={
              isHero
                ? 'w-full px-3 py-2 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none'
                : 'w-full px-2.5 py-0.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none'
            }
          />

          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setActiveCategory('all');
                inputRef.current?.focus();
              }}
              aria-label="Clear search query"
              className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors shrink-0 cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden="true" />
            </button>
          )}

          {isHero ? (
            <button
              type="submit"
              className={`ml-1.5 inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${submitBtnClass}`}
            >
              <span>Search Portal</span>
              <ArrowRight className="w-4 h-4 hidden sm:inline" aria-hidden="true" />
            </button>
          ) : (
            <button
              type="submit"
              className={`ml-1 px-2.5 py-1 text-[11px] font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${submitBtnClass}`}
            >
              Search
            </button>
          )}
        </div>
      </form>

      {/* Quick Search Topics on Central Homepage Hero */}
      {isHero && (
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1.5 text-xs text-slate-300">
          <span className="text-slate-400">Quick search:</span>
          {PORTAL_QUICK_SEARCHES.map((topic, index) => (
            <React.Fragment key={topic.label}>
              {index > 0 && (
                <span aria-hidden="true" className="text-slate-600">
                  ·
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setQuery(topic.query);
                  setActiveCategory('all');
                  setOpen(true);
                  inputRef.current?.focus();
                }}
                className="text-slate-200 hover:text-white hover:underline transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {topic.label}
              </button>
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Instant Live Results Panel */}
      {showDropdown && (
        <div
          role="region"
          aria-label="Portal search results"
          className={`absolute z-50 mt-2 bg-white text-slate-900 border border-slate-200 rounded-2xl shadow-xl overflow-hidden ${
            isHero ? 'left-0 right-0' : 'left-0 sm:left-auto right-0 w-full sm:w-[30rem]'
          }`}
        >
          {/* Interactive Category Filter Segmented Controls */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Filter search results">
              {categoryTabs.map((tab) => {
                const isActive = activeCategory === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveCategory(tab.id)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1 font-mono tabular-nums text-[11px] text-slate-500">
                      ({tab.count})
                    </span>
                  </button>
                );
              })}
            </div>

            <span className="text-[11px] font-mono tabular-nums text-slate-500 whitespace-nowrap">
              {counts.all} {counts.all === 1 ? 'match' : 'matches'}
            </span>
          </div>

          {/* Matched Results List */}
          {results.length > 0 ? (
            <ul className="divide-y divide-slate-100 max-h-[22rem] overflow-y-auto">
              {results.map((item, idx) => {
                const isHighlighted = idx === activeIndex;
                const orgAccent =
                  item.organization === 'institute'
                    ? 'text-[#0d7a78]'
                    : item.organization === 'hostel'
                    ? 'text-[#6e1e32]'
                    : 'text-slate-600';
                const titleColor =
                  item.organization === 'institute'
                    ? 'text-[#0b3b60]'
                    : item.organization === 'hostel'
                    ? 'text-[#0f2342]'
                    : 'text-slate-900';

                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => handleSelectResult(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full text-left px-4 py-3.5 transition-colors flex items-start justify-between gap-3 cursor-pointer ${
                        isHighlighted ? 'bg-slate-50' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <div className="min-w-0 space-y-1">
                        <p className={`text-[11px] font-medium ${orgAccent}`}>
                          <span>{item.organizationLabel}</span>
                          <span aria-hidden="true"> · </span>
                          <span>{item.categoryLabel}</span>
                        </p>
                        <p className={`font-display text-sm sm:text-base font-semibold ${titleColor}`}>
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>
                        {item.matchedDetail && (
                          <p className="text-[11px] text-slate-500 truncate">
                            Includes: {item.matchedDetail}
                          </p>
                        )}
                      </div>
                      <ArrowRight
                        className="w-4 h-4 text-slate-400 shrink-0 mt-1"
                        aria-hidden="true"
                      />
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <div className="px-5 py-8 text-center space-y-2">
              <p className="text-sm font-semibold text-slate-900">
                No matching courses or facilities found for &ldquo;{trimmedQuery}&rdquo;
              </p>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Try searching for a diploma code (MLT, OTT, RIT, LHV), campus equipment (microscope, pharmacy lab), or hostel amenity (CCTV, Wi-Fi, geyser).
              </p>
              {activeCategory !== 'all' && counts.all > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveCategory('all')}
                  className="mt-1 inline-flex items-center px-3 py-1.5 text-xs font-semibold text-[#0d7a78] hover:underline cursor-pointer"
                >
                  Show all {counts.all} matches across other categories
                </button>
              )}
            </div>
          )}

          {/* Dropdown Footer Link to Full Search Directory */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 hidden sm:inline">
              Separate listings for Bhowana Institute &amp; Jhang Hostel
            </span>
            <Link
              to={`/search?q=${encodeURIComponent(trimmedQuery)}${
                activeCategory !== 'all' ? `&type=${activeCategory}` : ''
              }`}
              onClick={() => {
                setOpen(false);
                onResultSelect?.();
              }}
              className="font-semibold text-slate-900 hover:underline inline-flex items-center gap-1 whitespace-nowrap ml-auto"
            >
              <span>View full search directory ({counts.all})</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
