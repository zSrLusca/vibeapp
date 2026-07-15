import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function VerifyEmail() {
  const { resendVerification } = useAuth();
  const location = useLocation();
  const emailFromState = location.state?.email ?? "";

  const [email, setEmail] = useState(emailFromState);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  async function handleResend(e) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    try {
      await resendVerification(email, password);
      setFeedback({
        type: "success",
        message: "E-mail reenviado! Aguarde até 5 minutos e verifique o spam.",
      });
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="page-header">
        <h1>Confirme seu e-mail</h1>
        <p className="subtitle">
          {emailFromState
            ? `Enviamos um link para ${emailFromState}`
            : "Enviamos um link de confirmação para o seu e-mail"}
        </p>
      </div>

      <div className="verify-tips">
        <h3>Não chegou? Verifique:</h3>
        <ul>
          <li>Pasta de <strong>spam / lixo eletrônico</strong></li>
          <li>Remetente: <strong>noreply@appviberp.firebaseapp.com</strong></li>
          <li>Aguarde até <strong>5 minutos</strong> — pode demorar</li>
          <li>Gmail: aba <strong>Promoções</strong> ou <strong>Social</strong></li>
          <li>Confira se digitou o e-mail corretamente no cadastro</li>
        </ul>
      </div>

      <div className="verify-info">
        <p className="muted">
          Use o formulário abaixo para reenviar (máximo 1 vez a cada poucos minutos).
        </p>
      </div>

      <form onSubmit={handleResend} className="post-form auth-form">
        <div className="form-group">
          <label htmlFor="email">E-mail</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
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
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Enviando…" : "Reenviar confirmação"}
        </button>

        {feedback && (
          <p className={`form-feedback ${feedback.type}`}>{feedback.message}</p>
        )}
      </form>

      <p className="auth-switch">
        Prefere não esperar?{" "}
        <Link to="/login">Entrar com Google</Link> (não precisa confirmar e-mail)
      </p>

      <p className="auth-switch">
        Já confirmou? <Link to="/login">Fazer login</Link>
      </p>
    </section>
  );
}
