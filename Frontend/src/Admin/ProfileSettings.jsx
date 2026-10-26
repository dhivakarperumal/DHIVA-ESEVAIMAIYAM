import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, ChevronRight, Mail, Phone, ShieldCheck, UserRound } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../api';
import { useAuth } from '../PrivateRouter/AuthContext';

const getInitials = (name = '') =>
  name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('') || 'A';

const formatDate = (value) => {
  if (!value) return 'Not available';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Not available'
    : new Intl.DateTimeFormat(undefined, { month: 'long', year: 'numeric' }).format(date);
};

const inputClass = 'w-full rounded-xl border border-white/10 bg-[#111218] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-orange-500/70 focus:ring-2 focus:ring-orange-500/15';

export default function ProfileSettings() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState(() => ({
    username: user?.username || user?.name || '',
    email: user?.email || '',
    mobile: user?.mobile || user?.phone || '',
  }));
  const [saving, setSaving] = useState(false);

  const initials = useMemo(() => getInitials(form.username), [form.username]);

  const saveProfile = async (event) => {
    event.preventDefault();
    if (!user?.user_id) {
      toast.error('Your account could not be identified. Please sign in again.');
      return;
    }

    setSaving(true);
    try {
      const { data } = await api.put(`/users/${user.user_id}`, {
        username: form.username.trim(),
        email: form.email.trim(),
        mobile: form.mobile.trim() || null,
      });
      setUser(data.user);
      localStorage.setItem('user', JSON.stringify(data.user));
      setForm({
        username: data.user.username || '',
        email: data.user.email || '',
        mobile: data.user.mobile || '',
      });
      toast.success('Profile updated successfully.');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to update your profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-1 py-4 text-white sm:px-2 sm:py-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-xs text-white/45">
            <Link to="/admin" className="transition hover:text-white">Dashboard</Link>
            <ChevronRight size={13} />
            <span>Settings</span>
            <ChevronRight size={13} />
            <span className="text-white/75">Profile</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Profile settings</h1>
          <p className="mt-1 text-sm text-white/55">Manage the personal details connected to your admin account.</p>
        </div>
        <Link to="/admin" className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm text-white/70 transition hover:border-white/20 hover:text-white">
          <ArrowLeft size={16} /> Back to dashboard
        </Link>
      </div>

      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#24202a] via-[#191a22] to-[#13141a] p-5 shadow-xl shadow-black/10 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-orange-300/20 bg-gradient-to-br from-orange-400 to-orange-700 text-xl font-bold text-white shadow-lg shadow-orange-950/30 sm:h-20 sm:w-20 sm:text-2xl">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Admin profile</p>
              <h2 className="mt-1 truncate text-xl font-bold sm:text-2xl">{form.username || 'Admin account'}</h2>
              <p className="mt-1 truncate text-sm text-white/55">{form.email || 'No email address added'}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 sm:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-xs font-medium text-blue-200">
              <ShieldCheck size={14} /> {user?.role || 'Admin'}
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
              user?.status === 'Inactive'
                ? 'border-red-400/20 bg-red-400/10 text-red-200'
                : 'border-emerald-400/20 bg-emerald-400/10 text-emerald-200'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${user?.status === 'Inactive' ? 'bg-red-300' : 'bg-emerald-300'}`} />
              {user?.status || 'Active'}
            </span>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.7fr)]">
        <aside className="space-y-5">
          <section className="rounded-2xl border border-white/10 bg-[#1a1b23] p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10 text-orange-400">
                <UserRound size={19} />
              </div>
              <div>
                <h3 className="font-semibold">Account overview</h3>
                <p className="text-xs text-white/45">Your account at a glance</p>
              </div>
            </div>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs text-white/45">Account ID</dt>
                <dd className="mt-1 break-all font-mono text-xs text-white/80">{user?.user_id || 'Not available'}</dd>
              </div>
              <div className="border-t border-white/[0.07] pt-4">
                <dt className="text-xs text-white/45">Member since</dt>
                <dd className="mt-1 text-sm text-white/85">{formatDate(user?.created_at)}</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-2xl border border-white/10 bg-[#1a1b23] p-5 sm:p-6">
            <h3 className="font-semibold">Contact details</h3>
            <p className="mt-1 text-xs text-white/45">How to reach you</p>
            <div className="mt-5 space-y-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/60"><Mail size={16} /></span>
                <div className="min-w-0">
                  <p className="text-[11px] text-white/40">Email</p>
                  <p className="truncate text-sm text-white/80">{form.email || 'Not provided'}</p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/60"><Phone size={16} /></span>
                <div className="min-w-0">
                  <p className="text-[11px] text-white/40">Mobile</p>
                  <p className="truncate text-sm text-white/80">{form.mobile || 'Not provided'}</p>
                </div>
              </div>
            </div>
          </section>
        </aside>

        <section className="rounded-2xl border border-white/10 bg-[#1a1b23] p-5 sm:p-7">
          <div className="mb-6 border-b border-white/[0.07] pb-5">
            <h3 className="text-lg font-semibold">Personal information</h3>
            <p className="mt-1 text-sm text-white/45">Update the details shown across your admin portal.</p>
          </div>
          <form onSubmit={saveProfile} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/80">Full name <span className="text-orange-400">*</span></span>
              <input
                className={inputClass}
                name="username"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
                autoComplete="name"
                minLength={2}
                maxLength={100}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/80">Email address <span className="text-orange-400">*</span></span>
              <input
                className={inputClass}
                type="email"
                name="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                autoComplete="email"
                maxLength={255}
                required
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-medium text-white/80">Mobile number</span>
              <input
                className={inputClass}
                type="tel"
                name="mobile"
                value={form.mobile}
                onChange={(event) => setForm((current) => ({ ...current, mobile: event.target.value }))}
                autoComplete="tel"
                maxLength={20}
                placeholder="Add a contact number"
              />
            </label>
            <div className="flex flex-col-reverse gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setForm({
                  username: user?.username || user?.name || '',
                  email: user?.email || '',
                  mobile: user?.mobile || user?.phone || '',
                })}
                className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-white/70 transition hover:bg-white/[0.04] hover:text-white"
              >
                Discard changes
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-950/20 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Check size={17} /> {saving ? 'Saving...' : 'Save changes'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
