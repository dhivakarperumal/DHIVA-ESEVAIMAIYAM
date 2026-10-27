import { Link } from "react-router-dom";
import { Clock3, Mail, MapPin, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import PageContainer from "./PageContainer";
import {
  CONTACT_ADDRESS,
  CONTACT_EMAIL,
  CONTACT_PHONE_DISPLAY,
  CONTACT_PHONE_HREF,
  CONTACT_WHATSAPP_NUMBER,
} from "../../contactInfo";

const quickLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/contact" },
  { label: "Documents Required", to: "/contact" },
  { label: "Track Application", to: "/contact" },
  { label: "About Us", to: "/about" },
  { label: "Contact Us", to: "/contact" },
];

const services = [
  "Community Certificate",
  "Income Certificate",
  "Nativity Certificate",
  "Patta / Chitta",
  "Online Applications",
  "Print / Scan / Xerox",
  "Other Services",
];

const socialLinks = [
  { label: "Facebook", Icon: FaFacebookF, href: "https://www.facebook.com/" },
  { label: "Instagram", Icon: FaInstagram, href: "https://www.instagram.com/" },
  { label: "YouTube", Icon: FaYoutube, href: "https://www.youtube.com/" },
  { label: "WhatsApp", Icon: FaWhatsapp, href: `https://wa.me/${CONTACT_WHATSAPP_NUMBER}` },
];

const Footer = () => {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(CONTACT_ADDRESS)}`;

  return (
    <footer className="border-t border-primary/30 bg-[#05080b] text-white">
      <PageContainer className="py-10 sm:py-12">
        <div className="grid gap-9 sm:grid-cols-2 lg:grid-cols-[1.3fr_0.75fr_0.9fr_1.2fr] lg:gap-10">
          <div>
            <Link to="/" className="inline-flex items-center gap-3">
              <img
                src="/images/logo.png"
                alt=""
                className="h-14 w-14 rounded-full border border-primary/60 object-contain"
              />
              <span className="leading-none">
                <span className="block text-2xl font-black tracking-tight text-white">
                  DHIVA
                </span>
                <span className="mt-1 block text-[10px] font-bold tracking-[0.2em] text-primary">
                  E-SEVAI MAIYAM
                </span>
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-6 text-slate-400">
              Your trusted digital service centre for government certificates,
              online applications, document support and more. Serving the
              people of Tamil Nadu with care.
            </p>
            <div className="mt-5 flex items-center gap-2.5">
              {socialLinks.map(({ label, Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-200 transition hover:border-primary hover:bg-primary hover:text-white"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">Quick Links</h2>
            <ul className="mt-4 space-y-2.5">
              {quickLinks.map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-slate-400 transition hover:text-primary"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">Our Services</h2>
            <ul className="mt-4 space-y-2.5">
              {services.map((service) => (
                <li key={service}>
                  <Link
                    to="/contact"
                    className="text-sm text-slate-400 transition hover:text-primary"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-bold text-white">Contact Us</h2>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href={CONTACT_PHONE_HREF}
                  className="flex items-start gap-3 text-sm text-slate-300 transition hover:text-primary"
                >
                  <Phone size={17} className="mt-0.5 shrink-0 text-primary" />
                  <span>{CONTACT_PHONE_DISPLAY}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="flex items-start gap-3 break-all text-sm text-slate-300 transition hover:text-primary"
                >
                  <Mail size={17} className="mt-0.5 shrink-0 text-primary" />
                  <span>{CONTACT_EMAIL}</span>
                </a>
              </li>
              <li>
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 text-sm leading-6 text-slate-300 transition hover:text-primary"
                >
                  <MapPin size={18} className="mt-0.5 shrink-0 text-primary" />
                  <span>{CONTACT_ADDRESS}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm leading-6 text-slate-300">
                <Clock3 size={17} className="mt-0.5 shrink-0 text-primary" />
                <span>Mon - Sat: 9:00 AM - 8:00 PM<br />Sunday: 9:00 AM - 1:00 PM</span>
              </li>
            </ul>
          </div>
        </div>
      </PageContainer>

      <div className="border-t border-white/10">
        <PageContainer className="flex flex-col gap-3 py-4 text-center text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>© {new Date().getFullYear()} DHIVA E-SEVAI MAIYAM. All rights reserved.</p>
          <Link
            to="/contact"
            className="transition hover:text-primary"
          >
            Contact and support
          </Link>
        </PageContainer>
      </div>
    </footer>
  );
};

export default Footer;
