import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import {
  Plane,
  ClipboardList,
  Users,
  Hammer,
  Menu,
  X,
  LogOut,
  User,
  BookOpen,
  ShieldAlert, // Added explicit auditing icon for the dev dashboard
} from "lucide-react";

// Import your views
import AircraftDashboard from "./components/AircraftDashboard";
import WorkOrderView from "./components/WorkOrderView";
import TeamRegistry from "./components/TeamRegistry";
import LoginView from "./components/LoginView"; 
import DeveloperLoginView from "./components/DeveloperLoginView"; // The new dev login
import ProfileView from "./components/ProfileView"; 
import LibraryView from "./components/LibraryView"; 
import UserActivationDashboard from "./components/UserActivationDashboard"; // ⚡ ADDED: Admin verification module

// --- PROTECTED ROUTE INTERCEPTOR ---
// Guard wrapper that redirects unauthenticated users to the standard login page
function ProtectedRoute({ children, currentUser }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// --- MAIN WORKSPACE SYSTEM ---
// Encapsulates the logged-in user viewport
function MainWorkspace({ currentUser, setCurrentUser }) {
  const [activeTab, setActiveTab] = useState("library");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isStudent = currentUser.role === "student";
  const isDeveloper = currentUser.role === "developer"; // ⚡ Added strict operational verification rule

  useEffect(() => {
    if (isStudent && !["library", "profile"].includes(activeTab)) {
      setActiveTab("library");
    }
  }, [isStudent, activeTab]);

  const handleLogoutAction = () => {
    localStorage.removeItem("aerofix_token");
    localStorage.removeItem("aerofix_user");
    setCurrentUser(null);
    setIsMobileMenuOpen(false);
    navigate("/login");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans relative">
      {/* MOBILE ACTION TOP BAR HEADER */}
      <header className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 z-40">
        <div className="flex items-center gap-2.5">
          <Hammer className="h-5 w-5 text-sky-500" />
          <span className="font-black text-lg tracking-wider text-white">AEROFIX</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-xl border border-slate-700/40 cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out lg:static lg:transform-none ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div>
          <div className="p-6 flex items-center justify-between border-b border-slate-800 h-16 lg:h-auto">
            <div className="flex items-center gap-3">
              <Hammer className="h-6 w-6 text-sky-500" />
              <span className="font-black text-xl tracking-wider text-white">AEROFIX</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-500 hover:text-slate-300 p-1 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1.5 mt-4 lg:mt-2">
            {!isStudent && (
              <>
                <button
                  onClick={() => { setActiveTab("aircraft"); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold w-full text-left transition-all cursor-pointer ${activeTab === "aircraft" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/10" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
                >
                  <Plane className="h-5 w-5 shrink-0" /> Aircraft Fleet
                </button>
                <button
                  onClick={() => { setActiveTab("workorders"); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold w-full text-left transition-all cursor-pointer ${activeTab === "workorders" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/10" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
                >
                  <ClipboardList className="h-5 w-5 shrink-0" /> Work Orders
                </button>
                <button
                  onClick={() => { setActiveTab("team"); setIsMobileMenuOpen(false); }}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold w-full text-left transition-all cursor-pointer ${activeTab === "team" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/10" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
                >
                  <Users className="h-5 w-5 shrink-0" /> Team Registry
                </button>
              </>
            )}

            <button
              onClick={() => { setActiveTab("library"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold w-full text-left transition-all cursor-pointer ${activeTab === "library" ? "bg-sky-600 text-white shadow-lg shadow-sky-600/10" : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"}`}
            >
              <BookOpen className="h-5 w-5 shrink-0" /> Tech Library
            </button>

            <button
              onClick={() => { setActiveTab("profile"); setIsMobileMenuOpen(false); }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold w-full text-left transition-all cursor-pointer ${activeTab === "profile" ? "bg-sky-600 text-white shadow-lg" : "text-slate-400 hover:bg-slate-800"}`}
            >
              <User className="h-5 w-5 shrink-0" /> My Profile Account
            </button>

            {/* ⚡ SECURE MODULE LINK: Accessible strictly by the Developer role configuration */}
            {isDeveloper && (
              <button
                onClick={() => { setActiveTab("activationLogs"); setIsMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold w-full text-left transition-all cursor-pointer border border-amber-500/10 ${activeTab === "activationLogs" ? "bg-amber-600 text-white shadow-lg shadow-amber-600/20" : "text-amber-400/80 hover:bg-amber-950/20 hover:text-amber-300"}`}
              >
                <ShieldAlert className="h-5 w-5 shrink-0" /> Activation Logs
              </button>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-800 flex flex-col gap-3 bg-slate-900/40">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/10 flex items-center justify-center shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="truncate text-xs">
              <p className="font-bold text-slate-200 truncate">{currentUser.first_name} {currentUser.last_name}</p>
              <p className="text-[10px] text-slate-500 font-mono capitalize tracking-wide truncate">{currentUser.role} mode</p>
            </div>
          </div>
          <button
            onClick={handleLogoutAction}
            className="w-full bg-slate-950 hover:bg-rose-950/20 hover:text-rose-400 border border-slate-800 hover:border-rose-900/30 text-slate-400 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm active:scale-98"
          >
            <LogOut className="h-3.5 w-3.5" /> End Shift Session
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden" />
      )}

      {/* WORKSPACE VIEWPORT */}
      <main className="flex-1 overflow-hidden p-3 sm:p-4 lg:p-4 pt-20 lg:pt-4 bg-slate-950 flex flex-col min-w-0">
        <div className="w-full h-full max-w-full px-0 mx-0 flex flex-col flex-1">
          {activeTab === "aircraft" && !isStudent && <AircraftDashboard />}
          {activeTab === "workorders" && !isStudent && <WorkOrderView />}
          {activeTab === "library" && <LibraryView />} 
          {activeTab === "team" && !isStudent && <TeamRegistry />}
          {activeTab === "profile" && <ProfileView />}
          {/* ⚡ SECURE MODULE CONTAINER: Protects view rendering against standard manual state modifications */}
          {activeTab === "activationLogs" && isDeveloper && <UserActivationDashboard />}
        </div>
      </main>
    </div>
  );
}

// --- APP ENTRY ROUTER CONFIGURATION ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appReady, setAppReady] = useState(false);

  // Evaluate sessions on boot
  useEffect(() => {
    const cachedUser = localStorage.getItem("aerofix_user");
    const cachedToken = localStorage.getItem("aerofix_token");
    if (cachedUser && cachedToken) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (err) {
        localStorage.removeItem("aerofix_user");
        localStorage.removeItem("aerofix_token");
      }
    }
    setAppReady(true);
  }, []);

  if (!appReady) return null; // Prevent UI layout shift on load

  return (
    <Router>
      <Routes>
        {/* PUBLIC ROUTE: Core Personnel/Student Gate */}
        <Route 
          path="/login" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />
            )
          } 
        />

        {/* SECURE ROUTE: Hidden Developer and Administrative Entry Gate */}
        <Route 
          path="/developer-access" 
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <DeveloperLoginView onLoginSuccess={(user) => setCurrentUser(user)} />
            )
          } 
        />

        {/* PROTECTED ROUTE: System dashboard workspace */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute currentUser={currentUser}>
              <MainWorkspace currentUser={currentUser} setCurrentUser={setCurrentUser} />
            </ProtectedRoute>
          } 
        />

        {/* Fallback Catch-all: Send requests directly to standard login or system workspace */}
        <Route 
          path="*" 
          element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />} 
        />
      </Routes>
    </Router>
  );
}