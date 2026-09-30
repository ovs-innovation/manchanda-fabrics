export const isYoutubeUrl = (url = "") => {
  if (!url || typeof url !== "string") return false;
  const lowered = url.toLowerCase().trim();
  return lowered.includes("youtube.com") || lowered.includes("youtu.be");
};

export const getYoutubeVideoId = (url = "") => {
  if (!url || typeof url !== "string") return null;
  const trimmed = url.trim();
  const match = trimmed.match(
    /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/|v\/)|youtu\.be\/)([^&\n?#]+)/i
  );
  return match?.[1] || null;
};

export const getYoutubeThumbnail = (url = "") => {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
};

export const getYoutubeEmbedUrl = (
  url = "",
  { autoplay = false, mute = false, loop = false, controls = true } = {}
) => {
  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;
  const params = new URLSearchParams({
    rel: "0",
    playsinline: "1",
  });
  if (autoplay) params.set("autoplay", "1");
  if (mute) params.set("mute", "1");
  if (loop) {
    params.set("loop", "1");
    params.set("playlist", videoId);
  }
  if (!controls) {
    params.set("controls", "0");
    params.set("showinfo", "0");
    params.set("modestbranding", "1");
  }
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
};
