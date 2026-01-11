import { useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import api from "@/api/axiosInstance";
import { getFullImageUrl } from "@/lib/utils";
import { useEffect } from "react";
import { 
  Briefcase, Camera, Lock, 
  Save, Loader2, KeyRound, Smartphone
} from "lucide-react";
import { toast } from "sonner";

const phoneSchema = z.object({
  phoneNumber: z.string().min(10, "Nomor handphone minimal 10 digit"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
  newPassword: z.string().min(6, "Password baru minimal 6 karakter"),
});

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: res, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const response = await api.get("/profile");
      return response.data;
    },
  });

  const profile = res?.data;

  
  const phoneForm = useForm<z.infer<typeof phoneSchema>>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phoneNumber: "" },
    mode: "onSubmit", 
  });

   useEffect(() => {
    phoneForm.reset({ phoneNumber: profile?.phoneNumber || "" });
  }, [profile?.phoneNumber]); 

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
    mode: "onSubmit",
  });

  const updatePhoneMutation = useMutation({
    mutationFn: (values: z.infer<typeof phoneSchema>) => api.patch("/profile", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Kontak diperbarui");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal mengubah nomor handphone");
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: (values: z.infer<typeof passwordSchema>) => 
      api.post("/profile/change-password", values),
    onSuccess: () => {
      passwordForm.reset();
      toast.success("Password diperbarui");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal mengubah password");
    },
  });

  const photoMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("photo", file); 
      
      return api.post("/profile/upload-photo", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      toast.success("Foto profil berhasil diperbarui");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Gagal mengunggah foto");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      photoMutation.mutate(file);
    }
  };

  if (isLoading) return <div className="p-20 text-center text-red-600 animate-pulse font-bold">Memuat...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm flex flex-col items-center text-center">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-red-50 overflow-hidden bg-slate-100 flex items-center justify-center">
            <img 
              src={getFullImageUrl(profile?.photoUrl)} 
              className={`w-full h-full object-cover ${photoMutation.isPending ? 'opacity-40' : 'opacity-100'}`}
              alt="Avatar"
            />
            {photoMutation.isPending && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="animate-spin text-red-600" size={24} />
              </div>
            )}
          </div>
          
          <button 
            type="button" 
            onClick={() => fileInputRef.current?.click()}
            disabled={photoMutation.isPending}
            className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full border-2 border-white shadow-md hover:bg-red-700 transition-colors disabled:bg-slate-400"
          >
            <Camera size={14} />
          </button>

          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>
        
        <div className="mt-4">
          <h1 className="text-xl font-bold text-slate-800">{profile?.fullName}</h1>
          <p className="text-sm text-slate-400 font-medium flex items-center justify-center gap-1.5 mt-1">
            <Briefcase size={14} className="text-red-500" /> {profile?.position}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
          <Smartphone size={16} className="text-red-600" /> Informasi Kontak
        </h3>
        
        <form onSubmit={phoneForm.handleSubmit((v) => updatePhoneMutation.mutate(v))} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email (Non-Editable)</label>
            <input disabled value={profile?.email} className="w-full p-3 rounded-xl bg-slate-50 border border-slate-100 text-slate-400 text-sm font-medium cursor-not-allowed" />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Nomor WhatsApp</label>
            <input
              type="tel"
              {...phoneForm.register("phoneNumber")}
              className={`w-full p-3 rounded-xl border text-sm font-medium outline-none transition-all
                ${phoneForm.formState.errors.phoneNumber ? "border-red-500 focus:ring-2 focus:ring-red-500" : "border-slate-200 focus:ring-2 focus:ring-red-500"}
              `}
            />

             {phoneForm.formState.errors.phoneNumber?.message && (
              <p className="text-xs text-red-600 ml-1">
                {phoneForm.formState.errors.phoneNumber.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={updatePhoneMutation.isPending}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {updatePhoneMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            Simpan Perubahan
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-50 pb-3">
          <KeyRound size={16} className="text-red-600" /> Keamanan Akun
        </h3>
        
        <form onSubmit={passwordForm.handleSubmit((v) => changePasswordMutation.mutate(v))} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password Saat Ini</label>
              <input type="password" {...passwordForm.register("currentPassword")} className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:ring-2 focus:ring-red-500" placeholder="••••••••" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">
                Password Baru
              </label>

              <input
                type="password"
                {...passwordForm.register("newPassword")}
                className={`w-full p-3 rounded-xl border text-sm outline-none
                  ${passwordForm.formState.errors.newPassword
                    ? "border-red-500 focus:ring-2 focus:ring-red-500"
                    : "border-slate-200 focus:ring-2 focus:ring-red-500"}
                `}
                placeholder="••••••••"
              />

               {passwordForm.formState.errors.newPassword?.message && (
                <p className="text-xs text-red-600 ml-1">
                  {passwordForm.formState.errors.newPassword.message}
                </p>
              )}
            </div>
          </div>

          <button 
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="w-full bg-slate-800 hover:bg-black text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
          >
            {changePasswordMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Lock size={16} />}
            Ganti Password
          </button>
        </form>
      </div>

    </div>
  );
}