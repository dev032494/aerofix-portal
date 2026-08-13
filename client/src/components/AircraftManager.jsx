import React, { useState, useEffect } from 'react';
import { aircraftService } from '../services/api';
import { Plane, Plus, X, User, Calendar, Edit, Eye, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import Swal from 'sweetalert2';

export default function AircraftManager() {
  const [aircraftList, setAircraftList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Toast State
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  // Modal States
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [editId, setEditId] = useState(null);

  // Extract active user safely
  let activeUser = {};
  const cachedData = localStorage.getItem('aerofix_user');
  if (cachedData) {
    try {
      activeUser = JSON.parse(cachedData);
    } catch (e) {
      console.error('Failed to parse cached user data', e);
    }
  }

  const [formData, setFormData] = useState({
    a_registration_number: '',
    a_aircraft_type: '',
    a_create_by: `${activeUser.first_name || ''} ${activeUser.last_name || ''}`.trim()
  });

  // Helper triggerToast function
  const triggerToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  // Fetch data on mount
  useEffect(() => {
    fetchAircraft();
  }, []);

  const fetchAircraft = () => {
    setLoading(true);
    aircraftService.getAllAircraft()
      .then(res => {
        const data = res.data?.data?.aircraft || res.data?.aircraft || res.data || [];
        setAircraftList(Array.isArray(data) ? data : []);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        const errMsg = err.message || 'Failed to connect to aircraft database.';
        setError(errMsg);
        triggerToast(errMsg, 'error');
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleOpenCreate = () => {
    setEditId(null);
    setFormData({
      a_registration_number: '',
      a_aircraft_type: '',
      a_create_by: `${activeUser.first_name || ''} ${activeUser.last_name || ''}`.trim()
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (aircraft) => {
    setEditId(aircraft.a_id);
    setFormData({
      a_registration_number: aircraft.a_registration_number,
      a_aircraft_type: aircraft.a_aircraft_type,
      a_create_by: `${activeUser.first_name || ''} ${activeUser.last_name || ''}`.trim(),
    });
    setIsFormModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await aircraftService.update(editId, formData);
        Swal.fire({
          icon: 'success',
          title: 'Updated!',
          text: 'Aircraft record successfully updated!',
          timer: 2000,
          showConfirmButton: false,
        });

        setIsFormModalOpen(false);
        setFormData({
          a_registration_number: '',
          a_aircraft_type: '',
          a_create_by: `${activeUser.first_name || ''} ${activeUser.last_name || ''}`.trim()
        });
        setEditId(null);
        fetchAircraft();
      } else {
        const response = await aircraftService.create(formData);

        if (response && response.success === false) {
          Swal.fire({
            icon: 'error',
            title: 'Duplicate Entry',
            text: response.message,
          });
          return;
        }

        Swal.fire({
          icon: 'success',
          title: 'Created!',
          text: 'Aircraft record successfully created!',
          timer: 2000,
          showConfirmButton: false,
        });

        setIsFormModalOpen(false);
        setFormData({
          a_registration_number: '',
          a_aircraft_type: '',
          a_create_by: `${activeUser.first_name || ''} ${activeUser.last_name || ''}`.trim()
        });
        setEditId(null);
        fetchAircraft();
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error Saving Record',
        text: err.response?.data?.error || err.message || 'An unexpected error occurred.',
      });
    }
  };

  const handleDelete = async (id, regNumber) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Are you sure you want to delete ${regNumber}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await aircraftService.delete(id);

        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `Aircraft ${regNumber} deleted successfully.`,
          timer: 2000,
          showConfirmButton: false,
        });

        fetchAircraft();
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error!',
          text: `Error deleting record: ${err.message}`,
        });
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full bg-slate-950 text-slate-400">
        <Plane className="animate-pulse h-8 w-8 mr-3 text-sky-500" />
        Loading fleet data...
      </div>
    );
  }

  return (
    // Outer container fixed to screen height
    <div className="h-screen w-full flex flex-col bg-slate-950 p-4 sm:p-6 overflow-hidden box-border relative">

      {/* Header Section (Fixed height, won't shrink) */}
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Fleet Register</h1>
          <p className="text-slate-400 text-sm mt-1">Manage core airframe assets.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md cursor-pointer shrink-0"
        >
          <Plus className="h-5 w-5" /> Register Aircraft
        </button>
      </div>

      {error && (
        <div className="shrink-0 bg-rose-950/40 border border-rose-800 text-rose-300 p-4 rounded-xl text-sm mb-6">
          🚨 {error}
        </div>
      )}

      {/* Data Table Section (Flex-1 allows it to fill remaining screen space) */}
      {aircraftList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl min-h-0">
          <Plane className="h-12 w-12 text-slate-700 mx-auto mb-3" />
          <p className="text-slate-400 font-medium">No aircraft registered in the system yet.</p>
        </div>
      ) : (
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg flex flex-col min-h-0 overflow-hidden">
          {/* Scrollable area within the table container */}
          <div className="flex-1 overflow-auto w-full">
            <table className="w-full text-left border-collapse min-w-[700px]">
              {/* Sticky header stays visible when scrolling rows */}
              <thead className="sticky top-0 z-10 bg-slate-800 text-slate-300 text-xs uppercase tracking-wider shadow-sm">
                <tr>
                  <th className="p-4 font-bold border-b border-slate-700">Registration</th>
                  <th className="p-4 font-bold border-b border-slate-700">Aircraft Type</th>
                  <th className="p-4 font-bold border-b border-slate-700">Created By</th>
                  <th className="p-4 font-bold border-b border-slate-700">Date Logged</th>
                  <th className="p-4 font-bold text-center border-b border-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {aircraftList.map((ac) => (
                  <tr key={ac.a_id} className="hover:bg-slate-800/30 transition-colors group">
                    <td className="p-4">
                      <span className="text-white font-bold group-hover:text-sky-400 transition-colors">
                        {ac.a_registration_number}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300">{ac.a_aircraft_type}</td>
                    <td className="p-4 text-slate-400">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-slate-500" />
                        {ac.a_create_by}
                      </div>
                    </td>
                    <td className="p-4 text-slate-400 text-sm font-mono">
                      {ac.a_create_at ? new Date(ac.a_create_at).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setViewRecord(ac)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-lg transition-colors shadow-sm cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(ac)}
                          className="p-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg transition-colors shadow-sm cursor-pointer"
                          title="Edit Record"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(ac.a_id, ac.a_registration_number)}
                          className="p-2 bg-slate-800 hover:bg-rose-900/50 text-rose-400 rounded-lg transition-colors shadow-sm cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------- MODALS & TOAST CONTAINER (z-index adjusted) ----------------- */}

      {/* Floating Toast Notification (Placed with z-[100] so it sits above any active modal backdrop) */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl transition-all animate-fadeIn ${toast.type === 'error'
          ? 'bg-rose-950/90 border-rose-800 text-rose-200'
          : 'bg-emerald-950/90 border-emerald-800 text-emerald-200'
          }`}>
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" /> : <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />}
          <span className="text-xs sm:text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">

            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-white text-lg">
                {editId ? 'Edit Airframe Record' : 'New Airframe Record'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Registration Number *</label>
                <input
                  type="text"
                  name="a_registration_number"
                  value={formData.a_registration_number}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 font-mono transition-colors"
                  placeholder="e.g. N12345"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1.5">Aircraft Type *</label>
                <input
                  type="text"
                  name="a_aircraft_type"
                  value={formData.a_aircraft_type}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-sky-500 transition-colors"
                  placeholder="e.g. Boeing 737-800"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-1/2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 rounded-xl cursor-pointer shadow-md transition-colors"
                >
                  {editId ? 'Update Record' : 'Save Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Modal */}
      {viewRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <Plane className="h-5 w-5 text-sky-400" /> Asset Details
              </h3>
              <button onClick={() => setViewRecord(null)} className="text-slate-400 hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Registration Number</span>
                <p className="text-xl font-black text-white">{viewRecord.a_registration_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Aircraft Type</span>
                  <p className="text-slate-200">{viewRecord.a_aircraft_type}</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Created By</span>
                  <p className="text-slate-200 flex items-center gap-1"><User className="h-3 w-3" /> {viewRecord.a_create_by}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800">
                <span className="text-xs uppercase font-bold text-slate-500 block mb-1">System UUID</span>
                <p className="text-xs text-slate-400 font-mono break-all bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {viewRecord.a_id}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-500 block mb-1">Creation Date</span>
                <p className="text-sm text-slate-300 flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {viewRecord.a_create_at ? new Date(viewRecord.a_create_at).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setViewRecord(null)}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}