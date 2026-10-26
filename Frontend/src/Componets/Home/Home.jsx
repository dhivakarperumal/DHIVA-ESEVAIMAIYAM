import { Link } from "react-router-dom";
import {
  ArrowDown,
  ArrowRight,
  BadgeCheck,
  FileCheck2,
  Fingerprint,
  Headset,
  Landmark,
  Printer,
  ShieldCheck,
  Smartphone,
  Upload,
  Zap,
} from "lucide-react";

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
      <section className="relative isolate overflow-hidden border-b border-primary/20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_78%_42%,rgba(248,116,14,0.22),transparent_42%),linear-gradient(115deg,#080a0d_0%,#11100e_55%,#090a0c_100%)]" />
        <div className="absolute -right-36 top-10 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl" />

        <div className="mx-auto grid min-h-[590px] max-w-[1700px] items-center gap-12 px-[6%] py-16 sm:px-[5%] lg:grid-cols-[1.05fr_0.95fr] lg:px-[3%] lg:py-20">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/10 px-4 py-2 text-xs font-semibold tracking-wide text-orange-200 sm:text-sm">
              <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_12px_#f8740e]" />
              DIGITAL SERVICES FOR A BRIGHTER TOMORROW
            </div>

            <h1 className="text-5xl font-black leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              DHIVA
              <span className="mt-2 block text-primary">E-SEVAI MAIYAM</span>
            </h1>

            <h2 className="mt-6 text-xl font-semibold text-white sm:text-2xl">
              All Government Services Under One Roof
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Get help with government applications, certificates, document
              uploads and digital services — with friendly support at every
              step.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-white shadow-[0_8px_24px_rgba(248,116,14,0.28)] transition hover:-translate-y-0.5 hover:bg-orange-500"
              >
                Apply Now <ArrowRight size={17} />
              </Link>
              <button
                type="button"
                onClick={() =>
                  document
                    .getElementById("popular-services")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-primary/70 bg-black/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/10"
              >
                Explore Services <ArrowDown size={16} className="text-primary" />
              </button>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-slate-200 sm:text-sm">
              <span className="inline-flex items-center gap-2">
                <Zap size={16} className="text-primary" /> Fast service
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-400" /> Secure
                documents
              </span>
              <span className="inline-flex items-center gap-2">
                <Headset size={16} className="text-amber-300" /> Helpful support
              </span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute inset-8 rounded-full bg-primary/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-primary/30 bg-gradient-to-br from-[#1a1713] via-[#101216] to-[#090b0e] p-5 shadow-[0_24px_80px_rgba(0,0,0,0.55)] sm:p-8">
              <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full border border-primary/20" />
              <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full border border-primary/20" />

              <div className="relative flex min-h-[350px] flex-col items-center justify-center">
                <img
                  src="/images/logo.png"
                  alt="Dhiva E-Sevai Maiyam"
                  className="relative z-10 h-48 w-48 object-contain drop-shadow-[0_0_35px_rgba(248,116,14,0.25)] sm:h-60 sm:w-60"
                />
                <div className="mt-4 text-center">
                  <p className="text-xs font-semibold tracking-[0.24em] text-primary">
                    ALL GOVERNMENT & ONLINE SERVICES
                  </p>
                  <p className="mt-2 text-2xl font-bold text-white">
                    Under One Roof
                  </p>
                </div>
              </div>

              <div className="relative grid grid-cols-3 gap-2 border-t border-white/10 pt-4 text-center">
                {[
                  { label: "Quick service", Icon: Zap },
                  { label: "Trusted help", Icon: BadgeCheck },
                  { label: "Document upload", Icon: Upload },
                ].map(({ label, Icon }) => (
                  <div key={label} className="flex flex-col items-center gap-2 px-1">
                    <Icon size={20} className="text-primary" />
                    <span className="text-[10px] font-medium text-slate-300 sm:text-xs">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

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
    </main>
  );
};

export default Home;
