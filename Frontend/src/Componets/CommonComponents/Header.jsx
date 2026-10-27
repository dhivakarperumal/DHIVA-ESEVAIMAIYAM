import { Clock3, MapPin, Mail, Phone } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
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

const Header = () => {
  const tickerContent = (
    <>
      <span className="inline-flex items-center gap-2">
        <MapPin size={14} className="text-white/80" />
        {CONTACT_ADDRESS}
      </span>
      <span className="inline-flex items-center gap-2">
        <Clock3 size={14} className="text-white/80" />
        Mon - Sat: 9:00 AM - 8:00 PM · Sun: 9:00 AM - 1:00 PM
      </span>
    </>
  );

  const socialLinks = [
    { Icon: FaFacebookF, label: "Facebook", href: "https://www.facebook.com/" },
    { Icon: FaInstagram, label: "Instagram", href: "https://www.instagram.com/" },
    { Icon: FaYoutube, label: "YouTube", href: "https://www.youtube.com/" },
    { Icon: FaLinkedinIn, label: "LinkedIn", href: "https://www.linkedin.com/" },
    { Icon: FaWhatsapp, label: "WhatsApp", href: `https://wa.me/${CONTACT_WHATSAPP_NUMBER}` },
  ];

  return (
    <header className="hidden bg-primary text-white sm:block">
      <PageContainer className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 py-2.5 lg:grid-cols-[minmax(0,1fr)_minmax(0,42vw)_minmax(0,1fr)]">
        <div className="flex min-w-0 items-center gap-3 text-[11px] font-medium text-slate-200 sm:text-xs">
          <a href={CONTACT_PHONE_HREF} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap transition hover:text-white">
            <Phone size={14} className="text-white/80" />
            {CONTACT_PHONE_DISPLAY}
          </a>

          <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex min-w-0 items-center gap-2 whitespace-nowrap transition hover:text-white max-[380px]:hidden">
            <Mail size={14} className="shrink-0 text-white/80" />
            {CONTACT_EMAIL}
          </a>
        </div>

        <div
          className="header-marquee-container hidden min-w-0 text-[11px] font-medium text-slate-200 lg:block lg:w-full lg:justify-self-center sm:text-xs"
          role="marquee"
          aria-label={`${CONTACT_ADDRESS}. Mon - Sat: 9:00 AM - 8:00 PM. Sunday: 9:00 AM - 1:00 PM`}
        >
          <div className="header-marquee-track flex w-max whitespace-nowrap">
            <div className="flex shrink-0 items-center gap-8 pr-8">{tickerContent}</div>
            <div aria-hidden="true" className="flex shrink-0 items-center gap-8 pr-8">
              {tickerContent}
            </div>
          </div>
        </div>

        <div className="hidden items-center gap-2 text-slate-200 sm:flex lg:justify-self-end">
          {socialLinks.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noreferrer"
              aria-label={label}
              className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-white/10 bg-white/5 transition hover:border-orange-400 hover:bg-orange-500/20 hover:text-orange-300"
            >
              <Icon size={14} />
            </a>
          ))}
        </div>
      </PageContainer>
    </header>
  );
};

export default Header;