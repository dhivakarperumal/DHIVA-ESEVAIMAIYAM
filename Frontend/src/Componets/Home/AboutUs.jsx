import { ArrowRight, Check, ClipboardList, FileText, Headset, Search, ShieldCheck, Users } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";

const benefits = [
  "Trusted, professional service",
  "Experienced staff",
  "Fast and hassle-free process",
  "Affordable service charges",
  "Secure document handling",
  "Friendly customer support",
];

const serviceSteps = [
  {
    number: "01",
    title: "Choose a Service",
    description: "Tell us which certificate or government service you need.",
    Icon: ClipboardList,
  },
  {
    number: "02",
    title: "Submit Documents",
    description: "Share the required documents online or at our centre.",
    Icon: FileText,
  },
  {
    number: "03",
    title: "Track Your Request",
    description: "Get guidance and updates as your request progresses.",
    Icon: Search,
  },
];

const highlights = [
  { value: "5000+", label: "Applications processed", Icon: ClipboardList },
  { value: "50+", label: "Services available", Icon: Users },
  { value: "100%", label: "Secure & reliable", Icon: ShieldCheck },
  { value: "24/7", label: "Customer support", Icon: Headset },
];

const AboutUs = () => {
  return (
    <section id="about-us" className="overflow-hidden bg-[#080b0e] py-14 text-white sm:py-20">
      <PageContainer>
        <div className="grid items-center gap-8 lg:grid-cols-[0.95fr_1.25fr_0.8fr] lg:gap-7">
          <div className="overflow-hidden rounded-2xl border border-primary/30 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
            <img
              src="/Hero/Modern%20DHIVA%20E-Sevai%20Reception%20Center.png"
              alt="Modern Dhiva E-Sevai Maiyam service centre"
              loading="lazy"
              className="h-64 w-full object-cover sm:h-80 lg:h-[330px]"
            />
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              About Dhiva E-Sevai Maiyam
            </p>
            <h2 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              People <span className="text-primary">·</span> Services{" "}
              <span className="text-primary">·</span> Progress
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-300 sm:text-base">
              DHIVA E-SEVAI MAIYAM is a trusted digital service centre in Tamil
              Nadu, providing help with government services, online
              applications, document processing, printing and scanning. Our
              goal is to make every service simple, transparent and accessible
              to our community.
            </p>
            <Link
              to="/contact"
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white shadow-[0_8px_24px_rgba(248,116,14,0.25)] transition hover:-translate-y-0.5 hover:bg-orange-500"
            >
              Know More About Us <ArrowRight size={17} />
            </Link>
          </div>

          <ul className="rounded-2xl border border-primary/30 bg-gradient-to-br from-[#17120e] to-[#0b0d10] p-5 sm:p-6">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3 py-2.5 text-sm text-slate-200">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                  <Check size={14} strokeWidth={3} />
                </span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-12 grid grid-cols-2 overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-r from-orange-600 via-primary to-orange-500 sm:grid-cols-4">
          {highlights.map(({ value, label, Icon }, index) => (
            <div
              key={label}
              className={`flex items-center justify-center gap-3 px-3 py-5 text-white sm:py-6 ${
                index > 0 ? "border-l border-white/20" : ""
              }`}
            >
              <Icon size={26} className="hidden shrink-0 sm:block" />
              <div>
                <p className="text-xl font-black sm:text-2xl">{value}</p>
                <p className="mt-1 text-[10px] font-medium leading-4 text-white/90 sm:text-xs">
                  {label}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[0.8fr_2fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              How it works
            </p>
            <h3 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">
              Simple steps to
              <span className="block text-primary">get your service</span>
            </h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              Apply for the service you need with clear guidance from our team.
            </p>
            <Link
              to="/contact"
              className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-primary"
            >
              Get Started Now <ArrowRight size={17} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {serviceSteps.map(({ number, title, description, Icon }) => (
              <article
                key={number}
                className="rounded-2xl border border-primary/30 bg-gradient-to-br from-[#15110d] to-[#0b0d10] p-5"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-lg font-black text-white">
                    {number}
                  </span>
                  <Icon size={28} className="text-white" />
                </div>
                <h4 className="mt-5 text-base font-bold text-white">{title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default AboutUs;
