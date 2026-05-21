import React, { useState, useEffect } from 'react';
import { workOrderService } from '../services/api';
import { Wrench, Layers, Package, CheckSquare, Plus, X, ClipboardList, ArrowLeft, Calendar, FileText, Activity } from 'lucide-react';

export default function WorkOrderView() {
  const [workOrderList, setWorkOrderList] = useState([]);
  const [selectedWorkOrderId, setSelectedWorkOrderId] = useState(null);
  const [data, setData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedTaskCardId, setSelectedTaskCardId] = useState(null);
  const [formData, setFormData] = useState({});

  // 1. Fetch Summary Registry Rows of all opened Work Orders
  const fetchWorkOrderLedger = async () => {
    try {
      const res = await workOrderService.getAllWorkOrders?.() || await workOrderService.getProgress(1);
      const ledger = Array.isArray(res.data?.data?.workOrders)
        ? res.data.data.workOrders
        : res.data?.data?.workOrder ? [res.data.data.workOrder] : [];
      setWorkOrderList(ledger);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // 2. Lifecycle Sync Coordinator
  const syncViewEngine = async (autoSelectId = null) => {
    setLoading(true);
    try {
      await fetchWorkOrderLedger();
      const targetId = autoSelectId || selectedWorkOrderId;
      if (targetId) {
        await handleSelectWorkOrder(targetId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  // 3. Focus a specific work order contract context node
  const handleSelectWorkOrder = async (id) => {
    setLoading(true);
    setSelectedWorkOrderId(id);
    try {
      const res = await workOrderService.getProgress(id);
      setData(res.data?.data?.workOrder || null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 4. Safely flush detailed scope arrays when traveling back to master indices
  const handleBackToLedger = () => {
    setLoading(true);
    setData(null);
    setSelectedWorkOrderId(null);
    fetchWorkOrderLedger().finally(() => setLoading(false));
  };

  useEffect(() => {
    syncViewEngine();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    try {
      const currentWoId = data?.id || selectedWorkOrderId || 1;
      switch (activeModal) {
        case 'workorder':
          const newWo = await workOrderService.create(formData);
          const newId = newWo.data?.data?.workOrder?.id || newWo.data?.data?.id;
          setActiveModal(null);
          setFormData({});
          syncViewEngine(newId); // Auto focus and open the freshly initialized tracker
          return;
        case 'taskcard': 
          await workOrderService.addTaskCard({ ...formData, work_order_id: currentWoId }); 
          break;
        case 'part': 
          await workOrderService.addPart({ ...formData, task_card_id: selectedTaskCardId }); 
          break;
        case 'step': 
          await workOrderService.addStep({ ...formData, step_order: parseInt(formData.step_order), task_card_id: selectedTaskCardId }); 
          break;
        default: 
          break;
      }
      setActiveModal(null);
      setSelectedTaskCardId(null);
      setFormData({});
      syncViewEngine();
    } catch (err) {
      alert(`Action refused: ${err.message}`);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-slate-400 gap-3">
      <ClipboardList className="h-10 w-10 text-sky-500 animate-spin" />
      <span className="text-sm font-medium animate-pulse">Resolving tracking boards layout trees...</span>
    </div>
  );

  if (error) return (
    <div className="text-rose-400 bg-rose-950/30 p-5 border border-rose-800 rounded-xl max-w-2xl mx-auto mt-10 shadow-lg">
      <h3 className="font-bold text-lg flex items-center gap-2 mb-2">🚨 Ledger Disconnect</h3>
      <p className="text-sm text-rose-300/80">Could not resolve operational tracking trees: {error}</p>
      <button onClick={handleBackToLedger} className="mt-4 text-xs bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 text-slate-200 cursor-pointer">Force Reset Context</button>
    </div>
  );

  return (
    <div className="space-y-6">
      
      {/* =========================================================================
          VIEW MODE 1: MASTER CONTRACT WORK ORDERS REGISTRY MATRIX
          ========================================================================= */}
      {!selectedWorkOrderId ? (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col gap-4 bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">Maintenance Work Orders</h1>
              <p className="text-slate-400 text-xs sm:text-sm mt-1">Review active corporate maintenance logs, inspect ATA task cards, and approve part item allocations.</p>
            </div>
            <button 
              onClick={() => { setFormData({}); setActiveModal('workorder'); }}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" /> Create Work Order
            </button>
          </div>

          {workOrderList.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
              <ClipboardList className="h-8 w-8 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">No Maintenance Trackers Defined</h3>
              <p className="text-xs text-slate-400">Initialize an aviation maintenance order form mapping to an airframe node to begin scheduling task actions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
              {workOrderList.map((wo) => (
                <div 
                  key={wo.id}
                  onClick={() => handleSelectWorkOrder(wo.id)}
                  className="bg-slate-900 border border-slate-800 hover:border-sky-500/40 p-5 rounded-2xl shadow-xl space-y-4 cursor-pointer transition-all hover:-translate-y-1 group active:scale-98"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-sky-400 transition-colors tracking-tight">WO: {wo.work_order_number}</h3>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">Opened: {wo.opened_date}</p>
                    </div>
                    <span className={`px-2 py-0.5 border text-[9px] font-black uppercase rounded font-sans tracking-wide ${
                      wo.status === 'open' || wo.status === 'active'
                        ? 'bg-sky-500/10 text-sky-400 border-sky-500/20'
                        : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    }`}>
                      {wo.status}
                    </span>
                  </div>

                  <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5"><Layers className="h-4 w-4 text-sky-500" /> <span>{wo.taskCards?.length || 0} Task Cards</span></div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-950 border border-slate-850 px-2 py-0.5 rounded uppercase">ID Block: {wo.aircraft_id || '1'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (

        // =========================================================================
        // VIEW MODE 2: SPECIFIC TASK CARDS PROGRESS AND DISPATCH TREES
        // =========================================================================
        <div className="space-y-6 animate-fadeIn">
          
          <button 
            onClick={handleBackToLedger} 
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-200 transition-all bg-slate-900 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-lg cursor-pointer shadow-sm active:scale-95"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Work Order Ledger
          </button>

          {/* ⚡ MOBILE RESPONSIVE WORK ORDER BASE OVERVIEW PANEL */}
          <div className="flex flex-col gap-4 bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-800 shadow-xl sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">WO: {data.work_order_number}</h1>
                <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 border border-sky-500/20 rounded-md text-[10px] font-bold uppercase">{data.status}</span>
              </div>
              <p className="text-slate-500 text-xs mt-1">Initiated Timestamp: <span className="font-mono text-slate-400">{data.opened_date}</span></p>
            </div>
            <button 
              onClick={() => { setFormData({}); setActiveModal('taskcard'); }}
              className="w-full sm:w-auto bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center justify-center gap-1.5 shadow-md cursor-pointer shrink-0"
            >
              <Plus className="h-4 w-4" /> Issue Task Card
            </button>
          </div>

          {/* ⚡ CARD TREE LAYOUT PIPELINE ROUTERS */}
          <div className="space-y-6">
            {data.taskCards && data.taskCards.length > 0 ? (
              data.taskCards.map(card => (
                <div key={card.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  
                  {/* Header Banner Block */}
                  <div className="bg-slate-850 p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-sky-500/10 text-sky-400 rounded-lg"><Layers className="h-4 w-4" /></div>
                      <div>
                        <h3 className="font-bold text-white text-sm sm:text-base">{card.title}</h3>
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5">ATA: {card.task_code} | Ref: {card.reference_manual || 'N/A'}</p>
                      </div>
                    </div>
                    <span className="text-[11px] font-mono bg-slate-950 px-2.5 py-1 text-slate-400 border border-slate-800 rounded-lg shrink-0 self-end sm:self-auto">Est: {card.estimated_hours || '0'}h</span>
                  </div>

                  {/* Grid Split Subsystems layout block */}
                  <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    
                    {/* Action checklist list */}
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><CheckSquare className="h-4 w-4 text-sky-400" /> Compliance Checklist</h4>
                        <button onClick={() => { setSelectedTaskCardId(card.id); setActiveModal('step'); }} className="text-sky-400 text-xs font-bold hover:underline flex items-center gap-0.5 cursor-pointer"><Plus className="h-3 w-3" /> Step</button>
                      </div>
                      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                        {card.steps && card.steps.length > 0 ? (
                          card.steps.map(step => (
                            <div key={step.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex gap-3 text-xs leading-relaxed">
                              <input type="checkbox" checked={step.is_completed || false} readOnly className="mt-0.5 h-4 w-4 accent-sky-500 rounded border-slate-700 bg-slate-900 shrink-0" />
                              <div>
                                <p className="text-slate-300 font-medium">{step.instruction}</p>
                                {step.torque_spec && <span className="inline-block text-[10px] text-amber-400 font-mono bg-amber-500/5 px-1.5 py-0.5 rounded border border-amber-500/10 mt-1">Torque: {step.torque_spec}</span>}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">No instructions defined.</p>
                        )}
                      </div>
                    </div>

                    {/* Hardware component allocation table section */}
                    <div className="space-y-3.5">
                      <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5"><Wrench className="h-4 w-4 text-amber-500" /> Materials & Hardware</h4>
                        <button onClick={() => { setSelectedTaskCardId(card.id); setActiveModal('part'); }} className="text-amber-400 text-xs font-bold hover:underline flex items-center gap-0.5 cursor-pointer"><Plus className="h-3 w-3" /> Part</button>
                      </div>
                      <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                        {card.parts && card.parts.length > 0 ? (
                          card.parts.map(part => (
                            <div key={part.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center text-xs gap-4">
                              <div className="truncate"><p className="font-bold text-slate-200 truncate">{part.description}</p><p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">P/N: {part.part_number}</p></div>
                              <span className="text-xs font-mono font-bold bg-slate-900 px-2 py-1 text-sky-400 border border-slate-800 rounded-md shrink-0">Qty: {part.quantity_required}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500 italic py-2">No material inputs requested.</p>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900 border border-slate-800 p-8 text-center rounded-2xl italic text-xs text-slate-500">
                This maintenance order card framework contains no active issue fields. Launch an item above.
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          ⚡ HOISTED POPUP ENTRY FORM MODALS CONTAINER (Accessible across views)
          ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850">
              <h3 className="font-bold text-white text-base capitalize">New {activeModal === 'workorder' ? 'Work Order' : activeModal} Parameter Input</h3>
              <button onClick={() => { setActiveModal(null); setSelectedTaskCardId(null); }} className="text-slate-400 p-1 rounded-lg hover:text-white cursor-pointer"><X className="h-5 w-5" /></button>
            </div>
            
            <form onSubmit={handleModalSubmit} className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              
              {/* MODAL 1: INITIALIZE NEW MAIN CONTRACT WORK ORDER */}
              {activeModal === 'workorder' && (
                <>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Work Order ID Identifier *</label><input type="text" name="work_order_number" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 font-mono text-sm" placeholder="e.g. WO-2026-8942" /></div>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Target Airframe ID Match *</label><input type="number" name="aircraft_id" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 font-mono text-sm" placeholder="1" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Open Date *</label><input type="date" name="opened_date" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 font-mono" /></div>
                    <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Initial Contract Status</label><select name="status" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white focus:outline-none focus:border-sky-500 text-xs"><option value="open">Open / Issued</option><option value="active">Active Track</option></select></div>
                  </div>
                </>
              )}

              {/* MODAL 2: ISSUE NEW CHILD ATA TASK CARD */}
              {activeModal === 'taskcard' && (
                <>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">ATA Code Reference *</label><input type="text" name="task_code" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="ATA-52-10" /></div>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Task Title Name *</label><input type="text" name="title" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="Fuselage Inspection Panel Check" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Reference Manual Source</label><input type="text" name="reference_manual" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="Cessna-AMM-R12" /></div>
                    <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Estimated Hours</label><input type="number" step="0.1" name="estimated_hours" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="2.5" /></div>
                  </div>
                </>
              )}

              {/* MODAL 3: ALLOCATE HARDWARE MATERIALS ITEM */}
              {activeModal === 'part' && (
                <>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Part Number Block *</label><input type="text" name="part_number" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="MS21044-N4" /></div>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Nomenclature Description *</label><input type="text" name="description" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="High-Temp Viton Seal O-Ring" /></div>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Quantity Required *</label><input type="number" step="1" name="quantity_required" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="1" /></div>
                </>
              )}

              {/* MODAL 4: PROVISION ACTION STEP LINE */}
              {activeModal === 'step' && (
                <>
                  <div className="grid grid-cols-3 gap-3">
                    <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Seq *</label><input type="number" name="step_order" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="1" /></div>
                    <div className="col-span-2"><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Torque Value</label><input type="text" name="torque_spec" onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-mono" placeholder="45 in-lbs" /></div>
                  </div>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Procedural Compliance Action Text *</label><textarea name="instruction" rows="3" required onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500" placeholder="Describe the maintenance milestone criteria steps precisely..."></textarea></div>
                </>
              )}

              <div className="pt-4 flex gap-2 border-t border-slate-800">
                <button type="button" onClick={() => { setActiveModal(null); setSelectedTaskCardId(null); }} className="w-1/2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-2.5 rounded-xl cursor-pointer">Abort</button>
                <button type="submit" className="w-1/2 bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl cursor-pointer shadow-md">Commit</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}