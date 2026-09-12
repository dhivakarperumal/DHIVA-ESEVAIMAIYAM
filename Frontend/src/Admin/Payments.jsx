import { useMemo, useState } from 'react';
import { CreditCard, Search } from 'lucide-react';

const paymentRecords = [
  { id: 'PAY-2401', applicant: 'K. Srinivasan', service: 'Community Certificate', method: 'UPI', amount: 120, status: 'Successful', date: '12 Sep 2026' },
  { id: 'PAY-2402', applicant: 'M. Kavitha', service: 'Income Certificate', method: 'Cash', amount: 120, status: 'Successful', date: '11 Sep 2026' },
  { id: 'PAY-2403', applicant: 'R. Prakash', service: 'Nativity Certificate', method: 'Card', amount: 150, status: 'Pending', date: '10 Sep 2026' },
  { id: 'PAY-2404', applicant: 'P. Lakshmi', service: 'First Graduate Certificate', method: 'UPI', amount: 100, status: 'Failed', date: '09 Sep 2026' },
];

const statusStyles = {
  Successful: 'bg-green-500/15 text-green-400 border-green-500/20',
  Pending: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20',
  Failed: 'bg-red-500/15 text-red-400 border-red-500/20',
};

const Payments = () => {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All');

  const records = useMemo(() => paymentRecords.filter((record) => {
    const matchesQuery = [record.id, record.applicant, record.service, record.method]
      .some((value) => value.toLowerCase().includes(query.toLowerCase()));
    return matchesQuery && (status === 'All' || record.status === status);
  }), [query, status]);

  const successfulAmount = paymentRecords.filter((item) => item.status === 'Successful').reduce((sum, item) => sum + item.amount, 0);
  const pendingAmount = paymentRecords.filter((item) => item.status === 'Pending').reduce((sum, item) => sum + item.amount, 0);

  return (
    <section className="flex flex-col gap-6 p-2 text-white sm:p-4">
      <div>
        <h1 className="text-2xl font-semibold">Payments</h1>
        <p className="mt-1 text-sm text-white/50">Monitor service payments and transaction status.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          ['Total Transactions', paymentRecords.length, 'text-white'],
          ['Successful Amount', `₹ ${successfulAmount.toLocaleString()}`, 'text-green-400'],
          ['Pending Amount', `₹ ${pendingAmount.toLocaleString()}`, 'text-yellow-400'],
        ].map(([label, value, color]) => (
          <div key={label} className="rounded-xl border border-white/10 bg-[#1a1b23] p-4"><p className="text-xs uppercase tracking-wide text-white/45">{label}</p><p className={`mt-2 text-2xl font-semibold ${color}`}>{value}</p></div>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border border-white/10 bg-[#1a1b23]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 sm:max-w-md"><Search size={16} className="shrink-0 text-white/40" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search payments..." className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/30" /></div>
          <select value={status} onChange={(event) => setStatus(event.target.value)} className="h-10 rounded-lg border border-white/10 bg-[#0d0d12] px-3 text-sm text-white outline-none"><option>All</option><option>Successful</option><option>Pending</option><option>Failed</option></select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/45"><tr><th className="px-5 py-3">Transaction</th><th className="px-5 py-3">Applicant</th><th className="px-5 py-3">Service</th><th className="px-5 py-3">Method</th><th className="px-5 py-3">Amount</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Date</th></tr></thead>
            <tbody className="divide-y divide-white/5">
              {records.map((record) => <tr key={record.id} className="text-white/75 transition hover:bg-white/[0.03]"><td className="px-5 py-4"><div className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/15 text-orange-400"><CreditCard size={16} /></span><span className="font-medium text-white">{record.id}</span></div></td><td className="px-5 py-4">{record.applicant}</td><td className="px-5 py-4">{record.service}</td><td className="px-5 py-4">{record.method}</td><td className="px-5 py-4 font-medium text-white">₹ {record.amount.toLocaleString()}</td><td className="px-5 py-4"><span className={`rounded-full border px-2.5 py-1 text-xs ${statusStyles[record.status]}`}>{record.status}</span></td><td className="px-5 py-4">{record.date}</td></tr>)}
            </tbody>
          </table>
          {records.length === 0 && <p className="px-5 py-10 text-center text-sm text-white/45">No payments match your filters.</p>}
        </div>
      </div>
    </section>
  );
};

export default Payments;
