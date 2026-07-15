import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Showcase() {
  const { user, loading } = useAuth();

  return (
    <div className="showcase">
      <section className="showcase-hero">
        <img
          src="/logo-vibe-paulista.png"
          alt="Vibe Paulista"
          className="showcase-logo"
        />
        <h1>Vibe RP</h1>

        {!loading && !user && (
          <>
            <div className="showcase-cta">
              <Link to="/register" className="btn-primary">
                Criar conta
              </Link>
              <Link to="/login" className="btn-secondary">
                Fazer login
              </Link>
            </div>
            <Link to="/comunidade" className="showcase-link">
              Explorar comunidade sem conta →
            </Link>
          </>
        )}

        {!loading && user && (
          <div className="showcase-cta">
            <Link to="/comunidade" className="btn-primary">
              Explorar comunidade
            </Link>
          </div>
        )}
      </section>

      <section className="showcase-about">
        <h2>Sobre a Vibe</h2>
        <p>
          A Vibe City é uma cidade com 8 anos de história online, sendo um dos
          servidores mais tradicionais e respeitados da cena brasileira de Full
          Roleplay. Desde o início, nosso foco sempre foi proporcionar uma
          experiência imersiva, séria e ao mesmo tempo acolhedora para todos os
          players. Priorizamos o respeito, o carinho e a amizade dentro da
          comunidade, criando um ambiente onde todos se sintam parte de algo maior.
        </p>
        <p>
          Nosso compromisso é com a qualidade do roleplay e com a evolução
          constante da cidade — sempre ouvindo a comunidade, inovando em sistemas
          e mantendo a essência que nos trouxe até aqui. Se você busca um servidor
          maduro, bem estruturado e com uma equipe dedicada, a Vibe City é o seu
          lugar.
        </p>
      </section>

      <section className="showcase-features">
        <div className="showcase-feature">
          <span className="showcase-feature-icon">📰</span>
          <h3>Publicações</h3>
          <p>Crie publicações, posts com imagens e vídeos.</p>
        </div>
        <div className="showcase-feature">
          <span className="showcase-feature-icon">👥</span>
          <h3>Comunidade</h3>
          <p>Crie sua conta e faça parte da comunidade VIBE.</p>
        </div>
        <div className="showcase-feature">
          <span className="showcase-feature-icon">🎮</span>
          <h3>Gamificação</h3>
          <p>Sistema de gamificação e pontuação para membros.</p>
        </div>
      </section>

      <section className="showcase-final-cta">
        <h2>Pronto para entrar na vibe?</h2>
        {!loading && !user ? (
          <div className="showcase-cta">
            <Link to="/register" className="btn-primary">
              Criar conta grátis
            </Link>
            <Link to="/login" className="btn-secondary">
              Já tenho conta
            </Link>
          </div>
        ) : (
          !loading && (
            <Link to="/comunidade" className="btn-primary">
              Ir para a comunidade
            </Link>
          )
        )}
      </section>
    </div>
  );
}
