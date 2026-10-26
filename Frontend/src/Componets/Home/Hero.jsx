import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const heroSlides = [
  {
    src: "/Hero/DHIVA%20E-Sevai%20Maiyam%20Service%20Center.png",
    alt: "Dhiva E-Sevai Maiyam digital services, applications and document support",
    eyebrow: "Your trusted local e-sevai centre",
    title: "Government Services",
    highlight: "Made Simple",
    subtitle: "Everything you need, all under one roof.",
    description:
      "Get friendly, reliable help with certificates, government schemes, online applications and document services.",
    primaryAction: "Explore Services",
    secondaryAction: "Contact Our Team",
  },
  {
    src: "/Hero/DHIVA%20E-Sevai%20Modern%20Service%20Center.png",
    alt: "Dhiva E-Sevai Maiyam modern government service centre",
    eyebrow: "Applications without the confusion",
    title: "Your Application",
    highlight: "Starts Here",
    subtitle: "Step-by-step support from our experienced team.",
    description:
      "We help you prepare forms, submit documents and understand the next steps for the services you need.",
    primaryAction: "Start an Application",
    secondaryAction: "Get Assistance",
  },
  {
    src: "/Hero/Modern%20DHIVA%20E-Sevai%20Reception%20Center.png",
    alt: "Dhiva E-Sevai Maiyam reception and customer service centre",
    eyebrow: "People-first service in Tirupattur",
    title: "Here to Help",
    highlight: "Every Step",
    subtitle: "Personal service with clear guidance.",
    description:
      "Visit our service centre for attentive support with certificates, public services, printing and more.",
    primaryAction: "Plan Your Visit",
    secondaryAction: "Contact Us",
  },
  {
    src: "/Hero/Modern%20Orange-Black%20Digital%20Service%20Center.png",
    alt: "Dhiva E-Sevai Maiyam digital service center",
    eyebrow: "Fast, secure and dependable",
    title: "Your Digital",
    highlight: "Services Hub",
    subtitle: "Modern support for your everyday government service needs.",
    description:
      "From online applications and document uploads to printing and scanning, get it done with confidence.",
    primaryAction: "Apply Online",
    secondaryAction: "See How We Help",
  },
];

const Hero = () => {
  return (
    <section
      aria-label="Dhiva E-Sevai Maiyam hero"
      className="group relative border-b border-primary/20 bg-black"
    >
      <Swiper
        modules={[Autoplay, Pagination]}
        loop
        speed={800}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
          pauseOnMouseEnter: false,
          stopOnLastSlide: false,
        }}
        pagination={{ clickable: true }}
        className="hero-swiper [&_.swiper-pagination]:!bottom-4 [&_.swiper-pagination-bullet]:!bg-white/70 [&_.swiper-pagination-bullet-active]:!bg-primary"
      >
        {heroSlides.map(
          (
            {
              src,
              alt,
              eyebrow,
              title,
              highlight,
              subtitle,
              description,
              primaryAction,
              secondaryAction,
            },
            index,
          ) => (
          <SwiperSlide key={src} className="relative">
            <img
              src={src}
              alt={alt}
              fetchPriority={index === 0 ? "high" : "auto"}
              loading={index === 0 ? "eager" : "lazy"}
              className="absolute inset-0 h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/65 to-black/10" />
            <div className="relative z-[1]">
              <PageContainer className="flex min-h-[400px] items-center py-10 sm:min-h-[440px] lg:min-h-[min(32vw,500px)]">
                <div className="max-w-xl">
                  <p className="inline-flex rounded-full border border-primary/60 bg-black/50 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-orange-200 sm:text-xs">
                    {eyebrow}
                  </p>
                  <h1 className="mt-5 text-4xl font-black leading-[1.05] text-white drop-shadow-lg sm:text-5xl lg:text-6xl">
                    {title}
                    <span className="mt-1 block text-primary">{highlight}</span>
                  </h1>
                  <h2 className="mt-4 text-lg font-bold text-white sm:text-xl">
                    {subtitle}
                  </h2>
                  <p className="mt-3 max-w-lg text-sm leading-6 text-slate-200 sm:text-base sm:leading-7">
                    {description}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      to="/contact"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(248,116,14,0.35)] transition hover:-translate-y-0.5 hover:bg-orange-500"
                    >
                      {primaryAction} <ArrowRight size={17} />
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-primary/80 bg-black/50 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/20"
                    >
                      {secondaryAction} <ArrowRight size={16} className="text-primary" />
                    </Link>
                  </div>
                </div>
              </PageContainer>
            </div>
          </SwiperSlide>
          ),
        )}
      </Swiper>

    </section>
  );
};

export default Hero;
