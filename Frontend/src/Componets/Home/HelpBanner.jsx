import { ArrowRight, Check, FileText, Headset, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";

const supportPoints = [
  "Expert guidance",
  "Quick processing",
  "Reliable support",
  "Affordable charges",
];

const HelpBanner = () => {
  return (
    <section className="bg-[#080b0e] py-8 sm:py-12">
      <PageContainer>
        <div className="relative isolate overflow-hidden rounded-2xl border border-primary/50 bg-[#120d09] px-6 py-8 shadow-[0_18px_50px_rgba(0,0,0,0.4)] sm:px-10 sm:py-10 lg:px-14">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_5%_50%,rgba(248,116,14,0.35),transparent_35%),linear-gradient(100deg,#1d1008_0%,#090b0e_56%,#17100a_100%)]" />
          <div className="absolute -left-12 top-0 -z-10 h-full w-28 -skew-x-12 bg-primary/20 blur-xl" />
          <div className="absolute -right-16 -top-20 -z-10 h-60 w-60 rounded-full border border-primary/20" />
          <div className="absolute -right-8 -top-12 -z-10 h-44 w-44 rounded-full border border-primary/20" />

          <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary sm:text-sm">
                We’re here to help
              </p>
              <h2 className="mt-2 max-w-xl text-3xl font-black leading-tight text-white sm:text-4xl">
                Need help with an
                <span className="block text-primary">online application?</span>
              </h2>
              <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300">
                Our team can guide you through government services, document
                submission and more.
              </p>

              <ul className="mt-5 grid grid-cols-1 gap-2 text-xs font-medium text-slate-200 sm:grid-cols-2 sm:text-sm">
                {supportPoints.map((point) => (
                  <li key={point} className="flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                      <Check size={12} strokeWidth={3} />
                    </span>
                    {point}
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/contact"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary"
                >
                  <MapPin size={16} className="text-primary" />
                  Visit Our Centre <ArrowRight size={16} />
                </Link>
                <a
                  href="tel:+919659133504"
                  className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
                >
                  <Phone size={16} />
                  Contact Us
                </a>
              </div>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <div className="relative flex h-48 w-48 items-center justify-center rounded-full border border-primary/40 bg-black/30 shadow-[0_0_60px_rgba(248,116,14,0.18)] lg:h-56 lg:w-56">
                <div className="absolute -right-6 top-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/40 bg-[#17110c] text-primary shadow-lg">
                  <FileText size={30} />
                </div>
                <Headset size={94} strokeWidth={1.3} className="text-primary" />
                <span className="absolute -bottom-3 rounded-full border border-primary/40 bg-[#100c08] px-4 py-1.5 text-xs font-bold text-white">
                  Personal support
                </span>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default HelpBanner;
