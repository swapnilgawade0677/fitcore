import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch } from '../hooks/useRedux';
import { login, registerGym } from '../store/authSlice';
import toast from 'react-hot-toast';
import { Dumbbell, Eye, EyeOff, Loader2, User, Mail, Lock, Phone } from 'lucide-react';
import { cn } from '../utils/helpers';

interface GymRegisterForm {
  full_name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<GymRegisterForm>();
  const password = watch('password');

  const onSubmit = async (data: GymRegisterForm) => {
    try {
      await dispatch(registerGym({
        email: data.email,
        password: data.password,
        full_name: data.full_name,
        phone: data.phone || undefined,
      })).unwrap();
      await dispatch(login({ email: data.email, password: data.password })).unwrap();
      toast.success('Gym account created! Now add members & trainers and share their login with them.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error || 'Gym registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="register-animate text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 mb-4 shadow-[0_0_40px_-8px_rgba(255,210,31,0.5)]">
            <Dumbbell className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-dark-900">Fit<span className="text-primary-600">Core</span></h1>
          <p className="text-dark-500 mt-1">Create your gym (admin) account</p>
        </div>

        <div className="register-animate mb-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-xl text-sm text-dark-700">
          <p className="font-medium">How it works</p>
          <ol className="list-decimal ml-5 mt-1 space-y-1 text-dark-600">
            <li>You create the gym admin account here.</li>
            <li>You add members/trainers from the dashboard with their email + password.</li>
            <li>Share those credentials with them — they sign in, no self-registration.</li>
          </ol>
        </div>

        {/* Register Form */}
        <div className="register-animate bg-dark-100 rounded-2xl shadow-xl border border-dark-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label htmlFor="full_name" className="label">Full Name</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-dark-400" />
                </div>
                <input
                  id="full_name"
                  type="text"
                  autoComplete="name"
                  {...register('full_name', { required: 'Full name is required', minLength: { value: 2, message: 'Name must be at least 2 characters' } })}
                  className={cn('input pl-10', errors.full_name && 'input-error')}
                  placeholder="Gym Owner"
                />
              </div>
              {errors.full_name && <p className="mt-1 text-sm text-red-600">{errors.full_name.message}</p>}
            </div>

            <div>
              <label htmlFor="email" className="label">Gym Admin Email</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-dark-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email address' },
                  })}
                  className={cn('input pl-10', errors.email && 'input-error')}
                  placeholder="owner@mygym.com"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="label">Phone (Optional)</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="w-5 h-5 text-dark-400" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  {...register('phone')}
                  className="input pl-10"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-dark-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                  className={cn('input pl-10 pr-12', errors.password && 'input-error')}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-400 hover:text-dark-600"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="label">Confirm Password</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-dark-400" />
                </div>
                <input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) => value === password || 'Passwords do not match',
                  })}
                  className={cn('input pl-10', errors.confirmPassword && 'input-error')}
                  placeholder="••••••••"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message as string}</p>}
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3"
            >
              <Loader2 className="w-5 h-5 animate-spin mr-2" style={{ display: 'none' }} />
              Create Gym Account
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-600">
              Already have a gym account?{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                Sign in
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
