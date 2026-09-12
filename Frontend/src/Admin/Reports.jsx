import { useState } from 'react';
import { BarChart3, CalendarDays, CheckCircle2, Download, FileText, IndianRupee, TrendingUp, Users } from 'lucide-react';

const reportData = {
  Today: { applications: 42, completed: 31, revenue: 48750, expenses: 12750 },
  Week: { applications: 286, completed: 224, revenue: 284500, expenses: 73400 },
  Month: { applications: 1248, completed: 986, revenue: 1124500, expenses: 324000 },
  Year: { applications: 14280, completed: 11840, revenue: 12840000, expenses: 3860000 },
};

const serviceRows = [
  { name: 'Community Certificate', applications: 286, completed: 244, revenue: 34320, progress: 85 },
  { name: 'Income Certificate', applications: 242, completed: 211, revenue: 29040, progress: 87 },
  { name: 'Nativity Certificate', applications: 198, completed: 156, revenue: 23760, progress: 79 },
  { name: 'First Graduate Certificate', applications: 174, completed: 131, revenue: 20880, progress: 75 },
];

const Reports = () => {
  const [period, setPeriod] = useState('Month');
  const data = reportData[period];
  const completionRate = Math.round((data.completed / data.applications) * 100);
  const netRevenue = data.revenue - data.expenses;

  return (
    <section className="flex flex-col gap-6 p-2 text-white sm:p-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div><h1 className="text-2xl font-semibold">Overall Reports</h1><p className="mt-1 text-sm text-white/50">A complete view of applications, revenue, expenses, and service performance.</p></div>
        <div className="flex items-center gap-3">
          <div className="flex h-10 items-center gap-2 rounded-lg border border-white/10 bg-[#1a1b23] px-3"><CalendarDays size={15} className="text-orange-400" /><select value={period} onChange={(event) => setPeriod(event.target.value)} className="bg-transparent text-sm text-white outline-none"><option>Today</option><option>Week</option><option>Month</option><option>Year</option></select></div>
          <button type="button" onClick={() => window.print()} className="flex h-10 items-center gap-2 rounded-lg bg-orange-500 px-3 text-sm font-medium hover:bg-orange-600"><Download size={16} /> Export</button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Applications', data.applications.toLocaleString(), FileText, 'text-blue-400'],
          ['Completed', data.completed.toLocaleString(), CheckCircle2, 'text-green-400'],
          ['Revenue', `₹ ${data.revenue.toLocaleString()}`, IndianRupee, 'text-orange-400'],
          ['Net Revenue', `₹ ${netRevenue.toLocaleString()}`, TrendingUp, 'text-cyan-400'],
        ].map(([label, value, Icon, color]) => <div key={label} className="rounded-xl border border-white/10 bg-[#1a1b23] p-5"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-wide text-white/45">{label}</p><Icon size={18} className={color} /></div><p className="mt-3 text-2xl font-semibold">{value}</p></div>)}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-white/10 bg-[#1a1b23] p-5 lg:col-span-2"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-semibold">Service Performance</h2><p className="mt-1 text-xs text-white/45">Top services for the selected period</p></div><BarChart3 size={20} className="text-orange-400" /></div><div className="space-y-5">{serviceRows.map((service) => <div key={service.name}><div className="mb-2 flex justify-between gap-4 text-sm"><span className="truncate text-white/80">{service.name}</span><span className="shrink-0 text-white/50">{service.completed}/{service.applications}</span></div><div className="h-2 rounded-full bg-white/10"><div className="h-2 rounded-full bg-orange-500" style={{ width: `${service.progress}%` }} /></div><div className="mt-1 flex justify-between text-xs text-white/40"><span>{service.progress}% completion</span><span>₹ {service.revenue.toLocaleString()}</span></div></div>)}</div></div>
        <div className="rounded-xl border border-white/10 bg-[#1a1b23] p-5"><h2 className="font-semibold">Report Summary</h2><div className="mt-5 space-y-4 text-sm"><div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-white/50">Completion rate</span><span className="font-semibold text-green-400">{completionRate}%</span></div><div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-white/50">Total expenses</span><span className="font-semibold">₹ {data.expenses.toLocaleString()}</span></div><div className="flex items-center justify-between border-b border-white/10 pb-4"><span className="text-white/50">Average application value</span><span className="font-semibold">₹ {Math.round(data.revenue / data.applications).toLocaleString()}</span></div><div className="flex items-center justify-between"><span className="text-white/50">Active centers</span><span className="flex items-center gap-1 font-semibold"><Users size={15} className="text-orange-400" /> 8</span></div></div></div>
      </div>

      <div className="rounded-xl border border-white/10 bg-[#1a1b23] p-5"><h2 className="mb-4 font-semibold">Financial Overview</h2><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><div className="rounded-lg bg-green-500/10 p-4"><p className="text-xs text-white/50">Income</p><p className="mt-1 text-xl font-semibold text-green-400">₹ {data.revenue.toLocaleString()}</p></div><div className="rounded-lg bg-red-500/10 p-4"><p className="text-xs text-white/50">Expenses</p><p className="mt-1 text-xl font-semibold text-red-400">₹ {data.expenses.toLocaleString()}</p></div><div className="rounded-lg bg-orange-500/10 p-4"><p className="text-xs text-white/50">Balance</p><p className="mt-1 text-xl font-semibold text-orange-400">₹ {netRevenue.toLocaleString()}</p></div></div></div>
    </section>
  );
};

export default Reports;
