import { contactData } from "@/content/contact";

export const siteConfig = {
  name: "YogaJam",
  description: "A cinematic dark wellness experience with natural warmth and restrained lime energy.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    instagram: contactData.socials.find(s => s.name === 'Instagram')?.url || "https://instagram.com/yogajam",
    twitter: contactData.socials.find(s => s.name === 'Twitter')?.url || "https://twitter.com/yogajam",
    contact: contactData.email,
  },
  navigation: {
    main: [
      { name: "Home", href: "/" },
      { name: "Events", href: "/events" },
      { name: "Custom", href: "/personalized-events" },
      { name: "Cities", href: "/cities" },
      { name: "Journals", href: "/journals" },
    ],
    social: contactData.socials.map(social => ({
      name: social.name,
      href: social.url
    })),
  },
};
