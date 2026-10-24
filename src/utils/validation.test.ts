import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildWhatsAppUrl,
  calculateMatricPercentage,
  evaluateSecurityRuleGuard,
  formatPakPhoneForWhatsApp,
  isValidPakistaniCnic,
  isValidPakistaniPhone,
  meetsMinimumMatricEligibility,
  validateAdmissionApplication,
  validateHostelBooking,
  validateInstituteAdmissionInquiry,
} from './validation';
import { generateSitemapXml, getRouteSeoMetadata } from './seoData';

test('Pakistani phone numbers format cleanly to international wa.me format', () => {
  assert.equal(formatPakPhoneForWhatsApp('0341-3827124'), '923413827124');
  assert.equal(formatPakPhoneForWhatsApp('0333-8985588'), '923338985588');
  assert.equal(formatPakPhoneForWhatsApp('+92 316 6508054'), '923166508054');
  assert.equal(isValidPakistaniPhone('0341-3827124'), true);
  assert.equal(isValidPakistaniPhone('12345'), false);

  const hostelWa = buildWhatsAppUrl('0341-3827124', 'Hello Hostel');
  assert.equal(hostelWa, 'https://wa.me/923413827124?text=Hello%20Hostel');
});

test('Matriculation percentage calculator and 45% eligibility check work accurately', () => {
  assert.equal(calculateMatricPercentage(770, 1100), 70);
  assert.equal(calculateMatricPercentage(495, 1100), 45);
  assert.equal(calculateMatricPercentage(494, 1100), 44.91);
  assert.equal(calculateMatricPercentage(1200, 1100), null);
  assert.equal(calculateMatricPercentage(500, 0), null);

  assert.equal(meetsMinimumMatricEligibility(45), true);
  assert.equal(meetsMinimumMatricEligibility(44.91), false);
});

test('Hostel booking validation enforces required fields and rules checkbox', () => {
  const validInput = {
    fullName: 'Ayesha Fatima',
    mobileNumber: '0341-3827124',
    whatsappNumber: '0341-3827124',
    email: '',
    preferredBranch: 'Branch 1 — Satellite Town, Jhang',
    preferredRoomType: 'Two-person sharing (PKR 12,000)',
    occupantsCount: 2,
    expectedMoveInDate: '2026-11-01',
    guardianName: 'Muhammad Tariq',
    guardianContact: '0316-6508054',
    additionalMessage: 'Looking for study-friendly room.',
    acceptedRules: true,
  };
  assert.deepEqual(validateHostelBooking(validInput), {});

  const missingRules = validateHostelBooking({ ...validInput, acceptedRules: false });
  assert.ok(missingRules.acceptedRules);
});

test('Institute admission form validation enforces CNIC, phone, marks, and consent', () => {
  assert.equal(isValidPakistaniCnic('33201-1234567-1'), true);
  assert.equal(isValidPakistaniCnic('3320112345671'), true);
  assert.equal(isValidPakistaniCnic('12345'), false);

  const validApp = {
    studentFullName: 'Sana Bibi',
    guardianName: 'Ghulam Abbas',
    gender: 'Female',
    dateOfBirth: '2007-04-12',
    cnicOrBForm: '33201-1234567-2',
    contactNumber: '0333-8985588',
    whatsappNumber: '0333-8985588',
    email: 'sana@example.com',
    residentialAddress: 'Near Main Bazar, Bhowana',
    cityAndDistrict: 'Bhowana, District Chiniot',
    matricBoard: 'BISE Faisalabad',
    passingYear: 2025,
    totalMarks: 1100,
    obtainedMarks: 680,
    selectedCourse: 'Medical Laboratory Technology (MLT)',
    consentGiven: true,
  };
  assert.deepEqual(validateAdmissionApplication(validApp), {});

  const invalidMarks = validateAdmissionApplication({ ...validApp, obtainedMarks: 1300 });
  assert.ok(invalidMarks.obtainedMarks);
});

test('SEO metadata and XML sitemap cover all separated Hostel and Institute routes', () => {
  const sitemap = generateSitemapXml('https://ummeaiman.pk');
  assert.ok(sitemap.includes('https://ummeaiman.pk/girls-hostel/rooms-pricing'));
  assert.ok(sitemap.includes('https://ummeaiman.pk/paramedical-institute/courses'));

  const hostelMeta = getRouteSeoMetadata('/girls-hostel', 'https://ummeaiman.pk');
  assert.equal(hostelMeta.h1, 'Your Comfort, Safety & Peace of Mind Matter.');

  const instMeta = getRouteSeoMetadata('/paramedical-institute', 'https://ummeaiman.pk');
  assert.equal(instMeta.h1, 'Start Your Journey Towards a Career in Healthcare.');
});

test('Dirty Dozen security rule payloads are all strictly denied', () => {
  const now = 1761280000000;
  const baseHostelDoc = {
    applicantUid: 'user_A',
    fullName: 'Ayesha',
    mobileNumber: '0341-3827124',
    whatsappNumber: '0341-3827124',
    email: '',
    preferredBranch: 'Branch 1 — Satellite Town, Jhang',
    preferredRoomType: 'Two-person sharing (PKR 12,000)',
    occupantsCount: 2,
    expectedMoveInDate: '2026-11-01',
    guardianName: 'Tariq',
    guardianContact: '0316-6508054',
    additionalMessage: 'Hello',
    acceptedRules: true,
    status: 'New Inquiry',
    adminNotes: '',
    createdAt: now,
    updatedAt: now,
  };

  const userA = { uid: 'user_A', email: 'studentA@example.com', emailVerified: true };
  const userB = { uid: 'user_B', email: 'studentB@example.com', emailVerified: true };
  const spoofAdmin = { uid: 'spoof_1', email: 'moaviahassan124@gmail.com', emailVerified: false };

  // Valid baseline passes
  assert.equal(
    evaluateSecurityRuleGuard('create', 'hostelInquiries', 'inq_1', { auth: userA, requestTimeMs: now }, baseHostelDoc),
    true
  );

  // 1. Shadow field injection
  assert.equal(
    evaluateSecurityRuleGuard(
      'create',
      'hostelInquiries',
      'inq_1',
      { auth: userA, requestTimeMs: now },
      { ...baseHostelDoc, isVerified: true }
    ),
    false
  );

  // 2. Unverified admin email spoof
  assert.equal(
    evaluateSecurityRuleGuard(
      'create',
      'siteSettings',
      'hostel_config',
      { auth: spoofAdmin, requestTimeMs: now },
      { rulesList: ['Rule 1'] }
    ),
    false
  );

  // 3. Applicant UID spoofing
  assert.equal(
    evaluateSecurityRuleGuard(
      'create',
      'admissionApplications',
      'app_1',
      { auth: userA, requestTimeMs: now },
      { applicantUid: 'user_B', status: 'Submitted', adminNotes: '', createdAt: now }
    ),
    false
  );

  // 4. Self-accepted status shortcutting
  assert.equal(
    evaluateSecurityRuleGuard(
      'create',
      'admissionApplications',
      'app_1',
      { auth: userA, requestTimeMs: now },
      { applicantUid: 'user_A', status: 'Accepted', adminNotes: '', createdAt: now }
    ),
    false
  );

  // 5. Cross-tenant PII read
  assert.equal(
    evaluateSecurityRuleGuard('get', 'hostelInquiries', 'inq_1', { auth: userB, requestTimeMs: now }, undefined, baseHostelDoc),
    false
  );

  // 6. Orphaned document upload
  assert.equal(
    evaluateSecurityRuleGuard(
      'create',
      'admissionApplications/ghost_999/documents',
      'doc_1',
      { auth: userA, requestTimeMs: now, existingParents: {} },
      { applicantUid: 'user_A' }
    ),
    false
  );

  // 7. Cross-application document injection
  assert.equal(
    evaluateSecurityRuleGuard(
      'create',
      'admissionApplications/app_A/documents',
      'doc_1',
      {
        auth: userB,
        requestTimeMs: now,
        existingParents: { app_A: { applicantUid: 'user_A', status: 'Submitted' } },
      },
      { applicantUid: 'user_B' }
    ),
    false
  );

  // 8. 200-char ID poisoning
  assert.equal(
    evaluateSecurityRuleGuard(
      'create',
      'hostelInquiries',
      'x'.repeat(200),
      { auth: userA, requestTimeMs: now },
      baseHostelDoc
    ),
    false
  );

  // 9. Value poisoning on whitelisted update key
  assert.equal(
    evaluateSecurityRuleGuard(
      'update',
      'hostelInquiries',
      'inq_1',
      { auth: userA, requestTimeMs: now + 1000 },
      { ...baseHostelDoc, additionalMessage: 'z'.repeat(5000), updatedAt: now + 1000 },
      baseHostelDoc
    ),
    false
  );

  // 10. Terminal state re-opening
  assert.equal(
    evaluateSecurityRuleGuard(
      'update',
      'hostelInquiries',
      'inq_1',
      { auth: userA, requestTimeMs: now + 1000 },
      { ...baseHostelDoc, status: 'Closed', additionalMessage: 'Reopen please', updatedAt: now + 1000 },
      { ...baseHostelDoc, status: 'Closed' }
    ),
    false
  );

  // 11. Forged client timestamp
  assert.equal(
    evaluateSecurityRuleGuard(
      'create',
      'hostelInquiries',
      'inq_1',
      { auth: userA, requestTimeMs: now },
      { ...baseHostelDoc, createdAt: now - 999999 }
    ),
    false
  );

  // 12. Unbounded array bomb on siteSettings.rulesList
  const realAdmin = { uid: 'admin_1', email: 'moaviahassan124@gmail.com', emailVerified: true };
  assert.equal(
    evaluateSecurityRuleGuard(
      'create',
      'siteSettings',
      'hostel_config',
      { auth: realAdmin, requestTimeMs: now },
      { rulesList: Array.from({ length: 50 }, (_, i) => `Rule ${i}`) }
    ),
    false
  );
});

test('Paramedical Institute admission inquiry validation and zero-trust Firestore rules enforce strict PII and schema bounds', () => {
  const validInquiry = {
    studentFullName: 'Fatima Zahra',
    guardianName: 'Muhammad Akram',
    phoneNumber: '0333-8985588',
    whatsappNumber: '0334-7727235',
    email: 'fatima.zahra@example.com',
    cityOrDistrict: 'Bhowana, District Chiniot',
    interestedCourse: 'Medical Laboratory Technology (MLT)',
    matricQualification: 'Matric Science (45% or above)',
    inquiryMessage: 'Please share session start dates and practical lab timings.',
    consentGiven: true,
  };

  assert.deepEqual(validateInstituteAdmissionInquiry(validInquiry), {});

  const invalidErrors = validateInstituteAdmissionInquiry({
    ...validInquiry,
    studentFullName: 'A',
    phoneNumber: '12345',
    email: 'not-an-email',
    consentGiven: false,
  });
  assert.ok(invalidErrors.studentFullName);
  assert.ok(invalidErrors.phoneNumber);
  assert.ok(invalidErrors.email);
  assert.ok(invalidErrors.consentGiven);

  const now = 1761285000000;
  const userA = { uid: 'student_uid_1', email: 'fatima.zahra@example.com', emailVerified: true };
  const userB = { uid: 'student_uid_2', email: 'other@example.com', emailVerified: true };
  const unverifiedUser = { uid: 'student_uid_1', email: 'fatima.zahra@example.com', emailVerified: false };

  const baseFirestorePayload = {
    applicantUid: 'student_uid_1',
    ...validInquiry,
    status: 'New Inquiry',
    adminNotes: '',
    createdAt: now,
    updatedAt: now,
  };

  // Valid verified student create passes
  assert.equal(
    evaluateSecurityRuleGuard('create', 'admissionInquiries', 'inq_inst_1', { auth: userA, requestTimeMs: now }, baseFirestorePayload),
    true
  );

  // Rejects unverified email
  assert.equal(
    evaluateSecurityRuleGuard('create', 'admissionInquiries', 'inq_inst_1', { auth: unverifiedUser, requestTimeMs: now }, baseFirestorePayload),
    false
  );

  // Rejects shadow field injection
  assert.equal(
    evaluateSecurityRuleGuard(
      'create',
      'admissionInquiries',
      'inq_inst_1',
      { auth: userA, requestTimeMs: now },
      { ...baseFirestorePayload, isAdminApproved: true }
    ),
    false
  );

  // Rejects cross-tenant PII read by another student
  assert.equal(
    evaluateSecurityRuleGuard('get', 'admissionInquiries', 'inq_inst_1', { auth: userB, requestTimeMs: now }, undefined, baseFirestorePayload),
    false
  );

  // Rejects update once Closed (terminal state locking)
  assert.equal(
    evaluateSecurityRuleGuard(
      'update',
      'admissionInquiries',
      'inq_inst_1',
      { auth: userA, requestTimeMs: now + 5000 },
      { ...baseFirestorePayload, status: 'Closed', inquiryMessage: 'Updated after close', updatedAt: now + 5000 },
      { ...baseFirestorePayload, status: 'Closed' }
    ),
    false
  );
});

