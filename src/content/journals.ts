export interface JournalEntry {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  image: string;
  gridSize: "large" | "tall" | "wide" | "standard";
}

export const journals: JournalEntry[] = [
  {
    id: "evolution-of-urban-yoga",
    title: "The Evolution of Urban Yoga: Finding Stillness in the Noise",
    excerpt: "How practicing in high-density environments changes the way we connect with our breath and our community.",
    content: "<p>The modern city is a relentless machine of sound, movement, and light. For decades, the traditional approach to yoga has been to retreat—to find a quiet room, shut the blinds, and pretend the world outside doesn't exist.</p><p>But at YogaJam, we ask: what if we lean into the noise? What if we use the pulse of the city as our metronome?</p><h2>The Concrete Sanctuary</h2><p>Urban yoga isn't about escaping reality; it's about anchoring yourself within it. When we practice on a rooftop in Mumbai with traffic roaring below, or in a repurposed warehouse in London with the bass of a deep house track shaking the floorboards, we are forcing our nervous systems to find stillness amidst chaos.</p><blockquote>\"True focus isn't found in silence; it's found when the noise no longer matters.\"</blockquote><p>By blending high-intensity vinyasa with carefully curated electronic soundscapes, we create a sensory-rich environment. This isn't just a workout; it's an active meditation designed for the modern mind.</p><h2>Community Over Isolation</h2><p>The beauty of urban yoga is the collective energy. In a high-density environment, practicing together creates a powerful shared frequency. You aren't just breathing for yourself; you're breathing with fifty other people who are navigating the exact same urban pressures.</p><p>The evolution of yoga is happening right here, in the heart of the city.</p>",
    category: "Culture",
    date: "2023-10-15",
    image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=1200",
    gridSize: "large",
  },
  {
    id: "sound-healing-101",
    title: "Vibrational Medicine: Sound Healing 101",
    excerpt: "The science and spirituality behind deep house yin and crystal bowl sound baths.",
    content: "<p>Sound has been used as a healing modality for thousands of years, from indigenous drumming circles to Tibetan singing bowls. Today, we are rediscovering the power of vibrational medicine through a modern lens.</p><h2>How Sound Affects the Body</h2><p>Everything in the universe is in a state of vibration, including every cell in your body. When we are stressed or ill, our natural frequencies fall out of tune. Sound healing works on the principle of resonance—using specific frequencies to bring the body back into a state of harmonic balance.</p><p>During a YogaJam Deep House Yin session, we utilize low-frequency bass lines to physically vibrate the body, helping to release tension stored deep within the fascia. The rhythmic, repetitive beats act as an anchor, allowing the mind to slip easily into an alpha or theta brainwave state.</p><h2>The Crystal Bowl Experience</h2><p>At the end of an intense practice, we often transition into a sound bath using quartz crystal bowls. These bowls emit pure, penetrating tones that can quite literally be felt moving through the body.</p><ul><li><strong>Root Chakra:</strong> Deep, resonant tones for grounding and safety.</li><li><strong>Heart Chakra:</strong> Mid-range frequencies to promote emotional release.</li><li><strong>Crown Chakra:</strong> High, ethereal tones for spiritual connection.</li></ul><p>Next time you attend a session, pay close attention to how the sound physically feels in your body. You might be surprised by what you discover.</p>",
    category: "Practices",
    date: "2023-10-22",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&q=80&w=1200",
    gridSize: "tall",
  },
  {
    id: "art-of-the-playlist",
    title: "The Art of the Flow Playlist",
    excerpt: "Why the BPM of your music matters just as much as the sequence of your asanas.",
    content: "<p>At YogaJam, music is never an afterthought. It is the architectural framework upon which we build our classes. The right playlist doesn't just sound good; it dictates the biological rhythm of the entire room.</p><h2>BPM and Heart Rate</h2><p>The concept is simple: entrainment. The human heart naturally wants to sync with the dominant rhythm in its environment. By carefully controlling the Beats Per Minute (BPM) of our playlists, our instructors can guide the collective heart rate of the class.</p><p>We start slow (60-80 BPM) to ground the body and match a deep resting breath. As the sequence builds into Sun Salutations and standing postures, the BPM rises (100-120 BPM), driving cardiovascular effort. During the peak flow, we might push into 125+ BPM electronic tracks, pushing the class to their physical edge before dropping the tempo dramatically for the cool-down.</p><h2>Curation as a Craft</h2><p>Our instructors spend hours curating the perfect sonic journey. We lean heavily into atmospheric deep house, ambient techno, and organic downtempo—genres that offer relentless, hypnotic grooves without distracting vocals.</p><p>The next time you're on the mat, let go of counting breaths and simply let the bassline move you.</p>",
    category: "Music",
    date: "2023-11-05",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=1200",
    gridSize: "standard",
  },
  {
    id: "winter-wellness-guide",
    title: "Winter Wellness: Staying Warm from the Inside Out",
    excerpt: "Ayurvedic practices and intense Vinyasa flows designed to build internal heat during the colder months.",
    content: "<p>As the days grow shorter and the air turns crisp, the body naturally wants to contract and conserve energy. While rest is crucial, maintaining internal heat (Agni) is essential for keeping the immune system strong and the mind sharp.</p><h2>The Fire Element in Practice</h2><p>During the winter months, we modify our YogaJam sequences to focus heavily on the core and rapid, heat-building transitions. Expect more repetitions of Sun Salutations, extended holds in fierce poses like Chair (Utkatasana), and dynamic twists to stimulate digestion.</p><h2>Breath of Fire (Kapalabhati)</h2><p>One of the fastest ways to generate internal heat is through Kapalabhati breathwork. This rapid, forceful exhalation technique pumps the abdomen, clearing the respiratory system and instantly warming the blood.</p><blockquote>\"Winter is not a time to stop moving; it is a time to move with deliberate, fiery intention.\"</blockquote><p>Off the mat, we recommend adopting Ayurvedic principles: sipping hot ginger tea throughout the day, favoring warm, cooked root vegetables over raw salads, and ensuring you get plenty of deeply restorative sleep.</p>",
    category: "Wellness",
    date: "2023-11-18",
    image: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&q=80&w=1200",
    gridSize: "wide",
  },
  {
    id: "community-spotlight-mumbai",
    title: "Community Spotlight: The Energy of Mumbai",
    excerpt: "Meet the yogis who are transforming rooftops into sanctuaries across the city that never sleeps.",
    content: "<p>Mumbai operates on a frequency unlike any other city in the world. It is relentless, chaotic, and deeply inspiring. Our Mumbai community reflects this exact energy—they are driven, vibrant, and incredibly dedicated to their practice.</p><h2>Rooftop Sanctuaries</h2><p>Space is a premium in Mumbai, which is why we've taken to the skies. Our signature events take place on open-air rooftops overlooking the Arabian Sea or the glittering skyline of Bandra. There is something profoundly magical about moving through a vinyasa sequence as the sun sets over the ocean, the city humming below you.</p><h2>Meet the Instructors</h2><p>Our Mumbai lead, Aisha, brings a background in contemporary dance to her flows, creating sequences that are exceptionally fluid and highly demanding. \"The people here work incredibly hard,\" she says. \"They come to the mat to release that tension, to sweat, and to feel completely free for 60 minutes.\"</p><p>If you're ever in the city, joining a YogaJam Mumbai session is an absolute must.</p>",
    category: "Community",
    date: "2023-12-02",
    image: "https://images.unsplash.com/photo-1570168007204-dfb528c6958f?auto=format&fit=crop&q=80&w=1200",
    gridSize: "standard",
  },
  {
    id: "breathwork-breakthrough",
    title: "Breathwork Breakthroughs",
    excerpt: "How 10 minutes of intentional breathing can completely rewire your nervous system before a big meeting.",
    content: "<p>We take about 22,000 breaths a day, mostly unconsciously. But what happens when we take conscious control of the wheel? The results are immediate, profound, and scientifically proven.</p><h2>The Sympathetic Shift</h2><p>In our modern, high-stress lives, many of us are trapped in a state of chronic sympathetic nervous system activation—the \"fight or flight\" response. This leads to shallow chest breathing, anxiety, and burnout.</p><p>Intentional breathwork is the fastest physiological hack to switch from sympathetic to parasympathetic (rest and digest) dominance.</p><h2>The 4-7-8 Technique</h2><p>Before your next high-pressure presentation or stressful conversation, try this simple technique for three minutes:</p><ol><li>Inhale quietly through your nose for 4 seconds.</li><li>Hold your breath for 7 seconds.</li><li>Exhale completely through your mouth, making a whoosh sound, for 8 seconds.</li></ol><p>This extended exhalation forces the heart rate to slow down, signaling to the brain that you are safe. At YogaJam, we incorporate advanced variations of these techniques into every class, ensuring you leave the mat biologically reset.</p>",
    category: "Practices",
    date: "2023-12-15",
    image: "https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&q=80&w=1200",
    gridSize: "tall",
  },
  {
    id: "nutrition-for-movement",
    title: "Fueling the Flow: Plant-Based Nutrition",
    excerpt: "Optimizing your energy levels for high-intensity movement with simple, whole-food plant-based recipes.",
    content: "<p>A high-intensity YogaJam flow demands serious energy. What you consume before and after your practice fundamentally dictates your performance on the mat and your recovery off it.</p><h2>Pre-Flow Fuel</h2><p>You want easily digestible carbohydrates that provide sustained energy without weighing you down. We recommend eating a small snack 60-90 minutes before a session.</p><ul><li>Half a banana with almond butter</li><li>A small handful of dates</li><li>A slice of sourdough with avocado</li></ul><h2>Post-Flow Recovery</h2><p>After sweating it out under the blacklights, your body needs to replenish glycogen stores and repair muscle tissue. This is the time for a balanced mix of complex carbs and plant-based protein.</p><p>Our favorite post-jam smoothie: 1 scoop of pea protein, half a frozen banana, a handful of spinach, 1 tbsp of chia seeds, and unsweetened almond milk. It’s light, hydrating, and packed with everything your body needs to recover.</p><p>Remember, nutrition is highly personal. Listen to your body and adjust accordingly.</p>",
    category: "Wellness",
    date: "2024-01-08",
    image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?auto=format&fit=crop&q=80&w=1200",
    gridSize: "standard",
  }
];
