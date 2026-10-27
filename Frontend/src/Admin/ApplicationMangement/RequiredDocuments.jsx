import { useCallback, useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Edit2, Eye, FileText, Plus, Search, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

const documentTypes = ['Identity Proof', 'Address Proof', 'Age Proof', 'Supporting Document', 'Certificate', 'Image'];
const applicantTypes = ['All', 'Individual', 'Student', 'Senior Citizen', 'Business'];
const formats = ['PDF', 'JPG', 'JPEG', 'PNG'];
const empty = {
  service_id: '',
  document_name: '',
  document_type: '',
  required_status: 'Required',
  applicant_type: 'All',
  issuing_authority: 'Other',
  document_description: '',
  accepted_formats: [],
  max_file_size: '5 MB',
  number_of_documents: 'Single',
  min_files: 1,
  max_files: 1,
  display_order: 1,
  status: 'Active',
  conditional_requirement: '',
  alternative_group: '',
};
const input = 'w-full rounded-lg border border-gray-800 bg-[#0f1115] px-3 py-2.5 text-sm text-white outline-none placeholder:text-gray-600 focus:border-orange-500';
const formatList = (value) => Array.isArray(value) ? value : [];

function Select({ name, value, onChange, children, required = true }) {
  return (
    <div className="relative">
      <select required={required} name={name} value={value} onChange={onChange} className={`${input} appearance-none pr-9`}>
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-3 text-gray-500" size={16} />
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}{required && <b className="text-red-500"> *</b>}
      </span>
      {children}
    </label>
  );
}

function DocumentForm({ value, services, saving, editing, onChange, onFormats, onSubmit, onCancel, onAddAnother }) {
  const submit = (event) => {
    event.preventDefault();
    onSubmit(false);
  };
  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Service" required>
        <Select name="service_id" value={value.service_id} onChange={onChange}>
          <option value="">Select service</option>
          {services.map((service) => <option key={service.id} value={service.id}>{service.service_name} ({service.service_code})</option>)}
        </Select>
      </Field>
      <Field label="Document Name" required>
        <input required name="document_name" value={value.document_name} onChange={onChange} className={input} placeholder="e.g. Aadhaar Card" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Document Type" required>
          <Select name="document_type" value={value.document_type} onChange={onChange}>
            <option value="">Select type</option>
            {documentTypes.map((type) => <option key={type}>{type}</option>)}
          </Select>
        </Field>
        <Field label="Required Status" required>
          <Select name="required_status" value={value.required_status} onChange={onChange}>
            <option>Required</option><option>Optional</option><option>Conditional</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Applicant Type">
          <Select name="applicant_type" value={value.applicant_type} onChange={onChange} required={false}>
            {applicantTypes.map((type) => <option key={type}>{type}</option>)}
          </Select>
        </Field>
        <Field label="Issuing Authority">
          <input name="issuing_authority" value={value.issuing_authority} onChange={onChange} className={input} placeholder="e.g. UIDAI / Government Department" />
        </Field>
      </div>
      <Field label="Document Description">
        <textarea name="document_description" value={value.document_description} onChange={onChange} rows="2" maxLength="1000" className={`${input} resize-y`} placeholder="Explain what is accepted for this requirement" />
      </Field>
      <Field label="Accepted File Formats" required>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {formats.map((format) => (
            <label key={format} className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm ${value.accepted_formats.includes(format) ? 'border-orange-500 bg-orange-500/10 text-orange-400' : 'border-gray-800 text-gray-400'}`}>
              <input type="checkbox" checked={value.accepted_formats.includes(format)} onChange={() => onFormats(format)} className="accent-orange-500" />{format}
            </label>
          ))}
        </div>
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Maximum File Size" required>
          <Select name="max_file_size" value={value.max_file_size} onChange={onChange}>
            {['2 MB', '5 MB', '10 MB'].map((size) => <option key={size}>{size}</option>)}
          </Select>
        </Field>
        <Field label="Number of Documents" required>
          <Select name="number_of_documents" value={value.number_of_documents} onChange={(event) => {
            onChange(event);
            if (event.target.value === 'Single') {
              onChange({ target: { name: 'max_files', value: '1' } });
              onChange({ target: { name: 'min_files', value: String(Math.min(Number(value.min_files), 1)) } });
            }
          }}>
            <option>Single</option><option>Multiple</option>
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Minimum File Count" required>
          <input type="number" min="0" max={value.max_files} name="min_files" value={value.min_files} onChange={onChange} className={input} />
        </Field>
        <Field label="Maximum File Count" required>
          <input type="number" min="1" max="20" name="max_files" value={value.max_files} onChange={onChange} className={input} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Display Order">
          <input type="number" min="1" name="display_order" value={value.display_order} onChange={onChange} className={input} />
        </Field>
        <Field label="Active Status">
          <Select name="status" value={value.status} onChange={onChange}>
            <option>Active</option><option>Inactive</option>
          </Select>
        </Field>
      </div>
      {value.required_status === 'Conditional' && (
        <Field label="Conditional Requirement" required>
          <textarea required name="conditional_requirement" value={value.conditional_requirement} onChange={onChange} rows="2" className={`${input} resize-y`} placeholder="When should this document be required?" />
        </Field>
      )}
      <Field label="Alternative Document Group">
        <input name="alternative_group" value={value.alternative_group} onChange={onChange} className={input} placeholder="e.g. family-community-proof" />
        <span className="mt-1 block text-xs text-gray-500">Documents with the same group are accepted as alternatives; one valid file from the group is enough.</span>
      </Field>
      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-800 pt-4">
        <button type="button" onClick={onCancel} className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-300">Cancel</button>
        {!editing && (
          <button type="button" onClick={onAddAnother} disabled={saving} className="rounded-lg border border-orange-500/60 px-4 py-2.5 text-sm font-medium text-orange-300 disabled:opacity-50">
            Save &amp; Add Another Document
          </button>
        )}
        <button disabled={saving} type="submit" className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50">
          {saving ? 'Saving...' : editing ? 'Save Document' : 'Save Document'}
        </button>
      </div>
    </form>
  );
}

export default function RequiredDocuments() {
  const [services, setServices] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [serviceFilter, setServiceFilter] = useState('All');
  const [requiredFilter, setRequiredFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [panel, setPanel] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(empty);
  const [saving, setSaving] = useState(false);

  const loadDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/service-documents');
      setDocuments(data.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to load required documents.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      api.get('/services')
        .then(({ data }) => {
          if (active) setServices(data.data || []);
        })
        .catch((error) => toast.error(error.response?.data?.message || 'Unable to load services.'));
      loadDocuments();
    }, 0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [loadDocuments]);

  const serviceCounts = useMemo(() => documents.reduce((counts, document) => {
    counts[document.service_id] = (counts[document.service_id] || 0) + 1;
    return counts;
  }, {}), [documents]);

  const visible = useMemo(() => documents
    .filter((document) => serviceFilter === 'All' || String(document.service_id) === serviceFilter)
    .filter((document) => requiredFilter === 'All' || document.required_status === requiredFilter)
    .filter((document) => statusFilter === 'All' || document.status === statusFilter)
    .filter((document) => {
      const query = search.trim().toLowerCase();
      return !query || [
        document.service_name, document.service_code, document.document_name,
        document.document_type, document.applicant_type, document.alternative_group,
      ].some((value) => String(value || '').toLowerCase().includes(query));
    })
    .sort((left, right) => left.service_name.localeCompare(right.service_name) ||
      Number(left.display_order) - Number(right.display_order) || Number(left.id) - Number(right.id)),
  [documents, requiredFilter, search, serviceFilter, statusFilter]);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({
      ...current,
      [name]: ['min_files', 'max_files', 'display_order'].includes(name) ? Number(value) : value,
      ...(name === 'service_id'
        ? { display_order: documents.filter((item) => String(item.service_id) === value).length + 1 }
        : {}),
    }));
  };
  const toggleFormat = (format) => setForm((current) => ({
    ...current,
    accepted_formats: current.accepted_formats.includes(format)
      ? current.accepted_formats.filter((item) => item !== format)
      : [...current.accepted_formats, format],
  }));
  const openAdd = (presetService = serviceFilter === 'All' ? '' : serviceFilter) => {
    setForm({
      ...empty,
      service_id: presetService,
      display_order: documents.filter((item) => String(item.service_id) === String(presetService)).length + 1,
    });
    setSelected(null);
    setPanel('form');
  };
  const edit = (document) => {
    setForm({
      ...empty,
      ...document,
      service_id: String(document.service_id),
      min_files: Number(document.min_files ?? 1),
      max_files: Number(document.max_files ?? 1),
      display_order: Number(document.display_order ?? 1),
      accepted_formats: formatList(document.accepted_formats),
    });
    setSelected(null);
    setPanel('form');
  };
  const save = async (addAnother = false) => {
    if (!form.accepted_formats.length) {
      toast.error('Select at least one accepted file format.');
      return;
    }
    if (form.min_files > form.max_files || (form.number_of_documents === 'Single' && form.max_files !== 1)) {
      toast.error('Check the minimum and maximum file count.');
      return;
    }
    if (form.required_status === 'Conditional' && !form.conditional_requirement.trim()) {
      toast.error('Describe when this conditional document is required.');
      return;
    }
    setSaving(true);
    try {
      const payload = { ...form, service_id: Number(form.service_id) };
      if (form.id) await api.put(`/service-documents/${form.id}`, payload);
      else await api.post('/service-documents', payload);
      toast.success(form.id ? 'Document saved successfully.' : 'Document added successfully.');
      const keepService = form.service_id;
      await loadDocuments();
      if (addAnother) {
        setForm({ ...empty, service_id: keepService, display_order: (serviceCounts[keepService] || 0) + 2 });
        setSelected(null);
      } else {
        setPanel(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save document.');
    } finally {
      setSaving(false);
    }
  };
  const remove = async (document) => {
    if (!window.confirm(`Delete "${document.document_name}" for ${document.service_name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/service-documents/${document.id}`);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      toast.success('Document deleted successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to delete document.');
    }
  };
  const toggleStatus = async (document) => {
    const next = document.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await api.patch(`/service-documents/${document.id}/status`, { status: next });
      setDocuments((current) => current.map((item) => item.id === document.id ? { ...item, status: next } : item));
      toast.success(`Document ${next === 'Active' ? 'activated' : 'deactivated'}.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update document status.');
    }
  };
  const closePanel = () => { setPanel(null); setSelected(null); };
  const popup = panel && typeof document !== 'undefined' ? createPortal(
    <div className="fixed inset-0 z-[100] flex justify-end bg-black/60 backdrop-blur-sm" onClick={closePanel}>
      <aside className="h-full w-full max-w-2xl overflow-y-auto border-l border-gray-700 bg-[#1a1c23] p-5 text-white shadow-2xl sm:p-6" onClick={(event) => event.stopPropagation()}>
        <div className="mb-5 flex justify-between border-b border-gray-800 pb-4">
          <div>
            <h2 className="text-xl font-semibold">{panel === 'form' ? (form.id ? 'Edit Document' : 'Add Document') : 'Document Details'}</h2>
            {panel === 'form' && <p className="mt-1 text-xs text-gray-400">Configure an individual service document requirement.</p>}
          </div>
          <button type="button" onClick={closePanel} title="Close" className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"><X size={19} /></button>
        </div>
        {panel === 'form' ? (
          <DocumentForm
            value={form}
            services={services}
            saving={saving}
            editing={Boolean(form.id)}
            onChange={update}
            onFormats={toggleFormat}
            onSubmit={save}
            onAddAnother={() => save(true)}
            onCancel={closePanel}
          />
        ) : selected && (
          <>
            <p className="text-xs uppercase text-orange-400">{selected.service_name} ({selected.service_code})</p>
            <h3 className="mt-1 text-lg font-semibold">{selected.document_name}</h3>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {[
                ['Type', selected.document_type],
                ['Required status', selected.required_status],
                ['Applicant', selected.applicant_type],
                ['Formats', formatList(selected.accepted_formats).join(', ')],
                ['Maximum size', selected.max_file_size],
                ['File count', `${selected.min_files ?? 1}–${selected.max_files ?? 1}`],
                ['Display order', selected.display_order],
                ['Active status', selected.status],
                ['Alternative group', selected.alternative_group || '—'],
                ['Issuing authority', selected.issuing_authority],
              ].map(([label, value]) => <div key={label} className="rounded-lg border border-gray-800 bg-[#0f1115] p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 break-words text-sm text-gray-200">{value || 'Not provided'}</p></div>)}
            </div>
            {selected.conditional_requirement && <p className="mt-3 rounded-lg border border-gray-800 bg-[#0f1115] p-3 text-sm text-gray-300">{selected.conditional_requirement}</p>}
            <p className="mt-3 rounded-lg bg-[#0f1115] p-3 text-sm text-gray-300">{selected.document_description || 'No description provided.'}</p>
            <button type="button" onClick={() => edit(selected)} className="mt-5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-medium">Edit document</button>
          </>
        )}
      </aside>
    </div>,
    document.body,
  ) : null;

  return (
    <>
      <div className="flex flex-col gap-6 p-2 text-white sm:p-4">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="mb-1 text-2xl font-semibold">Required Documents</h1>
            <div className="text-sm text-gray-400">Dashboard &gt; Service Management &gt; Documents</div>
          </div>
          <button type="button" onClick={() => openAdd()} disabled={!services.length} className="flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2.5 text-sm font-medium disabled:opacity-50"><Plus size={18} /> Add Document</button>
        </div>

        <section className="grid gap-3 rounded-xl border border-orange-500/30 bg-[#1a1c23] p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-300">Service</span>
            <Select name="service_filter" value={serviceFilter} onChange={(event) => setServiceFilter(event.target.value)} required={false}>
              <option value="All">All Services</option>
              {services.map((service) => <option key={service.id} value={service.id}>{service.service_name} ({service.service_code}) · {serviceCounts[service.id] || 0}</option>)}
            </Select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-300">Required status</span>
            <Select name="required_filter" value={requiredFilter} onChange={(event) => setRequiredFilter(event.target.value)} required={false}>
              <option>All</option><option>Required</option><option>Optional</option><option>Conditional</option>
            </Select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-300">Active status</span>
            <Select name="active_filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} required={false}>
              <option>All</option><option>Active</option><option>Inactive</option>
            </Select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-gray-300">Search</span>
            <span className="flex items-center gap-2 rounded-lg border border-gray-800 bg-[#0f1115] px-3">
              <Search size={16} className="shrink-0 text-gray-500" />
              <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Service or document name..." className="min-w-0 flex-1 bg-transparent py-2.5 text-sm text-white outline-none placeholder:text-gray-600" />
            </span>
          </label>
        </section>

        <section className="overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c23]">
          <div className="flex items-center justify-between border-b border-gray-800 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-200">Configured Documents</h2>
            <span className="text-xs text-gray-400">{visible.length} shown · {documents.length} total</span>
          </div>
          {loading ? (
            <div className="space-y-3 p-5" aria-label="Loading documents">{[1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-gray-800" />)}</div>
          ) : !visible.length ? (
            <div className="px-5 py-14 text-center">
              <FileText className="mx-auto text-gray-600" size={36} />
              <h3 className="mt-3 font-semibold text-gray-200">No documents found</h3>
              <p className="mt-1 text-sm text-gray-400">Choose another filter or add a document configuration.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="bg-[#111318] text-xs uppercase text-gray-400">
                  <tr>{['Order', 'Service / count', 'Document', 'Type / status', 'Accepted files', 'Size / count', 'Active', 'Actions'].map((heading) => <th key={heading} className="px-3 py-3 font-semibold">{heading}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {visible.map((item) => (
                    <tr key={item.id} className="hover:bg-white/[0.02]">
                      <td className="px-3 py-3 text-gray-300">{item.display_order}</td>
                      <td className="px-3 py-3"><p className="font-medium text-gray-100">{item.service_name}</p><p className="text-xs text-gray-500">{item.service_code} · {serviceCounts[item.service_id] || 0} documents</p></td>
                      <td className="px-3 py-3"><p className="font-medium text-gray-100">{item.document_name}</p><p className="text-xs text-gray-500">{item.applicant_type} · {item.alternative_group || 'No alternative group'}</p></td>
                      <td className="px-3 py-3"><p className="text-gray-200">{item.document_type}</p><p className="text-xs text-gray-400">{item.required_status}</p></td>
                      <td className="px-3 py-3 text-xs text-gray-300">{formatList(item.accepted_formats).join(', ') || '—'}</td>
                      <td className="px-3 py-3 text-gray-300"><p>{item.max_file_size}</p><p className="text-xs text-gray-500">{item.min_files ?? 1}–{item.max_files ?? 1} file(s)</p></td>
                      <td className="px-3 py-3"><span className={`rounded-full px-2 py-1 text-xs ${item.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gray-700/50 text-gray-400'}`}>{item.status}</span></td>
                      <td className="px-3 py-3"><div className="flex gap-1">
                        <button type="button" title="View document" onClick={() => { setSelected(item); setPanel('view'); }} className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white"><Eye size={15} /></button>
                        <button type="button" title="Edit document" onClick={() => edit(item)} className="rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-orange-400"><Edit2 size={15} /></button>
                        <button type="button" title={item.status === 'Active' ? 'Deactivate document' : 'Activate document'} onClick={() => toggleStatus(item)} className="rounded-md px-2 text-xs text-amber-300 hover:bg-amber-500/10">{item.status === 'Active' ? 'Deactivate' : 'Activate'}</button>
                        <button type="button" title="Delete document" onClick={() => remove(item)} className="rounded-md p-2 text-gray-400 hover:bg-red-500/10 hover:text-red-400"><Trash2 size={15} /></button>
                      </div></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
      {popup}
    </>
  );
}
