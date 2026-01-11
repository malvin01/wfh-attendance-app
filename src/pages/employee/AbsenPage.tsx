import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import { LogIn, LogOut, CheckCircle2, Loader2, MapPin, CalendarDays } from "lucide-react";
import { toast } from "sonner";

export default function AbsenPage() {
  const queryClient = useQueryClient();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [notes, setNotes] = useState("");
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const { data: res, isLoading: isLoadingStatus } = useQuery({
    queryKey: ["attendance-today"],
    queryFn: async () => {
      const response = await api.get("/attendances/me/today");
      return response.data;
    },
  });

  const status = res?.data;

  const getLocation = (): Promise<{ lat: number; lng: number }> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        toast.error("Geolokasi tidak didukung oleh browser Anda");
        reject();
      }
      setIsGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsGettingLocation(false);
          resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        (err) => {
          setIsGettingLocation(false);
          toast.error("Gagal mengambil lokasi. Pastikan izin lokasi aktif.");
          reject(err);
        },
        { enableHighAccuracy: true }
      );
    });
  };

  const clockInMutation = useMutation({
    mutationFn: async () => {
      const loc = await getLocation();
      return api.post("/attendances/clock-in", {
        latitude: loc.lat,
        longitude: loc.lng,
        notes: notes || "Working from home",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      setNotes("");
      toast.success("Berhasil Clock In");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal Clock In"),
  });

  const clockOutMutation = useMutation({
    mutationFn: async () => {
      const loc = await getLocation();
      return api.post("/attendances/clock-out", {
        latitude: loc.lat,
        longitude: loc.lng,
        notes: notes || "Finished work",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance-today"] });
      setNotes("");
      toast.success("Berhasil Clock Out");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Gagal Clock Out"),
  });

  const formatTime = (isoString: string | undefined) => {
    if (!isoString) return "--:--";
    return new Date(isoString).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  };

  if (isLoadingStatus) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="animate-spin text-red-600" size={40} />
        <p className="text-slate-500 font-medium animate-pulse">Menghubungkan ke server...</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-6 md:py-10 space-y-8">      
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold mb-2">
          <CalendarDays size={16} />
          {currentTime.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long' })}
        </div>
        <h1 className="text-6xl md:text-7xl font-black text-slate-800 tracking-tighter tabular-nums drop-shadow-sm">
          {currentTime.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
        </h1>
        <div className="flex items-center justify-center gap-1.5 text-slate-400">
          <MapPin size={14} className="text-red-500" />
          <span className="text-xs font-medium uppercase tracking-widest">Work From Home Area</span>
        </div>
      </div>

      {!status?.hasClockOut && (
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm transition-all focus-within:border-red-200 focus-within:ring-4 focus-within:ring-red-50">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Catatan Aktivitas</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder={!status?.hasClockIn ? "Apa rencana kerja hari ini?" : "Apa kendala atau progress hari ini?"}
            className="w-full p-2 bg-transparent text-slate-700 text-sm md:text-base outline-none resize-none h-20 md:h-24"
          />
        </div>
      )}

      <div className="flex justify-center py-4">
        {!status?.hasClockIn ? (
          <button
            onClick={() => clockInMutation.mutate()}
            disabled={clockInMutation.isPending || isGettingLocation}
            className="group relative w-64 h-64 md:w-72 md:h-72 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-[0_20px_50px_rgba(220,38,38,0.3)] flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-70 disabled:grayscale"
          >
            <span className="absolute inset-0 rounded-full bg-red-600 animate-ping opacity-20 group-hover:hidden"></span>
            
            {clockInMutation.isPending || isGettingLocation ? (
              <Loader2 className="animate-spin mb-4" size={56} />
            ) : (
              <LogIn size={56} className="mb-4 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-3xl font-black tracking-tight">Clock In</span>
            <span className="text-[10px] uppercase font-bold opacity-70 mt-2 tracking-widest">
              {isGettingLocation ? "Ambil Lokasi..." : "Klik untuk Masuk"}
            </span>
          </button>
        ) : !status?.hasClockOut ? (
          <button
            onClick={() => clockOutMutation.mutate()}
            disabled={clockOutMutation.isPending || isGettingLocation}
            className="group w-64 h-64 md:w-72 md:h-72 bg-slate-800 hover:bg-slate-900 text-white rounded-full shadow-[0_20px_50px_rgba(30,41,59,0.2)] flex flex-col items-center justify-center transition-all active:scale-95 disabled:opacity-70"
          >
            {clockOutMutation.isPending || isGettingLocation ? (
              <Loader2 className="animate-spin mb-4" size={56} />
            ) : (
              <LogOut size={56} className="mb-4 group-hover:scale-110 transition-transform" />
            )}
            <span className="text-3xl font-black tracking-tight text-red-500">Clock Out</span>
            <span className="text-[10px] uppercase font-bold opacity-70 mt-2 tracking-widest">Klik untuk Pulang</span>
          </button>
        ) : (
          <div className="w-full max-w-sm h-64 md:h-72 bg-emerald-50 border-2 border-emerald-100 rounded-[40px] flex flex-col items-center justify-center text-center px-6">
            <div className="bg-emerald-500 text-white p-4 rounded-full mb-4 shadow-lg shadow-emerald-200">
              <CheckCircle2 size={40} />
            </div>
            <span className="text-2xl font-black text-emerald-900">Kerja Selesai</span>
            <p className="text-sm text-emerald-600 font-medium mt-1 uppercase tracking-tighter">Sampai jumpa besok!</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-1 shadow-sm">
          <div className="bg-red-50 p-2.5 rounded-2xl text-red-600 mb-1">
            <LogIn size={20}/>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Absen Masuk</p>
          <p className="text-lg font-black text-slate-800">{formatTime(status?.attendance?.clockInTime)}</p>
        </div>
        <div className="bg-white p-5 rounded-3xl border border-slate-100 flex flex-col items-center text-center gap-1 shadow-sm">
          <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-600 mb-1">
            <LogOut size={20}/>
          </div>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Absen Pulang</p>
          <p className="text-lg font-black text-slate-800">{formatTime(status?.attendance?.clockOutTime)}</p>
        </div>
      </div>
    </div>
  );
}