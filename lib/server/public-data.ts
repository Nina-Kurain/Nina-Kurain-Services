import { rows } from "./db";
import { PHOTOS_DATA, PhotoItem } from "../photos-data";

export interface PublicCreatorSettings {
  name: string;
  title: string;
  subheading: string;
  bio: string;
  instagram: string;
  youtube: string;
  facebook: string;

  website: string;
  pinterest: string;
  heroImage: string;
  phone?: string;
}

export interface DynamicPhoto {
  id: string;
  slug: string;
  title: string;
  tag: string;
  category: string;
  image: string;
  caption: string;
  description: string;
  width: number;
  height: number;
  datePublished: string;
  isPremium?: boolean;
}

export interface DynamicVideo {
  id: string;
  title: string;
  meta: string;
  desc: string;
  src: string;
  poster: string;
  isPremium?: boolean;
}

export interface DynamicUpdate {
  slug: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  body: string;
  href: string;
}

function resolveAssetUrl(storageKey: string, assetId: string, postId: string): string {
  if (storageKey.startsWith("public:")) {
    return "/" + storageKey.slice(7).replace(/^\//, "");
  }
  return `/api/content/media/${assetId}?post=${encodeURIComponent(postId)}`;
}

export async function getPublicCreatorData() {
  // 1. Fetch site settings
  let settingsMap: Record<string, string> = {};
  try {
    const sRows = await rows<{ key: string; value: string }>("SELECT key, value FROM site_settings");
    settingsMap = Object.fromEntries(sRows.map((r) => [r.key, r.value]));
  } catch {
    // ignore
  }

  const settings: PublicCreatorSettings = {
    name: settingsMap.creator_name || "Nina Kurain",
    title: settingsMap.creator_title || "Digital Creator",
    subheading: settingsMap.creator_subheading || "Digital Creator • Model • Creative Artist",
    bio:
      settingsMap.creator_bio ||
      "Nina Kurain is a Digital Creator dedicated to exploring the intersections of editorial fashion, fine-art portraiture, and cinematic motion.",
    instagram: settingsMap.creator_instagram || "https://www.instagram.com/ninakurain",
    youtube: settingsMap.creator_youtube || "https://www.youtube.com/@ninakurain",
    facebook: settingsMap.creator_facebook || "https://www.facebook.com/ninakurain",

    website: settingsMap.creator_website || "https://ninakurainservices.in",
    pinterest: settingsMap.creator_pinterest || "https://www.pinterest.com/ninakurain",
    heroImage: settingsMap.creator_hero_image
      ? settingsMap.creator_hero_image
      : settingsMap.creator_avatar_asset_id
      ? `/api/content/media/${settingsMap.creator_avatar_asset_id}`
      : "/nina-kurain-official-portrait.webp",
  };

  // 2. Fetch published public posts from Creator Studio
  let dbPosts: Array<{
    id: string;
    title: string;
    caption: string;
    published_at: number;
    access_mode: string;
    visibility: string;
  }> = [];

  try {
    dbPosts = await rows<{
      id: string;
      title: string;
      caption: string;
      published_at: number;
      access_mode: string;
      visibility: string;
    }>(
      `SELECT p.id, p.title, p.caption, p.published_at, p.access_mode, p.visibility 
       FROM posts p 
       WHERE p.status IN ('published', 'scheduled') 
         AND (p.access_mode = 'free' OR p.visibility = 'free' OR p.access_mode = 'public' OR p.visibility = 'public') 
       ORDER BY p.published_at DESC 
       LIMIT 40`
    );
  } catch {
    // ignore
  }

  // 3. Fetch attached media for these posts
  let postMediaMap: Record<
    string,
    Array<{
      asset_id: string;
      storage_key: string;
      name: string;
      mime: string;
      cover: number;
    }>
  > = {};

  if (dbPosts.length > 0) {
    const postIds = dbPosts.map((p) => p.id);
    try {
      const mediaRows = await rows<{
        post_id: string;
        asset_id: string;
        storage_key: string;
        name: string;
        mime: string;
        cover: number;
      }>(
        `SELECT pm.post_id, pm.asset_id, pm.cover, ma.storage_key, ma.name, ma.mime 
         FROM post_media pm 
         JOIN media_assets ma ON ma.id = pm.asset_id 
         WHERE pm.post_id IN (${postIds.map(() => "?").join(",")}) 
         ORDER BY pm.cover DESC, pm.display_order ASC`,
        ...postIds
      );

      for (const m of mediaRows) {
        if (!postMediaMap[m.post_id]) postMediaMap[m.post_id] = [];
        postMediaMap[m.post_id].push(m);
      }
    } catch {
      // ignore
    }
  }

  // 4. Transform DB posts into dynamic photos, videos, and updates
  const dynamicPhotos: DynamicPhoto[] = [];
  const dynamicVideos: DynamicVideo[] = [];
  const dynamicUpdates: DynamicUpdate[] = [];

  for (const post of dbPosts) {
    const mediaList = postMediaMap[post.id] ?? [];
    const dateStr = post.published_at
      ? new Date(post.published_at).toLocaleDateString("en-IN", {
          month: "long",
          year: "numeric",
          day: "numeric",
        })
      : "Recent";

    // Dynamic Updates
    dynamicUpdates.push({
      slug: post.id,
      title: post.title,
      date: dateStr,
      category: "Studio Release",
      excerpt: post.caption.slice(0, 160) + (post.caption.length > 160 ? "…" : ""),
      body: post.caption,
      href: `/updates#${post.id}`,
    });

    for (const m of mediaList) {
      const url = resolveAssetUrl(m.storage_key, m.asset_id, post.id);
      if (m.mime.startsWith("video/")) {
        dynamicVideos.push({
          id: post.id,
          title: post.title,
          meta: `Studio Film • ${dateStr}`,
          desc: post.caption,
          src: url,
          poster: "/nina-kurain-official-portrait.webp",
          isPremium: !(post.access_mode === "free" || post.visibility === "free"),
        });
      } else {
        dynamicPhotos.push({
          id: post.id,
          slug: post.id,
          title: post.title,
          tag: post.access_mode === "free" || post.visibility === "free" ? "Free Demo" : "VIP Locked",
          category: "Studio Photography",
          image: url,
          caption: post.caption.slice(0, 120),
          description: post.caption,
          width: 1200,
          height: 1600,
          datePublished: post.published_at ? new Date(post.published_at).toISOString().split("T")[0] : "2026-09-24",
          isPremium: !(post.access_mode === "free" || post.visibility === "free"),
        });
      }
    }
  }

  // 5. Merge with signature collection so there is always a rich foundation
  const basePhotos: DynamicPhoto[] = PHOTOS_DATA.map((p) => ({
    id: p.slug,
    slug: p.slug,
    title: p.title,
    tag: p.tag,
    category: p.category,
    image: p.src,
    caption: p.caption,
    description: p.description,
    width: p.width,
    height: p.height,
    datePublished: p.datePublished,
    isPremium: p.isPremium ?? false,
  }));

  // Combine: Creator Studio posts take priority at the front
  const allPhotosRaw = [...dynamicPhotos, ...basePhotos.filter((b) => !dynamicPhotos.some((d) => d.id === b.id))];
  // Exactly 1 initial demo frame for interaction, all remaining frames are VIP locked
  const allPhotos = allPhotosRaw.map((p, idx) => ({
    ...p,
    isPremium: idx > 0,
    tag: idx === 0 ? "Free Demo" : "VIP Locked",
  }));

  // 6. Videos with membership tiers and locks
  const baseVideos: DynamicVideo[] = [
    {
      id: "v1",
      title: "Arch & Tremble: Bedroom Tape (Uncensored)",
      meta: "🔞 VIP PLATINUM • 08:45 Explicit 4K Tape",
      desc: "Slow, breathless arching in dim candlelight. Hands gripping silk sheets, skin flushed hot, and every curve moving completely uninhibited just for you in full 4K 60fps.",
      src: "/booty.mp4",
      poster: "/nina-kurain-official-portrait.webp",
      isPremium: true,
    },
    {
      id: "v2",
      title: "Behind Closed Doors: 3-Second Tease Loop",
      meta: "🔥 VIP GOLD • 03s Hypnotic Loop",
      desc: "A hypnotic glimpse behind locked doors. Slow seductive sway, parting lips, and an unspoken invitation to touch what isn't meant for public eyes.",
      src: "/vid-2.mp4",
      poster: "/nina-kurain-editorial-portrait.webp",
      isPremium: true,
    },
    {
      id: "v3",
      title: "Glistening Silk & Wet Desires",
      meta: "🔞 VIP DIAMOND • 03s Climax Film",
      desc: "Drenched in warm oil and slow-motion pleasure. Every breathless arch captured up close, glistening under your gaze until the tension is completely unbearable.",
      src: "/vid-3.mp4",
      poster: "/nina-kurain-digital-creator.webp",
      isPremium: true,
    },
  ];

  const allVideos = [...dynamicVideos, ...baseVideos.filter((b) => !dynamicVideos.some((d) => d.id === b.id))];

  const baseUpdates: DynamicUpdate[] = [
    {
      slug: "autumn-editorial-collection-2026",
      title: "Autumn Editorial Collection Premieres",
      date: "September 2026",
      category: "Portfolio Release",
      excerpt: "New fine-art portrait collection exploring tonal harmonies, studio shadows, and seasonal aesthetics.",
      body: "The Autumn 2026 editorial collection marks a focused return to tactile studio portraiture. Over three dedicated studio sessions, we explored the interaction between heavy wool silhouettes, sheer fabrics, and low-angle tungsten lighting.",
      href: "/photos",
    },
    {
      slug: "official-youtube-cinematography-series",
      title: "Official YouTube Cinematography Series Launched",
      date: "August 2026",
      category: "Platform Expansion",
      excerpt: "Launching weekly behind-the-scenes visual essays and creative direction breakdowns for fellow artists.",
      body: "In response to community interest in our lighting and camera techniques, we are producing a dedicated video series on YouTube.",
      href: "/videos",
    },
    {
      slug: "collaborations-autumn-2026",
      title: "Creator Collaborations Open for Autumn",
      date: "July 2026",
      category: "Partnerships",
      excerpt: "Accepting select brand partnerships, luxury fashion lookbooks, and high-concept creative direction briefs.",
      body: "We are partnering with visionary fashion labels, luxury accessories, and design publications seeking distinctive visual identity.",
      href: "/collaborations",
    },
  ];

  const allUpdates = [...dynamicUpdates, ...baseUpdates.filter((b) => !dynamicUpdates.some((d) => d.slug === b.slug))];

  return {
    settings,
    photos: allPhotos,
    videos: allVideos,
    updates: allUpdates,
  };
}
