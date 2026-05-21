import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, BookOpen, Download, History, Filter, RefreshCw, FileText, Plus, X, ShieldAlert, Eye, EyeOff, Maximize2, Minimize2 } from 'lucide-react';

export default function LibraryView() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Sidebar Selection Controls States
  const [selectedCustomization, setSelectedCustomization] = useState('DEMO');
  const [selectedAircraftType, setSelectedAircraftType] = useState('A320');
  const [selectedDoctypes, setSelectedDoctypes] = useState(['AMM', 'IPC']);
  
  // Dynamic Viewing Viewer Workspace Pipeline States
  const [activeViewingUrl, setActiveViewingUrl] = useState(null);
  const [viewingTargetTitle, setViewingTargetTitle] = useState('');
  const [isFullscreenViewer, setIsFullscreenViewer] = useState(false);

  // Modal & Audit Tracking Trees States
  const [historyTarget, setHistoryTarget] = useState(null); 
  const [activeModal, setActiveModal] = useState(null); // 'document' | 'revision' | 'history'
  
  const [formData, setFormData] = useState({
    title: '', document_type: 'AMM', aircraft_types: 'A320', 
    customization: 'DEMO', revision_number: 'Rev 01', revision_date: '', file_url: ''
  });

  const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('aerofix_token');
      const res = await axios.get(`${getApiUrl()}/library`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { 
          customization: selectedCustomization, 
          aircraft: selectedAircraftType, 
          doctypes: selectedDoctypes.join(',') 
        }
      });
      setDocuments(res.data?.data?.documents || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to populate tech publications.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocumentHistory = async (docId) => {
    try {
      const token = localStorage.getItem('aerofix_token');
      const res = await axios.get(`${getApiUrl()}/library/${docId}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHistoryTarget(res.data?.data?.document);
    } catch (err) {
      alert(`Could not pull tracking histories: ${err.message}`);
    }
  };

  useEffect(() => { 
    fetchCatalog(); 
  }, [selectedCustomization, selectedAircraftType, selectedDoctypes]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateDocument = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('aerofix_token');
      await axios.post(`${getApiUrl()}/library`, formData, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setActiveModal(null);
      fetchCatalog();
    } catch (err) { 
      alert(err.response?.data?.message || err.message); 
    }
  };

  const handlePushRevision = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('aerofix_token');
      await axios.post(`${getApiUrl()}/library/${historyTarget.id}/revisions`, {
        revision_number: formData.revision_number,
        revision_date: formData.revision_date,
        file_url: formData.file_url
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      setActiveModal(null);
      setHistoryTarget(null);
      fetchCatalog();
    } catch (err) { 
      alert(err.response?.data?.message || err.message); 
    }
  };

  const filteredDocs = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ⚡ AUTOMATIC LINK SANITIZER TO BYPASS X-FRAME-OPTIONS BLOCKS
  const getSanitizedViewerUrl = (url) => {
    if (!url) return '';
    let cleanUrl = url;
    if (cleanUrl.includes('drive.google.com') && cleanUrl.includes('/view')) {
      cleanUrl = cleanUrl.split('/view')[0] + '/preview';
    }
    if (cleanUrl.includes('docs.google.com') && cleanUrl.includes('/edit')) {
      cleanUrl = cleanUrl.split('/edit')[0] + '/preview';
    }
    return cleanUrl;
  };

  if (error) return (
    <div className="text-rose-400 bg-rose-950/30 p-5 border border-rose-800 rounded-xl max-w-2xl mx-auto mt-10 shadow-lg">
      <h3 className="font-bold text-lg flex items-center gap-2 mb-2">🚨 Library Telemetry Glitch</h3>
      <p className="text-sm text-rose-300/80">{error}</p>
      <button onClick={fetchCatalog} className="mt-4 text-xs bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 text-slate-200 cursor-pointer">Retry Workspace Stream</button>
    </div>
  );

  return (
    <div className="w-full h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-4 animate-fadeIn relative overflow-hidden">
      
      {/* MASTER RESPONSIVE WORKING CONTENT FLEX CONTAINER GRID */}
      <div className="flex-1 w-full flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden relative">
        
        {/* 🧭 CONTEXT CONTROLLER FILTER SIDEBAR PANEL (Hides completely on mobile/tablet screens when reader workspace activates to conserve system real estate) */}
        <aside className={`w-full lg:w-64 bg-[#0d162d] border border-slate-800 rounded-2xl flex flex-col overflow-y-auto shrink-0 transition-all duration-300 ${activeViewingUrl ? 'hidden xl:flex' : 'flex'}`}>
          <div className="p-4 bg-[#111c3a] border-b border-slate-800 flex items-center justify-between shrink-0">
            <span className="font-black text-xs uppercase tracking-widest text-sky-400 flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" /> Context</span>
            <button onClick={() => { setSelectedCustomization('DEMO'); setSelectedAircraftType('A320'); setSelectedDoctypes(['AMM', 'IPC']); }} className="px-2 py-0.5 bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-400 uppercase rounded cursor-pointer hover:border-slate-600">Reset</button>
          </div>

          <div className="p-4 space-y-4 text-xs">
            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Customization</label>
              <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-500 font-mono font-bold flex justify-between items-center">
                <span>{selectedCustomization || 'NONE'}</span>
                {selectedCustomization && <X className="h-3.5 w-3.5 text-slate-500 hover:text-white cursor-pointer" onClick={() => setSelectedCustomization('')} />}
              </div>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1">Aircraft Type</label>
              <select value={selectedAircraftType} onChange={(e) => setSelectedAircraftType(e.target.value)} className="w-full bg-slate-950 border border-slate-800 px-3 py-2 text-amber-400 font-bold font-mono rounded-xl focus:outline-none focus:border-sky-500">
                <option value="A318">A318 Matrix</option>
                <option value="A319">A319 Matrix</option>
                <option value="A320">A320 Matrix</option>
                <option value="A321">A321 Matrix</option>
                <option value="C150">Cessna 150</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-bold uppercase tracking-wider mb-1.5">Doctypes Filter</label>
              <div className="space-y-1.5">
                {['AMM', 'IPC', 'TSM', 'WDM'].map(type => (
                  <div 
                    key={type} 
                    onClick={() => setSelectedDoctypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])}
                    className={`p-2.5 border rounded-xl font-bold font-mono flex items-center justify-between cursor-pointer transition-all ${selectedDoctypes.includes(type) ? 'bg-amber-500/10 border-amber-500/40 text-amber-400' : 'bg-slate-950 border-slate-850 text-slate-500'}`}
                  >
                    <span>{type}</span>
                    {selectedDoctypes.includes(type) && <span className="text-[9px] bg-amber-500 text-slate-950 px-1 rounded uppercase font-black">Active</span>}
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => { setFormData({ title: '', document_type: 'AMM', aircraft_types: selectedAircraftType, customization: 'DEMO', revision_number: 'Rev 01', revision_date: '', file_url: '' }); setActiveModal('document'); }} className="w-full bg-sky-600 hover:bg-sky-500 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-md">
              <Plus className="h-4 w-4" /> Inject New Manual
            </button>
          </div>
        </aside>

        {/* 📋 CENTRAL DATA CATALOGUE LOG DISPLAY PANEL */}
        <section className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 ${activeViewingUrl && !isFullscreenViewer ? 'hidden lg:flex lg:max-w-[35%] xl:max-w-[30%]' : activeViewingUrl && isFullscreenViewer ? 'hidden' : 'flex'}`}>
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-slate-950 border border-slate-800 rounded-xl text-sky-400 flex items-center justify-center shadow-inner"><BookOpen className="h-5 w-5" /></div>
            <div className="relative flex-1 text-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-white text-xs focus:outline-none focus:border-sky-500" placeholder="Filter current catalog list by text title properties..." />
            </div>
          </div>

          <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-1 pt-3 pb-1 shrink-0">Results Count: {filteredDocs.length} Manual Indexes</div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4 custom-scrollbar">
            {documents.length === 0 && !loading ? (
              <div className="text-center py-20 bg-slate-900/40 border border-slate-850 rounded-2xl text-slate-500 italic text-xs">
                No technical documents found matching selected context filters.
              </div>
            ) : filteredDocs.map(doc => {
              const activeRev = doc.revisions?.find(r => r.status === 'active');
              const isCurrentlyViewing = activeViewingUrl === activeRev?.file_url;

              return (
                <div key={doc.id} className={`p-4 rounded-xl flex flex-col sm:flex-row lg:flex-col xl:flex-row justify-between items-start sm:items-center lg:items-start xl:items-center gap-4 transition-all border group ${isCurrentlyViewing ? 'bg-sky-950/20 border-sky-500/40 shadow-md shadow-sky-500/5' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
                  <div className="min-w-0 space-y-0.5 w-full">
                    <h3 className={`font-black text-sm tracking-tight truncate transition-colors ${isCurrentlyViewing ? 'text-sky-400' : 'text-white group-hover:text-sky-400'}`}><span className="text-amber-400 font-mono font-bold mr-1.5">{doc.document_type}</span>{doc.title}</h3>
                    <p className="text-xs text-slate-400 font-medium truncate">{doc.aircraft_types} | <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">{doc.customization}</span></p>
                    {activeRev && <p className="text-[10px] font-mono font-bold text-slate-500 pt-0.5">{activeRev.revision_number} ({activeRev.revision_date})</p>}
                  </div>
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 p-1 rounded-xl self-end sm:self-auto lg:self-end xl:self-auto shrink-0 shadow-inner">
                    {/* ⚡ ACTIVE INLINE VIEWER TRIGGER */}
                    {activeRev && (
                      <button 
                        onClick={() => {
                          if (isCurrentlyViewing) {
                            setActiveViewingUrl(null);
                            setViewingTargetTitle('');
                            setIsFullscreenViewer(false);
                          } else {
                            setActiveViewingUrl(activeRev.file_url);
                            setViewingTargetTitle(`${doc.document_type} ${doc.title} (${activeRev.revision_number})`);
                          }
                        }}
                        title={isCurrentlyViewing ? "Close Digital Viewer" : "Open Digital Content Viewer"}
                        className={`p-2 rounded-lg cursor-pointer transition-all ${isCurrentlyViewing ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20' : 'text-slate-400 hover:text-white hover:bg-slate-900'}`}
                      >
                        {isCurrentlyViewing ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    )}
                    {activeRev && <a href={activeRev.file_url} target="_blank" rel="noreferrer" title="Open source target external" className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"><FileText className="h-4 w-4" /></a>}
                    {activeRev && <a href={activeRev.file_url} download title="Save binary file down" className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg transition-colors"><Download className="h-4 w-4" /></a>}
                    <button onClick={async () => { await fetchDocumentHistory(doc.id); setActiveModal('history'); }} title="Audit history lifecycle tracks" className="p-2 text-slate-400 hover:text-white hover:bg-slate-900 rounded-lg cursor-pointer transition-colors"><History className="h-4 w-4" /></button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            ⚡ EXPANDABLE ULTRA-WIDE EMBEDDED DIGITAL WORKSPACE MODULE VIEWPORT
            ========================================================================= */}
        {activeViewingUrl && (
          <section className={`h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 min-w-0 ${isFullscreenViewer ? 'w-full lg:flex-1' : 'w-full lg:flex-[0_0_65%] xl:flex-[0_0_70%]'}`}>
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center px-4 shrink-0 h-14">
              <div className="flex items-center gap-2.5 truncate max-w-[65%] sm:max-w-[80%]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-black text-xs md:text-sm text-slate-200 font-sans truncate tracking-wide uppercase" title={viewingTargetTitle}>
                  {viewingTargetTitle}
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 border border-slate-800 rounded-xl shrink-0">
                {/* 🔄 EXPAND / COMPRESS LAYOUT SCREEN SIZE INTERCEPTOR */}
                <button
                  onClick={() => setIsFullscreenViewer(!isFullscreenViewer)}
                  title={isFullscreenViewer ? "Split Workspace Interface Layout" : "Maximize Document Viewport Pane"}
                  className="hidden lg:block p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {isFullscreenViewer ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button 
                  onClick={() => { setActiveViewingUrl(null); setViewingTargetTitle(''); setIsFullscreenViewer(false); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 cursor-pointer transition-colors"
                  title="Close Reader Console"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex-1 bg-slate-950 p-1 md:p-2.5 relative h-full w-full">
              {/* ⚡ RENDERS INTERNAL SANITIZED RESOURCE THROUGH SECURE IFRAME PORTS */}
              <iframe 
                src={`${getSanitizedViewerUrl(activeViewingUrl)}#toolbar=1&navpanes=0&scrollbar=1`}
                className="w-full h-full rounded-xl bg-[#1e2538] border border-slate-850 shadow-inner"
                title="AeroFix Integrated Document Workspace Console"
                allow="autoplay; fullscreen"
                loading="lazy"
              />
            </div>
          </section>
        )}

      </div>

      {/* =========================================================================
          ⚡ RESPONSIVE INTERACTIVE FLOATING MODALS OVERLAYS
          ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850 shrink-0">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">{activeModal === 'document' && 'Provision Base Manual'}{activeModal === 'revision' && 'Issue New Active Revision'}{activeModal === 'history' && 'Audit trail History Archive'}</h3>
              <button onClick={() => { setActiveModal(null); if (activeModal !== 'revision') setHistoryTarget(null); }} className="text-slate-400 hover:text-white p-1 cursor-pointer"><X className="h-5 w-5" /></button>
            </div>

            {/* FORM MODAL 1: PROVISION NEW ENTRY BASE MANUAL */}
            {activeModal === 'document' && (
              <form onSubmit={handleCreateDocument} className="p-5 space-y-4 overflow-y-auto text-xs">
                <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Manual Label Title *</label><input type="text" name="title" required value={formData.title} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-sans text-sm" placeholder="Aircraft Maintenance Manual" /></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Doctype Label</label><select name="document_type" value={formData.document_type} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white text-xs"><option value="AMM">AMM</option><option value="IPC">IPC</option><option value="TSM">TSM</option><option value="WDM">WDM</option></select></div>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Aircraft Applicability *</label><input type="text" name="aircraft_types" required value={formData.aircraft_types} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono" placeholder="A320, A321" /></div>
                </div>
                <div className="grid grid-cols-2 gap-3 border-t border-slate-800/60 pt-3">
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Revision Index *</label><input type="text" name="revision_number" required value={formData.revision_number} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono" placeholder="Rev 01" /></div>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Revision Date *</label><input type="text" name="revision_date" required value={formData.revision_date} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono" placeholder="21-May-2026" /></div>
                </div>
                <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Resource PDF URL *</label><input type="text" name="file_url" required value={formData.file_url} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono" placeholder="https://storage.aerofix.com/docs/amm.pdf" /></div>
                <div className="pt-4 flex gap-2 border-t border-slate-800"><button type="button" onClick={() => setActiveModal(null)} className="w-1/2 bg-slate-800 py-2.5 text-slate-300 font-bold rounded-xl cursor-pointer">Abort</button><button type="submit" className="w-1/2 bg-sky-600 py-2.5 text-white font-bold rounded-xl shadow-md cursor-pointer">Commit Index</button></div>
              </form>
            )}

            {/* FORM MODAL 2: SUPERSEDE OLD CODES AND COMMIT NEW ACTIVE POINTER */}
            {activeModal === 'revision' && (
              <form onSubmit={handlePushRevision} className="p-5 space-y-4 overflow-y-auto text-xs">
                <div className="p-3 bg-amber-500/5 text-amber-400 border border-amber-500/10 rounded-xl flex gap-2 leading-relaxed"><ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" /><p>Executing this form will switch previous items to <span className="font-bold underline">superseded</span> and commit the new active pointer entry.</p></div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">New Rev Code *</label><input type="text" name="revision_number" required value={formData.revision_number} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono" placeholder="Rev 24" /></div>
                  <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">Effective Lock Date *</label><input type="text" name="revision_date" required value={formData.revision_date} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono" placeholder="21-May-2026" /></div>
                </div>
                <div><label className="block font-bold text-slate-400 mb-1 uppercase tracking-wider">New Source File URL Path *</label><input type="text" name="file_url" required value={formData.file_url} onChange={handleInputChange} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-white font-mono" placeholder="https://storage.aerofix.com/docs/new_amm.pdf" /></div>
                <div className="pt-4 flex gap-2 border-t border-slate-800"><button type="button" onClick={() => setActiveModal('history')} className="w-1/2 bg-slate-800 py-2.5 text-slate-300 font-bold rounded-xl cursor-pointer">Back</button><button type="submit" className="w-1/2 bg-amber-600 py-2.5 text-white font-bold rounded-xl shadow-md cursor-pointer">Supersede & Commit</button></div>
              </form>
            )}

            {/* AUDIT MODAL 3: AUDIT TRAIL TIMELINE LOG ARCHIVES LIST */}
            {activeModal === 'history' && historyTarget && (
              <div className="p-5 flex flex-col overflow-hidden text-xs space-y-4">
                <div className="space-y-0.5 shrink-0"><h4 className="font-black text-white text-base font-sans leading-tight">{historyTarget.title}</h4><p className="text-slate-500 font-mono tracking-wide text-[11px] uppercase">Applicability: {historyTarget.aircraft_types}</p></div>
                <div className="flex-1 overflow-y-auto space-y-2 border-y border-slate-800/80 py-3 my-1 pr-1 max-h-[260px]">
                  {historyTarget.revisions?.map(rev => (
                    <div key={rev.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex justify-between items-center gap-3">
                      <div className="space-y-0.5"><p className="font-bold font-mono text-slate-200">{rev.revision_number}</p><p className="text-[10px] text-slate-500 font-medium">Released: {rev.revision_date}</p></div>
                      <span className={`px-2 py-0.5 border text-[9px] font-black uppercase rounded tracking-wider ${rev.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-900 text-slate-600 border-slate-850'}`}>{rev.status}</span>
                    </div>
                  )) || <p className="text-center italic py-4 text-slate-500">No revisions found.</p>}
                </div>
                <button onClick={() => { setFormData({ ...formData, revision_number: `Rev ${parseInt(historyTarget.revisions?.[0]?.revision_number?.replace(/\D/g, '') || 1) + 1}`, revision_date: '', file_url: '' }); setActiveModal('revision'); }} className="w-full bg-slate-800 border border-slate-700 text-white hover:text-sky-400 font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shrink-0 shadow-md"><Plus className="h-4 w-4" /> Push Revision Level</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}