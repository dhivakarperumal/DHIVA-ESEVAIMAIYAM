import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  AlertTriangle,
  CalendarDays,
  ChevronRight,
  Download,
  Edit2,
  Eye,
  LayoutGrid,
  List,
  MapPin,
  MonitorSmartphone,
  Package,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  Trash2,
  Wrench,
  X,
} from "lucide-react";
import api from "../api";

const API = "/equipment";
const statuses = [
  "Working",
  "Under Maintenance",
  "Damaged",
  "Not Working",
  "Retired",
];
const conditions = ["New", "Good", "Fair", "Poor"];
const categories = [
  "Computer",
  "Laptop",
  "Printer",
  "Photocopier",
  "Scanner",
  "Biometric Device",
  "Power Backup",
  "Router / Network",
  "CCTV / Security",
  "Projector",
  "Furniture",
  "Other",
];
const maintenanceStatuses = ["Scheduled", "In Progress", "Completed", "Cancelled"];
const maintenanceEquipmentStatuses = ["Working", "Under Maintenance", "Damaged", "Not Working", "Retired"];
const pageSizes = [10, 25, 50];
const emptyForm = {
  equipment_name: "",
  category: "",
  asset_id: "",
  brand: "",
  model_number: "",
  serial_number: "",
  quantity: 1,
  purchase_date: "",
  purchase_price: "",
  supplier_name: "",
  invoice_number: "",
  invoice_date: "",
  warranty_start_date: "",
  warranty_end_date: "",
  amc_start_date: "",
  amc_end_date: "",
  service_provider: "",
  service_contact_number: "",
  current_location: "",
  assigned_staff: "",
  department: "",
  status: "Working",
  condition_name: "Good",
  last_maintenance_date: "",
  next_maintenance_date: "",
  maintenance_remarks: "",
  remarks: "",
};
const inputClass =
  "w-full rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2.5 text-sm text-white outline-none transition focus:border-orange-500 placeholder:text-slate-600";
const labelClass = "text-xs font-medium uppercase tracking-wide text-slate-400";
const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(Number(value || 0));
const getLocalDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};
const formatDate = (value) => {
  if (!value || value === "null" || value === "undefined") return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "-"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};
const dateFields = [
  "purchase_date",
  "invoice_date",
  "warranty_start_date",
  "warranty_end_date",
  "amc_start_date",
  "amc_end_date",
  "last_maintenance_date",
  "next_maintenance_date",
];
const normalizeForm = (item) =>
  Object.fromEntries(
    Object.entries({ ...emptyForm, ...item }).map(([key, value]) => [
      key,
      dateFields.includes(key) && value
        ? String(value).slice(0, 10)
        : (value ?? ""),
    ]),
  );
const statusStyle = {
  Working: "border-emerald-400/20 bg-emerald-400/10 text-emerald-300",
  "Under Maintenance": "border-amber-400/20 bg-amber-400/10 text-amber-300",
  Damaged: "border-red-400/20 bg-red-400/10 text-red-300",
  "Not Working": "border-orange-400/20 bg-orange-400/10 text-orange-300",
  Retired: "border-slate-500/30 bg-slate-500/10 text-slate-400",
};

function Section({ title, children }) {
  return (
    <div className="space-y-4">
      <h3 className="border-b border-slate-800 pb-2 text-sm font-semibold text-orange-300">
        {title}
      </h3>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </div>
  );
}
function Field({
  label,
  name,
  form,
  setForm,
  required = false,
  type = "text",
  options,
  span = false,
}) {
  return (
    <label className={`${span ? "sm:col-span-2" : ""} space-y-1.5`}>
      <span className={labelClass}>
        {label}
        {required && <b className="ml-1 text-red-400">*</b>}
      </span>
      {options ? (
        <select
          required={required}
          value={form[name]}
          onChange={(e) =>
            setForm((current) => ({ ...current, [name]: e.target.value }))
          }
          className={inputClass}
        >
          <option value="">Select {label}</option>
          {options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : type === "textarea" ? (
        <textarea
          rows={3}
          value={form[name]}
          onChange={(e) =>
            setForm((current) => ({ ...current, [name]: e.target.value }))
          }
          className={`${inputClass} resize-none`}
        />
      ) : (
        <input
          name={name}
          required={required}
          type={type}
          min={type === "number" ? (name === "quantity" ? "1" : "0") : undefined}
          step={name === "purchase_price" ? "0.01" : name === "quantity" ? "1" : undefined}
          value={form[name]}
          onChange={(e) =>
            setForm((current) => ({ ...current, [name]: e.target.value }))
          }
          className={inputClass}
        />
      )}
    </label>
  );
}

const EquipmentManagement = () => {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [viewMode, setViewMode] = useState("table");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loadError, setLoadError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState("");
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [maintenanceSaving, setMaintenanceSaving] = useState(false);
  const [fileLoading, setFileLoading] = useState("");
  const saveLock = useRef(false);
  const maintenanceLock = useRef(false);
  const [maintenanceForm, setMaintenanceForm] = useState({
    maintenance_date: "",
    issue: "",
    service_provider: "",
    service_cost: "",
    technician: "",
    resolution: "",
    next_service_date: "",
    status: "Completed",
    equipment_status: "",
    remarks: "",
  });
  const loadEquipment = async () => {
    try {
      setLoading(true);
      const response = await api.get(API);
      setEquipment(response.data.data || []);
      setLoadError("");
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load equipment";
      setLoadError(message);
      window.alert(message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    let active = true;
    api.get(API)
      .then((response) => {
        if (!active) return;
        setEquipment(response.data.data || []);
        setLoadError("");
      })
      .catch((error) => {
        if (!active) return;
        const message = error.response?.data?.message || "Unable to load equipment";
        setLoadError(message);
        window.alert(message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);
  const filtered = useMemo(
    () =>
      equipment.filter((item) => {
        const haystack = [
          item.equipment_name,
          item.asset_id,
          item.category,
          item.brand,
          item.model_number,
          item.serial_number,
          item.current_location,
          item.assigned_staff,
          item.department,
        ]
          .join(" ")
          .toLowerCase();
        return (
          haystack.includes(query.toLowerCase()) &&
          (statusFilter === "All" || item.status === statusFilter) &&
          (categoryFilter === "All" || item.category === categoryFilter)
        );
      }),
    [equipment, query, statusFilter, categoryFilter],
  );
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleEquipment = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage, pageSize],
  );
  const categoryOptions = useMemo(
    () => [...new Set([...categories, ...equipment.map((item) => item.category).filter(Boolean)])],
    [equipment],
  );
  const [today] = useState(getLocalDate);
  const warrantyCutoff = new Date(`${today}T00:00:00Z`);
  warrantyCutoff.setUTCDate(warrantyCutoff.getUTCDate() + 90);
  const warrantyCutoffDate = warrantyCutoff.toISOString().slice(0, 10);
  const assetCount = (items) => items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const metrics = [
    {
      label: "Total Assets",
      value: equipment.length,
      icon: Package,
      iconBg: "bg-orange-500",
      detail: `${assetCount(equipment)} total units`,
    },
    {
      label: "Working",
      value: equipment.filter((item) => item.status === "Working").length,
      icon: ShieldCheck,
      iconBg: "bg-emerald-500",
      detail: "Assets in service",
    },
    {
      label: "Under Maintenance",
      value: equipment.filter((item) => item.status === "Under Maintenance").length,
      icon: Wrench,
      iconBg: "bg-amber-500",
      detail: "Active service work",
    },
    {
      label: "Damaged / Not Working",
      value: equipment.filter(
        (item) => item.status === "Damaged" || item.status === "Not Working",
      ).length,
      icon: AlertTriangle,
      iconBg: "bg-red-600",
      detail: "Needs attention",
    },
    {
      label: "Warranty Expiring",
      value: equipment.filter(
        (item) =>
          item.warranty_end_date &&
          String(item.warranty_end_date).slice(0, 10) >= today &&
          String(item.warranty_end_date).slice(0, 10) <= warrantyCutoffDate,
      ).length,
      icon: CalendarDays,
      iconBg: "bg-violet-600",
      detail: "Expires within 90 days",
    },
  ];
  const openDetails = async (item) => {
    setSelected(item);
    setDetailLoading(true);
    setDetailError("");
    setMaintenanceOpen(false);
    setMaintenanceForm({
      maintenance_date: "",
      issue: "",
      service_provider: item.service_provider || "",
      service_cost: "",
      technician: "",
      resolution: "",
      next_service_date: "",
      status: "Completed",
      equipment_status: "",
      remarks: "",
    });
    try {
      const response = await api.get(`${API}/${item.id}`);
      setSelected(response.data.data);
    } catch (error) {
      const message = error.response?.data?.message || "Unable to load equipment details";
      setDetailError(message);
      window.alert(message);
    } finally {
      setDetailLoading(false);
    }
  };
  const saveMaintenance = async (event) => {
    event.preventDefault();
    if (maintenanceLock.current || !selected) return;
    maintenanceLock.current = true;
    setMaintenanceSaving(true);
    try {
      await api.post(`${API}/${selected.id}/maintenance`, maintenanceForm);
      setMaintenanceForm({
        maintenance_date: "",
        issue: "",
        service_provider: "",
        service_cost: "",
        technician: "",
        resolution: "",
        next_service_date: "",
        status: "Completed",
        equipment_status: "",
        remarks: "",
      });
      setMaintenanceOpen(false);
      window.alert("Maintenance record saved successfully");
      try {
        const response = await api.get(`${API}/${selected.id}`);
        setSelected(response.data.data);
        setDetailError("");
      } catch (error) {
        const message = error.response?.data?.message || "Unable to refresh equipment details";
        setDetailError(message);
        window.alert(`Maintenance was saved, but equipment details could not be refreshed: ${message}`);
      }
      await loadEquipment();
    } catch (error) {
      window.alert(error.response?.data?.message || "Unable to save maintenance record");
    } finally {
      maintenanceLock.current = false;
      setMaintenanceSaving(false);
    }
  };
  const downloadEquipmentFile = async (fileType) => {
    if (!selected) return;
    setFileLoading(fileType);
    try {
      const response = await api.get(`${API}/${selected.id}/files/${fileType}`, { responseType: "blob" });
      const fileUrl = URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = selected[fileType] || "equipment-document";
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
    } catch (error) {
      window.alert(error.response?.data?.message || "Unable to download equipment document");
    } finally {
      setFileLoading("");
    }
  };
  const openAdd = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDrawerOpen(true);
  };
  const openEdit = (item) => {
    setForm(normalizeForm(item));
    setEditingId(item.id);
    setSelected(null);
    setDrawerOpen(true);
  };
  const closeDrawer = () => {
    setDrawerOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };
  const saveEquipment = async (event) => {
    event.preventDefault();
    if (saveLock.current) return;
    saveLock.current = true;
    const addAnother = event.nativeEvent.submitter?.name === "addAnother";
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (!["equipment_photo", "purchase_invoice", "warranty_document"].includes(key)) {
          data.append(key, value ?? "");
        }
      });
      ["equipmentPhoto", "purchaseInvoice", "warrantyDocument"].forEach(
        (name) => {
          const file = event.currentTarget.elements[name]?.files?.[0];
          if (file) data.append(name, file);
        },
      );
      if (editingId)
        await api.put(`${API}/${editingId}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      else
        await api.post(API, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      await loadEquipment();
      window.alert(
        editingId
          ? "Equipment updated successfully"
          : "Equipment saved successfully",
      );
      if (addAnother) {
        setForm(emptyForm);
        setEditingId(null);
      } else closeDrawer();
    } catch (error) {
      window.alert(error.response?.data?.message || "Unable to save equipment");
    } finally {
      saveLock.current = false;
      setSaving(false);
    }
  };
  const deleteEquipment = async (item) => {
    if (
      !window.confirm(`Delete ${item.equipment_name}? This cannot be undone.`)
    )
      return;
    try {
      await api.delete(`${API}/${item.id}`);
      setSelected(null);
      loadEquipment();
    } catch (error) {
      window.alert(
        error.response?.data?.message || "Unable to delete equipment",
      );
    }
  };
  const exportCsv = () => {
    const rows = filtered.map((item) => [
      item.equipment_name,
      item.category,
      item.asset_id,
      item.brand,
      item.model_number,
      item.quantity,
      item.status,
      item.current_location,
    ]);
    const csv = [
      [
        "Equipment",
        "Category",
        "Asset ID",
        "Brand",
        "Model",
        "Quantity",
        "Status",
        "Location",
      ],
      ...rows,
    ]
      .map((row) =>
        row
          .map((cell) => {
            const value = String(cell ?? "");
            const safeValue = /^[\t\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
            return `"${safeValue.replaceAll('"', '""')}"`;
          })
          .join(","),
      )
      .join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "equipment-register.csv";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  return (
    <section className="flex flex-col gap-6 p-2 text-white sm:p-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Equipment Management</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Dashboard</span>
            <ChevronRight size={14} className="text-gray-600" />
            <span>Administration</span>
            <ChevronRight size={14} className="text-gray-600" />
            <span className="text-gray-200">Equipment Management</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={loadEquipment}
            disabled={loading}
            className="flex items-center gap-2 rounded-md border border-gray-700 px-4 py-2 text-gray-300 transition-colors hover:border-orange-500/50 hover:text-white disabled:opacity-50"
          >
            <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
            <span>Refresh</span>
          </button>
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 rounded-md border border-orange-500/50 px-4 py-2 text-orange-500 transition-colors hover:bg-orange-500/10"
          >
            <Download size={18} />
            <span>Export</span>
          </button>
          <button
            onClick={openAdd}
            className="flex items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-orange-600"
          >
            <Plus size={18} /> Add Equipment
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="flex items-center gap-4 rounded-xl border border-gray-800 bg-[#1a1c23] p-4"
          >
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${metric.iconBg}`}>
              <metric.icon size={22} className="text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm text-gray-400">{metric.label}</p>
              <p className="truncate text-3xl font-bold leading-tight text-white">{metric.value}</p>
              <p className="mt-0.5 truncate text-xs text-gray-500">{metric.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-stretch gap-3 rounded-xl border border-gray-800 bg-[#1a1c23] p-4 lg:flex-row lg:items-center">
        <div className="relative min-w-0 flex-1 lg:max-w-[520px]">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
          />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
            placeholder="Search equipment by name, asset ID or location..."
            className={`${inputClass} border-gray-800 bg-[#0f1115] pl-10 text-white placeholder-gray-500`}
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 lg:ml-auto lg:flex-nowrap">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={`${inputClass} min-w-0 flex-1 border-gray-800 bg-[#0f1115] text-white lg:w-40 lg:flex-none`}
          >
            <option value="All">All Status</option>
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
            className={`${inputClass} min-w-0 flex-1 border-gray-800 bg-[#0f1115] text-white lg:w-44 lg:flex-none`}
          >
            <option value="All">All Categories</option>
            {categoryOptions.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
      
          <div
            className="flex shrink-0 items-center rounded-lg border border-gray-700 bg-[#0f1115] p-1"
            aria-label="Equipment view mode"
          >
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${viewMode === "card" ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}`}
              aria-pressed={viewMode === "card"}
              title="Card view"
            >
              <LayoutGrid size={16} />
              <span className="hidden sm:inline">Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${viewMode === "table" ? "bg-orange-500 text-white" : "text-gray-400 hover:text-white"}`}
              aria-pressed={viewMode === "table"}
              title="Table view"
            >
              <List size={16} />
              <span className="hidden sm:inline">Table</span>
            </button>
          </div>
        </div>
      </div>
      {viewMode === "card" && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <div className="col-span-full rounded-xl border border-gray-800 bg-[#1a1c23] py-16 text-center text-gray-400">
              <RefreshCcw className="mr-2 inline animate-spin" size={18} /> Loading equipment...
            </div>
          ) : loadError ? (
            <div role="alert" className="col-span-full rounded-xl border border-red-500/30 bg-[#1a1c23] py-10 text-center text-red-300">
              <p>{loadError}</p>
              <button onClick={loadEquipment} className="mt-2 text-sm text-orange-300 hover:underline">Retry</button>
            </div>
          ) : visibleEquipment.map((item, index) => (
            <article key={item.id} className="rounded-xl border border-gray-800 bg-[#1a1c23] p-5 transition-colors hover:border-orange-500/40">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500/10 text-orange-500"><MonitorSmartphone size={20} /></div>
                  <div><p className="text-xs text-gray-500">S No {(currentPage - 1) * pageSize + index + 1}</p><h3 className="font-medium text-white">{item.equipment_name}</h3><p className="text-xs text-orange-300">{item.asset_id}</p></div>
                </div>
                <span className={`rounded border px-2 py-1 text-xs font-medium ${statusStyle[item.status] || statusStyle.Retired}`}>{item.status}</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-800 pt-4 text-sm">
                <div><p className="text-xs text-gray-500">Category</p><p className="mt-1 text-gray-300">{item.category || "-"}</p></div>
                <div><p className="text-xs text-gray-500">Condition</p><p className="mt-1 text-gray-300">{item.condition_name || "-"}</p></div>
                <div><p className="text-xs text-gray-500">Location</p><p className="mt-1 text-gray-300">{item.current_location || "-"}</p></div>
                <div><p className="text-xs text-gray-500">Assigned Staff</p><p className="mt-1 text-gray-300">{item.assigned_staff || "-"}</p></div>
                <div><p className="text-xs text-gray-500">Warranty End</p><p className="mt-1 text-gray-300">{formatDate(item.warranty_end_date)}</p></div>
                <div><p className="text-xs text-gray-500">Quantity</p><p className="mt-1 text-gray-300">{item.quantity || 0}</p></div>
              </div>
              <div className="mt-5 flex justify-end gap-2 border-t border-gray-800 pt-4"><button onClick={() => openDetails(item)} className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white" title="View"><Eye size={16} /></button><button onClick={() => openEdit(item)} className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-orange-300" title="Edit"><Edit2 size={16} /></button><button onClick={() => deleteEquipment(item)} className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-red-400" title="Delete"><Trash2 size={16} /></button></div>
            </article>
          ))}
          {!loading && !loadError && !filtered.length && <div className="col-span-full rounded-xl border border-gray-800 bg-[#1a1c23] py-16 text-center"><Package className="mx-auto mb-3 text-gray-600" size={30} /><p className="text-gray-400">No equipment matches these filters.</p><button onClick={openAdd} className="mt-2 text-sm text-orange-400 hover:underline">Add your first equipment item</button></div>}
        </div>
      )}
      {viewMode === "card" && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-800 bg-[#1a1c23] p-4 text-sm text-gray-400">
          <span>Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} assets</span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs">
              Rows
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded border border-gray-700 bg-[#0f1115] px-2 py-1 text-white">
                {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="rounded border border-gray-700 px-2 py-1 text-xs disabled:opacity-40">Previous</button>
            <span className="text-xs">Page {currentPage} / {pageCount}</span>
            <button onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount} className="rounded border border-gray-700 px-2 py-1 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      )}
      <div
        className={`${viewMode === "table" ? "" : "hidden"} overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c23]`}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1460px] border-collapse text-left text-sm">
            <thead className="border-b border-gray-800 text-sm text-gray-400">
              <tr>
                {[
                  "S No",
                  "Equipment",
                  "Category",
                  "Asset ID",
                  "Brand / Model",
                  "Serial Number",
                  "Qty",
                  "Purchase Date",
                  "Warranty End",
                  "Assigned Staff",
                  "Location",
                  "Condition",
                  "Status",
                  "Actions",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-4 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="14" className="py-16 text-center text-gray-500">
                    <RefreshCcw
                      className="mr-2 inline animate-spin"
                      size={18}
                    />
                    Loading equipment...
                  </td>
                </tr>
              ) : loadError ? (
                <tr>
                  <td colSpan="14" className="py-16 text-center">
                    <p className="text-red-300">{loadError}</p>
                    <button onClick={loadEquipment} className="mt-2 text-sm text-orange-400 hover:underline">Retry</button>
                  </td>
                </tr>
              ) : (
                visibleEquipment.map((item, index) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-800/50 text-gray-300 transition-colors hover:bg-white/[.02]"
                  >
                    <td className="px-4 py-3 text-sm font-medium text-gray-500">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => openDetails(item)}
                        className="flex items-center gap-3 text-left"
                      >
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
                          <MonitorSmartphone size={17} />
                        </span>
                        <span>
                          <b className="block text-white">
                            {item.equipment_name}
                          </b>
                          <small className="text-gray-500">
                            {item.department || "E-Sevai Centre"}
                          </small>
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">{item.category}</td>
                    <td className="px-4 py-3 font-mono text-xs text-orange-300">
                      {item.asset_id}
                    </td>
                    <td className="px-4 py-3">
                      {[item.brand, item.model_number]
                        .filter(Boolean)
                        .join(" / ") || "-"}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs">
                      {item.serial_number || "-"}
                    </td>
                    <td className="px-4 py-3">{item.quantity}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(item.purchase_date)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatDate(item.warranty_end_date)}
                    </td>
                    <td className="px-4 py-3">{item.assigned_staff || "-"}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1">
                        <MapPin size={13} className="text-gray-500" />
                        {item.current_location || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.condition_name || "-"}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${
                          item.status === 'Working' ? 'border-green-500/30 bg-green-500/15 text-green-400' :
                          item.status === 'Under Maintenance' ? 'border-amber-500/30 bg-amber-500/15 text-amber-400' :
                          item.status === 'Damaged' || item.status === 'Not Working' ? 'border-red-500/30 bg-red-500/15 text-red-400' :
                          'border-slate-500/30 bg-slate-500/15 text-slate-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          item.status === 'Working' ? 'bg-green-400' :
                          item.status === 'Under Maintenance' ? 'bg-amber-400' :
                          item.status === 'Damaged' || item.status === 'Not Working' ? 'bg-red-400' :
                          'bg-slate-400'
                        }`} />
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button
                          title="View details"
                          onClick={() => openDetails(item)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          title="Edit equipment"
                          onClick={() => openEdit(item)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-orange-300"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          title="Delete equipment"
                          onClick={() => deleteEquipment(item)}
                          className="rounded-md p-1.5 text-gray-400 transition-colors hover:bg-gray-700 hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
              {!loading && !loadError && !filtered.length && (
                <tr>
                  <td colSpan="14" className="py-16 text-center">
                    <Package className="mx-auto mb-3 text-gray-600" size={30} />
                    <p className="text-gray-400">
                      No equipment matches these filters.
                    </p>
                    <button
                      onClick={openAdd}
                      className="mt-2 text-sm text-orange-500 hover:underline"
                    >
                      Add your first equipment item
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-gray-800 p-4 text-sm text-gray-400">
          <span>
            Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} filtered assets ({equipment.length} total)
          </span>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-xs text-gray-400">
              Rows
              <select value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }} className="rounded border border-gray-700 bg-[#0f1115] px-2 py-1 text-white">
                {pageSizes.map((size) => <option key={size} value={size}>{size}</option>)}
              </select>
            </label>
            <button onClick={() => setPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="rounded border border-gray-700 px-2 py-1 text-xs disabled:opacity-40">Previous</button>
            <span className="text-xs text-gray-400">Page {currentPage} / {pageCount}</span>
            <button onClick={() => setPage(Math.min(pageCount, currentPage + 1))} disabled={currentPage === pageCount} className="rounded border border-gray-700 px-2 py-1 text-xs disabled:opacity-40">Next</button>
          </div>
        </div>
      </div>
      {typeof document !== "undefined" &&
        createPortal(
          <>
            {drawerOpen && (
              <div
                className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                onClick={closeDrawer}
              />
            )}
            <div
              className={`fixed inset-y-0 right-0 z-[70] flex w-full max-w-2xl transform flex-col border-l border-slate-800 bg-slate-900 text-white shadow-2xl transition-transform duration-300 ${drawerOpen ? "translate-x-0" : "translate-x-full"}`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 p-5">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {editingId ? "Edit Equipment" : "Add Equipment"}
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Register an asset and its service details
                  </p>
                </div>
                <button
                  onClick={closeDrawer}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
              <form
                onSubmit={saveEquipment}
                className="flex-1 space-y-7 overflow-y-auto p-5"
              >
                <Section title="Equipment Details">
                  <Field
                    label="Equipment Name"
                    name="equipment_name"
                    form={form}
                    setForm={setForm}
                    required
                  />
                  <Field
                    label="Equipment Category"
                    name="category"
                    form={form}
                    setForm={setForm}
                    required
                    options={categoryOptions}
                  />
                  <Field
                    label="Equipment Code / Asset ID"
                    name="asset_id"
                    form={form}
                    setForm={setForm}
                    required
                  />
                  <Field
                    label="Brand"
                    name="brand"
                    form={form}
                    setForm={setForm}
                  />
                  <Field
                    label="Model Number"
                    name="model_number"
                    form={form}
                    setForm={setForm}
                  />
                  <Field
                    label="Serial Number"
                    name="serial_number"
                    form={form}
                    setForm={setForm}
                  />
                  <Field
                    label="Quantity"
                    name="quantity"
                    form={form}
                    setForm={setForm}
                    required
                    type="number"
                  />
                </Section>
                <Section title="Purchase Details">
                  <Field
                    label="Purchase Date"
                    name="purchase_date"
                    form={form}
                    setForm={setForm}
                    type="date"
                  />
                  <Field
                    label="Purchase Price"
                    name="purchase_price"
                    form={form}
                    setForm={setForm}
                    type="number"
                  />
                  <Field
                    label="Supplier Name"
                    name="supplier_name"
                    form={form}
                    setForm={setForm}
                  />
                  <Field
                    label="Invoice Number"
                    name="invoice_number"
                    form={form}
                    setForm={setForm}
                  />
                  <Field
                    label="Invoice Date"
                    name="invoice_date"
                    form={form}
                    setForm={setForm}
                    type="date"
                  />
                </Section>
                <Section title="Warranty & AMC">
                  <Field
                    label="Warranty Start Date"
                    name="warranty_start_date"
                    form={form}
                    setForm={setForm}
                    type="date"
                  />
                  <Field
                    label="Warranty End Date"
                    name="warranty_end_date"
                    form={form}
                    setForm={setForm}
                    type="date"
                  />
                  <Field
                    label="AMC Start Date"
                    name="amc_start_date"
                    form={form}
                    setForm={setForm}
                    type="date"
                  />
                  <Field
                    label="AMC End Date"
                    name="amc_end_date"
                    form={form}
                    setForm={setForm}
                    type="date"
                  />
                  <Field
                    label="Service Provider"
                    name="service_provider"
                    form={form}
                    setForm={setForm}
                  />
                  <Field
                    label="Service Contact Number"
                    name="service_contact_number"
                    form={form}
                    setForm={setForm}
                  />
                </Section>
                <Section title="Assignment">
                  <Field
                    label="Current Location"
                    name="current_location"
                    form={form}
                    setForm={setForm}
                  />
                  <Field
                    label="Assigned Staff"
                    name="assigned_staff"
                    form={form}
                    setForm={setForm}
                  />
                  <Field
                    label="Department / Centre"
                    name="department"
                    form={form}
                    setForm={setForm}
                  />
                </Section>
                <Section title="Maintenance">
                  <Field
                    label="Status"
                    name="status"
                    form={form}
                    setForm={setForm}
                    options={statuses}
                  />
                  <Field
                    label="Condition"
                    name="condition_name"
                    form={form}
                    setForm={setForm}
                    options={conditions}
                  />
                  <Field
                    label="Last Maintenance Date"
                    name="last_maintenance_date"
                    form={form}
                    setForm={setForm}
                    type="date"
                  />
                  <Field
                    label="Next Maintenance Date"
                    name="next_maintenance_date"
                    form={form}
                    setForm={setForm}
                    type="date"
                  />
                  <Field
                    label="Maintenance Remarks"
                    name="maintenance_remarks"
                    form={form}
                    setForm={setForm}
                    type="textarea"
                    span
                  />
                </Section>
                <Section title="Documents">
                  <label className="space-y-1.5">
                    <span className={labelClass}>Upload Equipment Photo</span>
                    <input
                      name="equipmentPhoto"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp"
                      className={inputClass}
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className={labelClass}>Upload Purchase Invoice</span>
                    <input
                      name="purchaseInvoice"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      className={inputClass}
                    />
                  </label>
                  <label className="space-y-1.5">
                    <span className={labelClass}>Upload Warranty Document</span>
                    <input
                      name="warrantyDocument"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,.pdf"
                      className={inputClass}
                    />
                  </label>
                </Section>
                <Section title="Other">
                  <Field
                    label="Remarks"
                    name="remarks"
                    form={form}
                    setForm={setForm}
                    type="textarea"
                    span
                  />
                </Section>
                <div className="flex flex-col gap-3 border-t border-slate-800 pt-5 sm:flex-row">
                  <button
                    type="button"
                    onClick={closeDrawer}
                    className="order-3 flex-1 rounded-lg border border-slate-700 py-2.5 text-sm text-slate-300 hover:bg-slate-800 sm:order-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    name="addAnother"
                    disabled={saving}
                    className="order-2 flex-1 rounded-lg border border-orange-500/40 py-2.5 text-sm text-orange-300 hover:bg-orange-500/10"
                  >
                    Save & Add Another
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="order-1 flex-1 rounded-lg bg-orange-500 py-2.5 text-sm font-medium hover:bg-orange-600 disabled:opacity-50 sm:order-3"
                  >
                    {saving
                      ? "Saving..."
                      : editingId
                        ? "Update Equipment"
                        : "Save Equipment"}
                  </button>
                </div>
              </form>
            </div>
          </>,
          document.body,
        )}
      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          />
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl">
            <div className="flex items-start justify-between border-b border-slate-800 p-5">
              <div>
                <p className="font-mono text-xs text-orange-300">
                  {selected.asset_id}
                </p>
                <h2 className="mt-1 text-xl font-semibold">
                  {selected.equipment_name}
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  {selected.category}{" "}
                  {selected.brand ? `· ${selected.brand}` : ""}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-slate-400 hover:text-white"
              >
                <X />
              </button>
            </div>
            {detailError && (
              <div role="alert" className="mx-5 mt-4 flex items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-200">
                <span>{detailError}</span>
                <button type="button" onClick={() => openDetails(selected)} className="shrink-0 text-orange-300 hover:underline">Retry</button>
              </div>
            )}
            <div className="grid gap-4 p-5 sm:grid-cols-2">
              {[
                ["Status", selected.status],
                ["Condition", selected.condition_name],
                ["Quantity", selected.quantity],
                ["Serial Number", selected.serial_number],
                ["Purchase Date", formatDate(selected.purchase_date)],
                ["Purchase Price", formatMoney(selected.purchase_price)],
                ["Warranty End", formatDate(selected.warranty_end_date)],
                ["AMC End", formatDate(selected.amc_end_date)],
                ["Assigned Staff", selected.assigned_staff],
                ["Location", selected.current_location],
                ["Supplier", selected.supplier_name],
                ["Model Number", selected.model_number],
                ["Service Provider", selected.service_provider],
                ["Next Maintenance", formatDate(selected.next_maintenance_date)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-950/60 p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className="mt-1 text-sm text-white">{value || "-"}</p>
                </div>
              ))}
              <div className="sm:col-span-2 rounded-lg bg-slate-950/60 p-3">
                <p className="mb-2 text-xs text-slate-500">
                  Maintenance & Remarks
                </p>
                <p className="text-sm text-slate-300">
                  {selected.maintenance_remarks ||
                    selected.remarks ||
                    "No remarks added."}
                </p>
              </div>
              <div className="sm:col-span-2 rounded-lg bg-slate-950/60 p-3">
                <h3 className="mb-3 text-sm font-semibold text-white">Equipment Documents</h3>
                <div className="flex flex-wrap gap-2">
                  {[
                    ["equipment_photo", "Equipment photo"],
                    ["purchase_invoice", "Purchase invoice"],
                    ["warranty_document", "Warranty document"],
                  ].map(([fileType, label]) => selected[fileType] && (
                    <button
                      key={fileType}
                      type="button"
                      onClick={() => downloadEquipmentFile(fileType)}
                      disabled={Boolean(fileLoading)}
                      className="rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-300 hover:border-orange-400 hover:text-white disabled:opacity-50"
                    >
                      {fileLoading === fileType ? "Preparing..." : `Download ${label}`}
                    </button>
                  ))}
                  {!selected.equipment_photo && !selected.purchase_invoice && !selected.warranty_document && (
                    <p className="text-sm text-slate-500">No documents have been uploaded.</p>
                  )}
                </div>
              </div>
            </div>
            <section className="border-t border-slate-800 p-5">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="font-semibold text-white">Maintenance history</h3>
                  <p className="mt-1 text-xs text-slate-500">Service work and maintenance costs recorded for this asset.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMaintenanceOpen((open) => !open)}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-3 py-2 text-sm font-medium text-white hover:bg-orange-600"
                >
                  <Wrench size={15} /> {maintenanceOpen ? "Close form" : "Add maintenance"}
                </button>
              </div>
              {detailLoading ? (
                <p className="py-6 text-center text-sm text-slate-500">Loading maintenance history...</p>
              ) : (
                <>
                  {maintenanceOpen && (
                    <form onSubmit={saveMaintenance} className="mb-5 grid gap-3 rounded-xl border border-slate-700 bg-slate-950/50 p-4 sm:grid-cols-2">
                      <label className="space-y-1.5">
                        <span className={labelClass}>Maintenance date *</span>
                        <input required type="date" value={maintenanceForm.maintenance_date} onChange={(event) => setMaintenanceForm((current) => ({ ...current, maintenance_date: event.target.value }))} className={inputClass} />
                      </label>
                      <label className="space-y-1.5">
                        <span className={labelClass}>Maintenance status</span>
                        <select value={maintenanceForm.status} onChange={(event) => setMaintenanceForm((current) => ({ ...current, status: event.target.value }))} className={inputClass}>
                          {maintenanceStatuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </label>
                      <label className="space-y-1.5 sm:col-span-2">
                        <span className={labelClass}>Issue / work required *</span>
                        <input required minLength={3} maxLength={255} value={maintenanceForm.issue} onChange={(event) => setMaintenanceForm((current) => ({ ...current, issue: event.target.value }))} className={inputClass} />
                      </label>
                      <label className="space-y-1.5">
                        <span className={labelClass}>Service provider</span>
                        <input maxLength={255} value={maintenanceForm.service_provider} onChange={(event) => setMaintenanceForm((current) => ({ ...current, service_provider: event.target.value }))} className={inputClass} />
                      </label>
                      <label className="space-y-1.5">
                        <span className={labelClass}>Technician</span>
                        <input maxLength={255} value={maintenanceForm.technician} onChange={(event) => setMaintenanceForm((current) => ({ ...current, technician: event.target.value }))} className={inputClass} />
                      </label>
                      <label className="space-y-1.5">
                        <span className={labelClass}>Service cost (₹)</span>
                        <input type="number" min="0" step="0.01" value={maintenanceForm.service_cost} onChange={(event) => setMaintenanceForm((current) => ({ ...current, service_cost: event.target.value }))} className={inputClass} />
                      </label>
                      <label className="space-y-1.5">
                        <span className={labelClass}>Next service date</span>
                        <input type="date" value={maintenanceForm.next_service_date} onChange={(event) => setMaintenanceForm((current) => ({ ...current, next_service_date: event.target.value }))} className={inputClass} />
                      </label>
                      <label className="space-y-1.5">
                        <span className={labelClass}>Updated equipment status</span>
                        <select value={maintenanceForm.equipment_status} onChange={(event) => setMaintenanceForm((current) => ({ ...current, equipment_status: event.target.value }))} className={inputClass}>
                          <option value="">Keep current status</option>
                          {maintenanceEquipmentStatuses.map((status) => <option key={status}>{status}</option>)}
                        </select>
                      </label>
                      <label className="space-y-1.5">
                        <span className={labelClass}>Resolution</span>
                        <textarea rows={2} value={maintenanceForm.resolution} onChange={(event) => setMaintenanceForm((current) => ({ ...current, resolution: event.target.value }))} className={`${inputClass} resize-y`} />
                      </label>
                      <label className="space-y-1.5">
                        <span className={labelClass}>Remarks</span>
                        <textarea rows={2} value={maintenanceForm.remarks} onChange={(event) => setMaintenanceForm((current) => ({ ...current, remarks: event.target.value }))} className={`${inputClass} resize-y`} />
                      </label>
                      <div className="flex justify-end sm:col-span-2">
                        <button disabled={maintenanceSaving} type="submit" className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 disabled:opacity-50">
                          {maintenanceSaving ? "Saving..." : "Save maintenance record"}
                        </button>
                      </div>
                    </form>
                  )}
                  {detailError ? (
                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 py-6 text-center text-sm text-red-200">Maintenance history could not be loaded.</p>
                  ) : selected.maintenance_history?.length ? (
                    <ol className="space-y-3">
                      {selected.maintenance_history.map((record) => (
                        <li key={record.id} className="rounded-lg border border-slate-800 bg-slate-950/40 p-3">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-sm font-medium text-white">{record.issue}</span>
                            <span className="rounded border border-slate-700 px-2 py-1 text-xs text-slate-300">{record.status}</span>
                          </div>
                          <p className="mt-2 text-xs text-slate-400">
                            {formatDate(record.maintenance_date)} · {record.service_provider || "No provider"} · {formatMoney(record.service_cost)}
                          </p>
                          {record.resolution && <p className="mt-2 text-sm text-slate-300">{record.resolution}</p>}
                          {record.remarks && <p className="mt-1 text-xs text-slate-500">{record.remarks}</p>}
                          {record.next_service_date && <p className="mt-2 text-xs text-orange-300">Next service: {formatDate(record.next_service_date)}</p>}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="rounded-lg border border-dashed border-slate-700 py-6 text-center text-sm text-slate-500">No maintenance records have been added.</p>
                  )}
                </>
              )}
            </section>
            <div className="flex flex-wrap justify-end gap-2 border-t border-slate-800 p-5">
              <button
                onClick={() => openEdit(selected)}
                className="flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-800"
              >
                <Edit2 size={15} /> Edit Equipment
              </button>
              <button
                onClick={() => deleteEquipment(selected)}
                className="flex items-center gap-2 rounded-lg border border-red-500/30 px-3 py-2 text-sm text-red-300 hover:bg-red-500/10"
              >
                <Trash2 size={15} /> Delete Equipment
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default EquipmentManagement;
