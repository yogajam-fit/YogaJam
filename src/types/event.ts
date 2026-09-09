export interface Event {
  slug: string;
  title: string;
  description: string;
  image: string;
  image_mobile?: string;
  category: string;
  location?: string;
  date?: string;
  price?: string;
}
