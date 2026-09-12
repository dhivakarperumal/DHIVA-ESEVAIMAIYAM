import { useMemo, useState } from 'react';
import { MonitorSmartphone, Plus, Search, X } from 'lucide-react';

const initialEquipment = [
  { id: 1, name: 'Desktop Computer', assetId: 'EQ-001', category: 'Computer', center: 'Head Office', status: 'Working' },
  { id: 2, name: 'Laser Printer', assetId: 'EQ-002', category: 'Printer', center: 'Vellore Center', status: 'Working' },
  { id: 3, name: 'Biometric Scanner', assetId: 'EQ-003', category: 'Scanner', center: 'Ambur Center', status: 'Maintenance' },
  { id: 4, name: 'UPS Backup', assetId: 'EQ-004', category: 'Power', center: 'Tirupathur Center', status: 'Working' },
];

const statusStyles = {
  Working: 'bg-green-500/15 text-green-400 border-green-500/20',
  Maintenance: 'bg-orange-500/15 text-orange-400 border-orange-500/20',
  Retired: 'bg-white/10 text-white/50 border-white/10',
};

const EquipmentManagement = () => {
  const [equipment, setEquipment] = useState(initialEquipment);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [form, setForm] = useState({ name: '', assetId: '', category: '', center: '', status: 'Working' });

  const filteredEquipment = useMemo(() => equipment.filter((item) => {
    const matchesQuery = [item.name, item.assetId, item.category, item.center]
      .some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (statusFilter === 'All' || item.status === statusFilter);
  }), [equipment, query, statusFilter]);

  const submitEquipment = (event) => {
    event.preventDefault();
    setEquipment((current) => [...current, { ...form, id: Date.now() }]);
    setForm({ name: '', assetId: '', category: '', center: '', status: 'Working' });
    setIsFormOpen(false);
  };

  const workingCount = equipment.filter((item) => item.status === 'Working').length;
  const maintenanceCount = equipment.filter((item) => item.status === 'Maintenance').length;

  return (
    <section className="flex flex-col gap-6 p-2 text-white sm:p-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Equipment Management</h1>
          <p className="mt-1 text-sm text-white/50">Track equipment assigned to each E-Sevai center.</p>
        </div>
        <button
          type="button"
          onClick={() => setIsFormOpen(true)}
          className="flex items-center justify-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-orange-600"
        >
          <Plus size={17} /> Add Equipment
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Total Equipment', equipment.length, 'text-white'],
          ['Working', workingCount, 'text-green-400'],
          ['Needs Maintenance', maintenanceCount, 'text-orange-400'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#1a1b23] p-4">
            <p className="text-xs uppercase tracking-wide text-white/45">{label}</p>
            <p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1b23]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 sm:max-w-md">
            <Search size={16} className="shrink-0 text-white/40" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search equipment..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-white/10 bg-[#0d0d12] px-3 text-sm text-white outline-none"
          >
            <option>All</option>
            <option>Working</option>
            <option>Maintenance</option>
            <option>Retired</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/45">
              <tr>
                <th className="px-5 py-3">Equipment</th>
                <th className="px-5 py-3">Asset ID</th>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Center</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredEquipment.map((item) => (
                <tr key={item.id} className="text-white/75 transition hover:bg-white/[0.03]">
                  <td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400"><MonitorSmartphone size={16} /></span><span className="font-medium text-white">{item.name}</span></div></td>
                  <td className="px-5 py-4">{item.assetId}</td>
                  <td className="px-5 py-4">{item.category}</td>
                  <td className="px-5 py-4">{item.center}</td>
                  <td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[item.status]}`}>{item.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredEquipment.length === 0 && <p className="px-5 py-10 text-center text-sm text-white/45">No equipment matches the selected filters.</p>}
        </div>
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <form onSubmit={submitEquipment} className="w-full max-w-lg rounded-xl border border-white/10 bg-[#1a1b23] p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-semibold">Add Equipment</h2><button type="button" onClick={() => setIsFormOpen(false)} className="text-white/50 hover:text-white" aria-label="Close"><X size={18} /></button></div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ['name', 'Equipment name'],
                ['assetId', 'Asset ID'],
                ['category', 'Category'],
                ['center', 'Center'],
              ].map(([key, label]) => <label key={key} className="text-sm text-white/60">{label}<input required value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white outline-none focus:border-orange-500" /></label>)}
              <label className="text-sm text-white/60">Status<select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 w-full rounded-lg border border-white/10 bg-[#0d0d12] px-3 py-2 text-white outline-none"><option>Working</option><option>Maintenance</option><option>Retired</option></select></label>
            </div>
            <button type="submit" className="mt-6 w-full rounded-md bg-orange-500 py-2.5 text-sm font-medium text-white hover:bg-orange-600">Save Equipment</button>
          </form>
        </div>
      )}
    </section>
  );
};

export default EquipmentManagement;
