import { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FileText,
  Grid2X2,
  Pencil,
  Plus,
  Search,
  SlidersHorizontal,
  Table2,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

const baseApplications = [
  {
    applicant: "Priya Natarajan",
    service: "Senior Care",
    center: "Anna Nagar",
    status: "Approved",
    updatedAt: "2026-07-28",
  },
  {
    applicant: "Karthik Raman",
    service: "Home Nursing",
    center: "Tambaram",
    status: "Pending",
    updatedAt: "2026-07-29",
  },
  {
    applicant: "Malar Venkatesh",
    service: "Physiotherapy",
    center: "T Nagar",
    status: "Review",
    updatedAt: "2026-07-30",
  },
  {
    applicant: "Selvi Murugan",
    service: "Daily Assistance",
    center: "Madhavaram",
    status: "Approved",
    updatedAt: "2026-07-31",
  },
];

const applications = Array.from({ length: 24 }, (_, index) => ({
  ...baseApplications[index % baseApplications.length],
  id: index + 1,
  applicant:
    index < baseApplications.length
      ? baseApplications[index].applicant
      : `${baseApplications[index % baseApplications.length].applicant} ${index + 1}`,
}));

const statusStyles = {
  Approved: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  Pending: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  Review: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
};

const Applications = () => {
  const [records, setRecords] = useState(applications);
  const [query, setQuery] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
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

  const services = [...new Set(records.map((record) => record.service))];
  const centers = [...new Set(records.map((record) => record.center))];
  const hasFilters = Boolean(
    query ||
    statusFilter !== "All" ||
    serviceFilter !== "All" ||
    centerFilter !== "All",
  );

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

  useEffect(
    () => setPage(1),
    [query, statusFilter, serviceFilter, centerFilter, pageSize],
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

  const clearFilters = () => {
    setQuery("");
    setStatusFilter("All");
    setServiceFilter("All");
    setCenterFilter("All");
  };

  const deleteRecord = (id) =>
    setRecords((current) => current.filter((record) => record.id !== id));

  const renderActions = (record) => (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        className="rounded-md p-2 text-white/45 transition hover:bg-white/10 hover:text-white"
        title={`View ${record.applicant}`}
      >
        <Eye size={16} />
      </button>
      <button
        type="button"
        className="rounded-md p-2 text-white/45 transition hover:bg-white/10 hover:text-sky-300"
        title={`Edit ${record.applicant}`}
      >
        <Pencil size={16} />
      </button>
      <button
        type="button"
        onClick={() => deleteRecord(record.id)}
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

      <div className="grid gap-4 md:grid-cols-3">
        {[
          ["Total Applications", "1,248", FileText, "text-blue-400", "+18.6%"],
          ["Approved", "842", CheckCircle2, "text-emerald-400", "+12.1%"],
          ["Pending", "162", Clock3, "text-amber-400", "-4.8%"],
        ].map(([label, value, Icon, tone, change]) => (
          <div
            key={label}
            className="rounded-2xl border border-white/10 bg-[#11131a] p-4 shadow-lg shadow-black/20"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/55">{label}</p>
                <h3 className="mt-2 text-3xl font-bold text-white">{value}</h3>
              </div>
              <div className={`rounded-xl bg-white/5 p-2 ${tone}`}>
                <Icon size={18} />
              </div>
            </div>
            <p className="mt-3 text-xs font-medium text-emerald-300">
              {change} this month
            </p>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#11131a]">
        <div className="flex flex-col gap-3 border-b border-white/10 p-4 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="flex w-1/2 min-w-[220px] max-w-xl items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 shadow-inner shadow-black/20">
            <Search size={20} className="shrink-0 text-white/45" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search..."
              className="h-12 w-full bg-transparent text-base text-white outline-none placeholder:text-white/35"
            />
          </div>

          <div className="ml-auto flex items-center gap-3 md:ml-0">
            <select
              value={serviceFilter}
              onChange={(event) => setServiceFilter(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#0d0d12] px-3 text-sm text-white"
            >
              <option>All</option>
              {services.map((service) => (
                <option key={service}>{service}</option>
              ))}
            </select>
            <select
              value={centerFilter}
              onChange={(event) => setCenterFilter(event.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-[#0d0d12] px-3 text-sm text-white"
            >
              <option>All</option>
              {centers.map((center) => (
                <option key={center}>{center}</option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
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
                <tr className="border-b border-white/10 text-white/50">
                  <th className="px-5 py-3 font-medium">Applicant</th>
                  <th className="px-5 py-3 font-medium">Service</th>
                  <th className="px-5 py-3 font-medium">Center</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Updated</th>
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="border-b border-white/5 text-white/80 transition hover:bg-white/[0.04]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-full bg-white/5 p-2 text-[#f8740e]">
                          <UserRound size={16} />
                        </div>
                        {record.applicant}
                      </div>
                    </td>
                    <td className="px-5 py-4">{record.service}</td>
                    <td className="px-5 py-4">{record.center}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[record.status]}`}
                      >
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
                    <div className="rounded-full bg-white/5 p-2 text-[#f8740e]">
                      <UserRound size={16} />
                    </div>
                    <div>
                      <h3 className="font-medium">{record.applicant}</h3>
                      <p className="text-xs text-white/45">
                        Application #{record.id}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[record.status]}`}
                  >
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

        {pageRecords.length === 0 && (
          <p className="px-5 py-12 text-center text-sm text-white/45">
            No applications match your search or filters.
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
                onChange={(event) => setPageSize(Number(event.target.value))}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default Applications;
