import {
  POINT_VALUES,
  getGamificationStatus,
} from "../constants/gamification";

export default function GamificationCard({ profile }) {
  const points = profile?.points ?? 0;
  const stats = profile?.stats ?? {};
  const status = getGamificationStatus(points);

  return (
    <section className="gamification-card">
      <div className="gamification-header">
        <span className="gamification-icon" aria-hidden>
          {status.icon}
        </span>
        <div>
          <p className="gamification-label">Seu status na comunidade</p>
          <h2 className="gamification-title">
            Nível {status.level} — {status.title}
          </h2>
        </div>
        <div className="gamification-points">
          <strong>{status.points}</strong>
          <span>pts</span>
        </div>
      </div>

      <div className="gamification-progress">
        <div className="gamification-progress-bar">
          <div
            className="gamification-progress-fill"
            style={{ width: `${status.progress}%` }}
          />
        </div>
        <p className="gamification-progress-text">
          {status.isMaxLevel
            ? "Você alcançou o nível máximo. Lenda da Vibe!"
            : `Faltam ${status.pointsToNext} pts para ${status.nextTitle}`}
        </p>
      </div>

      <div className="gamification-stats">
        <div className="gamification-stat">
          <strong>{stats.reactions ?? 0}</strong>
          <span>Posts com reação</span>
          <small>+{POINT_VALUES.POST_REACTION} pts por post</small>
        </div>
        <div className="gamification-stat">
          <strong>{stats.comments ?? 0}</strong>
          <span>Posts comentados</span>
          <small>+{POINT_VALUES.POST_COMMENT} pts por post</small>
        </div>
      </div>
    </section>
  );
}
