import React, { useState } from 'react';
import { Download, Film, ImagePlus, Loader2, Upload, Wand2 } from 'lucide-react';

interface PresetFrame {
  id: string;
  label: string;
  org: string;
  src: string;
  suggestedVideoPrompt: string;
  suggestedEditPrompt: string;
}

const PRESET_CAMPUS_FRAMES: PresetFrame[] = [
  {
    id: 'lab-session',
    label: 'Medical Laboratory Practical Session',
    org: 'Paramedical Institute · Bhowana',
    src: '/assets/extracted/institute-lab-session.jpg',
    suggestedVideoPrompt:
      'Gentle, steady documentary camera movement across the medical laboratory bench with microscopes and soft natural classroom lighting.',
    suggestedEditPrompt:
      'Enhance lighting clarity and balance warm daylight across this paramedical laboratory training photograph while keeping all clinical equipment realistic.',
  },
  {
    id: 'signboard',
    label: 'Institute Outdoor Signboard',
    org: 'Paramedical Institute · Bhowana',
    src: '/assets/extracted/institute-signboard.jpg',
    suggestedVideoPrompt:
      'Subtle cinematic push-in toward the Umm-e-Aiman Paramedical Institute signboard under clear afternoon sky.',
    suggestedEditPrompt:
      'Cleanly balance contrast and sky tones around the outdoor campus signboard while preserving text legibility.',
  },
  {
    id: 'admin-office',
    label: 'Campus Administration Office',
    org: 'Paramedical Institute · Bhowana',
    src: '/assets/extracted/institute-admin-office.jpg',
    suggestedVideoPrompt:
      'Smooth, calm pan across the admissions and administration office interior with natural indoor illumination.',
    suggestedEditPrompt:
      'Adjust indoor white balance and crispness for an inviting admissions office photograph.',
  },
  {
    id: 'corridor',
    label: 'Campus Corridor & Standee',
    org: 'Paramedical Institute · Bhowana',
    src: '/assets/extracted/institute-campus-corridor.jpg',
    suggestedVideoPrompt:
      'Steady forward walk-through perspective along the clean academic corridor with soft daylight.',
    suggestedEditPrompt:
      'Brighten corridor shadows subtly while maintaining authentic architectural details.',
  },
];

async function fileToDataUrl(file: File): Promise<{ dataUrl: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        dataUrl: String(reader.result || ''),
        mimeType: file.type || 'image/jpeg',
      });
    };
    reader.onerror = () => reject(new Error('Unable to read the selected image file.'));
    reader.readAsDataURL(file);
  });
}

async function urlToDataUrl(url: string): Promise<{ dataUrl: string; mimeType: string }> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Could not load preset campus photograph.');
  }
  const blob = await response.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        dataUrl: String(reader.result || ''),
        mimeType: blob.type || 'image/jpeg',
      });
    };
    reader.onerror = () => reject(new Error('Could not encode campus photograph.'));
    reader.readAsDataURL(blob);
  });
}

export function MediaStudioPage() {
  const [activeTab, setActiveTab] = useState<'video' | 'image'>('video');

  // --- Video Animation State ---
  const [videoSourcePreview, setVideoSourcePreview] = useState<string>(PRESET_CAMPUS_FRAMES[0].src);
  const [videoSourceDataUrl, setVideoSourceDataUrl] = useState<string | null>(null);
  const [videoSourceMime, setVideoSourceMime] = useState<string>('image/jpeg');
  const [videoSourceLabel, setVideoSourceLabel] = useState<string>(PRESET_CAMPUS_FRAMES[0].label);
  const [videoAspectRatio, setVideoAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [videoPrompt, setVideoPrompt] = useState<string>(PRESET_CAMPUS_FRAMES[0].suggestedVideoPrompt);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);

  // --- Image Studio State ---
  const [imageMode, setImageMode] = useState<'create' | 'edit'>('create');
  const [imageSourcePreview, setImageSourcePreview] = useState<string | null>(null);
  const [imageSourceDataUrl, setImageSourceDataUrl] = useState<string | null>(null);
  const [imageSourceMime, setImageSourceMime] = useState<string>('image/jpeg');
  const [imageAspectRatio, setImageAspectRatio] = useState<'16:9' | '4:3' | '1:1' | '3:4' | '9:16'>('16:9');
  const [imagePrompt, setImagePrompt] = useState<string>(
    'Clean architectural editorial illustration of a serene, sunlit female student study lounge with warm cream walls, navy blue accents, bookshelves, and peaceful desks in Punjab, Pakistan.'
  );
  const [imageLoading, setImageLoading] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generatedImageNote, setGeneratedImageNote] = useState<string>('');

  const handleSelectVideoPreset = (preset: PresetFrame) => {
    setVideoSourcePreview(preset.src);
    setVideoSourceDataUrl(null);
    setVideoSourceMime('image/jpeg');
    setVideoSourceLabel(preset.label);
    setVideoPrompt(preset.suggestedVideoPrompt);
    setVideoError(null);
  };

  const handleVideoFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setVideoError('Please select a valid JPG, PNG, or WebP photograph.');
      return;
    }
    try {
      const encoded = await fileToDataUrl(file);
      setVideoSourcePreview(encoded.dataUrl);
      setVideoSourceDataUrl(encoded.dataUrl);
      setVideoSourceMime(encoded.mimeType);
      setVideoSourceLabel(file.name);
      setVideoError(null);
    } catch (err) {
      setVideoError(err instanceof Error ? err.message : 'Could not read image.');
    }
  };

  const handleAnimateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoError(null);
    setGeneratedVideoUrl(null);
    setVideoLoading(true);

    try {
      let base64Payload = videoSourceDataUrl;
      let mime = videoSourceMime;
      if (!base64Payload) {
        const loaded = await urlToDataUrl(videoSourcePreview);
        base64Payload = loaded.dataUrl;
        mime = loaded.mimeType;
      }

      const res = await fetch('/api/ai/animate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType: mime,
          prompt: videoPrompt.trim(),
          aspectRatio: videoAspectRatio,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to generate animated video at this time.');
      }
      setGeneratedVideoUrl(data.videoUrl);
    } catch (err) {
      setVideoError(
        err instanceof Error
          ? err.message
          : 'Unable to animate photograph. Verify that a billing-enabled API key is configured in Settings > Secrets.'
      );
    } finally {
      setVideoLoading(false);
    }
  };

  const handleImageFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      setImageError('Please select a valid image file (JPG, PNG, or WebP).');
      return;
    }
    try {
      const encoded = await fileToDataUrl(file);
      setImageSourcePreview(encoded.dataUrl);
      setImageSourceDataUrl(encoded.dataUrl);
      setImageSourceMime(encoded.mimeType);
      setImageMode('edit');
      setImageError(null);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Could not load image.');
    }
  };

  const handleLoadPresetForEdit = async (preset: PresetFrame) => {
    try {
      const encoded = await urlToDataUrl(preset.src);
      setImageSourcePreview(preset.src);
      setImageSourceDataUrl(encoded.dataUrl);
      setImageSourceMime(encoded.mimeType);
      setImageMode('edit');
      setImagePrompt(preset.suggestedEditPrompt);
      setImageError(null);
    } catch (err) {
      setImageError(err instanceof Error ? err.message : 'Could not load preset image.');
    }
  };

  const handleGenerateOrEditImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageError(null);
    setGeneratedImageUrl(null);
    setGeneratedImageNote('');

    if (imagePrompt.trim().length < 3) {
      setImageError('Please enter a clear visual description or editing instruction.');
      return;
    }

    setImageLoading(true);
    try {
      const res = await fetch('/api/ai/image-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt.trim(),
          imageBase64: imageMode === 'edit' ? imageSourceDataUrl : undefined,
          mimeType: imageMode === 'edit' ? imageSourceMime : undefined,
          aspectRatio: imageAspectRatio,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Unable to generate visual.');
      }
      setGeneratedImageUrl(data.imageUrl);
      setGeneratedImageNote(data.note || '');
    } catch (err) {
      setImageError(
        err instanceof Error
          ? err.message
          : 'Unable to generate image. Verify your API key configuration in Settings > Secrets.'
      );
    } finally {
      setImageLoading(false);
    }
  };

  return (
    <div className="py-14 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <header className="max-w-3xl">
          <p className="text-xs text-slate-500">Umm-e-Aiman Promotional Media Desk</p>
          <h1 className="font-display text-3xl sm:text-4xl font-semibold text-slate-900 mt-1.5">
            Promotional Visual &amp; Video Animation Studio
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-3 leading-relaxed">
            Animate real campus photographs into landscape (16:9) or mobile reel (9:16) promotional clips, or create and refine illustrative visuals for Umm-e-Aiman Girls Hostel and Umm-e-Aiman Paramedical Institute. Generated visuals are clearly marked as illustrative studio assets and never replace verified campus records without administrator review.
          </p>
        </header>

        {/* Functional Segmented Tool Switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-stone-200/80 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('video')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'video' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Film className="w-4 h-4" aria-hidden="true" />
            <span>Animate Photo to Video</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('image')}
            className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'image' ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <ImagePlus className="w-4 h-4" aria-hidden="true" />
            <span>Create &amp; Edit Visuals</span>
          </button>
        </div>

        {activeTab === 'video' ? (
          <section className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Controls */}
            <form
              onSubmit={handleAnimateVideo}
              className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6"
            >
              <div>
                <h2 className="font-display text-xl font-semibold text-slate-900">
                  1. Choose or Upload a Source Photograph
                </h2>
                <p className="text-xs text-slate-600 mt-1">
                  Select an authentic extracted campus frame below or upload your own Hostel or Institute photograph.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                {PRESET_CAMPUS_FRAMES.map((preset) => {
                  const selected = videoSourcePreview === preset.src && !videoSourceDataUrl;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectVideoPreset(preset)}
                      className={`text-left p-3 rounded-xl border transition-colors ${
                        selected
                          ? 'border-[#0d7a78] bg-[#f4f9fa]'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <p className="text-xs font-semibold text-slate-900 line-clamp-1">{preset.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{preset.org}</p>
                    </button>
                  );
                })}
              </div>

              <div>
                <label
                  htmlFor="video-photo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-stone-100 hover:bg-stone-200 border border-stone-300 rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" aria-hidden="true" />
                  <span>Upload Custom Photo (JPG / PNG / WebP)</span>
                </label>
                <input
                  id="video-photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) => handleVideoFileUpload(e.target.files)}
                  className="sr-only"
                />
                <p className="text-xs text-slate-500 mt-2">
                  Selected source: <span className="font-medium text-slate-800">{videoSourceLabel}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">
                  2. Output Video Aspect Ratio
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('16:9')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                      videoAspectRatio === '16:9'
                        ? 'bg-[#0b3b60] text-white border-[#0b3b60]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    16:9 Landscape Banner
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoAspectRatio('9:16')}
                    className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-colors whitespace-nowrap shrink-0 ${
                      videoAspectRatio === '9:16'
                        ? 'bg-[#0b3b60] text-white border-[#0b3b60]'
                        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    9:16 Portrait Story / Reel
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="video-motion-prompt" className="block text-xs font-semibold text-slate-800 mb-1">
                  3. Camera Motion &amp; Lighting Direction
                </label>
                <textarea
                  id="video-motion-prompt"
                  rows={3}
                  value={videoPrompt}
                  onChange={(e) => setVideoPrompt(e.target.value)}
                  placeholder="Describe gentle camera motion and natural lighting..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              {videoError && (
                <div role="alert" className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed">
                  {videoError}
                </div>
              )}

              <button
                type="submit"
                disabled={videoLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0d7a78] hover:bg-[#0a6361] rounded-lg transition-colors disabled:opacity-60"
              >
                {videoLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Generating 720p Animated Video (may take 30–60s)...</span>
                  </>
                ) : (
                  <>
                    <Film className="w-4 h-4" aria-hidden="true" />
                    <span>Animate Photo into {videoAspectRatio} Video</span>
                  </>
                )}
              </button>
            </form>

            {/* Right Preview Panel */}
            <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">Preview Stage</p>
                  <h2 className="font-display text-xl font-semibold text-slate-900">
                    {generatedVideoUrl ? 'Generated Animated Clip' : 'Source Photograph Preview'}
                  </h2>
                </div>
                {generatedVideoUrl && (
                  <a
                    href={generatedVideoUrl}
                    download={`ummeaiman-animated-${videoAspectRatio.replace(':', 'x')}.mp4`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Download MP4</span>
                  </a>
                )}
              </div>

              {generatedVideoUrl ? (
                <div
                  className={`mx-auto overflow-hidden rounded-xl border border-slate-200 bg-slate-950 ${
                    videoAspectRatio === '9:16' ? 'max-w-xs aspect-[9/16]' : 'w-full aspect-video'
                  }`}
                >
                  <video
                    src={generatedVideoUrl}
                    controls
                    autoPlay
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <img
                    src={videoSourcePreview}
                    alt={videoSourceLabel}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <p className="text-xs text-slate-500 leading-relaxed">
                Source distinction notice: Animated clips created in this studio are intended for social announcements and visual previews. Official facility claims must always match verified on-site features.
              </p>
            </div>
          </section>
        ) : (
          <section className="grid lg:grid-cols-12 gap-8 items-start">
            {/* Left Image Studio Form */}
            <form
              onSubmit={handleGenerateOrEditImage}
              className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-display text-xl font-semibold text-slate-900">
                    Promotional Image Generator &amp; Editor
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Create a new illustrative graphic from text or upload an existing photo to refine it.
                  </p>
                </div>

                <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                  <button
                    type="button"
                    onClick={() => {
                      setImageMode('create');
                      setImageSourcePreview(null);
                      setImageSourceDataUrl(null);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                      imageMode === 'create' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Create New
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageMode('edit')}
                    className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                      imageMode === 'edit' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                    }`}
                  >
                    Edit Photo
                  </button>
                </div>
              </div>

              {imageMode === 'edit' && (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <p className="text-xs font-semibold text-slate-800">Select Reference Photo to Edit</p>
                  <div className="flex flex-wrap gap-2">
                    <label
                      htmlFor="image-edit-upload"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-900 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Upload Photo</span>
                    </label>
                    <input
                      id="image-edit-upload"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={(e) => handleImageFileUpload(e.target.files)}
                      className="sr-only"
                    />
                    {PRESET_CAMPUS_FRAMES.slice(0, 2).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleLoadPresetForEdit(p)}
                        className="px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-lg"
                      >
                        Use {p.label.split(' ')[0]} Photo
                      </button>
                    ))}
                  </div>
                  {imageSourcePreview && (
                    <div className="w-40 aspect-video rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={imageSourcePreview}
                        alt="Selected base photo for editing"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-2">Aspect Ratio</label>
                <div className="flex flex-wrap gap-2">
                  {(['16:9', '4:3', '1:1', '3:4', '9:16'] as const).map((ratio) => (
                    <button
                      key={ratio}
                      type="button"
                      onClick={() => setImageAspectRatio(ratio)}
                      className={`px-3.5 py-1.5 text-xs font-mono font-semibold rounded-lg border whitespace-nowrap shrink-0 ${
                        imageAspectRatio === ratio
                          ? 'bg-slate-900 text-white border-slate-900'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="studio-image-prompt" className="block text-xs font-semibold text-slate-800 mb-1">
                  Visual Prompt or Editing Instruction *
                </label>
                <textarea
                  id="studio-image-prompt"
                  rows={4}
                  value={imagePrompt}
                  onChange={(e) => setImagePrompt(e.target.value)}
                  placeholder="Describe the educational or residential visual you want to create or edit..."
                  className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() =>
                      setImagePrompt(
                        'Editorial photograph-style illustration of a quiet, tidy female student study room in Jhang with warm cream tones, navy curtains, wooden study desks, and soft daylight.'
                      )
                    }
                    className="text-xs text-[#0f2342] hover:underline"
                  >
                    Hostel Study Room Prompt
                  </button>
                  <span aria-hidden="true" className="text-xs text-slate-300">·</span>
                  <button
                    type="button"
                    onClick={() =>
                      setImagePrompt(
                        'Clean educational illustration of an allied health sciences laboratory bench with binocular microscopes, glass test tubes, and medical blue clinical accents.'
                      )
                    }
                    className="text-xs text-[#0d7a78] hover:underline"
                  >
                    Medical Lab Prompt
                  </button>
                </div>
              </div>

              {imageError && (
                <div role="alert" className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 leading-relaxed">
                  {imageError}
                </div>
              )}

              <button
                type="submit"
                disabled={imageLoading}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#0f2342] hover:bg-[#193560] rounded-lg transition-colors disabled:opacity-60"
              >
                {imageLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                    <span>Rendering Studio Visual...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" aria-hidden="true" />
                    <span>{imageMode === 'edit' ? 'Apply Photo Edit' : 'Generate Promotional Visual'}</span>
                  </>
                )}
              </button>
            </form>

            {/* Right Image Output Stage */}
            <div className="lg:col-span-6 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 space-y-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs text-slate-500">Illustrative Studio Output</p>
                  <h2 className="font-display text-xl font-semibold text-slate-900">
                    Rendered Promotional Graphic
                  </h2>
                </div>
                {generatedImageUrl && (
                  <a
                    href={generatedImageUrl}
                    download={`ummeaiman-visual-${imageAspectRatio.replace(':', 'x')}.png`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg whitespace-nowrap shrink-0"
                  >
                    <Download className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>Download PNG</span>
                  </a>
                )}
              </div>

              {generatedImageUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={generatedImageUrl}
                    alt="Generated Umm-e-Aiman promotional studio visual"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto object-contain max-h-[520px] mx-auto"
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-xl border border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center p-8 text-center">
                  <ImagePlus className="w-8 h-8 text-slate-400 mb-2" aria-hidden="true" />
                  <p className="text-sm font-medium text-slate-700">No studio visual rendered yet</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">
                    Enter a prompt on the left and click Generate Promotional Visual to render a 1K graphic.
                  </p>
                </div>
              )}

              {generatedImageNote && (
                <p className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg p-3">
                  {generatedImageNote}
                </p>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
