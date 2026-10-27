import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Check,
  FileBadge,
  FileText,
  Landmark,
  Laptop,
  Lightbulb,
  LoaderCircle,
  MapPinned,
  MessageCircle,
  Printer,
  Search,
  Sparkles,
  UserRoundSearch,
  UsersRound,
  Zap,
} from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";
import { CONTACT_WHATSAPP_NUMBER } from "../../contactInfo";
import api from "../../api";

const categoryIcons = {
  Certificates: FileBadge,
  "Government Applications": Landmark,
  "Land Records": MapPinned,
  "Utility Services": Lightbulb,
  "Printing & Scanning": Printer,
  "Financial Services": Banknote,
  "Other Services": BriefcaseBusiness,
};

const getDocumentNames = (documents) => {
  if (!Array.isArray(documents)) return [];
  return documents
    .map((document) => (typeof document === "string" ? document : document?.name))
    .filter(Boolean);
};

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
  const [apiServices, setApiServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get("search") ?? "";

  useEffect(() => {
    let active = true;
    api
      .get("/services")
      .then(({ data }) => {
        if (data.success === false || !Array.isArray(data.data)) {
          throw new Error(data.message || "The services response was invalid.");
        }
        if (active) setApiServices(data.data);
      })
      .catch((error) => {
        if (active) {
          setServicesError(
            error.response?.data?.message || error.message || "Unable to load services."
          );
        }
      })
      .finally(() => {
        if (active) setServicesLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const categories = useMemo(() => {
    const availableCategories = [
      ...new Set(
        apiServices
          .filter((service) => service.status?.toLowerCase() === "active")
          .map((service) => service.category)
          .filter(Boolean)
      ),
    ];
    return [
      { name: "All Services", Icon: Sparkles },
      ...availableCategories.map((name) => ({
        name,
        Icon: categoryIcons[name] || BriefcaseBusiness,
      })),
    ];
  }, [apiServices]);

  const filteredServices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return apiServices
      .filter((service) => service.status?.toLowerCase() === "active")
      .map((service) => ({
        id: service.id,
        title: service.service_name,
        category: service.category,
        description:
          service.description ||
          service.document_instructions ||
          "Contact us for assistance with this service.",
        tasks: getDocumentNames(service.required_documents),
        Icon: categoryIcons[service.category] || BriefcaseBusiness,
      }))
      .filter((service) => {
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
  }, [apiServices, searchTerm, selectedCategory]);

  return (
    <main className="bg-[#080a0d] text-white">
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
                onChange={(event) => {
                  const query = event.target.value;
                  setSearchParams((currentParams) => {
                    const nextParams = new URLSearchParams(currentParams);
                    if (query) {
                      nextParams.set("search", query);
                    } else {
                      nextParams.delete("search");
                    }
                    return nextParams;
                  }, { replace: true });
                }}
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

          {servicesLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#101317] px-4 py-12 text-sm text-slate-300">
              <LoaderCircle size={18} className="animate-spin text-primary" />
              Loading services...
            </div>
          ) : servicesError ? (
            <div role="alert" className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-8 text-center">
              <AlertCircle size={24} className="mx-auto text-red-400" />
              <p className="mt-3 font-semibold text-white">Unable to load services</p>
              <p className="mt-1 text-sm text-slate-300">{servicesError}</p>
            </div>
          ) : filteredServices.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {filteredServices.map(({ id, title, category, description, tasks, Icon }) => (
                <article
                  key={id}
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
              href={`https://wa.me/${CONTACT_WHATSAPP_NUMBER}`}
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
