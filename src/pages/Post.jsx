import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { getAuthorDisplayName } from "../utils/postContent";
import PostContent from "../components/PostContent";
import PostInteractions from "../components/PostInteractions";
import UserAvatar from "../components/UserAvatar";
import UserName from "../components/UserName";

export default function Post() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function carregarPost() {
      try {
        const ref = doc(db, "posts", id);
        const snapshot = await getDoc(ref);

        if (snapshot.exists()) {
          setPost({ id: snapshot.id, ...snapshot.data() });
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error("Erro ao buscar post:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    }

    carregarPost();
  }, [id]);

  async function handleDelete() {
    if (!confirm("Tem certeza que deseja apagar este post?")) return;

    setDeleting(true);
    try {
      await deleteDoc(doc(db, "posts", id));
      navigate("/comunidade");
    } catch (error) {
      console.error("Erro ao apagar post:", error);
      alert("Erro ao apagar o post.");
      setDeleting(false);
    }
  }

  if (loading) {
    return <p className="muted">Carregando post…</p>;
  }

  if (!post) {
    return (
      <div className="post-not-found">
        <h1>Post não encontrado</h1>
        <p className="muted">O post que você procura não existe ou foi removido.</p>
        <Link className="post-link" to="/comunidade">
          ← Voltar para a comunidade
        </Link>
      </div>
    );
  }

  const data = post.createdAt?.toDate?.();
  const canDelete = hasPermission("delete_post");
  const authorFallback = {
    displayName: getAuthorDisplayName(post),
    email: post.authorEmail,
  };

  return (
    <article className="post-full">
      <div className="post-full-header">
        <Link className="post-link back-link" to="/comunidade">
          ← Voltar
        </Link>
        {canDelete && (
          <button
            type="button"
            className="btn-danger"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Apagando…" : "Apagar post"}
          </button>
        )}
      </div>

      <header className="post-full-author">
        <UserAvatar
          userId={post.authorId}
          fallback={authorFallback}
          className="feed-avatar"
        />
        <div>
          <strong>
            <UserName userId={post.authorId} fallback={authorFallback} />
          </strong>
          {data && (
            <time className="post-date" dateTime={data.toISOString()}>
              {data.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </time>
          )}
        </div>
      </header>

      <h1 className="post-full-title">{post.title}</h1>

      <PostContent post={post} />

      <PostInteractions postId={post.id} />
    </article>
  );
}
