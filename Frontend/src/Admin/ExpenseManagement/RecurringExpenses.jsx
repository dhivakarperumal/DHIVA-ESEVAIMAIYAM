import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCcw, RepeatIcon, AlertTriangle, Calendar, CheckCircle2, Clock, IndianRupee } from 'lucide-react';

const API = 'http://localhost:5000/api/expenses';
const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const RecurringExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRecurring = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/recurring/list`);
      if (res.data.success) setExpenses(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRecurring(); }, []);

  const overdue = expenses.filter(e => e.is_overdue);
  const upcoming = expenses.filter(e => !e.is_overdue);
  const totalMonthly = expenses.reduce((s, e) => s + parseFloat(e.amount || 0), 0);

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Recurring Expenses</h1>
          <div className="text-sm text-gray-400 flex items-center gap-2"><span>Dashboard</span><span className="text-gray-600">&gt;</span><span>Expense Management</span><span className="text-gray-600">&gt;</span><span className="text-gray-200">Recurring</span></div>
        </div>
        <button onClick={fetchRecurring} className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"><RefreshCcw size={18} /></button>
      </div>

      {/* Stats */}
      {(() => {
        const cards = [
          { label: 'Total Recurring', value: expenses.length, icon: RepeatIcon,    iconBg: 'bg-purple-600', pct: { val: '4.1',  up: true  } },
          { label: 'Overdue',         value: overdue.length,  icon: AlertTriangle, iconBg: 'bg-red-600',    pct: { val: '2.0',  up: false }, invertColor: true },
          { label: 'Upcoming',        value: upcoming.length, icon: Clock,         iconBg: 'bg-yellow-500', pct: { val: '1.5',  up: true  } },
          { label: 'Total Committed', value: fmt(totalMonthly), icon: IndianRupee, iconBg: 'bg-orange-500', pct: { val: '10.2', up: true  } },
        ];
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map(s => {
              const isPositive = s.invertColor ? !s.pct.up : s.pct.up;
              return (
                <div key={s.label} className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
                  <div className={`${s.iconBg} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg`}>
                    <s.icon size={22} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-400 truncate">{s.label}</p>
                    <p className="text-3xl font-bold text-white leading-tight">{s.value}</p>
                    <p className={`mt-0.5 text-xs font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                      {s.pct.up ? '↗' : '↘'} {s.pct.val}% from last month
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        );
      })()}

      {overdue.length > 0 && (
        <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400">
          <AlertTriangle size={20} className="shrink-0" />
          <span className="text-sm font-medium">{overdue.length} recurring expense{overdue.length > 1 ? 's are' : ' is'} overdue! Please make the payments and update the records.</span>
        </div>
      )}

      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="py-4 px-4 pl-6 font-medium w-10">S.No</th>
                <th className="py-4 px-4 font-medium">Expense</th>
                <th className="py-4 px-4 font-medium">Category</th>
                <th className="py-4 px-4 font-medium">Amount</th>
                <th className="py-4 px-4 font-medium">Frequency</th>
                <th className="py-4 px-4 font-medium">Next Payment</th>
                <th className="py-4 px-4 font-medium">Vendor</th>
                <th className="py-4 px-4 pr-6 font-medium text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-16 text-center text-orange-500"><RefreshCcw className="animate-spin inline mr-2" size={20} />Loading...</td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={8} className="py-16 text-center text-gray-500">No recurring expenses.<br /><a href="#/admin/expense-management/add" className="text-orange-500 hover:underline text-sm">Create one →</a></td></tr>
              ) : expenses.map((e, idx) => (
                <tr key={e.id} className={`border-b border-gray-800/50 transition-colors ${e.is_overdue ? 'bg-red-500/5 hover:bg-red-500/10' : 'hover:bg-white/[.02]'}`}>
                  <td className="py-3 px-4 pl-6 text-sm text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${e.is_overdue ? 'bg-red-500 text-white' : 'bg-purple-600 text-white'}`}><RepeatIcon size={18} /></div>
                      <div>
                        <p className="font-medium text-white">{e.expense_title}</p>
                        <p className="text-xs text-orange-400 font-mono">{e.expense_id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{e.category_name}</td>
                  <td className="py-3 px-4 text-orange-400 font-semibold">{fmt(e.amount)}</td>
                  <td className="py-3 px-4">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium">{e.recurring_type}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className={`text-sm font-medium ${e.is_overdue ? 'text-red-400' : 'text-gray-300'}`}>
                      {fmtDate(e.next_payment_date)}
                      {e.is_overdue && <span className="ml-2 text-xs text-red-500 font-bold">OVERDUE</span>}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-sm">{e.vendor_name || '-'}</td>
                  <td className="py-3 px-4 pr-6 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border ${
                      e.is_overdue
                        ? 'bg-red-500/15 text-red-400 border-red-500/30'
                        : 'bg-green-500/15 text-green-400 border-green-500/30'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${e.is_overdue ? 'bg-red-400' : 'bg-green-400'}`} />
                      {e.is_overdue ? 'Overdue' : 'Active'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecurringExpenses;
