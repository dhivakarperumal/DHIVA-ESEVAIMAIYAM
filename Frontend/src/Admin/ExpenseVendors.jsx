import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import { Search, Plus, RefreshCcw, Eye, Edit2, Trash2, X, Save, Building2, Phone, Mail, MapPin } from 'lucide-react';

const API = 'http://localhost:5000/api/expenses';
const inputClass = "w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-orange-500/50 placeholder-gray-600";

const ExpenseVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewingVendor, setViewingVendor] = useState(null);

  const emptyForm = { vendor_name: '', mobile: '', email: '', address: '', gst_number: '', description: '', status: 'Active' };
  const [form, setForm] = useState(emptyForm);

  const fetchVendors = async () => {
    try { setLoading(true); const res = await axios.get(`${API}/vendors`); if (res.data.success) setVendors(res.data.data); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchVendors(); }, []);

  const openAdd = () => { setForm(emptyForm); setEditingId(null); setIsDrawerOpen(true); };
  const openEdit = (v) => { setForm({ vendor_name: v.vendor_name, mobile: v.mobile || '', email: v.email || '', address: v.address || '', gst_number: v.gst_number || '', description: v.description || '', status: v.status }); setEditingId(v.id); setIsDrawerOpen(true); };
  const openView = (v) => { setViewingVendor(v); setIsViewOpen(true); };
  const closeDrawer = () => { setIsDrawerOpen(false); setEditingId(null); setForm(emptyForm); };

  const handleSave = async () => {
    if (!form.vendor_name.trim()) return alert('Vendor name required');
    setSaving(true);
    try {
      if (editingId) { await axios.put(`${API}/vendors/${editingId}`, form); }
      else { await axios.post(`${API}/vendors`, form); }
      fetchVendors(); closeDrawer();
    } catch (err) { alert(err.response?.data?.message || 'Save failed'); } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete vendor "${name}"?`)) return;
    await axios.delete(`${API}/vendors/${id}`);
    fetchVendors();
  };

  const filtered = vendors.filter(v => v.vendor_name.toLowerCase().includes(search.toLowerCase()) || v.vendor_id?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Vendor / Payee Management</h1>
          <div className="text-sm text-gray-400 flex items-center gap-2"><span>Dashboard</span><span className="text-gray-600">&gt;</span><span>Expense Management</span><span className="text-gray-600">&gt;</span><span className="text-gray-200">Vendors</span></div>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"><Plus size={18} /><span>Add Vendor</span></button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Vendors', value: vendors.length, color: 'text-orange-500 bg-orange-500/10' },
          { label: 'Active', value: vendors.filter(v => v.status === 'Active').length, color: 'text-green-500 bg-green-500/10' },
          { label: 'Inactive', value: vendors.filter(v => v.status === 'Inactive').length, color: 'text-red-500 bg-red-500/10' },
          { label: 'With GST', value: vendors.filter(v => v.gst_number).length, color: 'text-blue-400 bg-blue-500/10' },
        ].map(s => (
          <div key={s.label} className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-lg ${s.color}`}><Building2 size={20} /></div>
            <div><p className="text-gray-400 text-xs">{s.label}</p><h3 className="text-xl font-bold mt-0.5">{s.value}</h3></div>
          </div>
        ))}
      </div>

      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex gap-4">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by vendor name or ID..." className="w-full bg-[#0f1115] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-gray-600 placeholder-gray-500" /></div>
        <button onClick={() => setSearch('')} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors"><RefreshCcw size={16} /><span>Reset</span></button>
      </div>

      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="py-4 px-4 pl-6 font-medium">Vendor</th>
                <th className="py-4 px-4 font-medium">Mobile</th>
                <th className="py-4 px-4 font-medium">Email</th>
                <th className="py-4 px-4 font-medium">GST</th>
                <th className="py-4 px-4 font-medium text-center">Status</th>
                <th className="py-4 px-4 pr-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="py-16 text-center text-orange-500"><RefreshCcw className="animate-spin inline mr-2" size={20} />Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={6} className="py-16 text-center text-gray-500">No vendors found.<br /><button onClick={openAdd} className="text-orange-500 hover:underline text-sm mt-1">Add your first vendor →</button></td></tr>
              ) : filtered.map(v => (
                <tr key={v.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-3 px-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 font-semibold text-sm">{v.vendor_name.charAt(0).toUpperCase()}</div>
                      <div><p className="font-medium text-white">{v.vendor_name}</p><p className="text-xs text-orange-400 font-mono">{v.vendor_id}</p></div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{v.mobile || '-'}</td>
                  <td className="py-3 px-4 text-gray-300 text-sm">{v.email || '-'}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm font-mono">{v.gst_number || '-'}</td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium border ${v.status === 'Active' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>{v.status}</span>
                  </td>
                  <td className="py-3 px-4 pr-6">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openView(v)} className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"><Eye size={15} /></button>
                      <button onClick={() => openEdit(v)} className="p-1.5 rounded-md text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors"><Edit2 size={15} /></button>
                      <button onClick={() => handleDelete(v.id, v.vendor_name)} className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors"><Trash2 size={15} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-gray-800 text-sm text-gray-400">Showing {filtered.length} of {vendors.length} vendors</div>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <>
          {isDrawerOpen && <div className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" onClick={closeDrawer} />}
          <div className={`fixed inset-y-0 right-0 w-[440px] bg-[#1a1c23] border-l border-gray-800 shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold">{editingId ? 'Edit Vendor' : 'Add Vendor'}</h2>
              <button onClick={closeDrawer} className="text-gray-400 hover:text-white"><X size={22} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {[
                { label: 'Vendor Name', key: 'vendor_name', placeholder: 'e.g. BSNL / Landlord Name', required: true },
                { label: 'Mobile Number', key: 'mobile', placeholder: '+91 98765 43210' },
                { label: 'Email', key: 'email', placeholder: 'vendor@email.com', type: 'email' },
                { label: 'GST Number', key: 'gst_number', placeholder: '27AAPFU0939F1ZV' },
              ].map(f => (
                <div key={f.key} className="space-y-1.5">
                  <label className="text-sm text-gray-300 font-medium">{f.label}{f.required && <span className="text-red-500 ml-1">*</span>}</label>
                  <input type={f.type || 'text'} placeholder={f.placeholder} value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} className={inputClass} />
                </div>
              ))}
              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Address</label>
                <textarea rows={2} placeholder="Full address..." value={form.address}
                  onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
                  className={`${inputClass} resize-none`} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Description</label>
                <textarea rows={2} placeholder="Brief description..." value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  className={`${inputClass} resize-none`} />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-300 font-medium">Status</label>
                <div className="flex gap-6">
                  {['Active', 'Inactive'].map(s => (
                    <label key={s} className="flex items-center gap-2 cursor-pointer">
                      <input type="radio" name="vendorStatus" checked={form.status === s} onChange={() => setForm(p => ({ ...p, status: s }))} className="w-4 h-4 accent-orange-500" />
                      <span className="text-sm text-white">{s}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-gray-800 flex gap-4">
              <button onClick={closeDrawer} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm">Cancel</button>
              <button onClick={handleSave} disabled={saving}
                className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <Save size={16} />{saving ? 'Saving...' : editingId ? 'Update Vendor' : 'Save Vendor'}
              </button>
            </div>
          </div>

          {isViewOpen && viewingVendor && (
            <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsViewOpen(false)} />
              <div className="relative bg-[#1a1c23] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-semibold">{viewingVendor.vendor_name.charAt(0)}</div>
                    <div><h2 className="text-lg font-semibold">{viewingVendor.vendor_name}</h2><p className="text-xs text-orange-400 font-mono">{viewingVendor.vendor_id}</p></div>
                  </div>
                  <button onClick={() => setIsViewOpen(false)} className="text-gray-400 hover:text-white"><X size={22} /></button>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    [Phone, 'Mobile', viewingVendor.mobile],
                    [Mail, 'Email', viewingVendor.email],
                    [MapPin, 'Address', viewingVendor.address],
                    [Building2, 'GST Number', viewingVendor.gst_number],
                  ].map(([Icon, label, val]) => val ? (
                    <div key={label} className="flex items-start gap-3 bg-[#0f1115] rounded-lg p-3">
                      <Icon size={16} className="text-orange-400 mt-0.5 shrink-0" />
                      <div><p className="text-xs text-gray-500">{label}</p><p className="text-sm text-white mt-0.5">{val}</p></div>
                    </div>
                  ) : null)}
                  {viewingVendor.description && (
                    <div className="bg-[#0f1115] rounded-lg p-3"><p className="text-xs text-gray-500">Description</p><p className="text-sm text-white mt-0.5">{viewingVendor.description}</p></div>
                  )}
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

export default ExpenseVendors;
