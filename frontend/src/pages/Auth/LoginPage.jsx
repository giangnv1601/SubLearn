import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { loginUserApi } from '../../api'
import { toast } from 'sonner'
import LogoSubLearn from '../../assets/sublearn.png'

function LoginPage() {
  const navigate = useNavigate()

  const [showPassword, setShowPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({
    mode: 'onSubmit',
    defaultValues: { email: '', password: '' }
  })

  const submitLogIn = async (data) => {
    try {
      const res = await loginUserApi(data)

      const userInfo = { 
        id: res.id, 
        email: res.email, 
        role: res.role 
      }

      localStorage.setItem('accessToken', res.accessToken)
      localStorage.setItem('refreshToken', res.refreshToken)
      localStorage.setItem('userInfo', JSON.stringify(userInfo))

      toast.success('Login successful!')
      if (userInfo.role === 'admin') {
        navigate('/admin/users')
        return
      }
      navigate('/')
    } catch (error) {
      const msg = error?.response?.data?.message
      setError('email', { type: 'server', message: msg })
      setError('password', { type: 'server', message: msg })
    }
  }

  return (
    <div className="min-h-screen bg-[#2E4863] flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src={LogoSubLearn} alt="SubLearn" className="h-12 w-auto" />
            <h1 className="text-[#E4D161] text-2xl font-bold">SubLearn</h1>
          </div>
          <h2 className="text-white text-3xl font-semibold">Sign in to your account</h2>
        </div>

        {/* Login Form */}
        <div className="bg-[#1B2A36] rounded-lg shadow-xl p-8">
          <form onSubmit={handleSubmit(submitLogIn)} className="space-y-6" noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  id="email"
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
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  className={`w-full pl-10 pr-12 py-3 bg-[#14202A] border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#E4D161] focus:border-transparent ${
                    errors.password ? 'border-red-500' : 'border-gray-600'
                  }`}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Password must be at least 6 characters' }
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
                  <LogIn className="w-5 h-5" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don&apos;t have an account?{' '}
              <Link
                to="/register"
                className="text-[#E4D161] hover:text-[#E4D161]/80 font-semibold transition-colors"
              >
                Sign up here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
