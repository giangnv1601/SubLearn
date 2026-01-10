import { lazy, Suspense } from "react"
import { Routes, Route, Navigate, Outlet } from "react-router"

// Loading component
const PageLoading = () => (
  <div className="min-h-screen bg-[#2E4863] flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-10 h-10 border-4 border-[#E4D161] border-t-transparent rounded-full animate-spin" />
      <span className="text-white/70 text-sm">Đang tải...</span>
    </div>
  </div>
)

// Layout - không lazy load vì dùng chung
import AuthLayout from "@/components/TaskBars/AuthLayout"

// Lazy load Auth pages
const RegisterPage = lazy(() => import("@/pages/Auth/RegisterPage"))
const LoginPage = lazy(() => import("@/pages/Auth/LoginPage"))
const NotFound = lazy(() => import("@/pages/NotFound"))

// Lazy load Admin pages
const ManagerMoviePage = lazy(() => import("@/pages/Admin/ManageMoviePage/ManagerMoviePage"))
const ManagerExercisePage = lazy(() => import("@/pages/Admin/ManageExercisePage/ManagerExercisePage"))
const ManageUserPage = lazy(() => import("@/pages/Admin/ManageUserPage/ManageUsersPage"))
const QuizEditorPage = lazy(() => import("@/pages/Admin/QuizEditorPage/QuizEditorPage"))
const CreateQuizPage = lazy(() => import("@/pages/Admin/CreateQuizPage/CreateQuizPage"))

// Lazy load User pages
const HomePage = lazy(() => import("@/pages/User/HomePage/HomePage"))
const MoviePlayerPage = lazy(() => import("@/pages/User/MoviePlayerPage/MoviePlayerPage"))
const ExercisePage = lazy(() => import("@/pages/User/ExercisePage/ExercisePage"))
const ExamPage = lazy(() => import("@/pages/User/ExamPage/ExamPage"))
const ResultPage = lazy(() => import("@/pages/User/ResultPage/ResultPage"))
const VideoPlayerPage = lazy(() => import("@/pages/User/VideoPlayerPage/VideoPlayerPage"))

// Lazy load Shared pages
const ProfilePage = lazy(() => import("@/pages/Shared/ProfilePage"))
const EditProfilePage = lazy(() => import("@/pages/Shared/EditProfilePage"))
const ChangePasswoedPage = lazy(() => import("@/pages/Shared/ChangePasswoedPage"))

const ProtectedRoute = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if (!user) return <Navigate to="/login" replace={true} />
  return <Outlet />
}

const UnauthenticatedRoute = () => {
  const user = JSON.parse(localStorage.getItem('userInfo'))
  if (user) return <Navigate to="/" replace={true} />
  return <Outlet />
}

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        {/* Public Routes (Accessible without login) */}
        <Route element={<UnauthenticatedRoute />}>
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
        </Route>

        {/* Protected Routes (Accessible only after login) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AuthLayout />}>
            {/* ----SHARE---- */}
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit/:id" element={<EditProfilePage />} />
            <Route path="/profile/change-password/:id" element={<ChangePasswoedPage />} />
            
            {/* ----CLIENT---- */}
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:id" element={<MoviePlayerPage />} />
            <Route path="/client/exercises" element={<ExercisePage />} />
            <Route path="/client/exam" element={<ExamPage />} />
            <Route path="/client/results" element={<ResultPage />} />
            <Route path="/client/video" element={<VideoPlayerPage />} />

            {/* ----ADMIN---- */}
            <Route path="/admin/users" element={<ManageUserPage />} />
            <Route path="/admin/movie" element={<ManagerMoviePage />} />
            <Route path="/admin/exercise" element={<ManagerExercisePage />} />
            <Route path="/admin/exercise/:movieId/:type/edit" element={<QuizEditorPage />} />
            <Route path="/admin/exercise/create" element={<CreateQuizPage />} />
          </Route>  
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}

export default App
