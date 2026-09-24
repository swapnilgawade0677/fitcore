import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAppDispatch, useAppSelector } from '../hooks/useRedux';
import { login } from '../store/authSlice';
import toast from 'react-hot-toast';
import { Dumbbell, Eye, EyeOff, Loader2 } from 'lucide-react';
import { cn } from '../utils/helpers';

interface LoginForm {
  email: string;
  password: string;
}

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((state) => state.auth);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await dispatch(login(data)).unwrap();
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error || 'Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="login-animate text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary-500 mb-4 shadow-[0_0_40px_-8px_rgba(255,210,31,0.5)]">
            <Dumbbell className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-3xl font-bold text-dark-900">Fit<span className="text-primary-600">Core</span></h1>
          <p className="text-dark-500 mt-1">Sign in to your account</p>
        </div>

        {/* Login Form */}
        <div className="login-animate bg-dark-100 rounded-2xl shadow-xl border border-dark-200 p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="label">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address',
                  },
                })}
                className={cn('input mt-1', errors.email && 'input-error')}
                placeholder="you@example.com"
                disabled={isLoading}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
            </div>

            <div>
              <label htmlFor="password" className="label">Password</label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Password must be at least 8 characters' },
                  })}
                  className={cn('input pr-12', errors.password && 'input-error')}
                  placeholder="••••••••"
                  disabled={isLoading}
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

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-dark-300 text-primary-600 focus:ring-primary-500" />
                <span className="text-sm text-dark-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">Forgot password?</a>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-3"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-dark-600">
              Don't have an account?{' '}
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium" onClick={(e) => { e.preventDefault(); navigate('/register'); }}>
                Sign up
              </a>
            </p>
            <p className="mt-2">
              <a href="#" className="text-sm text-dark-500 hover:text-primary-600" onClick={(e) => { e.preventDefault(); navigate('/admin/login'); }}>
                Administrator? Admin sign in
              </a>
            </p>
          </div>
        </div>

        {/* Demo credentials - click to autofill */}
        <div className="login-animate mt-6 p-4 bg-dark-100/60 rounded-xl border border-dark-200">
          <p className="text-xs text-dark-500 text-center mb-2">Demo Credentials (click to fill)</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button type="button" onClick={() => { setValue('email', 'admin@gym.com'); setValue('password', 'admin123'); }} className="p-2 bg-dark-50 rounded text-left hover:border-primary-500 border border-transparent transition-colors cursor-pointer">
              <p className="font-medium text-dark-700">Admin</p>
              <p className="text-dark-600">admin@gym.com / admin123</p>
            </button>
            <button type="button" onClick={() => { setValue('email', 'member@gym.com'); setValue('password', 'member123'); }} className="p-2 bg-dark-50 rounded text-left hover:border-primary-500 border border-transparent transition-colors cursor-pointer">
              <p className="font-medium text-dark-700">Member</p>
              <p className="text-dark-600">member@gym.com / member123</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}