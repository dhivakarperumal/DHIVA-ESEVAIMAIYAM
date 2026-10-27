import { useEffect, useState } from "react";
import {
  ArrowRight,
  Check,
  CircleHelp,
  Clock3,
  FileCheck2,
  FileSearch,
  Fingerprint,
  LockKeyhole,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "../../api";
import PageContainer from "../CommonComponents/PageContainer";

const statusSteps = [
  "Submitted",
  "Documents Under Verification",
  "Pending Approval",
  "Approved",
  "Ready for Collection",
];

const previewStatuses = [
  "Application Submitted",
  "Documents Under Verification",
  "Pending Approval",
  "Approved",
  "Ready for Collection",
];

const statusOrder = {
  Submitted: 0,
  "Application Submitted": 0,
  "Documents Under Verification": 1,
  "Pending Additional Documents": 1,
  "Pending Payment": 1,
  "Pending Approval": 2,
  Approved: 3,
  "Certificate Generated": 4,
  "Ready for Collection": 4,
  "Ready for Delivery": 4,
  Delivered: 4,
  Completed: 4,
};

const faqItems = [
  {
    question: "What details are required to track an application?",
    answer:
      "Enter the application number and the mobile number used when applying. You can also choose the service and application date to narrow the search.",
  },
  {
    question: "Can I track applications for multiple services?",
    answer:
      "Yes. Track each application separately using its application number and the mobile number registered for that application.",
  },
  {
    question: "Why is my application status not available?",
    answer:
      "Check that the application number and mobile number match your submitted application. If the details are correct and the status is still unavailable, contact our team for assistance.",
  },
  {
    question: "How long does it take to get the certificate?",
    answer:
      "Processing time depends on the service and the relevant government department. We can help you understand the latest status and next steps.",
  },
  {
    question: "Can I get updates on my mobile number?",
    answer:
      "Use the mobile number associated with your application to securely check its latest status here.",
  },
];

const formatDate = (value) => {
  if (!value) return "Date unavailable";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Date unavailable"
    : date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
};

const TrackApplicationPage = () => {
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({
    application_number: "",
    mobile: "",
    service_id: "",
    application_date: "",
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [recentApplications, setRecentApplications] = useState([]);

  useEffect(() => {
    let active = true;
    api
      .get("/services")
      .then(({ data }) => {
        if (active) setServices(data.data || []);
      })
      .catch(() => {
        if (active) setServicesError("Service list is temporarily unavailable.");
      });
    return () => {
      active = false;
    };
  }, []);

  const updateForm = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const payload = {
        application_number: form.application_number.trim(),
        mobile: form.mobile.trim(),
      };
      if (form.service_id) payload.service_id = Number(form.service_id);
      if (form.application_date) payload.application_date = form.application_date;

      const { data } = await api.post("/applications/track", payload);
      setResult(data.data);
      setRecentApplications((current) => [
        data.data,
        ...current.filter(
          (application) =>
            application.application_number !== data.data.application_number,
        ),
      ].slice(0, 5));
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "We could not check your application right now. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const currentStep = result ? (statusOrder[result.status] ?? 0) : -1;

  return (
    <main className="min-h-screen bg-[#080a0d] text-white">
      <PageContainer className="py-7 sm:py-9">
        <section className="rounded-2xl border border-primary/50 bg-gradient-to-br from-[#111315] to-[#080a0c] p-4 shadow-[0_16px_45px_rgba(0,0,0,0.3)] sm:p-6">
          <div className="mb-5 flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <FileSearch size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold sm:text-xl">Track Application Status</h2>
              <p className="text-xs text-slate-400 sm:text-sm">
                Your application number and registered mobile number are required.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <label className="block text-xs font-medium text-slate-300">
              Application number <span className="text-primary">*</span>
              <span className="mt-1.5 flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-black/40 px-3 focus-within:border-primary">
                <FileCheck2 size={17} className="shrink-0 text-primary" />
                <input
                  name="application_number"
                  value={form.application_number}
                  onChange={updateForm}
                  placeholder="e.g. APP-00000001"
                  autoComplete="off"
                  required
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </span>
            </label>

            <label className="block text-xs font-medium text-slate-300">
              Registered mobile number <span className="text-primary">*</span>
              <span className="mt-1.5 flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-black/40 px-3 focus-within:border-primary">
                <Fingerprint size={17} className="shrink-0 text-primary" />
                <input
                  name="mobile"
                  type="tel"
                  value={form.mobile}
                  onChange={updateForm}
                  placeholder="Mobile number used to apply"
                  autoComplete="tel"
                  required
                  minLength={7}
                  maxLength={20}
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                />
              </span>
            </label>

            <label className="block text-xs font-medium text-slate-300">
              Service <span className="text-slate-500">(optional)</span>
              <span className="mt-1.5 flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-black/40 px-3 focus-within:border-primary">
                <FileCheck2 size={17} className="shrink-0 text-primary" />
                <select
                  name="service_id"
                  value={form.service_id}
                  onChange={updateForm}
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none"
                >
                  <option value="" className="bg-[#111315]">All services</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id} className="bg-[#111315]">
                      {service.service_name}
                    </option>
                  ))}
                </select>
              </span>
              {servicesError && <span className="mt-1 block text-[11px] text-amber-300">{servicesError}</span>}
            </label>

            <label className="block text-xs font-medium text-slate-300">
              Application date <span className="text-slate-500">(optional)</span>
              <span className="mt-1.5 flex h-11 items-center gap-2 rounded-lg border border-white/15 bg-black/40 px-3 focus-within:border-primary">
                <Clock3 size={17} className="shrink-0 text-primary" />
                <input
                  name="application_date"
                  type="date"
                  value={form.application_date}
                  onChange={updateForm}
                  className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none [color-scheme:dark]"
                />
              </span>
            </label>

            <div className="sm:col-span-2 xl:col-span-4">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
              >
                <Search size={17} />
                {loading ? "Checking..." : "Track Now"}
              </button>
            </div>
          </form>

          {error && (
            <div role="alert" className="mt-4 rounded-lg border border-red-500/40 bg-red-950/30 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {result && (
            <section aria-live="polite" className="mt-6 rounded-xl border border-primary/30 bg-black/30 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary">Application status</p>
                  <h3 className="mt-1 text-xl font-bold">{result.status}</h3>
                  <p className="mt-1 text-sm text-slate-400">
                    {result.service_name} · {result.application_number}
                  </p>
                </div>
                <span className="rounded-full border border-primary/40 bg-primary/15 px-3 py-1 text-xs font-semibold text-orange-200">
                  Updated {formatDate(result.updated_at)}
                </span>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-5">
                {statusSteps.map((step, index) => {
                  const completed = index < currentStep;
                  const current = index === currentStep;
                  return (
                    <div key={step} className="flex items-start gap-2 sm:flex-col sm:items-center sm:text-center">
                      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${
                        completed || current
                          ? "border-primary bg-primary text-white"
                          : "border-white/20 bg-white/5 text-slate-500"
                      }`}>
                        {completed ? <Check size={18} /> : <span className="text-xs font-bold">{String(index + 1).padStart(2, "0")}</span>}
                      </span>
                      <span className={`pt-1 text-xs leading-5 ${current ? "font-semibold text-primary" : "text-slate-400"}`}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              <ol className="mt-5 space-y-3 border-t border-white/10 pt-4">
                {result.timeline.map((event, index) => (
                  <li key={`${event.status}-${event.created_at}-${index}`} className="flex gap-3 text-sm">
                    <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                    <span className="flex flex-1 flex-wrap justify-between gap-x-4 gap-y-1">
                      <strong className="font-medium text-slate-200">{event.status}</strong>
                      <time className="text-xs text-slate-500">{formatDate(event.created_at)}</time>
                    </span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-xs leading-5 text-slate-500">
                This page shows updates recorded by DHIVA E-SEVAI MAIYAM. For
                official government decisions, please refer to the relevant department.
              </p>
            </section>
          )}
        </section>

        <section
          aria-labelledby="sample-status-title"
          className="mt-5 rounded-xl border border-white/10 bg-[#101215] p-4 sm:p-5"
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h2 id="sample-status-title" className="text-base font-bold sm:text-lg">
                Sample Application Status
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                Example of the steps an application may go through. This is not a live application.
              </p>
            </div>
            <span className="rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[11px] font-medium text-orange-200">
              Example only
            </span>
          </div>
          <ol className="mt-5 grid gap-4 sm:grid-cols-5">
            {previewStatuses.map((status, index) => {
              const isComplete = index < 2;
              const isCurrent = index === 2;
              return (
                <li key={status} className="flex items-center gap-3 sm:flex-col sm:gap-2 sm:text-center">
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border ${
                      isComplete
                        ? "border-emerald-500 bg-emerald-500/15 text-emerald-400"
                        : isCurrent
                          ? "border-primary bg-primary/15 text-primary"
                          : "border-white/20 bg-white/5 text-slate-500"
                    }`}
                  >
                    {isComplete ? <Check size={19} /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </span>
                  <span className={`text-xs leading-5 ${isCurrent ? "font-semibold text-primary" : "text-slate-400"}`}>
                    {status}
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <section aria-label="Tracking benefits" className="grid gap-3 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { title: "Real-time status", text: "See the latest update recorded for your application.", Icon: Clock3 },
            { title: "Secure lookup", text: "Your registered mobile number helps verify your request.", Icon: LockKeyhole },
            { title: "Clear information", text: "View the service and status history in one place.", Icon: FileCheck2 },
            { title: "Friendly support", text: "Contact our team if you need help understanding an update.", Icon: ShieldCheck },
          ].map(({ title, text, Icon }) => (
            <article key={title} className="flex gap-3 rounded-xl border border-white/10 bg-[#101215] p-4">
              <Icon className="mt-0.5 shrink-0 text-primary" size={22} />
              <div>
                <h2 className="text-sm font-bold">{title}</h2>
                <p className="mt-1 text-xs leading-5 text-slate-400">{text}</p>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="overflow-hidden rounded-xl border border-white/10 bg-[#101215]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4 sm:px-5">
              <div>
                <h2 className="text-base font-bold sm:text-lg">Recent Applications</h2>
                <p className="mt-1 text-xs text-slate-400">
                  Applications you looked up in this browser session.
                </p>
              </div>
              <span className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 text-xs font-semibold text-orange-200">
                {recentApplications.length}
              </span>
            </div>
            {recentApplications.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-left text-xs">
                  <thead className="bg-black/20 text-slate-400">
                    <tr>
                      <th className="px-4 py-3 font-medium">Service</th>
                      <th className="px-4 py-3 font-medium">Application No.</th>
                      <th className="px-4 py-3 font-medium">Last Updated</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {recentApplications.map((application) => (
                      <tr key={application.application_number}>
                        <td className="px-4 py-3 text-slate-200">{application.service_name}</td>
                        <td className="px-4 py-3 text-slate-400">{application.application_number}</td>
                        <td className="px-4 py-3 text-slate-400">{formatDate(application.updated_at)}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full border border-primary/30 bg-primary/10 px-2.5 py-1 font-medium text-orange-200">
                            {application.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex min-h-36 flex-col items-center justify-center px-5 py-8 text-center">
                <FileSearch size={25} className="text-primary" />
                <p className="mt-3 text-sm font-medium text-slate-200">No tracked applications yet</p>
                <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
                  After you successfully check an application, it will appear here for this session.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-white/10 bg-[#101215] p-4 sm:p-5">
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <CircleHelp size={20} className="text-primary" />
              Track Application – FAQs
            </h2>
            <div className="mt-3 divide-y divide-white/10">
              {faqItems.map(({ question, answer }) => (
                <details key={question} className="group py-3">
                  <summary className="cursor-pointer list-none text-sm font-medium text-slate-200 marker:hidden">
                    <span className="flex items-center justify-between gap-3">
                      {question}
                      <span className="text-lg text-primary transition group-open:rotate-45">+</span>
                    </span>
                  </summary>
                  <p className="mt-2 pr-6 text-xs leading-5 text-slate-400">{answer}</p>
                </details>
              ))}
            </div>
          </div>

        </section>

        <aside className="mt-5 grid items-center gap-5 overflow-hidden rounded-xl border border-primary/40 bg-gradient-to-r from-[#21160e] to-[#0e1012] p-5 sm:p-6 md:grid-cols-[1fr_auto]">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <ShieldCheck size={27} />
            </span>
            <div>
              <h2 className="text-lg font-black sm:text-xl">Need help tracking your application?</h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-300">
                Our team can help you check your details and understand the latest update.
              </p>
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition hover:bg-orange-500"
          >
            Contact Us <ArrowRight size={16} />
          </Link>
        </aside>
      </PageContainer>
    </main>
  );
};

export default TrackApplicationPage;
