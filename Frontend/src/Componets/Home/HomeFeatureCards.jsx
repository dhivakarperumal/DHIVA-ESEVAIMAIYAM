import { BadgeCheck, Headset, ShieldCheck, Zap } from "lucide-react";
import PageContainer from "../CommonComponents/PageContainer";

const features = [
  {
    title: "High-Quality Service",
    description:
      "Reliable, accurate, and professional government documentation services.",
    highlight: "Trusted Service",
    Icon: BadgeCheck,
  },
  {
    title: "Customer Support",
    description:
      "Get assistance and guidance with your applications from our support team.",
    highlight: "Here to Help",
    Icon: Headset,
  },
  {
    title: "Fast & Easy Processing",
    description:
      "Quick application assistance with a simple, hassle-free process.",
    highlight: "Save Your Time",
    Icon: Zap,
  },
  {
    title: "Safe & Secure Documents",
    description:
      "We handle personal documents carefully, with privacy and security in mind.",
    highlight: "Privacy First",
    Icon: ShieldCheck,
  },
];

const HomeFeatureCards = () => (
  <section
    aria-labelledby="home-features-heading"
    className="border-b border-white/5 bg-[#080b0e] py-10 text-white sm:py-14"
  >
    <PageContainer>
      <div className="mb-7 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
          What you can expect
        </p>
        <h2
          id="home-features-heading"
          className="mt-2 text-2xl font-black text-white sm:text-3xl"
        >
          Service You Can Rely On
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {features.map(({ title, description, highlight, Icon }) => (
          <article
            key={title}
            className="group flex h-full flex-col rounded-2xl border border-white/10 bg-[#101419] p-5 shadow-lg shadow-black/10 transition duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-[#14181d] hover:shadow-primary/10 sm:p-6"
          >
            <div className="flex items-center justify-between gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/25 bg-primary/15 text-primary transition group-hover:bg-primary group-hover:text-white">
                <Icon size={23} strokeWidth={1.9} aria-hidden="true" />
              </span>
              <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-[10px] font-bold text-orange-200 sm:text-xs">
                {highlight}
              </span>
            </div>
            <h3 className="mt-5 text-base font-bold leading-6 text-white sm:text-lg">
              {title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
              {description}
            </p>
          </article>
        ))}
      </div>
    </PageContainer>
  </section>
);

export default HomeFeatureCards;
