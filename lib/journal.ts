export interface JournalArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  publishedAt: string;
  coverImage: string;
  author: string;
  tags: string[];
  relatedDestinations?: { slug: string; name: string }[];
  content: Array<
    | { type: 'paragraph'; text: string }
    | { type: 'heading'; text: string; level: 2 | 3 }
    | { type: 'quote'; text: string; cite?: string }
    | { type: 'list'; items: string[] }
  >;
}

export const journalArticles: JournalArticle[] = [
  {
    slug: 'forest-bathing-science-healing',
    title: 'Forest Bathing: The Science Behind Nature\'s Healing Power',
    excerpt: 'Shinrin-yoku, or forest bathing, is more than a walk in the woods. Emerging research shows it measurably reduces stress hormones, lowers blood pressure, and boosts immune function.',
    category: 'Nature Healing',
    readTime: '6 min read',
    publishedAt: '2025-03-15',
    coverImage: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=1200&q=80',
    author: 'The Serene Stay Journal',
    tags: ['forest-bathing', 'nature-therapy', 'science'],
    relatedDestinations: [
      { slug: 'kyoto', name: 'Kyoto' },
      { slug: 'uji', name: 'Uji' },
    ],
    content: [
      {
        type: 'paragraph',
        text: 'In the 1980s, Japanese researchers began studying something people have known intuitively for millennia: spending time in forests makes us feel better. They called it shinrin-yoku — literally "forest bath," the practice of immersing oneself in the atmosphere of the woods.',
      },
      {
        type: 'heading',
        text: 'What the research tells us',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Studies led by Dr. Qing Li at Nippon Medical School found that just two hours of forest walking over a weekend can reduce cortisol (the stress hormone) by 12-14%, lower blood pressure, and increase natural killer (NK) cell activity by upwards of 40% — with effects lasting up to a week.',
      },
      {
        type: 'list',
        items: [
          'Cortisol reduction: 12-14% on average after a 2-hour forest walk',
          'NK cell activity boost: up to 40%, lasting 7 days',
          'Parasympathetic nervous system activation: measurable within 15 minutes',
          'Improved sleep quality reported by 68% of participants',
        ],
      },
      {
        type: 'quote',
        text: 'The forest does for your body what meditation does for your mind — but without the effort. You simply show up, and the healing begins.',
        cite: 'Dr. Qing Li',
      },
      {
        type: 'heading',
        text: 'It\'s not just in your head',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'The mechanism is fascinating. Trees release essential oils called phytoncides as part of their natural defense system. When we breathe these compounds, our bodies respond by increasing anti-cancer proteins and reducing inflammatory markers. We are, quite literally, being medicated by the forest air.',
      },
      {
        type: 'heading',
        text: 'How to practice',
        level: 3,
      },
      {
        type: 'paragraph',
        text: 'You don\'t need a special retreat or a guide. Forest bathing is simply being in the forest with intention: leave your phone behind, walk slowly, engage all five senses. Touch bark, smell moss, listen to birdsong. The key is presence. Five acres of old-growth forest, practiced regularly, can be more healing than any prescription.',
      },
    ],
  },
  {
    slug: 'hot-spring-retreats-burnout-recovery',
    title: 'Best Hot Spring Retreats for Burnout Recovery',
    excerpt: 'Mineral-rich thermal waters have been used for healing across cultures for millennia. Here\'s how to choose a hot spring retreat that actually restores you — not just another luxury getaway.',
    category: 'Retreats',
    readTime: '7 min read',
    publishedAt: '2025-03-08',
    coverImage: 'https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=80',
    author: 'The Serene Stay Journal',
    tags: ['hot-springs', 'burnout', 'retreats'],
    relatedDestinations: [
      { slug: 'chiang-mai', name: 'Chiang Mai' },
      { slug: 'bali', name: 'Ubud, Bali' },
    ],
    content: [
      {
        type: 'paragraph',
        text: 'Burnout isn\'t tiredness — it\'s a state of emotional, physical, and mental exhaustion caused by prolonged stress. And while a week on a beach might give you a temporary lift, true recovery requires engaging your body\'s rest-and-digest system in a deeper way. This is where thermal waters shine.',
      },
      {
        type: 'heading',
        text: 'Why hot springs work for burnout',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'The buoyancy of warm water unloads your spine and joints, instantly releasing physical tension you didn\'t know you were carrying. Mineral content — magnesium, sulfur, lithium — is absorbed through the skin, with studies showing measurable magnesium absorption after just 20 minutes of soaking. Magnesium is nature\'s muscle relaxant and nervous system calmant.',
      },
      {
        type: 'list',
        items: [
          'Choose mineral springs over heated pools — the minerals matter',
          'Look for places with silence policies or quiet hours',
          'Opt for outdoor/natural settings over resort-style spa complexes',
          'Stay 5-7 days minimum; weekend soaks are not enough for deep recovery',
          'Avoid pairing with "productive" activities — this is about rest, not checklists',
        ],
      },
      {
        type: 'quote',
        text: 'In Japanese onsen culture, the practice is not about the water — it\'s about the letting go that happens when you enter it.',
      },
      {
        type: 'heading',
        text: 'What to expect',
        level: 3,
      },
      {
        type: 'paragraph',
        text: 'Days 1-2 of a proper hot spring retreat often feel like catching up on weeks of lost sleep. Days 3-4, emotional releases are common — unexpected tears, vivid dreams, old memories surfacing. By day 5, a sense of spaciousness returns that you may not have felt in years. This is the nervous system resetting.',
      },
    ],
  },
  {
    slug: 'choosing-silent-meditation-retreat',
    title: 'How to Choose a Silent Meditation Retreat',
    excerpt: 'Silent retreats can be life-changing — or deeply uncomfortable. Here\'s what first-timers should know before committing to 7-10 days of noble silence.',
    category: 'Meditation',
    readTime: '8 min read',
    publishedAt: '2025-02-28',
    coverImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&q=80',
    author: 'The Serene Stay Journal',
    tags: ['meditation', 'vipassana', 'silent-retreat'],
    relatedDestinations: [
      { slug: 'kyoto', name: 'Kyoto' },
      { slug: 'chiang-mai', name: 'Chiang Mai' },
    ],
    content: [
      {
        type: 'paragraph',
        text: 'There\'s something radical about spending a week without speaking. No small talk, no emails, no social media performance — just you, your breath, and whatever arises. Silent meditation retreats are one of the most powerful healing experiences available, but they\'re not for everyone, and not all retreats are created equal.',
      },
      {
        type: 'heading',
        text: 'Know what you\'re signing up for',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Vipassana (Goenka-style) retreats are free, intensive, and rigorous — 10 days, 4am wake-ups, no food after noon, no eye contact. Zen retreats (sesshin) include work practice (samu) and formal meals (oryoki) with strict etiquette. Forest monastery retreats in Thailand offer a more gentle but still disciplined approach.',
      },
      {
        type: 'list',
        items: [
          'Beginners: start with a 3-5 day retreat, not 10',
          'Choose a tradition — don\'t mix techniques from different schools',
          'Read a book about the tradition before you go',
          'Prepare your body: meditate 20-30 min daily for at least two weeks before',
          'Understand that emotional difficulty is normal and part of the process',
        ],
      },
      {
        type: 'quote',
        text: 'Silence isn\'t empty. It\'s full of answers.',
      },
      {
        type: 'heading',
        text: 'Red flags',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Avoid retreats that charge premium prices without clear teacher credentials. Be cautious of centers that demand surrender to a guru figure. Silent retreat is about developing your own awareness, not following a charismatic leader. Good centers are transparent about their lineage, teachers, and financial model.',
      },
    ],
  },
  {
    slug: 'digital-detox-vacation-signs',
    title: '5 Signs You Need a Digital Detox Vacation',
    excerpt: 'When was the last time you went a full day without checking your phone? If you can\'t remember, these signs might be telling you it\'s time.',
    category: 'Digital Detox',
    readTime: '5 min read',
    publishedAt: '2025-02-20',
    coverImage: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&q=80',
    author: 'The Serene Stay Journal',
    tags: ['digital-detox', 'burnout', 'mindfulness'],
    relatedDestinations: [
      { slug: 'uluwatu', name: 'Uluwatu, Bali' },
    ],
    content: [
      {
        type: 'paragraph',
        text: 'We live in an era where the average person touches their phone over 2,600 times per day. The average adult spends 3+ hours daily on social media alone. This constant connectivity is rewiring our nervous systems — and not for the better.',
      },
      {
        type: 'heading',
        text: 'The signs',
        level: 2,
      },
      {
        type: 'list',
        items: [
          'You reach for your phone within 5 minutes of waking — before even getting out of bed',
          'You feel anxious or phantom vibrations when your phone isn\'t nearby',
          'You can\'t finish a book or watch a movie without checking for notifications',
          'Conversations feel flat; you\'re half-listening while scrolling',
          'You haven\'t had a genuinely new idea in months — your thinking is reactive, not creative',
        ],
      },
      {
        type: 'paragraph',
        text: 'A digital detox vacation isn\'t about willpower or punishing yourself. It\'s about creating conditions where your brain can return to its natural state — one where deep focus, daydreaming, and real connection are possible again.',
      },
      {
        type: 'heading',
        text: 'What happens when you disconnect',
        level: 3,
      },
      {
        type: 'paragraph',
        text: 'First 48 hours: restlessness, irritability, boredom. This is withdrawal. Days 3-4: your attention span begins to recover. You notice sounds you\'d forgotten — wind in leaves, birds. By day 7, you may experience what early internet pioneer Linda Stone calls "continuous partial attention" finally dissolving. You return home with a different relationship to your devices — not because you\'ve sworn off technology, but because you\'ve remembered what it feels like to be fully present.',
      },
    ],
  },
  {
    slug: 'ayurveda-first-visit-expectations',
    title: 'Ayurveda Retreats: What to Expect on Your First Visit',
    excerpt: 'Ayurveda is the world\'s oldest continuously practiced healing system, with 5,000 years of tradition behind it. Here\'s how to prepare for your first retreat.',
    category: 'Ayurveda',
    readTime: '7 min read',
    publishedAt: '2025-02-12',
    coverImage: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=1200&q=80',
    author: 'The Serene Stay Journal',
    tags: ['ayurveda', 'wellness', 'retreats'],
    relatedDestinations: [
      { slug: 'kerala', name: 'Kerala' },
      { slug: 'bali', name: 'Ubud, Bali' },
    ],
    content: [
      {
        type: 'paragraph',
        text: 'Walking into an Ayurveda retreat for the first time can feel like stepping into another world — one where food is medicine, your daily routine (dinacharya) is a sacred practice, and treatments involve warm oil poured continuously on your forehead for 45 minutes (shirodhara, and yes, it\'s as incredible as it sounds).',
      },
      {
        type: 'heading',
        text: 'You\'ll receive a consultation first',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'On day one, an Ayurvedic doctor (vaidya) will assess your constitution (prakriti) and current imbalances (vikriti) through pulse reading (nadi pariksha), tongue diagnosis, and detailed questions about your digestion, sleep, and emotional patterns. There is no one-size-fits-all protocol — treatments are customized to you.',
      },
      {
        type: 'list',
        items: [
          'Treatments are daily, often twice daily, for 7-21 days',
          'Food is strictly Ayurvedic — kitchari, seasonal vegetables, ghee, medicinal teas',
          'Days are structured around sunrise/sunset and treatment times',
          'You\'ll likely be asked to abstain from caffeine, alcohol, and heavy foods',
          'Results are cumulative — most people notice shifts by day 5-7',
        ],
      },
      {
        type: 'quote',
        text: 'Ayurveda is not about fighting disease. It\'s about returning to balance — and when balance returns, disease leaves on its own.',
      },
      {
        type: 'heading',
        text: 'Preparing for your retreat',
        level: 3,
      },
      {
        type: 'paragraph',
        text: 'A week before arrival, begin reducing caffeine and processed foods. Arrive well-rested, not after an overnight flight if possible. Bring loose, comfortable clothing you don\'t mind getting oily — you\'ll be receiving abhyanga (oil massage) most days. Leave expectations at the door; Ayurveda works on its own timeline.',
      },
    ],
  },
  {
    slug: 'yoga-retreats-what-really-heals',
    title: 'Beyond Asana: What Actually Heals at Yoga Retreats',
    excerpt: 'Most people book yoga retreats for the physical practice. What changes them is something else entirely.',
    category: 'Yoga',
    readTime: '6 min read',
    publishedAt: '2025-02-05',
    coverImage: 'https://images.unsplash.com/photo-1545389336-cf090694435e?w=1200&q=80',
    author: 'The Serene Stay Journal',
    tags: ['yoga', 'retreats', 'healing'],
    relatedDestinations: [
      { slug: 'rishikesh', name: 'Rishikesh' },
      { slug: 'bali', name: 'Ubud, Bali' },
    ],
    content: [
      {
        type: 'paragraph',
        text: 'Here\'s a secret: the physical yoga (asana) is the least transformative part of a yoga retreat. That\'s not to say the practice doesn\'t matter — it does. But the real healing happens in the spaces between: the silence after meditation, the meal eaten without phone or conversation, the walk at dawn when the world is still sleeping.',
      },
      {
        type: 'heading',
        text: 'Structure is the medicine',
        level: 2,
      },
      {
        type: 'paragraph',
        text: 'Most of us live in a state of constant decision-making: what to eat, when to sleep, what to work on, what to respond to. This is exhausting. At a yoga retreat, the day is structured for you. Wake at 6am for silent meditation, practice at 7, breakfast at 9, workshop at 11. The number of decisions you make in a day drops from hundreds to almost zero. This alone — the cessation of choice fatigue — is deeply restorative.',
      },
      {
        type: 'quote',
        text: 'The postures prepare your body to sit comfortably. Sitting prepares your mind to be still. Stillness is where you remember who you are beyond all the doing.',
      },
      {
        type: 'paragraph',
        text: 'Choose a retreat that balances practice with free time. Avoid retreats that pack 8+ hours of scheduled activity per day — that\'s just vacation burnout in a different package. The best retreats leave generous space for walking, journaling, napping, and doing absolutely nothing.',
      },
    ],
  },
];

export function getArticleBySlug(slug: string): JournalArticle | undefined {
  return journalArticles.find((a) => a.slug === slug);
}
