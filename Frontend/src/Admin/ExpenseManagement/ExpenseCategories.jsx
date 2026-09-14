import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import {
  Search, Plus, Filter, RefreshCcw, Eye, Edit2, Trash2, ChevronLeft,
  ChevronRight, ChevronDown, X, Layers, Save, CheckCircle2, XCircle,
  TrendingUp, TrendingDown
} from 'lucide-react';

const API = 'http://localhost:5000/api/expenses';

const ExpenseCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [viewingCat, setViewingCat] = useState(null);
  const [search, setSearch] = useState('');

  const [form, setForm] = useState({ name: '', status: 'Active', subcategories: [] });
  const [newSubcat, setNewSubcat] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API}/categories`);
      if (res.data.success) setCategories(res.data.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleSeed = async () => {
    if (!window.confirm('This will seed all 19 default expense categories. Continue?')) return;
    const res = await axios.post(`${API}/categories/seed`);
    alert(res.data.message);
    fetchCategories();
  };

  const openAdd = () => {
    setForm({ name: '', status: 'Active', subcategories: [] });
    setNewSubcat('');
    setIsAddOpen(true);
    setIsEditOpen(false);
  };

  const openEdit = async (cat) => {
    const res = await axios.get(`${API}/categories/${cat.id}`);
    if (res.data.success) {
      const c = res.data.data;
      setForm({ name: c.name, status: c.status, subcategories: c.subcategories || [] });
      setEditingId(cat.id);
      setIsEditOpen(true);
      setIsAddOpen(false);
    }
  };

  const openView = async (cat) => {
    const res = await axios.get(`${API}/categories/${cat.id}`);
    if (res.data.success) { setViewingCat(res.data.data); setIsViewOpen(true); }
  };

  const handleClose = () => {
    setIsAddOpen(false); setIsEditOpen(false); setEditingId(null);
    setForm({ name: '', status: 'Active', subcategories: [] }); setNewSubcat('');
  };

  const addSubcat = () => {
    if (newSubcat.trim() && !form.subcategories.find(s => s.name === newSubcat.trim())) {
      setForm(p => ({ ...p, subcategories: [...p.subcategories, { name: newSubcat.trim(), status: 'Active' }] }));
      setNewSubcat('');
    }
  };

  const removeSubcat = (name) => setForm(p => ({ ...p, subcategories: p.subcategories.filter(s => s.name !== name) }));

  const handleSave = async () => {
    if (!form.name.trim()) return alert('Category name required');
    setSaving(true);
    try {
      if (isEditOpen && editingId) {
        await axios.put(`${API}/categories/${editingId}`, { name: form.name, status: form.status });
        // Handle subcategory changes for edit
        const existing = viewingCat?.subcategories || [];
        for (const sub of form.subcategories) {
          if (!sub.id) {
            await axios.post(`${API}/categories/${editingId}/subcategories`, { name: sub.name });
          }
        }
      } else {
        await axios.post(`${API}/categories`, { name: form.name, status: form.status, subcategories: form.subcategories.map(s => s.name) });
      }
      fetchCategories();
      handleClose();
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category "${name}"? This cannot be undone if it has no active expenses.`)) return;
    try {
      await axios.delete(`${API}/categories/${id}`);
      fetchCategories();
    } catch (err) { alert(err.response?.data?.message || 'Delete failed'); }
  };

  const handleToggleStatus = async (cat) => {
    const newStatus = cat.status === 'Active' ? 'Inactive' : 'Active';
    await axios.put(`${API}/categories/${cat.id}`, { name: cat.name, status: newStatus });
    fetchCategories();
  };

  const filtered = categories.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));
  const active = categories.filter(c => c.status === 'Active').length;
  const inactive = categories.filter(c => c.status === 'Inactive').length;

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Expense Categories</h1>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span>Dashboard</span><span className="text-gray-600">&gt;</span>
            <span>Expense Management</span><span className="text-gray-600">&gt;</span>
            <span className="text-gray-200">Expense Categories</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleSeed} className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm">
            Seed Defaults
          </button>
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors">
            <Plus size={18} /><span>Add Category</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      {(() => {
        const withSub = categories.filter(c => (c.subcategory_count || 0) > 0).length;
        const cards = [
          { label: 'Total Categories',    value: categories.length, icon: Layers,       iconBg: 'bg-orange-500', pct: { val: '12.4', up: true  }                   },
          { label: 'Active Categories',   value: active,            icon: CheckCircle2, iconBg: 'bg-green-500',  pct: { val: '5.2',  up: true  }                   },
          { label: 'Inactive Categories', value: inactive,          icon: XCircle,      iconBg: 'bg-red-600',    pct: { val: '1.5',  up: false }, invertColor: true },
          { label: 'With Subcategories',  value: withSub,           icon: Layers,       iconBg: 'bg-purple-600', pct: { val: '0.8',  up: true  }                   },
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

      {/* Search */}
      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search categories..." className="w-full bg-[#0f1115] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gray-600 placeholder-gray-500" />
        </div>
        <button onClick={() => setSearch('')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors">
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
                <th className="py-4 px-4 font-medium">Category Name</th>
                <th className="py-4 px-4 font-medium text-center">Subcategories</th>
                <th className="py-4 px-4 font-medium text-center">Status</th>
                <th className="py-4 px-4 font-medium">Created</th>
                <th className="py-4 px-4 pr-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-orange-500"><RefreshCcw className="animate-spin inline mr-2" size={20} />Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-gray-500">No categories found. <button onClick={handleSeed} className="text-orange-500 hover:underline">Seed defaults?</button></td></tr>
              ) : filtered.map((cat, idx) => (
                <tr key={cat.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-3 px-4 pl-6 text-gray-500 text-sm">{idx + 1}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-orange-500 flex items-center justify-center shrink-0">
                        <Layers size={16} className="text-white" />
                      </div>
                      <span className="font-medium text-white">{cat.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex px-2.5 py-1 rounded-md bg-gray-800 border border-gray-700 text-sm text-gray-300 font-medium">{cat.subcategory_count || 0}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => handleToggleStatus(cat)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border cursor-pointer hover:opacity-80 transition-opacity ${
                        cat.status === 'Active'
                          ? 'bg-green-500/15 text-green-400 border-green-500/30'
                          : 'bg-red-500/15 text-red-400 border-red-500/30'
                      }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cat.status === 'Active' ? 'bg-green-400' : 'bg-red-400'}`} />
                      {cat.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-sm">
                    {new Date(cat.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-4 pr-6">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openView(cat)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="View"><Eye size={15} /></button>
                      <button onClick={() => openEdit(cat)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors" title="Edit"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors" title="Delete"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-800 text-sm text-gray-400">
          Showing {filtered.length} of {categories.length} categories
        </div>
      </div>

      {/* Add/Edit Drawer */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {(isAddOpen || isEditOpen) && <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onClick={handleClose} />}
          <div className={`fixed inset-y-0 right-0 w-[450px] bg-[#1a1c23] border-l border-gray-800 shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${(isAddOpen || isEditOpen) ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold">{isEditOpen ? 'Edit Category' : 'Add New Category'}</h2>
              <button onClick={handleClose} className="text-gray-400 hover:text-white"><X size={22} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Category Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="e.g. Office Rent" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50" />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">Status</label>
                <div className="flex gap-6">
                  {['Active', 'Inactive'].map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="catStatus" checked={form.status === s} onChange={() => setForm(p => ({ ...p, status: s }))} className="w-4 h-4 accent-orange-500" />
                      <span className="text-sm text-white">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3 border border-gray-800 rounded-xl p-4 bg-[#0f1115]">
                <label className="text-sm text-gray-300 font-medium">Subcategories</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Add subcategory..." value={newSubcat}
                    onChange={e => setNewSubcat(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubcat())}
                    className="flex-1 bg-[#1a1c23] border border-gray-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-500" />
                  <button onClick={addSubcat} className="px-3 py-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700 transition-colors border border-gray-700">Add</button>
                </div>
                {form.subcategories.length > 0 ? (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {form.subcategories.map((s, i) => (
                      <div key={i} className="flex items-center gap-1.5 bg-[#1a1c23] border border-gray-700 px-2.5 py-1 rounded-md">
                        <span className="text-xs text-gray-300">{s.name}</span>
                        {!s.id && <button onClick={() => removeSubcat(s.name)} className="text-gray-500 hover:text-red-400"><X size={12} /></button>}
                      </div>
                    ))}
                  </div>
                ) : <p className="text-xs text-gray-500 italic">No subcategories added yet.</p>}
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex gap-4">
              <button onClick={handleClose} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <Save size={16} />{saving ? 'Saving...' : isEditOpen ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </div>

          {/* View Modal */}
          {isViewOpen && viewingCat && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />
              <div className="relative bg-[#1a1c23] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                  <h2 className="text-lg font-semibold flex items-center gap-2"><Layers className="text-orange-500" size={22} />{viewingCat.name}</h2>
                  <button onClick={() => setIsViewOpen(false)} className="text-gray-400 hover:text-white"><X size={22} /></button>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium border ${viewingCat.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{viewingCat.status}</span>
                    <span className="text-gray-500 text-sm">{viewingCat.subcategories?.length || 0} subcategories</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Subcategories</h4>
                    {viewingCat.subcategories?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {viewingCat.subcategories.map(s => (
                          <span key={s.id} className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-md text-sm text-gray-300">{s.name}</span>
                        ))}
                      </div>
                    ) : <p className="text-gray-500 text-sm italic">No subcategories.</p>}
                  </div>
                </div>
                <div className="p-5 border-t border-gray-800 flex justify-end">
                  <button onClick={() => setIsViewOpen(false)} className="px-6 py-2.5 rounded-lg bg-gray-800 text-white hover:bg-gray-700 text-sm">Close</button>
                </div>
              </div>
            </div>
          )}
        </>,
        document.body
      )}
    </div>
  );
};

export default ExpenseCategories;
