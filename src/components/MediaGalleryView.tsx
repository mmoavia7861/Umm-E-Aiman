import { useRef, useState } from 'react';
import { Maximize2, Minimize2, Pause, Play, Volume2, VolumeX, X, ZoomIn, ZoomOut } from 'lucide-react';
import { GalleryItem, INSTITUTE_CONTACT } from '../data/organizationData';
import { classificationLabel, SmartMedia } from './HostelInfoPlate';

export function PromoVideoSection({
  videoUrl = INSTITUTE_CONTACT.promotionalVideoUrl,
  posterUrl = INSTITUTE_CONTACT.promotionalVideoPoster,
  summary = INSTITUTE_CONTACT.promotionalVideoSummary,
}: {
  videoUrl?: string;
  posterUrl?: string;
  summary?: string;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      v.play();
      setIsPlaying(true);
    } else {
      v.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setIsMuted(v.muted);
  };

  const enterFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) {
      v.requestFullscreen();
    }
  };

  return (
    <section className="py-16 bg-white border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 space-y-4">
            <p className="text-xs text-[#0d7a78] font-medium">
              Official Campus Presentation · Bhowana, District Chiniot
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#0b3b60]">
              Discover Umm-e-Aiman Paramedical Institute
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">{summary}</p>
            <div className="pt-2 space-y-2 text-xs text-slate-500 border-t border-slate-200">
              <p>
                <span className="font-semibold text-slate-800">Audio Language:</span> Urdu narration with English summary provided alongside the player.
              </p>
              <p>
                <span className="font-semibold text-slate-800">Visual Transparency:</span> Includes actual laboratory and campus office footage (0:00–0:13, 0:33–0:35, 0:43–0:45) alongside illustrative healthcare role visuals.
              </p>
            </div>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-950 shadow-sm">
              <video
                ref={videoRef}
                src={videoUrl}
                poster={posterUrl}
                controls
                preload="metadata"
                playsInline
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="w-full aspect-video object-contain bg-black"
              >
                Your browser does not support HTML5 video playback.
              </video>

              <div className="px-4 py-3 bg-[#072842] text-white flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    aria-label={isPlaying ? 'Pause institute video' : 'Play institute video'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play Video'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? 'Unmute video audio' : 'Mute video audio'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
                  >
                    {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                    <span>{isMuted ? 'Unmute' : 'Mute'}</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={enterFullscreen}
                  aria-label="Open video in fullscreen"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-medium transition-colors"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Full Screen</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function MediaGalleryView({
  items,
  theme = 'institute',
}: {
  items: GalleryItem[];
  theme?: 'hostel' | 'institute';
}) {
  const categories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const filtered = activeCategory === 'All' ? items : items.filter((i) => i.category === activeCategory);

  const activeBtnCls =
    theme === 'hostel'
      ? 'bg-[#0f2342] text-white shadow-xs'
      : 'bg-[#0b3b60] text-white shadow-xs';

  return (
    <div>
      {/* Segmented Interactive Category Filter */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-100 rounded-xl w-fit mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3.5 py-2 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeCategory === cat ? activeBtnCls : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Responsive Media Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between group"
          >
            <div>
              <div className="aspect-[16/10] overflow-hidden bg-slate-100 relative">
                <SmartMedia
                  src={item.mediaUrl}
                  alt={item.title}
                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-5">
                <p className="text-xs text-slate-500">
                  <span>{item.category}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{classificationLabel(item.sourceClassification)}</span>
                </p>
                <h3 className="font-display text-base font-semibold text-slate-900 mt-1.5">{item.title}</h3>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{item.description}</p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <button
                type="button"
                onClick={() => {
                  setSelectedItem(item);
                  setZoomed(false);
                }}
                aria-label={`Inspect ${item.title} in lightbox`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:underline"
              >
                <ZoomIn className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Inspect Full View</span>
              </button>
            </div>
          </article>
        ))}
      </div>

      {/* Lightbox Modal with Zoom */}
      {selectedItem && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedItem.title}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 truncate">
                  {selectedItem.category} · {classificationLabel(selectedItem.sourceClassification)}
                </p>
                <h3 className="font-display text-base font-semibold text-slate-900 truncate">{selectedItem.title}</h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!selectedItem.mediaUrl.startsWith('plate:') && (
                  <button
                    type="button"
                    onClick={() => setZoomed((z) => !z)}
                    aria-label={zoomed ? 'Zoom out image' : 'Zoom in image'}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-800"
                  >
                    {zoomed ? <ZoomOut className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5 hidden" />}
                    {!zoomed && <ZoomIn className="w-3.5 h-3.5" />}
                    <span>{zoomed ? 'Reset Zoom' : 'Zoom 1.6x'}</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  aria-label="Close lightbox"
                  className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4 min-h-[320px]">
              <div className={`transition-transform duration-200 ${zoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'}`}>
                <SmartMedia
                  src={selectedItem.mediaUrl}
                  alt={selectedItem.title}
                  className="max-h-[65vh] w-auto object-contain rounded"
                />
              </div>
            </div>

            <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-700 leading-relaxed">
              {selectedItem.description}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
