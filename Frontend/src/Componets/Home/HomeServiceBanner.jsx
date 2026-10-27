import { ArrowRight, FileCheck2, Headset } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";

const HomeServiceBanner = () => (
  <section className="bg-[#080b0e] py-5 sm:py-7">
    <PageContainer>
      <div className="relative isolate overflow-hidden rounded-2xl border border-primary/40 bg-[#111419] shadow-[0_16px_45px_rgba(0,0,0,0.3)]">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_12%_50%,rgba(248,116,14,0.28),transparent_42%),linear-gradient(105deg,rgba(248,116,14,0.1),transparent_62%)]" />
        <div className="grid gap-5 p-5 sm:p-7 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-6 md:px-9">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/35 bg-primary/15 text-primary">
            <FileCheck2 size={27} aria-hidden="true" />
          </span>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-300 sm:text-xs">
              Personal help, every step
            </p>
            <h2 className="mt-1 text-xl font-black leading-tight text-white sm:text-2xl">
              Not sure which service you need?
            </h2>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-slate-300 sm:text-sm sm:leading-6">
              Explore available services or talk with our team for guidance on
              applications and document requirements.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 md:justify-end">
            <Link
              to="/service"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white transition hover:bg-orange-500 sm:text-sm"
            >
              Explore Services <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-black/20 px-5 py-2.5 text-xs font-bold text-white transition hover:border-primary hover:bg-primary/10 sm:text-sm"
            >
              <Headset size={16} className="text-orange-300" />
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  </section>
);

export default HomeServiceBanner;
