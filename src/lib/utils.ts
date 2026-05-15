import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getEmbedUrl(url: string, autoplay: boolean = false) {
  if (!url) return '';
  
  // YouTube
  const ytMatch = url.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}${autoplay ? '?autoplay=1' : ''}`;
  }

  // Vimeo
  const vimeoMatch = url.match(/(?:https?:\/\/)?(?:www\.)?vimeo\.com\/(\d+)/);
  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}${autoplay ? '?autoplay=1' : ''}`;
  }

  // TikTok
  const ttMatch = url.match(/(?:https?:\/\/)?(?:www\.)?tiktok\.com\/.*\/video\/(\d+)/);
  if (ttMatch) {
    return `https://www.tiktok.com/embed/v2/${ttMatch[1]}`;
  }

  // Facebook
  if (url.includes('facebook.com') || url.includes('fb.watch')) {
    const baseUrl = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=0&width=560`;
    return autoplay ? `${baseUrl}&autoplay=true` : baseUrl;
  }

  return url;
}

export function isDirectVideoUrl(url: string) {
  if (!url) return false;
  return url.match(/\.(mp4|webm|ogg|mov)(\?.*)?$/i) || 
         url.includes('firebasestorage.googleapis.com') ||
         url.includes('firebasestorage.app');
}
