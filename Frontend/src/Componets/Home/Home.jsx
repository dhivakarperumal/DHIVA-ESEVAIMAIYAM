import { Link } from "react-router-dom";
import { FileCheck2, Fingerprint, Landmark, Printer, Smartphone } from "lucide-react";
import Hero from "./Hero";
import AboutUs from "./AboutUs";
import GovernmentServicesBanner from "./GovernmentServicesBanner";
import WhyChooseSection from "./WhyChooseSection";
import FaqUpdates from "./FaqUpdates";
import Testimonial from "./Testimonial";

const services = [
  { label: "Aadhaar Services", Icon: Fingerprint, color: "text-orange-400" },
  { label: "Certificates", Icon: FileCheck2, color: "text-emerald-400" },
  { label: "Government Schemes", Icon: Landmark, color: "text-amber-300" },
  { label: "Online Applications", Icon: Smartphone, color: "text-sky-400" },
  { label: "Print & Scan", Icon: Printer, color: "text-cyan-300" },
];

const Home = () => {
  return (
    <main className="bg-[#07090c] text-white">
      <Hero />

      <section
        id="popular-services"
        className="mx-auto max-w-[1700px] px-[6%] py-8 sm:px-[5%] lg:px-[3%]"
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {services.map(({ label, Icon, color }) => (
            <Link
              key={label}
              to="/contact"
              className="group flex min-h-24 items-center gap-3 rounded-2xl border border-white/10 bg-[#101317] p-4 transition hover:-translate-y-1 hover:border-primary/60 hover:bg-[#17130f]"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40">
                <Icon size={22} className={color} />
              </span>
              <span className="text-xs font-semibold leading-5 text-slate-200 group-hover:text-white sm:text-sm">
                {label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <AboutUs />
      <WhyChooseSection />
      <FaqUpdates />
      <GovernmentServicesBanner />
      <Testimonial />
    </main>
  );
};

export default Home;
