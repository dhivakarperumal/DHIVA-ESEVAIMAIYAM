import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  FileText,
  KeyRound,
  LogOut,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useAuth } from "../../PrivateRouter/AuthContext";
import PageContainer from "../CommonComponents/PageContainer";
import api from "../../api";

const accountTabs = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "applications", label: "My Application", icon: FileText },
  { id: "track", label: "Track Application", icon: FileText },
  { id: "address", label: "Address Details", icon: MapPin },
  { id: "password", label: "Change Password", icon: KeyRound },
];

const formatDate = (value) => {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? "Not available"
    : new Intl.DateTimeFormat(undefined, {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(date);
};

export default function MyAccount() {
  const { user, profileName, role, email, phone, logout } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [trackingForm, setTrackingForm] = useState({
    application_number: "",
    mobile: user?.mobile || phone || "",
  });
  const [trackedApplication, setTrackedApplication] = useState(null);
  const [trackingError, setTrackingError] = useState("");
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [applications, setApplications] = useState([]);
  const [applicationsError, setApplicationsError] = useState("");
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const navigate = useNavigate();
  const name = profileName || user?.username || user?.name || "User";
  const initial = name.trim().charAt(0).toUpperCase() || "U";
  const mobile = user?.mobile || phone;

  const handleSelectTab = (tabId) => {
    setActiveTab(tabId);
    if (tabId !== "applications") return;

    setApplicationsLoading(true);
    setApplicationsError("");
    api.get("/applications/my")
      .then(({ data }) => {
        setApplications(data.data || []);
      })
      .catch((error) => {
        setApplicationsError(
          error.response?.data?.message || "Unable to load your applications right now.",
        );
      })
      .finally(() => {
        setApplicationsLoading(false);
      });
  };

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
    setPasswordError("");
    setPasswordMessage("");

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      const { data } = await api.post("/users/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordMessage(data.message || "Password changed successfully.");
    } catch (error) {
      setPasswordError(error.response?.data?.message || "Unable to change your password. Please try again.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleTrackApplication = async (event) => {
    event.preventDefault();
    setTrackingError("");
    setTrackedApplication(null);
    setTrackingLoading(true);

    try {
      const { data } = await api.post("/applications/track", {
        application_number: trackingForm.application_number.trim(),
        mobile: trackingForm.mobile.trim(),
      });
      setTrackedApplication(data.data);
    } catch (error) {
      setTrackingError(
        error.response?.data?.message ||
          "Unable to check this application right now. Please try again.",
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  const details = [
    { label: "Username", value: user?.username || user?.name || name, icon: UserRound },
    { label: "Email address", value: email || "Not provided", icon: Mail },
    { label: "Mobile number", value: mobile || "Not provided", icon: Phone },
    { label: "Account role", value: role || "User", icon: ShieldCheck },
    { label: "Member since", value: formatDate(user?.created_at), icon: CalendarDays },
  ];

  return (
    <main className="min-h-[65vh] bg-[#080b10] py-10 text-white sm:py-14">
      <PageContainer>
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Account</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">My Account</h1>
          <p className="mt-2 text-sm text-white/55">View the details associated with your account.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)]">
          <aside className="h-fit rounded-2xl border border-white/10 bg-[#10151d] p-3">
            <div className="flex items-center gap-3 border-b border-white/10 px-3 py-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary/15 font-bold text-primary">
                {initial}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{name}</p>
                <p className="truncate text-xs text-white/45">{email || role || "Account"}</p>
              </div>
            </div>

            <nav aria-label="Account sections" className="mt-3 space-y-1">
              {accountTabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  aria-current={activeTab === id ? "page" : undefined}
                  onClick={() => handleSelectTab(id)}
                  className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm transition ${
                    activeTab === id
                      ? "bg-primary/15 font-semibold text-primary"
                      : "text-white/65 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Icon size={17} />
                  {label}
                </button>
              ))}
              <div className="my-2 border-t border-white/10" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm text-red-300 transition hover:bg-red-500/10"
              >
                <LogOut size={17} />
                Logout
              </button>
            </nav>
          </aside>

          <section className="min-h-80 rounded-2xl border border-white/10 bg-[#10151d] p-5 shadow-xl shadow-black/20 sm:p-7">
            {activeTab === "profile" && (
              <>
                <div className="mb-6 border-b border-white/10 pb-5">
                  <h2 className="text-xl font-semibold">Profile</h2>
                  <p className="mt-1 text-sm text-white/50">Your account information.</p>
                </div>
                <div className="mb-6 flex flex-wrap items-center gap-4 rounded-xl bg-gradient-to-r from-primary/10 to-transparent p-4">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary/30 bg-primary/15 text-xl font-bold text-primary">
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold">{name}</h3>
                    <p className="truncate text-sm text-white/50">{email || "No email address provided"}</p>
                  </div>
                  <span className="ml-auto inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
                    <ShieldCheck size={14} />
                    {role || "User"}
                  </span>
                </div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  {details.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex min-w-0 items-start gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-primary">
                        <Icon size={17} />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-xs text-white/45">{label}</dt>
                        <dd className="mt-1 break-words text-sm font-medium text-white/90">{value}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </>
            )}

            {activeTab === "applications" && (
              <div>
                <div className="mb-6 border-b border-white/10 pb-5">
                  <h2 className="text-xl font-semibold">My Application</h2>
                  <p className="mt-1 text-sm text-white/50">Applications submitted with your registered mobile number.</p>
                </div>
                {applicationsLoading ? (
                  <p role="status" className="py-10 text-center text-sm text-white/55">Loading your applications...</p>
                ) : applicationsError ? (
                  <p role="alert" className="rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    {applicationsError}
                  </p>
                ) : applications.length ? (
                  <div className="overflow-x-auto rounded-xl border border-white/10">
                    <table className="w-full min-w-[600px] text-left text-sm">
                      <thead className="bg-white/[0.04] text-xs text-white/55">
                        <tr>
                          <th className="px-4 py-3 font-medium">Application No.</th>
                          <th className="px-4 py-3 font-medium">Service</th>
                          <th className="px-4 py-3 font-medium">Applied Date</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Last Updated</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/[0.07]">
                        {applications.map((application) => (
                          <tr key={application.application_number} className="bg-[#10151d]">
                            <td className="px-4 py-3 font-medium text-white/90">{application.application_number}</td>
                            <td className="px-4 py-3 text-white/75">{application.service_name}</td>
                            <td className="px-4 py-3 text-white/55">{formatDate(application.created_at)}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                {application.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-white/55">{formatDate(application.updated_at)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-10 text-center">
                    <FileText size={26} className="mx-auto text-primary" />
                    <p className="mt-3 text-sm font-medium text-white/85">No applications found</p>
                    <p className="mt-1 text-xs text-white/50">Applications submitted with your account mobile number will appear here.</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "track" && (
              <div>
                <div className="mb-6 border-b border-white/10 pb-5">
                  <h2 className="text-xl font-semibold">Track Application</h2>
                  <p className="mt-1 text-sm text-white/50">
                    Enter your application number and registered mobile number to view its current status and history.
                  </p>
                </div>

                <form onSubmit={handleTrackApplication} className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-white/80">
                    Application number
                    <input
                      name="application_number"
                      value={trackingForm.application_number}
                      onChange={(event) => setTrackingForm((form) => ({ ...form, application_number: event.target.value }))}
                      placeholder="e.g. APP-00000001"
                      autoComplete="off"
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
                    />
                  </label>
                  <label className="block text-sm font-medium text-white/80">
                    Registered mobile number
                    <input
                      name="mobile"
                      type="tel"
                      value={trackingForm.mobile}
                      onChange={(event) => setTrackingForm((form) => ({ ...form, mobile: event.target.value }))}
                      placeholder="Mobile number used to apply"
                      autoComplete="tel"
                      minLength={7}
                      maxLength={20}
                      required
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
                    />
                  </label>
                  <div className="sm:col-span-2">
                    <button
                      type="submit"
                      disabled={trackingLoading}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Search size={16} />
                      {trackingLoading ? "Checking..." : "Track Application"}
                    </button>
                  </div>
                </form>

                {trackingError && (
                  <p role="alert" className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                    {trackingError}
                  </p>
                )}

                {trackedApplication && (
                  <div className="mt-6 space-y-5" aria-live="polite">
                    <section className="rounded-xl border border-primary/25 bg-primary/5 p-4 sm:p-5">
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary">Current application status</p>
                          <h3 className="mt-2 text-xl font-bold text-white">{trackedApplication.status}</h3>
                          <p className="mt-1 text-sm text-white/55">
                            {trackedApplication.service_name} · {trackedApplication.application_number}
                          </p>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xs text-white/45">Last updated</p>
                          <p className="mt-1 text-sm font-medium text-white/85">{formatDate(trackedApplication.updated_at)}</p>
                        </div>
                      </div>
                    </section>

                    <section className="overflow-hidden rounded-xl border border-white/10">
                      <div className="border-b border-white/10 px-4 py-3">
                        <h3 className="text-sm font-semibold text-white">Application status history</h3>
                      </div>
                      {trackedApplication.timeline?.length ? (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[420px] text-left text-sm">
                            <thead className="bg-white/[0.03] text-xs text-white/45">
                              <tr>
                                <th className="px-4 py-3 font-medium">#</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium">Date</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/[0.07]">
                              {trackedApplication.timeline.map((event, index) => (
                                <tr key={`${event.status}-${event.created_at}-${index}`}>
                                  <td className="px-4 py-3 text-white/45">{index + 1}</td>
                                  <td className="px-4 py-3 font-medium text-white/85">{event.status}</td>
                                  <td className="px-4 py-3 text-white/55">{formatDate(event.created_at)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="px-4 py-5 text-sm text-white/50">No status history is available yet.</p>
                      )}
                    </section>
                  </div>
                )}
              </div>
            )}

            {activeTab === "address" && (
              <div className="flex min-h-64 flex-col items-start justify-center">
                <MapPin size={28} className="text-primary" />
                <h2 className="mt-4 text-xl font-semibold">Address Details</h2>
                <p className="mt-2 max-w-lg text-sm leading-6 text-white/55">
                  {user?.address || "There is no address saved to this account yet. Contact us if you need help updating your details."}
                </p>
                <Link to="/contact" className="mt-5 rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/5">
                  Contact Us
                </Link>
              </div>
            )}

            {activeTab === "password" && (
              <div>
                <div className="mb-6 border-b border-white/10 pb-5">
                  <h2 className="text-xl font-semibold">Change Password</h2>
                  <p className="mt-1 text-sm text-white/50">Enter your current password and choose a new one.</p>
                </div>
                <form onSubmit={handlePasswordChange} className="max-w-xl space-y-5">
                  <label className="block text-sm font-medium text-white/80">
                    Current password
                    <input
                      type="password"
                      autoComplete="current-password"
                      required
                      value={passwordForm.currentPassword}
                      onChange={(event) => setPasswordForm((form) => ({ ...form, currentPassword: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
                    />
                  </label>
                  <label className="block text-sm font-medium text-white/80">
                    New password
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={255}
                      value={passwordForm.newPassword}
                      onChange={(event) => setPasswordForm((form) => ({ ...form, newPassword: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
                    />
                    <span className="mt-1 block text-xs text-white/40">Use at least 8 characters.</span>
                  </label>
                  <label className="block text-sm font-medium text-white/80">
                    Confirm new password
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                      maxLength={255}
                      value={passwordForm.confirmPassword}
                      onChange={(event) => setPasswordForm((form) => ({ ...form, confirmPassword: event.target.value }))}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-[#080b10] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-primary"
                    />
                  </label>
                  {passwordError && <p role="alert" className="text-sm text-red-300">{passwordError}</p>}
                  {passwordMessage && <p role="status" className="text-sm text-emerald-300">{passwordMessage}</p>}
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <KeyRound size={16} />
                    {passwordSaving ? "Changing password..." : "Change Password"}
                  </button>
                </form>
              </div>
            )}
          </section>
        </div>
      </PageContainer>
    </main>
  );
}
