import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertCircle, BadgeIndianRupee, CalendarDays, Check, CheckCircle2,
  ChevronLeft, ChevronRight, ClipboardList, Download, Eye,
  FilterX, IndianRupee, LoaderCircle, Plus, Printer, Receipt, RefreshCcw,
  Search, ShieldCheck, Wallet, X,
} from 'lucide-react';
import api from '../api';

const inputClass = 'w-full rounded-lg border border-gray-800 bg-[#0f1115] px-3 py-2.5 text-sm text-white [color-scheme:dark] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 disabled:bg-gray-900';
const cardClass = 'rounded-xl border border-gray-800 bg-[#1a1c23]';
const statuses = ['All', 'Paid', 'Pending', 'Failed', 'Partially Paid', 'Partially Refunded', 'Refunded'];
const methods = ['All', 'Cash', 'UPI', 'Card', 'Bank Transfer'];

const localDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const localDateTime = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
};

const formatMoney = (value) => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
}).format(Number(value) || 0);

const formatDateTime = (value) => {
  if (!value) return '—';
  const date = new Date(String(value).replace(' ', 'T'));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const getStatusStyle = (status) => ({
  Paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  Pending: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  Failed: 'border-red-500/30 bg-red-500/10 text-red-400',
  'Partially Paid': 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  'Partially Refunded': 'border-gray-800 bg-gray-800 text-gray-300',
  Refunded: 'border-gray-800 bg-gray-800 text-gray-400',
}[status] || 'border-gray-800 bg-[#15171d] text-gray-400');

const asPlainText = (value) => String(value ?? '').replace(/[&<>"']/g, (character) => ({
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}[character]));

const readNumber = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? number : null;
};

function StatusBadge({ status }) {
  return (
    <span className={`inline-flex whitespace-nowrap items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyle(status)}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

function Field({ label, required, children, error }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-sm font-medium text-gray-300">
        {label}{required && <span className="ml-1 text-red-500">*</span>}
      </span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}

function Modal({ title, description, onClose, children, wide = false }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-black/75 p-3 backdrop-blur-sm sm:p-6"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="payment-dialog-title"
        className={`my-auto w-full ${wide ? 'max-w-3xl' : 'max-w-lg'} overflow-hidden rounded-2xl bg-[#1a1c23] shadow-2xl`}
      >
        <header className="flex items-start justify-between gap-4 border-b border-gray-800 px-5 py-4 sm:px-6">
          <div>
            <h2 id="payment-dialog-title" className="text-lg font-semibold text-white">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-400">{description}</p>}
          </div>
          <button type="button" onClick={onClose} aria-label="Close dialog" className="rounded-lg p-2 text-gray-400 hover:bg-gray-800">
            <X size={18} />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}

function openPrintDocument(title, body, thermal = false) {
  const printWindow = window.open('', '_blank', 'width=900,height=700');
  if (!printWindow) {
    throw new Error('Allow pop-ups to print this document.');
  }
  printWindow.opener = null;
  printWindow.document.open();
  printWindow.document.write(`<!doctype html>
    <html><head><meta charset="utf-8"><title>${asPlainText(title)}</title>
    <style>
      @page { size: ${thermal ? '80mm auto' : 'A4'}; margin: ${thermal ? '5mm' : '16mm'}; }
      * { box-sizing: border-box; }
      body { font: 14px Arial, sans-serif; color: #172033; margin: 0; }
      .receipt { max-width: ${thermal ? '72mm' : '720px'}; margin: auto; }
      .brand { text-align: center; border-bottom: 2px solid #f8740e; padding: 0 0 14px; margin-bottom: 16px; }
      .brand img { display: block; width: 52px; height: 52px; object-fit: contain; margin: 0 auto 7px; }
      .brand h1 { margin: 0 0 5px; font-size: 22px; letter-spacing: .03em; }
      .brand p { margin: 2px 0; color: #5b6473; font-size: 12px; }
      .receipt-title { text-align: center; font-size: 18px; margin: 0 0 14px; }
      .notice { padding: 10px; margin-bottom: 14px; text-align: center; border: 1px solid #f59e0b; background: #fffbeb; color: #92400e; font-weight: 700; }
      .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px 16px; margin: 12px 0 18px; }
      .meta div { overflow-wrap: anywhere; }
      .label { display: block; color: #64748b; font-size: 11px; margin-bottom: 3px; }
      table { width: 100%; border-collapse: collapse; margin: 12px 0; }
      th, td { border-bottom: 1px solid #dbe1e8; padding: 9px 5px; text-align: left; }
      th:last-child, td:last-child { text-align: right; }
      .total { font-size: 18px; font-weight: bold; }
      .status { text-align: center; padding: 8px; border: 1px solid #cbd5e1; margin-top: 12px; font-weight: bold; }
      .signature { margin: 64px 0 0 auto; width: 210px; border-top: 1px solid #64748b; text-align: center; padding-top: 8px; }
      .footer { margin-top: 24px; border-top: 1px solid #e2e8f0; padding-top: 10px; color: #64748b; text-align: center; font-size: 11px; }
      @media print { body { print-color-adjust: exact; -webkit-print-color-adjust: exact; } }
    </style></head><body><main class="receipt">${body}</main>
    <script>window.addEventListener('load', () => window.print());</script></body></html>`);
  printWindow.document.close();
}

function ReceiptContent({ payment, thermal = false }) {
  const isPaid = ['Paid', 'Partially Paid', 'Partially Refunded', 'Refunded'].includes(payment.status);
  const remaining = Math.max(0, Number(payment.amount_paid || 0) - Number(payment.refunded_amount || 0));
  const balanceDue = Math.max(0, Number(payment.total_amount || 0) - Number(payment.amount_paid || 0));
  const body = `
    <header class="brand"><img src="${asPlainText(new URL('/images/logo.png', window.location.origin).href)}" alt="Dhiva E-Sevai Maiyam logo"><h1>DHIVA E-SEVAI MAIYAM</h1>
      <p>Service Centre</p><p>Centre contact details have not been configured.</p>
    </header>
    <h2 class="receipt-title">${isPaid ? 'PAYMENT RECEIPT' : 'PAYMENT STATUS SLIP'}</h2>
    ${isPaid ? '' : `<div class="notice">PAYMENT NOT VERIFIED — THIS IS NOT PROOF OF PAYMENT</div>`}
    <div class="meta">
      <div><span class="label">Receipt number</span>${asPlainText(payment.receipt_number)}</div>
      <div><span class="label">Transaction ID</span>${asPlainText(payment.transaction_id)}</div>
      <div><span class="label">Transaction reference</span>${asPlainText(payment.transaction_reference || '—')}</div>
      <div><span class="label">Payment date</span>${asPlainText(formatDateTime(payment.payment_date))}</div>
      <div><span class="label">Customer</span>${asPlainText(payment.customer_name)}</div>
      <div><span class="label">Mobile</span>${asPlainText(payment.mobile || '—')}</div>
      <div><span class="label">Application number</span>${asPlainText(payment.application_number)}</div>
      <div><span class="label">Service</span>${asPlainText(payment.service_name)}</div>
    </div>
    <table><thead><tr><th>Particulars</th><th>Amount</th></tr></thead><tbody>
      <tr><td>Government fee</td><td>${asPlainText(formatMoney(payment.government_fee))}</td></tr>
      <tr><td>Service centre charge</td><td>${asPlainText(formatMoney(payment.service_charge))}</td></tr>
      ${Number(payment.discount) ? `<tr><td>Discount</td><td>−${asPlainText(formatMoney(payment.discount))}</td></tr>` : ''}
      <tr><td>Total amount due</td><td>${asPlainText(formatMoney(payment.total_amount))}</td></tr>
      <tr class="total"><td>Amount received</td><td>${asPlainText(formatMoney(payment.amount_paid))}</td></tr>
      ${balanceDue ? `<tr><td>Balance due</td><td>${asPlainText(formatMoney(balanceDue))}</td></tr>` : ''}
      ${Number(payment.refunded_amount) ? `<tr><td>Confirmed refund</td><td>−${asPlainText(formatMoney(payment.refunded_amount))}</td></tr><tr class="total"><td>Net collected</td><td>${asPlainText(formatMoney(remaining))}</td></tr>` : ''}
    </tbody></table>
    <div class="meta">
      <div><span class="label">Payment method</span>${asPlainText(payment.payment_method)}</div>
      <div><span class="label">Status</span>${asPlainText(payment.status)}</div>
    </div>
    <div class="status">${asPlainText(payment.status)}</div>
    <div class="signature">Authorized signature</div>
    <footer class="footer">Generated from the DHIVA E-SEVAI MAIYAM payment register.</footer>`;
  openPrintDocument(`Receipt ${payment.receipt_number}`, body, thermal);
}

const emptyForm = {
  application_id: '',
  service_id: '',
  discount: '0',
  amount_received: '',
  payment_method: 'Cash',
  transaction_reference: '',
  payment_date: localDateTime(),
  notes: '',
  cash_received_confirmed: false,
};

export default function Payments() {
  const [filters, setFilters] = useState({
    search: '',
    status: 'All',
    category: 'All',
    method: 'All',
    date_from: '',
    date_to: '',
    sortBy: 'payment_date',
    sortDir: 'desc',
    page: 1,
    limit: 10,
  });
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [options, setOptions] = useState({ services: [], applications: [] });
  const [loading, setLoading] = useState(true);
  const [optionsError, setOptionsError] = useState('');
  const [pageError, setPageError] = useState('');
  const [recordOpen, setRecordOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [refundTarget, setRefundTarget] = useState(null);
  const [refundForm, setRefundForm] = useState({ amount: '', reason: '' });
  const [refundConfirmTarget, setRefundConfirmTarget] = useState(null);
  const [refundReference, setRefundReference] = useState('');
  const [refundBusy, setRefundBusy] = useState(false);
  const [cashTarget, setCashTarget] = useState(null);
  const [cashForm, setCashForm] = useState({ amount: '', reference: '', confirmed: false });
  const [cashBusy, setCashBusy] = useState(false);
  const [reportBusy, setReportBusy] = useState('');

  const loadOptions = useCallback(async () => {
    try {
      const { data } = await api.get('/payments/options');
      setOptions(data.data || { services: [], applications: [] });
      setOptionsError('');
    } catch (error) {
      setOptionsError(error.response?.data?.message || 'Unable to load applications and services. Check your connection and admin access.');
    }
  }, []);

  const loadPayments = useCallback(async () => {
    try {
      const { data } = await api.get('/payments', {
        params: {
          ...filters,
          search: filters.search.trim() || undefined,
          status: filters.status === 'All' ? undefined : filters.status,
          category: filters.category === 'All' ? undefined : filters.category,
          method: filters.method === 'All' ? undefined : filters.method,
          date_from: filters.date_from || undefined,
          date_to: filters.date_to || undefined,
        },
      });
      setRecords(data.data || []);
      setSummary(data.summary || null);
      setPagination(data.pagination || { page: 1, limit: filters.limit, total: 0, pages: 0 });
    } catch (error) {
      setRecords([]);
      setSummary(null);
      setPagination({ page: filters.page, limit: filters.limit, total: 0, pages: 0 });
      setPageError(error.response?.data?.message || 'Payment records could not be loaded. Verify the backend and your admin sign-in.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const timer = window.setTimeout(() => { loadPayments(); }, 150);
    return () => window.clearTimeout(timer);
  }, [loadPayments]);
  useEffect(() => {
    const timer = window.setTimeout(() => { loadOptions(); }, 0);
    return () => window.clearTimeout(timer);
  }, [loadOptions]);

  const activeServices = useMemo(
    () => options.services.filter((service) => service.status !== 'Inactive'),
    [options.services],
  );
  const selectedApplication = options.applications.find((app) => String(app.id) === form.application_id);
  const selectedService = activeServices.find((service) => String(service.id) === String(selectedApplication?.service_id));
  const governmentFee = Number(selectedService?.government_fee || 0);
  const centerCharge = Number(selectedService?.service_charge || 0) + Number(selectedService?.gst_tax || 0);
  const discount = readNumber(form.discount);
  const totalAmount = discount === null ? null : Math.max(0, governmentFee + centerCharge - discount);
  const amountReceived = readNumber(form.amount_received);
  const categories = useMemo(() => [...new Set(options.services.map((service) => service.category).filter(Boolean))].sort(), [options.services]);

  const updateFilter = (key, value) => {
    setLoading(true);
    setPageError('');
    setFilters((current) => ({ ...current, [key]: value, page: 1 }));
  };

  const changePage = (page) => {
    setLoading(true);
    setFilters((current) => ({ ...current, page }));
  };

  const openDetails = async (record) => {
    setDetailsLoading(true);
    setDetails({ ...record, audit: [], refunds: [] });
    try {
      const { data } = await api.get(`/payments/${record.id}`);
      setDetails(data.data);
    } catch (error) {
      setDetails(null);
      setPageError(error.response?.data?.message || 'Unable to load transaction details.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshPaymentData = async () => {
    await loadPayments();
    if (details?.id) {
      try {
        const { data } = await api.get(`/payments/${details.id}`);
        setDetails(data.data);
      } catch (error) {
        setPageError(error.response?.data?.message || 'Payment changed, but its details could not be refreshed.');
      }
    }
  };

  const openCashCollection = (payment) => {
    if (payment.payment_method !== 'Cash' || !['Pending', 'Partially Paid'].includes(payment.status)) return;
    const remaining = Math.max(0, Number(payment.total_amount) - Number(payment.amount_paid || 0));
    setCashForm({ amount: remaining.toFixed(2), reference: '', confirmed: false });
    setCashTarget(payment);
  };

  const submitCashCollection = async (event) => {
    event.preventDefault();
    const amount = Number(cashForm.amount);
    const remaining = cashTarget ? Number(cashTarget.total_amount) - Number(cashTarget.amount_paid || 0) : 0;
    if (!cashTarget || !cashForm.confirmed || !Number.isFinite(amount) || amount <= 0 || amount > remaining) return;
    setCashBusy(true);
    try {
      await api.patch(`/payments/${cashTarget.id}/status`, {
        amount_received: amount,
        transaction_reference: cashForm.reference.trim(),
        cash_received_confirmed: true,
      });
      setCashTarget(null);
      await refreshPaymentData();
    } catch (error) {
      setPageError(error.response?.data?.message || 'Unable to record this cash collection.');
    } finally {
      setCashBusy(false);
    }
  };

  const validatePaymentForm = () => {
    if (!form.application_id || !selectedApplication || !selectedService) return 'Select an existing application with an active linked service.';
    if (!/^[0-9+ ()-]{7,20}$/.test(selectedApplication.mobile || '')) return 'The selected application must have a valid mobile number.';
    if (discount === null || discount > governmentFee + centerCharge) return 'Discount must be a valid amount no greater than the service total.';
    if (totalAmount === null || totalAmount <= 0) return 'Payment total must be greater than zero.';
    if (form.payment_method === 'Cash' && (amountReceived === null || amountReceived <= 0 || amountReceived > totalAmount)) return 'Cash received must be greater than zero and no more than the total due.';
    if (!form.payment_date || Number.isNaN(Date.parse(form.payment_date)) || new Date(form.payment_date).getTime() > Date.now()) return 'Choose a valid payment date and time that is not in the future.';
    if (form.transaction_reference.trim().length > 120) return 'Transaction reference cannot exceed 120 characters.';
    if (form.notes.trim().length > 1000) return 'Notes cannot exceed 1000 characters.';
    if (form.payment_method === 'Cash' && !form.cash_received_confirmed) return 'Confirm that the cash was physically received.';
    return '';
  };

  const submitPayment = async (event) => {
    event.preventDefault();
    const errorMessage = validatePaymentForm();
    if (errorMessage) {
      setFormError(errorMessage);
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const response = await api.post('/payments', {
        application_id: Number(form.application_id),
        service_id: Number(selectedService.id),
        discount: Number(form.discount || 0),
        amount_received: form.payment_method === 'Cash' ? amountReceived : 0,
        payment_method: form.payment_method,
        transaction_reference: form.transaction_reference.trim(),
        payment_date: new Date(form.payment_date).toISOString(),
        notes: form.notes.trim(),
        idempotency_key: globalThis.crypto?.randomUUID?.() || `pay-${Date.now()}-${Math.random().toString(36).slice(2, 14)}`,
        cash_received_confirmed: form.payment_method === 'Cash' && form.cash_received_confirmed,
      });
      setRecordOpen(false);
      setForm({ ...emptyForm, payment_date: localDateTime() });
      setPageError('');
      await loadPayments();
      if (response.data.data?.id) {
        try {
          const { data } = await api.get(`/payments/${response.data.data.id}`);
          setDetails(data.data);
        } catch (error) {
          setPageError(error.response?.data?.message || 'Payment saved, but transaction details could not be loaded.');
        }
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Unable to save payment. Verify the backend connection and try again.');
    } finally {
      setSaving(false);
    }
  };

  const openRefundRequest = (payment) => {
    const remaining = Math.max(0, Number(payment.total_amount || 0) - Number(payment.refunded_amount || 0));
    setRefundForm({ amount: remaining ? remaining.toFixed(2) : '', reason: '' });
    setRefundTarget(payment);
  };

  const submitRefund = async (event) => {
    event.preventDefault();
    if (!refundTarget || !Number(refundForm.amount) || refundForm.amount < 0.01 || refundForm.reason.trim().length < 4) return;
    setRefundBusy(true);
    try {
      await api.post(`/payments/${refundTarget.id}/refunds`, {
        amount: Number(refundForm.amount),
        reason: refundForm.reason.trim(),
      });
      setRefundTarget(null);
      await refreshPaymentData();
    } catch (error) {
      setPageError(error.response?.data?.message || 'Unable to save the refund request.');
    } finally {
      setRefundBusy(false);
    }
  };

  const submitRefundConfirmation = async (event) => {
    event.preventDefault();
    if (!refundConfirmTarget || refundReference.trim().length < 3) return;
    setRefundBusy(true);
    try {
      await api.post(`/payments/refunds/${refundConfirmTarget.id}/confirm`, {
        confirmed: true,
        reference_number: refundReference.trim(),
      });
      setRefundConfirmTarget(null);
      setRefundReference('');
      await refreshPaymentData();
    } catch (error) {
      setPageError(error.response?.data?.message || 'Unable to confirm the refund.');
    } finally {
      setRefundBusy(false);
    }
  };

  const currentParams = () => ({
    search: filters.search.trim() || undefined,
    status: filters.status === 'All' ? undefined : filters.status,
    category: filters.category === 'All' ? undefined : filters.category,
    method: filters.method === 'All' ? undefined : filters.method,
    date_from: filters.date_from || undefined,
    date_to: filters.date_to || undefined,
    sortBy: filters.sortBy,
    sortDir: filters.sortDir,
  });

  const exportCsv = async () => {
    setExporting(true);
    try {
      const first = await api.get('/payments', { params: { ...currentParams(), page: 1, limit: 100 } });
      const allRecords = [...(first.data.data || [])];
      for (let page = 2; page <= first.data.pagination.pages; page += 1) {
        const { data } = await api.get('/payments', { params: { ...currentParams(), page, limit: 100 } });
        allRecords.push(...(data.data || []));
      }
      const columns = [
        ['Receipt Number', 'receipt_number'], ['Transaction ID', 'transaction_id'],
        ['Customer Name', 'customer_name'], ['Mobile Number', 'mobile'],
        ['Service Name', 'service_name'], ['Application Number', 'application_number'],
        ['Government Fee', 'government_fee'], ['Service Centre Charge', 'service_charge'],
        ['Discount', 'discount'], ['Total Amount Due', 'total_amount'], ['Amount Paid', 'amount_paid'], ['Refunded Amount', 'refunded_amount'],
        ['Payment Method', 'payment_method'], ['Payment Status', 'status'],
        ['Payment Date & Time', 'payment_date'], ['Transaction Reference', 'transaction_reference'],
      ];
      const csv = [columns.map(([heading]) => `"${heading}"`).join(',')]
        .concat(allRecords.map((record) => columns.map(([, key]) => `"${String(record[key] ?? '').replaceAll('"', '""')}"`).join(',')))
        .join('\r\n');
      const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `dhiva-payments-${localDate()}.csv`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      setPageError(error.response?.data?.message || 'Unable to export the filtered payment records.');
    } finally {
      setExporting(false);
    }
  };

  const printCollectionReport = async (period) => {
    setReportBusy(period);
    try {
      const today = new Date();
      const from = new Date(today);
      const to = new Date(today);
      if (period === 'weekly') from.setDate(today.getDate() - 6);
      if (period === 'monthly') from.setDate(1);
      const dateFrom = localDate(from);
      const dateTo = localDate(to);
      const { data } = await api.get('/payments', {
        params: { date_from: dateFrom, date_to: dateTo, page: 1, limit: 1 },
      });
      const report = data.summary;
      const methodRows = report.by_method.map((method) => `<tr><td>${asPlainText(method.method)}</td><td>${method.count}</td><td>${asPlainText(formatMoney(method.amount))}</td></tr>`).join('');
      openPrintDocument(`${period} payment collection report`, `
        <header class="brand"><h1>DHIVA E-SEVAI MAIYAM</h1><p>Payment collection report</p></header>
        <h2 class="receipt-title">${period[0].toUpperCase()}${period.slice(1)} report</h2>
        <p><b>Report period:</b> ${asPlainText(dateFrom)} to ${asPlainText(dateTo)}</p>
        <div class="meta">
          <div><span class="label">Collected</span>${asPlainText(formatMoney(report.total_collection))}</div>
          <div><span class="label">Transactions</span>${report.transaction_count}</div>
          <div><span class="label">Pending amount</span>${asPlainText(formatMoney(report.pending_amount))}</div>
          <div><span class="label">Refunded amount</span>${asPlainText(formatMoney(report.refunded_amount))}</div>
        </div>
        <h3>Collection by payment method</h3>
        <table><thead><tr><th>Method</th><th>Transactions</th><th>Collected</th></tr></thead><tbody>${methodRows || '<tr><td colspan="3">No verified collections in this period.</td></tr>'}</tbody></table>
        <footer class="footer">Report generated ${asPlainText(new Date().toLocaleString('en-IN'))}. Only verified paid transactions are included in collection totals.</footer>
      `);
    } catch (error) {
      setPageError(error.response?.data?.message || 'Unable to generate the collection report.');
    } finally {
      setReportBusy('');
    }
  };

  const resetFilters = () => {
    setLoading(true);
    setPageError('');
    setFilters({
      search: '', status: 'All', category: 'All', method: 'All',
      date_from: '', date_to: '', sortBy: 'payment_date', sortDir: 'desc', page: 1, limit: 10,
    });
  };

  const statCards = [
    { label: 'Total Collection', value: formatMoney(summary?.total_collection), icon: IndianRupee, tone: 'bg-orange-500 text-white' },
    { label: "Today's Collection", value: formatMoney(summary?.today_collection), icon: CalendarDays, tone: 'bg-green-500 text-white' },
    { label: 'Pending Payments', value: formatMoney(summary?.pending_amount), icon: Wallet, tone: 'bg-amber-500 text-white' },
    { label: 'Refunded Amount', value: formatMoney(summary?.refunded_amount), icon: RefreshCcw, tone: 'bg-gray-700 text-white' },
    { label: 'Successful Transactions', value: Number(summary?.transaction_count || 0).toLocaleString('en-IN'), icon: CheckCircle2, tone: 'bg-blue-600 text-white' },
  ];

  return (
    <section className="-m-3 min-h-screen bg-[#0d0e12] p-4 text-white sm:-m-5 sm:p-6 lg:-m-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-400">
              <BadgeIndianRupee size={15} /> Finance
            </div>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-white sm:text-3xl">Payments</h1>
            <p className="mt-1 text-sm text-gray-400">Review verified collections, pending transactions, refunds and receipts.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={exportCsv} disabled={exporting || loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-gray-800 bg-[#1a1c23] px-3.5 text-sm font-semibold text-gray-300 shadow-sm hover:bg-[#15171d] disabled:opacity-60">
              {exporting ? <LoaderCircle size={16} className="animate-spin" /> : <Download size={16} />} Export CSV
            </button>
            <button type="button" onClick={() => { setForm({ ...emptyForm, payment_date: localDateTime() }); setFormError(''); setRecordOpen(true); }} disabled={Boolean(optionsError) || !options.applications.length} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-50">
              <Plus size={17} /> Record Payment
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {statCards.map((stat) => (
            <article key={stat.label} className={`${cardClass} flex min-h-[112px] items-center gap-3 p-4`}>
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.tone}`}><stat.icon size={20} /></span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-400">{stat.label}</p>
                {loading ? <div className="mt-2 h-6 w-28 animate-pulse rounded bg-gray-800" /> : <p className="mt-1 truncate text-lg font-bold tabular-nums text-white">{stat.value}</p>}
                {stat.label === 'Total Collection' && <p className="mt-0.5 text-[11px] text-gray-500">Selected date range</p>}
              </div>
            </article>
          ))}
        </div>

        {optionsError && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{optionsError} Real payment records are not replaced with demo data.</p>
            <button type="button" onClick={loadOptions} className="ml-auto inline-flex items-center gap-1 font-semibold"><RefreshCcw size={14} /> Retry</button>
          </div>
        )}
        {pageError && (
          <div role="alert" className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
            <AlertCircle size={18} className="mt-0.5 shrink-0" /><p>{pageError}</p>
            <button type="button" onClick={() => setPageError('')} aria-label="Dismiss error" className="ml-auto rounded p-1 hover:bg-red-500/15"><X size={16} /></button>
          </div>
        )}

        <div className={`${cardClass} overflow-hidden`}>
          <div className="space-y-4 border-b border-gray-800 p-4 sm:p-5">
            <div className="flex flex-col justify-between gap-3 xl:flex-row xl:items-center">
              <div className="relative w-full xl:max-w-md">
                <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  value={filters.search}
                  onChange={(event) => updateFilter('search', event.target.value)}
                  aria-label="Search payments"
                  placeholder="Search receipt, customer, mobile, application or transaction"
                  className={`${inputClass} pl-9`}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => printCollectionReport('daily')} disabled={Boolean(reportBusy)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-800 px-3 text-sm font-medium text-gray-300 hover:bg-[#15171d] disabled:opacity-50">
                  {reportBusy === 'daily' ? <LoaderCircle size={15} className="animate-spin" /> : <Printer size={15} />} Daily report
                </button>
                <button type="button" onClick={() => printCollectionReport('weekly')} disabled={Boolean(reportBusy)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-800 px-3 text-sm font-medium text-gray-300 hover:bg-[#15171d] disabled:opacity-50">
                  {reportBusy === 'weekly' ? <LoaderCircle size={15} className="animate-spin" /> : <Printer size={15} />} Weekly
                </button>
                <button type="button" onClick={() => printCollectionReport('monthly')} disabled={Boolean(reportBusy)} className="inline-flex h-10 items-center gap-2 rounded-lg border border-gray-800 px-3 text-sm font-medium text-gray-300 hover:bg-[#15171d] disabled:opacity-50">
                  {reportBusy === 'monthly' ? <LoaderCircle size={15} className="animate-spin" /> : <Printer size={15} />} Monthly
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-400">Payment status</span>
                <select aria-label="Filter by payment status" value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} className={inputClass}>
                  {statuses.map((status) => <option key={status}>{status}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-400">Service category</span>
                <select aria-label="Filter by service category" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} className={inputClass}>
                  <option>All</option>{categories.map((category) => <option key={category}>{category}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-400">Payment method</span>
                <select aria-label="Filter by payment method" value={filters.method} onChange={(event) => updateFilter('method', event.target.value)} className={inputClass}>
                  {methods.map((method) => <option key={method}>{method}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-400">From date</span>
                <input type="date" aria-label="Filter from date" value={filters.date_from} onChange={(event) => updateFilter('date_from', event.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-400">To date</span>
                <input type="date" aria-label="Filter to date" value={filters.date_to} onChange={(event) => updateFilter('date_to', event.target.value)} className={inputClass} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-gray-400">Sort records</span>
                <select aria-label="Sort payments" value={`${filters.sortBy}:${filters.sortDir}`} onChange={(event) => {
                  const [sortBy, sortDir] = event.target.value.split(':');
                  setLoading(true);
                  setFilters((current) => ({ ...current, sortBy, sortDir, page: 1 }));
                }} className={inputClass}>
                  <option value="payment_date:desc">Newest first</option>
                  <option value="payment_date:asc">Oldest first</option>
                  <option value="amount:desc">Amount: high to low</option>
                  <option value="amount:asc">Amount: low to high</option>
                </select>
              </label>
            </div>
            {(filters.search || filters.status !== 'All' || filters.category !== 'All' || filters.method !== 'All' || filters.date_from || filters.date_to) && (
              <button type="button" onClick={resetFilters} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-orange-400">
                <FilterX size={14} /> Clear filters
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 divide-y divide-gray-800 border-b border-gray-800 bg-[#15171d]/70 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4">
            {(summary?.by_method || []).map((method) => (
              <div key={method.method} className="flex items-center justify-between gap-3 px-4 py-3 sm:border-r sm:border-gray-800 last:border-r-0">
                <span className="text-xs text-gray-400">{method.method} collected</span>
                <span className="text-sm font-semibold text-gray-100">{formatMoney(method.amount)}</span>
              </div>
            ))}
            {!loading && !summary?.by_method?.length && <p className="px-4 py-3 text-xs text-gray-500">No verified collections by method for this filter.</p>}
          </div>

          <div className="hidden overflow-x-auto lg:block">
            <table className="w-full min-w-[1550px] text-left text-xs">
              <thead className="bg-[#15171d] text-gray-400">
                <tr>
                  {['Receipt Number', 'Transaction ID', 'Customer Name', 'Mobile', 'Service', 'Application', 'Government Fee', 'Centre Charge', 'Total', 'Method', 'Status', 'Payment Date & Time', 'Actions'].map((heading) => (
                    <th key={heading} className="whitespace-nowrap px-3 py-3 font-semibold">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {!loading && records.map((record) => (
                  <tr key={record.id} className="text-gray-300 hover:bg-white/[.02]">
                    <td className="px-3 py-3 font-semibold text-white">{record.receipt_number}</td>
                    <td className="px-3 py-3 font-mono text-[11px]">{record.transaction_id}</td>
                    <td className="px-3 py-3 font-medium">{record.customer_name}</td>
                    <td className="px-3 py-3">{record.mobile || '—'}</td>
                    <td className="max-w-40 truncate px-3 py-3" title={record.service_name}>{record.service_name}</td>
                    <td className="px-3 py-3">{record.application_number}</td>
                    <td className="px-3 py-3 tabular-nums">{formatMoney(record.government_fee)}</td>
                    <td className="px-3 py-3 tabular-nums">{formatMoney(record.service_charge)}</td>
                    <td className="px-3 py-3 font-semibold tabular-nums">{formatMoney(record.total_amount)}</td>
                    <td className="px-3 py-3">{record.payment_method}</td>
                    <td className="px-3 py-3"><StatusBadge status={record.status} /></td>
                    <td className="whitespace-nowrap px-3 py-3">{formatDateTime(record.payment_date)}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => openDetails(record)} title="View transaction details" aria-label={`View ${record.receipt_number} details`} className="rounded-md p-2 text-gray-400 hover:bg-gray-800 hover:text-white"><Eye size={15} /></button>
                        <button type="button" onClick={() => { try { ReceiptContent({ payment: record }); } catch (error) { setPageError(error.message); } }} title="Print receipt or payment status slip" aria-label={`Print ${record.receipt_number}`} className="rounded-md p-2 text-orange-400 hover:bg-orange-500/15"><Receipt size={15} /></button>
                        {record.payment_method === 'Cash' && ['Pending', 'Partially Paid'].includes(record.status) && <button type="button" onClick={() => openCashCollection(record)} title="Record cash received" aria-label={`Record cash for ${record.receipt_number}`} className="rounded-md p-2 text-emerald-400 hover:bg-emerald-500/15"><Check size={15} /></button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {loading && <div className="space-y-3 p-6" aria-label="Loading payments"><div className="h-8 animate-pulse rounded bg-gray-800" /><div className="h-8 animate-pulse rounded bg-gray-800" /><div className="h-8 animate-pulse rounded bg-gray-800" /></div>}
            {!loading && !records.length && <div className="px-6 py-16 text-center"><ClipboardList className="mx-auto text-gray-600" size={34} /><h3 className="mt-3 font-semibold text-gray-100">{pageError ? 'Payment service unavailable' : 'No payment records found'}</h3><p className="mt-1 text-sm text-gray-400">{pageError ? 'Check your connection and admin access, then retry.' : 'Payment records from the database will appear here. No sample transactions are displayed.'}</p>{pageError && <button type="button" onClick={() => { setLoading(true); loadPayments(); }} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-400"><RefreshCcw size={14} /> Retry</button>}</div>}
          </div>

          <div className="space-y-3 p-3 lg:hidden">
            {loading && <div className="space-y-3" aria-label="Loading payments">{[1, 2, 3].map((item) => <div key={item} className="h-32 animate-pulse rounded-xl bg-gray-800" />)}</div>}
            {!loading && records.map((record) => (
              <article key={record.id} className="rounded-xl border border-gray-800 bg-[#1a1c23] p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0"><p className="truncate text-sm font-bold text-white">{record.customer_name}</p><p className="mt-1 truncate font-mono text-[11px] text-gray-400">{record.receipt_number}</p></div>
                  <StatusBadge status={record.status} />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                  <div><span className="text-gray-500">Transaction</span><p className="mt-0.5 truncate font-mono text-gray-300">{record.transaction_id}</p></div>
                  <div><span className="text-gray-500">Mobile</span><p className="mt-0.5 text-gray-300">{record.mobile || '—'}</p></div>
                  <div><span className="text-gray-500">Service</span><p className="mt-0.5 truncate text-gray-300">{record.service_name}</p></div>
                  <div><span className="text-gray-500">Application</span><p className="mt-0.5 text-gray-300">{record.application_number}</p></div>
                  <div><span className="text-gray-500">Government fee</span><p className="mt-0.5 text-gray-300">{formatMoney(record.government_fee)}</p></div>
                  <div><span className="text-gray-500">Centre charge</span><p className="mt-0.5 text-gray-300">{formatMoney(record.service_charge)}</p></div>
                  <div><span className="text-gray-500">Method · Date</span><p className="mt-0.5 text-gray-300">{record.payment_method} · {formatDateTime(record.payment_date)}</p></div>
                  <div><span className="text-gray-500">Total</span><p className="mt-0.5 font-bold text-white">{formatMoney(record.total_amount)}</p></div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2 border-t border-gray-800 pt-3">
                  <button type="button" onClick={() => openDetails(record)} className="inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold text-gray-300 hover:bg-gray-800"><Eye size={14} /> Details</button>
                  <button type="button" onClick={() => { try { ReceiptContent({ payment: record }); } catch (error) { setPageError(error.message); } }} className="inline-flex items-center gap-1 rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-semibold text-orange-400 hover:bg-orange-500/20"><Receipt size={14} /> Receipt</button>
                  {record.payment_method === 'Cash' && ['Pending', 'Partially Paid'].includes(record.status) && <button type="button" onClick={() => openCashCollection(record)} className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20"><Check size={14} /> Record cash</button>}
                </div>
              </article>
            ))}
            {!loading && !records.length && <div className="px-3 py-12 text-center"><ClipboardList className="mx-auto text-gray-600" size={34} /><h3 className="mt-3 font-semibold text-gray-100">{pageError ? 'Payment service unavailable' : 'No payment records found'}</h3><p className="mt-1 text-sm text-gray-400">{pageError ? 'Check your connection and admin access, then retry.' : 'No sample transactions are displayed.'}</p>{pageError && <button type="button" onClick={() => { setLoading(true); loadPayments(); }} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-orange-400"><RefreshCcw size={14} /> Retry</button>}</div>}
          </div>

          <footer className="flex flex-col items-center justify-between gap-3 border-t border-gray-800 px-4 py-3 text-xs text-gray-400 sm:flex-row">
            <div className="flex items-center gap-2">
              <span>{pagination.total ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}` : '0 records'}</span>
              <label className="flex items-center gap-1.5">
                <span className="sr-only">Rows per page</span>
                <select value={filters.limit} onChange={(event) => { setLoading(true); setFilters((current) => ({ ...current, limit: Number(event.target.value), page: 1 })); }} className="rounded border border-gray-800 bg-[#1a1c23] px-2 py-1 text-xs">
                  {[10, 25, 50, 100].map((limit) => <option key={limit} value={limit}>{limit} / page</option>)}
                </select>
              </label>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => changePage(Math.max(1, filters.page - 1))} disabled={filters.page <= 1 || loading} aria-label="Previous page" className="rounded-md border border-gray-800 p-1.5 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span>Page {pagination.pages ? pagination.page : 0} of {pagination.pages}</span>
              <button type="button" onClick={() => changePage(Math.min(pagination.pages, filters.page + 1))} disabled={filters.page >= pagination.pages || loading} aria-label="Next page" className="rounded-md border border-gray-800 p-1.5 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </footer>
        </div>
      </div>

      {recordOpen && (
        <Modal title="Record a payment" description="Use an existing application. Fees and totals are revalidated by the server." onClose={() => !saving && setRecordOpen(false)} wide>
          <form onSubmit={submitPayment} className="max-h-[80vh] space-y-5 overflow-y-auto p-5 sm:p-6">
            {formError && <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">{formError}</div>}
            {!options.applications.length && <div role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">There are no existing applications to attach a payment to. Create an application first.</div>}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Application number" required>
                <select required value={form.application_id} onChange={(event) => {
                  const app = options.applications.find((item) => String(item.id) === event.target.value);
                  const service = activeServices.find((item) => String(item.id) === String(app?.service_id));
                  const serviceTotal = Number(service?.government_fee || 0) + Number(service?.service_charge || 0) + Number(service?.gst_tax || 0);
                  setForm((current) => ({ ...current, application_id: event.target.value, service_id: app ? String(app.service_id) : '', amount_received: service ? serviceTotal.toFixed(2) : '' }));
                }} className={inputClass}>
                  <option value="">Choose an application</option>
                  {options.applications.map((app) => <option key={app.id} value={app.id}>{app.application_number} · {app.applicant_name}</option>)}
                </select>
              </Field>
              <Field label="Select service" required>
                <select required value={selectedService?.id || ''} disabled className={inputClass}>
                  <option value="">{selectedService?.service_name || 'Select an application first'}</option>
                </select>
              </Field>
              <Field label="Customer name" required>
                <input required readOnly value={selectedApplication?.applicant_name || ''} placeholder="Selected from application" className={inputClass} />
              </Field>
              <Field label="Mobile number" required>
                <input required readOnly value={selectedApplication?.mobile || ''} placeholder="Selected from application" className={inputClass} />
              </Field>
              <Field label="Government fee">
                <input readOnly value={formatMoney(governmentFee)} className={inputClass} />
              </Field>
              <Field label="Service centre charge (including applicable GST)">
                <input readOnly value={formatMoney(centerCharge)} className={inputClass} />
              </Field>
              <Field label="Discount">
                <input type="number" min="0" max={governmentFee + centerCharge} step="0.01" value={form.discount} onChange={(event) => {
                  const nextDiscount = Number(event.target.value || 0);
                  setForm((current) => ({
                    ...current,
                    discount: event.target.value,
                    amount_received: current.payment_method === 'Cash'
                      ? Math.max(0, governmentFee + centerCharge - nextDiscount).toFixed(2)
                      : current.amount_received,
                  }));
                }} className={inputClass} />
              </Field>
              <Field label="Total amount">
                <input readOnly value={totalAmount === null ? 'Invalid amount' : formatMoney(totalAmount)} className={`${inputClass} font-bold`} />
              </Field>
              <Field label="Payment method" required>
                <select required value={form.payment_method} onChange={(event) => setForm((current) => ({ ...current, payment_method: event.target.value, cash_received_confirmed: false }))} className={inputClass}>
                  {methods.filter((method) => method !== 'All').map((method) => <option key={method}>{method}</option>)}
                </select>
              </Field>
              {form.payment_method === 'Cash' && (
                <Field label="Cash received now" required>
                  <input type="number" required min="0.01" max={totalAmount || undefined} step="0.01" value={form.amount_received} onChange={(event) => setForm((current) => ({ ...current, amount_received: event.target.value }))} className={inputClass} />
                </Field>
              )}
              <Field label="Transaction reference">
                <input maxLength={120} value={form.transaction_reference} onChange={(event) => setForm((current) => ({ ...current, transaction_reference: event.target.value }))} placeholder="Reference from payment source, if available" className={inputClass} />
              </Field>
              <Field label="Payment date and time" required>
                <input type="datetime-local" required max={localDateTime()} value={form.payment_date} onChange={(event) => setForm((current) => ({ ...current, payment_date: event.target.value }))} className={inputClass} />
              </Field>
              <Field label="Notes">
                <input maxLength={1000} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Optional internal note" className={inputClass} />
              </Field>
            </div>
            {form.payment_method === 'Cash' ? (
              <label className="flex items-start gap-3 rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-300">
                <input type="checkbox" checked={form.cash_received_confirmed} onChange={(event) => setForm((current) => ({ ...current, cash_received_confirmed: event.target.checked }))} className="mt-0.5 accent-orange-600" />
                <span><b>Cash physically received.</b> I confirm the cash amount entered above was received at the centre. This confirmation will be recorded in the audit history.</span>
              </label>
            ) : (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">
                <ShieldCheck size={17} className="mt-0.5 shrink-0" />
                <p>No payment gateway is configured. This transaction will be saved as <b>Pending</b> with zero recorded as received; the admin page cannot mark card, UPI or bank-transfer payments as successful without provider verification.</p>
              </div>
            )}
            <div className="flex flex-col-reverse gap-2 border-t border-gray-800 pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setRecordOpen(false)} disabled={saving} className="min-h-10 rounded-lg border border-gray-800 px-4 text-sm font-semibold text-gray-300 hover:bg-[#15171d]">Cancel</button>
              <button type="submit" disabled={saving || !options.applications.length} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-orange-600 px-4 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60">
                {saving && <LoaderCircle size={16} className="animate-spin" />}{saving ? 'Saving…' : 'Save payment'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {cashTarget && (
        <Modal title="Record cash collection" description="Each confirmed collection is added to the transaction audit history." onClose={() => !cashBusy && setCashTarget(null)}>
          <form onSubmit={submitCashCollection} className="space-y-4 p-5">
            <div className="rounded-lg bg-[#15171d] p-3 text-sm text-gray-300">
              <p>Receipt <b>{cashTarget.receipt_number}</b></p>
              <p className="mt-1">Balance due <b>{formatMoney(Number(cashTarget.total_amount) - Number(cashTarget.amount_paid || 0))}</b></p>
            </div>
            <Field label="Cash received now" required>
              <input type="number" required min="0.01" max={Math.max(0, Number(cashTarget.total_amount) - Number(cashTarget.amount_paid || 0))} step="0.01" value={cashForm.amount} onChange={(event) => setCashForm((current) => ({ ...current, amount: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Collection reference">
              <input maxLength={120} value={cashForm.reference} onChange={(event) => setCashForm((current) => ({ ...current, reference: event.target.value }))} className={inputClass} />
            </Field>
            <label className="flex items-start gap-2 rounded-lg border border-orange-500/30 bg-orange-500/10 p-3 text-sm text-orange-300">
              <input required type="checkbox" checked={cashForm.confirmed} onChange={(event) => setCashForm((current) => ({ ...current, confirmed: event.target.checked }))} className="mt-1 accent-orange-600" />
              I confirm this amount was physically received in cash at the centre.
            </label>
            <div className="flex justify-end gap-2 border-t border-gray-800 pt-4">
              <button type="button" onClick={() => setCashTarget(null)} disabled={cashBusy} className="rounded-lg border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-300">Cancel</button>
              <button type="submit" disabled={cashBusy || !cashForm.confirmed || !Number(cashForm.amount)} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{cashBusy && <LoaderCircle size={15} className="animate-spin" />}Record cash</button>
            </div>
          </form>
        </Modal>
      )}

      {details && (
        <Modal title="Transaction details" description={`${details.receipt_number} · ${details.transaction_id}`} onClose={() => setDetails(null)} wide>
          <div className="max-h-[82vh] space-y-5 overflow-y-auto p-5 sm:p-6">
            {detailsLoading && <div className="h-24 animate-pulse rounded-xl bg-gray-800" aria-label="Loading transaction details" />}
            {!detailsLoading && <>
              <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#15171d] p-4">
                <div><p className="text-xs text-gray-400">Payment status</p><div className="mt-1"><StatusBadge status={details.status} /></div></div>
                <div className="text-right"><p className="text-xs text-gray-400">Total amount</p><p className="text-xl font-bold text-white">{formatMoney(details.total_amount)}</p></div>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {[
                  ['Customer', details.customer_name], ['Mobile', details.mobile || '—'],
                  ['Application', details.application_number], ['Service', details.service_name],
                  ['Category', details.category], ['Date', formatDateTime(details.payment_date)],
                  ['Payment method', details.payment_method], ['Transaction reference', details.transaction_reference || '—'],
                  ['Government fee', formatMoney(details.government_fee)], ['Service centre charge', formatMoney(details.service_charge)],
                  ['Amount received', formatMoney(details.amount_paid)], ['Balance due', formatMoney(Math.max(0, Number(details.total_amount) - Number(details.amount_paid)))],
                  ['Discount', formatMoney(details.discount)], ['Refunded', formatMoney(details.refunded_amount)],
                ].map(([label, value]) => <div key={label} className="rounded-lg border border-gray-800 p-3"><p className="text-xs text-gray-400">{label}</p><p className="mt-1 break-words text-sm font-medium text-gray-100">{value}</p></div>)}
              </div>
              {details.notes && <p className="rounded-lg bg-[#15171d] p-3 text-sm text-gray-400"><b>Notes:</b> {details.notes}</p>}
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => { try { ReceiptContent({ payment: details }); } catch (error) { setPageError(error.message); } }} className="inline-flex items-center gap-2 rounded-lg border border-orange-500/30 px-3 py-2 text-sm font-semibold text-orange-400 hover:bg-orange-500/10"><Printer size={15} /> Print A4 receipt/status</button>
                <button type="button" onClick={() => { try { ReceiptContent({ payment: details, thermal: true }); } catch (error) { setPageError(error.message); } }} className="inline-flex items-center gap-2 rounded-lg border border-orange-500/30 px-3 py-2 text-sm font-semibold text-orange-400 hover:bg-orange-500/10"><Receipt size={15} /> Thermal receipt</button>
                {['Paid', 'Partially Refunded'].includes(details.status) && <button type="button" onClick={() => openRefundRequest(details)} className="inline-flex items-center gap-2 rounded-lg border border-gray-800 px-3 py-2 text-sm font-semibold text-gray-300 hover:bg-[#15171d]"><RefreshCcw size={15} /> Request refund</button>}
              </div>
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><RefreshCcw size={15} /> Refund history</h3>
                {details.refunds?.length ? <div className="space-y-2">{details.refunds.map((refund) => (
                  <div key={refund.id} className="flex flex-col justify-between gap-2 rounded-lg border border-gray-800 p-3 sm:flex-row sm:items-center">
                    <div><p className="text-sm font-semibold text-gray-100">{formatMoney(refund.amount)} · {refund.status}</p><p className="mt-0.5 text-xs text-gray-400">{refund.reason} · {formatDateTime(refund.refund_date || refund.created_at)}</p>{refund.reference_number && <p className="text-xs text-gray-400">Reference: {refund.reference_number}</p>}</div>
                    {refund.status === 'Pending' && <button type="button" onClick={() => { setRefundReference(''); setRefundConfirmTarget(refund); }} className="inline-flex items-center justify-center gap-1 rounded-lg bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/15"><Check size={14} /> Confirm processed refund</button>}
                  </div>
                ))}</div> : <p className="rounded-lg bg-[#15171d] p-3 text-sm text-gray-400">No refunds recorded.</p>}
              </section>
              <section>
                <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-white"><ClipboardList size={15} /> Transaction audit history</h3>
                {details.audit?.length ? <ol className="space-y-3 border-l border-gray-800 pl-4">{details.audit.map((event, index) => {
                  let eventDetails = event.details;
                  if (typeof eventDetails === 'string') {
                    try { eventDetails = JSON.parse(eventDetails); } catch { eventDetails = {}; }
                  }
                  return <li key={`${event.event_type}-${event.created_at}-${index}`} className="relative"><span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-[#1a1c23] bg-orange-500 shadow" /><p className="text-sm font-semibold text-gray-100">{event.event_type}{event.new_status ? ` · ${event.previous_status || 'New'} → ${event.new_status}` : ''}</p><p className="text-xs text-gray-400">{formatDateTime(event.created_at)} · {event.actor_id}</p>{eventDetails?.reference_number && <p className="text-xs text-gray-400">Reference: {eventDetails.reference_number}</p>}</li>;
                })}</ol> : <p className="text-sm text-gray-400">No audit history is available.</p>}
              </section>
            </>}
            <div className="flex justify-end border-t border-gray-800 pt-4"><button type="button" onClick={() => setDetails(null)} className="rounded-lg border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-[#15171d]">Close</button></div>
          </div>
        </Modal>
      )}

      {refundTarget && (
        <Modal title="Request a refund" description="Refund requests remain pending until the authorized process is completed and confirmed." onClose={() => !refundBusy && setRefundTarget(null)}>
          <form onSubmit={submitRefund} className="space-y-4 p-5">
            <div className="rounded-lg bg-[#15171d] p-3 text-sm text-gray-300">Receipt <b>{refundTarget.receipt_number}</b><br />Status <b>{refundTarget.status}</b></div>
            <Field label="Refund amount" required>
              <input type="number" min="0.01" max={Math.max(0, Number(refundTarget.total_amount) - Number(refundTarget.refunded_amount || 0))} step="0.01" required value={refundForm.amount} onChange={(event) => setRefundForm((current) => ({ ...current, amount: event.target.value }))} className={inputClass} />
            </Field>
            <Field label="Refund reason" required>
              <textarea required minLength={4} maxLength={500} rows={3} value={refundForm.reason} onChange={(event) => setRefundForm((current) => ({ ...current, reason: event.target.value }))} className={inputClass} />
            </Field>
            <div className="flex justify-end gap-2 border-t border-gray-800 pt-4">
              <button type="button" onClick={() => setRefundTarget(null)} disabled={refundBusy} className="rounded-lg border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-300">Cancel</button>
              <button type="submit" disabled={refundBusy || refundForm.reason.trim().length < 4 || !Number(refundForm.amount)} className="inline-flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-50">{refundBusy && <LoaderCircle size={15} className="animate-spin" />}Save pending request</button>
            </div>
          </form>
        </Modal>
      )}

      {refundConfirmTarget && (
        <Modal title="Confirm processed refund" description="Only confirm after the refund is processed through the authorized payment source." onClose={() => !refundBusy && setRefundConfirmTarget(null)}>
          <form onSubmit={submitRefundConfirmation} className="space-y-4 p-5">
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-300">Confirm <b>{formatMoney(refundConfirmTarget.amount)}</b> has actually been refunded. This confirmation will be added to the transaction audit.</div>
            <Field label="Authorized refund reference" required>
              <input required minLength={3} maxLength={120} value={refundReference} onChange={(event) => setRefundReference(event.target.value)} className={inputClass} />
            </Field>
            <label className="flex items-start gap-2 text-sm text-gray-300"><input required type="checkbox" className="mt-1 accent-emerald-600" /> I confirm the refund has been processed through an authorized refund method.</label>
            <div className="flex justify-end gap-2 border-t border-gray-800 pt-4">
              <button type="button" onClick={() => setRefundConfirmTarget(null)} disabled={refundBusy} className="rounded-lg border border-gray-800 px-4 py-2 text-sm font-semibold text-gray-300">Cancel</button>
              <button type="submit" disabled={refundBusy || refundReference.trim().length < 3} className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">{refundBusy && <LoaderCircle size={15} className="animate-spin" />}Confirm refund</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
