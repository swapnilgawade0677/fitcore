import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type {
  TokenResponse,
  RegisterData,
  User,
  AdminUserUpdate,
  Member,
  MemberCreate,
  MemberUpdate,
  Trainer,
  TrainerCreate,
  TrainerUpdate,
  MembershipPlan,
  MembershipPlanCreate,
  MembershipPlanUpdate,
  Attendance,
  AttendanceCreate,
  Payment,
  PaymentCreate,
  PaymentUpdate,
  Equipment,
  EquipmentCreate,
  EquipmentUpdate,
  WorkoutPlan,
  WorkoutPlanCreate,
  WorkoutPlanUpdate,
  Inquiry,
  InquiryCreate,
  InquiryUpdate,
  Feedback,
  FeedbackCreate,
  DashboardStats,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (email: string, password: string) =>
    api.post<TokenResponse>('/auth/login', { email, password }),
  register: (data: RegisterData) =>
    api.post<User>('/auth/register', data),
  getMe: () =>
    api.get<User>('/auth/me'),
  updateMe: (data: Partial<User>) =>
    api.put<User>('/auth/me', data),
};

export const membersApi = {
  list: (params?: { skip?: number; limit?: number; status?: string; search?: string }) =>
    api.get<Member[]>('/members', { params }),
  get: (id: number) =>
    api.get<Member>(`/members/${id}`),
  create: (data: MemberCreate) =>
    api.post<Member>('/members', data),
  update: (id: number, data: MemberUpdate) =>
    api.put<Member>(`/members/${id}`, data),
  delete: (id: number) =>
    api.delete(`/members/${id}`),
};

export const trainersApi = {
  list: (params?: { skip?: number; limit?: number }) =>
    api.get<Trainer[]>('/trainers', { params }),
  get: (id: number) =>
    api.get<Trainer>(`/trainers/${id}`),
  create: (data: TrainerCreate) =>
    api.post<Trainer>('/trainers', data),
  update: (id: number, data: TrainerUpdate) =>
    api.put<Trainer>(`/trainers/${id}`, data),
  delete: (id: number) =>
    api.delete(`/trainers/${id}`),
};

export const plansApi = {
  list: (params?: { skip?: number; limit?: number; active_only?: boolean }) =>
    api.get<MembershipPlan[]>('/plans', { params }),
  get: (id: number) =>
    api.get<MembershipPlan>(`/plans/${id}`),
  create: (data: MembershipPlanCreate) =>
    api.post<MembershipPlan>('/plans', data),
  update: (id: number, data: MembershipPlanUpdate) =>
    api.put<MembershipPlan>(`/plans/${id}`, data),
  delete: (id: number) =>
    api.delete(`/plans/${id}`),
};

export const attendanceApi = {
  mark: (data: AttendanceCreate) =>
    api.post<Attendance>('/attendance', data),
  list: (params?: { member_id?: number; start_date?: string; end_date?: string; skip?: number; limit?: number }) =>
    api.get<Attendance[]>('/attendance', { params }),
};

export const paymentsApi = {
  list: (params?: { member_id?: number; status?: string; skip?: number; limit?: number }) =>
    api.get<Payment[]>('/payments', { params }),
  create: (data: PaymentCreate) =>
    api.post<Payment>('/payments', data),
  update: (id: number, data: PaymentUpdate) =>
    api.put<Payment>(`/payments/${id}`, data),
};

export const equipmentApi = {
  list: (params?: { status?: string; category?: string; skip?: number; limit?: number }) =>
    api.get<Equipment[]>('/equipment', { params }),
  get: (id: number) =>
    api.get<Equipment>(`/equipment/${id}`),
  create: (data: EquipmentCreate) =>
    api.post<Equipment>('/equipment', data),
  update: (id: number, data: EquipmentUpdate) =>
    api.put<Equipment>(`/equipment/${id}`, data),
  delete: (id: number) =>
    api.delete(`/equipment/${id}`),
};

export const workoutsApi = {
  list: (params?: { member_id?: number; trainer_id?: number; active_only?: boolean; skip?: number; limit?: number }) =>
    api.get<WorkoutPlan[]>('/workouts', { params }),
  get: (id: number) =>
    api.get<WorkoutPlan>(`/workouts/${id}`),
  create: (data: WorkoutPlanCreate) =>
    api.post<WorkoutPlan>('/workouts', data),
  update: (id: number, data: WorkoutPlanUpdate) =>
    api.put<WorkoutPlan>(`/workouts/${id}`, data),
  delete: (id: number) =>
    api.delete(`/workouts/${id}`),
};

export const inquiriesApi = {
  list: (params?: { status?: string; skip?: number; limit?: number }) =>
    api.get<Inquiry[]>('/inquiries', { params }),
  create: (data: InquiryCreate) =>
    api.post<Inquiry>('/inquiries', data),
  update: (id: number, data: InquiryUpdate) =>
    api.put<Inquiry>(`/inquiries/${id}`, data),
};

export const feedbacksApi = {
  list: (params?: { category?: string; skip?: number; limit?: number }) =>
    api.get<Feedback[]>('/feedbacks', { params }),
  create: (data: FeedbackCreate) =>
    api.post<Feedback>('/feedbacks', data),
};

export const dashboardApi = {
  getStats: () =>
    api.get<DashboardStats>('/dashboard/stats'),
};

export const adminApi = {
  login: (email: string, password: string) =>
    api.post<TokenResponse>('/admin/login', { email, password }),
  getStats: () =>
    api.get<DashboardStats>('/admin/dashboard/stats'),
  listUsers: (params?: { skip?: number; limit?: number; role?: string; search?: string }) =>
    api.get<User[]>('/admin/users', { params }),
  getUser: (id: number) =>
    api.get<User>(`/admin/users/${id}`),
  updateUser: (id: number, data: AdminUserUpdate) =>
    api.put<User>(`/admin/users/${id}`, data),
  deleteUser: (id: number) =>
    api.delete(`/admin/users/${id}`),
  resetPassword: (id: number, new_password: string) =>
    api.post<User>(`/admin/users/${id}/reset-password`, { new_password }),
};