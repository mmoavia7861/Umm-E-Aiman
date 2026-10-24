import { GalleryItem } from '../data/organizationData';

export interface VirtualTourStop extends GalleryItem {
  index: number;
  totalStops: number;
  stopNumber: string;
  zoneLabel: string;
  highlights: string[];
  isPlate: boolean;
  isFeaturedTile: boolean;
}

interface StopEnrichment {
  zoneLabel: string;
  highlights: string[];
}

const VERIFIED_STOP_METADATA: Record<string, StopEnrichment> = {
  'inst-real-lab': {
    zoneLabel: 'Medical Laboratory · Bhowana Campus',
    highlights: [
      'Supervised practical microscopy and centrifuge training in clinical lab coats.',
      'Supports hands-on diagnostic coursework for Medical Laboratory Technology (MLT) and allied diplomas.',
      'Authentic frame extracted directly from the official Umm-e-Aiman Paramedical Institute presentation.',
    ],
  },
  'inst-signboard': {
    zoneLabel: 'Main Exterior Signboard · Ameenpur Road, Bhowana',
    highlights: [
      'Displays advertised 2-year FSc-level diplomas alongside LHV, CNA, and CMW programs.',
      'Shows printed references PMF No. 10772/PMF and F.No. 2-10/2019-PCP for administrative verification.',
      'Confirms campus location near the street of Punjab International Model High School, Bhowana.',
    ],
  },
  'inst-admin-office': {
    zoneLabel: 'Administration & Counseling Office · Bhowana Campus',
    highlights: [
      'Dedicated student and parent counseling desk for course selection and document review.',
      'Displays official Urdu eligibility posters specifying Matric Science with minimum 45% marks.',
      'Direct admissions coordination via Chief Executive numbers 0333-8985588 and 0334-7727235.',
    ],
  },
  'inst-prospectus': {
    zoneLabel: 'Admissions & Prospectus Display · Bhowana Campus',
    highlights: [
      'Lists required admission documents: Matric result card, student CNIC/B-Form, guardian CNIC, and photos.',
      'Covers principal diplomas (Dispenser, MLT, OTT, RIT, Pharmacy Technician) and specialized tracks.',
      'Side-by-side reference of the outdoor admissions banner and vertical campus standee.',
    ],
  },
  'inst-corridor': {
    zoneLabel: 'Campus Entrance & Reception Corridor · Bhowana',
    highlights: [
      'Interior reception walkway welcoming applicants and enrolled paramedical trainees.',
      'Features program overview standees and directional signage inside the institute building.',
      'Actual interior campus photograph from supplied institute media.',
    ],
  },
  'inst-logo': {
    zoneLabel: 'Institutional Emblem · Umm-e-Aiman Paramedical Institute',
    highlights: [
      'Official circular crest uniting the medical caduceus, stethoscope, and ECG heart emblem.',
      'Open book and mortarboard signify structured allied health and academic instruction.',
      'Identifies official Bhowana Paramedical Institute publications and notices.',
    ],
  },
  'inst-ce-card': {
    zoneLabel: 'Chief Executive Admissions Desk · Bhowana',
    highlights: [
      'Official contact card listing Chief Executive numbers 0334-7727235 and 0333-8985588.',
      'Supports direct phone counseling and WhatsApp inquiries for prospective healthcare students.',
      'Operates independently from Umm-e-Aiman Girls Hostel management in Jhang.',
    ],
  },
  'hostel-plate-pricing': {
    zoneLabel: 'Accommodation Tariff · Jhang Residences',
    highlights: [
      'Three-person sharing: PKR 15,000/month · Two-person sharing: PKR 12,000/month.',
      'Accommodation without food: PKR 7,000/month · One-time security deposit: PKR 3,000.',
      'Rates reflect advertised hostel material and remain subject to management confirmation.',
    ],
  },
  'hostel-plate-branches': {
    zoneLabel: 'Residential Branches · Satellite Town & Lalazar, Jhang',
    highlights: [
      'Branch 1: Near Riaz Chowk, Bahari Colony Road, House No. 14/9, Satellite Town, Jhang.',
      'Branch 2: House No. 391, Lalazar, Jhang.',
      'Positioned near local educational institutions in Jhang for convenient daily student travel.',
    ],
  },
  'hostel-plate-security': {
    zoneLabel: 'Safety, Surveillance & Curfew · Jhang Residences',
    highlights: [
      '24-hour security arrangements supported by CCTV surveillance.',
      'Strict 9:00 PM entry curfew and visitor verification preserving female student privacy.',
      'Peaceful, study-oriented residential setting with Wi-Fi and filtered drinking water.',
    ],
  },
  'hostel-plate-rules': {
    zoneLabel: 'Resident Code of Conduct · Jhang Residences',
    highlights: [
      'Monthly hostel dues are payable between the 1st and 5th; PKR 200 late fee applies after the 10th.',
      'Summarizes all 8 official hostel regulations covering visitors, appliances, and conduct.',
      'Maintained exclusively for female students residing at Umm-e-Aiman Girls Hostel in Jhang.',
    ],
  },
};

export function getTourCategories(items: GalleryItem[]): string[] {
  const unique = Array.from(new Set(items.map((item) => item.category.trim()).filter(Boolean)));
  return ['All', ...unique];
}

export function filterTourItems(items: GalleryItem[], activeCategory: string): GalleryItem[] {
  if (!activeCategory || activeCategory === 'All') {
    return items;
  }
  const available = new Set(items.map((i) => i.category));
  if (!available.has(activeCategory)) {
    return items;
  }
  return items.filter((item) => item.category === activeCategory);
}

export function getStopMetadata(item: GalleryItem): StopEnrichment {
  const known = VERIFIED_STOP_METADATA[item.id];
  if (known) {
    return known;
  }

  const orgLocation =
    item.organization === 'hostel'
      ? 'Umm-e-Aiman Girls Hostel · Jhang'
      : 'Umm-e-Aiman Paramedical Institute · Bhowana';

  return {
    zoneLabel: `${item.category} · ${orgLocation}`,
    highlights: [
      item.description,
      item.organization === 'hostel'
        ? 'Verified residential reference for female student accommodation in Jhang.'
        : 'Verified academic and campus reference for healthcare training in Bhowana, District Chiniot.',
    ],
  };
}

export function formatStopNumber(oneBasedIndex: number): string {
  return String(Math.max(0, oneBasedIndex)).padStart(2, '0');
}

export function formatStopCounter(zeroBasedIndex: number, totalStops: number): string {
  if (totalStops <= 0 || zeroBasedIndex < 0) {
    return '00 / 00';
  }
  return `${formatStopNumber(zeroBasedIndex + 1)} / ${formatStopNumber(totalStops)}`;
}

export function buildVirtualTourStops(
  items: GalleryItem[],
  activeCategory = 'All'
): VirtualTourStop[] {
  const filtered = filterTourItems(items, activeCategory);
  const totalStops = filtered.length;

  return filtered.map((item, index) => {
    const meta = getStopMetadata(item);
    return {
      ...item,
      index,
      totalStops,
      stopNumber: formatStopNumber(index + 1),
      zoneLabel: meta.zoneLabel,
      highlights: meta.highlights,
      isPlate: item.mediaUrl.startsWith('plate:'),
      isFeaturedTile: index === 0 && totalStops >= 3,
    };
  });
}

export function getAdjacentStopIndex(
  currentIndex: number,
  totalStops: number,
  direction: 'next' | 'prev'
): number {
  if (totalStops <= 0) {
    return -1;
  }
  const normalized = ((currentIndex % totalStops) + totalStops) % totalStops;
  if (direction === 'next') {
    return (normalized + 1) % totalStops;
  }
  return (normalized - 1 + totalStops) % totalStops;
}
