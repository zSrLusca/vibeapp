export function getPostExcerpt(post, maxLength = 160) {
  if (post.blocks?.length) {
    const text = post.blocks
      .filter((block) => block.type === "text" && block.content)
      .map((block) => block.content)
      .join(" ");

    if (text) {
      return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
    }
  }

  if (post.content) {
    return post.content.length > maxLength
      ? `${post.content.slice(0, maxLength)}…`
      : post.content;
  }

  return "Publicação com mídia";
}

export function getPostFullText(post) {
  if (post.blocks?.length) {
    return post.blocks
      .filter((block) => block.type === "text" && block.content)
      .map((block) => block.content)
      .join("\n\n");
  }

  return post.content || "";
}

export function getPostCoverImage(post) {
  if (!post.blocks?.length) return null;
  const imageBlock = post.blocks.find((block) => block.type === "image");
  return imageBlock?.url ?? null;
}

export function getAuthorDisplayName(post) {
  if (post.authorDisplayName) return post.authorDisplayName;
  if (post.authorEmail) {
    return post.authorEmail.split("@")[0];
  }
  return "Membro Vibe RP";
}

export function formatFeedDate(date) {
  if (!date) return "";

  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Agora";
  if (diffMin < 60) return `${diffMin} min`;
  if (diffHours < 24) return `${diffHours} h`;
  if (diffDays < 7) return `${diffDays} d`;

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}
