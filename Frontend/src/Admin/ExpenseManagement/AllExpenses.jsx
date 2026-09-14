import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Search, Download, Plus, Filter, RefreshCcw, Eye, Edit2, Trash2,
  ChevronLeft, ChevronRight, ChevronDown, X, Printer, FileText,
  CheckCircle2, XCircle, Clock, AlertCircle, TrendingUp, Receipt,
  LayoutGrid, List, IndianRupee
} from 'lucide-react';

const API = 'http://localhost:5000/api/expenses';
const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';

const PAYMENT_METHODS = ['Cash','UPI','Google Pay','PhonePe','Paytm','Bank Transfer','Debit Card','Credit Card','Cheque','Other'];
const PAYMENT_STATUSES = ['Paid','Pending','Partial'];

const StatusBadge = ({ status }) => {
  const map = { Paid: 'bg-green-500/10 text-green-500 border-green-500/20', Pending: 'bg-red-500/10 text-red-500 border-red-500/20', Partial: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
  return <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${map[status] || 'bg-gray-700 text-gray-300 border-gray-600'}`}>{status}</span>;
};

const AllExpenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const LIMIT = 15;

  const [filters, setFilters] = useState({ search: '', category_id: '', payment_method: '', payment_status: '', date_from: '', date_to: '' });
  const [viewingExpense, setViewingExpense] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total_amount: 0, paid: 0, pending: 0, partial: 0 });

  const fetchExpenses = async (pg = page) => {
    try {
      setLoading(true);
      const params = { page: pg, limit: LIMIT, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
      const res = await axios.get(API, { params });
      if (res.data.success) {
        setExpenses(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
        // Compute local stats
        const all = res.data.data;
        setStats({
          total_amount: all.reduce((s, e) => s + parseFloat(e.amount || 0), 0),
          paid: all.filter(e => e.payment_status === 'Paid').length,
          pending: all.filter(e => e.payment_status === 'Pending').length,
          partial: all.filter(e => e.payment_status === 'Partial').length,
        });
      }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${API}/categories`);
    if (res.data.success) setCategories(res.data.data);
  };

  const fetchVendors = async () => {
    const res = await axios.get(`${API}/vendors`);
    if (res.data.success) setVendors(res.data.data);
  };

  useEffect(() => { fetchCategories(); fetchVendors(); }, []);
  useEffect(() => { fetchExpenses(1); setPage(1); }, [filters]);
  useEffect(() => { fetchExpenses(page); }, [page]);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?\n\nThis expense will be soft-deleted and excluded from all reports.`)) return;
    try {
      await axios.delete(`${API}/${id}`);
      fetchExpenses(page);
    } catch (err) { alert('Failed to delete expense.'); }
  };

  const handleView = async (exp) => {
    setViewingExpense(exp);
    setIsViewOpen(true);
  };

  const handlePrint = (exp) => {
    const w = window.open('', '_blank');
    w.document.write(`
      <html><head><title>Expense - ${exp.expense_id}</title>
      <style>body{font-family:sans-serif;padding:20px;color:#333}table{width:100%;border-collapse:collapse}td{padding:8px;border-bottom:1px solid #eee}strong{color:#555}.amount{font-size:24px;font-weight:bold;color:#f97316}</style></head>
      <body>
        <h2>DHIVA E-SEVAI MAIYAM</h2><h3>Expense Receipt</h3>
        <table>
          <tr><td><strong>Expense ID:</strong></td><td>${exp.expense_id}</td></tr>
          <tr><td><strong>Title:</strong></td><td>${exp.expense_title}</td></tr>
          <tr><td><strong>Date:</strong></td><td>${fmtDate(exp.expense_date)}</td></tr>
          <tr><td><strong>Category:</strong></td><td>${exp.category_name || '-'}</td></tr>
          <tr><td><strong>Payment Method:</strong></td><td>${exp.payment_method}</td></tr>
          <tr><td><strong>Payment Status:</strong></td><td>${exp.payment_status}</td></tr>
          <tr><td><strong>Amount:</strong></td><td class="amount">₹${Number(exp.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td></tr>
          ${exp.vendor_name ? `<tr><td><strong>Vendor:</strong></td><td>${exp.vendor_name}</td></tr>` : ''}
          ${exp.reference_number ? `<tr><td><strong>Reference:</strong></td><td>${exp.reference_number}</td></tr>` : ''}
          ${exp.notes ? `<tr><td><strong>Notes:</strong></td><td>${exp.notes}</td></tr>` : ''}
        </table>
        <script>window.print();</script>
      </body></html>`
    );
    w.document.close();
  };

  const FilterInput = ({ label, name, type = 'text', options }) => (
    <div className="min-w-[160px] relative">
      {options ? (
        <>
          <select
            value={filters[name]}
            onChange={e => setFilters(p => ({ ...p, [name]: e.target.value }))}
            className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-gray-600 text-white cursor-pointer"
          >
            <option value="">{label}</option>
            {options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
        </>
      ) : (
        <input type={type} placeholder={label} value={filters[name]}
          onChange={e => setFilters(p => ({ ...p, [name]: e.target.value }))}
          className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-gray-600 placeholder-gray-500"
        />
      )}
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">All Expenses</h1>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span>Dashboard</span><span className="text-gray-600">&gt;</span>
            <span>Expense Management</span><span className="text-gray-600">&gt;</span>
            <span className="text-gray-200">All Expenses</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-orange-500/50 text-orange-500 hover:bg-orange-500/10 transition-colors">
            <Download size={18} /><span>Export</span>
          </button>
          <a href="#/admin/expense-management/add"
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors">
            <Plus size={18} /><span>Add Expense</span>
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Amount',  value: fmt(stats.total_amount), icon: IndianRupee,  iconBg: 'bg-orange-500', pct: { val: '12.4', up: true  }                    },
          { label: 'Paid',          value: stats.paid,              icon: CheckCircle2, iconBg: 'bg-green-500',  pct: { val: '5.2',  up: true  }                    },
          { label: 'Pending',       value: stats.pending,           icon: Clock,        iconBg: 'bg-red-600',    pct: { val: '1.5',  up: false }, invertColor: true  },
          { label: 'Partial',       value: stats.partial,           icon: AlertCircle,  iconBg: 'bg-yellow-500', pct: { val: '0.8',  up: true  }                    },
        ].map(s => {
          const isPositive = s.invertColor ? !s.pct.up : s.pct.up;
          return (
            <div key={s.label} className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex items-center gap-4">
              {/* solid coloured icon box */}
              <div className={`${s.iconBg} flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg`}>
                <s.icon size={22} className="text-white" />
              </div>
              {/* text */}
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

      {/* Filters */}
      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" placeholder="Search by ID, title, vendor, receipt..." value={filters.search}
            onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
            className="w-full bg-[#0f1115] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gray-600 placeholder-gray-500" />
        </div>
        <div className="relative min-w-[160px]">
          <select value={filters.category_id}
            onChange={e => setFilters(p => ({ ...p, category_id: e.target.value }))}
            className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-4 py-2.5 text-sm appearance-none text-white focus:outline-none focus:border-gray-600">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
        </div>
        <FilterInput label="All Methods" name="payment_method" options={PAYMENT_METHODS} />
        <FilterInput label="All Statuses" name="payment_status" options={PAYMENT_STATUSES} />
        <FilterInput label="Date From" name="date_from" type="date" />
        <FilterInput label="Date To" name="date_to" type="date" />
        <button onClick={() => setFilters({ search: '', category_id: '', payment_method: '', payment_status: '', date_from: '', date_to: '' })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors">
          <RefreshCcw size={16} /><span>Reset</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="py-4 px-4 pl-6 font-medium w-10">S.No</th>
                <th className="py-4 px-4 font-medium">Expense ID</th>
                <th className="py-4 px-4 font-medium">Date</th>
                <th className="py-4 px-4 font-medium">Title</th>
                <th className="py-4 px-4 font-medium">Category</th>
                <th className="py-4 px-4 font-medium">Vendor</th>
                <th className="py-4 px-4 font-medium">Amount</th>
                <th className="py-4 px-4 font-medium">Method</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-4 font-medium">Receipt</th>
                <th className="py-4 px-4 pr-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={11} className="py-16 text-center text-orange-500">
                  <RefreshCcw className="animate-spin inline mr-2" size={20} />Loading...
                </td></tr>
              ) : expenses.length === 0 ? (
                <tr><td colSpan={11} className="py-16 text-center text-gray-500">
                  No expenses found.<br />
                  <a href="#/admin/expense-management/add" className="text-orange-500 hover:underline text-sm mt-1 inline-block">Add your first expense →</a>
                </td></tr>
              ) : expenses.map((exp, idx) => (
                <tr key={exp.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-3 px-4 pl-6 text-gray-500 text-sm">{(page - 1) * LIMIT + idx + 1}</td>
                  <td className="py-3 px-4">
                    <span className="text-orange-400 font-mono text-sm">{exp.expense_id}</span>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm whitespace-nowrap">{fmtDate(exp.expense_date)}</td>
                  <td className="py-3 px-4">
                    <p className="text-white font-medium text-sm">{exp.expense_title}</p>
                    {exp.subcategory_name && <p className="text-xs text-gray-500">{exp.subcategory_name}</p>}
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{exp.category_name}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">{exp.vendor_name || '-'}</td>
                  <td className="py-3 px-4 text-orange-400 font-semibold text-sm whitespace-nowrap">{fmt(exp.amount)}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{exp.payment_method}</td>
                  <td className="py-3 px-4"><StatusBadge status={exp.payment_status} /></td>
                  <td className="py-3 px-4 text-center">
                    {exp.receipt_path ? (
                      <a href={`http://localhost:5000${exp.receipt_path}`} target="_blank" rel="noreferrer"
                        className="text-blue-400 hover:text-blue-300 transition-colors" title="View Receipt">
                        <Receipt size={16} />
                      </a>
                    ) : <span className="text-gray-600 text-xs">-</span>}
                  </td>
                  <td className="py-3 px-4 pr-6">
                    <div className="flex items-center justify-center gap-1.5">
                      <button onClick={() => handleView(exp)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="View"><Eye size={15} /></button>
                      <a href={`#/admin/expense-management/edit/${exp.id}`} className="p-1.5 rounded-md text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors" title="Edit"><Edit2 size={15} /></a>
                      <button onClick={() => handlePrint(exp)} className="p-1.5 rounded-md text-gray-400 hover:text-green-400 hover:bg-gray-700 transition-colors" title="Print"><Printer size={15} /></button>
                      <button onClick={() => handleDelete(exp.id, exp.expense_title)} className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Pagination */}
        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            Showing {expenses.length > 0 ? (page - 1) * LIMIT + 1 : 0} to {Math.min(page * LIMIT, total)} of {total} expenses
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-40">
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 flex items-center justify-center rounded-md border text-sm ${page === p ? 'bg-orange-500 text-white border-orange-500' : 'border-gray-700 text-gray-400 hover:bg-gray-800'}`}>
                {p}
              </button>
            ))}
            {totalPages > 5 && <span className="text-gray-500 px-1">...</span>}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-40">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* View Modal */}
      {isViewOpen && viewingExpense && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />
          <div className="relative bg-[#1a1c23] border border-gray-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-800">
              <div>
                <h2 className="text-lg font-semibold text-white">Expense Details</h2>
                <p className="text-sm text-orange-400 font-mono">{viewingExpense.expense_id}</p>
              </div>
              <button onClick={() => setIsViewOpen(false)} className="text-gray-400 hover:text-white"><X size={22} /></button>
            </div>
            <div className="p-5 grid grid-cols-2 gap-4 max-h-[70vh] overflow-y-auto">
              {[
                ['Title', viewingExpense.expense_title],
                ['Date', fmtDate(viewingExpense.expense_date)],
                ['Category', viewingExpense.category_name],
                ['Subcategory', viewingExpense.subcategory_name || '-'],
                ['Amount', fmt(viewingExpense.amount)],
                ['Payment Method', viewingExpense.payment_method],
                ['Payment Status', viewingExpense.payment_status],
                ['Vendor', viewingExpense.vendor_name || '-'],
                ['Reference No.', viewingExpense.reference_number || '-'],
                ['Receipt No.', viewingExpense.receipt_number || '-'],
                ['Recurring', viewingExpense.is_recurring ? `Yes (${viewingExpense.recurring_type})` : 'No'],
                ['Next Payment', viewingExpense.next_payment_date ? fmtDate(viewingExpense.next_payment_date) : '-'],
                ['Created By', viewingExpense.created_by || '-'],
                ['Status', viewingExpense.status],
              ].map(([k, v]) => (
                <div key={k} className="bg-[#0f1115] rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">{k}</p>
                  <p className="text-sm text-white font-medium">{v}</p>
                </div>
              ))}
              {viewingExpense.description && (
                <div className="col-span-2 bg-[#0f1115] rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-white">{viewingExpense.description}</p>
                </div>
              )}
              {viewingExpense.notes && (
                <div className="col-span-2 bg-[#0f1115] rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Notes</p>
                  <p className="text-sm text-white">{viewingExpense.notes}</p>
                </div>
              )}
              {viewingExpense.receipt_path && (
                <div className="col-span-2">
                  <a href={`http://localhost:5000${viewingExpense.receipt_path}`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                    <Receipt size={16} /> View/Download Receipt
                  </a>
                </div>
              )}
            </div>
            <div className="p-5 border-t border-gray-800 flex justify-between">
              <button onClick={() => handlePrint(viewingExpense)} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm"><Printer size={16} />Print</button>
              <button onClick={() => setIsViewOpen(false)} className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 text-sm">Close</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default AllExpenses;
