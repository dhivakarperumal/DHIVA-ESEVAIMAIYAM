import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Save, X, Upload, Plus, ChevronDown, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

const API = 'http://localhost:5000/api/expenses';
const PAYMENT_METHODS = ['Cash','UPI','Google Pay','PhonePe','Paytm','Bank Transfer','Debit Card','Credit Card','Cheque','Other'];
const PAYMENT_STATUSES = ['Paid','Pending','Partial'];
const RECURRING_TYPES = ['Daily','Weekly','Monthly','Quarterly','Yearly'];

const Field = ({ label, required, children, error }) => (
  <div className="space-y-1.5">
    <label className="text-sm text-gray-300 font-medium">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
    {children}
    {error && <p className="text-xs text-red-400 flex items-center gap-1"><AlertCircle size={12}/>{error}</p>}
  </div>
);

const inputClass = "w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 placeholder-gray-600";
const selectClass = `${inputClass} appearance-none cursor-pointer`;
const errorInputClass = "w-full bg-[#0f1115] border border-red-500/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-500 placeholder-gray-600";

const AddExpense = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);
  const fileInputRef = useRef(null);

  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [receiptPreview, setReceiptPreview] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [existingReceipt, setExistingReceipt] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [errors, setErrors] = useState({});
  const [expenseId, setExpenseId] = useState('');

  const [form, setForm] = useState({
    expense_date: new Date().toISOString().slice(0, 10),
    category_id: '',
    subcategory_id: '',
    expense_title: '',
    description: '',
    amount: '',
    payment_method: '',
    payment_status: 'Paid',
    vendor_id: '',
    reference_number: '',
    receipt_number: '',
    is_recurring: false,
    recurring_type: 'Monthly',
    next_payment_date: '',
    notes: '',
    status: 'Active',
  });

  useEffect(() => {
    fetchCategories();
    fetchVendors();
    fetchNextId();
    if (isEdit) fetchExpense();
  }, []);

  const fetchNextId = async () => {
    try {
      const res = await axios.get(API, { params: { limit: 1, sortBy: 'id', sortDir: 'desc' } });
      const last = res.data.data?.[0];
      if (last?.expense_id) {
        const num = parseInt(last.expense_id.replace('EXP', '')) + 1;
        setExpenseId(`EXP${String(num).padStart(5, '0')}`);
      } else {
        setExpenseId('EXP00001');
      }
    } catch { setExpenseId('EXP00001'); }
  };

  const fetchCategories = async () => {
    const res = await axios.get(`${API}/categories`);
    if (res.data.success) setCategories(res.data.data);
  };

  const fetchVendors = async () => {
    const res = await axios.get(`${API}/vendors`);
    if (res.data.success) setVendors(res.data.data);
  };

  const fetchExpense = async () => {
    const res = await axios.get(`${API}/${id}`);
    if (res.data.success) {
      const e = res.data.data;
      setExpenseId(e.expense_id);
      setExistingReceipt(e.receipt_path);
      setForm({
        expense_date: e.expense_date?.slice(0, 10) || '',
        category_id: String(e.category_id || ''),
        subcategory_id: String(e.subcategory_id || ''),
        expense_title: e.expense_title || '',
        description: e.description || '',
        amount: String(e.amount || ''),
        payment_method: e.payment_method || '',
        payment_status: e.payment_status || 'Paid',
        vendor_id: String(e.vendor_id || ''),
        reference_number: e.reference_number || '',
        receipt_number: e.receipt_number || '',
        is_recurring: Boolean(e.is_recurring),
        recurring_type: e.recurring_type || 'Monthly',
        next_payment_date: e.next_payment_date?.slice(0, 10) || '',
        notes: e.notes || '',
        status: e.status || 'Active',
      });
      if (e.category_id) fetchSubcategories(e.category_id);
    }
  };

  const fetchSubcategories = async (catId) => {
    if (!catId) { setSubcategories([]); return; }
    const res = await axios.get(`${API}/categories/${catId}/subcategories`);
    if (res.data.success) setSubcategories(res.data.data);
  };

  const handleCategoryChange = (e) => {
    const catId = e.target.value;
    setForm(p => ({ ...p, category_id: catId, subcategory_id: '' }));
    fetchSubcategories(catId);
  };

  const handleReceiptChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { alert('File too large. Max 5MB allowed.'); return; }
    setReceiptFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setReceiptPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setReceiptPreview('pdf');
    }
  };

  const validate = () => {
    const errs = {};
    if (!form.expense_date) errs.expense_date = 'Date is required';
    if (!form.category_id) errs.category_id = 'Category is required';
    if (!form.expense_title.trim()) errs.expense_title = 'Title is required';
    if (!form.amount || isNaN(form.amount) || parseFloat(form.amount) < 0) errs.amount = 'Valid positive amount required';
    if (!form.payment_method) errs.payment_method = 'Payment method is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (receiptFile) fd.append('receipt', receiptFile);

      if (isEdit) {
        await axios.put(`${API}/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await axios.post(API, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setSaved(true);
      setTimeout(() => { navigate('/admin/expense-management/all'); }, 1500);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save expense.');
    } finally {
      setLoading(false);
    }
  };

  const SelectWithArrow = ({ name, value, onChange, children, error }) => (
    <div className="relative">
      <select name={name} value={value} onChange={onChange}
        className={`${error ? errorInputClass : selectClass} pr-8`}>
        {children}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg border border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold">{isEdit ? 'Edit Expense' : 'Add Expense'}</h1>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span>Dashboard</span><span className="text-gray-600">&gt;</span>
            <span>Expense Management</span><span className="text-gray-600">&gt;</span>
            <span className="text-gray-200">{isEdit ? 'Edit Expense' : 'Add Expense'}</span>
          </div>
        </div>
      </div>

      {saved && (
        <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400">
          <CheckCircle2 size={20} /><span>Expense saved successfully! Redirecting...</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Basic Info ── */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4 pb-3 border-b border-gray-800">Basic Information</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <Field label="Expense ID">
              <input value={expenseId || 'Auto-generated'} disabled className={`${inputClass} text-gray-500 cursor-not-allowed font-mono`} />
              <p className="text-xs text-orange-500/70">Auto-generated</p>
            </Field>

            <Field label="Expense Date" required error={errors.expense_date}>
              <input type="date" value={form.expense_date}
                onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))}
                className={errors.expense_date ? errorInputClass : inputClass} />
            </Field>

            <Field label="Category" required error={errors.category_id}>
              <SelectWithArrow name="category_id" value={form.category_id} onChange={handleCategoryChange} error={errors.category_id}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </SelectWithArrow>
            </Field>

            <Field label="Subcategory">
              <SelectWithArrow name="subcategory_id" value={form.subcategory_id}
                onChange={e => setForm(p => ({ ...p, subcategory_id: e.target.value }))}>
                <option value="">Select Subcategory</option>
                {subcategories.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </SelectWithArrow>
            </Field>

            <Field label="Expense Title" required error={errors.expense_title}>
              <input type="text" placeholder="e.g. Monthly Shop Rent" value={form.expense_title}
                onChange={e => setForm(p => ({ ...p, expense_title: e.target.value }))}
                className={errors.expense_title ? errorInputClass : inputClass} />
            </Field>

            <Field label="Amount (₹)" required error={errors.amount}>
              <input type="number" min="0" step="0.01" placeholder="0.00" value={form.amount}
                onChange={e => setForm(p => ({ ...p, amount: e.target.value }))}
                className={errors.amount ? errorInputClass : inputClass} />
            </Field>

            <div className="sm:col-span-2 lg:col-span-3">
              <Field label="Description">
                <textarea rows={2} placeholder="Brief description of the expense" value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className={`${inputClass} resize-none`} />
              </Field>
            </div>
          </div>
        </div>

        {/* ── Section 2: Payment ── */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4 pb-3 border-b border-gray-800">Payment Details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">

            <Field label="Payment Method" required error={errors.payment_method}>
              <SelectWithArrow name="payment_method" value={form.payment_method}
                onChange={e => setForm(p => ({ ...p, payment_method: e.target.value }))} error={errors.payment_method}>
                <option value="">Select Method</option>
                {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </SelectWithArrow>
            </Field>

            <Field label="Payment Status">
              <SelectWithArrow name="payment_status" value={form.payment_status}
                onChange={e => setForm(p => ({ ...p, payment_status: e.target.value }))}>
                {PAYMENT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
              </SelectWithArrow>
            </Field>

            <Field label="Vendor / Payee">
              <SelectWithArrow name="vendor_id" value={form.vendor_id}
                onChange={e => setForm(p => ({ ...p, vendor_id: e.target.value }))}>
                <option value="">No Vendor / Direct</option>
                {vendors.map(v => <option key={v.id} value={v.id}>{v.vendor_name} ({v.vendor_id})</option>)}
              </SelectWithArrow>
            </Field>

            <Field label="Reference Number">
              <input type="text" placeholder="Bank/UPI reference no." value={form.reference_number}
                onChange={e => setForm(p => ({ ...p, reference_number: e.target.value }))}
                className={inputClass} />
            </Field>

            <Field label="Bill / Receipt Number">
              <input type="text" placeholder="Invoice or bill number" value={form.receipt_number}
                onChange={e => setForm(p => ({ ...p, receipt_number: e.target.value }))}
                className={inputClass} />
            </Field>

            <Field label="Status">
              <SelectWithArrow name="status" value={form.status}
                onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </SelectWithArrow>
            </Field>
          </div>
        </div>

        {/* ── Section 3: Receipt Upload ── */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4 pb-3 border-b border-gray-800">Upload Bill / Receipt</h2>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="flex-1">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-32 border-2 border-dashed border-gray-700 rounded-xl bg-[#0f1115] flex flex-col items-center justify-center cursor-pointer hover:border-orange-500/50 hover:bg-gray-800/30 transition-all relative overflow-hidden">
                {receiptPreview ? (
                  receiptPreview === 'pdf' ? (
                    <div className="flex flex-col items-center gap-2 text-blue-400">
                      <AlertCircle size={32} /><span className="text-sm">PDF Selected: {receiptFile?.name}</span>
                    </div>
                  ) : (
                    <img src={receiptPreview} alt="Receipt Preview" className="w-full h-full object-contain" />
                  )
                ) : existingReceipt ? (
                  <div className="flex flex-col items-center gap-2 text-green-400">
                    <CheckCircle2 size={28} />
                    <span className="text-xs">Existing receipt on file</span>
                    <span className="text-xs text-gray-500">Click to replace</span>
                  </div>
                ) : (
                  <>
                    <Upload className="text-gray-500 mb-2" size={28} />
                    <p className="text-sm text-gray-400">Click to upload receipt</p>
                    <p className="text-xs text-gray-600 mt-1">JPG, PNG, WEBP, PDF — Max 5MB</p>
                  </>
                )}
                <input type="file" ref={fileInputRef} className="hidden" accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
                  onChange={handleReceiptChange} />
              </div>
              {existingReceipt && !receiptFile && (
                <a href={`http://localhost:5000${existingReceipt}`} target="_blank" rel="noreferrer"
                  className="text-xs text-blue-400 hover:underline mt-2 inline-block">View current receipt →</a>
              )}
            </div>
          </div>
        </div>

        {/* ── Section 4: Recurring ── */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4 pb-3 border-b border-gray-800">Recurring Expense</h2>
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-gray-300">Is this a recurring expense?</span>
            <div className="flex gap-4">
              {['Yes', 'No'].map(opt => (
                <label key={opt} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="is_recurring" checked={form.is_recurring === (opt === 'Yes')}
                    onChange={() => setForm(p => ({ ...p, is_recurring: opt === 'Yes' }))}
                    className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-white">{opt}</span>
                </label>
              ))}
            </div>
          </div>
          {form.is_recurring && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2 border-t border-gray-800 mt-2">
              <Field label="Recurring Type">
                <SelectWithArrow name="recurring_type" value={form.recurring_type}
                  onChange={e => setForm(p => ({ ...p, recurring_type: e.target.value }))}>
                  {RECURRING_TYPES.map(r => <option key={r} value={r}>{r}</option>)}
                </SelectWithArrow>
              </Field>
              <Field label="Next Payment Date">
                <input type="date" value={form.next_payment_date}
                  onChange={e => setForm(p => ({ ...p, next_payment_date: e.target.value }))}
                  className={inputClass} />
              </Field>
            </div>
          )}
        </div>

        {/* ── Section 5: Notes ── */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-6">
          <h2 className="text-base font-semibold text-white mb-4 pb-3 border-b border-gray-800">Additional Notes</h2>
          <textarea rows={3} placeholder="Any additional notes..." value={form.notes}
            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            className={`${inputClass} resize-none`} />
        </div>

        {/* Footer Actions */}
        <div className="flex gap-4 justify-end">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium">
            Cancel
          </button>
          <button type="submit" disabled={loading || saved}
            className="flex items-center gap-2 px-8 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium">
            {loading ? <RefreshCcw className="animate-spin" size={18} /> : <Save size={18} />}
            <span>{loading ? 'Saving...' : isEdit ? 'Update Expense' : 'Save Expense'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

// Import RefreshCcw used above
import { RefreshCcw } from 'lucide-react';
export default AddExpense;
