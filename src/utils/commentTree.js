export function buildCommentTree(comments) {
  const map = new Map();
  const roots = [];

  for (const comment of comments) {
    map.set(comment.id, { ...comment, replies: [] });
  }

  for (const comment of comments) {
    const node = map.get(comment.id);
    if (comment.parentId && map.has(comment.parentId)) {
      map.get(comment.parentId).replies.push(node);
    } else if (!comment.parentId) {
      roots.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
