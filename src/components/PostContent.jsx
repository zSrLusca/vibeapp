export default function PostContent({ post }) {
  if (post.blocks?.length) {
    return (
      <div className="post-content">
        {post.blocks.map((block, index) => {
          if (block.type === "text") {
            return (
              <p key={index} className="post-block post-block-text">
                {block.content}
              </p>
            );
          }

          if (block.type === "image" && block.url) {
            return (
              <figure key={index} className="post-block post-block-image">
                <img src={block.url} alt={block.alt || "Imagem do post"} loading="lazy" />
              </figure>
            );
          }

          if (block.type === "video" && block.embedUrl) {
            return (
              <div key={index} className="post-block post-block-video">
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

  if (post.content) {
    return <div className="post-content">{post.content}</div>;
  }

  return null;
}
