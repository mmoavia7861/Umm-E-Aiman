import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPortalSearchIndex,
  getSearchCategoryCounts,
  normalizeSearchText,
  searchPortalIndex,
} from './portalSearch';

test('buildPortalSearchIndex indexes all courses, institute facilities, hostel facilities, pricing, and FAQs', () => {
  const index = buildPortalSearchIndex();
  const courses = index.filter((i) => i.category === 'course');
  const instFacilities = index.filter((i) => i.category === 'facility' && i.organization === 'institute');
  const hostelFacilities = index.filter((i) => i.category === 'facility' && i.organization === 'hostel');
  const pricing = index.filter((i) => i.category === 'pricing');

  assert.equal(courses.length, 11);
  assert.equal(instFacilities.length, 8);
  assert.equal(hostelFacilities.length, 14);
  assert.equal(pricing.length, 4);
});

test('searchPortalIndex ranks exact course acronyms and matches laboratory equipment keywords', () => {
  const index = buildPortalSearchIndex();

  const mltResults = searchPortalIndex(index, 'MLT');
  assert.ok(mltResults.length >= 1);
  assert.equal(mltResults[0].entityId, 'mlt');
  assert.equal(mltResults[0].organization, 'institute');
  assert.equal(mltResults[0].href, '/paramedical-institute/courses?focus=mlt');

  const microscopeResults = searchPortalIndex(index, 'microscope centrifuge');
  assert.ok(microscopeResults.length >= 2);
  const matchedIds = microscopeResults.map((r) => r.entityId);
  assert.ok(matchedIds.includes('medical-lab'));
  assert.ok(matchedIds.includes('mlt'));
});

test('searchPortalIndex handles hyphen-insensitive facility lookups like wifi and cctv', () => {
  const index = buildPortalSearchIndex();
  assert.equal(normalizeSearchText('Wi-Fi & Internet!'), 'wi fi internet');

  const wifiResults = searchPortalIndex(index, 'wifi');
  assert.ok(wifiResults.length >= 1);
  assert.equal(wifiResults[0].entityId, 'wifi');
  assert.equal(wifiResults[0].organization, 'hostel');
  assert.equal(wifiResults[0].href, '/girls-hostel/facilities?focus=wifi');

  const cctvResults = searchPortalIndex(index, 'CCTV');
  assert.ok(cctvResults.some((r) => r.entityId === 'cctv' && r.organization === 'hostel'));
});

test('searchPortalIndex enforces strict organization and category filters', () => {
  const index = buildPortalSearchIndex();

  // Searching "security" returns hostel security facilities & deposit; filtering to institute returns 0 hostel items
  const hostelSecurity = searchPortalIndex(index, 'security', { organization: 'hostel' });
  assert.ok(hostelSecurity.length >= 2);
  assert.ok(hostelSecurity.every((item) => item.organization === 'hostel'));

  const instSecurity = searchPortalIndex(index, 'security', { organization: 'institute' });
  assert.ok(instSecurity.every((item) => item.organization === 'institute'));

  // Category counts align with filtered results
  const counts = getSearchCategoryCounts(index, 'pharmacy');
  assert.ok(counts.course >= 2); // Pharmacy Technician + Dispenser
  assert.ok(counts.facility >= 1); // Pharmacy Laboratory
  assert.equal(counts.all, counts.course + counts.facility + counts.pricing + counts.faq);
});

test('searchPortalIndex returns empty array cleanly when no courses or facilities match', () => {
  const index = buildPortalSearchIndex();
  const none = searchPortalIndex(index, 'quantum-astrophysics-xyz');
  assert.deepEqual(none, []);
});
