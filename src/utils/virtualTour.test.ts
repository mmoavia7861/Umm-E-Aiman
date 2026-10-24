import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_GALLERY_ITEMS, GalleryItem } from '../data/organizationData';
import {
  buildVirtualTourStops,
  filterTourItems,
  formatStopCounter,
  getAdjacentStopIndex,
  getTourCategories,
} from './virtualTour';

const instituteItems = INITIAL_GALLERY_ITEMS.filter((i) => i.organization === 'institute');
const hostelItems = INITIAL_GALLERY_ITEMS.filter((i) => i.organization === 'hostel');

test('getTourCategories extracts unique categories prefixed by All', () => {
  const categories = getTourCategories(instituteItems);
  assert.equal(categories[0], 'All');
  assert.ok(categories.includes('Medical Laboratory'));
  assert.ok(categories.includes('Promotional Posters'));
  assert.ok(categories.includes('Campus Facilities'));
  assert.equal(new Set(categories).size, categories.length);
});

test('filterTourItems filters by category and falls back cleanly on All or unknown category', () => {
  const all = filterTourItems(instituteItems, 'All');
  assert.equal(all.length, instituteItems.length);

  const labOnly = filterTourItems(instituteItems, 'Medical Laboratory');
  assert.equal(labOnly.length, 1);
  assert.equal(labOnly[0].id, 'inst-real-lab');

  const fallback = filterTourItems(instituteItems, 'NonExistentCategory');
  assert.equal(fallback.length, instituteItems.length);
});

test('buildVirtualTourStops enriches institute and hostel items with stop numbers, highlights, and featured tile rules', () => {
  const instStops = buildVirtualTourStops(instituteItems, 'All');
  assert.equal(instStops.length, 7);
  assert.equal(instStops[0].stopNumber, '01');
  assert.equal(instStops[0].isFeaturedTile, true);
  assert.equal(instStops[0].isPlate, false);
  assert.equal(instStops[1].isFeaturedTile, false);
  assert.ok(instStops[0].highlights.length >= 2);

  const singleStop = buildVirtualTourStops(instituteItems, 'Medical Laboratory');
  assert.equal(singleStop.length, 1);
  assert.equal(singleStop[0].isFeaturedTile, false);

  const hostelStops = buildVirtualTourStops(hostelItems, 'All');
  assert.equal(hostelStops.length, 4);
  assert.equal(hostelStops[0].isPlate, true);
  assert.equal(hostelStops[0].isFeaturedTile, true);
  assert.ok(hostelStops[0].zoneLabel.includes('Jhang'));
});

test('buildVirtualTourStops handles custom admin-uploaded gallery items gracefully', () => {
  const customItem: GalleryItem = {
    id: 'custom-hostel-room-1',
    organization: 'hostel',
    title: 'Ventilated Two-Person Student Room',
    category: 'Rooms',
    sourceClassification: 'real_campus_photo',
    mediaUrl: '/assets/custom-room.jpg',
    description: 'Administrator uploaded room photograph in Satellite Town branch.',
  };
  const stops = buildVirtualTourStops([customItem], 'All');
  assert.equal(stops.length, 1);
  assert.equal(stops[0].stopNumber, '01');
  assert.equal(stops[0].isPlate, false);
  assert.ok(stops[0].zoneLabel.includes('Umm-e-Aiman Girls Hostel · Jhang'));
});

test('getAdjacentStopIndex wraps cleanly forward and backward and handles empty lists', () => {
  assert.equal(getAdjacentStopIndex(0, 7, 'prev'), 6);
  assert.equal(getAdjacentStopIndex(6, 7, 'next'), 0);
  assert.equal(getAdjacentStopIndex(2, 7, 'next'), 3);
  assert.equal(getAdjacentStopIndex(2, 7, 'prev'), 1);
  assert.equal(getAdjacentStopIndex(0, 0, 'next'), -1);
});

test('formatStopCounter formats tabular two-digit counters accurately', () => {
  assert.equal(formatStopCounter(0, 7), '01 / 07');
  assert.equal(formatStopCounter(3, 4), '04 / 04');
  assert.equal(formatStopCounter(0, 0), '00 / 00');
});
