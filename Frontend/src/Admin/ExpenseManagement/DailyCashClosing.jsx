import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCcw, Wallet, TrendingUp, TrendingDown, AlertCircle, CheckCircle2, Save, Calendar } from 'lucide-react';

const API = 'http://localhost:5000/api/expenses';
const fmt = (v) => `₹${Number(v || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

const DailyCashClosing = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [preview, setPreview] = useState(null);
  const [form, setForm] = useState({
    closing_date: new Date().toISOString().slice(0, 10),
    opening_cash: '',
    cash_income: '',
    actual_closing: '',
    closed_by: 'Admin',
    notes: '',
  });

  const fetchRecords = async () => {
    try { setLoading(true); const res = await axios.get(`${API}/cash-closing`); if (res.data.success) setRecords(res.data.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchRecords(); }, []);

  const handlePreview = async () => {
    try {
      const res = await axios.post(`${API}/cash-closing`, { ...form, preview: true });
      if (res.data.success) setPreview(res.data.data);
    } catch (err) { console.error(err); }
  };

  const handleSave = async () => {
    if (!form.closing_date || form.actual_closing === '') return alert('Closing date and actual closing cash are required.');
    setSaving(true);
    try {
      const res = await axios.post(`${API}/cash-closing`, form);
      if (res.data.success) { setSaved(true); setPreview(res.data.data); fetchRecords(); setTimeout(() => setSaved(false), 3000); }
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); } finally { setSaving(false); }
  };

  const inputClass = "w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 placeholder-gray-600";

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      <div>
        <h1 className="text-2xl font-semibold mb-1">Daily Cash Closing</h1>
        <div className="text-sm text-gray-400 flex items-center gap-2"><span>Dashboard</span><span className="text-gray-600">&gt;</span><span>Expense Management</span><span className="text-gray-600">&gt;</span><span className="text-gray-200">Daily Cash Closing</span></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4 pb-3 border-b border-gray-800 flex items-center gap-2">
            <Wallet className="text-orange-500" size={20} /> End of Day Settlement
          </h2>
          <div className="space-y-4">
            <div className="space-y-1.5"><label className="text-sm text-gray-300 font-medium">Closing Date <span className="text-red-500">*</span></label>
              <input type="date" value={form.closing_date} onChange={e => setForm(p => ({ ...p, closing_date: e.target.value }))} className={inputClass} /></div>
            <div className="space-y-1.5"><label className="text-sm text-gray-300 font-medium">Opening Cash (₹)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.opening_cash} onChange={e => setForm(p => ({ ...p, opening_cash: e.target.value }))} className={inputClass} /></div>
            <div className="space-y-1.5"><label className="text-sm text-gray-300 font-medium">Cash Income (₹)</label>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.cash_income} onChange={e => setForm(p => ({ ...p, cash_income: e.target.value }))} className={inputClass} />
              <p className="text-xs text-gray-500">Total cash received from services on this date</p></div>
            <div className="space-y-1.5"><label className="text-sm text-gray-300 font-medium">Actual Closing Cash (₹) <span className="text-red-500">*</span></label>
              <input type="number" min="0" step="0.01" placeholder="Physical cash counted" value={form.actual_closing} onChange={e => setForm(p => ({ ...p, actual_closing: e.target.value }))} className={inputClass} /></div>
            <div className="space-y-1.5"><label className="text-sm text-gray-300 font-medium">Closed By</label>
              <input type="text" placeholder="Admin name" value={form.closed_by} onChange={e => setForm(p => ({ ...p, closed_by: e.target.value }))} className={inputClass} /></div>
            <div className="space-y-1.5"><label className="text-sm text-gray-300 font-medium">Notes</label>
              <textarea rows={2} placeholder="Any notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} className={`${inputClass} resize-none`} /></div>
          </div>
          <div className="flex gap-3 mt-5">
            <button onClick={handlePreview} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 text-sm transition-colors">Preview</button>
            <button onClick={handleSave} disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 text-sm font-medium flex items-center justify-center gap-2">
              {saving ? <RefreshCcw className="animate-spin" size={16} /> : <Save size={16} />}{saving ? 'Saving...' : 'Save Closing'}
            </button>
          </div>
          {saved && <div className="flex items-center gap-2 mt-3 text-green-400 text-sm"><CheckCircle2 size={16} />Saved successfully!</div>}
        </div>

        {/* Preview / Formula */}
        <div className="space-y-4">
          <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-6">
            <h2 className="text-base font-semibold text-white mb-4 pb-3 border-b border-gray-800">Calculation Preview</h2>
            {preview ? (
              <div className="space-y-3">
                {[
                  { label: 'Opening Cash', value: fmt(form.opening_cash || 0), color: 'text-gray-300' },
                  { label: '+ Cash Income', value: fmt(form.cash_income || 0), color: 'text-green-400' },
                  { label: '− Cash Expenses', value: fmt(preview.cash_expense), color: 'text-red-400', note: '(Auto-calculated from today\'s cash payments)' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2 border-b border-gray-800/50">
                    <div><span className="text-gray-400 text-sm">{r.label}</span>{r.note && <p className="text-xs text-gray-600 mt-0.5">{r.note}</p>}</div>
                    <span className={`font-semibold ${r.color}`}>{r.value}</span>
                  </div>
                ))}
                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                  <span className="text-gray-300 text-sm font-medium">= Expected Closing</span>
                  <span className="text-orange-400 font-bold text-base">{fmt(preview.expected_closing)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-800/50">
                  <span className="text-gray-300 text-sm font-medium">Actual Closing</span>
                  <span className="text-white font-semibold">{fmt(form.actual_closing || 0)}</span>
                </div>
                <div className={`flex justify-between items-center py-3 rounded-xl px-3 ${parseFloat(preview.difference || 0) >= 0 ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                  <div className="flex items-center gap-2">
                    {parseFloat(preview.difference || 0) >= 0 ? <TrendingUp size={18} className="text-green-400" /> : <TrendingDown size={18} className="text-red-400" />}
                    <span className="text-sm font-medium text-white">Difference (Surplus/Shortage)</span>
                  </div>
                  <span className={`font-bold text-lg ${parseFloat(preview.difference || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {parseFloat(preview.difference || 0) >= 0 ? '+' : ''}{fmt(preview.difference)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Wallet size={40} className="mx-auto mb-3 opacity-30" />
                <p>Click "Preview" to calculate cash closing</p>
                <p className="text-xs mt-1">Formula: Opening + Income − Cash Expenses = Expected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-gray-800"><h3 className="font-semibold text-white">Recent Closings</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400">
                <th className="py-3 px-5 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Opening</th>
                <th className="py-3 px-4 font-medium">Income</th>
                <th className="py-3 px-4 font-medium">Expenses</th>
                <th className="py-3 px-4 font-medium">Expected</th>
                <th className="py-3 px-4 font-medium">Actual</th>
                <th className="py-3 px-4 font-medium">Difference</th>
                <th className="py-3 px-4 font-medium">Closed By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="py-12 text-center text-orange-500"><RefreshCcw className="animate-spin inline mr-2" size={18} />Loading...</td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={8} className="py-12 text-center text-gray-500">No closing records yet.</td></tr>
              ) : records.map(r => (
                <tr key={r.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-3 px-5 text-gray-300 whitespace-nowrap">{new Date(r.closing_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                  <td className="py-3 px-4 text-gray-300">{fmt(r.opening_cash)}</td>
                  <td className="py-3 px-4 text-green-400">{fmt(r.cash_income)}</td>
                  <td className="py-3 px-4 text-red-400">{fmt(r.cash_expense)}</td>
                  <td className="py-3 px-4 text-orange-400 font-medium">{fmt(r.expected_closing)}</td>
                  <td className="py-3 px-4 text-white">{fmt(r.actual_closing)}</td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${parseFloat(r.difference) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {parseFloat(r.difference) >= 0 ? '+' : ''}{fmt(r.difference)}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-400">{r.closed_by}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DailyCashClosing;
