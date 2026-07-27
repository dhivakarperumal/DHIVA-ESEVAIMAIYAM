import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Download, 
  Plus, 
  Filter, 
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
  EyeOff
} from 'lucide-react';

const mockUsers = [
  {
    id: 1,
    name: 'K. Srinivasan',
    email: 'srinivasan.k@gmail.com',
    username: 'ksrinivasan',
    role: 'Super Admin',
    center: 'Head Office',
    mobile: '+91 98765 43210',
    status: 'Active',
    joinedDate: '20 Mar 2024',
    joinedTime: '10:30 AM',
    avatar: 'https://i.pravatar.cc/150?u=1'
  },
  {
    id: 2,
    name: 'M. Kavitha',
    email: 'kavitha.m@gmail.com',
    username: 'mkavitha',
    role: 'Center Admin',
    center: 'Vellore Center',
    mobile: '+91 93456 78901',
    status: 'Active',
    joinedDate: '05 Apr 2024',
    joinedTime: '11:20 AM',
    avatar: 'https://i.pravatar.cc/150?u=2'
  },
  {
    id: 3,
    name: 'R. Prakash',
    email: 'prakash.r@gmail.com',
    username: 'rprakash',
    role: 'Operator',
    center: 'Ambur Center',
    mobile: '+91 97890 12345',
    status: 'Active',
    joinedDate: '12 Apr 2024',
    joinedTime: '09:15 AM',
    avatar: 'https://i.pravatar.cc/150?u=3'
  },
  {
    id: 4,
    name: 'S. Dinesh',
    email: 'dinesh.s@gmail.com',
    username: 'sdinesh',
    role: 'Verifier',
    center: 'Tirupathur Center',
    mobile: '+91 90123 45678',
    status: 'Active',
    joinedDate: '18 Apr 2024',
    joinedTime: '02:45 PM',
    avatar: 'https://i.pravatar.cc/150?u=4'
  },
  {
    id: 5,
    name: 'P. Lakshmi',
    email: 'lakshmi.p@gmail.com',
    username: 'plakshmi',
    role: 'Data Entry',
    center: 'Vaniyambadi Center',
    mobile: '+91 90987 65432',
    status: 'Inactive',
    joinedDate: '21 Apr 2024',
    joinedTime: '04:10 PM',
    avatar: 'https://i.pravatar.cc/150?u=5'
  },
  {
    id: 6,
    name: 'A. Manikandan',
    email: 'manikandan.a@gmail.com',
    username: 'amanikandan',
    role: 'Operator',
    center: 'Arcot Center',
    mobile: '+91 93654 78901',
    status: 'Active',
    joinedDate: '28 Apr 2024',
    joinedTime: '10:05 AM',
    avatar: 'https://i.pravatar.cc/150?u=6'
  },
  {
    id: 7,
    name: 'J. Priya',
    email: 'priya.j@gmail.com',
    username: 'jpriya',
    role: 'Verifier',
    center: 'Gudiyatham Center',
    mobile: '+91 95001 23456',
    status: 'Inactive',
    joinedDate: '02 May 2024',
    joinedTime: '01:30 PM',
    avatar: 'https://i.pravatar.cc/150?u=7'
  },
  {
    id: 8,
    name: 'V. Mohan',
    email: 'mohan.v@gmail.com',
    username: 'vmohan',
    role: 'Data Entry',
    center: 'Chennai Center',
    mobile: '+91 94444 55678',
    status: 'Active',
    joinedDate: '06 May 2024',
    joinedTime: '09:40 AM',
    avatar: 'https://i.pravatar.cc/150?u=8'
  }
];

const UserManagement = () => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const toggleUserSelection = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) ? prev.filter(userId => userId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedUsers.length === mockUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(mockUsers.map(u => u.id));
    }
  };

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
            className="w-full bg-[#0f1115] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-600 text-white placeholder-gray-500"
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

        <div className="relative min-w-[140px]">
          <select className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-gray-600 text-white cursor-pointer">
            <option>All Centers</option>
            <option>Head Office</option>
            <option>Vellore Center</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={16} />
        </div>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-orange-500/30 text-orange-500 hover:bg-orange-500/10 transition-colors">
          <Filter size={16} />
          <span>Filter</span>
        </button>

        <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-700 text-gray-400 hover:bg-gray-800 transition-colors">
          <RefreshCcw size={16} />
          <span>Reset</span>
        </button>
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
            <h3 className="text-2xl font-bold mb-2">532</h3>
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
            <h3 className="text-2xl font-bold mb-2">458</h3>
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
            <h3 className="text-2xl font-bold mb-2">56</h3>
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
            <h3 className="text-2xl font-bold mb-2">38</h3>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span>↑ 11.2%</span>
              <span className="text-gray-500">from last month</span>
            </p>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="py-4 px-4 pl-6 w-[50px]">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-600 bg-[#0f1115] accent-orange-500"
                    checked={selectedUsers.length === mockUsers.length && mockUsers.length > 0}
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
              {mockUsers.map((user) => (
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
            Showing 1 to 8 of 532 users
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
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="flex gap-4">
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm text-gray-300 font-medium">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter full name" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-sm text-gray-300 font-medium">Username <span className="text-red-500">*</span></label>
                  <input type="text" placeholder="Enter username" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Email Address <span className="text-red-500">*</span></label>
                <input type="email" placeholder="Enter email address" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
              </div>

              <div className="flex gap-4">
                <div className="flex-[3] space-y-1.5">
                  <label className="text-sm text-gray-300 font-medium">Mobile Number <span className="text-red-500">*</span></label>
                  <div className="flex">
                    <select className="bg-[#0f1115] border border-gray-800 rounded-l-lg px-2 py-2 text-sm text-white focus:outline-none focus:border-gray-600 border-r-0">
                      <option>+91</option>
                    </select>
                    <input type="text" placeholder="Enter mobile number" className="flex-1 bg-[#0f1115] border border-gray-800 rounded-r-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
                  </div>
                </div>
                <div className="flex-[2] space-y-1.5">
                  <label className="text-sm text-gray-300 font-medium">Role <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <select defaultValue="" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400 appearance-none focus:outline-none focus:border-gray-600 cursor-pointer">
                      <option value="" disabled>Select role</option>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Center Admin">Center Admin</option>
                      <option value="Operator">Operator</option>
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
                  <input type={showPassword ? "text" : "password"} placeholder="Enter password" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-xs text-gray-500">Password must be at least 6 characters long.</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Confirm Password <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="Confirm password" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 pr-10" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <label className="text-sm text-gray-300 font-medium">Status <span className="text-red-500">*</span></label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status" defaultChecked className="w-4 h-4 accent-orange-500 border-gray-600 bg-[#0f1115]" />
                    <span className="text-sm text-white">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="status" className="w-4 h-4 accent-orange-500 border-gray-600 bg-[#0f1115]" />
                    <span className="text-sm text-gray-400">Inactive</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Notes</label>
                <textarea rows="3" placeholder="Enter any notes (optional)" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 resize-none"></textarea>
                <div className="text-right text-xs text-gray-500">0 / 250</div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-800 flex gap-4 bg-[#1a1c23]">
              <button onClick={() => setIsAddUserOpen(false)} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium">
                Cancel
              </button>
              <button className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <UserPlus size={18} />
                <span>Save User</span>
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
