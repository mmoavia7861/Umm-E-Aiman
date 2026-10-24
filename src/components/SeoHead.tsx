import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { getRouteSeoMetadata } from '../utils/seoData';
import { PortalSearchBar } from './PortalSearchBar';

export function SeoHead() {
  const { pathname } = useLocation();
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ummeaiman.pk';
  const meta = getRouteSeoMetadata(pathname, origin);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });

    document.title = meta.title;

    const setMeta = (selector: string, attr: 'name' | 'property', key: string, content: string) => {
      let el = document.head.querySelector(selector) as HTMLMetaElement | null;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    setMeta('meta[name="description"]', 'name', 'description', meta.description);
    setMeta('meta[property="og:title"]', 'property', 'og:title', meta.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', meta.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', `${origin}${meta.path}`);
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', meta.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', meta.description);

    let canonical = document.head.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${origin}${meta.path}`);
  }, [pathname, meta, origin]);

  return (
    <>
      {meta.jsonLd.map((schema, idx) => (
        <script
          key={`${meta.path}-schema-${idx}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}

export function BreadcrumbBar({ theme = 'neutral' }: { theme?: 'neutral' | 'hostel' | 'institute' }) {
  const { pathname } = useLocation();
  if (pathname === '/') return null;

  const meta = getRouteSeoMetadata(pathname);
  const bgClass =
    theme === 'hostel'
      ? 'bg-[#f4efe3] border-stone-200/80 text-stone-700'
      : theme === 'institute'
      ? 'bg-[#edf5f6] border-slate-200/80 text-slate-700'
      : 'bg-stone-100/80 border-stone-200 text-stone-600';

  return (
    <div className={`border-b ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <nav aria-label="Breadcrumb" className="flex items-center flex-wrap gap-1.5 text-xs">
          {meta.breadcrumbs.map((crumb, idx) => {
            const isLast = idx === meta.breadcrumbs.length - 1;
            return (
              <span key={crumb.path} className="inline-flex items-center gap-1.5">
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 opacity-50" aria-hidden="true" />}
                {isLast ? (
                  <span className="font-semibold text-slate-900" aria-current="page">
                    {crumb.name}
                  </span>
                ) : (
                  <Link to={crumb.path} className="hover:underline hover:text-slate-900 transition-colors">
                    {crumb.name}
                  </Link>
                )}
              </span>
            );
          })}
        </nav>

        {pathname !== '/search' && <PortalSearchBar variant="utility" theme={theme} />}
      </div>
    </div>
  );
}
