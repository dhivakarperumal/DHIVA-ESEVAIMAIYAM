import { Clock3, Globe, MapPin, Mail, MessageCircle, Phone, Play, Send } from "lucide-react";
import PageContainer from "./PageContainer";

const Header = () => {
  const socialLinks = [
    { Icon: Globe, label: "Facebook", href: "#" },
    { Icon: Send, label: "Twitter", href: "#" },
    { Icon: MessageCircle, label: "Instagram", href: "#" },
    { Icon: Play, label: "YouTube", href: "#" },
  ];

  return (
    <header className="bg-primary text-white">
      <PageContainer className="flex flex-wrap items-center justify-between gap-2 py-2.5">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-200 sm:text-xs">
          <span className="inline-flex items-center gap-2">
            <MapPin size={14} className="text-white/80" />
            Your Town, Tamil Nadu, India
          </span>

          <span className="hidden items-center gap-2 md:inline-flex">
            <Clock3 size={14} className="text-white/80" />
            Mon - Sat: 9:00 AM - 8:00 PM · Sun: 9:00 AM - 1:00 PM
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-[11px] font-medium text-slate-200 sm:text-xs">
          <a href="tel:+919876543210" className="inline-flex items-center gap-2 transition hover:text-white">
            <Phone size={14} className="text-white/80" />
            +91 98765 43210
          </a>

          <a href="mailto:dhivakar305@gmail.com" className="hidden items-center gap-2 transition hover:text-white md:inline-flex">
            <Mail size={14} className="text-white/80" />
            dhivakar305@gmail.com
          </a>
        </div>

        <div className="ml-auto flex items-center gap-2 text-slate-200">
          {socialLinks.map(({ Icon, label, href }) => (
            <a
              key={label}
              href={href}
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