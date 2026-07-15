import { useUserDisplay } from "../hooks/useUserDisplay";

export default function UserName({ userId, fallback = {}, className = "" }) {
  const { displayName } = useUserDisplay(userId, fallback);
  return <span className={className}>{displayName}</span>;
}
