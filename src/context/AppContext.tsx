import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../firebase';
import {
  GalleryItem,
  HOSTEL_CONTACT,
  HostelRoomTier,
  INITIAL_GALLERY_ITEMS,
  INITIAL_HOSTEL_PRICING,
  INITIAL_HOSTEL_RULES,
  INITIAL_MEDICAL_COURSES,
  INSTITUTE_CONTACT,
  MedicalCourse,
} from '../data/organizationData';

export interface SiteOrgSettings {
  primaryPhone: string;
  secondaryPhone: string;
  whatsappPhone: string;
  addressSummary: string;
  announcementBanner: string;
  regulatoryReviewNote: string;
  rulesList: string[];
  videoUrl: string;
  videoSummary: string;
}

interface AppContextValue {
  user: User | null;
  authReady: boolean;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<User | null>;
  logout: () => Promise<void>;
  hostelPricing: HostelRoomTier[];
  courses: MedicalCourse[];
  galleryItems: GalleryItem[];
  hostelSettings: SiteOrgSettings;
  instituteSettings: SiteOrgSettings;
}

const DEFAULT_HOSTEL_SETTINGS: SiteOrgSettings = {
  primaryPhone: HOSTEL_CONTACT.generalPhones[0],
  secondaryPhone: HOSTEL_CONTACT.generalPhones[1],
  whatsappPhone: HOSTEL_CONTACT.primaryWhatsapp,
  addressSummary: 'Branch 1: House No. 14/9, Satellite Town · Branch 2: House No. 391, Lalazar, Jhang.',
  announcementBanner: 'Inquiries open for Three-person sharing, Two-person sharing & Room-only options in Jhang.',
  regulatoryReviewNote: HOSTEL_CONTACT.pricingDisclaimer,
  rulesList: INITIAL_HOSTEL_RULES,
  videoUrl: '',
  videoSummary: '',
};

const DEFAULT_INSTITUTE_SETTINGS: SiteOrgSettings = {
  primaryPhone: INSTITUTE_CONTACT.chiefExecutivePhones[0],
  secondaryPhone: INSTITUTE_CONTACT.chiefExecutivePhones[1],
  whatsappPhone: INSTITUTE_CONTACT.primaryWhatsapp,
  addressSummary: INSTITUTE_CONTACT.address,
  announcementBanner: 'Admissions Open on Limited Seats — Matric Science (Min. 45% Marks) Eligible for Principal FSc-Level Diplomas.',
  regulatoryReviewNote: INSTITUTE_CONTACT.regulatoryReferences.verificationDisclaimer,
  rulesList: INSTITUTE_CONTACT.regulatoryReferences.sourceDiscrepancyNotes,
  videoUrl: INSTITUTE_CONTACT.promotionalVideoUrl,
  videoSummary: INSTITUTE_CONTACT.promotionalVideoSummary,
};

const BOOTSTRAPPED_ADMIN_EMAIL = 'moaviahassan124@gmail.com';

const AppContext = createContext<AppContextValue | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const [hostelPricing, setHostelPricing] = useState<HostelRoomTier[]>(INITIAL_HOSTEL_PRICING);
  const [courses, setCourses] = useState<MedicalCourse[]>(INITIAL_MEDICAL_COURSES);
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(INITIAL_GALLERY_ITEMS);
  const [hostelSettings, setHostelSettings] = useState<SiteOrgSettings>(DEFAULT_HOSTEL_SETTINGS);
  const [instituteSettings, setInstituteSettings] = useState<SiteOrgSettings>(DEFAULT_INSTITUTE_SETTINGS);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.emailVerified) {
        if (currentUser.email === BOOTSTRAPPED_ADMIN_EMAIL) {
          setIsAdmin(true);
        } else {
          try {
            const adminSnap = await getDoc(doc(db, 'admins', currentUser.uid));
            setIsAdmin(adminSnap.exists());
          } catch {
            setIsAdmin(false);
          }
        }
      } else {
        setIsAdmin(false);
      }
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // Live sync of public CMS overrides when administrators publish custom records
  useEffect(() => {
    const pricingQuery = query(collection(db, 'roomPricing'), where('visibility', '==', 'public'));
    const unsubPricing = onSnapshot(
      pricingQuery,
      (snap) => {
        if (!snap.empty) {
          const loaded: HostelRoomTier[] = snap.docs
            .map((d) => {
              const data = d.data();
              const fallback = INITIAL_HOSTEL_PRICING.find((p) => p.id === d.id);
              return {
                id: d.id,
                title: String(data.title || fallback?.title || ''),
                pricePkr: Number(data.pricePkr ?? fallback?.pricePkr ?? 0),
                billingPeriod: (data.billingPeriod as HostelRoomTier['billingPeriod']) || 'per month',
                availabilityNote: String(data.availabilityNote || ''),
                summary: String(data.summary || ''),
                includedHighlights: fallback?.includedHighlights || [
                  '24-hour security & CCTV surveillance',
                  'Subject to confirmation by hostel management',
                ],
                isDeposit: d.id === 'security-deposit',
                sortOrder: Number(data.sortOrder ?? 99),
              };
            })
            .sort((a, b) => a.sortOrder - b.sortOrder);
          setHostelPricing(loaded);
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'roomPricing');
        } catch {
          // Keep verified static baseline if offline
        }
      }
    );

    const coursesQuery = query(collection(db, 'courses'), where('visibility', '==', 'public'));
    const unsubCourses = onSnapshot(
      coursesQuery,
      (snap) => {
        if (!snap.empty) {
          const overrides = new Map<string, Record<string, unknown>>();
          snap.docs.forEach((d) => overrides.set(d.id, d.data()));
          const merged = INITIAL_MEDICAL_COURSES.map((base) => {
            const ov = overrides.get(base.id);
            if (!ov) return base;
            return {
              ...base,
              title: String(ov.title || base.title),
              category: (ov.category as 'principal' | 'additional') || base.category,
              durationLabel: String(ov.durationLabel || base.durationLabel),
              overview: String(ov.overview || base.overview),
              admissionOpen: Boolean(ov.admissionOpen ?? base.admissionOpen),
              sortOrder: Number(ov.sortOrder ?? base.sortOrder),
            };
          });
          setCourses(merged.sort((a, b) => a.sortOrder - b.sortOrder));
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'courses');
        } catch {
          // Keep static baseline
        }
      }
    );

    const galleryQuery = query(collection(db, 'galleryItems'), where('visibility', '==', 'public'));
    const unsubGallery = onSnapshot(
      galleryQuery,
      (snap) => {
        if (!snap.empty) {
          const customItems: GalleryItem[] = snap.docs.map((d) => {
            const data = d.data();
            return {
              id: d.id,
              organization: (data.organization as 'hostel' | 'institute') || 'institute',
              title: String(data.title || ''),
              category: String(data.category || 'Campus'),
              sourceClassification:
                (data.sourceClassification as GalleryItem['sourceClassification']) || 'real_campus_photo',
              mediaUrl: String(data.mediaUrl || ''),
              description: String(data.description || ''),
            };
          });
          const customIds = new Set(customItems.map((i) => i.id));
          setGalleryItems([
            ...customItems,
            ...INITIAL_GALLERY_ITEMS.filter((item) => !customIds.has(item.id)),
          ]);
        }
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'galleryItems');
        } catch {
          // Keep static baseline
        }
      }
    );

    const settingsQuery = query(collection(db, 'siteSettings'), where('visibility', '==', 'public'));
    const unsubSettings = onSnapshot(
      settingsQuery,
      (snap) => {
        snap.docs.forEach((d) => {
          const data = d.data();
          const parsed: SiteOrgSettings = {
            primaryPhone: String(data.primaryPhone || ''),
            secondaryPhone: String(data.secondaryPhone || ''),
            whatsappPhone: String(data.whatsappPhone || ''),
            addressSummary: String(data.addressSummary || ''),
            announcementBanner: String(data.announcementBanner || ''),
            regulatoryReviewNote: String(data.regulatoryReviewNote || ''),
            rulesList: Array.isArray(data.rulesList) ? data.rulesList.map(String) : [],
            videoUrl: String(data.videoUrl || ''),
            videoSummary: String(data.videoSummary || ''),
          };
          if (data.organization === 'hostel') {
            setHostelSettings(parsed);
          } else if (data.organization === 'institute') {
            setInstituteSettings(parsed);
          }
        });
      },
      (err) => {
        try {
          handleFirestoreError(err, OperationType.LIST, 'siteSettings');
        } catch {
          // Keep static baseline
        }
      }
    );

    return () => {
      unsubPricing();
      unsubCourses();
      unsubGallery();
      unsubSettings();
    };
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  };

  const logout = async (): Promise<void> => {
    await signOut(auth);
  };

  return (
    <AppContext.Provider
      value={{
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
