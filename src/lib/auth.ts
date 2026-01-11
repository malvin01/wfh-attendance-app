import { jwtDecode } from "jwt-decode";

interface JWTPayload {
  sub: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const getAuthData = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  try {
    const decoded = jwtDecode<JWTPayload>(token);
    
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      localStorage.removeItem("token");
      return null;
    }

    return decoded;
  } catch (error) {
    return null;
  }
};