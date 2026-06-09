import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("si_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("si_token");
      localStorage.removeItem("si_user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  },
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (name: string, email: string, password: string) =>
    api.post("/auth/register", { name, email, password }),
  me: () => api.get("/auth/me"),
};

export const leadsApi = {
  list: (params?: {
    search?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => api.get("/leads", { params }),
  kanban: () => api.get("/leads/kanban"),
  get: (id: string) => api.get(`/leads/${id}`),
  create: (data: any) => api.post("/leads", data),
  update: (id: string, data: any) => api.patch(`/leads/${id}`, data),
  delete: (id: string) => api.delete(`/leads/${id}`),
  exportCsv: () => api.get("/leads/export/csv", { responseType: "blob" }),
};

export const dashboardApi = {
  metrics: () => api.get("/dashboard/metrics"),
};

export const aiApi = {
  chat: (message: string, history: { role: string; content: string }[]) =>
    api.post("/ai/chat", { message, history }),
};

export const usersApi = {
  list: () => api.get("/users"),
};

export default api;
