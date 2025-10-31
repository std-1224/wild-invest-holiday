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
      <div className="section">
        <h2 className="section-title">Investment Opportunities</h2>
        <div className="cabin-grid">
          {cabins.map((cabin) => (
            <CabinCard
              key={cabin.id}
              cabin={cabin}
              onInvest={onInvest}
            />
          ))}
        </div>

        {/* FAQ Section */}
        <div
          style={{
            marginTop: "4rem",
            paddingTop: "2rem",
            borderTop: "1px solid rgba(14, 24, 31, 0.1)",
          }}
        >
          <FAQAccordion />
        </div>
      </div>
    </>
  );
};