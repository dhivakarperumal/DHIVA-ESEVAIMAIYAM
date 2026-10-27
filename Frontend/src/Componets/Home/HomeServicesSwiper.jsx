import { useEffect, useState } from "react";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  FileBadge,
  FileText,
  Landmark,
  Lightbulb,
  LoaderCircle,
  MapPinned,
  Printer,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import PageContainer from "../CommonComponents/PageContainer";
import api from "../../api";
import "swiper/css";

const categoryIcons = {
  Certificates: FileBadge,
  "Government Applications": Landmark,
  "Land Records": MapPinned,
  "Utility Services": Lightbulb,
  "Printing & Scanning": Printer,
  "Financial Services": Banknote,
  "Other Services": BriefcaseBusiness,
};

const HomeServicesSwiper = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    api
      .get("/services")
      .then(({ data }) => {
        if (data.success === false || !Array.isArray(data.data)) {
          throw new Error(data.message || "The services response was invalid.");
        }
        if (active) {
          setServices(
            data.data.filter((service) => service.status?.toLowerCase() === "active")
          );
        }
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load services."
          );
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <section
      aria-labelledby="home-services-heading"
      className="border-b border-white/5 bg-[#090c10] py-10 text-white sm:py-14"
    >
      <PageContainer>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Explore what we offer
            </p>
            <h2
              id="home-services-heading"
              className="mt-2 text-2xl font-black sm:text-3xl"
            >
              Our Services
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Browse our available services and find the support you need.
            </p>
          </div>
          <Link
            to="/service"
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-primary/50 px-4 py-2 text-sm font-bold text-orange-200 transition hover:bg-primary hover:text-white"
          >
            View All Services <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div className="flex min-h-40 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#101317] text-sm text-slate-300" role="status">
            <LoaderCircle size={18} className="animate-spin text-primary" />
            Loading services...
          </div>
        ) : error ? (
          <p role="alert" className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-6 text-center text-sm text-red-200">
            {error}
          </p>
        ) : services.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-[#101317] px-4 py-6 text-center text-sm text-slate-400">
            No active services are available right now.
          </p>
        ) : (
          <Swiper
            modules={[Autoplay]}
            loop={services.length > 1}
            autoplay={{
              delay: 3500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            spaceBetween={14}
            breakpoints={{
              0: { slidesPerView: 1.15 },
              480: { slidesPerView: 1.7 },
              640: { slidesPerView: 2 },
              900: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
            className="!pb-2"
          >
            {services.map((service) => {
              const Icon = categoryIcons[service.category] || FileText;
              const description =
                service.description ||
                service.document_instructions ||
                "Contact our team for guidance with this service.";

              return (
                <SwiperSlide key={service.id} className="h-auto">
                  <article className="flex h-full min-h-52 flex-col rounded-2xl border border-white/10 bg-[#101419] p-5 transition hover:border-primary/50 hover:bg-[#14181d]">
                    <div className="flex items-start gap-3">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary">
                        <Icon size={22} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                          {service.category || "Service"}
                        </p>
                        <h3 className="mt-1 line-clamp-2 text-sm font-bold leading-5 text-white">
                          {service.service_name}
                        </h3>
                      </div>
                    </div>
                    <p className="mt-4 line-clamp-3 flex-1 text-xs leading-5 text-slate-400">
                      {description}
                    </p>
                    <Link
                      to={`/service?search=${encodeURIComponent(service.service_name)}`}
                      className="mt-4 inline-flex w-fit items-center gap-1.5 text-xs font-bold text-orange-200 transition hover:text-white"
                    >
                      Explore service <ArrowRight size={14} />
                    </Link>
                  </article>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </PageContainer>
    </section>
  );
};

export default HomeServicesSwiper;
