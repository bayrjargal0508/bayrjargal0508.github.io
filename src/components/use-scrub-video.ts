"use client";

import { useEffect, useRef } from "react";

/* Moving the cursor left or right drags the playhead: the film only advances
   while someone is moving. Lifted out of App.tsx so the hero and the about
   section scrub identically — same sensitivity, same seek-flood guard.

   `enabled` is what keeps two films off one decoder: the page holds a hero
   video and an about video at the same time, and iOS Safari will only decode
   one. Each caller passes false while its own film is off screen, so a cursor
   move never seeks a video nobody can see.

   A seek decodes from the previous keyframe, so the film must be cut with
   short GOPs or every cursor move stalls (one keyframe in 97 frames cost
   ~200ms a seek). Re-export any replacement film with:
     ffmpeg -i in.mp4 -an -c:v libx264 -preset veryslow -refs 4 -crf 24 -g 6 \
       -keyint_min 6 -sc_threshold 0 -bf 0 -pix_fmt yuv420p \
       -movflags +faststart out.mp4 */
export function useScrubVideo(enabled = true, sensitivity = 0.8) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const seekPendingRef = useRef<boolean>(false);

  // a seek issued while one is still running is remembered, never stacked
  const performSeek = () => {
    const video = videoRef.current;
    if (!video || !video.duration || Number.isNaN(video.duration)) return;

    if (isSeekingRef.current) {
      seekPendingRef.current = true;
      return;
    }

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.01) {
      isSeekingRef.current = true;
      video.currentTime = targetTimeRef.current;
    }
  };

  const handleSeeked = () => {
    isSeekingRef.current = false;
    const video = videoRef.current;
    if (!video || !video.duration) return;

    if (
      seekPendingRef.current ||
      Math.abs(video.currentTime - targetTimeRef.current) > 0.02
    ) {
      seekPendingRef.current = false;
      performSeek();
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      targetTimeRef.current = videoRef.current.currentTime || 0;
    }
  };

  useEffect(() => {
    if (!enabled) return;
    // a film that moves whenever the cursor does is exactly what this asks to
    // be spared; the poster frame is the still it should get instead
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const advance = (clientX: number) => {
      const video = videoRef.current;
      if (!video || !video.duration || Number.isNaN(video.duration)) {
        prevXRef.current = clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = clientX;
        return;
      }

      const delta = clientX - prevXRef.current;
      prevXRef.current = clientX;

      const timeOffset =
        (delta / window.innerWidth) * sensitivity * video.duration;
      targetTimeRef.current = Math.max(
        0,
        Math.min(video.duration, targetTimeRef.current + timeOffset),
      );

      performSeek();
    };

    const handleMouseMove = (e: MouseEvent) => advance(e.clientX);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      advance(e.touches[0].clientX);
    };
    // dropping the anchor stops the next move from counting the whole gap
    const forget = () => {
      prevXRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", forget);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", forget);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", forget);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", forget);
      // re-enabling must not count the distance travelled while it was off
      forget();
    };
  }, [enabled, sensitivity]);

  return {
    videoRef,
    onLoadedMetadata: handleLoadedMetadata,
    onSeeked: handleSeeked,
  };
}
