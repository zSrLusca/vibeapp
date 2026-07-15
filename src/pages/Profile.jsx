import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { updateProfile as updateAuthProfile } from "firebase/auth";
import { auth } from "../services/firebase";
import { useAuth } from "../contexts/AuthContext";
import { ROLES } from "../constants/roles";
import GamificationCard from "../components/GamificationCard";

export default function Profile() {
  const { user, profile, loading, updateProfile } = useAuth();
  const [displayName, setDisplayName] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (profile && !editing) {
      setDisplayName(profile.displayName || "");
      setPhotoURL(profile.photoURL || "");
    }
  }, [profile, editing]);

  useEffect(() => {
    if (!feedback) return;

    const timer = window.setTimeout(() => setFeedback(null), 6000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  function startEditing(e) {
    e?.preventDefault?.();
    setDisplayName(profile?.displayName || "");
    setPhotoURL(profile?.photoURL || "");
    setFeedback(null);
    window.setTimeout(() => setEditing(true), 0);
  }

  function cancelEditing() {
    setDisplayName(profile?.displayName || "");
    setPhotoURL(profile?.photoURL || "");
    setFeedback(null);
    setEditing(false);
  }

  async function handleSave() {
    if (!editing || saving) return;

    setFeedback(null);

    const name = displayName.trim();
    if (name.length < 2) {
      setFeedback({ type: "error", message: "O nome deve ter pelo menos 2 caracteres." });
      return;
    }

    if (name.length > 30) {
      setFeedback({ type: "error", message: "O nome pode ter no máximo 30 caracteres." });
      return;
    }

    setSaving(true);

    try {
      const photo = photoURL.trim();

      await updateProfile({
        displayName: name,
        photoURL: photo,
      });

      if (auth.currentUser) {
        await updateAuthProfile(auth.currentUser, {
          displayName: name,
          photoURL: photo || null,
        });
      }

      setFeedback({ type: "success", message: "Perfil atualizado com sucesso!" });
      setEditing(false);
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: "Erro ao salvar o perfil. Tente novamente." });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="muted">Carregando perfil…</p>;
  }

  if (!user) {
    return <Navigate to="/login?redirect=/perfil" replace />;
  }

  const savedName = profile?.displayName?.trim() || "Usuário";
  const savedPhoto = profile?.photoURL || "";
  const roleLabel = ROLES[profile?.role]?.label;

  return (
    <section className="profile-page">
      <div className="page-header">
        <h1>Meu perfil</h1>
        <p className="subtitle">Como você aparece na comunidade</p>
      </div>

      <div className="profile-identity-card">
        <div className="profile-preview">
          <div className="profile-preview-avatar">
            {savedPhoto ? (
              <img
                src={savedPhoto}
                alt=""
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              savedName[0]?.toUpperCase()
            )}
          </div>
          <div>
            <strong>{savedName}</strong>
            <span className="muted">{user.email}</span>
            {roleLabel && profile?.role !== "user" && (
              <span className="profile-role-badge">{roleLabel}</span>
            )}
          </div>
        </div>

        <div className="post-form profile-form">
          <div className="form-group">
            <label htmlFor="displayName">Nome na comunidade</label>
            {editing ? (
              <>
                <input
                  id="displayName"
                  type="text"
                  placeholder="Como quer ser chamado…"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={30}
                  autoFocus
                />
                <p className="field-hint">Aparece em posts, comentários e reações.</p>
              </>
            ) : (
              <p className="profile-field-value">{savedName}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="photoURL">Foto de perfil (link público)</label>
            {editing ? (
              <>
                <input
                  id="photoURL"
                  type="url"
                  placeholder="https://exemplo.com/sua-foto.jpg"
                  value={photoURL}
                  onChange={(e) => setPhotoURL(e.target.value)}
                />
                <p className="field-hint">
                  Cole um link público (Imgur, ImgBB, Discord…). Deixe vazio para usar iniciais.
                </p>
              </>
            ) : (
              <p className="profile-field-value">
                {savedPhoto || "Usando iniciais do nome"}
              </p>
            )}
          </div>

          <div className="profile-form-actions">
            {editing ? (
              <>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={cancelEditing}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="profile-save-btn"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? "Salvando…" : "Salvar perfil"}
                </button>
              </>
            ) : (
              <button type="button" className="btn-secondary" onClick={startEditing}>
                Editar perfil
              </button>
            )}
          </div>

          {feedback && (
            <p className={`form-feedback ${feedback.type}`}>{feedback.message}</p>
          )}
        </div>
      </div>

      <GamificationCard profile={profile} />
    </section>
  );
}
