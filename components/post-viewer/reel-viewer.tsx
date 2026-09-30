"use client";
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
  Volume2,
  VolumeX,
  Play,
  Pause,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  BadgeCheck,
  Check,
  X,
  Clapperboard,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PrivateMediaMark, ProtectedVideo } from "@/components/protected-media";
import { CommentSheet } from "./comment-sheet";
import { CommentThread } from "@/app/live-client";
import type { ContentPost } from "@/lib/server/entitlements";
import { useMobileViewer } from "@/hooks/use-mobile-viewer";

const timeAgo = (value: number) => {
  const s = Math.max(1, Math.floor((Date.now() - value) / 1000));
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};

export interface ReelViewerProps {
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
  onEdit?: () => void;
  onArchive?: () => Promise<void>;
  onDelete?: () => void;
  onRemoveComment?: (id: string) => void;
}

export function ReelViewer({
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
}: ReelViewerProps) {
  // Filter for reel-eligible posts
  const reelList = useMemo(() => {
    if (posts && posts.length > 0) {
      const onlyReels = posts.filter(
        (p) => p.is_reel || p.media?.[0]?.mime.startsWith("video/")
      );
      return onlyReels.length > 0 ? onlyReels : [post];
    }
    return [post];
  }, [posts, post]);

  const [activeReelId, setActiveReelId] = useState(post.id);

  // Sync if post prop changes externally
  useEffect(() => {
    setActiveReelId(post.id);
  }, [post.id]);

  const currentReel = useMemo(() => {
    return reelList.find((p) => p.id === activeReelId) || post;
  }, [reelList, activeReelId, post]);

  const currentIndex = useMemo(() => {
    return reelList.findIndex((p) => p.id === currentReel.id);
  }, [reelList, currentReel.id]);

  const hasNext = currentIndex >= 0 && currentIndex < reelList.length - 1;
  const hasPrev = currentIndex > 0;

  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(true);
  const [muted, setMuted] = useState(true);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(currentReel.comment_count ?? 0);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPlayIndicator, setShowPlayIndicator] = useState(false);
  const [copied, setCopied] = useState(false);
  const [heartPop, setHeartPop] = useState(false);

  const mediaUrl = currentReel.media?.[0]?.url;
  const isMobile = useMobileViewer();

  // Reset when reel changes
  useEffect(() => {
    setCommentCount(currentReel.comment_count ?? 0);
    setCaptionExpanded(false);
    setPlaying(true);
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [currentReel.id, currentReel.comment_count]);

  // Browser back closes reel
  useEffect(() => {
    const previousUrl = window.location.href;
    const previousState = history.state;
    const url = new URL(window.location.href);
    url.searchParams.set("reel", currentReel.id);
    history.pushState({ reelViewer: true }, "", url.toString());

    const handler = () => {
      onClose();
    };
    window.addEventListener("popstate", handler);
    return () => {
      window.removeEventListener("popstate", handler);
      if (history.state?.reelViewer) {
        history.replaceState(previousState, "", previousUrl);
      }
    };
  }, [currentReel.id, onClose]);

  // Lock background scrolling while open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Pause on unmount
  useEffect(() => {
    return () => {
      videoRef.current?.pause();
    };
  }, []);

  // Auto-play muted on mount
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = muted;
    v.play().catch(() => {});
  }, [muted, currentReel.id]);

  // Navigation handlers
  const goToNextReel = useCallback(() => {
    if (hasNext) {
      const next = reelList[currentIndex + 1];
      setActiveReelId(next.id);
      onNavigatePost?.(next);
    }
  }, [hasNext, currentIndex, reelList, onNavigatePost]);

  const goToPrevReel = useCallback(() => {
    if (hasPrev) {
      const prev = reelList[currentIndex - 1];
      setActiveReelId(prev.id);
      onNavigatePost?.(prev);
    }
  }, [hasPrev, currentIndex, reelList, onNavigatePost]);

  // Touch swipe tracking for mobile
  const touchStartYRef = useRef<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartYRef.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartYRef.current === null) return;
    const deltaY = touchStartYRef.current - e.changedTouches[0].clientY;
    touchStartYRef.current = null;
    if (Math.abs(deltaY) > 50) {
      if (deltaY > 0 && hasNext) {
        goToNextReel();
      } else if (deltaY < 0 && hasPrev) {
        goToPrevReel();
      }
    }
  };

  // Wheel navigation on desktop
  const wheelLockRef = useRef(false);
  const handleWheel = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) > 40) {
      if (wheelLockRef.current) return;
      wheelLockRef.current = true;
      if (e.deltaY > 0 && hasNext) {
        goToNextReel();
      } else if (e.deltaY < 0 && hasPrev) {
        goToPrevReel();
      }
      setTimeout(() => {
        wheelLockRef.current = false;
      }, 400);
    }
  };

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
        videoRef.current?.pause();
        onClose();
        return;
      }
      if ((e.key === "ArrowDown" || e.key === "j") && hasNext) {
        e.preventDefault();
        goToNextReel();
        return;
      }
      if ((e.key === "ArrowUp" || e.key === "k") && hasPrev) {
        e.preventDefault();
        goToPrevReel();
        return;
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [commentOpen, hasNext, hasPrev, goToNextReel, goToPrevReel, onClose]);

  function togglePlay() {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play().catch(() => setPlaying(false));
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
    setShowPlayIndicator(true);
    setTimeout(() => setShowPlayIndicator(false), 550);
  }

  function toggleMute(e?: React.MouseEvent) {
    e?.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }

  async function handleLike() {
    setHeartPop(true);
    setTimeout(() => setHeartPop(false), 400);
    await onToggle("like", currentReel);
  }

  async function handleShare() {
    const protectedUrl = `${window.location.origin}/profile?tab=reels&reel=${currentReel.id}`;
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(protectedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    }
  }

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

  const accessLabel =
    currentReel.access_mode === "free"
      ? "FREE"
      : currentReel.access_mode === "level"
      ? `LEVEL ${currentReel.minimum_level}+`
      : "SELECTED";

  const captionText = currentReel.caption?.trim() || currentReel.title?.trim() || "";

  // ══════════════════════════════════════════════════════════
  // MOBILE LAYOUT: Full-Screen Instagram Reel with Up/Down Flow
  // ══════════════════════════════════════════════════════════
  if (isMobile) {
    return (
      <>
        <Dialog
          open
          onOpenChange={(open) => {
            if (!open) {
              videoRef.current?.pause();
              onClose();
            }
          }}
        >
          <DialogContent className="rv-mobile-screen" showCloseButton={false}>
            <DialogHeader className="sr-only">
              <DialogTitle>{currentReel.title || "Creator reel"}</DialogTitle>
              <DialogDescription>
                Full screen reel viewer and community discussion
              </DialogDescription>
            </DialogHeader>

            {/* Tap-to-play Video Layer with touch swipe */}
            <div
              className="rv-video-container"
              onClick={togglePlay}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <ProtectedVideo
                ref={videoRef}
                className="rv-video-elem"
                src={mediaUrl}
                playsInline
                autoPlay
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                loop
                muted={muted}
                preload="auto"
                aria-label={currentReel.title}
              />
              <PrivateMediaMark />

              {showPlayIndicator && (
                <div className="rv-play-badge" aria-hidden="true">
                  {playing ? <Play size={44} /> : <Pause size={44} />}
                </div>
              )}
            </div>

            {/* Top Navigation Overlay */}
            <header className="rv-top-overlay">
              <button
                type="button"
                className="rv-back-btn"
                aria-label="Close reel"
                onClick={() => {
                  videoRef.current?.pause();
                  onClose();
                }}
              >
                <ChevronLeft size={28} />
              </button>

              <div className="rv-reel-tag">
                <Clapperboard size={15} />
                <span>Reels</span>
                {reelList.length > 1 && (
                  <span className="rv-reel-counter">
                    {currentIndex + 1}/{reelList.length}
                  </span>
                )}
              </div>

              {/* Overflow Menu */}
              <div className="rv-admin-header-actions" style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
                {admin && onEdit && (
                  <button
                    type="button"
                    className="pv-admin-quick-edit-btn"
                    title="Edit reel"
                    onClick={() => {
                      videoRef.current?.pause();
                      onEdit();
                    }}
                  >
                    <Pencil size={13} />
                    <span>Edit</span>
                  </button>
                )}

                <div className="rv-menu-wrap" ref={menuRef}>
                  <button
                    type="button"
                    className="rv-menu-btn"
                    aria-label="Reel options"
                    onClick={() => setMenuOpen(!menuOpen)}
                  >
                    <MoreHorizontal size={22} />
                  </button>

                  {menuOpen && (
                    <div className="rv-menu-dropdown">
                      {admin && onEdit && (
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(false);
                            videoRef.current?.pause();
                            onEdit();
                          }}
                        >
                          <Pencil size={15} /> Edit reel
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
                          <Archive size={15} /> Archive
                        </button>
                      )}
                      {admin && onDelete && (
                        <button
                          type="button"
                          className="rv-danger"
                          disabled={busy}
                          onClick={() => {
                            setMenuOpen(false);
                            onDelete();
                          }}
                        >
                          <Trash2 size={15} /> Delete
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

            {/* Right-Side Action Stack */}
            <div className="rv-right-actions">
              {/* Stepper Up/Down to Next/Prev Reel */}
              {reelList.length > 1 && (
                <div className="rv-mobile-stepper">
                  <button
                    type="button"
                    className="rv-stepper-btn"
                    disabled={!hasPrev}
                    onClick={goToPrevReel}
                    aria-label="Previous reel"
                  >
                    <ChevronUp size={22} />
                  </button>
                  <button
                    type="button"
                    className="rv-stepper-btn"
                    disabled={!hasNext}
                    onClick={goToNextReel}
                    aria-label="Next reel"
                  >
                    <ChevronDown size={22} />
                  </button>
                </div>
              )}

              {likesEnabled && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleLike}
                  className={`rv-side-btn ${heartPop ? "rv-heart-pop" : ""}`}
                  aria-label={currentReel.liked ? "Unlike reel" : "Like reel"}
                >
                  <Heart
                    size={28}
                    fill={currentReel.liked ? "currentColor" : "none"}
                    className={currentReel.liked ? "rv-liked" : ""}
                  />
                  <span>{currentReel.like_count ?? 0}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setCommentOpen(true)}
                className="rv-side-btn"
                aria-label="Comments"
              >
                <MessageCircle size={28} />
                <span>{commentCount}</span>
              </button>

              <button
                type="button"
                disabled={busy}
                onClick={() => void onToggle("save", currentReel)}
                className="rv-side-btn"
                aria-label={currentReel.saved ? "Unsave reel" : "Save reel"}
              >
                <Bookmark size={28} fill={currentReel.saved ? "currentColor" : "none"} />
              </button>

              <button
                type="button"
                onClick={() => void handleShare()}
                className="rv-side-btn"
                aria-label="Share reel"
              >
                {copied ? <Check size={24} className="rv-copied" /> : <Share2 size={24} />}
              </button>

              <button
                type="button"
                onClick={toggleMute}
                className="rv-side-btn rv-mute-btn"
                aria-label={muted ? "Unmute reel" : "Mute reel"}
              >
                {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
            </div>

            {/* Bottom Overlay: Creator Info & Caption */}
            <div className="rv-bottom-overlay">
              <div className="rv-creator-row">
                <img
                  src={avatar || "/nina-gallery/nina-kurain-01.jpeg"}
                  alt={creatorName}
                  className="rv-creator-avatar"
                />
                <div className="rv-creator-meta">
                  <div className="rv-name-row">
                    <strong>{creatorName}</strong>
                    <BadgeCheck size={13} className="rv-badge-check" />
                  </div>
                  <span className="rv-access-pill">{accessLabel}</span>
                </div>
              </div>

              {captionText && (
                <div
                  className={`rv-caption-box ${
                    captionExpanded ? "rv-caption-box-expanded" : ""
                  }`}
                >
                  <p className="rv-caption-content">{captionText}</p>
                  {captionText.length > 70 && (
                    <button
                      type="button"
                      className="rv-caption-expand-toggle"
                      onClick={() => setCaptionExpanded(!captionExpanded)}
                    >
                      {captionExpanded ? (
                        <>
                          less <ChevronUp size={13} />
                        </>
                      ) : (
                        "…more"
                      )}
                    </button>
                  )}
                </div>
              )}

              <time className="rv-time-stamp">{timeAgo(currentReel.published_at)}</time>
            </div>

            {message && <div className="rv-message-banner" role="status">{message}</div>}
            {copied && <div className="rv-toast-alert" role="status">Link copied to clipboard</div>}
          </DialogContent>
        </Dialog>

        <CommentSheet
          postId={currentReel.id}
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
      {/* Floating Outside Next / Previous Reel Buttons */}
      {hasPrev && (
        <button
          type="button"
          className="pv-desktop-post-nav pv-desktop-prev"
          aria-label="Previous reel (Up arrow or k)"
          title="Previous reel (Up arrow or k)"
          onClick={goToPrevReel}
        >
          <ChevronLeft size={32} />
        </button>
      )}

      {hasNext && (
        <button
          type="button"
          className="pv-desktop-post-nav pv-desktop-next"
          aria-label="Next reel (Down arrow or j)"
          title="Next reel (Down arrow or j)"
          onClick={goToNextReel}
        >
          <ChevronRight size={32} />
        </button>
      )}

      <Dialog
        open
        onOpenChange={(open) => {
          if (!open) {
            videoRef.current?.pause();
            onClose();
          }
        }}
      >
        <DialogContent className="rv-desktop-dialog" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <DialogTitle>{currentReel.title || "Creator reel"}</DialogTitle>
            <DialogDescription>Creator reel and discussion</DialogDescription>
          </DialogHeader>

          {/* Left: Video Column */}
          <div className="rv-desk-video-col" onClick={togglePlay} onWheel={handleWheel}>
            <ProtectedVideo
              ref={videoRef}
              className="rv-video-elem"
              src={mediaUrl}
              playsInline
              autoPlay
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              loop
              muted={muted}
              preload="auto"
              aria-label={currentReel.title}
            />
            <PrivateMediaMark />

            {showPlayIndicator && (
              <div className="rv-play-badge" aria-hidden="true">
                {playing ? <Play size={48} /> : <Pause size={48} />}
              </div>
            )}

            <button
              type="button"
              className="rv-desk-mute-btn"
              onClick={toggleMute}
              aria-label={muted ? "Unmute" : "Mute"}
            >
              {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>

          {/* Right: Creator Sidebar & Comments */}
          <div className="rv-desk-side-col">
            <div className="rv-desk-head">
              <img
                src={avatar || "/nina-gallery/nina-kurain-01.jpeg"}
                alt={creatorName}
                className="rv-creator-avatar"
              />
              <div className="rv-desk-head-info">
                <div className="rv-name-row">
                  <strong>{creatorName}</strong>
                  <BadgeCheck size={14} className="rv-badge-check" />
                </div>
                <span className="rv-access-pill">{accessLabel}</span>
              </div>

              {/* Reel Counter Badge */}
              {reelList.length > 1 && (
                <div className="pv-post-counter-badge">
                  <span>
                    {currentIndex + 1}/{reelList.length}
                  </span>
                  <button
                    type="button"
                    className="pv-post-counter-nav-btn"
                    disabled={!hasPrev}
                    onClick={goToPrevReel}
                    title="Previous reel (Up arrow or k)"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    className="pv-post-counter-nav-btn"
                    disabled={!hasNext}
                    onClick={goToNextReel}
                    title="Next reel (Down arrow or j)"
                  >
                    <ChevronDown size={13} />
                  </button>
                </div>
              )}

              {admin && (
                <div className="rv-admin-header-actions" style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: "auto" }}>
                  {onEdit && (
                    <button
                      type="button"
                      className="pv-admin-quick-edit-btn"
                      title="Edit reel"
                      onClick={() => {
                        videoRef.current?.pause();
                        onEdit();
                      }}
                    >
                      <Pencil size={13} />
                      <span>Edit</span>
                    </button>
                  )}
                  <div className="rv-menu-wrap" ref={menuRef}>
                    <button
                      type="button"
                      className="rv-menu-btn"
                      aria-label="Admin options"
                      onClick={() => setMenuOpen(!menuOpen)}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    {menuOpen && (
                      <div className="rv-menu-dropdown">
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpen(false);
                              videoRef.current?.pause();
                              onEdit();
                            }}
                          >
                            <Pencil size={14} /> Edit
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
                            className="rv-danger"
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
                className="rv-desk-close-btn"
                aria-label="Close reel"
                onClick={() => {
                  videoRef.current?.pause();
                  onClose();
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Caption Block */}
            {captionText && (
              <div className="rv-desk-caption-block">
                <strong>{creatorName}</strong> {captionText}
              </div>
            )}

            {/* Scrollable Comments Thread */}
            <div className="rv-desk-comments-scroll">
              <CommentThread
                key={currentReel.id}
                postId={currentReel.id}
                admin={admin}
                onRemove={onRemoveComment}
                onCountChange={setCommentCount}
              />
            </div>

            {/* Sidebar Footer with Action Row */}
            <div className="rv-desk-footer">
              <div className="rv-action-bar">
                <div className="rv-action-group">
                  {likesEnabled && (
                    <button
                      type="button"
                      disabled={busy}
                      aria-label={currentReel.liked ? "Unlike" : "Like"}
                      onClick={handleLike}
                      className="rv-action-icon-btn"
                    >
                      <Heart
                        size={24}
                        fill={currentReel.liked ? "currentColor" : "none"}
                        className={currentReel.liked ? "rv-liked" : ""}
                      />
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label="Share reel link"
                    className="rv-action-icon-btn"
                    onClick={() => void handleShare()}
                  >
                    {copied ? <Check size={22} className="rv-copied-check" /> : <Share2 size={22} />}
                  </button>
                </div>

                <button
                  type="button"
                  disabled={busy}
                  aria-label={currentReel.saved ? "Unsave" : "Save"}
                  className="rv-action-icon-btn"
                  onClick={() => void onToggle("save", currentReel)}
                >
                  <Bookmark size={24} fill={currentReel.saved ? "currentColor" : "none"} />
                </button>
              </div>

              <div className="rv-desk-meta-line">
                <strong>{currentReel.like_count ?? 0} likes</strong>
                <span>·</span>
                <span>{commentCount} comments</span>
                <span>·</span>
                <time>{timeAgo(currentReel.published_at)}</time>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
