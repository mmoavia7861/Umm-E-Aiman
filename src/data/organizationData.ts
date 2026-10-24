export interface HostelFacility {
  id: string;
  title: string;
  category: string;
  description: string;
  iconName: string;
}

export interface HostelRoomTier {
  id: string;
  title: string;
  pricePkr: number;
  billingPeriod: 'per month' | 'one-time refundable/admission deposit';
  availabilityNote: string;
  summary: string;
  includedHighlights: string[];
  isDeposit?: boolean;
  sortOrder: number;
}

export interface HostelBranch {
  id: string;
  name: string;
  shortName: string;
  address: string;
  city: string;
  directionsQuery: string;
  primaryPhone: string;
  whatsappPhone: string;
}

export interface MedicalCourse {
  id: string;
  title: string;
  shortCode: string;
  category: 'principal' | 'additional';
  durationLabel: string;
  eligibilityLabel: string;
  overview: string;
  keyLearningAreas: string[];
  practicalTraining: string;
  careerPathways: string[];
  admissionOpen: boolean;
  sortOrder: number;
}

export interface InstituteFacility {
  id: string;
  title: string;
  description: string;
  practicalHighlight: string;
  imageUrl?: string;
  sourceClassification: 'real_campus_photo' | 'illustrative_visual';
  iconName: string;
}

export interface GalleryItem {
  id: string;
  organization: 'hostel' | 'institute';
  title: string;
  category: string;
  sourceClassification: 'real_campus_photo' | 'official_poster' | 'illustrative_visual' | 'promotional_video';
  mediaUrl: string;
  description: string;
}

export const HOSTEL_CONTACT = {
  officialName: 'Umm-e-Aiman Girls Hostel',
  city: 'Jhang, Punjab, Pakistan',
  generalPhones: ['0341-3827124', '0316-6508054'],
  adminPhones: ['0343-8401404', '0319-3783604'],
  primaryWhatsapp: '0341-3827124',
  instagramHandle: '@ummeaimangirlshosteljhang',
  instagramUrl: 'https://www.instagram.com/ummeaimangirlshosteljhang/',
  defaultWhatsappMessage:
    'Hello, I would like information about room availability and accommodation at Umm-e-Aiman Girls Hostel.',
  pricingDisclaimer:
    'Prices are based on promotional information and are subject to confirmation by hostel management.',
};

export const HOSTEL_BRANCHES: HostelBranch[] = [
  {
    id: 'branch-satellite-town',
    name: 'Branch 1 — Satellite Town, Jhang',
    shortName: 'Satellite Town Branch',
    address: 'Near Riaz Chowk, Bahari Colony Road, House No. 14/9, Satellite Town, Jhang.',
    city: 'Jhang, Punjab',
    directionsQuery: 'Riaz Chowk Bahari Colony Road Satellite Town Jhang Pakistan',
    primaryPhone: '0341-3827124',
    whatsappPhone: '0341-3827124',
  },
  {
    id: 'branch-lalazar',
    name: 'Branch 2 — Lalazar, Jhang',
    shortName: 'Lalazar Branch',
    address: 'House No. 391, Lalazar, Jhang.',
    city: 'Jhang, Punjab',
    directionsQuery: 'Lalazar Colony Jhang Punjab Pakistan',
    primaryPhone: '0316-6508054',
    whatsappPhone: '0316-6508054',
  },
];

export const INITIAL_HOSTEL_PRICING: HostelRoomTier[] = [
  {
    id: 'three-person-sharing',
    title: 'Three-person sharing',
    pricePkr: 15000,
    billingPeriod: 'per month',
    availabilityNote: 'Inquire for current room openings across Satellite Town & Lalazar branches',
    summary: 'Shared three-occupant student accommodation with advertised hostel facilities and meal arrangements.',
    includedHighlights: [
      'Three-student shared ventilated room',
      'Quality meal arrangements & filtered drinking water',
      '24-hour security & CCTV surveillance',
      'Wi-Fi access & peaceful study atmosphere',
    ],
    sortOrder: 1,
  },
  {
    id: 'two-person-sharing',
    title: 'Two-person sharing',
    pricePkr: 12000,
    billingPeriod: 'per month',
    availabilityNote: 'Subject to confirmation by hostel management',
    summary: 'Two-occupant shared student room designed for focused study and residential comfort.',
    includedHighlights: [
      'Two-student shared ventilated room',
      'Peaceful study-friendly residential setting',
      '24-hour security, CCTV & privacy arrangements',
      'Access to hot water, ironing & internet facilities',
    ],
    sortOrder: 2,
  },
  {
    id: 'accommodation-without-food',
    title: 'Accommodation without food',
    pricePkr: 7000,
    billingPeriod: 'per month',
    availabilityNote: 'Room-only option subject to branch availability',
    summary: 'Monthly residential accommodation option excluding meal service for students managing their own dining.',
    includedHighlights: [
      'Residential bed space without meal plan',
      'Filtered drinking water & electricity arrangements',
      '24-hour security & CCTV-monitored premises',
      'Wi-Fi internet, hot-water geyser & ironing access',
    ],
    sortOrder: 3,
  },
  {
    id: 'security-deposit',
    title: 'Security deposit',
    pricePkr: 3000,
    billingPeriod: 'one-time refundable/admission deposit',
    availabilityNote: 'Required at admission per hostel policy',
    summary: 'Mandatory admission security deposit required under advertised Umm-e-Aiman Girls Hostel regulations.',
    includedHighlights: [
      'Required at the time of admission confirmation',
      'Recorded under official hostel admission rules',
      'Monthly dues payable from the 1st to the 5th of each month',
      'Confirm deposit terms directly with management',
    ],
    isDeposit: true,
    sortOrder: 4,
  },
];

export const INITIAL_HOSTEL_RULES: string[] = [
  'A PKR 3,000 security deposit is required for admission.',
  'Residents should switch off unnecessary electrical appliances and lights when leaving their rooms.',
  'Entry after 9:00 PM is prohibited according to the advertised hostel policy.',
  'Residents are responsible for safeguarding their personal belongings.',
  'Unauthorized accommodation of another person may result in a PKR 500 charge.',
  'Residents must observe hostel discipline and regulations.',
  'Monthly dues are payable from the 1st to the 5th of each month.',
  'A PKR 200 late charge applies after the 10th of the month as specified in the hostel policy.',
];

export const HOSTEL_FACILITIES: HostelFacility[] = [
  {
    id: 'security-24h',
    title: '24-Hour Security Arrangements',
    category: 'Safety & Privacy',
    description: 'Dedicated round-the-clock supervision and controlled entry policies to safeguard female residents.',
    iconName: 'ShieldCheck',
  },
  {
    id: 'cctv',
    title: 'CCTV Surveillance',
    category: 'Safety & Privacy',
    description: 'Continuous camera monitoring at key entry and common zones for resident peace of mind.',
    iconName: 'Camera',
  },
  {
    id: 'ventilated-rooms',
    title: 'Comfortable & Ventilated Rooms',
    category: 'Living Comfort',
    description: 'Clean, airy shared accommodation arranged for restful living and daily academic routines.',
    iconName: 'Wind',
  },
  {
    id: 'wifi',
    title: 'Wi-Fi & Internet Access',
    category: 'Study Support',
    description: 'Internet connectivity supporting online lectures, research assignments, and family communication.',
    iconName: 'Wifi',
  },
  {
    id: 'meals',
    title: 'Quality Food & Meal Arrangements',
    category: 'Dining & Water',
    description: 'Hygienic hostel meal options prepared for students selecting accommodation with food.',
    iconName: 'Utensils',
  },
  {
    id: 'filtered-water',
    title: 'Filtered Drinking Water',
    category: 'Dining & Water',
    description: 'Clean filtered drinking water accessible to residents throughout the day.',
    iconName: 'Droplets',
  },
  {
    id: 'study-atmosphere',
    title: 'Peaceful Study-Friendly Atmosphere',
    category: 'Study Support',
    description: 'Quiet, disciplined residential environment tailored for exam preparation and daily study.',
    iconName: 'BookOpen',
  },
  {
    id: 'islamic-environment',
    title: 'Islamic & Respectful Environment',
    category: 'Community & Values',
    description: 'Modest, dignified, and mutually respectful household culture aligned with family expectations.',
    iconName: 'HeartHandshake',
  },
  {
    id: 'geyser',
    title: 'Geyser & Hot-Water Facilities',
    category: 'Daily Utilities',
    description: 'Seasonal hot-water arrangements through geyser facilities for winter convenience.',
    iconName: 'Flame',
  },
  {
    id: 'ironing',
    title: 'Ironing Facilities',
    category: 'Daily Utilities',
    description: 'Designated ironing arrangements so students can keep college and university attire neat.',
    iconName: 'Shirt',
  },
  {
    id: 'electricity',
    title: 'Electricity & Lighting Arrangements',
    category: 'Daily Utilities',
    description: 'Well-lit rooms and corridors maintained for evening study and comfortable daily routines.',
    iconName: 'Lightbulb',
  },
  {
    id: 'near-institutes',
    title: 'Near Educational Institutions',
    category: 'Location Advantage',
    description: 'Conveniently situated in Satellite Town and Lalazar, Jhang, reducing daily student commute time.',
    iconName: 'MapPin',
  },
  {
    id: 'privacy',
    title: 'Dedicated Security & Privacy',
    category: 'Safety & Privacy',
    description: 'Strict visitor and curfew regulations preserving female students’ privacy at all times.',
    iconName: 'Lock',
  },
  {
    id: 'concessions',
    title: 'Concessions for Deserving & Orphan Students',
    category: 'Student Welfare',
    description: 'Special fee concessions considered for deserving and orphan students, subject to management approval.',
    iconName: 'Award',
  },
];

export const INSTITUTE_CONTACT = {
  officialName: 'Umm-e-Aiman Paramedical Institute',
  city: 'Bhowana, District Chiniot, Punjab, Pakistan',
  address:
    'Ameenpur Road, Near the Street of Punjab International Model High School, Bhowana, District Chiniot, Punjab, Pakistan.',
  chiefExecutivePhones: ['0333-8985588', '0334-7727235'],
  primaryWhatsapp: '0333-8985588',
  directionsQuery: 'Ameenpur Road Bhowana District Chiniot Punjab Pakistan',
  defaultWhatsappMessage:
    'Hello, I would like information about admission and available medical courses at Umm-e-Aiman Paramedical Institute.',
  promotionalVideoUrl: '/assets/aistudio/WhatsApp_Video_2026-10-24_at_4.00.19_PM_49e2d441.mp4',
  promotionalVideoPoster: '/assets/extracted/institute-signboard.jpg',
  logoUrl: '/assets/extracted/institute-logo-clean.jpg',
  promotionalVideoSummary:
    'Official Urdu promotional presentation for Umm-e-Aiman Paramedical Institute (Bhowana, District Chiniot) introducing campus laboratory sessions, advertised FSc-level two-year allied health diplomas, nursing and midwifery training options, required Matric Science (Biology, Chemistry, Physics — minimum 45% marks) eligibility, campus facilities, and Chief Executive admission contact details.',
  regulatoryReferences: {
    pmfReference: 'PMF No. 10772/PMF',
    pcpReference: 'F.No. 2-10/2019-PCP',
    mentionedBodies: ['Punjab Medical Faculty (PMF)', 'Pharmacy Council', 'Pakistan / Punjab Nursing Council'],
    verificationDisclaimer:
      'Promotional posters and campus signage display references PMF No. 10772/PMF and F.No. 2-10/2019-PCP and mention Punjab Medical Faculty, Pharmacy Council, and Nursing Council recognition as well as FSc equivalence on advertised principal diplomas. Prospective students and parents should confirm current program-specific registration, seat allocation, and equivalence documentation directly with institute administration prior to enrollment.',
    sourceDiscrepancyNotes: [
      'Location header note: One vertical promotional standee prints "Bhowana / Jhang" beneath the institute name, while the main outdoor signboard, video narration, and bottom address bar consistently specify Ameenpur Road, Near the Street of Punjab International Model High School, Bhowana, District Chiniot.',
      'Photograph count note: Indoor and standee posters specify 2 passport-size photographs, whereas general checklists often request up to 4 passport-size photographs; confirm exact quantity during admission verification.',
    ],
  },
};

export const INITIAL_MEDICAL_COURSES: MedicalCourse[] = [
  {
    id: 'dispenser',
    title: 'Dispenser — Dispensing Technology',
    shortCode: 'Dispensing',
    category: 'principal',
    durationLabel: '2-Year Diploma Program (Advertised FSc-level)',
    eligibilityLabel: 'Matriculation with Science (Biology, Chemistry, Physics) — Minimum 45% marks',
    overview:
      'Develops foundational allied health knowledge in prescription handling, safe medication dispensing, first-aid support, and outpatient clinical assistance.',
    keyLearningAreas: [
      'Basic Pharmacology & Dispensing Principles',
      'First Aid & Emergency Patient Triage Support',
      'Sterilization, Dressing & Clinical Hygiene',
      'Anatomy, Physiology & Basic Pathology Fundamentals',
    ],
    practicalTraining:
      'Supervised practice in prescription reading, dosage preparation, dressing techniques, and pharmacy counter documentation.',
    careerPathways: [
      'Hospital & Clinic Dispensaries',
      'Basic Health Units & Rural Health Centers',
      'Private Medical Practices & Retail Pharmacies',
    ],
    admissionOpen: true,
    sortOrder: 1,
  },
  {
    id: 'mlt',
    title: 'Medical Laboratory Technology (MLT)',
    shortCode: 'MLT',
    category: 'principal',
    durationLabel: '2-Year Diploma Program (Advertised FSc-level)',
    eligibilityLabel: 'Matriculation with Science (Biology, Chemistry, Physics) — Minimum 45% marks',
    overview:
      'Equips students with practical diagnostic laboratory skills in specimen collection, microscopy, hematology, clinical pathology, and laboratory biosafety.',
    keyLearningAreas: [
      'Hematology & Blood Banking Procedures',
      'Clinical Microbiology & Parasitology',
      'Chemical Pathology & Routine Diagnostics',
      'Microscopy, Centrifugation & Biosafety Protocols',
    ],
    practicalTraining:
      'Hands-on training inside the institute medical laboratory using microscopes, centrifuges, blood collection tubes, and slide preparation workflows.',
    careerPathways: [
      'Diagnostic & Pathology Laboratories',
      'Hospital Clinical Laboratories',
      'Blood Banks & Collection Centers',
    ],
    admissionOpen: true,
    sortOrder: 2,
  },
  {
    id: 'ott',
    title: 'Operation Theatre Technology (OTT)',
    shortCode: 'OTT',
    category: 'principal',
    durationLabel: '2-Year Diploma Program (Advertised FSc-level)',
    eligibilityLabel: 'Matriculation with Science (Biology, Chemistry, Physics) — Minimum 45% marks',
    overview:
      'Prepares allied health trainees to assist surgical teams with theatre preparation, instrument sterilization, aseptic protocols, and perioperative patient support.',
    keyLearningAreas: [
      'Aseptic Technique & Autoclave Sterilization',
      'Surgical Instrument Identification & Setup',
      'Operation Theatre Safety & Infection Control',
      'Pre-operative & Post-operative Patient Care Support',
    ],
    practicalTraining:
      'Demonstration room exercises covering sterile gowning, gloving, surgical tray arrangement, and theatre equipment handling.',
    careerPathways: [
      'Hospital Operation Theatres',
      'Surgical & Maternity Centers',
      'Day-Care Procedure & Trauma Units',
    ],
    admissionOpen: true,
    sortOrder: 3,
  },
  {
    id: 'rit',
    title: 'Radiography & Imaging Technology (RIT)',
    shortCode: 'RIT',
    category: 'principal',
    durationLabel: '2-Year Diploma Program (Advertised FSc-level)',
    eligibilityLabel: 'Matriculation with Science (Biology, Chemistry, Physics) — Minimum 45% marks',
    overview:
      'Introduces diagnostic imaging principles, radiographic patient positioning, radiation protection standards, and imaging department workflows.',
    keyLearningAreas: [
      'Radiographic Positioning & Skeletal Anatomy',
      'Radiation Physics & Protection Protocols',
      'X-Ray Equipment Handling & Image Quality',
      'Patient Preparation & Radiology Ethics',
    ],
    practicalTraining:
      'Structured practical demonstrations on anatomical positioning, protective shielding, and radiographic workflow procedures.',
    careerPathways: [
      'Hospital Radiology & X-Ray Departments',
      'Diagnostic Imaging Centers',
      'Orthopedic & Trauma Clinics',
    ],
    admissionOpen: true,
    sortOrder: 4,
  },
  {
    id: 'pharmacy-technician',
    title: 'Pharmacy Technician',
    shortCode: 'Pharm-Tech',
    category: 'principal',
    durationLabel: '2-Year Program (Advertised on Institute Signboard)',
    eligibilityLabel: 'Matriculation with Science (Biology, Chemistry, Physics) — Minimum 45% marks',
    overview:
      'Focuses on pharmaceutical sciences, drug storage standards, compounding basics, inventory control, and community/hospital pharmacy operations.',
    keyLearningAreas: [
      'Pharmaceutics & Dosage Forms',
      'Pharmacology & Drug Classifications',
      'Pharmacognosy & Pharmaceutical Chemistry',
      'Pharmacy Law, Ethics & Inventory Storage',
    ],
    practicalTraining:
      'Practical training in the pharmacy laboratory covering compounding measurements, prescription verification, and medicine organization.',
    careerPathways: [
      'Community & Retail Pharmacies',
      'Hospital Inpatient & Outpatient Pharmacies',
      'Pharmaceutical Distribution & Storage Facilities',
    ],
    admissionOpen: true,
    sortOrder: 5,
  },
  {
    id: 'lhv',
    title: 'Lady Health Visitor (LHV)',
    shortCode: 'LHV',
    category: 'principal',
    durationLabel: 'Duration subject to program confirmation',
    eligibilityLabel: 'Matriculation with Science (Confirm specific Nursing Council criteria with office)',
    overview:
      'Focused on maternal and child health education, community health outreach, antenatal/postnatal guidance, and primary preventive healthcare for women and families.',
    keyLearningAreas: [
      'Maternal, Neonatal & Child Health Care',
      'Community Health Education & Nutrition',
      'Primary Preventive Care & Immunization Awareness',
      ' Vital Signs Monitoring & Clinical Documentation',
    ],
    practicalTraining:
      'Guided clinical demonstrations in maternal health assessment, patient counseling, and primary healthcare record-keeping.',
    careerPathways: [
      'Maternal & Child Health Centers',
      'Community Clinics & Basic Health Units',
      'NGO & Public Health Outreach Programs',
    ],
    admissionOpen: true,
    sortOrder: 6,
  },
  {
    id: 'cna',
    title: 'Certified Nursing Assistant (CNA)',
    shortCode: 'CNA',
    category: 'principal',
    durationLabel: 'Duration subject to program confirmation',
    eligibilityLabel: 'Confirm current entry requirements with admissions office',
    overview:
      'Trains compassionate bedside care assistants in vital signs monitoring, patient mobility support, hygiene care, infection prevention, and ward coordination.',
    keyLearningAreas: [
      'Fundamentals of Bedside Nursing Support',
      'Vital Signs Measurement & Charting',
      'Infection Control & Patient Safety',
      'Mobility Assistance & Comfort Care',
    ],
    practicalTraining:
      'Practical skill sessions in blood pressure/pulse monitoring, bed-making, hygienic patient care, and ward communication.',
    careerPathways: [
      'General & Specialized Hospital Wards',
      'Outpatient & Rehabilitation Clinics',
      'Supervised Home & Elder Healthcare Services',
    ],
    admissionOpen: true,
    sortOrder: 7,
  },
  {
    id: 'cmw',
    title: 'Community Midwife (CMW)',
    shortCode: 'CMW',
    category: 'principal',
    durationLabel: 'Duration subject to program confirmation',
    eligibilityLabel: 'Confirm current midwifery eligibility requirements with admissions office',
    overview:
      'Develops practical midwifery support competencies for safe maternal care, antenatal screening support, clean delivery practices, and newborn care.',
    keyLearningAreas: [
      'Antenatal & Postnatal Maternal Assessment',
      'Safe & Hygienic Midwifery Practices',
      'Immediate Newborn Care & Breastfeeding Guidance',
      'Referral Recognition for Obstetric Emergencies',
    ],
    practicalTraining:
      'Demonstration-based maternal care training emphasizing hygiene, fetal/maternal monitoring basics, and timely clinical referral.',
    careerPathways: [
      'Maternity Homes & Birthing Clinics',
      'Rural & Community Maternal Health Centers',
      'Women’s Healthcare Welfare Clinics',
    ],
    admissionOpen: true,
    sortOrder: 8,
  },
  {
    id: 'dialysis-technician',
    title: 'Dialysis Technician',
    shortCode: 'Dialysis',
    category: 'additional',
    durationLabel: 'Availability & duration subject to confirmation',
    eligibilityLabel: 'Subject to confirmation by institute administration',
    overview:
      'Advertised allied health training covering hemodialysis unit preparation, water treatment monitoring, dialyzer setup, and patient observation during renal care.',
    keyLearningAreas: [
      'Renal Physiology & Hemodialysis Principles',
      'Dialysis Machine Setup & Disinfection',
      'Vascular Access Care & Infection Prevention',
      'Intradialytic Vital Signs Monitoring',
    ],
    practicalTraining:
      'Technical orientation on dialysis unit hygiene, fluid balance charting, and equipment safety protocols.',
    careerPathways: [
      'Hospital Dialysis Units',
      'Specialized Renal Care Centers',
    ],
    admissionOpen: true,
    sortOrder: 9,
  },
  {
    id: 'anesthesia-technician',
    title: 'Anesthesia Technician',
    shortCode: 'Anesthesia',
    category: 'additional',
    durationLabel: 'Availability & duration subject to confirmation',
    eligibilityLabel: 'Subject to confirmation by institute administration',
    overview:
      'Advertised specialized training in preparing anesthesia workstations, airway equipment checks, perioperative monitoring support, and sterile supply readiness.',
    keyLearningAreas: [
      'Anesthesia Workstation & Breathing Circuit Checks',
      'Airway Management Equipment Preparation',
      'Patient Monitoring Instruments & Safety Alarms',
      'Perioperative Recovery Room Assistance',
    ],
    practicalTraining:
      'Equipment readiness drills, oxygen/gas safety checks, and operation theatre support coordination.',
    careerPathways: [
      'Surgical & Operation Theatre Suites',
      'Post-Anesthesia Care & Critical Care Units',
    ],
    admissionOpen: true,
    sortOrder: 10,
  },
  {
    id: 'physiotherapist-technician',
    title: 'Physiotherapist Technician',
    shortCode: 'Physio-Tech',
    category: 'additional',
    durationLabel: 'Availability & duration subject to confirmation',
    eligibilityLabel: 'Subject to confirmation by institute administration',
    overview:
      'Advertised rehabilitation support program introducing therapeutic exercise assistance, physical modality setup, mobility aids, and musculoskeletal care basics.',
    keyLearningAreas: [
      'Musculoskeletal Anatomy & Joint Mobility',
      'Therapeutic Exercise & Rehabilitation Support',
      'Electrotherapy & Heat/Cold Modality Setup',
      'Gait Training & Assistive Device Handling',
    ],
    practicalTraining:
      'Supervised rehabilitation positioning, assistive mobility practice, and therapy room preparation.',
    careerPathways: [
      'Physiotherapy & Rehabilitation Clinics',
      'Orthopedic & Sports Recovery Departments',
    ],
    admissionOpen: true,
    sortOrder: 11,
  },
];

export const INSTITUTE_FACILITIES: InstituteFacility[] = [
  {
    id: 'medical-lab',
    title: 'Medical Laboratory',
    description:
      'Equipped with binocular microscopes, benchtop centrifuges, specimen racks, and anatomical charts where students practice diagnostic procedures in lab coats.',
    practicalHighlight: 'Direct microscopy, slide preparation, and centrifugation practice.',
    imageUrl: '/assets/extracted/institute-lab-session.jpg',
    sourceClassification: 'real_campus_photo',
    iconName: 'Microscope',
  },
  {
    id: 'training-centers',
    title: 'Training Centers & Academic Reception',
    description:
      'Structured coaching and academic guidance center in Bhowana providing admissions counseling, course orientation, and supervised diploma study.',
    practicalHighlight: 'Guided academic mentoring and structured diploma preparation.',
    imageUrl: '/assets/extracted/institute-admin-office.jpg',
    sourceClassification: 'real_campus_photo',
    iconName: 'Building2',
  },
  {
    id: 'classrooms',
    title: 'Classrooms',
    description:
      'Dedicated lecture spaces for foundational science instruction in anatomy, physiology, pharmacology, pathology, and community health.',
    practicalHighlight: 'Structured theory lectures aligned with medical diploma syllabi.',
    imageUrl: '/assets/extracted/institute-campus-corridor.jpg',
    sourceClassification: 'real_campus_photo',
    iconName: 'GraduationCap',
  },
  {
    id: 'demonstration-rooms',
    title: 'Demonstration Rooms',
    description:
      'Practical skill spaces dedicated to clinical procedures, vital signs measurement, sterile dressing, and perioperative instrument orientation.',
    practicalHighlight: 'Step-by-step clinical procedure demonstrations before lab assessments.',
    sourceClassification: 'illustrative_visual',
    iconName: 'Stethoscope',
  },
  {
    id: 'pharmacy-lab',
    title: 'Pharmacy Laboratory',
    description:
      'Supports Dispensing and Pharmacy Technician students in learning dosage forms, prescription interpretation, compounding measurements, and medicine storage.',
    practicalHighlight: 'Compounding basics, dosage labeling, and pharmaceutical organization.',
    sourceClassification: 'illustrative_visual',
    iconName: 'Pill',
  },
  {
    id: 'library',
    title: 'Academic Library & Reference Resources',
    description:
      'Provides medical diploma textbooks, science reference materials, and quiet study resources for exam and practical preparation.',
    practicalHighlight: 'Access to biology, chemistry, physics, and allied health texts.',
    sourceClassification: 'illustrative_visual',
    iconName: 'Library',
  },
  {
    id: 'practical-training',
    title: 'Practical Healthcare Training',
    description:
      'Hands-on laboratory and clinical skill sessions helping students connect classroom science with everyday hospital, lab, and pharmacy workflows.',
    practicalHighlight: 'Supervised cohort lab sessions shown in campus video documentation.',
    imageUrl: '/assets/extracted/institute-lab-session.jpg',
    sourceClassification: 'real_campus_photo',
    iconName: 'Activity',
  },
  {
    id: 'learning-environment',
    title: 'Supportive Student Learning Environment',
    description:
      'Respectful, disciplined environment welcoming female and male healthcare students from Bhowana, Chiniot, and surrounding communities.',
    practicalHighlight: 'Accessible faculty guidance and structured batch schedules.',
    imageUrl: '/assets/extracted/institute-prospectus-posters.jpg',
    sourceClassification: 'real_campus_photo',
    iconName: 'Users',
  },
];

export const INITIAL_GALLERY_ITEMS: GalleryItem[] = [
  // Institute Gallery Items (Real Campus Photos, Official Posters & Video)
  {
    id: 'inst-real-lab',
    organization: 'institute',
    title: 'Students in Practical Medical Laboratory Session',
    category: 'Medical Laboratory',
    sourceClassification: 'real_campus_photo',
    mediaUrl: '/assets/extracted/institute-lab-session.jpg',
    description:
      'Actual campus photograph extracted from the official Umm-e-Aiman Paramedical Institute video showing students in lab coats working with microscopes and a centrifuge.',
  },
  {
    id: 'inst-signboard',
    organization: 'institute',
    title: 'Official Campus Signboard & Admissions Banner — Bhowana',
    category: 'Promotional Posters',
    sourceClassification: 'official_poster',
    mediaUrl: '/assets/extracted/institute-signboard.jpg',
    description:
      'Official Umm-e-Aiman Paramedical Institute signboard displaying advertised 2-year diplomas, LHV/CNA/CMW courses, PMF/PCP reference numbers, and Bhowana address.',
  },
  {
    id: 'inst-admin-office',
    organization: 'institute',
    title: 'Administration Office & Student Counseling Room',
    category: 'Campus Facilities',
    sourceClassification: 'real_campus_photo',
    mediaUrl: '/assets/extracted/institute-admin-office.jpg',
    description:
      'Actual campus photograph of the administration and admission inquiry office displaying official Urdu facility and eligibility posters.',
  },
  {
    id: 'inst-prospectus',
    organization: 'institute',
    title: 'Advertised Course Prospectus & Outdoor Campus Banner',
    category: 'Promotional Posters',
    sourceClassification: 'official_poster',
    mediaUrl: '/assets/extracted/institute-prospectus-posters.jpg',
    description:
      'Side-by-side view of the outdoor campus banner and vertical admission prospectus detailing facilities, required documents, and Chief Executive contact numbers.',
  },
  {
    id: 'inst-corridor',
    organization: 'institute',
    title: 'Institute Entrance & Student Standee Display',
    category: 'Campus Facilities',
    sourceClassification: 'real_campus_photo',
    mediaUrl: '/assets/extracted/institute-campus-corridor.jpg',
    description:
      'Actual interior photograph of Umm-e-Aiman Paramedical Institute showing student reception signage and admission standees.',
  },
  {
    id: 'inst-logo',
    organization: 'institute',
    title: 'Official Umm-e-Aiman Paramedical Institute Emblem',
    category: 'Institute Logo',
    sourceClassification: 'official_poster',
    mediaUrl: '/assets/extracted/institute-logo-clean.jpg',
    description:
      'Official circular institute crest featuring medical caduceus, stethoscope, ECG heart emblem, open book, and graduation cap.',
  },
  {
    id: 'inst-ce-card',
    organization: 'institute',
    title: 'Chief Executive Admissions Contact Card',
    category: 'Promotional Posters',
    sourceClassification: 'official_poster',
    mediaUrl: '/assets/extracted/institute-chief-executive.jpg',
    description:
      'Official admissions announcement card featuring Chief Executive contact numbers 0334-7727235 and 0333-8985588.',
  },
  // Hostel Gallery Items (Clearly labeled Information Plates & Architectural Diagrams — never misrepresented as campus photos)
  {
    id: 'hostel-plate-pricing',
    organization: 'hostel',
    title: 'Advertised Room Sharing & Monthly Tariff Schedule',
    category: 'Information Posters',
    sourceClassification: 'official_poster',
    mediaUrl: 'plate:hostel-pricing',
    description:
      'Structured English summary plate of advertised Jhang hostel rates: Three-person sharing (PKR 15,000), Two-person sharing (PKR 12,000), Without food (PKR 7,000), and Security deposit (PKR 3,000).',
  },
  {
    id: 'hostel-plate-branches',
    organization: 'hostel',
    title: 'Jhang Residential Branches — Satellite Town & Lalazar',
    category: 'Branches & Location',
    sourceClassification: 'illustrative_visual',
    mediaUrl: 'plate:hostel-branches',
    description:
      'Illustrative location overview plate for Branch 1 (Near Riaz Chowk, Bahari Colony Road, House No. 14/9, Satellite Town) and Branch 2 (House No. 391, Lalazar), Jhang.',
  },
  {
    id: 'hostel-plate-security',
    organization: 'hostel',
    title: '24-Hour Security, CCTV & Curfew Policy Overview',
    category: 'Facilities',
    sourceClassification: 'illustrative_visual',
    mediaUrl: 'plate:hostel-security',
    description:
      'Illustrative facility plate highlighting 24-hour security arrangements, CCTV surveillance, privacy standards, and the 9:00 PM entry policy.',
  },
  {
    id: 'hostel-plate-rules',
    organization: 'hostel',
    title: 'Official Hostel Rules & Resident Code of Conduct',
    category: 'Information Posters',
    sourceClassification: 'official_poster',
    mediaUrl: 'plate:hostel-rules',
    description:
      'English reference plate of the 8 advertised hostel regulations, monthly fee window (1st–5th), and applicable late/unauthorized guest charges.',
  },
];

export const FAQ_ITEMS = [
  {
    category: 'general',
    question: 'Are Umm-e-Aiman Girls Hostel and Umm-e-Aiman Paramedical Institute in the same city?',
    answer:
      'No. Both organizations share the Umm-e-Aiman commitment to student welfare, but they operate in separate cities with separate management contacts: Umm-e-Aiman Girls Hostel is located in Jhang (Satellite Town and Lalazar branches), while Umm-e-Aiman Paramedical Institute is located on Ameenpur Road in Bhowana, District Chiniot.',
  },
  {
    category: 'hostel',
    question: 'What are the advertised monthly room charges at Umm-e-Aiman Girls Hostel in Jhang?',
    answer:
      'According to the hostel promotional schedule, Three-person sharing is advertised at PKR 15,000 per month, Two-person sharing at PKR 12,000 per month, and Accommodation without food at PKR 7,000 per month, with a PKR 3,000 security deposit required at admission. All rates and current vacancies are subject to confirmation by hostel management.',
  },
  {
    category: 'hostel',
    question: 'Does submitting the online hostel booking form automatically reserve a room?',
    answer:
      'No. Submitting the online accommodation inquiry records your request for review by hostel management (or prepares a prefilled WhatsApp inquiry). A room is reserved only after hostel administration confirms availability and admission requirements directly with the student and guardian.',
  },
  {
    category: 'hostel',
    question: 'What are the hostel curfew and monthly fee payment deadlines?',
    answer:
      'According to the advertised hostel rules, entry after 9:00 PM is prohibited. Monthly dues are payable from the 1st to the 5th of each month, and a PKR 200 late charge is specified after the 10th.',
  },
  {
    category: 'institute',
    question: 'What is the basic eligibility criteria for FSc-level diploma courses at the Paramedical Institute?',
    answer:
      'For the principal advertised FSc-level diploma programs, applicants require Matriculation with Science (Biology, Chemistry, and Physics) with a minimum of 45% marks. Specific requirements for nursing, midwifery, or additional technician courses may vary and should be confirmed with the admissions office.',
  },
  {
    category: 'institute',
    question: 'Which documents are needed when applying for admission to Umm-e-Aiman Paramedical Institute?',
    answer:
      'Promotional materials list a copy of the Matriculation result card or certificate, student B-Form or CNIC copy, father’s or guardian’s CNIC copy, and passport-size photographs.',
  },
  {
    category: 'institute',
    question: 'Does submitting an online admission application mean my admission is accepted?',
    answer:
      'No. Online applications are recorded with "Submitted" status for review by the institute administrator. Admission is finalized only after document verification, eligibility confirmation, and official acceptance by Umm-e-Aiman Paramedical Institute.',
  },
];
