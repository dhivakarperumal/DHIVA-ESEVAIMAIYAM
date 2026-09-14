import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp, TrendingDown, AlertCircle, RepeatIcon,
  BarChart2, RefreshCcw, Calendar, ChevronRight,
  Wallet, ShoppingBag, Smartphone, IndianRupee,
  CheckCircle2, Clock,
} from 'lucide-react';

const API = 'http://localhost:5000/api/expenses';
const fmt = (val) => `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* ── Solid-icon stat card (matches all other pages) ── */
const StatCard = ({ title, value, icon: Icon, iconBg, sub, trend, invertColor }) => {
  const isPositive = invertColor ? (trend < 0) : (trend >= 0);
  return (
    <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
      {/* solid coloured icon box */}
      <div className={`${iconBg} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg`}>
        <Icon size={22} className="text-white" />
      </div>
      {/* text */}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-gray-400 truncate">{title}</p>
        <p className="text-3xl font-bold text-white leading-tight truncate">{value}</p>
        {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
        {trend !== undefined && (
          <p className={`mt-0.5 text-xs font-medium flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />}
            <span>{Math.abs(trend)}% from last month</span>
          </p>
        )}
      </div>
    </div>
  );
};

/* ── Mini bar chart ── */
const MiniChart = ({ data }) => {
  if (!data || data.length === 0)
    return <div className="text-gray-600 text-sm text-center py-8">No data</div>;
  const max = Math.max(...data.map((d) => parseFloat(d.total)));
  return (
    <div className="flex items-end gap-1 h-24 mt-4">
      {data.slice(-12).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
          <div
            className="w-full bg-orange-500/80 rounded-t hover:bg-orange-400 transition-all cursor-pointer"
            style={{ height: `${max > 0 ? (parseFloat(d.total) / max) * 100 : 0}%`, minHeight: '4px' }}
            title={`${d.month}: ${fmt(d.total)}`}
          />
        </div>
      ))}
    </div>
  );
};

/* ── Payment badge ── */
const PayBadge = ({ status }) => {
  const map = {
    Paid:    'bg-green-500/10 text-green-400 border-green-500/20',
    Pending: 'bg-red-500/10 text-red-400 border-red-500/20',
    Partial: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-xs font-semibold border ${map[status] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'Paid' ? 'bg-green-400' : status === 'Pending' ? 'bg-red-400' : 'bg-yellow-400'}`} />
      {status}
    </span>
  );
};

const PAYMENT_COLORS = {
  Cash: '#f97316', UPI: '#3b82f6', 'Google Pay': '#22c55e',
  PhonePe: '#8b5cf6', Paytm: '#06b6d4', 'Bank Transfer': '#f59e0b', Other: '#6b7280',
};

/* ══════════════════════════════════════════
   MAIN DASHBOARD
══════════════════════════════════════════ */
const ExpenseDashboard = () => {
  const [stats,        setStats]        = useState(null);
  const [loading,      setLoading]      = useState(true);
  const [activeFilter, setActiveFilter] = useState('month');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/dashboard`);
      if (res.data.success) setStats(res.data.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const filterOptions = ['Today', 'Week', 'Month', 'Year'];

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-orange-500">
      <RefreshCcw className="animate-spin mr-2" size={28} />
      <span>Loading Dashboard...</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Expense Dashboard</h1>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span>Dashboard</span><span className="text-gray-600">&gt;</span>
            <span>Expense Management</span><span className="text-gray-600">&gt;</span>
            <span className="text-gray-200">Overview</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-[#1a1c23] border border-gray-800 rounded-lg p-1">
            {filterOptions.map((f) => (
              <button key={f} onClick={() => setActiveFilter(f.toLowerCase())}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${
                  activeFilter === f.toLowerCase() ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'
                }`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={fetchStats}
            className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* ── Stat Cards Row 1 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Expenses"
          value={fmt(stats?.today_total)}
          icon={Calendar}
          iconBg="bg-orange-500"
          trend={12.4}
        />
        <StatCard
          title="This Month"
          value={fmt(stats?.month_total)}
          icon={BarChart2}
          iconBg="bg-blue-500"
          trend={5.2}
        />
        <StatCard
          title="This Year"
          value={fmt(stats?.year_total)}
          icon={TrendingUp}
          iconBg="bg-green-500"
          trend={8.7}
        />
        <StatCard
          title="Pending Payments"
          value={fmt(stats?.pending_amount)}
          icon={AlertCircle}
          iconBg="bg-red-600"
          sub={`${stats?.pending_count || 0} transactions`}
          trend={1.5}
          invertColor
        />
      </div>

      {/* ── Stat Cards Row 2 ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Recurring Active"
          value={`${stats?.recurring_count || 0}`}
          icon={RepeatIcon}
          iconBg="bg-purple-600"
          sub="Active plans"
          trend={0.8}
        />
        <StatCard
          title="Cash Expenses"
          value={fmt(stats?.cash_total)}
          icon={Wallet}
          iconBg="bg-yellow-500"
          sub="This month"
          trend={3.1}
        />
        <StatCard
          title="UPI Expenses"
          value={fmt(stats?.upi_total)}
          icon={Smartphone}
          iconBg="bg-cyan-500"
          sub="This month"
          trend={6.4}
        />
        <StatCard
          title="Top Category"
          value={stats?.category_breakdown?.[0]?.category || 'N/A'}
          icon={ShoppingBag}
          iconBg="bg-pink-600"
          sub={stats?.category_breakdown?.[0] ? fmt(stats.category_breakdown[0].total) : ''}
        />
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 bg-[#1a1c23] border border-gray-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-white">Monthly Expense Trend</h3>
            <span className="text-xs text-gray-500">Last 12 months</span>
          </div>
          <MiniChart data={stats?.monthly_trend} />
          <div className="flex justify-between mt-3">
            {stats?.monthly_trend?.slice(-6).map((d, i) => (
              <span key={i} className="text-[10px] text-gray-500">{d.month?.slice(5)}</span>
            ))}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {stats?.payment_breakdown?.length > 0 ? stats.payment_breakdown.map((p, i) => {
              const monthTotal = stats.payment_breakdown.reduce((s, x) => s + parseFloat(x.total), 0);
              const pct = monthTotal > 0 ? ((parseFloat(p.total) / monthTotal) * 100).toFixed(1) : 0;
              const color = PAYMENT_COLORS[p.payment_method] || '#6b7280';
              return (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{p.payment_method}</span>
                    <span className="text-white font-medium">{pct}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">{fmt(p.total)}</div>
                </div>
              );
            }) : <p className="text-gray-500 text-sm">No data this month</p>}
          </div>
        </div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top Categories */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Top Categories (This Year)</h3>
          <div className="space-y-3">
            {stats?.top_categories?.length > 0 ? stats.top_categories.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm text-white font-medium">{c.category}</p>
                    <p className="text-xs text-gray-500">{c.count} transactions</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-orange-400 shrink-0">{fmt(c.total)}</span>
              </div>
            )) : <p className="text-gray-500 text-sm">No data</p>}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="lg:col-span-2 bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-gray-800">
            <h3 className="font-semibold text-white">Recent Expenses</h3>
            <a href="#/admin/expense-management/all"
              className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1 transition-colors">
              View All <ChevronRight size={14} />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-xs">
                  <th className="py-3 px-5 font-medium">Title</th>
                  <th className="py-3 px-4 font-medium">Category</th>
                  <th className="py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium">Method</th>
                  <th className="py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recent_expenses?.length > 0
                  ? stats.recent_expenses.map((e) => (
                    <tr key={e.id} className="border-b border-gray-800/50 hover:bg-white/[.02] transition-colors">
                      <td className="py-3 px-5">
                        <p className="text-white font-medium truncate max-w-[150px]">{e.expense_title}</p>
                        <p className="text-xs text-gray-500 font-mono">{e.expense_id}</p>
                      </td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{e.category_name}</td>
                      <td className="py-3 px-4 text-orange-400 font-semibold">{fmt(e.amount)}</td>
                      <td className="py-3 px-4 text-gray-400 text-xs">{e.payment_method}</td>
                      <td className="py-3 px-4"><PayBadge status={e.payment_status} /></td>
                    </tr>
                  ))
                  : (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-gray-500">
                        No expenses recorded yet.<br />
                        <a href="#/admin/expense-management/add"
                          className="text-orange-500 hover:underline text-sm mt-1 inline-block">
                          Add your first expense
                        </a>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDashboard;
