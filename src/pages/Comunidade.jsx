import { useEffect, useState } from "react";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { db } from "../services/firebase";
import PostFeedItem from "../components/PostFeedItem";

export default function Comunidade() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  async function carregarPosts() {
    try {
      const postsRef = collection(db, "posts");
      const q = query(postsRef, orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);

      const lista = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setPosts(lista);
    } catch (error) {
      console.error("Erro ao buscar posts:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarPosts();
  }, []);

  return (
    <section className="comunidade-page">
      <div className="page-header">
        <h1>Comunidade</h1>
        <p className="subtitle">Feed de publicações da Vibe Paulista</p>
      </div>

      {loading ? (
        <p className="muted feed-status">Carregando publicações…</p>
      ) : posts.length === 0 ? (
        <p className="muted feed-status">Nenhuma publicação ainda.</p>
      ) : (
        <div className="posts-feed">
          {posts.map((post) => (
            <PostFeedItem key={post.id} post={post} />
          ))}
        </div>
      )}
    </section>
  );
}
