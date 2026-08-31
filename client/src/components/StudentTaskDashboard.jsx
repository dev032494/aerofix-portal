import React, { useState, useEffect, useRef } from 'react';
import { workOrderService } from '../services/api';
import Swal from 'sweetalert2';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas-pro';
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
  Printer,
  Download
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // --- VIEW REPORT DETAILS ---
  const [returnSlip, setreturnSlip] = useState(null);

  // Ref for PDF Export Capture
  const pdfRef = useRef(null);

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


  // --- DOWNLOAD PDF HANDLER (AUTO-FIT SINGLE PAGE) ---
  const handleDownloadPdf = async () => {
    const element = pdfRef.current;
    if (!element) return;

    setIsGeneratingPdf(true);
    try {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.width = '210mm';
      container.style.backgroundColor = '#ffffff';
      document.body.appendChild(container);

      const clone = element.cloneNode(true);
      clone.style.transform = 'none';
      container.appendChild(clone);

      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      document.body.removeChild(container);

      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const canvasWidth = canvas.width || 595;
      const canvasHeight = canvas.height || 842;
      const calculatedHeight = (canvasHeight * pdfWidth) / canvasWidth;

      const finalHeight = calculatedHeight > pdfHeight ? pdfHeight : calculatedHeight;

      pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, finalHeight);

      const woNumber = selectedCompletedTask?.wo_work_order_number || 'WorkOrder';
      pdf.save(`WorkOrder_${woNumber}.pdf`);
    } catch (error) {
      console.error("Error generating PDF:", error);
      Swal.fire({
        icon: 'error',
        title: 'PDF Export Failed',
        text: 'Could not generate PDF document.',
        background: '#090d16',
        color: '#f8fafc',
        confirmButtonColor: '#0284c7'
      });
    } finally {
      setIsGeneratingPdf(false);
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

  // --- AUTO-FIT PRINTABLE DOCUMENT CONTENT ---
  const PrintableDocumentContent = ({ task, slip }) => {
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
    const instructorLicenseNo = task.instructor?.student_id || "";

    const tableRows = Array.from({ length: 4 }, (_, index) => partsList[index] || null);

    return (
      <div className="printable-document text-black font-sans bg-white text-[10px]" ref={pdfRef}>
        <div className="a4-page border-[3px] border-black p-4 relative flex flex-col justify-between box-border bg-white text-black h-[297mm] w-[210mm] max-w-full lg:max-w-none">
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.05] pointer-events-none z-0">
            <img src="/aeronexus-watermark.png" alt="Aeronexus Watermark" className="w-1/2 object-contain" />
          </div>

          <div className="relative z-10 flex flex-col justify-between h-full gap-2">

            {/* SECTION 1: WORK ORDER */}
            <div className="space-y-1.5 print:hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-black tracking-tighter text-blue-900 leading-none">
                    NAAP
                  </h1>
                  <p className="text-[7px] font-bold uppercase text-blue-900 tracking-wider">
                    The National Professional Institution for Aviation
                  </p>
                </div>

                <div className="w-full sm:w-48">
                  <table className="w-full border-collapse border-2 border-black text-[10px] font-bold">
                    <tbody>
                      <tr>
                        <td className="border border-black p-0.5 w-1/3 bg-slate-100">DATE</td>
                        <td className="border border-black p-0.5 text-center">{formattedDate}</td>
                      </tr>
                      <tr>
                        <td className="border border-black p-0.5 bg-slate-100">WO NO.</td>
                        <td className="border border-black p-0.5 text-center font-mono">{task.wo_work_order_number || ''}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-black text-[9px] font-bold uppercase min-w-[500px]">
                  <tbody>
                    <tr>
                      <td className="border border-black p-0.5 w-[18%] bg-slate-100">Registration</td>
                      <td className="border border-black p-0.5 w-[15%]">RP-C8874</td>
                      <td className="border border-black p-0.5 w-[15%] bg-slate-100">Classification</td>
                      <td className="border border-black p-0.5 w-[10%]">Routine</td>
                      <td className="border border-black p-0.5 w-[15%] text-center bg-slate-100" rowSpan={2}>Approved By</td>
                      <td className="border border-black p-0.5 w-[17%]" rowSpan={2}></td>
                    </tr>
                    <tr>
                      <td className="border border-black p-0.5 bg-slate-100">Aircraft</td>
                      <td className="border border-black p-0.5">CESSNA 150</td>
                      <td className="border border-black p-0.5"></td>
                      <td className="border border-black p-0.5">Nonroutine</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-2 border-black h-32 sm:h-48 p-1 overflow-hidden flex flex-col">
                <span className="font-bold uppercase block text-[9px] mb-0.5 shrink-0">Work Order:</span>
                <div className="flex-1 overflow-y-auto">
                    <p className="font-medium normal-case text-[9px] leading-tight">{workOrderItemsText}</p>
                </div>
              </div>

              <div className="border-2 border-black h-32 sm:h-48 p-1 overflow-hidden flex flex-col">
                <span className="font-bold uppercase block text-[9px] mb-0.5 shrink-0">Action Taken:</span>
                <div className="flex-1 overflow-y-auto">
                    <p className="font-medium normal-case text-[9px] leading-tight">{actionTakenText}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <div className="w-full sm:w-[55%] overflow-x-auto">
                  <table className="w-full border-collapse border-2 border-black text-center text-[9px] font-bold uppercase min-w-[300px]">
                    <thead>
                      <tr>
                        <th colSpan={3} className="bg-slate-700 text-white p-0.5 border border-black text-[9px]">
                          Parts for Replacement
                        </th>
                      </tr>
                      <tr className="bg-slate-100">
                        <th className="border border-black p-0.5 w-[15%]">Qty</th>
                        <th className="border border-black p-0.5 w-[55%]">Nomenclature</th>
                        <th className="border border-black p-0.5 w-[30%]">Part No.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableRows.map((p, i) => (
                        <tr key={i}>
                          <td className="border border-black h-4 font-normal">{p?.wopr_quantity || p?.quantity || ''}</td>
                          <td className="border border-black h-4 font-normal text-left px-1 truncate max-w-[100px] sm:max-w-none">{p?.wopr_nomenclature || p?.nomenclature || ''}</td>
                          <td className="border border-black h-4 font-mono font-normal truncate max-w-[80px] sm:max-w-none">{p?.wopr_part_number || p?.partNumber || ''}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="w-full sm:w-[45%] flex flex-col justify-between text-[9px] font-bold uppercase mt-2 sm:mt-0">
                  <div>
                    <span className="block mb-0.5">STUDENT</span>
                    <div className="ml-1 space-y-0 font-normal text-[8px]">
                      <div>1. {studentName}</div>
                      <div>2. __________________</div>
                    </div>
                  </div>
                  <div className="text-[7px] leading-tight mt-2 sm:mt-0">I HEREBY CERTIFY THAT THE WORK PERFORMED
                    LISTED ABOVE HAS CONSENT UNDER IPC/AMM
                    SECTION:</div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-end mt-2 sm:mt-0">
                    <span className="mr-1 text-[8px] mb-1 sm:mb-0">INSTRUCTOR</span>
                    <div className="w-full sm:flex-grow border-b border-black text-center sm:text-left text-[8px] truncate">{instructorName} -  License No: {instructorLicenseNo}</div>
                  </div>
                </div>
              </div>
            </div>

            <hr className="border-t border-dashed border-slate-400 my-0.25" />

            {/* SECTION 2: RETURN TO SERVICE SLIP */}
            <div className="print:hidden">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-0.5 gap-2 sm:gap-0">
                <div className="flex flex-col">
                  <h1 className="text-2xl font-black tracking-tighter text-blue-900 leading-none">
                    NAAP
                  </h1>
                  <p className="text-[7px] font-bold uppercase text-blue-900 tracking-wider">
                    The National Professional Institution for Aviation
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-0.5 gap-2 sm:gap-0 mt-2 sm:mt-0">

                <div className="border border-black w-full sm:w-1/2 py-0.5 text-center font-bold text-[10px] bg-slate-50">
                  RETURN TO SERVICE SLIP
                </div>

                <div className="font-bold text-[10px] w-full sm:w-auto text-left sm:text-right">
                  AIRCRAFT REGISTRY: RP-C8874
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full border-collapse border-2 border-black text-[9px] min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="border border-black p-1 w-1/2 text-center font-bold uppercase bg-slate-50">AIRCRAFT DISCREPANCY</th>
                      <th className="border border-black p-1 w-1/2 text-center font-bold uppercase bg-slate-50">CORRECTIVE ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-black p-1.5 align-top">
                        <div className="h-48 sm:h-64 overflow-y-auto font-medium">
                          {discrepancyText}
                        </div>
                      </td>
                      <td className="border border-black p-1.5 align-top">
                        <div className="h-48 sm:h-64 overflow-y-auto font-medium">
                          {correctiveActionText}
                        </div>
                      </td>
                    </tr>
                    <tr className="flex flex-col sm:table-row">
                      <td className="border border-black p-1 font-bold text-[8px] uppercase w-full sm:w-1/2 block sm:table-cell">
                        STUDENT'S NAME: <span className="font-normal block sm:inline mt-0.5 sm:mt-0 truncate">{studentName}</span>
                      </td>
                      <td className="border border-black p-1 font-bold text-[8px] uppercase w-full sm:w-1/2 block sm:table-cell mt-1 sm:mt-0">
                        INSTRUCTOR'S NAME: <span className="font-normal block sm:inline mt-0.5 sm:mt-0 truncate">{instructorName} LICENSE NO: {instructorLicenseNo}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="border-2 border-black mt-2 sm:mt-0">
                <div className="bg-black text-white text-center font-bold py-0.5 text-[10px] sm:text-[12px] uppercase tracking-wider">
                  AIRWORTHINESS RELEASE
                </div>
                <div className="p-1.5 text-center text-[7px] sm:text-[8px] font-bold leading-tight uppercase border-b border-black">
                  "THE AIRCRAFT IDENTIFIED WAS REPAIRED AND INSPECTED IN ACCORDANCE WITH THE CURRENT MAINTENANCE RULES OF THE
                  CIVL AVIATION AUTHORITY OF THE PHILIPPINES (CAAP) WAS DETERMINED TO BE AIRWORTHY AND IS APROVED FOR RETURN TO
                  SERVICE"
                </div>
                <div className="flex flex-col sm:flex-row text-[8px] sm:text-[9px] font-bold uppercase divide-y sm:divide-y-0 sm:divide-x divide-black">
                  <div className="w-full sm:w-1/3 p-1 flex items-center justify-between sm:justify-start"><span>INSTRUCTOR:</span> <span className="font-normal truncate ml-1">{instructorName}</span></div>
                  <div className="w-full sm:w-1/3 p-1 flex items-center justify-between sm:justify-start"><span>LICENSE NO:</span> <span className="font-normal truncate ml-1">{instructorLicenseNo}</span></div>
                  <div className="w-full sm:w-1/3 p-1">SIGNATURE:</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-6 lg:p-8 flex flex-col gap-6 sm:gap-8 relative print:p-0 print:bg-white print:text-black overflow-x-hidden">

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
              page-break-after: avoid !important;
              box-sizing: border-box !important;
              margin: 0 !important;
            }
            /* Reset mobile styles for print */
            .printable-document table { min-width: auto !important; }
            .printable-document .overflow-x-auto { overflow: visible !important; }
            .printable-document tr { display: table-row !important; }
            .printable-document td { display: table-cell !important; width: auto !important; }
            .printable-document .flex-col { flex-direction: row !important; }
            .printable-document .sm\\:w-1\\/3 { width: 33.333333% !important; }
             .printable-document .sm\\:w-1\\/2 { width: 50% !important; }
            .printable-document .sm\\:table-cell { display: table-cell !important; }
            .printable-document .sm\\:table-row { display: table-row !important; }
            .printable-document .sm\\:inline { display: inline !important; }
          }
        `}
      </style>

      {/* DASHBOARD BODY */}
      <div className="print:hidden flex flex-col gap-6 sm:gap-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4 sm:pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2 sm:gap-3">
              <BookOpen className="h-6 w-6 sm:h-8 sm:w-8 text-sky-500 shrink-0" /> <span className="truncate">My Assigned Tasks</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Track your maintenance work orders, assignments, and deadlines.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Total Work Orders</p>
              <p className="text-xl sm:text-2xl font-bold text-white mt-1">{tasks.length}</p>
            </div>
            <div className="p-2 sm:p-3 bg-slate-800/80 rounded-lg sm:rounded-xl text-sky-400"><BookOpen className="h-5 w-5 sm:h-6 sm:w-6" /></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Pending / Ongoing</p>
              <p className="text-xl sm:text-2xl font-bold text-amber-400 mt-1">{pendingCount}</p>
            </div>
            <div className="p-2 sm:p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg sm:rounded-xl text-amber-400"><Clock className="h-5 w-5 sm:h-6 sm:w-6" /></div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-4 sm:p-5 rounded-xl sm:rounded-2xl flex items-center justify-between shadow-md sm:col-span-2 lg:col-span-1">
            <div>
              <p className="text-slate-400 text-[10px] sm:text-xs font-semibold uppercase tracking-wider">Completed</p>
              <p className="text-xl sm:text-2xl font-bold text-emerald-400 mt-1">{completedCount}</p>
            </div>
            <div className="p-2 sm:p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg sm:rounded-xl text-emerald-400"><CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" /></div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 sm:gap-4 bg-slate-900/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-800">
          <div className="relative w-full md:w-80 lg:w-96">
            <Search className="absolute left-3 top-2.5 sm:top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by WO number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg sm:rounded-xl pl-9 pr-3 sm:pr-4 py-2 text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0 hide-scrollbar">
            {['all', 'active', 'complete'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`flex-1 md:flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold uppercase tracking-wider transition-all cursor-pointer whitespace-nowrap min-w-[70px] ${filter === tab
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                  }`}
              >
                {tab === 'active' ? 'Pending' : tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-[300px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 sm:py-20 gap-3 text-slate-500 h-full">
              <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-sky-500" />
              <p className="text-xs sm:text-sm">Loading your assigned work orders...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-12 sm:py-20 bg-slate-900/30 border border-dashed border-slate-800 rounded-xl sm:rounded-2xl h-full flex flex-col items-center justify-center px-4">
              <AlertCircle className="h-8 w-8 sm:h-10 sm:w-10 text-slate-600 mb-2" />
              <p className="text-slate-400 text-sm font-medium">No work orders found matching your criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl sm:rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-950/50 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px] sm:text-xs">
                  <tr>
                    <th className="p-3 sm:p-4 font-semibold">WO Number</th>
                    <th className="p-3 sm:p-4 font-semibold">Date</th>
                    <th className="p-3 sm:p-4 font-semibold">Instructor</th>
                    <th className="p-3 sm:p-4 font-semibold">Status</th>
                    <th className="p-3 sm:p-4 font-semibold w-1/3">Items</th>
                    <th className="p-3 sm:p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs sm:text-sm">
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
                      <tr 
                        key={task.wo_id} 
                        className={`hover:bg-slate-800/40 transition-colors ${task.wo_status === 'complete' ? 'opacity-75' : ''}`}
                      >
                        <td className="p-3 sm:p-4">
                          <div className={`font-bold flex items-center gap-1.5 text-white ${task.wo_status === 'complete' ? 'line-through text-slate-400' : ''}`} title={task.wo_work_order_number}>
                            <Wrench className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-xs">{task.wo_work_order_number}</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                            {formatDate(task.wo_date)}
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <User className="h-3.5 w-3.5 text-sky-500 shrink-0" />
                            <span className="truncate max-w-[120px] sm:max-w-[200px]">{instructorName}</span>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block ${task.wo_status === 'active' ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                            task.wo_status === 'ongoing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              task.wo_status === 'complete' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                'bg-slate-800 text-slate-400'
                            }`}>
                            {task.wo_status || 'Active'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-4">
                          <div className="max-h-16 overflow-y-auto custom-scrollbar pr-2 min-w-[180px] sm:min-w-[250px]">
                            <ul className="list-disc pl-4 space-y-0.5 text-[11px] sm:text-xs">
                              {task.items && task.items.length > 0 ? (
                                task.items.map((item, idx) => (
                                  <li key={idx} className="text-slate-400 whitespace-normal break-words">
                                    {item.workOrderListDetails ? item.workOrderListDetails.wol_description : `ID: ${item.woi_work_order_list_id}`}
                                  </li>
                                ))
                              ) : (
                                <li className="italic text-slate-600">No items attached.</li>
                              )}
                            </ul>
                          </div>
                        </td>
                        <td className="p-3 sm:p-4 text-right">
                          <button
                            onClick={() => handleActionClick(task)}
                            disabled={isLoadingReportDetails}
                            className={`inline-flex px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg border text-[10px] sm:text-xs font-bold items-center justify-center gap-1.5 transition-colors cursor-pointer ${buttonStyles}`}
                          >
                            {isLoadingReportDetails && task.wo_status === 'complete' ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <ButtonIcon className="h-3.5 w-3.5" />
                            )}
                            {buttonText}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* --- REPORT TASK MODAL --- */}
        {isReportModalOpen && selectedTaskToReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto w-full h-full">
            <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl sm:rounded-2xl w-full max-w-3xl my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 rounded-t-xl sm:rounded-t-2xl z-20 backdrop-blur-md">
                <div className="pr-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-amber-500 shrink-0" />
                    <span className="truncate">Submit Task Report</span>
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 truncate">
                    WO: <span className="text-slate-200 font-mono">{selectedTaskToReport.wo_work_order_number}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsReportModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="bg-slate-950/60 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800/80 space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border-b border-slate-800/80 pb-2 sm:pb-3">
                    <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Task Execution
                  </h3>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Assigned List Items
                    </label>
                    <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-700/50 text-[10px] sm:text-xs text-slate-300 max-h-32 overflow-y-auto custom-scrollbar">
                      {selectedTaskToReport.items && selectedTaskToReport.items.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 pr-2">
                          {selectedTaskToReport.items.map((item, idx) => (
                            <li key={idx} className="break-words">
                              {item.workOrderListDetails ? item.workOrderListDetails.wol_description : `ID: ${item.woi_work_order_list_id}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-500">No items specified.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Action Taken
                    </label>
                    <textarea
                      name="actionTaken"
                      required
                      rows="3"
                      value={reportForm.actionTaken}
                      onChange={handleReportInputChange}
                      placeholder="Describe the overall action taken..."
                      className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-[11px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500 resize-y min-h-[80px] transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="space-y-2 sm:space-y-3 pt-2">
                    <div className="flex flex-wrap justify-between items-center gap-2">
                      <label className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider">
                        Parts for Replacement
                      </label>
                      <button
                        type="button"
                        onClick={addPartRow}
                        className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-sky-600/90 hover:bg-sky-500 text-white text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all flex items-center gap-1 sm:gap-1.5 cursor-pointer shadow-sm shadow-sky-900"
                      >
                        <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> Add Part
                      </button>
                    </div>

                    <div className="overflow-x-auto rounded-lg border border-slate-700/50 bg-slate-900/80">
                      <table className="w-full text-left text-[10px] sm:text-xs min-w-[300px]">
                        <thead className="bg-slate-800/50">
                          <tr className="border-b border-slate-700/50 text-slate-400 uppercase font-semibold">
                            <th className="p-2 w-16 sm:w-24">Qty</th>
                            <th className="p-2">Nomenclature</th>
                            <th className="p-2 w-24 sm:w-32">Part No.</th>
                            <th className="p-2 w-10 sm:w-12 text-center"></th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {reportForm.parts.map((part, index) => (
                            <tr key={index}>
                              <td className="p-1 sm:p-2">
                                <input
                                  type="number"
                                  min="1"
                                  value={part.quantity}
                                  onChange={(e) => handlePartChange(index, 'quantity', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-600 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-white text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                                />
                              </td>
                              <td className="p-1 sm:p-2">
                                <input
                                  type="text"
                                  placeholder="e.g. Oil Filter"
                                  value={part.nomenclature}
                                  onChange={(e) => handlePartChange(index, 'nomenclature', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-600 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-white text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-slate-600"
                                />
                              </td>
                              <td className="p-1 sm:p-2">
                                <input
                                  type="text"
                                  placeholder="e.g. P/N-123"
                                  value={part.partNumber}
                                  onChange={(e) => handlePartChange(index, 'partNumber', e.target.value)}
                                  className="w-full bg-slate-950 border border-slate-600 rounded-md sm:rounded-lg p-1.5 sm:p-2 text-white text-[10px] sm:text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 placeholder:text-slate-600"
                                />
                              </td>
                              <td className="p-1 sm:p-2 text-center">
                                {reportForm.parts.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removePartRow(index)}
                                    className="p-1 sm:p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-md sm:rounded-lg transition-colors cursor-pointer"
                                    title="Remove row"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
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

                <div className="bg-slate-950/60 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800/80 space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border-b border-slate-800/80 pb-2 sm:pb-3">
                    <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Return Slip
                  </h3>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Aircraft Discrepancy
                    </label>
                    <textarea
                      name="discrepancy"
                      required
                      rows="3"
                      value={reportForm.discrepancy}
                      onChange={handleReportInputChange}
                      placeholder="Describe the defect..."
                      className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-[11px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-y min-h-[80px] transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">
                      Corrective Action Details
                    </label>
                    <textarea
                      name="correctiveAction"
                      required
                      rows="3"
                      value={reportForm.correctiveAction}
                      onChange={handleReportInputChange}
                      placeholder="Detail the steps taken..."
                      className="w-full bg-slate-900/80 border border-slate-700/50 rounded-lg sm:rounded-xl p-2.5 sm:p-3 text-[11px] sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 resize-y min-h-[80px] transition-all placeholder:text-slate-600"
                    />
                  </div>
                </div>
              </form>

              <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/90 rounded-b-xl sm:rounded-b-2xl sticky bottom-0 z-20 backdrop-blur-md flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsReportModalOpen(false)}
                    className="w-full sm:w-auto px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-xs sm:text-sm text-slate-300 font-semibold hover:bg-slate-800 transition-colors cursor-pointer border border-slate-700 sm:border-transparent"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    onClick={handleReportSubmit}
                    disabled={isSubmittingReport}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-amber-600/90 hover:bg-amber-500 text-white text-xs sm:text-sm font-bold disabled:opacity-50 transition-all shadow-md shadow-amber-900/30 cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2"
                  >
                    {isSubmittingReport ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    Submit & Complete
                  </button>
                </div>
            </div>
          </div>
        )}

        {/* --- VIEW REPORT SUMMARY MODAL --- */}
        {isViewReportModalOpen && selectedCompletedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/90 backdrop-blur-sm overflow-y-auto w-full h-full">
            <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl sm:rounded-2xl w-full max-w-3xl my-4 sm:my-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[95vh] sm:max-h-[90vh]">
              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-slate-800 bg-slate-900/90 sticky top-0 rounded-t-xl sm:rounded-t-2xl z-20 backdrop-blur-md">
                <div className="pr-2">
                  <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 shrink-0" />
                    <span className="truncate">Work Order Summary</span>
                  </h2>
                  <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 truncate">
                    WO: <span className="text-slate-200 font-mono">{selectedCompletedTask.wo_work_order_number}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsViewReportModalOpen(false)}
                  className="text-slate-400 hover:text-white p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>
              </div>

              <div className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="bg-slate-950/60 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800/80 space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-extrabold text-sky-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border-b border-slate-800/80 pb-2 sm:pb-3">
                    <Wrench className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Execution Details
                  </h3>

                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Assigned List Items</p>
                    <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-700/50 text-[10px] sm:text-xs text-slate-300 max-h-32 overflow-y-auto custom-scrollbar">
                      {selectedCompletedTask.items && selectedCompletedTask.items.length > 0 ? (
                        <ul className="list-disc pl-4 space-y-1 pr-2">
                          {selectedCompletedTask.items.map((item, idx) => (
                            <li key={idx} className="break-words">
                              {item.workOrderListDetails ? item.workOrderListDetails.wol_description : `ID: ${item.woi_work_order_list_id}`}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="italic text-slate-500">No items specified.</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Action Taken</p>
                    <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-700/50 text-[11px] sm:text-sm text-slate-200 whitespace-pre-wrap break-words max-h-40 overflow-y-auto custom-scrollbar">
                      {selectedCompletedTask.actionTaken?.woat_description || selectedCompletedTask.action_taken || <span className="italic text-slate-500 text-xs">No action details.</span>}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Parts Replaced</p>
                    <div className="bg-slate-900/80 rounded-lg sm:rounded-xl border border-slate-700/50 overflow-x-auto">
                      <table className="w-full text-left text-[10px] sm:text-xs min-w-[300px]">
                        <thead className="bg-slate-800/50">
                          <tr className="border-b border-slate-700/50 text-slate-400 uppercase font-semibold">
                            <th className="py-2 px-2 sm:px-3 w-16 sm:w-20">Qty</th>
                            <th className="py-2 px-2 sm:px-3">Nomenclature</th>
                            <th className="py-2 px-2 sm:px-3 w-24 sm:w-32">Part No.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                          {selectedCompletedTask.partsReplacement && selectedCompletedTask.partsReplacement.length > 0 ? (
                            selectedCompletedTask.partsReplacement.map((p, i) => (
                              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                <td className="py-2 px-2 sm:px-3 text-slate-300">{p.wopr_quantity}</td>
                                <td className="py-2 px-2 sm:px-3 text-slate-300 break-words">{p.wopr_nomenclature}</td>
                                <td className="py-2 px-2 sm:px-3 text-slate-300 font-mono break-all">{p.wopr_part_number}</td>
                              </tr>
                            ))
                          ) : selectedCompletedTask.parts && selectedCompletedTask.parts.length > 0 ? (
                            selectedCompletedTask.parts.map((p, i) => (
                              <tr key={i} className="hover:bg-slate-800/30 transition-colors">
                                <td className="py-2 px-2 sm:px-3 text-slate-300">{p.quantity}</td>
                                <td className="py-2 px-2 sm:px-3 text-slate-300 break-words">{p.nomenclature}</td>
                                <td className="py-2 px-2 sm:px-3 text-slate-300 font-mono break-all">{p.partNumber}</td>
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

                <div className="bg-slate-950/60 p-3 sm:p-5 rounded-xl sm:rounded-2xl border border-slate-800/80 space-y-3 sm:space-y-4">
                  <h3 className="text-xs sm:text-sm font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 border-b border-slate-800/80 pb-2 sm:pb-3">
                    <ClipboardCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> Return Slip Summary
                  </h3>

                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Aircraft Discrepancy</p>
                    <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-700/50 text-[11px] sm:text-sm text-slate-200 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar">
                      {returnSlip?.wors_aircraft_discrepancy || selectedCompletedTask.returnSlip?.wors_aircraft_discrepancy || selectedCompletedTask.returnService?.wors_aircraft_discrepancy || selectedCompletedTask.discrepancy || <span className="italic text-slate-500 text-xs">No discrepancy recorded.</span>}
                    </div>
                  </div>

                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 sm:mb-2">Corrective Action Details</p>
                    <div className="bg-slate-900/80 p-2.5 sm:p-3 rounded-lg sm:rounded-xl border border-slate-700/50 text-[11px] sm:text-sm text-slate-200 whitespace-pre-wrap break-words max-h-32 overflow-y-auto custom-scrollbar">
                      {returnSlip?.wors_corrective_action || selectedCompletedTask.returnSlip?.wors_corrective_action || selectedCompletedTask.returnService?.wors_corrective_action || selectedCompletedTask.corrective_action || <span className="italic text-slate-500 text-xs">No corrective action recorded.</span>}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 sm:p-6 border-t border-slate-800 bg-slate-900/90 rounded-b-xl sm:rounded-b-2xl sticky bottom-0 z-20 backdrop-blur-md flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsViewReportModalOpen(false);
                      setIsPrintPreviewOpen(true);
                    }}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5 sm:gap-2 shadow-sm shadow-sky-900/50"
                  >
                    <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> PDF Preview
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsViewReportModalOpen(false)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-700 sm:border-transparent"
                  >
                    Close
                  </button>
                </div>
            </div>
          </div>
        )}

        {/* --- PRINT & PDF PREVIEW MODAL --- */}
        {isPrintPreviewOpen && selectedCompletedTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/95 backdrop-blur-sm overflow-hidden w-full h-full">
            <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-xl sm:rounded-2xl w-full max-w-5xl h-[95vh] sm:h-[90vh] flex flex-col">

              {/* MODAL HEADER */}
              <div className="flex justify-between items-center p-3 sm:p-5 border-b border-slate-800 bg-slate-900/90 rounded-t-xl sm:rounded-t-2xl z-10 shrink-0">
                <div className="flex items-center gap-2 sm:gap-3 pr-2">
                  <Printer className="h-5 w-5 sm:h-6 sm:w-6 text-sky-400 shrink-0" />
                  <div className="truncate">
                    <h2 className="text-base sm:text-lg font-bold text-white truncate">PDF Preview</h2>
                    <p className="text-[9px] sm:text-xs text-slate-400 hidden sm:block truncate">Review single-page auto-fit scaling before downloading</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-sky-600/90 hover:bg-sky-500 text-white text-[10px] sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer shadow-sm shadow-sky-900/50 disabled:opacity-50"
                  >
                    {isGeneratingPdf ? <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" /> : <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    <span className="hidden xs:inline">{isGeneratingPdf ? 'Wait...' : 'Download'}</span>
                  </button>
                  <button
                    onClick={() => setIsPrintPreviewOpen(false)}
                    className="text-slate-400 hover:text-white p-1.5 sm:p-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer bg-slate-800/50 sm:bg-transparent"
                  >
                    <X className="h-5 w-5 sm:h-6 sm:w-6" />
                  </button>
                </div>
              </div>

              {/* MODAL BODY: SCALED DOCUMENT PREVIEW (SCROLLABLE CONTAINER) */}
              <div className="flex-1 overflow-auto bg-slate-950/80 flex flex-col items-center justify-start p-2 sm:p-6 lg:p-8 custom-scrollbar">
                {/* 
                  Wrapper for scaling.
                  On very small screens, scale down more to fit width.
                  On larger screens, use 0.75 or similar.
                */}
                <div className="scale-[0.45] xs:scale-[0.55] sm:scale-[0.7] md:scale-[0.8] lg:scale-100 origin-top shadow-2xl rounded-sm bg-white shrink-0 mt-4 sm:mt-0 transition-transform duration-300">
                  <PrintableDocumentContent task={selectedCompletedTask} slip={returnSlip} />
                </div>
              </div>

              {/* MODAL FOOTER */}
              <div className="p-3 sm:p-4 border-t border-slate-800 bg-slate-900/90 flex justify-between items-center rounded-b-xl sm:rounded-b-2xl shrink-0">
                <span className="text-[9px] sm:text-xs text-slate-400 font-medium truncate pr-2">Layout: Single-Page A4 Auto-Fit</span>
                <button
                  onClick={() => setIsPrintPreviewOpen(false)}
                  className="px-3 sm:px-5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] sm:text-sm font-semibold transition-colors cursor-pointer border border-slate-700 sm:border-transparent shrink-0"
                >
                  Close
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
      
      {/* Custom Scrollbar Styles for the Modals */}
      <style>
          {`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(15, 23, 42, 0.5);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(51, 65, 85, 0.8);
              border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(71, 85, 105, 1);
            }
            .hide-scrollbar::-webkit-scrollbar {
                display: none;
            }
            .hide-scrollbar {
                -ms-overflow-style: none;
                scrollbar-width: none;
            }
            /* Extra small screen breakpoint helper */
            @media (min-width: 400px) {
                .xs\\:inline { display: inline; }
                .xs\\:scale-\\[0\\.55\\] { transform: scale(0.55); }
            }
          `}
      </style>

    </div>
  );
};

export default StudentTaskDashboard;