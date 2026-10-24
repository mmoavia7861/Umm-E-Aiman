import React, { useState } from 'react';
import { Compass, ExternalLink, Loader2, LocateFixed, MapPin, Search } from 'lucide-react';

interface GroundedPlace {
  title: string;
  uri: string;
  reviewSnippets: string[];
}

export function LocationMapsExplorer({
  defaultQuery,
  organizationLabel,
  accentClass = 'bg-[#0f2342] hover:bg-[#193560]',
}: {
  defaultQuery: string;
  organizationLabel: string;
  accentClass?: string;
}) {
  const [queryText, setQueryText] = useState(defaultQuery);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; places: GroundedPlace[] } | null>(null);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      () => {
        setLocating(false);
        setError('Unable to read current location. You can still search nearby landmarks directly.');
      },
      { timeout: 8000 }
    );
  };

  const handleExplore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/ai/maps-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryText.trim(),
          latitude: coords?.lat,
          longitude: coords?.lng,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Could not retrieve Google Maps place data.');
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch Maps data.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <p className="text-xs text-slate-500">Live Google Maps Grounding · {organizationLabel}</p>
          <h3 className="font-display text-lg font-semibold text-slate-900 mt-0.5">
            Explore Nearby Landmarks, Transit &amp; Area Guide
          </h3>
        </div>
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={locating}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
        >
          <LocateFixed className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{locating ? 'Locating...' : coords ? 'Location Attached' : 'Use My Location'}</span>
        </button>
      </div>

      <form onSubmit={handleExplore} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor={`maps-query-${organizationLabel}`} className="sr-only">
          Ask about nearby colleges, hospitals, transit, or directions
        </label>
        <input
          id={`maps-query-${organizationLabel}`}
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Ask about nearby colleges, hospitals, or bus routes..."
          className="flex-1 px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
        <button
          type="submit"
          disabled={loading}
          className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60 ${accentClass}`}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Compass className="w-4 h-4" />}
          <span>{loading ? 'Checking Maps...' : 'Check Google Maps'}</span>
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 pt-4 border-t border-slate-200 space-y-4">
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.text}</div>

          {result.places.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-900 mb-2">Verified Google Maps Links</p>
              <ul className="grid sm:grid-cols-2 gap-2.5">
                {result.places.map((place, idx) => (
                  <li key={`${place.uri}-${idx}`} className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <a
                      href={place.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0b3b60] hover:underline"
                    >
                      <MapPin className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                      <span>{place.title}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                    </a>
                    {place.reviewSnippets.length > 0 && (
                      <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{place.reviewSnippets[0]}</p>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function HealthcareSearchExplorer() {
  const [queryText, setQueryText] = useState(
    'What are the career roles and regulatory bodies for Medical Laboratory Technology (MLT) and Pharmacy Technician diplomas in Punjab, Pakistan?'
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; sources: { title: string; uri: string }[] } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const resp = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: queryText.trim() }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data.error || 'Unable to complete web search.');
      }
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch search results.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6">
      <div className="mb-4">
        <p className="text-xs text-slate-500">Google Search Grounded Career &amp; Council Guide</p>
        <h3 className="font-display text-lg font-semibold text-slate-900 mt-0.5">
          Research Allied Health Scopes &amp; Public Council Guidelines in Punjab
        </h3>
        <p className="text-xs text-slate-600 mt-1">
          Verify general public information about PMF, Pharmacy Council, and Nursing Council career pathways across Pakistan.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
        <label htmlFor="healthcare-search-input" className="sr-only">
          Search healthcare diploma information
        </label>
        <input
          id="healthcare-search-input"
          type="text"
          value={queryText}
          onChange={(e) => setQueryText(e.target.value)}
          placeholder="Ask about MLT, OTT, Pharmacy Technician, or LHV scope in Pakistan..."
          className="flex-1 px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0b3b60]"
        />
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-[#0d7a78] hover:bg-[#0a6361] rounded-lg transition-colors whitespace-nowrap shrink-0 disabled:opacity-60"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span>{loading ? 'Searching...' : 'Search Public Info'}</span>
        </button>
      </form>

      {error && (
        <p role="alert" className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg p-3">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 pt-4 border-t border-slate-200 space-y-4">
          <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{result.text}</div>
          {result.sources.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-900 mb-2">Web Citations</p>
              <div className="flex flex-wrap gap-x-4 gap-y-1.5">
                {result.sources.slice(0, 6).map((src, idx) => (
                  <a
                    key={`${src.uri}-${idx}`}
                    href={src.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-[#0b3b60] hover:underline"
                  >
                    <span className="truncate max-w-[240px]">{src.title}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
