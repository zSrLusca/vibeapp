import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { REACTIONS } from "../constants/reactions";
import ReactionEmoji from "./ReactionEmoji";
import ReactionPickerButton from "./ReactionPickerButton";
import CommentItem from "./CommentItem";
import { buildCommentTree } from "../utils/commentTree";
import {
  subscribeReactions,
  subscribeComments,
  toggleReaction,
  addComment,
  deleteComment,
} from "../services/interactionService";
import UserAvatar from "./UserAvatar";

function ReactionSummary({ reactions }) {
  if (!reactions.length) return null;

  const counts = REACTIONS.map((r) => ({
    ...r,
    count: reactions.filter((rx) => rx.type === r.type).length,
  })).filter((r) => r.count > 0);

  return (
    <div className="interaction-stats">
      <div className="reaction-icons">
        {counts.map((r) => (
          <span key={r.type} className="reaction-icon-badge" title={r.label}>
            <ReactionEmoji type={r.type} size={16} />
          </span>
        ))}
      </div>
      <span className="interaction-count">
        {reactions.length} {reactions.length === 1 ? "reação" : "reações"}
      </span>
    </div>
  );
}

export default function PostInteractions({ postId, commentLimit = null }) {
  const { user, profile, hasPermission, reloadProfile } = useAuth();
  const [reactions, setReactions] = useState([]);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const myReaction = reactions.find((r) => r.userId === user?.uid);
  const canModerate = hasPermission("delete_post");
  const commentTree = buildCommentTree(comments);
  const visibleComments = commentLimit
    ? commentTree.slice(-commentLimit)
    : commentTree;

  useEffect(() => {
    const unsubReactions = subscribeReactions(postId, setReactions);
    const unsubComments = subscribeComments(postId, setComments);
    return () => {
      unsubReactions();
      unsubComments();
    };
  }, [postId]);

  async function handleReaction(type) {
    if (!user) return;
    try {
      await toggleReaction(postId, user, profile, type);
      await reloadProfile();
    } catch (error) {
      console.error("Erro ao reagir:", error);
    }
  }

  async function handleComment(e) {
    e.preventDefault();
    if (!user || !commentText.trim()) return;

    setSubmitting(true);
    try {
      await addComment(postId, user, profile, commentText);
      setCommentText("");
      setShowComments(true);
      await reloadProfile();
    } catch (error) {
      console.error("Erro ao comentar:", error);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteComment(commentId) {
    if (!confirm("Apagar este comentário?")) return;
    try {
      await deleteComment(postId, commentId);
    } catch (error) {
      console.error("Erro ao apagar comentário:", error);
    }
  }

  return (
    <div className="post-interactions">
      {(reactions.length > 0 || comments.length > 0) && (
        <div className="interaction-summary-row">
          <ReactionSummary reactions={reactions} />
          {comments.length > 0 && (
            <button
              type="button"
              className="comments-count-btn"
              onClick={() => setShowComments((v) => !v)}
            >
              {comments.length}{" "}
              {comments.length === 1 ? "comentário" : "comentários"}
            </button>
          )}
        </div>
      )}

      <div className="interaction-actions">
        {user ? (
          <ReactionPickerButton
            myReactionType={myReaction?.type}
            onReact={handleReaction}
          />
        ) : (
          <Link to="/login" className="interaction-btn">
            <ReactionEmoji type="like" size={18} className="interaction-btn-emoji" />{" "}
            Curtir
          </Link>
        )}

        <button
          type="button"
          className="interaction-btn"
          onClick={() => setShowComments((v) => !v)}
        >
          💬 <span className="interaction-btn-label">Comentar</span>
        </button>
      </div>

      {(showComments || comments.length > 0) && (
        <div className="comments-section">
          {visibleComments.map((comment) => (
            <CommentItem
              key={comment.id}
              postId={postId}
              comment={comment}
              user={user}
              profile={profile}
              canModerate={canModerate}
              onDelete={handleDeleteComment}
              onGamificationUpdate={reloadProfile}
            />
          ))}

          {commentLimit && commentTree.length > commentLimit && (
            <Link className="feed-see-more" to={`/post/${postId}`}>
              Ver todos os {comments.length} comentários
            </Link>
          )}

          {user ? (
            <form className="comment-form" onSubmit={handleComment}>
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
                placeholder="Escreva um comentário…"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={submitting}
              />
              <button type="submit" disabled={submitting || !commentText.trim()}>
                {submitting ? "…" : "Enviar"}
              </button>
            </form>
          ) : (
            <p className="comment-login-hint">
              <Link to="/login">Faça login</Link> para comentar.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
