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
};

export const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80';

export function getCategoryImage(category: string): string {
  const images = CATEGORY_IMAGES[category.toLowerCase()];
  if (!images || images.length === 0) return DEFAULT_IMAGE;
  // Pick a random image from the category
  return images[Math.floor(Math.random() * images.length)];
}
