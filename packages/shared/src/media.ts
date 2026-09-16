/** Loại media nhúng được vào đề (ảnh/audio/video). */
export const MediaKind = {
  IMAGE: 'image',
  AUDIO: 'audio',
  VIDEO: 'video',
} as const;
export type MediaKind = (typeof MediaKind)[keyof typeof MediaKind];

/**
 * Giới hạn dung lượng mỗi file (byte), dùng chung cho API (chặn) và giao diện
 * (gợi ý). Ảnh convert webp nên nhẹ đi nhiều; audio tính theo một đề nghe ~30
 * phút mp3 128kbps (~29MB), video theo một clip 720p ~2 phút (~30MB).
 */
export const MEDIA_SIZE_LIMITS: Record<MediaKind, number> = {
  image: 5 * 1024 * 1024,
  audio: 50 * 1024 * 1024,
  video: 100 * 1024 * 1024,
};

/** Cấu hình R2 phía server; chưa đủ biến thì endpoint upload trả 501. */
export interface MediaStatus {
  configured: boolean;
  /** Lý do chưa dùng được, `null` khi đã cấu hình xong. */
  reason: string | null;
}

/** File đã nằm trên bucket public. */
export interface MediaItem {
  /** Key trên R2, dùng để xoá. */
  key: string;
  url: string;
  kind: MediaKind;
  size: number;
  uploadedAt: string;
}

export function mediaKindFromExtension(key: string): MediaKind {
  const ext = key.slice(key.lastIndexOf('.') + 1).toLowerCase();
  if (['mp3', 'm4a', 'wav', 'ogg', 'aac', 'weba'].includes(ext)) {
    return MediaKind.AUDIO;
  }
  if (['mp4', 'webm', 'mov', 'mkv', 'avi'].includes(ext)) {
    return MediaKind.VIDEO;
  }
  return MediaKind.IMAGE;
}
