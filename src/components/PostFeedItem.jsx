import { Link } from "react-router-dom";
import { getPostFullText, formatFeedDate, getAuthorDisplayName } from "../utils/postContent";
import PostInteractions from "./PostInteractions";
import UserAvatar from "./UserAvatar";
import UserName from "./UserName";

const TEXT_LIMIT = 320;

function FeedMedia({ blocks }) {
  if (!blocks?.length) return null;

  const mediaBlocks = blocks.filter(
    (block) =>
      (block.type === "image" && block.url) ||
      (block.type === "video" && block.embedUrl)
  );

  if (!mediaBlocks.length) return null;

  return (
    <div className="feed-item-media">
      {mediaBlocks.map((block, index) => {
        if (block.type === "image") {
          return (
            <img
              key={index}
              src={block.url}
              alt={block.alt || "Imagem da publicação"}
              loading="lazy"
            />
          );
        }

        if (block.type === "video") {
          return (
            <div key={index} className="feed-item-video">
              <iframe
                src={block.embedUrl}
                title={`Vídeo ${index + 1}`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function PostFeedItem({ post }) {
  const data = post.createdAt?.toDate?.();
  const fullText = getPostFullText(post);
  const isLong = fullText.length > TEXT_LIMIT;
  const previewText = isLong ? `${fullText.slice(0, TEXT_LIMIT)}…` : fullText;

  const authorFallback = {
    displayName: getAuthorDisplayName(post),
    email: post.authorEmail,
  };

  return (
    <article className="feed-item">
      <header className="feed-item-header">
        <UserAvatar
          userId={post.authorId}
          fallback={authorFallback}
          className="feed-avatar"
        />
        <div className="feed-item-meta">
          <strong className="feed-author">
            <UserName userId={post.authorId} fallback={authorFallback} />
          </strong>
          {data && (
            <time className="feed-time" dateTime={data.toISOString()} title={data.toLocaleString("pt-BR")}>
              {formatFeedDate(data)}
            </time>
          )}
        </div>
      </header>

      <div className="feed-item-body">
        {post.title && <h2 className="feed-item-title">{post.title}</h2>}

        {previewText && <p className="feed-item-text">{previewText}</p>}
      </div>

      <FeedMedia blocks={post.blocks} />

      <PostInteractions postId={post.id} commentLimit={3} />

      {isLong && (
        <footer className="feed-item-footer">
          <Link className="feed-action" to={`/post/${post.id}`}>
            Ver publicação completa
          </Link>
        </footer>
      )}
    </article>
  );
}
