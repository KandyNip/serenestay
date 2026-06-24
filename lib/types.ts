// lib/types.ts — SereneStay.ai TypeScript Types
// Based on actual data structure from serenestay-destinations.json

// ============================================================
// Destination Data Types (matching actual 56-destination dataset)
// ============================================================

export interface DestinationScores {
  serenity: number;      // 1-5, 宁静度
  nature: number;        // 1-5, 自然环境
  climate: number;       // 1-5, 气候舒适度
  affordability: number; // 1-5,  affordability (5=最便宜)
  wellness: number;      // 1-5, 疗愈资源
  community: number;     // 1-5, 社群氛围
  wifi: number;          // 1-5, 网络质量
  visa: number;          // 1-5, 签证友好度
  medical: number;       // 1-5, 医疗条件
}

export interface MonthlyCost {
  currency: string;      // "USD"
  budget: number;        // 最低生活成本
  mid: number;           // 中等生活成本
  comfort: number;       // 舒适生活成本
}

export interface BestSeason {
  months: string[];      // ["Nov", "Dec", "Jan", "Feb"]
  description: string;   // 季节说明
}

export interface PracticalInfo {
  gettingThere: string;  // 如何到达
  wifi: string;          // WiFi情况
  medical: string;       // 医疗条件
  visa: string;          // 签证信息
  tips: string;          // 实用建议（整段文字）
}

export type GeoTag = 'coastal' | 'mountain' | 'island' | 'forest' | 'lake' | 'river' | 'city' | 'countryside';

export interface Destination {
  id: string;                    // "th-chiangmai"
  slug: string;                  // "chiang-mai"
  name: string;                  // "Chiang Mai"
  country: string;               // "Thailand"
  region: string;                // "Southeast Asia"
  tagline: string;               // 一句话描述
  description: string;           // 详细描述
  scores: DestinationScores;     // 9维评分 (1-5)
  monthlyCost: MonthlyCost;      // 月度成本
  bestSeason: BestSeason;        // 最佳季节
  tags: string[];                // 标签
  highlights: string[];          // 亮点
  practicalInfo: PracticalInfo;  // 实用信息
  vetoWarning: string | null;    // Hard Veto警告信息 (WiFi/Medical ≤ 2)
  images: string[];              // 图片URL数组
  pros: string[];                // 优点列表
  cons: string[];                // 缺点列表
  healingTags: string[];         // 疗愈标签
  emotionalTagline: string;      // 情感标语
  youtubeId?: string;            // YouTube视频ID（可选，用于嵌入视频）
  geoTags: GeoTag[];             // 地理标签（用于硬约束过滤）
}

// ============================================================
// AI Chat Types
// ============================================================

export type ChatRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

// Frontend Message type (extends ChatMessage with id for React keys)
export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  quickReplies?: { label: string; message: string }[];
  _itineraryData?: any; // SavedItinerary data for View Full Itinerary button
}

// User preferences for AI matching
export interface UserPreferences {
  budget?: number;
  region?: string;
  healingFocus?: string;
  community?: boolean;
  nature?: boolean;
  wifi?: boolean;
  tags?: string[];
}

export interface ChatRequest {
  messages: ChatMessage[];
  promptId?: string;
  stream?: boolean;
  isProUser?: boolean;
}

export interface DeepSeekChoice {
  index: number;
  message?: {
    role: string;
    content: string;
  };
  delta?: {
    role?: string;
    content?: string;
  };
  finish_reason: string | null;
}

export interface DeepSeekStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChoice[];
}

export interface DeepSeekResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: DeepSeekChoice[];
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// ============================================================
// API Response Types
// ============================================================

export interface ApiError {
  error: {
    code: string;
    message: string;
  };
}

export interface MatchResult {
  destinations: Destination[];
  reasoning: string;
  followUpQuestions: string[];
}

// ============================================================
// Score Labels (for UI display)
// ============================================================

export const SCORE_LABELS: Record<number, string> = {
  1: 'Limited',
  2: 'Basic',
  3: 'Solid',
  4: 'Excellent',
  5: 'Outstanding',
};

export const SCORE_DIMENSIONS = [
  { key: 'serenity', label: 'Serenity', description: 'Peace and quiet' },
  { key: 'nature', label: 'Nature', description: 'Natural environment' },
  { key: 'climate', label: 'Climate', description: 'Weather comfort' },
  { key: 'affordability', label: 'Affordability', description: 'Cost of living' },
  { key: 'wellness', label: 'Wellness', description: 'Healing resources' },
  { key: 'community', label: 'Community', description: 'Social vibe' },
  { key: 'wifi', label: 'WiFi', description: 'Internet quality' },
  { key: 'visa', label: 'Visa', description: 'Visa friendliness' },
  { key: 'medical', label: 'Medical', description: 'Healthcare access' },
] as const;
