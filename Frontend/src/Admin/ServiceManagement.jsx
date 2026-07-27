import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  Download, 
  Plus, 
  Filter, 
  RefreshCcw,
  Eye,
  Edit2,
  Trash2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Users,
  IndianRupee,
  MapPin,
  GraduationCap,
  CreditCard,
  FileText
} from 'lucide-react';

const mockServices = [
  {
    id: 1,
    nameEn: 'Community Certificate',
    nameTa: 'சமூக சான்றிதழ்',
    code: 'SV-001',
    category: 'Certificates',
    charge: '120',
    status: 'Active',
    sortOrder: 1,
    icon: Users,
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/20'
  },
  {
    id: 2,
    nameEn: 'Income Certificate',
    nameTa: 'வருமானச் சான்றிதழ்',
    code: 'SV-002',
    category: 'Certificates',
    charge: '120',
    status: 'Active',
    sortOrder: 2,
    icon: IndianRupee,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/20'
  },
  {
    id: 3,
    nameEn: 'Nativity Certificate',
    nameTa: 'இருப்பிடச் சான்றிதழ்',
    code: 'SV-003',
    category: 'Certificates',
    charge: '120',
    status: 'Active',
    sortOrder: 3,
    icon: MapPin,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20'
  },
  {
    id: 4,
    nameEn: 'First Graduate Certificate',
    nameTa: 'முதல் பட்டதாரி சான்றிதழ்',
    code: 'SV-004',
    category: 'Education',
    charge: '150',
    status: 'Active',
    sortOrder: 4,
    icon: GraduationCap,
    iconColor: 'text-blue-400',
    iconBg: 'bg-blue-500/20'
  },
  {
    id: 5,
    nameEn: 'Obc Certificate',
    nameTa: 'ஒ.பி.சி சான்றிதழ்',
    code: 'SV-005',
    category: 'Certificates',
    charge: '120',
    status: 'Active',
    sortOrder: 5,
    icon: Users,
    iconColor: 'text-pink-400',
    iconBg: 'bg-pink-500/20'
  },
  {
    id: 6,
    nameEn: 'Aadhar Update',
    nameTa: 'ஆதார் அப்டேட்',
    code: 'SV-006',
    category: 'Utility',
    charge: '50',
    status: 'Active',
    sortOrder: 6,
    icon: CreditCard,
    iconColor: 'text-teal-400',
    iconBg: 'bg-teal-500/20'
  },
  {
    id: 7,
    nameEn: 'Ration Card New',
    nameTa: 'புதிய ரேஷன் கார்டு',
    code: 'SV-007',
    category: 'Ration',
    charge: '100',
    status: 'Active',
    sortOrder: 7,
    icon: CreditCard,
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/20'
  },
  {
    id: 8,
    nameEn: 'Ration Card Correction',
    nameTa: 'ரேஷன் கார்டு திருத்தம்',
    code: 'SV-008',
    category: 'Ration',
    charge: '75',
    status: 'Inactive',
    sortOrder: 8,
    icon: Edit2,
    iconColor: 'text-orange-400',
    iconBg: 'bg-orange-500/20'
  }
];

const getCategoryColor = (category) => {
  switch (category) {
    case 'Certificates': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'Education': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'Utility': return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    case 'Ration': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
  }
};

const ServiceManagement = () => {
  const [selectedServices, setSelectedServices] = useState([]);
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);

  const toggleServiceSelection = (id) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(serviceId => serviceId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedServices.length === mockServices.length) {
      setSelectedServices([]);
    } else {
      setSelectedServices(mockServices.map(s => s.id));
    }
  };

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">All Services</h1>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span>Dashboard</span>
            <span className="text-gray-600">&gt;</span>
            <span>Service Management</span>
            <span className="text-gray-600">&gt;</span>
            <span className="text-gray-200">All Services</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-orange-500/50 text-orange-500 hover:bg-orange-500/10 transition-colors">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setIsAddServiceOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={18} />
            <span>Add New Service</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search by service name or code..." 
            className="w-full bg-[#0f1115] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-600 text-white placeholder-gray-500"
          />
        </div>
        
        <div className="relative min-w-[140px]">
          <select className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-gray-600 text-white cursor-pointer">
            <option>All Categories</option>
            <option>Certificates</option>
            <option>Education</option>
            <option>Utility</option>
            <option>Ration</option>
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

      {/* Table Section */}
      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 text-gray-400 text-sm">
                <th className="py-4 px-4 pl-6 w-[50px]">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 rounded border-gray-600 bg-[#0f1115] accent-orange-500 cursor-pointer"
                    checked={selectedServices.length === mockServices.length && mockServices.length > 0}
                    onChange={toggleAll}
                  />
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Service Name</div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Service Code</div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Category</div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Charge (₹)</div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Status</div>
                </th>
                <th className="py-4 px-4 font-medium cursor-pointer hover:text-white">
                  <div className="flex items-center gap-1">Sort Order</div>
                </th>
                <th className="py-4 px-4 pr-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockServices.map((service) => {
                const Icon = service.icon;
                return (
                <tr key={service.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-3 px-4 pl-6">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded border-gray-600 bg-[#0f1115] accent-orange-500 cursor-pointer"
                      checked={selectedServices.includes(service.id)}
                      onChange={() => toggleServiceSelection(service.id)}
                    />
                  </td>
                  <td className="py-3 px-4 min-w-[250px]">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${service.iconBg} ${service.iconColor}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">{service.nameEn}</div>
                        <div className="text-xs text-gray-500">{service.nameTa}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {service.code}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${getCategoryColor(service.category)}`}>
                      {service.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    ₹ {service.charge}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      service.status === 'Active' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    {service.sortOrder}
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
              )})}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-gray-400">
            Showing 1 to 8 of 86 services
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
              11
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Service Drawer Overlay & Panel (Portaled to body) */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {isAddServiceOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" 
              onClick={() => setIsAddServiceOpen(false)} 
            />
          )}

          <div className={`fixed inset-y-0 right-0 w-[420px] bg-[#1a1c23] border-l border-gray-800 shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${isAddServiceOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-semibold text-white">Add New Service</h2>
              </div>
              <button onClick={() => setIsAddServiceOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            {/* Drawer Body (Form) */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              
              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Service Name (English) <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter service name in English" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Service Name (Tamil) <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter service name in Tamil" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Service Code <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter unique service code" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Category <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select defaultValue="" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400 appearance-none focus:outline-none focus:border-gray-600 cursor-pointer">
                    <option value="" disabled>Select category</option>
                    <option value="Certificates">Certificates</option>
                    <option value="Education">Education</option>
                    <option value="Utility">Utility</option>
                    <option value="Ration">Ration</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Service Description <span className="text-red-500">*</span></label>
                <textarea rows="3" placeholder="Enter service description" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 resize-none"></textarea>
                <div className="text-right text-xs text-gray-500">0 / 500</div>
              </div>

              {/* Required Documents Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm text-gray-300 font-medium">Required Documents</label>
                  <button className="flex items-center gap-1 text-orange-500 border border-orange-500/50 rounded px-2 py-1 text-xs hover:bg-orange-500/10 transition-colors">
                    <Plus size={12} />
                    <span>Add Document</span>
                  </button>
                </div>
                <div className="border border-dashed border-gray-700 rounded-lg p-6 flex flex-col items-center justify-center bg-[#0f1115]/50">
                  <FileText className="text-gray-600 mb-2" size={24} />
                  <p className="text-xs text-gray-500">No documents added yet</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Service Charge (₹) <span className="text-red-500">*</span></label>
                <input type="number" placeholder="Enter service charge" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Estimated Processing Time <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select defaultValue="" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400 appearance-none focus:outline-none focus:border-gray-600 cursor-pointer">
                    <option value="" disabled>Select processing time</option>
                    <option value="1 Day">1 Day</option>
                    <option value="3 Days">3 Days</option>
                    <option value="1 Week">1 Week</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
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
                <label className="text-sm text-gray-300 font-medium">Sort Order <span className="text-red-500">*</span></label>
                <input type="number" placeholder="Enter sort order" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
              </div>

            </div>

            {/* Drawer Footer */}
            <div className="p-6 border-t border-gray-800 flex gap-4 bg-[#1a1c23]">
              <button onClick={() => setIsAddServiceOpen(false)} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium">
                Cancel
              </button>
              <button className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <FileText size={18} />
                <span>Save Service</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default ServiceManagement;
