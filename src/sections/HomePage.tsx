import { HeroSection } from "./HeroSection";
import { TikTokCarousel } from "../components/TikTokCarousel";
import { MissionSection } from "./MissionSection";
import { InvestTimeline } from "../components/InvestTimeline";
import { InvestFaqs } from "../components/InvestFaqs";
import { GoogleReviews } from "../components/GoogleReviews";

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

export const HomePage = ({ onInvestClick }: HomePageProps) => {
  return (
    <>
      <HeroSection onInvestClick={onInvestClick} />
      <MissionSection />
      <GoogleReviews />
      <TikTokCarousel />
      <InvestTimeline />
      <InvestFaqs />
    </>
  );
};
