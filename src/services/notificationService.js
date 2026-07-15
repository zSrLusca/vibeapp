import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import { NOTIFICATION_TYPES, PUSH_PROVIDERS } from "../constants/notifications";

export function subscribeNotifications(callback, max = 50) {
  const q = query(
    collection(db, "notifications"),
    orderBy("createdAt", "desc"),
    limit(max)
  );

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function getUnreadCount(notifications, readAt) {
  if (!notifications.length) return 0;
  if (!readAt) return notifications.length;

  const readTime = readAt?.toDate?.() ?? new Date(readAt);
  return notifications.filter((notification) => {
    const created = notification.createdAt?.toDate?.();
    return created && created > readTime;
  }).length;
}

export async function markNotificationsAsRead(userId) {
  await updateDoc(doc(db, "users", userId), {
    notificationsReadAt: serverTimestamp(),
  });
}

export async function createNewPostNotification({
  postId,
  postTitle,
  excerpt,
  authorId,
  authorDisplayName,
}) {
  const pushTitle = "Vibe RP — Nova publicação";
  const pushBody = postTitle?.trim() || "Confira a nova publicação na comunidade.";

  await addDoc(collection(db, "notifications"), {
    type: NOTIFICATION_TYPES.NEW_POST,
    postId,
    postTitle: pushBody,
    excerpt: excerpt || pushBody,
    authorId,
    authorDisplayName,
    audience: "all",
    createdAt: serverTimestamp(),
    push: {
      provider: PUSH_PROVIDERS.EXPO,
      status: "pending",
      payload: {
        title: pushTitle,
        body: pushBody,
        data: {
          type: NOTIFICATION_TYPES.NEW_POST,
          postId,
          url: `/post/${postId}`,
        },
      },
    },
  });
}
