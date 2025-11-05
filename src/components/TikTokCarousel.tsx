import { useState, useEffect, useRef } from "react";
import { Heart, MessageCircle, Share2, Music, ChevronUp } from "lucide-react";

interface TikTokVideo {
  id: number;
  username: string;
  description: string;
  likes: string;
  comments: string;
  shares: string;
  song: string;
  gradient: string;
}

// TikTok Carousel Component
export const TikTokCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFollowing, setIsFollowing] = useState<Record<string, boolean>>({});
  const [liked, setLiked] = useState<Record<number, boolean>>({});
  const [showScrollHint, setShowScrollHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef(0);

  const videos: TikTokVideo[] = [
    {
      id: 1,
      username: "@wildthingsparks",
      description:
        "Experience breathtaking mountain views and outdoor adventures 🏔️ #wildthings #adventure",
      likes: "12.5K",
      comments: "342",
      shares: "891",
      song: "Wild Adventures - Original Sound",
      gradient: "from-yellow-500 to-orange-500",
    },
    {
      id: 2,
      username: "@wildthingsparks",
      description:
        "Discover the beauty of nature in our pristine locations 🌲 #nature #cabinlife",
      likes: "18.2K",
      comments: "567",
      shares: "1.2K",
      song: "Nature Sounds - Peaceful Vibes",
      gradient: "from-teal-400 to-cyan-500",
    },
    {
      id: 3,
      username: "@wildthingsparks",
      description:
        "Experience the perfect blend of comfort and adventure 🏕️ #cabin #getaway",
      likes: "25.8K",
      comments: "892",
      shares: "2.1K",
      song: "Cabin Vibes - Cozy Nights",
      gradient: "from-orange-400 to-red-500",
    },
    {
      id: 4,
      username: "@wildthingsparks",
      description:
        "Watch stunning sunsets from your private cabin deck 🌅 #sunset #views",
      likes: "31.4K",
      comments: "1.1K",
      shares: "3.5K",
      song: "Sunset Dreams - Chill Mix",
      gradient: "from-pink-400 to-purple-500",
    },
    {
      id: 5,
      username: "@wildthingsparks",
      description:
        "Get up close with Australia's amazing wildlife 🦘 #wildlife #australia",
      likes: "42.7K",
      comments: "2.3K",
      shares: "5.8K",
      song: "Wild Australia - Adventure Mix",
      gradient: "from-green-400 to-emerald-600",
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

  const toggleFollow = (username: string) => {
    setIsFollowing((prev) => ({ ...prev, [username]: !prev[username] }));
  };

  const toggleLike = (id: number) => {
    setLiked((prev) => ({ ...prev, [id]: !prev[id] }));
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
          className="h-[600px] overflow-y-scroll snap-y snap-mandatory scroll-smooth"
          onScroll={handleScroll}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          {videos.map((video, index) => (
            <div
              key={video.id}
              className="relative w-full h-[600px] snap-start flex items-center justify-center"
            >
              {/* Video Background (simulated with gradient) */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${video.gradient} opacity-90`}
              >
                <div className="absolute inset-0 flex items-center justify-center text-white text-6xl font-bold opacity-20">
                  VIDEO {video.id}
                </div>
              </div>

              {/* Content Overlay */}
              <div className="absolute inset-0 flex">
                {/* Right Side Actions */}
                <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10">
                  {/* Profile with Follow Button */}
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gray-300 border-2 border-white overflow-hidden">
                      <div
                        className={`w-full h-full bg-gradient-to-br ${video.gradient}`}
                      ></div>
                    </div>
                    <button
                      onClick={() => toggleFollow(video.username)}
                      className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-white font-bold text-lg transition-colors ${
                        isFollowing[video.username]
                          ? "bg-gray-400"
                          : "bg-red-500"
                      }`}
                    >
                      +
                    </button>
                  </div>

                  {/* Like */}
                  <button
                    onClick={() => toggleLike(video.id)}
                    className="flex flex-col items-center gap-1"
                  >
                    <Heart
                      className={`w-8 h-8 transition-all ${
                        liked[video.id]
                          ? "fill-red-500 text-red-500 scale-110"
                          : "text-white"
                      }`}
                    />
                    <span className="text-white text-xs font-semibold">
                      {video.likes}
                    </span>
                  </button>

                  {/* Comments */}
                  <button className="flex flex-col items-center gap-1">
                    <MessageCircle className="w-8 h-8 text-white" />
                    <span className="text-white text-xs font-semibold">
                      {video.comments}
                    </span>
                  </button>

                  {/* Share */}
                  <button className="flex flex-col items-center gap-1">
                    <Share2 className="w-8 h-8 text-white" />
                    <span className="text-white text-xs font-semibold">
                      {video.shares}
                    </span>
                  </button>

                  {/* Spinning Music Icon */}
                  <div className="relative w-10 h-10 mt-2">
                    <div
                      className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-800 to-gray-900 animate-spin"
                      style={{ animationDuration: "3s" }}
                    >
                      <Music className="absolute inset-0 m-auto w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-20 left-4 right-20 z-10">
                  <div className="text-white">
                    <a className="font-bold text-lg mb-2" href="https://www.tiktok.com/@wildthingsparks">{video.username}</a>
                    <p className="text-sm mb-3">{video.description}</p>
                    <div className="flex items-center gap-2">
                      <Music className="w-4 h-4" />
                      <span className="text-xs">{video.song}</span>
                    </div>
                  </div>
                </div>
                {/* Follow Status */}
                <div className="absolute bottom-5 left-4 z-10">
                  <button
                    onClick={() => toggleFollow(video.username)}
                    className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                      isFollowing[video.username]
                        ? "bg-gray-400 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    @wildthingsparks
                  </button>
                </div>
              </div>

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
