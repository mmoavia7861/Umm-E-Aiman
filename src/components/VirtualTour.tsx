import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Expand,
  Info,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { GalleryItem } from '../data/organizationData';
import { classificationLabel, SmartMedia } from './HostelInfoPlate';
import {
  buildVirtualTourStops,
  formatStopCounter,
  getAdjacentStopIndex,
  getTourCategories,
} from '../utils/virtualTour';

export interface VirtualTourProps {
  items: GalleryItem[];
  theme: 'hostel' | 'institute';
}

export function VirtualTour({ items, theme }: VirtualTourProps) {
  const categories = useMemo(() => getTourCategories(items), [items]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(true);

  const stops = useMemo(
    () => buildVirtualTourStops(items, activeCategory),
    [items, activeCategory]
  );

  const isOpen = activeIndex !== null && activeIndex >= 0 && activeIndex < stops.length;
  const activeStop = isOpen ? stops[activeIndex] : null;

  const openStop = useCallback((index: number) => {
    setActiveIndex(index);
    setZoomed(false);
  }, []);

  const closeModal = useCallback(() => {
    setActiveIndex(null);
    setZoomed(false);
  }, []);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null) return null;
      return getAdjacentStopIndex(prev, stops.length, 'next');
    });
    setZoomed(false);
  }, [stops.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => {
      if (prev === null) return null;
      return getAdjacentStopIndex(prev, stops.length, 'prev');
    });
    setZoomed(false);
  }, [stops.length]);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setActiveIndex(null);
    setZoomed(false);
  };

  // Lock body scroll and wire keyboard navigation while full-screen modal is open
  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeModal();
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        goNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        goPrev();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, closeModal, goNext, goPrev]);

  const isHostel = theme === 'hostel';

  const activeTabCls = isHostel
    ? 'bg-[#0f2342] text-white shadow-xs'
    : 'bg-[#0b3b60] text-white shadow-xs';

  const launchBtnCls = isHostel
    ? 'bg-[#0f2342] hover:bg-[#193561] text-white'
    : 'bg-[#0d7a78] hover:bg-[#0a6361] text-white';

  const modalPrimaryCtaCls = isHostel
    ? 'bg-[#b4832e] hover:bg-[#9c7024] text-white'
    : 'bg-[#0d7a78] hover:bg-[#0a6361] text-white';

  const accentTextCls = isHostel ? 'text-[#e2be78]' : 'text-[#5eead4]';
  const activeThumbRingCls = isHostel
    ? 'ring-2 ring-[#e2be78] border-transparent opacity-100'
    : 'ring-2 ring-[#5eead4] border-transparent opacity-100';

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-display text-base font-semibold text-slate-900">
          No Virtual Tour Stops Available Yet
        </p>
        <p className="text-xs text-slate-600 mt-1.5">
          Administrators can publish verified visuals from the Admin Portal to populate this tour.
        </p>
      </div>
    );
  }

  return (
    <section aria-label="Interactive Virtual Tour" className="space-y-8">
      {/* Interactive Tour Control Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200/80">
        <div
          role="group"
          aria-label="Filter virtual tour stops by category"
          className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white/90 border border-slate-200 rounded-xl w-fit"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => handleCategoryChange(cat)}
              aria-pressed={activeCategory === cat}
              className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeCategory === cat ? activeTabCls : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between lg:justify-end gap-4">
          <p className="text-xs text-slate-600">
            <span className="font-mono tabular-nums font-semibold text-slate-900">
              {String(stops.length).padStart(2, '0')}
            </span>{' '}
            <span>{stops.length === 1 ? 'Tour Stop' : 'Tour Stops'}</span>
            <span aria-hidden="true"> · </span>
            <span>Click any image for full-screen view</span>
          </p>

          {stops.length > 0 && (
            <button
              type="button"
              onClick={() => openStop(0)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${launchBtnCls}`}
            >
              <Compass className="w-4 h-4" aria-hidden="true" />
              <span>Start Guided Virtual Tour</span>
            </button>
          )}
        </div>
      </div>

      {/* Responsive Editorial Bento / Tour Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {stops.map((stop) => {
          const spanCls = stop.isFeaturedTile ? 'md:col-span-2' : 'col-span-1';
          const mediaHeightCls = 'h-60 sm:h-72';

          return (
            <article
              key={stop.id}
              className={`${spanCls} bg-white border ${
                isHostel ? 'border-stone-200' : 'border-slate-200'
              } rounded-2xl overflow-hidden flex flex-col justify-between transition-colors hover:border-slate-300`}
            >
              <div>
                {/* Clickable Image / Media Trigger opening Full-Screen Modal */}
                <button
                  type="button"
                  onClick={() => openStop(stop.index)}
                  aria-label={`Open full-screen virtual tour for Stop ${stop.stopNumber}: ${stop.title}`}
                  className={`relative block w-full text-left overflow-hidden cursor-pointer group focus-visible:outline-2 focus-visible:outline-offset-2 ${
                    isHostel ? 'focus-visible:outline-[#0f2342]' : 'focus-visible:outline-[#0d7a78]'
                  } ${stop.isPlate ? '' : `${mediaHeightCls} bg-slate-900`}`}
                >
                  <SmartMedia
                    src={stop.mediaUrl}
                    alt={stop.title}
                    className={
                      stop.isPlate
                        ? 'w-full h-full'
                        : 'w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]'
                    }
                  />

                  {!stop.isPlate ? (
                    <>
                      <div
                        aria-hidden="true"
                        className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none"
                      />
                      <div className="absolute bottom-3.5 left-4 right-4 flex items-center justify-between gap-3 text-white pointer-events-none">
                        <span className="text-xs font-medium tracking-wide">
                          <span className="font-mono tabular-nums font-semibold">
                            Stop {stop.stopNumber}
                          </span>
                          <span aria-hidden="true"> · </span>
                          <span>{stop.category}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/55 backdrop-blur-xs text-[11px] font-medium text-white whitespace-nowrap shrink-0">
                          <Expand className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Full Screen</span>
                        </span>
                      </div>
                    </>
                  ) : (
                    <div className="px-6 py-2.5 bg-slate-900/95 text-white flex items-center justify-between text-xs">
                      <span className="font-mono tabular-nums">Stop {stop.stopNumber}</span>
                      <span className="inline-flex items-center gap-1.5 font-medium text-stone-200 whitespace-nowrap shrink-0">
                        <Expand className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Click for Full-Screen Tour</span>
                      </span>
                    </div>
                  )}
                </button>

                {/* Clean Unboxed Stop Metadata & Summary */}
                <div className="p-5 sm:p-6">
                  <p className="text-xs text-slate-500">
                    <span className="font-mono tabular-nums font-medium text-slate-700">
                      {stop.stopNumber}
                    </span>
                    <span aria-hidden="true"> · </span>
                    <span>{stop.category}</span>
                    <span aria-hidden="true"> · </span>
                    <span>{classificationLabel(stop.sourceClassification)}</span>
                  </p>
                  <h2 className="font-display text-base sm:text-lg font-semibold text-slate-900 mt-1.5">
                    {stop.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                    {stop.description}
                  </p>
                </div>
              </div>

              <div className="px-5 sm:px-6 pb-5 pt-1 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => openStop(stop.index)}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold hover:underline cursor-pointer whitespace-nowrap shrink-0 ${
                    isHostel ? 'text-[#0f2342]' : 'text-[#0b3b60]'
                  }`}
                >
                  <Expand className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Enter Full-Screen Stop</span>
                </button>
                <span className="text-[11px] text-slate-400 truncate">{stop.zoneLabel}</span>
              </div>
            </article>
          );
        })}
      </div>

      {/* Full-Screen Pop-Up Virtual Tour Modal */}
      {isOpen &&
        activeStop &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Virtual Tour Stop ${activeStop.stopNumber}: ${activeStop.title}`}
            className="fixed inset-0 z-[100] w-screen h-screen bg-[#060c17] text-white flex flex-col overflow-hidden"
          >
            {/* Top Full-Screen Bar */}
            <header className="px-4 sm:px-6 py-3.5 border-b border-white/10 bg-[#040810]/90 flex items-center justify-between gap-4 shrink-0">
              <div className="min-w-0">
                <p className="text-xs text-slate-300 truncate">
                  <span className={`font-mono tabular-nums font-semibold ${accentTextCls}`}>
                    Stop {formatStopCounter(activeStop.index, activeStop.totalStops)}
                  </span>
                  <span aria-hidden="true"> · </span>
                  <span>{activeStop.category}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{classificationLabel(activeStop.sourceClassification)}</span>
                </p>
                <h2 className="font-display text-sm sm:text-lg font-semibold text-white truncate mt-0.5">
                  {activeStop.title}
                </h2>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!activeStop.isPlate && (
                  <button
                    type="button"
                    onClick={() => setZoomed((z) => !z)}
                    aria-label={zoomed ? 'Reset image zoom' : 'Zoom in on tour image'}
                    aria-pressed={zoomed}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    {zoomed ? (
                      <ZoomOut className="w-4 h-4" aria-hidden="true" />
                    ) : (
                      <ZoomIn className="w-4 h-4" aria-hidden="true" />
                    )}
                    <span className="hidden sm:inline">{zoomed ? 'Reset 1x' : 'Zoom 1.75x'}</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setShowDetails((prev) => !prev)}
                  aria-expanded={showDetails}
                  aria-label={showDetails ? 'Hide stop details panel' : 'Show stop details panel'}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Info className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:inline">
                    {showDetails ? 'Hide Details' : 'Stop Details'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={closeModal}
                  aria-label="Close virtual tour"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white text-slate-950 hover:bg-slate-200 text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <X className="w-4 h-4" aria-hidden="true" />
                  <span>Close</span>
                </button>
              </div>
            </header>

            {/* Center Stage + Collapsible Tour Inspector */}
            <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
              {/* Unobstructed High-Resolution Media Stage */}
              <div className="flex-1 min-h-0 relative flex items-center justify-center overflow-auto px-4 sm:px-16 lg:px-20 py-4 sm:py-8 bg-[#050a14]">
                {stops.length > 1 && (
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous tour stop"
                    className="fixed lg:absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/75 hover:bg-black/95 border border-white/20 text-white transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}

                {activeStop.isPlate ? (
                  <div className="w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/15">
                    <SmartMedia src={activeStop.mediaUrl} alt={activeStop.title} />
                  </div>
                ) : (
                  <div
                    onClick={() => setZoomed((z) => !z)}
                    className={`transition-transform duration-200 ease-out ${
                      zoomed ? 'scale-[1.75] cursor-zoom-out' : 'scale-100 cursor-zoom-in'
                    }`}
                  >
                    <SmartMedia
                      src={activeStop.mediaUrl}
                      alt={activeStop.title}
                      className="max-h-[52vh] sm:max-h-[64vh] lg:max-h-[74vh] max-w-[88vw] lg:max-w-full w-auto object-contain rounded-xl shadow-2xl"
                    />
                  </div>
                )}

                {stops.length > 1 && (
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next tour stop"
                    className="fixed lg:absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 z-20 inline-flex items-center justify-center w-11 h-11 rounded-full bg-black/75 hover:bg-black/95 border border-white/20 text-white transition-colors cursor-pointer"
                  >
                    <ChevronRight className="w-5 h-5" aria-hidden="true" />
                  </button>
                )}
              </div>

              {/* Verified Tour Stop Inspector Panel */}
              {showDetails && (
                <aside
                  aria-label="Tour stop details"
                  className="w-full lg:w-[370px] xl:w-[400px] max-h-[34vh] lg:max-h-none overflow-y-auto border-t lg:border-t-0 lg:border-l border-white/10 bg-[#0a1324] p-5 sm:p-6 flex flex-col justify-between gap-6 shrink-0"
                >
                  <div className="space-y-4">
                    <div>
                      <p className={`text-xs font-medium tracking-wide ${accentTextCls}`}>
                        {activeStop.zoneLabel}
                      </p>
                      <h3 className="font-display text-base sm:text-lg font-semibold text-white mt-1">
                        {activeStop.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
                        {activeStop.description}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-white/10">
                      <p className="text-xs font-semibold text-white">Verified Stop Highlights</p>
                      <ol className="mt-3 space-y-2.5">
                        {activeStop.highlights.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-300 leading-relaxed">
                            <span
                              className={`font-mono tabular-nums font-semibold shrink-0 mt-0.5 ${accentTextCls}`}
                            >
                              {String(idx + 1).padStart(2, '0')}.
                            </span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <p className="text-[11px] text-slate-400">
                      Source Classification: {classificationLabel(activeStop.sourceClassification)}
                    </p>
                    <div className="flex flex-wrap items-center gap-2.5">
                      {isHostel ? (
                        <>
                          <Link
                            to="/girls-hostel/booking"
                            onClick={closeModal}
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${modalPrimaryCtaCls}`}
                          >
                            <span>Book Your Room</span>
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </Link>
                          <Link
                            to="/girls-hostel/rooms-pricing"
                            onClick={closeModal}
                            className="inline-flex items-center px-3.5 py-2.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-white transition-colors whitespace-nowrap shrink-0"
                          >
                            Rooms &amp; Pricing
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link
                            to="/paramedical-institute/admissions"
                            onClick={closeModal}
                            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${modalPrimaryCtaCls}`}
                          >
                            <span>Apply for Admission</span>
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </Link>
                          <Link
                            to="/paramedical-institute/courses"
                            onClick={closeModal}
                            className="inline-flex items-center px-3.5 py-2.5 rounded-xl text-xs font-medium bg-white/10 hover:bg-white/15 text-white transition-colors whitespace-nowrap shrink-0"
                          >
                            Explore Courses
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </aside>
              )}
            </div>

            {/* Bottom Filmstrip Stop Selector */}
            <footer
              aria-label="Virtual tour stops filmstrip"
              className="px-4 sm:px-6 py-3 border-t border-white/10 bg-[#040810]/95 shrink-0"
            >
              <div className="flex items-center gap-2.5 overflow-x-auto pb-0.5">
                {stops.map((stop) => {
                  const selected = stop.index === activeStop.index;
                  return (
                    <button
                      key={stop.id}
                      type="button"
                      onClick={() => openStop(stop.index)}
                      aria-label={`Jump to Stop ${stop.stopNumber}: ${stop.title}`}
                      aria-current={selected ? 'step' : undefined}
                      className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border transition-all shrink-0 cursor-pointer text-left ${
                        selected
                          ? `${activeThumbRingCls} bg-white/15`
                          : 'border-white/10 bg-white/5 opacity-75 hover:opacity-100 hover:bg-white/10'
                      }`}
                    >
                      {!stop.isPlate ? (
                        <div className="w-12 h-8 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                          <SmartMedia
                            src={stop.mediaUrl}
                            alt={stop.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-9 h-8 rounded-lg flex items-center justify-center font-mono tabular-nums text-xs font-semibold shrink-0 ${
                            isHostel ? 'bg-[#0f2342] text-[#e2be78]' : 'bg-[#0b3b60] text-[#5eead4]'
                          }`}
                        >
                          {stop.stopNumber}
                        </div>
                      )}
                      <div className="max-w-[140px]">
                        <p className="font-mono tabular-nums text-[10px] text-slate-400">
                          Stop {stop.stopNumber}
                        </p>
                        <p className="text-xs font-medium text-white truncate">{stop.title}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </footer>
          </div>,
          document.body
        )}
    </section>
  );
}
