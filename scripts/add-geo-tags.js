#!/usr/bin/env node
// Add geoTags to all destinations

const fs = require('fs');
const path = require('path');

const GEO_TAGS_MAP = {
  // Thailand
  'chiang-mai': ['mountain', 'city', 'river'],
  'pai': ['mountain', 'countryside', 'forest'],
  'koh-phangan': ['island', 'coastal'],
  'koh-lanta': ['island', 'coastal'],
  'chiang-rai': ['mountain', 'countryside'],

  // Indonesia
  'ubud': ['forest', 'mountain', 'countryside'],
  'canggu': ['coastal'],
  'gili-air': ['island', 'coastal'],
  'lovina': ['coastal', 'lake'],

  // Vietnam
  'hoi-an': ['coastal', 'river'],
  'da-nang': ['coastal', 'city'],
  'da-lat': ['mountain', 'countryside'],

  // Cambodia
  'siem-reap': ['countryside'],
  'kampot': ['river', 'countryside'],

  // Laos
  'luang-prabang': ['river', 'mountain', 'countryside'],
  'vang-vieng': ['river', 'mountain', 'countryside'],

  // Philippines
  'siargao': ['island', 'coastal'],
  'palawan': ['island', 'coastal', 'forest'],

  // Malaysia
  'penang': ['island', 'coastal', 'city'],
  'langkawi': ['island', 'coastal', 'forest'],

  // India
  'rishikesh': ['mountain', 'forest', 'river'],
  'goa': ['coastal'],
  'dharamshala': ['mountain', 'forest'],
  'auroville': ['coastal', 'countryside'],

  // Sri Lanka
  'unawatuna': ['coastal'],
  'weligama': ['coastal'],
  'ella': ['mountain', 'forest', 'countryside'],

  // Japan
  'okinawa': ['island', 'coastal'],
  'kyoto': ['city', 'mountain'],
  'koyasan': ['mountain', 'forest'],

  // South Korea
  'jeju-island': ['island', 'coastal', 'mountain'],

  // Africa
  'lagos': ['coastal', 'city'],
  'zanzibar': ['island', 'coastal'],
  'cape-town': ['coastal', 'mountain', 'city'],

  // Portugal
  'madeira': ['island', 'coastal', 'mountain'],
  'ericeira': ['coastal'],

  // Spain
  'tenerife': ['island', 'coastal', 'mountain'],
  'granada': ['mountain', 'city'],
  'ibiza': ['island', 'coastal'],

  // Greece
  'crete': ['island', 'coastal', 'mountain'],
  'milos': ['island', 'coastal'],
  'cagliari': ['coastal', 'city'],
  'thessaloniki': ['coastal', 'city'],

  // Mexico
  'oaxaca': ['mountain', 'countryside', 'city'],
  'tulum': ['coastal'],
  'san-cristobal': ['mountain', 'countryside'],
  'sayulita': ['coastal'],

  // Guatemala
  'lake-atitlan': ['lake', 'mountain'],

  // Costa Rica
  'nosara': ['coastal'],

  // Brazil
  'florianopolis': ['island', 'coastal'],
  'pipa': ['coastal'],

  // Colombia
  'medellin': ['mountain', 'city'],
  'minca': ['mountain', 'forest'],

  // Ecuador
  'vilcabamba': ['mountain', 'countryside'],

  // Morocco
  'essaouira': ['coastal'],
  'taghazout': ['coastal'],
};

const dataPath = path.join(__dirname, '..', 'data', 'serenestay-destinations.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

let updated = 0;
for (const dest of data) {
  const tags = GEO_TAGS_MAP[dest.slug];
  if (tags) {
    dest.geoTags = tags;
    updated++;
  } else {
    console.warn(`Warning: No geoTags mapping for ${dest.slug}`);
    dest.geoTags = ['countryside']; // fallback
  }
}

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log(`Updated ${updated}/${data.length} destinations with geoTags`);
