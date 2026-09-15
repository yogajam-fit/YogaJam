export const videoReviewsData: any[] = [
  //   { id: "v6", src: "/videos/12900608_3840_2160_120fps.mp4" },
];

export const textReviewsData = [
  { id: "t1", text: "Honestly, the best weekend I've had in ages. It didn't even feel like a workout—just pure fun and amazing energy.", author: "Priya K." },
  { id: "t2", text: "I was skeptical about blending yoga and house music, but the vibe was electric. Totally going to the next one!", author: "Rohan M." },
  { id: "t3", text: "The community here is something else. You walk in alone and leave with five new friends. Absolutely loved it.", author: "Anjali S." },
  { id: "t4", text: "Finally, a weekend plan that doesn't just involve sitting at a cafe or a loud club. This was exactly what I was looking for.", author: "Karan D." },
  { id: "t5", text: "The flow was challenging but the music carried me through it. I felt so rejuvenated the next morning!", author: "Meera V." },
  { id: "t6", text: "Such a brilliant concept. The combination of deep house beats and movement was almost therapeutic.", author: "Aditya P." },
  { id: "t7", text: "This is exactly what the city needed. No pretentiousness, just good vibes, great music, and a lot of sweat.", author: "Neha G." },
  { id: "t8", text: "I've been to a lot of wellness retreats, but this felt so fresh and modern. Huge shoutout to the organizers.", author: "Varun T." },
];

export const ALL_REVIEWS = [
  ...videoReviewsData.map(v => ({ ...v, type: 'video' })),
  ...textReviewsData.map(t => ({ ...t, type: 'text' }))
];
