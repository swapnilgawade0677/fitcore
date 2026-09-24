# FitCore - Gym Management System

A comprehensive gym management system built with modern technologies:

## Tech Stack

### Backend
- **FastAPI** - Modern, fast web framework for building APIs
- **PostgreSQL** - Robust relational database
- **SQLAlchemy 2.0** - Async ORM with asyncpg
- **Pydantic v2** - Data validation and serialization
- **JWT Authentication** - Secure token-based auth
- **Alembic** - Database migrations

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **GSAP** - Professional-grade animations
- **React Router v6** - Client-side routing
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Beautiful icons

## Project Structure

```
gym-management-system/
├── backend/                 # FastAPI backend
│   ├── main.py             # Application entry point
│   ├── config.py           # Configuration management
│   ├── database.py         # Database connection
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # Authentication utilities
│   ├── routers.py          # API routes
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Environment variables
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── store/          # Redux store & slices
│   │   ├── hooks/          # Custom hooks
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utility functions
│   │   ├── App.tsx         # Main app component
│   │   └── main.tsx        # Entry point
│   ├── package.json        # Dependencies
│   ├── vite.config.ts      # Vite configuration
│   ├── tailwind.config.js  # Tailwind configuration
│   └── tsconfig.json       # TypeScript configuration
├── docker-compose.yml      # Docker development setup
└── README.md              # This file
```

## Features

### Administrator Module
- **Dashboard** - Overview stats, charts, recent activity
- **Member Management** - CRUD operations, search, filtering
- **Trainer Management** - Trainer profiles, assignments
- **Membership Plans** - Plan creation, pricing, features
- **Attendance Tracking** - QR-based check-in/check-out
- **Payment Management** - Recording, tracking, status updates
- **Equipment Management** - Inventory, maintenance scheduling
- **Workout Plans** - Create and assign workout routines
- **Inquiries & Feedback** - Member communication

### Member Module
- **Personal Dashboard** - Membership status, upcoming sessions
- **Profile Management** - Update details, change password
- **Attendance** - Mark attendance, view history
- **Payments** - View payment history, pending amounts
- **Workout Plans** - View assigned workouts with exercises
- **Inquiries** - Submit and track inquiries
- **Feedback** - Rate and review gym services

## Getting Started

### Prerequisites
- Docker & Docker Compose (recommended)
- OR: Python 3.12+, Node.js 20+, PostgreSQL 16+

### Quick Start with Docker

```bash
# Clone the repository
cd gym-management-system

# Start all services
docker-compose up -d

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Manual Setup

#### Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
cp .env.example .env  # Edit with your settings

# Run the server
uvicorn main:app --reload
```

#### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Database Setup
The database tables will be created automatically on first run. For migrations:

```bash
cd backend
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## API Endpoints

### Authentication
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/register` - User registration
- `GET /api/v1/auth/me` - Get current user
- `PUT /api/v1/auth/me` - Update current user

### Members
- `GET /api/v1/members` - List members
- `POST /api/v1/members` - Create member
- `GET /api/v1/members/{id}` - Get member
- `PUT /api/v1/members/{id}` - Update member
- `DELETE /api/v1/members/{id}` - Delete member

### Trainers
- `GET /api/v1/trainers` - List trainers
- `POST /api/v1/trainers` - Create trainer
- `GET /api/v1/trainers/{id}` - Get trainer
- `PUT /api/v1/trainers/{id}` - Update trainer

### Membership Plans
- `GET /api/v1/plans` - List plans
- `POST /api/v1/plans` - Create plan
- `GET /api/v1/plans/{id}` - Get plan
- `PUT /api/v1/plans/{id}` - Update plan

### Attendance
- `POST /api/v1/attendance` - Mark attendance
- `GET /api/v1/attendance` - List attendance

### Payments
- `GET /api/v1/payments` - List payments
- `POST /api/v1/payments` - Record payment
- `PUT /api/v1/payments/{id}` - Update payment

### Equipment
- `GET /api/v1/equipment` - List equipment
- `POST /api/v1/equipment` - Add equipment
- `GET /api/v1/equipment/{id}` - Get equipment
- `PUT /api/v1/equipment/{id}` - Update equipment

### Workouts
- `GET /api/v1/workouts` - List workouts
- `POST /api/v1/workouts` - Create workout plan
- `GET /api/v1/workouts/{id}` - Get workout
- `PUT /api/v1/workouts/{id}` - Update workout

### Inquiries & Feedback
- `GET /api/v1/inquiries` - List inquiries
- `POST /api/v1/inquiries` - Create inquiry
- `PUT /api/v1/inquiries/{id}` - Update inquiry
- `GET /api/v1/feedbacks` - List feedbacks
- `POST /api/v1/feedbacks` - Create feedback

### Dashboard
- `GET /api/v1/dashboard/stats` - Get dashboard statistics

## Environment Variables

### Backend (.env)
```env
APP_NAME="Gym Management System"
DEBUG=True
API_V1_PREFIX="/api/v1"
DATABASE_URL="postgresql+asyncpg://postgres:postgres@localhost:5432/gym_db"
SECRET_KEY="your-secret-key-min-32-chars"
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:8000/api/v1
```

## Development

### Running Tests
```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

### Code Quality
```bash
# Backend linting
cd backend
ruff check .
black .

# Frontend linting
cd frontend
npm run lint
```

## Deployment

### Production Considerations
1. Change `SECRET_KEY` to a strong random value
2. Set `DEBUG=False`
3. Use a production PostgreSQL instance
4. Set up proper CORS origins
5. Use HTTPS with valid certificates
6. Configure proper logging
7. Set up database backups
8. Use environment-specific `.env` files

### Docker Production Build
```bash
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

## License

MIT License - feel free to use this project for learning or commercial purposes.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## Support

For issues and feature requests, please create an issue in the repository.