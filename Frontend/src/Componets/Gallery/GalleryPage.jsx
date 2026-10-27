import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  BriefcaseBusiness,
  CalendarDays,
  Camera,
  FileText,
  HandHelping,
  Image,
  Landmark,
  MapPin,
  Search,
  Users,
  X,
} from "lucide-react";
import PageContainer from "../CommonComponents/PageContainer";

const galleryItems = [
  {
    title: "Our Service Centre",
    description: "A welcoming space for every visitor",
    category: "Our Centre",
    image: "/Hero/Modern Orange-Black Digital Service Center.png",
    imagePosition: "object-center",
    icon: Landmark,
  },
  {
    title: "Reception Area",
    description: "Warm greetings and helpful guidance",
    category: "Our Centre",
    image: "/Hero/Modern DHIVA E-Sevai Reception Center.png",
    imagePosition: "object-center",
    icon: Building2,
  },
  {
    title: "Customer Support",
    description: "Personal help for your applications",
    category: "Customer Support",
    image: "/Hero/DHIVA E-Sevai Maiyam Service Center.png",
    imagePosition: "object-center",
    icon: HandHelping,
  },
  {
    title: "Application Assistance",
    description: "Guidance at every step",
    category: "Services",
    image: "/Hero/Dhiva E-Sevai Maiyam Service Center (1).png",
    imagePosition: "object-center",
    icon: FileText,
  },
  {
    title: "Printing & Scanning",
    description: "Document services, all in one place",
    category: "Facilities",
    image: "/Hero/Modern DHIVA E-Sevai Reception Center.png",
    imagePosition: "object-left",
    icon: BriefcaseBusiness,
  },
  {
    title: "A Comfortable Waiting Area",
    description: "A friendly place to wait and connect",
    category: "Facilities",
    image: "/Hero/DHIVA E-Sevai Modern Service Center.png",
    imagePosition: "object-right",
    icon: Users,
  },
  {
    title: "Document Verification",
    description: "Careful checking for a smooth process",
    category: "Services",
    image: "/Hero/DHIVA E-Sevai Maiyam Service Center.png",
    imagePosition: "object-right",
    icon: FileText,
  },
  {
    title: "Online Services",
    description: "Digital services made easier",
    category: "Services",
    image: "/Hero/Dhiva E-Sevai Maiyam Service Center (1).png",
    imagePosition: "object-right",
    icon: BriefcaseBusiness,
  },
  {
    title: "Customer Interaction",
    description: "Support with care and a personal touch",
    category: "Customer Support",
    image: "/Hero/DHIVA E-Sevai Maiyam Service Center.png",
    imagePosition: "object-left",
    icon: HandHelping,
  },
  {
    title: "Our Achievements",
    description: "Proud to serve our community",
    category: "Events",
    image: "/Hero/Modern Orange-Black Digital Service Center.png",
    imagePosition: "object-right",
    icon: CalendarDays,
  },
  {
    title: "Community Support",
    description: "Here for our neighbours, every day",
    category: "Community",
    image: "/Hero/DHIVA E-Sevai Modern Service Center.png",
    imagePosition: "object-center",
    icon: Users,
  },
  {
    title: "A Better Digital Journey",
    description: "Connecting people to essential services",
    category: "Events",
    image: "/Hero/Dhiva E-Sevai Maiyam Service Center (1).png",
    imagePosition: "object-center",
    icon: Image,
  },
];

const categories = [
  { label: "All", icon: Image },
  { label: "Our Centre", icon: Landmark },
  { label: "Customer Support", icon: Users },
  { label: "Services", icon: FileText },
  { label: "Events", icon: CalendarDays },
  { label: "Community", icon: HandHelping },
  { label: "Facilities", icon: BriefcaseBusiness },
];

function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState(null);

  const visibleItems =
    activeCategory === "All"
      ? galleryItems
      : galleryItems.filter((item) => item.category === activeCategory);

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <section className="relative isolate overflow-hidden border-b border-orange-500/30">
        <img
          src="/Hero/DHIVA E-Sevai Modern Service Center.png"
          alt=""
          className="absolute inset-0 -z-20 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black via-black/85 to-black/35" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/70 via-transparent to-black/15" />

        <PageContainer className="grid min-h-[270px] items-center gap-8 py-9 lg:grid-cols-[1fr_auto]">
          <div className="max-w-3xl">
            <div className="mb-3 flex items-center gap-2 text-sm text-white/70">
              <Link to="/" className="transition hover:text-orange-400">
                Home
              </Link>
              <span>/</span>
              <span className="text-orange-400">Gallery</span>
            </div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">
              Our Gallery
            </p>
            <h1 className="mt-1 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              Moments at
              <span className="block text-white">
                DHIVA <span className="text-orange-500">E-SEVAI MAIYAM</span>
              </span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75">
              Take a look at our service centre, customer support, and the
              digital services we bring to our community.
            </p>

            <div className="mt-5 flex flex-wrap gap-2.5 sm:gap-4">
              {[
                { icon: Camera, value: "150+", label: "Photos" },
                { icon: Users, value: "1000+", label: "Happy Customers" },
                { icon: FileText, value: "5000+", label: "Applications" },
                { icon: MapPin, value: "1", label: "Service Centre" },
              ].map(({ icon: Icon, value, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-2 border-r border-white/20 pr-3 last:border-0 sm:pr-5"
                >
                  <Icon size={22} className="shrink-0 text-orange-500" />
                  <span>
                    <strong className="block text-sm leading-4">{value}</strong>
                    <span className="text-[10px] text-white/70">{label}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <blockquote className="hidden max-w-48 rounded-2xl border border-orange-500/40 bg-black/55 px-5 py-4 text-sm leading-6 shadow-[0_0_35px_rgba(249,115,22,0.12)] lg:block">
            <span className="block text-4xl font-black leading-5 text-orange-500">
              “
            </span>
            Serving our community with digital solutions
            <span className="mt-2 block text-right text-4xl font-black leading-5 text-orange-500">
              ”
            </span>
          </blockquote>
        </PageContainer>
      </section>

      <section
        aria-label="Gallery categories"
        className="border-b border-white/10 bg-[#090909]"
      >
        <PageContainer className="flex gap-2 overflow-x-auto py-3">
          {categories.map(({ label, icon: Icon }) => {
            const isActive = activeCategory === label;

            return (
              <button
                key={label}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveCategory(label)}
                className={`inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border px-4 py-2 text-xs font-semibold transition ${
                  isActive
                    ? "border-orange-500 bg-orange-500 text-black shadow-[0_5px_18px_rgba(249,115,22,0.25)]"
                    : "border-white/10 bg-white/[0.03] text-white/80 hover:border-orange-500/50 hover:text-orange-300"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            );
          })}
        </PageContainer>
      </section>

      <section>
        <PageContainer className="py-6 sm:py-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500">
              A glimpse of what we do
            </p>
            <h2 className="mt-1 text-xl font-bold sm:text-2xl">
              {activeCategory === "All" ? "Life at DHIVA" : activeCategory}
            </h2>
          </div>
          <span className="text-xs text-white/50">
            {visibleItems.length} moments
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="group relative isolate aspect-[1.72] overflow-hidden rounded-xl border border-white/10 bg-[#151515] shadow-lg"
              >
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className={`absolute inset-0 -z-20 h-full w-full object-cover ${item.imagePosition} transition duration-500 group-hover:scale-105`}
                />
                <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                  <div className="min-w-0">
                    <span className="mb-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-orange-300">
                      <Icon size={11} />
                      {item.category}
                    </span>
                    <h3 className="truncate text-sm font-bold">{item.title}</h3>
                    <p className="truncate text-[10px] text-white/70">
                      {item.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    aria-label={`View ${item.title}`}
                    onClick={() => setSelectedImage(item)}
                    className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-black transition hover:bg-orange-400 focus:outline-none focus:ring-2 focus:ring-white"
                  >
                    <Search size={15} />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        </PageContainer>
      </section>

      <section className="relative isolate overflow-hidden bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400">
        <img
          src="/Hero/Modern DHIVA E-Sevai Reception Center.png"
          alt=""
          className="absolute inset-0 -z-10 h-full w-full object-cover opacity-20 mix-blend-multiply"
        />
        <PageContainer className="flex flex-col items-start justify-between gap-4 py-7 sm:flex-row sm:items-center">
          <div>
            <h2 className="text-2xl font-extrabold text-black sm:text-3xl">
              Be a Part of Our Journey
            </h2>
            <p className="mt-1 text-sm text-black/80">
              See how we make digital services simple, faster and easier for
              everyone.
            </p>
          </div>
          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-black px-5 py-3 text-xs font-bold text-white transition hover:bg-[#171717]"
          >
            Visit Our Centre
            <ArrowRight size={16} />
          </Link>
        </PageContainer>
      </section>

      {selectedImage && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={selectedImage.title}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            aria-label="Close image"
            onClick={() => setSelectedImage(null)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-orange-500 hover:text-black"
          >
            <X size={20} />
          </button>
          <figure
            className="w-full max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            <img
              src={selectedImage.image}
              alt={selectedImage.title}
              className="max-h-[78vh] w-full rounded-xl object-contain"
            />
            <figcaption className="pt-3 text-center">
              <span className="font-semibold">{selectedImage.title}</span>
              <span className="ml-2 text-sm text-white/60">
                {selectedImage.description}
              </span>
            </figcaption>
          </figure>
        </div>
      )}
    </main>
  );
}

export default GalleryPage;
