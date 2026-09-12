import React from 'react';
import { useAuth } from '../PrivateRouter/AuthContext';
import {
  FileText, Clock, CheckCircle2, IndianRupee, Users, ArrowUpRight, ArrowDownRight,
  UserPlus, Briefcase, FileSignature, Receipt, Megaphone, Settings, Database, FolderKanban,
  TrendingUp, TrendingDown, BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const { profileName } = useAuth();
  const name = profileName?.split(' ')[0] || 'Admin';

  const lineData = [
    { name: 'May 1', submitted: 180, completed: 80 }, { name: 'May 6', submitted: 260, completed: 150 },
    { name: 'May 11', submitted: 350, completed: 220 }, { name: 'May 16', submitted: 400, completed: 250 },
    { name: 'May 21', submitted: 420, completed: 350 }, { name: 'May 26', submitted: 480, completed: 410 },
    { name: 'May 31', submitted: 550, completed: 490 },
  ];

  const pieDataStatus = [
    { name: 'Completed', value: 786, color: '#22c55e' }, { name: 'Pending', value: 162, color: '#eab308' },
    { name: 'In Progress', value: 210, color: '#3b82f6' }, { name: 'Rejected', value: 90, color: '#ef4444' },
  ];

  const pieDataExpense = [
    { name: 'Salaries', value: 12000, color: '#f97316' }, { name: 'Utilities', value: 6500, color: '#3b82f6' },
    { name: 'Rent', value: 5000, color: '#22c55e' }, { name: 'Maintenance', value: 3200, color: '#a855f7' },
    { name: 'Others', value: 5700, color: '#eab308' },
  ];

  return (
    <div className="min-h-screen space-y-6 pb-6 text-white">
      <div>
        <h1 className="text-xl font-bold sm:text-2xl">Vanakkam, <span className="text-[#f8740e]">{name}! 👋</span></h1>
        <p className="mt-1 text-sm text-white/60 sm:text-base">Welcome to E-Sevai Maiyam Admin Dashboard</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[
          { icon: FileText, label: 'Total Applications', value: '1,248', change: '18.6%', type: 'up', bg: 'bg-blue-500/20 text-blue-500' },
          { icon: Clock, label: 'Pending Applications', value: '162', change: '8.3%', type: 'down', bg: 'bg-green-500/20 text-green-500' },
          { icon: CheckCircle2, label: 'Completed Today', value: '85', change: '24.7%', type: 'up', bg: 'bg-purple-500/20 text-purple-500' },
          { icon: IndianRupee, label: 'Total Revenue', value: '₹ 48,750', change: '15.2%', type: 'up', bg: 'bg-orange-500/20 text-orange-500' },
          { icon: Users, label: 'Registered Users', value: '532', change: '12.4%', type: 'up', bg: 'bg-teal-500/20 text-teal-500' }
        ].map((s, i) => (
          <div key={i} className="flex min-h-[140px] flex-col justify-between rounded-2xl border border-white/5 bg-[#1a1b23] p-4 sm:p-5">
            <div className="mb-4 flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.bg}`}><s.icon size={20} /></div>
              <div className="min-w-0">
                <p className="text-xs text-white/60">{s.label}</p>
                <p className="text-lg font-bold sm:text-xl">{s.value}</p>
              </div>
            </div>
            <div className={`text-xs font-medium flex items-center gap-1 ${s.type === 'up' ? 'text-green-500' : 'text-orange-500'}`}>
              {s.type === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {s.change} <span className="text-white/40">from {s.type === 'down' ? 'last month' : 'last month'}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[#1a1b23] p-4 sm:p-5 lg:col-span-2 xl:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-sm">Application Overview</h2>
            <select className="bg-[#0d0d12] border border-white/10 rounded-lg px-2 py-1 text-xs text-white/70"><option>This Month</option></select>
          </div>
          <div className="h-48 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#ffffff40" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{backgroundColor: '#1a1b23', borderColor: '#ffffff20'}} />
                <Line type="monotone" dataKey="submitted" stroke="#f8740e" strokeWidth={3} dot={{r:4}} />
                <Line type="monotone" dataKey="completed" stroke="#3b82f6" strokeWidth={3} dot={{r:4}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3 border-t border-white/10 pt-4 text-center">
            <div><p className="text-white/50 text-xs">This Month</p><p className="text-[#f8740e] font-bold">1,248</p></div>
            <div><p className="text-white/50 text-xs">Last Month</p><p className="text-[#3b82f6] font-bold">1,052</p></div>
            <div><p className="text-white/50 text-xs">Growth</p><p className="text-green-500 font-bold">18.6%</p></div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#1a1b23] p-4 sm:p-5">
          <h2 className="font-bold text-sm mb-4">Applications by Status</h2>
          <div className="flex items-center justify-center relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieDataStatus} innerRadius={60} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                  {pieDataStatus.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{backgroundColor: '#1a1b23', borderColor: '#ffffff20'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center"><p className="text-xl font-bold">1,248</p><p className="text-white/50 text-[10px]">Total</p></div>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {pieDataStatus.map((s, i) => (
              <div key={i} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full" style={{backgroundColor: s.color}}></span><div><p className="text-xs">{s.name}</p><p className="text-[10px] text-white/50">{s.value} ({(s.value/1248*100).toFixed(1)}%)</p></div></div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#1a1b23] p-4 sm:p-5">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-sm">Recent Applications</h2>
            <button className="text-[#f8740e] text-xs">View All</button>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Community Certificate', name: 'K. Srinivasan', time: '10 min ago', status: 'Pending', icon: FileSignature, colorClass: 'bg-orange-500/20 text-orange-500' },
              { title: 'Income Certificate', name: 'M. Kavitha', time: '25 min ago', status: 'Completed', icon: FileText, colorClass: 'bg-green-500/20 text-green-500' },
              { title: 'Nativity Certificate', name: 'R. Prakash', time: '40 min ago', status: 'In Progress', icon: FileText, colorClass: 'bg-blue-500/20 text-blue-500' },
              { title: 'First Graduate Certificate', name: 'S. Dinesh', time: '1 hour ago', status: 'Pending', icon: FileSignature, colorClass: 'bg-orange-500/20 text-orange-500' },
              { title: 'Family Certificate', name: 'P. Lakshmi', time: '2 hours ago', status: 'Rejected', icon: FileText, colorClass: 'bg-red-500/20 text-red-500' }
            ].map((app, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/3 p-2 sm:p-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${app.colorClass}`}><app.icon size={18} /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{app.title}</p>
                  <p className="text-xs text-white/50">Applicant: {app.name}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className={`text-[10px] font-bold ${app.status === 'Completed' ? 'text-green-500' : app.status === 'Pending' ? 'text-orange-500' : app.status === 'Rejected' ? 'text-red-500' : 'text-blue-500'}`}>{app.status}</p>
                  <p className="text-[10px] text-white/30">{app.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-white/5 bg-[#1a1b23] p-4 sm:p-5 lg:col-span-2 xl:col-span-1">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-sm">Expense Overview</h2>
            <button className="text-[#f8740e] text-xs">View All</button>
          </div>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div><p className="text-white/50 text-[10px]">Total Expenses</p><p className="text-sm font-bold flex items-center gap-1">₹ 32,400 <Briefcase size={12} className="text-blue-500"/></p></div>
            <div><p className="text-white/50 text-[10px]">This Month</p><p className="text-sm font-bold flex items-center gap-1">₹ 12,750 <TrendingUp size={12} className="text-green-500"/></p></div>
            <div><p className="text-white/50 text-[10px]">Last Month</p><p className="text-sm font-bold flex items-center gap-1">₹ 19,650 <TrendingDown size={12} className="text-purple-500"/></p></div>
          </div>
          <h3 className="mb-2 text-xs font-semibold">Expenses by Category</h3>
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieDataExpense} innerRadius={25} outerRadius={40} paddingAngle={2} dataKey="value" stroke="none">
                    {pieDataExpense.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center"><p className="text-xs font-bold leading-none">₹ 32,400</p><p className="text-[8px] text-white/50">Total</p></div>
            </div>
            <div className="w-full space-y-1.5">
              {pieDataExpense.map((s, i) => (
                <div key={i} className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full" style={{backgroundColor: s.color}}></span><span className="text-[10px] text-white/80">{s.name}</span></div><span className="text-[10px] text-white/50">₹ {(s.value).toLocaleString()} ({(s.value/32400*100).toFixed(1)}%)</span></div>
              ))}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#1a1b23] p-4 sm:p-5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-bold text-sm">Top Expenses</h2>
            <button className="text-[#f8740e] text-xs">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-[520px] w-full text-left text-xs text-white/70">
              <thead>
                <tr className="border-b border-white/10 text-white/60">
                  <th className="pb-2 pr-2 font-medium">Category</th>
                  <th className="pb-2 pr-2 font-medium">Amount</th>
                  <th className="pb-2 pr-2 font-medium">Date</th>
                  <th className="pb-2 font-medium">Vendor</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { cat: 'Salaries', amt: '12,000', date: '20 May 2025', vendor: 'Staff Payroll', color: 'bg-orange-500' },
                  { cat: 'Electricity Bill', amt: '4,200', date: '18 May 2025', vendor: 'TNEB', color: 'bg-blue-500' },
                  { cat: 'Rent', amt: '5,000', date: '15 May 2025', vendor: 'Building Owner', color: 'bg-green-500' },
                  { cat: 'Internet Bill', amt: '2,300', date: '12 May 2025', vendor: 'BSNL', color: 'bg-purple-500' },
                  { cat: 'Stationery', amt: '1,450', date: '10 May 2025', vendor: 'Sundaram Stores', color: 'bg-orange-500' },
                ].map((r, i) => (
                  <tr key={i} className="border-b border-white/5 align-middle">
                    <td className="py-2 pr-2 text-white"><span className="mr-2 inline-block h-2 w-2 rounded-full align-middle ${r.color}"></span>{r.cat}</td>
                    <td className="py-2 pr-2">₹ {r.amt}</td>
                    <td className="py-2 pr-2">{r.date}</td>
                    <td className="py-2">{r.vendor}</td>
                  </tr>
                ))}
                <tr className="text-white font-bold">
                  <td className="pt-3">Total</td>
                  <td className="pt-3 text-[#f8740e]">₹ 24,950</td>
                  <td className="pt-3"></td>
                  <td className="pt-3"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-white/5 bg-[#1a1b23] p-4 sm:p-5">
          <h2 className="font-bold text-sm mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              { icon: UserPlus, label: 'Add New User', color: 'text-orange-500' },
              { icon: FileSignature, label: 'Add New Service', color: 'text-orange-500' },
              { icon: FolderKanban, label: 'New Application', color: 'text-orange-500' },
              { icon: Receipt, label: 'Add Expense', color: 'text-pink-500' },
              { icon: BarChart3, label: 'Generate Report', color: 'text-purple-500' },
              { icon: Megaphone, label: 'Send Announcement', color: 'text-green-500' },
              { icon: Settings, label: 'System Settings', color: 'text-blue-500' },
              { icon: Database, label: 'Backup Data', color: 'text-cyan-500' },
              { icon: FileText, label: 'Audit Logs', color: 'text-gray-400' },
            ].map((a, i) => (
              <button key={i} className="flex min-h-[88px] flex-col items-center justify-center gap-2 rounded-xl border border-white/5 bg-white/5 p-3 text-center transition hover:bg-white/10">
                <a.icon size={20} className={a.color} />
                <span className="text-[10px] text-white/70">{a.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;