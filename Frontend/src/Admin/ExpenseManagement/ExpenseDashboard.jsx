import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp, TrendingDown, DollarSign, AlertCircle, RepeatIcon, CreditCard,
  Smartphone, BarChart2, RefreshCcw, Calendar, ArrowUpRight, ArrowDownRight,
  ChevronRight, Wallet, Clock, ShoppingBag
} from 'lucide-react';

const API = 'http://localhost:5000/api/expenses';

const formatCurrency = (val) => `₹${Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const StatCard = ({ title, value, icon: Icon, color, trend, sub }) => (
  <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon size={22} />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-gray-400 text-sm mb-1">{title}</p>
      <h3 className="text-xl font-bold text-white truncate">{value}</h3>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
      {trend !== undefined && (
        <p className={`text-xs flex items-center gap-1 mt-1 ${trend >= 0 ? 'text-red-400' : 'text-green-400'}`}>
          {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          <span>{Math.abs(trend)}% from last month</span>
        </p>
      )}
    </div>
  </div>
);

const MiniChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-gray-600 text-sm text-center py-8">No data</div>;
  const max = Math.max(...data.map(d => parseFloat(d.total)));
  return (
    <div className="flex items-end gap-1 h-24 mt-4">
      {data.slice(-12).map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
          <div
            className="w-full bg-orange-500/80 rounded-t hover:bg-orange-400 transition-all"
            style={{ height: `${max > 0 ? (parseFloat(d.total) / max) * 100 : 0}%`, minHeight: '4px' }}
            title={`${d.month}: ${formatCurrency(d.total)}`}
          />
          <span className="text-[9px] text-gray-600 rotate-45 hidden group-hover:block absolute">{d.month?.slice(5)}</span>
        </div>
      ))}
    </div>
  );
};

const ExpenseDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
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

  const filters = ['Today', 'Week', 'Month', 'Year'];
  const PAYMENT_COLORS = { Cash: '#f97316', UPI: '#3b82f6', 'Google Pay': '#22c55e', PhonePe: '#8b5cf6', Paytm: '#06b6d4', 'Bank Transfer': '#f59e0b', Other: '#6b7280' };

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-orange-500">
      <RefreshCcw className="animate-spin mr-2" size={28} /><span>Loading Dashboard...</span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      {/* Header */}
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
            {filters.map(f => (
              <button key={f} onClick={() => setActiveFilter(f.toLowerCase())}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors ${activeFilter === f.toLowerCase() ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                {f}
              </button>
            ))}
          </div>
          <button onClick={fetchStats} className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
            <RefreshCcw size={18} />
          </button>
        </div>
      </div>

      {/* Summary Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Expenses" value={formatCurrency(stats?.today_total)} icon={Calendar} color="bg-orange-500/10 text-orange-500" />
        <StatCard title="This Month" value={formatCurrency(stats?.month_total)} icon={BarChart2} color="bg-blue-500/10 text-blue-400" />
        <StatCard title="This Year" value={formatCurrency(stats?.year_total)} icon={TrendingUp} color="bg-green-500/10 text-green-500" />
        <StatCard title="Pending Payments" value={formatCurrency(stats?.pending_amount)} icon={AlertCircle} color="bg-red-500/10 text-red-500" sub={`${stats?.pending_count || 0} transactions`} />
      </div>

      {/* Summary Cards Row 2 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Recurring Expenses" value={`${stats?.recurring_count || 0} Active`} icon={RepeatIcon} color="bg-purple-500/10 text-purple-400" />
        <StatCard title="Cash Expenses" value={formatCurrency(stats?.cash_total)} icon={Wallet} color="bg-yellow-500/10 text-yellow-500" sub="This month" />
        <StatCard title="UPI Expenses" value={formatCurrency(stats?.upi_total)} icon={Smartphone} color="bg-cyan-500/10 text-cyan-400" sub="This month" />
        <StatCard title="Top Category"
          value={stats?.category_breakdown?.[0]?.category || 'N/A'}
          icon={ShoppingBag}
          color="bg-pink-500/10 text-pink-400"
          sub={stats?.category_breakdown?.[0] ? formatCurrency(stats.category_breakdown[0].total) : ''} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Monthly Chart */}
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

        {/* Payment Method Breakdown */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Payment Methods</h3>
          <div className="space-y-3">
            {stats?.payment_breakdown?.length > 0 ? stats.payment_breakdown.map((p, i) => {
              const monthTotal = stats?.payment_breakdown?.reduce((s, x) => s + parseFloat(x.total), 0);
              const pct = monthTotal > 0 ? (parseFloat(p.total) / monthTotal * 100).toFixed(1) : 0;
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
                  <div className="text-xs text-gray-500 mt-0.5">{formatCurrency(p.total)}</div>
                </div>
              );
            }) : <p className="text-gray-500 text-sm">No data this month</p>}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top Categories */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-5">
          <h3 className="font-semibold text-white mb-4">Top Categories (This Year)</h3>
          <div className="space-y-3">
            {stats?.top_categories?.length > 0 ? stats.top_categories.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                  <div>
                    <p className="text-sm text-white font-medium">{c.category}</p>
                    <p className="text-xs text-gray-500">{c.count} transactions</p>
                  </div>
                </div>
                <span className="text-sm font-semibold text-orange-400">{formatCurrency(c.total)}</span>
              </div>
            )) : <p className="text-gray-500 text-sm">No data</p>}
          </div>
        </div>

        {/* Recent Expenses */}
        <div className="lg:col-span-2 bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex justify-between items-center p-5 border-b border-gray-800">
            <h3 className="font-semibold text-white">Recent Expenses</h3>
            <a href="#/admin/expense-management/all" className="text-xs text-orange-500 hover:text-orange-400 flex items-center gap-1">
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
                {stats?.recent_expenses?.length > 0 ? stats.recent_expenses.map((e) => (
                  <tr key={e.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                    <td className="py-3 px-5">
                      <p className="text-white font-medium truncate max-w-[150px]">{e.expense_title}</p>
                      <p className="text-xs text-gray-500">{e.expense_id}</p>
                    </td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{e.category_name}</td>
                    <td className="py-3 px-4 text-orange-400 font-semibold">{formatCurrency(e.amount)}</td>
                    <td className="py-3 px-4 text-gray-400 text-xs">{e.payment_method}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${
                        e.payment_status === 'Paid' ? 'bg-green-500/10 text-green-500 border-green-500/20' :
                        e.payment_status === 'Pending' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                        'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>{e.payment_status}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-500">No expenses recorded yet.<br/>
                    <a href="#/admin/expense-management/add" className="text-orange-500 hover:underline text-sm mt-1 inline-block">Add your first expense</a>
                  </td></tr>
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
