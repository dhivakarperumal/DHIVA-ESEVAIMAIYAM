import { useMemo, useState } from 'react';
import { FileText, CheckCircle2, Clock3, Loader2, XCircle, Search, TrendingUp, TrendingDown, Download } from 'lucide-react';

const certificateRecords = [
  { id: 'CERT-1001', applicant: 'K. Srinivasan', type: 'Community Certificate',       center: 'Head Office',      status: 'Pending',     submitted: '12 Sep 2026' },
  { id: 'CERT-1002', applicant: 'M. Kavitha',    type: 'Income Certificate',          center: 'Vellore Center',   status: 'Approved',    submitted: '11 Sep 2026' },
  { id: 'CERT-1003', applicant: 'R. Prakash',    type: 'Nativity Certificate',        center: 'Ambur Center',     status: 'In Progress', submitted: '10 Sep 2026' },
  { id: 'CERT-1004', applicant: 'P. Lakshmi',    type: 'First Graduate Certificate',  center: 'Tirupathur Center',status: 'Rejected',    submitted: '09 Sep 2026' },
  { id: 'CERT-1005', applicant: 'S. Rajkumar',   type: 'Community Certificate',       center: 'Head Office',      status: 'Approved',    submitted: '08 Sep 2026' },
  { id: 'CERT-1006', applicant: 'T. Meenakshi',  type: 'Income Certificate',          center: 'Vellore Center',   status: 'Pending',     submitted: '07 Sep 2026' },
];

const statusDot = {
  Approved:     'bg-green-400',
  Pending:      'bg-amber-400',
  'In Progress':'bg-blue-400',
  Rejected:     'bg-red-400',
};
const statusBadge = {
  Approved:     'border-green-500/30  bg-green-500/15  text-green-400',
  Pending:      'border-amber-500/30  bg-amber-500/15  text-amber-400',
  'In Progress':'border-blue-500/30   bg-blue-500/15   text-blue-400',
  Rejected:     'border-red-500/30    bg-red-500/15    text-red-400',
};

const Certificates = () => {
  const [query,  setQuery]  = useState('');
  const [status, setStatus] = useState('All');

  const records = useMemo(() =>
    certificateRecords.filter((r) => {
      const hay = [r.id, r.applicant, r.type, r.center].join(' ').toLowerCase();
      return hay.includes(query.toLowerCase()) && (status === 'All' || r.status === status);
    }), [query, status]);

  const total      = certificateRecords.length;
  const approved   = certificateRecords.filter((r) => r.status === 'Approved').length;
  const pending    = certificateRecords.filter((r) => r.status === 'Pending').length;
  const inProgress = certificateRecords.filter((r) => r.status === 'In Progress').length;

  const statCards = [
    { label: 'Total Certificates', value: total,      icon: FileText,    iconBg: 'bg-blue-500',   pct: { val: '9.4', up: true  } },
    { label: 'Approved',           value: approved,   icon: CheckCircle2,iconBg: 'bg-emerald-500', pct: { val: '5.2', up: true  } },
    { label: 'Pending',            value: pending,    icon: Clock3,      iconBg: 'bg-amber-500',  pct: { val: '1.8', up: false }, invertColor: true },
    { label: 'In Progress',        value: inProgress, icon: Loader2,     iconBg: 'bg-sky-500',    pct: { val: '3.1', up: true  } },
  ];

  return (
    <section className="flex flex-col gap-6 p-2 text-white sm:p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Certificates</h1>
          <p className="mt-1 text-sm text-gray-400">Review and track certificate applications from all centers.</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600 transition-colors"
        >
          <Download size={16} /> Export
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((s) => {
          const isPositive = s.invertColor ? !s.pct.up : s.pct.up;
          return (
            <div key={s.label} className="flex items-center gap-4 rounded-xl border border-gray-800 bg-[#1a1c23] p-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg ${s.iconBg}`}>
                <s.icon size={22} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-400">{s.label}</p>
                <p className="truncate text-3xl font-bold leading-tight text-white">{s.value}</p>
                <p className={`mt-0.5 flex items-center gap-1 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                  {s.pct.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                  <span>{s.pct.val}% from last month</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Table Panel */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c23]">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-gray-800 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-gray-700 bg-[#0f1115] px-3 sm:max-w-sm">
            <Search size={16} className="shrink-0 text-gray-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by ID, applicant, type..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-lg border border-gray-700 bg-[#0f1115] px-3 text-sm text-white outline-none"
          >
            <option value="All">All Status</option>
            <option>Pending</option>
            <option>In Progress</option>
            <option>Approved</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="px-5 py-3 font-medium">S.No</th>
                <th className="px-5 py-3 font-medium">Application ID</th>
                <th className="px-5 py-3 font-medium">Applicant</th>
                <th className="px-5 py-3 font-medium">Certificate Type</th>
                <th className="px-5 py-3 font-medium">Center</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
                <th className="px-5 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, i) => (
                <tr key={record.id} className="border-b border-gray-800/50 text-gray-300 transition hover:bg-white/[.02]">
                  <td className="px-5 py-4 text-sm font-medium text-gray-500">{i + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
                        <FileText size={15} />
                      </span>
                      <span className="font-semibold text-white">{record.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{record.applicant}</td>
                  <td className="px-5 py-4 text-gray-400">{record.type}</td>
                  <td className="px-5 py-4 text-gray-400">{record.center}</td>
                  <td className="px-5 py-4 text-gray-400">{record.submitted}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${statusBadge[record.status]}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[record.status]}`} />
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-gray-500">No certificate applications match your filters.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-800 px-5 py-3 text-sm text-gray-500">
          <span>Showing {records.length} of {certificateRecords.length} certificates</span>
          <span className="text-xs text-gray-600">Certificate register</span>
        </div>
      </div>
    </section>
  );
};

export default Certificates;
