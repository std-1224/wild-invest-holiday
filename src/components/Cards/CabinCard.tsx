// Cabin Card Component
import { CabinVideo } from "../CabinVideo";
export const CabinCard = ({ cabin, onInvest }: any) => (
  <div className="bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 border-2 border-transparent hover:-translate-y-2 hover:shadow-[0_16px_48px_rgba(0,0,0,0.2)] hover:border-[#ffcf00]">
    <CabinVideo cabin={cabin} />
    <div className="p-8">
      <h3 className="text-2xl font-black italic text-[#0e181f] mb-4 font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">{cabin.name.toUpperCase()}</h3>
      <div className="text-[2rem] font-bold text-[#ffcf00] mb-6 [text-shadow:1px_1px_2px_rgba(0,0,0,0.1)]">
        ${cabin.price.toLocaleString("en-AU")} plus GST
      </div>
      <button
        onClick={() => onInvest && onInvest(cabin)}
        className="w-full text-sm px-6 py-3 rounded-lg font-semibold transition-all duration-300 border-none cursor-pointer text-center bg-[#ffcf00] text-[#0e181f] hover:opacity-90 hover:-translate-y-0.5"
      >
        Reserve Yours Today
      </button>
    </div>
  </div>
);
