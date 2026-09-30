"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  BadgeCheck,
  Check,
  Sparkles,
  Maximize2,
  Minimize2,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PrivateMediaMark, ProtectedImage, ProtectedVideo } from "@/components/protected-media";
import { CommentSheet } from "./comment-sheet";
import { CommentThread } from "@/app/live-client";
import type { ContentPost } from "@/lib/server/entitlements";
import { useMobileViewer } from "@/hooks/use-mobile-viewer";

const timeAgo = (value: number) => {
  const seconds = Math.max(1, Math.floor((Date.now() - value) / 1000));
  if (seconds < 60) return "now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export interface PostViewerProps {
  post: ContentPost;
  posts?: ContentPost[];
  avatar?: string;
  creatorName?: string;
  likesEnabled: boolean;
  busy: boolean;
  message: string;
  onClose: () => void;
  onToggle: (type: "save" | "like", p: ContentPost) => Promise<void>;
  onNavigatePost?: (p: ContentPost) => void;
  admin?: boolean;
  onEdit?: (p?: ContentPost) => void;
  onArchive?: (p?: ContentPost) => Promise<void>;
  onDelete?: (p?: ContentPost) => void;
  onRemoveComment?: (id: string) => void;
}

/**
 * Individual Post Card rendered in the Mobile Instagram-Style Feed Stream
 */
function MobilePostItem({
  post,
  creatorName,
  avatar,
  likesEnabled,
  busy,
  onToggle,
  onOpenComments,
  onShare,
  admin,
  onEdit,
  onArchive,
  onDelete,
}: {
  post: ContentPost;
  creatorName: string;
  avatar?: string;
  likesEnabled: boolean;
  busy: boolean;
  onToggle: (type: "save" | "like", p: ContentPost) => Promise<void>;
  onOpenComments: (postId: string) => void;
  onShare: (p: ContentPost) => void;
  admin?: boolean;
  onEdit?: (p: ContentPost) => void;
  onArchive?: (p: ContentPost) => Promise<void>;
  onDelete?: (p: ContentPost) => void;
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [menuOpen, setMenuOpen] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const [copied, setCopied] = useState(false);
  const carouselRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const media = post.media ?? [];
  const totalSlides = media.length;

  const handleScroll = useCallback(() => {
    const el = carouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentSlide(Math.max(0, Math.min(idx, totalSlides - 1)));
  }, [totalSlides]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [menuOpen]);

  const handleLike = async () => {
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 450);
    await onToggle("like", post);
  };

  const handleShareClick = () => {
    onShare(post);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const accessLabel =
    post.access_mode === "free"
      ? "FREE"
      : post.access_mode === "level"
      ? `LEVEL ${post.minimum_level}+`
      : "SELECTED";

  const hasCaption = Boolean(post.caption?.trim() || post.title?.trim());
  const captionText = post.caption?.trim() || post.title?.trim();

  return (
    <article
      className="pv-mobile-feed-card"
      id={`pv-post-${post.id}`}
      data-post-id={post.id}
    >
      {/* Post Header */}
      <div className="pv-mobile-card-head">
        <div className="pv-mobile-creator">
          <img
            src={avatar || "/nina-gallery/nina-kurain-01.jpeg"}
            alt={creatorName}
            className="pv-mobile-avatar"
          />
          <div className="pv-mobile-meta">
            <div className="pv-name-row">
              <strong>{creatorName}</strong>
              <BadgeCheck size={13} className="pv-badge-check" />
            </div>
            <span className="pv-access-pill">{accessLabel}</span>
          </div>
        </div>

        <div className="pv-admin-header-actions">
          {admin && onEdit && (
            <button
              type="button"
              className="pv-admin-quick-edit-btn"
              title="Edit post"
              onClick={() => onEdit(post)}
            >
              <Pencil size={13} />
              <span>Edit</span>
            </button>
          )}

          <div className="pv-menu-wrap" ref={menuRef}>
            <button
              type="button"
              className="pv-menu-btn"
              aria-label="Post options"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreHorizontal size={20} />
            </button>

            {menuOpen && (
              <div className="pv-menu-dropdown">
                {admin && onEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setMenuOpen(false);
                      onEdit(post);
                    }}
                  >
                    <Pencil size={15} /> Edit post
                  </button>
                )}
                {admin && onArchive && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => {
                      setMenuOpen(false);
                      void onArchive(post);
                    }}
                  >
                    <Archive size={15} /> Archive post
                  </button>
                )}
                {admin && onDelete && (
                  <button
                    type="button"
                    className="pv-danger"
                    disabled={busy}
                    onClick={() => {
                      setMenuOpen(false);
                      onDelete(post);
                    }}
                  >
                    <Trash2 size={15} /> Delete post
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    handleShareClick();
                  }}
                >
                  {copied ? <Check size={15} /> : <Share2 size={15} />}
                  {copied ? "Link copied" : "Share link"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Media Carousel Viewport */}
      <div className={`pv-media-viewport ${fitMode === "contain" ? "pv-fit-contain" : "pv-fit-cover"}`}>
        <div
          className="pv-media-track"
          ref={carouselRef}
          onScroll={handleScroll}
        >
          {media.map((m, idx) => (
            <div className="pv-slide-item" key={m.id || idx}>
              {m.mime.startsWith("video/") ? (
                <ProtectedVideo
                  controls
                  playsInline
                  preload="metadata"
                  src={m.url}
                  aria-label={post.title}
                />
              ) : (
                <ProtectedImage src={m.url} alt={post.title} />
              )}
              <PrivateMediaMark />
            </div>
          ))}
        </div>

        {/* Fit / Fill Toggle */}
        <button
          type="button"
          className="pv-fit-toggle"
          onClick={(e) => {
            e.stopPropagation();
            setFitMode((curr) => (curr === "cover" ? "contain" : "cover"));
          }}
          aria-label={fitMode === "cover" ? "Fit whole image" : "Fill frame"}
          title={fitMode === "cover" ? "Fit to frame" : "Fill card (no borders)"}
        >
          {fitMode === "cover" ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
          <span>{fitMode === "cover" ? "Fit" : "Fill"}</span>
        </button>

        {/* Multi-slide Indicators */}
        {totalSlides > 1 && (
          <>
            <span className="pv-slide-counter">
              {currentSlide + 1}/{totalSlides}
            </span>
            <div className="pv-dots-row">
              {media.map((_, i) => (
                <span
                  key={i}
                  className={`pv-dot-indicator ${i === currentSlide ? "active" : ""}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Action Row */}
      <div className="pv-action-bar">
        <div className="pv-action-group">
          {likesEnabled && (
            <button
              type="button"
              disabled={busy}
              aria-label={post.liked ? "Unlike" : "Like"}
              onClick={handleLike}
              className={`pv-action-icon-btn ${heartPop ? "pv-heart-pop" : ""}`}
            >
              <Heart
                size={24}
                fill={post.liked ? "currentColor" : "none"}
                className={post.liked ? "pv-liked" : ""}
              />
            </button>
          )}
          <button
            type="button"
            aria-label="Comments"
            className="pv-action-icon-btn"
            onClick={() => onOpenComments(post.id)}
          >
            <MessageCircle size={24} />
          </button>
          <button
            type="button"
            aria-label="Share post link"
            className="pv-action-icon-btn"
            onClick={handleShareClick}
          >
            {copied ? <Check size={22} className="pv-copied-check" /> : <Share2 size={22} />}
          </button>
        </div>

        <button
          type="button"
          disabled={busy}
          aria-label={post.saved ? "Unsave" : "Save"}
          className="pv-action-icon-btn"
          onClick={() => void onToggle("save", post)}
        >
          <Bookmark size={24} fill={post.saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Post Details & Caption */}
      <div className="pv-details-box">
        {likesEnabled && (
          <p className="pv-like-tally">
            {post.like_count ? (
              <strong>
                {post.like_count} {post.like_count === 1 ? "like" : "likes"}
              </strong>
            ) : (
              <span>Be the first to like this</span>
            )}
          </p>
        )}

        {hasCaption && (
          <div className="pv-caption-row">
            <strong>{creatorName}</strong>
            <span>{captionText}</span>
          </div>
        )}

        {(post.comment_count ?? 0) > 0 ? (
          <button
            type="button"
            className="pv-comments-trigger"
            onClick={() => onOpenComments(post.id)}
          >
            View all {post.comment_count} {post.comment_count === 1 ? "comment" : "comments"}
          </button>
        ) : (
          <button
            type="button"
            className="pv-comments-trigger pv-comments-empty-trigger"
            onClick={() => onOpenComments(post.id)}
          >
            Add a comment…
          </button>
        )}

        <time className="pv-publish-stamp">{timeAgo(post.published_at)}</time>
      </div>

      {copied && (
        <div className="pv-toast-copied" role="status">
          Protected link copied to clipboard
        </div>
      )}
    </article>
  );
}

export function PostViewer({
  post,
  posts,
  avatar,
  creatorName = "Nina Kurain",
  likesEnabled,
  busy,
  message,
  onClose,
  onToggle,
  onNavigatePost,
  admin = false,
  onEdit,
  onArchive,
  onDelete,
  onRemoveComment,
}: PostViewerProps) {
  // Normalize post list
  const postList = useMemo(() => {
    if (posts && posts.length > 0) return posts;
    return [post];
  }, [posts, post]);

  // Active post id (starts at opened post)
  const [activePostId, setActivePostId] = useState(post.id);

  // Sync if prop post changes externally
  useEffect(() => {
    setActivePostId(post.id);
  }, [post.id]);

  const currentPost = useMemo(() => {
    return postList.find((p) => p.id === activePostId) || post;
  }, [postList, activePostId, post]);

  const currentIndex = useMemo(() => {
    return postList.findIndex((p) => p.id === currentPost.id);
  }, [postList, currentPost.id]);

  const hasNext = currentIndex >= 0 && currentIndex < postList.length - 1;
  const hasPrev = currentIndex > 0;

  // Comment sheet state
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentPostId, setCommentPostId] = useState<string>(post.id);
  const [commentCount, setCommentCount] = useState(currentPost.comment_count ?? 0);

  // Desktop carousel slide state
  const [desktopSlide, setDesktopSlide] = useState(0);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heartPop, setHeartPop] = useState(false);

  const desktopCarouselRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMobile = useMobileViewer();

  // Reset desktop slide index when current post changes
  useEffect(() => {
    setDesktopSlide(0);
    setCommentCount(currentPost.comment_count ?? 0);
  }, [currentPost.id, currentPost.comment_count]);

  const media = currentPost.media ?? [];
  const totalSlides = media.length;

  // Browser back closes the viewer
  useEffect(() => {
    const previousUrl = window.location.href;
    const previousState = history.state;
    const url = new URL(window.location.href);
    url.searchParams.set("post", currentPost.id);
    history.pushState({ postViewer: true }, "", url.toString());

    const handler = () => {
      onClose();
    };
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
      if (history.state?.postViewer) {
        history.replaceState(previousState, "", previousUrl);
      }
    };
  }, [currentPost.id, onClose]);

  // Lock background scrolling while viewer is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Post Navigation Callbacks
  const goToNextPost = useCallback(() => {
    if (hasNext) {
      const next = postList[currentIndex + 1];
      setActivePostId(next.id);
      onNavigatePost?.(next);
      if (isMobile) {
        const el = document.getElementById(`pv-post-${next.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [hasNext, currentIndex, postList, onNavigatePost, isMobile]);

  const goToPrevPost = useCallback(() => {
    if (hasPrev) {
      const prev = postList[currentIndex - 1];
      setActivePostId(prev.id);
      onNavigatePost?.(prev);
      if (isMobile) {
        const el = document.getElementById(`pv-post-${prev.id}`);
        el?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  }, [hasPrev, currentIndex, postList, onNavigatePost, isMobile]);

  // Mobile: Scroll into view of initial post on mount
  useEffect(() => {
    if (isMobile && post?.id) {
      const timer = setTimeout(() => {
        const el = document.getElementById(`pv-post-${post.id}`);
        if (el) {
          el.scrollIntoView({ behavior: "instant" as ScrollBehavior, block: "start" });
        }
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isMobile, post?.id]);

  // Mobile: Track which post is in viewport to update active URL & state
  useEffect(() => {
    if (!isMobile) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const pid = entry.target.getAttribute("data-post-id");
            if (pid && pid !== activePostId) {
              setActivePostId(pid);
              const found = postList.find((p) => p.id === pid);
              if (found) onNavigatePost?.(found);
              const url = new URL(window.location.href);
              url.searchParams.set("post", pid);
              window.history.replaceState({ postViewer: true }, "", url.toString());
            }
          }
        }
      },
      { threshold: 0.55 }
    );

    const elements = document.querySelectorAll(".pv-mobile-feed-card");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [isMobile, postList, activePostId, onNavigatePost]);

  // Desktop Carousel scroll tracking
  const handleDesktopCarouselScroll = useCallback(() => {
    const el = desktopCarouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setDesktopSlide(Math.max(0, Math.min(idx, totalSlides - 1)));
  }, [totalSlides]);

  function slideDesktopTo(idx: number) {
    const el = desktopCarouselRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }

  // Desktop Mouse Wheel Navigation
  const wheelLockRef = useRef(false);
  const handleDesktopWheel = useCallback(
    (e: React.WheelEvent) => {
      if (Math.abs(e.deltaY) > 45) {
        if (wheelLockRef.current) return;
        wheelLockRef.current = true;
        if (e.deltaY > 0 && hasNext) {
          goToNextPost();
        } else if (e.deltaY < 0 && hasPrev) {
          goToPrevPost();
        }
        setTimeout(() => {
          wheelLockRef.current = false;
        }, 400);
      }
    },
    [hasNext, hasPrev, goToNextPost, goToPrevPost]
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        commentOpen ||
        (e.target instanceof Element && e.target.closest("input,textarea,[contenteditable=true]"))
      ) {
        return;
      }
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Next / Previous Post: ArrowDown / ArrowUp / j / k
      if ((e.key === "ArrowDown" || e.key === "j") && hasNext) {
        e.preventDefault();
        goToNextPost();
        return;
      }
      if ((e.key === "ArrowUp" || e.key === "k") && hasPrev) {
        e.preventDefault();
        goToPrevPost();
        return;
      }

      // Left / Right arrow navigation: multi-image slide or post boundary
      if (e.key === "ArrowLeft") {
        if (desktopSlide > 0) {
          slideDesktopTo(desktopSlide - 1);
        } else if (hasPrev) {
          goToPrevPost();
        }
      }
      if (e.key === "ArrowRight") {
        if (desktopSlide < totalSlides - 1) {
          slideDesktopTo(desktopSlide + 1);
        } else if (hasNext) {
          goToNextPost();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commentOpen, desktopSlide, totalSlides, hasNext, hasPrev, goToNextPost, goToPrevPost, onClose]);

  // Close overflow menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, [menuOpen]);

  // Share handler
  async function handleShare(targetPost = currentPost) {
    const protectedUrl = `${window.location.origin}/profile?post=${targetPost.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(protectedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }

  // Like with pop animation
  async function handleLike() {
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 400);
    await onToggle("like", currentPost);
  }

  const accessLabel =
    currentPost.access_mode === "free"
      ? "FREE"
      : currentPost.access_mode === "level"
      ? `LEVEL ${currentPost.minimum_level}+`
      : "SELECTED";

  const hasCaption = Boolean(currentPost.caption?.trim() || currentPost.title?.trim());
  const captionText = currentPost.caption?.trim() || currentPost.title?.trim();

  // ══════════════════════════════════════════════════════════
  // MOBILE LAYOUT: Full Continuous Scrollable Instagram Feed
  // ══════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <>
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
          <DialogContent className="pv-mobile-screen" showCloseButton={false}>
            <DialogHeader className="sr-only">
              <DialogTitle>{currentPost.title || "Creator posts"}</DialogTitle>
              <DialogDescription>
                Scrollable Instagram-style creator feed and interactive comments.
              </DialogDescription>
            </DialogHeader>

            {/* Mobile Header: Fixed Top Bar */}
            <header className="pv-mobile-header">
              <button
                type="button"
                className="pv-back-btn"
                aria-label="Back to profile"
                onClick={onClose}
              >
                <ChevronLeft size={26} />
                <span className="pv-back-text">Posts</span>
              </button>

              <div className="pv-mobile-header-center">
                <strong>{creatorName}</strong>
                {postList.length > 1 && (
                  <span className="pv-mobile-count">
                    {currentIndex + 1} of {postList.length}
                  </span>
                )}
              </div>

              <div className="pv-mobile-header-right">
                <button
                  type="button"
                  className="pv-menu-btn"
                  aria-label="Close"
                  onClick={onClose}
                >
                  <X size={22} />
                </button>
              </div>
            </header>

            {/* Continuous Scrollable Vertical Feed (Instagram Profile Feed) */}
            <div className="pv-mobile-scrollable pv-mobile-feed-stream">
              {postList.map((p) => (
                <MobilePostItem
                  key={p.id}
                  post={p}
                  creatorName={creatorName}
                  avatar={avatar}
                  likesEnabled={likesEnabled}
                  busy={busy}
                  onToggle={onToggle}
                  onOpenComments={(pid) => {
                    setCommentPostId(pid);
                    setCommentOpen(true);
                  }}
                  onShare={handleShare}
                  admin={admin}
                  onEdit={onEdit ? () => onEdit(p) : undefined}
                  onArchive={onArchive ? () => onArchive(p) : undefined}
                  onDelete={onDelete ? () => onDelete(p) : undefined}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <CommentSheet
          postId={commentPostId}
          open={commentOpen}
          onOpenChange={setCommentOpen}
          admin={admin}
          onRemove={onRemoveComment}
          onCountChange={setCommentCount}
        />
      </>
    );
  }

  // ══════════════════════════════════════════════════════════
  // DESKTOP LAYOUT: 2-Column Dialog + Seamless Next/Prev Flow
  // ══════════════════════════════════════════════════════════
  return (
    <>
      {/* Floating Outside Next / Previous Navigation Arrows */}
      {hasPrev && (
        <button
          type="button"
          className="pv-desktop-post-nav pv-desktop-prev"
          aria-label="Previous post (Up arrow or k)"
          title="Previous post (Up arrow or k)"
          onClick={goToPrevPost}
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          className="pv-desktop-post-nav pv-desktop-next"
          aria-label="Next post (Down arrow or j)"
          title="Next post (Down arrow or j)"
          onClick={goToNextPost}
        >
          <ChevronRight size={32} />
        </button>
      )}

      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="pv-desktop-dialog" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>{currentPost.title || "Creator post"}</DialogTitle>
            <DialogDescription>Creator post and community comments</DialogDescription>
          </DialogHeader>

          {/* Left: Media Column */}
          <div
            className={`pv-desk-media-col ${fitMode === "contain" ? "pv-fit-contain" : "pv-fit-cover"}`}
            onWheel={handleDesktopWheel}
          >
            <div
              className="pv-media-track"
              ref={desktopCarouselRef}
              onScroll={handleDesktopCarouselScroll}
            >
              {media.map((m, idx) => (
                <div className="pv-slide-item" key={m.id || idx}>
                  {m.mime.startsWith("video/") ? (
                    <ProtectedVideo
                      controls
                      playsInline
                      preload="metadata"
                      src={m.url}
                      aria-label={currentPost.title}
                    />
                  ) : (
                    <ProtectedImage src={m.url} alt={currentPost.title} />
                  )}
                  <PrivateMediaMark />
                </div>
              ))}
            </div>

            {/* Desktop Fit Toggle Button */}
            <button
              type="button"
              className="pv-fit-toggle pv-fit-toggle-desktop"
              onClick={(e) => {
                e.stopPropagation();
                setFitMode((curr) => (curr === "cover" ? "contain" : "cover"));
              }}
              aria-label={fitMode === "cover" ? "Fit whole image" : "Fill card (no black borders)"}
              title={fitMode === "cover" ? "Fit to frame" : "Fill card (no borders)"}
            >
              {fitMode === "cover" ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              <span>{fitMode === "cover" ? "Fit" : "Fill"}</span>
            </button>

            {/* Carousel Inner Navigation for Multi-photo Posts */}
            {totalSlides > 1 && (
              <>
                {desktopSlide > 0 && (
                  <button
                    type="button"
                    className="pv-nav-arrow pv-nav-left"
                    aria-label="Previous photo"
                    onClick={() => slideDesktopTo(desktopSlide - 1)}
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}
                {desktopSlide < totalSlides - 1 && (
                  <button
                    type="button"
                    className="pv-nav-arrow pv-nav-right"
                    aria-label="Next photo"
                    onClick={() => slideDesktopTo(desktopSlide + 1)}
                  >
                    <ChevronRight size={22} />
                  </button>
                )}
                <div className="pv-dots-row pv-dots-desktop">
                  {media.map((_, i) => (
                    <span
                      key={i}
                      className={`pv-dot-indicator ${i === desktopSlide ? "active" : ""}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right: Info & Comments Sidebar */}
          <div className="pv-desk-side-col">
            {/* Sidebar Header */}
            <div className="pv-desk-head">
              <img
                src={avatar || "/nina-gallery/nina-kurain-01.jpeg"}
                alt={creatorName}
                className="pv-mobile-avatar"
              />
              <div className="pv-desk-head-info">
                <div className="pv-name-row">
                  <strong>{creatorName}</strong>
                  <BadgeCheck size={14} className="pv-badge-check" />
                </div>
                <span className="pv-access-pill">{accessLabel}</span>
              </div>

              {/* Post Position Counter with Quick Stepper */}
              {postList.length > 1 && (
                <div className="pv-post-counter-badge">
                  <span>
                    {currentIndex + 1}/{postList.length}
                  </span>
                  <button
                    type="button"
                    className="pv-post-counter-nav-btn"
                    disabled={!hasPrev}
                    onClick={goToPrevPost}
                    title="Previous post (Up arrow or k)"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    className="pv-post-counter-nav-btn"
                    disabled={!hasNext}
                    onClick={goToNextPost}
                    title="Next post (Down arrow or j)"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>
              )}

              {/* Admin Quick Actions */}
              {admin && (
                <div className="pv-admin-header-actions" style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                  {onEdit && (
                    <button
                      type="button"
                      className="pv-admin-quick-edit-btn"
                      title="Edit post"
                      onClick={() => onEdit(currentPost)}
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                  )}
                  <div className="pv-menu-wrap" ref={menuRef}>
                    <button
                      type="button"
                      className="pv-menu-btn"
                      aria-label="Admin options"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {menuOpen && (
                      <div className="pv-menu-dropdown">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpen(false);
                              onEdit(currentPost);
                            }}
                          >
                            <Pencil size={14} /> Edit post
                          </button>
                        )}
                        {onArchive && (
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => {
                              setMenuOpen(false);
                              void onArchive(currentPost);
                            }}
                          >
                            <Archive size={14} /> Archive
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="pv-danger"
                            disabled={busy}
                            onClick={() => {
                              setMenuOpen(false);
                              onDelete(currentPost);
                            }}
                          >
                            <Trash2 size={14} /> Delete
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button
                type="button"
                className="pv-close-desk-btn"
                aria-label="Close dialog"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>

            {/* Caption Block */}
            {hasCaption && (
              <div className="pv-desk-caption-block">
                <strong>{creatorName}</strong> {captionText}
              </div>
            )}

            {/* Scrollable Comments Thread */}
            <div className="pv-desk-comments-scroll">
              <CommentThread
                key={currentPost.id}
                postId={currentPost.id}
                admin={admin}
                onRemove={onRemoveComment}
                onCountChange={setCommentCount}
              />
            </div>

            {/* Sidebar Footer with Action Row */}
            <div className="pv-desk-footer">
              <div className="pv-action-bar">
                <div className="pv-action-group">
                  {likesEnabled && (
                    <button
                      type="button"
                      disabled={busy}
                      aria-label={currentPost.liked ? "Unlike" : "Like"}
                      onClick={handleLike}
                      className="pv-action-icon-btn"
                    >
                      <Heart
                        size={24}
                        fill={currentPost.liked ? "currentColor" : "none"}
                        className={currentPost.liked ? "pv-liked" : ""}
                      />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Share post link"
                    className="pv-action-icon-btn"
                    onClick={() => void handleShare(currentPost)}
                  >
                    {copied ? <Check size={22} className="pv-copied-check" /> : <Share2 size={22} />}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  aria-label={currentPost.saved ? "Unsave" : "Save"}
                  className="pv-action-icon-btn"
                  onClick={() => void onToggle("save", currentPost)}
                >
                  <Bookmark size={24} fill={currentPost.saved ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="pv-desk-meta-line">
                <strong>{currentPost.like_count ?? 0} likes</strong>
                <span>·</span>
                <span>{commentCount} comments</span>
                <span>·</span>
                <time>{timeAgo(currentPost.published_at)}</time>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
