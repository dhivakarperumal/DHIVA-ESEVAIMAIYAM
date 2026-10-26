import { useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Check,
  ClipboardCheck,
  FileBadge,
  FileText,
  Fingerprint,
  Landmark,
  Laptop,
  Lightbulb,
  MapPinned,
  MessageCircle,
  Printer,
  Search,
  ShieldCheck,
  Sparkles,
  UserRoundSearch,
  UsersRound,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";

const categories = [
  { name: "All Services", Icon: Sparkles },
  { name: "Certificates", Icon: FileBadge },
  { name: "Government Applications", Icon: Landmark },
  { name: "Land Records", Icon: MapPinned },
  { name: "Utility Services", Icon: Lightbulb },
  { name: "Printing & Scanning", Icon: Printer },
  { name: "Financial Services", Icon: Banknote },
  { name: "Other Services", Icon: BriefcaseBusiness },
];

const services = [
  {
    title: "Community Certificate",
    category: "Certificates",
    description: "Assistance with community certificate applications and corrections.",
    tasks: ["New application", "Correction", "Status tracking"],
    Icon: UsersRound,
  },
  {
    title: "Income Certificate",
    category: "Certificates",
    description: "Get guidance with income certificate applications and updates.",
    tasks: ["New application", "Duplicate copy", "Status tracking"],
    Icon: FileBadge,
  },
  {
    title: "Nativity Certificate",
    category: "Certificates",
    description: "Support preparing and submitting your nativity certificate request.",
    tasks: ["New application", "Name correction", "Status tracking"],
    Icon: BadgeCheck,
  },
  {
    title: "Residence Certificate",
    category: "Certificates",
    description: "Help with residence proof certificate application support.",
    tasks: ["New application", "Address update", "Status tracking"],
    Icon: ShieldCheck,
  },
  {
    title: "Patta / Chitta",
    category: "Land Records",
    description: "Assistance with Patta, Chitta, Adangal and land record services.",
    tasks: ["Patta application", "Chitta copy", "EC copy"],
    Icon: MapPinned,
  },
  {
    title: "Ration Card Services",
    category: "Government Applications",
    description: "Support with ration card member and address updates.",
    tasks: ["New ration card", "Member addition", "Address change"],
    Icon: ClipboardCheck,
  },
  {
    title: "Voter ID Services",
    category: "Government Applications",
    description: "Assistance with voter ID registration and corrections.",
    tasks: ["New voter ID", "Address change", "Correction"],
    Icon: UserRoundSearch,
  },
  {
    title: "Aadhaar Services",
    category: "Government Applications",
    description: "Guidance with Aadhaar enrolment and available update services.",
    tasks: ["New enrolment", "Address update", "Mobile number update"],
    Icon: Fingerprint,
  },
  {
    title: "PAN Card Services",
    category: "Financial Services",
    description: "Help with PAN card applications and corrections.",
    tasks: ["New PAN card", "Correction", "Reprint"],
    Icon: FileText,
  },
  {
    title: "Passport Services",
    category: "Government Applications",
    description: "Assistance with passport applications and document guidance.",
    tasks: ["New application", "Renewal", "Document support"],
    Icon: BriefcaseBusiness,
  },
  {
    title: "Printing & Scanning",
    category: "Printing & Scanning",
    description: "Convenient printing, scanning and document finishing services.",
    tasks: ["Black & white / colour", "Scanning", "Lamination"],
    Icon: Printer,
  },
  {
    title: "Online & Utility Services",
    category: "Utility Services",
    description: "Support for common online forms and government utility services.",
    tasks: ["Electricity bill payment", "Water bill payment", "Online forms"],
    Icon: Laptop,
  },
  {
    title: "Document Support",
    category: "Other Services",
    description: "Get help understanding, preparing and organising your documents.",
    tasks: ["Document checklist", "Form assistance", "Application guidance"],
    Icon: FileText,
  },
  {
    title: "Application Guidance",
    category: "Other Services",
    description: "Friendly guidance to help you understand the application process.",
    tasks: ["Service guidance", "Application support", "Next-step advice"],
    Icon: MessageCircle,
  },
];

const steps = [
  {
    number: "01",
    title: "Enquire",
    description: "Tell us what service you need at our centre or by phone.",
    Icon: MessageCircle,
  },
  {
    number: "02",
    title: "Document Verification",
    description: "We guide you through the documents required for your service.",
    Icon: FileText,
  },
  {
    number: "03",
    title: "Application Support",
    description: "Our team helps you complete the online application.",
    Icon: Laptop,
  },
  {
    number: "04",
    title: "Track",
    description: "Get help checking the available status of your application.",
    Icon: UserRoundSearch,
  },
  {
    number: "05",
    title: "Completion",
    description: "Receive your certificate or service confirmation.",
    Icon: Check,
  },
];

const benefits = [
  {
    title: "Expert Guidance",
    description: "Step-by-step help across a wide range of services.",
    Icon: UsersRound,
  },
  {
    title: "Fast & Reliable",
    description: "Timely assistance to keep your application moving.",
    Icon: Zap,
  },
  {
    title: "Clear Charges",
    description: "Understand service charges before getting started.",
    Icon: Banknote,
  },
  {
    title: "Friendly Support",
    description: "Dedicated assistance for your questions and needs.",
    Icon: MessageCircle,
  },
];

const ServicePage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredServices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return services.filter((service) => {
      const matchesCategory =
        selectedCategory === "All Services" || service.category === selectedCategory;
      const matchesSearch =
        !query ||
        [service.title, service.category, service.description, ...service.tasks]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  const scrollToServices = () => {
    document.getElementById("services")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bg-[#080a0d] text-white">
      <section className="relative isolate overflow-hidden border-b border-orange-500/30 bg-black">
        <img
          src="/Hero/DHIVA%20E-Sevai%20Maiyam%20Service%20Center.png"
          alt="DHIVA E-Sevai Maiyam service centre"
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/25" />
        <PageContainer className="grid min-h-[390px] items-center gap-8 py-12 sm:min-h-[440px] lg:grid-cols-[minmax(0,1fr)_250px]">
          <div className="max-w-2xl">
            <div className="mb-4 flex items-center gap-2 text-sm text-slate-300">
              <Link to="/" className="transition hover:text-primary">Home</Link>
              <span className="text-primary">›</span>
              <span className="text-white">Services</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary sm:text-sm">
              Our Services
            </p>
            <h1 className="mt-2 text-4xl font-black leading-[1.06] sm:text-5xl lg:text-6xl">
              All Your Digital Services{" "}
              <span className="text-primary">in One Place</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-200 sm:text-base">
              Government applications, certificates, document services, online
              forms and more — with expert guidance and reliable support.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={scrollToServices}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
              >
                Explore Services <ArrowRight size={17} />
              </button>
              <Link
                to="/contact"
                className="inline-flex min-h-11 items-center gap-2 rounded-full border border-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/15"
              >
                Contact Us <ArrowRight size={17} className="text-primary" />
              </Link>
            </div>
          </div>

          <div className="hidden rounded-2xl border border-primary/40 bg-black/60 p-4 backdrop-blur-sm lg:block">
            <p className="mb-3 text-sm font-bold text-white">How we can help</p>
            {["Applications", "Certificates", "Print & Scan", "Online Forms", "Document Support", "Expert Guidance"].map((item) => (
              <div key={item} className="flex items-center gap-2 border-t border-white/10 py-2.5 text-xs text-slate-200">
                <span className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/20 text-primary">
                  <Check size={14} />
                </span>
                {item}
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <PageContainer className="py-7 sm:py-9">
        <section id="services" aria-labelledby="services-heading" className="scroll-mt-24">
          <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary">Explore</p>
              <h2 id="services-heading" className="mt-1 text-2xl font-bold sm:text-3xl">
                Our Services
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                Find the right service and get the help you need.
              </p>
            </div>
            <label className="flex h-11 w-full items-center gap-2 rounded-xl border border-white/15 bg-[#101317] px-3 text-slate-400 transition focus-within:border-primary sm:max-w-xs">
              <Search size={17} />
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search services..."
                aria-label="Search services"
                className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
              />
            </label>
          </div>

          <div className="mb-5 flex gap-2 overflow-x-auto pb-2">
            {categories.map(({ name, Icon }) => {
              const active = selectedCategory === name;
              return (
                <button
                  key={name}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSelectedCategory(name)}
                  className={`flex shrink-0 items-center gap-2 rounded-lg border px-3.5 py-2.5 text-xs font-semibold transition sm:text-sm ${
                    active
                      ? "border-primary bg-primary text-white"
                      : "border-white/10 bg-[#111418] text-slate-300 hover:border-primary/60 hover:text-white"
                  }`}
                >
                  <Icon size={16} />
                  {name}
                </button>
              );
            })}
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {filteredServices.map(({ title, category, description, tasks, Icon }) => (
                <article
                  key={title}
                  className="group flex min-h-[205px] flex-col rounded-xl border border-white/10 bg-[#101317] p-4 transition hover:-translate-y-0.5 hover:border-primary/50 hover:bg-[#15171a]"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-primary/30 bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-white">
                      <Icon size={23} />
                    </span>
                    <div className="min-w-0">
                      <span className="text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {category}
                      </span>
                      <h3 className="mt-0.5 text-sm font-bold leading-5 text-white">{title}</h3>
                    </div>
                  </div>
                  <p className="mt-3 flex-1 text-xs leading-5 text-slate-400">{description}</p>
                  <ul className="mt-2 space-y-1">
                    {tasks.map((task) => (
                      <li key={task} className="flex items-center gap-1.5 text-[11px] text-slate-300">
                        <Check size={12} className="shrink-0 text-primary" />
                        {task}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/contact"
                    className="mt-3 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-orange-500"
                  >
                    Apply Now <ArrowRight size={13} />
                  </Link>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#101317] px-4 py-12 text-center">
              <Search size={26} className="mx-auto text-slate-500" />
              <p className="mt-3 font-semibold text-white">No services found</p>
              <p className="mt-1 text-sm text-slate-400">Try another search or choose a different category.</p>
            </div>
          )}
        </section>

        <section className="mt-10" aria-labelledby="how-heading">
          <div className="mb-5">
            <h2 id="how-heading" className="text-2xl font-bold">How It Works</h2>
            <p className="mt-1 text-sm text-slate-400">A simple process to get your work done.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {steps.map(({ number, title, description, Icon }) => (
              <div key={number} className="relative rounded-xl border border-white/10 bg-[#101317] p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary text-xs font-bold text-primary">
                    {number}
                  </span>
                  <Icon size={22} className="text-primary" />
                </div>
                <h3 className="mt-3 text-sm font-bold">{title}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10" aria-labelledby="why-heading">
          <h2 id="why-heading" className="mb-4 text-2xl font-bold">Why Choose DHIVA?</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map(({ title, description, Icon }) => (
              <div key={title} className="flex items-center gap-3 rounded-xl border border-primary/25 bg-[#101317] p-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                  <Icon size={23} />
                </span>
                <div>
                  <h3 className="text-sm font-bold">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </PageContainer>

      <section className="bg-gradient-to-r from-orange-600 via-primary to-amber-500">
        <PageContainer className="flex flex-col gap-5 py-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Need Help with Any Service?</h2>
            <p className="mt-1 text-sm text-white/90">
              Visit DHIVA E-SEVAI MAIYAM or contact us for friendly guidance.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#181818]"
            >
              Contact Us <ArrowRight size={16} />
            </Link>
            <a
              href="https://wa.me/919876543210"
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/70 bg-white/10 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <MessageCircle size={17} /> Chat on WhatsApp
            </a>
          </div>
        </PageContainer>
      </section>
    </main>
  );
};

export default ServicePage;
