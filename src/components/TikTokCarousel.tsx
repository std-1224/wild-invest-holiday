// TikTok Carousel Component
export const TikTokCarousel = () => (
  <div className="py-16 px-4 bg-[#0e181f] text-white">
    <h2 className="text-[2.5rem] font-black italic text-[#ffcf00] text-center mb-8 font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
      WILD ADVENTURES
    </h2>
    <div className="flex items-center justify-center overflow-x-auto gap-4 py-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
      <div className="min-w-[300px] text-center">
        <div className="bg-white/10 p-8 rounded-xl border-2 border-[#ffcf00]">
          <h3 className="text-[#ffcf00] mb-4">
            🏔️ Mountain Adventures
          </h3>
          <p className="text-white mb-4">
            Experience breathtaking mountain views and outdoor adventures
          </p>
          <a
            href="https://www.tiktok.com/@wildthingsaustralia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5 no-underline"
          >
            Follow @wildthingsaustralia
          </a>
        </div>
      </div>
      <div className="min-w-[300px] text-center">
        <div className="bg-white/10 p-8 rounded-xl border-2 border-[#86dbdf]">
          <h3 className="text-[#86dbdf] mb-4">
            🌲 Nature's Playground
          </h3>
          <p className="text-white mb-4">
            Discover the beauty of nature in our pristine locations
          </p>
          <a
            href="https://www.tiktok.com/@wildthingsaustralia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 border-none cursor-pointer text-center bg-[#86dbdf] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5 no-underline"
          >
            Watch More
          </a>
        </div>
      </div>
      <div className="min-w-[300px] text-center">
        <div className="bg-white/10 p-8 rounded-xl border-2 border-[#ec874c]">
          <h3 className="text-[#ec874c] mb-4">
            🏕️ Cabin Life
          </h3>
          <p className="text-white mb-4">
            Experience the perfect blend of comfort and adventure
          </p>
          <a
            href="https://www.tiktok.com/@wildthingsaustralia"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5 no-underline"
          >
            See More
          </a>
        </div>
      </div>
    </div>
  </div>
);
