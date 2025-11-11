import { Routes, Route, Navigate, Outlet } from "react-router"

import NotFound from "./pages/NotFound"
import HomePage from "./pages/Shared/HomePage"
import MoviePlayerPage from "./pages/Shared/MoviePlayerPage"
import ManagerMovie from "./pages/Admin/ManagerMoviePage"
import ManagerExercisesPage from "./pages/Admin/ManagerExercisesPage"
import QuizEditorPage from "./pages/Admin/QuizEditorPage"
import CreateQuizTester from "./pages/Test"
import RegisterPage from "./pages/Auth/RegisterPage"
import LoginPage from "./pages/Auth/LoginPage"
import AuthLayout from "./components/TaskBars/AuthLayout"
import ExercisesPage from "./pages/User/ExercisesPage"
import ExamPage from "./pages/User/ExamPage"
import ResultsPage from "./pages/User/ResultsPage"
import ProfilePage from "./pages/Shared/ProfilePage"
import EditProfilePage from "./pages/Shared/EditProfilePage"
import ChangePasswoedPage from "./pages/Shared/ChangePasswoedPage"

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
    <Routes>
      {/* Public Routes (Accessible without login) */}
      <Route element={<UnauthenticatedRoute />}>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Protected Routes (Accessible only after login) */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/movie/:id" element={<MoviePlayerPage />} />

          {/* Account */}
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile/edit/:id" element={<EditProfilePage />} />
          <Route path="/profile/change-password/:id" element={<ChangePasswoedPage />} />
          
          <Route path="/client/exercises" element={<ExercisesPage />} />
          <Route path="/client/exam" element={<ExamPage />} />
          <Route path="/client/results" element={<ResultsPage />} />

          <Route path="/admin/movie" element={<ManagerMovie />} />
          <Route path="/admin/exercise" element={<ManagerExercisesPage />} />
          <Route path="/admin/exercise/:movieId/:type/edit" element={<QuizEditorPage />} />

          <Route path="/test" element={<CreateQuizTester />} />
        </Route>  
      </Route>

      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}

export default App
