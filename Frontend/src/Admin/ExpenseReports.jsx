import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCcw, BarChart2, Download, Printer, ChevronDown, TrendingUp, IndianRupee, FileText, Calendar } from 'lucide-react';

const API = 'http://localhost:5000/api/expenses';
const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const REPORT_TYPES = [
  { value: 'daily', label: 'Daily Expenses' },
  { value: 'category', label: 'Category-wise' },
  { value: 'subcategory', label: 'Subcategory-wise' },
  { value: 'payment_method', label: 'Payment Method-wise' },
  { value: 'vendor', label: 'Vendor-wise' },
];

const ExpenseReports = () => {
  const [reportType, setReportType] = useState('category');
  const [dateFrom, setDateFrom] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().slice(0, 10));
  const [dateTo, setDateTo] = useState(new Date().toISOString().slice(0, 10));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/reports`, { params: { type: reportType, date_from: dateFrom, date_to: dateTo } });
      if (res.data.success) setData(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchReport(); }, []);

  const handlePrint = () => window.print();

  const maxTotal = data?.breakdown?.length ? Math.max(...data.breakdown.map(b => parseFloat(b.total))) : 1;

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Expense Reports</h1>
          <div className="text-sm text-gray-400 flex items-center gap-2"><span>Dashboard</span><span className="text-gray-600">&gt;</span><span>Expense Management</span><span className="text-gray-600">&gt;</span><span className="text-gray-200">Reports</span></div>
        </div>
        <div className="flex gap-3">
          <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm"><Printer size={16} />Print</button>
          <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-orange-500/50 text-orange-500 hover:bg-orange-500/10 transition-colors text-sm"><Download size={16} />Export</button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-end">
        <div className="space-y-1.5 min-w-[200px]">
          <label className="text-xs text-gray-400 font-medium">Report Type</label>
          <div className="relative">
            <select value={reportType} onChange={e => setReportType(e.target.value)}
              className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white appearance-none focus:outline-none cursor-pointer">
              {REPORT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 font-medium">Date From</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gray-600" />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs text-gray-400 font-medium">Date To</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gray-600" />
        </div>
        <button onClick={fetchReport} className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-medium">
          {loading ? <RefreshCcw className="animate-spin" size={16} /> : <BarChart2 size={16} />}Generate Report
        </button>
        {/* Quick Filters */}
        <div className="flex gap-2 ml-auto">
          {[
            { label: 'Today', fn: () => { const t = new Date().toISOString().slice(0,10); setDateFrom(t); setDateTo(t); } },
            { label: 'This Month', fn: () => { setDateFrom(new Date(new Date().getFullYear(),new Date().getMonth(),1).toISOString().slice(0,10)); setDateTo(new Date().toISOString().slice(0,10)); } },
            { label: 'This Year', fn: () => { setDateFrom(`${new Date().getFullYear()}-01-01`); setDateTo(new Date().toISOString().slice(0,10)); } },
          ].map(q => (
            <button key={q.label} onClick={() => { q.fn(); setTimeout(fetchReport, 50); }}
              className="px-3 py-2 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 text-xs transition-colors">{q.label}</button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Expense', value: fmt(data.summary?.total), icon: IndianRupee, color: 'bg-orange-500/10 text-orange-500' },
            { label: 'Transactions', value: data.summary?.count || 0, icon: FileText, color: 'bg-blue-500/10 text-blue-400' },
            { label: 'Average', value: fmt(data.summary?.avg), icon: TrendingUp, color: 'bg-green-500/10 text-green-500' },
            { label: 'Highest', value: fmt(data.summary?.highest), icon: BarChart2, color: 'bg-purple-500/10 text-purple-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${s.color}`}><s.icon size={20} /></div>
              <div><p className="text-gray-400 text-xs">{s.label}</p><h3 className="text-lg font-bold mt-0.5">{s.value}</h3></div>
            </div>
          ))}
        </div>
      )}

      {/* Breakdown */}
      {data && (
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden">
          <div className="p-5 border-b border-gray-800 flex justify-between items-center">
            <h3 className="font-semibold text-white">{REPORT_TYPES.find(t => t.value === reportType)?.label} — Breakdown</h3>
            <span className="text-xs text-gray-500">{fmtDate(dateFrom)} to {fmtDate(dateTo)}</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400 text-sm">
                  <th className="py-3 px-5 font-medium">S.No</th>
                  <th className="py-3 px-4 font-medium">{REPORT_TYPES.find(t => t.value === reportType)?.label?.replace('-wise', '')}</th>
                  <th className="py-3 px-4 font-medium">Transactions</th>
                  <th className="py-3 px-4 font-medium">Total Amount</th>
                  <th className="py-3 px-4 font-medium">Share</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} className="py-12 text-center text-orange-500"><RefreshCcw className="animate-spin inline mr-2" size={18} />Generating...</td></tr>
                ) : data.breakdown?.length === 0 ? (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-500">No data for the selected period.</td></tr>
                ) : data.breakdown?.map((b, i) => {
                  const share = data.summary?.total > 0 ? (parseFloat(b.total) / parseFloat(data.summary.total) * 100).toFixed(1) : 0;
                  return (
                    <tr key={i} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                      <td className="py-3 px-5 text-gray-500 text-sm">{i + 1}</td>
                      <td className="py-3 px-4 font-medium text-white">{b.group_label}</td>
                      <td className="py-3 px-4 text-gray-300">{b.count}</td>
                      <td className="py-3 px-4 text-orange-400 font-semibold">{fmt(b.total)}</td>
                      <td className="py-3 px-4 w-48">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-800 rounded-full">
                            <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${Math.min(100, (parseFloat(b.total) / maxTotal) * 100)}%` }} />
                          </div>
                          <span className="text-xs text-gray-400 w-10 text-right">{share}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {data?.summary?.total > 0 && (
                <tfoot>
                  <tr className="border-t-2 border-orange-500/30 bg-orange-500/5">
                    <td colSpan={3} className="py-3 px-5 font-semibold text-white">Total</td>
                    <td className="py-3 px-4 font-bold text-orange-400 text-base">{fmt(data.summary?.total)}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">100%</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseReports;
