import {
  doc,
  getDoc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { db } from "./firebase";
import { POINT_VALUES } from "../constants/gamification";

async function grantAward(userId, awardId, payload) {
  const awardRef = doc(db, "users", userId, "pointAwards", awardId);
  const existing = await getDoc(awardRef);

  if (existing.exists()) {
    return { awarded: false, points: 0 };
  }

  const userRef = doc(db, "users", userId);
  const batch = writeBatch(db);

  batch.set(awardRef, {
    ...payload,
    createdAt: serverTimestamp(),
  });

  batch.update(userRef, {
    points: increment(payload.points),
    [`stats.${payload.statKey}`]: increment(1),
    gamificationUpdatedAt: serverTimestamp(),
  });

  await batch.commit();
  return { awarded: true, points: payload.points };
}

export async function awardPostReaction(userId, postId) {
  if (!userId || !postId) return { awarded: false, points: 0 };

  return grantAward(userId, `post_reaction_${postId}`, {
    action: "post_reaction",
    referenceId: postId,
    points: POINT_VALUES.POST_REACTION,
    statKey: "reactions",
  });
}

export async function awardPostComment(userId, postId, commentId) {
  if (!userId || !postId) return { awarded: false, points: 0 };

  return grantAward(userId, `post_comment_${postId}`, {
    action: "post_comment",
    referenceId: postId,
    commentId: commentId ?? null,
    points: POINT_VALUES.POST_COMMENT,
    statKey: "comments",
  });
}

export async function ensureGamificationDefaults(userId) {
  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);

  if (!snap.exists() || snap.data().points !== undefined) return;

  await updateDoc(userRef, {
    points: 0,
    stats: { reactions: 0, comments: 0 },
  });
}
