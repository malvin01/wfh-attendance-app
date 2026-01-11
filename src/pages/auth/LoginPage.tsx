import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import api from "@/api/axiosInstance";
import { loginSchema } from "@/schemas/authSchema";
import { toast } from "sonner";
import { setupNotifications } from "@/lib/firebase";
import logo from "@/assets/images/dexa-hut-56.svg";
import homeBanner from "@/assets/images/dexagroup-home-banner.jpg";

type LoginFormValues = {
  email: string;
  password: string;
};

export default function LoginPage() {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const mutation = useMutation({
    mutationFn: async (values: LoginFormValues) => {
      const res = await api.post("/auth/login", values);
      return res.data;
    },
    
    onSuccess: async (res) => {
      const { accessToken, user } = res.data;
      
      localStorage.setItem("token", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      
      toast.success("Login Berhasil", {
        description: `Selamat datang kembali, ${user.fullName}`,
      });

      setupNotifications(api).catch((error) => {
        if (import.meta.env.DEV) {
          console.error('⚠️ FCM setup failed:', error);
        }
      });

      if (user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        navigate("/employee/profile");
      }
    },
    
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Email atau password salah";
      toast.error("Login Gagal", { description: errorMsg });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex justify-center">
      <div className="max-w-screen-xl m-0 sm:m-10 bg-white shadow sm:rounded-lg flex justify-center flex-1">
        <div className="lg:w-1/2 xl:w-5/12 p-6 sm:p-12">
          <div className="text-center">
            <img
              src={logo}
              className="w-32 mx-auto"
              alt="Logo"
            />
          </div>
          
          <div className="mt-12 flex flex-col items-center">
            <h1 className="text-2xl xl:text-3xl font-extrabold text-red-600">
              Employee Sign In
            </h1>
            
            <div className="w-full flex-1 mt-8">
              <div className="mx-auto max-w-xs">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <input
                      {...register("email")}
                      className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border ${
                        errors.email ? "border-red-500" : "border-gray-200"
                      } placeholder-gray-500 text-sm focus:outline-none focus:border-red-400 focus:bg-white`}
                      type="email"
                      placeholder="Email Perusahaan"
                    />
                    {errors.email && (
                      <p className="text-red-500 text-xs mt-1 ml-2 font-bold">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <input
                      {...register("password")}
                      className={`w-full px-8 py-4 rounded-lg font-medium bg-gray-100 border ${
                        errors.password ? "border-red-500" : "border-gray-200"
                      } placeholder-gray-500 text-sm focus:outline-none focus:border-red-400 focus:bg-white`}
                      type="password"
                      placeholder="Password"
                    />
                    {errors.password && (
                      <p className="text-red-500 text-xs mt-1 ml-2 font-bold">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="mt-5 tracking-wide font-bold bg-red-600 text-gray-100 w-full py-4 rounded-lg hover:bg-red-800 transition-all duration-300 ease-in-out flex items-center justify-center disabled:bg-red-300 disabled:cursor-not-allowed"
                  >
                    <span className="ml-3">
                      {mutation.isPending ? "Authenticating..." : "Sign In"}
                    </span>
                  </button>
                </form>

                <p className="mt-12 text-[10px] text-gray-400 text-center uppercase font-black tracking-widest">
                  Sistem Absensi WFH Karyawan v1.0
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 bg-red-100 text-center hidden lg:flex">
          <div
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage:
                `url('${homeBanner}')`,
            }}
          />
        </div>
      </div>
    </div>
  );
}