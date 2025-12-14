import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, UserPlus } from 'lucide-react'
import { toast } from 'sonner'
import { useForm } from 'react-hook-form'
import { registerUserApi } from '../../api'

function RegisterPage() {
  const navigate = useNavigate()
  const emailRef = useRef(null)
  const fullnameRef = useRef(null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const { register,
    handleSubmit,
    getValues,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onTouched',
    defaultValues: {
      fullname: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  })

  const onSubmit = async (values) => {
    try {
      const payload = {
        fullname: (values.fullname || '').trim(),
        email: (values.email || '').trim().toLowerCase(),
        password: values.password
      }

      const data = await registerUserApi(payload)

      toast.success('Registration successful! Please log in.')
      navigate('/login', { replace: true })
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message
      if (msg === 'Email already exists') {
        setError('email', { type: 'server', message: msg })
        emailRef.current?.focus()
      } else {
        toast.error(msg)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#2E4863] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/sublearn.png" alt="SubLearn" className="h-12 w-auto" />
            <h1 className="text-[#E4D161] text-2xl font-bold">SubLearn</h1>
          </div>
          <h2 className="text-white text-3xl font-semibold">Create Account</h2>
        </div>

        {/* Register Form */}
        <div className="bg-[#1B2A36] rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Full name */}
            <div>
              <label htmlFor="fullname" className="block text-sm font-medium text-gray-300 mb-2">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="fullname"
                  ref={fullnameRef}
                  type="text"
                  placeholder="Enter your full name"
                  autoComplete="name"
                  className={`w-full pl-10 pr-4 py-3 bg-[#14202A] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent ${
                    errors.fullname ? 'border-red-500' : 'border-gray-600'
                  }`}
                  {...register('fullname', {
                    required: 'Full name is required',
                    minLength: { value: 3, message: 'Full name must be at least 3 characters' }
                  })}
                />
              </div>
              {errors.fullname && <p className="mt-1 text-sm text-red-400">{errors.fullname.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
                  ref={emailRef}
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 bg-[#14202A] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent ${
                    errors.email ? 'border-red-500' : 'border-gray-600'
                  }`}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Please enter a valid email'
                    }
                  })}
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 bg-[#14202A] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' },
                    validate: (v) =>
                      /[a-z]/.test(v) && /[A-Z]/.test(v) && /\d/.test(v)
                        ? true
                        : 'Password must contain lowercase, uppercase and a number'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password.message}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-12 py-3 bg-[#14202A] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-600'
                  }`}
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (v) =>
                      v === getValues('password') || 'Passwords do not match'
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-400">{errors.confirmPassword.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#E4D161] text-black py-3 px-4 rounded-lg font-semibold hover:bg-[#E4D161]/90 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:ring-offset-2 focus:ring-offset-[#1B2A36] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  Create Account
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-[#E4D161] hover:text-[#E4D161]/80 font-semibold transition-colors"
              >
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage