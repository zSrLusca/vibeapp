import { getReactionCode } from "../constants/reactions";

const TWEMOJI_BASE =
  "https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72";

export default function ReactionEmoji({ type, code, size = 20, className = "" }) {
  const point = code ?? getReactionCode(type);
  return (
    <img
      src={`${TWEMOJI_BASE}/${point}.png`}
      alt=""
      width={size}
      height={size}
      className={`reaction-emoji ${className}`.trim()}
      draggable={false}
      loading="lazy"
    />
  );
}
