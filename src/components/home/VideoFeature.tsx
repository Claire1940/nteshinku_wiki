"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink, Play } from "lucide-react";

interface VideoFeatureProps {
  videoId: string;
  title: string;
}

/**
 * 视频特性区组件
 *
 * 自动播放策略：
 * 1. 进入视口（IntersectionObserver，阈值 0.4）时自动加载并播放 iframe
 *    （autoplay=1&mute=1&loop=1&playlist=id，静音循环自动播放）
 * 2. 自动播放前显示缩略图 + 居中播放按钮；用户点击按钮也可手动触发播放（后备）
 * 3. 一旦开始播放即保持，离开视口不卸载，避免重复加载
 */
export function VideoFeature({ videoId, title }: VideoFeatureProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldPlay, setShouldPlay] = useState(false);
  const [thumbSrc, setThumbSrc] = useState(
    `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  );

  // 进视口自动播放
  useEffect(() => {
    if (shouldPlay) return; // 已开始播放则不再监听
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // 环境不支持时直接播放
      setShouldPlay(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setShouldPlay(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [shouldPlay]);

  // 缩略图降级：maxres 不存在则退回 hqdefault
  const handleThumbError = () => {
    setThumbSrc(`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`);
  };

  // loop=1 必须搭配 playlist=<videoId> 才能在单视频情况下循环
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&playsinline=1&rel=0`;
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <div className="space-y-4">
      <div
        ref={containerRef}
        className="relative w-full overflow-hidden rounded-lg bg-black"
        style={{ paddingBottom: "56.25%" }}
      >
        {shouldPlay ? (
          <iframe
            className="absolute top-0 left-0 h-full w-full"
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setShouldPlay(true)}
            aria-label={`Play video: ${title}`}
            className="group absolute top-0 left-0 h-full w-full cursor-pointer"
          >
            {/* 缩略图 */}
            <img
              src={thumbSrc}
              alt={title}
              onError={handleThumbError}
              className="absolute top-0 left-0 h-full w-full object-cover"
            />
            {/* 暗色遮罩，让播放按钮更醒目 */}
            <span className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
            {/* 播放按钮 */}
            <span
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full
                         h-16 w-16 md:h-20 md:w-20
                         bg-[hsl(var(--nav-theme))] shadow-lg shadow-[hsl(var(--nav-theme)/0.4)]
                         transition-transform hover:scale-110"
            >
              <Play className="h-7 w-7 md:h-9 md:w-9 translate-x-0.5 text-white" fill="currentColor" />
            </span>
          </button>
        )}
      </div>

      <div className="flex justify-center">
        <a
          href={watchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
        >
          Watch on YouTube
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
