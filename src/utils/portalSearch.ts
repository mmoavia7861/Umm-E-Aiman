import {
  FAQ_ITEMS,
  HOSTEL_FACILITIES,
  HostelFacility,
  HostelRoomTier,
  INITIAL_HOSTEL_PRICING,
  INITIAL_HOSTEL_RULES,
  INITIAL_MEDICAL_COURSES,
  INSTITUTE_FACILITIES,
  InstituteFacility,
  MedicalCourse,
} from '../data/organizationData';

export type PortalSearchCategory = 'course' | 'facility' | 'pricing' | 'faq';
export type PortalOrg = 'institute' | 'hostel' | 'general';

export interface PortalSearchItem {
  id: string;
  entityId: string;
  title: string;
  shortCode?: string;
  subtitle: string;
  description: string;
  matchedDetail?: string;
  category: PortalSearchCategory;
  categoryLabel: string;
  organization: PortalOrg;
  organizationLabel: string;
  href: string;
  secondaryActionLabel?: string;
  secondaryActionHref?: string;
  keywords: string[];
}

export interface PortalSearchIndexSources {
  courses?: MedicalCourse[];
  instituteFacilities?: InstituteFacility[];
  hostelFacilities?: HostelFacility[];
  hostelPricing?: HostelRoomTier[];
  hostelRules?: string[];
  faqs?: typeof FAQ_ITEMS;
}

export interface SearchFilterOptions {
  category?: 'all' | PortalSearchCategory;
  organization?: 'all' | 'institute' | 'hostel';
  limit?: number;
}

export const PORTAL_QUICK_SEARCHES: { label: string; query: string }[] = [
  { label: 'MLT Diploma', query: 'MLT' },
  { label: 'Pharmacy Technician', query: 'Pharmacy Technician' },
  { label: 'Medical Laboratory', query: 'Medical Laboratory' },
  { label: 'CCTV Surveillance', query: 'CCTV' },
  { label: 'Wi-Fi Access', query: 'Wi-Fi' },
  { label: 'Two-person sharing', query: 'Two-person sharing' },
];

/**
 * Normalizes text for resilient search matching (handles hyphens like "Wi-Fi" vs "wifi",
 * casing, and punctuation).
 */
export function normalizeSearchText(input: string): string {
  return input
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function compactSearchText(input: string): string {
  return input.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Builds a unified, strictly separated search index across Paramedical Institute courses/facilities
 * and Girls Hostel facilities/pricing/policies.
 */
export function buildPortalSearchIndex(sources: PortalSearchIndexSources = {}): PortalSearchItem[] {
  const courses = sources.courses ?? INITIAL_MEDICAL_COURSES;
  const instituteFacilities = sources.instituteFacilities ?? INSTITUTE_FACILITIES;
  const hostelFacilities = sources.hostelFacilities ?? HOSTEL_FACILITIES;
  const hostelPricing = sources.hostelPricing ?? INITIAL_HOSTEL_PRICING;
  const hostelRules = sources.hostelRules ?? INITIAL_HOSTEL_RULES;
  const faqs = sources.faqs ?? FAQ_ITEMS;

  const items: PortalSearchItem[] = [];

  // 1. Paramedical Institute Courses (Bhowana)
  for (const course of courses) {
    items.push({
      id: `course:${course.id}`,
      entityId: course.id,
      title: course.title,
      shortCode: course.shortCode,
      subtitle: `${course.shortCode} · ${course.durationLabel}`,
      description: course.overview,
      category: 'course',
      categoryLabel: 'Medical Course',
      organization: 'institute',
      organizationLabel: 'Paramedical Institute · Bhowana',
      href: `/paramedical-institute/courses?focus=${encodeURIComponent(course.id)}`,
      secondaryActionLabel: 'Apply Online',
      secondaryActionHref: `/paramedical-institute/admissions?course=${encodeURIComponent(course.title)}`,
      keywords: [
        course.shortCode,
        course.durationLabel,
        course.eligibilityLabel,
        course.practicalTraining,
        ...course.keyLearningAreas,
        ...course.careerPathways,
        'Bhowana',
        'Chiniot',
        'diploma',
        'course',
        'healthcare',
      ],
    });
  }

  // 2. Paramedical Institute Facilities (Bhowana)
  for (const fac of instituteFacilities) {
    items.push({
      id: `inst-facility:${fac.id}`,
      entityId: fac.id,
      title: fac.title,
      subtitle: 'Campus Infrastructure & Practical Training',
      description: fac.description,
      category: 'facility',
      categoryLabel: 'Institute Facility',
      organization: 'institute',
      organizationLabel: 'Paramedical Institute · Bhowana',
      href: `/paramedical-institute/facilities?focus=${encodeURIComponent(fac.id)}`,
      secondaryActionLabel: 'Campus Tour',
      secondaryActionHref: '/paramedical-institute/gallery',
      keywords: [
        fac.practicalHighlight,
        'Bhowana',
        'Chiniot',
        'laboratory',
        'campus facility',
        'practical',
      ],
    });
  }

  // 3. Girls Hostel Facilities (Jhang)
  for (const fac of hostelFacilities) {
    items.push({
      id: `hostel-facility:${fac.id}`,
      entityId: fac.id,
      title: fac.title,
      subtitle: `${fac.category} · Satellite Town & Lalazar`,
      description: fac.description,
      category: 'facility',
      categoryLabel: 'Hostel Facility',
      organization: 'hostel',
      organizationLabel: 'Girls Hostel · Jhang',
      href: `/girls-hostel/facilities?focus=${encodeURIComponent(fac.id)}`,
      secondaryActionLabel: 'Book Room',
      secondaryActionHref: '/girls-hostel/booking',
      keywords: [
        fac.category,
        'Jhang',
        'Satellite Town',
        'Lalazar',
        'girls hostel',
        'accommodation',
        'amenity',
        'facility',
      ],
    });
  }

  // 4. Girls Hostel Room Options & Pricing (Jhang)
  for (const tier of hostelPricing) {
    items.push({
      id: `pricing:${tier.id}`,
      entityId: tier.id,
      title: `${tier.title} — PKR ${tier.pricePkr.toLocaleString()}`,
      subtitle: `Advertised ${tier.billingPeriod} · Jhang`,
      description: tier.summary,
      category: 'pricing',
      categoryLabel: tier.isDeposit ? 'Admission Deposit' : 'Room & Tariff',
      organization: 'hostel',
      organizationLabel: 'Girls Hostel · Jhang',
      href: `/girls-hostel/rooms-pricing?focus=${encodeURIComponent(tier.id)}`,
      secondaryActionLabel: 'Inquire Room',
      secondaryActionHref: '/girls-hostel/booking',
      keywords: [
        tier.title,
        String(tier.pricePkr),
        tier.availabilityNote,
        ...tier.includedHighlights,
        'Jhang',
        'rent',
        'fee',
        'price',
        'room',
        'sharing',
      ],
    });
  }

  // 5. Hostel Rules Summary Item (so searching "curfew", "9:00 PM", "late charge", "rules" works)
  if (hostelRules.length > 0) {
    items.push({
      id: 'policy:hostel-rules',
      entityId: 'hostel-rules',
      title: 'Hostel Rules, Curfew (9:00 PM) & Monthly Dues Policy',
      subtitle: `${hostelRules.length} Official Resident Regulations · Jhang`,
      description: hostelRules.slice(0, 3).join(' '),
      category: 'faq',
      categoryLabel: 'Hostel Policy',
      organization: 'hostel',
      organizationLabel: 'Girls Hostel · Jhang',
      href: '/girls-hostel/rules',
      keywords: [
        ...hostelRules,
        'curfew',
        '9:00 PM',
        'rules',
        'regulations',
        'late charge',
        'security deposit',
        'Jhang',
      ],
    });
  }

  // 6. Frequently Asked Questions across Hostel, Institute & General
  faqs.forEach((faq, idx) => {
    const org: PortalOrg =
      faq.category === 'institute' ? 'institute' : faq.category === 'hostel' ? 'hostel' : 'general';
    const orgLabel =
      org === 'institute'
        ? 'Paramedical Institute · Bhowana'
        : org === 'hostel'
        ? 'Girls Hostel · Jhang'
        : 'Both Organizations · Jhang & Bhowana';

    items.push({
      id: `faq:${idx}`,
      entityId: `faq-${idx}`,
      title: faq.question,
      subtitle: 'Frequently Asked Question',
      description: faq.answer,
      category: 'faq',
      categoryLabel: 'FAQ & Guidance',
      organization: org,
      organizationLabel: orgLabel,
      href: `/faq?focus=faq-${idx}`,
      keywords: [faq.question, faq.answer, faq.category, 'faq', 'eligibility', 'documents'],
    });
  });

  return items;
}

function applyCategoryAndOrgFilters(
  items: PortalSearchItem[],
  options: SearchFilterOptions
): PortalSearchItem[] {
  const { category = 'all', organization = 'all' } = options;
  return items.filter((item) => {
    if (category !== 'all' && item.category !== category) {
      return false;
    }
    if (organization !== 'all') {
      if (item.organization !== organization) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Searches the unified portal index using normalized multi-token matching and
 * deterministic relevance ranking. When query is empty, returns featured courses and facilities.
 */
export function searchPortalIndex(
  index: PortalSearchItem[],
  rawQuery: string,
  options: SearchFilterOptions = {}
): PortalSearchItem[] {
  const trimmed = rawQuery.trim().slice(0, 120);
  const normQuery = normalizeSearchText(trimmed);
  const compactQuery = compactSearchText(trimmed);

  if (!normQuery) {
    const filteredDefault = applyCategoryAndOrgFilters(index, options);
    return options.limit ? filteredDefault.slice(0, options.limit) : filteredDefault;
  }

  const tokens = normQuery.split(' ').filter(Boolean);
  const scored: { item: PortalSearchItem; score: number }[] = [];

  for (const item of index) {
    const normTitle = normalizeSearchText(item.title);
    const compactTitle = compactSearchText(item.title);
    const normShort = item.shortCode ? normalizeSearchText(item.shortCode) : '';
    const compactShort = item.shortCode ? compactSearchText(item.shortCode) : '';
    const normSubtitle = normalizeSearchText(item.subtitle);
    const normDesc = normalizeSearchText(item.description);
    const normOrg = normalizeSearchText(item.organizationLabel);
    const normKeywords = item.keywords.map((kw) => normalizeSearchText(kw));
    const compactKeywords = item.keywords.map((kw) => compactSearchText(kw));

    const combinedNorm = `${normTitle} ${normShort} ${normSubtitle} ${normDesc} ${normOrg} ${normKeywords.join(' ')}`;
    const combinedCompact = `${compactTitle}${compactShort}${compactSearchText(item.subtitle)}${compactSearchText(
      item.description
    )}${compactKeywords.join('')}`;

    // Every query token must match either normalized word stream or compact form (handles "wifi" -> "Wi-Fi")
    const allTokensMatch = tokens.every((tok) => {
      const compactTok = compactSearchText(tok);
      return combinedNorm.includes(tok) || (compactTok.length >= 2 && combinedCompact.includes(compactTok));
    });

    if (!allTokensMatch) {
      continue;
    }

    let score = 0;

    // 1. Exact shortCode or compact acronym match (e.g., "MLT", "OTT", "LHV", "CNA", "CMW")
    if (normShort && (normShort === normQuery || compactShort === compactQuery)) {
      score += 140;
    }

    // 2. Title exact / prefix / substring priority
    if (normTitle === normQuery || compactTitle === compactQuery) {
      score += 120;
    } else if (normTitle.startsWith(normQuery) || compactTitle.startsWith(compactQuery)) {
      score += 90;
    } else if (normTitle.includes(normQuery) || (compactQuery.length >= 3 && compactTitle.includes(compactQuery))) {
      score += 65;
    }

    // 3. Per-token weighting
    let matchedKeywordSnippet: string | undefined;
    for (const tok of tokens) {
      const cTok = compactSearchText(tok);
      if (normTitle.includes(tok) || (cTok.length >= 2 && compactTitle.includes(cTok))) {
        score += 28;
      }
      if (normShort && normShort.includes(tok)) {
        score += 32;
      }
      if (normSubtitle.includes(tok)) {
        score += 14;
      }
      if (normDesc.includes(tok)) {
        score += 12;
      }
      for (let i = 0; i < normKeywords.length; i++) {
        if (normKeywords[i].includes(tok) || (cTok.length >= 3 && compactKeywords[i].includes(cTok))) {
          score += 16;
          if (!matchedKeywordSnippet && item.keywords[i].length > 6 && !normTitle.includes(tok)) {
            matchedKeywordSnippet = item.keywords[i];
          }
          break;
        }
      }
    }

    // Slight priority boost for primary courses and facilities over FAQs on ties
    if (item.category === 'course' || item.category === 'facility') {
      score += 5;
    }

    scored.push({
      item: matchedKeywordSnippet ? { ...item, matchedDetail: matchedKeywordSnippet } : item,
      score,
    });
  }

  scored.sort((a, b) => b.score - a.score || a.item.title.localeCompare(b.item.title));

  const matchedItems = applyCategoryAndOrgFilters(
    scored.map((entry) => entry.item),
    options
  );

  return options.limit ? matchedItems.slice(0, options.limit) : matchedItems;
}

export interface SearchCategoryCounts {
  all: number;
  course: number;
  facility: number;
  pricing: number;
  faq: number;
}

/**
 * Computes result counts across categories (respecting any active organization filter)
 * so category filter buttons always display accurate counts.
 */
export function getSearchCategoryCounts(
  index: PortalSearchItem[],
  rawQuery: string,
  organization: 'all' | 'institute' | 'hostel' = 'all'
): SearchCategoryCounts {
  const orgFiltered = searchPortalIndex(index, rawQuery, { category: 'all', organization });
  const counts: SearchCategoryCounts = {
    all: orgFiltered.length,
    course: 0,
    facility: 0,
    pricing: 0,
    faq: 0,
  };

  for (const item of orgFiltered) {
    counts[item.category] += 1;
  }

  return counts;
}
