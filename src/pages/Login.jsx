import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get("redirect") || "/comunidade";
  const justVerified = searchParams.get("verified") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await login(email, password);
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setLoading(true);
    setError("");

    try {
      await loginWithGoogle();
      navigate(redirect);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="page-header">
        <h1>Entrar</h1>
        <p className="subtitle">Acesse sua conta Vibe RP</p>
      </div>

      {justVerified && (
        <p className="form-feedback success">
          E-mail confirmado com sucesso! Agora você pode entrar.
        </p>
      )}

      <form onSubmit={handleSubmit} className="post-form auth-form">
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Senha</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Entrando…" : "Entrar"}
        </button>

        {error && <p className="form-feedback error">{error}</p>}
      </form>

      <div className="auth-divider">
        <span>ou</span>
      </div>

      <button
        type="button"
        className="btn-google"
        onClick={handleGoogle}
        disabled={loading}
      >
        Continuar com Google
      </button>

      <p className="auth-switch">
        Não tem conta? <Link to="/register">Cadastre-se</Link>
      </p>
      <p className="auth-switch">
        Não confirmou o e-mail? <Link to="/verify-email">Reenviar confirmação</Link>
      </p>
    </section>
  );
}
