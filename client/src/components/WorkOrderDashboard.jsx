import React, { useState, useEffect, useRef } from 'react';
import { workOrderService, instructorService, userService, workOrderListService } from '../services/api';
import { Plus, X, ClipboardList, Calendar, User, Activity, Search, ChevronDown, Eye } from 'lucide-react';

// --- CUSTOM SEARCHABLE DROPDOWN COMPONENT ---
const SearchableDropdown = ({ options, value, onChange, placeholder, isLoading, displayKey, valueKey }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find(opt => String(opt[valueKey]) === String(value));
  const displayValue = selectedOption
    ? `${selectedOption[displayKey.first] || ''} ${selectedOption[displayKey.last] || ''} ${selectedOption[displayKey.extra] ? `(${selectedOption[displayKey.extra]})` : ''}`.trim()
    : '';

  const filteredOptions = options.filter(opt => {
    const text = `${opt[displayKey.first] || ''} ${opt[displayKey.last] || ''} ${opt[displayKey.extra] || ''}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 flex items-center justify-between cursor-pointer focus-within:ring-2 focus-within:ring-sky-500 focus-within:bg-white transition-all text-sm"
      >
        <div className="flex items-center gap-2 flex-1 truncate">
          <Search className="h-4 w-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder={displayValue || placeholder}
            value={isOpen ? search : displayValue}
            onChange={(e) => {
              setSearch(e.target.value);
              if (!isOpen) setIsOpen(true);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(true);
            }}
            className="bg-transparent border-none outline-none text-slate-900 w-full placeholder-slate-400 cursor-pointer text-sm"
          />
        </div>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-xl divide-y divide-slate-100">
          {isLoading ? (
            <div className="p-3 text-xs text-slate-400 text-center">Loading options...</div>
          ) : filteredOptions.length > 0 ? (
            filteredOptions.map((opt) => {
              const id = opt[valueKey];
              const firstName = opt[displayKey.first] || '';
              const lastName = opt[displayKey.last] || '';
              const extraInfo = opt[displayKey.extra] ? `(${opt[displayKey.extra]})` : '';

              return (
                <div
                  key={`opt-${id}`}
                  onClick={() => {
                    onChange(id);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className="p-3 hover:bg-slate-50 cursor-pointer text-xs text-slate-900 transition-colors flex items-center justify-between"
                >
                  <span>{firstName} {lastName} <span className="text-slate-400 text-[11px]">{extraInfo}</span></span>
                  {String(value) === String(id) && <span className="text-sky-600 font-bold">✓</span>}
                </div>
              );
            })
          ) : (
            <div className="p-3 text-xs text-slate-400 text-center">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

// --- MAIN DASHBOARD COMPONENT ---
const WorkOrderDashboard = () => {
  const [workOrders, setWorkOrders] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [students, setStudents] = useState([]);
  const [workOrderList, setWorkOrderList] = useState([]);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState(null);

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingInstructors, setIsLoadingInstructors] = useState(false);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isLoadingWorkOrderList, setIsLoadingWorkOrderList] = useState(false);
  
  // State to handle loading detailed work order info
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    wo_instructor: '',
    wo_approve_by: '',
  });

  const [personnel, setPersonnel] = useState([{ user_id: '' }]);
  const [items, setItems] = useState([{ wol_id: '' }]);

  useEffect(() => {
    fetchWorkOrders();
    fetchInstructors();
    fetchStudents();
    fetchWorkOrderList();
  }, []);

  const fetchWorkOrders = async () => {
    setIsLoadingData(true);
    try {
      const res = await workOrderService.getAllWorkOrders();
      let dataArray = [];
      if (Array.isArray(res)) dataArray = res;
      else if (res?.data && Array.isArray(res.data)) dataArray = res.data;
      else if (res?.workOrders && Array.isArray(res.workOrders)) dataArray = res.workOrders;
      setWorkOrders(dataArray);
    } catch (error) {
      console.error("Error fetching work orders:", error);
      setWorkOrders([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const fetchInstructors = async () => {
    setIsLoadingInstructors(true);
    try {
      const res = await instructorService.getAllInstructors();
      const dataArray = res?.data?.instructors || res?.instructors || [];
      setInstructors(dataArray);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      setInstructors([]);
    } finally {
      setIsLoadingInstructors(false);
    }
  };

  const fetchStudents = async () => {
    setIsLoadingStudents(true);
    try {
      const res = await userService.getAllStudentRole();
      const dataArray = res?.data?.data?.users || res?.data?.users || res?.users || [];
      setStudents(dataArray);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  };

  const fetchWorkOrderList = async () => {
    setIsLoadingWorkOrderList(true);
    try {
      const res = await workOrderListService.getAll();
      const dataArray = res?.data || res?.data?.workorderlist || res?.workorderlist || [];
      setWorkOrderList(dataArray);
    } catch (error) {
      console.error("Error fetching work order list:", error);
      setWorkOrderList([]);
    } finally {
      setIsLoadingWorkOrderList(false);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const addPersonnelRow = () => setPersonnel([...personnel, { user_id: '' }]);
  const removePersonnelRow = (index) => setPersonnel(personnel.filter((_, i) => i !== index));
  const handlePersonnelChange = (index, value) => {
    const updated = [...personnel];
    updated[index].user_id = value;
    setPersonnel(updated);
  };

  const addItemRow = () => setItems([...items, { wol_id: '' }]);
  const removeItemRow = (index) => setItems(items.filter((_, i) => i !== index));
  const handleItemChange = (index, value) => {
    const updated = [...items];
    updated[index].wol_id = value;
    setItems(updated);
  };

  useEffect(() => {
    const cachedUser = localStorage.getItem("aerofix_user");
    if (cachedUser) {
      try {
        const activeUser = JSON.parse(cachedUser);
        setFormData({
          wo_instructor: activeUser.id || activeUser.user_id,
          wo_approve_by: activeUser.id || activeUser.user_id
        });
      } catch (e) {
        console.error("Error parsing user data");
      }
    }
  }, []);

  const resetForm = () => {
    setPersonnel([{ user_id: '' }]);
    setItems([{ wol_id: '' }]);
    setMessage('');
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedWorkOrder(null);
  };

  const handleViewDetails = async (wo) => {
    setSelectedWorkOrder(wo);
    setIsViewModalOpen(true);
    setIsLoadingDetails(true);

    try {
      const res = await workOrderService.viewWorkOrderDetails(wo.wo_work_order_number); 
      const detailedData = res?.data?.data || res?.data || res;
      setSelectedWorkOrder(detailedData);
    } catch (error) {
      console.error("Error fetching detailed work order info:", error);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const payload = {
      workorder: { 
        wo_instructor: parseInt(formData.wo_instructor), 
        wo_approve_by: parseInt(formData.wo_approve_by) 
      },
      personnel: personnel.map(p => parseInt(p.user_id)).filter(id => !isNaN(id)),
      items: items.map(i => parseInt(i.wol_id)).filter(id => !isNaN(id))
    };

    try {
      await workOrderService.createWorkOrder(payload);
      setMessage('✅ Work Order successfully created!');
      fetchWorkOrders();
      fetchInstructors();
      fetchStudents();
      fetchWorkOrderList();
      setTimeout(() => closeModal(), 1500);
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50 text-slate-900">
      <div className="w-full bg-white border border-slate-200 rounded-xl sm:rounded-2xl shadow-xs overflow-hidden flex flex-col flex-1 max-h-[calc(100vh-2rem)]">
        
        {/* Header Section */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 flex justify-between items-center border-b border-slate-200 bg-white shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 bg-sky-50 border border-sky-200 rounded-lg shrink-0 text-sky-600">
              <ClipboardList className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-black text-slate-900 truncate uppercase tracking-tight">Work Orders</h1>
              <p className="text-slate-500 text-xs mt-1 truncate">Manage and track maintenance work orders.</p>
            </div>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-sky-600 hover:bg-sky-500 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 font-bold text-xs transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" /> New Work Order
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="p-3 sm:p-5 md:p-6 bg-slate-50 w-full flex flex-col flex-1 overflow-y-auto box-border custom-scrollbar space-y-4">

          {/* Table Section */}
          <div className="bg-white border border-slate-200 rounded-2xl flex-1 overflow-hidden flex flex-col shadow-xs">
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/70 border-b border-slate-200 text-slate-600 text-[10px] font-bold uppercase tracking-wider sticky top-0 z-10">
                    <th className="p-4 pl-6">Work Order No.</th>
                    <th className="p-4">Date / Time</th>
                    <th className="p-4">Created By</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right pr-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoadingData ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic text-xs">Loading work orders...</td></tr>
                  ) : (!Array.isArray(workOrders) || workOrders.length === 0) ? (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400 italic text-xs">No work orders found.</td></tr>
                  ) : (
                    workOrders.map((wo) => (
                      <tr key={wo.wo_id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 pl-6 font-mono text-sky-600 font-bold text-xs">{wo.wo_work_order_number}</td>
                        <td className="p-4 text-slate-700 text-xs flex items-center gap-2">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(wo.wo_date)}
                        </td>
                        
                        <td className="p-4 text-slate-700 text-xs">
                          <div className="flex items-center gap-2">
                            <User className="h-3.5 w-3.5 text-slate-400" />
                            {wo.instructor 
                              ? `${wo.instructor.first_name} ${wo.instructor.middle_name || ''} ${wo.instructor.last_name}`.replace(/\s+/g, ' ')
                              : `ID: ${wo.wo_instructor}`
                            }
                          </div>
                        </td>

                        <td className="p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-max border
                            ${wo.wo_status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                              wo.wo_status === 'ongoing' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                'bg-slate-100 text-slate-600 border-slate-200'}`}
                          >
                            <Activity className="h-3 w-3" />
                            {wo.wo_status || 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-right pr-6">
                          <button 
                            onClick={() => handleViewDetails(wo)} 
                            className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg transition-all border border-slate-300 shadow-xs cursor-pointer inline-flex items-center gap-1 text-xs font-bold"
                            title="View Details"
                          >
                            <Eye className="h-3.5 w-3.5 text-sky-600" /> View
                          </button>
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

      {/* ---------------- VIEW DETAILS MODAL ---------------- */}
      {isViewModalOpen && selectedWorkOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl w-full max-w-2xl max-h-full flex flex-col overflow-hidden text-xs">
            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2 uppercase">
                  <ClipboardList className="h-4 w-4 text-sky-600" />
                  Work Order Details
                </h2>
                <p className="text-sky-600 font-mono text-xs mt-0.5">{selectedWorkOrder.wo_work_order_number}</p>
              </div>
              <button onClick={closeViewModal} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-400 font-bold uppercase text-[10px] mb-1">Created Date</p>
                  <p className="font-semibold text-slate-900">{formatDate(selectedWorkOrder.wo_date)}</p>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-400 font-bold uppercase text-[10px] mb-1">Status</p>
                  <p className="font-semibold text-slate-900 uppercase tracking-wide">{selectedWorkOrder.wo_status || 'Active'}</p>
                </div>
              </div>

              {/* Display Personnel */}
              <div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1.5">Assigned Personnel</h3>
                {isLoadingDetails ? (
                  <div className="flex items-center gap-2.5 p-3 text-xs text-sky-600 font-bold animate-pulse">
                    <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    Fetching personnel...
                  </div>
                ) : selectedWorkOrder.personnel && selectedWorkOrder.personnel.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedWorkOrder.personnel.map((person, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-700">
                          Student: <span className="font-bold text-slate-900">
                            {person.user 
                              ? `${person.user.first_name} ${person.user.middle_name || ''} ${person.user.last_name}`.replace(/\s+/g, ' ')
                              : `User ID: ${person.wop_user_id}` 
                            }
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic p-2">No personnel assigned.</p>
                )}
              </div>

              {/* Display Items */}
              <div>
                <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5 border-b border-slate-200 pb-1.5">Work Order Items</h3>
                {isLoadingDetails ? (
                  <div className="flex items-center gap-2.5 p-3 text-xs text-sky-600 font-bold animate-pulse">
                    <div className="w-3.5 h-3.5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                    Fetching items...
                  </div>
                ) : selectedWorkOrder.items && selectedWorkOrder.items.length > 0 ? (
                  <ul className="space-y-2">
                    {selectedWorkOrder.items.map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                        <ClipboardList className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-slate-700">
                          Task: <span className="font-bold text-slate-900">
                            {item.workOrderListDetails 
                              ? item.workOrderListDetails.wol_description 
                              : `List ID: ${item.woi_work_order_list_id}` 
                            }
                          </span>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 italic p-2">No items assigned.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
               <button onClick={closeViewModal} className="px-4 py-2 rounded-xl text-slate-700 font-bold bg-white hover:bg-slate-100 border border-slate-300 transition-all cursor-pointer shadow-xs">
                  Close
               </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------------- CREATE MODAL OVERLAY ---------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 shadow-xl rounded-2xl w-full max-w-3xl max-h-full flex flex-col overflow-hidden text-xs">

            <div className="flex justify-between items-center p-5 border-b border-slate-200 bg-slate-50">
              <h2 className="text-base font-bold text-slate-900 uppercase">Create Work Order</h2>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-200/50 transition-colors cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {message && (
                <div className={`p-3.5 rounded-xl border text-xs font-semibold ${message.includes('✅') ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'}`}>
                  {message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Personnel Details */}
                <div>
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1.5">Assign Personnel (Students)</h3>
                  <div className="space-y-3">
                    {personnel.map((p, index) => {
                      const selectedUserIds = personnel
                        .filter((_, i) => i !== index)
                        .map(per => String(per.user_id))
                        .filter(id => id !== '');

                      const availableStudents = students.filter(
                        opt => !selectedUserIds.includes(String(opt.student_id || opt.id))
                      );

                      return (
                        <div key={`personnel-${index}`} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Personnel Row #{index + 1}</span>
                            {personnel.length > 1 && (
                              <button type="button" onClick={() => removePersonnelRow(index)} className="text-rose-600 hover:text-rose-700 p-1 rounded transition-colors cursor-pointer">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <SearchableDropdown
                            options={availableStudents}
                            value={p.user_id}
                            onChange={(val) => handlePersonnelChange(index, val)}
                            placeholder="Type to search student by name or email..."
                            isLoading={isLoadingStudents}
                            valueKey="student_id"
                            displayKey={{ first: 'first_name', last: 'last_name', extra: 'email' }}
                          />
                        </div>
                      );
                    })}
                    <button type="button" onClick={addPersonnelRow} className="text-xs font-bold text-sky-600 hover:text-sky-500 flex items-center gap-1.5 py-1 cursor-pointer">
                      <Plus className="h-3.5 w-3.5" /> Add Another User
                    </button>
                  </div>
                </div>

                {/* Items Details using SearchableDropdown */}
                <div>
                  <h3 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-3 border-b border-slate-200 pb-1.5">Work Order Items</h3>
                  <div className="space-y-3">
                    {items.map((item, index) => {
                      const selectedItemIds = items
                        .filter((_, i) => i !== index)
                        .map(i => String(i.wol_id))
                        .filter(id => id !== '');

                      const availableWorkOrderList = workOrderList.filter(
                        opt => !selectedItemIds.includes(String(opt.wol_id))
                      );

                      return (
                        <div key={`item-${index}`} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Item Row #{index + 1}</span>
                            {items.length > 1 && (
                              <button type="button" onClick={() => removeItemRow(index)} className="text-rose-600 hover:text-rose-700 p-1 rounded transition-colors cursor-pointer">
                                <X className="h-4 w-4" />
                              </button>
                            )}
                          </div>

                          <SearchableDropdown
                            options={availableWorkOrderList}
                            value={item.wol_id}
                            onChange={(val) => handleItemChange(index, val)}
                            placeholder="Type to search work order item..."
                            isLoading={isLoadingWorkOrderList}
                            valueKey="wol_id"
                            displayKey={{ first: 'wol_description', extra: 'wol_id' }}
                          />
                        </div>
                      );
                    })}
                    <button type="button" onClick={addItemRow} className="text-xs font-bold text-sky-600 hover:text-sky-500 flex items-center gap-1.5 py-1 cursor-pointer">
                      <Plus className="h-3.5 w-3.5" /> Add Another Item
                    </button>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex gap-3 justify-end">
                  <button type="button" onClick={closeModal} className="px-4 py-2 rounded-xl text-slate-700 font-bold bg-slate-100 hover:bg-slate-200 border border-slate-300 transition-all cursor-pointer">
                    Cancel
                  </button>
                  <button type="submit" disabled={loading} className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold disabled:opacity-50 transition-all shadow-xs cursor-pointer">
                    {loading ? 'Processing...' : 'Submit Work Order'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkOrderDashboard;