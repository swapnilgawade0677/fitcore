"""Admin-only operations, served under the /api/v1/admin namespace.

Every route in this module requires the ADMIN role (enforced at the
router level), keeping administrative operations separate from the
regular member/trainer self-service routes in routers.py.
"""
from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete as sa_delete, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from auth import (
    get_current_active_user,
    get_password_hash,
    require_role,
)
from database import get_db
from models import (
    Attendance,
    Equipment,
    EquipmentStatus,
    Member,
    MembershipPlan,
    MembershipStatus,
    Payment,
    PaymentStatus,
    Trainer,
    User,
    UserRole,
    WorkoutPlan,
)
from schemas import (
    AdminCreateUserRequest,
    AdminUserUpdate,
    DashboardStats,
    PasswordResetRequest,
    UserResponse,
)

admin_router = APIRouter(
    dependencies=[Depends(require_role(UserRole.ADMIN))],
)


async def compute_dashboard_stats(db: AsyncSession) -> DashboardStats:
    total_members = await db.scalar(select(func.count(Member.id)))
    active_members = await db.scalar(
        select(func.count(Member.id)).where(Member.membership_status == MembershipStatus.ACTIVE)
    )
    total_trainers = await db.scalar(select(func.count(Trainer.id)).where(Trainer.is_active == True))
    active_plans = await db.scalar(
        select(func.count(MembershipPlan.id)).where(MembershipPlan.is_active == True)
    )
    total_revenue = await db.scalar(
        select(func.sum(Payment.amount)).where(Payment.status == PaymentStatus.PAID)
    ) or 0
    pending_payments = await db.scalar(
        select(func.count(Payment.id)).where(Payment.status == PaymentStatus.PENDING)
    )
    today = date.today()
    today_attendance = await db.scalar(select(func.count(Attendance.id)).where(Attendance.date == today))
    equipment_under_maintenance = await db.scalar(
        select(func.count(Equipment.id)).where(Equipment.status == EquipmentStatus.MAINTENANCE)
    )

    return DashboardStats(
        total_members=total_members or 0,
        active_members=active_members or 0,
        total_trainers=total_trainers or 0,
        active_plans=active_plans or 0,
        total_revenue=float(total_revenue or 0),
        pending_payments=pending_payments or 0,
        today_attendance=today_attendance or 0,
        equipment_under_maintenance=equipment_under_maintenance or 0,
    )


@admin_router.get("/dashboard/stats", response_model=DashboardStats)
async def get_admin_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    return await compute_dashboard_stats(db)


@admin_router.get("/users", response_model=List[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    query = select(User)
    if role:
        query = query.where(User.role == role)
    if search:
        query = query.where(
            or_(
                User.full_name.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%"),
            )
        )
    query = query.offset(skip).limit(limit).order_by(User.id.desc())
    result = await db.execute(query)
    return result.scalars().all()


@admin_router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: AdminCreateUserRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Admin-provisioned account creation (admin flow).

    - role=admin: creates a second admin/gym-staff login here.
    - role=member/trainer: rejected with guidance to use POST /members
      or POST /trainers so the profile row is created together with
      the login. The admin then shares that email + password.
    """
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    if user_data.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=400,
            detail=f"Use POST /members for member accounts and POST /trainers for trainer accounts (got role={user_data.role.value}). This endpoint creates admin accounts only.",
        )

    user = User(
        email=user_data.email,
        hashed_password=get_password_hash(user_data.password),
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=UserRole.ADMIN,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@admin_router.get("/users/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@admin_router.put("/users/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_update: AdminUserUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user_update.role == UserRole.MEMBER and user.role == UserRole.ADMIN:
        admin_count = await db.scalar(select(func.count(User.id)).where(User.role == UserRole.ADMIN))
        if admin_count is not None and admin_count <= 1:
            raise HTTPException(status_code=400, detail="Cannot demote the last admin")

    for field, value in user_update.model_dump(exclude_unset=True).items():
        setattr(user, field, value)

    await db.commit()
    await db.refresh(user)
    return user


@admin_router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")

    # Remove profile rows with Core deletes so database-level
    # ON DELETE CASCADE rules clean up dependent records.
    member_result = await db.execute(select(Member.id).where(Member.user_id == user.id))
    member_id = member_result.scalar_one_or_none()
    if member_id is not None:
        await db.execute(sa_delete(WorkoutPlan).where(WorkoutPlan.member_id == member_id))
        await db.execute(sa_delete(Member).where(Member.id == member_id))
    await db.execute(sa_delete(Trainer).where(Trainer.user_id == user.id))
    await db.execute(sa_delete(User).where(User.id == user.id))
    await db.commit()


@admin_router.post("/users/{user_id}/reset-password", response_model=UserResponse)
async def admin_reset_password(
    user_id: int,
    payload: PasswordResetRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
):
    """Set a new password for any user (admin operation)."""
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.hashed_password = get_password_hash(payload.new_password)
    await db.commit()
    await db.refresh(user)
    return user
