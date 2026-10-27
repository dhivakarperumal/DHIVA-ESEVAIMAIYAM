import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import PageContainer from "./PageContainer";
import { LayoutDashboard, LogOut, Menu, Search, UserRound, X } from "lucide-react";
import { useAuth } from "../../PrivateRouter/AuthContext";
import { isAdminRole } from "../../PrivateRouter/roleUtils";
import logo from "/images/logo.png";

const navItems = [
  { label: "Home", to: "/" },
  { label: "About Us", to: "/about" },
  { label: "Services", to: "/service" },
  { label: "Documents Required", to: "/documents" },
  { label: "Track Application", to: "/track" },
  { label: "Gallery", to: "/gallery" },
  { label: "Contact Us", to: "/contact" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const navigate = useNavigate();
  const { user, profileName, role, email, logout } = useAuth();
  const userName = profileName || user?.username || user?.name || "User";
  const userInitial = userName.trim().charAt(0).toUpperCase() || "U";
  const isAdmin = isAdminRole(role);
  const myAccountPath = "/my-account";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setProfileOpen(false);
    navigate("/login", { replace: true });
  };

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
      <PageContainer className="py-3 !px-3 sm:!px-4 lg:!px-[3%]">
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          <Link to="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-[#0d1218] shadow-[0_0_18px_rgba(248,116,14,0.35)] sm:h-14 sm:w-14">
              <img src={logo} alt="DHIVA E-SEVAI MAIYAM logo" className="h-7 w-7 object-contain sm:h-9 sm:w-9" />
            </div>

            <div className="min-w-0 leading-none">
              <div className="text-xl font-black tracking-tight text-primary sm:text-2xl">DHIVA</div>
              <div className="mt-1 text-[8px] font-semibold tracking-[0.16em] text-white/80 uppercase sm:text-[10px] sm:tracking-[0.22em]">
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

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
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
              className="inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full bg-primary px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_8px_18px_rgba(248,116,14,0.35)] transition hover:scale-[1.02] hover:bg-orange-500 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              Let's Talk
            </Link>

            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  aria-label={`Open ${userName} account menu`}
                  aria-expanded={profileOpen}
                  onClick={() => setProfileOpen((open) => !open)}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-white/15 bg-white/5 p-1 text-white transition hover:border-primary/60 hover:bg-white/10"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white sm:h-9 sm:w-9">
                    {userInitial}
                  </span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full z-50 mt-2 w-60 overflow-hidden rounded-xl border border-white/10 bg-[#0d1218] shadow-xl">
                    <div className="border-b border-white/10 px-4 py-3">
                      <p className="truncate text-sm font-semibold text-white text-capitalize">{userName}</p>
                      {email && <p className="mt-1 truncate text-xs text-white/55">{email}</p>}
                    </div>
                    <div className="p-1.5">
                      <Link
                        to={myAccountPath}
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                      >
                        <UserRound size={15} />
                        My Account
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setProfileOpen(false)}
                          className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                        >
                          <LayoutDashboard size={15} />
                          Admin Panel
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-white/10 p-1.5">
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-white/75 transition hover:bg-white/5 hover:text-white"
                      >
                        <LogOut size={15} />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {!user && (
              <button
                type="button"
                aria-label="Log in"
                title="Log in"
                onClick={() => navigate("/login")}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:border-primary/60 hover:bg-white/10 hover:text-white sm:h-12 sm:w-12"
              >
                <UserRound size={16} />
              </button>
            )}

            <button
              type="button"
              aria-label="Toggle menu"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white lg:hidden sm:h-10 sm:w-10"
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
