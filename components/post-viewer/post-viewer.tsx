"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  X,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  ChevronLeft,
  ChevronRight,
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

interface PostViewerProps {
  post: ContentPost;
  avatar?: string;
  creatorName?: string;
  likesEnabled: boolean;
  busy: boolean;
  message: string;
  onClose: () => void;
  onToggle: (type: "save" | "like", p: ContentPost) => Promise<void>;
  admin?: boolean;
  onEdit?: () => void;
  onArchive?: () => Promise<void>;
  onDelete?: () => void;
  onRemoveComment?: (id: string) => void;
}

export function PostViewer({
  post,
  avatar,
  creatorName = "Nina Kurain",
  likesEnabled,
  busy,
  message,
  onClose,
  onToggle,
  admin = false,
  onEdit,
  onArchive,
  onDelete,
  onRemoveComment,
}: PostViewerProps) {
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comment_count ?? 0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [copied, setCopied] = useState(false);
  const [heartPop, setHeartPop] = useState(false);
  const [fitMode, setFitMode] = useState<"cover" | "contain">("cover");

  const carouselRef = useRef<HTMLDivElement>(null);
  const desktopCarouselRef = useRef<HTMLDivElement>(null);
  const media = post.media ?? [];
  const totalSlides = media.length;
  const isMobile = useMobileViewer();

  // Browser back closes the viewer without page refresh
  useEffect(() => {
    const previousUrl = window.location.href;
    const previousState = history.state;
    const url = new URL(window.location.href);
    url.searchParams.set("post", post.id);
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
  }, [post.id, onClose]);

  // Lock background scrolling while viewer is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Carousel scroll tracking for mobile
  const handleScroll = useCallback(() => {
    const el = carouselRef.current || desktopCarouselRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollLeft / el.clientWidth);
    setCurrentSlide(Math.max(0, Math.min(idx, totalSlides - 1)));
  }, [totalSlides]);

  function slideTo(idx: number, isDesktop = false) {
    const el = isDesktop ? desktopCarouselRef.current : carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: idx * el.clientWidth, behavior: "smooth" });
  }

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        commentOpen ||
        (e.target instanceof Element && e.target.closest("input,textarea,[contenteditable=true]"))
      ) {
        return;
      }
      if (e.key === "ArrowLeft" && currentSlide > 0) {
        slideTo(currentSlide - 1, !isMobile);
      }
      if (e.key === "ArrowRight" && currentSlide < totalSlides - 1) {
        slideTo(currentSlide + 1, !isMobile);
      }
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [currentSlide, totalSlides, commentOpen, isMobile, onClose]);

  // Close overflow menu on outside click
  const menuRef = useRef<HTMLDivElement>(null);
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

  // Internal protected share handler
  async function handleShare() {
    const protectedUrl = `${window.location.origin}/profile?post=${post.id}`;
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
    await onToggle("like", post);
  }

  const accessLabel =
    post.access_mode === "free"
      ? "FREE"
      : post.access_mode === "level"
      ? `LEVEL ${post.minimum_level}+`
      : "SELECTED";

  const hasCaption = Boolean(post.caption?.trim() || post.title?.trim());
  const captionText = post.caption?.trim() || post.title?.trim();

  // ─── Mobile Layout (dedicated full viewport screen) ───
  if (isMobile) {
    return (
      <>
        <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
          <DialogContent className="pv-mobile-screen" showCloseButton={false}>
            <DialogHeader className="sr-only">
              <DialogTitle>{post.title || "Creator post"}</DialogTitle>
              <DialogDescription>
                Creator post viewer and interactive comments.
              </DialogDescription>
            </DialogHeader>

            {/* Mobile Header: 54px fixed bar */}
            <header className="pv-mobile-header">
              <button
                type="button"
                className="pv-back-btn"
                aria-label="Back to profile"
                onClick={onClose}
              >
                <ChevronLeft size={26} />
              </button>

              <div className="pv-mobile-creator">
                <img
                  src={avatar || "/nina-kurain-official-portrait.webp"}
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

              {/* Overflow Actions */}
              <div className="pv-admin-header-actions">
                {admin && onEdit && (
                  <button
                    type="button"
                    className="pv-admin-quick-edit-btn"
                    title="Edit post"
                    onClick={() => onEdit()}
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
                          onEdit();
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
                          void onArchive();
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
                          onDelete();
                        }}
                      >
                        <Trash2 size={15} /> Delete post
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        void handleShare();
                      }}
                    >
                      {copied ? <Check size={15} /> : <Share2 size={15} />}
                      {copied ? "Link copied" : "Share link"}
                    </button>
                  </div>
                )}
                </div>
              </div>
            </header>

            {/* Scrollable Container for Media & Content */}
            <div className="pv-mobile-scrollable">
              {/* Media Carousel */}
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

                {/* Fit Mode Toggle Button */}
                <button
                  type="button"
                  className="pv-fit-toggle"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFitMode(curr => curr === "cover" ? "contain" : "cover");
                  }}
                  aria-label={fitMode === "cover" ? "Fit whole image" : "Fill card (no black borders)"}
                  title={fitMode === "cover" ? "Fit to frame" : "Fill card (no borders)"}
                >
                  {fitMode === "cover" ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                  <span>{fitMode === "cover" ? "Fit" : "Fill"}</span>
                </button>

                {/* Multi-image indicators */}
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

              {/* Compact Action Row */}
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
                    onClick={() => setCommentOpen(true)}
                  >
                    <MessageCircle size={24} />
                  </button>
                  <button
                    type="button"
                    aria-label="Share post link"
                    className="pv-action-icon-btn"
                    onClick={() => void handleShare()}
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

              {/* Post Info & Caption */}
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

                {commentCount > 0 ? (
                  <button
                    type="button"
                    className="pv-comments-trigger"
                    onClick={() => setCommentOpen(true)}
                  >
                    View all {commentCount} {commentCount === 1 ? "comment" : "comments"}
                  </button>
                ) : (
                  <button
                    type="button"
                    className="pv-comments-trigger pv-comments-empty-trigger"
                    onClick={() => setCommentOpen(true)}
                  >
                    Add a comment…
                  </button>
                )}

                <time className="pv-publish-stamp">{timeAgo(post.published_at)}</time>
              </div>

              {message && <div className="pv-error-msg" role="status">{message}</div>}
              {copied && <div className="pv-toast-copied" role="status">Protected link copied to clipboard</div>}
            </div>
          </DialogContent>
        </Dialog>

        <CommentSheet
          postId={post.id}
          open={commentOpen}
          onOpenChange={setCommentOpen}
          admin={admin}
          onRemove={onRemoveComment}
          onCountChange={setCommentCount}
        />
      </>
    );
  }

  // ─── Desktop Layout (Instagram-Style 2-Column Dialog) ───
  return (
    <>
      <Dialog open onOpenChange={(open) => { if (!open) onClose(); }}>
        <DialogContent className="pv-desktop-dialog" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>{post.title || "Creator post"}</DialogTitle>
            <DialogDescription>Creator post and community comments</DialogDescription>
          </DialogHeader>

          {/* Left: Media Column */}
          <div className={`pv-desk-media-col ${fitMode === "contain" ? "pv-fit-contain" : "pv-fit-cover"}`}>
            <div
              className="pv-media-track"
              ref={desktopCarouselRef}
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

            {/* Desktop Fit Toggle Button */}
            <button
              type="button"
              className="pv-fit-toggle pv-fit-toggle-desktop"
              onClick={(e) => {
                e.stopPropagation();
                setFitMode(curr => curr === "cover" ? "contain" : "cover");
              }}
              aria-label={fitMode === "cover" ? "Fit whole image" : "Fill card (no black borders)"}
              title={fitMode === "cover" ? "Fit to frame" : "Fill card (no borders)"}
            >
              {fitMode === "cover" ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              <span>{fitMode === "cover" ? "Fit" : "Fill"}</span>
            </button>

            {totalSlides > 1 && (
              <>
                {currentSlide > 0 && (
                  <button
                    type="button"
                    className="pv-nav-arrow pv-nav-left"
                    aria-label="Previous photo"
                    onClick={() => slideTo(currentSlide - 1, true)}
                  >
                    <ChevronLeft size={22} />
                  </button>
                )}
                {currentSlide < totalSlides - 1 && (
                  <button
                    type="button"
                    className="pv-nav-arrow pv-nav-right"
                    aria-label="Next photo"
                    onClick={() => slideTo(currentSlide + 1, true)}
                  >
                    <ChevronRight size={22} />
                  </button>
                )}
                <div className="pv-dots-row pv-dots-desktop">
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

          {/* Right: Info & Comments Sidebar */}
          <div className="pv-desk-side-col">
            {/* Sidebar Header */}
            <div className="pv-desk-head">
              <img
                src={avatar || "/nina-kurain-official-portrait.webp"}
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

              {admin && (
                <div className="pv-admin-header-actions">
                  {onEdit && (
                    <button
                      type="button"
                      className="pv-admin-quick-edit-btn"
                      title="Edit post"
                      onClick={() => onEdit()}
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
                            onEdit();
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
                            void onArchive();
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
                            onDelete();
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
                postId={post.id}
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
                      aria-label={post.liked ? "Unlike" : "Like"}
                      onClick={handleLike}
                      className="pv-action-icon-btn"
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
                    aria-label="Share post link"
                    className="pv-action-icon-btn"
                    onClick={() => void handleShare()}
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

              <div className="pv-desk-meta-line">
                <strong>{post.like_count ?? 0} likes</strong>
                <span>·</span>
                <span>{commentCount} comments</span>
                <span>·</span>
                <time>{timeAgo(post.published_at)}</time>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

