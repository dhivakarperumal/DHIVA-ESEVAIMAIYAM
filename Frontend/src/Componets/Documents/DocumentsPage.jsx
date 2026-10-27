import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Banknote,
  BriefcaseBusiness,
  Check,
  ChevronDown,
  CircleHelp,
  FileBadge,
  FileText,
  Fingerprint,
  LayoutGrid,
  Landmark,
  LoaderCircle,
  List,
  MessageCircle,
  Printer,
  Search,
  UsersRound,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import PageContainer from "../CommonComponents/PageContainer";
import { CONTACT_WHATSAPP_NUMBER } from "../../contactInfo";
import api from "../../api";

const categoryIcons = {
  Certificates: FileBadge,
  "Government Applications": Landmark,
  "Land Records": Landmark,
  "Identity Services": Fingerprint,
  "Ration & Family": UsersRound,
  "Financial Services": Banknote,
  "Utility Services": BriefcaseBusiness,
  "Printing & Scanning": Printer,
  "Other Services": CircleHelp,
};

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
  const [documentServices, setDocumentServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Services");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [selectedService, setSelectedService] = useState(null);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get("/services"),
      api.get("/service-documents", { params: { active: "true" } }),
    ])
      .then(([servicesResponse, documentsResponse]) => {
        const services = servicesResponse.data?.data;
        const documents = documentsResponse.data?.data;
        if (servicesResponse.data?.success === false || documentsResponse.data?.success === false ||
            !Array.isArray(services) || !Array.isArray(documents)) {
          throw new Error("The services or document requirements response was invalid.");
        }

        const serviceById = new Map(
          services
            .filter((service) => service.status?.toLowerCase() === "active")
            .map((service) => [String(service.id), service])
        );
        const groupedDocuments = new Map();
        documents.forEach((document) => {
          const service = serviceById.get(String(document.service_id));
          if (!service) return;
          const serviceDocuments = groupedDocuments.get(service.id) || [];
          serviceDocuments.push(document);
          groupedDocuments.set(service.id, serviceDocuments);
        });

        const configuredServices = [...groupedDocuments.entries()]
          .map(([serviceId, serviceDocuments]) => {
            const service = serviceById.get(String(serviceId));
            return {
              id: service.id,
              title: service.service_name,
              category: service.category || "Other Services",
              Icon: categoryIcons[service.category] || BriefcaseBusiness,
              documents: serviceDocuments,
            };
          })
          .sort((first, second) => first.title.localeCompare(second.title));
        if (active) setDocumentServices(configuredServices);
      })
      .catch((error) => {
        if (active) {
          setServicesError(
            error.response?.data?.message || error.message || "Unable to load document requirements."
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

  useEffect(() => {
    if (!selectedService) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setSelectedService(null);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedService]);

  const categories = useMemo(() => [
    { name: "All Services", Icon: BriefcaseBusiness },
    ...[...new Set(documentServices.map((service) => service.category))]
      .sort()
      .map((name) => ({ name, Icon: categoryIcons[name] || CircleHelp })),
  ], [documentServices]);

  const filteredServices = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    return documentServices.filter((service) => {
      const matchesCategory =
        selectedCategory === "All Services" || service.category === selectedCategory;
      const matchesSearch =
        !query ||
        [service.title, service.category, ...service.documents.map((document) => document.document_name)]
          .join(" ")
          .toLowerCase()
          .includes(query);
      return matchesCategory && matchesSearch;
    });
  }, [documentServices, searchTerm, selectedCategory]);

  return (
    <main className="bg-[#080a0d] text-white">
      <PageContainer className="py-5 sm:py-7">
            <div className="mb-8">
            <h2 id="documents-heading" className="text-lg font-bold sm:text-xl">
              Document Required for Government Services
            </h2>
            <p className="mt-1 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-1 w-9 rounded-full bg-primary" />
              Select a service below to view the list of required documents.
            </p>
          </div>

        <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex h-11 w-full items-center gap-2 rounded-lg border border-white/15 bg-[#111418] px-3 text-slate-400 transition focus-within:border-primary sm:max-w-md">
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
          <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center">
            <label className="relative flex h-11 w-full items-center rounded-lg border border-white/15 bg-[#111418] px-3 text-sm text-slate-200 focus-within:border-primary sm:w-[200px] sm:shrink-0">
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
            <div className="flex h-11 self-end rounded-lg border border-white/15 bg-[#111418] p-1 sm:self-auto" role="group" aria-label="Document display mode">
              <button
                type="button"
                aria-label="Card view"
                aria-pressed={viewMode === "cards"}
                onClick={() => setViewMode("cards")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${viewMode === "cards" ? "bg-primary text-white" : "text-slate-300 hover:text-white"}`}
              >
                <LayoutGrid size={15} /> Cards
              </button>
              <button
                type="button"
                aria-label="Table view"
                aria-pressed={viewMode === "table"}
                onClick={() => setViewMode("table")}
                className={`flex items-center gap-1.5 rounded-md px-2.5 text-xs font-semibold transition ${viewMode === "table" ? "bg-primary text-white" : "text-slate-300 hover:text-white"}`}
              >
                <List size={15} /> Table
              </button>
            </div>
          </div>

          
        </div>
         <div className="mb-9 flex gap-2 overflow-x-auto pb-1">
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

        <section aria-labelledby="documents-heading">
     

          {servicesLoading ? (
            <div className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#101317] px-4 py-10 text-sm text-slate-300" role="status">
              <LoaderCircle size={18} className="animate-spin text-primary" />
              Loading document requirements...
            </div>
          ) : servicesError ? (
            <div className="rounded-xl border border-red-500/30 bg-red-950/20 px-4 py-5 text-center" role="alert">
              <p className="font-semibold text-red-200">Unable to load document requirements</p>
              <p className="mt-1 text-sm text-red-100/80">{servicesError}</p>
            </div>
          ) : filteredServices.length > 0 ? viewMode === "cards" ? (
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
              {filteredServices.map(({ id, title, category, Icon, documents }) => (
                <article
                  key={id}
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
                        <li key={document.id} className="flex items-start gap-1 text-[10px] leading-3 text-slate-300">
                          <Check size={10} className="mt-0.5 shrink-0 text-primary" />
                          <span className="line-clamp-1">{document.document_name}</span>
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
            <div className="overflow-x-auto rounded-xl border border-white/10">
              <table className="w-full min-w-[640px] border-collapse text-left">
                <thead className="bg-[#171a1f] text-xs uppercase tracking-wide text-slate-400">
                  <tr>
                    <th scope="col" className="px-4 py-3">Service</th>
                    <th scope="col" className="px-4 py-3">Category</th>
                    <th scope="col" className="px-4 py-3">Documents</th>
                    <th scope="col" className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10 bg-[#101317]">
                  {filteredServices.map(({ id, title, category, Icon, documents }) => (
                    <tr key={id} className="text-sm text-slate-200 transition hover:bg-white/[0.03]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Icon size={18} className="shrink-0 text-primary" />
                          <span className="font-semibold text-white">{title}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{category}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-orange-200">
                          {documents.length}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedService({ title, category, Icon, documents })}
                          className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-bold text-white transition hover:bg-orange-500"
                        >
                          View Details <ArrowRight size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                <li key={document.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2.5 text-sm text-slate-200">
                  <div className="flex items-start gap-2">
                    <Check size={16} className="mt-0.5 shrink-0 text-primary" />
                    <span className="font-medium">{document.document_name}</span>
                    <span className={`ml-auto shrink-0 text-xs ${document.required_status === "Required" ? "text-amber-300" : "text-slate-400"}`}>
                      {document.required_status}
                    </span>
                  </div>
                  <p className="ml-6 mt-1 text-xs text-slate-400">
                    {Array.isArray(document.accepted_formats) && document.accepted_formats.length
                      ? document.accepted_formats.join(", ")
                      : "File formats vary"}{" "}
                    · Max {document.max_file_size || "5 MB"}
                    {Number(document.max_files) > 1 ? ` · Up to ${document.max_files} files` : ""}
                  </p>
                  {(document.conditional_requirement || document.alternative_group || document.document_description) && (
                    <p className="ml-6 mt-1 text-xs leading-5 text-slate-400">
                      {document.conditional_requirement ||
                        (document.alternative_group
                          ? `Alternative document group: ${document.alternative_group}`
                          : document.document_description)}
                    </p>
                  )}
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
