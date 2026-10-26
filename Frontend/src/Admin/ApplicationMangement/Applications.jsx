import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Grid2X2,
  Plus,
  Search,
  Table2,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../../api";

const Applications = () => {
  const [records, setRecords] = useState([]);
  const [availableServices, setAvailableServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewingRecord, setViewingRecord] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    applicant_name: "",
    mobile: "",
    email: "",
    service_id: "",
    center_name: "",
    notes: "",
  });
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [serviceFilter, setServiceFilter] = useState("All");
  const [centerFilter, setCenterFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [viewMode, setViewMode] = useState(
    () => localStorage.getItem("admin-applications-view") || "table",
  );

  useEffect(
    () => localStorage.setItem("admin-applications-view", viewMode),
    [viewMode],
  );

  const loadData = async () => {
    try {
      const [applicationResponse, serviceResponse] = await Promise.all([
        api.get("/applications"),
        api.get("/services"),
      ]);
      setRecords((applicationResponse.data.data || []).map((application) => ({
        ...application,
        applicant: application.applicant_name,
        service: application.service_name,
        center: application.center_name || "—",
        updatedAt: application.updated_at,
      })));
      setAvailableServices((serviceResponse.data.data || []).filter((service) => service.status === "Active"));
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/applications"), api.get("/services")])
      .then(([applicationResponse, serviceResponse]) => {
        if (!active) return;
        setRecords((applicationResponse.data.data || []).map((application) => ({
          ...application,
          applicant: application.applicant_name,
          service: application.service_name,
          center: application.center_name || "—",
          updatedAt: application.updated_at,
        })));
        setAvailableServices((serviceResponse.data.data || []).filter((service) => service.status === "Active"));
      })
      .catch((error) => {
        if (active) toast.error(error.response?.data?.message || "Unable to load applications.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const services = [...new Set(records.map((record) => record.service))];
  const centers = [...new Set(records.map((record) => record.center))];
  const filteredRecords = useMemo(
    () =>
      records.filter((record) => {
        const searchable =
          `${record.applicant} ${record.service} ${record.center} ${record.status}`.toLowerCase();
        return (
          searchable.includes(query.toLowerCase()) &&
          (statusFilter === "All" || record.status === statusFilter) &&
          (serviceFilter === "All" || record.service === serviceFilter) &&
          (centerFilter === "All" || record.center === centerFilter)
        );
      }),
    [records, query, statusFilter, serviceFilter, centerFilter],
  );

  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageRecords = filteredRecords.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const rangeStart = filteredRecords.length
    ? (currentPage - 1) * pageSize + 1
    : 0;
  const rangeEnd = Math.min(currentPage * pageSize, filteredRecords.length);

  const addApplication = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    try {
      await api.post("/applications", {
        ...applicationForm,
        service_id: Number(applicationForm.service_id),
      });
      toast.success("Application added successfully.");
      setIsAddOpen(false);
      setApplicationForm({
        applicant_name: "",
        mobile: "",
        email: "",
        service_id: "",
        center_name: "",
        notes: "",
      });
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to add application.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteRecord = async (record) => {
    if (!window.confirm(`Delete application for ${record.applicant}? This cannot be undone.`)) return;
    try {
      await api.delete(`/applications/${record.id}`);
      setRecords((current) => current.filter((item) => item.id !== record.id));
      toast.success("Application deleted successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete application.");
    }
  };

  const renderActions = (record) => (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => setViewingRecord(record)}
        className="rounded-md p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
        title={`View ${record.applicant}`}
      >
        <Eye size={16} />
      </button>
      <button
        type="button"
        onClick={() => deleteRecord(record)}
        className="rounded-md p-2 text-white/45 transition hover:bg-white/10 hover:text-red-300"
        title={`Delete ${record.applicant}`}
      >
        <Trash2 size={16} />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 p-2 text-white sm:p-4">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold">Applications</h1>
          <p className="mt-1 text-sm text-white/50">
            Review and manage service requests from all centers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f8740e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ff8a2d]"
        >
          Export Report <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "Total Applications", value: records.length, icon: FileText, iconBg: "bg-blue-500" },
          { label: "Approved", value: records.filter((record) => record.status === "Approved").length, icon: CheckCircle2, iconBg: "bg-emerald-500" },
          { label: "Pending", value: records.filter((record) => record.status === "Pending").length, icon: Clock3, iconBg: "bg-amber-500" },
        ].map((s) => {
          return (
            <div key={s.label} className="flex items-center gap-4 rounded-xl border border-gray-800 bg-[#1a1c23] p-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-lg ${s.iconBg}`}>
                <s.icon size={22} className="text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-gray-400">{s.label}</p>
                <p className="truncate text-3xl font-bold leading-tight text-white">{s.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#11131a]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex w-1/2 min-w-[220px] max-w-xl items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 shadow-inner shadow-black/20">
            <Search size={20} className="shrink-0 text-white/45" />
            <input
              value={query}
              onChange={(event) => {
                setPage(1);
                setQuery(event.target.value);
              }}
              placeholder="Search..."
              className="h-12 w-full bg-transparent text-base text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <select
              value={serviceFilter}
              onChange={(event) => {
                setPage(1);
                setServiceFilter(event.target.value);
              }}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#0d0d12] px-3 text-sm text-white"
            >
              <option>All</option>
              {services.map((service) => (
                <option key={service}>{service}</option>
              ))}
            </select>
            <select
              value={centerFilter}
              onChange={(event) => {
                setPage(1);
                setCenterFilter(event.target.value);
              }}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#0d0d12] px-3 text-sm text-white"
            >
              <option>All</option>
              {centers.map((center) => (
                <option key={center}>{center}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => {
                setPage(1);
                setStatusFilter(event.target.value);
              }}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#0d0d12] px-3 text-sm text-white"
            >
              <option>All</option>
              <option>Approved</option>
              <option>Pending</option>
              <option>Review</option>
            </select>

            <div
              className="flex items-center rounded-lg border border-white/10 bg-white/5 p-1"
              aria-label="Application view mode"
            >
              <button
                type="button"
                onClick={() => setViewMode("table")}
                aria-pressed={viewMode === "table"}
                title="Table view"
                className={`flex h-9 items-center gap-2 rounded-md px-3 text-sm transition ${viewMode === "table" ? "bg-orange-500 text-white" : "text-white/50 hover:text-white"}`}
              >
                <Table2 size={16} />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("card")}
                aria-pressed={viewMode === "card"}
                title="Card view"
                className={`flex h-9 items-center gap-2 rounded-md px-3 text-sm transition ${viewMode === "card" ? "bg-orange-500 text-white" : "text-white/50 hover:text-white"}`}
              >
                <Grid2X2 size={16} />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setApplicationForm((current) => ({
                  ...current,
                  service_id: availableServices[0] ? String(availableServices[0].id) : "",
                }));
                setIsAddOpen(true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#f8740e] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#ff8a2d]"
            >
              <Plus size={16} />
              Add New Application
            </button>
          </div>
        </div>

        <div className="border-b border-white/10 px-4 py-3 md:px-5">
          <h2 className="text-lg font-semibold">Recent Applications</h2>
          <p className="text-sm text-white/55">
            {filteredRecords.length} matching service requests
          </p>
        </div>

        {viewMode === "table" ? (
          <div className="overflow-x-auto">
            <table className="min-w-[760px] w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-gray-400">
                  <th className="px-5 py-3 font-medium">S.No</th>
                  <th className="px-5 py-3 font-medium">Applicant</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Center</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((record, index) => (
                  <tr
                    key={record.id}
                    className="border-b border-gray-800/50 text-gray-300 transition hover:bg-white/[.02]"
                  >
                    <td className="px-5 py-4 text-gray-500 font-medium text-sm">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-orange-500 p-2 text-white">
                          <UserRound size={16} />
                        </div>
                        <span className="font-medium text-white">{record.applicant}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">{record.service}</td>
                    <td className="px-5 py-4">{record.center}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${
                          record.status === 'Approved' ? 'border-green-500/30 bg-green-500/15 text-green-400' :
                          record.status === 'Pending' ? 'border-amber-500/30 bg-amber-500/15 text-amber-400' :
                          'border-sky-500/30 bg-sky-500/15 text-sky-400'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${
                          record.status === 'Approved' ? 'bg-green-400' :
                          record.status === 'Pending' ? 'bg-amber-400' :
                          'bg-sky-400'
                        }`} />
                        {record.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">{record.updatedAt}</td>
                    <td className="px-5 py-4">{renderActions(record)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 p-4 md:grid-cols-2 xl:grid-cols-3">
            {pageRecords.map((record) => (
              <article
                key={record.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:border-orange-500/40"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-orange-500 p-2 text-white">
                      <UserRound size={16} />
                    </div>
                    <div>
                      <h3 className="font-medium text-white">{record.applicant}</h3>
                      <p className="text-xs text-white/45">
                        Application #{record.id}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2.5 py-1 text-xs font-semibold ${
                      record.status === 'Approved' ? 'border-green-500/30 bg-green-500/15 text-green-400' :
                      record.status === 'Pending' ? 'border-amber-500/30 bg-amber-500/15 text-amber-400' :
                      'border-sky-500/30 bg-sky-500/15 text-sky-400'
                    }`}
                  >
                    <span className={`h-1.5 w-1.5 rounded-full ${
                      record.status === 'Approved' ? 'bg-green-400' :
                      record.status === 'Pending' ? 'bg-amber-400' :
                      'bg-sky-400'
                    }`} />
                    {record.status}
                  </span>
                </div>
                <div className="mt-4 space-y-2 border-t border-white/10 pt-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-white/45">Service</span>
                    <span>{record.service}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-white/45">Center</span>
                    <span>{record.center}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-white/45">Updated</span>
                    <span>{record.updatedAt}</span>
                  </div>
                </div>
                <div className="mt-4 border-t border-white/10 pt-3">
                  {renderActions(record)}
                </div>
              </article>
            ))}
          </div>
        )}

        {loading && (
          <p className="px-5 py-12 text-center text-sm text-white/45">Loading applications…</p>
        )}

        {!loading && pageRecords.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-white/45">
            {records.length ? "No applications match your search or filters." : "No applications yet. Select Add New Application to create one."}
          </p>
        )}

        <div className="flex flex-col gap-4 border-t border-white/10 p-4 text-sm text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>
            Showing {rangeStart}–{rangeEnd} of {filteredRecords.length}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2">
              Rows per page
              <select
                value={pageSize}
                onChange={(event) => {
                  setPage(1);
                  setPageSize(Number(event.target.value));
                }}
                className="rounded-md border border-white/10 bg-[#0d0d12] px-2 py-1 text-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </label>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((value) => value - 1)}
                className="rounded-md border border-white/10 p-2 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                title="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: pageCount }, (_, index) => index + 1)
                .slice(0, 5)
                .map((number) => (
                  <button
                    type="button"
                    key={number}
                    onClick={() => setPage(number)}
                    className={`h-8 min-w-8 rounded-md px-2 ${currentPage === number ? "bg-orange-500 text-white" : "border border-white/10 hover:bg-white/5"}`}
                  >
                    {number}
                  </button>
                ))}
              <button
                type="button"
                disabled={currentPage === pageCount}
                onClick={() => setPage((value) => value + 1)}
                className="rounded-md border border-white/10 p-2 hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
                title="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            {isAddOpen && createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-4">
                <form onSubmit={addApplication} className="my-8 w-full max-w-xl space-y-4 rounded-2xl border border-white/10 bg-[#15171e] p-6 shadow-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-white">Add New Application</h2>
                      <p className="mt-1 text-sm text-white/50">Enter applicant and service details.</p>
                    </div>
                    <button type="button" onClick={() => setIsAddOpen(false)} className="rounded-md p-2 text-white/60 hover:bg-white/10" aria-label="Close form"><X size={20} /></button>
                  </div>
                  <label className="block text-sm text-gray-300">Applicant Name *
                    <input required minLength={2} maxLength={150} name="applicant_name" value={applicationForm.applicant_name} onChange={(event) => setApplicationForm({ ...applicationForm, applicant_name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-700 bg-[#0d0d12] px-3 py-2.5 text-white outline-none focus:border-orange-500" />
                  </label>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm text-gray-300">Mobile Number
                      <input type="tel" name="mobile" value={applicationForm.mobile} onChange={(event) => setApplicationForm({ ...applicationForm, mobile: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-700 bg-[#0d0d12] px-3 py-2.5 text-white outline-none focus:border-orange-500" placeholder="Optional" />
                    </label>
                    <label className="block text-sm text-gray-300">Email Address
                      <input type="email" name="email" value={applicationForm.email} onChange={(event) => setApplicationForm({ ...applicationForm, email: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-700 bg-[#0d0d12] px-3 py-2.5 text-white outline-none focus:border-orange-500" placeholder="Optional" />
                    </label>
                  </div>
                  <label className="block text-sm text-gray-300">Service *
                    <select required name="service_id" value={applicationForm.service_id} onChange={(event) => setApplicationForm({ ...applicationForm, service_id: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-700 bg-[#0d0d12] px-3 py-2.5 text-white outline-none focus:border-orange-500">
                      <option value="">Select a service</option>
                      {availableServices.map((service) => <option key={service.id} value={service.id}>{service.service_name} ({service.service_code})</option>)}
                    </select>
                    {!availableServices.length && <span className="mt-1 block text-xs text-amber-400">There are no active services available.</span>}
                  </label>
                  <label className="block text-sm text-gray-300">Center
                    <input maxLength={150} name="center_name" value={applicationForm.center_name} onChange={(event) => setApplicationForm({ ...applicationForm, center_name: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-700 bg-[#0d0d12] px-3 py-2.5 text-white outline-none focus:border-orange-500" placeholder="Optional" />
                  </label>
                  <label className="block text-sm text-gray-300">Notes
                    <textarea maxLength={2000} rows={3} name="notes" value={applicationForm.notes} onChange={(event) => setApplicationForm({ ...applicationForm, notes: event.target.value })} className="mt-1.5 w-full resize-y rounded-lg border border-gray-700 bg-[#0d0d12] px-3 py-2.5 text-white outline-none focus:border-orange-500" placeholder="Optional application notes" />
                  </label>
                  <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                    <button type="button" onClick={() => setIsAddOpen(false)} className="rounded-lg border border-gray-700 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5">Cancel</button>
                    <button type="submit" disabled={isSaving || !availableServices.length} className="rounded-lg bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50">{isSaving ? "Saving…" : "Create Application"}</button>
                  </div>
                </form>
              </div>,
              document.body,
            )}
            {viewingRecord && createPortal(
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
                <section className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#15171e] p-6 shadow-2xl">
                  <div className="flex items-start justify-between">
                    <div><h2 className="text-xl font-semibold text-white">{viewingRecord.applicant}</h2><p className="mt-1 text-sm text-white/50">Application #{viewingRecord.id}</p></div>
                    <button type="button" onClick={() => setViewingRecord(null)} className="rounded-md p-2 text-white/60 hover:bg-white/10" aria-label="Close application details"><X size={20} /></button>
                  </div>
                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between gap-4"><dt className="text-white/50">Service</dt><dd className="text-right text-white">{viewingRecord.service}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-white/50">Center</dt><dd className="text-right text-white">{viewingRecord.center}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-white/50">Mobile</dt><dd className="text-right text-white">{viewingRecord.mobile || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-white/50">Email</dt><dd className="text-right text-white">{viewingRecord.email || "—"}</dd></div>
                    <div className="flex justify-between gap-4"><dt className="text-white/50">Status</dt><dd className="text-right text-white">{viewingRecord.status}</dd></div>
                    <div><dt className="text-white/50">Notes</dt><dd className="mt-1 whitespace-pre-wrap text-white">{viewingRecord.notes || "—"}</dd></div>
                  </dl>
                </section>
              </div>,
              document.body,
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
