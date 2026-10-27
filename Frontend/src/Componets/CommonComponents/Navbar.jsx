import { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import PageContainer from "./PageContainer";
import { Menu, Search, X } from "lucide-react";
import logo from "/images/logo.png";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/service" },
  { label: "Documents Required", to: "/documents" },
  { label: "Track Application", to: "/track" },
  { label: "About Us", to: "/about" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact Us", to: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const handleSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;

    navigate(`/service?search=${encodeURIComponent(query)}`);
    setSearchOpen(false);
    setSearchQuery("");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-primary/30 bg-[#04070b] shadow-[0_8px_24px_rgba(0,0,0,0.25)]">
      <PageContainer className="py-3">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-primary bg-[#0d1218] shadow-[0_0_18px_rgba(248,116,14,0.35)]">
              <img src={logo} alt="DHIVA E-SEVAI MAIYAM logo" className="h-9 w-9 object-contain" />
            </div>

            <div className="leading-none">
              <div className="text-2xl font-black tracking-tight text-primary">DHIVA</div>
              <div className="mt-1 text-[10px] font-semibold tracking-[0.22em] text-white/80 uppercase">
                E-SEVAI MAIYAM
              </div>
            </div>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/80 lg:flex">
            {navItems.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                className={({ isActive }) =>
                  `transition-colors hover:text-primary ${isActive ? "text-primary" : ""}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label={searchOpen ? "Close search" : "Search services"}
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((open) => !open)}
              className="hidden h-11 w-11 items-center justify-center rounded-full border border-primary/70 bg-primary/10 text-primary transition hover:bg-primary hover:text-white md:flex"
            >
              {searchOpen ? <X size={18} /> : <Search size={18} />}
            </button>

            <Link
              to="/contact"
              className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-2.5 text-sm font-bold uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(248,116,14,0.35)] transition hover:scale-[1.02] hover:bg-orange-500"
            >
              Online Application
            </Link>

            <button
              type="button"
              aria-label="Toggle menu"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </PageContainer>

      {searchOpen && (
        <form
          onSubmit={handleSearch}
          className="border-t border-primary/20 bg-[#050a10] px-4 py-4"
          role="search"
        >
          <div className="mx-auto flex max-w-2xl gap-2">
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search services..."
              aria-label="Search services"
              autoFocus
              className="min-w-0 flex-1 rounded-lg border border-white/15 bg-white/5 px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/50 focus:border-primary"
            />
            <button
              type="submit"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
            >
              Search
            </button>
          </div>
        </form>
      )}

      {mobileOpen && (
        <div className="border-t border-primary/20 bg-[#050a10] lg:hidden">
          <div className="flex flex-col gap-2 px-4 py-4 text-sm font-medium text-white/80">
            {navItems.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 transition ${isActive ? "bg-primary/10 text-primary" : "hover:bg-white/5"}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
