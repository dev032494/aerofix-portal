import React, { useState, useEffect } from 'react';
import { ClipboardList, BookOpen, Calendar, LineChart, Plus, Save, FileText, Wrench, Hammer, Edit2, Trash2, X, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import Swal from 'sweetalert2';
import { taskService, manualService, maintenanceSchedulePlanningService, aircraftService } from '../services/api';

// --- Task Tab with API Integration for Master-Detail (Task Detail & Task Items) ---
const TaskTab = () => {
  const [taskDetails, setTaskDetails] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [taskItemsMap, setTaskItemsMap] = useState({}); // Dictionary mapping task ID to its items array

  // Form state for Task Detail (Master)
  const [taskDetailForm, setTaskDetailForm] = useState({
    td_name: ''
  });

  // Form state for Task Item (Detail)
  const [selectedTaskDetailId, setSelectedTaskDetailId] = useState(null);
  const [taskItemForm, setTaskItemForm] = useState({
    ti_task_detail_id: '',
    ti_description: '',
  });

  const fetchTaskDetails = async () => {
    try {
      const response = await taskService.getTaskDetailList().catch(() => []);
      const dataArray = Array.isArray(response) ? response : (response?.data || []);
      setTaskDetails(dataArray);
    } catch (err) {
      console.error(err);
      setTaskDetails([]);
    }
  };

  useEffect(() => {
    fetchTaskDetails();
  }, []);

  const handleCreateTaskDetail = async (e) => {
    e.preventDefault();
    try {
      await taskService.createTaskDetail(taskDetailForm);
      Swal.fire({
        icon: 'success',
        title: 'Task Created!',
        text: 'New task record has been successfully registered.',
        timer: 2000,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#f1f5f9'
      });
      setIsModalOpen(false);
      setTaskDetailForm({ td_name: '' });
      fetchTaskDetails();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || err.message || 'Failed to create task record',
        icon: 'error',
        background: '#0f172a',
        color: '#f1f5f9'
      });
    }
  };

  const handleCreateTaskItem = async (e) => {
    e.preventDefault();
    try {
      await taskService.createTaskItem({
        ...taskItemForm,
        ti_task_detail_id: selectedTaskDetailId
      });
      Swal.fire({
        icon: 'success',
        title: 'Item Added!',
        text: 'Task item successfully linked to the task.',
        timer: 2000,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#f1f5f9'
      });
      setIsItemModalOpen(false);
      setTaskItemForm({ ti_task_detail_id: '', ti_description: '' });
      fetchTaskDetails();
      if (selectedTaskDetailId) {
        await fetchTaskItems(selectedTaskDetailId);
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || err.message || 'Failed to add task item',
        icon: 'error',
        background: '#0f172a',
        color: '#f1f5f9'
      });
    }
  };

  const fetchTaskItems = async (taskId) => {
    try {
      const response = await taskService.getTaskItem(taskId).catch(() => []);
      const dataArray = Array.isArray(response) ? response : (response?.data || []);
      setTaskItemsMap((prev) => ({
        ...prev,
        [taskId]: dataArray
      }));
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || err.message || 'Failed to fetch task items',
        icon: 'error',
        background: '#0f172a',
        color: '#f1f5f9'
      });
      setTaskItemsMap((prev) => ({
        ...prev,
        [taskId]: []
      }));
    }
  };

  const toggleExpand = async (taskId) => {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    } else {
      setExpandedTaskId(taskId);
      if (!taskItemsMap[taskId]) {
        await fetchTaskItems(taskId);
      }
    }
  };

  return (
    <div className="animate-[anxFadeIn_0.3s_ease-out] w-full flex flex-col gap-4">
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 shrink-0">
            <ClipboardList className="h-5 w-5 text-sky-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-50 mb-0.5 truncate">Task Management</h2>
            <p className="text-xs sm:text-sm text-slate-400 truncate">Manage task records and assign operational sub-items.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-sky-600/20 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Add Task Record
        </button>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <h3 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Registered Task Records</h3>
        {taskDetails.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 border border-slate-800/80 rounded-xl text-slate-500 text-sm">
            No task records found. Click "Add Task Record" to create a master task.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-full">
            {taskDetails.map((task) => {
              const isExpanded = expandedTaskId === task.td_id;
              const currentTaskItems = taskItemsMap[task.td_id] || [];

              return (
                <div key={task.td_id} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 cursor-pointer flex-1" onClick={() => toggleExpand(task.td_id)}>
                      <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg shrink-0">
                        <Wrench className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <strong className="text-slate-100 text-sm font-semibold truncate flex items-center gap-2">
                          {task.td_name}
                          {currentTaskItems.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                              {currentTaskItems.length} {currentTaskItems.length === 1 ? 'item' : 'items'}
                            </span>
                          )}
                        </strong>
                        <span className="text-slate-500 text-[11px] mt-0.5 truncate">Click to view items or add new specifications</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedTaskDetailId(task.td_id);
                          setIsItemModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 text-xs font-semibold rounded-lg border border-sky-500/20 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Item
                      </button>
                      <button
                        onClick={() => toggleExpand(task.td_id)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg border border-slate-700 transition-all cursor-pointer"
                        title={isExpanded ? "Collapse Items" : "Expand Items"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Items List */}
                  {isExpanded && (
                    <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-col gap-2 pl-2 sm:pl-11 animate-[anxFadeIn_0.2s_ease-out]">
                      {currentTaskItems.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">No task items recorded yet for this task record.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {currentTaskItems.map((item, idx) => (
                            <div key={item.ti_id || idx} className="flex items-start justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <p className="text-xs sm:text-sm text-slate-300 break-words">
                                  {item.ti_description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Creating Task Detail */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-sky-400" /> New Task Record
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTaskDetail} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Task Name / Title</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-50 text-sm focus:outline-none focus:border-sky-500"
                  placeholder="e.g., Engine Inspection"
                  value={taskDetailForm.td_name}
                  onChange={(e) => setTaskDetailForm({ ...taskDetailForm, td_name: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-white bg-sky-600 hover:bg-sky-500 text-sm font-semibold cursor-pointer shadow-lg shadow-sky-600/20">Save Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding Task Item */}
      {isItemModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-sky-400" /> Add Task Item
              </h3>
              <button onClick={() => setIsItemModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateTaskItem} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Item Specification / Details</label>
                <textarea
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-50 text-sm focus:outline-none focus:border-sky-500 resize-none min-h-[80px]"
                  placeholder="Specification info..."
                  rows="3"
                  value={taskItemForm.ti_description}
                  onChange={(e) => setTaskItemForm({ ...taskItemForm, ti_description: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-white bg-sky-600 hover:bg-sky-500 text-sm font-semibold cursor-pointer shadow-lg shadow-sky-600/20">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const ManualTab = () => {
  const [manualDetails, setManualDetails] = useState([]);
  const [expandedManualId, setExpandedManualId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [manualItemsMap, setManualItemsMap] = useState({});

  // Form state for Manual Detail (Master)
  const [manualForm, setManualForm] = useState({
    md_name: '',
  });

  // Form state for Manual Item (Detail)
  const [selectedManualDetailId, setSelectedManualDetailId] = useState(null);
  const [manualItemForm, setManualItemForm] = useState({
    mi_manual_detail_id: '',
    mi_description: '',
  });

  const fetchManuals = async () => {
    try {
      const response = await manualService.getManualList().catch(() => []);
      const dataArray = Array.isArray(response) ? response : (response?.data || []);
      setManualDetails(dataArray);
    } catch (err) {
      console.error(err);
      setManualDetails([]);
    }
  };

  useEffect(() => {
    fetchManuals();
  }, []);

  const handleCreateManual = async (e) => {
    e.preventDefault();
    try {
      await manualService.createManualDetail(manualForm);
      Swal.fire({
        icon: 'success',
        title: 'Manual Registered!',
        text: 'New manual entry has been successfully saved.',
        timer: 2000,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#f1f5f9'
      });
      setIsModalOpen(false);
      setManualForm({ md_name: '' });
      fetchManuals();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || err.message || 'Failed to register manual entry',
        icon: 'error',
        background: '#0f172a',
        color: '#f1f5f9'
      });
    }
  };

  const handleCreateManualItem = async (e) => {
    e.preventDefault();
    try {
      await manualService.createManualItem({
        ...manualItemForm,
        mi_manual_detail_id: selectedManualDetailId
      });
      Swal.fire({
        icon: 'success',
        title: 'Item Added!',
        text: 'Manual item successfully linked.',
        timer: 2000,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#f1f5f9'
      });
      setIsItemModalOpen(false);
      setManualItemForm({ mi_manual_detail_id: '', mi_description: '' });
      fetchManuals();
      if (selectedManualDetailId) {
        await fetchManualItems(selectedManualDetailId);
      }
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || err.message || 'Failed to add manual item',
        icon: 'error',
        background: '#0f172a',
        color: '#f1f5f9'
      });
    }
  };

  const fetchManualItems = async (manualId) => {
    try {
      const response = await manualService.getManualItem(manualId).catch(() => []);
      const dataArray = Array.isArray(response) ? response : (response?.data || []);
      console.log(dataArray);
      setManualItemsMap((prev) => ({ ...prev, [manualId]: dataArray }));
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || err.message || 'Failed to fetch manual items',
        icon: 'error',
        background: '#0f172a',
        color: '#f1f5f9'
      });
      setManualItemsMap([]);
    }
  };

  const toggleExpand = async (manualId) => {
    if (expandedManualId === manualId) {
      setExpandedManualId(null);
    } else {
      setExpandedManualId(manualId);
      if (!manualItemsMap[manualId]) {
        await fetchManualItems(manualId);
      }
    }
  };

  return (
    <div className="animate-[anxFadeIn_0.3s_ease-out] w-full flex flex-col gap-4">
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shrink-0">
            <BookOpen className="h-5 w-5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-50 mb-0.5 truncate">Manual Entries</h2>
            <p className="text-xs sm:text-sm text-slate-400 truncate">Upload and maintain technical manuals and standard operating procedures.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-600/20 cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Register Manual Entry
        </button>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <h3 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Library Reference</h3>
        {manualDetails.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 border border-slate-800/80 rounded-xl text-slate-500 text-sm">
            No manual records found. Click "Register Manual Entry" to add documentation.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-full">
            {manualDetails.map((manual) => {
              const isExpanded = expandedManualId === manual.md_id;
              const currentManualItems = manualItemsMap[manual.md_id] || [];

              return (
                <div key={manual.md_id} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-3 min-w-0 cursor-pointer flex-1" onClick={() => toggleExpand(manual.md_id)}>
                      <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg shrink-0">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <strong className="text-slate-100 text-sm font-semibold truncate flex items-center gap-2">
                          {manual.md_name}
                          {currentManualItems.length > 0 && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                              {currentManualItems.length} {currentManualItems.length === 1 ? 'item' : 'items'}
                            </span>
                          )}
                        </strong>
                        <span className="text-slate-500 text-[11px] mt-0.5 truncate">Click to view items or add new specifications</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => {
                          setSelectedManualDetailId(manual.md_id);
                          setIsItemModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 text-xs font-semibold rounded-lg border border-emerald-500/20 transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Item
                      </button>
                      <button
                        onClick={() => toggleExpand(manual.md_id)}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg border border-slate-700 transition-all cursor-pointer"
                        title={isExpanded ? "Collapse Items" : "Expand Items"}
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Items List */}
                  {isExpanded && (
                    <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-col gap-2 pl-2 sm:pl-11 animate-[anxFadeIn_0.2s_ease-out]">
                      {currentManualItems.length === 0 ? (
                        <p className="text-xs text-slate-500 italic py-2">No manual items recorded yet for this record.</p>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {currentManualItems.map((item) => (
                            <div key={item.mi_id} className="flex items-start justify-between gap-3 p-3 bg-slate-900/80 border border-slate-800 rounded-lg">
                              <div className="flex items-start gap-2.5 min-w-0">
                                <p className="text-xs sm:text-sm text-slate-300 break-words">
                                  {item.mi_description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Registering Manual Entry */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="h-5 w-5 text-emerald-400" /> New Manual Entry
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateManual} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Document Title</label>
                <input
                  type="text"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-50 text-sm focus:outline-none focus:border-emerald-500"
                  placeholder="e.g., Boeing 737 Hydraulics"
                  value={manualForm.md_name}
                  onChange={(e) => setManualForm({ ...manualForm, md_name: e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold cursor-pointer shadow-lg shadow-emerald-600/20">Save Manual</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Adding Manual Item */}
      {isItemModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Add Manual Item
              </h3>
              <button onClick={() => setIsItemModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateManualItem} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Item Specification / Details</label>
                <textarea
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-50 text-sm focus:outline-none focus:border-emerald-500 resize-none min-h-[80px]"
                  placeholder="Specification info..."
                  rows="3"
                  value={manualItemForm.mi_description}
                  onChange={(e) => setManualItemForm({ ...manualItemForm, mi_description: e.target.value })}
                  required
                ></textarea>
              </div>
              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-white bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold cursor-pointer shadow-lg shadow-emerald-600/20">Add Item</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Updated MaintenanceScheduleTab with fetched schedules grouped by month, displaying tasks, manuals, and their respective child items ---
const MaintenanceScheduleTab = () => {
  const [schedules, setSchedules] = useState([]);
  const [aircraftList, setAircraftList] = useState([]);
  const [taskDetails, setTaskDetails] = useState([]);
  const [manualDetails, setManualDetails] = useState([]);
  const [taskItemsMap, setTaskItemsMap] = useState({});
  const [manualItemsMap, setManualItemsMap] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedMonth, setExpandedMonth] = useState(null);

  // Form state corresponding to maintenance_planning_schedule schema
  const [scheduleForm, setScheduleForm] = useState({
    mps_aircraft_id: '',
    mps_task_detail_id: '',
    mps_manual_detail_id: '',
    mps_recuring_month: 'January'
  });

  const monthsList = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const fetchTaskItems = async (taskId) => {
    if (taskItemsMap[taskId]) return;
    try {
      const response = await taskService.getTaskItem(taskId).catch(() => []);
      const dataArray = Array.isArray(response) ? response : (response?.data || []);
      setTaskItemsMap(prev => ({ ...prev, [taskId]: dataArray }));
    } catch (err) {
      setTaskItemsMap(prev => ({ ...prev, [taskId]: [] }));
    }
  };

  const fetchManualItems = async (manualId) => {
    if (manualItemsMap[manualId]) return;
    try {
      const response = await manualService.getManualItem(manualId).catch(() => []);
      const dataArray = Array.isArray(response) ? response : (response?.data || []);
      setManualItemsMap(prev => ({ ...prev, [manualId]: dataArray }));
    } catch (err) {
      setManualItemsMap(prev => ({ ...prev, [manualId]: [] }));
    }
  };

  const fetchData = async () => {
    try {
      const [tasksRes, manualsRes, aircraftRes, schedulesRes] = await Promise.all([
        taskService.getTaskDetailList().catch(() => []),
        manualService.getManualList().catch(() => []),
        aircraftService.getAllAircraft().catch(() => []),
        maintenanceSchedulePlanningService.getMaintenanceScheduleList().catch(() => [])
      ]);

      const tasks = Array.isArray(tasksRes) ? tasksRes : (tasksRes?.data || []);
      const manuals = Array.isArray(manualsRes) ? manualsRes : (manualsRes?.data || []);

      setTaskDetails(tasks);
      setManualDetails(manuals);
      setAircraftList(Array.isArray(aircraftRes) ? aircraftRes : (aircraftRes?.data || []));
      setSchedules(Array.isArray(schedulesRes) ? schedulesRes : (schedulesRes?.data || []));

      // Prefetch nested items for all referenced tasks and manuals so they display immediately
      tasks.forEach(t => fetchTaskItems(t.td_id));
      manuals.forEach(m => fetchManualItems(m.md_id));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateSchedule = async (e) => {
    e.preventDefault();
    try {
      await maintenanceSchedulePlanningService.createMaintenanceSchedule(scheduleForm);

      Swal.fire({
        icon: 'success',
        title: 'Schedule Created!',
        text: 'Maintenance planning schedule successfully registered.',
        timer: 2000,
        showConfirmButton: false,
        background: '#0f172a',
        color: '#f1f5f9'
      });
      setIsModalOpen(false);
      setScheduleForm({
        mps_aircraft_id: '',
        mps_task_detail_id: '',
        mps_manual_detail_id: '',
        mps_recuring_month: 'January'
      });
      fetchData();
    } catch (err) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.error || err.message || 'Failed to create schedule entry',
        icon: 'error',
        background: '#0f172a',
        color: '#f1f5f9'
      });
    }
  };

  const getAircraftName = (id) => {
    const match = aircraftList.find(a => a.a_id === id);
    return match ? match.a_aircraft_type : 'Unknown Asset';
  };

  const getTaskObject = (id) => {
    return taskDetails.find(t => t.td_id === id);
  };

  const getManualObject = (id) => {
    return manualDetails.find(m => m.md_id === id);
  };

  // Group schedules by mps_recuring_month
  const groupedSchedules = monthsList.reduce((acc, month) => {
    const monthSchedules = schedules.filter(s => s.mps_recuring_month === month);
    if (monthSchedules.length > 0) {
      acc[month] = monthSchedules;
    }
    return acc;
  }, {});

  const toggleMonthExpand = (month) => {
    setExpandedMonth(expandedMonth === month ? null : month);
  };

  return (
    <div className="animate-[anxFadeIn_0.3s_ease-out] w-full flex flex-col gap-4">
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 shrink-0">
            <Calendar className="h-5 w-5 text-violet-400" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-bold text-slate-50 mb-0.5 truncate">Maintenance Schedule</h2>
            <p className="text-xs sm:text-sm text-slate-400 truncate">Plan and track upcoming fleet maintenance blocks and recurring months.</p>
          </div>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full md:w-auto px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-600/20 cursor-pointer shrink-0"
        >
          <Calendar className="h-4 w-4" /> Schedule Event
        </button>
      </div>

      <div className="flex flex-col gap-3 w-full">
        <h3 className="text-[11px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Upcoming Operations by Month</h3>
        {Object.keys(groupedSchedules).length === 0 ? (
          <div className="p-8 text-center bg-slate-950/40 border border-slate-800/80 rounded-xl text-slate-500 text-sm">
            No maintenance schedules found. Click "Schedule Event" to create one.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 w-full">
            {Object.entries(groupedSchedules).map(([month, monthItems]) => {
              const isExpanded = expandedMonth === month;

              return (
                <div key={month} className="p-4 bg-slate-950/60 border border-slate-800/80 rounded-xl flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-between gap-2 cursor-pointer" onClick={() => toggleMonthExpand(month)}>
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="p-2.5 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-lg shrink-0">
                        <Calendar className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <strong className="text-slate-100 text-sm font-semibold truncate flex items-center gap-2">
                          {month}
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-violet-400 font-normal">
                            {monthItems.length} {monthItems.length === 1 ? 'entry' : 'entries'}
                          </span>
                        </strong>
                        <span className="text-slate-500 text-[11px] mt-0.5 truncate">Click to view scheduled tasks, manuals, and item checklists</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMonthExpand(month);
                        }}
                        className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 rounded-lg border border-slate-700 transition-all cursor-pointer"
                      >
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Expandable Entries List under the Month */}
                  {isExpanded && (
                    <div className="mt-2 pt-3 border-t border-slate-800/80 flex flex-col gap-3 pl-1 sm:pl-6 animate-[anxFadeIn_0.2s_ease-out]">
                      {monthItems.map((schedule, idx) => {
                        const taskObj = getTaskObject(schedule.mps_task_detail_id);
                        const manualObj = getManualObject(schedule.mps_manual_detail_id);
                        const currentTaskItems = taskItemsMap[schedule.mps_task_detail_id] || [];
                        const currentManualItems = manualItemsMap[schedule.mps_manual_detail_id] || [];

                        return (
                          <div key={schedule.mps_id || idx} className="flex flex-col gap-3 p-4 bg-slate-900/90 border border-slate-800 rounded-xl">
                            {/* Header / Asset Banner */}
                            <div className="flex items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                              <span className="text-[10px] px-2.5 py-1 rounded-lg bg-violet-500/10 text-violet-400 font-bold uppercase tracking-wider border border-violet-500/20">
                                Asset: {getAircraftName(schedule.mps_aircraft_id)}
                              </span>
                              <div className="flex items-center gap-1">
                                <button className="p-1.5 text-slate-400 hover:text-violet-400 transition-colors cursor-pointer" title="Edit"><Edit2 className="h-4 w-4" /></button>
                                <button className="p-1.5 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer" title="Delete"><Trash2 className="h-4 w-4" /></button>
                              </div>
                            </div>

                            {/* Task Section with Items */}
                            <div className="flex flex-col gap-1.5">
                              <div className="text-xs sm:text-sm text-slate-200 font-bold flex items-center gap-2">
                                <Wrench className="h-4 w-4 text-sky-400 shrink-0" />
                                Task Record: {taskObj ? taskObj.td_name : 'Unknown Task'}
                              </div>
                              <div className="pl-6 flex flex-col gap-1.5">
                                {currentTaskItems.length === 0 ? (
                                  <span className="text-[11px] text-slate-500 italic">No sub-items found for this task.</span>
                                ) : (
                                  currentTaskItems.map((item, i) => (
                                    <div key={item.ti_id || i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 border border-slate-800/60 p-2 rounded-lg">
                                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[9px] text-sky-400 font-mono shrink-0 mt-0.5">
                                        {i + 1}
                                      </span>
                                      <span className="break-words">{item.ti_description}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>

                            {/* Manual Section with Items */}
                            <div className="flex flex-col gap-1.5 mt-1 pt-2.5 border-t border-slate-800/60">
                              <div className="text-xs sm:text-sm text-slate-200 font-bold flex items-center gap-2">
                                <FileText className="h-4 w-4 text-emerald-400 shrink-0" />
                                Manual Reference: {manualObj ? manualObj.md_name : 'Unknown Manual'}
                              </div>
                              <div className="pl-6 flex flex-col gap-1.5">
                                {currentManualItems.length === 0 ? (
                                  <span className="text-[11px] text-slate-500 italic">No sub-items found for this manual.</span>
                                ) : (
                                  currentManualItems.map((item, i) => (
                                    <div key={item.mi_id || i} className="flex items-start gap-2 text-xs text-slate-300 bg-slate-950/40 border border-slate-800/60 p-2 rounded-lg">
                                      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-slate-800 text-[9px] text-emerald-400 font-mono shrink-0 mt-0.5">
                                        {i + 1}
                                      </span>
                                      <span className="break-words">{item.mi_description}</span>
                                    </div>
                                  ))
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal for Scheduling Event with Task Details, Manual Details, and Month Selection */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-800/30">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-violet-400" /> New Maintenance Schedule
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateSchedule} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Target Asset / Aircraft</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-50 text-sm focus:outline-none focus:border-violet-500"
                  value={scheduleForm.mps_aircraft_id}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, mps_aircraft_id: e.target.value })}
                  required
                >
                  <option value="">-- Choose Aircraft / Asset --</option>
                  {aircraftList.map((aircraft) => (
                    <option key={aircraft.a_id} value={aircraft.a_id}>
                      {aircraft.a_aircraft_type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Task Detail</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-50 text-sm focus:outline-none focus:border-violet-500"
                  value={scheduleForm.mps_task_detail_id}
                  onChange={(e) => {
                    const taskId = e.target.value;
                    setScheduleForm({ ...scheduleForm, mps_task_detail_id: taskId });
                    if (taskId) fetchTaskItems(taskId);
                  }}
                  required
                >
                  <option value="">-- Choose Task Record --</option>
                  {taskDetails.map((task) => (
                    <option key={task.td_id} value={task.td_id}>
                      {task.td_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Select Manual Entry / Document</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-50 text-sm focus:outline-none focus:border-violet-500"
                  value={scheduleForm.mps_manual_detail_id}
                  onChange={(e) => {
                    const manualId = e.target.value;
                    setScheduleForm({ ...scheduleForm, mps_manual_detail_id: manualId });
                    if (manualId) fetchManualItems(manualId);
                  }}
                  required
                >
                  <option value="">-- Choose Manual Reference --</option>
                  {manualDetails.map((manual) => (
                    <option key={manual.md_id} value={manual.md_id}>
                      {manual.md_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Recurring Month</label>
                <select
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-50 text-sm focus:outline-none focus:border-violet-500"
                  value={scheduleForm.mps_recuring_month}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, mps_recuring_month: e.target.value })}
                  required
                >
                  {monthsList.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-xl text-slate-300 bg-slate-800 hover:bg-slate-700 text-sm cursor-pointer">Cancel</button>
                <button type="submit" className="px-5 py-2 rounded-xl text-white bg-violet-600 hover:bg-violet-500 text-sm font-semibold cursor-pointer shadow-lg shadow-violet-600/20">Save Schedule</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};



// --- Main Component with Scrollable Content Area Fix ---

const MaintenanceSchedulePlanning = () => {
  const [activeTab, setActiveTab] = useState('schedule');

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'task': return <TaskTab />;
      case 'manual': return <ManualTab />;
      case 'schedule': return <MaintenanceScheduleTab />;
      default: return <MaintenanceScheduleTab />;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl shadow-2xl overflow-hidden flex flex-col flex-1 max-h-[calc(100vh-2rem)]">
        {/* Title Bar */}
        <div className="px-4 py-4 sm:px-6 sm:py-5 flex items-center gap-3 border-b border-slate-800 bg-slate-900/95 shrink-0">
          <Hammer className="h-5 w-5 text-sky-500 shrink-0" />
          <h1 className="text-sm sm:text-lg font-black text-white tracking-wider break-words">AERONEXUS OPERATIONS CENTER</h1>
        </div>

        {/* Tab Navigation with 5px gap */}
        <div className="grid grid-cols-2 sm:grid-cols-4 bg-slate-900 border-b border-slate-800 gap-[5px] p-[5px] shrink-0">
          <button
            className={`px-2 py-3 sm:px-6 sm:py-4 bg-slate-900 border-b-2 cursor-pointer text-xs sm:text-sm font-bold tracking-wider uppercase text-center transition-all truncate rounded-lg ${activeTab === 'schedule'
              ? 'text-sky-400 border-sky-500 bg-sky-500/5'
              : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            onClick={() => setActiveTab('schedule')}
          >
            Schedule Block
          </button>

          <button
            className={`px-2 py-3 sm:px-6 sm:py-4 bg-slate-900 border-b-2 cursor-pointer text-xs sm:text-sm font-bold tracking-wider uppercase text-center transition-all truncate rounded-lg ${activeTab === 'task'
              ? 'text-sky-400 border-sky-500 bg-sky-500/5'
              : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            onClick={() => setActiveTab('task')}
          >
            Task Assignments
          </button>
          <button
            className={`px-2 py-3 sm:px-6 sm:py-4 bg-slate-900 border-b-2 cursor-pointer text-xs sm:text-sm font-bold tracking-wider uppercase text-center transition-all truncate rounded-lg ${activeTab === 'manual'
              ? 'text-sky-400 border-sky-500 bg-sky-500/5'
              : 'text-slate-500 border-transparent hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            onClick={() => setActiveTab('manual')}
          >
            Manuals & Docs
          </button>
        </div>

        {/* Content Area with Flex Layout and Custom Scrollbar Styling */}
        <div className="p-3 sm:p-5 md:p-6 bg-slate-900 w-full flex flex-col flex-1 overflow-y-auto box-border custom-scrollbar">
          {renderActiveTab()}
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSchedulePlanning;