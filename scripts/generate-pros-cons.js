// scripts/generate-pros-cons.js
// Generate pros and cons for destinations based on their scores and data
// Run: node scripts/generate-pros-cons.js

const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/serenestay-destinations.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Score dimension labels
const scoreLabels = {
  serenity: 'Serenity & peace',
  nature: 'Natural environment',
  climate: 'Climate comfort',
  affordability: 'Affordability',
  wellness: 'Wellness facilities',
  community: 'Community vibe',
  wifi: 'WiFi quality',
  visa: 'Visa friendliness',
  medical: 'Medical access',
};

// Generate pros based on high scores (4-5) and highlights
function generatePros(destination) {
  const pros = [];

  // Add highlights as pros (up to 3)
  if (destination.highlights) {
    destination.highlights.slice(0, 3).forEach(h => pros.push(h));
  }

  // Add high-scoring dimensions as pros
  const highScores = Object.entries(destination.scores || {})
    .filter(([_, score]) => score >= 4)
    .map(([key]) => `${scoreLabels[key]} rated ${destination.scores[key]}/5`);

  pros.push(...highScores.slice(0, 2));

  return pros.slice(0, 5); // Max 5 pros
}

// Generate cons based on low scores (1-2) and veto warnings
function generateCons(destination) {
  const cons = [];

  // Add veto warning as con
  if (destination.vetoWarning) {
    cons.push(destination.vetoWarning);
  }

  // Add low-scoring dimensions as cons
  const lowScores = Object.entries(destination.scores || {})
    .filter(([_, score]) => score <= 2)
    .map(([key]) => `${scoreLabels[key]} limited (${destination.scores[key]}/5)`);

  cons.push(...lowScores);

  // Add seasonal limitations
  if (destination.bestSeason?.description) {
    const desc = destination.bestSeason.description.toLowerCase();
    if (desc.includes('avoid') || desc.includes('monsoon') || desc.includes('burning')) {
      const seasonNote = destination.bestSeason.description.match(/Avoid[^.]*/i);
      if (seasonNote) {
        cons.push(`Best to avoid: ${seasonNote[0].replace(/Avoid:?/i, '').trim()}`);
      }
    }
  }

  return cons.slice(0, 4); // Max 4 cons
}

// Process all destinations
const updatedData = data.map(dest => ({
  ...dest,
  pros: generatePros(dest),
  cons: generateCons(dest),
}));

// Write updated data
fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));

console.log(`✅ Generated pros/cons for ${updatedData.length} destinations`);
console.log('\nSample (Chiang Mai):');
console.log('Pros:', updatedData[0].pros);
console.log('Cons:', updatedData[0].cons);
