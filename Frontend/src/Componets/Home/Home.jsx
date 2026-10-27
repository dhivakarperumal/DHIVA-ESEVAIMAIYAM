import Hero from "./Hero";
import HomeFeatureCards from "./HomeFeatureCards";
import HomeServiceBanner from "./HomeServiceBanner";
import HomeServicesSwiper from "./HomeServicesSwiper";
import HomeRequiredDocumentsSwiper from "./HomeRequiredDocumentsSwiper";
import AboutUs from "./AboutUs";
import GovernmentServicesBanner from "./GovernmentServicesBanner";
import WhyChooseSection from "./WhyChooseSection";
import FaqUpdates from "./FaqUpdates";
import Testimonial from "./Testimonial";

const Home = () => {
  return (
    <main className="bg-[#07090c] text-white">
      <Hero />
      <HomeFeatureCards />
      <HomeServiceBanner />
      <HomeServicesSwiper />
      <AboutUs />
      <HomeRequiredDocumentsSwiper />
      <WhyChooseSection />
      <FaqUpdates />
      <GovernmentServicesBanner />
      <Testimonial />
    </main>
  );
};

export default Home;
