import { ArrowRight, Check, FileText, Landmark, Printer, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";

const includedServices = [
  { label: "All Government Services", Icon: Landmark },
  { label: "Document Support", Icon: FileText },
  { label: "Printing & Scanning", Icon: Printer },
  { label: "Online Applications", Icon: Smartphone },
];

const GovernmentServicesBanner = () => {
  return (
    <section className="bg-[#080b0e] py-7 sm:py-10">
      <PageContainer>
        <div className="relative isolate overflow-hidden rounded-xl border border-primary/60 bg-[#a52d08] shadow-[0_16px_45px_rgba(0,0,0,0.4)]">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_35%_50%,rgba(255,155,0,0.7),transparent_45%),linear-gradient(105deg,#ef4c08_0%,#b52e08_58%,#090b0e_58%,#090b0e_100%)]" />
          <div className="absolute -left-16 top-0 -z-10 h-full w-36 -skew-x-[25deg] border-r border-orange-300/30 bg-orange-400/20" />
          <div className="absolute right-[38%] top-0 -z-10 h-full w-12 -skew-x-[25deg] bg-primary/25" />

          <div className="grid min-h-[220px] items-center gap-7 px-6 py-7 sm:px-9 md:grid-cols-[1.2fr_0.9fr_auto] md:gap-6 lg:px-12">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-100 sm:text-xs">
                DHIVA E-SEVAI MAIYAM
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-white sm:text-3xl">
                Get Your Government Services
                <span className="block">Done Today!</span>
              </h2>
              <p className="mt-2 max-w-lg text-xs leading-5 text-orange-50 sm:text-sm sm:leading-6">
                Visit us for fast, reliable and professional digital services.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-black px-4 py-2 text-xs font-bold text-white transition hover:bg-white hover:text-black sm:text-sm"
              >
                Visit Our Centre <ArrowRight size={15} className="text-primary" />
              </Link>
            </div>

            <ul className="grid gap-2 rounded-xl border border-primary/40 bg-black/65 p-4">
              {includedServices.map(({ label, Icon }) => (
                <li key={label} className="flex items-center gap-2.5 text-xs font-semibold text-white sm:text-sm">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <Check size={13} strokeWidth={3} />
                  </span>
                  <Icon size={15} className="shrink-0 text-orange-300" />
                  {label}
                </li>
              ))}
            </ul>

            <div className="flex justify-center md:justify-end">
              <Link
                to="/contact"
                className="inline-flex min-h-12 min-w-40 items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-black text-white shadow-[0_8px_24px_rgba(248,116,14,0.3)] transition hover:-translate-y-0.5 hover:bg-orange-500"
              >
                Apply Now <ArrowRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default GovernmentServicesBanner;
