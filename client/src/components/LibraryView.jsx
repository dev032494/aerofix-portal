import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { 
  Search, BookOpen, Download, RefreshCw, FileText, Plus, X, 
  Eye, EyeOff, Maximize2, Minimize2, ChevronDown, ChevronRight, ListCollapse, Trash2 
} from 'lucide-react';

export default function LibraryView() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Interactive PDF Outline Viewport States
  const [activeDoc, setActiveDoc] = useState(null);
  const [activeViewingUrl, setActiveViewingUrl] = useState('');
  const [isFullscreenViewer, setIsFullscreenViewer] = useState(false);
  const [showTocSidebar, setShowTocSidebar] = useState(false); // Default false on mobile/tablet to save screen real estate

  // Upload Modal State
  const [activeModal, setActiveModal] = useState(null); // 'upload'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState({ title: '' });
  const [selectedFile, setSelectedFile] = useState(null);

  const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

  // --- ROLE AUTHORIZATION PATTERN ---
  const userRole = useMemo(() => {
    try {
      const token = localStorage.getItem('aerofix_token');
      if (!token) return null;
      
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const parsed = JSON.parse(jsonPayload);
      return parsed.role?.toLowerCase() || parsed.role_id?.toLowerCase() || null;
    } catch (e) {
      console.error('Failed parsing security credential telemetry:', e);
      return null;
    }
  }, []);

  const canUpload = useMemo(() => {
    return ['developer', 'admin', 'instructor'].includes(userRole);
  }, [userRole]);
  // ----------------------------------

  const getDocUrl = (path) => {
    if (!path) return '';
    const base = getApiUrl().replace('/api/v1', '');
    return `${base}/${path.replace(/\\/g, '/')}`;
  };

  const fetchCatalog = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('aerofix_token');
      const res = await axios.get(`${getApiUrl()}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data?.data?.documents || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to populate document inventory.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      fetchCatalog();
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem('aerofix_token');
      const res = await axios.get(`${getApiUrl()}/documents/search`, {
        params: { q: query },
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(res.data?.data?.documents || []);
    } catch (err) {
      console.error('Search pipeline failed:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      handleSearch(searchTerm);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, handleSearch]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!canUpload) return alert('Access Denied: You do not possess clearance parameters to commit global uploads.');
    if (!selectedFile) return alert('Please select a valid PDF file to upload.');

    const payload = new FormData();
    payload.append('title', formData.title);
    payload.append('file', selectedFile);

    setLoading(true);
    setUploadProgress(10);
    try {
      const token = localStorage.getItem('aerofix_token');
      await axios.post(`${getApiUrl()}/documents`, payload, {
        headers: { 
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}` 
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      setActiveModal(null);
      setFormData({ title: '' });
      setSelectedFile(null);
      setUploadProgress(0);
      fetchCatalog();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Processing failed.');
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async (id, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this manual and its search indexing cache?')) return;
    try {
      const token = localStorage.getItem('aerofix_token');
      await axios.delete(`${getApiUrl()}/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (activeDoc?.id === id) {
        setActiveDoc(null);
        setActiveViewingUrl('');
      }
      fetchCatalog();
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleJumpToPage = (pageNumber) => {
    if (!pageNumber || !activeDoc) return;
    const baseFileUrl = getDocUrl(activeDoc.file_path);
    setActiveViewingUrl(`${baseFileUrl}#page=${pageNumber}`);
  };

  // Reusable recursive component to render nested Table of Contents Nodes
  const TocTree = ({ items }) => {
    return (
      <ul className="pl-3 space-y-1 border-l border-slate-800 ml-1.5 mt-1">
        {items.map((item, index) => {
          const [isOpen, setIsOpen] = useState(false);
          const hasChildren = item.items && item.items.length > 0;

          return (
            <li key={index} className="text-xs">
              <div className="flex items-center gap-1 group py-0.5 rounded hover:bg-slate-900 px-1.5">
                {hasChildren ? (
                  <button onClick={() => setIsOpen(!isOpen)} className="text-slate-500 hover:text-slate-300 p-0.5">
                    {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                  </button>
                ) : (
                  <span className="w-4.5" />
                )}
                
                <span 
                  onClick={() => item.pageNumber && handleJumpToPage(item.pageNumber)}
                  className={`flex-1 truncate select-none py-0.5 ${item.pageNumber ? 'text-slate-300 hover:text-sky-400 cursor-pointer font-medium' : 'text-slate-500 cursor-default'}`}
                  title={`${item.title} ${item.pageNumber ? `(Page ${item.pageNumber})` : ''}`}
                >
                  {item.title}
                </span>

                {item.pageNumber && (
                  <span className="text-[10px] font-mono text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded shrink-0">
                    p. {item.pageNumber}
                  </span>
                )}
              </div>
              {hasChildren && isOpen && <TocTree items={item.items} />}
            </li>
          );
        })}
      </ul>
    );
  };

  if (error) return (
    <div className="text-rose-400 bg-rose-950/30 p-5 border border-rose-800 rounded-xl max-w-2xl mx-auto mt-10 shadow-lg">
      <h3 className="font-bold text-lg flex items-center gap-2 mb-2">🚨 Library Telemetry Glitch</h3>
      <p className="text-sm text-rose-300/80">{error}</p>
      <button onClick={fetchCatalog} className="mt-4 text-xs bg-slate-800 px-3 py-2 rounded-xl border border-slate-700 text-slate-200 cursor-pointer">Retry Workspace Stream</button>
    </div>
  );

  return (
    <div className="w-full h-[calc(100vh-6rem)] md:h-[calc(100vh-4rem)] flex flex-col gap-4 animate-fadeIn relative overflow-hidden text-slate-200 p-2 sm:p-4">
      
      {/* MASTER RESPONSIVE WORKING CONTENT FLEX CONTAINER */}
      <div className="flex-1 w-full flex flex-col lg:flex-row gap-4 min-h-0 overflow-hidden relative">
        
        {/* 📋 CENTRAL DATA CATALOGUE LOG DISPLAY PANEL */}
        {/* Responsive Behavior: Hidden completely on screens smaller than lg if a document is currently active */}
        <section className={`flex-1 flex flex-col min-w-0 h-full overflow-hidden transition-all duration-300 
          ${activeViewingUrl ? 'hidden lg:flex lg:max-w-[35%] xl:max-w-[30%]' : 'flex'}`}>
          
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl flex flex-col gap-3 shrink-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-black text-xs uppercase tracking-widest text-sky-400 flex items-center gap-1.5 truncate">
                <BookOpen className="h-4 w-4 shrink-0" /> Systems Catalog
              </span>
              
              {canUpload && (
                <button 
                  onClick={() => setActiveModal('upload')} 
                  className="bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1 cursor-pointer transition-colors shadow shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" /> <span className="hidden xs:inline">Upload PDF</span>
                </button>
              )}
            </div>
            
            <div className="relative flex-1 text-sm">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input 
                type="text" 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-white text-xs focus:outline-none focus:border-sky-500" 
                placeholder="Search PDF indices, titles, TOC..." 
              />
            </div>
          </div>

          <div className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-1 pt-3 pb-1 shrink-0 flex justify-between">
            <span>Results: {documents.length} Manuals</span>
            {loading && <RefreshCw className="h-3 w-3 animate-spin text-sky-400" />}
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1 pb-4 custom-scrollbar">
            {documents.length === 0 && !loading ? (
              <div className="text-center py-20 bg-slate-900/40 border border-slate-850 rounded-2xl text-slate-500 italic text-xs">
                No technical documents found matching search terms.
              </div>
            ) : documents.map(doc => {
              const docFileUrl = getDocUrl(doc.file_path);
              const isCurrentlyViewing = activeViewingUrl.startsWith(docFileUrl) && activeDoc?.id === doc.id;

              return (
                <div 
                  key={doc.id} 
                  onClick={() => {
                    if (isCurrentlyViewing) {
                      setActiveViewingUrl('');
                      setActiveDoc(null);
                    } else {
                      setActiveDoc(doc);
                      setActiveViewingUrl(docFileUrl);
                    }
                  }}
                  className={`p-4 rounded-xl flex justify-between items-center gap-3 transition-all border group cursor-pointer ${isCurrentlyViewing ? 'bg-sky-950/20 border-sky-500/40 shadow-md shadow-sky-500/5' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}
                >
                  <div className="min-w-0 space-y-1 flex-1">
                    <h3 className={`font-black text-xs sm:text-sm tracking-tight truncate transition-colors ${isCurrentlyViewing ? 'text-sky-400' : 'text-white group-hover:text-sky-400'}`}>
                      {doc.title}
                    </h3>
                    <div className="flex gap-2 items-center text-[10px]">
                      <span className="font-mono text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850 truncate">
                        {doc.table_of_contents?.length || 0} Outlines
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 bg-slate-950 border border-slate-850 p-1 rounded-xl shrink-0 shadow-inner" onClick={(e) => e.stopPropagation()}>
                    <button 
                      onClick={() => {
                        if (isCurrentlyViewing) {
                          setActiveViewingUrl('');
                          setActiveDoc(null);
                        } else {
                          setActiveDoc(doc);
                          setActiveViewingUrl(docFileUrl);
                        }
                      }}
                      title={isCurrentlyViewing ? "Close Digital Viewer" : "Open PDF Outlines Viewer"}
                      className={`p-1.5 sm:p-2 rounded-lg cursor-pointer transition-all ${isCurrentlyViewing ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'}`}
                    >
                      {isCurrentlyViewing ? <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
                    </button>
                    <a href={docFileUrl} target="_blank" rel="noreferrer" title="Open PDF original file in new tab" className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-lg transition-colors">
                      <FileText className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </a>
                    
                    {canUpload && (
                      <button 
                        onClick={(e) => handleDeleteDocument(doc.id, e)} 
                        title="De-index Document" 
                        className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* =========================================================================
            ⚡ COLLAPSIBLE DUAL-PANE PDF + OUTLINE DIGITAL WORKSPACE VIEWPORT
            ========================================================================= */}
        {/* Responsive Behavior: Spans 100% viewport width when active on mobile/tablet. Adjusts dynamic split weights on desktop. */}
        {activeViewingUrl && activeDoc && (
          <section className={`h-full bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-2xl transition-all duration-300 min-w-0 w-full 
            ${isFullscreenViewer ? 'lg:flex-1' : 'lg:flex-[0_0_65%] xl:flex-[0_0_70%]'}`}>
            
            {/* Control Bar Header */}
            <div className="p-3 bg-slate-950 border-b border-slate-800 flex justify-between items-center px-3 sm:px-4 shrink-0 h-14">
              <div className="flex items-center gap-2 truncate max-w-[50%] sm:max-w-[70%]">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                <span className="font-black text-xs md:text-sm text-slate-200 font-sans truncate tracking-wide uppercase" title={activeDoc.title}>
                  {activeDoc.title}
                </span>
              </div>
              
              <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-900 p-1 border border-slate-800 rounded-xl shrink-0">
                {/* Responsive TOC Toggle Button: Works globally, highly visual */}
                <button 
                  onClick={() => setShowTocSidebar(!showTocSidebar)}
                  title="Toggle Table of Contents"
                  className={`p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors ${showTocSidebar ? 'bg-slate-850 text-sky-400' : ''}`}
                >
                  <ListCollapse className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setIsFullscreenViewer(!isFullscreenViewer)}
                  title={isFullscreenViewer ? "Split Workspace Interface Layout" : "Maximize Document Viewport Pane"}
                  className="hidden lg:block p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer transition-colors"
                >
                  {isFullscreenViewer ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                </button>
                <button 
                  onClick={() => { setActiveViewingUrl(''); setActiveDoc(null); setIsFullscreenViewer(false); }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 cursor-pointer transition-colors"
                  title="Close Reader Console"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            {/* Split Screen Workspace Area */}
            {/* Responsive Behavior: On mobile/tablet, the TOC sidebar overlays or collapses cleanly so the viewport doesn't shrink. */}
            <div className="flex-1 bg-slate-950 flex h-full w-full overflow-hidden relative">
              
              {/* Interactive TOC Sidebar */}
              {showTocSidebar && (
                <aside className="absolute inset-y-0 left-0 z-30 w-72 md:relative border-r border-slate-800 bg-slate-950/95 md:bg-slate-950/60 shrink-0 flex flex-col h-full overflow-hidden shadow-2xl md:shadow-none animate-slideIn">
                  <div className="p-3 bg-slate-900/50 border-b border-slate-800 shrink-0 flex justify-between items-center">
                    <span className="text-[10px] font-black tracking-widest text-slate-500 uppercase">Document Index Outline</span>
                    {/* Close button visible on smaller screens for mobile drawer UX */}
                    <button onClick={() => setShowTocSidebar(false)} className="md:hidden text-slate-500 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
                    {activeDoc.table_of_contents && activeDoc.table_of_contents.length > 0 ? (
                      <TocTree items={activeDoc.table_of_contents} />
                    ) : (
                      <div className="text-center py-10 text-slate-500 italic text-[11px] px-4">
                        No structural Table of Contents outline detected in this PDF.
                      </div>
                    )}
                  </div>
                </aside>
              )}

              {/* Secure Web PDF Port */}
              <div className="flex-1 p-1 md:p-2.5 relative h-full w-full">
                <iframe 
                  src={activeViewingUrl}
                  className="w-full h-full rounded-xl bg-[#1e2538] border border-slate-850 shadow-inner"
                  title="AeroFix Integrated Document Workspace Console"
                  allow="autoplay; fullscreen"
                  loading="lazy"
                />
              </div>
            </div>
          </section>
        )}

      </div>

      {/* =========================================================================
          ⚡ RESPONSIVE INTERACTIVE FLOATING UPLOAD MODAL OVERLAY
          ========================================================================= */}
      {activeModal === 'upload' && canUpload && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-850 shrink-0">
              <h3 className="font-bold text-white text-xs sm:text-sm uppercase tracking-wider">Index & Upload New PDF Manual</h3>
              <button onClick={() => { setActiveModal(null); setFormData({ title: '' }); setSelectedFile(null); }} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Document Title *</label>
                <input 
                  type="text" 
                  name="title" 
                  required 
                  value={formData.title} 
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-500 font-sans text-sm" 
                  placeholder="e.g., Cessna Maintenance Outline" 
                />
              </div>
              
              <div>
                <label className="block font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Binary PDF Document File *</label>
                <div className="border-2 border-dashed border-slate-800 rounded-xl p-4 text-center hover:border-slate-700 transition-colors bg-slate-950 relative">
                  <input 
                    type="file" 
                    accept="application/pdf"
                    required
                    onChange={(e) => setSelectedFile(e.target.files[0])}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <FileText className="h-8 w-8 text-sky-500 mx-auto" />
                    <p className="text-[11px] text-slate-300 font-medium break-all px-2">
                      {selectedFile ? selectedFile.name : 'Click or Drag files here to choose'}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono">PDF files only</p>
                  </div>
                </div>
              </div>

              {/* Progress Tracking Indicator */}
              {uploadProgress > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between font-mono text-[10px] text-slate-400 font-bold">
                    <span>{uploadProgress === 100 ? 'Indexing PDF Outline...' : 'Uploading Asset...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-sky-500 transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4 flex gap-2 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => { setActiveModal(null); setFormData({ title: '' }); setSelectedFile(null); }} 
                  className="w-1/2 bg-slate-800 py-2.5 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-1/2 bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 disabled:text-slate-500 py-2.5 text-white font-bold rounded-xl shadow-md cursor-pointer transition-colors"
                >
                  Upload & Index
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}