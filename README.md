# WFH Attendance App

Sistem absensi Work From Home (WFH) karyawan dengan fitur lengkap termasuk tracking lokasi, notifikasi real-time, dan manajemen karyawan.

## 🚀 Fitur

### Untuk Karyawan
- ✅ **Clock In / Clock Out** dengan tracking lokasi geolocation
- 📍 **Validasi Lokasi** - Menggunakan Geolocation API
- 🔔 **Push Notifications** - Firebase Cloud Messaging (FCM)
- 👤 **Profile Management** - Update data pribadi
- 📊 **Riwayat Absensi** - Melihat riwayat kehadiran

### Untuk Admin
- 📊 **Dashboard** - Statistik ringkas absensi
- 👥 **Manajemen Karyawan** - CRUD data karyawan
- 📋 **Monitoring Absen** - Lihat semua riwayat absensi
- 🔔 **Notifikasi** - System notifications real-time

### Technical Features
- 🔐 **JWT Authentication** dengan Refresh Token rotation
- 🔄 **Auto Token Refresh** - Axios interceptor
- 🎨 **Modern UI** dengan Tailwind CSS
- 📱 **Responsive Design** - Mobile & Desktop friendly
- ⚡ **React Query** - Data fetching & caching
- 🚦 **Form Validation** dengan React Hook Form + Zod
- 🎯 **Toast Notifications** dengan Sonner
- 🔥 **Firebase Integration** - Cloud Messaging

## 📋 Prerequisites

Sebelum menjalankan aplikasi, pastikan Anda telah menginstall:

- **Node.js** (v18 atau higher) - [Download](https://nodejs.org/)
- **npm** atau **yarn** atau **pnpm**
- **Backend API** - Pastikan backend server sudah berjalan

## 🛠️ Installation

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd wfh-attendance-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup Environment Variables**

   Copy file `.env.example` ke `.env` dan isi dengan nilai yang sesuai:

   ```bash
   cp .env.example .env
   ```

   Lalu edit file `.env` dan isi nilai-nilai berikut:

   ```env
   # API Configuration
   VITE_API_BASE_URL=http://localhost:3000

   # Firebase Cloud Messaging
   VITE_VAPID_KEY=your_vapid_key_here

   # Firebase Configuration
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_DATABASE_URL=your_firebase_database_url
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id

   # Fallback URLs
   VITE_DEFAULT_AVATAR_URL=https://ui-avatars.com/api/?name=User
   ```

   > **📌 Mendapatkan Firebase Config:**
   > 1. Buka [Firebase Console](https://console.firebase.google.com/)
   > 2. Buat project baru atau pilih project yang ada
   > 3. Navigate ke **Project Settings** → **General** → Scroll ke **Your apps**
   > 4. Pilih/pilih Web App dan copy konfigurasi
   > 5. Untuk VAPID Key: **Project Settings** → **Cloud Messaging** → **Web Push certificates** → **Generate Key**

4. **Firebase Messaging Service Worker**

   Pastikan file `firebase-messaging-sw.js` ada di `public/` directory:

   ```javascript
   // public/firebase-messaging-sw.js
   import { initializeApp } from 'firebase/app';
   import { getMessaging, onBackgroundMessage } from 'firebase/messaging/sw';

   const firebaseConfig = {
     apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
     authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
     // ... konfigurasi lainnya
   };

   const app = initializeApp(firebaseConfig);
   const messaging = getMessaging(app);

   onBackgroundMessage(messaging, (payload) => {
     console.log('Received background message:', payload);
     // Custom notification handling
   });
   ```

## 🚀 Running the App

### Development Mode
```bash
npm run dev
```

Aplikasi akan berjalan di [http://localhost:5173](http://localhost:5173)

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

### Lint Code
```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── api/                 # API configuration & interceptors
│   └── axiosInstance.ts # Axios instance with interceptors
├── components/          # Reusable components
│   └── EmployeeLayout.tsx
├── layouts/             # Layout components
│   ├── AdminLayout.tsx
│   └── EmployeeLayout.tsx
├── lib/                 # Utility libraries
│   ├── firebase.ts      # Firebase configuration
│   └── utils.ts         # Helper functions
├── pages/               # Page components
│   ├── admin/           # Admin pages
│   │   ├── Dashboard.tsx
│   │   ├── EmployeeManagement.tsx
│   │   └── Monitoring.tsx
│   ├── employee/        # Employee pages
│   │   ├── AbsenPage.tsx
│   │   └── ProfilePage.tsx
│   └── auth/
│       └── LoginPage.tsx
├── schemas/             # Zod validation schemas
│   ├── authSchema.ts
│   └── employeeSchema.ts
└── main.tsx             # App entry point
```

## 🔐 Authentication Flow

1. **Login** → User memasukkan email & password
2. **Token Storage** → Access token disimpan di localStorage
3. **Refresh Token** → Disimpan di HTTP-only cookie
4. **Auto Refresh** → Axios interceptor me-refresh token saat expired
5. **Logout** → Tokens dihapus dari client & server

## 🔔 Firebase Cloud Messaging

### Setup

1. Buat project di [Firebase Console](https://console.firebase.google.com/)
2. Enable Cloud Messaging
3. Generate VAPID Key
4. Tambahkan konfigurasi ke `.env`

### Flow

1. User login → Request notification permission
2. FCM Token generated → Disimpan di localStorage & backend
3. Foreground messages → Ditampilkan sebagai toast
4. Background messages → Browser notification

## 🎨 Tech Stack

| Technology | Purpose |
|------------|---------|
| **React 19** | UI Framework |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **Tailwind CSS 4** | Styling |
| **React Router** | Routing |
| **TanStack Query** | Data Fetching |
| **Axios** | HTTP Client |
| **React Hook Form** | Form Management |
| **Zod** | Schema Validation |
| **Sonner** | Toast Notifications |
| **Firebase** | Push Notifications |
| **Lucide React** | Icons |
| **dayjs** | Date Utilities |

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE_URL` | Backend API URL | `http://localhost:3000` |
| `VITE_FIREBASE_API_KEY` | Firebase API Key | `AIzaSy...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Project ID | `project-id` |
| `VITE_VAPID_KEY` | FCM VAPID Key | `BEPWEqZu...` |
| `VITE_DEFAULT_AVATAR_URL` | Default avatar URL | `https://ui-avatars.com/...` |

## 🐛 Troubleshooting

### Geolocation tidak berfungsi
- Pastikan browser mendukung Geolocation API
- Cek izin lokasi di browser settings
- Gunakan HTTPS (required untuk production)

### FCM Notifications tidak muncul
- Pastikan service worker terdaftar dengan benar
- Cek konfigurasi Firebase di `.env`
- Pastikan VAPID key valid
- Cek browser notification permissions

### Token refresh gagal
- Pastikan refresh token cookie diset dengan benar
- Cek endpoint `/auth/refresh` di backend
- Verify cookie settings (sameSite, secure, httpOnly)

## 📄 License

MIT License - Copyright © 2026 Malvin Saputra

---
**Version:** 1.0.0
**Last Updated:** January 2026
**Developed by:** Malvin Saputra
