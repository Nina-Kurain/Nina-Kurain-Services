import fs from "node:fs";

const categories = ["Portraits", "Editorial", "Fashion", "Studio"];
const titles = [
  "Signature Studio Portraiture", "Minimalist Light Study", "Contemporary Ethnic Silhouette",
  "Reflective Studio Framing", "Visual Storytelling Essay", "Monochromatic Mood Study",
  "Golden Hour Studio Aura", "High-Contrast Profile", "Subtle Chiaroscuro Form",
  "Intimate Studio Focus", "Editorial Grace & Texture", "Cinematic Portrait Mood",
  "Sartorial Elegance Frame", "Warm Ambient Illumination", "Fine Art Studio Study"
];

const items = [];
const files = fs.readdirSync("public/nina-gallery").filter((f) => f.startsWith("nina-kurain-") && (f.endsWith(".jpeg") || f.endsWith(".jpg") || f.endsWith(".png")));

// Sort logically by number
files.sort((a, b) => {
  const numA = parseInt(a.replace(/\D/g, ""), 10);
  const numB = parseInt(b.replace(/\D/g, ""), 10);
  return numA - numB;
});

files.forEach((file, index) => {
  const match = file.match(/nina-kurain-(\d+)\.(jpeg|jpg|png)/);
  if (!match) return;
  const num = match[1];
  const cat = categories[index % categories.length];
  const titleBase = titles[index % titles.length];
  const title = `${titleBase} — Frame ${num}`;
  const slug = `nina-kurain-photo-${num}`;

  items.push({
    slug,
    title,
    heading: `Nina Kurain — ${title}`,
    tag: `${cat} Series`,
    category: cat,
    src: `/nina-gallery/${file}`,
    alt: `Nina Kurain — Digital Creator authentic studio photograph ${num}`,
    width: 1200,
    height: 1600,
    caption: `Authentic ${cat.toLowerCase()} photograph of Nina Kurain, capturing contemporary visual direction and natural aesthetic expression.`,
    description: `From the official Nina Kurain photography collection, this ${cat.toLowerCase()} piece captures authentic lighting, timeless composition, and creative digital styling.`,
    datePublished: "2026-09-24",
    locationCreated: "Studio Archive, India",
    tags: ["Nina Kurain", "Digital Creator", cat, "Photography", "Official Gallery"],
    isPremium: false,
  });
});

const fileContent = `export interface PhotoItem {
  slug: string;
  title: string;
  heading: string;
  tag: string;
  category: "Portraits" | "Editorial" | "Studio" | "Fashion";
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string;
  description: string;
  datePublished: string;
  locationCreated?: string;
  tags: string[];
  isPremium?: boolean;
}

export const PHOTOS_DATA: PhotoItem[] = ${JSON.stringify(items, null, 2)};
`;

fs.writeFileSync("lib/photos-data.ts", fileContent, "utf8");
console.log("Successfully generated lib/photos-data.ts with", items.length, "items.");
