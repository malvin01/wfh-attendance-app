import axios from 'axios';

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api`,
  withCredentials: true, 
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const errorMessage = error.response?.data?.message; 

    if (
      error.response?.status === 401 && 
      errorMessage === "Token telah expired" && 
      !originalRequest.url?.includes('/auth/login') && 
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/auth/refresh`,
          {},
          { withCredentials: true }
        );

        if (res.status === 200 || res.status === 201) {
          const newAccessToken = res.data.data.accessToken;
          localStorage.setItem("token", newAccessToken);
          
          api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

          return api(originalRequest);
        }
      } catch (refreshError) {
        try {
          const fcmToken = localStorage.getItem('fcmToken');
          const accessToken = localStorage.getItem('token'); 
          if (fcmToken) {
             await axios.delete(
              `${import.meta.env.VITE_API_BASE_URL}/api/notifications/token/${encodeURIComponent(fcmToken)}`, 
              { withCredentials: true,
                headers: {
                  Authorization: `Bearer ${accessToken}` 
              }
               }
            );
          }

          await axios.post(
            `${import.meta.env.VITE_API_BASE_URL}/api/auth/logout`,
            {},
            { withCredentials: true }
          );
        } catch (logoutError) {
          if (import.meta.env.DEV) {
            console.error('⚠️ Logout during refresh failed:', logoutError);
          }
        }

        localStorage.clear();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;