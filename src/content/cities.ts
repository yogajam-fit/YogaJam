export interface City {
  id: string;
  name: string;
  description: string;
  image: string;
  fullDesc: string;
  locations: string[];
  eventTypes: { name: string; description: string }[];
}

export const activeCities: City[] = [
  {
    id: "bangalore",
    name: "Bangalore",
    description: "The heart of YogaJam. Experience our flagship events across the city's most beautiful spaces.",
    image: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&q=80&w=1200",
    fullDesc: "<p>Bangalore is where YogaJam was born. Known for its perfect weather and vibrant startup culture, we've curated a community of mindful movers who aren't afraid to sweat to heavy basslines.</p><br/><p>From secret rooftop sunsets in Indiranagar to expansive green spaces in the heart of the city, Bengaluru offers the perfect backdrop for our signature high-energy flows and deep house yin sessions.</p>",
    locations: ["Indiranagar", "Koramangala", "Cubbon Park", "Whitefield"],
    eventTypes: [
      { name: "Corporate Wellness", description: "Transform your team's energy with private corporate sessions. From desk-relief stretches to high-energy team building flows." },
      { name: "Private Birthday Jams", description: "Celebrate your day with a private, high-energy flow tailored exclusively to you and your closest friends, complete with a curated playlist." },
      { name: "Brand Activations", description: "Partner with us for unique wellness activations. We create custom, immersive experiences that align with your brand's aesthetic." }
    ]
  },
  {
    id: "mumbai",
    name: "Mumbai",
    description: "Sunset flows by the sea and high-energy rooftop sessions in the city that never sleeps.",
    image: "https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?auto=format&fit=crop&q=80&w=1200",
    fullDesc: "<p>In the city that never sleeps, YogaJam offers a high-frequency escape. Mumbai is all about contrasts—the relentless pace of the city met with the grounding rhythm of the ocean.</p><br/><p>We host exclusive events ranging from serene sunrise flows on Marine Drive to high-octane rooftop vinyasa sessions in Bandra. Our Mumbai community is diverse, energetic, and always ready to move.</p>",
    locations: ["Bandra", "Juhu", "Marine Drive", "Powai"],
    eventTypes: [
      { name: "Private Gatherings", description: "Exclusive rooftop or seaside sessions tailored for your private group, featuring bespoke music curation and catering." },
      { name: "Corporate Retreats", description: "Take your team offsite for a day of movement, mindfulness, and connection, customized to your company culture." },
      { name: "Pre-Wedding Flows", description: "A mindful start to your celebrations. We host calming and connection-focused sessions for the bridal party and guests." }
    ]
  },
  {
    id: "goa",
    name: "Goa",
    description: "Immersive multi-day wellness retreats blending nature, movement, and deep relaxation.",
    image: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&q=80&w=1200",
    fullDesc: "<p>Take a step back and breathe. YogaJam in Goa is designed for deep immersion. Moving away from the quick-paced city sessions, our Goa experiences are expansive multi-day retreats.</p><br/><p>Set in secluded, premium eco-resorts, expect extended movement practices, live ambient performances, and profound rest. It's the ultimate reset for the mind and body.</p>",
    locations: ["Ashwem", "Morjim", "South Goa Retreats"],
    eventTypes: [
      { name: "Executive Retreats", description: "Premium, multi-day wellness immersions designed for leadership teams, focusing on stress reduction and deep strategic focus." },
      { name: "Destination Celebrations", description: "Host unforgettable birthday weekends or milestone events blending high-energy parties with mindful movement." },
      { name: "Bespoke Wellness Offsites", description: "Fully customized itineraries including breathwork, sound healing, and tailored nutrition for your private group." }
    ]
  },
  {
    id: "rishikesh",
    name: "Rishikesh",
    description: "Connect with the roots of yoga by the sacred waters of the Ganges.",
    image: "https://images.unsplash.com/photo-1590845947376-2638caa89309?auto=format&fit=crop&q=80&w=1200",
    fullDesc: "<p>The birthplace of yoga meets the modern YogaJam experience. In Rishikesh, we pay homage to traditional practices while injecting our signature cinematic energy.</p><br/><p>Practicing by the sacred waters of the Ganges, we focus heavily on advanced breathwork, traditional alignment, and deep meditation, offering a profoundly spiritual yet distinctly contemporary experience.</p>",
    locations: ["Tapovan", "Ganges Riverbanks", "Private Ashrams"],
    eventTypes: [
      { name: "Spiritual Offsites", description: "Deeply grounding experiences for private groups, focusing on advanced meditation and breathwork by the Ganges." },
      { name: "Intimate Retreats", description: "Small, curated gatherings for friends or family seeking a profound, distraction-free wellness experience." },
      { name: "Cultural Immersions", description: "Bespoke events combining YogaJam's signature flow with traditional ceremonies and authentic local experiences." }
    ]
  }
];

export const upcomingCities: City[] = [
  {
    id: "delhi-ncr",
    name: "Delhi NCR",
    description: "Bringing our signature mindful movement to the capital.",
    image: "/images/hero/hero-bg.jpg",
    fullDesc: "<p>The capital is ready for a new kind of movement. We are currently scouting the most iconic venues across Delhi and Gurugram to bring the YogaJam experience to the north.</p><br/><p>Expect high-intensity indoor sessions to beat the heat, and exclusive winter rooftop flows.</p>",
    locations: ["Cyber City", "South Delhi", "Aerocity"],
    eventTypes: [
      { name: "Corporate Activations", description: "Bring the YogaJam energy directly into your office or chosen venue for high-impact employee wellness days." },
      { name: "Private Launch Events", description: "Elevate your brand launch with a custom-designed wellness experience that leaves a lasting impression." }
    ]
  },
  {
    id: "pune",
    name: "Pune",
    description: "A growing community of wellness enthusiasts awaits.",
    image: "/images/hero/hero-bg.jpg",
    fullDesc: "<p>With its rich cultural heritage and youthful energy, Pune is the perfect next step for the YogaJam community. We're planning a series of intimate, community-driven events.</p>",
    locations: ["Koregaon Park", "Kalyani Nagar"],
    eventTypes: [
      { name: "Private Birthday Jams", description: "Host a high-energy, memorable celebration tailored precisely to your vibe and playlist preferences." },
      { name: "Team Building Flows", description: "Interactive, connection-focused sessions designed to bring your team closer together." }
    ]
  },
  {
    id: "dubai",
    name: "Dubai",
    description: "Taking the YogaJam experience global. Premium desert and skyline flows.",
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&q=80&w=1200",
    fullDesc: "<p>YogaJam is going global. Dubai offers unparalleled architecture and stunning desert landscapes, making it the ultimate destination for our most premium, high-production events.</p>",
    locations: ["Downtown Dubai", "Desert Reserves", "Palm Jumeirah"],
    eventTypes: [
      { name: "Premium Corporate Events", description: "Ultra-luxury wellness experiences designed for VIP clients or executive teams." },
      { name: "Desert Celebrations", description: "Bespoke private events set against the stunning backdrop of the Arabian desert." }
    ]
  },
  {
    id: "london",
    name: "London",
    description: "Urban sanctuaries and parkside flows in the heart of the UK.",
    image: "/images/hero/hero-bg.jpg",
    fullDesc: "<p>From historic warehouses to expansive royal parks, London is calling. We're bringing our dark, cinematic aesthetic to the heart of the UK's wellness scene.</p>",
    locations: ["Shoreditch", "Hyde Park", "Soho"],
    eventTypes: [
      { name: "Brand Partnerships", description: "Collaborative events aligning your brand with our unique, underground wellness aesthetic." },
      { name: "Private Studio Sessions", description: "Intimate, curated experiences for your private group in premium spaces across the city." }
    ]
  }
];
