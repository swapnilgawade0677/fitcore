export type UserRole = 'admin' | 'member' | 'trainer';
export type MembershipStatus = 'active' | 'expired' | 'pending' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending' | 'partial' | 'overdue' | 'cancelled';
export type EquipmentStatus = 'available' | 'maintenance' | 'out_of_order';

export interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Member {
  id: number;
  user_id: number;
  membership_number: string;
  date_of_birth: string | null;
  address: string | null;
  emergency_contact: string | null;
  emergency_contact_name: string | null;
  height: number | null;
  weight: number | null;
  fitness_goals: string | null;
  medical_conditions: string | null;
  joined_date: string;
  membership_status: MembershipStatus;
  membership_plan_id: number | null;
  trainer_id: number | null;
  user: User;
}

export interface Trainer {
  id: number;
  user_id: number;
  employee_id: string;
  specialization: string | null;
  experience_years: number;
  certification: string | null;
  hourly_rate: number | null;
  hire_date: string;
  is_active: boolean;
  user: User;
}

export interface MembershipPlan {
  id: number;
  name: string;
  description: string | null;
  duration_days: number;
  price: number;
  features: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Attendance {
  id: number;
  member_id: number;
  check_in_time: string;
  check_out_time: string | null;
  date: string;
  qr_code_used: string | null;
}

export interface Payment {
  id: number;
  member_id: number;
  amount: number;
  payment_date: string;
  due_date: string;
  status: PaymentStatus;
  payment_method: string | null;
  transaction_id: string | null;
  notes: string | null;
  created_at: string;
}

export interface Equipment {
  id: number;
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  purchase_date: string | null;
  warranty_expiry: string | null;
  status: EquipmentStatus;
  last_maintenance: string | null;
  next_maintenance: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: number;
  workout_plan_id: number;
  name: string;
  description: string | null;
  sets: number;
  reps: number;
  weight: number | null;
  rest_seconds: number;
  order: number;
  created_at: string;
}

export interface WorkoutPlan {
  id: number;
  member_id: number;
  trainer_id: number | null;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  exercises: Exercise[];
}

export interface Inquiry {
  id: number;
  member_id: number;
  subject: string;
  message: string;
  status: string;
  response: string | null;
  responded_at: string | null;
  created_at: string;
}

export interface Feedback {
  id: number;
  member_id: number;
  rating: number;
  comment: string | null;
  category: string | null;
  created_at: string;
}

export interface DashboardStats {
  total_members: number;
  active_members: number;
  total_trainers: number;
  active_plans: number;
  total_revenue: number;
  pending_payments: number;
  today_attendance: number;
  equipment_under_maintenance: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone?: string;
  role: UserRole;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export interface UserCreate {
  email: string;
  password: string;
  full_name: string;
  phone?: string | null;
  role: UserRole;
}

export interface AdminUserUpdate {
  full_name?: string | null;
  phone?: string | null;
  is_active?: boolean;
  role?: UserRole;
}

export interface MemberCreate {
  user: UserCreate;
  membership_number: string;
  membership_plan_id: number;
  trainer_id?: number | null;
  date_of_birth?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  emergency_contact_name?: string | null;
  height?: number | null;
  weight?: number | null;
  fitness_goals?: string | null;
  medical_conditions?: string | null;
}

export interface MemberUpdate {
  date_of_birth?: string | null;
  address?: string | null;
  emergency_contact?: string | null;
  emergency_contact_name?: string | null;
  height?: number | null;
  weight?: number | null;
  fitness_goals?: string | null;
  medical_conditions?: string | null;
  membership_status?: MembershipStatus;
  membership_plan_id?: number;
  trainer_id?: number;
}

export interface TrainerCreate {
  user: UserCreate;
  employee_id: string;
  specialization?: string | null;
  experience_years?: number;
  certification?: string | null;
  hourly_rate?: number | null;
}

export interface TrainerUpdate {
  specialization?: string | null;
  experience_years?: number;
  certification?: string | null;
  hourly_rate?: number | null;
  is_active?: boolean;
}

export interface MembershipPlanCreate {
  name: string;
  description?: string | null;
  duration_days: number;
  price: number;
  features?: string | null;
}

export interface MembershipPlanUpdate extends MembershipPlanCreate {
  is_active?: boolean;
}

export interface AttendanceCreate {
  member_id: number;
  qr_code_used?: string | null;
}

export interface PaymentCreate {
  member_id: number;
  amount: number;
  due_date: string;
  payment_method?: string | null;
  transaction_id?: string | null;
  notes?: string | null;
}

export interface PaymentUpdate {
  amount?: number;
  status?: PaymentStatus;
  payment_method?: string | null;
  transaction_id?: string | null;
  notes?: string | null;
}

export interface EquipmentCreate {
  name: string;
  description?: string | null;
  category?: string | null;
  brand?: string | null;
  model?: string | null;
  serial_number?: string | null;
  purchase_date?: string | null;
  warranty_expiry?: string | null;
  location?: string | null;
}

export interface EquipmentUpdate extends EquipmentCreate {
  status?: EquipmentStatus;
  last_maintenance?: string | null;
  next_maintenance?: string | null;
}

export interface ExerciseCreate {
  name: string;
  description?: string | null;
  sets?: number;
  reps?: number;
  weight?: number | null;
  rest_seconds?: number;
  order?: number;
}

export interface WorkoutPlanCreate {
  member_id: number;
  trainer_id?: number | null;
  name: string;
  description?: string | null;
  start_date: string;
  end_date?: string | null;
  exercises?: ExerciseCreate[];
}

export interface WorkoutPlanUpdate {
  member_id?: number;
  trainer_id?: number | null;
  name?: string;
  description?: string | null;
  start_date?: string;
  end_date?: string | null;
  is_active?: boolean;
  exercises?: ExerciseCreate[] | null;
}

export interface InquiryCreate {
  subject: string;
  message: string;
  category?: string | null;
}

export interface InquiryUpdate {
  status?: string;
  response?: string | null;
}

export interface FeedbackCreate {
  rating: number;
  comment?: string | null;
  category?: string | null;
}