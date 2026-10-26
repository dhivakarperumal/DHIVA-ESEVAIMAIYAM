import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <section
      aria-label="Dhiva E-Sevai Maiyam hero"
      className="border-b border-primary/20 bg-black"
    >
      <img
        src="/images/Hero/Dhiva%20E-Sevai%20Maiyam%20Service%20Center.png"
        alt="Dhiva E-Sevai Maiyam digital services, applications, document uploads and service centre"
        fetchPriority="high"
        className="block h-auto w-full"
      />
      <div className="mx-auto flex max-w-[1700px] flex-wrap justify-center gap-3 px-[6%] py-5 sm:px-[5%] lg:justify-end lg:px-[3%]">
        <Link
          to="/contact"
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(248,116,14,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-500"
        >
          Apply Now <ArrowRight size={17} />
        </Link>
        <Link
          to="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-primary/70 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/10"
        >
          Track Application
        </Link>
      </div>
    </section>
  );
};

export default Hero;
