import {
  BadgeCheck,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Headphones,
  IndianRupee,
  Landmark,
  LockKeyhole,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";

const reasons = [
  { label: "Fast & accurate service", Icon: BadgeCheck },
  { label: "Experienced staff", Icon: Users },
  { label: "Secure document handling", Icon: LockKeyhole },
  { label: "Affordable charges", Icon: IndianRupee },
  { label: "Customer support", Icon: Headphones },
  { label: "Trusted by our community", Icon: ShieldCheck },
];

const popularServices = [
  { label: "Community Certificate", Icon: FileCheck2 },
  { label: "Income Certificate", Icon: IndianRupee },
  { label: "Patta / Chitta", Icon: Landmark },
  { label: "Aadhaar Services", Icon: BadgeCheck },
];

const commitments = [
  "Clear guidance through the application process",
  "Careful handling of your documents",
  "Support with online forms and uploads",
];

const centrePhotos = [
  {
    src: "/Hero/DHIVA%20E-Sevai%20Maiyam%20Service%20Center.png",
    alt: "Dhiva E-Sevai Maiyam service centre",
  },
  {
    src: "/Hero/DHIVA%20E-Sevai%20Modern%20Service%20Center.png",
    alt: "Dhiva E-Sevai Maiyam service centre interior",
  },
  {
    src: "/Hero/Modern%20DHIVA%20E-Sevai%20Reception%20Center.png",
    alt: "Dhiva E-Sevai Maiyam reception area",
  },
  {
    src: "/Hero/Modern%20Orange-Black%20Digital%20Service%20Center.png",
    alt: "Dhiva E-Sevai Maiyam digital service centre",
  },
];

const WhyChooseSection = () => {
  return (
    <section className="relative overflow-hidden bg-[#080b0e] py-12 text-white sm:py-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(248,116,14,0.12),transparent_50%)]" />
      <PageContainer className="relative">
        <h2 className="text-center text-2xl font-black sm:text-3xl">
          Why Choose <span className="text-primary">DHIVA</span> E-SEVAI MAIYAM?
        </h2>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-[#0d1115] p-3 sm:grid-cols-3 lg:grid-cols-6">
          {reasons.map(({ label, Icon }) => (
            <div
              key={label}
              className="flex items-center gap-2 rounded-xl border border-white/5 bg-black/20 p-3"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
                <Icon size={18} />
              </span>
              <span className="text-[10px] font-semibold leading-4 text-slate-200 sm:text-xs">
                {label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.05fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-[#0d1115] p-4 sm:p-5">
            <h3 className="text-base font-bold">Popular Services</h3>
            <ul className="mt-3 space-y-2">
              {popularServices.map(({ label, Icon }) => (
                <li key={label}>
                  <Link
                    to="/contact"
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-3 transition hover:border-primary/50 hover:bg-primary/5"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                      <Icon size={19} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-xs font-semibold text-white sm:text-sm">
                        {label}
                      </span>
                      <span className="mt-0.5 block text-[10px] text-slate-400">
                        Get help with your application
                      </span>
                    </span>
                    <CheckCircle2 size={15} className="shrink-0 text-primary" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1115] p-4 sm:p-5">
            <h3 className="text-base font-bold">Our Service Centre</h3>
            <Link
              to="/contact"
              aria-label="Contact Dhiva E-Sevai Maiyam about visiting the service centre"
              className="group mt-3 block overflow-hidden rounded-xl border border-primary/20"
            >
              <img
                src={centrePhotos[0].src}
                alt={centrePhotos[0].alt}
                loading="lazy"
                className="h-44 w-full object-cover transition duration-500 group-hover:scale-105 sm:h-52"
              />
            </Link>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {centrePhotos.slice(1).map(({ src, alt }) => (
                <img
                  key={src}
                  src={src}
                  alt={alt}
                  loading="lazy"
                  className="h-12 w-full rounded-lg border border-white/10 object-cover sm:h-14"
                />
              ))}
              <div className="flex h-12 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary sm:h-14">
                <Clock3 size={19} />
              </div>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              Visit us for helpful support with online applications and
              government services.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0d1115] p-4 sm:p-5">
            <h3 className="text-base font-bold">Our Service Commitment</h3>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              We’re here to make every step of your service request easier.
            </p>
            <ul className="mt-3 space-y-3">
              {commitments.map((commitment) => (
                <li
                  key={commitment}
                  className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/25 p-3"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <CheckCircle2 size={16} />
                  </span>
                  <span className="text-xs leading-5 text-slate-200">{commitment}</span>
                </li>
              ))}
            </ul>
            <Link
              to="/contact"
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-bold text-white transition hover:bg-orange-500"
            >
              Contact Our Team <Headphones size={15} />
            </Link>
          </div>
        </div>
      </PageContainer>
    </section>
  );
};

export default WhyChooseSection;
