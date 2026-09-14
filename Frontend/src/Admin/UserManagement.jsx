import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import api from '../api';
import { 
  Search, 
  Download, 
  Plus, 
  RefreshCcw, 
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  UserCheck,
  UserX,
  UserPlus,
  Users,
  X,
  EyeOff,
  LayoutGrid,
  List
} from 'lucide-react';

const formatJoinedDate = (value) => value ? new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '-';
const formatJoinedTime = (value) => value ? new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '';
const mapUser = (user) => ({
  id: user.user_id,
  name: user.username,
  email: user.email,
  username: user.username,
  role: user.role || 'Customer',
  center: '-',
  mobile: user.mobile || '-',
  status: user.status || 'Inactive',
  joinedDate: formatJoinedDate(user.created_at),
  joinedTime: formatJoinedTime(user.created_at),
  avatar: `https://i.pravatar.cc/150?u=${user.user_id}`,
});

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [viewMode, setViewMode] = useState('table');
  const [savingUser, setSavingUser] = useState(false);
  const [userForm, setUserForm] = useState({ username: '', email: '', mobile: '', password: '', confirmPassword: '', role: 'Staff', status: 'Active' });

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);
      const response = await api.get('/users', { params: { page: 1, limit: 100 } });
      setUsers((response.data.data || []).map(mapUser));
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to load users');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const updateUserForm = (field, value) => setUserForm((current) => ({ ...current, [field]: value }));
  const closeAddUser = () => {
    setIsAddUserOpen(false);
    setUserForm({ username: '', email: '', mobile: '', password: '', confirmPassword: '', role: 'Staff', status: 'Active' });
    setShowPassword(false);
    setShowConfirmPassword(false);
  };
  const saveUser = async (event) => {
    event.preventDefault();
    if (userForm.password !== userForm.confirmPassword) return window.alert('Passwords do not match');
    setSavingUser(true);
    try {
      const response = await api.post('/users', { username: userForm.username, email: userForm.email, mobile: userForm.mobile, password: userForm.password, role: userForm.role, status: userForm.status });
      const created = response.data.user;
      setUsers((current) => [mapUser(created), ...current]);
      closeAddUser();
      window.alert('User created successfully');
    } catch (error) {
      window.alert(error.response?.data?.message || 'Unable to create user');
    } finally {
      setSavingUser(false);
    }
  };

  const toggleUserSelection = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedUsers.length === users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(users.map(u => u.id));
    }
  };

  const activeUsers = users.filter((user) => user.status === 'Active').length;
  const inactiveUsers = users.filter((user) => user.status === 'Inactive').length;
  const newThisMonth = users.filter((user) => {
    const created = new Date(user.joinedDate);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  }).length;

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">All Users</h1>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span>Dashboard</span>
            <span className="text-gray-600">&gt;</span>
            <span>User Management</span>
            <span className="text-gray-600">&gt;</span>
            <span className="text-gray-200">All Users</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-orange-500/50 text-orange-500 hover:bg-orange-500/10 transition-colors">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setIsAddUserOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={18} />
            <span>Add New User</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email, mobile or username..." 
            className="w-1/2 bg-[#0f1115] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-600 text-white placeholder-gray-500"
          />
        </div>
        
        <div className="relative min-w-[140px]">
          <select className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-gray-600 text-white cursor-pointer">
            <option>All Roles</option>
            <option>Super Admin</option>
            <option>Center Admin</option>
            <option>Operator</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
        </div>

        <div className="relative min-w-[140px]">
          <select className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-gray-600 text-white cursor-pointer">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
        </div>

       

        <div className="ml-auto flex items-center rounded-lg border border-gray-700 bg-[#0f1115] p-1" aria-label="User view mode">
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${viewMode === 'card' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
            aria-pressed={viewMode === 'card'}
            title="Card view"
          >
            <LayoutGrid size={16} />
            <span className="hidden sm:inline">Cards</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${viewMode === 'table' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}
            aria-pressed={viewMode === 'table'}
            title="Table view"
          >
            <List size={16} />
            <span className="hidden sm:inline">Table</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
          <div className="p-3 bg-orange-500/10 rounded-lg text-orange-500">
            <Users size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Total Users</p>
            <h3 className="text-2xl font-bold mb-2">{users.length}</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span>↑ 12.4%</span>
              <span className="text-gray-500">from last month</span>
            </p>
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
          <div className="p-3 bg-green-500/10 rounded-lg text-green-500">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Active Users</p>
            <h3 className="text-2xl font-bold mb-2">{activeUsers}</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span>↑ 15.6%</span>
              <span className="text-gray-500">from last month</span>
            </p>
          </div>
        </div>

        {/* Inactive Users */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
          <div className="p-3 bg-red-500/10 rounded-lg text-red-500">
            <UserX size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">Inactive Users</p>
            <h3 className="text-2xl font-bold mb-2">{inactiveUsers}</h3>
            <p className="text-xs text-red-500 flex items-center gap-1">
              <span>↓ 6.7%</span>
              <span className="text-gray-500">from last month</span>
            </p>
          </div>
        </div>

        {/* New This Month */}
        <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-5 flex items-start gap-4">
          <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
            <UserPlus size={24} />
          </div>
          <div>
            <p className="text-gray-400 text-sm mb-1">New This Month</p>
            <h3 className="text-2xl font-bold mb-2">{newThisMonth}</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span>↑ 11.2%</span>
              <span className="text-gray-500">from last month</span>
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className={`${viewMode === 'table' ? '' : 'hidden'} bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="py-4 px-4 pl-6 w-[50px]">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-600 bg-[#0f1115] accent-orange-500"
                    checked={selectedUsers.length === users.length && users.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">User <ChevronDown size={14} className="text-gray-600" /></div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Username <ChevronDown size={14} className="text-gray-600" /></div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Role <ChevronDown size={14} className="text-gray-600" /></div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Center <ChevronDown size={14} className="text-gray-600" /></div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Mobile <ChevronDown size={14} className="text-gray-600" /></div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Status <ChevronDown size={14} className="text-gray-600" /></div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Joined On <ChevronDown size={14} className="text-gray-600" /></div>
                </th>
                <th className="py-4 px-4 pr-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr><td colSpan="9" className="py-16 text-center text-gray-500"><RefreshCcw className="mr-2 inline animate-spin" size={18} />Loading users...</td></tr>
              ) : users.length === 0 ? (
                <tr><td colSpan="9" className="py-16 text-center text-gray-500">No users found.</td></tr>
              ) : users.map((user) => (
                <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-3 px-4 pl-6">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-600 bg-[#0f1115] accent-orange-500"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => toggleUserSelection(user.id)}
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
                      <div>
                        <div className="font-medium text-white">{user.name}</div>
                        <div className="text-xs text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {user.username}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-md bg-gray-800/80 text-blue-400">
                        <Shield size={14} className={user.role.includes('Admin') ? 'text-orange-400' : 'text-blue-400'} />
                      </div>
                      <span className="text-sm text-gray-300">{user.role}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {user.center}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {user.mobile}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      user.status === 'Active' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-sm text-gray-300">{user.joinedDate}</div>
                    <div className="text-xs text-gray-500">{user.joinedTime}</div>
                  </td>
                  <td className="py-3 px-4 pr-6">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 transition-colors" title="View">
                        <Eye size={16} />
                      </button>
                      <button className="p-1.5 rounded-md text-gray-400 hover:text-blue-400 hover:bg-gray-700 transition-colors" title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-1.5 rounded-md text-gray-400 hover:text-red-400 hover:bg-gray-700 transition-colors" title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            Showing {users.length ? 1 : 0} to {users.length} of {users.length} users
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-orange-500 text-white border border-orange-500">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800">
              2
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800">
              3
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800 hidden sm:flex">
              4
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800 hidden sm:flex">
              5
            </button>
            <span className="text-gray-500 px-1">...</span>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800">
              67
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className={`${viewMode === 'card' ? '' : 'hidden'} grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3`}>
        {users.map((user) => (
          <article key={user.id} className="rounded-xl border border-gray-800 bg-[#1a1c23] p-5 transition-colors hover:border-orange-500/40">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src={user.avatar} alt={user.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <h3 className="font-medium text-white">{user.name}</h3>
                  <p className="text-xs text-gray-500">@{user.username}</p>
                </div>
              </div>
              <span className={`rounded border px-2 py-1 text-xs font-medium ${user.status === 'Active' ? 'border-green-500/20 bg-green-500/10 text-green-500' : 'border-red-500/20 bg-red-500/10 text-red-500'}`}>{user.status}</span>
            </div>
            <div className="mt-5 space-y-2 border-t border-gray-800 pt-4 text-sm">
              <div className="flex justify-between gap-3"><span className="text-gray-500">Role</span><span className="text-right text-gray-300">{user.role}</span></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Center</span><span className="text-right text-gray-300">{user.center}</span></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Mobile</span><span className="text-right text-gray-300">{user.mobile}</span></div>
              <div className="flex justify-between gap-3"><span className="text-gray-500">Joined</span><span className="text-right text-gray-300">{user.joinedDate}</span></div>
            </div>
            <div className="mt-5 flex justify-end gap-2 border-t border-gray-800 pt-4">
              <button className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-white" title="View"><Eye size={16} /></button>
              <button className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-blue-400" title="Edit"><Edit2 size={16} /></button>
              <button className="rounded-md p-2 text-gray-400 transition-colors hover:bg-gray-700 hover:text-red-400" title="Delete"><Trash2 size={16} /></button>
            </div>
          </article>
        ))}
      </div>

      {/* Add User Drawer Overlay & Panel (Portaled to body) */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {isAddUserOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" 
              onClick={() => setIsAddUserOpen(false)} 
            />
          )}

          <div className={`fixed inset-y-0 right-0 w-[400px] bg-[#1a1c23] border-l border-gray-800 shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${isAddUserOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-semibold text-white">Add New User</h2>
                <p className="text-sm text-gray-400 mt-1">Fill in the details to create a new user.</p>
              </div>
              <button onClick={() => setIsAddUserOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Drawer Body (Form) */}
            <form onSubmit={saveUser} className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm text-gray-300 font-medium">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter full name" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm text-gray-300 font-medium">Username <span className="text-red-500">*</span></label>
                  <input required type="text" placeholder="Enter username" value={userForm.username} onChange={(e) => updateUserForm('username', e.target.value)} className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Email Address <span className="text-red-500">*</span></label>
                <input required type="email" placeholder="Enter email address" value={userForm.email} onChange={(e) => updateUserForm('email', e.target.value)} className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
              </div>

              <div className="flex gap-4">
                <div className="flex-[3] space-y-1.5">
                  <label className="text-sm text-gray-300 font-medium">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <select className="bg-[#0f1115] border border-gray-800 rounded-l-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-gray-600 border-r-0">
                      <option>+91</option>
                    </select>
                    <input required type="text" placeholder="Enter mobile number" value={userForm.mobile} onChange={(e) => updateUserForm('mobile', e.target.value)} className="flex-1 bg-[#0f1115] border border-gray-800 rounded-r-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
                  </div>
                </div>
                <div className="flex-[2] space-y-1.5">
                  <label className="text-sm text-gray-300 font-medium">Role <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select value={userForm.role} onChange={(e) => updateUserForm('role', e.target.value)} className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-gray-600 cursor-pointer">
                      <option value="Staff">Staff</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Admin">Admin</option>
                      <option value="Manager">Manager</option>
                      <option value="Employee">Employee</option>
                      <option value="Customer">Customer</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Center / Branch <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select defaultValue="" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400 appearance-none focus:outline-none focus:border-gray-600 cursor-pointer">
                    <option value="" disabled>Select center</option>
                    <option value="Head Office">Head Office</option>
                    <option value="Vellore Center">Vellore Center</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input required minLength={8} type={showPassword ? "text" : "password"} placeholder="Enter password" value={userForm.password} onChange={(e) => updateUserForm('password', e.target.value)} className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Password must be at least 6 characters long.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input required minLength={8} type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" value={userForm.confirmPassword} onChange={(e) => updateUserForm('confirmPassword', e.target.value)} className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-sm text-gray-300 font-medium">Status <span className="text-red-500">*</span></label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status" value="Active" checked={userForm.status === 'Active'} onChange={(e) => updateUserForm('status', e.target.value)} className="w-4 h-4 accent-orange-500 border-gray-600 bg-[#0f1115]" />
                    <span className="text-sm text-white">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status" value="Inactive" checked={userForm.status === 'Inactive'} onChange={(e) => updateUserForm('status', e.target.value)} className="w-4 h-4 accent-orange-500 border-gray-600 bg-[#0f1115]" />
                    <span className="text-sm text-gray-400">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Notes</label>
                <textarea rows="3" placeholder="Enter any notes (optional)" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 resize-none"></textarea>
                <div className="text-right text-xs text-gray-500">0 / 250</div>
              </div>
            </form>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-800 flex gap-4 bg-[#1a1c23]">
              <button onClick={() => setIsAddUserOpen(false)} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium">
                Cancel
              </button>
              <button type="button" onClick={() => saveUser({ preventDefault: () => {} })} disabled={savingUser} className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <UserPlus size={18} />
                <span>{savingUser ? 'Saving...' : 'Save User'}</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default UserManagement;
