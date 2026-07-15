import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  awardPostComment,
  awardPostReaction,
} from "./gamificationService";

function userPayload(user, profile) {
  return {
    userId: user.uid,
    displayName:
      profile?.displayName || user.email?.split("@")[0] || "Usuário",
    photoURL: profile?.photoURL || user.photoURL || null,
  };
}

export function subscribeReactions(postId, callback) {
  const ref = collection(db, "posts", postId, "reactions");
  return onSnapshot(ref, (snapshot) => {
    const reactions = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(reactions);
  });
}

export function subscribeComments(postId, callback) {
  const q = query(
    collection(db, "posts", postId, "comments"),
    orderBy("createdAt", "asc")
  );
  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(comments);
  });
}

export function subscribeCommentReactions(postId, commentId, callback) {
  const ref = collection(
    db,
    "posts",
    postId,
    "comments",
    commentId,
    "reactions"
  );
  return onSnapshot(ref, (snapshot) => {
    callback(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function toggleReaction(postId, user, profile, type) {
  const ref = doc(db, "posts", postId, "reactions", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists() && snap.data().type === type) {
    await deleteDoc(ref);
    return null;
  }

  await setDoc(ref, {
    type,
    ...userPayload(user, profile),
    createdAt: serverTimestamp(),
  });

  await awardPostReaction(user.uid, postId);

  return type;
}

export async function toggleCommentReaction(
  postId,
  commentId,
  user,
  profile,
  type
) {
  const ref = doc(
    db,
    "posts",
    postId,
    "comments",
    commentId,
    "reactions",
    user.uid
  );
  const snap = await getDoc(ref);

  if (snap.exists() && snap.data().type === type) {
    await deleteDoc(ref);
    return null;
  }

  await setDoc(ref, {
    type,
    ...userPayload(user, profile),
    createdAt: serverTimestamp(),
  });

  return type;
}

export async function addComment(postId, user, profile, text, parentId = null) {
  const trimmed = text.trim();
  if (!trimmed) return;

  const data = {
    text: trimmed,
    ...userPayload(user, profile),
    createdAt: serverTimestamp(),
  };

  if (parentId) {
    data.parentId = parentId;
  }

  const commentRef = await addDoc(collection(db, "posts", postId, "comments"), data);
  await awardPostComment(user.uid, postId, commentRef.id);
}

async function deleteCommentReactions(postId, commentId) {
  const reactionsRef = collection(
    db,
    "posts",
    postId,
    "comments",
    commentId,
    "reactions"
  );
  const snapshot = await getDocs(reactionsRef);
  await Promise.all(snapshot.docs.map((d) => deleteDoc(d.ref)));
}

export async function deleteComment(postId, commentId) {
  const commentsRef = collection(db, "posts", postId, "comments");
  const replies = await getDocs(
    query(commentsRef, where("parentId", "==", commentId))
  );

  await Promise.all(
    replies.docs.map((reply) => deleteComment(postId, reply.id))
  );
  await deleteCommentReactions(postId, commentId);
  await deleteDoc(doc(db, "posts", postId, "comments", commentId));
}
