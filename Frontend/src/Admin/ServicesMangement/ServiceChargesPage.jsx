import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronDown, Eye, LayoutGrid, List, Pencil,
  Plus, RefreshCcw, Search, Trash2, X,
  BadgeDollarSign, CheckCircle2, XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

/* ── helpers ── */
const empty = {
  service_id: '', charge_name: '', charge_type: 'Government Fee',
  base_amount: '', gst_tax: '', other_charges: '', discount: '',
  effective_from: new Date().toISOString().slice(0, 10),
  effective_to: '', status: 'Active', remarks: '',
};
const types = ['Government Fee', 'Service Charge', 'Processing Fee', 'Other'];
const n     = (v) => Number.parseFloat(v) || 0;
const money = (v) => `₹ ${n(v).toFixed(2)}`;
const date  = (v) => v ? new Date(`${String(v).slice(0, 10)}T00:00:00`).toLocaleDateString('en-IN') : 'No end date';

/* ── tiny shared components ── */
const inp = 'w-full rounded-lg border border-gray-800 bg-[#0f1115] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-orange-500';

function SelectInput({ name, value, onChange, children, className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <select name={name} value={value} onChange={onChange}
        className={`${inp} appearance-none pr-9`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-3 text-gray-500" size={16} />
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">{label}</span>
      {children}
    </label>
  );
}

function StatusBadge({ status }) {
  const active = status === 'Active';
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ${
      active ? 'bg-green-500/15 text-green-400 border border-green-500/30'
              : 'bg-red-500/15 text-red-400 border border-red-500/30'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-green-400' : 'bg-red-400'}`} />
      {status}
    </span>
  );
}

/* ── stat cards row ── */
function StatCards({ charges }) {
  const now      = new Date();
  const month    = now.getMonth();
  const year     = now.getFullYear();
  const lastMonth = month === 0 ? 11 : month - 1;
  const lastYear  = month === 0 ? year - 1 : year;

  const total    = charges.length;
  const active   = charges.filter((c) => c.status === 'Active').length;
  const inactive = charges.filter((c) => c.status !== 'Active').length;
  const newThis  = charges.filter((c) => {
    const d = new Date(c.effective_from);
    return d.getMonth() === month && d.getFullYear() === year;
  }).length;

  const lastTotal    = charges.filter((c) => { const d = new Date(c.effective_from); return d.getMonth() === lastMonth && d.getFullYear() === lastYear; }).length;
  const lastActive   = charges.filter((c) => { const d = new Date(c.effective_from); return c.status === 'Active' && d.getMonth() === lastMonth && d.getFullYear() === lastYear; }).length;
  const lastInactive = charges.filter((c) => { const d = new Date(c.effective_from); return c.status !== 'Active' && d.getMonth() === lastMonth && d.getFullYear() === lastYear; }).length;

  const pct = (curr, prev) => {
    if (prev === 0 && curr === 0) return { val: '0.0', up: true };
    if (prev === 0) return { val: '100.0', up: true };
    return { val: Math.abs(((curr - prev) / prev) * 100).toFixed(1), up: curr >= prev };
  };

  const cards = [
    { label: 'Total Charges',   value: total,    pct: pct(total, lastTotal),       iconBg: 'bg-orange-500', icon: BadgeDollarSign                       },
    { label: 'Active Charges',  value: active,   pct: pct(active, lastActive),     iconBg: 'bg-green-500',  icon: CheckCircle2                          },
    { label: 'Inactive Charges',value: inactive, pct: pct(inactive, lastInactive), iconBg: 'bg-red-600',    icon: XCircle,         invertColor: true     },
    { label: 'New This Month',  value: newThis,  pct: { val: '0.8', up: true },    iconBg: 'bg-purple-600', icon: Plus                                  },
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
            {/* text block */}
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

/* ── add / edit form ── */
function Form({ value, services, editing, saving, onChange, onSubmit, onCancel }) {
  const total = n(value.base_amount) + n(value.gst_tax) + n(value.other_charges) - n(value.discount);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Service *">
        <SelectInput name="service_id" value={value.service_id} onChange={onChange}>
          <option value="">Select an active service</option>
          {services.map((s) => <option key={s.id} value={s.id}>{s.service_name} ({s.service_code})</option>)}
        </SelectInput>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Charge Name *">
          <input required name="charge_name" value={value.charge_name} onChange={onChange}
            className={inp} placeholder="e.g. Application fee" />
        </Field>
        <Field label="Charge Type *">
          <SelectInput name="charge_type" value={value.charge_type} onChange={onChange}>
            {types.map((t) => <option key={t}>{t}</option>)}
          </SelectInput>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[['base_amount','Base Amount'],['gst_tax','GST / Tax'],['other_charges','Other Charges'],['discount','Discount']].map(([name, label]) => (
          <Field key={name} label={label}>
            <input type="number" min="0" step="0.01" name={name} value={value[name]}
              onChange={onChange} className={inp} placeholder="0.00" />
          </Field>
        ))}
      </div>
      <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-right text-lg font-semibold text-orange-400">
        Total: {money(total)}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Effective From *">
          <input required type="date" name="effective_from" value={value.effective_from} onChange={onChange} className={inp} />
        </Field>
        <Field label="Effective To">
          <input type="date" name="effective_to" value={value.effective_to} min={value.effective_from} onChange={onChange} className={inp} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status">
          <SelectInput name="status" value={value.status} onChange={onChange}>
            <option>Active</option><option>Inactive</option>
          </SelectInput>
        </Field>
        <Field label="Remarks">
          <input name="remarks" value={value.remarks} onChange={onChange} className={inp} placeholder="Optional notes" />
        </Field>
      </div>
      <div className="flex justify-end gap-3 border-t border-gray-800 pt-4">
        <button type="button" onClick={onCancel}
          className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-300">Cancel</button>
        <button disabled={saving || !value.service_id} type="submit"
          className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium disabled:opacity-50">
          {saving ? 'Saving…' : editing ? 'Update Charge' : 'Add Charge'}
        </button>
      </div>
    </form>
  );
}

/* ══════════════════════════════════════════════
   Main page
══════════════════════════════════════════════ */
export default function ServiceChargesPage() {
  const [charges,  setCharges]  = useState([]);
  const [services, setServices] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [status,   setStatus]   = useState('All Status');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [view,     setView]     = useState('table'); // 'table' | 'cards'
  const [modal,    setModal]    = useState(null);
  const [form,     setForm]     = useState(empty);
  const [saving,   setSaving]   = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  /* load */
  const load = async () => {
    setLoading(true);
    try {
      const [cr, sr] = await Promise.all([api.get('/service-charges'), api.get('/services')]);
      setCharges(cr.data.data || []);
      setServices((sr.data.data || []).filter((s) => s.status === 'Active'));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to load service charges.');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  /* filter */
  const filtered = useMemo(() =>
    charges.filter((c) => {
      const q = search.trim().toLowerCase();
      const textMatch = !q || [c.charge_name, c.charge_type, c.service_name, c.service_code]
        .some((v) => String(v || '').toLowerCase().includes(q));
      const statusMatch  = status     === 'All Status' || c.status      === status;
      const typeMatch    = typeFilter === 'All Types'  || c.charge_type === typeFilter;
      return textMatch && statusMatch && typeMatch;
    }),
  [charges, search, status, typeFilter]);

  const toggleSelected = (id) => setSelectedIds((current) => current.includes(id)
    ? current.filter((item) => item !== id)
    : [...current, id]);
  const toggleAll = () => setSelectedIds((current) => current.length === filtered.length
    ? current.filter((id) => !filtered.some((charge) => charge.id === id))
    : [...new Set([...current, ...filtered.map((charge) => charge.id)])]);

  /* form helpers */
  const chargeDefaults = (svc, chargeType) => {
    if (!svc) return {};
    const f = chargeType === 'Government Fee' ? 'government_fee' : chargeType === 'Service Charge' ? 'service_charge' : null;
    return { charge_name: `${svc.service_name} - ${chargeType}`, ...(f ? { base_amount: svc[f] ?? '' } : {}) };
  };
  const change = (e) => setForm((cur) => {
    const next = { ...cur, [e.target.name]: e.target.value };
    if (e.target.name === 'service_id' || e.target.name === 'charge_type') {
      const svc = services.find((s) => String(s.id) === String(next.service_id));
      Object.assign(next, chargeDefaults(svc, next.charge_type));
    }
    return next;
  });
  const openAdd = () => {
    const svc = services[0];
    setForm({ ...empty, service_id: svc?.id ? String(svc.id) : '', ...chargeDefaults(svc, empty.charge_type) });
    setModal('add');
  };
  const openEdit = (c) => {
    setForm({ ...empty, ...c, id: c.id, service_id: String(c.service_id),
      effective_from: String(c.effective_from || '').slice(0, 10),
      effective_to:   String(c.effective_to   || '').slice(0, 10) });
    setModal('edit');
  };
  const save = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { ...form, service_id: Number(form.service_id) };
      if (modal === 'edit') await api.put(`/service-charges/${form.id}`, payload);
      else                  await api.post('/service-charges', payload);
      toast.success(modal === 'edit' ? 'Charge updated.' : 'Charge added.');
      setModal(null); await load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to save charge.');
    } finally { setSaving(false); }
  };
  const remove = async (c) => {
    if (!window.confirm(`Delete "${c.charge_name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/service-charges/${c.id}`);
      setCharges((cur) => cur.filter((item) => item.id !== c.id));
      toast.success('Charge deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to delete charge.');
    }
  };

  const detail = modal && modal.id;

  /* ── render ── */
  return (
    <div className="flex flex-col gap-6 p-2 text-white sm:p-4">

      {/* ── header ── */}
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-semibold">Service Charges</h1>
          <div className="text-sm text-gray-400">Dashboard &gt; Services &gt; Charges</div>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2.5 text-sm font-medium hover:bg-orange-600 transition-colors">
          <Plus size={18} /> Add Charge
        </button>
      </div>

      {/* ── stat cards ── */}
      <StatCards charges={charges} />

      {/* ── filter bar ── */}
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-gray-800 bg-[#1a1c23] p-4">
        {/* search */}
        <div className="relative min-w-[240px] flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search charges or services…"
            className={`${inp} pl-10`} />
        </div>

        {/* type filter */}
        <SelectInput value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="min-w-[160px]">
          <option>All Types</option>
          {types.map((t) => <option key={t}>{t}</option>)}
        </SelectInput>

        {/* status filter */}
        <SelectInput value={status} onChange={(e) => setStatus(e.target.value)} className="min-w-[140px]">
          <option>All Status</option>
          <option>Active</option>
          <option>Inactive</option>
        </SelectInput>

        {/* refresh */}
        <button onClick={load} title="Refresh" className="rounded-lg border border-gray-700 p-2.5 text-gray-400 hover:text-white transition-colors">
          <RefreshCcw size={18} />
        </button>

        {/* view toggle */}
        <div className="flex overflow-hidden rounded-lg border border-gray-700">
          <button onClick={() => setView('cards')} title="Card view"
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors ${
              view === 'cards' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button onClick={() => setView('table')} title="Table view"
            className={`flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors ${
              view === 'table' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
            }`}>
            <List size={16} />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* ── results count ── */}
      {!loading && (
        <p className="text-xs text-gray-500 -mt-3">
          Showing <span className="text-gray-300 font-medium">{filtered.length}</span> of{' '}
          <span className="text-gray-300 font-medium">{charges.length}</span> charges
          {selectedIds.length > 0 && <span className="ml-3 text-orange-400">{selectedIds.length} selected</span>}
        </p>
      )}

      {/* ══ TABLE VIEW ══ */}
      {view === 'table' && (
        <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c23]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-gray-800 text-sm text-gray-400">
                  <th className="px-4 py-4 w-12"><input type="checkbox" checked={filtered.length > 0 && filtered.every((charge) => selectedIds.includes(charge.id))} onChange={toggleAll} aria-label="Select all visible charges" className="h-4 w-4 accent-orange-500" /></th>
                  <th className="px-4 py-4 w-12">S.No</th>
                  <th className="px-4 py-4">Charge</th>
                  <th className="px-4 py-4">Service</th>
                  <th className="px-4 py-4">Breakdown</th>
                  <th className="px-4 py-4">Total</th>
                  <th className="px-4 py-4">Effective Period</th>
                  <th className="px-4 py-4">Status</th>
                  <th className="px-4 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan="9" className="px-4 py-16 text-center text-gray-400">Loading charges…</td></tr>
                )}
                {!loading && !filtered.length && (
                  <tr><td colSpan="9" className="px-4 py-16 text-center text-gray-400">No charges found.</td></tr>
                )}
                {!loading && filtered.map((c, i) => (
                  <tr key={c.id} className="border-b border-gray-800/60 hover:bg-white/[.02] transition-colors">
                    <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelected(c.id)} aria-label={`Select ${c.charge_name}`} className="h-4 w-4 accent-orange-500" /></td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-medium">{i + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.charge_name}</div>
                      <div className="text-xs text-orange-400/80 mt-0.5">{c.charge_type}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{c.service_name}</div>
                      <div className="font-mono text-xs text-gray-500">{c.service_code}</div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400">
                      <div>Base: {money(c.base_amount)}</div>
                      <div>GST: {money(c.gst_tax)}</div>
                      {n(c.discount) > 0 && <div className="text-green-400">-{money(c.discount)}</div>}
                    </td>
                    <td className="px-4 py-3 font-bold text-orange-400 text-base">{money(c.total_amount)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-300">
                      <div>{date(c.effective_from)}</div>
                      <div className="text-gray-500 text-xs">to {date(c.effective_to)}</div>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-1">
                        <button onClick={() => setModal(c)} title="View"
                          className="rounded-lg p-2 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors">
                          <Eye size={16} />
                        </button>
                        <button onClick={() => openEdit(c)} title="Edit"
                          className="rounded-lg p-2 text-gray-400 hover:bg-blue-500/20 hover:text-blue-400 transition-colors">
                          <Pencil size={16} />
                        </button>
                        <button onClick={() => remove(c)} title="Delete"
                          className="rounded-lg p-2 text-gray-400 hover:bg-red-500/20 hover:text-red-400 transition-colors">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ CARDS VIEW ══ */}
      {view === 'cards' && (
        <>
          {loading && (
            <div className="py-16 text-center text-gray-400">Loading charges…</div>
          )}
          {!loading && !filtered.length && (
            <div className="py-16 text-center text-gray-400">No charges found.</div>
          )}
          {!loading && filtered.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filtered.map((c) => (
                <div key={c.id}
                  className="flex flex-col gap-3 rounded-xl border border-gray-800 bg-[#1a1c23] p-4 hover:border-orange-500/40 transition-colors">
                  {/* top row */}
                  <div className="flex items-start justify-between gap-2">
                    <input type="checkbox" checked={selectedIds.includes(c.id)} onChange={() => toggleSelected(c.id)} aria-label={`Select ${c.charge_name}`} className="mt-1 h-4 w-4 accent-orange-500" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-white truncate">{c.charge_name}</p>
                      <p className="text-xs text-orange-400 mt-0.5">{c.charge_type}</p>
                    </div>
                    <StatusBadge status={c.status} />
                  </div>

                  {/* service */}
                  <div className="rounded-lg bg-[#0f1115] px-3 py-2">
                    <p className="text-xs text-gray-500">Service</p>
                    <p className="text-sm text-gray-200 font-medium truncate">{c.service_name}</p>
                    <p className="text-xs font-mono text-gray-500">{c.service_code}</p>
                  </div>

                  {/* amounts */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {[['Base', c.base_amount], ['GST', c.gst_tax], ['Other', c.other_charges], ['Discount', c.discount]].map(([label, val]) => (
                      <div key={label} className="rounded-lg border border-gray-800 bg-[#0f1115] px-2.5 py-2">
                        <p className="text-gray-500">{label}</p>
                        <p className={`font-medium mt-0.5 ${label === 'Discount' && n(val) > 0 ? 'text-green-400' : 'text-gray-200'}`}>
                          {label === 'Discount' && n(val) > 0 ? `-${money(val)}` : money(val)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* total */}
                  <div className="rounded-lg border border-orange-500/20 bg-orange-500/10 px-3 py-2 flex justify-between items-center">
                    <span className="text-xs text-orange-300">Total Amount</span>
                    <span className="font-bold text-orange-400">{money(c.total_amount)}</span>
                  </div>

                  {/* dates */}
                  <div className="text-xs text-gray-500 flex justify-between">
                    <span>From: <span className="text-gray-300">{date(c.effective_from)}</span></span>
                    <span>To: <span className="text-gray-300">{date(c.effective_to)}</span></span>
                  </div>

                  {/* actions */}
                  <div className="flex gap-2 border-t border-gray-800 pt-3">
                    <button onClick={() => setModal(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-gray-700 py-2 text-xs text-gray-400 hover:text-white hover:border-gray-500 transition-colors">
                      <Eye size={14} /> View
                    </button>
                    <button onClick={() => openEdit(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-blue-500/30 py-2 text-xs text-blue-400 hover:bg-blue-500/10 transition-colors">
                      <Pencil size={14} /> Edit
                    </button>
                    <button onClick={() => remove(c)}
                      className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-red-500/30 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ══ MODALS (portal) ══ */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {/* Add / Edit slide-in */}
          {(modal === 'add' || modal === 'edit') && (
            <div className="fixed inset-0 z-[100] flex w-screen justify-end bg-black/60 backdrop-blur-sm"
              onClick={() => setModal(null)}>
              <div className="h-full w-full max-w-xl overflow-y-auto border-l border-gray-700 bg-[#1a1c23] p-6 text-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex justify-between border-b border-gray-800 pb-4">
                  <h2 className="text-xl font-semibold">{modal === 'edit' ? 'Edit Charge' : 'Add Charge'}</h2>
                  <button onClick={() => setModal(null)}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white">
                    <X size={19} />
                  </button>
                </div>
                <Form value={form} services={services} editing={modal === 'edit'} saving={saving}
                  onChange={change} onSubmit={save} onCancel={() => setModal(null)} />
              </div>
            </div>
          )}

          {/* Detail view modal */}
          {detail && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm"
              onClick={() => setModal(null)}>
              <div className="w-full max-w-lg rounded-xl border border-gray-700 bg-[#1a1c23] p-6 mx-4"
                onClick={(e) => e.stopPropagation()}>
                <div className="mb-5 flex justify-between border-b border-gray-800 pb-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-orange-400">{modal.charge_type}</p>
                    <h2 className="text-xl font-semibold text-white">{modal.charge_name}</h2>
                    <p className="text-sm text-gray-400">{modal.service_name} ({modal.service_code})</p>
                  </div>
                  <button onClick={() => setModal(null)}
                    className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white">
                    <X size={19} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ['Base Amount', money(modal.base_amount)],
                    ['GST / Tax',   money(modal.gst_tax)],
                    ['Other Charges',money(modal.other_charges)],
                    ['Discount',    money(modal.discount)],
                    ['Total Amount',money(modal.total_amount)],
                    ['Status',      modal.status],
                    ['Effective From', date(modal.effective_from)],
                    ['Effective To',   date(modal.effective_to)],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-gray-800 bg-[#0f1115] p-3">
                      <p className="text-xs text-gray-500">{label}</p>
                      <p className={`mt-1 text-sm font-medium ${label === 'Total Amount' ? 'text-orange-400' : 'text-gray-200'}`}>
                        {label === 'Status' ? <StatusBadge status={value} /> : value}
                      </p>
                    </div>
                  ))}
                </div>
                {modal.remarks && (
                  <p className="mt-4 rounded-lg bg-[#0f1115] p-3 text-sm text-gray-300">{modal.remarks}</p>
                )}
                <button onClick={() => openEdit(modal)}
                  className="mt-5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium hover:bg-orange-600 transition-colors">
                  Edit charge
                </button>
              </div>
            </div>
          )}
        </>,
        document.body,
      )}
    </div>
  );
}
