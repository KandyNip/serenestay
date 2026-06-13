// lib/destinations.ts — Destination data loader
// Loads destination data from JSON file and provides query utilities

import type { Destination, DestinationScores } from './types';

// In production, this loads from /data/serenestay-destinations.json
let _cache: Destination[] | null = null;

/**
 * Load all destinations from the JSON data file.
 * Results are cached in memory after first load.
 */
export async function loadDestinations(): Promise<Destination[]> {
  if (_cache) return _cache;

  try {
    // Use fs for Node.js runtime (not Edge)
    const fs = await import('fs');
    const path = await import('path');
    const dataPath = path.join(process.cwd(), 'data', 'serenestay-destinations.json');
    const raw = fs.readFileSync(dataPath, 'utf-8');
    _cache = JSON.parse(raw) as Destination[];
    return _cache!;
  } catch (error) {
    console.warn('[destinations] Failed to load data file:', error);
    _cache = [];
    return _cache;
  }
}

/**
 * Get a single destination by slug
 */
export async function getDestinationBySlug(
  slug: string
): Promise<Destination | undefined> {
  const destinations = await loadDestinations();
  return destinations.find((d) => d.slug === slug);
}

/**
 * Filter destinations by region
 */
export async function getDestinationsByRegion(
  region: string
): Promise<Destination[]> {
  const destinations = await loadDestinations();
  return destinations.filter(
    (d) => d.region.toLowerCase() === region.toLowerCase()
  );
}

/**
 * Filter destinations by tag
 */
export async function getDestinationsByTag(
  tag: string
): Promise<Destination[]> {
  const destinations = await loadDestinations();
  return destinations.filter((d) =>
    d.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
  );
}

/**
 * Sort destinations by a specific score field
 */
export async function sortDestinations(
  field: keyof DestinationScores,
  order: 'asc' | 'desc' = 'desc'
): Promise<Destination[]> {
  const destinations = await loadDestinations();
  return [...destinations].sort((a, b) => {
    const diff = a.scores[field] - b.scores[field];
    return order === 'desc' ? -diff : diff;
  });
}

/**
 * Get destinations with hard veto warnings (WiFi ≤ 2 or Medical ≤ 2)
 */
export async function getDestinationsWithWarnings(): Promise<
  Array<{ destination: Destination; warnings: string[] }>
> {
  const destinations = await loadDestinations();
  return destinations
    .map((d) => {
      const warnings: string[] = [];
      if (d.scores.wifi <= 2) warnings.push('Limited WiFi connectivity');
      if (d.scores.medical <= 2) warnings.push('Limited medical facilities');
      return { destination: d, warnings };
    })
    .filter((item) => item.warnings.length > 0);
}

/**
 * Get destination summary for AI context injection.
 * Returns a compact string representation with all 9 dimensions.
 */
export async function getDestinationSummary(): Promise<string> {
  const destinations = await loadDestinations();
  return destinations
    .map(
      (d) =>
        `${d.name} (${d.country}, ${d.region}): serenity=${d.scores.serenity}/5, nature=${d.scores.nature}/5, climate=${d.scores.climate}/5, affordability=${d.scores.affordability}/5, wellness=${d.scores.wellness}/5, community=${d.scores.community}/5, wifi=${d.scores.wifi}/5, visa=${d.scores.visa}/5, medical=${d.scores.medical}/5 | Cost: $${d.monthlyCost.mid}/mo | Tags: ${d.tags.join(', ')}`
    )
    .join('\n');
}

/**
 * Check if a destination has hard veto conditions
 */
export function hasHardVeto(destination: Destination): {
  hasVeto: boolean;
  reasons: string[];
} {
  const reasons: string[] = [];
  if (destination.scores.wifi <= 2) reasons.push('WiFi');
  if (destination.scores.medical <= 2) reasons.push('Medical');
  return { hasVeto: reasons.length > 0, reasons };
}
