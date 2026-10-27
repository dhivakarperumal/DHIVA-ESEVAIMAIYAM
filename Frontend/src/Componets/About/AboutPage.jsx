import {
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  ClipboardCheck,
  Eye,
  FileCheck2,
  Headphones,
  IndianRupee,
  Laptop,
  Landmark,
  MessageCircle,
  ShieldCheck,
  Target,
  Users,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";

const highlights = [
  { value: "5000+", label: "Applications processed", Icon: FileCheck2 },
  { value: "50+", label: "Government services", Icon: Landmark },
  { value: "100%", label: "Reliable support", Icon: ShieldCheck },
  { value: "One", label: "Place for assistance", Icon: Headphones },
];

const benefits = [
  {
    title: "Expert Guidance",
    description: "Step-by-step support for your applications.",
    Icon: Users,
  },
  {
    title: "Accurate Information",
    description: "Clear, dependable guidance at every step.",
    Icon: ShieldCheck,
  },
  {
    title: "Fast & Reliable",
    description: "Timely help to keep your application moving.",
    Icon: Zap,
  },
  {
    title: "Affordable Service",
    description: "Transparent support for the services you need.",
    Icon: IndianRupee,
  },
  {
    title: "Friendly Support",
    description: "A real team ready to answer your questions.",
    Icon: Headphones,
  },
];

const steps = [
  {
    number: "01",
    title: "Enquiry",
    description: "Tell us what service you need.",
    Icon: MessageCircle,
  },
  {
    number: "02",
    title: "Document Review",
    description: "We help check the required documents.",
    Icon: BookOpenCheck,
  },
  {
    number: "03",
    title: "Application Support",
    description: "Get assistance completing your application.",
    Icon: Laptop,
  },
  {
    number: "04",
    title: "Tracking & Follow-up",
    description: "Stay informed about your application.",
    Icon: ClipboardCheck,
  },
  {
    number: "05",
    title: "Completion",
    description: "Receive guidance on the next steps.",
    Icon: BadgeCheck,
  },
];

const commitments = [
  "People-first service",
  "Honest guidance",
  "Community support",
  "Continuous improvement",
];

const AboutPage = () => {
  return (
    <main className="overflow-hidden bg-[#07090c] text-white">
      <PageContainer className="py-5 sm:py-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {highlights.map(({ value, label, Icon }) => (
            <article
              key={label}
              className="flex min-h-20 items-center gap-3 rounded-xl border border-primary/40 bg-gradient-to-br from-[#17120e] to-[#0c0e11] p-3 sm:p-4"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Icon size={23} />
              </span>
              <span>
                <strong className="block text-xl font-black text-primary sm:text-2xl">
                  {value}
                </strong>
                <span className="text-xs text-slate-300 sm:text-sm">{label}</span>
              </span>
            </article>
          ))}
        </div>
      </PageContainer>

      <section className="border-y border-white/5 bg-[#090b0e] py-10 sm:py-14">
        <PageContainer>
          <div className="grid items-center gap-7 lg:grid-cols-[1.1fr_1fr_0.9fr]">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
                Our story
              </p>
              <h2 className="mt-2 text-3xl font-black sm:text-4xl">
                Here to make services <span className="text-primary">simpler.</span>
              </h2>
              <div className="mt-4 h-1 w-16 rounded-full bg-primary" />
              <h3 className="mt-5 text-lg font-bold text-primary">Our journey</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                DHIVA E-SEVAI MAIYAM was created to help people navigate
                government services with confidence. We provide clear guidance,
                application assistance and document support in one convenient
                place.
              </p>
              <Link
                to="/service"
                className="mt-5 inline-flex items-center gap-2 rounded-full border border-primary px-4 py-2 text-sm font-semibold transition hover:bg-primary"
              >
                Explore our services <ArrowRight size={16} />
              </Link>
            </div>

            <img
              src="/Hero/DHIVA%20E-Sevai%20Modern%20Service%20Center.png"
              alt="Visitors receiving assistance at the DHIVA E-Sevai Maiyam centre"
              loading="lazy"
              className="h-64 w-full rounded-2xl border border-primary/40 object-cover sm:h-80"
            />

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <article className="rounded-xl border border-primary/35 bg-[#111316] p-5">
                <Eye className="text-primary" size={25} />
                <h3 className="mt-3 text-lg font-bold">Our vision</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  To be a trusted digital service centre where everyone can
                  access government services with ease and confidence.
                </p>
              </article>
              <article className="rounded-xl border border-primary/35 bg-[#111316] p-5">
                <Target className="text-primary" size={25} />
                <h3 className="mt-3 text-lg font-bold">Our mission</h3>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  To provide accurate information, reliable support and
                  respectful service to every customer in our community.
                </p>
              </article>
            </div>
          </div>
        </PageContainer>
      </section>

      <section className="py-10 sm:py-14">
        <PageContainer>
          <div className="mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Why choose us
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Support you can count on
            </h2>
            <div className="mt-3 h-1 w-16 rounded-full bg-primary" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {benefits.map(({ title, description, Icon }) => (
              <article
                key={title}
                className="rounded-xl border border-primary/35 bg-gradient-to-br from-[#15120f] to-[#0b0d10] p-4"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon size={23} />
                </span>
                <h3 className="mt-4 text-sm font-bold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">
                  {description}
                </p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="border-y border-primary/20 bg-[#090b0e] py-10 sm:py-14">
        <PageContainer>
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
              Our service process
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Clear steps, helpful support
            </h2>
            <p className="mt-2 text-sm text-slate-400">
              We guide you through the process from your first enquiry to completion.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(({ number, title, description, Icon }) => (
              <article
                key={number}
                className="relative rounded-xl border border-primary/35 bg-[#101215] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-black">
                    {number}
                  </span>
                  <Icon className="text-primary" size={24} />
                </div>
                <h3 className="mt-4 text-sm font-bold">{title}</h3>
                <p className="mt-2 text-xs leading-5 text-slate-400">{description}</p>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="py-8 sm:py-10">
        <PageContainer>
          <div className="grid overflow-hidden rounded-2xl border border-primary/40 bg-primary md:grid-cols-[0.8fr_1.6fr]">
            <div className="flex flex-col items-start justify-center p-6 sm:p-8">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-black/75">
                Your digital service partner
              </p>
              <h2 className="mt-2 text-2xl font-black leading-tight text-[#111] sm:text-3xl">
                Get support at every step.
              </h2>
              <p className="mt-3 text-sm leading-6 text-black/80">
                From certificates and online forms to printing and scanning,
                we are ready to help.
              </p>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#080a0d] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-black/75"
              >
                Visit or contact us <ArrowRight size={16} />
              </Link>
            </div>
            <img
              src="/Hero/Dhiva%20E-Sevai%20Maiyam%20Service%20Center%20(1).png"
              alt="Customers being welcomed at the DHIVA digital service centre"
              loading="lazy"
              className="h-56 w-full object-cover sm:h-72 md:h-full"
            />
          </div>
        </PageContainer>
      </section>

      <section className="pb-10 sm:pb-14">
        <PageContainer>
          <div className="grid items-center gap-6 rounded-2xl border border-primary/30 bg-[#101215] p-5 sm:p-7 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="text-2xl font-black sm:text-3xl">Our commitment</h2>
              <p className="mt-2 text-sm text-slate-400">
                Dependable service built around the needs of our community.
              </p>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {commitments.map((commitment) => (
                  <li key={commitment} className="flex items-center gap-2 text-sm text-slate-200">
                    <BadgeCheck size={18} className="shrink-0 text-primary" />
                    {commitment}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-primary/30 bg-gradient-to-br from-[#21170f] to-[#0b0d10] p-5 sm:p-6">
              <h3 className="text-xl font-black">Let’s get started</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Tell us what you need and our team will help you find the right
                service.
              </p>
              <Link
                to="/contact"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                Contact Us <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </PageContainer>
      </section>
    </main>
  );
};

export default AboutPage;
