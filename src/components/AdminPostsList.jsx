import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { collection, deleteDoc, doc, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import { getPostExcerpt } from "../utils/postContent";

export default function AdminPostsList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);

  async function carregarPosts() {
    try {
      const q = query(collection(db, "posts"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      setPosts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Erro ao listar posts:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPosts();
  }, []);

  async function handleDelete(postId) {
    if (!confirm("Tem certeza que deseja apagar este post?")) return;

    setDeletingId(postId);
    try {
      await deleteDoc(doc(db, "posts", postId));
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (error) {
      console.error("Erro ao apagar post:", error);
      alert("Erro ao apagar o post.");
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) return <p className="muted">Carregando posts…</p>;

  if (!posts.length) {
    return <p className="muted">Nenhum post publicado ainda.</p>;
  }

  return (
    <div className="admin-posts-list">
      {posts.map((post) => {
        const data = post.createdAt?.toDate?.();
        return (
          <article key={post.id} className="admin-post-item">
            <div className="admin-post-info">
              <h3>{post.title}</h3>
              <p className="muted">{getPostExcerpt(post, 100)}</p>
              {data && (
                <time className="post-date">
                  {data.toLocaleDateString("pt-BR")}
                </time>
              )}
            </div>
            <div className="admin-post-actions">
              <Link className="post-link" to={`/post/${post.id}`}>
                Ver
              </Link>
              <button
                type="button"
                className="btn-danger"
                onClick={() => handleDelete(post.id)}
                disabled={deletingId === post.id}
              >
                {deletingId === post.id ? "Apagando…" : "Apagar"}
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}
