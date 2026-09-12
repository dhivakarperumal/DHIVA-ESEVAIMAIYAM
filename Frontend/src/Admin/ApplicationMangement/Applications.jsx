import { FileText, CheckCircle2, Clock3, UserRound, ArrowUpRight } from "lucide-react";

const applicationStats = [
  { label: "Total Applications", value: "1,248", change: "+18.6%", icon: FileText, tone: "text-blue-400" },
  { label: "Approved", value: "842", change: "+12.1%", icon: CheckCircle2, tone: "text-emerald-400" },
  { label: "Pending", value: "162", change: "-4.8%", icon: Clock3, tone: "text-amber-400" },
];

const applications = [
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

const statusStyles = {
  Approved: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  Pending: "bg-amber-500/15 text-amber-300 border border-amber-500/30",
  Review: "bg-sky-500/15 text-sky-300 border border-sky-500/30",
};

const Applications = () => {
  return (
    <div className="space-y-6 p-4 md:p-6">
      <div className="grid gap-4 md:grid-cols-3">
        {applicationStats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-white/10 bg-[#11131a] p-4 shadow-lg shadow-black/20">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-white/55">{item.label}</p>
                  <h3 className="mt-2 text-3xl font-bold text-white">{item.value}</h3>
                </div>
                <div className={`rounded-xl bg-white/5 p-2 ${item.tone}`}>
                  <Icon size={18} />
                </div>
              </div>
              <p className="mt-3 text-xs font-medium text-emerald-300">{item.change} this month</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#11131a] p-4 md:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-white">Recent Applications</h2>
            <p className="text-sm text-white/55">Latest service requests submitted by members</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-xl bg-[#f8740e] px-3 py-2 text-sm font-semibold text-white hover:bg-[#ff8a2d]">
            Export Report
            <ArrowUpRight size={16} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="border-b border-white/10 text-white/50">
                <th className="px-3 py-3 font-medium">Applicant</th>
                <th className="px-3 py-3 font-medium">Service</th>
                <th className="px-3 py-3 font-medium">Center</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Updated</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((application) => (
                <tr key={`${application.applicant}-${application.updatedAt}`} className="border-b border-white/5 text-white/80">
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-white/5 p-2 text-[#f8740e]">
                        <UserRound size={16} />
                      </div>
                      <span>{application.applicant}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3">{application.service}</td>
                  <td className="px-3 py-3">{application.center}</td>
                  <td className="px-3 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[application.status]}`}>
                      {application.status}
                    </span>
                  </td>
                  <td className="px-3 py-3">{application.updatedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Applications;
