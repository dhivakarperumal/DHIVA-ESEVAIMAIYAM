import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  FileBadge,
  FileCheck2,
  FileText,
  Fingerprint,
  GraduationCap,
  Landmark,
  MapPinned,
  MessageCircle,
  Printer,
  Search,
  ShieldCheck,
  UsersRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";
import { CONTACT_WHATSAPP_NUMBER } from "../../contactInfo";

const categories = [
  { name: "All Services", Icon: BriefcaseBusiness },
  { name: "Certificates", Icon: FileBadge },
  { name: "Land Records", Icon: Landmark },
  { name: "Identity Services", Icon: Fingerprint },
  { name: "Ration & Family", Icon: UsersRound },
  { name: "Financial Services", Icon: Banknote },
  { name: "Other Services", Icon: CircleHelp },
];

const documentServices = [
  {
    title: "Community Certificate",
    category: "Certificates",
    Icon: UsersRound,
    documents: ["Aadhaar card", "Ration card (family details)", "Address proof", "Passport-size photo", "Application form"],
  },
  {
    title: "Income Certificate",
    category: "Certificates",
    Icon: FileBadge,
    documents: ["Aadhaar card", "Ration card", "Address proof", "Salary proof / income proof", "Passport-size photo"],
  },
  {
    title: "Nativity Certificate",
    category: "Certificates",
    Icon: BadgeCheck,
    documents: ["Aadhaar card", "Birth certificate / SSLC certificate", "Ration card", "Address proof", "Passport-size photo"],
  },
  {
    title: "Residence Certificate",
    category: "Certificates",
    Icon: ShieldCheck,
    documents: ["Aadhaar card", "Ration card", "Address proof", "Utility bill / rental agreement", "Passport-size photo"],
  },
  {
    title: "Caste Certificate",
    category: "Certificates",
    Icon: FileCheck2,
    documents: ["Aadhaar card", "Ration card", "Community proof", "Address proof", "Passport-size photo"],
  },
  {
    title: "First Graduate Certificate",
    category: "Certificates",
    Icon: GraduationCap,
    documents: ["Aadhaar card", "Educational certificates", "Ration card", "Address proof", "Passport-size photo"],
  },
  {
    title: "Backward Class Certificate",
    category: "Certificates",
    Icon: FileBadge,
    documents: ["Aadhaar card", "Community proof", "Ration card", "Address proof", "Passport-size photo"],
  },
  {
    title: "EWS Certificate",
    category: "Certificates",
    Icon: FileText,
    documents: ["Aadhaar card", "Income proof", "Ration card", "Address proof", "Passport-size photo"],
  },
  {
    title: "Patta / Chitta",
    category: "Land Records",
    Icon: MapPinned,
    documents: ["Aadhaar card", "Land details / survey number", "Previous documents", "Address proof", "Application form"],
  },
  {
    title: "Ration Card Services",
    category: "Ration & Family",
    Icon: FileCheck2,
    documents: ["Aadhaar cards of family members", "Family member details", "Address proof", "Existing ration card (if any)", "Passport-size photo"],
  },
  {
    title: "Voter ID Services",
    category: "Identity Services",
    Icon: Fingerprint,
    documents: ["Aadhaar card", "Address proof", "Age proof (DOB / SSLC)", "Passport-size photo"],
  },
  {
    title: "Aadhaar Services",
    category: "Identity Services",
    Icon: Fingerprint,
    documents: ["Address proof (for address update)", "Identity proof (for identity update)", "Date of birth proof (if required)", "Mobile number for OTP"],
  },
  {
    title: "PAN Card Services",
    category: "Financial Services",
    Icon: Banknote,
    documents: ["Aadhaar card", "Date of birth proof", "Address proof", "Passport-size photo", "Signature"],
  },
  {
    title: "Passport Services",
    category: "Identity Services",
    Icon: BriefcaseBusiness,
    documents: ["Aadhaar card", "Address proof", "Date of birth proof", "Educational proof (if required)", "Passport-size photo"],
  },
  {
    title: "Printing & Scanning",
    category: "Other Services",
    Icon: Printer,
    documents: ["Soft copy (USB / email)", "Original document for comparison", "Photocopy (if required)", "File format: PDF or image"],
  },
  {
    title: "Other Online Services",
    category: "Other Services",
    Icon: LaptopIcon,
    documents: ["Requirements depend on the service", "Aadhaar card", "Address proof", "Relevant documents", "Passport-size photo (if required)"],
  },
];

function LaptopIcon({ size = 24, ...props }) {
  return <FileText size={size} {...props} />;
}

const howToSteps = [
  {
    number: "01",
    title: "Search",
    description: "Find the service you need.",
    Icon: Search,
  },
  {
    number: "02",
    title: "View Documents",
    description: "Check the list of required documents.",
    Icon: FileText,
  },
  {
    number: "03",
    title: "Prepare Documents",
    description: "Bring originals and self-attested copies.",
    Icon: BriefcaseBusiness,
  },
  {
    number: "04",
    title: "Visit Our Centre",
    description: "Submit your documents with the application form.",
    Icon: UsersRound,
  },
  {
    number: "05",
    title: "Get Assistance",
    description: "Our team will guide you through the process.",
    Icon: Check,
  },
];

const DocumentsPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    if (!selectedService) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedService(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedService]);

  const filteredServices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return documentServices.filter((service) => {
      const matchesCategory =
        selectedCategory === "All Services" || service.category === selectedCategory;
      const matchesSearch =
        !query ||
        [service.title, service.category, ...service.documents]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [searchTerm, selectedCategory]);

  return (
    <main className="bg-[#080a0d] text-white">
      <PageContainer className="py-5 sm:py-7">
        <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
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

        <div className="mb-5 grid gap-2 sm:grid-cols-[minmax(0,1fr)_200px]">
          <label className="flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-[#111418] px-3 text-slate-400 transition focus-within:border-primary">
            <Search size={17} />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search service name or document (e.g. income certificate)"
              aria-label="Search service name or required document"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
          <label className="relative flex h-11 items-center rounded-lg border border-white/15 bg-[#111418] px-3 text-sm text-slate-200 focus-within:border-primary">
            <span className="sr-only">Filter by category</span>
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
              className="h-full w-full appearance-none bg-transparent pr-6 text-sm outline-none"
            >
              {categories.map(({ name }) => (
                <option key={name} value={name} className="bg-[#111418]">{name}</option>
              ))}
            </select>
            <ChevronDown size={16} className="pointer-events-none absolute right-3 text-slate-400" />
          </label>
        </div>

        <section aria-labelledby="documents-heading">
          <div className="mb-3">
            <h2 id="documents-heading" className="text-lg font-bold sm:text-xl">
              Document Required for Government Services
            </h2>
            <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-1 w-9 rounded-full bg-primary" />
              Select a service below to view the list of required documents.
            </p>
          </div>

          {filteredServices.length > 0 ? (
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredServices.map(({ title, category, Icon, documents }) => (
                <article
                  key={title}
                  className="flex min-h-[150px] gap-3 rounded-xl border border-primary/25 bg-[#101317] p-3 transition hover:border-primary/60 hover:bg-[#15171a]"
                >
                  <div className="flex h-[118px] w-[76px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-orange-950 via-[#20160f] to-[#090b0d] text-primary">
                    <div className="flex h-[86px] w-[58px] flex-col items-center justify-center gap-2 rounded-md border border-primary/30 bg-black/35 px-2 text-center">
                      <Icon size={29} strokeWidth={1.7} />
                      <span className="line-clamp-2 text-[8px] font-bold leading-3 text-white/90">{title}</span>
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-primary">{category}</span>
                    <h3 className="text-xs font-bold leading-4 text-white">{title}</h3>
                    <ul className="mt-1.5 flex-1 space-y-0.5">
                      {documents.slice(0, 4).map((document) => (
                        <li key={document} className="flex items-start gap-1 text-[10px] leading-3 text-slate-300">
                          <Check size={10} className="mt-0.5 shrink-0 text-primary" />
                          <span className="line-clamp-1">{document}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setSelectedService({ title, category, Icon, documents })}
                      className="mt-2 inline-flex w-fit items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-bold text-white transition hover:bg-orange-500"
                    >
                      View Details <ArrowRight size={12} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-white/10 bg-[#101317] px-4 py-10 text-center">
              <Search size={25} className="mx-auto text-slate-500" />
              <p className="mt-3 font-semibold">No matching services</p>
              <p className="mt-1 text-sm text-slate-400">Try another service name, document or category.</p>
            </div>
          )}
        </section>

        <section className="mt-7" aria-labelledby="how-documents-heading">
          <h2 id="how-documents-heading" className="text-xl font-bold sm:text-2xl">How to Use This Page</h2>
          <p className="mt-1 text-xs text-slate-400">Follow these simple steps to find the required documents.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {howToSteps.map(({ number, title, description, Icon }) => (
              <div key={number} className="rounded-xl border border-white/10 bg-[#101317] p-3.5">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white">{number}</span>
                  <Icon size={23} className="text-primary" />
                </div>
                <h3 className="mt-2 text-xs font-bold">{title}</h3>
                <p className="mt-1 text-[11px] leading-4 text-slate-400">{description}</p>
              </div>
            ))}
          </div>
        </section>
      </PageContainer>

      <section className="bg-gradient-to-r from-orange-600 via-primary to-amber-500">
        <PageContainer className="flex flex-col gap-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black sm:text-3xl">Need Help with Documents?</h2>
            <p className="mt-1 text-sm text-white/90">
              Contact DHIVA E-SEVAI MAIYAM for expert guidance and application support.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/contact"
              className="inline-flex min-h-10 items-center gap-2 rounded-full bg-black px-5 py-2 text-sm font-bold text-white transition hover:bg-[#181818]"
            >
              Contact Us <ArrowRight size={16} />
            </Link>
            <a
              href={`https://wa.me/${CONTACT_WHATSAPP_NUMBER}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-white/70 bg-white/10 px-5 py-2 text-sm font-bold text-white transition hover:bg-white/20"
            >
              <MessageCircle size={17} /> Chat on WhatsApp
            </a>
          </div>
        </PageContainer>
      </section>

      {selectedService && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setSelectedService(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="document-dialog-title"
            className="w-full max-w-lg rounded-2xl border border-primary/40 bg-[#111418] p-5 shadow-2xl sm:p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <selectedService.Icon size={23} />
                </span>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-primary">{selectedService.category}</p>
                  <h2 id="document-dialog-title" className="text-lg font-bold">{selectedService.title}</h2>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close document requirements"
                onClick={() => setSelectedService(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              >
                <X size={19} />
              </button>
            </div>
            <p className="mt-4 text-sm text-slate-300">Documents to prepare:</p>
            <ul className="mt-3 space-y-2">
              {selectedService.documents.map((document) => (
                <li key={document} className="flex items-start gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-200">
                  <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                  {document}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-5 text-slate-400">
              Requirements may vary depending on your application. Please bring
              original documents for verification and confirm the latest checklist with our team.
            </p>
            <Link
              to="/contact"
              onClick={() => setSelectedService(null)}
              className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-full bg-primary px-5 py-2 text-sm font-bold text-white transition hover:bg-orange-500"
            >
              Ask for Guidance <ArrowRight size={16} />
            </Link>
          </section>
        </div>
      )}
    </main>
  );
};

export default DocumentsPage;
