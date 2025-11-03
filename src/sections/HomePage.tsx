import { HeroSection } from "./HeroSection";
import { TikTokCarousel } from "../components/TikTokCarousel";
import { MissionSection } from "./MissionSection";
import { CabinCard } from "../components/Cards/CabinCard";
import { FAQAccordion } from "../components/FAQAccordion";

interface HomePageProps {
  cabins: Array<{
    id: string;
    name: string;
    price: number;
    video: string;
  }>;
  onInvest: (cabin: any) => void;
  onInvestClick: () => void;
}

export const HomePage = ({ cabins, onInvest, onInvestClick }: HomePageProps) => {
  return (
    <>
      <HeroSection onInvestClick={onInvestClick} />
      <TikTokCarousel />
      <MissionSection />
      <div className="py-20 px-4">
        <h2 className="text-5xl font-black italic text-center mb-16 text-[#0e181f] [text-shadow:1px_1px_2px_rgba(0,0,0,0.1)] font-[family-name:var(--font-eurostile,_'Eurostile_Condensed',_'Arial_Black',_Impact,_sans-serif)]">Investment Opportunities</h2>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] gap-8">
          {cabins.map((cabin) => (
            <CabinCard
              key={cabin.id}
              cabin={cabin}
              onInvest={onInvest}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16 pt-8 border-t border-[#0e181f]/10">
          <FAQAccordion />
        </div>
      </div>
    </>
  );
};