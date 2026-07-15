import { useEffect, useState } from "react";
import { REACTIONS } from "../constants/reactions";
import ReactionEmoji from "./ReactionEmoji";
import ReactionPickerButton from "./ReactionPickerButton";
import { formatFeedDate } from "../utils/postContent";
import {
  subscribeCommentReactions,
  toggleCommentReaction,
  addComment,
} from "../services/interactionService";
import UserAvatar from "./UserAvatar";
import UserName from "./UserName";

function CommentReactionSummary({ reactions }) {
  if (!reactions.length) return null;

  const counts = REACTIONS.map((r) => ({
    ...r,
    count: reactions.filter((rx) => rx.type === r.type).length,
  })).filter((r) => r.count > 0);

  return (
    <div className="comment-reaction-summary">
      <div className="reaction-icons">
        {counts.map((r) => (
          <span
            key={r.type}
            className="reaction-icon-badge reaction-icon-badge--sm"
            title={r.label}
          >
            <ReactionEmoji type={r.type} size={12} />
          </span>
        ))}
      </div>
      <span>{reactions.length}</span>
    </div>
  );
}

export default function CommentItem({
  postId,
  comment,
  user,
  profile,
  canModerate,
  onDelete,
  depth = 0,
  onGamificationUpdate,
}) {
  const [reactions, setReactions] = useState([]);
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const date = comment.createdAt?.toDate?.();
  const fallback = {
    displayName: comment.displayName,
    photoURL: comment.photoURL,
  };
  const myReaction = reactions.find((r) => r.userId === user?.uid);
  const canDelete =
    user && (comment.userId === user.uid || canModerate);

  useEffect(() => {
    const unsub = subscribeCommentReactions(postId, comment.id, setReactions);
    return unsub;
  }, [postId, comment.id]);

  async function handleReaction(type) {
    if (!user) return;
    try {
      await toggleCommentReaction(postId, comment.id, user, profile, type);
    } catch (error) {
      console.error("Erro ao reagir ao comentário:", error);
    }
  }

  async function handleReply(e) {
    e.preventDefault();
    if (!user || !replyText.trim()) return;

    setSubmitting(true);
    try {
      await addComment(postId, user, profile, replyText, comment.id);
      setReplyText("");
      setShowReplyForm(false);
      await onGamificationUpdate?.();
    } catch (error) {
      console.error("Erro ao responder:", error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`comment-thread${depth > 0 ? " comment-thread--nested" : ""}`}
    >
      <div className="comment-item">
        <UserAvatar
          userId={comment.userId}
          fallback={fallback}
          className={`comment-avatar${depth > 0 ? " small" : ""}`}
        />
        <div className="comment-body">
          <div className="comment-bubble">
            <strong>
              <UserName userId={comment.userId} fallback={fallback} />
            </strong>
            <p>{comment.text}</p>
          </div>
          <div className="comment-meta">
            {reactions.length > 0 && (
              <CommentReactionSummary reactions={reactions} />
            )}
            {date && <time>{formatFeedDate(date)}</time>}
            <ReactionPickerButton
              myReactionType={myReaction?.type}
              onReact={user ? handleReaction : null}
              compact
            />
            {user && (
              <button
                type="button"
                className="comment-action-btn"
                onClick={() => setShowReplyForm((v) => !v)}
              >
                Responder
              </button>
            )}
            {canDelete && (
              <button
                type="button"
                className="comment-delete"
                onClick={() => onDelete(comment.id)}
              >
                Apagar
              </button>
            )}
          </div>
        </div>
      </div>

      {showReplyForm && user && (
        <form
          className="comment-form comment-form--reply"
          onSubmit={handleReply}
        >
          <UserAvatar
            userId={user.uid}
            fallback={{
              displayName: profile?.displayName,
              photoURL: profile?.photoURL,
            }}
            className="comment-avatar small"
          />
          <input
            type="text"
            placeholder={`Responder ${fallback.displayName}…`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            disabled={submitting}
            autoFocus
          />
          <button type="submit" disabled={submitting || !replyText.trim()}>
            {submitting ? "…" : "Enviar"}
          </button>
        </form>
      )}

      {comment.replies?.length > 0 && (
        <div className="comment-replies">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              postId={postId}
              comment={reply}
              user={user}
              profile={profile}
              canModerate={canModerate}
              onDelete={onDelete}
              depth={depth + 1}
              onGamificationUpdate={onGamificationUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
