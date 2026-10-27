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
import HomeReveal from "./HomeReveal";

const Home = () => {
  return (
    <main className="bg-[#07090c] text-white">
      <Hero />
      <HomeReveal><HomeFeatureCards /></HomeReveal>
      <HomeReveal><HomeServiceBanner /></HomeReveal>
      <HomeReveal><HomeServicesSwiper /></HomeReveal>
      <HomeReveal><AboutUs /></HomeReveal>
      <HomeReveal><HomeRequiredDocumentsSwiper /></HomeReveal>
      <HomeReveal><WhyChooseSection /></HomeReveal>
      <HomeReveal><FaqUpdates /></HomeReveal>
      <HomeReveal><GovernmentServicesBanner /></HomeReveal>
      <HomeReveal><Testimonial /></HomeReveal>
    </main>
  );
};

export default Home;
