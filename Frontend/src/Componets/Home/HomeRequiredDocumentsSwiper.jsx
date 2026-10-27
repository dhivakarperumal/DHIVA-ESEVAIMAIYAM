import { useEffect, useState } from "react";
import { ArrowRight, Check, FileCheck2, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import PageContainer from "../CommonComponents/PageContainer";
import api from "../../api";
import "swiper/css";
import "swiper/css/pagination";

const HomeRequiredDocumentsSwiper = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    Promise.all([
      api.get("/services"),
      api.get("/service-documents", { params: { active: "true" } }),
    ])
      .then(([servicesResponse, documentsResponse]) => {
        const services = servicesResponse.data?.data;
        const serviceDocuments = documentsResponse.data?.data;
        if (
          servicesResponse.data?.success === false ||
          documentsResponse.data?.success === false ||
          !Array.isArray(services) ||
          !Array.isArray(serviceDocuments)
        ) {
          throw new Error("The services or document requirements response was invalid.");
        }

        const serviceNames = new Map(
          services
            .filter((service) => service.status?.toLowerCase() === "active")
            .map((service) => [String(service.id), service.service_name])
        );
        const activeDocuments = serviceDocuments
          .filter((document) => serviceNames.has(String(document.service_id)))
          .map((document) => ({
            ...document,
            service_name: serviceNames.get(String(document.service_id)),
          }));

        if (active) setDocuments(activeDocuments);
      })
      .catch((requestError) => {
        if (active) {
          setError(
            requestError.response?.data?.message ||
              requestError.message ||
              "Unable to load required documents."
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
      aria-labelledby="home-required-documents-heading"
      className="border-b border-white/5 bg-[#07090c] py-10 text-white sm:py-14"
    >
      <PageContainer>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Prepare before you apply
            </p>
            <h2
              id="home-required-documents-heading"
              className="mt-2 text-2xl font-black sm:text-3xl"
            >
              Required Documents
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Check the active document requirements configured for each service.
            </p>
          </div>
          <Link
            to="/documents"
            className="inline-flex min-h-10 w-fit items-center gap-2 rounded-full border border-primary/50 px-4 py-2 text-sm font-bold text-orange-200 transition hover:bg-primary hover:text-white"
          >
            View All Documents <ArrowRight size={16} />
          </Link>
        </div>

        {loading ? (
          <div
            className="flex min-h-40 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-[#101317] text-sm text-slate-300"
            role="status"
          >
            <LoaderCircle size={18} className="animate-spin text-primary" />
            Loading required documents...
          </div>
        ) : error ? (
          <p
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-6 text-center text-sm text-red-200"
          >
            {error}
          </p>
        ) : documents.length === 0 ? (
          <p className="rounded-xl border border-white/10 bg-[#101317] px-4 py-6 text-center text-sm text-slate-400">
            No active document requirements are available right now.
          </p>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            loop={documents.length > 1}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            spaceBetween={14}
            breakpoints={{
              0: { slidesPerView: 1.15 },
              480: { slidesPerView: 1.7 },
              640: { slidesPerView: 2 },
              900: { slidesPerView: 3 },
              1200: { slidesPerView: 4 },
            }}
            className="!pb-12 [&_.swiper-pagination-bullet]:!bg-white/60 [&_.swiper-pagination-bullet-active]:!bg-primary"
          >
            {documents.map((document) => (
              <SwiperSlide key={document.id} className="h-auto">
                <article className="flex h-full min-h-48 flex-col rounded-2xl border border-white/10 bg-[#101419] p-5 transition hover:border-primary/50 hover:bg-[#14181d]">
                  <p className="text-[10px] font-bold uppercase tracking-wide text-primary">
                    {document.service_name}
                  </p>
                  <div className="mt-2 flex items-start gap-2.5">
                    <FileCheck2 size={19} className="mt-0.5 shrink-0 text-orange-200" />
                    <h3 className="text-sm font-bold leading-5 text-white">
                      {document.document_name}
                    </h3>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${
                        document.required_status === "Required"
                          ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
                          : "border-white/10 bg-white/5 text-slate-300"
                      }`}
                    >
                      {document.required_status}
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-slate-300">
                      Max {document.max_file_size || "5 MB"}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs leading-5 text-slate-400">
                    {Array.isArray(document.accepted_formats) &&
                    document.accepted_formats.length
                      ? `Accepted formats: ${document.accepted_formats.join(", ")}`
                      : document.conditional_requirement ||
                        document.document_description ||
                        "Contact us to confirm document details."}
                  </p>
                  {document.alternative_group && (
                    <p className="mt-2 flex items-center gap-1.5 text-[10px] text-emerald-300">
                      <Check size={12} />
                      Accepted as an alternative document
                    </p>
                  )}
                  <Link
                    to="/documents"
                    className="mt-auto inline-flex w-fit items-center gap-1.5 pt-4 text-xs font-bold text-orange-200 transition hover:text-white"
                  >
                    View checklist <ArrowRight size={14} />
                  </Link>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </PageContainer>
    </section>
  );
};

export default HomeRequiredDocumentsSwiper;
