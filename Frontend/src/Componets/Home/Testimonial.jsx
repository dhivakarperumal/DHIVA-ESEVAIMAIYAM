import { useEffect, useState } from "react";
import { MessageSquareQuote, Star, UserRound } from "lucide-react";
import { Autoplay, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import PageContainer from "../CommonComponents/PageContainer";
import "swiper/css";
import "swiper/css/pagination";

const Testimonial = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    fetch("/Review.json", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Could not load reviews (${response.status}).`);
        }
        return response.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          throw new Error("Review data must be a JSON array.");
        }
        setReviews(data);
      })
      .catch((fetchError) => {
        if (fetchError.name !== "AbortError") {
          setError(fetchError.message || "Unable to load reviews.");
        }
      });

    return () => controller.abort();
  }, []);

  return (
    <section
      aria-labelledby="community-reviews-heading"
      className="border-t border-primary/20 bg-[#080b0e] py-14 text-white sm:py-20"
    >
      <PageContainer>
        <div className="text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/40 bg-primary/10 text-primary">
            <MessageSquareQuote size={27} />
          </span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Visitor feedback
          </p>
          <h2
            id="community-reviews-heading"
            className="mt-2 text-3xl font-black sm:text-4xl"
          >
            Reviews & Experiences
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-xs leading-5 text-amber-200/80">
            Sample review content for layout preview only. Replace these entries
            with genuine customer feedback before publishing.
          </p>
        </div>

        {error ? (
          <p role="alert" className="mt-8 text-center text-sm text-red-400">
            {error}
          </p>
        ) : reviews.length === 0 ? (
          <p className="mt-8 text-center text-sm text-slate-400">
            Loading reviews...
          </p>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            loop={reviews.length > 1}
            autoplay={{
              delay: 4500,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            pagination={{ clickable: true }}
            spaceBetween={16}
            breakpoints={{
              0: { slidesPerView: 1 },
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            className="mt-8 pb-12 [&_.swiper-pagination-bullet]:!bg-white/60 [&_.swiper-pagination-bullet-active]:!bg-primary"
          >
            {reviews.map((review) => (
              <SwiperSlide key={review.id}>
                <article className="h-full min-h-52 rounded-2xl border border-white/10 bg-[#101419] p-5 text-left shadow-lg">
                  <div className="flex items-center justify-between">
                    <MessageSquareQuote size={22} className="text-primary" />
                    <div
                      className="flex gap-0.5 text-primary"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: review.rating }, (_, index) => (
                        <Star key={index} size={14} fill="currentColor" />
                      ))}
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-200">
                    “{review.quote}”
                  </p>
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <div className="flex items-center gap-3">
                      <span
                        aria-hidden="true"
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/50 bg-gradient-to-br from-primary/30 to-[#17110c] text-primary"
                      >
                        <UserRound size={21} />
                      </span>
                      <div>
                        <p className="text-sm font-bold text-white">{review.name}</p>
                        <p className="mt-1 text-xs text-slate-400">{review.service}</p>
                      </div>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </PageContainer>
    </section>
  );
};

export default Testimonial;
