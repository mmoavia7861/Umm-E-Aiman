import React, { useEffect, useState } from 'react';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import {
  CheckCircle2,
  Download,
  Eye,
  FileText,
  Lock,
  LogOut,
  MessageCircle,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { SiteOrgSettings, useApp } from '../context/AppContext';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { buildWhatsAppUrl } from '../utils/validation';

type AdminTab =
  | 'hostel-inquiries'
  | 'institute-inquiries'
  | 'admissions'
  | 'messages'
  | 'pricing'
  | 'courses'
  | 'gallery'
  | 'settings';

interface HostelInquiryDoc {
  id: string;
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
  status: string;
  adminNotes: string;
}

interface InstituteInquiryDoc {
  id: string;
  studentFullName: string;
  guardianName: string;
  phoneNumber: string;
  whatsappNumber: string;
  email: string;
  cityOrDistrict: string;
  interestedCourse: string;
  matricQualification: string;
  inquiryMessage: string;
  status: string;
  adminNotes: string;
}

interface AdmissionAppDoc {
  id: string;
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
  calculatedPercentage: number;
  selectedCourse: string;
  documentCount: number;
  status: string;
  adminNotes: string;
}

interface PrivateAttachmentDoc {
  id: string;
  docType: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  dataUrl: string;
}

interface ContactMessageDoc {
  id: string;
  organization: string;
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: string;
}

interface DelegatedAdminDoc {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  organizationScope: 'both' | 'hostel' | 'institute';
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (val: string | number) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csv = [headers.map(escapeCell).join(','), ...rows.map((r) => r.map(escapeCell).join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

async function upsertCmsDocument(
  collectionName: string,
  docId: string,
  createFields: Record<string, unknown>,
  updateFields: Record<string, unknown>
) {
  const ref = doc(db, collectionName, docId);
  try {
    const existingSnap = await getDoc(ref);
    if (existingSnap.exists()) {
      await updateDoc(ref, {
        ...updateFields,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(ref, {
        ...createFields,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
  }
}

export function AdminDashboardPage() {
  const {
    user,
    authReady,
    isAdmin,
    signInWithGoogle,
    logout,
    hostelPricing,
    courses,
    galleryItems,
    hostelSettings,
    instituteSettings,
  } = useApp();

  const [activeTab, setActiveTab] = useState<AdminTab>('hostel-inquiries');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [feedbackBanner, setFeedbackBanner] = useState<string | null>(null);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Live collections for admin
  const [inquiries, setInquiries] = useState<HostelInquiryDoc[]>([]);
  const [instituteInquiries, setInstituteInquiries] = useState<InstituteInquiryDoc[]>([]);
  const [applications, setApplications] = useState<AdmissionAppDoc[]>([]);
  const [messages, setMessages] = useState<ContactMessageDoc[]>([]);
  const [delegatedAdmins, setDelegatedAdmins] = useState<DelegatedAdminDoc[]>([]);

  // Draft notes & status edits
  const [inquiryEdits, setInquiryEdits] = useState<Record<string, { status: string; adminNotes: string }>>({});
  const [instInquiryEdits, setInstInquiryEdits] = useState<Record<string, { status: string; adminNotes: string }>>({});
  const [appEdits, setAppEdits] = useState<Record<string, { status: string; adminNotes: string }>>({});

  // Private attachment modal
  const [inspectingApp, setInspectingApp] = useState<AdmissionAppDoc | null>(null);
  const [privateDocs, setPrivateDocs] = useState<PrivateAttachmentDoc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  // CMS local edit states
  const [pricingDrafts, setPricingDrafts] = useState<
    Record<string, { title: string; pricePkr: number; availabilityNote: string; summary: string }>
  >({});
  const [courseDrafts, setCourseDrafts] = useState<
    Record<string, { title: string; durationLabel: string; overview: string; admissionOpen: boolean }>
  >({});

  // New Gallery Item form
  const [newGalleryOrg, setNewGalleryOrg] = useState<'hostel' | 'institute'>('institute');
  const [newGalleryTitle, setNewGalleryTitle] = useState('');
  const [newGalleryCategory, setNewGalleryCategory] = useState('Campus');
  const [newGalleryClass, setNewGalleryClass] = useState<
    'real_campus_photo' | 'official_poster' | 'illustrative_visual' | 'promotional_video'
  >('real_campus_photo');
  const [newGalleryUrl, setNewGalleryUrl] = useState('');
  const [newGalleryDesc, setNewGalleryDesc] = useState('');

  // Site Settings drafts
  const [hostelCfg, setHostelCfg] = useState<SiteOrgSettings>(hostelSettings);
  const [instituteCfg, setInstituteCfg] = useState<SiteOrgSettings>(instituteSettings);
  const [hostelRulesText, setHostelRulesText] = useState(hostelSettings.rulesList.join('\n'));
  const [instituteNotesText, setInstituteNotesText] = useState(instituteSettings.rulesList.join('\n'));

  // Delegated Admin form
  const [newAdminUid, setNewAdminUid] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminName, setNewAdminName] = useState('');
  const [newAdminScope, setNewAdminScope] = useState<'both' | 'hostel' | 'institute'>('both');

  useEffect(() => {
    setHostelCfg(hostelSettings);
    setHostelRulesText(hostelSettings.rulesList.join('\n'));
  }, [hostelSettings]);

  useEffect(() => {
    setInstituteCfg(instituteSettings);
    setInstituteNotesText(instituteSettings.rulesList.join('\n'));
  }, [instituteSettings]);

  useEffect(() => {
    if (!authReady || !user || !isAdmin) {
      setInquiries([]);
      setInstituteInquiries([]);
      setApplications([]);
      setMessages([]);
      setDelegatedAdmins([]);
      return;
    }

    const unsubInq = onSnapshot(
      collection(db, 'hostelInquiries'),
      (snap) => {
        const list: HostelInquiryDoc[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            fullName: String(data.fullName || ''),
            mobileNumber: String(data.mobileNumber || ''),
            whatsappNumber: String(data.whatsappNumber || ''),
            email: String(data.email || ''),
            preferredBranch: String(data.preferredBranch || ''),
            preferredRoomType: String(data.preferredRoomType || ''),
            occupantsCount: Number(data.occupantsCount ?? 1),
            expectedMoveInDate: String(data.expectedMoveInDate || ''),
            guardianName: String(data.guardianName || ''),
            guardianContact: String(data.guardianContact || ''),
            additionalMessage: String(data.additionalMessage || ''),
            status: String(data.status || 'New Inquiry'),
            adminNotes: String(data.adminNotes || ''),
          };
        });
        setInquiries(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'hostelInquiries');
        } catch {
          // Delegated non-bootstrapped admins cannot run unbounded list without filter
        }
      }
    );

    const unsubInstInq = onSnapshot(
      collection(db, 'admissionInquiries'),
      (snap) => {
        setInstituteInquiries(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              studentFullName: String(data.studentFullName || ''),
              guardianName: String(data.guardianName || ''),
              phoneNumber: String(data.phoneNumber || ''),
              whatsappNumber: String(data.whatsappNumber || ''),
              email: String(data.email || ''),
              cityOrDistrict: String(data.cityOrDistrict || ''),
              interestedCourse: String(data.interestedCourse || ''),
              matricQualification: String(data.matricQualification || ''),
              inquiryMessage: String(data.inquiryMessage || ''),
              status: String(data.status || 'New Inquiry'),
              adminNotes: String(data.adminNotes || ''),
            };
          })
        );
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'admissionInquiries');
        } catch {
          // Handled
        }
      }
    );

    const unsubApps = onSnapshot(
      collection(db, 'admissionApplications'),
      (snap) => {
        const list: AdmissionAppDoc[] = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            studentFullName: String(data.studentFullName || ''),
            guardianName: String(data.guardianName || ''),
            gender: String(data.gender || ''),
            dateOfBirth: String(data.dateOfBirth || ''),
            cnicOrBForm: String(data.cnicOrBForm || ''),
            contactNumber: String(data.contactNumber || ''),
            whatsappNumber: String(data.whatsappNumber || ''),
            email: String(data.email || ''),
            residentialAddress: String(data.residentialAddress || ''),
            cityAndDistrict: String(data.cityAndDistrict || ''),
            matricBoard: String(data.matricBoard || ''),
            passingYear: Number(data.passingYear ?? 2025),
            totalMarks: Number(data.totalMarks ?? 1100),
            obtainedMarks: Number(data.obtainedMarks ?? 0),
            calculatedPercentage: Number(data.calculatedPercentage ?? 0),
            selectedCourse: String(data.selectedCourse || ''),
            documentCount: Number(data.documentCount ?? 0),
            status: String(data.status || 'Submitted'),
            adminNotes: String(data.adminNotes || ''),
          };
        });
        setApplications(list);
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'admissionApplications');
        } catch {
          // Handled
        }
      }
    );

    const unsubMsgs = onSnapshot(
      collection(db, 'contactMessages'),
      (snap) => {
        setMessages(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              organization: String(data.organization || 'general'),
              fullName: String(data.fullName || ''),
              phone: String(data.phone || ''),
              email: String(data.email || ''),
              subject: String(data.subject || ''),
              message: String(data.message || ''),
              status: String(data.status || 'New'),
            };
          })
        );
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'contactMessages');
        } catch {
          // Handled
        }
      }
    );

    const unsubAdmins = onSnapshot(
      collection(db, 'admins'),
      (snap) => {
        setDelegatedAdmins(
          snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              uid: String(data.uid || d.id),
              email: String(data.email || ''),
              displayName: String(data.displayName || ''),
              organizationScope: (data.organizationScope as DelegatedAdminDoc['organizationScope']) || 'both',
            };
          })
        );
      },
      () => {
        // Non-bootstrapped admins don't list all admins
      }
    );

    return () => {
      unsubInq();
      unsubInstInq();
      unsubApps();
      unsubMsgs();
      unsubAdmins();
    };
  }, [authReady, user, isAdmin]);

  const notifySuccess = (msg: string) => {
    setErrorBanner(null);
    setFeedbackBanner(msg);
    setTimeout(() => setFeedbackBanner(null), 4000);
  };

  const handleSaveInquiryStatus = async (inq: HostelInquiryDoc) => {
    const draft = inquiryEdits[inq.id] || { status: inq.status, adminNotes: inq.adminNotes };
    try {
      await updateDoc(doc(db, 'hostelInquiries', inq.id), {
        status: draft.status,
        adminNotes: draft.adminNotes.slice(0, 1000),
        updatedAt: serverTimestamp(),
      });
      notifySuccess(`Updated hostel inquiry status for ${inq.fullName}.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `hostelInquiries/${inq.id}`);
      } catch (e) {
        setErrorBanner(e instanceof Error ? e.message : 'Failed to update inquiry.');
      }
    }
  };

  const handleSaveInstituteInquiryStatus = async (inq: InstituteInquiryDoc) => {
    const draft = instInquiryEdits[inq.id] || { status: inq.status, adminNotes: inq.adminNotes };
    try {
      await updateDoc(doc(db, 'admissionInquiries', inq.id), {
        status: draft.status,
        adminNotes: draft.adminNotes.slice(0, 1000),
        updatedAt: serverTimestamp(),
      });
      notifySuccess(`Updated institute admission inquiry for ${inq.studentFullName}.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `admissionInquiries/${inq.id}`);
      } catch (e) {
        setErrorBanner(e instanceof Error ? e.message : 'Failed to update institute inquiry.');
      }
    }
  };

  const handleDeleteRecord = async (colName: string, id: string, label: string) => {
    try {
      await deleteDoc(doc(db, colName, id));
      notifySuccess(`Deleted ${label}.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `${colName}/${id}`);
      } catch (e) {
        setErrorBanner(e instanceof Error ? e.message : 'Unable to delete record.');
      }
    }
  };

  const handleSaveApplicationStatus = async (app: AdmissionAppDoc) => {
    const draft = appEdits[app.id] || { status: app.status, adminNotes: app.adminNotes };
    try {
      await updateDoc(doc(db, 'admissionApplications', app.id), {
        status: draft.status,
        adminNotes: draft.adminNotes.slice(0, 1000),
        updatedAt: serverTimestamp(),
      });
      notifySuccess(`Updated admission status for ${app.studentFullName}.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `admissionApplications/${app.id}`);
      } catch (e) {
        setErrorBanner(e instanceof Error ? e.message : 'Failed to update application.');
      }
    }
  };

  const handleInspectDocuments = async (app: AdmissionAppDoc) => {
    setInspectingApp(app);
    setPrivateDocs([]);
    setLoadingDocs(true);
    try {
      const snap = await getDocs(collection(db, 'admissionApplications', app.id, 'documents'));
      setPrivateDocs(
        snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            docType: String(data.docType || d.id),
            fileName: String(data.fileName || 'document'),
            mimeType: String(data.mimeType || 'image/jpeg'),
            sizeBytes: Number(data.sizeBytes ?? 0),
            dataUrl: String(data.dataUrl || ''),
          };
        })
      );
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.LIST, `admissionApplications/${app.id}/documents`);
      } catch (e) {
        setErrorBanner(e instanceof Error ? e.message : 'Unable to load private attachments.');
      }
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleUpdateMessageStatus = async (msgId: string, status: 'New' | 'Replied' | 'Closed') => {
    try {
      await updateDoc(doc(db, 'contactMessages', msgId), {
        status,
        updatedAt: serverTimestamp(),
      });
      notifySuccess(`Marked message as ${status}.`);
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.UPDATE, `contactMessages/${msgId}`);
      } catch (e) {
        setErrorBanner(e instanceof Error ? e.message : 'Unable to update message.');
      }
    }
  };

  const handleSavePricingTier = async (tierId: string) => {
    const base = hostelPricing.find((t) => t.id === tierId);
    if (!base) return;
    const draft = pricingDrafts[tierId] || {
      title: base.title,
      pricePkr: base.pricePkr,
      availabilityNote: base.availabilityNote,
      summary: base.summary,
    };
    const payload = {
      title: draft.title.trim().slice(0, 100),
      pricePkr: Math.max(0, Math.round(Number(draft.pricePkr))),
      billingPeriod: base.billingPeriod,
      availabilityNote: draft.availabilityNote.trim().slice(0, 160),
      summary: draft.summary.trim().slice(0, 400),
      visibility: 'public',
      sortOrder: base.sortOrder,
    };
    try {
      await upsertCmsDocument('roomPricing', tierId, payload, payload);
      notifySuccess(`Saved pricing tier: ${payload.title}`);
    } catch (e) {
      setErrorBanner(e instanceof Error ? e.message : 'Unable to save pricing tier.');
    }
  };

  const handleSaveCourse = async (courseId: string) => {
    const base = courses.find((c) => c.id === courseId);
    if (!base) return;
    const draft = courseDrafts[courseId] || {
      title: base.title,
      durationLabel: base.durationLabel,
      overview: base.overview,
      admissionOpen: base.admissionOpen,
    };
    const payload = {
      title: draft.title.trim().slice(0, 120),
      category: base.category,
      durationLabel: draft.durationLabel.trim().slice(0, 80),
      overview: draft.overview.trim().slice(0, 600),
      admissionOpen: Boolean(draft.admissionOpen),
      visibility: 'public',
      sortOrder: base.sortOrder,
    };
    try {
      await upsertCmsDocument('courses', courseId, payload, payload);
      notifySuccess(`Updated course catalog record: ${payload.title}`);
    } catch (e) {
      setErrorBanner(e instanceof Error ? e.message : 'Unable to update course.');
    }
  };

  const handleAddGalleryItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newGalleryTitle.trim().length < 2 || newGalleryUrl.trim().length < 5 || newGalleryDesc.trim().length < 5) {
      setErrorBanner('Please complete title, media URL, and description (min 5 characters).');
      return;
    }
    try {
      await addDoc(collection(db, 'galleryItems'), {
        organization: newGalleryOrg,
        title: newGalleryTitle.trim().slice(0, 120),
        category: newGalleryCategory.trim().slice(0, 40),
        sourceClassification: newGalleryClass,
        mediaUrl: newGalleryUrl.trim().slice(0, 500),
        description: newGalleryDesc.trim().slice(0, 400),
        visibility: 'public',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewGalleryTitle('');
      setNewGalleryUrl('');
      setNewGalleryDesc('');
      notifySuccess('Published new gallery item.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, 'galleryItems');
      } catch (e) {
        setErrorBanner(e instanceof Error ? e.message : 'Unable to add gallery item.');
      }
    }
  };

  const handleSaveOrgSettings = async (org: 'hostel' | 'institute') => {
    const cfg = org === 'hostel' ? hostelCfg : instituteCfg;
    const rawLines = (org === 'hostel' ? hostelRulesText : instituteNotesText)
      .split('\n')
      .map((l) => l.trim().slice(0, 300))
      .filter(Boolean)
      .slice(0, 15);

    const createPayload = {
      organization: org,
      primaryPhone: cfg.primaryPhone.trim().slice(0, 20),
      secondaryPhone: cfg.secondaryPhone.trim().slice(0, 20),
      whatsappPhone: cfg.whatsappPhone.trim().slice(0, 20),
      addressSummary: cfg.addressSummary.trim().slice(0, 300),
      announcementBanner: cfg.announcementBanner.trim().slice(0, 240),
      regulatoryReviewNote: cfg.regulatoryReviewNote.trim().slice(0, 600),
      rulesList: rawLines,
      videoUrl: cfg.videoUrl.trim().slice(0, 500),
      videoSummary: cfg.videoSummary.trim().slice(0, 600),
      visibility: 'public',
    };

    const { organization: _omitOrg, ...updatePayload } = createPayload;
    try {
      await upsertCmsDocument('siteSettings', org, createPayload, updatePayload);
      notifySuccess(`Saved live settings for ${org === 'hostel' ? 'Girls Hostel' : 'Paramedical Institute'}.`);
    } catch (e) {
      setErrorBanner(e instanceof Error ? e.message : 'Unable to save settings.');
    }
  };

  const handleGrantAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!newAdminUid.trim() || !newAdminEmail.trim() || !newAdminName.trim()) {
      setErrorBanner('Please enter the user UID, verified email, and display name.');
      return;
    }
    try {
      await setDoc(doc(db, 'admins', newAdminUid.trim()), {
        uid: newAdminUid.trim(),
        email: newAdminEmail.trim().slice(0, 160),
        displayName: newAdminName.trim().slice(0, 100),
        organizationScope: newAdminScope,
        grantedByUid: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      setNewAdminUid('');
      setNewAdminEmail('');
      setNewAdminName('');
      notifySuccess('Granted administrator access.');
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.CREATE, `admins/${newAdminUid.trim()}`);
      } catch (e) {
        setErrorBanner(e instanceof Error ? e.message : 'Only the primary bootstrapped admin can grant roles.');
      }
    }
  };

  if (!authReady) {
    return (
      <div className="py-24 max-w-md mx-auto px-4 text-center">
        <p className="text-sm text-slate-600">Checking administrator authentication state...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-5">
            <div className="w-11 h-11 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
              <Lock className="w-5 h-5 text-slate-800" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Role-Based Access Control</p>
              <h1 className="font-display text-2xl font-semibold text-slate-900 mt-1">
                Umm-e-Aiman Administration Console
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                Sign in with an authorized Umm-e-Aiman administrator Google account to manage hostel room inquiries, online admission applications, private student attachments, pricing schedules, and course statuses.
              </p>
            </div>

            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="w-full py-3 px-4 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors"
            >
              Sign In with Google
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="py-16 lg:py-24">
        <div className="max-w-lg mx-auto px-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-8 space-y-5">
            <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-800" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-amber-800 font-medium">Restricted Administrator Area</p>
              <h1 className="font-display text-2xl font-semibold text-slate-900 mt-1">
                Administrator Role Required
              </h1>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                You are signed in as <span className="font-mono text-xs font-semibold text-slate-900">{user.email}</span> (UID:{' '}
                <span className="font-mono text-xs text-slate-800">{user.uid}</span>), which does not currently hold administrator privileges. Student PII and uploaded documents remain protected.
              </p>
            </div>
            <button
              type="button"
              onClick={() => logout()}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg"
            >
              <LogOut className="w-4 h-4" aria-hidden="true" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const qLower = searchQuery.trim().toLowerCase();
  const filteredInquiries = inquiries.filter((i) => {
    const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
    const matchesSearch =
      !qLower ||
      i.fullName.toLowerCase().includes(qLower) ||
      i.mobileNumber.toLowerCase().includes(qLower) ||
      i.preferredBranch.toLowerCase().includes(qLower);
    return matchesStatus && matchesSearch;
  });

  const filteredInstInquiries = instituteInquiries.filter((i) => {
    const matchesStatus = statusFilter === 'All' || i.status === statusFilter;
    const matchesSearch =
      !qLower ||
      i.studentFullName.toLowerCase().includes(qLower) ||
      i.phoneNumber.toLowerCase().includes(qLower) ||
      i.interestedCourse.toLowerCase().includes(qLower) ||
      i.cityOrDistrict.toLowerCase().includes(qLower);
    return matchesStatus && matchesSearch;
  });

  const filteredApps = applications.filter((a) => {
    const matchesStatus = statusFilter === 'All' || a.status === statusFilter;
    const matchesSearch =
      !qLower ||
      a.studentFullName.toLowerCase().includes(qLower) ||
      a.cnicOrBForm.toLowerCase().includes(qLower) ||
      a.selectedCourse.toLowerCase().includes(qLower) ||
      a.contactNumber.toLowerCase().includes(qLower);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="py-10 lg:py-14 bg-slate-50 min-h-[80vh]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Console Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              Verified Administrator · <span className="font-mono">{user.email}</span>
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-semibold text-slate-900 mt-1">
              Umm-e-Aiman Administration Console
            </h1>
          </div>

          <button
            type="button"
            onClick={() => logout()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg whitespace-nowrap shrink-0"
          >
            <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Summary Metrics Row */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">Hostel Inquiries</p>
            <p className="font-mono tabular-nums text-2xl font-bold text-[#0f2342] mt-1">{inquiries.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">Institute Inquiries</p>
            <p className="font-mono tabular-nums text-2xl font-bold text-[#0d7a78] mt-1">{instituteInquiries.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">Institute Applications</p>
            <p className="font-mono tabular-nums text-2xl font-bold text-[#0b3b60] mt-1">{applications.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">Contact Messages</p>
            <p className="font-mono tabular-nums text-2xl font-bold text-slate-900 mt-1">{messages.length}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <p className="text-xs text-slate-500">Active Courses</p>
            <p className="font-mono tabular-nums text-2xl font-bold text-[#0d7a78] mt-1">
              {courses.filter((c) => c.admissionOpen).length} / {courses.length}
            </p>
          </div>
        </div>

        {feedbackBanner && (
          <div role="status" className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{feedbackBanner}</span>
          </div>
        )}

        {errorBanner && (
          <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
            {errorBanner}
          </div>
        )}

        {/* Section Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-xl w-fit">
          {[
            { id: 'hostel-inquiries', label: 'Hostel Inquiries' },
            { id: 'institute-inquiries', label: 'Institute Inquiries' },
            { id: 'admissions', label: 'Admissions' },
            { id: 'messages', label: 'Contact Messages' },
            { id: 'pricing', label: 'Room Pricing' },
            { id: 'courses', label: 'Courses' },
            { id: 'gallery', label: 'Media Gallery' },
            { id: 'settings', label: 'Settings & Rules' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id as AdminTab);
                setStatusFilter('All');
                setSearchQuery('');
              }}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                activeTab === tab.id ? 'bg-slate-900 text-white' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: HOSTEL INQUIRIES */}
        {activeTab === 'hostel-inquiries' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student name, phone, or Jhang branch..."
                  aria-label="Search hostel inquiries"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter inquiry status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {['All', 'New Inquiry', 'Under Review', 'Contacted', 'Confirmed', 'Closed'].map((st) => (
                    <option key={st} value={st}>
                      Status: {st}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      'hostel-inquiries.csv',
                      [
                        'ID',
                        'Student Name',
                        'Mobile',
                        'WhatsApp',
                        'Branch',
                        'Room Option',
                        'Occupants',
                        'Move-In Date',
                        'Guardian',
                        'Guardian Contact',
                        'Status',
                        'Admin Notes',
                      ],
                      filteredInquiries.map((i) => [
                        i.id,
                        i.fullName,
                        i.mobileNumber,
                        i.whatsappNumber,
                        i.preferredBranch,
                        i.preferredRoomType,
                        i.occupantsCount,
                        i.expectedMoveInDate,
                        i.guardianName,
                        i.guardianContact,
                        i.status,
                        i.adminNotes,
                      ])
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {filteredInquiries.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <p className="text-sm font-medium text-slate-800">No hostel booking inquiries match the current filter</p>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted room inquiries from `/girls-hostel/booking` appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInquiries.map((inq) => {
                  const draft = inquiryEdits[inq.id] || { status: inq.status, adminNotes: inq.adminNotes };
                  return (
                    <div key={inq.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-500 font-mono">
                            Ref: {inq.id.slice(0, 8)} · Move-In: {inq.expectedMoveInDate} · Occupants: {inq.occupantsCount}
                          </p>
                          <h3 className="font-display text-lg font-semibold text-[#0f2342] mt-0.5">{inq.fullName}</h3>
                          <p className="text-xs text-slate-600 mt-0.5">
                            {inq.preferredBranch} · {inq.preferredRoomType}
                          </p>
                          <p className="text-xs font-mono text-slate-700 mt-1">
                            Student: {inq.mobileNumber} / WA: {inq.whatsappNumber} · Guardian: {inq.guardianName} ({inq.guardianContact})
                          </p>
                          {inq.additionalMessage && (
                            <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              Note: {inq.additionalMessage}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={buildWhatsAppUrl(
                              inq.whatsappNumber,
                              `Hello ${inq.fullName}, regarding your Umm-e-Aiman Girls Hostel inquiry (${inq.preferredBranch}):`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0f2342] rounded-lg"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord('hostelInquiries', inq.id, `inquiry from ${inq.fullName}`)}
                            aria-label={`Delete inquiry from ${inq.fullName}`}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100 items-end">
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Inquiry Status</label>
                          <select
                            value={draft.status}
                            onChange={(e) =>
                              setInquiryEdits((prev) => ({
                                ...prev,
                                [inq.id]: { ...draft, status: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            {['New Inquiry', 'Under Review', 'Contacted', 'Confirmed', 'Closed'].map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-7">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Admin Notes</label>
                          <input
                            type="text"
                            value={draft.adminNotes}
                            onChange={(e) =>
                              setInquiryEdits((prev) => ({
                                ...prev,
                                [inq.id]: { ...draft, adminNotes: e.target.value },
                              }))
                            }
                            placeholder="Room allocation or follow-up remarks..."
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => handleSaveInquiryStatus(inq)}
                            className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                          >
                            Save Review
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 1B: INSTITUTE ADMISSION INQUIRIES */}
        {activeTab === 'institute-inquiries' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student name, phone, course, or city..."
                  aria-label="Search institute admission inquiries"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter institute inquiry status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {['All', 'New Inquiry', 'Under Review', 'Contacted', 'Application Invited', 'Closed'].map((st) => (
                    <option key={st} value={st}>
                      Status: {st}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      'institute-admission-inquiries.csv',
                      [
                        'ID',
                        'Student Name',
                        'Guardian Name',
                        'Mobile',
                        'WhatsApp',
                        'Email',
                        'City/District',
                        'Program of Interest',
                        'Qualification',
                        'Status',
                        'Admin Notes',
                      ],
                      filteredInstInquiries.map((i) => [
                        i.id,
                        i.studentFullName,
                        i.guardianName,
                        i.phoneNumber,
                        i.whatsappNumber,
                        i.email,
                        i.cityOrDistrict,
                        i.interestedCourse,
                        i.matricQualification,
                        i.status,
                        i.adminNotes,
                      ])
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {filteredInstInquiries.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <p className="text-sm font-medium text-slate-800">No paramedical admission inquiries match the current filter</p>
                <p className="text-xs text-slate-500 mt-1">
                  Submitted student inquiries from `/paramedical-institute` appear here in real time.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInstInquiries.map((inq) => {
                  const draft = instInquiryEdits[inq.id] || { status: inq.status, adminNotes: inq.adminNotes };
                  return (
                    <div key={inq.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs text-slate-500 font-mono">
                            Ref: {inq.id.slice(0, 8)} · {inq.cityOrDistrict} · {inq.matricQualification}
                          </p>
                          <h3 className="font-display text-lg font-semibold text-[#0b3b60] mt-0.5">{inq.studentFullName}</h3>
                          <p className="text-xs text-[#0d7a78] font-medium mt-0.5">
                            Program: {inq.interestedCourse}
                          </p>
                          <p className="text-xs font-mono text-slate-700 mt-1">
                            Mobile: {inq.phoneNumber} / WA: {inq.whatsappNumber} · Email: {inq.email} · Guardian: {inq.guardianName}
                          </p>
                          {inq.inquiryMessage && (
                            <p className="text-xs text-slate-600 mt-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                              Question: {inq.inquiryMessage}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={buildWhatsAppUrl(
                              inq.whatsappNumber,
                              `Hello ${inq.studentFullName}, regarding your Umm-e-Aiman Paramedical Institute (Bhowana) inquiry for ${inq.interestedCourse}:`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0d7a78] rounded-lg"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord('admissionInquiries', inq.id, `inquiry from ${inq.studentFullName}`)}
                            aria-label={`Delete inquiry from ${inq.studentFullName}`}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100 items-end">
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Inquiry Status</label>
                          <select
                            value={draft.status}
                            onChange={(e) =>
                              setInstInquiryEdits((prev) => ({
                                ...prev,
                                [inq.id]: { ...draft, status: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            {['New Inquiry', 'Under Review', 'Contacted', 'Application Invited', 'Closed'].map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-7">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Counselor Notes</label>
                          <input
                            type="text"
                            value={draft.adminNotes}
                            onChange={(e) =>
                              setInstInquiryEdits((prev) => ({
                                ...prev,
                                [inq.id]: { ...draft, adminNotes: e.target.value },
                              }))
                            }
                            placeholder="Eligibility counseling or follow-up notes..."
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => handleSaveInstituteInquiryStatus(inq)}
                            className="w-full py-2 px-3 text-xs font-semibold text-white bg-[#0b3b60] hover:bg-[#082c48] rounded-lg"
                          >
                            Save Review
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 2: ADMISSION APPLICATIONS */}
        {activeTab === 'admissions' && (
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-4">
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student, CNIC/B-Form, course, or phone..."
                  aria-label="Search admission applications"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Filter application status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                >
                  {['All', 'Submitted', 'Under Review', 'Documents Required', 'Accepted', 'Rejected'].map((st) => (
                    <option key={st} value={st}>
                      Status: {st}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={() =>
                    downloadCsv(
                      'paramedical-admissions.csv',
                      [
                        'ID',
                        'Student Name',
                        'Guardian',
                        'Gender',
                        'DOB',
                        'CNIC / B-Form',
                        'Phone',
                        'Course',
                        'Board',
                        'Marks',
                        'Percentage',
                        'Docs Uploaded',
                        'Status',
                        'Admin Notes',
                      ],
                      filteredApps.map((a) => [
                        a.id,
                        a.studentFullName,
                        a.guardianName,
                        a.gender,
                        a.dateOfBirth,
                        a.cnicOrBForm,
                        a.contactNumber,
                        a.selectedCourse,
                        `${a.matricBoard} (${a.passingYear})`,
                        `${a.obtainedMarks}/${a.totalMarks}`,
                        `${a.calculatedPercentage}%`,
                        a.documentCount,
                        a.status,
                        a.adminNotes,
                      ])
                    )
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg whitespace-nowrap shrink-0"
                >
                  <Download className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Export CSV</span>
                </button>
              </div>
            </div>

            {filteredApps.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <p className="text-sm font-medium text-slate-800">No admission applications match the current filter</p>
                <p className="text-xs text-slate-500 mt-1">
                  Online applications from `/paramedical-institute/admissions` appear here for verification.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApps.map((app) => {
                  const draft = appEdits[app.id] || { status: app.status, adminNotes: app.adminNotes };
                  return (
                    <div key={app.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-mono text-slate-500">
                            CNIC/B-Form: {app.cnicOrBForm} · Matric: {app.obtainedMarks}/{app.totalMarks} ({app.calculatedPercentage}%) · {app.matricBoard} ({app.passingYear})
                          </p>
                          <h3 className="font-display text-lg font-semibold text-[#0b3b60] mt-0.5">
                            {app.studentFullName}{' '}
                            <span className="text-xs font-sans font-normal text-slate-500">
                              (S/D of {app.guardianName})
                            </span>
                          </h3>
                          <p className="text-xs font-semibold text-[#0d7a78] mt-0.5">Course: {app.selectedCourse}</p>
                          <p className="text-xs text-slate-600 mt-1">
                            Phone: <span className="font-mono">{app.contactNumber}</span> · Address: {app.residentialAddress}, {app.cityAndDistrict}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleInspectDocuments(app)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#0b3b60] bg-[#f4f9fa] border border-slate-300 rounded-lg"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Documents ({app.documentCount})</span>
                          </button>

                          <a
                            href={buildWhatsAppUrl(
                              app.whatsappNumber,
                              `Hello ${app.studentFullName}, regarding your admission application for ${app.selectedCourse} at Umm-e-Aiman Paramedical Institute, Bhowana:`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0d7a78] rounded-lg"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp</span>
                          </a>

                          <button
                            type="button"
                            onClick={() =>
                              handleDeleteRecord('admissionApplications', app.id, `application of ${app.studentFullName}`)
                            }
                            aria-label={`Delete application of ${app.studentFullName}`}
                            className="p-2 text-slate-400 hover:text-red-600 rounded-lg border border-slate-200"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-12 gap-3 pt-3 border-t border-slate-100 items-end">
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Admission Status</label>
                          <select
                            value={draft.status}
                            onChange={(e) =>
                              setAppEdits((prev) => ({
                                ...prev,
                                [app.id]: { ...draft, status: e.target.value },
                              }))
                            }
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                          >
                            {['Submitted', 'Under Review', 'Documents Required', 'Accepted', 'Rejected'].map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="sm:col-span-7">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">Admin Verification Remarks</label>
                          <input
                            type="text"
                            value={draft.adminNotes}
                            onChange={(e) =>
                              setAppEdits((prev) => ({
                                ...prev,
                                [app.id]: { ...draft, adminNotes: e.target.value },
                              }))
                            }
                            placeholder="Document verification or interview notes..."
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <button
                            type="button"
                            onClick={() => handleSaveApplicationStatus(app)}
                            className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                          >
                            Save Status
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* TAB 3: CONTACT MESSAGES */}
        {activeTab === 'messages' && (
          <section className="space-y-3">
            {messages.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-xl p-10 text-center">
                <p className="text-sm font-medium text-slate-800">No contact inquiries yet</p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-slate-500 capitalize">
                      Target: {m.organization} · Status: <span className="font-semibold text-slate-800">{m.status}</span>
                    </p>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      {m.subject} — {m.fullName} (<span className="font-mono text-xs">{m.phone}</span>)
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{m.message}</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {(['New', 'Replied', 'Closed'] as const).map((st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handleUpdateMessageStatus(m.id, st)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border ${
                          m.status === st
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-700 border-slate-300'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* TAB 4: HOSTEL PRICING */}
        {activeTab === 'pricing' && (
          <section className="grid md:grid-cols-2 gap-5">
            {hostelPricing.map((tier) => {
              const draft = pricingDrafts[tier.id] || {
                title: tier.title,
                pricePkr: tier.pricePkr,
                availabilityNote: tier.availabilityNote,
                summary: tier.summary,
              };
              return (
                <div key={tier.id} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                  <p className="text-xs text-slate-500 font-mono">Tier ID: {tier.id}</p>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">Option Title</label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) =>
                        setPricingDrafts((prev) => ({ ...prev, [tier.id]: { ...draft, title: e.target.value } }))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">Advertised Rate (PKR)</label>
                      <input
                        type="number"
                        value={draft.pricePkr}
                        onChange={(e) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [tier.id]: { ...draft, pricePkr: Number(e.target.value) },
                          }))
                        }
                        className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-800 mb-1">Availability Note</label>
                      <input
                        type="text"
                        value={draft.availabilityNote}
                        onChange={(e) =>
                          setPricingDrafts((prev) => ({
                            ...prev,
                            [tier.id]: { ...draft, availabilityNote: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">Description</label>
                    <textarea
                      rows={2}
                      value={draft.summary}
                      onChange={(e) =>
                        setPricingDrafts((prev) => ({ ...prev, [tier.id]: { ...draft, summary: e.target.value } }))
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSavePricingTier(tier.id)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0f2342] hover:bg-[#193560] rounded-lg"
                  >
                    Publish Tier Update
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {/* TAB 5: MEDICAL COURSES */}
        {activeTab === 'courses' && (
          <section className="grid md:grid-cols-2 gap-5">
            {courses.map((course) => {
              const draft = courseDrafts[course.id] || {
                title: course.title,
                durationLabel: course.durationLabel,
                overview: course.overview,
                admissionOpen: course.admissionOpen,
              };
              return (
                <div key={course.id} className="bg-white border border-slate-200 rounded-xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-500">{course.shortCode} · {course.category}</span>
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-800 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={draft.admissionOpen}
                        onChange={(e) =>
                          setCourseDrafts((prev) => ({
                            ...prev,
                            [course.id]: { ...draft, admissionOpen: e.target.checked },
                          }))
                        }
                        className="rounded border-slate-300"
                      />
                      <span>Admissions Open</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">Program Title</label>
                    <input
                      type="text"
                      value={draft.title}
                      onChange={(e) =>
                        setCourseDrafts((prev) => ({ ...prev, [course.id]: { ...draft, title: e.target.value } }))
                      }
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">Duration Guidance</label>
                    <input
                      type="text"
                      value={draft.durationLabel}
                      onChange={(e) =>
                        setCourseDrafts((prev) => ({
                          ...prev,
                          [course.id]: { ...draft, durationLabel: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-800 mb-1">Program Overview</label>
                    <textarea
                      rows={3}
                      value={draft.overview}
                      onChange={(e) =>
                        setCourseDrafts((prev) => ({ ...prev, [course.id]: { ...draft, overview: e.target.value } }))
                      }
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSaveCourse(course.id)}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#0d7a78] hover:bg-[#0a6361] rounded-lg"
                  >
                    Save Course Update
                  </button>
                </div>
              );
            })}
          </section>
        )}

        {/* TAB 6: GALLERY MANAGER */}
        {activeTab === 'gallery' && (
          <section className="space-y-6">
            <form onSubmit={handleAddGalleryItem} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 max-w-3xl">
              <h2 className="font-display text-lg font-semibold text-slate-900">Publish New Gallery Visual</h2>
              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Organization</label>
                  <select
                    value={newGalleryOrg}
                    onChange={(e) => setNewGalleryOrg(e.target.value as 'hostel' | 'institute')}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="hostel">Girls Hostel (Jhang)</option>
                    <option value="institute">Paramedical Institute (Bhowana)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Source Classification</label>
                  <select
                    value={newGalleryClass}
                    onChange={(e) => setNewGalleryClass(e.target.value as typeof newGalleryClass)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="real_campus_photo">Real Campus Photograph</option>
                    <option value="official_poster">Official Promotional Poster</option>
                    <option value="illustrative_visual">Illustrative Reference Graphic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Category</label>
                  <input
                    type="text"
                    value={newGalleryCategory}
                    onChange={(e) => setNewGalleryCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Visual Title *</label>
                  <input
                    type="text"
                    value={newGalleryTitle}
                    onChange={(e) => setNewGalleryTitle(e.target.value)}
                    placeholder="e.g., Satellite Town Student Study Room"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">Image Path or HTTPS URL *</label>
                  <input
                    type="text"
                    value={newGalleryUrl}
                    onChange={(e) => setNewGalleryUrl(e.target.value)}
                    placeholder="/assets/extracted/institute-lab-session.jpg"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">Caption / Description *</label>
                <textarea
                  rows={2}
                  value={newGalleryDesc}
                  onChange={(e) => setNewGalleryDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                />
              </div>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to Gallery</span>
              </button>
            </form>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryItems.map((item) => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col justify-between gap-3">
                  <div>
                    <p className="text-[11px] text-slate-500 capitalize">
                      {item.organization} · {item.category}
                    </p>
                    <h3 className="font-display text-sm font-semibold text-slate-900 mt-0.5">{item.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">{item.description}</p>
                  </div>
                  {!item.mediaUrl.startsWith('plate:') && !item.id.startsWith('inst-') && (
                    <button
                      type="button"
                      onClick={() => handleDeleteRecord('galleryItems', item.id, item.title)}
                      className="text-xs text-red-600 hover:underline self-start"
                    >
                      Remove Custom Item
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* TAB 7: SETTINGS, RULES & DELEGATED ADMINS */}
        {activeTab === 'settings' && (
          <section className="space-y-8">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Hostel Settings */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display text-xl font-semibold text-[#0f2342]">
                  Girls Hostel Settings &amp; Rules (Jhang)
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Primary Phone</label>
                    <input
                      type="text"
                      value={hostelCfg.primaryPhone}
                      onChange={(e) => setHostelCfg({ ...hostelCfg, primaryPhone: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Secondary Phone</label>
                    <input
                      type="text"
                      value={hostelCfg.secondaryPhone}
                      onChange={(e) => setHostelCfg({ ...hostelCfg, secondaryPhone: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={hostelCfg.whatsappPhone}
                      onChange={(e) => setHostelCfg({ ...hostelCfg, whatsappPhone: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Banner</label>
                  <input
                    type="text"
                    value={hostelCfg.announcementBanner}
                    onChange={(e) => setHostelCfg({ ...hostelCfg, announcementBanner: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Hostel Rules (One rule per line, max 15)
                  </label>
                  <textarea
                    rows={6}
                    value={hostelRulesText}
                    onChange={(e) => setHostelRulesText(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg leading-relaxed"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveOrgSettings('hostel')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0f2342] rounded-lg"
                >
                  Save Hostel Settings
                </button>
              </div>

              {/* Institute Settings */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                <h2 className="font-display text-xl font-semibold text-[#0b3b60]">
                  Paramedical Institute Settings (Bhowana)
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Chief Exec Line 1</label>
                    <input
                      type="text"
                      value={instituteCfg.primaryPhone}
                      onChange={(e) => setInstituteCfg({ ...instituteCfg, primaryPhone: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Chief Exec Line 2</label>
                    <input
                      type="text"
                      value={instituteCfg.secondaryPhone}
                      onChange={(e) => setInstituteCfg({ ...instituteCfg, secondaryPhone: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">WhatsApp Number</label>
                    <input
                      type="text"
                      value={instituteCfg.whatsappPhone}
                      onChange={(e) => setInstituteCfg({ ...instituteCfg, whatsappPhone: e.target.value })}
                      className="w-full px-2.5 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admissions Banner</label>
                  <input
                    type="text"
                    value={instituteCfg.announcementBanner}
                    onChange={(e) => setInstituteCfg({ ...instituteCfg, announcementBanner: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Regulatory &amp; Verification Notice
                  </label>
                  <textarea
                    rows={3}
                    value={instituteCfg.regulatoryReviewNote}
                    onChange={(e) => setInstituteCfg({ ...instituteCfg, regulatoryReviewNote: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Promotional Video Path / URL</label>
                  <input
                    type="text"
                    value={instituteCfg.videoUrl}
                    onChange={(e) => setInstituteCfg({ ...instituteCfg, videoUrl: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => handleSaveOrgSettings('institute')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#0d7a78] rounded-lg"
                >
                  Save Institute Settings
                </button>
              </div>
            </div>

            {/* Delegated Administrators */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 max-w-3xl">
              <h2 className="font-display text-lg font-semibold text-slate-900">Delegated Administrator Registry</h2>
              <form onSubmit={handleGrantAdmin} className="grid sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Firebase UID</label>
                  <input
                    type="text"
                    value={newAdminUid}
                    onChange={(e) => setNewAdminUid(e.target.value)}
                    placeholder="User UID"
                    className="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Verified Email</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="staff@example.com"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={newAdminName}
                    onChange={(e) => setNewAdminName(e.target.value)}
                    placeholder="Admin Name"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    className="w-full py-2 px-3 text-xs font-semibold text-white bg-slate-900 rounded-lg"
                  >
                    Grant Access
                  </button>
                </div>
              </form>

              {delegatedAdmins.length > 0 && (
                <div className="pt-2 space-y-2">
                  {delegatedAdmins.map((adm) => (
                    <div key={adm.id} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                      <span>
                        <strong>{adm.displayName}</strong> ({adm.email}) · Scope: {adm.organizationScope}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteRecord('admins', adm.id, `admin ${adm.email}`)}
                        className="text-red-600 hover:underline"
                      >
                        Revoke
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      {/* Private Admission Documents Modal */}
      {inspectingApp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Submitted documents for ${inspectingApp.studentFullName}`}
          className="fixed inset-0 z-50 bg-slate-950/75 p-4 flex items-center justify-center"
          onClick={() => setInspectingApp(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs text-slate-500">Private Student Attachments</p>
                <h2 className="font-display text-lg font-semibold text-slate-900">
                  {inspectingApp.studentFullName} — {inspectingApp.selectedCourse}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectingApp(null)}
                aria-label="Close document viewer"
                className="p-2 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDocs ? (
              <p className="text-xs text-slate-600 py-8 text-center">Loading encrypted student attachments...</p>
            ) : privateDocs.length === 0 ? (
              <p className="text-xs text-slate-600 py-8 text-center">
                No digital files were attached to this application. Request physical copies during verification.
              </p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {privateDocs.map((docItem) => (
                  <div key={docItem.id} className="border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900 capitalize">
                        {docItem.docType.replace('_', ' ')}
                      </span>
                      <a
                        href={docItem.dataUrl}
                        download={docItem.fileName}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#0d7a78] hover:underline"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </a>
                    </div>
                    {docItem.mimeType.startsWith('image/') ? (
                      <img
                        src={docItem.dataUrl}
                        alt={docItem.fileName}
                        className="w-full h-44 object-contain bg-slate-50 rounded-lg border border-slate-100"
                      />
                    ) : (
                      <div className="h-44 bg-slate-50 rounded-lg border border-slate-100 flex flex-col items-center justify-center text-xs text-slate-600">
                        <FileText className="w-7 h-7 text-slate-400 mb-1.5" />
                        <span>{docItem.fileName}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
