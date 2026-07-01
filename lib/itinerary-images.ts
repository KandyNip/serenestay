// Unsplash category images for itinerary activities
const CATEGORY_IMAGES: Record<string, string[]> = {
  temple: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80',
    'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=600&q=80',
  ],
  market: [
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80',
    'https://images.unsplash.com/photo-1519567241046-7f570eee3ce6?w=600&q=80',
  ],
  food: [
    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=600&q=80',
  ],
  nature: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80',
  ],
  massage: [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db872?w=600&q=80',
    'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=600&q=80',
  ],
  meditation: [
    'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80',
    'https://images.unsplash.com/photo-1545389336-85ac658599e7?w=600&q=80',
  ],
  yoga: [
    'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=600&q=80',
    'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=600&q=80',
  ],
  garden: [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=600&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80',
  ],
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
    'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80',
  ],
  mountain: [
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80',
  ],
  adventure: [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
    'https://images.unsplash.com/photo-1533240332313-0db49b459ad6?w=600&q=80',
  ],
  nightlife: [
    'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=600&q=80',
    'https://images.unsplash.com/photo-1566417713940-fe7866d6e8fe?w=600&q=80',
  ],
  spa: [
    'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&q=80',
    'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=600&q=80',
  ],
  cafe: [
    'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&q=80',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
  ],
  culture: [
    'https://images.unsplash.com/photo-1533669955142-6a73332af4db?w=600&q=80',
    'https://images.unsplash.com/photo-1528164344705-47542687000d?w=600&q=80',
  ],
  nomad: [
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&q=80',
    'https://images.unsplash.com/photo-1521898284481-a5ec348cb555?w=600&q=80',
  ],
  transport: [
    'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
    'https://images.unsplash.com/photo-1474418397713-7ede21d49117?w=600&q=80',
  ],
  accommodation: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=600&q=80',
  ],
  cooking: [
    'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&q=80',
    'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600&q=80',
  ],
  class: [
    'https://images.unsplash.com/photo-1524178232363-1fb2b075b172?w=600&q=80',
    'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&q=80',
  ],
  workshop: [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
    'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600&q=80',
  ],
  hotel: [
    'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
    'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=600&q=80',
  ],
  park: [
    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80',
    'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?w=600&q=80',
  ],
  lake: [
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80',
  ],
  waterfall: [
    'https://images.unsplash.com/photo-1432405972618-c6b0cfba8673?w=600&q=80',
    'https://images.unsplash.com/photo-1504214208698-ea1916a2195a?w=600&q=80',
  ],
  museum: [
    'https://images.unsplash.com/photo-1554907984-15263bfd63bd?w=600&q=80',
    'https://images.unsplash.com/photo-1566127444979-b3d23654c60d?w=600&q=80',
  ],
  shopping: [
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
    'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80',
  ],
  diving: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80',
    'https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=600&q=80',
  ],
  hiking: [
    'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80',
  ],
  sunset: [
    'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?w=600&q=80',
    'https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=600&q=80',
  ],
  river: [
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80',
    'https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=600&q=80',
  ],
  island: [
    'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  ],
  festival: [
    'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&q=80',
    'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&q=80',
  ],
  art: [
    'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80',
    'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=600&q=80',
  ],
  wellness: [
    'https://images.unsplash.com/photo-1544161515-4ab6ce6db872?w=600&q=80',
    'https://images.unsplash.com/photo-1540555700478-4be289fbec6d?w=600&q=80',
  ],
};

// Lucide icon name fallback for when images fail to load
export const CATEGORY_ICONS: Record<string, string> = {
  temple: 'landmark',
  market: 'shopping-bag',
  food: 'utensils',
  nature: 'leaf',
  massage: 'hand-heart',
  meditation: 'flower-2',
  yoga: 'flower-2',
  garden: 'flower-2',
  beach: 'waves',
  mountain: 'mountain',
  adventure: 'compass',
  nightlife: 'moon',
  spa: 'droplets',
  cafe: 'coffee',
  culture: 'palmtree',
  nomad: 'laptop',
  transport: 'car',
  accommodation: 'home',
  cooking: 'chef-hat',
  class: 'book-open',
  workshop: 'palette',
  hotel: 'building',
  park: 'tree-pine',
  lake: 'waves',
  waterfall: 'droplets',
  museum: 'landmark',
  shopping: 'shopping-bag',
  diving: 'waves',
  hiking: 'footprints',
  sunset: 'sunset',
  river: 'waves',
  island: 'palmtree',
  festival: 'party-popper',
  art: 'palette',
  wellness: 'heart-pulse',
};

export const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80';

export function getCategoryImage(category: string): string {
  const images = CATEGORY_IMAGES[category.toLowerCase()];
  if (!images || images.length === 0) return DEFAULT_IMAGE;
  // Pick a random image from the category
  return images[Math.floor(Math.random() * images.length)];
}

export function getCategoryIconName(category: string): string {
  return CATEGORY_ICONS[category.toLowerCase()] || 'map-pin';
}

export function hasCategoryImage(category: string): boolean {
  const images = CATEGORY_IMAGES[category.toLowerCase()];
  return !!images && images.length > 0;
}
