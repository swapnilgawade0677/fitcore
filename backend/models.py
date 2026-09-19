from datetime import datetime, date
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, Integer, String, Text, DateTime, Date, Time, ForeignKey,
    Enum, Boolean, Numeric, UniqueConstraint, Index
)
from sqlalchemy.orm import relationship

from database import Base


class UserRole(PyEnum):
    ADMIN = "admin"
    MEMBER = "member"
    TRAINER = "trainer"


class MembershipStatus(PyEnum):
    ACTIVE = "active"
    EXPIRED = "expired"
    PENDING = "pending"
    CANCELLED = "cancelled"


class PaymentStatus(PyEnum):
    PAID = "paid"
    PENDING = "pending"
    PARTIAL = "partial"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"


class EquipmentStatus(PyEnum):
    AVAILABLE = "available"
    MAINTENANCE = "maintenance"
    OUT_OF_ORDER = "out_of_order"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), default=UserRole.MEMBER, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    member_profile = relationship("Member", back_populates="user", uselist=False)
    trainer_profile = relationship("Trainer", back_populates="user", uselist=False)


class Member(Base):
    __tablename__ = "members"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    membership_number = Column(String(50), unique=True, index=True, nullable=False)
    membership_plan_id = Column(Integer, ForeignKey("membership_plans.id", ondelete="SET NULL"), nullable=True)
    trainer_id = Column(Integer, ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact = Column(String(20), nullable=True)
    emergency_contact_name = Column(String(255), nullable=True)
    height = Column(Numeric(5, 2), nullable=True)
    weight = Column(Numeric(5, 2), nullable=True)
    fitness_goals = Column(Text, nullable=True)
    medical_conditions = Column(Text, nullable=True)
    joined_date = Column(Date, default=date.today)
    membership_status = Column(Enum(MembershipStatus), default=MembershipStatus.PENDING)

    user = relationship("User", back_populates="member_profile")
    membership_plan = relationship("MembershipPlan", back_populates="members")
    trainer = relationship("Trainer", back_populates="assigned_members")
    attendances = relationship("Attendance", back_populates="member", cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="member", cascade="all, delete-orphan")
    inquiries = relationship("Inquiry", back_populates="member", cascade="all, delete-orphan")
    feedbacks = relationship("Feedback", back_populates="member", cascade="all, delete-orphan")
    assigned_workouts = relationship("WorkoutPlan", back_populates="member", cascade="all, delete-orphan")


class Trainer(Base):
    __tablename__ = "trainers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    employee_id = Column(String(50), unique=True, index=True, nullable=False)
    specialization = Column(String(255), nullable=True)
    experience_years = Column(Integer, default=0)
    certification = Column(Text, nullable=True)
    hourly_rate = Column(Numeric(10, 2), nullable=True)
    hire_date = Column(Date, default=date.today)
    is_active = Column(Boolean, default=True)

    user = relationship("User", back_populates="trainer_profile")
    assigned_members = relationship("Member", back_populates="trainer")
    workout_plans = relationship("WorkoutPlan", back_populates="trainer")


class MembershipPlan(Base):
    __tablename__ = "membership_plans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    duration_days = Column(Integer, nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    features = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    members = relationship("Member", back_populates="membership_plan")


class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    check_in_time = Column(DateTime, default=datetime.utcnow, nullable=False)
    check_out_time = Column(DateTime, nullable=True)
    date = Column(Date, default=date.today, nullable=False)
    qr_code_used = Column(String(255), nullable=True)

    member = relationship("Member", back_populates="attendances")

    __table_args__ = (
        UniqueConstraint('member_id', 'date', name='unique_member_daily_attendance'),
        Index('idx_attendance_member_date', 'member_id', 'date'),
    )


class Payment(Base):
    __tablename__ = "payments"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    amount = Column(Numeric(10, 2), nullable=False)
    payment_date = Column(DateTime, default=datetime.utcnow)
    due_date = Column(Date, nullable=False)
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PENDING)
    payment_method = Column(String(50), nullable=True)
    transaction_id = Column(String(100), nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    member = relationship("Member", back_populates="payments")


class Equipment(Base):
    __tablename__ = "equipment"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    brand = Column(String(100), nullable=True)
    model = Column(String(100), nullable=True)
    serial_number = Column(String(100), unique=True, nullable=True)
    purchase_date = Column(Date, nullable=True)
    warranty_expiry = Column(Date, nullable=True)
    status = Column(Enum(EquipmentStatus), default=EquipmentStatus.AVAILABLE)
    last_maintenance = Column(Date, nullable=True)
    next_maintenance = Column(Date, nullable=True)
    location = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WorkoutPlan(Base):
    __tablename__ = "workout_plans"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    trainer_id = Column(Integer, ForeignKey("trainers.id", ondelete="SET NULL"), nullable=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    member = relationship("Member", back_populates="assigned_workouts")
    trainer = relationship("Trainer", back_populates="workout_plans")
    exercises = relationship("Exercise", back_populates="workout_plan", cascade="all, delete-orphan")


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    workout_plan_id = Column(Integer, ForeignKey("workout_plans.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    sets = Column(Integer, default=3)
    reps = Column(Integer, default=10)
    weight = Column(Numeric(6, 2), nullable=True)
    rest_seconds = Column(Integer, default=60)
    order = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    workout_plan = relationship("WorkoutPlan", back_populates="exercises")


class Inquiry(Base):
    __tablename__ = "inquiries"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(100), nullable=True)
    status = Column(String(50), default="open")
    response = Column(Text, nullable=True)
    responded_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    member = relationship("Member", back_populates="inquiries")


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    member_id = Column(Integer, ForeignKey("members.id", ondelete="CASCADE"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)
    category = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    member = relationship("Member", back_populates="feedbacks")