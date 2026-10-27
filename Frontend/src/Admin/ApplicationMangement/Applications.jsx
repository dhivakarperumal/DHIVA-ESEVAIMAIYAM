import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, BadgeCheck, CheckCircle2, ChevronLeft,
  ChevronRight, CircleAlert, Clock3, Download, Eye, FileCheck2, FileText,
  FolderOpen, LayoutGrid, List, LoaderCircle, LockKeyhole, Plus, Search, ShieldAlert,
  UserRoundCog, X, Printer, Truck, CalendarDays,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../PrivateRouter/AuthContext';

const inputClass = 'w-full rounded-lg border border-gray-800 bg-[#0f1115] px-3 py-2.5 text-sm text-white [color-scheme:dark] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:bg-gray-900';
const statuses = [
  'All', 'Submitted', 'Application Submitted', 'Documents Under Verification',
  'Pending Additional Documents', 'Pending Payment',
  'Pending Approval', 'Approved', 'Certificate Generated', 'Ready for Collection',
  'Ready for Delivery', 'Delivered', 'Completed', 'Rejected', 'Cancelled',
];
const paymentStatuses = ['All', 'Not Required', 'Paid', 'Partially Paid', 'Pending', 'Failed', 'Refunded'];
const progressStatuses = [
  'Submitted', 'Documents Under Verification', 'Pending Approval', 'Approved',
  'Certificate Generated', 'Ready for Collection', 'Ready for Delivery', 'Delivered', 'Completed',
];
const progressIndex = (status) => {
  if (status === 'Application Submitted') return 0;
  if (status === 'Pending Additional Documents' || status === 'Pending Payment') return 1;
  return progressStatuses.indexOf(status);
};
const printEscape = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));
const localDate = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

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
  Submitted: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  Pending: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  'Documents Under Verification': 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
  'Pending Additional Documents': 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  'Pending Payment': 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  'Pending Approval': 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  Approved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  'Certificate Generated': 'border-teal-500/30 bg-teal-500/10 text-teal-400',
  'Ready for Collection': 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  'Ready for Delivery': 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300',
  Delivered: 'border-green-500/30 bg-green-500/10 text-green-300',
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
  applicant_name: '', applicant_type: 'Individual', mobile: '', email: '', service_id: '', center_name: '', notes: '',
};

export default function Applications({ certificateMode = false }) {
  const { role } = useAuth();
  const canApprove = ['super admin', 'admin', 'manager'].includes(String(role || '').toLowerCase());
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [services, setServices] = useState([]);
  const [staff, setStaff] = useState([]);
  const [filters, setFilters] = useState({
    search: '', status: 'All', service_id: 'All', staff_id: 'All',
    payment_status: 'All', date_from: '', date_to: '', page: 1, limit: 10,
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
  const [applicationRequirements, setApplicationRequirements] = useState([]);
  const [applicationFiles, setApplicationFiles] = useState({});
  const [applicableDocuments, setApplicableDocuments] = useState({});
  const [requirementsLoading, setRequirementsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [selectedAction, setSelectedAction] = useState('');
  const [completionConfirmed, setCompletionConfirmed] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [assignment, setAssignment] = useState('');
  const [uploadDocumentId, setUploadDocumentId] = useState('');
  const [uploadFiles, setUploadFiles] = useState([]);
  const [uploadBusy, setUploadBusy] = useState(false);
  const [documentReview, setDocumentReview] = useState(null);
  const [reviewRemarks, setReviewRemarks] = useState('');
  const [reviewBusy, setReviewBusy] = useState(false);
  const [previewBusy, setPreviewBusy] = useState('');
  const [certificateForm, setCertificateForm] = useState({
    certificate_reference: '', certificate_issue_date: '', certificate_source: '',
    source_confirmed: false, file: null,
  });
  const [certificateBusy, setCertificateBusy] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    delivery_date: '', recipient: '', delivery_notes: '',
  });
  const selectedUploadRequirement = details?.required_documents?.find(
    (document) => String(document.id) === uploadDocumentId
  );
  const applicableApplicationRequirements = applicationRequirements.filter((document) =>
    document.applicant_type === 'All' || document.applicant_type === applicationForm.applicant_type
  );

  const params = useMemo(() => ({
    search: filters.search.trim() || undefined,
    status: filters.status === 'All' ? undefined : filters.status,
    service_id: filters.service_id === 'All' ? undefined : filters.service_id,
    staff_id: filters.staff_id === 'All' ? undefined : filters.staff_id,
    payment_status: filters.payment_status === 'All' ? undefined : filters.payment_status,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
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

  useEffect(() => {
    if (!isAddOpen || !applicationForm.service_id) return undefined;
    let active = true;
    api.get('/service-documents', {
      params: { service_id: applicationForm.service_id, active: true },
    }).then(({ data }) => {
      if (active) setApplicationRequirements(data.data || []);
    }).catch((error) => {
      if (active) {
        setApplicationRequirements([]);
        toast.error(error.response?.data?.message || 'Unable to load this service document checklist.');
      }
    }).finally(() => {
      if (active) setRequirementsLoading(false);
    });
    return () => { active = false; };
  }, [applicationForm.service_id, isAddOpen]);

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
    setCertificateForm({ certificate_reference: '', certificate_issue_date: '', certificate_source: '', source_confirmed: false, file: null });
    setDeliveryForm({ delivery_date: localDate(), recipient: '', delivery_notes: '' });
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
    setCompletionConfirmed(false);
    setDeliveryForm((current) => ({ ...current, delivery_date: current.delivery_date || localDate() }));
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
        ...(selectedAction === 'Delivered' ? deliveryForm : {}),
      });
      toast.success(selectedAction === 'Approved'
        ? 'Internal approval recorded. Government approval is not connected.'
        : `Application status updated to ${selectedAction}.`);
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
    if (!details || !uploadDocumentId || !uploadFiles.length) return;
    const requirement = details.required_documents.find((item) => String(item.id) === uploadDocumentId);
    if (!requirement) {
      toast.error('Select a document from this service checklist.');
      return;
    }
    const previousCount = details.documents.filter((item) => (
      item.service_document_id
        ? String(item.service_document_id) === String(requirement.id)
        : item.document_name.toLowerCase() === requirement.document_name.toLowerCase()
    )).length;
    if (previousCount + uploadFiles.length > Number(requirement.max_files || 1)) {
      toast.error(`This document accepts at most ${requirement.max_files} file(s).`);
      return;
    }
    const maxBytes = Number.parseFloat(requirement.max_file_size) * 1024 * 1024;
    for (const file of uploadFiles) {
      const extension = file.name.split('.').pop()?.toUpperCase();
      if (!requirement.accepted_formats?.includes(extension) || file.size > maxBytes) {
        toast.error(`${file.name} does not match the configured format or ${requirement.max_file_size} file-size limit.`);
        return;
      }
    }
    setUploadBusy(true);
    setUploadProgress({ current: 0, total: uploadFiles.length, percent: 0 });
    try {
      for (const [index, file] of uploadFiles.entries()) {
        const formData = new FormData();
        formData.append('service_document_id', requirement.id);
        formData.append('document_name', requirement.document_name);
        formData.append('document', file);
        setUploadProgress({ current: index + 1, total: uploadFiles.length, percent: 0 });
        await api.post(`/applications/${details.id}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progress) => {
            if (progress.total) setUploadProgress({
              current: index + 1,
              total: uploadFiles.length,
              percent: Math.round((progress.loaded * 100) / progress.total),
            });
          },
        });
      }
      toast.success(`${uploadFiles.length} document file(s) securely uploaded for review.`);
      setUploadDocumentId('');
      setUploadFiles([]);
      await reloadCurrentApplication(details.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to upload document.');
    } finally {
      setUploadBusy(false);
      setUploadProgress(null);
    }
  };

  const saveApplicability = async (requiredDocument, applicable) => {
    if (!details) return;
    try {
      await api.post(`/applications/${details.id}/document-requirements`, {
        service_document_id: requiredDocument.id,
        applicable,
      });
      await reloadCurrentApplication(details.id);
      toast.success('Conditional requirement saved.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to save applicability.');
    }
  };

  const removeApplicationDocument = async (document) => {
    if (!details || !window.confirm(`Remove "${document.original_name}" from this application?`)) return;
    try {
      await api.delete(`/applications/${details.id}/documents/${document.id}`);
      toast.success('Uploaded document removed.');
      await reloadCurrentApplication(details.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to remove uploaded document.');
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

  const uploadCertificate = async (event) => {
    event.preventDefault();
    if (!details || !certificateForm.file || !certificateForm.source_confirmed || certificateBusy) return;
    const formData = new FormData();
    formData.append('document', certificateForm.file);
    formData.append('certificate_reference', certificateForm.certificate_reference.trim());
    formData.append('certificate_issue_date', certificateForm.certificate_issue_date);
    formData.append('certificate_source', certificateForm.certificate_source.trim());
    formData.append('source_confirmed', 'true');
    setCertificateBusy(true);
    try {
      await api.post(`/applications/${details.id}/certificate`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('Source-provided certificate attached. Official verification is not connected.');
      setCertificateForm({ certificate_reference: '', certificate_issue_date: '', certificate_source: '', source_confirmed: false, file: null });
      await reloadCurrentApplication(details.id);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to attach the source-provided certificate.');
    } finally {
      setCertificateBusy(false);
    }
  };

  const previewCertificate = async () => {
    if (!details) return;
    setPreviewBusy('certificate');
    try {
      const { data } = await api.get(`/applications/${details.id}/certificate`, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const preview = window.open(url, '_blank', 'noopener,noreferrer');
      if (!preview) {
        URL.revokeObjectURL(url);
        toast.error('Allow pop-ups to preview this certificate.');
        return;
      }
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to preview the attached certificate.');
    } finally {
      setPreviewBusy('');
    }
  };

  const printApplication = () => {
    if (!details) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Allow pop-ups to print application details.');
      return;
    }
    const values = [
      ['Application Number', details.application_number || details.display_application_number],
      ['Applicant', details.applicant_name],
      ['Mobile', details.mobile],
      ['Email', details.email],
      ['Certificate / service', details.service_name],
      ['Status', details.status],
      ['Payment', details.payment_status],
      ['Assigned staff', details.assigned_staff_name || 'Unassigned'],
      ['Submitted', formatDate(details.created_at)],
      ['Last updated', formatDate(details.updated_at)],
      ['Certificate reference', details.certificate_reference],
      ['Delivery recipient', details.certificate_recipient],
      ['Delivery date', details.certificate_delivery_date ? formatDate(details.certificate_delivery_date) : ''],
    ];
    const html = `<!doctype html><html><head><title>Application ${printEscape(details.application_number || details.id)}</title><style>body{font:14px Arial,sans-serif;color:#222;margin:28px}h1{font-size:22px}h2{font-size:16px;margin-top:28px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.box{border:1px solid #ddd;padding:10px}.muted{color:#666;font-size:12px}table{border-collapse:collapse;width:100%}td,th{border:1px solid #ddd;padding:8px;text-align:left} @media print{body{margin:15mm}}</style></head><body><h1>DHIVA E-SEVAI MAIYAM — Application record</h1><p class="muted">Internal application tracking only. This printout is not an official government certificate or approval.</p><div class="grid">${values.map(([label, value]) => `<div class="box"><b>${printEscape(label)}</b><br>${printEscape(value || '—')}</div>`).join('')}</div><h2>Application timeline</h2><table><thead><tr><th>Event</th><th>From → To</th><th>Staff / time</th><th>Reason / notes</th></tr></thead><tbody>${(details.timeline || []).map((event) => `<tr><td>${printEscape(event.event_type)}</td><td>${printEscape(event.previous_status || '—')} → ${printEscape(event.new_status || '—')}</td><td>${printEscape(event.actor_id)}<br>${printEscape(formatDate(event.created_at))}</td><td>${printEscape(event.details?.reason || event.details?.remarks || '')}</td></tr>`).join('')}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`;
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const printReport = async (period) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Allow pop-ups to print the status report.');
      return;
    }
    printWindow.document.write('<p style="font:14px Arial;padding:24px">Preparing report…</p>');
    const today = localDate();
    const [year, month] = today.split('-');
    const reportParams = {
      ...params,
      page: 1,
      limit: 100,
      date_from: period === 'daily' ? today : `${year}-${month}-01`,
      date_to: period === 'daily' ? today : today,
    };
    try {
      const first = await api.get('/applications', { params: reportParams });
      const rows = [...(first.data.data || [])];
      for (let pageNumber = 2; pageNumber <= first.data.pagination.pages; pageNumber += 1) {
        const { data } = await api.get('/applications', { params: { ...reportParams, page: pageNumber } });
        rows.push(...(data.data || []));
      }
      const counts = rows.reduce((result, row) => {
        const status = row.status || 'Submitted';
        result[status] = (result[status] || 0) + 1;
        return result;
      }, {});
      const title = period === 'daily' ? `Daily status report — ${today}` : `Monthly status report — ${year}-${month}`;
      const html = `<!doctype html><html><head><title>${printEscape(title)}</title><style>body{font:13px Arial,sans-serif;color:#222;margin:28px}h1{font-size:20px}table{border-collapse:collapse;width:100%;margin:18px 0}td,th{border:1px solid #ccc;padding:7px;text-align:left}.summary{display:inline-block;border:1px solid #ddd;padding:8px;margin:3px}@media print{body{margin:15mm}}</style></head><body><h1>DHIVA E-SEVAI MAIYAM — ${printEscape(title)}</h1><p>Applications in report: ${rows.length}</p><h2>Status totals</h2>${Object.entries(counts).map(([status, count]) => `<span class="summary">${printEscape(status)}: <b>${count}</b></span>`).join('')}<table><thead><tr><th>Application</th><th>Applicant</th><th>Certificate / service</th><th>Payment</th><th>Status</th><th>Assigned staff</th><th>Submitted</th></tr></thead><tbody>${rows.map((row) => `<tr><td>${printEscape(row.application_number || row.display_application_number)}</td><td>${printEscape(row.applicant_name)}</td><td>${printEscape(row.service_name)}</td><td>${printEscape(row.payment_status)}</td><td>${printEscape(row.status)}</td><td>${printEscape(row.assigned_staff_name || 'Unassigned')}</td><td>${printEscape(formatDate(row.created_at))}</td></tr>`).join('')}</tbody></table><script>window.onload=()=>window.print()</script></body></html>`;
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (error) {
      printWindow.close();
      toast.error(error.response?.data?.message || `Unable to create ${period} status report.`);
    }
  };

  const addApplication = async (event) => {
    event.preventDefault();
    if (requirementsLoading) return;
    const applicableRequirements = applicableApplicationRequirements.filter((document) =>
      document.required_status !== 'Conditional' || applicableDocuments[document.id] === 'yes'
    );
    for (const document of applicableApplicationRequirements.filter((item) => item.required_status === 'Conditional')) {
      if (!['yes', 'no'].includes(applicableDocuments[document.id])) {
        toast.error(`Choose whether "${document.document_name}" applies to this applicant.`);
        return;
      }
    }
    for (const document of applicableRequirements) {
      const files = applicationFiles[document.id] || [];
      const required = document.required_status === 'Required' || document.required_status === 'Conditional';
      if (required && !document.alternative_group && files.length < Number(document.min_files || 1)) {
        toast.error(`Upload at least ${document.min_files || 1} file(s) for "${document.document_name}".`);
        return;
      }
      if (files.length > Number(document.max_files || 1)) {
        toast.error(`"${document.document_name}" accepts at most ${document.max_files} file(s).`);
        return;
      }
      const maxBytes = Number.parseFloat(document.max_file_size) * 1024 * 1024;
      for (const file of files) {
        const extension = file.name.split('.').pop()?.toUpperCase();
        if (!document.accepted_formats?.includes(extension)) {
          toast.error(`${file.name} is not an accepted format for "${document.document_name}".`);
          return;
        }
        if (file.size > maxBytes) {
          toast.error(`${file.name} exceeds the ${document.max_file_size} limit for "${document.document_name}".`);
          return;
        }
      }
    }
    const alternativeGroups = new Set(
      applicableRequirements.map((document) => document.alternative_group).filter(Boolean)
    );
    for (const group of alternativeGroups) {
      const count = applicableRequirements
        .filter((document) => document.alternative_group === group)
        .reduce((total, document) => total + (applicationFiles[document.id] || []).length, 0);
      if (count < 1) {
        const labels = applicableRequirements.filter((document) => document.alternative_group === group).map((document) => document.document_name);
        toast.error(`Upload at least one alternative document: ${labels.join(', ')}.`);
        return;
      }
    }

    setIsSaving(true);
    let createdApplication;
    try {
      const { data: created } = await api.post('/applications', {
        ...applicationForm,
        service_id: Number(applicationForm.service_id),
      });
      createdApplication = created.data;
      const applicationId = createdApplication.id;
      for (const document of applicableApplicationRequirements.filter((item) => item.required_status === 'Conditional')) {
        await api.post(`/applications/${applicationId}/document-requirements`, {
          service_document_id: document.id,
          applicable: applicableDocuments[document.id] === 'yes',
        });
      }
      const uploadQueue = applicableRequirements.flatMap((document) =>
        (applicationFiles[document.id] || []).map((file) => ({ document, file }))
      );
      for (const [index, item] of uploadQueue.entries()) {
        const formData = new FormData();
        formData.append('service_document_id', item.document.id);
        formData.append('document_name', item.document.document_name);
        formData.append('document', item.file);
        setUploadProgress({ current: index + 1, total: uploadQueue.length, percent: 0 });
        await api.post(`/applications/${applicationId}/documents`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progress) => {
            if (progress.total) {
              setUploadProgress({
                current: index + 1,
                total: uploadQueue.length,
                percent: Math.round((progress.loaded * 100) / progress.total),
              });
            }
          },
        });
      }
      toast.success('Application received. No notification delivery integration is configured.');
      setIsAddOpen(false);
      setApplicationForm(emptyApplication);
      setApplicationFiles({});
      setApplicableDocuments({});
      setUploadProgress(null);
      setLoading(true);
      await Promise.all([loadList(), loadSummary()]);
    } catch (error) {
      if (createdApplication) {
        toast.error(`Application ${createdApplication.application_number || createdApplication.display_application_number} was created, but a document could not be saved: ${error.response?.data?.message || error.message}`);
        setIsAddOpen(false);
        setApplicationForm(emptyApplication);
        setLoading(true);
        await loadList();
        await openDetails(createdApplication);
      } else {
        toast.error(error.response?.data?.message || 'Unable to create application.');
      }
    } finally {
      setIsSaving(false);
      setUploadProgress(null);
    }
  };

  const openNewApplication = () => {
    setApplicationForm(emptyApplication);
    setApplicationRequirements([]);
    setApplicationFiles({});
    setApplicableDocuments({});
    setRequirementsLoading(false);
    setIsAddOpen(true);
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
        .concat(rows.map((record) => columns.map(([, key]) => {
          const value = String(record[key] ?? '');
          const safeValue = /^[\t\r ]*[=+\-@]/.test(value) ? `'${value}` : value;
          return `"${safeValue.replaceAll('"', '""')}"`;
        }).join(',')))
        .join('\r\n');
      const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `dhiva-applications-${new Date().toISOString().slice(0, 10)}.csv`;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to export the filtered applications.');
    }
  };

  const actionsFor = (application) => {
    const available = {
      Submitted: ['Documents Under Verification'],
      'Application Submitted': ['Documents Under Verification'],
      Pending: ['Documents Under Verification'],
      'Documents Under Verification': ['Pending Additional Documents', 'Pending Payment', 'Pending Approval'],
      'Pending Additional Documents': ['Documents Under Verification'],
      'Pending Payment': ['Documents Under Verification', 'Pending Approval'],
      'Pending Approval': ['Approved', 'Rejected', 'Cancelled'],
      Approved: ['Certificate Generated'],
      'Certificate Generated': ['Ready for Collection', 'Ready for Delivery'],
      'Ready for Collection': ['Delivered'],
      'Ready for Delivery': ['Delivered'],
      Delivered: ['Completed'],
      Completed: [],
      Rejected: [],
      Cancelled: [],
    };
    return available[application.status] || [];
  };

  const requiredMissing = (application) => {
    const configured = application.required_documents || [];
    const verifiedCount = (required) => (application.documents || []).filter((document) => {
      if (document.status !== 'Verified') return false;
      return document.service_document_id
        ? String(document.service_document_id) === String(required.id)
        : document.document_name.toLowerCase() === required.document_name.toLowerCase();
    }).length;
    const missing = configured.filter((required) => {
      if (required.alternative_group || required.required_status === 'Optional') return false;
      if (required.required_status === 'Conditional' && required.applicable === null) return true;
      if (required.required_status === 'Conditional' && Number(required.applicable) !== 1) return false;
      return verifiedCount(required) < Number(required.min_files || 1);
    }).map((required) => ({ document_name: required.document_name }));
    const groups = new Set(configured.map((required) => required.alternative_group).filter(Boolean));
    for (const group of groups) {
      const alternatives = configured.filter((required) => required.alternative_group === group);
      if (alternatives.reduce((total, required) => total + verifiedCount(required), 0) < 1) {
        missing.push({ document_name: `one of: ${alternatives.map((required) => required.document_name).join(', ')}` });
      }
    }
    return missing;
  };

  const summaryCards = [
    { label: 'Total Applications', value: summary?.total_applications, icon: FileText, tone: 'bg-orange-500 text-white' },
    { label: 'Pending Verification', value: summary?.pending_verification, icon: Clock3, tone: 'bg-amber-500 text-white' },
    { label: 'Approved Applications', value: summary?.approved_applications, icon: BadgeCheck, tone: 'bg-green-500 text-white' },
    { label: 'Rejected Applications', value: summary?.rejected_applications, icon: CircleAlert, tone: 'bg-red-600 text-white' },
    { label: 'Certificates Completed', value: summary?.certificates_completed, icon: CheckCircle2, tone: 'bg-teal-500 text-white' },
    { label: 'Certificates Delivered', value: summary?.certificates_delivered, icon: Truck, tone: 'bg-cyan-600 text-white' },
  ];

  return (
    <section className="-m-3 min-h-screen bg-[#0d0e12] p-4 text-white sm:-m-5 sm:p-6 lg:-m-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-500"><FolderOpen size={15} /> Certificate services</div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">{certificateMode ? 'Certificate Management' : 'Applications'}</h1>
            <p className="mt-1 text-sm text-gray-400">Track real application records, document checks, internal approval, certificate receipt and delivery.</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={exportReport} disabled={loading || !pagination.total} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-[#1a1c23] px-3.5 text-sm font-semibold text-gray-300 hover:bg-gray-800 disabled:opacity-50"><Download size={16} /> Export CSV</button>
            <button type="button" onClick={() => printReport('daily')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-[#1a1c23] px-3.5 text-sm font-semibold text-gray-300 hover:bg-gray-800"><Printer size={15} /> Daily report</button>
            <button type="button" onClick={() => printReport('monthly')} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-700 bg-[#1a1c23] px-3.5 text-sm font-semibold text-gray-300 hover:bg-gray-800"><CalendarDays size={15} /> Monthly report</button>
            <button type="button" onClick={openNewApplication} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-orange-500"><Plus size={16} /> New application</button>
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

        {summary && <section aria-label="In-app workflow notifications" className="rounded-xl border border-gray-800 bg-[#1a1c23] p-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><AlertCircle size={16} className="text-orange-400" /> Workflow attention</h2>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ['New applications awaiting review', summary.awaiting_document_review, 'text-blue-300'],
              ['Applications awaiting approval', summary.awaiting_approval, 'text-violet-300'],
              ['Approved, awaiting certificate', summary.awaiting_certificate, 'text-emerald-300'],
              ['Certificates ready for collection', summary.awaiting_collection, 'text-cyan-300'],
              ['Delivered, awaiting completion', summary.awaiting_completion, 'text-amber-300'],
            ].map(([label, count, tone]) => <div key={label} className="flex items-center justify-between gap-3 rounded-lg bg-[#111318] px-3 py-2.5"><span className="text-xs text-gray-300">{label}</span><span className={`text-sm font-bold tabular-nums ${tone}`}>{Number(count || 0)}</span></div>)}
          </div>
          <p className="mt-3 text-[11px] text-gray-500">SMS, email, and WhatsApp delivery are not configured. Status notifications are shown here and logged; no external messages are claimed as sent.</p>
        </section>}

        <div className="rounded-xl border border-gray-800 bg-[#1a1c23]">
          <div className="flex flex-wrap items-center gap-3 border-b border-gray-800 p-4">
            <label className="relative min-w-[220px] flex-1"><span className="sr-only">Search applications</span><Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={filters.search} onChange={(event) => setFilter('search', event.target.value)} placeholder="Search application, name, mobile..." className={`${inputClass} pl-10`} /></label>
            <label className="min-w-[150px] flex-1 sm:flex-none sm:w-[175px]"><span className="sr-only">Filter by service</span><select value={filters.service_id} onChange={(event) => setFilter('service_id', event.target.value)} className={inputClass}><option value="All">All Services</option>{services.map((service) => <option key={service.id} value={service.id}>{service.service_name}</option>)}</select></label>
            <label className="min-w-[150px] flex-1 sm:flex-none sm:w-[175px]"><span className="sr-only">Filter by status</span><select value={filters.status} onChange={(event) => setFilter('status', event.target.value)} className={inputClass}>{statuses.map((status) => <option key={status}>{status === 'All' ? 'All Status' : status}</option>)}</select></label>
            <label className="min-w-[150px] flex-1 sm:flex-none sm:w-[170px]"><span className="sr-only">Filter by assigned staff</span><select value={filters.staff_id} onChange={(event) => setFilter('staff_id', event.target.value)} className={inputClass}><option value="All">All assigned staff</option><option value="Unassigned">Unassigned</option>{staff.map((person) => <option key={person.id} value={person.id}>{person.username}</option>)}</select></label>
            <label className="min-w-[145px] flex-1 sm:flex-none sm:w-[160px]"><span className="sr-only">Filter by payment status</span><select value={filters.payment_status} onChange={(event) => setFilter('payment_status', event.target.value)} className={inputClass}>{paymentStatuses.map((status) => <option key={status} value={status}>{status === 'All' ? 'All payment status' : status}</option>)}</select></label>
            <label className="min-w-[145px] flex-1 sm:flex-none sm:w-[160px]"><span className="sr-only">Submitted from</span><input aria-label="Submitted from" type="date" value={filters.date_from} onChange={(event) => setFilter('date_from', event.target.value)} className={inputClass} /></label>
            <label className="min-w-[145px] flex-1 sm:flex-none sm:w-[160px]"><span className="sr-only">Submitted to</span><input aria-label="Submitted to" type="date" value={filters.date_to} onChange={(event) => setFilter('date_to', event.target.value)} className={inputClass} /></label>
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
            <div className="grid gap-4 sm:grid-cols-2"><Field label="Applicant name" required><input required minLength={2} maxLength={150} value={applicationForm.applicant_name} onChange={(event) => setApplicationForm((current) => ({ ...current, applicant_name: event.target.value }))} className={inputClass} /></Field><Field label="Applicant type" required><select required value={applicationForm.applicant_type} onChange={(event) => { setApplicationForm((current) => ({ ...current, applicant_type: event.target.value })); setApplicationFiles({}); setApplicableDocuments({}); }} className={inputClass}><option>Individual</option><option>Student</option><option>Senior Citizen</option><option>Business</option></select></Field></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Mobile number"><input type="tel" maxLength={20} value={applicationForm.mobile} onChange={(event) => setApplicationForm((current) => ({ ...current, mobile: event.target.value }))} className={inputClass} /></Field>
              <Field label="Email"><input type="email" maxLength={255} value={applicationForm.email} onChange={(event) => setApplicationForm((current) => ({ ...current, email: event.target.value }))} className={inputClass} /></Field>
            </div>
            <Field label="Certificate / service" required><select required value={applicationForm.service_id} onChange={(event) => { setApplicationForm((current) => ({ ...current, service_id: event.target.value })); setApplicationRequirements([]); setApplicationFiles({}); setApplicableDocuments({}); setRequirementsLoading(Boolean(event.target.value)); }} className={inputClass}><option value="">Select an active service</option>{services.map((service) => <option key={service.id} value={service.id}>{service.service_name}</option>)}</select></Field>
            {applicationForm.service_id && (
              <section className="space-y-3 rounded-xl border border-gray-800 bg-[#111318] p-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-100">Required document checklist</h3>
                  <p className="mt-1 text-xs text-gray-400">Upload files against the saved service checklist. Optional files may be omitted.</p>
                </div>
                {requirementsLoading ? (
                  <div className="flex items-center gap-2 py-3 text-sm text-gray-400"><LoaderCircle size={16} className="animate-spin" />Loading active document requirements...</div>
                ) : !applicationRequirements.length ? (
                  <p className="rounded-lg border border-gray-800 bg-[#0f1115] p-3 text-sm text-gray-400">No active document requirements are configured for this service.</p>
                ) : (
                  <div className="space-y-3">
                    {applicableApplicationRequirements.map((document) => {
                      const conditional = document.required_status === 'Conditional';
                      const isApplicable = !conditional || applicableDocuments[document.id] === 'yes';
                      const files = applicationFiles[document.id] || [];
                      const acceptedFormats = document.accepted_formats || [];
                      return (
                        <div key={document.id} className="space-y-2 rounded-lg border border-gray-800 bg-[#0f1115] p-3">
                          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-start">
                            <div>
                              <p className="text-sm font-medium text-gray-100">{document.document_name}</p>
                              <p className="mt-0.5 text-xs text-gray-400">
                                {conditional ? 'Conditional' : document.required_status} · {acceptedFormats.join(', ')} · max {document.max_file_size}
                                {document.number_of_documents === 'Multiple' ? ` · ${document.min_files}–${document.max_files} files` : ''}
                              </p>
                              {(document.document_description || document.conditional_requirement) && <p className="mt-1 text-xs text-gray-500">{document.conditional_requirement || document.document_description}</p>}
                            </div>
                            {document.alternative_group && <span className="w-fit rounded-full bg-blue-500/10 px-2 py-1 text-[10px] text-blue-300">Alternative · {document.alternative_group}</span>}
                          </div>
                          {conditional && (
                            <Field label={`Does "${document.document_name}" apply?`} required>
                              <select required value={applicableDocuments[document.id] || ''} onChange={(event) => setApplicableDocuments((current) => ({ ...current, [document.id]: event.target.value }))} className={inputClass}>
                                <option value="">Choose Yes or No</option><option value="yes">Yes, it applies</option><option value="no">No, it does not apply</option>
                              </select>
                            </Field>
                          )}
                          {isApplicable && (
                            <>
                              <input
                                key={`${document.id}-${files.length}`}
                                type="file"
                                multiple={document.number_of_documents === 'Multiple'}
                                accept={acceptedFormats.map((format) => `.${format.toLowerCase()}`).join(',')}
                                onChange={(event) => {
                                  const selectedFiles = Array.from(event.target.files || []);
                                  setApplicationFiles((current) => ({
                                    ...current,
                                    [document.id]: document.number_of_documents === 'Multiple'
                                      ? [...(current[document.id] || []), ...selectedFiles].slice(0, Number(document.max_files))
                                      : selectedFiles.slice(0, 1),
                                  }));
                                }}
                                className={`${inputClass} file:mr-2 file:rounded file:border-0 file:bg-orange-500/10 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-orange-400`}
                              />
                              {!!files.length && <ul className="space-y-1">{files.map((file, index) => <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-2 text-xs text-gray-300"><span className="truncate">{file.name} · {(file.size / (1024 * 1024)).toFixed(2)} MB</span><button type="button" onClick={() => setApplicationFiles((current) => ({ ...current, [document.id]: current[document.id].filter((_, fileIndex) => fileIndex !== index) }))} className="shrink-0 rounded px-2 py-1 text-red-300 hover:bg-red-500/10">Remove</button></li>)}</ul>}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
                {uploadProgress && (
                  <div className="space-y-1" role="status">
                    <div className="flex justify-between text-xs text-gray-300"><span>Uploading file {uploadProgress.current} of {uploadProgress.total}</span><span>{uploadProgress.percent}%</span></div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-800"><div className="h-full bg-orange-500 transition-all" style={{ width: `${uploadProgress.percent}%` }} /></div>
                  </div>
                )}
              </section>
            )}
            <Field label="Service centre"><input maxLength={150} value={applicationForm.center_name} onChange={(event) => setApplicationForm((current) => ({ ...current, center_name: event.target.value }))} className={inputClass} /></Field>
            <Field label="Applicant details / staff notes"><textarea maxLength={2000} rows={3} value={applicationForm.notes} onChange={(event) => setApplicationForm((current) => ({ ...current, notes: event.target.value }))} className={inputClass} /></Field>
            <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">No SMS or email gateway is configured. Notification delivery will be recorded as not configured; no message will be claimed as sent.</p>
            <div className="flex justify-end gap-2 border-t border-gray-800 pt-4"><button type="button" onClick={() => setIsAddOpen(false)} disabled={isSaving} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800">Cancel</button><button type="submit" disabled={isSaving || !services.length || requirementsLoading} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50">{isSaving && <LoaderCircle size={15} className="animate-spin" />}{isSaving ? (uploadProgress ? `Uploading ${uploadProgress.current}/${uploadProgress.total}…` : 'Saving…') : 'Create application'}</button></div>
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
                <button type="button" onClick={printApplication} className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"><Printer size={14} /> Print details</button>
              </div>
              <section className="rounded-xl border border-gray-800 bg-[#15171d] p-4">
                <h3 className="mb-4 text-sm font-semibold text-gray-100">Certificate lifecycle</h3>
                {['Rejected', 'Cancelled'].includes(details.status) ? (
                  <div className={`rounded-lg border p-3 text-sm ${details.status === 'Rejected' ? 'border-red-500/30 bg-red-500/10 text-red-300' : 'border-gray-700 bg-gray-800/50 text-gray-300'}`}>
                    {details.status}{details.status_reason ? ` · ${details.status_reason}` : ''}
                  </div>
                ) : (
                  <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
                    {progressStatuses.map((step, index) => {
                      const current = progressIndex(details.status);
                      const complete = current >= index;
                      return <li key={step} className={`relative rounded-lg border p-3 text-xs ${complete ? 'border-orange-500/40 bg-orange-500/10 text-orange-200' : 'border-gray-800 bg-[#101116] text-gray-500'}`}>
                        <span className={`mb-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${complete ? 'bg-orange-500 text-white' : 'bg-gray-800 text-gray-500'}`}>{complete ? <CheckCircle2 size={13} /> : index + 1}</span>
                        <span className="leading-snug">{step}</span>
                      </li>;
                    })}
                  </ol>
                )}
                <p className="mt-3 text-[11px] text-amber-300">Internal workflow tracking only. An internal approval or attached source file does not verify government approval or certificate authenticity.</p>
              </section>
              <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[['Applicant', details.applicant_name], ['Mobile', details.mobile || '—'], ['Email', details.email || '—'], ['Application number', details.application_number || details.display_application_number], ['Certificate / service', details.service_name], ['Category', details.category], ['Service centre', details.center_name || '—'], ['Submitted', formatDate(details.created_at)], ['Last updated', formatDate(details.updated_at)], ['Assigned staff', details.assigned_staff_name || 'Unassigned'], ['Internal decision by', details.approving_officer || '—'], ['Internal approval date', details.approved_at ? formatDate(details.approved_at) : '—'], ['Certificate reference', details.certificate_reference || '—'], ['Certificate source', details.certificate_source || '—'], ['Issue date', details.certificate_issue_date ? formatDate(details.certificate_issue_date) : '—'], ['Delivered / collected by', details.certificate_recipient || '—'], ['Delivery date', details.certificate_delivery_date ? formatDate(details.certificate_delivery_date) : '—'], ['External government status', details.external_approval_status || 'Not Connected']].map(([label, value]) => <div key={label} className="rounded-lg border border-gray-800 bg-[#15171d] p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-gray-100">{value}</p></div>)}
              </section>

              <section className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <div className="flex items-start gap-3"><ShieldAlert size={19} className="mt-0.5 shrink-0 text-amber-400" /><div><h3 className="text-sm font-semibold text-amber-200">Internal tracking — not an official government decision</h3><p className="mt-1 text-xs leading-relaxed text-amber-300">This system can record a manager's internal decision and securely attach a certificate file received from a named source. It does not connect to a government approval portal, issue certificates, or independently verify attached files.</p></div></div>
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
                  const submissions = details.documents?.filter((doc) => (
                    doc.service_document_id
                      ? String(doc.service_document_id) === String(required.id)
                      : doc.document_name.toLowerCase() === required.document_name.toLowerCase()
                  )) || [];
                  const applicable = required.required_status !== 'Conditional' || Number(required.applicable) === 1;
                  const verifiedCount = submissions.filter((document) => document.status === 'Verified').length;
                  const groupVerifiedCount = required.alternative_group
                    ? details.required_documents
                      .filter((document) => document.alternative_group === required.alternative_group)
                      .flatMap((document) => details.documents?.filter((item) => String(item.service_document_id) === String(document.id) && item.status === 'Verified') || [])
                      .length
                    : 0;
                  return <div key={required.id} className="rounded-lg border border-gray-800 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2"><div><p className="text-sm font-medium text-gray-100">{required.document_name} {(required.required_status === 'Required' || (required.required_status === 'Conditional' && applicable)) && <span className="text-red-400">Required</span>} {required.required_status === 'Optional' && <span className="text-gray-400">Optional</span>}</p>{required.document_description && <p className="mt-0.5 text-xs text-gray-400">{required.document_description}</p>}<p className="mt-1 text-[11px] text-gray-500">{(required.accepted_formats || []).join(', ')} · max {required.max_file_size} · {required.min_files}–{required.max_files} file(s)</p>{required.alternative_group && <p className="mt-1 text-[11px] text-blue-300">One or more documents from “{required.alternative_group}” are alternatives.</p>}</div><span className="text-[11px] text-gray-500">{submissions.length ? `${submissions.length} file(s)` : 'Not submitted'}</span></div>
                    {required.required_status === 'Conditional' && <Field label={`Does "${required.document_name}" apply?`}><select value={required.applicable === null ? '' : Number(required.applicable) === 1 ? 'yes' : 'no'} onChange={(event) => saveApplicability(required, event.target.value === 'yes')} className={inputClass}><option value="">Choose Yes or No</option><option value="yes">Yes, it applies</option><option value="no">No, it does not apply</option></select><span className="mt-1 block text-xs text-gray-500">{required.conditional_requirement}</span></Field>}
                    {submissions.map((document) => <div key={document.id} className="mt-2 flex flex-col justify-between gap-2 rounded-lg bg-[#15171d] p-2.5 sm:flex-row sm:items-center">
                      <div className="min-w-0"><p className="truncate text-xs font-medium text-gray-200">{document.original_name}</p><p className="mt-0.5 text-[11px] text-gray-400">{document.status} · {formatDate(document.created_at)}{document.reviewer_remarks ? ` · ${document.reviewer_remarks}` : ''}</p></div>
                      <div className="flex shrink-0 gap-1"><button type="button" onClick={() => previewDocument(document)} disabled={previewBusy === String(document.id)} className="inline-flex items-center gap-1 rounded-md border border-gray-700 bg-[#0f1115] px-2 py-1.5 text-xs font-semibold text-gray-300 disabled:opacity-50">{previewBusy === String(document.id) ? <LoaderCircle size={13} className="animate-spin" /> : <Eye size={13} />} Secure preview</button>{document.status !== 'Verified' && <button type="button" onClick={() => { setDocumentReview({ ...document, status: 'Verified' }); setReviewRemarks(''); }} disabled={details.status !== 'Documents Under Verification'} className="rounded-md bg-emerald-500/10 px-2 py-1.5 text-xs font-semibold text-emerald-400 disabled:cursor-not-allowed disabled:opacity-40">Verify</button>}<button type="button" onClick={() => { setDocumentReview({ ...document, status: 'Rejected' }); setReviewRemarks(''); }} disabled={details.status !== 'Documents Under Verification'} className="rounded-md bg-red-500/10 px-2 py-1.5 text-xs font-semibold text-red-400 disabled:cursor-not-allowed disabled:opacity-40">Reject</button>{document.status !== 'Verified' && <button type="button" onClick={() => removeApplicationDocument(document)} className="rounded-md bg-red-500/10 px-2 py-1.5 text-xs font-semibold text-red-300">Remove</button>}</div>
                    </div>)}
                    {required.required_status === 'Required' && verifiedCount < Number(required.min_files || 1) && <p className="mt-2 text-xs font-medium text-amber-400">Required verified file(s) missing — cannot proceed to approval readiness.</p>}
                    {required.required_status === 'Conditional' && required.applicable === null && <p className="mt-2 text-xs font-medium text-amber-400">Choose whether this conditional requirement applies.</p>}
                    {required.required_status === 'Conditional' && Number(required.applicable) === 1 && verifiedCount < Number(required.min_files || 1) && <p className="mt-2 text-xs font-medium text-amber-400">Required verified file(s) missing.</p>}
                    {required.alternative_group && groupVerifiedCount === 0 && <p className="mt-2 text-xs font-medium text-amber-400">Upload and verify at least one approved document from this alternative group.</p>}
                  </div>;
                })}
                {!['Rejected', 'Cancelled', 'Completed', 'Approved'].includes(details.status) && details.required_documents?.length > 0 && <form onSubmit={submitDocument} className="grid grid-cols-1 items-end gap-3 border-t border-gray-800 pt-3 sm:grid-cols-3"><Field label="Attach submitted document" required><select required value={uploadDocumentId} onChange={(event) => { setUploadDocumentId(event.target.value); setUploadFiles([]); }} className={inputClass}><option value="">Select document</option>{details.required_documents.filter((item) => item.status === 'Active').map((item) => <option key={item.id} value={item.id}>{item.document_name}</option>)}</select></Field><Field label={selectedUploadRequirement ? `${selectedUploadRequirement.accepted_formats.join(', ')} · max ${selectedUploadRequirement.max_file_size}` : 'Select a document first'} required><input key={uploadDocumentId} required type="file" multiple={selectedUploadRequirement?.number_of_documents === 'Multiple'} accept={(selectedUploadRequirement?.accepted_formats || []).map((format) => `.${format.toLowerCase()}`).join(',')} onChange={(event) => setUploadFiles(Array.from(event.target.files || []).slice(0, Number(selectedUploadRequirement?.max_files || 1)))} disabled={!selectedUploadRequirement} className={`${inputClass} file:mr-2 file:rounded file:border-0 file:bg-orange-500/10 file:px-2 file:py-1 file:text-xs file:font-semibold file:text-orange-400`} /></Field><button type="submit" disabled={uploadBusy || !uploadFiles.length || !uploadDocumentId} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-3 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50">{uploadBusy && <LoaderCircle size={14} className="animate-spin" />}Upload securely</button>{uploadFiles.length > 0 && <div className="text-xs text-gray-400 sm:col-span-3">{uploadFiles.map((file) => file.name).join(' · ')}</div>}{uploadProgress && <div className="space-y-1 sm:col-span-3"><div className="flex justify-between text-xs text-gray-300"><span>Uploading {uploadProgress.current} of {uploadProgress.total}</span><span>{uploadProgress.percent}%</span></div><div className="h-2 overflow-hidden rounded-full bg-gray-800"><div className="h-full bg-orange-500" style={{ width: `${uploadProgress.percent}%` }} /></div></div>}</form>}
              </section>

              <section className="rounded-xl border border-gray-800 p-4">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-100"><FileText size={16} /> Payment and receipt details</h3>
                {details.payments?.length ? <div className="space-y-2">{details.payments.map((payment) => <div key={payment.transaction_id} className="flex flex-col justify-between gap-2 rounded-lg bg-[#15171d] p-3 sm:flex-row sm:items-center"><div><p className="text-sm font-semibold text-gray-100">{payment.receipt_number} · ₹{Number(payment.total_amount).toFixed(2)}</p><p className="text-xs text-gray-400">{payment.payment_method} · {formatDate(payment.payment_date)} · {payment.transaction_reference || payment.transaction_id}</p></div><StatusBadge status={payment.status} /></div>)}</div> : <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">No payment is recorded yet. Payment requirement will be checked against the configured service fee.</p>}
                <p className="mt-2 text-xs text-gray-400">Recorded as paid: ₹{Number(details.payment_amount_paid || 0).toFixed(2)} · Due: ₹{Math.max(0, Number(details.payment_total_due || 0) - Number(details.payment_amount_paid || 0)).toFixed(2)}</p>
              </section>

              {['Approved', 'Certificate Generated', 'Ready for Collection', 'Ready for Delivery', 'Delivered', 'Completed'].includes(details.status) && (
                <section className="space-y-3 rounded-xl border border-gray-800 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div><h3 className="flex items-center gap-2 text-sm font-semibold text-gray-100"><FileCheck2 size={16} /> Certificate record</h3><p className="mt-1 text-xs text-gray-400">Attach an actual source-provided PDF; the system does not create or authenticate certificates.</p></div>
                    {details.certificate_path && <button type="button" onClick={previewCertificate} disabled={previewBusy === 'certificate'} className="inline-flex items-center gap-2 rounded-lg border border-gray-700 px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800 disabled:opacity-50">{previewBusy === 'certificate' ? <LoaderCircle size={14} className="animate-spin" /> : <Eye size={14} />} Preview attached PDF</button>}
                  </div>
                  {details.certificate_reference && <div className="grid gap-2 rounded-lg bg-[#15171d] p-3 text-xs sm:grid-cols-2"><p><span className="text-gray-500">Reference:</span> <span className="text-gray-200">{details.certificate_reference}</span></p><p><span className="text-gray-500">Source:</span> <span className="text-gray-200">{details.certificate_source || '—'}</span></p><p><span className="text-gray-500">Issue date:</span> <span className="text-gray-200">{details.certificate_issue_date ? formatDate(details.certificate_issue_date) : '—'}</span></p><p className="text-amber-300">Source recorded; official verification not connected.</p></div>}
                  {details.status === 'Approved' && canApprove && (
                    <form onSubmit={uploadCertificate} className="grid gap-3 rounded-lg border border-gray-800 bg-[#15171d] p-3 sm:grid-cols-2">
                      <Field label="Source certificate reference" required><input required minLength={2} maxLength={120} value={certificateForm.certificate_reference} onChange={(event) => setCertificateForm((current) => ({ ...current, certificate_reference: event.target.value }))} className={inputClass} /></Field>
                      <Field label="Certificate issue date" required><input required type="date" max={localDate()} value={certificateForm.certificate_issue_date} onChange={(event) => setCertificateForm((current) => ({ ...current, certificate_issue_date: event.target.value }))} className={inputClass} /></Field>
                      <Field label="Authorized issuing source" required><input required minLength={2} maxLength={255} value={certificateForm.certificate_source} onChange={(event) => setCertificateForm((current) => ({ ...current, certificate_source: event.target.value }))} className={inputClass} /></Field>
                      <Field label="Actual certificate PDF" required><input required type="file" accept=".pdf,application/pdf" onChange={(event) => setCertificateForm((current) => ({ ...current, file: event.target.files?.[0] || null }))} className={inputClass} /></Field>
                      <label className="flex items-start gap-2 text-xs text-gray-300 sm:col-span-2"><input required type="checkbox" checked={certificateForm.source_confirmed} onChange={(event) => setCertificateForm((current) => ({ ...current, source_confirmed: event.target.checked }))} className="mt-0.5 accent-orange-500" /><span>I confirm this PDF and reference were received from the authorized source named above. This records receipt only; DHIVA does not verify government authenticity.</span></label>
                      <div className="sm:col-span-2"><button type="submit" disabled={certificateBusy || !certificateForm.file || !certificateForm.source_confirmed} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50">{certificateBusy && <LoaderCircle size={14} className="animate-spin" />}Record certificate received</button></div>
                    </form>
                  )}
                </section>
              )}

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
                {actionsFor(details).filter((status) => status !== 'Certificate Generated' && (status !== 'Approved' || canApprove)).length ? <div className="flex flex-wrap gap-2">{actionsFor(details).filter((status) => status !== 'Certificate Generated' && (status !== 'Approved' || canApprove)).map((status) => {
                  const missingDocuments = requiredMissing(details);
                  const paymentDue = Math.max(0, Number(details.payment_total_due || 0) - Number(details.payment_amount_paid || 0));
                  const approvalStep = ['Pending Approval', 'Approved'].includes(status);
                  const readyBlocked = approvalStep && (missingDocuments.length > 0 || paymentDue > 0 || (status === 'Approved' && !canApprove));
                  const readyBlockReason = missingDocuments.length
                    ? `Verify required documents: ${missingDocuments.map((item) => item.document_name).join(', ')}`
                    : paymentDue > 0 ? 'Verified full payment is required before approval.'
                      : 'Your role is not authorized to record internal approval.';
                  const labels = {
                    'Documents Under Verification': 'Verify documents',
                    'Pending Additional Documents': 'Request additional documents',
                    'Pending Payment': 'Mark payment pending',
                    'Pending Approval': 'Mark pending approval',
                    Approved: 'Record internal approval',
                    'Ready for Collection': 'Mark ready for collection',
                    'Ready for Delivery': 'Mark ready for delivery',
                    Delivered: 'Confirm delivery / collection',
                    Completed: 'Mark completed',
                  };
                  return <button key={status} type="button" onClick={() => beginWorkflowAction(status)} disabled={readyBlocked} title={readyBlocked ? readyBlockReason : undefined} className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40 ${['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(status) ? 'border border-gray-700 bg-[#0f1115] text-gray-300 hover:bg-gray-800' : 'bg-orange-600 text-white hover:bg-orange-500'}`}>{labels[status] || status}</button>;
                })}</div> : <p className="text-sm text-gray-400">No local workflow actions are available for this status.</p>}
                {details.status === 'Pending Approval' && !canApprove && <p className="mt-3 flex items-start gap-2 rounded-lg border border-violet-500/30 bg-violet-500/10 p-3 text-xs text-violet-300"><LockKeyhole size={15} className="mt-0.5 shrink-0" />Only a manager or administrator can record an internal approval decision. This is not government approval.</p>}
                {details.status === 'Certificate Generated' && <p className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">The attached certificate is recorded as received from its named source; this system does not verify its authenticity.</p>}
              </section>
            </>}
            <div className="flex justify-end border-t border-gray-800 pt-4"><button type="button" onClick={() => { setDialogApplication(null); setDetails(null); setSelectedAction(''); }} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800">Close</button></div>
          </div>
        </Dialog>
      )}

      {selectedAction && details && (
        <Dialog title={selectedAction === 'Approved' ? 'Confirm internal approval' : selectedAction === 'Pending Approval' ? 'Move to pending approval' : selectedAction === 'Rejected' ? 'Reject application' : selectedAction === 'Cancelled' ? 'Cancel application' : selectedAction === 'Pending Additional Documents' ? 'Request additional documents' : selectedAction === 'Delivered' ? 'Confirm certificate delivery / collection' : selectedAction === 'Completed' ? 'Complete application' : ['Ready for Collection', 'Ready for Delivery'].includes(selectedAction) ? 'Mark certificate ready' : 'Update workflow'} description="This action is recorded in the application audit trail." onClose={() => !actionBusy && setSelectedAction('')}>
          <form onSubmit={submitWorkflowAction} className="space-y-4 p-5">
            <div className="rounded-lg border border-gray-800 bg-[#15171d] p-3 text-sm text-gray-200"><p><b>Applicant:</b> {details.applicant_name}</p><p className="mt-1"><b>Application:</b> {details.application_number || details.display_application_number}</p><p className="mt-1"><b>Service:</b> {details.service_name}</p><p className="mt-1"><b>New status:</b> {selectedAction}</p></div>
            {selectedAction === 'Pending Approval' && <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-xs text-blue-200">This records that document and fee checks are ready for an internal decision. It does not approve the application or issue a government certificate.</div>}
            {selectedAction === 'Approved' && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">You are recording an internal administrative approval. This is not an official government approval and does not generate a certificate.</div>}
            {selectedAction === 'Delivered' && <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Delivery / collection date" required><input required type="date" max={localDate()} value={deliveryForm.delivery_date} onChange={(event) => setDeliveryForm((current) => ({ ...current, delivery_date: event.target.value }))} className={inputClass} /></Field>
              <Field label="Received by" required><input required maxLength={255} value={deliveryForm.recipient} onChange={(event) => setDeliveryForm((current) => ({ ...current, recipient: event.target.value }))} className={inputClass} /></Field>
              <div className="sm:col-span-2"><Field label="Delivery confirmation notes"><textarea maxLength={1000} rows={2} value={deliveryForm.delivery_notes} onChange={(event) => setDeliveryForm((current) => ({ ...current, delivery_notes: event.target.value }))} className={inputClass} /></Field></div>
            </div>}
            {['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(selectedAction) ? (
              <Field label="Reason" required><textarea minLength={4} maxLength={1000} rows={3} value={reason} onChange={(event) => setReason(event.target.value)} className={inputClass} placeholder={selectedAction === 'Pending Additional Documents' ? 'List the documents or corrections needed' : 'Record why this application is being closed'} required /></Field>
            ) : !['Delivered'].includes(selectedAction) && (
              <Field label="Staff remarks"><textarea maxLength={1000} rows={3} value={remarks} onChange={(event) => setRemarks(event.target.value)} className={inputClass} placeholder="Optional notes for the audit history" /></Field>
            )}
            {selectedAction === 'Completed' && <label className="flex items-start gap-2 rounded-lg border border-green-500/30 bg-green-500/10 p-3 text-xs text-green-200"><input required type="checkbox" checked={completionConfirmed} onChange={(event) => setCompletionConfirmed(event.target.checked)} className="mt-0.5 accent-green-500" /><span>I confirm the recorded certificate has been delivered or collected by the recipient shown in this application.</span></label>}
            {selectedAction === 'Completed' && <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">Completion is an internal tracking status and does not attest to government verification.</div>}
            <div className="flex justify-end gap-2 border-t border-gray-800 pt-4"><button type="button" onClick={() => setSelectedAction('')} disabled={actionBusy} className="rounded-lg border border-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800">Cancel</button><button type="submit" disabled={actionBusy || (['Rejected', 'Cancelled', 'Pending Additional Documents'].includes(selectedAction) && reason.trim().length < 4) || (selectedAction === 'Delivered' && (!deliveryForm.delivery_date || !deliveryForm.recipient.trim())) || (selectedAction === 'Completed' && !completionConfirmed)} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-500 disabled:opacity-50">{actionBusy && <LoaderCircle size={15} className="animate-spin" />}{selectedAction === 'Approved' ? 'Confirm internal approval' : selectedAction === 'Rejected' ? 'Confirm rejection' : selectedAction === 'Completed' ? 'Confirm completion' : 'Confirm action'}</button></div>
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
