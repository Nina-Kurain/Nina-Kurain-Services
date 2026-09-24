"use client";
import { useState, useEffect, useRef, type FormEvent, type KeyboardEvent } from "react";
import { Heart, MessageCircle, Send, Trash2, Pin, CornerUpLeft, BadgeCheck, ChevronDown, Loader2, X, Lock } from "lucide-react";
import { Drawer, DrawerContent, DrawerTitle } from "@/components/ui/drawer";
import { api, useData, State, type CommentRecord } from "@/app/live-client";

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

interface CommentSheetProps {
  postId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin?: boolean;
  onRemove?: (id: string) => void;
  onCountChange?: (count: number) => void;
}

const QUICK_EMOJIS = ["♡", "✨", "🔥", "🥂", "🌹", "🖤"];

export function CommentSheet({
  postId,
  open,
  onOpenChange,
  admin = false,
  onRemove,
  onCountChange,
}: CommentSheetProps) {
  const { data, error, loading, refresh } = useData<{
    comments: CommentRecord[];
    viewerId: string;
    canComment: boolean;
  }>(`${admin ? "/api/studio" : "/api/app"}/comments/${postId}`, 5000);

  const [localComments, setLocalComments] = useState<CommentRecord[]>([]);
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [replying, setReplying] = useState<{ id: string; name: string } | null>(null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Synchronize local comments from server data
  useEffect(() => {
    if (data?.comments) {
      setLocalComments(data.comments);
      onCountChange?.(data.comments.length);
    }
  }, [data?.comments, onCountChange]);

  // Adjust textarea height dynamically
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
  }, [text]);

  async function submit(event?: FormEvent) {
    if (event) event.preventDefault();
    const body = text.trim();
    if (!body || busy) return;

    setBusy(true);
    setMessage("");

    const tempId = `temp-${Date.now()}`;
    const optimisticComment: CommentRecord = {
      id: tempId,
      user_id: data?.viewerId ?? "viewer",
      parent_id: replying?.id ?? null,
      body,
      pinned_at: null,
      created_at: Date.now(),
      display_name: admin ? "Nina Kurain" : "You",
      role: admin ? "admin" : "member",
      like_count: 0,
      liked: 0,
    };

    // Optimistic insert
    const previous = localComments;
    const nextComments = [...previous, optimisticComment];
    setLocalComments(nextComments);
    onCountChange?.(nextComments.length);

    if (replying) {
      setExpanded((curr) => ({ ...curr, [replying.id]: true }));
    }

    setText("");
    const prevReplying = replying;
    setReplying(null);

    // Scroll to the new comment
    requestAnimationFrame(() => {
      if (listRef.current) {
        listRef.current.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
      }
    });

    try {
      await api(`${admin ? "/api/studio" : "/api/app"}/comment`, {
        postId,
        body,
        parentId: prevReplying?.id ?? null,
      });
      await refresh();
    } catch (err) {
      // Rollback on failure
      setLocalComments(previous);
      onCountChange?.(previous.length);
      setText(body);
      setReplying(prevReplying);
      setMessage(err instanceof Error ? err.message : "Could not post comment. Please retry.");
    } finally {
      setBusy(false);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    // Enter key submits if not shift
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void submit();
    }
  }

  async function toggleLike(comment: CommentRecord) {
    if (busy) return;
    const nextLiked = !Boolean(comment.liked);
    const delta = nextLiked ? 1 : -1;

    // Optimistic update
    setLocalComments((curr) =>
      curr.map((c) =>
        c.id === comment.id
          ? { ...c, liked: nextLiked ? 1 : 0, like_count: Math.max(0, (c.like_count || 0) + delta) }
          : c
      )
    );

    try {
      await api(`${admin ? "/api/studio" : "/api/app"}/comment-like`, {
        id: comment.id,
        selected: nextLiked,
      });
      await refresh();
    } catch (err) {
      // Revert
      setLocalComments((curr) =>
        curr.map((c) => (c.id === comment.id ? comment : c))
      );
      setMessage(err instanceof Error ? err.message : "Could not update like.");
    }
  }

  async function togglePin(comment: CommentRecord) {
    if (!admin || busy) return;
    setBusy(true);
    setMessage("");
    try {
      await api("/api/studio/pin-comment", { id: comment.id, selected: !comment.pinned_at });
      await refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not update pin.");
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    if (busy) return;
    if (onRemove) {
      onRemove(id);
      return;
    }

    const previous = localComments;
    const nextComments = previous.filter((c) => c.id !== id && c.parent_id !== id);
    setLocalComments(nextComments);
    onCountChange?.(nextComments.length);

    setBusy(true);
    setMessage("");
    try {
      await api(`${admin ? "/api/studio" : "/api/app"}/delete-comment`, { id });
      await refresh();
    } catch (err) {
      setLocalComments(previous);
      onCountChange?.(previous.length);
      setMessage(err instanceof Error ? err.message : "Could not remove comment.");
    } finally {
      setBusy(false);
    }
  }

  const roots = localComments
    .filter((comment) => !comment.parent_id)
    .sort(
      (a, b) =>
        Number(Boolean(b.pinned_at)) - Number(Boolean(a.pinned_at)) ||
        a.created_at - b.created_at
    );

  function CommentItem({ comment, nested = false }: { comment: CommentRecord; nested?: boolean }) {
    const parent = comment.parent_id
      ? localComments.find((entry) => entry.id === comment.parent_id)
      : comment;
    const isOwner = comment.user_id === data?.viewerId;
    const canDelete = admin || isOwner;

    return (
      <article
        className={`cs-comment ${nested ? "cs-comment-reply" : ""} ${
          comment.pinned_at ? "cs-pinned" : ""
        }`}
        id={`comment-${comment.id}`}
      >
        <div
          className={`cs-avatar ${comment.role === "admin" ? "cs-creator" : ""}`}
          aria-hidden="true"
        >
          {comment.role === "admin" ? "NK" : String(comment.display_name || "M").trim().slice(0, 1).toUpperCase()}
        </div>

        <div className="cs-body">
          <div className="cs-identity">
            <span className="cs-author">{comment.display_name}</span>
            {comment.role === "admin" && (
              <span className="cs-creator-badge" title="Creator Verified">
                <BadgeCheck size={12} /> Creator
              </span>
            )}
            {comment.pinned_at && (
              <span className="cs-pin-badge" title="Pinned by creator">
                <Pin size={10} /> Pinned
              </span>
            )}
            <time className="cs-time" dateTime={new Date(comment.created_at).toISOString()}>
              {timeAgo(comment.created_at)}
            </time>
          </div>

          <p className="cs-text">{comment.body}</p>

          <div className="cs-actions">
            <button
              type="button"
              className={`cs-action-btn cs-like-btn ${comment.liked ? "cs-liked" : ""}`}
              aria-label={comment.liked ? "Unlike" : "Like"}
              onClick={() => void toggleLike(comment)}
            >
              <Heart size={14} fill={comment.liked ? "currentColor" : "none"} />
              {Boolean(comment.like_count) && <span>{comment.like_count}</span>}
            </button>

            {data?.canComment && (
              <button
                type="button"
                className="cs-action-btn cs-reply-btn"
                onClick={() => {
                  setReplying({ id: parent?.id ?? comment.id, name: comment.display_name });
                  setText(`@${comment.display_name} `);
                  textareaRef.current?.focus();
                }}
              >
                Reply
              </button>
            )}

            {admin && !nested && (
              <button
                type="button"
                className="cs-action-btn cs-pin-btn"
                disabled={busy}
                onClick={() => void togglePin(comment)}
              >
                {comment.pinned_at ? "Unpin" : "Pin"}
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                disabled={busy}
                className="cs-action-btn cs-delete-btn"
                aria-label="Delete comment"
                onClick={() => void remove(comment.id)}
              >
                <Trash2 size={13} />
              </button>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="bottom">
      <DrawerContent className="cs-sheet" aria-describedby={undefined}>
        {/* Region 1: Sticky Header with Drag Handle */}
        <div className="cs-drag-handle" aria-hidden="true">
          <span />
        </div>

        <header className="cs-header">
          <div className="cs-header-left">
            <DrawerTitle className="cs-title">Comments</DrawerTitle>
            <span className="cs-count-pill">{localComments.length}</span>
          </div>
          <button
            type="button"
            className="cs-close"
            aria-label="Close comments"
            onClick={() => onOpenChange(false)}
          >
            <X size={20} />
          </button>
        </header>

        {/* Region 2: Independently Scrollable Comment List */}
        <div className="cs-list" ref={listRef}>
          {!data ? (
            <State loading={loading} error={error} retry={refresh} />
          ) : roots.length > 0 ? (
            roots.map((root) => {
              const replies = localComments.filter((c) => c.parent_id === root.id);
              const hasReplies = replies.length > 0;
              const isExpanded = Boolean(expanded[root.id]);

              return (
                <section className="cs-thread" key={root.id}>
                  <CommentItem comment={root} />

                  {hasReplies && (
                    <div className="cs-thread-replies-wrap">
                      <button
                        type="button"
                        className="cs-reply-toggle"
                        onClick={() =>
                          setExpanded((curr) => ({ ...curr, [root.id]: !curr[root.id] }))
                        }
                      >
                        <span className="cs-reply-line" />
                        <span>
                          {isExpanded
                            ? "Hide replies"
                            : `View ${replies.length} ${
                                replies.length === 1 ? "reply" : "replies"
                              }`}
                        </span>
                        <ChevronDown
                          size={12}
                          className={`cs-chevron ${isExpanded ? "cs-chevron-open" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="cs-replies-list">
                          {replies.map((reply) => (
                            <CommentItem key={reply.id} comment={reply} nested />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </section>
              );
            })
          ) : (
            <div className="cs-empty">
              <div className="cs-empty-icon">
                <MessageCircle size={32} />
              </div>
              <strong>No comments yet</strong>
              <p>Be the first to start the conversation.</p>
            </div>
          )}

          {message && (
            <div className="cs-message" role="alert">
              {message}
            </div>
          )}
        </div>

        {/* Region 3: Sticky Composer or Permissions State */}
        {(admin || data?.canComment) ? (
          <div className="cs-composer-wrap">
            {replying && (
              <div className="cs-replying">
                <CornerUpLeft size={13} />
                <span>
                  Replying to <strong>{replying.name}</strong>
                </span>
                <button
                  type="button"
                  className="cs-cancel-reply"
                  onClick={() => {
                    setReplying(null);
                    setText("");
                  }}
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="cs-quick-emoji" aria-label="Quick reactions">
              {QUICK_EMOJIS.map((emoji) => (
                <button
                  type="button"
                  key={emoji}
                  onClick={() => {
                    setText((curr) => `${curr}${emoji}`);
                    textareaRef.current?.focus();
                  }}
                  title={`Add ${emoji}`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <form className="cs-composer" onSubmit={submit}>
              <div
                className={`cs-composer-avatar ${admin ? "cs-creator" : ""}`}
                aria-hidden="true"
              >
                {admin ? "NK" : "YOU"}
              </div>

              <div className="cs-input-box">
                <label className="sr-only" htmlFor={`cs-input-${postId}`}>
                  {replying ? `Reply to ${replying.name}` : "Add a comment"}
                </label>
                <textarea
                  id={`cs-input-${postId}`}
                  ref={textareaRef}
                  required
                  maxLength={1500}
                  rows={1}
                  placeholder={
                    replying
                      ? `Reply to ${replying.name}…`
                      : admin
                      ? "Add a creator comment…"
                      : "Add a comment…"
                  }
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
                {text.length > 1300 && (
                  <span className="cs-char-limit">{text.length}/1500</span>
                )}
              </div>

              <button
                type="submit"
                disabled={busy || !text.trim()}
                className="cs-send-btn"
                aria-label={replying ? "Post reply" : "Post comment"}
              >
                {busy ? <Loader2 className="spin" size={18} /> : <Send size={18} />}
              </button>
            </form>
          </div>
        ) : (!admin && data && !data.canComment) ? (
          <div className="cs-locked-banner" role="status">
            <Lock size={15} />
            <span>Commenting is available with selected memberships.</span>
          </div>
        ) : null}
      </DrawerContent>
    </Drawer>
  );
}
