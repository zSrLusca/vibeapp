export function getVideoEmbedUrl(url) {
  if (!url) return null;

  const trimmed = url.trim();

  const youtubeWatch = trimmed.match(
    /(?:youtube\.com\/watch\?v=|youtube\.com\/shorts\/)([\w-]{11})/
  );
  if (youtubeWatch) {
    return `https://www.youtube.com/embed/${youtubeWatch[1]}`;
  }

  const youtubeShort = trimmed.match(/youtu\.be\/([\w-]{11})/);
  if (youtubeShort) {
    return `https://www.youtube.com/embed/${youtubeShort[1]}`;
  }

  const youtubeEmbed = trimmed.match(/youtube\.com\/embed\/([\w-]{11})/);
  if (youtubeEmbed) {
    return `https://www.youtube.com/embed/${youtubeEmbed[1]}`;
  }

  const vimeo = trimmed.match(/vimeo\.com\/(\d+)/);
  if (vimeo) {
    return `https://player.vimeo.com/video/${vimeo[1]}`;
  }

  const vimeoPlayer = trimmed.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (vimeoPlayer) {
    return `https://player.vimeo.com/video/${vimeoPlayer[1]}`;
  }

  return null;
}
