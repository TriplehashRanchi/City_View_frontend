import { api } from "@/services/api";

const TOKEN_KEY = "adminToken";
const ADMIN_KEY = "adminProfile";

export const auth = {
  getToken() {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  saveToken(token) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
  },

  clearToken() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
  },

  saveAdmin(admin) {
    if (typeof window === "undefined") return;
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },

  getAdmin() {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  clearAdmin() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(ADMIN_KEY);
  },

  saveSession({ token, admin }) {
    this.saveToken(token);
    if (admin) this.saveAdmin(admin);
  },

  clearSession() {
    this.clearToken();
    this.clearAdmin();
  },

  async login(payload) {
    const { data } = await api.post("/auth/login", payload);
    return data;
  },

  async me() {
    const { data } = await api.get("/auth/me");
    return data;
  },
};
