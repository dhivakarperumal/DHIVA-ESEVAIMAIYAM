import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown, Eye, FileText, Filter, LayoutGrid, List,
  Pencil, Plus, RefreshCcw, Search, Trash2, X,
  Layers, CheckCircle2, XCircle, CalendarDays,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import AddService from './AddService';

/* ── constants ── */
const categories = ['Certificates', 'Aadhaar Services', 'PAN Services', 'Education', 'Pensions', 'Utility', 'Ration'];

const getCategoryColor = (category) => {
  if (category === 'Certificates') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  if (category === 'Education')    return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (category === 'Utility')      return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
  return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
};

const formatAmount = (value) => `₹ ${Number(value || 0).toFixed(2)}`;

/* ── shared select ── */
function Select({ value, onChange, children }) {
  return (
    <div className="relative">
      <select value={value} onChange={onChange}
        className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0f1115] px-4 py-2.5 pr-9 text-sm text-white outline-none focus:border-orange-500">
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-3 text-gray-500" size={16} />
    </div>
  );
}

/* ── status badge ── */
function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold border ${
      active ? 'bg-green-500/15 text-green-400 border-green-500/30'
             : 'bg-red-500/15 text-red-400 border-red-500/30'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-red-400'}`} />
      {status}
    </span>
  );
}

/* ══════════════════════════════════════════
   STAT CARDS
══════════════════════════════════════════ */
function StatCards({ services }) {
  const now       = new Date();
  const month     = now.getMonth();
  const year      = now.getFullYear();
  const lastMonth = month === 0 ? 11 : month - 1;
  const lastYear  = month === 0 ? year - 1 : year;

  const isThisMonth = (s) => {
    const d = new Date(s.created_at || s.effective_from || Date.now());
    return d.getMonth() === month && d.getFullYear() === year;
  };
  const isLastMonth = (s) => {
    const d = new Date(s.created_at || s.effective_from || Date.now());
    return d.getMonth() === lastMonth && d.getFullYear() === lastYear;
  };

  const total    = services.length;
  const active   = services.filter((s) => s.status === 'Active').length;
  const inactive = services.filter((s) => s.status !== 'Active').length;
  const newThis  = services.filter(isThisMonth).length;

  const lastTotal    = services.filter(isLastMonth).length;
  const lastActive   = services.filter((s) => s.status === 'Active' && isLastMonth(s)).length;
  const lastInactive = services.filter((s) => s.status !== 'Active' && isLastMonth(s)).length;

  const pct = (curr, prev) => {
    if (prev === 0 && curr === 0) return { val: '0.0', up: true };
    if (prev === 0) return { val: '100.0', up: true };
    return { val: Math.abs(((curr - prev) / prev) * 100).toFixed(1), up: curr >= prev };
  };

  const cards = [
    { label: 'Total Services',   value: total,    pct: pct(total, lastTotal),       iconBg: 'bg-orange-500', icon: Layers                             },
    { label: 'Active Services',  value: active,   pct: pct(active, lastActive),     iconBg: 'bg-green-500',  icon: CheckCircle2                       },
    { label: 'Inactive Services',value: inactive, pct: pct(inactive, lastInactive), iconBg: 'bg-red-600',    icon: XCircle,      invertColor: true    },
    { label: 'New This Month',   value: newThis,  pct: { val: '0.8', up: true },    iconBg: 'bg-purple-600', icon: CalendarDays                       },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cards.map(({ label, value, pct: p, iconBg, icon: Icon, invertColor }) => {
        const isPositive = invertColor ? !p.up : p.up;
        return (
          <div key={label} className="flex items-center gap-4 rounded-xl border border-gray-800 bg-[#1a1c23] p-4">
            {/* solid coloured icon box */}
            <div className={`${iconBg} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg`}>
              <Icon size={22} className="text-white" />
            </div>
            {/* text */}
            <div className="min-w-0">
              <p className="truncate text-sm text-gray-400">{label}</p>
              <p className="text-3xl font-bold text-white leading-tight">{value}</p>
              <p className={`mt-0.5 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {p.up ? '↗' : '↘'} {p.val}% from last month
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ══════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════ */
export default function ServiceManagement() {
  const navigate = useNavigate();
  const [services,       setServices]       = useState([]);
  const [search,         setSearch]         = useState('');
  const [category,       setCategory]       = useState('All Categories');
  const [status,         setStatus]         = useState('All Status');
  const [appliedFilters, setAppliedFilters] = useState({ search: '', category: 'All Categories', status: 'All Status' });
  const [loading,        setLoading]        = useState(true);
  const [selected,       setSelected]       = useState(null);
  const [isAddOpen,      setIsAddOpen]      = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [viewMode,       setViewMode]       = useState('table');
  const [selectedIds,    setSelectedIds]    = useState([]);

  /* load */
  const loadServices = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/services');
      setServices(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load services.');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    let active = true;
    api.get('/services').then(({ data }) => {
      if (active) setServices(data.data || []);
    }).catch((error) => {
      if (active) toast.error(error.response?.data?.message || 'Unable to load services.');
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  /* filter */
  const filteredServices = useMemo(() =>
    services.filter((service) => {
      const query = appliedFilters.search.trim().toLowerCase();
      const matchesSearch = !query ||
        service.service_name.toLowerCase().includes(query) ||
        service.service_code.toLowerCase().includes(query);
      return (
        matchesSearch &&
        (appliedFilters.category === 'All Categories' || service.category === appliedFilters.category) &&
        (appliedFilters.status   === 'All Status'     || service.status   === appliedFilters.status)
      );
    }),
  [services, appliedFilters]);

  /* selection */
  const toggleAll = (e) =>
    setSelectedIds(e.target.checked ? filteredServices.map((s) => s.id) : []);
  const toggleSelected = (id) =>
    setSelectedIds((cur) => cur.includes(id) ? cur.filter((i) => i !== id) : [...cur, id]);

  /* delete */
  const deleteService = async (service) => {
    if (!window.confirm(`Delete "${service.service_name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/services/${service.id}`);
      setServices((cur) => cur.filter((item) => item.id !== service.id));
      toast.success('Service deleted successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete service.');
    }
  };

  /* ── render ── */
  return (
    <div className="flex flex-col gap-6 p-2 text-white sm:p-4">

      {/* header */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">All Services</h1>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <span>Dashboard</span><span className="text-gray-600">&gt;</span>
            <span>Services</span><span className="text-gray-600">&gt;</span>
            <span className="text-gray-200">All Services</span>
          </div>
        </div>
        <button
          onClick={() => { setEditingServiceId(null); setIsAddOpen(true); }}
          className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600 transition-colors">
          <Plus size={18} /> Add New Service
        </button>
      </div>

      {/* ── STAT CARDS ── */}
      <StatCards services={services} />

      {/* filter bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-800 bg-[#1a1c23] p-4">
        {/* search */}
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by service name or code..."
            className="w-full rounded-lg border border-gray-800 bg-[#0f1115] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-orange-500" />
        </div>

        {/* category */}
        <div className="min-w-[170px]">
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option>All Categories</option>
            {categories.map((item) => <option key={item}>{item}</option>)}
          </Select>
        </div>

        {/* status */}
        <div className="min-w-[140px]">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </Select>
        </div>

        {/* apply */}
        <button onClick={() => setAppliedFilters({ search, category, status })}
          className="flex items-center gap-2 rounded-lg border border-orange-500/30 px-4 py-2.5 text-sm text-orange-500 hover:bg-orange-500/10 transition-colors">
          <Filter size={16} /> Apply
        </button>

        {/* reset */}
        <button onClick={() => {
          setSearch(''); setCategory('All Categories'); setStatus('All Status');
          setAppliedFilters({ search: '', category: 'All Categories', status: 'All Status' });
          loadServices();
        }} className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800 transition-colors">
          <RefreshCcw size={16} /> Reset
        </button>

        {/* view toggle */}
        <div className="ml-auto flex overflow-hidden rounded-lg border border-gray-700">
          <button type="button" onClick={() => setViewMode('table')} title="Table view"
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors ${
              viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            <List size={17} />
            <span className="hidden sm:inline">Table</span>
          </button>
          <button type="button" onClick={() => setViewMode('card')} title="Card view"
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors ${
              viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            <LayoutGrid size={17} />
            <span className="hidden sm:inline">Cards</span>
          </button>
        </div>
      </div>

      {/* results count */}
      {!loading && (
        <p className="text-xs text-gray-500 -mt-3">
          Showing <span className="text-gray-300 font-medium">{filteredServices.length}</span> of{' '}
          <span className="text-gray-300 font-medium">{services.length}</span> services
        </p>
      )}

      {/* ══ TABLE VIEW ══ */}
      {viewMode === 'table' && (
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c23]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-800 text-sm text-gray-400">
                  <th className="w-12 px-4 py-4">
                    <input type="checkbox"
                      checked={filteredServices.length > 0 && selectedIds.length === filteredServices.length}
                      onChange={toggleAll} className="h-4 w-4 accent-orange-500" />
                  </th>
                  <th className="px-4 py-4 font-medium w-10">S.No</th>
                  <th className="px-4 py-4 font-medium">Service Name</th>
                  <th className="px-4 py-4 font-medium">Service Code</th>
                  <th className="px-4 py-4 font-medium">Category</th>
                  <th className="px-4 py-4 font-medium">Total Amount</th>
                  <th className="px-4 py-4 font-medium">Status</th>
                  <th className="px-4 py-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="8" className="px-4 py-16 text-center text-sm text-gray-400">Loading services...</td></tr>
                )}
                {!loading && filteredServices.length === 0 && (
                  <tr><td colSpan="8" className="px-4 py-16 text-center text-sm text-gray-400">No services found.</td></tr>
                )}
                {!loading && filteredServices.map((service, i) => (
                  <tr key={service.id} className="border-b border-gray-800/60 hover:bg-white/[.02] transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selectedIds.includes(service.id)}
                        onChange={() => toggleSelected(service.id)} className="h-4 w-4 accent-orange-500" />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-medium">{i + 1}</td>
                    <td className="min-w-[240px] px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                          <FileText size={19} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{service.service_name}</div>
                          <div className="text-xs text-gray-500">{service.subcategory || service.provider_department || 'E-Sevai service'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono text-sm text-gray-300">{service.service_code}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${getCategoryColor(service.category)}`}>
                        {service.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-orange-400">{formatAmount(service.total_amount)}</td>
                    <td className="px-4 py-3"><StatusBadge status={service.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => setSelected(service)} title="View service"
                          className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => { setSelected(null); setEditingServiceId(service.id); setIsAddOpen(true); }}
                          title="Edit service"
                          className="rounded-md p-2 text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => deleteService(service)} title="Delete service"
                          className="rounded-md p-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-800 px-4 py-3 text-sm text-gray-400">
            Showing <span className="font-medium text-gray-200">{filteredServices.length}</span> of{' '}
            <span className="font-medium text-gray-200">{services.length}</span> services
          </div>
        </div>
      )}

      {/* ══ CARD VIEW ══ */}
      {viewMode === 'card' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {loading && (
            <div className="col-span-full rounded-xl border border-gray-800 bg-[#1a1c23] px-4 py-16 text-center text-sm text-gray-400">
              Loading services...
            </div>
          )}
          {!loading && filteredServices.length === 0 && (
            <div className="col-span-full rounded-xl border border-gray-800 bg-[#1a1c23] px-4 py-16 text-center text-sm text-gray-400">
              No services found.
            </div>
          )}
          {!loading && filteredServices.map((service, i) => (
            <article key={service.id}
              className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-[#1a1c23] p-5 transition hover:border-orange-500/40">
              {/* top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-semibold text-white truncate">{service.service_name}</h2>
                    <p className="font-mono text-xs text-gray-500">{service.service_code}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-gray-500 font-medium">#{i + 1}</span>
                  <input type="checkbox" checked={selectedIds.includes(service.id)}
                    onChange={() => toggleSelected(service.id)} className="h-4 w-4 accent-orange-500" />
                </div>
              </div>

              {/* category */}
              <span className={`inline-flex self-start rounded border px-2.5 py-1 text-xs font-medium ${getCategoryColor(service.category)}`}>
                {service.category}
              </span>

              {/* provider */}
              {(service.subcategory || service.provider_department) && (
                <p className="text-xs text-gray-500 truncate">
                  {service.subcategory || service.provider_department}
                </p>
              )}

              {/* amounts grid */}
              <div className="grid grid-cols-3 gap-2 rounded-xl border border-gray-800 bg-[#0f1115] p-3">
                {[
                  ['Gov. Fee',   service.government_fee],
                  ['Svc Charge', service.service_charge],
                  ['Total',      service.total_amount],
                ].map(([lbl, val]) => (
                  <div key={lbl} className="text-center">
                    <p className="text-[10px] text-gray-500 mb-0.5">{lbl}</p>
                    <p className={`text-sm font-bold ${lbl === 'Total' ? 'text-orange-400' : 'text-gray-200'}`}>
                      ₹{Number(val || 0).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>

              {/* status + delivery */}
              <div className="flex items-center justify-between">
                <StatusBadge status={service.status} />
                {service.delivery_method && (
                  <span className="text-xs text-gray-500">{service.delivery_method}</span>
                )}
              </div>

              {/* actions */}
              <div className="flex gap-2 border-t border-gray-800 pt-3 mt-auto">
                <button onClick={() => setSelected(service)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-700 py-2 text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                  <Eye size={14} /> View
                </button>
                <button onClick={() => { setEditingServiceId(service.id); setIsAddOpen(true); }}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/30 py-2 text-xs text-blue-400 hover:bg-blue-500/10 transition-colors">
                  <Pencil size={14} /> Edit
                </button>
                <button onClick={() => deleteService(service)}
                  className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* ── detail modal ── */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          onClick={() => setSelected(null)}>
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-700 bg-[#1a1c23] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between border-b border-gray-800 pb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-orange-400">{selected.service_code}</p>
                <h2 className="mt-1 text-xl font-semibold text-white">{selected.service_name}</h2>
                <p className="mt-1 text-sm text-gray-400">
                  {selected.category}{selected.subcategory ? ` / ${selected.subcategory}` : ''}
                </p>
              </div>
              <button onClick={() => setSelected(null)}
                className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white">
                <X size={19} />
              </button>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['Description',          selected.description],
                ['Provider / Department',selected.provider_department],
                ['Processing Time',      selected.processing_time],
                ['Application Type',     selected.application_type],
                ['Availability',         selected.service_availability],
                ['Delivery Method',      selected.delivery_method],
                ['Payment Type',         selected.payment_type],
                ['Government Fee',       formatAmount(selected.government_fee)],
                ['Service Charge',       formatAmount(selected.service_charge)],
                ['GST / Tax',            formatAmount(selected.gst_tax)],
                ['Total Amount',         formatAmount(selected.total_amount)],
                ['Featured',             selected.featured_service],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg border border-gray-800 bg-[#0f1115] p-3">
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className={`mt-1 whitespace-pre-wrap text-sm ${label === 'Total Amount' ? 'font-bold text-orange-400' : 'text-gray-200'}`}>
                    {value || 'Not provided'}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => navigate(`/admin/service-management/edit/${selected.id}`)}
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors">
                <Pencil size={16} /> Edit service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── add / edit drawer ── */}
      {isAddOpen && createPortal(
        <>
          <div className="fixed inset-0 z-[60] bg-black/60" onClick={() => setIsAddOpen(false)} />
          <aside className="service-drawer-dark fixed inset-y-0 right-0 z-[70] w-full max-w-2xl overflow-y-auto bg-[#1a1c23] shadow-2xl">
            <AddService embedded serviceId={editingServiceId}
              onCancel={() => { setIsAddOpen(false); setEditingServiceId(null); }}
              onSaved={loadServices} />
          </aside>
        </>,
        document.body,
      )}
    </div>
  );
}
