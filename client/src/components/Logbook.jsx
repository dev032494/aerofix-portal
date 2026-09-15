import React, { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import html2canvas from 'html2canvas-pro';
import jsPDF from 'jspdf';
import { workOrderService, logbookService, aircraftService } from '../services/api';

export default function Logbook() {
    const [activeTab, setActiveTab] = useState('create');
    const [loading, setLoading] = useState(false);
    const [workOrders, setWorkOrders] = useState([]);
    const [aircraftList, setAircraftList] = useState([]);
    const [logbookReports, setLogbookReports] = useState([]);
    const [reportsLoading, setReportsLoading] = useState(false);

    const [isViewingReport, setIsViewingReport] = useState(false);
    const printRef = useRef();

    const [formData, setFormData] = useState({
        work_order_id: '',
        aircraft_id: '',
        date: new Date().toISOString().split('T')[0],
        instructor: '',
        student: '',
        pilot_entries: Array(7).fill({
            pilot_crew: '',
            off_block: '',
            airborne: '',
            sta: '',
            touch_down: '',
            block_on: '',
            block_time: '',
            flight_time: '',
            ifr: '',
            ldgs: '',
            total_fuel: ''
        }),
        aircraft_monitoring: {
            brought_forward: Array(7).fill(''),
            this_log: Array(7).fill(''),
            total: Array(7).fill(''),
            tbo_due: Array(7).fill('')
        },
        fuel_oil: {
            fuel: Array(6).fill(''),
            oil_added: Array(6).fill(''),
            pre_flight_check: '',
            stamp_lic_no: ''
        },
        defects: Array(1).fill({
            defects_findings: '',
            corrective_action: '',
            mechanic_signature: ''
        }),
        component_changes: Array(2).fill({
            posn: '',
            nomenclature: '',
            out_pn: '',
            out_sn: '',
            in_pn: '',
            in_sn: ''
        }),
        post_flight_signoff: ''
    });

    useEffect(() => {
        fetchWorkOrders();
        fetchAircraft();
        fetchLogbookReports();
    }, []);

    const fetchWorkOrders = async () => {
        try {
            const response = await workOrderService.getCompleteWorkOrders();
            const data = response.data || response;
            setWorkOrders(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch work orders:', err);
        }
    };

    const fetchAircraft = async () => {
        try {
            const response = await aircraftService.getAllAircraft();
            const data = response.data?.data || response.data;
            setAircraftList(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch aircraft list:', err);
        }
    };

    const fetchLogbookReports = async () => {
        try {
            setReportsLoading(true);
            const response = await logbookService.getAll();
            const data = response.data?.data || response.data;
            setLogbookReports(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('Failed to fetch logbook reports:', err);
        } finally {
            setReportsLoading(false);
        }
    };

    const handleViewReport = async (reportId) => {
        try {
            const response = await logbookService.viewReport(reportId);
            const report = response.data?.data || response.data;

            if (report) {
                let detailsObj = {};
                try {
                    detailsObj = typeof report.details === 'string' ? JSON.parse(report.details) : (report.details || report);
                } catch (e) {
                    detailsObj = report;
                }

                setFormData({
                    work_order_id: report.work_order_id || detailsObj.work_order_ref || detailsObj.work_order_id || '',
                    aircraft_id: detailsObj.aircraft_id || report.aircraft_id || '',
                    date: formatDateTime(detailsObj.date || report.created_at),
                    instructor: detailsObj.instructor || '',
                    student: detailsObj.student || '',
                    pilot_entries: Array.isArray(detailsObj.pilot_entries) && detailsObj.pilot_entries.length > 0
                        ? detailsObj.pilot_entries
                        : Array(7).fill({ pilot_crew: '', off_block: '', airborne: '', sta: '', touch_down: '', block_on: '', block_time: '', flight_time: '', ifr: '', ldgs: '', total_fuel: '' }),
                    aircraft_monitoring: detailsObj.aircraft_monitoring || {
                        brought_forward: Array(7).fill(''),
                        this_log: Array(7).fill(''),
                        total: Array(7).fill(''),
                        tbo_due: Array(7).fill('')
                    },
                    fuel_oil: detailsObj.fuel_oil || {
                        fuel: Array(6).fill(''),
                        oil_added: Array(6).fill(''),
                        pre_flight_check: '',
                        stamp_lic_no: ''
                    },
                    defects: Array.isArray(detailsObj.defects) && detailsObj.defects.length > 0
                        ? detailsObj.defects
                        : Array(1).fill({ defects_findings: '', corrective_action: '', mechanic_signature: '' }),
                    component_changes: Array.isArray(detailsObj.component_changes) && detailsObj.component_changes.length > 0
                        ? detailsObj.component_changes
                        : Array(2).fill({ posn: '', nomenclature: '', out_pn: '', out_sn: '', in_pn: '', in_sn: '' }),
                    post_flight_signoff: detailsObj.post_flight_signoff || ''
                });

                setIsViewingReport(true);
                setActiveTab('create');
            }
        } catch (err) {
            console.error('Failed to view logbook details:', err);
            Swal.fire({
                title: 'Error',
                text: 'Failed to load logbook details into the form layout.',
                icon: 'error',
                confirmButtonColor: '#0284c7',
            });
        }
    };

    const handleDeleteReport = async (reportId) => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: 'You will not be able to recover this logbook report!',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#dc2626',
            cancelButtonColor: '#6b7280',
            confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
            try {
                if (logbookService.delete) {
                    await logbookService.delete(reportId);
                } else if (workOrderService.deleteReport) {
                    await workOrderService.deleteReport(reportId);
                }

                Swal.fire({
                    title: 'Deleted!',
                    text: 'Logbook report has been deleted.',
                    icon: 'success',
                    confirmButtonColor: '#0284c7',
                });

                fetchLogbookReports();
            } catch (err) {
                console.error('Failed to delete logbook report:', err);
                Swal.fire({
                    title: 'Error',
                    text: err.response?.data?.message || 'Failed to delete logbook report.',
                    icon: 'error',
                    confirmButtonColor: '#0284c7',
                });
            }
        }
    };

    const fetchWorkOrderDetails = async (workOrderNumber) => {
        if (!workOrderNumber) return;
        try {
            const response = await workOrderService.viewReport(workOrderNumber);
            const resData = response.data?.data || response.data;

            if (resData) {
                setFormData(prev => ({
                    ...prev,
                    work_order_id: workOrderNumber,
                    aircraft_id: resData.aircraft_id || resData.aircraft?.id || prev.aircraft_id,
                    date: formatDateTime(resData.wo_date),
                    instructor: resData.instructor ? `${resData.instructor.first_name || ''} ${resData.instructor.last_name || ''}`.trim() : '',
                    student: resData.personnel && resData.personnel.length > 0 && resData.personnel[0].user
                        ? `${resData.personnel[0].user.first_name || ''} ${resData.personnel[0].user.last_name || ''}`.trim()
                        : ''
                }));
            }
        } catch (err) {
            console.error('Failed to fetch work order report details:', err);
        }
    };

    const handleWorkOrderChange = async (e) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, work_order_id: val }));
        if (val) {
            await fetchWorkOrderDetails(val);
        }
    };

    const handleFieldChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handlePilotChange = (index, field, value) => {
        const updated = [...formData.pilot_entries];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, pilot_entries: updated }));
    };

    const handleAircraftMonChange = (rowKey, colIndex, value) => {
        const updatedRow = [...formData.aircraft_monitoring[rowKey]];
        updatedRow[colIndex] = value;
        setFormData(prev => ({
            ...prev,
            aircraft_monitoring: { ...prev.aircraft_monitoring, [rowKey]: updatedRow }
        }));
    };

    const handleFuelOilChange = (rowKey, colIndex, value) => {
        const updatedRow = [...formData.fuel_oil[rowKey]];
        updatedRow[colIndex] = value;
        setFormData(prev => ({
            ...prev,
            fuel_oil: { ...prev.fuel_oil, [rowKey]: updatedRow }
        }));
    };

    const handleDefectChange = (index, field, value) => {
        const updated = [...formData.defects];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, defects: updated }));
    };

    const handleComponentChange = (index, field, value) => {
        const updated = [...formData.component_changes];
        updated[index] = { ...updated[index], [field]: value };
        setFormData(prev => ({ ...prev, component_changes: updated }));
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const payload = {
                work_order_ref: formData.work_order_id,
                aircraft_id: formData.aircraft_id,
                date: formData.date,
                instructor: formData.instructor,
                student: formData.student,
                pilot_entries: formData.pilot_entries,
                aircraft_monitoring: formData.aircraft_monitoring,
                fuel_oil: formData.fuel_oil,
                defects: formData.defects,
                component_changes: formData.component_changes,
                post_flight_signoff: formData.post_flight_signoff
            };

            await logbookService.create(payload);

            Swal.fire({
                title: 'Success!',
                text: 'Work order logbook reference created successfully.',
                icon: 'success',
                confirmButtonColor: '#0284c7',
            });

            fetchLogbookReports();
            setActiveTab('view');
        } catch (err) {
            console.error(err);
            Swal.fire({
                title: 'Error',
                text: err.response?.data?.message || 'Failed to create logbook entry.',
                icon: 'error',
                confirmButtonColor: '#0284c7',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDownloadPDF = async () => {
        const element = printRef.current;
        if (!element) return;

        try {
            const canvas = await html2canvas(element, { scale: 2, useCORS: true });
            const imgData = canvas.toDataURL('image/png');

            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 10, pdfWidth, pdfHeight);
            pdf.save(`Logbook_Report_${formData.work_order_id || 'Document'}.pdf`);
        } catch (err) {
            console.error('Failed to generate PDF:', err);
            Swal.fire({
                title: 'Error',
                text: 'Could not generate PDF for this logbook view.',
                icon: 'error',
                confirmButtonColor: '#0284c7',
            });
        }
    };

    const renderEditableLogbookTables = () => (
        <>
            <div className="mb-3">
                <div className="bg-gray-200 font-bold px-2 py-1 border border-gray-400 text-center uppercase">Pilot/Crew</div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse border border-gray-400 text-center uppercase table-fixed">
                        <thead>
                            <tr className="bg-gray-100 text-[10px] text-center">
                                <th className="border border-gray-400 p-1" rowSpan={2}>PILOT/CREW</th>
                                <th className="border border-gray-400 p-1" colSpan={5}>STATION</th>
                                <th className="border border-gray-400 p-1" colSpan={3}>TIME</th>
                                <th className="border border-gray-400 p-1" rowSpan={2}>LDGS</th>
                                <th className="border border-gray-400 p-1" rowSpan={2}>TOTAL FUEL</th>
                            </tr>
                            <tr className="bg-gray-100 text-[10px] text-center">
                                <th className="border border-gray-400 p-1">OFF BLOCK</th>
                                <th className="border border-gray-400 p-1">AIRBORNE</th>
                                <th className="border border-gray-400 p-1">STA</th>
                                <th className="border border-gray-400 p-1">TOUCH DOWN</th>
                                <th className="border border-gray-400 p-1">BLOCK ON</th>
                                <th className="border border-gray-400 p-1">BLOCK TIME</th>
                                <th className="border border-gray-400 p-1">FLIGHT TIME</th>
                                <th className="border border-gray-400 p-1">IFR</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.pilot_entries.map((row, i) => (
                                <tr key={i}>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.pilot_crew} onChange={e => handlePilotChange(i, 'pilot_crew', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.off_block} onChange={e => handlePilotChange(i, 'off_block', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.airborne} onChange={e => handlePilotChange(i, 'airborne', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.sta} onChange={e => handlePilotChange(i, 'sta', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.touch_down} onChange={e => handlePilotChange(i, 'touch_down', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.block_on} onChange={e => handlePilotChange(i, 'block_on', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.block_time} onChange={e => handlePilotChange(i, 'block_time', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.flight_time} onChange={e => handlePilotChange(i, 'flight_time', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.ifr} onChange={e => handlePilotChange(i, 'ifr', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.ldgs} onChange={e => handlePilotChange(i, 'ldgs', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.total_fuel} onChange={e => handlePilotChange(i, 'total_fuel', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mb-3">
                <div className="bg-gray-200 font-bold px-2 py-1 border border-gray-400 text-center uppercase">Aircraft/Engine Monitoring</div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse border border-gray-400 text-center uppercase">
                        <thead>
                            <tr className="bg-gray-100 text-[10px]">
                                <th className="border border-gray-400 p-1" rowSpan={2}></th>
                                <th className="border border-gray-400 p-1" colSpan={2}>AIRFRAME</th>
                                <th className="border border-gray-400 p-1" colSpan={2}>ENGINE</th>
                                <th className="border border-gray-400 p-1" rowSpan={2}>PROPELLER TIME</th>
                                <th className="border border-gray-400 p-1" colSpan={2}>DUE</th>
                            </tr>
                            <tr className="bg-gray-100 text-[10px]">
                                <th className="border border-gray-400 p-1">TIME</th>
                                <th className="border border-gray-400 p-1">LDGS</th>
                                <th className="border border-gray-400 p-1">TIME</th>
                                <th className="border border-gray-400 p-1">CYCLES</th>
                                <th className="border border-gray-400 p-1">50 Hrs</th>
                                <th className="border border-gray-400 p-1">100 Hrs</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'BROUGHT FORWARD', key: 'brought_forward' },
                                { label: 'THIS LOG', key: 'this_log' },
                                { label: 'TOTAL', key: 'total' },
                                { label: 'TBO DUE', key: 'tbo_due' }
                            ].map((row, i) => (
                                <tr key={i}>
                                    <td className="border border-gray-400 p-1 font-semibold bg-gray-50 text-left pl-2 whitespace-nowrap">{row.label}</td>
                                    {formData.aircraft_monitoring[row.key].map((val, j) => (
                                        <td key={j} className="border border-gray-400 p-1 align-middle">
                                            <input type="text" disabled={isViewingReport} value={val} onChange={e => handleAircraftMonChange(row.key, j, e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" />
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mb-3">
                <div className="bg-gray-200 font-bold px-2 py-1 border border-gray-400 text-center uppercase">FUEL/OIL</div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px] border-collapse border border-gray-400 text-center uppercase">
                        <thead>
                            <tr className="bg-gray-100 text-[10px]">
                                <th className="border border-gray-400 p-1" rowSpan={2}></th>
                                <th className="border border-gray-400 p-1">QTY BEFORE 1ST FLIGHT / RUN-UP</th>
                                <th className="border border-gray-400 p-1">FLIGHT / RUN-UP QTY AFTER LAST FLT / RUN-UP</th>
                                <th className="border border-gray-400 p-1">TOTAL BURN-OUT (+/- UPLIFT)</th>
                                <th className="border border-gray-400 p-1">TOTAL UP-LIFT (KGS/LBS/LTRS/GAL)</th>
                                <th className="border border-gray-400 p-1">PRE FLIGHT CHECK PERFORMED</th>
                                <th className="border border-gray-400 p-1">STAMP/LIC NO.</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[
                                { label: 'FUEL', key: 'fuel', preFlightLabel: 'INSTRUCTOR:' },
                                { label: 'OIL ADDED', key: 'oil_added', preFlightLabel: 'STUDENT:' }
                            ].map((row, i) => (
                                <tr key={i}>
                                    <td className="border border-gray-400 p-1 font-semibold bg-gray-50 text-left pl-2 whitespace-nowrap h-16">{row.label}</td>

                                    {/* 1. Map through the regular numeric/text input cells */}
                                    {formData.fuel_oil[row.key].map((val, j) => (
                                        <td key={j} className="border border-gray-400 p-1 align-middle">
                                            {/* If index is 4 (the pre-flight check column), show the label and the input value together */}
                                            {j === 4 ? (
                                                <div className="flex items-center gap-1 px-1 bg-gray-50 h-full">
                                                    <span className="font-bold whitespace-nowrap text-xs">
                                                        {row.key === 'fuel' ? 'INSTRUCTOR:' : 'STUDENT:'}
                                                    </span>
                                                    <input
                                                        type="text"
                                                        disabled={isViewingReport}
                                                        value={val}
                                                        onChange={e => handleFuelOilChange(row.key, j, e.target.value)}
                                                        className="w-full text-left whitespace-normal break-words bg-transparent focus:outline-none"
                                                    />
                                                </div>
                                            ) : (
                                                /* Otherwise, render the regular input field for other columns */
                                                <input
                                                    type="text"
                                                    disabled={isViewingReport}
                                                    value={val}
                                                    onChange={e => handleFuelOilChange(row.key, j, e.target.value)}
                                                    className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none"
                                                />
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>


            <div className="mb-3">
                <div className="bg-gray-200 font-bold px-2 py-1 border border-gray-400 text-center uppercase">Defects/Findings/Remarks</div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] border-collapse border border-gray-400 uppercase">
                        <thead>
                            <tr className="bg-gray-100 text-[10px] text-center">
                                <th className="border border-gray-400 p-1">DEFECTS/FINDINGS/REMARKS</th>
                                <th className="border border-gray-400 p-1">CORRECTIVE ACTION</th>
                                <th className="border border-gray-400 p-1 w-60">MECHANIC SIGNATURE/STAMP</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.defects.map((row, i) => (
                                <tr key={i} className="h-40">
                                    <td className="border border-gray-400 p-1 align-top">
                                        <textarea
                                            disabled={isViewingReport}
                                            value={row.defects_findings}
                                            onChange={e => handleDefectChange(i, 'defects_findings', e.target.value)}
                                            className="w-full h-full min-h-[140px] text-left whitespace-normal break-words bg-transparent focus:outline-none resize-none p-1 uppercase"
                                        />
                                    </td>
                                    <td className="border border-gray-400 p-1 align-top">
                                        <textarea
                                            disabled={isViewingReport}
                                            value={row.corrective_action}
                                            onChange={e => handleDefectChange(i, 'corrective_action', e.target.value)}
                                            className="w-full h-full min-h-[140px] text-left whitespace-normal break-words bg-transparent focus:outline-none resize-none p-1 uppercase"
                                        />
                                    </td>
                                    <td className="border border-gray-400 p-1 align-top">
                                        <textarea
                                            disabled={isViewingReport}
                                            value={row.mechanic_signature}
                                            onChange={e => handleDefectChange(i, 'mechanic_signature', e.target.value)}
                                            className="w-full h-full min-h-[140px] text-center whitespace-normal break-words bg-transparent focus:outline-none resize-none p-1 uppercase"
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="mb-3">
                <div className="bg-gray-200 font-bold px-2 py-1 border border-gray-400 text-center uppercase">Component Change</div>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[500px] border-collapse border border-gray-400 text-center uppercase">
                        <thead>
                            <tr className="bg-gray-100 text-[10px]">
                                <th className="border border-gray-400 p-1" rowSpan={2}>POSN</th>
                                <th className="border border-gray-400 p-1" rowSpan={2}>NOMENCLATURE</th>
                                <th className="border border-gray-400 p-1" colSpan={2}>OUT</th>
                                <th className="border border-gray-400 p-1" colSpan={2}>IN</th>
                            </tr>
                            <tr className="bg-gray-100 text-[10px]">
                                <th className="border border-gray-400 p-1">P/N</th>
                                <th className="border border-gray-400 p-1">S/N</th>
                                <th className="border border-gray-400 p-1">P/N</th>
                                <th className="border border-gray-400 p-1">S/N</th>
                            </tr>
                        </thead>
                        <tbody>
                            {formData.component_changes.map((row, i) => (
                                <tr key={i}>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.posn} onChange={e => handleComponentChange(i, 'posn', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.nomenclature} onChange={e => handleComponentChange(i, 'nomenclature', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.out_pn} onChange={e => handleComponentChange(i, 'out_pn', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.out_sn} onChange={e => handleComponentChange(i, 'out_sn', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.in_pn} onChange={e => handleComponentChange(i, 'in_pn', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                    <td className="border border-gray-400 p-1.5 align-middle"><input type="text" disabled={isViewingReport} value={row.in_sn} onChange={e => handleComponentChange(i, 'in_sn', e.target.value)} className="w-full text-center whitespace-normal break-words bg-transparent focus:outline-none" /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="border border-gray-400 p-2 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 uppercase">
                <span className="font-bold">POST FLIGHT CHECK COMPLETED</span>
                <div className="w-full sm:w-2/3">
                    <label className="font-semibold block text-[10px] mb-1 normal-case">Mechanic/Student's Names, Sig. and License No.:</label>
                    <input
                        type="text"
                        disabled={isViewingReport}
                        value={formData.post_flight_signoff}
                        onChange={e => setFormData(prev => ({ ...prev, post_flight_signoff: e.target.value }))}
                        className="border-b border-gray-400 bg-transparent w-full text-center whitespace-normal break-words focus:outline-none"
                    />
                </div>
            </div>
        </>
    );

    return (
        <div className="w-full max-w-full mx-auto p-4 font-sans text-gray-900">
            <div className="flex border-b border-gray-400 mb-4">
                <button
                    onClick={() => {
                        setIsViewingReport(false);
                        setActiveTab('create');
                    }}
                    className={`px-4 py-2 font-bold text-xs uppercase border-t border-l border-r rounded-t cursor-pointer ${activeTab === 'create'
                        ? 'bg-white border-gray-400 border-b-white -mb-px text-blue-600'
                        : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    {isViewingReport ? 'View Report Details' : 'Create Work Order Logbook'}
                </button>
                <button
                    onClick={() => setActiveTab('view')}
                    className={`px-4 py-2 font-bold text-xs uppercase border-t border-l border-r rounded-t cursor-pointer ${activeTab === 'view'
                        ? 'bg-white border-gray-400 border-b-white -mb-px text-blue-600'
                        : 'bg-gray-100 border-transparent text-gray-600 hover:bg-gray-200'
                        }`}
                >
                    View Logbook Reports
                </button>
            </div>

            {activeTab === 'create' ? (
                <div className="bg-white p-4 border border-gray-400 shadow-md text-[11px] sm:text-xs">
                    <h2 className="bg-gray-200 font-bold px-2 py-1 border border-gray-400 text-center uppercase mb-4 text-xs">
                        {isViewingReport ? 'View Logbook Report Details' : 'Create Work Order Reference'}
                    </h2>

                    <div ref={printRef} className="bg-white p-2">
                        <form onSubmit={handleCreateSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 uppercase">
                                <div className="flex flex-col">
                                    <label className="font-semibold mb-1">Work Order Reference</label>
                                    {isViewingReport ? (
                                        <input
                                            type="text"
                                            value={formData.work_order_id}
                                            className="border border-gray-400 p-1.5 focus:outline-none bg-gray-50 uppercase text-center"
                                            disabled
                                        />
                                    ) : (
                                        <select
                                            name="work_order_id"
                                            value={formData.work_order_id}
                                            onChange={handleWorkOrderChange}
                                            className="border border-gray-400 p-1.5 bg-white focus:outline-none uppercase text-center"
                                        >
                                            <option value="" disabled>-- Select Work Order --</option>
                                            {workOrders.map((wo) => (
                                                <option key={wo.wo_work_order_number} value={wo.wo_work_order_number}>
                                                    {wo.wo_work_order_number}
                                                </option>
                                            ))}
                                        </select>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-semibold mb-1">Aircraft</label>
                                    <select
                                        name="aircraft_id"
                                        disabled={isViewingReport}
                                        value={formData.aircraft_id}
                                        onChange={handleFieldChange}
                                        className="border border-gray-400 p-1.5 bg-white focus:outline-none uppercase disabled:bg-gray-50 text-center"
                                    >
                                        <option value="" disabled>-- Select Aircraft --</option>
                                        {Array.isArray(aircraftList) && aircraftList.map((ac) => (
                                            <option key={ac.a_id} value={ac.a_id}>
                                                {ac.a_aircraft_type} ({ac.a_registration_number})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-semibold mb-1">Date</label>
                                    <input
                                        type="date"
                                        name="date"
                                        value={formData.date}
                                        className="border border-gray-400 p-1.5 focus:outline-none bg-gray-50 text-center"
                                        disabled
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-semibold mb-1">Instructor</label>
                                    <input
                                        type="text"
                                        name="instructor"
                                        value={formData.instructor}
                                        className="border border-gray-400 p-1.5 focus:outline-none bg-gray-50 text-center"
                                        disabled
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label className="font-semibold mb-1">Student</label>
                                    <input
                                        type="text"
                                        name="student"
                                        value={formData.student}
                                        className="border border-gray-400 p-1.5 focus:outline-none bg-gray-50 text-center"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-300">
                                {renderEditableLogbookTables()}
                            </div>
                        </form>
                    </div>

                    <div className="flex justify-end mt-4 gap-2">
                        {isViewingReport ? (
                            <button
                                type="button"
                                onClick={handleDownloadPDF}
                                className="bg-emerald-600 text-white px-6 py-2.5 font-bold uppercase rounded hover:bg-emerald-700 transition-colors cursor-pointer shadow-sm inline-flex items-center gap-2"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                Download PDF
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleCreateSubmit}
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2.5 font-bold uppercase rounded hover:bg-blue-700 transition-colors cursor-pointer disabled:opacity-50 shadow-sm"
                            >
                                {loading ? 'Saving Entry...' : 'Save Logbook Entry'}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-full mx-auto p-4 bg-white text-[11px] sm:text-xs font-sans text-gray-900 border border-gray-400 shadow-md">
                    <h2 className="bg-gray-200 font-bold px-2 py-2 border border-gray-400 text-center uppercase mb-4 text-xs">
                        Logbook Reports Registry
                    </h2>

                    {reportsLoading ? (
                        <p className="text-center py-6 text-gray-500 italic">Loading logbook reports...</p>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-400 text-center uppercase">
                                <thead>
                                    <tr className="bg-gray-100 text-[10px]">
                                        <th className="border border-gray-400 p-2">Work Order Ref</th>
                                        <th className="border border-gray-400 p-2">Date</th>
                                        <th className="border border-gray-400 p-2">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {logbookReports.length > 0 ? (
                                        logbookReports.map((report, idx) => (
                                            <tr key={report.id || idx} className="hover:bg-gray-50">
                                                <td className="border border-gray-400 p-2 font-semibold">
                                                    {report.work_order_id}
                                                </td>
                                                <td className="border border-gray-400 p-2">
                                                    {formatDateTime(report.created_at)}
                                                </td>
                                                <td className="border border-gray-400 p-2 space-x-2">
                                                    <button
                                                        onClick={() => handleViewReport(report.id)}
                                                        title="View Details"
                                                        className="bg-blue-600 text-white p-1.5 rounded hover:bg-blue-700 transition-colors cursor-pointer inline-flex items-center justify-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReport(report.id || report.work_order_id)}
                                                        title="Delete Report"
                                                        className="bg-red-600 text-white p-1.5 rounded hover:bg-red-700 transition-colors cursor-pointer inline-flex items-center justify-center"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={3} className="border border-gray-400 p-4 text-center text-gray-500 italic">
                                                No logbook reports found.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}