// lib/dna-quiz.ts — Healing DNA Quiz: 5 questions → 9-dimension weight profile

export interface DNAQuestion {
  id: number;
  text: string;
  options: DNAOption[];
}

export interface DNAOption {
  emoji: string;
  label: string;
  sublabel: string;  // 映射提示
  weights: Partial<Record<ScoreKey, number>>;  // 对9维的权重贡献
}

export type ScoreKey = 'serenity' | 'nature' | 'climate' | 'affordability' | 'wellness' | 'community' | 'wifi' | 'visa' | 'medical';

export interface DNAProfile {
  type: string;          // 人格类型名 e.g. "Deep-Sea Restorer"
  emoji: string;         // 人格emoji
  description: string;   // 一句话描述
  traits: string[];      // 3-4个trait标签
  weights: Record<ScoreKey, number>;  // 9维权重 1-10
  createdAt: number;     // timestamp
}

// 5道题
export const DNA_QUESTIONS: DNAQuestion[] = [
  {
    id: 1,
    text: "Saturday morning, you reach for…",
    options: [
      { emoji: "☕", label: "Silent coffee & journal", sublabel: "→ Serenity ↑↑", weights: { serenity: 3, wellness: 1 } },
      { emoji: "🧘", label: "Sunrise yoga session", sublabel: "→ Wellness ↑↑", weights: { wellness: 3, serenity: 1 } },
      { emoji: "👥", label: "Brunch with friends", sublabel: "→ Community ↑ Culture ↑", weights: { community: 2, nature: 1 } },
      { emoji: "🌲", label: "Hike into the hills", sublabel: "→ Nature ↑↑", weights: { nature: 3, climate: 1 } },
    ],
  },
  {
    id: 2,
    text: "Your ideal evening sounds like…",
    options: [
      { emoji: "🌅", label: "Watching the sunset alone", sublabel: "→ Serenity ↑ Affordability ↑", weights: { serenity: 2, affordability: 1 } },
      { emoji: "🎵", label: "Live music & local culture", sublabel: "→ Community ↑ Culture ↑", weights: { community: 2, wellness: 1 } },
      { emoji: "🛁", label: "Spa & early sleep", sublabel: "→ Wellness ↑↑", weights: { wellness: 3, medical: 1 } },
      { emoji: "🌙", label: "Stargazing far from city", sublabel: "→ Nature ↑ Serenity ↑", weights: { nature: 2, serenity: 1 } },
    ],
  },
  {
    id: 3,
    text: "What would make you leave a place early?",
    options: [
      { emoji: "📶", label: "No reliable WiFi", sublabel: "→ WiFi ↑↑", weights: { wifi: 3 } },
      { emoji: "💸", label: "Running out of money", sublabel: "→ Affordability ↑↑", weights: { affordability: 3 } },
      { emoji: "🏥", label: "Feeling medically unsafe", sublabel: "→ Medical ↑↑", weights: { medical: 3 } },
      { emoji: "📢", label: "Too noisy & crowded", sublabel: "→ Serenity ↑↑", weights: { serenity: 3 } },
    ],
  },
  {
    id: 4,
    text: "You're planning a month away. Your priority is…",
    options: [
      { emoji: "🧘", label: "Deep healing & recovery", sublabel: "→ Wellness ↑ Serenity ↑", weights: { wellness: 2, serenity: 1 } },
      { emoji: "🌿", label: "Immersing in nature", sublabel: "→ Nature ↑↑ Climate ↑", weights: { nature: 2, climate: 1 } },
      { emoji: "🤝", label: "Meeting like-minded people", sublabel: "→ Community ↑↑", weights: { community: 3 } },
      { emoji: "✈️", label: "Easy visa & affordable", sublabel: "→ Visa ↑ Affordability ↑", weights: { visa: 2, affordability: 1 } },
    ],
  },
  {
    id: 5,
    text: "Complete this: 'I heal best when I'm…'",
    options: [
      { emoji: "🌊", label: "By the ocean", sublabel: "→ Nature ↑ Serenity ↑", weights: { nature: 2, serenity: 1 } },
      { emoji: "🏔️", label: "In the mountains", sublabel: "→ Nature ↑ Climate ↑", weights: { nature: 1, climate: 2 } },
      { emoji: "🙏", label: "In spiritual practice", sublabel: "→ Wellness ↑↑ Serenity ↑", weights: { wellness: 2, serenity: 1 } },
      { emoji: "🏡", label: "In a cozy home base", sublabel: "→ WiFi ↑ Affordability ↑", weights: { wifi: 1, affordability: 1, medical: 1 } },
    ],
  },
];

// 人格类型映射表
const PERSONALITY_TYPES: { threshold: (w: Record<ScoreKey, number>) => boolean; type: string; emoji: string; description: string; traits: string[] }[] = [
  {
    threshold: (w) => w.serenity >= 7 && w.nature >= 6,
    type: "Deep-Sea Restorer",
    emoji: "🌊",
    description: "You heal through stillness, water, and solitude",
    traits: ["Silent Mornings", "Ocean Draw", "Introvert-Recharge", "Slow Pace"],
  },
  {
    threshold: (w) => w.wellness >= 7 && w.serenity >= 5,
    type: "Forest Seeker",
    emoji: "🌿",
    description: "You heal through spiritual practice and natural immersion",
    traits: ["Yoga Flow", "Meditation Deep", "Nature Bond", "Mindful Living"],
  },
  {
    threshold: (w) => w.community >= 7,
    type: "Harmony Weaver",
    emoji: "🤝",
    description: "You heal through connection, shared experience, and belonging",
    traits: ["Social Healing", "Group Energy", "Cultural Curious", "Open Heart"],
  },
  {
    threshold: (w) => w.nature >= 7 && w.climate >= 5,
    type: "Mountain Alchemist",
    emoji: "🏔️",
    description: "You heal through altitude, fresh air, and physical challenge",
    traits: ["Adventure Soul", "Peak Seeker", "Fresh Air Craver", "Active Reset"],
  },
  {
    threshold: (w) => w.affordability >= 7 || w.visa >= 6,
    type: "Free Spirit Nomad",
    emoji: "✈️",
    description: "You heal through freedom, flexibility, and open roads",
    traits: ["Visa Savvy", "Budget Wise", "Spontaneous", "Borderless Mind"],
  },
  {
    threshold: () => true,  // default fallback
    type: "Gentle Explorer",
    emoji: "🌱",
    description: "You heal through balance, curiosity, and gentle discovery",
    traits: ["Balanced Soul", "Curious Mind", "Gentle Pace", "Open Discovery"],
  },
];

/**
 * 从5题答案计算9维权重并匹配人格类型
 * @param answers - 5个选项的index数组 [0, 2, 1, 0, 3]
 * @returns DNAProfile
 */
export function calculateDNAProfile(answers: number[]): DNAProfile {
  // 初始化9维基础值（每维基础3分，总分范围3-10）
  const weights: Record<ScoreKey, number> = {
    serenity: 3, nature: 3, climate: 3, affordability: 3,
    wellness: 3, community: 3, wifi: 3, visa: 3, medical: 3,
  };

  // 累加每题选中选项的权重
  answers.forEach((optionIndex, qIndex) => {
    const question = DNA_QUESTIONS[qIndex];
    const option = question.options[optionIndex];
    for (const [key, value] of Object.entries(option.weights)) {
      weights[key as ScoreKey] = Math.min(10, (weights[key as ScoreKey] || 3) + value);
    }
  });

  // 匹配人格类型（按顺序匹配第一个满足threshold的）
  const personality = PERSONALITY_TYPES.find(p => p.threshold(weights)) || PERSONALITY_TYPES[PERSONALITY_TYPES.length - 1];

  return {
    type: personality.type,
    emoji: personality.emoji,
    description: personality.description,
    traits: personality.traits,
    weights,
    createdAt: Date.now(),
  };
}

/**
 * 计算用户画像与目的地的匹配度（余弦相似度 × 100）
 * @param profile - 用户DNA画像
 * @param destinationScores - 目的地9维评分 (1-5)
 * @returns 匹配度百分比 0-100
 */
export function calculateMatchScore(
  profile: DNAProfile,
  destinationScores: Record<ScoreKey, number>
): number {
  const dims: ScoreKey[] = ['serenity', 'nature', 'climate', 'affordability', 'wellness', 'community', 'wifi', 'visa', 'medical'];

  let dotProduct = 0;
  let userNorm = 0;
  let destNorm = 0;

  for (const dim of dims) {
    const userVal = profile.weights[dim] / 10;  // 归一化到0-1
    const destVal = destinationScores[dim] / 5;  // 归一化到0-1
    dotProduct += userVal * destVal;
    userNorm += userVal * userVal;
    destNorm += destVal * destVal;
  }

  const denominator = Math.sqrt(userNorm) * Math.sqrt(destNorm);
  if (denominator === 0) return 0;

  // 余弦相似度范围0-1，映射到0-100
  const similarity = dotProduct / denominator;
  return Math.round(similarity * 100);
}

// localStorage 操作
const STORAGE_KEY = 'serenestay_dna_profile';

export function saveDNAProfile(profile: DNAProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadDNAProfile(): DNAProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return null;
}

export function clearDNAProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Quick Shift 预设偏移
 */
export const QUICK_SHIFTS = [
  { label: "🤝 I want more social", delta: { community: 2, wellness: -1 } as Partial<Record<ScoreKey, number>> },
  { label: "💰 I need cheaper", delta: { affordability: 2, wifi: -1 } as Partial<Record<ScoreKey, number>> },
  { label: "🏥 Not too remote", delta: { medical: 2, wifi: 1 } as Partial<Record<ScoreKey, number>> },
  { label: "🔄 Retake test", delta: null },
];

export function applyQuickShift(profile: DNAProfile, shift: typeof QUICK_SHIFTS[0]): DNAProfile {
  if (!shift.delta) return profile; // retake test 由UI层处理
  const newWeights = { ...profile.weights };
  for (const [key, value] of Object.entries(shift.delta)) {
    newWeights[key as ScoreKey] = Math.max(1, Math.min(10, (newWeights[key as ScoreKey] || 3) + value));
  }
  return { ...profile, weights: newWeights };
}

export function updateWeights(profile: DNAProfile, newWeights: Record<ScoreKey, number>): DNAProfile {
  return { ...profile, weights: newWeights };
}
