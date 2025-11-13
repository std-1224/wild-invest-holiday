import { useState, useEffect, useRef } from "react";
import { ChevronUp } from "lucide-react";

interface TikTokVideo {
  id: string;
  videoUrl: string;
  username: string;
}

// TikTok Carousel Component
export const TikTokCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);
  const iframeRefs = useRef<(HTMLIFrameElement | null)[]>([]);

  // Real TikTok video URLs from @wildthingsparks
  const videos: TikTokVideo[] = [
    {
      id: "7570275504738012434",
      videoUrl:
        "https://www.tiktok.com/@wildthingsparks/video/7570275504738012434",
      username: "@wildthingsparks",
    },
    {
      id: "7569934818272644359",
      videoUrl:
        "https://www.tiktok.com/@wildthingsparks/video/7569934818272644359",
      username: "@wildthingsparks",
    },
    {
      id: "7569887413707803911",
      videoUrl:
        "https://www.tiktok.com/@wildthingsparks/video/7569887413707803911",
      username: "@wildthingsparks",
    },
    {
      id: "7569882149826874642",
      videoUrl:
        "https://www.tiktok.com/@wildthingsparks/video/7569882149826874642",
      username: "@wildthingsparks",
    },
    {
      id: "7569771690276736273",
      videoUrl:
        "https://www.tiktok.com/@wildthingsparks/video/7569771690276736273",
      username: "@wildthingsparks",
    },
    {
      id: "7569054355324701968",
      videoUrl:
        "https://www.tiktok.com/@wildthingsparks/video/7569054355324701968",
      username: "@wildthingsparks",
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => setShowScrollHint(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.target as HTMLDivElement;
    const scrollPosition = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollPosition / itemHeight);

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
      setShowScrollHint(false);
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (_e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY.current) {
      setShowScrollHint(false);
    }
  };

  // Get TikTok embed URL for iframe - using player embed which supports autoplay
  const getEmbedUrl = (video: TikTokVideo) => {
    // Use TikTok's player embed URL which allows better control
    return `https://www.tiktok.com/player/v1/${video.id}?music_info=1&description=1`;
  };

  return (
    <div className="relative py-16 px-4">
      <h2 className="text-[2.5rem] font-black italic text-[#ffcf00] text-center mb-8 font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
        WILD ADVENTURES
      </h2>
      <div className="relative w-full max-w-md mx-auto bg-black overflow-hidden rounded-2xl shadow-2xl">
        {/* TikTok-style vertical carousel */}
        <div
          ref={containerRef}
          className="h-[700px] overflow-y-scroll snap-y snap-mandatory scroll-smooth"
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="relative w-full h-[700px] snap-start flex items-center justify-center bg-black"
            >
              {/* Embedded TikTok Video using iframe */}
              <iframe
                ref={(el) => {
                  iframeRefs.current[index] = el;
                }}
                src={getEmbedUrl(video)}
                className="w-full h-full overflow-hidden"
                style={{
                  border: "none",
                  maxWidth: "605px",
                }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                allowFullScreen
                title={`TikTok video ${video.id}`}
              />

              {/* Scroll Hint */}
              {index === 0 && showScrollHint && (
                <div className="absolute bottom-32 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                  <div className="flex flex-col items-center text-white opacity-80">
                    <ChevronUp className="w-8 h-8 rotate-180 mb-1" />
                    <span className="text-sm font-medium">Swipe up</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Video Counter */}
        <div className="absolute top-6 right-4 z-20 text-white text-sm font-semibold bg-black bg-opacity-40 px-3 py-1 rounded-full">
          {currentIndex + 1} / {videos.length}
        </div>

        {/* Hide scrollbar */}
        <style>{`
        .overflow-y-scroll::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      </div>
    </div>
  );
};
