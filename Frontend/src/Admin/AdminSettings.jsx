import { Link } from 'react-router-dom';
import {
  ArrowRight, Bell, ChevronRight, LockKeyhole,
  ClipboardList, Settings2, ShieldCheck, SlidersHorizontal, UserRound,
} from 'lucide-react';
import { useAuth } from '../PrivateRouter/AuthContext';

const settingGroups = [
  {
    title: 'Your account',
    description: 'Keep your identity and contact information up to date.',
    items: [
      {
        title: 'Profile information',
        description: 'Edit your name, email address, and mobile number.',
        icon: UserRound,
        iconClass: 'bg-orange-500/10 text-orange-300',
        to: '/admin/settings/profile',
        action: 'Manage profile',
      },
      {
        title: 'Account access',
        description: 'Review administrator accounts and their access status.',
        icon: LockKeyhole,
        iconClass: 'bg-blue-500/10 text-blue-300',
        to: '/admin/user-management',
        action: 'Manage users',
      },
    ],
  },
  {
    title: 'Admin workspace',
    description: 'Shortcuts to the areas you manage most.',
    items: [
      {
        title: 'Service setup',
        description: 'Update service listings, categories, and charges.',
        icon: SlidersHorizontal,
        iconClass: 'bg-violet-500/10 text-violet-300',
        to: '/admin/service-management/all',
        action: 'Manage services',
      },
      {
        title: 'Application tracking',
        description: 'Review incoming applications and follow their progress.',
        icon: ClipboardList,
        iconClass: 'bg-emerald-500/10 text-emerald-300',
        to: '/admin/applications',
        action: 'View applications',
      },
    ],
  },
];

export default function AdminSettings() {
  const { profileName, role, email } = useAuth();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-7 px-1 py-4 text-white sm:px-2 sm:py-6">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs text-white/45">
          <Link to="/admin" className="transition hover:text-white">Dashboard</Link>
          <ChevronRight size={13} />
          <span className="text-white/75">Settings</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-white/55">Manage your account and find the tools for your admin workspace.</p>
      </div>

      <section className="relative isolate overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#24202a] via-[#191a22] to-[#13141a] p-5 shadow-xl shadow-black/10 sm:p-8">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-orange-300/20 bg-orange-500/15 text-orange-300">
              <Settings2 size={25} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">Admin workspace</p>
              <h2 className="mt-1 truncate text-xl font-bold sm:text-2xl">Good to see you, {profileName || 'Admin'}</h2>
              <p className="mt-1 truncate text-sm text-white/55">{email || 'Manage your admin account and workspace.'}</p>
            </div>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
            <ShieldCheck size={15} /> {role || 'Admin'} access
          </div>
        </div>
      </section>

      {settingGroups.map((group) => (
        <section key={group.title} aria-labelledby={`settings-${group.title.replaceAll(' ', '-')}`}>
          <div className="mb-4">
            <h2 id={`settings-${group.title.replaceAll(' ', '-')}`} className="text-base font-semibold">{group.title}</h2>
            <p className="mt-1 text-sm text-white/45">{group.description}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.items.map(({ title, description, icon: Icon, iconClass, to, action }) => (
              <Link
                key={title}
                to={to}
                className="group flex min-h-40 flex-col rounded-2xl border border-white/10 bg-[#1a1b23] p-5 transition hover:-translate-y-0.5 hover:border-orange-400/30 hover:bg-[#1d1e27] hover:shadow-lg hover:shadow-black/10 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconClass}`}>
                    <Icon size={20} />
                  </span>
                  <ArrowRight size={17} className="mt-1 text-white/25 transition group-hover:translate-x-1 group-hover:text-orange-300" />
                </div>
                <h3 className="mt-5 font-semibold">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-white/50">{description}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-orange-300">
                  {action} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}

      <div className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.05] text-white/60">
          <Bell size={17} />
        </div>
        <div>
          <h2 className="text-sm font-semibold">Keep your account details current</h2>
          <p className="mt-1 text-sm leading-6 text-white/50">
            Accurate contact details help your team identify your admin account and reach you when needed.
          </p>
        </div>
      </div>
    </div>
  );
}
