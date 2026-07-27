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
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
  Save,
  ChevronDown
} from 'lucide-react';

const mockDocuments = [
  { id: 1, name: 'Aadhaar Card', type: 'ID Proof / Address Proof', description: 'UIDAI Aadhaar Card (Front and Back)', status: 'Active' },
  { id: 2, name: 'PAN Card', type: 'ID Proof', description: 'Permanent Account Number Card', status: 'Active' },
  { id: 3, name: 'Passport Size Photo', type: 'General', description: 'Recent passport size photograph with white background', status: 'Active' },
  { id: 4, name: 'Income Certificate', type: 'Supporting Document', description: 'Issued by Tahsildar within last 6 months', status: 'Active' },
  { id: 5, name: 'Ration Card', type: 'Address Proof', description: 'Smart Ration Card copy', status: 'Active' },
];

const RequiredDocuments = () => {
  const [isAddOpen, setIsAddOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6 text-white p-2 sm:p-4">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold mb-1">Required Documents</h1>
          <div className="text-sm text-gray-400 flex items-center gap-2">
            <span>Dashboard</span>
            <span className="text-gray-600">&gt;</span>
            <span>Service Management</span>
            <span className="text-gray-600">&gt;</span>
            <span className="text-gray-200">Required Documents</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 rounded-md border border-orange-500/50 text-orange-500 hover:bg-orange-500/10 transition-colors">
            <Download size={18} />
            <span>Export</span>
          </button>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
          >
            <Plus size={18} />
            <span>Add Document</span>
          </button>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-[#1a1c23] border border-gray-800 rounded-xl p-4 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[250px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input 
            type="text" 
            placeholder="Search documents..." 
            className="w-full bg-[#0f1115] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-gray-600 text-white placeholder-gray-500"
          />
        </div>
        
        <div className="relative min-w-[150px]">
          <select className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-4 py-2.5 text-sm appearance-none focus:outline-none focus:border-gray-600 text-white cursor-pointer">
            <option>All Types</option>
            <option>ID Proof</option>
            <option>Address Proof</option>
            <option>General</option>
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
                <th className="py-4 px-4 pl-6 font-medium">Document Name</th>
                <th className="py-4 px-4 font-medium">Type</th>
                <th className="py-4 px-4 font-medium">Description</th>
                <th className="py-4 px-4 font-medium">Status</th>
                <th className="py-4 px-4 pr-6 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {mockDocuments.map((doc) => (
                <tr key={doc.id} className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors">
                  <td className="py-3 px-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 bg-blue-500/20 text-blue-400">
                        <FileText size={20} />
                      </div>
                      <div className="font-medium text-white text-sm">{doc.name}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-300">
                    <span className="bg-gray-800 px-2.5 py-1 rounded-md">{doc.type}</span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-400 max-w-md truncate">
                    {doc.description}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium border ${
                      doc.status === 'Active' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }`}>
                      {doc.status}
                    </span>
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
            Showing 1 to 5 of 5 documents
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800 disabled:opacity-50">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md bg-orange-500 text-white border border-orange-500">
              1
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-md border border-gray-700 text-gray-400 hover:bg-gray-800">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Document Drawer */}
      {typeof document !== 'undefined' && createPortal(
        <>
          {isAddOpen && (
            <div 
              className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm" 
              onClick={() => setIsAddOpen(false)} 
            />
          )}

          <div className={`fixed inset-y-0 right-0 w-[400px] bg-[#1a1c23] border-l border-gray-800 shadow-2xl z-[70] transform transition-transform duration-300 flex flex-col ${isAddOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div>
                <h2 className="text-xl font-semibold text-white">Add New Document</h2>
              </div>
              <button onClick={() => setIsAddOpen(false)} className="text-gray-400 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Document Name <span className="text-red-500">*</span></label>
                <input type="text" placeholder="Enter document name" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Document Type <span className="text-red-500">*</span></label>
                <div className="relative">
                  <select defaultValue="" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-gray-400 appearance-none focus:outline-none focus:border-gray-600 cursor-pointer">
                    <option value="" disabled>Select type</option>
                    <option value="ID Proof">ID Proof</option>
                    <option value="Address Proof">Address Proof</option>
                    <option value="General">General</option>
                    <option value="Supporting Document">Supporting Document</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={14} />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm text-gray-300 font-medium">Description <span className="text-red-500">*</span></label>
                <textarea rows="4" placeholder="Enter document description" className="w-full bg-[#0f1115] border border-gray-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-gray-600 resize-none"></textarea>
                <div className="text-right text-xs text-gray-500">0 / 250</div>
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
            </div>

            <div className="p-6 border-t border-gray-800 flex gap-4 bg-[#1a1c23]">
              <button onClick={() => setIsAddOpen(false)} className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors text-sm font-medium">
                Cancel
              </button>
              <button className="flex-1 py-2.5 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-medium flex items-center justify-center gap-2">
                <Save size={18} />
                <span>Save Document</span>
              </button>
            </div>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default RequiredDocuments;
