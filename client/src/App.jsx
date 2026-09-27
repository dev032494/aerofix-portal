import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, NavLink, Outlet } from "react-router-dom";
import Swal from "sweetalert2";
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
  ShieldAlert,
  Activity,
  GraduationCap,
  Wrench,
  CheckCircle2,
  Calendar,
  FileText
} from "lucide-react";

// Import your views
import AircraftDashboard from "./components/AircraftManager";
import WorkOrderList from "./components/WorkOrderListView";
import WorkOrderDashboard from "./components/WorkOrderDashboard";
import TeamRegistry from "./components/TeamRegistry";
import LoginView from "./components/LoginView";
import DeveloperLoginView from "./components/DeveloperLoginView";
import ProfileView from "./components/ProfileView";
import LibraryView from "./components/LibraryView";
import UserActivationDashboard from "./components/UserActivationDashboard";
import ActivityLogDashboard from "./components/ActivityLogDashboard";
import InstructorView from "./components/InstructorView";
import StudentTaskDashboard from "./components/StudentTaskDashboard";
import MaintenanceSchedulePlanning from "./components/MaintenanceSchedulePlanning";
import Logbook from "./components/Logbook";

import {workOrderService, logbookService} from "./services/api";

// --- PROTECTED ROUTE INTERCEPTOR ---
function ProtectedRoute({ children, currentUser }) {
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

// --- MAIN WORKSPACE SYSTEM ---
function MainWorkspace({ currentUser, setCurrentUser }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const isStudent = currentUser.role === "student";
  const isDeveloper = currentUser.role === "developer";

  const handleLogoutAction = async () => {
    const result = await Swal.fire({
      title: 'End Shift Session?',
      text: "Are you sure you want to log out of Aeronexus?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#0284c7',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Yes, log out',
      background: '#ffffff',
      color: '#0f172a'
    });

    if (result.isConfirmed) {
      localStorage.removeItem("aerofix_token");
      localStorage.removeItem("aerofix_user");
      setCurrentUser(null);
      setIsMobileMenuOpen(false);
      navigate("/login");
    }
  };

  // NavLink styling helper
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold w-full text-left transition-all cursor-pointer ${isActive
      ? "bg-sky-600 text-white shadow-md shadow-sky-600/10"
      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
    }`;

  const developerNavLinkClass = ({ isActive }, color) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold w-full text-left transition-all cursor-pointer border ${isActive
      ? `bg-${color}-600 text-white shadow-md shadow-${color}-600/20 border-${color}-500/20`
      : `text-${color}-700 hover:bg-${color}-50 hover:text-${color}-800 border-${color}-200`
    }`;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50 text-slate-900 font-sans relative">
      {/* MOBILE ACTION TOP BAR HEADER */}
      <header className="lg:hidden absolute top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 z-40 shadow-xs">
        <div className="flex items-center gap-2.5">
          <Hammer className="h-5 w-5 text-sky-600" />
          <span className="font-black text-lg tracking-wider text-slate-900">AERONEXUS</span>
        </div>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl border border-slate-200 cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>

      {/* SIDEBAR NAVIGATION PANEL */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 transform transition-transform duration-300 ease-in-out lg:static lg:transform-none shadow-sm ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div>
          <div className="p-6 flex items-center justify-between border-b border-slate-200 h-16 lg:h-auto">
            <div className="flex items-center gap-3">
              <Hammer className="h-6 w-6 text-sky-600" />
              <span className="font-black text-xl tracking-wider text-slate-900">AERONEXUS</span>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-700 p-1 cursor-pointer">
              <X className="h-5 w-5" />
            </button>
          </div>

          <nav className="p-4 space-y-1.5 mt-4 lg:mt-2 overflow-y-auto max-h-[calc(100vh-14rem)]">
            {!isStudent && (
              <>
                <NavLink to="work-orders" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>
                  <Wrench className="h-5 w-5 shrink-0" /> Work Orders
                </NavLink>

                <NavLink to="work-order-list" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>
                  <ClipboardList className="h-5 w-5 shrink-0" /> Work Order List
                </NavLink>

                <NavLink to="maintenance-planning" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>
                  <Calendar className="h-5 w-5 shrink-0" /> Maintenance Planning
                </NavLink>

                <NavLink to="logbook" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>
                  <FileText className="h-5 w-5 shrink-0" /> Flight Logbook
                </NavLink>

                <NavLink to="team" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>
                  <Users className="h-5 w-5 shrink-0" /> Team Registry
                </NavLink>

                <NavLink to="instructor" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>
                  <GraduationCap className="h-5 w-5 shrink-0" /> Instructors
                </NavLink>
              </>
            )}

            {isStudent && (
              <NavLink to="tasks" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>
                <CheckCircle2 className="h-5 w-5 shrink-0" /> My Tasks
              </NavLink>
            )}
            <NavLink to="library" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>
              <BookOpen className="h-5 w-5 shrink-0" /> Tech Library
            </NavLink>

            <NavLink to="profile" onClick={() => setIsMobileMenuOpen(false)} className={navLinkClass}>
              <User className="h-5 w-5 shrink-0" /> My Profile Account
            </NavLink>

            {isDeveloper && (
              <>
                <NavLink to="activation-logs" onClick={() => setIsMobileMenuOpen(false)} className={(props) => developerNavLinkClass(props, 'amber')}>
                  <ShieldAlert className="h-5 w-5 shrink-0" /> Activation Logs
                </NavLink>

                <NavLink to="activity-logs" onClick={() => setIsMobileMenuOpen(false)} className={(props) => developerNavLinkClass(props, 'sky')}>
                  <Activity className="h-5 w-5 shrink-0" /> System Activity Logs
                </NavLink>
              </>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 flex flex-col gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5 px-2">
            <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-600 border border-sky-200 flex items-center justify-center shrink-0">
              <User className="h-4 w-4" />
            </div>
            <div className="truncate text-xs">
              <p className="font-bold text-slate-800 truncate">{currentUser.first_name} {currentUser.last_name}</p>
              <p className="text-[10px] text-slate-500 font-mono capitalize tracking-wide truncate">{currentUser.role} mode</p>
            </div>
          </div>
          <button
            onClick={handleLogoutAction}
            className="w-full bg-white hover:bg-rose-50 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-slate-600 text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-98"
          >
            <LogOut className="h-3.5 w-3.5" /> End Shift Session
          </button>
        </div>
      </aside>

      {isMobileMenuOpen && (
        <div onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-40 lg:hidden" />
      )}

      {/* WORKSPACE VIEWPORT */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 lg:p-4 pt-20 lg:pt-4 bg-slate-50 flex flex-col min-w-0">
        <div className="w-full h-full max-w-full px-0 mx-0 flex flex-col flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// --- APP ENTRY ROUTER CONFIGURATION ---
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [appReady, setAppReady] = useState(false);

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

  if (!appReady) return null;

  const isStudent = currentUser?.role === "student";
  const isDeveloper = currentUser?.role === "developer";

  return (
    <Router>
      <Routes>
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

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute currentUser={currentUser}>
              <MainWorkspace currentUser={currentUser} setCurrentUser={setCurrentUser} />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="library" replace />} />

          <Route path="aircraft" element={!isStudent ? <AircraftDashboard /> : <Navigate to="library" />} />
          <Route path="work-orders" element={!isStudent ? <WorkOrderDashboard /> : <Navigate to="library" />} />
          <Route path="work-order-list" element={!isStudent ? <WorkOrderList /> : <Navigate to="library" />} />
          <Route path="maintenance-planning" element={!isStudent ? <MaintenanceSchedulePlanning /> : <Navigate to="library" />} />
          <Route path="team" element={!isStudent ? <TeamRegistry /> : <Navigate to="library" />} />
          <Route path="instructor" element={!isStudent ? <InstructorView /> : <Navigate to="library" />} />

          <Route path="tasks" element={isStudent ? <StudentTaskDashboard /> : <Navigate to="library" />} />

          <Route path="logbook" element={<Logbook />} />
          <Route path="library" element={<LibraryView />} />
          <Route path="profile" element={<ProfileView />} />

          <Route path="activation-logs" element={isDeveloper ? <UserActivationDashboard /> : <Navigate to="library" />} />
          <Route path="activity-logs" element={isDeveloper ? <ActivityLogDashboard /> : <Navigate to="library" />} />
        </Route>

        <Route
          path="*"
          element={<Navigate to={currentUser ? "/dashboard" : "/login"} replace />}
        />
      </Routes>
    </Router>
  );
}