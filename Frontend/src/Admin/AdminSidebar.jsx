import { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Settings,
  X,
  ChevronDown,
  ChevronLeft,
  RefreshCcw,
  FileText,
  CreditCard,
  Briefcase,
  Megaphone,
  MonitorSmartphone,
  ShieldCheck,
  FolderKanban,
  ClipboardList,
  BarChart3,
  Receipt,
  Wallet,
  Server
} from "lucide-react";

import { useAuth } from "../PrivateRouter/AuthContext";

/* ================= NAV ITEMS ================= */
const navItems = [
  {
    path: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    exact: true,
  },
  {
    path: "/admin/user-management",
    label: "User Management",
    icon: Users,
  },
  {
    label: "Service Management",
    icon: ClipboardList,
    children: [
      { path: "/admin/service-management/all", label: "All Services" },
      
      { path: "/admin/service-management/categories", label: "Service Categories" },
      { path: "/admin/service-management/documents", label: "Required Documents" },
      { path: "/admin/service-management/charges", label: "Service Charges" },
    ]
  },
  {
    path: "/admin/applications",
    label: "Applications",
    icon: FolderKanban,
  },
  {
    path: "/admin/payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    path: "/admin/certificates",
    label: "Certificates",
    icon: FileText,
  },
  {
    label: "Expense Tracking",
    icon: Briefcase,
    isNew: true,
    children: [
      { path: "/admin/expense-management/dashboard", label: "Dashboard", icon: BarChart3 },
      { path: "/admin/expense-management/add", label: "Add Expense", icon: FileText },
      { path: "/admin/expense-management/all", label: "All Expenses", icon: Receipt },
      { path: "/admin/expense-management/categories", label: "Categories", icon: FolderKanban },
      { path: "/admin/expense-management/vendors", label: "Vendors", icon: Users },
      { path: "/admin/expense-management/recurring", label: "Recurring", icon: RefreshCcw },
      { path: "/admin/expense-management/reports", label: "Reports", icon: BarChart3 },
      { path: "/admin/expense-management/cash-closing", label: "Cash Closing", icon: Wallet },
    ],
  },
 

  {
    path: "/admin/equipment-management",
    label: "Equipment Management",
    icon: MonitorSmartphone,
  },
   {
    path: "/admin/reports",
    label: "Reports",
    icon: BarChart3,
  },

];

/* ================= SIDEBAR ================= */
const Sidebar = ({ isOpen, onClose, collapsed, onToggleCollapse }) => {
  const { userProfile } = useAuth();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(null);

  /* ===== AUTO OPEN DROPDOWN WHEN CHILD ACTIVE ===== */
  useEffect(() => {
    navItems.forEach((item) => {
      if (item.children) {
        const isChildActive = item.children.some((child) =>
          location.pathname === child.path || location.pathname.startsWith(child.path + "/")
        );
        if (isChildActive) setOpenMenu(item.label);
      }
    });
  }, [location.pathname]);

  const isRouteActive = (path) => {
    if (path === "/admin" || path === "/") return location.pathname === path;
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  const toggleMenu = (label) => setOpenMenu(openMenu === label ? null : label);

  return (
    <>
      {/* ========== MOBILE OVERLAY ========== */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity ${
          isOpen ? "opacity-100 visible" : "opacity-0 invisible"
        }`}
      />

      {/* ========== SIDEBAR ========== */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full flex flex-col
          bg-[#0d0d12] border-r border-white/10
          shadow-[4px_0_30px_rgba(0,0,0,0.5)]
          transition-all duration-300
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
          ${collapsed ? "w-[80px]" : "w-[280px] lg:w-[304px]"}
        `}
      >
        {/* ========== LOGO ========== */}
        <div className={`flex items-center gap-3 shrink-0 border-b border-white/10 ${collapsed ? "px-3 py-6 justify-center" : "px-4 py-5 lg:px-6 lg:py-6"}`}>
          <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-[#f8740e] flex items-center justify-center shrink-0">
            <span className="text-white font-black text-xl lg:text-2xl leading-none">D</span>
          </div>

          {!collapsed && (
            <div className="flex-1 min-w-0">
              <h1 className="text-base lg:text-lg font-black text-white leading-tight tracking-wide truncate">
                E SEVAI MAIYAM
              </h1>
              <p className="text-[10px] lg:text-xs text-white/50 font-bold uppercase tracking-widest mt-0.5 truncate">
                Admin Portal
              </p>
            </div>
          )}

          <button
            onClick={onClose}
            className="ml-auto p-1.5 rounded-lg text-white/40 hover:bg-white/10 lg:hidden shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ========== NAVIGATION ========== */}
        <nav className="flex-1 px-4 py-2 space-y-1.5 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;

            /* ===== DROPDOWN ITEM ===== */
            if (item.children) {
              const isMenuOpen = openMenu === item.label;
              const isAnyChildActive = item.children.some((c) => isRouteActive(c.path));

              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    title={collapsed ? item.label : ""}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                      transition-all duration-200 group
                      ${isAnyChildActive
                        ? "bg-[#f8740e] text-white font-medium"
                        : "text-white/60 hover:text-white hover:bg-white/5"
                      }
                    `}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left font-medium flex items-center gap-2">
                          {item.label}
                          {item.isNew && (
                            <span className="bg-white/20 text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">New</span>
                          )}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isMenuOpen ? "rotate-180" : ""
                          }`}
                        />
                      </>
                    )}
                  </button>

                  {/* ===== SUB MENU ===== */}
                  {!collapsed && (
                    <div
                      className={`mt-1 space-y-0.5 overflow-hidden transition-all duration-200 relative ${
                        isMenuOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      {/* Vertical Connecting Line */}
                      <div className="absolute left-[51px] top-5 bottom-5 w-px bg-white/10 z-0"></div>
                      
                      {item.children.map((sub) => {
                        const isActive = isRouteActive(sub.path);
                        return (
                          <NavLink
                            key={sub.path}
                            to={sub.path}
                            onClick={() => isOpen && onClose()}
                            className={`
                              flex items-center gap-3 pl-12 pr-4 py-2.5 rounded-xl text-sm relative z-10
                              transition-all duration-200
                              ${isActive
                                ? "text-[#f8740e] font-semibold bg-[#f8740e]/10"
                                : "text-white/50 hover:text-white hover:bg-white/5"
                              }
                            `}
                          >
                            <span className={`w-2 h-2 rounded-full shrink-0 transition-all ${
                              isActive ? 'bg-[#f8740e] shadow-[0_0_6px_rgba(248,116,14,0.8)]' : 'bg-white/20'
                            }`}></span>
                            <span>{sub.label}</span>
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            /* ===== NORMAL ITEM ===== */
            const isActive = isRouteActive(item.path);
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.exact}
                title={collapsed ? item.label : ""}
                onClick={() => isOpen && onClose()}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm
                  transition-all duration-200
                  ${isActive
                    ? "bg-[#f8740e] text-white font-medium"
                    : "text-white/60 hover:text-white hover:bg-white/5"
                  }
                  ${collapsed ? "justify-center" : ""}
                `}
              >
                <Icon className="w-[18px] h-[18px] shrink-0" />
                {!collapsed && <span className="font-medium">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* ========== COLLAPSE BUTTON ========== */}
        <button
          onClick={onToggleCollapse}
          className="
            hidden lg:flex absolute -right-3 top-1/2 -translate-y-1/2
            w-6 h-6 rounded-full
            bg-[#f8740e] shadow-lg
            items-center justify-center
            text-white hover:scale-110 transition-all
          "
        >
          <ChevronLeft
            className={`w-3.5 h-3.5 transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>

        {/* ========== BOTTOM SECURITY STRIP ========== */}
        {!collapsed && (
          <div className="p-4 shrink-0">
            <div className="flex flex-col p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#f8740e]" />
                <span className="text-sm font-semibold text-white">Secure System</span>
              </div>
              <p className="text-xs text-white/50 mb-3 leading-relaxed">
                Your system is protected and up to date.
              </p>
              <div className="w-fit px-2 py-1 bg-green-500/20 border border-green-500/30 rounded text-[10px] text-green-400 font-bold uppercase tracking-wide">
                Protected
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
