import { useEffect, useState } from "react";
import { listUsers, updateUserRole } from "../services/userService";
import { ROLES, PERMISSIONS, ROLE_PERMISSIONS } from "../constants/roles";
import { useAuth } from "../contexts/AuthContext";

export default function UserManagement() {
  const { user, profile } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  async function carregarUsuarios() {
    try {
      const lista = await listUsers();
      setUsers(lista);
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarUsuarios();
  }, []);

  async function handleRoleChange(uid, newRole) {
    if (uid === user.uid && newRole !== "superadmin") {
      alert("Você não pode remover seu próprio papel de Super Admin.");
      return;
    }

    setUpdatingId(uid);
    setFeedback(null);

    try {
      await updateUserRole(uid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.uid === uid ? { ...u, role: newRole } : u))
      );
      setFeedback({ type: "success", message: "Papel atualizado com sucesso!" });
    } catch (error) {
      console.error(error);
      setFeedback({ type: "error", message: "Erro ao atualizar o papel." });
    } finally {
      setUpdatingId(null);
    }
  }

  if (loading) return <p className="muted">Carregando usuários…</p>;

  return (
    <div className="user-management">
      <div className="roles-legend">
        <h3>Papéis e permissões</h3>
        <ul>
          {Object.entries(ROLES).map(([key, role]) => (
            <li key={key}>
              <strong>{role.label}</strong> — {role.description}
              {ROLE_PERMISSIONS[key]?.length > 0 && (
                <span className="role-perms">
                  {" "}
                  ({ROLE_PERMISSIONS[key].map((p) => PERMISSIONS[p]).join(", ")})
                </span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="users-table">
        {users.map((u) => (
          <div key={u.uid} className="user-row">
            <div className="user-info">
              {u.photoURL ? (
                <img src={u.photoURL} alt="" className="user-avatar" />
              ) : (
                <div className="user-avatar placeholder">
                  {u.displayName?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div>
                <strong>{u.displayName}</strong>
                <span className="muted">{u.email}</span>
              </div>
            </div>

            <select
              value={u.role || "user"}
              onChange={(e) => handleRoleChange(u.uid, e.target.value)}
              disabled={updatingId === u.uid || (u.uid === user.uid && profile?.role === "superadmin")}
              className="role-select"
            >
              {Object.entries(ROLES).map(([key, role]) => (
                <option key={key} value={key}>
                  {role.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {feedback && (
        <p className={`form-feedback ${feedback.type}`}>{feedback.message}</p>
      )}
    </div>
  );
}
