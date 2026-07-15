const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const logger = require("firebase-functions/logger");

initializeApp();

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

async function fetchExpoPushTokens(db) {
  const snapshot = await db.collectionGroup("pushTokens").get();
  const tokens = new Set();

  snapshot.forEach((docSnap) => {
    const token = docSnap.data()?.token;
    if (token) tokens.add(token);
  });

  return [...tokens];
}

async function sendExpoPushBatch(messages) {
  if (!messages.length) return { ok: true, skipped: true };

  const response = await fetch(EXPO_PUSH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(messages),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Expo push failed: ${response.status} ${body}`);
  }

  return response.json();
}

exports.deliverExpoPushOnNotification = onDocumentCreated(
  "notifications/{notificationId}",
  async (event) => {
    const data = event.data?.data();
    if (!data?.push || data.push.status !== "pending") return;

    const db = getFirestore();
    const tokens = await fetchExpoPushTokens(db);

    if (!tokens.length) {
      logger.info("Nenhum token Expo registrado.");
      await event.data.ref.update({
        "push.status": "skipped",
        "push.reason": "no_tokens",
      });
      return;
    }

    const payload = data.push.payload ?? {};
    const messages = tokens.map((token) => ({
      to: token,
      sound: "default",
      title: payload.title || "Vibe RP",
      body: payload.body || data.postTitle || "Nova publicação",
      data: payload.data || {
        type: data.type,
        postId: data.postId,
        url: data.postId ? `/post/${data.postId}` : "/comunidade",
      },
    }));

    const chunks = [];
    for (let i = 0; i < messages.length; i += 100) {
      chunks.push(messages.slice(i, i + 100));
    }

    for (const chunk of chunks) {
      await sendExpoPushBatch(chunk);
    }

    await event.data.ref.update({
      "push.status": "sent",
      "push.sentAt": new Date(),
      "push.recipientCount": tokens.length,
    });

    logger.info(`Push Expo enviado para ${tokens.length} dispositivos.`);
  }
);
