import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Eye, FileText, LayoutGrid, List, Pencil, Plus, RefreshCcw, Search, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import AddService from './AddService';

const categories = ['Certificates', 'Aadhaar Services', 'PAN Services', 'Education', 'Pensions', 'Utility', 'Ration'];

const getCategoryColor = (category) => {
  if (category === 'Certificates') return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
  if (category === 'Education') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  if (category === 'Utility') return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
  return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
};

const formatAmount = (value) => `₹ ${Number(value || 0).toFixed(2)}`;

function Select({ value, onChange, children }) {
  return <div className="relative"><select value={value} onChange={onChange} className="w-full appearance-none rounded-lg border border-gray-800 bg-[#0f1115] px-4 py-2.5 pr-9 text-sm text-white outline-none focus:border-orange-500">{children}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-gray-500" size={16} /></div>;
}

export default function ServiceManagement() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [status, setStatus] = useState('All Status');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [viewMode, setViewMode] = useState('table');

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

  const filteredServices = useMemo(() => services.filter((service) => {
    const query = search.trim().toLowerCase();
    const matchesSearch = !query || service.service_name.toLowerCase().includes(query) || service.service_code.toLowerCase().includes(query);
    return matchesSearch && (category === 'All Categories' || service.category === category) && (status === 'All Status' || service.status === status);
  }), [services, search, category, status]);

  const deleteService = async (service) => {
    if (!window.confirm(`Delete ${service.service_name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/services/${service.id}`);
      setServices((current) => current.filter((item) => item.id !== service.id));
      toast.success('Service deleted successfully.');
    } catch (error) { toast.error(error.response?.data?.message || 'Unable to delete service.'); }
  };

  const toggleAll = (event) => setSelected(event.target.checked ? filteredServices.map((service) => service.id) : []);
  const [selectedIds, setSelectedIds] = useState([]);
  const toggleSelected = (id) => setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);

  return <div className="flex flex-col gap-6 p-2 text-white sm:p-4">
    <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center"><div><h1 className="mb-1 text-2xl font-semibold">All Services</h1><div className="flex items-center gap-2 text-sm text-gray-400"><span>Dashboard</span><span className="text-gray-600">&gt;</span><span>Services</span><span className="text-gray-600">&gt;</span><span className="text-gray-200">All Services</span></div></div><button onClick={() => { setEditingServiceId(null); setIsAddOpen(true); }} className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-orange-600"><Plus size={18} /> Add New Service</button></div>

    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-800 bg-[#1a1c23] p-4"><div className="relative min-w-[240px] flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by service name or code..." className="w-full rounded-lg border border-gray-800 bg-[#0f1115] py-2.5 pl-10 pr-4 text-sm text-white outline-none focus:border-orange-500" /></div><div className="min-w-[170px]"><Select value={category} onChange={(event) => setCategory(event.target.value)}><option>All Categories</option>{categories.map((item) => <option key={item}>{item}</option>)}</Select></div><div className="min-w-[140px]"><Select value={status} onChange={(event) => setStatus(event.target.value)}><option>All Status</option><option>Active</option><option>Inactive</option></Select></div><button onClick={() => { setSearch(''); setCategory('All Categories'); setStatus('All Status'); loadServices(); }} className="flex items-center gap-2 rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800"><RefreshCcw size={16} /> Reset</button><div className="ml-auto flex items-center rounded-lg border border-gray-700 bg-[#0f1115] p-1"><button type="button" onClick={() => setViewMode('table')} title="Table view" className={`rounded-md p-2 ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}><List size={17} /></button><button type="button" onClick={() => setViewMode('card')} title="Card view" className={`rounded-md p-2 ${viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}><LayoutGrid size={17} /></button></div></div>

    {viewMode === 'table' ? <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c23]"><div className="overflow-x-auto"><table className="w-full border-collapse text-left"><thead><tr className="border-b border-gray-800 text-sm text-gray-400"><th className="w-12 px-4 py-4"><input type="checkbox" checked={filteredServices.length > 0 && selectedIds.length === filteredServices.length} onChange={toggleAll} className="h-4 w-4 accent-orange-500" /></th><th className="px-4 py-4 font-medium">Service Name</th><th className="px-4 py-4 font-medium">Service Code</th><th className="px-4 py-4 font-medium">Category</th><th className="px-4 py-4 font-medium">Total Amount</th><th className="px-4 py-4 font-medium">Status</th><th className="px-4 py-4 text-center font-medium">Actions</th></tr></thead><tbody>
      {loading && <tr><td colSpan="7" className="px-4 py-16 text-center text-sm text-gray-400">Loading services...</td></tr>}
      {!loading && filteredServices.length === 0 && <tr><td colSpan="7" className="px-4 py-16 text-center text-sm text-gray-400">No services found.</td></tr>}
      {!loading && filteredServices.map((service) => <tr key={service.id} className="border-b border-gray-800/60 hover:bg-gray-800/20"><td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(service.id)} onChange={() => toggleSelected(service.id)} className="h-4 w-4 accent-orange-500" /></td><td className="min-w-[240px] px-4 py-3"><div className="flex items-center gap-3"><div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400"><FileText size={19} /></div><div><div className="text-sm font-medium text-white">{service.service_name}</div><div className="text-xs text-gray-500">{service.subcategory || service.provider_department || 'E-Sevai service'}</div></div></div></td><td className="px-4 py-3 font-mono text-sm text-gray-300">{service.service_code}</td><td className="px-4 py-3"><span className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${getCategoryColor(service.category)}`}>{service.category}</span></td><td className="px-4 py-3 text-sm text-gray-300">{formatAmount(service.total_amount)}</td><td className="px-4 py-3"><span className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${service.status === 'Active' ? 'border-green-500/20 bg-green-500/10 text-green-500' : 'border-red-500/20 bg-red-500/10 text-red-500'}`}>{service.status}</span></td><td className="px-4 py-3"><div className="flex justify-center gap-1"><button onClick={() => setSelected(service)} title="View service" className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"><Eye size={16} /></button><button onClick={() => { setSelected(null); setEditingServiceId(service.id); setIsAddOpen(true); }} title="Edit service" className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-blue-400"><Pencil size={16} /></button><button onClick={() => deleteService(service)} title="Delete service" className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-red-400"><Trash2 size={16} /></button></div></td></tr>)}
    </tbody></table></div><div className="border-t border-gray-800 px-4 py-4 text-sm text-gray-400">Showing {filteredServices.length} of {services.length} services</div></div> : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{loading && <div className="col-span-full rounded-xl border border-gray-800 bg-[#1a1c23] px-4 py-16 text-center text-sm text-gray-400">Loading services...</div>}{!loading && filteredServices.length === 0 && <div className="col-span-full rounded-xl border border-gray-800 bg-[#1a1c23] px-4 py-16 text-center text-sm text-gray-400">No services found.</div>}{!loading && filteredServices.map((service) => <article key={service.id} className="rounded-xl border border-gray-800 bg-[#1a1c23] p-5 transition hover:border-orange-500/40"><div className="mb-4 flex items-start justify-between gap-3"><div className="flex items-center gap-3"><div className="flex h-11 w-11 items-center justify-center rounded-lg bg-orange-500/10 text-orange-400"><FileText size={20} /></div><div><h2 className="font-semibold text-white">{service.service_name}</h2><p className="font-mono text-xs text-gray-500">{service.service_code}</p></div></div><input type="checkbox" checked={selectedIds.includes(service.id)} onChange={() => toggleSelected(service.id)} className="h-4 w-4 accent-orange-500" /></div><span className={`inline-flex rounded border px-2 py-1 text-xs font-medium ${getCategoryColor(service.category)}`}>{service.category}</span><div className="mt-4 grid grid-cols-2 gap-3 border-y border-gray-800 py-3"><div><p className="text-xs text-gray-500">Total Amount</p><p className="mt-1 text-sm font-semibold text-white">{formatAmount(service.total_amount)}</p></div><div><p className="text-xs text-gray-500">Status</p><p className={`mt-1 text-sm font-medium ${service.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>{service.status}</p></div></div><div className="mt-4 flex justify-end gap-1"><button onClick={() => setSelected(service)} title="View service" className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"><Eye size={16} /></button><button onClick={() => { setEditingServiceId(service.id); setIsAddOpen(true); }} title="Edit service" className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-blue-400"><Pencil size={16} /></button><button onClick={() => deleteService(service)} title="Delete service" className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-red-400"><Trash2 size={16} /></button></div></article>)}</div>}

    {selected && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setSelected(null)}><div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-gray-700 bg-[#1a1c23] p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-start justify-between border-b border-gray-800 pb-4"><div><p className="text-xs uppercase tracking-wider text-orange-400">{selected.service_code}</p><h2 className="mt-1 text-xl font-semibold text-white">{selected.service_name}</h2><p className="mt-1 text-sm text-gray-400">{selected.category}{selected.subcategory ? ` / ${selected.subcategory}` : ''}</p></div><button onClick={() => setSelected(null)} title="Close details" className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"><X size={19} /></button></div><div className="grid gap-4 sm:grid-cols-2">{[['Description', selected.description], ['Provider / Department', selected.provider_department], ['Processing Time', selected.processing_time], ['Application Type', selected.application_type], ['Availability', selected.service_availability], ['Delivery Method', selected.delivery_method], ['Payment Type', selected.payment_type], ['Government Fee', formatAmount(selected.government_fee)], ['Service Charge', formatAmount(selected.service_charge)], ['GST / Tax', formatAmount(selected.gst_tax)], ['Total Amount', formatAmount(selected.total_amount)], ['Featured', selected.featured_service]].map(([label, value]) => <div key={label} className="rounded-lg border border-gray-800 bg-[#0f1115] p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 whitespace-pre-wrap text-sm text-gray-200">{value || 'Not provided'}</p></div>)}</div><div className="mt-5 flex justify-end"><button onClick={() => navigate(`/admin/service-management/edit/${selected.id}`)} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600"><Pencil size={16} /> Edit service</button></div></div></div>}
    {isAddOpen && createPortal(<><div className="fixed inset-0 z-[60] bg-black/60" onClick={() => setIsAddOpen(false)} /><aside className="service-drawer-dark fixed inset-y-0 right-0 z-[70] w-full max-w-2xl overflow-y-auto bg-[#1a1c23] shadow-2xl"><AddService embedded serviceId={editingServiceId} onCancel={() => { setIsAddOpen(false); setEditingServiceId(null); }} onSaved={loadServices} /></aside></>, document.body)}
  </div>;
}
