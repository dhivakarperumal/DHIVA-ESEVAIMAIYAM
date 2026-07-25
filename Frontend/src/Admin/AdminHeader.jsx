import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import {
  Menu, Bell, Settings, User, LogOut, ChevronDown,
  Building2, CalendarDays, LayoutDashboard, Users,
  ClipboardList, FolderKanban, CreditCard, FileText,
  Briefcase, BarChart3, Megaphone, Server, MonitorSmartphone
} from "lucide-react";
import { useAuth } from "../PrivateRouter/AuthContext";

const pageInfo = {
  "/admin/user-management":         { title: "User Management",       icon: Users },
  "/admin/service-management":      { title: "Service Management",    icon: ClipboardList },
  "/admin/applications":            { title: "Applications",          icon: FolderKanban },
  "/admin/payments":                { title: "Payments",              icon: CreditCard },
  "/admin/certificates":            { title: "Certificates",          icon: FileText },
  "/admin/expenses":                { title: "Expense Management",    icon: Briefcase },
  "/admin/reports":                 { title: "Reports",               icon: BarChart3 },
  "/admin/announcements":           { title: "Notice & Announcements",icon: Megaphone },
  "/admin/center-management":       { title: "Center Management",     icon: Server },
  "/admin/equipment-management":    { title: "Equipment Management",  icon: MonitorSmartphone },
  "/admin/audit-logs":              { title: "Audit Logs",            icon: FileText },
  "/admin/settings":                { title: "Settings",              icon: Settings },
  "/admin":                         { title: "Dashboard",             icon: LayoutDashboard },
};

const getPageInfo = (pathname) => {
  const sorted = Object.entries(pageInfo).sort((a, b) => b[0].length - a[0].length);
  for (const [path, info] of sorted) {
    if (pathname === path || pathname.startsWith(path + "/")) return info;
  }
  return { title: "Dashboard", icon: LayoutDashboard };
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good Morning';
  if (h < 17) return 'Good Afternoon';
  return 'Good Evening';
};

const Header = ({ onMenuClick }) => {
  const [activeDropdown, setActiveDropdown] = useState(null);
  
  const dropdownRef = useRef(null);

  const navigate  = useNavigate();
  const location  = useLocation();
  const { profileName, role, email, logout } = useAuth();

  const userName = profileName || "Admin";
  const userRole = role ? role.charAt(0).toUpperCase() + role.slice(1) : "Super Admin";

  const { title: pageTitle, icon: PageIcon } = getPageInfo(location.pathname);

  /* click outside */
  useEffect(() => {
    const h = (e) => {
      if (activeDropdown && dropdownRef.current && !dropdownRef.current.contains(e.target)) setActiveDropdown(null);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [activeDropdown]);

  const toggle = (name) => setActiveDropdown(p => p === name ? null : name);

  const handleLogout = () => { logout(); navigate("/login", { replace: true }); };

  return (
    <header className="sticky top-0 z-30 bg-[#0d0d12] border-b border-white/10">
      <div className="flex items-center justify-between px-4 sm:px-6 h-[72px]" ref={dropdownRef}>
        
        {/* Left side: Hamburger and Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-[#f8740e]">
            <PageIcon size={20} />
          </div>
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-semibold text-white leading-tight">{pageTitle}</h1>
            <p className="text-xs text-white/50 leading-tight mt-0.5">Welcome {getGreeting()}, {userName}!</p>
          </div>
        </div>

        {/* Right side: Actions */}
        <div className="flex items-center gap-6 shrink-0">
          
          {/* Centre Dropdown */}
          <button className="hidden md:flex items-center gap-2 px-4 h-10 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition text-sm">
            <Building2 size={16} className="text-white/60" />
            <span>TN E-Sevai Centre</span>
            <ChevronDown size={14} className="text-white/40 ml-2" />
          </button>

          {/* Date */}
          <div className="hidden lg:flex items-center gap-2 text-white/60 text-sm">
            <CalendarDays size={16} />
            <span>23 May 2025, Friday</span>
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-white/60 hover:text-white transition">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#f8740e] rounded-full text-[10px] font-bold text-white flex items-center justify-center border-2 border-[#0d0d12]">
              8
            </span>
          </button>

          {/* Profile */}
          <div className="relative ml-2">
            <button
              onClick={() => toggle("profile")}
              className="flex items-center gap-3 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0 bg-white/10 flex items-center justify-center">
                <User size={20} className="text-white/60" />
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-semibold text-white leading-tight">{userName}</p>
                <p className="text-xs text-white/50 leading-none mt-0.5">{userRole}</p>
              </div>
              <ChevronDown size={14} className={`hidden sm:block text-white/40 transition-transform ${activeDropdown === "profile" ? "rotate-180" : ""}`} />
            </button>

            {/* Profile dropdown */}
            {activeDropdown === "profile" && (
              <div className="absolute right-0 top-full mt-3 w-56 bg-[#13141a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-white/5">
                  <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shrink-0 bg-white/10 flex items-center justify-center">
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
