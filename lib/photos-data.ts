export interface PhotoItem {
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

export const PHOTOS_DATA: PhotoItem[] = [
  {
    slug: "nina-kurain-official-portrait",
    title: "Official Portraiture",
    heading: "Nina Kurain — Official Portrait",
    tag: "Free Demo",
    category: "Portraits",
    src: "/nina-kurain-official-portrait.webp",
    alt: "Nina Kurain — Digital Creator & Model official signature studio portrait",
    width: 1200,
    height: 1600,
    caption: "The definitive signature studio portrait of Nina Kurain, capturing minimalist elegance and editorial depth.",
    description: "Captured under controlled studio chiaroscuro lighting, this portrait serves as the primary visual anchor for Nina Kurain's Digital Creator identity. Clean lines, understated styling, and timeless expression define this benchmark photograph.",
    datePublished: "2026-08-15",
    locationCreated: "Studio Archive, India",
    tags: ["Nina Kurain", "Digital Creator", "Studio Portrait", "Fine Art", "Editorial"],
    isPremium: false,
  },
  {
    slug: "nina-kurain-digital-creator",
    title: "Digital Artistry & Vision",
    heading: "Nina Kurain — Digital Creator & Visual Artist",
    tag: "Free Demo",
    category: "Editorial",
    src: "/nina-kurain-digital-creator.webp",
    alt: "Nina Kurain — Digital Creator and visual artist exploring modern editorial styling",
    width: 1200,
    height: 1600,
    caption: "Contemporary visual direction blending haute couture styling with digital creator storytelling.",
    description: "An evocative study in texture and modern aesthetic expression. This shoot highlights Nina Kurain's multifaceted role as both subject and creative director, demonstrating visionary composition for digital publishing.",
    datePublished: "2026-08-20",
    locationCreated: "Studio Archive, India",
    tags: ["Nina Kurain", "Digital Artist", "Editorial Styling", "Visual Direction"],
    isPremium: false,
  },
  {
    slug: "nina-kurain-fashion-editorial",
    title: "Haute Couture Editorial",
    heading: "Nina Kurain — Haute Couture Editorial",
    tag: "VIP Locked",
    category: "Fashion",
    src: "/nina-kurain-editorial-portrait.webp",
    alt: "Nina Kurain — High-fashion modeling and editorial studio photography",
    width: 1200,
    height: 1600,
    caption: "Dramatic monochrome and high-fashion silhouettes exploring form, light, and studio composition.",
    description: "Emphasizing sculptural geometry, tailored silhouettes, and deliberate shadows, this editorial series presents Nina Kurain in a high-fashion framework crafted for leading fashion periodicals.",
    datePublished: "2026-08-25",
    locationCreated: "Studio Archive, India",
    tags: ["Nina Kurain", "Fashion Model", "High Fashion", "Haute Couture", "Studio Lighting"],
    isPremium: true,
  },
  {
    slug: "nina-kurain-studio-portrait",
    title: "Studio Light Study",
    heading: "Nina Kurain — Studio Light Study",
    tag: "VIP Locked",
    category: "Studio",
    src: "/nina-kurain-studio-portrait.webp",
    alt: "Nina Kurain — Fine-art studio light portrait study",
    width: 1080,
    height: 1440,
    caption: "An intimate exploration of warm chiaroscuro lighting and timeless portrait aesthetics.",
    description: "A nuanced lighting study utilizing warm amber key lights against a deep obsidian background. Nina Kurain embodies quiet contemplation and classical artistic restraint.",
    datePublished: "2026-09-01",
    locationCreated: "Studio Archive, India",
    tags: ["Nina Kurain", "Chiaroscuro", "Studio Photography", "Portraiture"],
    isPremium: true,
  },
  {
    slug: "nina-kurain-creator-photoshoot",
    title: "Creator In Motion",
    heading: "Nina Kurain — Creator Photoshoot In Motion",
    tag: "VIP Locked",
    category: "Editorial",
    src: "/nina-kurain-creator-photoshoot.webp",
    alt: "Nina Kurain — Creator photoshoot in motion exploring kinetic energy and editorial fashion",
    width: 1086,
    height: 1448,
    caption: "Behind the lens during a concept session exploring kinetic energy and editorial fashion.",
    description: "Capturing spontaneous transitions between planned poses, this series reflects the vitality, fluidity, and creative freedom of Nina Kurain's photographic practice.",
    datePublished: "2026-09-08",
    locationCreated: "Creative Workshop, India",
    tags: ["Nina Kurain", "Photoshoot", "Movement", "Creative Energy"],
    isPremium: true,
  },
  {
    slug: "nina-kurain-fashion-portrait",
    title: "Modern Elegance",
    heading: "Nina Kurain — Modern Elegance Lookbook",
    tag: "VIP Locked",
    category: "Fashion",
    src: "/nina-kurain-fashion-portrait.webp",
    alt: "Nina Kurain — Modern elegance lookbook photograph featuring understated glamour",
    width: 1086,
    height: 1448,
    caption: "Refined aesthetic expression showcasing understated glamour and distinctive personality.",
    description: "A contemporary lookbook frame exploring minimalism in luxury fashion. Smooth tonal gradients and refined styling underscore Nina Kurain's natural poise and camera presence.",
    datePublished: "2026-09-14",
    locationCreated: "Studio Archive, India",
    tags: ["Nina Kurain", "Lookbook", "Modern Elegance", "Fashion Photography"],
    isPremium: true,
  },
];
