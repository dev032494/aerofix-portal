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
      confirmButtonColor: '#e11d48',
      cancelButtonColor: '#64748b',
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
      <div className="flex justify-center items-center h-screen w-full bg-slate-50 text-slate-500 font-medium">
        <Plane className="animate-pulse h-8 w-8 mr-3 text-sky-600" />
        Loading fleet data...
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 p-4 sm:p-6 overflow-hidden box-border relative">

      {/* Header Section */}
      <div className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Fleet Register</h1>
          <p className="text-slate-500 text-sm mt-1">Manage core airframe assets.</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 px-5 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer shrink-0"
        >
          <Plus className="h-5 w-5" /> Register Aircraft
        </button>
      </div>

      {error && (
        <div className="shrink-0 bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm mb-6 font-medium">
          🚨 {error}
        </div>
      )}

      {/* Responsive Fleet Register Display Area */}
      {aircraftList.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl min-h-0 shadow-sm">
          <Plane className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No aircraft registered in the system yet.</p>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          
          {/* MOBILE VIEW: SINGLE COLUMN CARD LIST (< sm screens) */}
          <div className="block sm:hidden space-y-3 overflow-y-auto max-h-[72vh] pr-1">
            {aircraftList.map((ac) => (
              <div key={ac.a_id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
                <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <Plane className="h-4 w-4 text-sky-600 shrink-0" />
                    <span className="font-bold text-sm text-slate-900">{ac.a_registration_number}</span>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                    {ac.a_create_at ? new Date(ac.a_create_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>

                <div className="space-y-1 text-xs text-slate-600">
                  <p><span className="font-bold text-slate-400 uppercase text-[9px] block">Type:</span> <span className="text-slate-800 font-semibold">{ac.a_aircraft_type}</span></p>
                  <p className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-slate-400" /> <span className="truncate">{ac.a_create_by}</span></p>
                </div>

                <div className="pt-2 flex gap-2 justify-end border-t border-slate-100">
                  <button
                    onClick={() => setViewRecord(ac)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-sky-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  <button
                    onClick={() => handleOpenEdit(ac)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-amber-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ac.a_id, ac.a_registration_number)}
                    className="p-2 bg-slate-50 hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* TABLET VIEW: 2-COLUMN GRID (sm to lg screens) */}
          <div className="hidden sm:grid lg:hidden grid-cols-2 gap-4 overflow-y-auto max-h-[72vh] pr-1">
            {aircraftList.map((ac) => (
              <div key={ac.a_id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <div className="flex justify-between items-start gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <Plane className="h-4 w-4 text-sky-600 shrink-0" />
                      <span className="font-bold text-sm text-slate-900">{ac.a_registration_number}</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {ac.a_create_at ? new Date(ac.a_create_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs text-slate-600">
                    <p><span className="font-bold text-slate-400 uppercase text-[9px] block">Type:</span> <span className="text-slate-800 font-semibold">{ac.a_aircraft_type}</span></p>
                    <p className="flex items-center gap-1.5"><User className="h-3.5 w-3.5 text-slate-400" /> <span className="truncate">{ac.a_create_by}</span></p>
                  </div>
                </div>

                <div className="pt-2 flex gap-2 justify-end border-t border-slate-100">
                  <button
                    onClick={() => setViewRecord(ac)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-sky-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" /> View
                  </button>
                  <button
                    onClick={() => handleOpenEdit(ac)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 text-amber-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(ac.a_id, ac.a_registration_number)}
                    className="p-2 bg-slate-50 hover:bg-rose-50 text-rose-600 rounded-lg border border-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: STANDARD TABLE (lg+ screens) */}
          <div className="hidden lg:flex flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm flex-col min-h-0 overflow-hidden">
            <div className="flex-1 overflow-auto w-full">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead className="sticky top-0 z-10 bg-slate-100 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-4 font-bold border-b border-slate-200">Registration</th>
                    <th className="p-4 font-bold border-b border-slate-200">Aircraft Type</th>
                    <th className="p-4 font-bold border-b border-slate-200">Created By</th>
                    <th className="p-4 font-bold border-b border-slate-200">Date Logged</th>
                    <th className="p-4 font-bold text-center border-b border-slate-200">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {aircraftList.map((ac) => (
                    <tr key={ac.a_id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="p-4">
                        <span className="text-slate-900 font-bold group-hover:text-sky-600 transition-colors">
                          {ac.a_registration_number}
                        </span>
                      </td>
                      <td className="p-4 text-slate-600 font-medium">{ac.a_aircraft_type}</td>
                      <td className="p-4 text-slate-500">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-slate-400" />
                          {ac.a_create_by}
                        </div>
                      </td>
                      <td className="p-4 text-slate-500 text-sm font-mono">
                        {ac.a_create_at ? new Date(ac.a_create_at).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewRecord(ac)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-sky-600 rounded-lg transition-colors border border-slate-200 shadow-xs cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(ac)}
                            className="p-2 bg-slate-100 hover:bg-slate-200 text-amber-600 rounded-lg transition-colors border border-slate-200 shadow-xs cursor-pointer"
                            title="Edit Record"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(ac.a_id, ac.a_registration_number)}
                            className="p-2 bg-slate-100 hover:bg-rose-50 text-rose-600 hover:border-rose-200 rounded-lg transition-colors border border-slate-200 shadow-xs cursor-pointer"
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

        </div>
      )}

      {/* Floating Toast Notification */}
      {toast.show && (
        <div className={`fixed top-5 right-5 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl transition-all animate-fadeIn ${
          toast.type === 'error' ? 'bg-rose-50 border-rose-200 text-rose-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? <AlertCircle className="h-5 w-5 text-rose-600 shrink-0" /> : <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />}
          <span className="text-xs sm:text-sm font-semibold">{toast.message}</span>
        </div>
      )}

      {/* Form Modal (Create / Edit) */}
      {isFormModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg">
                {editId ? 'Edit Airframe Record' : 'New Airframe Record'}
              </h3>
              <button onClick={() => setIsFormModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"><X className="h-5 w-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Registration Number *</label>
                <input
                  type="text"
                  name="a_registration_number"
                  value={formData.a_registration_number}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white font-mono transition-colors"
                  placeholder="e.g. N12345"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Aircraft Type *</label>
                <input
                  type="text"
                  name="a_aircraft_type"
                  value={formData.a_aircraft_type}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-sky-500 focus:bg-white transition-colors"
                  placeholder="e.g. Boeing 737-800"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-1/2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl cursor-pointer shadow-sm transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                <Plane className="h-5 w-5 text-sky-600" /> Asset Details
              </h3>
              <button onClick={() => setViewRecord(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors"><X className="h-5 w-5" /></button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Registration Number</span>
                <p className="text-xl font-black text-slate-900">{viewRecord.a_registration_number}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100">
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Aircraft Type</span>
                  <p className="text-slate-700 font-medium">{viewRecord.a_aircraft_type}</p>
                </div>
                <div>
                  <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Created By</span>
                  <p className="text-slate-700 font-medium flex items-center gap-1"><User className="h-3 w-3 text-slate-400" /> {viewRecord.a_create_by}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">System UUID</span>
                <p className="text-xs text-slate-600 font-mono break-all bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                  {viewRecord.a_id}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Creation Date</span>
                <p className="text-sm text-slate-600 font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {viewRecord.a_create_at ? new Date(viewRecord.a_create_at).toLocaleString() : 'N/A'}
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => setViewRecord(null)}
                  className="w-full bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 font-bold py-2.5 rounded-xl cursor-pointer transition-colors"
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