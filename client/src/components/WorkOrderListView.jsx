import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  ClipboardList,
  Plus,
  Edit2,
  Trash2,
  X
} from 'lucide-react';
import { workOrderListService } from '../services/api';

export default function WorkOrderListView({ activeUser }) {
  // Renamed setter to setWorkOrders for standard convention
  const [workOrders, setWorkOrders] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editId, setEditId] = useState(null);

  // Safe default for active user string
  const userFullName = activeUser
    ? `${activeUser.first_name || ''} ${activeUser.last_name || ''}`.trim()
    : 'System User';

  const [formData, setFormData] = useState({
    wol_description: '',
    wol_create_by: userFullName
  });

  const fetchWorkOrders = async () => {
    try {
      const response = await workOrderListService.getAll();

      // Safely extract the array whether it's returned directly or wrapped in an object like { data: [...] }
      const dataArray = Array.isArray(response)
        ? response
        : (response?.data || response?.workOrders || []);

      setWorkOrders(dataArray);
    } catch (err) {
      console.error(err);
      setWorkOrders([]); // Fallback to an empty array on error to prevent .map crashes

      Swal.fire({
        title: 'Error',
        text: 'Failed to load work orders',
        icon: 'error',
        background: '#0f172a',
        color: '#f1f5f9'
      });
    }
  };

  useEffect(() => {
    fetchWorkOrders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await workOrderListService.update(editId, formData);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Work order updated successfully.',
          timer: 2000,
          showConfirmButton: false,
          background: '#0f172a',
          color: '#f1f5f9'
        });
      } else {
        await workOrderListService.create(formData);
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Work order created successfully.',
          timer: 2000,
          showConfirmButton: false,
          background: '#0f172a',
          color: '#f1f5f9'
        });
      }
      setIsModalOpen(false);
      setFormData({ wol_description: '', wol_create_by: userFullName });
      setEditId(null);
      fetchWorkOrders();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || err.message,
        icon: 'error',
        background: '#0f172a',
        color: '#f1f5f9'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this work order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444', // rose-500
      cancelButtonColor: '#334155',  // slate-700
      confirmButtonText: 'Yes, delete it!',
      background: '#0f172a',
      color: '#f1f5f9'
    });

    if (result.isConfirmed) {
      try {
        await workOrderListService.delete(id);
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: 'Work order deleted successfully.',
          timer: 2000,
          showConfirmButton: false,
          background: '#0f172a',
          color: '#f1f5f9'
        });
        fetchWorkOrders();
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete record',
          icon: 'error',
          background: '#0f172a',
          color: '#f1f5f9'
        });
      }
    }
  };

  // Open modal handler
  const openModal = (workOrder = null) => {
    if (workOrder) {
      setEditId(workOrder.wol_id);
      setFormData({
        wol_description: workOrder.wol_description,
        wol_create_by: workOrder.wol_create_by
      });
    } else {
      setEditId(null);
      setFormData({ wol_description: '', wol_create_by: userFullName });
    }
    setIsModalOpen(true);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full bg-slate-950 border border-slate-850 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col flex-1 max-h-[calc(100vh-2rem)]">
        
        {/* HEADER SECTION */}
        <div className="flex justify-between items-center bg-slate-900 p-5 border-b border-slate-800 shadow-sm shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-sky-500/10 rounded-lg shrink-0">
              <ClipboardList className="h-6 w-6 text-sky-400" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-white truncate">Work Order List</h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate">Manage and track active maintenance orders</p>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 transition-all shadow-lg shadow-sky-900/20 active:scale-95 cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Work Order
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-3 sm:p-5 md:p-6 bg-slate-950 w-full flex flex-col flex-1 overflow-y-auto box-border custom-scrollbar space-y-4">

          {/* TABLE SECTION */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl flex-1 overflow-hidden flex flex-col shadow-sm">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-950/50 sticky top-0 z-10">
                  <tr>
                    <th className="py-4 px-6 font-semibold text-xs tracking-wider text-slate-400 uppercase border-b border-slate-800 w-24 text-center">ID</th>
                    <th className="py-4 px-6 font-semibold text-xs tracking-wider text-slate-400 uppercase border-b border-slate-800">Description</th>
                    <th className="py-4 px-6 font-semibold text-xs tracking-wider text-slate-400 uppercase border-b border-slate-800 w-48">Created By</th>
                    <th className="py-4 px-6 font-semibold text-xs tracking-wider text-slate-400 uppercase border-b border-slate-800 w-48">Created At</th>
                    <th className="py-4 px-6 font-semibold text-xs tracking-wider text-slate-400 uppercase border-b border-slate-800 w-32 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {workOrders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-slate-500">
                        No work orders found. Click "Add Work Order" to create one.
                      </td>
                    </tr>
                  ) : (
                    workOrders.map((wo) => (
                      <tr key={wo.wol_id} className="hover:bg-slate-800/20 transition-colors">
                        <td className="py-3 px-6 text-slate-300 text-center font-mono">{wo.wol_id}</td>
                        <td className="py-3 px-6 text-slate-200">{wo.wol_description}</td>
                        <td className="py-3 px-6 text-slate-400">{wo.wol_create_by}</td>
                        <td className="py-3 px-6 text-slate-400 text-xs">{new Date(wo.wol_create_at).toLocaleString()}</td>
                        <td className="py-3 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => openModal(wo)}
                              className="p-1.5 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(wo.wol_id)}
                              className="p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                              title="Delete"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col animation-fade-in">

            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                {editId ? <Edit2 className="h-5 w-5 text-sky-400" /> : <Plus className="h-5 w-5 text-sky-400" />}
                {editId ? 'Edit Work Order' : 'New Work Order'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Task Description
                </label>
                <textarea
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl p-3 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-all resize-none"
                  rows="5"
                  placeholder="Enter detailed maintenance instructions..."
                  value={formData.wol_description}
                  onChange={(e) => setFormData({ ...formData, wol_description: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-semibold text-slate-300 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-semibold text-white bg-sky-600 hover:bg-sky-500 shadow-lg shadow-sky-900/20 transition-all active:scale-95 cursor-pointer"
                >
                  {editId ? 'Save Changes' : 'Create Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}