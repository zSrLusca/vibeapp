import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { createNewPostNotification } from "../services/notificationService";
import { getPostExcerpt } from "../utils/postContent";
import PostEditor from "../components/PostEditor";import AdminPostsList from "../components/AdminPostsList";
import UserManagement from "../components/UserManagement";

export default function Admin() {
  const { user, loading, hasPermission, logout, profile } = useAuth();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const canCreate = hasPermission("create_post");
  const canDelete = hasPermission("delete_post");
  const canManageUsers = hasPermission("manage_roles");

  const defaultTab = canCreate ? "create" : canDelete ? "posts" : "team";
  const [tab, setTab] = useState(defaultTab);

  async function handleCreatePost({ title, blocks }) {
    setSaving(true);
    setFeedback(null);

    try {
      const postRef = await addDoc(collection(db, "posts"), {
        title,
        blocks,
        authorId: user.uid,
        authorEmail: user.email,
        authorDisplayName: profile?.displayName || user.email?.split("@")[0],
        createdAt: new Date(),
      });

      await createNewPostNotification({
        postId: postRef.id,
        postTitle: title,
        excerpt: getPostExcerpt({ title, blocks }, 120),
        authorId: user.uid,
        authorDisplayName: profile?.displayName || user.email?.split("@")[0],
      });

      setFeedback({ type: "success", message: "Post publicado com sucesso!" });    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: "Erro ao criar o post. Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="muted">Verificando acesso…</p>;
  }

  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (!canCreate && !canDelete && !canManageUsers) {
    return (
      <section className="admin">
        <div className="page-header">
          <h1>Acesso negado</h1>
          <p className="subtitle">Você não tem permissão para acessar o painel admin.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin">
      <div className="page-header admin-header">
        <div>
          <h1>Painel Admin</h1>
          <p className="subtitle">Gerencie posts e equipe</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={async () => {
            await logout();
            navigate("/");
          }}
        >
          Sair
        </button>
      </div>

      <div className="admin-tabs">
        {canCreate && (
          <button
            type="button"
            className={tab === "create" ? "active" : ""}
            onClick={() => setTab("create")}
          >
            Novo post
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            className={tab === "posts" ? "active" : ""}
            onClick={() => setTab("posts")}
          >
            Gerenciar posts
          </button>
        )}
        {canManageUsers && (
          <button
            type="button"
            className={tab === "team" ? "active" : ""}
            onClick={() => setTab("team")}
          >
            Equipe
          </button>
        )}
      </div>

      {tab === "create" && canCreate && (
        <>
          <PostEditor onSubmit={handleCreatePost} saving={saving} />
          {feedback && (
            <p className={`form-feedback ${feedback.type}`}>{feedback.message}</p>
          )}
        </>
      )}

      {tab === "posts" && canDelete && <AdminPostsList />}
      {tab === "team" && canManageUsers && <UserManagement />}
    </section>
  );
}
