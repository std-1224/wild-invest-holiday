// Mission Section Component
export const MissionSection = () => (
  <div className="py-16 px-4 bg-[#0e181f] text-white">
    <div className="max-w-[800px] mx-auto text-center">
      <h2 className="text-[2.5rem] font-black italic text-[#ffcf00] mb-8 font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">
        OUR MISSION
      </h2>
      <p className="text-xl leading-relaxed text-white mb-8">
        We are on a mission to create havens where everyone can come to
        disconnect from the world, from technology, and reconnect with family
        and nature.
      </p>
      <div className="flex justify-center gap-8 flex-wrap">
        <div className="text-center">
          <div className="text-[2rem] mb-2">🌲</div>
          <h3 className="text-[#86dbdf] mb-2">
            Nature First
          </h3>
          <p className="text-sm text-[#ccc]">
            Preserving natural beauty
          </p>
        </div>
        <div className="text-center">
          <div className="text-[2rem] mb-2">👨‍👩‍👧‍👦</div>
          <h3 className="text-[#86dbdf] mb-2">
            Family Focus
          </h3>
          <p className="text-sm text-[#ccc]">
            Creating lasting memories
          </p>
        </div>
        <div className="text-center">
          <div className="text-[2rem] mb-2">💰</div>
          <h3 className="text-[#86dbdf] mb-2">
            Smart Investment
          </h3>
          <p className="text-sm text-[#ccc]">
            Sustainable returns
          </p>
        </div>
      </div>
    </div>
  </div>
);
