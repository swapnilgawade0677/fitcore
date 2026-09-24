from contextlib import asynccontextmanager
from decimal import Decimal
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import select

from config import settings
from database import init_db, async_session_maker
from models import User, UserRole, Member, MembershipPlan, MembershipStatus
from auth import get_password_hash
from routers import router as api_router
from admin_routers import admin_router


async def seed_demo_data():
    """Idempotently seed demo login accounts shown on the login screen."""
    async with async_session_maker() as db:
        result = await db.execute(
            select(MembershipPlan).where(MembershipPlan.name == "Monthly Basic")
        )
        plan = result.scalar_one_or_none()
        if not plan:
            plan = MembershipPlan(
                name="Monthly Basic",
                description="Standard monthly gym access",
                duration_days=30,
                price=Decimal("49.99"),
                features="Gym floor access, Locker room",
                is_active=True,
            )
            db.add(plan)
            await db.flush()

        result = await db.execute(select(User).where(User.email == "admin@gym.com"))
        if not result.scalar_one_or_none():
            db.add(User(
                email="admin@gym.com",
                hashed_password=get_password_hash("admin123"),
                full_name="Gym Admin",
                role=UserRole.ADMIN,
                is_active=True,
            ))

        result = await db.execute(select(User).where(User.email == "member@gym.com"))
        member_user = result.scalar_one_or_none()
        if not member_user:
            member_user = User(
                email="member@gym.com",
                hashed_password=get_password_hash("member123"),
                full_name="Demo Member",
                role=UserRole.MEMBER,
                is_active=True,
            )
            db.add(member_user)
            await db.flush()
            db.add(Member(
                user_id=member_user.id,
                membership_number="DEMO001",
                membership_plan_id=plan.id,
                membership_status=MembershipStatus.ACTIVE,
            ))

        await db.commit()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    await seed_demo_data()
    yield


app = FastAPI(
    title=settings.app_name,
    description="FitCore API",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173", "https://fitcore-q17x.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)
app.include_router(admin_router, prefix=f"{settings.api_v1_prefix}/admin")


@app.get("/")
async def root():
    return {"message": "Welcome to FitCore API", "version": "1.0.0"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
