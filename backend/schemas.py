from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from decimal import Decimal

from models import UserRole, MembershipStatus, PaymentStatus, EquipmentStatus


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    role: UserRole = UserRole.MEMBER


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=100)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None


class AdminUserUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    is_active: Optional[bool] = None
    role: Optional[UserRole] = None


class UserResponse(UserBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class PasswordResetRequest(BaseModel):
    new_password: str = Field(..., min_length=8, max_length=100)


class TokenData(BaseModel):
    email: Optional[str] = None
    user_id: Optional[int] = None
    role: Optional[UserRole] = None


class MemberBase(BaseModel):
    date_of_birth: Optional[date] = None
    address: Optional[str] = None
    emergency_contact: Optional[str] = Field(None, max_length=20)
    emergency_contact_name: Optional[str] = Field(None, max_length=255)
    height: Optional[Decimal] = None
    weight: Optional[Decimal] = None
    fitness_goals: Optional[str] = None
    medical_conditions: Optional[str] = None


class MemberCreate(MemberBase):
    user: UserCreate
    membership_number: str = Field(..., max_length=50)
    membership_plan_id: int
    trainer_id: Optional[int] = None


class MemberUpdate(MemberBase):
    membership_status: Optional[MembershipStatus] = None
    membership_plan_id: Optional[int] = None
    trainer_id: Optional[int] = None


class MemberResponse(MemberBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    membership_number: str
    joined_date: date
    membership_status: MembershipStatus
    membership_plan_id: Optional[int] = None
    trainer_id: Optional[int] = None
    user: UserResponse


class TrainerBase(BaseModel):
    specialization: Optional[str] = None
    experience_years: int = 0
    certification: Optional[str] = None
    hourly_rate: Optional[Decimal] = None


class TrainerCreate(TrainerBase):
    user: UserCreate
    employee_id: str = Field(..., max_length=50)


class TrainerUpdate(TrainerBase):
    is_active: Optional[bool] = None


class TrainerResponse(TrainerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    employee_id: str
    hire_date: date
    is_active: bool
    user: UserResponse


class MembershipPlanBase(BaseModel):
    name: str = Field(..., max_length=100)
    description: Optional[str] = None
    duration_days: int = Field(..., gt=0)
    price: Decimal = Field(..., gt=0)
    features: Optional[str] = None


class MembershipPlanCreate(MembershipPlanBase):
    pass


class MembershipPlanUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=100)
    description: Optional[str] = None
    duration_days: Optional[int] = Field(None, gt=0)
    price: Optional[Decimal] = Field(None, gt=0)
    features: Optional[str] = None
    is_active: Optional[bool] = None


class MembershipPlanResponse(MembershipPlanBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime


class AttendanceBase(BaseModel):
    member_id: int
    qr_code_used: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceResponse(AttendanceBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    check_in_time: datetime
    check_out_time: Optional[datetime] = None
    date: date


class PaymentBase(BaseModel):
    member_id: int
    amount: Decimal = Field(..., gt=0)
    due_date: date
    payment_method: Optional[str] = Field(None, max_length=50)
    transaction_id: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    pass


class PaymentUpdate(BaseModel):
    amount: Optional[Decimal] = Field(None, gt=0)
    status: Optional[PaymentStatus] = None
    payment_method: Optional[str] = Field(None, max_length=50)
    transaction_id: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None


class PaymentResponse(PaymentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: PaymentStatus
    payment_date: datetime
    created_at: datetime


class EquipmentBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    brand: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    serial_number: Optional[str] = Field(None, max_length=100)
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    location: Optional[str] = Field(None, max_length=255)


class EquipmentCreate(EquipmentBase):
    pass


class EquipmentUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)
    brand: Optional[str] = Field(None, max_length=100)
    model: Optional[str] = Field(None, max_length=100)
    serial_number: Optional[str] = Field(None, max_length=100)
    purchase_date: Optional[date] = None
    warranty_expiry: Optional[date] = None
    location: Optional[str] = Field(None, max_length=255)
    status: Optional[EquipmentStatus] = None
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None


class EquipmentResponse(EquipmentBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    status: EquipmentStatus
    last_maintenance: Optional[date] = None
    next_maintenance: Optional[date] = None
    created_at: datetime
    updated_at: datetime


class ExerciseBase(BaseModel):
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    sets: int = Field(3, ge=1)
    reps: int = Field(10, ge=1)
    weight: Optional[Decimal] = None
    rest_seconds: int = Field(60, ge=0)
    order: int = 0


class ExerciseCreate(ExerciseBase):
    pass


class ExerciseResponse(ExerciseBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    workout_plan_id: int
    created_at: datetime


class WorkoutPlanBase(BaseModel):
    member_id: int
    trainer_id: Optional[int] = None
    name: str = Field(..., max_length=255)
    description: Optional[str] = None
    start_date: date
    end_date: Optional[date] = None


class WorkoutPlanCreate(WorkoutPlanBase):
    exercises: List[ExerciseCreate] = []


class WorkoutPlanUpdate(BaseModel):
    member_id: Optional[int] = None
    trainer_id: Optional[int] = None
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    exercises: Optional[List[ExerciseCreate]] = None


class WorkoutPlanResponse(WorkoutPlanBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    exercises: List[ExerciseResponse] = []


class InquiryBase(BaseModel):
    subject: str = Field(..., max_length=255)
    message: str
    category: Optional[str] = Field(None, max_length=100)


class InquiryCreate(InquiryBase):
    pass


class InquiryUpdate(BaseModel):
    status: Optional[str] = None
    response: Optional[str] = None


class InquiryResponse(InquiryBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    member_id: int
    status: str
    response: Optional[str] = None
    responded_at: Optional[datetime] = None
    created_at: datetime


class FeedbackBase(BaseModel):
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None
    category: Optional[str] = Field(None, max_length=100)


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackResponse(FeedbackBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    member_id: int
    created_at: datetime


class DashboardStats(BaseModel):
    total_members: int
    active_members: int
    total_trainers: int
    active_plans: int
    total_revenue: float
    pending_payments: int
    today_attendance: int
    equipment_under_maintenance: int