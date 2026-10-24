export const PAK_PHONE_REGEX = /^(\+92|0)?3[0-9]{2}[\- ]?[0-9]{7}$/;
export const PAK_CNIC_REGEX = /^[0-9]{5}\-?[0-9]{7}\-?[0-9]{1}$/;
export const VALID_DOC_ID_REGEX = /^[a-zA-Z0-9_\-]+$/;

export function isValidPakistaniPhone(phone: string): boolean {
  return PAK_PHONE_REGEX.test(phone.trim());
}

export function isValidPakistaniCnic(cnic: string): boolean {
  return PAK_CNIC_REGEX.test(cnic.trim());
}

export function formatPakPhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('92') && digits.length === 12) {
    return digits;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }
  if (digits.startsWith('3') && digits.length === 10) {
    return `92${digits}`;
  }
  return digits;
}

export function formatPakPhoneForTel(phone: string): string {
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('92') && digits.length === 12) {
    return `+${digits}`;
  }
  if (digits.startsWith('0') && digits.length === 11) {
    return `+92${digits.slice(1)}`;
  }
  if (digits.startsWith('3') && digits.length === 10) {
    return `+92${digits}`;
  }
  return phone.trim();
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const formatted = formatPakPhoneForWhatsApp(phone);
  return `https://wa.me/${formatted}?text=${encodeURIComponent(message)}`;
}

export function calculateMatricPercentage(obtainedMarks: number, totalMarks: number): number | null {
  if (!Number.isFinite(obtainedMarks) || !Number.isFinite(totalMarks)) return null;
  if (totalMarks <= 0 || obtainedMarks < 0 || obtainedMarks > totalMarks) return null;
  return Math.round((obtainedMarks / totalMarks) * 10000) / 100;
}

export function meetsMinimumMatricEligibility(percentage: number | null, threshold = 45): boolean {
  if (percentage === null) return false;
  return percentage >= threshold;
}

export interface HostelBookingInput {
  fullName: string;
  mobileNumber: string;
  whatsappNumber: string;
  email: string;
  preferredBranch: string;
  preferredRoomType: string;
  occupantsCount: number;
  expectedMoveInDate: string;
  guardianName: string;
  guardianContact: string;
  additionalMessage: string;
  acceptedRules: boolean;
}

export function validateHostelBooking(input: HostelBookingInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.fullName || input.fullName.trim().length < 2 || input.fullName.trim().length > 100) {
    errors.fullName = 'Please enter the student’s full name (2–100 characters).';
  }
  if (!isValidPakistaniPhone(input.mobileNumber)) {
    errors.mobileNumber = 'Enter a valid Pakistani mobile number (e.g., 0341-3827124).';
  }
  if (!isValidPakistaniPhone(input.whatsappNumber)) {
    errors.whatsappNumber = 'Enter a valid Pakistani WhatsApp number (e.g., 0316-6508054).';
  }
  if (input.email && input.email.trim().length > 0) {
    const emailTrimmed = input.email.trim();
    if (emailTrimmed.length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      errors.email = 'Please enter a valid email address or leave optional field blank.';
    }
  }
  const allowedBranches = ['Branch 1 — Satellite Town, Jhang', 'Branch 2 — Lalazar, Jhang'];
  if (!allowedBranches.includes(input.preferredBranch)) {
    errors.preferredBranch = 'Please select a preferred hostel branch in Jhang.';
  }
  const allowedRooms = [
    'Three-person sharing (PKR 15,000)',
    'Two-person sharing (PKR 12,000)',
    'Accommodation without food (PKR 7,000)',
  ];
  if (!allowedRooms.includes(input.preferredRoomType)) {
    errors.preferredRoomType = 'Please select an advertised room option.';
  }
  if (!Number.isInteger(input.occupantsCount) || input.occupantsCount < 1 || input.occupantsCount > 3) {
    errors.occupantsCount = 'Number of occupants must be between 1 and 3.';
  }
  if (!input.expectedMoveInDate || !/^\d{4}-\d{2}-\d{2}$/.test(input.expectedMoveInDate)) {
    errors.expectedMoveInDate = 'Please choose an expected move-in date.';
  }
  if (!input.guardianName || input.guardianName.trim().length < 2 || input.guardianName.trim().length > 100) {
    errors.guardianName = 'Please enter father’s or guardian’s full name.';
  }
  if (!isValidPakistaniPhone(input.guardianContact)) {
    errors.guardianContact = 'Enter a valid Pakistani contact number for the guardian.';
  }
  if (input.additionalMessage && input.additionalMessage.length > 1000) {
    errors.additionalMessage = 'Additional message must be under 1,000 characters.';
  }
  if (!input.acceptedRules) {
    errors.acceptedRules = 'You must read and accept the hostel rules and regulations before submitting.';
  }

  return errors;
}

export function buildHostelBookingWhatsAppMessage(input: HostelBookingInput): string {
  return [
    'Hello Umm-e-Aiman Girls Hostel Management,',
    'I would like to submit an accommodation inquiry (subject to management confirmation):',
    `• Student Name: ${input.fullName.trim()}`,
    `• Mobile: ${input.mobileNumber.trim()}`,
    `• WhatsApp: ${input.whatsappNumber.trim()}`,
    input.email.trim() ? `• Email: ${input.email.trim()}` : null,
    `• Preferred Branch: ${input.preferredBranch}`,
    `• Preferred Room: ${input.preferredRoomType}`,
    `• Occupants: ${input.occupantsCount}`,
    `• Expected Move-In: ${input.expectedMoveInDate}`,
    `• Guardian Name: ${input.guardianName.trim()}`,
    `• Guardian Contact: ${input.guardianContact.trim()}`,
    input.additionalMessage.trim() ? `• Message: ${input.additionalMessage.trim()}` : null,
    '• Rules Acknowledged: Yes',
  ]
    .filter(Boolean)
    .join('\n');
}

export interface AdmissionFormInput {
  studentFullName: string;
  guardianName: string;
  gender: string;
  dateOfBirth: string;
  cnicOrBForm: string;
  contactNumber: string;
  whatsappNumber: string;
  email: string;
  residentialAddress: string;
  cityAndDistrict: string;
  matricBoard: string;
  passingYear: number;
  totalMarks: number;
  obtainedMarks: number;
  selectedCourse: string;
  consentGiven: boolean;
}

export function validateAdmissionApplication(input: AdmissionFormInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.studentFullName || input.studentFullName.trim().length < 2 || input.studentFullName.trim().length > 100) {
    errors.studentFullName = 'Please enter student’s full name (2–100 characters).';
  }
  if (!input.guardianName || input.guardianName.trim().length < 2 || input.guardianName.trim().length > 100) {
    errors.guardianName = 'Please enter father’s or guardian’s full name.';
  }
  if (!['Female', 'Male', 'Other'].includes(input.gender)) {
    errors.gender = 'Please select gender.';
  }
  if (!input.dateOfBirth || !/^\d{4}-\d{2}-\d{2}$/.test(input.dateOfBirth)) {
    errors.dateOfBirth = 'Please provide a valid date of birth.';
  }
  if (!isValidPakistaniCnic(input.cnicOrBForm)) {
    errors.cnicOrBForm = 'Enter a valid 13-digit CNIC or B-Form number (e.g., 33201-1234567-1).';
  }
  if (!isValidPakistaniPhone(input.contactNumber)) {
    errors.contactNumber = 'Enter a valid Pakistani mobile number (e.g., 0333-8985588).';
  }
  if (!isValidPakistaniPhone(input.whatsappNumber)) {
    errors.whatsappNumber = 'Enter a valid Pakistani WhatsApp number.';
  }
  if (!input.email || input.email.trim().length < 5 || input.email.trim().length > 160 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) {
    errors.email = 'Please enter a valid email address.';
  }
  if (!input.residentialAddress || input.residentialAddress.trim().length < 5 || input.residentialAddress.trim().length > 300) {
    errors.residentialAddress = 'Enter complete residential address (5–300 characters).';
  }
  if (!input.cityAndDistrict || input.cityAndDistrict.trim().length < 2 || input.cityAndDistrict.trim().length > 100) {
    errors.cityAndDistrict = 'Enter city and district (e.g., Bhowana, District Chiniot).';
  }
  if (!input.matricBoard || input.matricBoard.trim().length < 2 || input.matricBoard.trim().length > 100) {
    errors.matricBoard = 'Enter Matriculation examination board (e.g., BISE Faisalabad).';
  }
  if (!Number.isInteger(input.passingYear) || input.passingYear < 1990 || input.passingYear > 2030) {
    errors.passingYear = 'Enter a valid passing year between 1990 and 2030.';
  }
  if (!Number.isInteger(input.totalMarks) || input.totalMarks < 100 || input.totalMarks > 2000) {
    errors.totalMarks = 'Enter valid total marks (100–2000).';
  }
  if (!Number.isInteger(input.obtainedMarks) || input.obtainedMarks < 0 || input.obtainedMarks > input.totalMarks) {
    errors.obtainedMarks = 'Obtained marks must be between 0 and total marks.';
  }
  if (!input.selectedCourse || input.selectedCourse.trim().length < 2 || input.selectedCourse.trim().length > 120) {
    errors.selectedCourse = 'Please select a medical course.';
  }
  if (!input.consentGiven) {
    errors.consentGiven = 'Please confirm consent for admission review before submitting.';
  }

  return errors;
}

export function buildAdmissionWhatsAppMessage(input: AdmissionFormInput, percentage: number | null): string {
  return [
    'Hello Umm-e-Aiman Paramedical Institute Admissions,',
    'I would like to inquire / apply for admission (subject to official review):',
    `• Student Name: ${input.studentFullName.trim()}`,
    `• Father/Guardian: ${input.guardianName.trim()}`,
    `• CNIC/B-Form: ${input.cnicOrBForm.trim()}`,
    `• Course Selected: ${input.selectedCourse}`,
    `• Matric Board & Year: ${input.matricBoard.trim()} (${input.passingYear})`,
    `• Marks: ${input.obtainedMarks} / ${input.totalMarks} (${percentage !== null ? `${percentage}%` : 'N/A'})`,
    `• Contact: ${input.contactNumber.trim()} | WhatsApp: ${input.whatsappNumber.trim()}`,
    `• City/District: ${input.cityAndDistrict.trim()}`,
  ].join('\n');
}

export const ADMISSION_INQUIRY_QUALIFICATIONS = [
  'Matric Science (45% or above)',
  'Matric Science (Awaiting Result)',
  'Matric Arts / Other',
  'FSc / Intermediate Completed',
] as const;

export type AdmissionInquiryQualification = (typeof ADMISSION_INQUIRY_QUALIFICATIONS)[number];

export interface InstituteAdmissionInquiryInput {
  studentFullName: string;
  guardianName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  cityOrDistrict: string;
  interestedCourse: string;
  matricQualification: string;
  inquiryMessage: string;
  consentGiven: boolean;
}

export const EMAIL_FORMAT_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateInstituteAdmissionInquiry(
  input: InstituteAdmissionInquiryInput
): Record<string, string> {
  const errors: Record<string, string> = {};

  const studentTrimmed = input.studentFullName ? input.studentFullName.trim() : '';
  if (studentTrimmed.length < 2 || studentTrimmed.length > 100) {
    errors.studentFullName = 'Please enter the student’s full name (2–100 characters).';
  }

  const guardianTrimmed = input.guardianName ? input.guardianName.trim() : '';
  if (guardianTrimmed.length < 2 || guardianTrimmed.length > 100) {
    errors.guardianName = 'Please enter father’s or guardian’s full name (2–100 characters).';
  }

  if (!isValidPakistaniPhone(input.phoneNumber || '')) {
    errors.phoneNumber = 'Enter a valid Pakistani mobile number (e.g., 0333-8985588).';
  }

  if (!isValidPakistaniPhone(input.whatsappNumber || '')) {
    errors.whatsappNumber = 'Enter a valid Pakistani WhatsApp number (e.g., 0334-7727235).';
  }

  const emailTrimmed = input.email ? input.email.trim() : '';
  if (
    emailTrimmed.length < 5 ||
    emailTrimmed.length > 160 ||
    !EMAIL_FORMAT_REGEX.test(emailTrimmed)
  ) {
    errors.email = 'Please enter a valid email address (5–160 characters).';
  }

  const cityTrimmed = input.cityOrDistrict ? input.cityOrDistrict.trim() : '';
  if (cityTrimmed.length < 2 || cityTrimmed.length > 100) {
    errors.cityOrDistrict = 'Please enter your city and district (e.g., Bhowana, District Chiniot).';
  }

  const courseTrimmed = input.interestedCourse ? input.interestedCourse.trim() : '';
  if (courseTrimmed.length < 2 || courseTrimmed.length > 120) {
    errors.interestedCourse = 'Please select a medical course of interest.';
  }

  if (
    !ADMISSION_INQUIRY_QUALIFICATIONS.includes(
      input.matricQualification as AdmissionInquiryQualification
    )
  ) {
    errors.matricQualification = 'Please select your current academic qualification.';
  }

  if (input.inquiryMessage && input.inquiryMessage.length > 1000) {
    errors.inquiryMessage = 'Inquiry notes must be 1,000 characters or fewer.';
  }

  if (!input.consentGiven) {
    errors.consentGiven =
      'Please confirm consent for Umm-e-Aiman Paramedical Institute admissions staff to contact you.';
  }

  return errors;
}

export function buildInstituteInquiryWhatsAppMessage(
  input: InstituteAdmissionInquiryInput
): string {
  return [
    'Hello Umm-e-Aiman Paramedical Institute Admissions (Bhowana),',
    'I would like to submit an admission inquiry:',
    input.studentFullName.trim() ? `• Student Name: ${input.studentFullName.trim()}` : null,
    input.guardianName.trim() ? `• Father/Guardian: ${input.guardianName.trim()}` : null,
    input.interestedCourse.trim() ? `• Program of Interest: ${input.interestedCourse.trim()}` : null,
    input.matricQualification ? `• Qualification: ${input.matricQualification}` : null,
    input.phoneNumber.trim() ? `• Mobile: ${input.phoneNumber.trim()}` : null,
    input.whatsappNumber.trim() ? `• WhatsApp: ${input.whatsappNumber.trim()}` : null,
    input.cityOrDistrict.trim() ? `• City/District: ${input.cityOrDistrict.trim()}` : null,
    input.inquiryMessage.trim() ? `• Question: ${input.inquiryMessage.trim()}` : null,
  ]
    .filter(Boolean)
    .join('\n');
}

export interface DocumentValidationResult {
  valid: boolean;
  error?: string;
}

export function validateDocumentAttachment(file: { name: string; type: string; size: number }): DocumentValidationResult {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Only JPG, PNG, WEBP images or PDF files are accepted.' };
  }
  // Max raw upload 2 MB before client-side compression (or 200 KB for PDFs stored in Firestore subcollection)
  if (file.type === 'application/pdf' && file.size > 200 * 1024) {
    return { valid: false, error: 'PDF documents must be 200 KB or smaller (or upload a clear JPG/PNG photo).' };
  }
  if (file.size > 5 * 1024 * 1024) {
    return { valid: false, error: 'Image file must be 5 MB or smaller.' };
  }
  if (file.name.length > 140) {
    return { valid: false, error: 'Filename must be 140 characters or shorter.' };
  }
  return { valid: true };
}

/**
 * Pure evaluator mirroring our hardened Firestore rules invariants so our unit tests
 * verify all Dirty Dozen adversarial payloads deterministically via node:test.
 */
export interface SimulatedRuleContext {
  auth: { uid: string; email: string; emailVerified: boolean } | null;
  requestTimeMs: number;
  existingParents?: Record<string, { applicantUid: string; status: string }>;
}

export function evaluateSecurityRuleGuard(
  operation: 'create' | 'update' | 'get' | 'list',
  collectionPath: string,
  docId: string,
  ctx: SimulatedRuleContext,
  incomingData?: Record<string, unknown>,
  existingData?: Record<string, unknown>
): boolean {
  const isVerified = Boolean(ctx.auth && ctx.auth.emailVerified === true);
  const isBootstrappedAdmin = isVerified && ctx.auth?.email === 'moaviahassan124@gmail.com';
  const validId = typeof docId === 'string' && docId.length >= 1 && docId.length <= 128 && VALID_DOC_ID_REGEX.test(docId);

  if (operation !== 'list' && !validId) return false;

  if (collectionPath === 'hostelInquiries') {
    if (operation === 'get' || operation === 'list') {
      if (!existingData) return false;
      return (isVerified && existingData.applicantUid === ctx.auth?.uid) || isBootstrappedAdmin;
    }
    const requiredKeys = [
      'applicantUid', 'fullName', 'mobileNumber', 'whatsappNumber', 'email',
      'preferredBranch', 'preferredRoomType', 'occupantsCount', 'expectedMoveInDate',
      'guardianName', 'guardianContact', 'additionalMessage', 'acceptedRules',
      'status', 'adminNotes', 'createdAt', 'updatedAt',
    ];
    if (!incomingData) return false;
    const keys = Object.keys(incomingData);
    if (keys.length !== requiredKeys.length || !requiredKeys.every((k) => keys.includes(k))) return false;
    if (typeof incomingData.additionalMessage !== 'string' || incomingData.additionalMessage.length > 1000) return false;

    if (operation === 'create') {
      return (
        isVerified &&
        incomingData.applicantUid === ctx.auth?.uid &&
        incomingData.status === 'New Inquiry' &&
        incomingData.adminNotes === '' &&
        incomingData.createdAt === ctx.requestTimeMs &&
        incomingData.updatedAt === ctx.requestTimeMs
      );
    }
    if (operation === 'update') {
      if (!existingData || !isVerified) return false;
      if (incomingData.applicantUid !== existingData.applicantUid) return false;
      if (incomingData.createdAt !== existingData.createdAt) return false;
      if (incomingData.updatedAt !== ctx.requestTimeMs) return false;
      if (isBootstrappedAdmin) return true;
      return existingData.applicantUid === ctx.auth?.uid && existingData.status === 'New Inquiry';
    }
  }

  if (collectionPath === 'admissionInquiries') {
    if (operation === 'get' || operation === 'list') {
      if (!existingData) return false;
      return (isVerified && existingData.applicantUid === ctx.auth?.uid) || isBootstrappedAdmin;
    }
    const requiredKeys = [
      'applicantUid',
      'studentFullName',
      'guardianName',
      'phoneNumber',
      'whatsappNumber',
      'email',
      'cityOrDistrict',
      'interestedCourse',
      'matricQualification',
      'inquiryMessage',
      'consentGiven',
      'status',
      'adminNotes',
      'createdAt',
      'updatedAt',
    ];
    if (!incomingData) return false;
    const keys = Object.keys(incomingData);
    if (keys.length !== requiredKeys.length || !requiredKeys.every((k) => keys.includes(k))) {
      return false;
    }
    if (
      typeof incomingData.studentFullName !== 'string' ||
      incomingData.studentFullName.length < 2 ||
      incomingData.studentFullName.length > 100
    ) {
      return false;
    }
    if (
      typeof incomingData.guardianName !== 'string' ||
      incomingData.guardianName.length < 2 ||
      incomingData.guardianName.length > 100
    ) {
      return false;
    }
    if (typeof incomingData.phoneNumber !== 'string' || !isValidPakistaniPhone(incomingData.phoneNumber)) {
      return false;
    }
    if (typeof incomingData.whatsappNumber !== 'string' || !isValidPakistaniPhone(incomingData.whatsappNumber)) {
      return false;
    }
    if (
      typeof incomingData.email !== 'string' ||
      incomingData.email.length < 5 ||
      incomingData.email.length > 160 ||
      !EMAIL_FORMAT_REGEX.test(incomingData.email)
    ) {
      return false;
    }
    if (typeof incomingData.inquiryMessage !== 'string' || incomingData.inquiryMessage.length > 1000) {
      return false;
    }
    if (incomingData.consentGiven !== true) {
      return false;
    }

    if (operation === 'create') {
      return (
        isVerified &&
        incomingData.applicantUid === ctx.auth?.uid &&
        incomingData.status === 'New Inquiry' &&
        incomingData.adminNotes === '' &&
        incomingData.createdAt === ctx.requestTimeMs &&
        incomingData.updatedAt === ctx.requestTimeMs
      );
    }

    if (operation === 'update') {
      if (!existingData || !isVerified) return false;
      if (incomingData.applicantUid !== existingData.applicantUid) return false;
      if (incomingData.createdAt !== existingData.createdAt) return false;
      if (incomingData.updatedAt !== ctx.requestTimeMs) return false;
      if (isBootstrappedAdmin) return true;
      return (
        existingData.applicantUid === ctx.auth?.uid &&
        existingData.status === 'New Inquiry' &&
        incomingData.status === existingData.status &&
        incomingData.adminNotes === existingData.adminNotes
      );
    }
  }

  if (collectionPath === 'admissionApplications') {
    if (!incomingData) return false;
    if (operation === 'create') {
      return (
        isVerified &&
        incomingData.applicantUid === ctx.auth?.uid &&
        incomingData.status === 'Submitted' &&
        incomingData.adminNotes === '' &&
        incomingData.createdAt === ctx.requestTimeMs
      );
    }
  }

  if (collectionPath.startsWith('admissionApplications/') && collectionPath.endsWith('/documents')) {
    const appId = collectionPath.split('/')[1];
    if (!VALID_DOC_ID_REGEX.test(appId)) return false;
    const parent = ctx.existingParents?.[appId];
    if (operation === 'create') {
      if (!isVerified || !parent || !incomingData) return false;
      return incomingData.applicantUid === ctx.auth?.uid && parent.applicantUid === ctx.auth?.uid;
    }
  }

  if (collectionPath === 'siteSettings') {
    if (operation === 'create' || operation === 'update') {
      if (!isBootstrappedAdmin || !incomingData) return false;
      if (!Array.isArray(incomingData.rulesList) || incomingData.rulesList.length > 15) return false;
      return true;
    }
  }

  return false;
}
