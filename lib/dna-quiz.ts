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
 * 维度顺序常量
 */
export const DIM_ORDER: ScoreKey[] = [
  'serenity', 'nature', 'climate', 'affordability',
  'wellness', 'community', 'wifi', 'visa', 'medical'
];

/**
 * 维度区分力权重（基于56个目的地评分方差归一化，总和=1）
 * 方差大的维度区分力强 → 权重高；方差小的维度区分力弱 → 权重低
 */
export const DIM_VARIANCE_WEIGHTS: Record<ScoreKey, number> = {
  serenity: 0.105,
  nature: 0.063,
  climate: 0.096,
  affordability: 0.158,
  wellness: 0.086,
  community: 0.110,
  wifi: 0.131,
  visa: 0.127,
  medical: 0.126,
};

/**
 * 计算用户画像与目的地的匹配度
 * 三层算法：方差区分力加权 → 加权余弦相似度 → 偏好鲜明度(CV)自适应映射
 *
 * @param profile - 用户DNA画像
 * @param destinationScores - 目的地9维评分 (1-5)
 * @returns 匹配度百分比 0-100
 */
export function calculateMatchScore(
  profile: DNAProfile,
  destinationScores: Record<ScoreKey, number>
): number {
  const dims: ScoreKey[] = ['serenity', 'nature', 'climate', 'affordability', 'wellness', 'community', 'wifi', 'visa', 'medical'];
  const n = dims.length;

  // Step 1: 组合权重 = 用户偏好 × 维度区分力
  const combinedWeights: number[] = [];
  const userVals: number[] = [];
  const destVals: number[] = [];

  for (const dim of dims) {
    combinedWeights.push(profile.weights[dim] * DIM_VARIANCE_WEIGHTS[dim]);
    userVals.push(profile.weights[dim]);
    destVals.push(destinationScores[dim]);
  }

  // Step 2: 加权余弦相似度
  // 公式：Σ(w_i × u_i × d_i) / (√Σ(w_i × u_i²) × √Σ(w_i × d_i²))
  // 权重w_i同时乘在分子和分母的两侧
  let dotProduct = 0;
  let userNorm = 0;
  let destNorm = 0;

  for (let i = 0; i < n; i++) {
    const w = combinedWeights[i];
    dotProduct += w * userVals[i] * destVals[i];
    userNorm += w * userVals[i] * userVals[i];
    destNorm += w * destVals[i] * destVals[i];
  }

  const denominator = Math.sqrt(userNorm) * Math.sqrt(destNorm);
  if (denominator === 0) return 0;
  const cosine = dotProduct / denominator;

  // Step 3: 偏好鲜明度 = 变异系数(CV) = std / mean
  const mean = userVals.reduce((a, b) => a + b, 0) / n;
  const variance = userVals.reduce((a, v) => a + (v - mean) ** 2, 0) / n;
  const std = Math.sqrt(variance);
  const sharpness = std / mean; // CV，通常 0.15（平衡）到 0.55（鲜明）

  // Step 4: 自适应floor
  // 鲜明偏好(sharpness约0.55) → floor=0.60 → 映射区间宽
  // 平衡偏好(sharpness约0.15) → floor=0.88 → 压缩展开
  const clampedSharpness = Math.min(Math.max(sharpness, 0.15), 0.55);
  const floor = 0.88 - (clampedSharpness - 0.15) / (0.55 - 0.15) * (0.88 - 0.60);
  const clampedFloor = Math.min(Math.max(floor, 0.60), 0.90);

  // Step 5: 映射
  // cos >= floor: [clampedFloor, 1.0] → [52, 95]
  // cos < floor: 按比例映射到 [0, 52]，保证最差匹配也有合理下限
  if (cosine >= clampedFloor) {
    return Math.round(52 + ((cosine - clampedFloor) / (1.0 - clampedFloor)) * 43);
  } else {
    return Math.round(Math.max(0, 52 * cosine / clampedFloor));
  }
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
