import { useState } from "react";
import { getVideoEmbedUrl } from "../utils/videoEmbed";

const EMOJIS = ["😀", "🔥", "🚀", "💙", "✨", "👏", "🎮", "📸", "🎬", "💬"];

function createBlock(type) {
  if (type === "text") return { type: "text", content: "" };
  if (type === "image") return { type: "image", url: "", alt: "" };
  if (type === "video") return { type: "video", embedUrl: "", sourceUrl: "" };
  return null;
}

export default function PostEditor({ onSubmit, saving }) {
  const [title, setTitle] = useState("");
  const [blocks, setBlocks] = useState([createBlock("text")]);

  function updateBlock(index, updates) {
    setBlocks((prev) =>
      prev.map((block, i) => (i === index ? { ...block, ...updates } : block))
    );
  }

  function addBlock(type) {
    setBlocks((prev) => [...prev, createBlock(type)]);
  }

  function removeBlock(index) {
    setBlocks((prev) => prev.filter((_, i) => i !== index));
  }

  function moveBlock(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    setBlocks((prev) => {
      const next = [...prev];
      [next[index], next[newIndex]] = [next[newIndex], next[index]];
      return next;
    });
  }

  function insertEmoji(index, emoji) {
    const block = blocks[index];
    if (block.type !== "text") return;
    updateBlock(index, { content: `${block.content}${emoji}` });
  }

  function handleVideoUrl(index, url) {
    const embedUrl = getVideoEmbedUrl(url);
    updateBlock(index, { sourceUrl: url, embedUrl: embedUrl ?? "" });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    const validBlocks = blocks.filter((block) => {
      if (block.type === "text") return block.content.trim();
      if (block.type === "image") return block.url.trim();
      if (block.type === "video") return block.embedUrl;
      return false;
    });

    if (!validBlocks.length) {
      alert("Adicione pelo menos um bloco de conteúdo.");
      return;
    }

    await onSubmit({ title, blocks: validBlocks });
    setTitle("");
    setBlocks([createBlock("text")]);
  }

  return (
    <form onSubmit={handleSubmit} className="post-form">
      <div className="form-group">
        <label htmlFor="title">Título</label>
        <input
          id="title"
          placeholder="Um título chamativo…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>

      <div className="editor-blocks">
        <div className="editor-blocks-header">
          <label>Conteúdo do post</label>
          <div className="editor-add-buttons">
            <button type="button" onClick={() => addBlock("text")}>
              + Texto
            </button>
            <button type="button" onClick={() => addBlock("image")}>
              + Imagem
            </button>
            <button type="button" onClick={() => addBlock("video")}>
              + Vídeo
            </button>
          </div>
        </div>

        {blocks.map((block, index) => (
          <div key={index} className="editor-block">
            <div className="editor-block-toolbar">
              <span className="editor-block-type">
                {block.type === "text" && "Texto"}
                {block.type === "image" && "Imagem"}
                {block.type === "video" && "Vídeo"}
              </span>
              <div className="editor-block-actions">
                <button type="button" onClick={() => moveBlock(index, -1)} disabled={index === 0}>
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveBlock(index, 1)}
                  disabled={index === blocks.length - 1}
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeBlock(index)}
                  disabled={blocks.length === 1}
                  className="danger"
                >
                  Remover
                </button>
              </div>
            </div>

            {block.type === "text" && (
              <>
                <div className="emoji-picker">
                  {EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="emoji-btn"
                      onClick={() => insertEmoji(index, emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <textarea
                  placeholder="Escreva aqui… emojis são bem-vindos 😀"
                  value={block.content}
                  onChange={(e) => updateBlock(index, { content: e.target.value })}
                  rows={5}
                />
              </>
            )}

            {block.type === "image" && (
              <>
                <input
                  type="url"
                  placeholder="Cole o link da imagem (Imgur, Google Drive, Discord, etc.)"
                  value={block.url}
                  onChange={(e) => updateBlock(index, { url: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Descrição da imagem (opcional)"
                  value={block.alt}
                  onChange={(e) => updateBlock(index, { alt: e.target.value })}
                />
                {block.url && (
                  <img
                    src={block.url}
                    alt={block.alt || "Prévia"}
                    className="editor-preview-image"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                {block.url && (
                  <p className="muted editor-hint">
                    Se a prévia não aparecer, confira se o link é público e termina em .jpg, .png ou .webp.
                  </p>
                )}
              </>
            )}

            {block.type === "video" && (
              <>
                <input
                  type="url"
                  placeholder="Link do YouTube ou Vimeo"
                  value={block.sourceUrl}
                  onChange={(e) => handleVideoUrl(index, e.target.value)}
                />
                {block.sourceUrl && !block.embedUrl && (
                  <p className="form-feedback error">Link de vídeo inválido. Use YouTube ou Vimeo.</p>
                )}
                {block.embedUrl && (
                  <div className="post-block-video editor-video-preview">
                    <iframe
                      src={block.embedUrl}
                      title="Prévia do vídeo"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <button type="submit" disabled={saving}>
        {saving ? "Publicando…" : "Publicar"}
      </button>
    </form>
  );
}
