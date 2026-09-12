import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Bell, Settings, User, LogOut, ChevronDown,
  Building2, CalendarDays, LayoutDashboard, Users,
  ClipboardList, FolderKanban, CreditCard, FileText,
  Briefcase, BarChart3, Megaphone, Server, MonitorSmartphone,
  Search, X
} from "lucide-react";
import { useAuth } from "../PrivateRouter/AuthContext";

const pageInfo = {
  "/admin/user-management":         { title: "User Management",        icon: Users },
  "/admin/service-management":      { title: "Service Management",     icon: ClipboardList },
  "/admin/applications":            { title: "Applications",           icon: FolderKanban },
  "/admin/payments":                { title: "Payments",               icon: CreditCard },
  "/admin/certificates":            { title: "Certificates",           icon: FileText },
  "/admin/expenses":                { title: "Expense Management",     icon: Briefcase },
  "/admin/reports":                 { title: "Reports",                icon: BarChart3 },
  "/admin/announcements":           { title: "Notice & Announcements", icon: Megaphone },
  "/admin/center-management":       { title: "Center Management",      icon: Server },
  "/admin/equipment-management":    { title: "Equipment Management",   icon: MonitorSmartphone },
  "/admin/audit-logs":              { title: "Audit Logs",             icon: FileText },
  "/admin/settings":                { title: "Settings",               icon: Settings },
  "/admin":                         { title: "Dashboard",              icon: LayoutDashboard },
};

const searchLinks = [
  { label: "Dashboard",             path: "/admin",                        icon: LayoutDashboard },
  { label: "User Management",       path: "/admin/user-management",        icon: Users },
  { label: "Service Management",    path: "/admin/service-management",     icon: ClipboardList },
  { label: "Applications",          path: "/admin/applications",           icon: FolderKanban },
  { label: "Payments",              path: "/admin/payments",               icon: CreditCard },
  { label: "Certificates",          path: "/admin/certificates",           icon: FileText },
  { label: "Expense Management",    path: "/admin/expenses",               icon: Briefcase },
  { label: "Reports",               path: "/admin/reports",                icon: BarChart3 },
  
  { label: "Equipment Management",  path: "/admin/equipment-management",   icon: MonitorSmartphone },
]

const getPageInfo = (pathname) => {
  const sorted = Object.entries(pageInfo).sort((a, b) => b[0].length - a[0].length);
  for (const [path, info] of sorted) {
    if (pathname === path || pathname.startsWith(path + "/")) return info;
  }
  return { title: "Dashboard", icon: LayoutDashboard };
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good Morning";
  if (h < 17) return "Good Afternoon";
  return "Good Evening";
};

const Header = ({ onMenuClick }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchQuery, setSearchQuery]       = useState("");
  const [searchFocused, setSearchFocused]   = useState(false);

  const dropdownRef = useRef(null);
  const searchRef   = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();
  const { profileName, role, email, logout } = useAuth();

  const userName = profileName || "Admin";
  const userRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Super Admin";

  const { title: pageTitle, icon: PageIcon } = getPageInfo(location.pathname);

  const filteredLinks = searchLinks.filter((l) =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* click outside — close dropdowns */
  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target))
        setActiveDropdown(null);
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchFocused(false);
        setSearchQuery("");
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const toggle = (name) => setActiveDropdown((p) => (p === name ? null : name));
  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchQuery("");
    setSearchFocused(false);
  };

  const showSearchDrop = searchFocused && (searchQuery.length > 0 || true);

  return (
    <header className="sticky top-0 z-30 bg-[#0d0d12] border-b border-white/10">
      <div className="flex items-center justify-between px-4 sm:px-6 h-[72px] gap-4" ref={dropdownRef}>

        {/* ── Left: Page Icon + Title + Greeting ── */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#f8740e]">
            <PageIcon size={20} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-semibold text-white leading-tight">{pageTitle}</h1>
            <p className="text-xs text-white/50 leading-tight mt-0.5">
              Welcome {getGreeting()}, {userName}!
            </p>
          </div>
        </div>



        {/* ── Right: Actions ── */}
        <div className="flex items-center gap-3 shrink-0">



          {/* ── Search Icon (collapsible) ── */}
          <div className="relative" ref={searchRef}>
            <button
              onClick={() => { setSearchFocused((p) => !p); setSearchQuery(""); }}
              className={`flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 ${
                searchFocused
                  ? "bg-[#f8740e]/10 border-[#f8740e]/50 text-[#f8740e]"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
              }`}
            >
              {searchFocused ? <X size={16} /> : <Search size={16} />}
            </button>

            {searchFocused && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#13141a] border border-white/10 rounded-xl shadow-2xl z-50 py-2">
                {/* Input */}
                <div className="px-3 pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2 h-9 px-3 rounded-lg bg-white/5 border border-white/10 focus-within:border-[#f8740e]/50 focus-within:shadow-[0_0_0_2px_rgba(248,116,14,0.1)] transition-all">
                    <Search size={14} className="text-[#f8740e] shrink-0" />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Search pages, services…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="flex-1 bg-transparent text-sm text-white placeholder-white/30 outline-none"
                    />
                    {searchQuery && (
                      <button onClick={() => setSearchQuery("")} className="text-white/30 hover:text-white transition">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Results */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredLinks.length === 0 ? (
                    <p className="px-4 py-4 text-sm text-white/40 text-center">No results found</p>
                  ) : (
                    <>
                      <p className="px-4 pt-2 pb-1 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        {searchQuery ? "Results" : "Quick Links"}
                      </p>
                      {filteredLinks.map(({ label, path, icon: Icon }) => (
                        <button
                          key={path}
                          onClick={() => handleSearchSelect(path)}
                          className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-white/5 transition text-left ${
                            location.pathname === path ? "text-[#f8740e]" : "text-white/70 hover:text-white"
                          }`}
                        >
                          <Icon size={15} className="shrink-0 opacity-60" />
                          {label}
                        </button>
                      ))}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => toggle("notifications")}
              className={`relative flex items-center justify-center w-9 h-9 rounded-xl border transition-all duration-200 ${
                activeDropdown === "notifications"
                  ? "bg-[#f8740e]/10 border-[#f8740e]/50 text-[#f8740e]"
                  : "bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20"
              }`}
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#f8740e] rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-[#0d0d12] shadow-lg">
                8
              </span>
            </button>
            {activeDropdown === "notifications" && (
              <div className="absolute right-0 top-full mt-2 w-72 bg-[#13141a] border border-white/10 rounded-xl shadow-2xl z-50 py-2">
                <div className="px-4 py-2 border-b border-white/10 flex justify-between items-center">
                  <span className="text-sm font-bold text-white">Notifications</span>
                  <span className="text-xs text-[#f8740e] cursor-pointer hover:underline" onClick={() => setActiveDropdown(null)}>Mark all read</span>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  <div className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition cursor-pointer">
                    <p className="text-sm text-white font-medium">New Application Received</p>
                    <p className="text-xs text-white/50 mt-1">Community Certificate – K. Srinivasan</p>
                    <p className="text-[10px] text-[#f8740e] mt-1">10 mins ago</p>
                  </div>
                  <div className="px-4 py-3 border-b border-white/5 hover:bg-white/5 transition cursor-pointer">
                    <p className="text-sm text-white font-medium">Payment Successful</p>
                    <p className="text-xs text-white/50 mt-1">₹500 received for Income Certificate</p>
                    <p className="text-[10px] text-white/30 mt-1">25 mins ago</p>
                  </div>
                  <div className="px-4 py-3 hover:bg-white/5 transition cursor-pointer">
                    <p className="text-sm text-white font-medium">System Update</p>
                    <p className="text-xs text-white/50 mt-1">Server maintenance scheduled tonight.</p>
                    <p className="text-[10px] text-white/30 mt-1">2 hours ago</p>
                  </div>
                </div>
                <div className="px-4 py-2 border-t border-white/10 text-center">
                  <Link to="/admin/notifications" onClick={() => setActiveDropdown(null)} className="text-xs text-white/60 hover:text-white transition">
                    View all notifications
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button
              onClick={() => toggle("profile")}
              className="flex items-center gap-2.5 transition-all duration-200"
            >
              <div className="w-9 h-9 rounded-full overflow-hidden border border-white/20 shrink-0 bg-white/10 flex items-center justify-center">
                <User size={18} className="text-white/60" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">{userName}</p>
                <p className="text-xs text-white/50 leading-none mt-0.5">{userRole}</p>
              </div>
              <ChevronDown size={13} className={`hidden sm:block text-white/40 transition-transform ${activeDropdown === "profile" ? "rotate-180" : ""}`} />
            </button>

            {activeDropdown === "profile" && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-[#13141a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-white/5">
                  <div className="w-10 h-10 rounded-full border border-white/20 shrink-0 bg-white/10 flex items-center justify-center">
                    <User size={20} className="text-white/60" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-sm font-bold text-white truncate">{userName}</p>
                    <p className="text-[10px] text-white/40 truncate">{email || "admin@example.com"}</p>
                  </div>
                </div>
                <div className="p-1.5 space-y-0.5">
                  <Link to="/admin/settings/profile" onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/8 text-sm text-white/80 hover:text-white transition">
                    <User size={15} className="text-white/40" /> Profile
                  </Link>
                  <Link to="/admin/settings" onClick={() => setActiveDropdown(null)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/8 text-sm text-white/80 hover:text-white transition">
                    <Settings size={15} className="text-white/40" /> Settings
                  </Link>
                  <div className="h-px bg-white/10 my-1" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-red-500/15 text-sm text-red-400 hover:text-red-300 transition">
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;
