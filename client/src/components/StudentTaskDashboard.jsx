import React, { useState, useEffect } from 'react';
import { workOrderService } from '../services/api';
import Swal from 'sweetalert2';
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Search,
  Calendar,
  BookOpen,
  Check,
  Loader2,
  Wrench,
  User,
  Play,
  FileText,
  X,
  Plus,
  Trash2,
  ClipboardCheck,
  Eye,
  Printer
} from 'lucide-react';

const StudentTaskDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // --- REPORT MODAL STATE ---
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [selectedTaskToReport, setSelectedTaskToReport] = useState(null);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [reportForm, setReportForm] = useState({
    actionTaken: '',
    discrepancy: '',
    correctiveAction: '',
    parts: [{ quantity: 1, nomenclature: '', partNumber: '' }]
  });

  // --- VIEW REPORT SUMMARY MODAL STATE ---
  const [isViewReportModalOpen, setIsViewReportModalOpen] = useState(false);
  const [selectedCompletedTask, setSelectedCompletedTask] = useState(null);
  const [isLoadingReportDetails, setIsLoadingReportDetails] = useState(false);

  // --- PRINT PREVIEW MODAL STATE ---
  const [isPrintPreviewOpen, setIsPrintPreviewOpen] = useState(false);

  // --- VIEW REPORT DETAILS ---
  const [returnSlip, setreturnSlip] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const cachedUser = localStorage.getItem("aerofix_user");
      const parsedUser = JSON.parse(cachedUser);

      const response = await workOrderService.studentTask(parsedUser.student_id);
      const data = response.data || (typeof response.json === 'function' ? await response.json() : response);

      let fetchedTasks = data?.data || data || [];
      if (!Array.isArray(fetchedTasks)) fetchedTasks = [];

      setTasks(fetchedTasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      Swal.fire({
        icon: 'error',
        title: 'Fetch Failed',
        text: 'Unable to load assigned work orders.',
        background: '#090d16',
        color: '#f8fafc',
        confirmButtonColor: '#0284c7'
      });
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportInputChange = (e) => {
    setReportForm({ ...reportForm, [e.target.name]: e.target.value });
  };

  const handlePartChange = (index, field, value) => {
    const updatedParts = [...reportForm.parts];
    updatedParts[index][field] = value;
    setReportForm({ ...reportForm, parts: updatedParts });
  };

  const addPartRow = () => {
    setReportForm({
      ...reportForm,
      parts: [...reportForm.parts, { quantity: 1, nomenclature: '', partNumber: '' }]
    });
  };

  const removePartRow = (index) => {
    const updatedParts = reportForm.parts.filter((_, i) => i !== index);
    setReportForm({ ...reportForm, parts: updatedParts });
  };

  const handleActionClick = async (task) => {
    const currentStatus = task.wo_status || 'active';

    if (currentStatus === 'active') {
      await updateTaskStatus(task.wo_work_order_number, 'ongoing');
    } else if (currentStatus === 'ongoing') {
      setSelectedTaskToReport(task);
      setReportForm({
        actionTaken: '',
        discrepancy: '',
        correctiveAction: '',
        parts: [{ quantity: 1, nomenclature: '', partNumber: '' }]
      });
      setIsReportModalOpen(true);
    } else if (currentStatus === 'complete') {
      const reportDetails = await fetchReportDetails(task.wo_work_order_number);
      if (reportDetails) {
        setreturnSlip(reportDetails.returnSlip || reportDetails.returnService || null);
      }
    }
  };

  const fetchReportDetails = async (woNumber) => {
    setIsLoadingReportDetails(true);
    try {
      const response = await workOrderService.viewReport(woNumber);
      const reportData = response.data || (typeof response.json === 'function' ? await response.json() : response);

      const parsedData = reportData?.data || reportData;
      setSelectedCompletedTask(parsedData);
      setIsViewReportModalOpen(true);
      return parsedData;
    } catch (error) {
      console.error("Error fetching report details:", error);
      Swal.fire({
        icon: 'error',
        title: 'Fetch Failed',
        text: 'Unable to load work order summary report.',
        background: '#090d16',
        color: '#f8fafc',
        confirmButtonColor: '#0284c7'
      });
      return null;
    } finally {
      setIsLoadingReportDetails(false);
    }
  };

  const updateTaskStatus = async (woNumber, newStatus) => {
    setTasks(tasks.map(t => t.wo_work_order_number === woNumber ? { ...t, wo_status: newStatus } : t));
    try {
      await workOrderService.startTask(woNumber, { wo_status: newStatus });
    } catch (error) {
      console.error("Error updating task status:", error);
      Swal.fire({
        icon: 'error',
        title: 'Update Failed',
        text: 'Could not update task status.',
        background: '#090d16',
        color: '#f8fafc',
        confirmButtonColor: '#0284c7'
      });
      fetchTasks();
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!selectedTaskToReport) return;

    setIsSubmittingReport(true);

    try {
      const taskId = selectedTaskToReport.wo_work_order_number;

      const payload = {
        wo_status: 'complete',
        action_taken: reportForm.actionTaken,
        discrepancy: reportForm.discrepancy,
        corrective_action: reportForm.correctiveAction,
        parts: reportForm.parts.filter(
          p => p.nomenclature?.trim() !== '' || p.partNumber?.trim() !== ''
        )
      };

      await workOrderService.submitReport(taskId, payload);
      setIsReportModalOpen(false);
      fetchTasks();

      Swal.fire({
        icon: 'success',
        title: 'Report Submitted!',
        text: `Work order ${selectedTaskToReport.wo_work_order_number} has been completed successfully.`,
        background: '#090d16',
        color: '#f8fafc',
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error("Error submitting task report:", error);
      Swal.fire({
        icon: 'error',
        title: 'Submission Failed',
        text: error.response?.data?.error || 'Failed to submit report. Please check your network and try again.',
        background: '#090d16',
        color: '#f8fafc',
        confirmButtonColor: '#d97706'
      });
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const filteredTasks = tasks.filter(task => {
    const status = task.wo_status || 'active';
    const matchesFilter =
      filter === 'all' ? true :
        filter === 'complete' ? status === 'complete' :
          (status === 'active' || status === 'ongoing');

    const matchesSearch =
      (task.wo_work_order_number && task.wo_work_order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (task.instructor && `${task.instructor.first_name} ${task.instructor.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const completedCount = tasks.filter(t => t.wo_status === 'complete').length;
  const pendingCount = tasks.filter(t => t.wo_status === 'active' || t.wo_status === 'ongoing').length;

  // --- REUSABLE PRINT / PREVIEW CONTENT ---
  const PrintableDocumentContent = ({ task, slip, showOnlyPage }) => {
    if (!task) return null;

    const cachedUser = JSON.parse(localStorage.getItem("aerofix_user") || "{}");
    const studentName = cachedUser.first_name ? `${cachedUser.first_name} ${cachedUser.last_name}` : "";

    const partsList = task.partsReplacement || task.parts || [];
    const formattedDate = task.wo_date ? new Date(task.wo_date).toLocaleDateString() : new Date().toLocaleDateString();
    const actionTakenText = task.actionTaken?.woat_description || task.action_taken || "";
    const workOrderItemsText = task.items && task.items.length > 0
      ? task.items.map(item => item.workOrderListDetails?.wol_description || `Item ID: ${item.woi_work_order_list_id}`).join(', ')
      : "";

    const discrepancyText = slip?.wors_aircraft_discrepancy || task.returnSlip?.wors_aircraft_discrepancy || task.returnService?.wors_aircraft_discrepancy || task.discrepancy || "";
    const correctiveActionText = slip?.wors_corrective_action || task.returnSlip?.wors_corrective_action || task.returnService?.wors_corrective_action || task.corrective_action || "";

    const instructorName = task.instructor
      ? `${task.instructor.first_name} ${task.instructor.last_name}`
      : "";

    const tableRows = Array.from({ length: 5 }, (_, index) => partsList[index] || null);

    // Determine whether to render specific pages or all (for full print mode)
    const renderPage1 = showOnlyPage === undefined || showOnlyPage === 1;
    const renderPage2 = showOnlyPage === undefined || showOnlyPage === 2;

    return (
      <div className="printable-document text-black font-sans bg-white">
        {/* PAGE 1: WORK ORDER */}
        {renderPage1 && (
          <div className="a4-page border-[4px] border-black p-6 relative flex flex-col justify-between box-border bg-white text-black print:mb-0">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none z-0">
              <img src="/aeronexus-watermark.png" alt="Aeronexus Watermark" className="w-2/3 object-contain" />
            </div>

            <div className="relative z-10 space-y-3 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-col">
                    <h1 className="text-4xl font-black tracking-tighter text-blue-900 leading-none">
                      NAAP
                    </h1>
                    <p className="text-[8px] font-bold uppercase mt-1 text-blue-900 tracking-wider">
                      The National Professional Institution for Aviation
                    </p>
                  </div>

                  <div className="w-56">
                    <table className="w-full border-collapse border-2 border-black text-[11px] font-bold">
                      <tbody>
                        <tr>
                          <td className="border-2 border-black p-1 w-1/3 bg-slate-100">DATE</td>
                          <td className="border-2 border-black p-1 text-center">{formattedDate}</td>
                        </tr>
                        <tr>
                          <td className="border-2 border-black p-1 bg-slate-100">WORK ORDER NO.</td>
                          <td className="border-2 border-black p-1 text-center font-mono">{task.wo_work_order_number || ''}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <table className="w-full border-collapse border-2 border-black text-[11px] font-bold uppercase mb-3">
                  <tbody>
                    <tr>
                      <td className="border-2 border-black p-1 w-[18%] bg-slate-100">Registration No.</td>
                      <td className="border-2 border-black p-1 w-[15%]">RP-C8874</td>
                      <td className="border-2 border-black p-1 w-[15%] bg-slate-100">Classification</td>
                      <td className="border-2 border-black p-1 w-[10%]"></td>
                      <td className="border-2 border-black p-1 w-[15%]">Routine</td>
                      <td className="border-2 border-black p-1 w-[10%] text-center leading-tight bg-slate-100" rowSpan={2}>
                        Approved<br />By
                      </td>
                      <td className="border-2 border-black p-1 w-[17%]" rowSpan={2}></td>
                    </tr>
                    <tr>
                      <td className="border-2 border-black p-1 bg-slate-100">Aircraft Type</td>
                      <td className="border-2 border-black p-1">CESSNA 150</td>
                      <td className="border-2 border-black p-1"></td>
                      <td className="border-2 border-black p-1"></td>
                      <td className="border-2 border-black p-1">Nonroutine</td>
                    </tr>
                  </tbody>
                </table>

                <div className="border-2 border-black min-h-[75px] p-2 text-[11px] mb-3">
                  <span className="font-bold uppercase block mb-1">Work Order:</span>
                  <p className="font-medium normal-case whitespace-pre-wrap">{workOrderItemsText}</p>
                </div>

                <div className="border-2 border-black min-h-[75px] p-2 text-[11px] mb-3">
                  <span className="font-bold uppercase block mb-1">Action Taken:</span>
                  <p className="font-medium normal-case whitespace-pre-wrap">{actionTakenText}</p>
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <div className="w-[55%]">
                  <table className="w-full border-collapse border-2 border-black text-center text-[10px] font-bold uppercase">
                    <thead>
                      <tr>
                        <th colSpan={3} className="bg-slate-700 text-white p-1 border-2 border-black tracking-wider text-[10px]">
                          Parts for Replacement
                        </th>
                      </tr>
                      <tr className="bg-slate-100">
                        <th className="border-2 border-black p-1 w-[15%]">Qty.</th>
                        <th className="border-2 border-black p-1 w-[55%]">Nomenclature</th>
                        <th className="border-2 border-black p-1 w-[30%]">Part No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((p, i) => (
                        <tr key={i}>
                          <td className="border-2 border-black h-5 font-normal">{p?.wopr_quantity || p?.quantity || ''}</td>
                          <td className="border-2 border-black h-5 font-normal text-left px-1.5">{p?.wopr_nomenclature || p?.nomenclature || ''}</td>
                          <td className="border-2 border-black h-5 font-mono font-normal">{p?.wopr_part_number || p?.partNumber || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="w-[45%] flex flex-col justify-between text-[11px] font-bold uppercase pl-1">
                  <div>
                    <span className="block mb-1">STUDENT</span>
                    <div className="ml-2 space-y-0.5 font-normal text-[10px]">
                      <div>1. {studentName}</div>
                      <div>2. ______________________</div>
                      <div>3. ______________________</div>
                    </div>
                  </div>

                  <div className="text-[9px] leading-tight my-1">
                    I HEREBY CERTIFY THAT THE WORK PERFORMED LISTED ABOVE HAS CONSENT UNDER IPC/AMM SECTION:
                  </div>

                  <div className="flex items-end pb-0.5">
                    <span className="mr-1.5 whitespace-nowrap text-[10px]">INSTRUCTOR</span>
                    <div className="flex-grow border-b-2 border-black text-center text-[9px] pb-0.5">
                      {instructorName || "NAME AND SIGNATURE"}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PAGE 2: RETURN TO SERVICE SLIP */}
        {renderPage2 && (
          <div className="a4-page page-break-before border-[4px] border-black p-6 relative flex flex-col justify-between box-border bg-white text-black">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.06] pointer-events-none z-0">
              <img src="/aeronexus-watermark.png" alt="Aeronexus Watermark" className="w-2/3 object-contain" />
            </div>

            <div className="relative z-10 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-1">
                  <div className="flex flex-col">
                    <h1 className="text-4xl font-black tracking-tighter text-blue-900 leading-none">
                      NAAP
                    </h1>
                    <p className="text-[8px] font-bold uppercase mt-1 text-blue-900 tracking-wider">
                      The National Professional Institution for Aviation
                    </p>
                  </div>

                  <div className="border-2 border-black px-4 py-1.5 text-center font-bold text-sm tracking-wider shadow-sm">
                    RETURN TO SERVICE SLIP
                  </div>

                  <div className="font-bold text-xs tracking-wide">
                    AIRCRAFT REGISTRY: <span className="underline ml-1">RP-C8874</span>
                  </div>
                </div>

                <table className="w-full border-collapse border-2 border-black text-[11px]">
                  <thead>
                    <tr>
                      <th className="border-2 border-black p-1.5 w-1/2 text-center font-extrabold uppercase bg-slate-50">
                        AIRCRAFT DISCREPANCY
                      </th>
                      <th className="border-2 border-black p-1.5 w-1/2 text-center font-extrabold uppercase bg-slate-50">
                        CORRECTIVE ACTION
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-2 border-black p-2.5 h-40 vertical-top font-medium align-top">
                        {discrepancyText}
                      </td>
                      <td className="border-2 border-black p-2.5 h-40 vertical-top font-medium align-top">
                        {correctiveActionText}
                      </td>
                    </tr>
                    <tr>
                      <td className="border-2 border-black p-1.5 font-bold text-[10px] uppercase">
                        STUDENT'S NAME: <span className="font-normal normal-case ml-1.5">{studentName}</span>
                      </td>
                      <td className="border-2 border-black p-1.5 font-bold text-[10px] uppercase">
                        INSTRUCTOR'S NAME: <span className="font-normal normal-case ml-1.5">{instructorName}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-2 border-black">
                <div className="bg-black text-white text-center font-extrabold py-1.5 text-xs tracking-wider uppercase">
                  AIRWORTHINESS RELEASE
                </div>

                <div className="p-3 text-center text-[10px] font-bold leading-relaxed tracking-wide uppercase border-b-2 border-black">
                  "THE AIRCRAFT IDENTIFIED WAS REPAIRED AND INSPECTED IN ACCORDANCE WITH THE CURRENT MAINTENANCE RULES OF THE CIVIL AVIATION AUTHORITY OF THE PHILIPPINES (CAAP) WAS DETERMINED TO BE AIRWORTHY AND IS APPROVED FOR RETURN TO SERVICE"
                </div>

                <div className="flex text-[10px] font-bold uppercase divide-x-2 divide-black">
                  <div className="w-1/3 p-2.5 flex flex-col justify-end min-h-[50px]">
                    <span>INSTRUCTOR: <span className="font-normal">{instructorName}</span></span>
                  </div>
                  <div className="w-1/3 p-2.5 flex flex-col justify-end min-h-[50px]">
                    <span>LICENSE NUMBER:</span>
                  </div>
                  <div className="w-1/3 p-2.5 flex flex-col justify-end min-h-[50px]">
                    <span>SIGNATURE:</span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 sm:p-8 flex flex-col gap-8 relative print:p-0 print:bg-white print:text-black">

      {/* GLOBAL PRINT CSS RULES */}
      <style>
        {`
          @media print {
            @page {
              size: A4 portrait;
              margin: 0;
            }
            body {
              background: white !important;
              color: black !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print\\:hidden {
              display: none !important;
            }
            .print-only-container {
              display: block !important;
              position: static !important;
              width: 100% !important;
            }
            .a4-page {
              width: 210mm !important;
              height: 297mm !important;
              page-break-after: always !important;
              break-after: page !important;
              box-sizing: border-box !important;
              margin: 0 !important;
            }
            .page-break-before {
              page-break-before: always !important;
              break-before: page !important;
            }
          }
        `}
      </style>

      {/* DASHBOARD BODY (Hidden on browser print) */}
      <div className="print:hidden flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-sky-500" /> My Assigned Tasks
            </h1>
            <p className="text-slate-400 text-sm mt-1">Track your maintenance work orders, assignments, and deadlines.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Work Orders</p>
              <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl text-sky-400"><BookOpen className="h-6 w-6" /></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Pending / Ongoing</p>
              <p className="text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400"><Clock className="h-6 w-6" /></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Completed</p>
              <p className="text-2xl font-bold text-emerald-400 mt-1">{completedCount}</p>
            </div>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400"><CheckCircle2 className="h-6 w-6" /></div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/50 p-4 rounded-2xl border border-slate-800">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by WO number or instructor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            {['all', 'active', 'complete'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${filter === tab
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
              >
                {tab === 'active' ? 'Pending' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-500">
              <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
              <p className="text-sm">Loading your assigned work orders...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-2xl">
              <AlertCircle className="mx-auto h-10 w-10 text-slate-600 mb-2" />
              <p className="text-slate-400 font-medium">No work orders found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTasks.map((task) => {
                const instructorName = task.instructor
                  ? `${task.instructor.first_name} ${task.instructor.middle_name || ''} ${task.instructor.last_name}`.replace(/\s+/g, ' ')
                  : `ID: ${task.wo_instructor}`;

                let buttonText = 'Start';
                let ButtonIcon = Play;
                let buttonStyles = 'bg-slate-800 text-slate-400 border-slate-700 hover:text-sky-400 hover:border-sky-500/30';

                if (task.wo_status === 'ongoing') {
                  buttonText = 'Report';
                  ButtonIcon = FileText;
                  buttonStyles = 'bg-amber-500/10 text-amber-400 border-amber-500/30 hover:bg-amber-500/20';
                } else if (task.wo_status === 'complete') {
                  buttonText = 'View Report';
                  ButtonIcon = Eye;
                  buttonStyles = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20';
                }

                return (
                  <div
                    key={task.wo_id}
                    className={`bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-xl ${task.wo_status === 'complete' ? 'border-emerald-500/30 opacity-75' : 'border-slate-800 hover:border-slate-700'
                      }`}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-2 mb-3">
                        <span className="px-2.5 py-1 bg-slate-800 text-sky-400 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                          <User className="h-3 w-3" />
                          Instructor: {instructorName}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.wo_status === 'active' ? 'bg-slate-700 text-slate-300 border border-slate-600' :
                          task.wo_status === 'ongoing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            task.wo_status === 'complete' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-slate-800 text-slate-400'
                          }`}>
                          {task.wo_status || 'Active'}
                        </span>
                      </div>

                      <h3 className={`font-bold text-lg flex items-center gap-2 text-white mb-2 ${task.wo_status === 'complete' ? 'line-through text-slate-400' : ''}`}>
                        <Wrench className="h-4 w-4 text-slate-500" />
                        {task.wo_work_order_number}
                      </h3>

                      <div className="text-slate-400 text-xs mb-4 bg-slate-950/40 p-3 rounded-xl border border-slate-800/60">
                        <p className="font-semibold text-sky-400 mb-1.5 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                          <BookOpen className="h-3 w-3" /> Work Order List Items:
                        </p>
                        <ul className="list-disc pl-4 space-y-1">
                          {task.items && task.items.length > 0 ? (
                            task.items.map((item, idx) => (
                              <li key={idx} className="text-slate-300">
                                {item.workOrderListDetails ? item.workOrderListDetails.wol_description : `Work Order List ID: ${item.woi_work_order_list_id}`}
                              </li>
                            ))
                          ) : (
                            <li className="italic text-slate-500">No work order list items attached.</li>
                          )}
                        </ul>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                        <Calendar className="h-3.5 w-3.5 text-slate-500" />
                        <span>{formatDate(task.wo_date)}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleActionClick(task)}
                          disabled={isLoadingReportDetails}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${buttonStyles}`}
                        >
                          {isLoadingReportDetails && task.wo_status === 'complete' ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <ButtonIcon className="h-3.5 w-3.5" />
                          )}
                          {buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* --- REPORT TASK MODAL --- */}
        {isReportModalOpen && selectedTaskToReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-3xl my-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50 sticky top-0 rounded-t-2xl z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="h-5 w-5 text-amber-500" />
                    Submit Task Report
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Work Order: <span className="text-slate-200 font-mono">{selectedTaskToReport.wo_work_order_number}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="p-6 space-y-6">

                {/* GROUP 1: TASK EXECUTION & PARTS */}
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Wrench className="h-4 w-4" /> Task Execution & Parts
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Assigned Work Order List Items
                    </label>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
                      {selectedTaskToReport.items && selectedTaskToReport.items.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1">
                          {selectedTaskToReport.items.map((item, idx) => (
                            <li key={idx}>
                              {item.workOrderListDetails ? item.workOrderListDetails.wol_description : `Item ID: ${item.woi_work_order_list_id}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-500">No items specified for this work order.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Action Taken
                    </label>
                    <textarea
                      name="actionTaken"
                      required
                      rows="3"
                      value={reportForm.actionTaken}
                      onChange={handleReportInputChange}
                      placeholder="Describe the overall action taken to address the work order items..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 resize-none transition-all"
                    />
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Parts for Replacement
                      </label>
                      <button
                        type="button"
                        onClick={addPartRow}
                        className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-md shadow-sky-600/20"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Part
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
                            <th className="pb-2 px-2 w-24">Quantity</th>
                            <th className="pb-2 px-2">Nomenclature</th>
                            <th className="pb-2 px-2">Part Number</th>
                            <th className="pb-2 px-2 w-12 text-center">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {reportForm.parts.map((part, index) => (
                            <tr key={index}>
                              <td className="py-2 px-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={part.quantity}
                                  onChange={(e) => handlePartChange(index, 'quantity', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  placeholder="e.g. Engine Oil Filter"
                                  value={part.nomenclature}
                                  onChange={(e) => handlePartChange(index, 'nomenclature', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="py-2 px-2">
                                <input
                                  type="text"
                                  placeholder="e.g. P/N-12345"
                                  value={part.partNumber}
                                  onChange={(e) => handlePartChange(index, 'partNumber', e.target.value)}
                                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                                />
                              </td>
                              <td className="py-2 px-2 text-center">
                                {reportForm.parts.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removePartRow(index)}
                                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                                    title="Remove row"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* GROUP 2: MAINTENANCE RETURN SLIP */}
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                    <ClipboardCheck className="h-4 w-4" /> Maintenance Return Slip
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Aircraft Discrepancy
                    </label>
                    <textarea
                      name="discrepancy"
                      required
                      rows="3"
                      value={reportForm.discrepancy}
                      onChange={handleReportInputChange}
                      placeholder="Describe the defect, damage, or discrepancy found..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Corrective Action Details
                    </label>
                    <textarea
                      name="correctiveAction"
                      required
                      rows="3"
                      value={reportForm.correctiveAction}
                      onChange={handleReportInputChange}
                      placeholder="Detail the steps taken to resolve the discrepancy..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-none transition-all"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 sticky bottom-0 bg-slate-900 py-2">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-slate-300 font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReport}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold disabled:opacity-50 transition-all shadow-lg shadow-amber-600/20 cursor-pointer flex items-center gap-2"
                  >
                    {isSubmittingReport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                    Submit & Complete
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- VIEW REPORT SUMMARY MODAL --- */}
        {isViewReportModalOpen && selectedCompletedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-3xl my-8 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50 sticky top-0 rounded-t-2xl z-10">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    Work Order Summary Report
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Work Order: <span className="text-slate-200 font-mono">{selectedCompletedTask.wo_work_order_number}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsViewReportModalOpen(false)}
                  className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="p-6 space-y-6">

                {/* GROUP 1: TASK EXECUTION & ITEMS */}
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Wrench className="h-4 w-4" /> Task Execution Details
                  </h3>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Assigned Work Order List Items</p>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-300">
                      {selectedCompletedTask.items && selectedCompletedTask.items.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1">
                          {selectedCompletedTask.items.map((item, idx) => (
                            <li key={idx}>
                              {item.workOrderListDetails ? item.workOrderListDetails.wol_description : `Item ID: ${item.woi_work_order_list_id}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-500">No items specified.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Action Taken</p>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-sm text-slate-200">
                      {selectedCompletedTask.actionTaken?.woat_description || selectedCompletedTask.action_taken || "No action taken details recorded."}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Parts Replaced</p>
                    <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-400 uppercase font-semibold bg-slate-950/50">
                            <th className="py-2 px-3 w-20">Qty</th>
                            <th className="py-2 px-3">Nomenclature</th>
                            <th className="py-2 px-3">Part Number</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {selectedCompletedTask.partsReplacement && selectedCompletedTask.partsReplacement.length > 0 ? (
                            selectedCompletedTask.partsReplacement.map((p, i) => (
                              <tr key={i}>
                                <td className="py-2 px-3 text-slate-300">{p.wopr_quantity}</td>
                                <td className="py-2 px-3 text-slate-300">{p.wopr_nomenclature}</td>
                                <td className="py-2 px-3 text-slate-300 font-mono">{p.wopr_part_number}</td>
                              </tr>
                            ))
                          ) : selectedCompletedTask.parts && selectedCompletedTask.parts.length > 0 ? (
                            selectedCompletedTask.parts.map((p, i) => (
                              <tr key={i}>
                                <td className="py-2 px-3 text-slate-300">{p.quantity}</td>
                                <td className="py-2 px-3 text-slate-300">{p.nomenclature}</td>
                                <td className="py-2 px-3 text-slate-300 font-mono">{p.partNumber}</td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="3" className="py-3 px-3 text-center italic text-slate-500">No parts replacement recorded.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* GROUP 2: MAINTENANCE RETURN SLIP */}
                <div className="bg-slate-950/40 p-5 rounded-2xl border border-slate-800 space-y-4">
                  <h3 className="text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-3">
                    <ClipboardCheck className="h-4 w-4" /> Maintenance Return Slip Summary
                  </h3>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Aircraft Discrepancy</p>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-sm text-slate-200">
                      {returnSlip?.wors_aircraft_discrepancy || selectedCompletedTask.returnSlip?.wors_aircraft_discrepancy || selectedCompletedTask.returnService?.wors_aircraft_discrepancy || selectedCompletedTask.discrepancy || "No discrepancy details recorded."}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Corrective Action Details</p>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-sm text-slate-200">
                      {returnSlip?.wors_corrective_action || selectedCompletedTask.returnSlip?.wors_corrective_action || selectedCompletedTask.returnService?.wors_corrective_action || selectedCompletedTask.corrective_action || "No corrective action details recorded."}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewReportModalOpen(false);
                      setIsPrintPreviewOpen(true);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors cursor-pointer flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" /> Print Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsViewReportModalOpen(false)}
                    className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors cursor-pointer"
                  >
                    Close Summary
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- PRINT PREVIEW MODAL --- */}
        {isPrintPreviewOpen && selectedCompletedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
            <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-2xl w-full max-w-5xl max-h-[90vh] flex flex-col my-4">

              {/* MODAL HEADER */}
              <div className="flex justify-between items-center p-5 border-b border-slate-800 bg-slate-900 rounded-t-2xl">
                <div className="flex items-center gap-3">
                  <Printer className="h-6 w-6 text-sky-400" />
                  <div>
                    <h2 className="text-lg font-bold text-white">Print Preview</h2>
                    <p className="text-xs text-slate-400">Review document scaling before sending to printer</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => window.print()}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <Printer className="h-4 w-4" /> Print Document
                  </button>
                  <button
                    onClick={() => setIsPrintPreviewOpen(false)}
                    className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* MODAL BODY: SCALED DOCUMENT PREVIEW */}
              <div className="p-8 overflow-y-auto bg-slate-950/60 flex flex-col items-center gap-8">
                <div className="scale-90 origin-top shadow-2xl rounded-sm">
                  <PrintableDocumentContent task={selectedCompletedTask} slip={returnSlip} />
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="p-4 border-t border-slate-800 bg-slate-900 flex justify-between items-center rounded-b-2xl">
                <span className="text-xs text-slate-400 font-medium">Page layout target: Standard A4 Portrait</span>
                <button
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Close Preview
                </button>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* TOP-LEVEL RENDER FOR WINDOW.PRINT() */}
      <div className="hidden print-only-container">
        <PrintableDocumentContent task={selectedCompletedTask} slip={returnSlip} />
      </div>

    </div>
  );
};

export default StudentTaskDashboard;