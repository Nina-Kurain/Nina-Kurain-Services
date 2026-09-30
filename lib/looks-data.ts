export interface LookDefinition {
  id: string; // "look-01", "look-02", "look-03", "look-04"
  slug: string; // "chiaroscuro-silk", "monochrome-reverie", "boudoir-whisper", "avant-garde-velvet"
  num: string; // "Look 01", "Look 02", ...
  title: string;
  tagline: string;
  desc: string;
  coverImage: string;
  expectedCount: number;
  imageNumbers: string[]; // e.g. ["01", "03", "05", ...]
}

export const ARCHIVAL_LOOKS: LookDefinition[] = [
  {
    id: "look-01",
    slug: "chiaroscuro-silk",
    num: "Look 01",
    title: "Chiaroscuro & Silk",
    tagline: "South Asian Handlooms Sculpted in Shadow",
    desc: "Traditional South Asian handlooms and Kanchipuram silks rendered in dramatic low-key studio lighting with deep obsidian backgrounds.",
    coverImage: "/nina-gallery/nina-kurain-22.jpeg",
    expectedCount: 16,
    imageNumbers: [
      "01", "03", "05", "07", "09", "11", "13", "15",
      "17", "19", "21", "22", "23", "30", "31", "32"
    ],
  },
  {
    id: "look-02",
    slug: "monochrome-reverie",
    num: "Look 02",
    title: "Monochrome Reverie",
    tagline: "High-Contrast Tactile Tension",
    desc: "High-contrast black-and-white studies focusing on pure silhouette, tactile cotton textures, and intimate emotional tension.",
    coverImage: "/nina-gallery/nina-kurain-21.jpeg",
    expectedCount: 12,
    imageNumbers: [
      "02", "04", "06", "08", "10", "12", "14", "16",
      "18", "33", "34", "35"
    ],
  },
  {
    id: "look-03",
    slug: "boudoir-whisper",
    num: "Look 03",
    title: "The Boudoir Whisper",
    tagline: "Golden Hour Warmth & Ambient Sheer",
    desc: "Sun-drenched natural illumination capturing organic skin glow, sheer organza fabrics, and effortless candid pauses.",
    coverImage: "/nina-gallery/nina-kurain-36.jpeg",
    expectedCount: 14,
    imageNumbers: [
      "36", "37", "38", "40", "41", "42", "43", "44",
      "45", "46", "47", "48", "49", "50"
    ],
  },
  {
    id: "look-04",
    slug: "avant-garde-velvet",
    num: "Look 04",
    title: "Avant-Garde Velvet",
    tagline: "Contemporary High-Fashion & Heritage Drapes",
    desc: "Modern tailored velvet blazers meeting heritage drapes in avant-garde ethnic fusions and editorial styling concepts.",
    coverImage: "/nina-gallery/nina-kurain-39.jpeg",
    expectedCount: 9,
    imageNumbers: [
      "39", "51", "52", "53", "54", "55", "56", "57", "58"
    ],
  },
];

export function getLookByIdOrSlug(query?: string | null): LookDefinition | undefined {
  if (!query) return undefined;
  const q = query.toLowerCase().trim();
  return ARCHIVAL_LOOKS.find(
    (l) =>
      l.id.toLowerCase() === q ||
      l.slug.toLowerCase() === q ||
      l.num.toLowerCase().replace(/\s+/g, "-") === q ||
      l.title.toLowerCase() === q
  );
}

export function filterPhotosByLook<T extends { image?: string; src?: string }>(
  photos: T[],
  look: LookDefinition
): T[] {
  const allowedSet = new Set(
    look.imageNumbers.map((num) => `/nina-gallery/nina-kurain-${num}.jpeg`)
  );
  return photos.filter((p) => {
    const path = p.image || p.src || "";
    return allowedSet.has(path);
  });
}
