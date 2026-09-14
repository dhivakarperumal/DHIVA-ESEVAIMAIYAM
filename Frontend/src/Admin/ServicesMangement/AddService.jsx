import { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, FileText, ImagePlus, Plus, Trash2, Upload, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import '../../App.css';

const initialForm = {
  service_name: '', service_code: '', category: '', subcategory: '', description: '', provider_department: '', portal_url: '',
  government_fee: '', service_charge: '', gst_tax: '', payment_type: 'Cash', document_instructions: '', processing_time: '',
  application_type: 'Online', service_availability: 'All Days', priority_service: 'No', delivery_method: 'Online', status: 'Active',
  featured_service: 'No', service_image: '', terms_conditions: '', additional_notes: '',
};

const inputClass = 'w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-100';

const normalizeDocuments = (value) => {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try {
      return normalizeDocuments(JSON.parse(value));
    } catch {
      return value.trim() ? [{ name: value.trim(), requirement: 'Mandatory' }] : [];
    }
  }
  if (value && typeof value === 'object') return value.name ? [value] : [];
  return [];
};

function Section({ icon: Icon, title, description, children }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-5 flex items-start gap-3 border-b border-slate-100 pb-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600"><Icon size={18} /></span>
      <div><h2 className="text-base font-semibold text-slate-900">{title}</h2><p className="mt-0.5 text-xs text-slate-500">{description}</p></div>
    </div>
    {children}
  </section>;
}

function Field({ label, required, error, children, className = '' }) {
  return <label className={`block ${className}`}><span className="mb-1.5 block text-sm font-medium text-slate-700">{label} {required && <b className="text-red-500">*</b>}</span>{children}{error && <span className="mt-1 block text-xs text-red-600">{error}</span>}</label>;
}

function Select({ value, onChange, children, name }) {
  return <div className="relative"><select name={name} value={value} onChange={onChange} className={`${inputClass} appearance-none pr-9`}>{children}</select><ChevronDown className="pointer-events-none absolute right-3 top-3 text-slate-400" size={16} /></div>;
}

const money = (value) => Number.parseFloat(value) || 0;

export default function AddService({ embedded = false, onCancel, onSaved, serviceId }) {
  const navigate = useNavigate();
  const { id: routeId } = useParams();
  const id = serviceId || routeId;
  const isEditing = Boolean(id);
  const fieldGridClass = 'grid grid-cols-1 gap-4';
  const fileRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [codeLoading, setCodeLoading] = useState(!id);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const total = useMemo(() => money(form.government_fee) + money(form.service_charge) + money(form.gst_tax), [form]);

  const selectedCategory = categories.find((category) => category.name === form.category);
  const subcategories = selectedCategory?.subcategories || [];

  useEffect(() => {
    let active = true;
    api.get('/categories').then(({ data }) => {
      if (!active) return;
      setCategories((data.data || []).filter((category) => category.status !== 'Inactive'));
    }).catch(() => {
      if (active) toast.error('Unable to load service categories.');
    }).finally(() => {
      if (active) setCategoriesLoading(false);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (id) return undefined;
    let active = true;
    api.get('/services').then(({ data }) => {
      if (!active) return;
      const highestCode = (data.data || []).reduce((highest, service) => {
        const match = String(service.service_code || '').match(/^SV-(\d+)$/i);
        return match ? Math.max(highest, Number(match[1])) : highest;
      }, 0);
      setForm((current) => ({ ...current, service_code: `SV-${String(highestCode + 1).padStart(3, '0')}` }));
    }).catch(() => {
      if (active) toast.error('Unable to generate service code.');
    }).finally(() => {
      if (active) setCodeLoading(false);
    });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    if (!id) return undefined;
    let active = true;
    api.get(`/services/${id}`).then(({ data }) => {
      if (!active) return;
      const service = data.data;
      const fields = Object.keys(initialForm).reduce((values, key) => ({ ...values, [key]: service[key] ?? initialForm[key] }), {});
      setForm(fields);
      setDocuments(normalizeDocuments(service.required_documents));
    }).catch(() => toast.error('Unable to load service details.'));
    return () => { active = false; };
  }, [id]);

  const update = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const validate = () => {
    const next = {};
    if (!form.service_name.trim()) next.service_name = 'Service name is required.';
    if (!form.service_code.trim()) next.service_code = 'Service code is required.';
    if (!form.category) next.category = 'Select a service category.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };
  const addDocument = () => setDocuments((current) => [...current, { name: '', requirement: 'Mandatory' }]);
  const updateDocument = (index, key, value) => setDocuments((current) => current.map((doc, itemIndex) => itemIndex === index ? { ...doc, [key]: value } : doc));
  const removeDocument = (index) => setDocuments((current) => current.filter((_, itemIndex) => itemIndex !== index));
  const handleImage = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImageFile(file);
  };

  const save = async (addAnother = false) => {
    if (!validate()) { toast.error('Please complete the required fields.'); return; }
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries({ ...form, service_code: form.service_code.toUpperCase() }).forEach(([key, value]) => {
        if (key !== 'service_image') payload.append(key, value ?? '');
      });
      payload.append('required_documents', JSON.stringify(documents));
      if (imageFile) payload.append('service_image', imageFile);
      if (isEditing) await api.put(`/services/${id}`, payload);
      else await api.post('/services', payload);
      toast.success(isEditing ? 'Service updated successfully.' : 'Service added successfully.');
      if (addAnother) { setForm(initialForm); setDocuments([]); setImageFile(null); setErrors({}); }
      else if (onSaved) { onSaved(); onCancel?.(); }
      else navigate('/admin/service-management/all');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save service.');
    } finally { setSaving(false); }
  };

  return <div className={`${embedded ? 'relative min-h-screen' : 'min-h-full'} bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8`}>
    <div className="mx-auto max-w-7xl">
      <header className="service-drawer-header mb-7 flex items-start justify-between gap-4">
        <div className="min-w-0">
          {!embedded && <div className="mb-2 flex items-center gap-2 text-xs text-slate-500"><span>Dashboard</span><span>/</span><span>Services</span><span>/</span><span className="text-slate-800">{isEditing ? 'Edit Service' : 'Add Service'}</span></div>}
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">{isEditing ? 'Edit Service' : 'Add Service'}</h1>
          <p className="mt-1 text-sm text-slate-500">{isEditing ? 'Update E-Sevai service details' : 'Add and manage E-Sevai services'}</p>
        </div>
        {embedded && <button type="button" onClick={onCancel} title="Close" aria-label="Close add service" className="shrink-0 rounded-lg border border-gray-700 p-2 text-gray-400 transition hover:bg-gray-800 hover:text-white"><X size={19} /></button>}
      </header>

      <form onSubmit={(event) => { event.preventDefault(); save(false); }} className="service-form grid grid-cols-1 gap-5">
        <Section icon={FileText} title="Service Information" description="Basic details visible to staff and citizens">
          <div className={fieldGridClass}>
            <Field label="Service Name" required error={errors.service_name} className="sm:col-span-2"><input name="service_name" value={form.service_name} onChange={update} className={inputClass} placeholder="e.g. Community Certificate" /></Field>
            <Field label="Service Code" required error={errors.service_code}><input name="service_code" value={codeLoading ? 'Generating...' : form.service_code} readOnly className={`${inputClass} cursor-not-allowed bg-slate-100 font-mono`} placeholder="SV-001" /><span className="mt-1 block text-xs text-slate-500">Automatically generated from existing services</span></Field>
            <Field label="Service Category" required error={errors.category}><Select name="category" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value, subcategory: '' }))}><option value="">{categoriesLoading ? 'Loading categories...' : 'Select category'}</option>{categories.map((category) => <option key={category.cid || category.id} value={category.name}>{category.name}</option>)}</Select></Field>
            <Field label="Service Subcategory"><Select name="subcategory" value={form.subcategory} onChange={update}><option value="">{form.category ? (subcategories.length ? 'Select subcategory' : 'No subcategories') : 'Select a category first'}</option>{subcategories.map((subcategory) => <option key={subcategory} value={subcategory}>{subcategory}</option>)}</Select></Field>
            <Field label="Service Provider / Department"><input name="provider_department" value={form.provider_department} onChange={update} className={inputClass} placeholder="e.g. Revenue Department" /></Field>
            <Field label="Government Portal / Service URL" className="sm:col-span-2"><input type="url" name="portal_url" value={form.portal_url} onChange={update} className={inputClass} placeholder="https://services.gov.in/..." /></Field>
            <Field label="Service Description" className="sm:col-span-2"><textarea name="description" value={form.description} onChange={update} rows="4" maxLength="500" className={`${inputClass} resize-y`} placeholder="Describe what this service helps citizens complete." /><span className="mt-1 block text-right text-xs text-slate-400">{form.description.length}/500</span></Field>
          </div>
        </Section>

        <Section icon={Check} title="Fees & Charges" description="Set the amounts collected for this service">
          <div className={fieldGridClass}>
            {['government_fee', 'service_charge', 'gst_tax'].map((name) => <Field key={name} label={{ government_fee: 'Government Fee', service_charge: 'Service Charge', gst_tax: 'GST / Tax' }[name]}><div className="relative"><span className="absolute left-3 top-2.5 text-sm text-slate-400">₹</span><input type="number" min="0" step="0.01" name={name} value={form[name]} onChange={update} className={`${inputClass} pl-8`} placeholder="0.00" /></div></Field>)}
            <Field label="Payment Type"><Select name="payment_type" value={form.payment_type} onChange={update}><option>Cash</option><option>UPI</option><option>Card</option><option>Online</option></Select></Field>
          </div>
          <div className="mt-5 flex items-center justify-between rounded-lg bg-orange-50 px-4 py-4"><span className="text-sm font-medium text-orange-900">Total Amount</span><strong className="text-xl text-orange-700">₹ {total.toFixed(2)}</strong></div>
        </Section>

        <Section icon={FileText} title="Required Documents" description="Tell staff what citizens must submit">
          <div className="space-y-4"><Field label="Document Instructions"><textarea name="document_instructions" value={form.document_instructions} onChange={update} rows="3" className={`${inputClass} resize-y`} placeholder="Add guidance for collecting documents..." /></Field>
            <div className="flex items-center justify-between"><div><p className="text-sm font-medium text-slate-700">Required Documents</p><p className="text-xs text-slate-500">{documents.length} document{documents.length === 1 ? '' : 's'} required</p></div><button type="button" onClick={addDocument} className="inline-flex items-center gap-1.5 rounded-lg border border-orange-200 px-3 py-2 text-xs font-semibold text-orange-700 hover:bg-orange-50"><Plus size={15} /> Add document</button></div>
            {documents.length === 0 && <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">No documents added yet.</div>}
            {documents.map((document, index) => <div key={index} className="grid grid-cols-[minmax(0,1fr)_130px_auto] items-start gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3"><input value={document.name} onChange={(event) => updateDocument(index, 'name', event.target.value)} className={inputClass} placeholder="Document name" /><Select value={document.requirement} onChange={(event) => updateDocument(index, 'requirement', event.target.value)}><option>Mandatory</option><option>Optional</option></Select><button type="button" onClick={() => removeDocument(index)} title="Remove document" className="flex h-10 items-center justify-center rounded-lg border border-red-200 px-3 text-red-600 hover:bg-red-50"><Trash2 size={16} /></button></div>)}
          </div>
        </Section>

        <Section icon={Check} title="Processing Details" description="Define how and when the service is delivered">
          <div className={fieldGridClass}><Field label="Processing Time"><input name="processing_time" value={form.processing_time} onChange={update} className={inputClass} placeholder="e.g. 3 working days" /></Field><Field label="Application Type"><Select name="application_type" value={form.application_type} onChange={update}><option>Online</option><option>Offline</option><option>Both</option></Select></Field><Field label="Service Availability"><Select name="service_availability" value={form.service_availability} onChange={update}><option>All Days</option><option>Selected Days</option></Select></Field><Field label="Priority Service"><Select name="priority_service" value={form.priority_service} onChange={update}><option>No</option><option>Yes</option></Select></Field><Field label="Delivery Method" className="sm:col-span-2"><Select name="delivery_method" value={form.delivery_method} onChange={update}><option>Online</option><option>Print</option><option>Email</option><option>SMS</option></Select></Field></div>
        </Section>

        <Section icon={Upload} title="Service Settings" description="Control visibility and add supporting information" >
          <div className={fieldGridClass}><Field label="Service Status"><Select name="status" value={form.status} onChange={update}><option>Active</option><option>Inactive</option></Select></Field><Field label="Featured Service"><Select name="featured_service" value={form.featured_service} onChange={update}><option>No</option><option>Yes</option></Select></Field><Field label="Service Icon / Image Upload" className="sm:col-span-2"><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={handleImage} className="hidden" /><button type="button" onClick={() => fileRef.current?.click()} className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-5 text-sm text-slate-500 hover:border-orange-400 hover:bg-orange-50"><ImagePlus size={18} /> {imageFile ? imageFile.name : form.service_image ? 'Existing image saved' : 'Choose an image'}</button><span className="mt-1 block text-xs text-slate-500">PNG, JPG, WEBP or GIF up to 5 MB</span></Field><Field label="Terms & Conditions" className="sm:col-span-2"><textarea name="terms_conditions" value={form.terms_conditions} onChange={update} rows="3" className={`${inputClass} resize-y`} placeholder="Enter terms and conditions..." /></Field><Field label="Additional Notes" className="sm:col-span-2"><textarea name="additional_notes" value={form.additional_notes} onChange={update} rows="3" className={`${inputClass} resize-y`} placeholder="Internal notes for staff..." /></Field></div>
        </Section>

        <div className="flex flex-col-reverse gap-3 pb-4 sm:col-span-2 sm:flex-row sm:justify-end"><button type="button" onClick={() => (onCancel ? onCancel() : navigate('/admin/service-management/all'))} className="rounded-lg border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>{!isEditing && <button type="button" disabled={saving} onClick={() => save(true)} className="rounded-lg border border-orange-200 bg-orange-50 px-5 py-3 text-sm font-semibold text-orange-700 hover:bg-orange-100 disabled:opacity-60">Save & Add Another</button>}<button type="submit" disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-orange-700 disabled:opacity-60">{saving ? 'Saving...' : <><Check size={17} /> {isEditing ? 'Update Service' : 'Save Service'}</>}</button></div>
      </form>
    </div>
  </div>;
}
