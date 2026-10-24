import {
  FAQ_ITEMS,
  HOSTEL_BRANCHES,
  HOSTEL_CONTACT,
  INITIAL_MEDICAL_COURSES,
  INSTITUTE_CONTACT,
} from '../data/organizationData';

export interface RouteSeoMetadata {
  path: string;
  title: string;
  description: string;
  h1: string;
  breadcrumbs: { name: string; path: string }[];
  priority: string;
  changefreq: string;
  jsonLd: Record<string, unknown>[];
}

export const PUBLIC_INDEXABLE_ROUTES: string[] = [
  '/',
  '/about',
  '/contact',
  '/girls-hostel',
  '/girls-hostel/facilities',
  '/girls-hostel/rooms-pricing',
  '/girls-hostel/gallery',
  '/girls-hostel/rules',
  '/girls-hostel/booking',
  '/paramedical-institute',
  '/paramedical-institute/courses',
  '/paramedical-institute/admissions',
  '/paramedical-institute/facilities',
  '/paramedical-institute/gallery',
  '/paramedical-institute/contact',
  '/faq',
  '/privacy-policy',
  '/terms',
];

function buildBreadcrumbsSchema(baseUrl: string, crumbs: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: crumb.name,
      item: `${baseUrl}${crumb.path}`,
    })),
  };
}

function buildHostelSchema(baseUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'LodgingBusiness',
    name: HOSTEL_CONTACT.officialName,
    url: `${baseUrl}/girls-hostel`,
    telephone: '+923413827124',
    description:
      'Female student accommodation in Jhang offering shared rooms, 24-hour security, CCTV surveillance, meal arrangements, and study-friendly living across Satellite Town and Lalazar branches.',
    address: HOSTEL_BRANCHES.map((b) => ({
      '@type': 'PostalAddress',
      streetAddress: b.address,
      addressLocality: 'Jhang',
      addressRegion: 'Punjab',
      addressCountry: 'PK',
    })),
    priceRange: 'PKR 7,000 - PKR 15,000',
  };
}

function buildInstituteSchema(baseUrl: string): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: INSTITUTE_CONTACT.officialName,
    url: `${baseUrl}/paramedical-institute`,
    telephone: '+923338985588',
    description:
      'Paramedical and healthcare diploma training institute on Ameenpur Road, Bhowana, District Chiniot offering MLT, Dispenser, OTT, Radiography, Pharmacy Technician, LHV, CNA, and CMW programs.',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Ameenpur Road, Near the Street of Punjab International Model High School, Bhowana',
      addressLocality: 'Bhowana, District Chiniot',
      addressRegion: 'Punjab',
      addressCountry: 'PK',
    },
  };
}

export function getRouteSeoMetadata(pathname: string, origin = 'https://ummeaiman.pk'): RouteSeoMetadata {
  const cleanOrigin = origin.replace(/\/$/, '');
  const cleanPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '');

  const map: Record<string, Omit<RouteSeoMetadata, 'jsonLd'> & { extraSchemas?: Record<string, unknown>[] }> = {
    '/': {
      path: '/',
      title: 'Umm-e-Aiman – Girls Hostel Jhang & Paramedical Institute Bhowana',
      description:
        'Explore comfortable female student accommodation at Umm-e-Aiman Girls Hostel in Jhang and healthcare diploma programs at Umm-e-Aiman Paramedical Institute in Bhowana.',
      h1: 'Two Paths. One Commitment to Your Future.',
      breadcrumbs: [{ name: 'Home', path: '/' }],
      priority: '1.0',
      changefreq: 'weekly',
      extraSchemas: [buildHostelSchema(cleanOrigin), buildInstituteSchema(cleanOrigin)],
    },
    '/about': {
      path: '/about',
      title: 'About Umm-e-Aiman – Girls Hostel & Paramedical Institute',
      description:
        'Learn how Umm-e-Aiman serves students in Punjab through dedicated female student housing in Jhang and practical healthcare training in Bhowana, District Chiniot.',
      h1: 'Two Dedicated Institutions Serving Students Across Jhang & Bhowana',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'About', path: '/about' },
      ],
      priority: '0.8',
      changefreq: 'monthly',
      extraSchemas: [buildHostelSchema(cleanOrigin), buildInstituteSchema(cleanOrigin)],
    },
    '/contact': {
      path: '/contact',
      title: 'Contact Umm-e-Aiman – Jhang Hostel & Bhowana Institute',
      description:
        'Direct phone numbers, WhatsApp links, and branch directions for Umm-e-Aiman Girls Hostel in Jhang and Umm-e-Aiman Paramedical Institute in Bhowana.',
      h1: 'Separate Direct Contacts for Jhang Hostel & Bhowana Campus',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Contact', path: '/contact' },
      ],
      priority: '0.8',
      changefreq: 'monthly',
    },
    '/girls-hostel': {
      path: '/girls-hostel',
      title: 'Umm-e-Aiman Girls Hostel in Jhang – Student Accommodation',
      description:
        'Welcome to Umm-e-Aiman Girls Hostel in Jhang (Satellite Town & Lalazar). Safe female student rooms, 24-hour security, CCTV, meals, Wi-Fi, and study environment.',
      h1: 'Your Comfort, Safety & Peace of Mind Matter.',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Girls Hostel', path: '/girls-hostel' },
      ],
      priority: '0.95',
      changefreq: 'weekly',
      extraSchemas: [buildHostelSchema(cleanOrigin)],
    },
    '/girls-hostel/facilities': {
      path: '/girls-hostel/facilities',
      title: 'Hostel Facilities – Umm-e-Aiman Girls Hostel in Jhang',
      description:
        'Explore 14 essential student amenities at Umm-e-Aiman Girls Hostel Jhang: 24-hour security, CCTV, Wi-Fi, meals, filtered water, geyser, and study atmosphere.',
      h1: 'Essential Facilities for Safe & Focused Student Living',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Girls Hostel', path: '/girls-hostel' },
        { name: 'Facilities', path: '/girls-hostel/facilities' },
      ],
      priority: '0.85',
      changefreq: 'monthly',
    },
    '/girls-hostel/rooms-pricing': {
      path: '/girls-hostel/rooms-pricing',
      title: 'Rooms & Monthly Pricing – Umm-e-Aiman Girls Hostel Jhang',
      description:
        'View advertised student accommodation rates in Jhang: 3-person sharing (PKR 15,000), 2-person sharing (PKR 12,000), without food (PKR 7,000), and deposit details.',
      h1: 'Transparent Room Options & Advertised Monthly Pricing',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Girls Hostel', path: '/girls-hostel' },
        { name: 'Rooms & Pricing', path: '/girls-hostel/rooms-pricing' },
      ],
      priority: '0.9',
      changefreq: 'weekly',
      extraSchemas: [buildHostelSchema(cleanOrigin)],
    },
    '/girls-hostel/gallery': {
      path: '/girls-hostel/gallery',
      title: 'Gallery & Information Plates – Umm-e-Aiman Girls Hostel',
      description:
        'Browse accommodation tariff schedules, Satellite Town and Lalazar branch guides, security overviews, and hostel information plates for Jhang students.',
      h1: 'Umm-e-Aiman Girls Hostel Information & Media Gallery',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Girls Hostel', path: '/girls-hostel' },
        { name: 'Gallery', path: '/girls-hostel/gallery' },
      ],
      priority: '0.75',
      changefreq: 'monthly',
    },
    '/girls-hostel/rules': {
      path: '/girls-hostel/rules',
      title: 'Hostel Rules & Regulations – Umm-e-Aiman Girls Hostel Jhang',
      description:
        'Read the official 8 residence rules for Umm-e-Aiman Girls Hostel in Jhang, including the PKR 3,000 deposit, 9:00 PM entry policy, and monthly dues schedule.',
      h1: 'Hostel Rules & Resident Code of Conduct',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Girls Hostel', path: '/girls-hostel' },
        { name: 'Rules & Regulations', path: '/girls-hostel/rules' },
      ],
      priority: '0.8',
      changefreq: 'monthly',
    },
    '/girls-hostel/booking': {
      path: '/girls-hostel/booking',
      title: 'Room Booking Inquiry – Umm-e-Aiman Girls Hostel Jhang',
      description:
        'Submit an online room accommodation inquiry or WhatsApp request for Umm-e-Aiman Girls Hostel in Satellite Town or Lalazar, Jhang.',
      h1: 'Hostel Accommodation & Room Availability Inquiry',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Girls Hostel', path: '/girls-hostel' },
        { name: 'Booking Inquiry', path: '/girls-hostel/booking' },
      ],
      priority: '0.9',
      changefreq: 'weekly',
    },
    '/paramedical-institute': {
      path: '/paramedical-institute',
      title: 'Umm-e-Aiman Paramedical Institute Bhowana – Medical Diplomas',
      description:
        'Explore healthcare education and medical diploma courses at Umm-e-Aiman Paramedical Institute on Ameenpur Road, Bhowana, District Chiniot.',
      h1: 'Start Your Journey Towards a Career in Healthcare.',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Paramedical Institute', path: '/paramedical-institute' },
      ],
      priority: '0.95',
      changefreq: 'weekly',
      extraSchemas: [buildInstituteSchema(cleanOrigin)],
    },
    '/paramedical-institute/courses': {
      path: '/paramedical-institute/courses',
      title: 'Medical Diploma Courses – Umm-e-Aiman Paramedical Institute',
      description:
        'Discover Dispenser, MLT, OTT, Radiography, Pharmacy Technician, LHV, CNA, and CMW courses at Umm-e-Aiman Paramedical Institute in Bhowana, Chiniot.',
      h1: 'Medical Diploma & Allied Healthcare Training Programs',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Paramedical Institute', path: '/paramedical-institute' },
        { name: 'Courses', path: '/paramedical-institute/courses' },
      ],
      priority: '0.9',
      changefreq: 'weekly',
      extraSchemas: INITIAL_MEDICAL_COURSES.slice(0, 8).map((c) => ({
        '@context': 'https://schema.org',
        '@type': 'Course',
        name: c.title,
        description: c.overview,
        provider: {
          '@type': 'EducationalOrganization',
          name: INSTITUTE_CONTACT.officialName,
          sameAs: `${cleanOrigin}/paramedical-institute`,
        },
      })),
    },
    '/paramedical-institute/admissions': {
      path: '/paramedical-institute/admissions',
      title: 'Admissions & Online Application – Umm-e-Aiman Institute',
      description:
        'Check Matric Science (45% minimum marks) eligibility, required documents, and submit your online admission application to Umm-e-Aiman Paramedical Institute.',
      h1: 'Admissions Guide, Eligibility & Online Application',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Paramedical Institute', path: '/paramedical-institute' },
        { name: 'Admissions', path: '/paramedical-institute/admissions' },
      ],
      priority: '0.9',
      changefreq: 'weekly',
    },
    '/paramedical-institute/facilities': {
      path: '/paramedical-institute/facilities',
      title: 'Laboratories & Campus Facilities – Umm-e-Aiman Institute',
      description:
        'Tour our Medical Laboratory, Pharmacy Lab, Demonstration Rooms, Classrooms, and Library at Umm-e-Aiman Paramedical Institute in Bhowana.',
      h1: 'Practical Laboratories & Academic Training Facilities',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Paramedical Institute', path: '/paramedical-institute' },
        { name: 'Facilities', path: '/paramedical-institute/facilities' },
      ],
      priority: '0.85',
      changefreq: 'monthly',
    },
    '/paramedical-institute/gallery': {
      path: '/paramedical-institute/gallery',
      title: 'Campus Photos, Posters & Video – Umm-e-Aiman Institute',
      description:
        'View real laboratory photographs, campus office visuals, official prospectus posters, and the promotional video of Umm-e-Aiman Paramedical Institute.',
      h1: 'Paramedical Institute Campus Photos, Posters & Video',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Paramedical Institute', path: '/paramedical-institute' },
        { name: 'Gallery', path: '/paramedical-institute/gallery' },
      ],
      priority: '0.8',
      changefreq: 'monthly',
    },
    '/paramedical-institute/contact': {
      path: '/paramedical-institute/contact',
      title: 'Institute Contact & Campus Location – Bhowana, Chiniot',
      description:
        'Contact Chief Executive numbers 0333-8985588 and 0334-7727235 or get directions to Ameenpur Road, Bhowana, District Chiniot.',
      h1: 'Contact Umm-e-Aiman Paramedical Institute, Bhowana',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Paramedical Institute', path: '/paramedical-institute' },
        { name: 'Contact', path: '/paramedical-institute/contact' },
      ],
      priority: '0.85',
      changefreq: 'monthly',
    },
    '/faq': {
      path: '/faq',
      title: 'Frequently Asked Questions – Umm-e-Aiman Hostel & Institute',
      description:
        'Answers to common questions about Jhang hostel room rates, curfews, Bhowana paramedical diploma eligibility, required documents, and application review.',
      h1: 'Frequently Asked Questions',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'FAQ', path: '/faq' },
      ],
      priority: '0.75',
      changefreq: 'monthly',
      extraSchemas: [
        {
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: FAQ_ITEMS.map((f) => ({
            '@type': 'Question',
            name: f.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: f.answer,
            },
          })),
        },
      ],
    },
    '/privacy-policy': {
      path: '/privacy-policy',
      title: 'Privacy Policy – Umm-e-Aiman Girls Hostel & Institute',
      description:
        'How Umm-e-Aiman protects student accommodation inquiries, admission records, CNIC/B-Form attachments, and guardian contact details.',
      h1: 'Privacy Policy & Student Data Protection',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Privacy Policy', path: '/privacy-policy' },
      ],
      priority: '0.5',
      changefreq: 'yearly',
    },
    '/terms': {
      path: '/terms',
      title: 'Terms and Conditions – Umm-e-Aiman Official Website',
      description:
        'Terms governing online hostel inquiries, paramedical admission submissions, promotional rate confirmations, and website usage.',
      h1: 'Terms and Conditions of Use',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Terms & Conditions', path: '/terms' },
      ],
      priority: '0.5',
      changefreq: 'yearly',
    },
    '/media-studio': {
      path: '/media-studio',
      title: 'Promotional Media & Poster Studio – Umm-e-Aiman',
      description:
        'Create and edit campus visuals or animate uploaded photographs into 16:9 and 9:16 promotional videos for Umm-e-Aiman.',
      h1: 'Promotional Visual & Video Animation Studio',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Media Studio', path: '/media-studio' },
      ],
      priority: '0.6',
      changefreq: 'monthly',
    },
    '/admin': {
      path: '/admin',
      title: 'Administrator Dashboard – Umm-e-Aiman Portal',
      description:
        'Role-protected administration console for reviewing hostel inquiries, admission applications, documents, pricing, courses, and regulations.',
      h1: 'Umm-e-Aiman Administration Console',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Admin Dashboard', path: '/admin' },
      ],
      priority: '0.3',
      changefreq: 'monthly',
    },
    '/search': {
      path: '/search',
      title: 'Search Courses & Facilities – Umm-e-Aiman Portal',
      description:
        'Search across medical diploma courses and campus laboratories at Umm-e-Aiman Paramedical Institute (Bhowana) and accommodation facilities at Umm-e-Aiman Girls Hostel (Jhang).',
      h1: 'Search Courses, Laboratories & Hostel Facilities',
      breadcrumbs: [
        { name: 'Home', path: '/' },
        { name: 'Search Directory', path: '/search' },
      ],
      priority: '0.7',
      changefreq: 'weekly',
    },
  };

  const entry = map[cleanPath] || map['/'];
  const breadcrumbSchema = buildBreadcrumbsSchema(cleanOrigin, entry.breadcrumbs);
  return {
    path: entry.path,
    title: entry.title,
    description: entry.description,
    h1: entry.h1,
    breadcrumbs: entry.breadcrumbs,
    priority: entry.priority,
    changefreq: entry.changefreq,
    jsonLd: [breadcrumbSchema, ...(entry.extraSchemas || [])],
  };
}

export function generateSitemapXml(baseUrl: string): string {
  const cleanOrigin = baseUrl.replace(/\/$/, '');
  const urls = PUBLIC_INDEXABLE_ROUTES.map((route) => {
    const meta = getRouteSeoMetadata(route, cleanOrigin);
    return `  <url>
    <loc>${cleanOrigin}${route}</loc>
    <changefreq>${meta.changefreq}</changefreq>
    <priority>${meta.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}
