import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { Clock, User, ClipboardList, LogOut, Loader2 } from "lucide-react";
import { useState } from "react";
import api from "@/api/axiosInstance"; 
import { toast } from "sonner";

export default function EmployeeLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const navItems = [
    { label: "Absen", path: "/employee/absen", icon: <Clock size={20} /> },
    { label: "Riwayat", path: "/employee/summary", icon: <ClipboardList size={20} /> },
    { label: "Profil", path: "/employee/profile", icon: <User size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await api.post("/auth/logout");
      toast.success("Berhasil keluar");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Gagal logout secara server, membersihkan sesi lokal...");
    } finally {
      localStorage.clear();
      navigate("/", { replace: true });
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 lg:pb-0 lg:pl-64">
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r h-screen fixed left-0 top-0 p-6">
        <h1 className="text-xl font-bold text-red-600 mb-10">WFH App</h1>
        
        <nav className="space-y-2 flex-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 p-3 rounded-lg transition ${
                location.pathname === item.path 
                  ? "bg-red-50 text-red-600 shadow-sm" 
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <button 
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-3 p-3 text-red-500 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
        >
          {isLoggingOut ? <Loader2 className="animate-spin" size={20} /> : <LogOut size={20} />}
          <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
        </button>
      </aside>

      <main className="p-4 lg:p-8">
        <Outlet />
      </main>

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around p-3 shadow-lg z-50">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center gap-1 min-w-[60px] ${
              location.pathname === item.path ? "text-red-600" : "text-gray-400"
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-medium">{item.label}</span>
          </Link>
        ))}
        <button 
          onClick={handleLogout}
          className="flex flex-col items-center gap-1 text-gray-400 min-w-[60px]"
        >
          <LogOut size={20} />
          <span className="text-[10px] font-medium">Keluar</span>
        </button>
      </nav>
    </div>
  );
}