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

      const dataArray = Array.isArray(response)
        ? response
        : (response?.data || response?.workOrders || []);

      setWorkOrders(dataArray);
    } catch (err) {
      console.error(err);
      setWorkOrders([]);

      Swal.fire({
        title: 'Error',
        text: 'Failed to load work orders',
        icon: 'error',
        background: '#ffffff',
        color: '#0f172a',
        confirmButtonColor: '#0284c7'
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
          background: '#ffffff',
          color: '#0f172a',
          confirmButtonColor: '#0284c7'
        });
      } else {
        await workOrderListService.create(formData);
        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Work order created successfully.',
          timer: 2000,
          showConfirmButton: false,
          background: '#ffffff',
          color: '#0f172a',
          confirmButtonColor: '#0284c7'
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
        background: '#ffffff',
        color: '#0f172a',
        confirmButtonColor: '#0284c7'
      });
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this work order?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, delete it!',
      background: '#ffffff',
      color: '#0f172a'
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
          background: '#ffffff',
          color: '#0f172a',
          confirmButtonColor: '#0284c7'
        });
        fetchWorkOrders();
      } catch (err) {
        Swal.fire({
          title: 'Error',
          text: 'Failed to delete record',
          icon: 'error',
          background: '#ffffff',
          color: '#0f172a',
          confirmButtonColor: '#0284c7'
        });
      }
    }
  };

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
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-900">
      <div className="w-full bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 max-h-[calc(100vh-2rem)]">

        {/* HEADER SECTION */}
        <div className="flex justify-between items-center bg-white p-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-sky-50 border border-sky-200 rounded-lg shrink-0 text-sky-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-black text-slate-900 truncate uppercase tracking-tight">Work Order List</h2>
              <p className="text-xs text-slate-500 mt-0.5 truncate">Manage and track active maintenance orders</p>
            </div>
          </div>

          <button
            onClick={() => openModal()}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> Add Work Order
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-3 sm:p-5 md:p-6 bg-slate-50 w-full flex flex-col flex-1 overflow-y-auto box-border custom-scrollbar space-y-4">

          {workOrders.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl min-h-[250px] shadow-xs">
              <ClipboardList className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-400 italic text-xs">No work orders found. Click "Add Work Order" to create one.</p>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex flex-col">
              
              {/* MOBILE VIEW: SINGLE COLUMN CARD LIST (< sm screens) */}
              <div className="block sm:hidden space-y-3 overflow-y-auto max-h-[70vh] pr-1">
                {workOrders.map((wo, index) => (
                  <div key={wo.wol_id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                    <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          #{index + 1}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(wo.wol_create_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1 text-xs">
                      <p className="text-slate-900 font-medium leading-relaxed">{wo.wol_description}</p>
                      <p className="text-[11px] text-slate-500 pt-1 font-semibold">Created By: {wo.wol_create_by}</p>
                    </div>

                    <div className="pt-2 flex gap-2 justify-end border-t border-slate-100">
                      <button
                        onClick={() => openModal(wo)}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(wo.wol_id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* TABLET VIEW: 2-COLUMN GRID (sm to lg screens) */}
              <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4 overflow-y-auto max-h-[70vh] pr-1">
                {workOrders.map((wo, index) => (
                  <div key={wo.wol_id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                        <span className="font-mono text-xs font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                          #{index + 1}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {new Date(wo.wol_create_at).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="space-y-1 text-xs">
                        <p className="text-slate-900 font-medium leading-relaxed line-clamp-3">{wo.wol_description}</p>
                        <p className="text-[11px] text-slate-500 pt-1 font-semibold">Created By: {wo.wol_create_by}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex gap-2 justify-end border-t border-slate-100">
                      <button
                        onClick={() => openModal(wo)}
                        className="p-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg border border-amber-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="h-3.5 w-3.5" /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(wo.wol_id)}
                        className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg border border-rose-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP VIEW: STANDARD TABLE (lg+ screens) */}
              <div className="hidden lg:flex flex-1 bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden flex-col">
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
                      <tr>
                        <th className="py-4 px-6 border-b border-slate-200 w-24 text-center">ID</th>
                        <th className="py-4 px-6 border-b border-slate-200">Description</th>
                        <th className="py-4 px-6 border-b border-slate-200 w-48">Created By</th>
                        <th className="py-4 px-6 border-b border-slate-200 w-48">Created At</th>
                        <th className="py-4 px-6 border-b border-slate-200 w-32 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs">
                      {workOrders.map((wo, index) => (
                        <tr key={wo.wol_id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-6 text-slate-600 text-center font-mono font-bold">
                            {index + 1}
                          </td>
                          <td className="py-3 px-6 text-slate-900 font-medium">{wo.wol_description}</td>
                          <td className="py-3 px-6 text-slate-600">{wo.wol_create_by}</td>
                          <td className="py-3 px-6 text-slate-500 font-mono text-[11px]">
                            {new Date(wo.wol_create_at).toLocaleString()}
                          </td>
                          <td className="py-3 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => openModal(wo)}
                                className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-all cursor-pointer shadow-xs"
                                title="Edit"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(wo.wol_id)}
                                className="p-1.5 text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-all cursor-pointer shadow-xs"
                                title="Delete"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* MODAL OVERLAY */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col text-xs font-sans">

            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase">
                {editId ? <Edit2 className="h-4 w-4 text-sky-600" /> : <Plus className="h-4 w-4 text-sky-600" />}
                {editId ? 'Edit Work Order' : 'New Work Order'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors cursor-pointer p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Task Description <span className="text-rose-600">*</span>
                </label>
                <textarea
                  className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-xl p-3 focus:outline-none focus:border-sky-500 focus:bg-white transition-all resize-none font-medium"
                  rows="5"
                  placeholder="Enter detailed maintenance instructions..."
                  value={formData.wol_description}
                  onChange={(e) => setFormData({ ...formData, wol_description: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 mt-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-xs transition-all cursor-pointer"
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