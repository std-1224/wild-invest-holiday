interface LocationsPageProps {}

export const LocationsPage = ({}: LocationsPageProps) => {
  return (
    <div className="pt-[120px] min-h-screen bg-[#f5f5f5]">
      <div className="max-w-[1200px] mx-auto px-5">
        <h1 className="text-[clamp(3rem,8vw,5rem)] font-black italic text-[#0e181f] text-center mb-16 [text-shadow:2px_2px_4px_rgba(0,0,0,0.1)] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
          OUR LOCATIONS
        </h1>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(400px,1fr))] gap-12">
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-all duration-300 border-2 border-transparent hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] hover:border-[#ffcf00]"
          >
            <video
              src="/mansfield-flythrough.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[300px] object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold text-[#0e181f] mb-4">
                Mansfield, Victoria
              </h3>
              <p className="text-[#666] mb-4">
                Experience the beauty of the Victorian High Country with skiing,
                hiking, and mountain adventures.
              </p>
              {/* Attractions icons grid */}
              <div className="flex flex-wrap gap-3 items-center mt-2">
                {[
                  { key: "water-skiing", label: "Water Skiing", src: "/water-ski.svg" },
                  { key: "playground", label: "Playground", src: "/playground.svg" },
                  { key: "pool", label: "Pool", src: "/pool.svg" },
                  { key: "skiing", label: "Skiing", src: "/skiing.svg" },
                  { key: "hiking", label: "Hiking", src: "/hiking.svg" },
                  { key: "museum", label: "Museum", src: "/museum.svg" },
                  { key: "mt-buller", label: "Mt Buller", src: "/mt-buller.svg" },
                  { key: "food-trucks", label: "Food Trucks", src: "/food-trucks.svg" },
                  { key: "bottle-shop", label: "Bottle Shop", src: "/bottle-shop.svg" },
                  { key: "pizza-ovens", label: "Pizza Ovens", src: "/pizza-ovens.svg" },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex flex-col items-center w-[90px] text-[0.8rem] text-[#0e181f]"
                  >
                    <img
                      src={item.src}
                      alt={item.label}
                      onError={(e: any) => {
                        // If the specific icon is missing, fall back to a generic icon
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/attractions/default.png";
                      }}
                      className="w-[72px] h-[72px] object-contain mb-1.5"
                    />
                    <div className="text-center">{item.label}</div>
                  </div>
                ))}
              </div>
              <a
                href="https://ibe12.rmscloud.com/7C958C5EB59D2E0A/1"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-lg font-semibold text-base no-underline inline-block transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
              >
                Book a Stay
              </a>
            </div>
          </div>
          <div
            className="bg-white rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.15)] transition-all duration-300 border-2 border-transparent hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] hover:border-[#ffcf00]"
          >
            <video
              src="/byron-coming-soon.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-[300px] object-cover"
            />
            <div className="p-6">
              <h3 className="text-2xl font-bold text-[#0e181f] mb-4">
                Byron Bay, NSW
              </h3>
              <div className="bg-[#ec874c] text-white py-2 px-2 rounded inline-block mb-4">
                Coming Soon
              </div>
              <p className="text-[#666] mb-4">
                Coastal paradise coming soon. Be the first to know when we launch in
                Byron Bay.
              </p>
              <button
                className="px-6 py-3 rounded-lg font-semibold text-base no-underline inline-block transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] opacity-50 hover:-translate-y-0.5"
                disabled
              >
                Book a Stay
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};