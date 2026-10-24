# Firestore Zero-Trust Security Specification (`security_spec.md`)

## 1. Master Sources of Truth & Data Invariants

1. **Default-Deny Catch-All**: All paths not explicitly matched deny both `read` and `write`.
2. **Verified Authentication & Anti-Email-Spoofing**: Every authenticated write and admin check mandates `request.auth != null && request.auth.token.email_verified == true`. Matching `moaviahassan124@gmail.com` with `email_verified == false` is strictly rejected.
3. **Identity Integrity (`applicantUid`)**: Every PII submission (`hostelInquiries`, `admissionInquiries`, `admissionApplications`, `contactMessages`, `documents`) must set `applicantUid == request.auth.uid` on `create` and keep `applicantUid` immutable on `update`.
4. **Master Gate Relational Sync**: Every `/admissionApplications/{applicationId}/documents/{docId}` write requires `exists(/databases/$(database)/documents/admissionApplications/$(applicationId))` and verifies parent ownership (`parent.applicantUid == request.auth.uid`), preventing orphaned document uploads.
5. **PII & Private Document Isolation**: Only the `applicantUid` owner or a verified administrator (`isAdmin()`) can read `hostelInquiries`, `admissionInquiries`, `admissionApplications`, `documents`, or `contactMessages`. No blanket `isSignedIn()` reads exist anywhere.
6. **Zero-Cost-Explosion `allow list`**: No `get()` or `exists()` calls appear inside any `allow list` rule. Private `list` rules enforce `resource.data.applicantUid == request.auth.uid || isBootstrappedAdmin()`, and public catalog `list` rules enforce `resource.data.visibility == 'public' || isBootstrappedAdmin()`.
7. **Strict Schema & Shadow-Field Prevention**: Every `create` enforces `hasAll` + `hasOnly` key allowlists, string `.size()` bounds, regex patterns, and initial status gates (`status == 'New Inquiry'` or `'Submitted'`, `adminNotes == ''`). Every `update` wraps `isValid[Entity](incoming())` around explicit action branches using `affectedKeys().hasOnly(...)`.
8. **Temporal & Terminal State Locking**: `createdAt == request.time` on `create` (and immutable thereafter); `updatedAt == request.time` on `update`. Terminal statuses (`Closed`, `Accepted`, `Rejected`) block non-admin modifications across `hostelInquiries`, `admissionInquiries`, and `admissionApplications`.

## 2. The "Dirty Dozen" Adversarial Payloads (Must Return `PERMISSION_DENIED`)

1. **Shadow Field Injection (`hostelInquiries`)**: Valid inquiry payload + `{ "isVerified": true }` -> Rejected by `data.keys().hasOnly(...)`.
2. **Unverified Admin Email Spoof (`admins` / `roomPricing`)**: Token with `email: "moaviahassan124@gmail.com"` and `email_verified: false` -> Rejected by `isVerifiedSignedIn()`.
3. **Applicant UID Spoofing (`admissionApplications`)**: Authenticated `uid_A` creates application with `applicantUid: "uid_B"` -> Rejected by `incoming().applicantUid == request.auth.uid`.
4. **Self-Accepted Admission Shortcutting (`admissionApplications`)**: Applicant creates application with `status: "Accepted"` -> Rejected by initial status gate `incoming().status == 'Submitted'`.
5. **Cross-Tenant PII Scraping (`hostelInquiries` `get` / `list`)**: Authenticated `uid_B` attempts to read `uid_A`'s inquiry -> Rejected by `existing().applicantUid == request.auth.uid || isAdmin()`.
6. **Orphaned Private Document Upload (`documents`)**: Uploading a CNIC to non-existent `/admissionApplications/ghost_999/documents/doc_1` -> Rejected by `exists(...)` Master Gate.
7. **Cross-Application Document Injection (`documents`)**: `uid_B` uploads a document into `uid_A`'s `applicationId` -> Rejected by `get(...).data.applicantUid == request.auth.uid`.
8. **Denial-of-Wallet 10KB Path ID Poisoning**: Creating `/hostelInquiries/<200-char-junk-id>` -> Rejected by `isValidId(inquiryId)` (`size() <= 128` & `^[a-zA-Z0-9_\-]+$`).
9. **Value Poisoning on Whitelisted Update Key**: Admin or user updates `additionalMessage` with a 50,000-character string or boolean -> Rejected because `isValidHostelInquiry(incoming())` wraps the entire `allow update` block.
10. **Terminal State Re-opening**: Applicant attempts to update `additionalMessage` on a `Closed` inquiry -> Rejected by terminal state lock `existing().status != 'Closed'`.
11. **Forged Client Timestamp**: Submitting `createdAt` in the past or future instead of `serverTimestamp()` (`request.time`) -> Rejected by `incoming().createdAt == request.time`.
12. **Unbounded Array Bomb (`siteSettings.rulesList`)**: Admin or attacker submits 500 rules -> Rejected by `data.rulesList.size() <= 15`.
