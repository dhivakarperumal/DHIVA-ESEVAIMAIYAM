import { useMemo, useState } from 'react';
import { CreditCard, CheckCircle2, Clock3, XCircle, IndianRupee, Search, TrendingUp, TrendingDown, Download } from 'lucide-react';

const paymentRecords = [
  { id: 'PAY-2401', applicant: 'K. Srinivasan', service: 'Community Certificate', method: 'UPI',  amount: 120, status: 'Successful', date: '12 Sep 2026' },
  { id: 'PAY-2402', applicant: 'M. Kavitha',    service: 'Income Certificate',     method: 'Cash', amount: 120, status: 'Successful', date: '11 Sep 2026' },
  { id: 'PAY-2403', applicant: 'R. Prakash',    service: 'Nativity Certificate',   method: 'Card', amount: 150, status: 'Pending',    date: '10 Sep 2026' },
  { id: 'PAY-2404', applicant: 'P. Lakshmi',    service: 'First Graduate Certificate', method: 'UPI', amount: 100, status: 'Failed', date: '09 Sep 2026' },
  { id: 'PAY-2405', applicant: 'S. Rajkumar',   service: 'Community Certificate', method: 'Cash', amount: 120, status: 'Successful', date: '08 Sep 2026' },
  { id: 'PAY-2406', applicant: 'T. Meenakshi',  service: 'Income Certificate',    method: 'UPI',  amount: 120, status: 'Pending',    date: '07 Sep 2026' },
];

const statusDot = {
  Successful: 'bg-green-400',
  Pending:    'bg-amber-400',
  Failed:     'bg-red-400',
};
const statusBadge = {
  Successful: 'border-green-500/30 bg-green-500/15 text-green-400',
  Pending:    'border-amber-500/30 bg-amber-500/15 text-amber-400',
  Failed:     'border-red-500/30  bg-red-500/15  text-red-400',
};
const methodBadge = {
  UPI:  'border-violet-500/30 bg-violet-500/15 text-violet-400',
  Cash: 'border-blue-500/30  bg-blue-500/15  text-blue-400',
  Card: 'border-orange-500/30 bg-orange-500/15 text-orange-400',
};

const Payments = () => {
  const [query,  setQuery]  = useState('');
  const [status, setStatus] = useState('All');

  const records = useMemo(() =>
    paymentRecords.filter((r) => {
      const hay = [r.id, r.applicant, r.service, r.method].join(' ').toLowerCase();
      return hay.includes(query.toLowerCase()) && (status === 'All' || r.status === status);
    }), [query, status]);

  const totalAmount     = paymentRecords.reduce((s, r) => s + r.amount, 0);
  const successAmount   = paymentRecords.filter((r) => r.status === 'Successful').reduce((s, r) => s + r.amount, 0);
  const pendingAmount   = paymentRecords.filter((r) => r.status === 'Pending').reduce((s, r) => s + r.amount, 0);
  const failedCount     = paymentRecords.filter((r) => r.status === 'Failed').length;

  const statCards = [
    { label: 'Total Transactions', value: paymentRecords.length,           icon: CreditCard,   iconBg: 'bg-blue-500',   pct: { val: '8.3', up: true  } },
    { label: 'Total Amount',       value: `₹ ${totalAmount.toLocaleString()}`,   icon: IndianRupee,  iconBg: 'bg-orange-500', pct: { val: '11.2', up: true  } },
    { label: 'Successful',         value: `₹ ${successAmount.toLocaleString()}`, icon: CheckCircle2, iconBg: 'bg-emerald-500', pct: { val: '5.4', up: true  } },
    { label: 'Pending / Failed',   value: `${paymentRecords.filter(r => r.status === 'Pending').length} / ${failedCount}`, icon: Clock3, iconBg: 'bg-amber-500', pct: { val: '2.1', up: false }, invertColor: true },
  ];

  return (
    <section className="flex flex-col gap-6 p-2 text-white sm:p-4">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Payments</h1>
          <p className="mt-1 text-sm text-gray-400">Monitor service payments and transaction status.</p>
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              placeholder="Search by ID, applicant, service..."
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-gray-600"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="h-10 rounded-lg border border-gray-700 bg-[#0f1115] px-3 text-sm text-white outline-none"
          >
            <option value="All">All Status</option>
            <option>Successful</option>
            <option>Pending</option>
            <option>Failed</option>
          </select>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="px-5 py-3 font-medium">S.No</th>
                <th className="px-5 py-3 font-medium">Transaction ID</th>
                <th className="px-5 py-3 font-medium">Applicant</th>
                <th className="px-5 py-3 font-medium">Service</th>
                <th className="px-5 py-3 font-medium">Method</th>
                <th className="px-5 py-3 font-medium">Amount</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, i) => (
                <tr key={record.id} className="border-b border-gray-800/50 text-gray-300 transition hover:bg-white/[.02]">
                  <td className="px-5 py-4 text-sm font-medium text-gray-500">{i + 1}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-500 text-white">
                        <CreditCard size={15} />
                      </span>
                      <span className="font-semibold text-white">{record.id}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 font-medium text-white">{record.applicant}</td>
                  <td className="px-5 py-4 text-gray-400">{record.service}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${methodBadge[record.method] || 'border-gray-600 text-gray-400'}`}>
                      {record.method}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-semibold text-orange-400">₹ {record.amount.toLocaleString()}</td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${statusBadge[record.status]}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${statusDot[record.status]}`} />
                      {record.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-400">{record.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {records.length === 0 && (
            <p className="px-5 py-12 text-center text-sm text-gray-500">No payments match your filters.</p>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-800 px-5 py-3 text-sm text-gray-500">
          <span>Showing {records.length} of {paymentRecords.length} transactions</span>
          <span className="text-xs text-gray-600">Payment register</span>
        </div>
      </div>
    </section>
  );
};

export default Payments;
