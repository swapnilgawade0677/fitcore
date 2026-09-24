from datetime import datetime, date
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_
from sqlalchemy.orm import selectinload

from database import get_db
from models import User, Member, Trainer, MembershipPlan, Attendance, Payment, Equipment, WorkoutPlan, Exercise, Inquiry, Feedback
from models import UserRole, MembershipStatus, PaymentStatus, EquipmentStatus
from schemas import (
    UserCreate, UserUpdate, UserResponse,
    MemberCreate, MemberUpdate, MemberResponse,
    TrainerCreate, TrainerUpdate, TrainerResponse,
    MembershipPlanCreate, MembershipPlanUpdate, MembershipPlanResponse,
    AttendanceCreate, AttendanceResponse,
    PaymentCreate, PaymentUpdate, PaymentResponse,
    EquipmentCreate, EquipmentUpdate, EquipmentResponse,
    WorkoutPlanCreate, WorkoutPlanUpdate, WorkoutPlanResponse,
    ExerciseCreate, ExerciseResponse,
    InquiryCreate, InquiryUpdate, InquiryResponse,
    FeedbackCreate, FeedbackResponse,
    Token, LoginRequest, DashboardStats
)
from auth import (
    get_password_hash, create_access_token, get_current_active_user,
    require_role, verify_password
)

router = APIRouter()


@router.post("/auth/login", response_model=Token)
async def login(
    credentials: LoginRequest,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == credentials.email))
    user = result.scalar_one_or_none()
    if not user or not verify_password(credentials.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": user.email, "user_id": user.id, "role": user.role.value}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/auth/register", response_model=UserResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(User).where(User.email == user_data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = get_password_hash(user_data.password)
    user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        phone=user_data.phone,
        role=user_data.role
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


@router.get("/auth/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user


@router.put("/auth/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: AsyncSession = Depends(get_db)
):
    if user_update.email and user_update.email != current_user.email:
        result = await db.execute(select(User).where(User.email == user_update.email))
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = user_update.email
    if user_update.full_name:
        current_user.full_name = user_update.full_name
    if user_update.phone is not None:
        current_user.phone = user_update.phone
    if user_update.is_active is not None:
        current_user.is_active = user_update.is_active

    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post("/members", response_model=MemberResponse, status_code=status.HTTP_201_CREATED)
async def create_member(
    member_data: MemberCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(User).where(User.email == member_data.user.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    result = await db.execute(select(Member).where(Member.membership_number == member_data.membership_number))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Membership number already exists")

    hashed_password = get_password_hash(member_data.user.password)
    user = User(
        email=member_data.user.email,
        hashed_password=hashed_password,
        full_name=member_data.user.full_name,
        phone=member_data.user.phone,
        role=UserRole.MEMBER
    )
    db.add(user)
    await db.flush()

    member = Member(
        user_id=user.id,
        membership_number=member_data.membership_number,
        date_of_birth=member_data.date_of_birth,
        address=member_data.address,
        emergency_contact=member_data.emergency_contact,
        emergency_contact_name=member_data.emergency_contact_name,
        height=member_data.height,
        weight=member_data.weight,
        fitness_goals=member_data.fitness_goals,
        medical_conditions=member_data.medical_conditions,
        membership_plan_id=member_data.membership_plan_id,
        trainer_id=member_data.trainer_id
    )
    db.add(member)
    await db.commit()
    result = await db.execute(
        select(Member).options(selectinload(Member.user)).where(Member.id == member.id)
    )
    return result.scalar_one()


@router.get("/members", response_model=List[MemberResponse])
async def list_members(
    skip: int = 0,
    limit: int = 100,
    status: Optional[MembershipStatus] = None,
    search: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.TRAINER))
):
    query = select(Member).options(selectinload(Member.user))
    if status:
        query = query.where(Member.membership_status == status)
    if search:
        query = query.join(User).where(
            or_(
                User.full_name.ilike(f"%{search}%"),
                Member.membership_number.ilike(f"%{search}%"),
                User.email.ilike(f"%{search}%")
            )
        )
    query = query.offset(skip).limit(limit).order_by(Member.id.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/members/{member_id}", response_model=MemberResponse)
async def get_member(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Member).options(selectinload(Member.user)).where(Member.id == member_id)
    )
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    if current_user.role == UserRole.MEMBER and member.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return member


@router.put("/members/{member_id}", response_model=MemberResponse)
async def update_member(
    member_id: int,
    member_update: MemberUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    for field, value in member_update.model_dump(exclude_unset=True).items():
        setattr(member, field, value)

    await db.commit()
    result = await db.execute(
        select(Member).options(selectinload(Member.user)).where(Member.id == member.id)
    )
    return result.scalar_one()


@router.delete("/members/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_member(
    member_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(Member).where(Member.id == member_id))
    member = result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    await db.delete(member)
    await db.commit()


@router.post("/trainers", response_model=TrainerResponse, status_code=status.HTTP_201_CREATED)
async def create_trainer(
    trainer_data: TrainerCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(User).where(User.email == trainer_data.user.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    result = await db.execute(select(Trainer).where(Trainer.employee_id == trainer_data.employee_id))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Employee ID already exists")

    hashed_password = get_password_hash(trainer_data.user.password)
    user = User(
        email=trainer_data.user.email,
        hashed_password=hashed_password,
        full_name=trainer_data.user.full_name,
        phone=trainer_data.user.phone,
        role=UserRole.TRAINER
    )
    db.add(user)
    await db.flush()

    trainer = Trainer(
        user_id=user.id,
        employee_id=trainer_data.employee_id,
        specialization=trainer_data.specialization,
        experience_years=trainer_data.experience_years,
        certification=trainer_data.certification,
        hourly_rate=trainer_data.hourly_rate
    )
    db.add(trainer)
    await db.commit()
    result = await db.execute(
        select(Trainer).options(selectinload(Trainer.user)).where(Trainer.id == trainer.id)
    )
    return result.scalar_one()


@router.get("/trainers", response_model=List[TrainerResponse])
async def list_trainers(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(
        select(Trainer).options(selectinload(Trainer.user))
        .offset(skip).limit(limit).order_by(Trainer.id.desc())
    )
    return result.scalars().all()


@router.get("/trainers/{trainer_id}", response_model=TrainerResponse)
async def get_trainer(
    trainer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(Trainer).options(selectinload(Trainer.user)).where(Trainer.id == trainer_id)
    )
    trainer = result.scalar_one_or_none()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")
    return trainer


@router.put("/trainers/{trainer_id}", response_model=TrainerResponse)
async def update_trainer(
    trainer_id: int,
    trainer_update: TrainerUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(Trainer).where(Trainer.id == trainer_id))
    trainer = result.scalar_one_or_none()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    for field, value in trainer_update.model_dump(exclude_unset=True).items():
        setattr(trainer, field, value)

    await db.commit()
    result = await db.execute(
        select(Trainer).options(selectinload(Trainer.user)).where(Trainer.id == trainer.id)
    )
    return result.scalar_one()


@router.delete("/trainers/{trainer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_trainer(
    trainer_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(Trainer).where(Trainer.id == trainer_id))
    trainer = result.scalar_one_or_none()
    if not trainer:
        raise HTTPException(status_code=404, detail="Trainer not found")

    await db.delete(trainer)
    await db.commit()


@router.post("/plans", response_model=MembershipPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_plan(
    plan_data: MembershipPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    plan = MembershipPlan(**plan_data.model_dump())
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return plan


@router.get("/plans", response_model=List[MembershipPlanResponse])
async def list_plans(
    skip: int = 0,
    limit: int = 100,
    active_only: bool = True,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(MembershipPlan)
    if active_only:
        query = query.where(MembershipPlan.is_active == True)
    query = query.offset(skip).limit(limit).order_by(MembershipPlan.id.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/plans/{plan_id}", response_model=MembershipPlanResponse)
async def get_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(MembershipPlan).where(MembershipPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


@router.put("/plans/{plan_id}", response_model=MembershipPlanResponse)
async def update_plan(
    plan_id: int,
    plan_update: MembershipPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(MembershipPlan).where(MembershipPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    for field, value in plan_update.model_dump(exclude_unset=True).items():
        setattr(plan, field, value)

    await db.commit()
    await db.refresh(plan)
    return plan


@router.delete("/plans/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(MembershipPlan).where(MembershipPlan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    await db.delete(plan)
    await db.commit()


@router.post("/attendance", response_model=AttendanceResponse, status_code=status.HTTP_201_CREATED)
async def mark_attendance(
    attendance_data: AttendanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role == UserRole.MEMBER:
        result = await db.execute(select(Member).where(Member.user_id == current_user.id))
        member = result.scalar_one_or_none()
        if not member:
            raise HTTPException(status_code=404, detail="Member profile not found")
        attendance_data.member_id = member.id

    today = date.today()
    result = await db.execute(
        select(Attendance).where(
            and_(Attendance.member_id == attendance_data.member_id, Attendance.date == today)
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked for today")

    attendance = Attendance(**attendance_data.model_dump())
    db.add(attendance)
    await db.commit()
    await db.refresh(attendance)
    return attendance


@router.get("/attendance", response_model=List[AttendanceResponse])
async def list_attendance(
    member_id: Optional[int] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Attendance)
    if member_id:
        if current_user.role == UserRole.MEMBER:
            member_result = await db.execute(select(Member).where(Member.user_id == current_user.id))
            member = member_result.scalar_one_or_none()
            if not member or member.id != member_id:
                raise HTTPException(status_code=403, detail="Not authorized")
        query = query.where(Attendance.member_id == member_id)
    elif current_user.role == UserRole.MEMBER:
        member_result = await db.execute(select(Member).where(Member.user_id == current_user.id))
        member = member_result.scalar_one_or_none()
        if member:
            query = query.where(Attendance.member_id == member.id)

    if start_date:
        query = query.where(Attendance.date >= start_date)
    if end_date:
        query = query.where(Attendance.date <= end_date)

    query = query.order_by(Attendance.check_in_time.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("/payments", response_model=PaymentResponse, status_code=status.HTTP_201_CREATED)
async def create_payment(
    payment_data: PaymentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    payment = Payment(**payment_data.model_dump())
    db.add(payment)
    await db.commit()
    await db.refresh(payment)
    return payment


@router.get("/payments", response_model=List[PaymentResponse])
async def list_payments(
    member_id: Optional[int] = None,
    status: Optional[PaymentStatus] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Payment)
    if member_id:
        if current_user.role == UserRole.MEMBER:
            member_result = await db.execute(select(Member).where(Member.user_id == current_user.id))
            member = member_result.scalar_one_or_none()
            if not member or member.id != member_id:
                raise HTTPException(status_code=403, detail="Not authorized")
        query = query.where(Payment.member_id == member_id)
    elif current_user.role == UserRole.MEMBER:
        member_result = await db.execute(select(Member).where(Member.user_id == current_user.id))
        member = member_result.scalar_one_or_none()
        if member:
            query = query.where(Payment.member_id == member.id)

    if status:
        query = query.where(Payment.status == status)

    query = query.order_by(Payment.payment_date.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/payments/{payment_id}", response_model=PaymentResponse)
async def update_payment(
    payment_id: int,
    payment_update: PaymentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(Payment).where(Payment.id == payment_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    for field, value in payment_update.model_dump(exclude_unset=True).items():
        setattr(payment, field, value)

    await db.commit()
    await db.refresh(payment)
    return payment


@router.post("/equipment", response_model=EquipmentResponse, status_code=status.HTTP_201_CREATED)
async def create_equipment(
    equipment_data: EquipmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    if equipment_data.serial_number:
        result = await db.execute(
            select(Equipment).where(Equipment.serial_number == equipment_data.serial_number)
        )
        if result.scalar_one_or_none():
            raise HTTPException(status_code=400, detail="Serial number already exists")

    equipment = Equipment(**equipment_data.model_dump())
    db.add(equipment)
    await db.commit()
    await db.refresh(equipment)
    return equipment


@router.get("/equipment", response_model=List[EquipmentResponse])
async def list_equipment(
    status: Optional[EquipmentStatus] = None,
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Equipment)
    if status:
        query = query.where(Equipment.status == status)
    if category:
        query = query.where(Equipment.category == category)
    query = query.offset(skip).limit(limit).order_by(Equipment.id.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/equipment/{equipment_id}", response_model=EquipmentResponse)
async def get_equipment(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")
    return equipment


@router.put("/equipment/{equipment_id}", response_model=EquipmentResponse)
async def update_equipment(
    equipment_id: int,
    equipment_update: EquipmentUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    for field, value in equipment_update.model_dump(exclude_unset=True).items():
        setattr(equipment, field, value)

    await db.commit()
    await db.refresh(equipment)
    return equipment


@router.delete("/equipment/{equipment_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipment(
    equipment_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(Equipment).where(Equipment.id == equipment_id))
    equipment = result.scalar_one_or_none()
    if not equipment:
        raise HTTPException(status_code=404, detail="Equipment not found")

    await db.delete(equipment)
    await db.commit()


@router.post("/workouts", response_model=WorkoutPlanResponse, status_code=status.HTTP_201_CREATED)
async def create_workout(
    workout_data: WorkoutPlanCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.TRAINER))
):
    trainer_id = workout_data.trainer_id
    if trainer_id is None and current_user.role == UserRole.TRAINER:
        trainer_result = await db.execute(select(Trainer).where(Trainer.user_id == current_user.id))
        trainer = trainer_result.scalar_one_or_none()
        trainer_id = trainer.id if trainer else None

    member_result = await db.execute(select(Member).where(Member.id == workout_data.member_id))
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Member not found")

    if trainer_id is not None:
        trainer_result = await db.execute(select(Trainer).where(Trainer.id == trainer_id))
        if not trainer_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Trainer not found")

    workout = WorkoutPlan(
        member_id=workout_data.member_id,
        trainer_id=trainer_id,
        name=workout_data.name,
        description=workout_data.description,
        start_date=workout_data.start_date,
        end_date=workout_data.end_date
    )
    db.add(workout)
    await db.flush()

    for i, ex_data in enumerate(workout_data.exercises):
        ex_dict = ex_data.model_dump()
        ex_dict.pop("order", None)
        exercise = Exercise(**ex_dict, workout_plan_id=workout.id, order=i)
        db.add(exercise)

    await db.commit()
    result = await db.execute(
        select(WorkoutPlan).options(selectinload(WorkoutPlan.exercises)).where(WorkoutPlan.id == workout.id)
    )
    return result.scalar_one()


@router.put("/workouts/{workout_id}", response_model=WorkoutPlanResponse)
async def update_workout(
    workout_id: int,
    workout_update: WorkoutPlanUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.TRAINER))
):
    result = await db.execute(
        select(WorkoutPlan).options(selectinload(WorkoutPlan.exercises)).where(WorkoutPlan.id == workout_id)
    )
    workout = result.scalar_one_or_none()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    data = workout_update.model_dump(exclude_unset=True)
    exercises = data.pop("exercises", None)
    for field, value in data.items():
        setattr(workout, field, value)

    if exercises is not None:
        for existing in list(workout.exercises):
            await db.delete(existing)
        for i, ex_data in enumerate(workout_update.exercises or []):
            ex_dict = ex_data.model_dump()
            ex_dict.pop("order", None)
            db.add(Exercise(**ex_dict, workout_plan_id=workout.id, order=i))

    await db.commit()
    result = await db.execute(
        select(WorkoutPlan).options(selectinload(WorkoutPlan.exercises)).where(WorkoutPlan.id == workout.id)
    )
    return result.scalar_one()


@router.delete("/workouts/{workout_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_workout(
    workout_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN, UserRole.TRAINER))
):
    result = await db.execute(select(WorkoutPlan).where(WorkoutPlan.id == workout_id))
    workout = result.scalar_one_or_none()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout plan not found")

    await db.delete(workout)
    await db.commit()


@router.get("/workouts", response_model=List[WorkoutPlanResponse])
async def list_workouts(
    member_id: Optional[int] = None,
    trainer_id: Optional[int] = None,
    active_only: bool = True,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(WorkoutPlan).options(selectinload(WorkoutPlan.exercises))
    if member_id:
        if current_user.role == UserRole.MEMBER:
            member_result = await db.execute(select(Member).where(Member.user_id == current_user.id))
            member = member_result.scalar_one_or_none()
            if not member or member.id != member_id:
                raise HTTPException(status_code=403, detail="Not authorized")
        query = query.where(WorkoutPlan.member_id == member_id)
    elif current_user.role == UserRole.MEMBER:
        member_result = await db.execute(select(Member).where(Member.user_id == current_user.id))
        member = member_result.scalar_one_or_none()
        if member:
            query = query.where(WorkoutPlan.member_id == member.id)
    elif current_user.role == UserRole.TRAINER:
        trainer_result = await db.execute(select(Trainer).where(Trainer.user_id == current_user.id))
        trainer = trainer_result.scalar_one_or_none()
        if trainer:
            query = query.where(WorkoutPlan.trainer_id == trainer.id)

    if active_only:
        query = query.where(WorkoutPlan.is_active == True)

    query = query.offset(skip).limit(limit).order_by(WorkoutPlan.id.desc())
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/workouts/{workout_id}", response_model=WorkoutPlanResponse)
async def get_workout(
    workout_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = await db.execute(
        select(WorkoutPlan).options(selectinload(WorkoutPlan.exercises)).where(WorkoutPlan.id == workout_id)
    )
    workout = result.scalar_one_or_none()
    if not workout:
        raise HTTPException(status_code=404, detail="Workout plan not found")
    return workout


@router.post("/inquiries", response_model=InquiryResponse, status_code=status.HTTP_201_CREATED)
async def create_inquiry(
    inquiry_data: InquiryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role != UserRole.MEMBER:
        raise HTTPException(status_code=403, detail="Only members can submit inquiries")

    member_result = await db.execute(select(Member).where(Member.user_id == current_user.id))
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member profile not found")

    inquiry = Inquiry(member_id=member.id, **inquiry_data.model_dump())
    db.add(inquiry)
    await db.commit()
    await db.refresh(inquiry)
    return inquiry


@router.get("/inquiries", response_model=List[InquiryResponse])
async def list_inquiries(
    status: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = select(Inquiry)
    if current_user.role == UserRole.MEMBER:
        member_result = await db.execute(select(Member).where(Member.user_id == current_user.id))
        member = member_result.scalar_one_or_none()
        if member:
            query = query.where(Inquiry.member_id == member.id)
    if status:
        query = query.where(Inquiry.status == status)
    query = query.order_by(Inquiry.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.put("/inquiries/{inquiry_id}", response_model=InquiryResponse)
async def update_inquiry(
    inquiry_id: int,
    inquiry_update: InquiryUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    result = await db.execute(select(Inquiry).where(Inquiry.id == inquiry_id))
    inquiry = result.scalar_one_or_none()
    if not inquiry:
        raise HTTPException(status_code=404, detail="Inquiry not found")

    for field, value in inquiry_update.model_dump(exclude_unset=True).items():
        setattr(inquiry, field, value)

    if inquiry_update.status and inquiry_update.status != "open":
        inquiry.responded_at = datetime.utcnow()

    await db.commit()
    await db.refresh(inquiry)
    return inquiry


@router.post("/feedbacks", response_model=FeedbackResponse, status_code=status.HTTP_201_CREATED)
async def create_feedback(
    feedback_data: FeedbackCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role != UserRole.MEMBER:
        raise HTTPException(status_code=403, detail="Only members can submit feedback")

    member_result = await db.execute(select(Member).where(Member.user_id == current_user.id))
    member = member_result.scalar_one_or_none()
    if not member:
        raise HTTPException(status_code=404, detail="Member profile not found")

    feedback = Feedback(member_id=member.id, **feedback_data.model_dump())
    db.add(feedback)
    await db.commit()
    await db.refresh(feedback)
    return feedback


@router.get("/feedbacks", response_model=List[FeedbackResponse])
async def list_feedbacks(
    category: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    query = select(Feedback)
    if category:
        query = query.where(Feedback.category == category)
    query = query.order_by(Feedback.created_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(UserRole.ADMIN))
):
    from admin_routers import compute_dashboard_stats
    return await compute_dashboard_stats(db)