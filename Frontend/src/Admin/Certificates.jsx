import { useMemo, useState } from 'react';
import { FileText, Search } from 'lucide-react';

const certificateRecords = [
  { id: 'CERT-1001', applicant: 'K. Srinivasan', type: 'Community Certificate', center: 'Head Office', status: 'Pending', submitted: '12 Sep 2026' },
  { id: 'CERT-1002', applicant: 'M. Kavitha', type: 'Income Certificate', center: 'Vellore Center', status: 'Approved', submitted: '11 Sep 2026' },
  { id: 'CERT-1003', applicant: 'R. Prakash', type: 'Nativity Certificate', center: 'Ambur Center', status: 'In Progress', submitted: '10 Sep 2026' },
  { id: 'CERT-1004', applicant: 'P. Lakshmi', type: 'First Graduate Certificate', center: 'Tirupathur Center', status: 'Rejected', submitted: '09 Sep 2026' },
];

const statusStyles = {
  Approved: 'bg-green-500/15 text-green-400 border-green-500/20',
  Pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  'In Progress': 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  Rejected: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const Certificates = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  const records = useMemo(() => certificateRecords.filter((record) => {
    const matchesQuery = [record.id, record.applicant, record.type, record.center]
      .some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (status === 'All' || record.status === status);
  }), [query, status]);

  return (
    <section className="flex flex-col gap-6 p-2 text-white sm:p-4">
      <div>
        <h1 className="text-2xl font-semibold">Certificates</h1>
        <p className="mt-1 text-sm text-white/50">Review and track certificate applications from all centers.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ['Total', certificateRecords.length, 'text-white'],
          ['Approved', certificateRecords.filter((item) => item.status === 'Approved').length, 'text-green-400'],
          ['Pending', certificateRecords.filter((item) => item.status === 'Pending').length, 'text-yellow-400'],
          ['In Progress', certificateRecords.filter((item) => item.status === 'In Progress').length, 'text-blue-400'],
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
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search certificates..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" />
          </div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-white/10 bg-[#0d0d12] px-3 text-sm text-white outline-none">
            <option>All</option><option>Pending</option><option>In Progress</option><option>Approved</option><option>Rejected</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/45"><tr><th className="px-5 py-3">Application</th><th className="px-5 py-3">Applicant</th><th className="px-5 py-3">Certificate Type</th><th className="px-5 py-3">Center</th><th className="px-5 py-3">Submitted</th><th className="px-5 py-3">Status</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {records.map((record) => <tr key={record.id} className="text-white/75 transition hover:bg-white/[0.03]"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400"><FileText size={16} /></span><span className="font-medium text-white">{record.id}</span></div></td><td className="px-5 py-4">{record.applicant}</td><td className="px-5 py-4">{record.type}</td><td className="px-5 py-4">{record.center}</td><td className="px-5 py-4">{record.submitted}</td><td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[record.status]}`}>{record.status}</span></td></tr>)}
            </tbody>
          </table>
          {records.length === 0 && <p className="px-5 py-10 text-center text-sm text-white/45">No certificate applications match your filters.</p>}
        </div>
      </div>
    </section>
  );
};

export default Certificates;
