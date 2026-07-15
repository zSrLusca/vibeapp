import { useUserDisplay } from "../hooks/useUserDisplay";

export default function UserAvatar({ userId, fallback = {}, className = "" }) {
  const { displayName, photoURL } = useUserDisplay(userId, fallback);

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt={displayName}
        className={className}
        loading="lazy"
      />
    );
  }

  return (
    <span className={`${className} placeholder`.trim()} aria-hidden="true">
      {displayName[0]?.toUpperCase() || "?"}
    </span>
  );
}
