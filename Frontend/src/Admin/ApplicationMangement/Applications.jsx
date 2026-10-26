import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, BadgeCheck, CheckCircle2, ChevronLeft,
  ChevronRight, CircleAlert, Clock3, Download, Eye, FileCheck2, FileText,
  FolderOpen, LayoutGrid, List, LoaderCircle, LockKeyhole, Plus, Search, ShieldAlert,
  UserRoundCog, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

const inputClass = 'w-full rounded-lg border border-gray-800 bg-[#0f1115] px-3 py-2.5 text-sm text-white [color-scheme:dark] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:bg-gray-900';
const statuses = [
  'All', 'Application Submitted', 'Documents Under Verification',
  'Pending Additional Documents', 'Pending Payment', 'Ready for Approval',
  'Approved', 'Certificate Generated', 'Completed', 'Rejected', 'Cancelled',
];

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const statusColors = {
  'Application Submitted': 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  Pending: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  'Documents Under Verification': 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
  'Pending Additional Documents': 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  'Pending Payment': 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  'Ready for Approval': 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  Approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  'Certificate Generated': 'border-teal-500/30 bg-teal-500/10 text-teal-400',
  Completed: 'border-green-500/30 bg-green-500/10 text-green-400',
  Rejected: 'border-red-500/30 bg-red-500/10 text-red-400',
  Cancelled: 'border-gray-700 bg-gray-800 text-gray-400',
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold ${statusColors[status] || 'border-gray-700 bg-gray-800 text-gray-400'}`}>
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" />
      <span className="truncate">{status || 'Application Submitted'}</span>
    </span>
  );
}

function Field({ label, required, children, error }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function Dialog({ title, description, onClose, children, wide = false }) {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section role="dialog" aria-modal="true" aria-labelledby="application-dialog-title" className={`my-auto w-full ${wide ? 'max-w-4xl' : 'max-w-xl'} overflow-hidden rounded-2xl border border-gray-800 bg-[#1a1c23] text-white shadow-2xl`}>
        <header className="flex items-start justify-between gap-4 border-b border-gray-800 px-5 py-4 sm:px-6">
          <div>
            <h2 id="application-dialog-title" className="text-lg font-semibold text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-gray-400 hover:bg-gray-800 hover:text-white"><X size={18} /></button>
        </header>
        {children}
      </section>
    </div>
  );
}

const emptyApplication = {
  applicant_name: '', mobile: '', email: '', service_id: '', center_name: '', notes: '',
};

export default function Applications() {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({
    search: '', status: 'All', service_id: 'All', page: 1, limit: 10,
  });
  const [viewMode, setViewMode] = useState('table');
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [dialogApplication, setDialogApplication] = useState(null);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [applicationForm, setApplicationForm] = useState(emptyApplication);
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [actionBusy, setActionBusy] = useState(false);
  const [assignment, setAssignment] = useState('');
  const [uploadDocumentId, setUploadDocumentId] = useState('');
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [documentReview, setDocumentReview] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState('');

  const params = useMemo(() => ({
    search: filters.search.trim() || undefined,
    status: filters.status === 'All' ? undefined : filters.status,
    service_id: filters.service_id === 'All' ? undefined : filters.service_id,
    page: filters.page,
    limit: filters.limit,
  }), [filters]);

  const loadList = useCallback(async () => {
    try {
      const { data } = await api.get('/applications', { params });
      setRecords(data.data || []);
      setPagination(data.pagination || { page: 1, limit: filters.limit, total: 0, pages: 0 });
      setPageError('');
    } catch (error) {
      setRecords([]);
      setPagination({ page: filters.page, limit: filters.limit, total: 0, pages: 0 });
      setPageError(error.response?.data?.message || 'Unable to load applications. Check backend connection and sign-in.');
    } finally {
      setLoading(false);
    }
  }, [filters.limit, filters.page, params]);

  const loadSummary = useCallback(async () => {
    try {
      const { data } = await api.get('/applications/workflow/summary');
      setSummary(data.data);
    } catch (error) {
      setPageError(error.response?.data?.message || 'Unable to load application summary.');
    }
  }, []);

  const loadOptions = useCallback(async () => {
    try {
      const { data } = await api.get('/applications/workflow/options');
      setServices(data.data?.services || []);
      setStaff(data.data?.staff || []);
    } catch (error) {
      setPageError(error.response?.data?.message || 'Unable to load services and staff options.');
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => { loadList(); }, 100);
    return () => window.clearTimeout(timer);
  }, [loadList]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadSummary();
      loadOptions();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [loadOptions, loadSummary]);

  const reloadCurrentApplication = useCallback(async (applicationId) => {
    const [{ data: detailResponse }] = await Promise.all([
      api.get(`/applications/${applicationId}`),
      loadList(),
      loadSummary(),
    ]);
    setDetails(detailResponse.data);
  }, [loadList, loadSummary]);

  const setFilter = (key, value) => {
    setLoading(true);
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };

  const openDetails = async (record) => {
    setDialogApplication(record);
    setDetails(null);
    setDetailsLoading(true);
    setReason('');
    setRemarks('');
    setAssignment(record.assigned_staff_id ? String(record.assigned_staff_id) : '');
    try {
      const { data } = await api.get(`/applications/${record.id}`);
      setDetails(data.data);
    } catch (error) {
      setDialogApplication(null);
      setPageError(error.response?.data?.message || 'Unable to load application details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const beginWorkflowAction = (status) => {
    setReason('');
    setRemarks('');
    setSelectedAction(status);
  };

  const submitWorkflowAction = async (event) => {
    event.preventDefault();
    if (!details || !selectedAction) return;
    setActionBusy(true);
    try {
      await api.patch(`/applications/${details.id}/workflow`, {
        status: selectedAction,
        reason: reason.trim(),
        remarks: remarks.trim(),
      });
      toast.success(`Application status updated to ${selectedAction}.`);
      setSelectedAction('');
      await reloadCurrentApplication(details.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update application status.');
    } finally {
      setActionBusy(false);
    }
  };

  const assignStaff = async (event) => {
    event.preventDefault();
    if (!details) return;
    setActionBusy(true);
    try {
      await api.patch(`/applications/${details.id}/assignment`, {
        staff_id: assignment || null,
      });
      toast.success('Application assignment updated.');
      await reloadCurrentApplication(details.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to assign staff.');
    } finally {
      setActionBusy(false);
    }
  };

  const submitDocument = async (event) => {
    event.preventDefault();
    if (!details || !uploadDocumentId || !uploadFile) return;
    const formData = new FormData();
    formData.append('document_name', uploadDocumentId);
    formData.append('document', uploadFile);
    setUploadBusy(true);
    try {
      await api.post(`/applications/${details.id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Document securely uploaded for review.');
      setUploadDocumentId('');
      setUploadFile(null);
      await reloadCurrentApplication(details.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to upload document.');
    } finally {
      setUploadBusy(false);
    }
  };

  const reviewSubmittedDocument = async (event) => {
    event.preventDefault();
    if (!details || !documentReview) return;
    if (documentReview.status === 'Rejected' && reviewRemarks.trim().length < 4) {
      toast.error('Enter a reason of at least 4 characters.');
      return;
    }
    setReviewBusy(true);
    try {
      await api.patch(`/applications/${details.id}/documents/${documentReview.id}`, {
        status: documentReview.status,
        remarks: reviewRemarks.trim(),
      });
      toast.success(`Document marked ${documentReview.status.toLowerCase()}.`);
      setDocumentReview(null);
      setReviewRemarks('');
      await reloadCurrentApplication(details.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update document review.');
    } finally {
      setReviewBusy(false);
    }
  };

  const previewDocument = async (document) => {
    if (!details) return;
    setPreviewBusy(String(document.id));
    try {
      const { data } = await api.get(`/applications/${details.id}/documents/${document.id}/preview`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const preview = window.open(url, '_blank', 'noopener,noreferrer');
      if (!preview) {
        URL.revokeObjectURL(url);
        toast.error('Allow pop-ups to preview this document.');
        return;
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to preview the submitted document.');
    } finally {
      setPreviewBusy('');
    }
  };

  const addApplication = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/applications', { ...applicationForm, service_id: Number(applicationForm.service_id) });
      toast.success('Application received. No notification delivery integration is configured.');
      setIsAddOpen(false);
      setApplicationForm(emptyApplication);
      setLoading(true);
      await Promise.all([loadList(), loadSummary()]);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to create application.');
    } finally {
      setIsSaving(false);
    }
  };

  const exportReport = async () => {
    try {
      const first = await api.get('/applications', { params: { ...params, page: 1, limit: 100 } });
      const rows = [...(first.data.data || [])];
      for (let page = 2; page <= first.data.pagination.pages; page += 1) {
        const { data } = await api.get('/applications', { params: { ...params, page, limit: 100 } });
        rows.push(...(data.data || []));
      }
      const columns = [
        ['Application Number', 'application_number'], ['Customer Name', 'applicant_name'],
        ['Mobile Number', 'mobile'], ['Service', 'service_name'],
        ['Submission Date', 'created_at'], ['Payment Status', 'payment_status'],
        ['Application Status', 'status'], ['Assigned Staff', 'assigned_staff_name'],
        ['Last Updated', 'updated_at'],
      ];
      const csv = [columns.map(([label]) => `"${label}"`).join(',')]
        .concat(rows.map((record) => columns.map(([, key]) => `"${String(record[key] ?? '').replaceAll('"', '""')}"`).join(',')))
        .join('\r\n');
      const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `dhiva-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to export the filtered applications.');
    }
  };

  const actionsFor = (application) => {
    const available = {
      'Application Submitted': ['Documents Under Verification'],
      Pending: ['Documents Under Verification'],
      'Documents Under Verification': ['Pending Additional Documents', 'Pending Payment', 'Ready for Approval'],
      'Pending Additional Documents': ['Documents Under Verification'],
      'Pending Payment': ['Documents Under Verification', 'Ready for Approval'],
      'Ready for Approval': ['Rejected', 'Cancelled'],
      Approved: [],
      'Certificate Generated': [],
      Completed: [],
      Rejected: [],
      Cancelled: [],
    };
    return available[application.status] || [];
  };

  const requiredMissing = (application) => (application.required_documents || [])
    .filter((required) => required.required_status === 'Required')
    .filter((required) => !(application.documents || []).some(
      (document) => document.document_name.toLowerCase() === required.document_name.toLowerCase() && document.status === 'Verified',
    ));

  const summaryCards = [
    { label: 'Total Applications', value: summary?.total_applications, icon: FileText, tone: 'bg-orange-500 text-white' },
    { label: 'Pending Verification', value: summary?.pending_verification, icon: Clock3, tone: 'bg-amber-500 text-white' },
    { label: 'Approved Applications', value: summary?.approved_applications, icon: BadgeCheck, tone: 'bg-green-500 text-white' },
    { label: 'Rejected Applications', value: summary?.rejected_applications, icon: CircleAlert, tone: 'bg-red-600 text-white' },
    { label: 'Certificates Completed', value: summary?.certificates_completed, icon: CheckCircle2, tone: 'bg-teal-500 text-white' },
    { label: 'Ready for Download', value: summary?.certificates_ready, icon: Download, tone: 'bg-purple-600 text-white' },
  ];

  return (
    <section className="-m-3 min-h-screen bg-[#0d0e12] p-4 text-white sm:-m-5 sm:p-6 lg:-m-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-500"><FolderOpen size={15} /> Certificate services</div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Applications</h1>
            <p className="mt-1 text-sm text-gray-400">Track document review, payment readiness, external approval and completion.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={exportReport} disabled={loading || !pagination.total} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-[#1a1c23] px-3.5 text-sm font-semibold text-gray-300 hover:bg-gray-800 disabled:opacity-50"><Download size={16} /> Export CSV</button>
            <button type="button" onClick={() => setIsAddOpen(true)} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-orange-500"><Plus size={16} /> New application</button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <article key={card.label} className="flex min-h-24 items-center gap-3 rounded-xl border border-gray-800 bg-[#1a1c23] p-4">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.tone}`}><card.icon size={20} /></span>
              <div><p className="text-xs font-medium text-gray-400">{card.label}</p>{loading && !summary ? <div className="mt-2 h-6 w-14 animate-pulse rounded bg-gray-700" /> : <p className="mt-1 text-2xl font-bold tabular-nums text-white">{Number(card.value || 0).toLocaleString('en-IN')}</p>}</div>
            </article>
          ))}
        </div>

        {pageError && <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300"><AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{pageError}</p><button type="button" onClick={() => { setLoading(true); loadList(); loadSummary(); }} className="ml-auto font-semibold">Retry</button></div>}

        <div className="rounded-xl border border-gray-800 bg-[#1a1c23]">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-800 p-4">
            <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search applications</span><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Search application, name, mobile..." className={`${inputClass} pl-10`} /></label>
            <label className="min-w-[150px] flex-1 sm:flex-none sm:w-[175px]"><span className="sr-only">Filter by service</span><select value={filters.service_id} onChange={(event) => setFilter('service_id', event.target.value)} className={inputClass}><option value="All">All Services</option>{services.map((service) => <option key={service.id} value={service.id}>{service.service_name}</option>)}</select></label>
            <label className="min-w-[150px] flex-1 sm:flex-none sm:w-[175px]"><span className="sr-only">Filter by status</span><select value={filters.status} onChange={(event) => setFilter('status', event.target.value)} className={inputClass}>{statuses.map((status) => <option key={status}>{status === 'All' ? 'All Status' : status}</option>)}</select></label>
            <div role="group" aria-label="Application view" className="ml-auto flex shrink-0 overflow-hidden rounded-lg border border-gray-700">
              <button type="button" onClick={() => setViewMode('card')} aria-pressed={viewMode === 'card'} className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors ${viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}><LayoutGrid size={17} /><span>Cards</span></button>
              <button type="button" onClick={() => setViewMode('table')} aria-pressed={viewMode === 'table'} className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-sm transition-colors ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}><List size={17} /><span>Table</span></button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-800 bg-[#1a1c23]">
          {viewMode === 'table' && <div className="overflow-x-auto">
            <table className="hidden w-full min-w-[1450px] text-left text-xs lg:table">
              <thead className="bg-[#15171d] text-gray-400"><tr>{['Application Number', 'Customer Name', 'Mobile', 'Certificate / Service', 'Submission Date', 'Required Documents', 'Payment Status', 'Application Status', 'Assigned Staff', 'Last Updated', 'Actions'].map((heading) => <th key={heading} className="whitespace-nowrap px-3 py-3 font-semibold">{heading}</th>)}</tr></thead>
              <tbody className="divide-y divide-gray-800">
                {!loading && records.map((record) => (
                  <tr key={record.id} className="text-gray-300 transition-colors hover:bg-white/[.02]">
                    <td className="px-3 py-3 font-semibold text-white">{record.application_number || record.display_application_number || `APP-${record.id}`}</td>
                    <td className="px-3 py-3 font-medium">{record.applicant_name}</td>
                    <td className="px-3 py-3">{record.mobile || '—'}</td>
                    <td className="px-3 py-3">{record.service_name}</td>
                    <td className="whitespace-nowrap px-3 py-3">{formatDate(record.created_at)}</td>
                    <td className="px-3 py-3 text-gray-400">{Number(record.verified_required_document_count || 0)}/{Number(record.required_document_count || 0)} verified</td>
                    <td className="px-3 py-3"><StatusBadge status={record.payment_status || 'Pending'} /></td>
                    <td className="px-3 py-3"><StatusBadge status={record.status || 'Application Submitted'} /></td>
                    <td className="px-3 py-3">{record.assigned_staff_name || 'Unassigned'}</td>
                    <td className="whitespace-nowrap px-3 py-3">{formatDate(record.updated_at)}</td>
                    <td className="px-3 py-3"><button type="button" onClick={() => openDetails(record)} className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 px-3 py-2 font-semibold text-orange-400 hover:bg-orange-500/20"><Eye size={14} /> Details</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>}

          {viewMode === 'table' && <div className="space-y-3 p-3 lg:hidden">
            {!loading && records.map((record) => (
              <article key={record.id} className="rounded-xl border border-gray-800 bg-[#1a1c23] p-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-sm font-bold text-white">{record.applicant_name}</p><p className="mt-0.5 text-xs font-semibold text-orange-400">{record.application_number || record.display_application_number || `APP-${record.id}`}</p></div><StatusBadge status={record.status || 'Application Submitted'} /></div>
                <div className="mt-3 grid grid-cols-2 gap-3 text-xs"><div><p className="text-gray-500">Mobile</p><p className="mt-0.5 text-gray-300">{record.mobile || '—'}</p></div><div><p className="text-gray-500">Payment</p><div className="mt-1"><StatusBadge status={record.payment_status || 'Pending'} /></div></div><div className="col-span-2"><p className="text-gray-500">Certificate / Service</p><p className="mt-0.5 text-gray-300">{record.service_name}</p></div><div><p className="text-gray-500">Submitted</p><p className="mt-0.5 text-gray-300">{formatDate(record.created_at)}</p></div><div><p className="text-gray-500">Required documents</p><p className="mt-0.5 text-gray-300">{Number(record.verified_required_document_count || 0)}/{Number(record.required_document_count || 0)} verified</p></div><div><p className="text-gray-500">Assigned staff</p><p className="mt-0.5 text-gray-300">{record.assigned_staff_name || 'Unassigned'}</p></div><div><p className="text-gray-500">Last updated</p><p className="mt-0.5 text-gray-300">{formatDate(record.updated_at)}</p></div></div>
                <button type="button" onClick={() => openDetails(record)} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2.5 text-sm font-semibold text-orange-400 hover:bg-orange-500/20"><Eye size={15} /> View Details</button>
              </article>
            ))}
          </div>}

          {viewMode === 'card' && <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
            {!loading && records.map((record) => (
              <article key={record.id} className="rounded-xl border border-gray-800 bg-[#15171d] p-4 transition-colors hover:border-gray-700">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">{record.applicant_name}</p>
                    <p className="mt-1 text-xs font-medium text-orange-400">{record.application_number || record.display_application_number || `APP-${record.id}`}</p>
                  </div>
                  <StatusBadge status={record.status || 'Application Submitted'} />
                </div>
                <div className="mt-4 space-y-3 border-t border-gray-800 pt-3 text-xs">
                  <div><p className="text-gray-500">Certificate / Service</p><p className="mt-1 font-medium text-gray-200">{record.service_name}</p></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><p className="text-gray-500">Mobile</p><p className="mt-1 text-gray-300">{record.mobile || '—'}</p></div>
                    <div><p className="text-gray-500">Payment</p><div className="mt-1"><StatusBadge status={record.payment_status || 'Pending'} /></div></div>
                    <div><p className="text-gray-500">Documents verified</p><p className="mt-1 text-gray-300">{Number(record.verified_required_document_count || 0)}/{Number(record.required_document_count || 0)}</p></div>
                    <div><p className="text-gray-500">Assigned staff</p><p className="mt-1 truncate text-gray-300">{record.assigned_staff_name || 'Unassigned'}</p></div>
                    <div><p className="text-gray-500">Submitted</p><p className="mt-1 text-gray-300">{formatDate(record.created_at)}</p></div>
                    <div><p className="text-gray-500">Last updated</p><p className="mt-1 text-gray-300">{formatDate(record.updated_at)}</p></div>
                  </div>
                </div>
                <button type="button" onClick={() => openDetails(record)} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2.5 text-sm font-semibold text-orange-400 hover:bg-orange-500/20"><Eye size={15} /> View Details</button>
              </article>
            ))}
          </div>}

          {loading && <div className="space-y-3 p-5" aria-label="Loading applications">{[1, 2, 3].map((item) => <div key={item} className="h-12 animate-pulse rounded-lg bg-gray-800" />)}</div>}
          {!loading && !records.length && <div className="px-5 py-14 text-center"><FileText className="mx-auto text-gray-600" size={36} /><h3 className="mt-3 font-semibold text-gray-200">{pageError ? 'Applications unavailable' : 'No applications found'}</h3><p className="mt-1 text-sm text-gray-400">{pageError ? 'Check the backend connection and your access, then retry.' : 'Applications from the database will appear here.'}</p></div>}

          <footer className="flex flex-col items-center justify-between gap-3 border-t border-gray-800 px-4 py-3 text-xs text-gray-400 sm:flex-row">
            <div className="flex items-center gap-2"><span>{pagination.total ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}` : '0 applications'}</span><label><span className="sr-only">Rows per page</span><select value={filters.limit} onChange={(event) => { setLoading(true); setFilters((current) => ({ ...current, limit: Number(event.target.value), page: 1 })); }} className="rounded border border-gray-700 bg-[#0f1115] px-2 py-1 text-gray-200"><option value={10}>10 / page</option><option value={25}>25 / page</option><option value={50}>50 / page</option><option value={100}>100 / page</option></select></label></div>
            <div className="flex items-center gap-2"><button type="button" onClick={() => { setLoading(true); setFilters((current) => ({ ...current, page: Math.max(1, current.page - 1) })); }} disabled={filters.page <= 1 || loading} aria-label="Previous page" className="rounded border border-gray-700 p-1.5 text-gray-300 disabled:opacity-40"><ChevronLeft size={16} /></button><span>Page {pagination.pages ? pagination.page : 0} of {pagination.pages}</span><button type="button" onClick={() => { setLoading(true); setFilters((current) => ({ ...current, page: Math.min(pagination.pages, current.page + 1) })); }} disabled={filters.page >= pagination.pages || loading} aria-label="Next page" className="rounded border border-gray-700 p-1.5 text-gray-300 disabled:opacity-40"><ChevronRight size={16} /></button></div>
          </footer>
        </div>
      </div>

      {isAddOpen && (
        <Dialog title="New application" description="Create a real application record to start document review." onClose={() => !isSaving && setIsAddOpen(false)}>
          <form onSubmit={addApplication} className="space-y-4 p-5 sm:p-6">
            <Field label="Applicant name" required><input required minLength={2} maxLength={150} value={applicationForm.applicant_name} onChange={(event) => setApplicationForm((current) => ({ ...current, applicant_name: event.target.value }))} className={inputClass} /></Field>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mobile number"><input type="tel" maxLength={20} value={applicationForm.mobile} onChange={(event) => setApplicationForm((current) => ({ ...current, mobile: event.target.value }))} className={inputClass} /></Field>
              <Field label="Email"><input type="email" maxLength={255} value={applicationForm.email} onChange={(event) => setApplicationForm((current) => ({ ...current, email: event.target.value }))} className={inputClass} /></Field>
            </div>
            <Field label="Certificate / service" required><select required value={applicationForm.service_id} onChange={(event) => setApplicationForm((current) => ({ ...current, service_id: event.target.value }))} className={inputClass}><option value="">Select an active service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.service_name}</option>)}</select></Field>
            <Field label="Service centre"><input maxLength={150} value={applicationForm.center_name} onChange={(event) => setApplicationForm((current) => ({ ...current, center_name: event.target.value }))} className={inputClass} /></Field>
            <Field label="Applicant details / staff notes"><textarea maxLength={2000} rows={3} value={applicationForm.notes} onChange={(event) => setApplicationForm((current) => ({ ...current, notes: event.target.value }))} className={inputClass} /></Field>
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">No SMS or email gateway is configured. Notification delivery will be recorded as not configured; no message will be claimed as sent.</p>
            <div className="flex justify-end gap-2 border-t border-gray-800 pt-4"><button type="button" onClick={() => setIsAddOpen(false)} disabled={isSaving} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800">Cancel</button><button type="submit" disabled={isSaving || !services.length} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50">{isSaving && <LoaderCircle size={15} className="animate-spin" />}{isSaving ? 'Saving…' : 'Create application'}</button></div>
          </form>
        </Dialog>
      )}

      {dialogApplication && (
        <Dialog title="Application review" description={details ? `${details.application_number || details.display_application_number} · ${details.service_name}` : 'Loading application record...'} onClose={() => { setDialogApplication(null); setDetails(null); setSelectedAction(''); }} wide>
          <div className="max-h-[82vh] space-y-5 overflow-y-auto p-4 sm:p-6">
            {detailsLoading && <div aria-label="Loading application details" className="space-y-3"><div className="h-20 animate-pulse rounded-xl bg-gray-800" /><div className="h-36 animate-pulse rounded-xl bg-gray-800" /></div>}
            {details && <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-800 bg-[#15171d] p-4">
                <div><p className="text-xs text-gray-400">Current status</p><div className="mt-1"><StatusBadge status={details.status} /></div></div>
                <div className="text-right"><p className="text-xs text-gray-400">Payment status</p><div className="mt-1"><StatusBadge status={details.payment_status || 'Pending'} /></div></div>
              </div>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[['Applicant', details.applicant_name], ['Mobile', details.mobile || '—'], ['Email', details.email || '—'], ['Application number', details.application_number || details.display_application_number], ['Certificate / service', details.service_name], ['Category', details.category], ['Service centre', details.center_name || '—'], ['Submitted', formatDate(details.created_at)], ['Last updated', formatDate(details.updated_at)], ['Assigned staff', details.assigned_staff_name || 'Unassigned'], ['Official approval source', details.external_approval_status || 'Not Connected']].map(([label, value]) => <div key={label} className="rounded-lg border border-gray-800 bg-[#15171d] p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-gray-100">{value}</p></div>)}
              </section>

              <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3"><ShieldAlert size={19} className="mt-0.5 shrink-0 text-amber-400" /><div><h3 className="text-sm font-semibold text-amber-200">Government approval and certificates are not connected</h3><p className="mt-1 text-xs leading-relaxed text-amber-300">The current system has no authorized government-officer account or external approval/certificate source. Local staff cannot mark an application approved, generate an official certificate, or mark completion.</p></div></div>
              </section>

              <section className="space-y-3 rounded-xl border border-gray-800 p-4">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-100"><UserRoundCog size={16} /> Assigned staff</h3>
                <form onSubmit={assignStaff} className="flex flex-col gap-2 sm:flex-row">
                  <select value={assignment} onChange={(event) => setAssignment(event.target.value)} className={`${inputClass} flex-1`}><option value="">Unassigned</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.username} · {person.role}</option>)}</select>
                  <button type="submit" disabled={actionBusy || assignment === String(details.assigned_staff_id || '')} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800 disabled:opacity-50">Save assignment</button>
                </form>
              </section>

              <section className="space-y-3 rounded-xl border border-gray-800 p-4">
                <div className="flex items-center justify-between gap-2"><h3 className="flex items-center gap-2 text-sm font-semibold text-gray-100"><FileCheck2 size={16} /> Required document checklist</h3><span className="text-xs text-gray-400">{details.documents?.length || 0} submitted</span></div>
                {!details.required_documents?.length && <p className="rounded-lg bg-[#15171d] p-3 text-sm text-gray-400">No required documents are configured for this service.</p>}
                {details.required_documents?.map((required) => {
                  const submissions = details.documents?.filter((doc) => doc.document_name.toLowerCase() === required.document_name.toLowerCase()) || [];
                  return <div key={required.id} className="rounded-lg border border-gray-800 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-medium text-gray-100">{required.document_name} {required.required_status === 'Required' && <span className="text-red-400">*</span>}</p>{required.document_description && <p className="mt-0.5 text-xs text-gray-400">{required.document_description}</p>}</div><span className="text-[11px] text-gray-500">{submissions.length ? `${submissions.length} file(s)` : 'Not submitted'}</span></div>
                    {submissions.map((document) => <div key={document.id} className="mt-2 flex flex-col justify-between gap-2 rounded-lg bg-[#15171d] p-2.5 sm:flex-row sm:items-center">
                      <div className="min-w-0"><p className="truncate text-xs font-medium text-gray-200">{document.original_name}</p><p className="mt-0.5 text-[11px] text-gray-400">{document.status} · {formatDate(document.created_at)}{document.reviewer_remarks ? ` · ${document.reviewer_remarks}` : ''}</p></div>
                      <div className="flex shrink-0 gap-1"><button type="button" onClick={() => previewDocument(document)} disabled={previewBusy === String(document.id)} className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-[#0f1115] px-2 py-1.5 text-xs font-semibold text-gray-300 disabled:opacity-50">{previewBusy === String(document.id) ? <LoaderCircle size={13} className="animate-spin" /> : <Eye size={13} />} Secure preview</button>{document.status !== 'Verified' && <button type="button" onClick={() => { setDocumentReview({ ...document, status: 'Verified' }); setReviewRemarks(''); }} disabled={details.status !== 'Documents Under Verification'} className="rounded-md bg-emerald-500/10 px-2 py-1.5 text-xs font-semibold text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">Verify</button>}<button type="button" onClick={() => { setDocumentReview({ ...document, status: 'Rejected' }); setReviewRemarks(''); }} disabled={details.status !== 'Documents Under Verification'} className="rounded-md bg-red-500/10 px-2 py-1.5 text-xs font-semibold text-red-400 disabled:cursor-not-allowed disabled:opacity-40">Reject</button></div>
                    </div>)}
                    {required.required_status === 'Required' && submissions.length === 0 && <p className="mt-2 text-xs font-medium text-amber-400">Required file missing — cannot proceed to approval readiness.</p>}
                  </div>;
                })}
                {!['Rejected', 'Cancelled', 'Completed', 'Approved'].includes(details.status) && details.required_documents?.length > 0 && <form onSubmit={submitDocument} className="grid grid-cols-1 items-end gap-3 border-t border-gray-800 pt-3 sm:grid-cols-3"><Field label="Attach submitted document" required><select required value={uploadDocumentId} onChange={(event) => setUploadDocumentId(event.target.value)} className={inputClass}><option value="">Select required document</option>{details.required_documents.map((item) => <option key={item.id} value={item.document_name}>{item.document_name}</option>)}</select></Field><Field label="PDF / JPEG / PNG / WebP (max 10 MB)" required><input required type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setUploadFile(event.target.files?.[0] || null)} className={`${inputClass} file:mr-2 file:rounded file:border-0 file:bg-orange-500/10 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-orange-400`} /></Field><button type="submit" disabled={uploadBusy || !uploadFile || !uploadDocumentId} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50">{uploadBusy && <LoaderCircle size={14} className="animate-spin" />}Upload securely</button></form>}
              </section>

              <section className="rounded-xl border border-gray-800 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-100"><FileText size={16} /> Payment and receipt details</h3>
                {details.payments?.length ? <div className="space-y-2">{details.payments.map((payment) => <div key={payment.transaction_id} className="flex flex-col justify-between gap-2 rounded-lg bg-[#15171d] p-3 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-gray-100">{payment.receipt_number} · ₹{Number(payment.total_amount).toFixed(2)}</p><p className="text-xs text-gray-400">{payment.payment_method} · {formatDate(payment.payment_date)} · {payment.transaction_reference || payment.transaction_id}</p></div><StatusBadge status={payment.status} /></div>)}</div> : <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">No payment is recorded yet. Payment requirement will be checked against the configured service fee.</p>}
                <p className="mt-2 text-xs text-gray-400">Recorded as paid: ₹{Number(details.payment_amount_paid || 0).toFixed(2)} · Due: ₹{Math.max(0, Number(details.payment_total_due || 0) - Number(details.payment_amount_paid || 0)).toFixed(2)}</p>
              </section>

              <section className="rounded-xl border border-gray-800 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-100"><Clock3 size={16} /> Application timeline</h3>
                {details.timeline?.length ? <ol className="space-y-3 border-l border-gray-700 pl-4">{details.timeline.map((event, index) => <li key={`${event.event_type}-${event.created_at}-${index}`} className="relative"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#1a1c23] bg-orange-500 shadow" /><p className="text-sm font-semibold text-gray-100">{event.event_type}{event.new_status ? ` · ${event.previous_status || 'New'} → ${event.new_status}` : ''}</p><p className="text-xs text-gray-400">{formatDate(event.created_at)} · {event.actor_id}</p>{event.details?.reason && <p className="mt-1 text-xs text-gray-300">Reason: {event.details.reason}</p>}{event.details?.remarks && <p className="mt-1 text-xs text-gray-300">Remarks: {event.details.remarks}</p>}</li>)}</ol> : <p className="text-sm text-gray-400">No workflow history has been recorded yet.</p>}
              </section>

              <section className="rounded-xl border border-gray-800 p-4">
                <h3 className="mb-3 text-sm font-semibold text-gray-100">Notification delivery status</h3>
                {details.notifications?.length ? <div className="space-y-2">{details.notifications.map((notification, index) => <div key={`${notification.event_type}-${notification.created_at}-${index}`} className="flex items-center justify-between gap-3 text-xs text-gray-300"><span>{notification.event_type} · {notification.channel}</span><span className="rounded-full bg-gray-800 px-2 py-1 font-semibold text-gray-300">{notification.delivery_status}</span></div>)}</div> : <p className="text-xs text-gray-400">No notification sent. SMS/email integration is not configured.</p>}
              </section>

              <section className="rounded-xl border border-gray-800 p-4">
                <h3 className="mb-2 text-sm font-semibold text-gray-100">Workflow actions</h3>
                {actionsFor(details).length ? <div className="flex flex-wrap gap-2">{actionsFor(details).map((status) => {
                  const missingDocuments = requiredMissing(details);
                  const paymentDue = Math.max(0, Number(details.payment_total_due || 0) - Number(details.payment_amount_paid || 0));
                  const readyBlocked = status === 'Ready for Approval' && (missingDocuments.length > 0 || paymentDue > 0);
                  const readyBlockReason = missingDocuments.length
                    ? `Verify required documents: ${missingDocuments.map((item) => item.document_name).join(', ')}`
                    : 'Verified full payment is required before approval readiness.';
                  return <button key={status} type="button" onClick={() => beginWorkflowAction(status)} disabled={readyBlocked} title={readyBlocked ? readyBlockReason : undefined} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(status) ? 'border border-gray-700 bg-[#0f1115] text-gray-300 hover:bg-gray-800' : 'bg-orange-600 text-white hover:bg-orange-500'}`}>{status === 'Documents Under Verification' ? 'Start document review' : status === 'Ready for Approval' ? 'Mark ready for approval' : status === 'Pending Additional Documents' ? 'Request documents' : status}</button>;
                })}</div> : <p className="text-sm text-gray-400">No local workflow actions are available for this status.</p>}
                {details.status === 'Ready for Approval' && <p className="mt-3 flex items-start gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 p-3 text-xs text-violet-300"><LockKeyhole size={15} className="mt-0.5 shrink-0" />Approval remains unavailable until an authorized government approval source is connected. A local admin cannot approve or issue a government certificate.</p>}
                {details.status === 'Certificate Generated' && <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">Certificate downloads are disabled unless a verified certificate from an authorized source is on record.</p>}
              </section>
            </>}
            <div className="flex justify-end border-t border-gray-800 pt-4"><button type="button" onClick={() => { setDialogApplication(null); setDetails(null); setSelectedAction(''); }} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800">Close</button></div>
          </div>
        </Dialog>
      )}

      {selectedAction && details && (
        <Dialog title={selectedAction === 'Ready for Approval' ? 'Confirm approval readiness' : selectedAction === 'Rejected' ? 'Reject application' : selectedAction === 'Cancelled' ? 'Cancel application' : selectedAction === 'Pending Additional Documents' ? 'Request additional documents' : 'Update workflow'} description="This action is checked and recorded by the backend." onClose={() => !actionBusy && setSelectedAction('')}>
          <form onSubmit={submitWorkflowAction} className="space-y-4 p-5">
            <div className="rounded-lg border border-gray-800 bg-[#15171d] p-3 text-sm text-gray-200"><p><b>Applicant:</b> {details.applicant_name}</p><p className="mt-1"><b>Application:</b> {details.application_number || details.display_application_number}</p><p className="mt-1"><b>Service:</b> {details.service_name}</p><p className="mt-1"><b>New status:</b> {selectedAction}</p></div>
            {selectedAction === 'Ready for Approval' && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">This only records internal readiness; it does not approve the application or issue a government certificate.</div>}
            <Field label={['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(selectedAction) ? 'Reason' : 'Staff remarks'} required={['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(selectedAction)}><textarea minLength={['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(selectedAction) ? 4 : undefined} maxLength={1000} rows={3} value={['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(selectedAction) ? reason : remarks} onChange={(event) => ['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(selectedAction) ? setReason(event.target.value) : setRemarks(event.target.value)} className={inputClass} placeholder={selectedAction === 'Pending Additional Documents' ? 'List the documents or corrections needed' : 'Optional notes for the audit history'} required={['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(selectedAction)} /></Field>
            <div className="flex justify-end gap-2 border-t border-gray-800 pt-4"><button type="button" onClick={() => setSelectedAction('')} disabled={actionBusy} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800">Cancel</button><button type="submit" disabled={actionBusy || (['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(selectedAction) && reason.trim().length < 4)} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50">{actionBusy && <LoaderCircle size={15} className="animate-spin" />}Confirm action</button></div>
          </form>
        </Dialog>
      )}

      {documentReview && (
        <Dialog title={`${documentReview.status} document`} description={documentReview.original_name} onClose={() => !reviewBusy && setDocumentReview(null)}>
          <form onSubmit={reviewSubmittedDocument} className="space-y-4 p-5">
            <div className={`rounded-lg border p-3 text-sm ${documentReview.status === 'Verified' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-red-500/30 bg-red-500/10 text-red-300'}`}>{documentReview.status === 'Verified' ? 'Confirm this uploaded document has been reviewed and is valid.' : 'A reason is required and will be visible in the application audit.'}</div>
            <Field label={documentReview.status === 'Rejected' ? 'Rejection reason' : 'Review remarks'} required={documentReview.status === 'Rejected'}><textarea maxLength={1000} minLength={documentReview.status === 'Rejected' ? 4 : undefined} required={documentReview.status === 'Rejected'} rows={3} value={reviewRemarks} onChange={(event) => setReviewRemarks(event.target.value)} className={inputClass} /></Field>
            <div className="flex justify-end gap-2 border-t border-gray-800 pt-4"><button type="button" onClick={() => setDocumentReview(null)} disabled={reviewBusy} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800">Cancel</button><button type="submit" disabled={reviewBusy || (documentReview.status === 'Rejected' && reviewRemarks.trim().length < 4)} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50">{reviewBusy && <LoaderCircle size={15} className="animate-spin" />}Save review</button></div>
          </form>
        </Dialog>
      )}
    </section>
  );
}
